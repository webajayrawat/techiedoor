/* =========================================================================
   Services — interactive showcase
   - Accordion list (click / tap / keyboard) selects a service
   - Desktop: hovering a row previews it on the sticky stage, the stage tilts
     with the cursor and the row arrows are magnetic
   ========================================================================= */
(function () {
	'use strict';

	const { escape, pad } = window.TD;

	const arrowIcon = '<svg viewBox="0 0 24 24" width="24" height="24" fill="none" aria-hidden="true"><path d="M7 17L17 7M9 7h8v8" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg>';

	function rowTemplate(service, i) {
		const id = escape(service.id || 'service-' + i);
		const tags = service.tags.map((tag) => `<li>${escape(tag)}</li>`).join('');
		return `
			<li class="service_row" style="--accent:${escape(service.accent)};--tint:${escape(service.tint)}">
				<h3 class="service_row__heading">
					<button type="button" class="service_row__trigger" id="service-trigger-${id}"
						aria-expanded="false" aria-controls="service-panel-${id}" data-index="${i}">
						<span class="service_row__index">${pad(i + 1)}</span>
						<span class="service_row__name">
							<span class="service_row__title">${escape(service.title)}</span>
							<span class="service_row__summary">${escape(service.summary)}</span>
						</span>
						<span class="service_row__arrow">${arrowIcon}</span>
					</button>
				</h3>
				<div class="service_row__panel" id="service-panel-${id}" role="region" aria-labelledby="service-trigger-${id}">
					<div class="service_row__panel-inner">
						<div class="service_row__body">
							<figure class="service_row__media">
								<img src="${escape(service.image)}" alt="${escape(service.imageAlt || '')}" loading="lazy" decoding="async" />
							</figure>
							<p class="service_row__desc">${escape(service.description)}</p>
							<ul class="service_row__tags">${tags}</ul>
							<a href="#contactUs" class="service_row__cta">Start a project <span aria-hidden="true">&rarr;</span></a>
						</div>
					</div>
				</div>
			</li>`;
	}

	function slideTemplate(service, i) {
		const chips = service.tags.slice(0, 3)
			.map((tag, n) => `<li class="stage_chip stage_chip--${n + 1}" data-depth="${1.4 + n * 0.3}">${escape(tag)}</li>`)
			.join('');
		return `
			<div class="stage_slide" data-index="${i}" style="--accent:${escape(service.accent)};--tint:${escape(service.tint)}">
				<span class="stage_slide__num">${pad(i + 1)}</span>
				<div class="stage_slide__visual" data-depth="1">
					<img src="${escape(service.image)}" alt="" loading="lazy" decoding="async" />
				</div>
				<ul class="stage_slide__chips">${chips}</ul>
				<div class="stage_slide__caption">
					<span class="stage_slide__title">${escape(service.title)}</span>
					<span class="stage_slide__tagline">${escape(service.tagline)}</span>
				</div>
			</div>`;
	}

	window.TD.initServices = function initServices(root, services) {
		if (!root || !services || !services.length) return;

		const list = root.querySelector('[data-services-list]');
		const stage = root.querySelector('[data-services-stage]');

		list.innerHTML = services.map(rowTemplate).join('');
		stage.innerHTML = `<div class="stage_parallax"><div class="stage_frame">${services.map(slideTemplate).join('')}</div></div>`;

		const rows = Array.from(list.querySelectorAll('.service_row'));
		const triggers = rows.map((row) => row.querySelector('.service_row__trigger'));
		const slides = Array.from(stage.querySelectorAll('.stage_slide'));
		const desktopQuery = window.matchMedia('(min-width: 992px)');

		let activeIndex = -1;

		function showSlide(index) {
			slides.forEach((slide, i) => slide.classList.toggle('is-active', i === index));
		}

		function setActive(index, { allowCollapse = false } = {}) {
			const collapse = allowCollapse && index === activeIndex;
			activeIndex = collapse ? -1 : index;

			rows.forEach((row, i) => {
				const open = i === activeIndex;
				row.classList.toggle('is-active', open);
				triggers[i].setAttribute('aria-expanded', String(open));
			});
			showSlide(activeIndex === -1 ? index : activeIndex);
		}

		triggers.forEach((trigger, i) => {
			trigger.addEventListener('click', () => {
				// On small screens the accordion may be fully collapsed; desktop always keeps one open.
				setActive(i, { allowCollapse: !desktopQuery.matches });
			});
		});

		// Arrow keys move between services, like a listbox.
		list.addEventListener('keydown', (e) => {
			const current = triggers.indexOf(document.activeElement);
			if (current === -1) return;
			let next = null;
			if (e.key === 'ArrowDown') next = (current + 1) % triggers.length;
			if (e.key === 'ArrowUp') next = (current - 1 + triggers.length) % triggers.length;
			if (e.key === 'Home') next = 0;
			if (e.key === 'End') next = triggers.length - 1;
			if (next === null) return;
			e.preventDefault();
			triggers[next].focus();
		});

		setActive(0);

		if (!window.gsap) return;

		// Expanding a row changes the page height; recalculate every ScrollTrigger
		// below this section (About pin, Projects, Process) once the transition settles.
		if (window.ScrollTrigger && 'ResizeObserver' in window) {
			let lastHeight = list.offsetHeight;
			const refresh = window.TD.debounce(() => ScrollTrigger.refresh(), 150);
			new ResizeObserver(() => {
				const height = list.offsetHeight;
				if (height === lastHeight) return;
				lastHeight = height;
				refresh();
			}).observe(list);
		}

		/* ---- Desktop-only pointer interactions -------------------------- */

		const mm = gsap.matchMedia();
		mm.add('(min-width: 992px) and (hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference)', () => {
			const cleanups = [];
			const on = (el, type, fn) => {
				el.addEventListener(type, fn);
				cleanups.push(() => el.removeEventListener(type, fn));
			};

			// Hover previews a service on the stage without changing list height.
			rows.forEach((row, i) => {
				on(row, 'pointerenter', () => showSlide(i));
			});
			on(list, 'pointerleave', () => showSlide(activeIndex));

			// Magnetic arrows.
			rows.forEach((row) => {
				const arrow = row.querySelector('.service_row__arrow');
				const xTo = gsap.quickTo(arrow, 'x', { duration: 0.5, ease: 'power3.out' });
				const yTo = gsap.quickTo(arrow, 'y', { duration: 0.5, ease: 'power3.out' });
				on(row, 'pointermove', (e) => {
					const r = arrow.getBoundingClientRect();
					xTo(gsap.utils.clamp(-18, 18, (e.clientX - (r.left + r.width / 2)) * 0.25));
					yTo(gsap.utils.clamp(-10, 10, (e.clientY - (r.top + r.height / 2)) * 0.25));
				});
				on(row, 'pointerleave', () => { xTo(0); yTo(0); });
			});

			// Stage tilt + depth parallax following the cursor.
			const frame = stage.querySelector('.stage_frame');
			const rotX = gsap.quickTo(frame, 'rotationX', { duration: 0.8, ease: 'power3.out' });
			const rotY = gsap.quickTo(frame, 'rotationY', { duration: 0.8, ease: 'power3.out' });
			const layers = Array.from(stage.querySelectorAll('[data-depth]')).map((el) => ({
				depth: parseFloat(el.dataset.depth),
				x: gsap.quickTo(el, 'x', { duration: 0.9, ease: 'power3.out' }),
				y: gsap.quickTo(el, 'y', { duration: 0.9, ease: 'power3.out' })
			}));

			on(root, 'pointermove', (e) => {
				const r = stage.getBoundingClientRect();
				const nx = gsap.utils.clamp(-1, 1, (e.clientX - (r.left + r.width / 2)) / r.width);
				const ny = gsap.utils.clamp(-1, 1, (e.clientY - (r.top + r.height / 2)) / r.height);
				rotY(nx * 6);
				rotX(-ny * 5);
				layers.forEach((layer) => { layer.x(nx * 12 * layer.depth); layer.y(ny * 12 * layer.depth); });
			});
			on(root, 'pointerleave', () => {
				rotX(0); rotY(0);
				layers.forEach((layer) => { layer.x(0); layer.y(0); });
			});

			return () => {
				cleanups.forEach((fn) => fn());
				gsap.set([frame, ...rows.map((r) => r.querySelector('.service_row__arrow')), ...stage.querySelectorAll('[data-depth]')], { clearProps: 'transform' });
				showSlide(activeIndex);
			};
		});

		// Scroll: rows cascade in and the stage drifts slightly (parallax).
		mm.add('(prefers-reduced-motion: no-preference)', () => {
			gsap.from(rows, {
				y: 40,
				opacity: 0,
				duration: 0.9,
				ease: 'power3.out',
				stagger: 0.08,
				scrollTrigger: { trigger: list, start: 'top 85%', once: true }
			});
		});
		mm.add('(min-width: 992px) and (prefers-reduced-motion: no-preference)', () => {
			gsap.fromTo(stage.querySelector('.stage_parallax'), { yPercent: 6 }, {
				yPercent: -6,
				ease: 'none',
				scrollTrigger: { trigger: root, start: 'top bottom', end: 'bottom top', scrub: true }
			});
		});
	};
})();

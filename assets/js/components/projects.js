/* =========================================================================
   Projects — large-format editorial showcase
   - First project marked layout:'feature' renders full width
   - Remaining projects alternate media left / right
   - Scroll: clip-path reveal + image parallax (scrubbed), info fades in once
   - Desktop: "View" bubble follows the cursor over projects that have a URL
   ========================================================================= */
(function () {
	'use strict';

	const { escape, pad } = window.TD;

	function ctaTemplate(project) {
		if (project.url) {
			return `<a href="${escape(project.url)}" class="project_card__cta">View case study <span aria-hidden="true">&rarr;</span></a>`;
		}
		// No case study page yet: offer a real action instead of a dead link.
		return `<a href="#contactUs" class="project_card__cta">Ask about this project <span aria-hidden="true">&rarr;</span></a>`;
	}

	function mediaTemplate(project) {
		const img = `<img class="project_card__img" src="${escape(project.image)}" alt="${escape(project.imageAlt || project.name)}" loading="lazy" decoding="async" />`;
		const inner = `
			<div class="project_card__reveal">
				<div class="project_card__parallax">${img}</div>
				${project.concept ? '<span class="project_card__badge">Concept</span>' : ''}
			</div>`;

		if (project.url) {
			return `<a href="${escape(project.url)}" class="project_card__media" data-cursor="View" tabindex="-1" aria-hidden="true">${inner}</a>`;
		}
		return `<div class="project_card__media">${inner}</div>`;
	}

	function cardTemplate(project, i, total) {
		const isFeature = project.layout === 'feature';
		const classes = ['project_card', isFeature ? 'project_card--feature' : 'project_card--editorial'];
		const services = project.services.map((s) => `<li>${escape(s)}</li>`).join('');

		return `
			<article class="${classes.join(' ')}" style="--accent:${escape(project.accent || '#354B60')}">
				${mediaTemplate(project)}
				<div class="project_card__info">
					<div class="project_card__meta">
						<span class="project_card__index">${pad(i + 1)} <span>/ ${pad(total)}</span></span>
						<span class="project_card__category">${escape(project.category)}</span>
					</div>
					<h3 class="project_card__name">${escape(project.name)}</h3>
					<p class="project_card__desc">${escape(project.description)}</p>
					<ul class="project_card__services" aria-label="Services">${services}</ul>
					${ctaTemplate(project)}
				</div>
			</article>`;
	}

	window.TD.initProjects = function initProjects(root, projects) {
		if (!root || !projects || !projects.length) return;

		const list = root.querySelector('[data-projects-list]');
		const count = root.querySelector('[data-projects-count]');

		// Alternate editorial panels independently of the feature panel.
		let editorialIndex = 0;
		list.innerHTML = projects.map((project, i) => {
			const html = cardTemplate(project, i, projects.length);
			if (project.layout === 'feature') return html;
			const reverse = editorialIndex++ % 2 === 1;
			return reverse ? html.replace('project_card--editorial', 'project_card--editorial project_card--reverse') : html;
		}).join('');

		if (count) count.textContent = pad(projects.length);

		if (!window.gsap) return;

		const cards = Array.from(list.querySelectorAll('.project_card'));
		const mm = gsap.matchMedia();

		mm.add('(prefers-reduced-motion: no-preference)', () => {
			cards.forEach((card) => {
				const reveal = card.querySelector('.project_card__reveal');
				const parallax = card.querySelector('.project_card__parallax');
				const info = card.querySelector('.project_card__info').children;

				gsap.fromTo(reveal,
					{ clipPath: 'inset(8% 6% 8% 6% round 3.2rem)' },
					{
						clipPath: 'inset(0% 0% 0% 0% round 3.2rem)',
						ease: 'none',
						scrollTrigger: { trigger: card, start: 'top 95%', end: 'top 35%', scrub: 0.6 }
					});

				gsap.fromTo(parallax,
					{ yPercent: -5, scale: 1.12 },
					{
						yPercent: 5,
						scale: 1,
						ease: 'none',
						scrollTrigger: { trigger: card, start: 'top bottom', end: 'bottom top', scrub: true }
					});

				gsap.from(info, {
					y: 32,
					opacity: 0,
					duration: 0.9,
					ease: 'power3.out',
					stagger: 0.07,
					scrollTrigger: { trigger: card, start: 'top 70%', once: true }
				});
			});
		});

		// Cursor-following label, only over media that actually links somewhere.
		mm.add('(hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference)', () => {
			const linked = Array.from(list.querySelectorAll('[data-cursor]'));
			if (!linked.length) return;

			const bubble = document.createElement('div');
			bubble.className = 'project_cursor';
			bubble.setAttribute('aria-hidden', 'true');
			document.body.appendChild(bubble);

			const xTo = gsap.quickTo(bubble, 'x', { duration: 0.45, ease: 'power3.out' });
			const yTo = gsap.quickTo(bubble, 'y', { duration: 0.45, ease: 'power3.out' });
			const cleanups = [];

			linked.forEach((media) => {
				const move = (e) => { xTo(e.clientX); yTo(e.clientY); };
				const enter = (e) => {
					bubble.textContent = media.dataset.cursor;
					gsap.set(bubble, { x: e.clientX, y: e.clientY });
					bubble.classList.add('is-visible');
				};
				const leave = () => bubble.classList.remove('is-visible');
				media.addEventListener('pointermove', move);
				media.addEventListener('pointerenter', enter);
				media.addEventListener('pointerleave', leave);
				cleanups.push(() => {
					media.removeEventListener('pointermove', move);
					media.removeEventListener('pointerenter', enter);
					media.removeEventListener('pointerleave', leave);
				});
			});

			return () => {
				cleanups.forEach((fn) => fn());
				bubble.remove();
			};
		});
	};
})();

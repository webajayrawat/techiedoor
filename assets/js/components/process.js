/* =========================================================================
   Our Process — "journey board"
   Built from the site's own visual language: the hero's pen draws a
   hand-sketched route (like the contact section scribble) across a tinted
   board, connecting six white stage cards.

   - Scroll: the pen draws the route (scrubbed) and each stage lights up as
     the pen reaches its pin.
   - Hover / focus previews a stage; click / tap jumps the pen to that stage.
   - The route is generated from the pins' real positions, so it adapts to
     the 3-column, 2-column and 1-column layouts.
   - prefers-reduced-motion: the route is shown fully drawn, no pen travel.
   ========================================================================= */
(function () {
	'use strict';

	const { escape, pad, debounce, prefersReducedMotion, hasFinePointer } = window.TD;

	const icons = {
		discovery: '<circle cx="12" cy="12" r="9"/><path d="M15.5 8.5l-2 5-5 2 2-5 5-2z"/>',
		research: '<circle cx="10.5" cy="10.5" r="6.5"/><path d="M15.5 15.5L20 20"/><path d="M7.5 12l2-2.5 1.8 1.5 2.2-3"/>',
		design: '<rect x="3" y="4" width="18" height="16" rx="2.5"/><path d="M3 9h18M9 9v11"/>',
		development: '<path d="M8 8l-4 4 4 4M16 8l4 4-4 4M13.5 5.5l-3 13"/>',
		testing: '<path d="M12 3l7 3v5.5c0 4.5-3 7.8-7 9.5-4-1.7-7-5-7-9.5V6l7-3z"/><path d="M9 12l2.2 2.2L15.5 10"/>',
		launch: '<path d="M14 4.5c2.5-1.2 5.5-1 5.5-1s.2 3-1 5.5c-1.2 2.6-4 5.6-7 7.2l-3.7-3.7c1.6-3 4.6-5.8 6.2-8z"/><circle cx="15" cy="9" r="1.3"/><path d="M8.5 12.2L5 12l2.5-3.2 3.5-.3M11.8 15.5L12 19l3.2-2.5.3-3.5M6.5 17.5L4 20"/>'
	};

	function cardTemplate(step, i) {
		const n = pad(i + 1);
		const outputs = step.outputs.map((o) => `<li>${escape(o)}</li>`).join('');
		return `
			<li class="journey_card" data-index="${i}">
				<span class="journey_card__pin" aria-hidden="true">${n}</span>
				<span class="journey_card__mark" aria-hidden="true">${n}</span>
				<span class="journey_card__icon" aria-hidden="true">
					<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">${icons[step.icon] || icons.discovery}</svg>
				</span>
				<h3 class="journey_card__title">
					<button type="button" class="journey_card__toggle" data-goto="${i}" aria-describedby="journeyDesc${i}">
						<span class="visually-hidden">Stage ${i + 1}: </span>${escape(step.title)}
					</button>
				</h3>
				<p class="journey_card__desc" id="journeyDesc${i}">${escape(step.description)}</p>
				<ul class="journey_card__outputs" aria-label="What you get">${outputs}</ul>
			</li>`;
	}

	/* Smooth curve through points (Catmull-Rom converted to cubic Béziers). */
	function curveThrough(points) {
		if (points.length < 2) return '';
		let d = `M${points[0].x.toFixed(1)},${points[0].y.toFixed(1)}`;
		for (let i = 0; i < points.length - 1; i++) {
			const p0 = points[i - 1] || points[i];
			const p1 = points[i];
			const p2 = points[i + 1];
			const p3 = points[i + 2] || p2;
			const c1 = { x: p1.x + (p2.x - p0.x) / 6, y: p1.y + (p2.y - p0.y) / 6 };
			const c2 = { x: p2.x - (p3.x - p1.x) / 6, y: p2.y - (p3.y - p1.y) / 6 };
			d += ` C${c1.x.toFixed(1)},${c1.y.toFixed(1)} ${c2.x.toFixed(1)},${c2.y.toFixed(1)} ${p2.x.toFixed(1)},${p2.y.toFixed(1)}`;
		}
		return d;
	}

	window.TD.initProcess = function initProcess(root, steps) {
		if (!root || !steps || !steps.length) return;

		const board = root.querySelector('[data-process-board]');
		const list = root.querySelector('[data-process-list]');
		const svg = root.querySelector('[data-process-route]');
		const pen = root.querySelector('[data-process-pen]');
		const count = root.querySelector('[data-process-count]');

		list.innerHTML = steps.map(cardTemplate).join('');
		if (count) count.textContent = pad(steps.length);

		const cards = Array.from(list.querySelectorAll('.journey_card'));
		const plan = svg.querySelector('.journey_route__plan');
		const ink = svg.querySelector('.journey_route__ink');
		const gradient = svg.querySelector('linearGradient');

		const route = { total: 0, nodes: [] };
		const state = { progress: prefersReducedMotion() ? 1 : 0 };
		let reachedIndex = -1;
		let hoverIndex = null;
		let pinnedIndex = null;
		let progressTrigger = null;

		/* ---- Active / reached states -------------------------------------- */
		function paint() {
			// With reduced motion the whole route is drawn, so nothing is highlighted by default.
			const auto = prefersReducedMotion() ? -1 : Math.max(reachedIndex, 0);
			const active = hoverIndex ?? pinnedIndex ?? auto;
			cards.forEach((card, i) => {
				card.classList.toggle('is-reached', i <= reachedIndex);
				card.classList.toggle('is-active', i === active);
				const toggle = card.querySelector('.journey_card__toggle');
				if (i === active) toggle.setAttribute('aria-current', 'step');
				else toggle.removeAttribute('aria-current');
			});
		}

		/* ---- Route geometry ------------------------------------------------ */
		function pinCenter(card) {
			const pin = card.querySelector('.journey_card__pin');
			// offset* ignores transforms, so reveal animations don't skew the route
			return {
				x: card.offsetLeft + pin.offsetLeft + pin.offsetWidth / 2,
				y: card.offsetTop + pin.offsetTop + pin.offsetHeight / 2
			};
		}

		function buildRoute() {
			const w = board.clientWidth;
			const h = board.clientHeight;
			svg.setAttribute('viewBox', `0 0 ${w} ${h}`);
			svg.setAttribute('width', w);
			svg.setAttribute('height', h);
			gradient.setAttribute('x2', w);

			const pins = cards.map(pinCenter);
			const centers = cards.map((c) => ({ x: c.offsetLeft + c.offsetWidth / 2, y: c.offsetTop + c.offsetHeight / 2 }));

			// Between pins, bow the line away from the two cards it connects so it
			// reads as a hand-drawn route through the gaps.
			const points = [];
			pins.forEach((p, i) => {
				points.push(p);
				const next = pins[i + 1];
				if (!next) return;
				const mid = { x: (p.x + next.x) / 2, y: (p.y + next.y) / 2 };
				const len = Math.hypot(next.x - p.x, next.y - p.y) || 1;
				let nx = -(next.y - p.y) / len;
				let ny = (next.x - p.x) / len;
				const away = { x: (centers[i].x + centers[i + 1].x) / 2, y: (centers[i].y + centers[i + 1].y) / 2 };
				if ((mid.x + nx - away.x) ** 2 + (mid.y + ny - away.y) ** 2 < (mid.x - nx - away.x) ** 2 + (mid.y - ny - away.y) ** 2) {
					nx = -nx;
					ny = -ny;
				}
				const bow = Math.min(34, len * 0.12) * (i % 2 ? 0.7 : 1);
				// Keep the bow inside the board (matters for the narrow mobile gutter).
				points.push({ x: Math.min(Math.max(mid.x + nx * bow, 8), w - 8), y: mid.y + ny * bow });
			});

			const d = curveThrough(points);
			plan.setAttribute('d', d);
			ink.setAttribute('d', d);

			route.total = ink.getTotalLength();
			ink.style.strokeDasharray = `${route.total} ${route.total}`;

			// Length along the route at which the pen reaches each pin.
			const sampleStep = 4;
			let from = 0;
			route.nodes = pins.map((p) => {
				let best = from;
				let bestDist = Infinity;
				for (let l = from; l <= route.total; l += sampleStep) {
					const q = ink.getPointAtLength(l);
					const dist = (q.x - p.x) ** 2 + (q.y - p.y) ** 2;
					if (dist < bestDist) {
						bestDist = dist;
						best = l;
					} else if (dist > bestDist + 40000) {
						break; // moving away from this pin; the next pins are further along
					}
				}
				from = best;
				return best;
			});

			render();
		}

		/* ---- Drawing -------------------------------------------------------- */
		function render() {
			if (!route.total) return;
			const drawn = route.total * state.progress;
			ink.style.strokeDashoffset = String(route.total - drawn);

			const tip = ink.getPointAtLength(drawn);
			pen.style.transform = `translate3d(${tip.x.toFixed(1)}px, ${tip.y.toFixed(1)}px, 0)`;
			pen.classList.toggle('is-idle', state.progress <= 0.001);

			let reached = -1;
			route.nodes.forEach((len, i) => { if (drawn >= len - 2) reached = i; });
			if (reached !== reachedIndex) {
				reachedIndex = reached;
				pinnedIndex = null; // scrolling hands control back to the pen
				paint();
			}
		}

		/* ---- Interaction ------------------------------------------------------ */
		cards.forEach((card, i) => {
			card.addEventListener('pointerenter', (e) => {
				if (e.pointerType !== 'mouse' || !hasFinePointer()) return;
				hoverIndex = i;
				paint();
			});
			card.addEventListener('pointerleave', () => {
				if (hoverIndex === null) return;
				hoverIndex = null;
				paint();
			});
			card.addEventListener('focusin', () => { hoverIndex = i; paint(); });
			card.addEventListener('focusout', () => { hoverIndex = null; paint(); });
		});

		list.addEventListener('click', (e) => {
			const toggle = e.target.closest('[data-goto]');
			if (!toggle) return;
			const i = Number(toggle.dataset.goto);
			pinnedIndex = i;
			paint();

			// Scroll so the pen arrives at this stage's pin.
			if (progressTrigger && route.total && !prefersReducedMotion()) {
				const st = progressTrigger;
				const target = st.start + (route.nodes[i] / route.total) * (st.end - st.start) + 2;
				window.scrollTo({ top: target, behavior: 'smooth' });
			}
		});

		/* ---- Setup ---------------------------------------------------------- */
		paint();
		buildRoute();

		if ('ResizeObserver' in window) {
			new ResizeObserver(debounce(buildRoute, 120)).observe(board);
		}
		if (document.fonts && document.fonts.ready) document.fonts.ready.then(buildRoute);

		if (!window.gsap || !window.ScrollTrigger) {
			state.progress = 1;
			render();
			return;
		}

		const mm = gsap.matchMedia();

		mm.add('(prefers-reduced-motion: no-preference)', () => {
			state.progress = 0;
			const tween = gsap.to(state, {
				progress: 1,
				ease: 'none',
				onUpdate: render,
				scrollTrigger: {
					trigger: board,
					start: 'top 65%',
					end: 'bottom 70%',
					scrub: 0.8
				}
			});
			progressTrigger = tween.scrollTrigger;

			// Cards rise in like the services rows.
			gsap.from(cards, {
				y: 48,
				opacity: 0,
				duration: 0.9,
				ease: 'power3.out',
				stagger: 0.08,
				scrollTrigger: { trigger: board, start: 'top 80%', once: true }
			});

			// Decorative 3D shapes drift like the hero shapes.
			gsap.utils.toArray(root.querySelectorAll('.journey_shape')).forEach((shape, i) => {
				gsap.fromTo(shape, { y: 60, rotate: i ? -20 : 0 }, {
					y: -80,
					rotate: i ? 25 : 60,
					ease: 'none',
					scrollTrigger: { trigger: board, start: 'top bottom', end: 'bottom top', scrub: 1.5 }
				});
			});

			return () => {
				progressTrigger = null;
				state.progress = 1;
				render();
			};
		});

		mm.add('(prefers-reduced-motion: reduce)', () => {
			state.progress = 1;
			render();
		});
	};
})();

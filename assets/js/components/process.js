/* =========================================================================
   Our Process — "build canvas"

   The six stages are told on one browser canvas where a website takes
   shape: brief → sitemap & plan → wireframe → code → test report → live.
   Big editorial type carries the stage, and a rail (drawn by the hero's
   pen) names all six at a glance: Discover · Research · Design · Build ·
   Test · Launch.

   Desktop (≥992px wide, ≥620px tall, motion allowed):
     The stage pins; scrolling moves 01 → 06, snapping to each stage. Rail
     buttons jump to a stage.
   Tablet / mobile / reduced motion / no GSAP:
     A vertical thread of stages, each with its own canvas scene. The thread
     fills as you scroll and each scene plays once when it comes into view.
     Reduced motion shows every scene in its finished state.

   Markup hooks: index.html (#process). Styles: scss/components/_process.scss
   ========================================================================= */
(function () {
	'use strict';

	const { escape, pad, clamp, prefersReducedMotion } = window.TD;

	// The hero's pen (index.html .pen_icon)
	const PEN_PATH = 'M36.204 1.044C32.02 2.814 5.66 31.155 4.514 35.116c-.632 2.182-1.75 5.516-2.483 7.409-3.024 7.805-1.54 9.29 6.265 6.265 1.893-.733 5.227-1.848 7.41-2.477 3.834-1.105 4.473-1.647 19.175-16.27 0 0 10.63-10.546 15.21-15.125C53 8.997 42.021-1.418 36.203 1.044Zm7.263 5.369c3.56 3.28 4.114 4.749 2.643 6.995l-1.115 1.7-4.586-4.543-4.585-4.544 1.42-1.157C39.311 3.18 40.2 3.4 43.467 6.413ZM37.863 13.3l4.266 4.304-11.547 11.561-11.547 11.561-4.48-4.446-4.481-4.447 11.404-11.418c6.273-6.28 11.566-11.42 11.762-11.42.197 0 2.277 1.938 4.623 4.305ZM12.016 39.03l3.54 3.584-3.562 1.098-5.316 1.641c-1.665.516-1.727.455-1.211-1.21l1.614-5.226c1.289-4.177.685-4.191 4.935.113Z';

	/* ---- Canvas scenes ----------------------------------------------------
	   Decorative (the canvas is aria-hidden); the stage text carries the
	   content. `url` and `status` fill the browser bar for each stage. */

	// One page layout that matures from wireframe → build → final
	function page(variant) {
		const card = '<span class="pv_card"><i></i><b></b><b></b></span>';
		// The wireframe is a clickable prototype: a cursor taps its button
		const tap = variant === 'wire'
			? '<span class="pv_click"></span><svg class="pv_cursor" viewBox="0 0 24 24"><path d="M5 3l14 7.5-6.2 1.6L9.6 18z"/></svg>'
			: '';
		return `
			<div class="pv_page pv_page--${variant}">
				<div class="pv_nav"><span class="pv_logo"></span><span class="pv_menu"><i></i><i></i><i></i></span><span class="pv_cta"></span></div>
				<div class="pv_hero">
					<div class="pv_hero__copy"><i class="pv_line"></i><i class="pv_line pv_line--short"></i><i class="pv_line pv_line--thin"></i><span class="pv_btn">${tap}</span></div>
					<div class="pv_hero__media"></div>
				</div>
				<div class="pv_cards">${card}${card}${card}</div>
			</div>`;
	}

	function score(value, label) {
		return `
			<span class="pv_score" style="--score:${value}">
				<svg viewBox="0 0 36 36"><circle cx="18" cy="18" r="15.915"/><circle class="pv_score__bar" cx="18" cy="18" r="15.915" stroke-dasharray="${value} 100"/></svg>
				<b></b><small>${label}</small>
			</span>`;
	}

	const code = [
		'<span class="t">&lt;section</span> <span class="a">class</span>=<span class="s">"hero"</span><span class="t">&gt;</span>',
		'  <span class="t">&lt;h1&gt;</span>We build digital<span class="t">&lt;/h1&gt;</span>',
		'  <span class="t">&lt;Button</span> <span class="a">glow</span> <span class="t">/&gt;</span>',
		'<span class="t">&lt;/section&gt;</span>',
		'<span class="t">&lt;Cards</span> <span class="a">items</span>=<span class="s">{services}</span> <span class="t">/&gt;</span>',
		'<span class="c">// responsive · fast · accessible</span>',
		'<span class="p">$</span> npm run build <span class="ok">✓</span>'
	];

	const scenes = {
		discovery: {
			url: 'project-brief.doc',
			status: 'Draft',
			tone: 'lilac',
			html: () => `
				<div class="pv pv--brief">
					<p class="pv_script">Your goals<svg class="pv_scribble" viewBox="0 0 120 10" preserveAspectRatio="none"><path pathLength="1" d="M2 7C34 2.5 76 1.5 118 5"/></svg></p>
					<div class="pv_notes">
						<span class="pv_note pv_note--mint">Grow online sales</span>
						<span class="pv_note pv_note--lilac">Reach a new audience</span>
						<span class="pv_note pv_note--sky">Look premium</span>
					</div>
					<div class="pv_chat"><span class="pv_avatar"></span><span class="pv_bubble">“We want a site that feels like us.”</span></div>
				</div>`
		},
		research: {
			url: 'sitemap-and-plan',
			status: 'Planning',
			tone: 'teal',
			html: () => `
				<div class="pv pv--plan">
					<div class="pv_tree">
						<span class="pv_node pv_node--root">Home</span>
						<svg class="pv_links" viewBox="0 0 100 24" preserveAspectRatio="none"><path d="M50 0V12M12.5 12H87.5M12.5 12V24M37.5 12V24M62.5 12V24M87.5 12V24"/></svg>
						<div class="pv_children"><span class="pv_node">About</span><span class="pv_node">Services</span><span class="pv_node">Work</span><span class="pv_node">Contact</span></div>
					</div>
					<div class="pv_gantt">
						<div class="pv_gantt__rows">
							<span class="pv_bar pv_bar--teal" style="--from:0;--to:2">Research</span>
							<span class="pv_bar pv_bar--lilac" style="--from:1.5;--to:4">Design</span>
							<span class="pv_bar pv_bar--mint" style="--from:3.5;--to:7">Build</span>
							<span class="pv_bar pv_bar--ink" style="--from:6.5;--to:8">Launch</span>
						</div>
						<div class="pv_gantt__weeks">${[1, 2, 3, 4, 5, 6, 7, 8].map((w) => `<span>W${w}</span>`).join('')}</div>
					</div>
				</div>`
		},
		design: {
			url: 'figma.com/proto',
			status: 'Prototype',
			tone: 'lilac',
			html: () => `
				<div class="pv pv--design">
					${page('wire')}
				</div>`
		},
		development: {
			url: 'localhost:3000',
			status: 'In build',
			tone: 'amber',
			html: () => `
				<div class="pv pv--code">
					<div class="pv_editor">${code.map((line, i) => `<span class="pv_code" style="--l:${i}">${line}</span>`).join('')}</div>
					${page('build')}
				</div>`
		},
		testing: {
			url: 'staging.yoursite.com',
			status: 'Testing',
			tone: 'teal',
			html: () => `
				<div class="pv pv--test">
					${page('final')}
					<div class="pv_report">
						<div class="pv_scores">${score(98, 'Performance')}${score(100, 'Accessibility')}${score(100, 'SEO')}</div>
						<div class="pv_devices"><span>Desktop</span><span>Tablet</span><span>Mobile</span></div>
					</div>
				</div>`
		},
		launch: {
			url: 'yoursite.com',
			secure: true,
			status: 'Live',
			tone: 'mint',
			html: () => `
				<div class="pv pv--launch">
					${page('final')}
					<span class="pv_toast"><i></i>Your site is live</span>
					<span class="pv_support"><span class="pv_avatar"></span>Need a tweak? We’re here.</span>
				</div>`
		}
	};

	const LOCK = '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="5" y="10.5" width="14" height="10" rx="2.5"/><path d="M8.5 10.5V8a3.5 3.5 0 0 1 7 0v2.5"/></svg>';

	/* `only` renders a single scene (stacked layout); omit it for the shared
	   desktop canvas, which holds every scene. The visible scene, address and
	   status carry .is-on (re-adding it replays the scene's animation). */
	function canvasTemplate(steps, only) {
		const indexes = only == null ? steps.map((_, i) => i) : [only];
		const on = only == null ? '' : ' is-on';
		const sceneOf = (i) => scenes[steps[i].visual] || scenes.discovery;
		const urls = indexes.map((i) => {
			const s = sceneOf(i);
			return `<span class="process_canvas__url${on}" data-for="${i}">${s.secure ? LOCK : ''}${escape(s.url)}</span>`;
		}).join('');
		const states = indexes.map((i) => {
			const s = sceneOf(i);
			return `<span class="process_canvas__status process_canvas__status--${s.tone}${on}" data-for="${i}">${escape(s.status)}</span>`;
		}).join('');
		const layers = indexes.map((i) => `<div class="process_canvas__layer${on}" data-layer="${i}">${sceneOf(i).html()}</div>`).join('');

		return `
			<div class="process_canvas">
				<div class="process_canvas__window">
					<div class="process_canvas__bar">
						<span class="process_canvas__dots"><i></i><i></i><i></i></span>
						<span class="process_canvas__address">${urls}</span>
						<span class="process_canvas__state">${states}</span>
					</div>
					<div class="process_canvas__view">${layers}</div>
				</div>
			</div>`;
	}

	function stepTemplate(step, i, steps) {
		const outputs = (step.outputs || []).map((o) => `<li>${escape(o)}</li>`).join('');
		return `
			<li class="process_step" data-index="${i}">
				<div class="process_step__head">
					<span class="process_step__num" aria-hidden="true">${pad(i + 1)}</span>
					<span class="process_step__verb">${escape(step.verb || '')}</span>
				</div>
				<h3 class="process_step__title"><span class="visually-hidden">Stage ${i + 1} of ${steps.length}: </span>${escape(step.title)}</h3>
				<p class="process_step__desc">${escape(step.description)}</p>
				<ul class="process_step__outputs" aria-label="What you get">${outputs}</ul>
				<div class="process_step__visual" aria-hidden="true">${canvasTemplate(steps, i)}</div>
			</li>`;
	}

	function railTemplate(steps) {
		const stops = steps.map((step, i) => `
			<li>
				<button type="button" class="process_rail__stop" data-goto="${i}">
					<span class="process_rail__dot" aria-hidden="true"></span>
					<span class="process_rail__num">${pad(i + 1)}</span>
					<span class="process_rail__verb">${escape(step.verb || step.title)}</span><span class="visually-hidden">: ${escape(step.title)}</span>
				</button>
			</li>`).join('');
		return `
			<div class="process_rail__body" style="--steps:${steps.length}">
				<div class="process_rail__track" aria-hidden="true">
					<span class="process_rail__fill"></span>
					<span class="process_rail__tip"><svg class="process_rail__pen" viewBox="0 0 51 51"><path d="${PEN_PATH}"/></svg></span>
				</div>
				<ol class="process_rail__list">${stops}</ol>
			</div>`;
	}

	window.TD.initProcess = function initProcess(root, steps) {
		if (!root || !steps || !steps.length) return;

		const n = steps.length;
		const stageEl = root.querySelector('[data-process-stage]');
		const list = root.querySelector('[data-process-list]');
		const slot = root.querySelector('[data-process-canvas]');
		const rail = root.querySelector('[data-process-rail]');
		const reel = root.querySelector('[data-process-reel]');
		const thread = root.querySelector('[data-process-thread]');
		const count = root.querySelector('[data-process-count]');
		const total = root.querySelector('[data-process-total]');

		list.innerHTML = steps.map((step, i) => stepTemplate(step, i, steps)).join('');
		slot.innerHTML = canvasTemplate(steps);
		rail.innerHTML = railTemplate(steps);
		// The counter is an outlined "0" plus a rolling digit (fine up to 9 stages)
		reel.innerHTML = steps.map((_, i) => `<span>${(i + 1) % 10}</span>`).join('');
		if (count) count.textContent = pad(n);
		if (total) total.textContent = '/' + pad(n);

		const items = Array.from(list.querySelectorAll('.process_step'));
		const stops = Array.from(rail.querySelectorAll('.process_rail__stop'));
		const sharedCanvas = slot.querySelector('.process_canvas');
		const stepCanvases = items.map((item) => item.querySelector('.process_canvas'));
		const sharedParts = Array.from(sharedCanvas.querySelectorAll('[data-layer], [data-for]'));

		/* ---- State ------------------------------------------------------- */
		let current = -1;

		function setStage(index) {
			if (index === current) return;
			current = index;
			items.forEach((item, i) => {
				item.classList.toggle('is-active', i === index);
				item.classList.toggle('is-past', i < index);
			});
			stops.forEach((stop, i) => {
				stop.classList.toggle('is-active', i === index);
				if (i === index) stop.setAttribute('aria-current', 'step');
				else stop.removeAttribute('aria-current');
			});
			sharedParts.forEach((part) => {
				part.classList.toggle('is-on', Number(part.dataset.layer ?? part.dataset.for) === index);
			});
			root.style.setProperty('--stage', index);
		}

		// A stop turns mint once the pen has actually passed it
		function setRailFill(value) {
			const fill = clamp(value, 0, 1);
			rail.style.setProperty('--fill', fill.toFixed(4));
			stops.forEach((stop, i) => stop.classList.toggle('is-reached', fill * (n - 1) >= i - 0.001));
		}
		const markAllReached = () => items.forEach((item) => item.classList.add('is-reached'));

		if (!window.gsap || !window.ScrollTrigger) {
			markAllReached();
			return;
		}

		// Scroll position of each stage's centre within the pin (snap targets)
		const centres = steps.map((_, i) => (i + 0.5) / n);
		let pinTrigger = null;

		rail.addEventListener('click', (e) => {
			const stop = e.target.closest('[data-goto]');
			if (!stop || !pinTrigger) return;
			const st = pinTrigger;
			window.scrollTo({ top: st.start + centres[Number(stop.dataset.goto)] * (st.end - st.start), behavior: 'smooth' });
		});

		const mm = gsap.matchMedia();

		/* ---- Desktop: pinned stage --------------------------------------- */
		mm.add('(min-width: 992px) and (min-height: 620px) and (prefers-reduced-motion: no-preference)', () => {
			root.classList.add('is-pinned');
			sharedCanvas.classList.add('is-armed', 'is-live');
			current = -1;
			setStage(0);
			setRailFill(0);

			pinTrigger = ScrollTrigger.create({
				trigger: stageEl,
				start: 'top top',
				end: () => '+=' + Math.round(window.innerHeight * 0.65 * n),
				pin: true,
				anticipatePin: 1,
				invalidateOnRefresh: true,
				snap: {
					snapTo: [0].concat(centres, 1),
					duration: { min: 0.2, max: 0.6 },
					delay: 0.12,
					ease: 'power2.inOut'
				},
				onUpdate: (self) => {
					const p = self.progress;
					setStage(Math.min(n - 1, Math.floor(p * n)));
					// The rail reaches each stop exactly at that stage's snap point
					setRailFill((p * n - 0.5) / (n - 1));
				}
			});

			return () => {
				pinTrigger = null;
				root.classList.remove('is-pinned');
				sharedCanvas.classList.remove('is-armed', 'is-live');
				rail.style.removeProperty('--fill');
				stops.forEach((stop) => stop.classList.remove('is-reached'));
			};
		});

		/* ---- Everything else: vertical thread ------------------------------ */
		mm.add('(max-width: 991px), (max-height: 619px), (prefers-reduced-motion: reduce)', () => {
			if (prefersReducedMotion()) {
				markAllReached();
				thread.style.setProperty('--fill', 1);
				return () => thread.style.removeProperty('--fill');
			}

			const triggers = [];
			stepCanvases.forEach((canvas) => canvas.classList.add('is-armed'));

			triggers.push(ScrollTrigger.create({
				trigger: list,
				start: 'top 70%',
				end: 'bottom 70%',
				onUpdate: (self) => thread.style.setProperty('--fill', self.progress.toFixed(4))
			}));

			items.forEach((item, i) => {
				triggers.push(ScrollTrigger.create({
					trigger: item,
					start: 'top 70%',
					onEnter: () => item.classList.add('is-reached'),
					onLeaveBack: () => item.classList.remove('is-reached')
				}));
				triggers.push(ScrollTrigger.create({
					trigger: stepCanvases[i],
					start: 'top 90%',
					once: true,
					onEnter: () => stepCanvases[i].classList.add('is-live')
				}));
			});

			return () => {
				triggers.forEach((t) => t.kill());
				items.forEach((item) => item.classList.remove('is-reached'));
				stepCanvases.forEach((canvas) => canvas.classList.remove('is-armed', 'is-live'));
				thread.style.removeProperty('--fill');
			};
		});
	};
})();

/* =========================================================================
   Footer toolkit — physics playground (Matter.js)

   - Icons are rigid rounded boxes with gravity, friction, restitution,
     air damping and sleeping, so piles settle naturally.
   - Grabbing an icon turns it into a KINEMATIC body (static = infinite mass):
     it follows the pointer exactly, shoves other icons it touches, and is
     never pushed back. Its per-step velocity is recorded, so the icons it
     hits receive realistic momentum. On release it becomes dynamic again
     and keeps the throw velocity.
   - Everything stays inside the footer area (walls + a safety clamp).
   - Only the icons capture touch (CSS touch-action), so page scrolling works.
   - Keyboard: Tab to an icon, arrows nudge it, Enter/Space makes it hop.
     "Shuffle" tosses everything, "Tidy up" drops the icons in again.
   - prefers-reduced-motion: no drop/toss animation, the simulation is
     settled instantly; dragging still works, without throw momentum.
   - Matter.js is loaded lazily when the footer approaches the viewport.
     If it fails to load, the icons stay in their static CSS layout.
   ========================================================================= */
(function () {
	'use strict';

	const { escape, clamp, debounce, prefersReducedMotion } = window.TD;

	const MATTER_SRC = 'https://cdn.jsdelivr.net/npm/matter-js@0.20.0/build/matter.min.js';
	const STEP_MS = 1000 / 120; // fixed physics step; 120 Hz keeps kinematic pushes stable
	const BASE_MS = 1000 / 60; // Matter's velocity unit (px per 60 Hz step)
	const MAX_STEPS_PER_FRAME = 12;

	/* Simplified brand marks. Replace with official assets from each brand's
	   press kit if your usage requires the exact artwork. */
	const marks = {
		figma: '<svg viewBox="0 0 38 57" aria-hidden="true"><path fill="#1ABCFE" d="M19 28.5a9.5 9.5 0 1 1 19 0 9.5 9.5 0 0 1-19 0z"/><path fill="#0ACF83" d="M0 47.5A9.5 9.5 0 0 1 9.5 38H19v9.5a9.5 9.5 0 1 1-19 0z"/><path fill="#FF7262" d="M19 0v19h9.5a9.5 9.5 0 1 0 0-19H19z"/><path fill="#F24E1E" d="M0 9.5A9.5 9.5 0 0 0 9.5 19H19V0H9.5A9.5 9.5 0 0 0 0 9.5z"/><path fill="#A259FF" d="M0 28.5A9.5 9.5 0 0 0 9.5 38H19V19H9.5A9.5 9.5 0 0 0 0 28.5z"/></svg>',
		vscode: '<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="#007ACC" d="M23.15 2.587L18.21.21a1.494 1.494 0 0 0-1.705.29l-9.46 8.63-4.12-3.128a.999.999 0 0 0-1.276.057L.327 7.261A1 1 0 0 0 .326 8.74L3.899 12 .326 15.26a1 1 0 0 0 .001 1.479L1.65 17.94a.999.999 0 0 0 1.276.057l4.12-3.128 9.46 8.63a1.492 1.492 0 0 0 1.704.29l4.942-2.377A1.5 1.5 0 0 0 24 20.06V3.939a1.5 1.5 0 0 0-.85-1.352zm-5.146 14.861L10.826 12l7.178-5.448v10.896z"/></svg>',
		javascript: '<svg viewBox="0 0 48 48" aria-hidden="true"><rect width="48" height="48" rx="6" fill="#F7DF1E"/><text x="43" y="42" text-anchor="end" font-family="Arial, Helvetica, sans-serif" font-weight="700" font-size="21" fill="#1B1B1B">JS</text></svg>',
		react: '<svg viewBox="-11.5 -10.23 23 20.46" aria-hidden="true"><circle r="2.05" fill="#61DAFB"/><g fill="none" stroke="#61DAFB" stroke-width="1"><ellipse rx="11" ry="4.2"/><ellipse rx="11" ry="4.2" transform="rotate(60)"/><ellipse rx="11" ry="4.2" transform="rotate(120)"/></g></svg>',
		photoshop: '<svg viewBox="0 0 48 48" aria-hidden="true"><rect width="48" height="48" rx="10" fill="#001E36"/><text x="24" y="32" text-anchor="middle" font-family="Arial, Helvetica, sans-serif" font-weight="700" font-size="21" fill="#31A8FF">Ps</text></svg>',
		illustrator: '<svg viewBox="0 0 48 48" aria-hidden="true"><rect width="48" height="48" rx="10" fill="#330000"/><text x="24" y="32" text-anchor="middle" font-family="Arial, Helvetica, sans-serif" font-weight="700" font-size="21" fill="#FF9A00">Ai</text></svg>',
		linkedin: '<svg viewBox="0 0 24 24" aria-hidden="true"><rect width="24" height="24" rx="4.5" fill="#0A66C2"/><path transform="translate(3.25 3.6) scale(0.7)" fill="#fff" d="M6.94 5a2 2 0 1 1-4-.002 2 2 0 0 1 4 .002zM7 8.48H3V21h4V8.48zm6.32 0H9.34V21h3.94v-6.57c0-3.66 4.77-4 4.77 0V21H22v-7.93c0-6.17-7.06-5.94-8.72-2.91l.04-1.68z"/></svg>',
		instagram: '<svg viewBox="0 0 24 24" aria-hidden="true"><defs><linearGradient id="tdIgGradient" x1="0" y1="1" x2="1" y2="0"><stop offset="0" stop-color="#FFD600"/><stop offset=".35" stop-color="#FF7A00"/><stop offset=".6" stop-color="#FF0069"/><stop offset="1" stop-color="#7638FA"/></linearGradient></defs><rect width="24" height="24" rx="6" fill="url(#tdIgGradient)"/><rect x="5" y="5" width="14" height="14" rx="4.2" fill="none" stroke="#fff" stroke-width="1.8"/><circle cx="12" cy="12" r="3.3" fill="none" stroke="#fff" stroke-width="1.8"/><circle cx="16.3" cy="7.7" r="1.05" fill="#fff"/></svg>',
		nodejs: '<svg viewBox="0 0 48 48" aria-hidden="true"><path d="M24 4.5l17 9.8v19.4L24 43.5 7 33.7V14.3z" fill="#5FA04E" stroke="#5FA04E" stroke-width="4" stroke-linejoin="round"/><text x="24" y="29.5" text-anchor="middle" font-family="Arial, Helvetica, sans-serif" font-weight="700" font-size="14" fill="#fff">JS</text></svg>'
	};

	const random = (min, max) => min + Math.random() * (max - min);

	let matterPromise = null;
	function loadMatter() {
		if (window.Matter) return Promise.resolve(window.Matter);
		if (!matterPromise) {
			matterPromise = new Promise((resolve, reject) => {
				const script = document.createElement('script');
				script.src = MATTER_SRC;
				script.async = true;
				script.onload = () => (window.Matter ? resolve(window.Matter) : reject(new Error('Matter.js unavailable')));
				script.onerror = () => reject(new Error('Matter.js failed to load'));
				document.head.appendChild(script);
			});
		}
		return matterPromise;
	}

	window.TD.initFooterTools = function initFooterTools(root, tools) {
		if (!root || !tools || !tools.length) return;

		const area = root.querySelector('[data-tools-area]');
		const list = root.querySelector('[data-tools-list]');

		list.innerHTML = tools.map((tool) => `
			<li class="tool_item">
				<button type="button" class="tool_chip" aria-describedby="toolsHelp">
					${marks[tool.icon] || ''}
					<span class="tool_chip__name">${escape(tool.name)}</span>
				</button>
			</li>`).join('');

		const chips = Array.from(list.querySelectorAll('.tool_chip'));

		// Hide the icons until the physics world exists, then drop them in.
		area.classList.add('is-enhanced', 'is-pending');

		let areaVisible = false;
		let started = false;
		let world = null;

		const fallBackToStatic = () => {
			area.classList.remove('is-enhanced', 'is-pending');
			root.classList.add('is-static');
		};

		const start = () => {
			if (started || !areaVisible) return;
			started = true;
			loadMatter()
				.then((Matter) => {
					world = createWorld(Matter);
					world.setVisible(areaVisible);
				})
				.catch(fallBackToStatic);
		};

		if (!('IntersectionObserver' in window)) {
			areaVisible = true;
			start();
			return;
		}

		// Preload the library a little before the footer is reached.
		const preload = new IntersectionObserver((entries) => {
			if (entries.some((e) => e.isIntersecting)) {
				preload.disconnect();
				loadMatter().catch(() => {});
			}
		}, { rootMargin: '900px 0px' });
		preload.observe(area);

		// Start the drop once the area is properly in view; pause the loop when it leaves.
		new IntersectionObserver((entries) => {
			areaVisible = entries[entries.length - 1].isIntersecting;
			if (world) world.setVisible(areaVisible);
			else start();
		}, { threshold: 0.35 }).observe(area);

		/* ------------------------------------------------------------------ */

		function createWorld(Matter) {
			const { Engine, Bodies, Body, Composite, Sleeping } = Matter;

			const engine = Engine.create({ enableSleeping: true, positionIterations: 10, velocityIterations: 8 });
			engine.gravity.y = 1;
			engine.gravity.scale = 0.0016;

			let w = area.clientWidth;
			let h = area.clientHeight;
			let size = chips[0].offsetWidth;

			const bodyOptions = () => ({
				chamfer: { radius: size * 0.25 },
				friction: 0.45,
				frictionStatic: 0.7,
				frictionAir: 0.015,
				restitution: 0.25,
				density: 0.0015,
				slop: 0.04,
				sleepThreshold: 40
			});

			const bodies = chips.map(() => Bodies.rectangle(0, 0, size, size, bodyOptions()));
			Composite.add(engine.world, bodies);

			let walls = [];
			let ceiling = null;
			let drag = null;
			let running = false;
			let visible = false;
			let lastTime = 0;
			let accumulator = 0;
			let zIndex = 1;
			const rendered = chips.map(() => '');

			/* ---- World boundaries -------------------------------------- */
			function buildWalls() {
				const T = 400; // thick walls prevent tunnelling
				const tall = h + size * 30; // side walls reach high above the area for the drop
				if (walls.length) Composite.remove(engine.world, walls);
				walls = [
					Bodies.rectangle(w / 2, h + T / 2, w + T * 2, T, { isStatic: true, friction: 0.6 }),
					Bodies.rectangle(-T / 2, h - tall / 2, T, tall, { isStatic: true, friction: 0.1 }),
					Bodies.rectangle(w + T / 2, h - tall / 2, T, tall, { isStatic: true, friction: 0.1 })
				];
				Composite.add(engine.world, walls);
				if (ceiling) {
					Composite.remove(engine.world, ceiling);
					ceiling = null;
					addCeiling();
				}
			}

			function addCeiling() {
				if (ceiling) return;
				ceiling = Bodies.rectangle(w / 2, -200, w + 800, 400, { isStatic: true, friction: 0.1 });
				Composite.add(engine.world, ceiling);
			}

			function removeCeiling() {
				if (!ceiling) return;
				Composite.remove(engine.world, ceiling);
				ceiling = null;
			}

			// Half extent of a rotated rounded square along an axis.
			const extent = (body) => (size / 2) * Math.min(1.35, Math.abs(Math.cos(body.angle)) + Math.abs(Math.sin(body.angle))) * 0.94;

			/* Safety net: an icon squeezed between the held icon and a wall
			   is put back inside instead of escaping. */
			function containBodies() {
				bodies.forEach((body) => {
					if (body.isStatic) return;
					const e = extent(body);
					const x = clamp(body.position.x, e, w - e);
					const y = ceiling ? clamp(body.position.y, e, h - e) : Math.min(body.position.y, h - e);
					const hitX = x !== body.position.x;
					const hitY = y !== body.position.y;
					if (hitX || hitY) {
						const v = { x: body.velocity.x, y: body.velocity.y };
						Body.setPosition(body, { x, y });
						Body.setVelocity(body, { x: hitX ? 0 : v.x, y: hitY ? 0 : v.y });
					}
				});
			}

			/* ---- Rendering: DOM icons follow their bodies ---------------- */
			function render() {
				bodies.forEach((body, i) => {
					const t = `translate3d(${(body.position.x - size / 2).toFixed(2)}px, ${(body.position.y - size / 2).toFixed(2)}px, 0) rotate(${body.angle.toFixed(4)}rad)`;
					if (t !== rendered[i]) {
						chips[i].style.transform = t;
						rendered[i] = t;
					}
				});
			}

			/* ---- Simulation loop ----------------------------------------- */
			function frame(now) {
				if (!running) return;
				const dt = lastTime ? Math.min(64, now - lastTime) : STEP_MS;
				lastTime = now;
				accumulator += dt;

				let steps = Math.floor(accumulator / STEP_MS);
				accumulator -= steps * STEP_MS;

				if (drag) {
					// Split fast pointer moves into small kinematic steps so collisions stay accurate.
					const dist = Math.hypot(drag.target.x - drag.applied.x, drag.target.y - drag.applied.y);
					if (dist > 0) steps = Math.max(steps, 1, Math.ceil(dist / (size * 0.25)));
				}
				steps = Math.min(steps, MAX_STEPS_PER_FRAME);

				const from = drag ? { ...drag.applied } : null;
				for (let s = 1; s <= steps; s++) {
					if (drag) moveKinematic(from, s / steps);
					Engine.update(engine, STEP_MS);
				}
				if (drag && steps) drag.applied = { ...drag.target };

				containBodies();
				if (!ceiling && bodies.every((b) => b.position.y - size / 2 >= 0)) addCeiling();
				render();

				const settled = !drag && bodies.every((b) => b.isSleeping);
				if (settled || !visible) {
					running = false;
					lastTime = 0;
					return;
				}
				requestAnimationFrame(frame);
			}

			function wake() {
				if (running || !visible) return;
				running = true;
				lastTime = 0;
				accumulator = 0;
				requestAnimationFrame(frame);
			}

			function wakeAll() {
				bodies.forEach((b) => Sleeping.set(b, false));
			}

			/* Instantly settle without animation (reduced motion). */
			function settleNow() {
				for (let i = 0; i < 900 && !bodies.every((b) => b.isSleeping); i++) {
					Engine.update(engine, STEP_MS);
					containBodies();
					if (!ceiling && bodies.every((b) => b.position.y - size / 2 >= 0)) addCeiling();
				}
				render();
			}

			/* ---- Drop in / tidy up -------------------------------------- */
			function dropIn() {
				if (drag) return;
				removeCeiling();
				const order = chips.map((_, i) => i).sort(() => Math.random() - 0.5);
				const pad = size * 0.15;
				const reduced = prefersReducedMotion();

				order.forEach((slot, i) => {
					const body = bodies[i];
					const x = pad + size / 2 + ((slot + 0.5) / chips.length) * (w - pad * 2 - size) + random(-size * 0.2, size * 0.2);
					// Reduced motion: start just above the floor so the settle is short.
					const y = reduced ? h - size * (1 + (i % 3)) : -size * (0.8 + i * 0.75);
					if (body.isStatic) Body.setStatic(body, false);
					Body.setPosition(body, { x: clamp(x, size / 2, w - size / 2), y });
					Body.setAngle(body, random(-0.6, 0.6));
					Body.setVelocity(body, { x: random(-1, 1), y: reduced ? 0 : random(1, 3) });
					Body.setAngularVelocity(body, reduced ? 0 : random(-0.08, 0.08));
				});
				wakeAll();

				if (reduced) settleNow();
				else wake();
			}

			function toss() {
				if (drag) return;
				if (prefersReducedMotion()) {
					bodies.forEach((body) => {
						Body.setPosition(body, { x: random(size, w - size), y: random(size, h - size) });
						Body.setAngle(body, random(-0.5, 0.5));
						Body.setVelocity(body, { x: 0, y: 0 });
					});
					wakeAll();
					settleNow();
					return;
				}
				wakeAll();
				bodies.forEach((body) => {
					Body.setVelocity(body, { x: random(-9, 9), y: random(-17, -9) });
					Body.setAngularVelocity(body, random(-0.3, 0.3));
				});
				wake();
			}

			function hop(i) {
				const body = bodies[i];
				if (body.isStatic) return;
				Sleeping.set(body, false);
				if (prefersReducedMotion()) {
					Body.setVelocity(body, { x: 0, y: -6 });
				} else {
					Body.setVelocity(body, { x: random(-2, 2), y: -13 });
					Body.setAngularVelocity(body, random(0.18, 0.3) * (Math.random() < 0.5 ? -1 : 1));
				}
				wake();
			}

			/* ---- Kinematic dragging ------------------------------------ */
			function localPoint(e) {
				const rect = area.getBoundingClientRect();
				return { x: e.clientX - rect.left, y: e.clientY - rect.top };
			}

			function clampTarget(p) {
				const e = extent(drag.body);
				return { x: clamp(p.x, e, w - e), y: clamp(p.y, e, h - e) };
			}

			function moveKinematic(from, t) {
				const { body } = drag;
				const x = from.x + (drag.target.x - from.x) * t;
				const y = from.y + (drag.target.y - from.y) * t;
				// updateVelocity = true: the held icon carries real velocity into collisions.
				Body.setPosition(body, { x, y }, true);
				// A gentle tilt in the direction of travel, also kinematic.
				const vx = x - body.positionPrev.x;
				const tilt = drag.baseAngle + clamp(vx * 0.03, -0.35, 0.35);
				Body.setAngle(body, body.angle + (tilt - body.angle) * 0.15, true);
			}

			function onPointerMove(e) {
				if (!drag || e.pointerId !== drag.id) return;
				const p = localPoint(e);
				if (!drag.moved && Math.hypot(e.clientX - drag.startX, e.clientY - drag.startY) > 4) drag.moved = true;
				drag.target = clampTarget({ x: p.x - drag.offset.x, y: p.y - drag.offset.y });
				drag.samples.push({ x: drag.target.x, y: drag.target.y, t: performance.now() });
				if (drag.samples.length > 8) drag.samples.shift();
				wake();
			}

			function endDrag(e) {
				if (!drag || e.pointerId !== drag.id) return;
				const { body, chip, samples, moved } = drag;

				window.removeEventListener('pointermove', onPointerMove);
				window.removeEventListener('pointerup', endDrag);
				window.removeEventListener('pointercancel', endDrag);
				try {
					if (chip.hasPointerCapture(e.pointerId)) chip.releasePointerCapture(e.pointerId);
				} catch (err) { /* already released */ }

				// Snap to the final pointer position before handing back to physics.
				Body.setPosition(body, drag.target, false);
				drag = null;

				Body.setStatic(body, false);

				// Throw velocity from the last ~90ms of movement (px per 60Hz step).
				const now = performance.now();
				const recent = samples.filter((s) => now - s.t < 90);
				let v = { x: 0, y: 0 };
				if (!prefersReducedMotion() && recent.length > 1) {
					const a = recent[0];
					const b = recent[recent.length - 1];
					const ms = Math.max(8, b.t - a.t);
					v = { x: ((b.x - a.x) / ms) * BASE_MS, y: ((b.y - a.y) / ms) * BASE_MS };
					const speed = Math.hypot(v.x, v.y);
					const max = 28;
					if (speed > max) v = { x: (v.x / speed) * max, y: (v.y / speed) * max };
				}
				Body.setVelocity(body, v);
				Body.setAngularVelocity(body, clamp(v.x * 0.006, -0.25, 0.25));

				chip.classList.remove('is-dragging');
				chip.dataset.suppressClick = moved ? '1' : '';
				engine.enableSleeping = true;
				wakeAll();
				wake();
			}

			chips.forEach((chip, i) => {
				chip.addEventListener('pointerdown', (e) => {
					if (drag || (e.pointerType === 'mouse' && e.button !== 0)) return;
					e.preventDefault(); // no text selection / native drag; touch-action on the chip blocks scrolling
					try {
						chip.setPointerCapture(e.pointerId);
					} catch (err) { /* capture is optional: window listeners below still track the pointer */ }

					const body = bodies[i];
					const p = localPoint(e);

					// Infinite mass while held. Sleeping is disabled so every icon
					// it touches reacts (Matter never wakes bodies hit by static ones).
					engine.enableSleeping = false;
					wakeAll();
					Body.setStatic(body, true);
					body.friction = 0.5;

					drag = {
						id: e.pointerId,
						body,
						chip,
						offset: { x: p.x - body.position.x, y: p.y - body.position.y },
						startX: e.clientX,
						startY: e.clientY,
						baseAngle: body.angle,
						moved: false,
						applied: { x: body.position.x, y: body.position.y },
						target: { x: body.position.x, y: body.position.y },
						samples: [{ x: body.position.x, y: body.position.y, t: performance.now() }]
					};
					drag.target = clampTarget(drag.target);

					chip.style.zIndex = ++zIndex;
					chip.classList.add('is-dragging');
					window.addEventListener('pointermove', onPointerMove);
					window.addEventListener('pointerup', endDrag);
					window.addEventListener('pointercancel', endDrag);
					wake();
				});

				// Tap / Enter / Space: hop. A click that ends a drag is ignored.
				chip.addEventListener('click', () => {
					if (chip.dataset.suppressClick) {
						chip.dataset.suppressClick = '';
						return;
					}
					hop(i);
				});

				chip.addEventListener('keydown', (e) => {
					const boost = e.shiftKey ? 2 : 1;
					const nudges = {
						ArrowLeft: { x: -7, y: -2 },
						ArrowRight: { x: 7, y: -2 },
						ArrowUp: { x: 0, y: -12 },
						ArrowDown: { x: 0, y: 8 }
					};
					const n = nudges[e.key];
					if (!n || bodies[i].isStatic) return;
					e.preventDefault();
					const body = bodies[i];
					Sleeping.set(body, false);
					Body.setVelocity(body, { x: body.velocity.x + n.x * boost, y: body.velocity.y + n.y * boost });
					chip.style.zIndex = ++zIndex;
					if (prefersReducedMotion()) settleNow();
					else wake();
				});
			});

			root.querySelector('[data-tools-shuffle]').addEventListener('click', toss);
			root.querySelector('[data-tools-tidy]').addEventListener('click', dropIn);

			/* ---- Resize: rescale bodies and rebuild walls ---------------- */
			if ('ResizeObserver' in window) {
				new ResizeObserver(debounce(() => {
					const nw = area.clientWidth;
					const nh = area.clientHeight;
					const nsize = chips[0].offsetWidth;
					if (nw === w && nh === h && nsize === size) return;

					const sx = nw / w;
					const scale = nsize / size;
					bodies.forEach((body) => {
						if (scale !== 1) Body.scale(body, scale, scale);
						Body.setPosition(body, { x: body.position.x * sx, y: Math.min(body.position.y, nh - nsize / 2) });
					});
					w = nw;
					h = nh;
					size = nsize;
					buildWalls();
					containBodies();
					render(); // redraw now: the loop may be paused if the footer scrolled out of view
					wakeAll();
					if (prefersReducedMotion() || !visible) settleNow();
					else wake();
				}, 150)).observe(area);
			}

			buildWalls();
			dropIn();
			area.classList.remove('is-pending');
			render();

			return {
				setVisible(value) {
					visible = value;
					if (visible) wake();
				}
			};
		}
	};
})();

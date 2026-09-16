/* =========================================================================
   About — pinned glass card with project thumbnails floating past it
   (same look as before; the animation logic is rebuilt so it is reliable)

   Fixes compared with the previous version:
   - The pinned section itself was animated (marginTop) while pinned, which
     made the pin spacer the wrong size and caused a jump when the pin ended.
     The card now moves with a transform on its inner wrapper instead.
   - The thumbnail tweens used triggers *inside* the pinned section without
     pinnedContainer, so their start/end points ignored the pin spacing and
     fired at the wrong time. They now share one timeline with the pin.
   - Fixed pixel distances (-3360px, 480px…) broke on laptops (root font is
     8px there) and wide screens. Distances are now measured and recalculated
     on refresh.
   - Desktop-only setup uses gsap.matchMedia so everything is reverted
     cleanly when the viewport crosses the breakpoint.
   ========================================================================= */
(function () {
	'use strict';

	window.TD.initAbout = function initAbout(section) {
		if (!section || !window.gsap || !window.ScrollTrigger) return;

		const card = section.querySelector('.inner');
		const byId = (id) => section.querySelector('#' + id);
		const flights = [
			{ el: byId('project1'), x: 0, rotate: -10, at: 0, duration: 0.9 },
			{ el: byId('project3'), x: -0.22, rotate: -10, at: 0, duration: 0.9 },
			{ el: byId('project2'), x: 0.33, rotate: 10, at: 0.1, duration: 0.9 },
			{ el: byId('project4'), x: 0.33, rotate: 10, at: 0.1, duration: 0.9 }
		].filter((f) => f.el);

		const mm = gsap.matchMedia();

		mm.add('(min-width: 1025px) and (prefers-reduced-motion: no-preference)', () => {
			const tl = gsap.timeline({
				defaults: { ease: 'none' },
				scrollTrigger: {
					trigger: section,
					start: 'top 30%',
					end: '+=180%',
					scrub: 3,
					pin: true,
					anticipatePin: 1,
					invalidateOnRefresh: true
				}
			});

			tl.to(card, { y: -150, duration: 1 }, 0);

			flights.forEach((f) => {
				tl.to(f.el, {
					// Travel from the resting position to fully above the viewport.
					y: () => -(f.el.offsetTop + f.el.offsetHeight * 1.5 + window.innerHeight * 0.6),
					x: () => window.innerWidth * f.x,
					scale: 1.5,
					rotate: f.rotate,
					opacity: 0.6,
					duration: f.duration
				}, f.at);
			});
		});
	};
})();

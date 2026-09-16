/* Shared helpers for Techiedoor components (no dependencies). */
(function () {
	'use strict';

	const reducedMotionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
	const finePointerQuery = window.matchMedia('(hover: hover) and (pointer: fine)');

	const escapeMap = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };

	window.TD = {
		prefersReducedMotion: () => reducedMotionQuery.matches,
		hasFinePointer: () => finePointerQuery.matches,

		escape(value) {
			return String(value == null ? '' : value).replace(/[&<>"']/g, (c) => escapeMap[c]);
		},

		pad(n) {
			return String(n).padStart(2, '0');
		},

		clamp(value, min, max) {
			return Math.min(Math.max(value, min), max);
		},

		debounce(fn, delay) {
			let timer;
			return function (...args) {
				clearTimeout(timer);
				timer = setTimeout(() => fn.apply(this, args), delay);
			};
		},

		/* Runs `callback` once, the first time `el` intersects the viewport. */
		onceVisible(el, callback, options) {
			if (!('IntersectionObserver' in window)) {
				callback();
				return () => {};
			}
			const observer = new IntersectionObserver((entries) => {
				if (entries.some((entry) => entry.isIntersecting)) {
					observer.disconnect();
					callback();
				}
			}, options || { threshold: 0.25 });
			observer.observe(el);
			return () => observer.disconnect();
		}
	};
})();

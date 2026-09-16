/* =========================================================================
   Techiedoor — home page
   Loaded after: jQuery, Bootstrap, VirtualSelect, Swiper, GSAP, ScrollTrigger,
   assets/js/data/site-data.js and assets/js/components/*.js
   ========================================================================= */

/* ---- Video modal (used by the Work Gallery slides) ---------------------- */
const videoModalEl = document.getElementById('videoModal');
const videoModal = new bootstrap.Modal(videoModalEl);
const videoIframe = document.getElementById('videoIframe');

function openModal(videoUrl) {
	videoIframe.src = videoUrl + '?rel=0&autoplay=1';
	videoModal.show();
}

// Clear video when modal is closed
videoModalEl.addEventListener('hidden.bs.modal', function () {
	videoIframe.src = '';
});

(function () {
	'use strict';

	const TD = window.TD;
	const data = window.TD_DATA || {};
	const hasGsap = !!(window.gsap && window.ScrollTrigger);

	/* ---- Header: shrink once the page is scrolled ----------------------- */
	const header = document.querySelector('header');
	let isShrunk = null;
	function checkScroll() {
		const shrink = window.scrollY > 0;
		if (shrink === isShrunk) return;
		isShrunk = shrink;
		header.classList.toggle('shrink', shrink);
	}
	checkScroll();
	window.addEventListener('scroll', checkScroll, { passive: true });

	/* ---- In-page anchor links -------------------------------------------
	   Previously every a[href*="#"] was intercepted and scrolled with jQuery
	   animate, which (a) threw on href="#" and on missing targets, and
	   (b) fought with CSS scroll-behavior:smooth. Native smooth scrolling +
	   scroll-margin-top (see style.scss) handles the header offset. */
	document.addEventListener('click', (e) => {
		const link = e.target.closest('a[href^="#"]');
		if (!link) return;
		const hash = link.getAttribute('href');
		if (hash === '#') {
			e.preventDefault();
			return;
		}
		const target = document.getElementById(hash.slice(1));
		if (!target) return;
		e.preventDefault();
		target.scrollIntoView({ behavior: TD.prefersReducedMotion() ? 'auto' : 'smooth', block: 'start' });
		history.replaceState(null, '', hash);
	});

	/* ---- Sliders & form controls ---------------------------------------- */
	new Swiper('#swiperSlider', {
		direction: 'vertical',
		loop: true,
		autoplay: {
			delay: 2000,
			disableOnInteraction: false,
		},
		slidesPerView: 5,
		centeredSlides: true,
	});

	new Swiper('#projectSlider', {
		direction: 'horizontal',
		loop: true,
		spaceBetween: 60,
		speed: 10000, // long duration for smooth movement
		freeMode: {
			enabled: true,
			momentum: false, // prevent snapping back
		},
		autoplay: {
			delay: 0, // no pause, continuous scroll
			disableOnInteraction: false,
		},
		allowTouchMove: true,
		breakpoints: {
			768: {
				slidesPerView: 1,
				centeredSlides: true,
			},
			980: {
				slidesPerView: 2,
				centeredSlides: true,
			},
			1200: {
				slidesPerView: 3.5,
				spaceBetween: 60,
				centeredSlides: false,
			}
		},
	});

	VirtualSelect.init({
		ele: '#lookingFor',
		name: 'looking_for',
		ariaLabelledby: 'lookingFor_label',
		multiple: true,
		showSelectedOptionsFirst: true,
		hideOnSelect: true,
		search: true,
		options: [
			{
				label: 'Performance',
				value: 'Performance'
			},
		],
	});

	/* ---- Sections ------------------------------------------------------- */
	if (hasGsap) {
		gsap.registerPlugin(ScrollTrigger);
		// Ignore mobile address-bar / keyboard resizes; real resizes still refresh (debounced by GSAP).
		ScrollTrigger.config({ ignoreMobileResize: true });
	}

	TD.initServices(document.querySelector('[data-services]'), data.services);
	TD.initAbout(document.querySelector('.about_section'));
	TD.initProjects(document.querySelector('[data-projects]'), data.projects);
	TD.initProcess(document.querySelector('[data-process]'), data.process);
	TD.initFooterTools(document.querySelector('[data-tools]'), data.tools);
	TD.initContactForm(document.getElementById('contactForm'));

	/* ---- Stable viewport unit (--vh) ------------------------------------ */
	const setStableVH = () => {
		const vv = window.visualViewport;
		const isKeyboard = vv && window.innerHeight - vv.height > 120;
		if (!isKeyboard) {
			document.documentElement.style.setProperty('--vh', `${(vv ? vv.height : window.innerHeight) * 0.01}px`);
		}
	};
	setStableVH();
	window.addEventListener('resize', TD.debounce(setStableVH, 150));

	if (!hasGsap) return;

	const mm = gsap.matchMedia();

	/* ---- Hero decorative shapes ----------------------------------------- */
	mm.add('(prefers-reduced-motion: no-preference)', () => {
		gsap.to('.icon_1', {
			rotate: 60,
			y: -224,
			scrollTrigger: { trigger: '.icon_3', start: 'top 20%', end: 'top 0%', scrub: 3 },
		});
		gsap.to('.icon_2', {
			rotate: 60,
			y: -224,
			scrollTrigger: { trigger: '.icon_2', start: 'top 30%', end: 'top 0%', scrub: 1 },
		});
		gsap.to('.icon_3', {
			y: -224,
			scrollTrigger: { trigger: '.icon_3', start: 'top 20%', end: 'top 0%', scrub: 1 },
		});

		// "Still here?" marquee heading
		gsap.to('.tempass_section .heading', {
			x: -800,
			scrollTrigger: { trigger: '.tempass_section .heading', start: 'top 90%', end: 'top 0%', scrub: 4 },
		});

		// Generic reveal for section headings: fades each element up once.
		const revealTargets = gsap.utils.toArray('[data-reveal]');
		gsap.set(revealTargets, { y: 36, opacity: 0 });
		ScrollTrigger.batch(revealTargets, {
			start: 'top 88%',
			once: true,
			onEnter: (batch) => gsap.to(batch, { y: 0, opacity: 1, duration: 0.9, ease: 'power3.out', stagger: 0.08, overwrite: true }),
		});
	});

	// Images can change section heights after load; recalculate once.
	window.addEventListener('load', () => ScrollTrigger.refresh());
})();

/* =========================================================================
   Theme (light / dark)

   Load in <head> as a normal (blocking) script, before the stylesheets, so
   the saved theme is on <html data-theme="…"> before the first paint:

     <script src="assets/js/components/theme.js"></script>

   Toggle markup: any element with [data-theme-toggle]. Clicks are delegated
   from document, so buttons added later (e.g. a header rendered by JS) work
   without extra setup; call TD_THEME.sync() after inserting one to update
   its aria-pressed state straight away.

   Public API: window.TD_THEME.get() / set('light'|'dark') / toggle() / sync()
   Event:      document dispatches 'td:themechange' ({ detail: { theme } })
   ========================================================================= */
(function () {
	'use strict';

	const STORAGE_KEY = 'td-theme';
	const THEMES = ['light', 'dark'];
	const DEFAULT_THEME = 'light'; // the site's original look
	const root = document.documentElement;

	// localStorage can be missing or throw (privacy modes, blocked cookies,
	// sandboxed iframes). The theme still switches; it just isn't remembered.
	const storage = {
		get() {
			try {
				return window.localStorage.getItem(STORAGE_KEY);
			} catch (e) {
				return null;
			}
		},
		set(value) {
			try {
				window.localStorage.setItem(STORAGE_KEY, value);
			} catch (e) {
				/* not persisted */
			}
		}
	};

	const normalize = (theme) => (THEMES.indexOf(theme) !== -1 ? theme : DEFAULT_THEME);
	const reducedMotion = () => !!(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches);

	// The chosen theme. Tracked here rather than read back from <html>,
	// because a view transition applies the attribute a frame later and a
	// quick second click must toggle from the new choice, not the old one.
	let active = normalize(storage.get());
	const current = () => active;

	function sync() {
		const isDark = root.getAttribute('data-theme') === 'dark';
		document.querySelectorAll('[data-theme-toggle]').forEach((toggle) => {
			toggle.setAttribute('aria-pressed', String(isDark));
			toggle.setAttribute('title', isDark ? 'Switch to light mode' : 'Switch to dark mode');
		});
	}

	function apply(theme) {
		root.setAttribute('data-theme', theme);
		sync();
		document.dispatchEvent(new CustomEvent('td:themechange', { detail: { theme } }));
	}

	function set(theme) {
		theme = normalize(theme);
		storage.set(theme);
		if (theme === active) return;
		active = theme;

		// One cross-fade of the whole page instead of per-element colour
		// transitions, which would fight the existing CSS/GSAP animations.
		if (document.startViewTransition && !reducedMotion()) {
			// `ready` rejects when a newer toggle skips this transition;
			// the theme is still applied, so that's expected, not an error.
			document.startViewTransition(() => apply(theme)).ready.catch(() => {});
		} else {
			apply(theme);
		}
	}

	function toggle() {
		set(active === 'dark' ? 'light' : 'dark');
	}

	// 1. Before first paint: restore the saved theme (or the light default)
	apply(active);

	// 2. Delegated toggle clicks
	document.addEventListener('click', (e) => {
		if (e.target.closest && e.target.closest('[data-theme-toggle]')) toggle();
	});

	// 3. Buttons in the markup exist once the DOM is parsed
	if (document.readyState === 'loading') {
		document.addEventListener('DOMContentLoaded', sync);
	} else {
		sync();
	}

	// 4. Keep other open tabs in step
	window.addEventListener('storage', (e) => {
		if (e.key === STORAGE_KEY) {
			active = normalize(e.newValue);
			apply(active);
		}
	});

	window.TD_THEME = { get: current, set, toggle, sync };
})();

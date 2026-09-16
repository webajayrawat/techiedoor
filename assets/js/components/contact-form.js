/* =========================================================================
   Contact form — client-side validation and submission
   - Validates on blur, re-validates while typing once a field was touched,
     and validates everything on submit (focusing the first invalid field).
   - Errors are rendered in the existing .error_message spans, linked with
     aria-describedby and flagged with aria-invalid.
   - Values are trimmed (and inner whitespace collapsed where it makes sense).
   - Submission: this site has no backend yet. If the form's data-endpoint
     attribute is set, the data is POSTed there and success is only shown
     for a successful HTTP response. Without an endpoint nothing is sent;
     the visitor is told so and offered an email link with their message.
   - Double submissions are blocked while a request is in progress.
   ========================================================================= */
(function () {
	'use strict';

	const NAME_RE = /^[\p{L}\p{M}][\p{L}\p{M}' .-]*$/u;
	// Pragmatic email check: local@domain.tld, no spaces, no consecutive dots.
	const EMAIL_RE = /^[A-Za-z0-9.!#$%&'*+/=?^_`{|}~-]+@[A-Za-z0-9](?:[A-Za-z0-9-]{0,61}[A-Za-z0-9])?(?:\.[A-Za-z0-9](?:[A-Za-z0-9-]{0,61}[A-Za-z0-9])?)*\.[A-Za-z]{2,}$/;
	// Classic Skype names (6–32 chars, starting with a letter) or Microsoft "live:" IDs.
	const SKYPE_RE = /^(?:live:[A-Za-z0-9._-]{2,62}|[A-Za-z][A-Za-z0-9._,-]{5,31})$/;

	const MESSAGE_MIN = 20;
	const MESSAGE_MAX = 2000;

	const collapse = (value) => value.replace(/\s+/g, ' ').trim();

	window.TD.initContactForm = function initContactForm(form) {
		if (!form) return;

		const submitButton = form.querySelector('button[type="submit"]');
		const loader = form.querySelector('#loader_form');
		const status = form.querySelector('#contactFormStatus');
		const selectEl = form.querySelector('#lookingFor');

		const fields = [
			{
				key: 'name',
				el: form.querySelector('#your_name'),
				normalize: collapse,
				validate(value) {
					if (!value) return 'Please enter your name.';
					if (value.length < 2) return 'Your name should be at least 2 characters.';
					if (value.length > 60) return 'Please keep your name under 60 characters.';
					if (!NAME_RE.test(value)) return 'Please use letters only. Spaces, hyphens, apostrophes and periods are fine.';
					return '';
				}
			},
			{
				key: 'email',
				el: form.querySelector('#your_work_email'),
				normalize: (value) => value.trim(),
				validate(value) {
					if (!value) return 'Please enter your email address.';
					if (value.length > 254 || !EMAIL_RE.test(value) || value.includes('..')) {
						return 'Please enter a valid email address, like name@company.com.';
					}
					return '';
				}
			},
			{
				key: 'skype_id',
				el: form.querySelector('#skype_id'),
				normalize: (value) => value.trim(),
				validate(value) {
					if (!value) return ''; // optional
					if (!SKYPE_RE.test(value)) {
						return 'Please enter a valid Skype ID: 6–32 characters starting with a letter, or one that begins with "live:".';
					}
					return '';
				}
			},
			{
				key: 'looking_for',
				el: selectEl,
				isSelect: true,
				read: () => {
					const value = selectEl.value;
					if (Array.isArray(value)) return value.filter(Boolean);
					return value ? [value] : [];
				},
				validate(value) {
					return value.length ? '' : 'Please choose what you are looking for.';
				}
			},
			{
				key: 'message',
				el: form.querySelector('#floatingTextarea2'),
				// Keep line breaks, drop trailing spaces and excess blank lines.
				normalize: (value) => value.replace(/[ \t]+\n/g, '\n').replace(/\n{3,}/g, '\n\n').trim(),
				validate(value) {
					if (!value) return 'Please tell us a little about your project.';
					if (value.length < MESSAGE_MIN) return `Please add a few more details (at least ${MESSAGE_MIN} characters, ${MESSAGE_MIN - value.length} to go).`;
					if (value.length > MESSAGE_MAX) return `Please keep your message under ${MESSAGE_MAX} characters.`;
					return '';
				}
			}
		].filter((f) => f.el);

		fields.forEach((field) => {
			field.error = form.querySelector(`#${field.el.id}_error`);
			field.touched = false;
			// The element that receives focus and the aria state.
			field.focusTarget = () => (field.isSelect ? field.el.querySelector('.vscomp-ele-wrapper') : field.el);
		});

		let submitting = false;

		/* ---- Helpers ----------------------------------------------------- */
		function readValue(field) {
			if (field.read) return field.read();
			return field.normalize ? field.normalize(field.el.value) : field.el.value;
		}

		function applyNormalized(field) {
			if (field.read || !field.normalize) return;
			const normalized = field.normalize(field.el.value);
			if (normalized !== field.el.value) field.el.value = normalized;
		}

		function setError(field, message) {
			const target = field.focusTarget();
			const invalid = Boolean(message);
			field.el.classList.toggle('is-invalid', invalid);
			if (target) {
				target.setAttribute('aria-invalid', String(invalid));
				if (field.isSelect && field.error) {
					target.setAttribute('aria-describedby', field.error.id);
					target.setAttribute('aria-required', 'true');
				}
			}
			if (field.error) {
				field.error.textContent = message;
				field.error.classList.toggle('is-visible', invalid);
			}
		}

		function check(field) {
			const message = field.validate(readValue(field));
			setError(field, message);
			return !message;
		}

		function setStatus(type, html) {
			if (!status) return;
			status.className = `form_status${type ? ` form_status--${type}` : ''}`;
			status.innerHTML = html;
		}

		function setBusy(busy) {
			submitting = busy;
			submitButton.disabled = busy;
			submitButton.setAttribute('aria-busy', String(busy));
			form.setAttribute('aria-busy', String(busy));
			if (loader) loader.style.display = busy ? 'inline-flex' : 'none';
		}

		/* ---- Field events -------------------------------------------------- */
		fields.forEach((field) => {
			if (field.isSelect) {
				field.el.addEventListener('change', () => {
					field.touched = true;
					check(field);
				});
				return;
			}
			field.el.addEventListener('blur', () => {
				applyNormalized(field);
				// Don't nag about an empty field the visitor merely tabbed through.
				if (!field.touched && !field.el.value) return;
				field.touched = true;
				check(field);
			});
			field.el.addEventListener('input', () => {
				if (field.touched) check(field);
				if (status && status.textContent) setStatus('', '');
			});
		});

		/* ---- Submit ------------------------------------------------------ */
		form.addEventListener('submit', async (e) => {
			e.preventDefault();
			if (submitting) return;

			fields.forEach(applyNormalized);
			let firstInvalid = null;
			fields.forEach((field) => {
				field.touched = true;
				if (!check(field) && !firstInvalid) firstInvalid = field;
			});

			if (firstInvalid) {
				const count = fields.filter((f) => f.el.classList.contains('is-invalid')).length;
				setStatus('error', count === 1 ? 'Please fix the highlighted field.' : `Please fix the ${count} highlighted fields.`);
				const target = firstInvalid.focusTarget();
				if (target) target.focus({ preventScroll: true });
				(target || firstInvalid.el).scrollIntoView({ block: 'center', behavior: window.TD.prefersReducedMotion() ? 'auto' : 'smooth' });
				return;
			}

			const data = {};
			fields.forEach((field) => { data[field.key] = readValue(field); });

			const endpoint = (form.dataset.endpoint || '').trim();
			const fallbackEmail = form.dataset.fallbackEmail || '';

			if (!endpoint) {
				// No backend is configured: be honest and offer a working alternative.
				const body = [
					`Name: ${data.name}`,
					`Email: ${data.email}`,
					data.skype_id ? `Skype: ${data.skype_id}` : '',
					`Looking for: ${data.looking_for.join(', ')}`,
					'',
					data.message
				].filter((line, i) => line || i === 4).join('\n');
				const href = `mailto:${fallbackEmail}?subject=${encodeURIComponent('Project enquiry from ' + data.name)}&body=${encodeURIComponent(body)}`;
				setStatus('info', `Your details look good, but online sending isn't available yet, so nothing has been sent. <a href="${href}">Send it by email instead</a>.`);
				return;
			}

			setBusy(true);
			setStatus('', '');
			try {
				const payload = new FormData();
				Object.entries(data).forEach(([key, value]) => {
					if (Array.isArray(value)) value.forEach((v) => payload.append(`${key}[]`, v));
					else payload.append(key, value);
				});
				const response = await fetch(endpoint, {
					method: 'POST',
					body: payload,
					headers: { Accept: 'application/json' }
				});
				if (!response.ok) throw new Error(`HTTP ${response.status}`);

				form.reset(); // VirtualSelect listens for form reset too
				fields.forEach((field) => { field.touched = false; setError(field, ''); });
				setStatus('success', 'Thanks! Your message has been sent. We will get back to you soon.');
			} catch (err) {
				const emailLink = fallbackEmail ? ` or email us at <a href="mailto:${fallbackEmail}">${fallbackEmail}</a>` : '';
				setStatus('error', `Sorry, your message could not be sent. Please try again${emailLink}.`);
			} finally {
				setBusy(false);
			}
		});
	};
})();

/* =========================================================================
   Techiedoor — editable site content
   -------------------------------------------------------------------------
   All copy, visuals and ordering for the Services, Projects, Our Process and
   footer toolkit sections live here. Edit this file only; the components in
   assets/js/components/ render whatever is defined below.

   Image paths are relative to index.html.
   ========================================================================= */

window.TD_DATA = {

	/* ---------------------------------------------------------------------
	   SERVICES
	   accent  : colour used for the active state and preview stage
	   tint    : soft background for the preview stage
	   image   : preview visual (keep a 4:3-ish image for best results)
	   ------------------------------------------------------------------- */
	services: [
		{
			id: 'ui-ux',
			title: 'UI/UX Design',
			summary: 'Intuitive interfaces that feel effortless.',
			description: 'We design clean layouts, clear journeys and seamless navigation, so every screen keeps users engaged and moving toward their goal.',
			tagline: 'Experiences your users will love.',
			tags: ['User research', 'Wireframes', 'Design systems', 'Prototyping'],
			accent: '#E05AA8',
			tint: '#FFE9F6',
			image: 'assets/images/thumbnail/1.webp',
			imageAlt: 'Sample landing page interface design'
		},
		{
			id: 'web-development',
			title: 'Web Development',
			summary: 'Responsive, scalable, custom websites.',
			description: 'From sleek corporate sites to dynamic e-commerce platforms, we build websites that look modern, perform flawlessly on every device and are engineered to grow with you.',
			tagline: 'A website that works as hard as you do.',
			tags: ['Custom websites', 'E-commerce', 'CMS', 'Performance'],
			accent: '#7B5CF0',
			tint: '#EFE9FF',
			image: 'assets/images/thumbnail/dummy.webp',
			imageAlt: 'Website shown on a laptop and a phone'
		},
		{
			id: 'app-development',
			title: 'App Development',
			summary: 'Fast, simple, powerful mobile apps.',
			description: 'Mobile-first, performance-driven apps tailored to your goals, from the first prototype to a product that scales with your business.',
			tagline: 'Turn your idea into a high-performing app.',
			tags: ['iOS & Android', 'Cross-platform', 'APIs', 'App store launch'],
			accent: '#E0625A',
			tint: '#FFECEA',
			image: 'assets/images/thumbnail/2.webp',
			imageAlt: 'Sample dark themed product interface'
		},
		{
			id: 'digital-marketing',
			title: 'Digital Marketing',
			summary: 'Campaigns that grow your reach.',
			description: 'Smart, measurable campaigns across search and social. We combine creativity with data to put your brand in front of the right audience and turn attention into growth.',
			tagline: 'Grow your reach with smart digital marketing.',
			tags: ['SEO', 'Social media', 'Paid ads', 'Analytics'],
			accent: '#3E7BEA',
			tint: '#E8F0FF',
			image: 'assets/images/background/banner.webp',
			imageAlt: 'Abstract gradient brand visual'
		},
		{
			id: 'graphic-design',
			title: 'Graphic Design',
			summary: 'Visuals that strengthen your identity.',
			description: 'From logos to campaign visuals, we design graphics that capture attention and make your brand clean, creative and memorable.',
			tagline: 'Elevate your brand with powerful visuals.',
			tags: ['Brand identity', 'Logos', 'Social creatives', 'Print'],
			accent: '#1FA868',
			tint: '#E6FAEE',
			image: 'assets/images/thumbnail/3.webp',
			imageAlt: 'Sample editorial layout design'
		},
		{
			id: 'video-editing',
			title: 'Video Editing',
			summary: 'Stories told beautifully.',
			description: 'We turn raw footage into polished, engaging videos, from promotional films to social reels. Every cut, transition and effect is designed to enhance your story.',
			tagline: 'Let’s craft videos that inspire action.',
			tags: ['Promo videos', 'Reels', 'Motion graphics', 'Colour grading'],
			accent: '#E09A2E',
			tint: '#FFF3E0',
			image: 'assets/images/thumbnail/4.webp',
			imageAlt: 'Sample cinematic interior website hero'
		}
	],

	/* ---------------------------------------------------------------------
	   PROJECTS
	   These are PLACEHOLDER concept entries built from existing thumbnails.
	   Replace them with real case studies.

	   url     : leave empty until a case study page exists. When empty the
	             CTA links to the contact form instead of a fake page.
	   concept : true shows a "Concept" label so placeholder work is never
	             presented as completed client work.
	   layout  : 'feature' renders a full-width panel, anything else renders
	             an alternating editorial panel.
	   ------------------------------------------------------------------- */
	projects: [
		{
			name: 'Carousel Growth Site',
			category: 'Web Design & Development',
			description: 'A bold, conversion-focused marketing website with a responsive layout that carries the same story from desktop to phone.',
			services: ['UI/UX', 'Web Development', 'Responsive'],
			image: 'assets/images/thumbnail/dummy.webp',
			imageAlt: 'Marketing website shown on a laptop and a phone',
			accent: '#C9771F',
			url: '',
			concept: true,
			layout: 'feature'
		},
		{
			name: 'Community Platform',
			category: 'Product Design',
			description: 'A dark, high-contrast landing experience for a creator community, designed to make joining feel simple and exciting.',
			services: ['Product Design', 'Design System', 'Frontend'],
			image: 'assets/images/thumbnail/2.webp',
			imageAlt: 'Dark themed community platform landing page',
			accent: '#7B5CF0',
			url: '',
			concept: true
		},
		{
			name: 'Company Website',
			category: 'Corporate Website',
			description: 'A clean, friendly company site that introduces the team, their values and services with clear hierarchy.',
			services: ['UI/UX', 'Web Development', 'CMS'],
			image: 'assets/images/thumbnail/1.webp',
			imageAlt: 'Light corporate website with team imagery',
			accent: '#E0625A',
			url: '',
			concept: true
		},
		{
			name: 'Interior Studio',
			category: 'Brand & Web',
			description: 'An elegant, image-led website for an interior design studio, pairing editorial typography with immersive photography.',
			services: ['Art Direction', 'Web Design', 'Animation'],
			image: 'assets/images/thumbnail/4.webp',
			imageAlt: 'Interior design studio website hero',
			accent: '#B8743A',
			url: '',
			concept: true
		},
		{
			name: 'Personal Portfolio',
			category: 'Portfolio',
			description: 'A monochrome editorial portfolio with a striking display typeface and a story-driven about page.',
			services: ['Typography', 'Web Design', 'Frontend'],
			image: 'assets/images/thumbnail/3.webp',
			imageAlt: 'Monochrome personal portfolio about page',
			accent: '#354B60',
			url: '',
			concept: true
		}
	],

	/* ---------------------------------------------------------------------
	   OUR PROCESS
	   verb   : one-word label shown on the progress rail (read at a glance)
	   visual : scene drawn on the build canvas, one of
	            discovery | research | design | development | testing | launch
	   ------------------------------------------------------------------- */
	process: [
		{
			title: 'Discovery & Strategy',
			description: 'We start by listening. Together we define your goals, audience and what success looks like, then shape a strategy around it.',
			outputs: ['Goals & KPIs', 'Project scope', 'Strategy brief'],
			verb: 'Discover',
			visual: 'discovery'
		},
		{
			title: 'Research & Planning',
			description: 'We study your market, competitors and users, then turn insights into a clear plan: sitemap, features and timeline.',
			outputs: ['User insights', 'Sitemap', 'Roadmap'],
			verb: 'Research',
			visual: 'research'
		},
		{
			title: 'UI/UX Design',
			description: 'Wireframes become polished, on-brand interfaces. We prototype key flows so you can click through before a line of code is written.',
			outputs: ['Wireframes', 'Visual design', 'Prototype'],
			verb: 'Design',
			visual: 'design'
		},
		{
			title: 'Development',
			description: 'We build with clean, scalable code, responsive on every screen and connected to the tools your business already uses.',
			outputs: ['Frontend', 'Backend & CMS', 'Integrations'],
			verb: 'Build',
			visual: 'development'
		},
		{
			title: 'Testing & Optimization',
			description: 'Every page is tested across devices and browsers. We tune speed, accessibility and SEO so the launch is smooth.',
			outputs: ['QA testing', 'Performance', 'Accessibility'],
			verb: 'Test',
			visual: 'testing'
		},
		{
			title: 'Launch & Support',
			description: 'We go live together, then stay by your side with updates, improvements and guidance whenever you need it.',
			outputs: ['Go-live', 'Training', 'Ongoing support'],
			verb: 'Launch',
			visual: 'launch'
		}
	],

	/* ---------------------------------------------------------------------
	   FOOTER TOOLKIT (draggable icons)
	   icon : key of an inline SVG mark in components/footer-tools.js
	   ------------------------------------------------------------------- */
	tools: [
		{ name: 'Figma', icon: 'figma' },
		{ name: 'Visual Studio Code', icon: 'vscode' },
		{ name: 'JavaScript', icon: 'javascript' },
		{ name: 'React', icon: 'react' },
		{ name: 'Adobe Photoshop', icon: 'photoshop' },
		{ name: 'Adobe Illustrator (Ai)', icon: 'illustrator' },
		{ name: 'LinkedIn', icon: 'linkedin' },
		{ name: 'Instagram', icon: 'instagram' },
		{ name: 'Node.js', icon: 'nodejs' }
	]
};

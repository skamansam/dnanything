import adapter from '@sveltejs/adapter-auto';

/** @type {import('@sveltejs/kit').Config} */
const config = {
	kit: {
		// adapter-auto supports Vercel, Netlify, and others.
		// Switch to @sveltejs/adapter-vercel once the host is finalized.
		adapter: adapter()
	}
};

export default config;

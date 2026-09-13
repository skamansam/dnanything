import path from "node:path";
import { sveltekit } from "@sveltejs/kit/vite";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "vite";

const dirname = import.meta.dirname ?? path.dirname(new URL(".", import.meta.url).pathname);

export default defineConfig(({ command }) => ({
	resolve: {
		alias: {
			// In dev, use the local twintrinsic source for hot reload.
			// In build (Vercel/production), fall back to the npm/GitHub dependency.
			...(command === "serve"
				? { twintrinsic: path.resolve(dirname, "../twintrinsic/src/lib") }
				: {}),
		},
	},
	server: {
		fs: {
			allow: [path.resolve(dirname, "..")],
		},
	},
	plugins: [sveltekit(), tailwindcss()],
}));

import path from "node:path";
import { sveltekit } from "@sveltejs/kit/vite";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "vite";

const dirname = import.meta.dirname ?? path.dirname(new URL(".", import.meta.url).pathname);

export default defineConfig({
	resolve: {
		alias: {
			twintrinsic: path.resolve(dirname, "../twintrinsic/src/lib"),
		},
	},
	server: {
		fs: {
			allow: [path.resolve(dirname, "..")],
		},
	},
	plugins: [sveltekit(), tailwindcss()],
});

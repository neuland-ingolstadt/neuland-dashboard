import tailwindcss from "@tailwindcss/vite";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import viteReact from "@vitejs/plugin-react";
import { nitro } from "nitro/vite";
import { defineConfig } from "vite";

const config = defineConfig({
	server: {
		host: "127.0.0.1",
		port: 43127,
	},
	resolve: { tsconfigPaths: true },
	plugins: [nitro(), tailwindcss(), tanstackStart(), viteReact()],
});

export default config;

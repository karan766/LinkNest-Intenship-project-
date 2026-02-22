import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vitejs.dev/config/
export default defineConfig({
	plugins: [react()],
	server: {
		port: 3000,
		// Get rid of the CORS error
		proxy: {
			"/api": {
				target: "http://localhost:5000",
				changeOrigin: true,
				secure: false,
			},
		},
	},
	build: {
		outDir: "dist",
		sourcemap: false,
		rollupOptions: {
			output: {
				manualChunks: {
					vendor: ['react', 'react-dom'],
					chakra: ['@chakra-ui/react', '@emotion/react', '@emotion/styled'],
					router: ['react-router-dom'],
					icons: ['react-icons', '@chakra-ui/icons'],
				}
			}
		}
	},
	preview: {
		port: 3000,
	}
});

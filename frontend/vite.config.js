import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";

// https://vitejs.dev/config/
export default defineConfig(({ command, mode }) => {
	// Load env file based on `mode` in the current working directory.
	const env = loadEnv(mode, process.cwd(), '');
	
	const isDevelopment = mode === 'development';
	const isProduction = mode === 'production';
	
	return {
		plugins: [react()],
		server: {
			port: 3000,
			host: true, // Allow external connections
			// Get rid of the CORS error
			proxy: {
				"/api": {
					target: env.VITE_API_BASE_URL || "http://localhost:5000",
					changeOrigin: true,
					secure: false,
				},
				"/socket.io": {
					target: env.VITE_SOCKET_URL || "http://localhost:5000",
					changeOrigin: true,
					secure: false,
					ws: true,
				},
			},
		},
		build: {
			outDir: "dist",
			sourcemap: env.VITE_BUILD_SOURCEMAP === 'true' || isDevelopment,
			minify: env.VITE_BUILD_MINIFY !== 'false' && isProduction,
			chunkSizeWarningLimit: parseInt(env.VITE_CHUNK_SIZE_WARNING_LIMIT) || 1000,
			rollupOptions: {
				output: {
					manualChunks: {
						vendor: ['react', 'react-dom'],
						chakra: ['@chakra-ui/react', '@emotion/react', '@emotion/styled', 'framer-motion'],
						router: ['react-router-dom'],
						icons: ['react-icons', '@chakra-ui/icons'],
						socket: ['socket.io-client'],
						utils: ['date-fns', 'recoil'],
					}
				},
				// Handle external dependencies that might cause issues
				external: (id) => {
					// Don't externalize any dependencies in production
					return false;
				}
			}
		},
		preview: {
			port: 3000,
			host: true,
		},
		define: {
			// Make env variables available to the app
			__APP_VERSION__: JSON.stringify(env.VITE_APP_VERSION || '1.0.0'),
			__BUILD_TIME__: JSON.stringify(new Date().toISOString()),
		},
		// Optimize dependencies
		optimizeDeps: {
			include: [
				'react',
				'react-dom',
				'@chakra-ui/react',
				'@chakra-ui/theme-tools',
				'@emotion/react',
				'@emotion/styled',
				'framer-motion',
				'react-router-dom',
				'socket.io-client',
				'recoil'
			],
			// Force pre-bundling of problematic dependencies
			force: isProduction
		},
	};
});

import { defineConfig } from 'vite'
import path from 'path';

export default defineConfig({
	server: {
		host: 'localhost',
		port: 3000
	},
	resolve: {
		alias: {
			'@': path.resolve(__dirname, './src')
		},
		extensions: ['.js', '.ts']
	}
})
import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import json from '@rollup/plugin-json';
import pkg from './package.json' assert { type: "json" };

export default [
	{
		input: 'public/js/main.js',
		output: {
			name: 'bundle',
			file: 'public/bundle.js',
			format: 'umd'
		},
		plugins: [
			resolve(),
			commonjs(),
			json()
		]
	}
];
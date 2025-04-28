import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import json from '@rollup/plugin-json';
import pkg from './package.json' assert { type: "json" };

export default [
	{
		input: 'src/js/index.js',
		output: [
			{
				file: pkg.main,
				format: 'cjs',
				exports: 'default',
			},
			{
				file: pkg.module,
				format: 'es',
			},
			{
				file: 'dist/bundle.umd.js',
				format: 'umd',
				name: 'uggly',
				exports: 'default',
			}
		],
		plugins: [
			resolve(),
			commonjs(),
			json()
		]
	}
];
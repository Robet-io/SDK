import babel from 'rollup-plugin-babel'
import resolve from '@rollup/plugin-node-resolve'
import { terser } from 'rollup-plugin-terser'
import pkg from './package.json'

export default [
  {
    input: './src/index.js',
    output: [
      {
        file: pkg.main,
        format: 'cjs'
      },
      {
        file: pkg.module,
        format: 'es',
        exports: 'named'
      },
      {
        name: 'cryptoSDK',
        file: pkg.browser,
        format: 'umd'
      }
    ],
    plugins: [
      babel({
        exclude: 'node_modules/**',
        // presets: ['@babel/preset-react'],
        runtimeHelpers: true
      }),
      resolve(),
      terser()
    ]
  }
]

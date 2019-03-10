import babel from 'rollup-plugin-babel'
import resolve from 'rollup-plugin-node-resolve'
import { uglify } from "rollup-plugin-uglify";
import filesize from 'rollup-plugin-filesize';
import commonjs from 'rollup-plugin-commonjs';

export default {
  input: './src/helper.js',
  output: {
    file: './lib/index.js',
    name: 'SodaMap',
    format: 'umd'
  },
  plugins: [
    babel({
      "runtimeHelpers": true
    }),
    resolve(),
    commonjs(),
    uglify(),
    filesize()
  ]
};
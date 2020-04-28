import typescript from 'rollup-plugin-typescript2';
import alias from '@rollup/plugin-alias';
import resolve from '@rollup/plugin-node-resolve';
import postcss from 'rollup-plugin-postcss';
import pkg from './package.json';

export default {
  input: 'src/index.tsx',
  output: [
    {
      file: pkg.main,
      format: 'cjs',
    },
    {
      file: pkg.module,
      format: 'es',
    },
  ],
  external: [
    ...Object.keys(pkg.dependencies || {}),
    ...Object.keys(pkg.peerDependencies || {}),
  ],
  plugins: [
    typescript({
      typescript: require('typescript'),
      tsconfigOverride: { compilerOptions: { module: 'es2015' } },
    }),
    resolve(),
    alias({
      react: require.resolve('preact/compat'),
      'react-dom': require.resolve('preact/compat'),
    }),
    postcss(),
  ],
};

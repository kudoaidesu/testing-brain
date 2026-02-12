import * as esbuild from 'esbuild';

const watch = process.argv.includes('--watch');

/** @type {import('esbuild').BuildOptions} */
const extensionConfig = {
    entryPoints: ['src/extension.ts'],
    bundle: true,
    outfile: 'dist/extension.js',
    external: ['vscode'],
    format: 'cjs',
    platform: 'node',
    target: 'node18',
    sourcemap: true,
    minify: !watch,
};

/** @type {import('esbuild').BuildOptions} */
const testConfig = {
    entryPoints: ['src/test/runTest.ts', 'src/test/suite/index.ts'],
    bundle: true,
    outdir: 'dist/test',
    external: ['vscode', 'mocha'],
    format: 'cjs',
    platform: 'node',
    target: 'node18',
    sourcemap: true,
    minify: false,
};

if (watch) {
    const extCtx = await esbuild.context(extensionConfig);
    await extCtx.watch();
    console.log('[esbuild] watching for changes...');
} else {
    await esbuild.build(extensionConfig);
    await esbuild.build(testConfig);
    console.log('[esbuild] build complete');
}

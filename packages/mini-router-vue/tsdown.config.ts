import { defineConfig } from 'tsdown';

export default defineConfig({
    entry: ['./src/index.ts'],
    outDir: './dist',
    outputOptions: {
        name: 'mini-router-vue'
    },
    format: {
        esm: {
            target: ['es2015']
        },
        cjs: {
            target: ['es2015']
        }
    },
    dts: true
});

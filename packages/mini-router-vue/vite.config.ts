import { defineConfig } from 'vite';
import { resolve } from 'path';

// Mini Vue Router 库的构建配置
export default defineConfig({
  build: {
    // 确保组件代码是 Vue 3 兼容的
    target: 'esnext',
    lib: {
      // 库的入口文件
      entry: resolve(__dirname, 'src/index.ts'),
      name: 'MiniVueRouter',
      // 输出文件名
      fileName: 'mini-vue-router'
    },
    rollupOptions: {
      // 确保外部化处理那些你不想打包进库的依赖
      external: ['vue'],
      output: {
        // 在 UMD 构建模式下为外部化依赖提供一个全局变量
        globals: {
          vue: 'Vue',
        },
      },
    },
    // 生成 d.ts 文件
    emptyOutDir: true
  }
});

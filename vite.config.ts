import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import path from "path";

// https://vitejs.dev/config/
export default defineConfig({
  base: "./",
  plugins: [vue()],
  resolve: {
    alias: [{ find: "@", replacement: path.resolve(__dirname, "./src") }],
  },
  server: {
    host: "0.0.0.0",
    port: 5173,
    open: true,
    // 代理
    proxy: {
      // "/api1": {
      //   target: "http://128.168.11.111:8090",
      //   changeOrigin: true,
      //   rewrite: (path) => path.replace(/^\/api1/, ""),
      // },
      // "/api2": {
      //   target: "http://128.168.11.112:9200",
      //   changeOrigin: true,
      //   rewrite: (path) => path.replace(/^\/api2/, ""),
      // },
    },
  },
  build:{
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true,
      }
    }
  }
});

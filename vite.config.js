import vue from "@vitejs/plugin-vue";
const path = require("path");

module.exports = {
  plugins: [vue()],
  server: {
    open: "/index.html",
  },
  build: {
    manifest: true,
    lib: {
      entry: path.resolve(__dirname, "src/index.js"),
      name: "VueDragula",
    },
    rollupOptions: {
      // make sure to externalize deps that shouldn't be bundled
      // into your library
      external: ["vue"],
      output: {
        // Provide global variables to use in the UMD build
        // for externalized deps
        globals: {
          vue: "Vue",
        },
      },
    },
  },
};

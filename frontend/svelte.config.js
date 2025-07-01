/** @type {import('@sveltejs/kit').Config} */
import adapter from "@sveltejs/adapter-static";

const config = {
  kit: {
    adapter: adapter({
      pages: "build",
      assets: "build",
      fallback: "index.html",
      strict: false
    }),
  },
};

export default config;

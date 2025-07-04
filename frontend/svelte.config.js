/** @type {import('@sveltejs/kit').Config} */
import adapter from "@sveltejs/adapter-node";

const config = {
  kit: {
    adapter: adapter({
      // Node适配器配置
      out: 'build',
      precompress: true,
      envPrefix: 'FRIDGET_'
    }),
  },
};

export default config;

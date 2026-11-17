import type { Config } from "tailwindcss";

export default {
  content: ["./app/**/*.{vue,js,ts}"],
  theme: {
    extend: {
      colors: {
        cream: "#FBF6EE",
        sand: "#EFE4D2",
        terracotta: { DEFAULT: "#C2603F", dark: "#A24C30" },
        brown: "#5B3F2E",
        charcoal: "#2B2623",
      },
    },
  },
} satisfies Config;

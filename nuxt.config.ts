export default defineNuxtConfig({
  compatibilityDate: "2025-07-15",
  devtools: { enabled: true },
  modules: ["@nuxtjs/tailwindcss"],

  typescript: {
    strict: true,
    typeCheck: false,
  },

  app: {
    head: {
      htmlAttrs: { lang: "fr" },
      title: "GiftList",
      meta: [
        { name: "viewport", content: "width=device-width, initial-scale=1" },
        // Espace privé : aucune indexation
        { name: "robots", content: "noindex, nofollow" },
      ],
    },
  },

  routeRules: {
    "/**": { headers: { "X-Robots-Tag": "noindex, nofollow" } },
  },
});

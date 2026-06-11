export default defineNuxtConfig({
  compatibilityDate: "2026-06-11",
  css: ["~/assets/css/main.css"],
  devtools: { enabled: false },
  app: {
    head: {
      title: "月亮棋 · Moon Chess",
      htmlAttrs: {
        lang: "zh-CN",
      },
      meta: [
        {
          name: "description",
          content: "3x3 local two-player Moon Chess with per-player FIFO moonfall rules.",
        },
        {
          name: "viewport",
          content: "width=device-width, initial-scale=1, viewport-fit=cover",
        },
        {
          name: "theme-color",
          content: "#0a0e1f",
        },
      ],
      link: [
        {
          rel: "icon",
          type: "image/svg+xml",
          href: "/favicon.svg",
        },
      ],
    },
  },
})

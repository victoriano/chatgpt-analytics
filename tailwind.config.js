/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {},
  },
  plugins: [require("daisyui")],
  daisyui: {
    themes: [
      {
        cmyk: {
          "primary": "oklch(71.772% 0.133 239.443)",
          "primary-content": "oklch(14.354% 0.026 239.443)",
          "secondary": "oklch(64.476% 0.202 359.339)",
          "secondary-content": "oklch(12.895% 0.04 359.339)",
          "accent": "oklch(94.228% 0.189 105.306)",
          "accent-content": "oklch(18.845% 0.037 105.306)",
          "neutral": "oklch(21.778% 0 0)",
          "neutral-content": "oklch(84.355% 0 0)",
          "base-100": "oklch(100% 0 0)",
          "base-200": "oklch(95% 0 0)",
          "base-300": "oklch(90% 0 0)",
          "base-content": "oklch(20% 0 0)",
          "info": "oklch(68.475% 0.094 217.284)",
          "info-content": "oklch(13.695% 0.018 217.284)",
          "success": "oklch(46.949% 0.162 321.406)",
          "success-content": "oklch(89.389% 0.032 321.406)",
          "warning": "oklch(71.236% 0.159 52.023)",
          "warning-content": "oklch(14.247% 0.031 52.023)",
          "error": "oklch(62.013% 0.208 28.717)",
          "error-content": "oklch(12.402% 0.041 28.717)",
        },
      },
    ],
    base: true,
    styled: true,
    utils: true,
  },
}
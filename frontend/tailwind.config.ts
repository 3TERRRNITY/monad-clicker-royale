import type { Config } from "tailwindcss";

export default {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        "acid-pink": "#ff00ff",
        "mutagen-green": "#00ff9d",
        "ooze-blue": "#00e1ff",
        "dark-slime": "#0a0a2e",
      },
      animation: {
        ooze: "ooze 8s ease-in-out infinite",
        "neon-pulse": "neon-pulse 2s ease-in-out infinite",
      },
      keyframes: {
        ooze: {
          "0%, 100%": { "border-radius": "60% 40% 30% 70%/60% 30% 70% 40%" },
          "50%": { "border-radius": "30% 60% 70% 40%/50% 60% 30% 60%" },
        },
        "neon-pulse": {
          "0%, 100%": {
            opacity: "1",
            filter: "drop-shadow(0 0 10px currentColor)",
          },
          "50%": {
            opacity: "0.8",
            filter: "drop-shadow(0 0 20px currentColor)",
          },
        },
      },
    },
  },
  plugins: [],
} satisfies Config;

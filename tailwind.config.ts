import type { Config } from "tailwindcss";

export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        bg: {
          base: "#0B0F1A",
          card: "#131826",
          cardHover: "#1A2030",
          elevated: "#171D2D",
        },
        border: {
          subtle: "#1F2638",
          strong: "#2A3349",
        },
        text: {
          primary: "#F4F6FB",
          secondary: "#A3ABBF",
          muted: "#6B7390",
        },
        brand: {
          purple: "#8B7CF6",
          purpleDeep: "#5B4DCB",
          purpleSoft: "rgba(139, 124, 246, 0.12)",
        },
        accent: {
          green: "#5FD68A",
          greenSoft: "rgba(95, 214, 138, 0.12)",
          yellow: "#F5C76E",
          yellowSoft: "rgba(245, 199, 110, 0.14)",
          orange: "#F59E6E",
          orangeSoft: "rgba(245, 158, 110, 0.14)",
          red: "#F26E6E",
        },
      },
      fontFamily: {
        sans: [
          "Inter",
          "ui-sans-serif",
          "system-ui",
          "-apple-system",
          "Segoe UI",
          "Roboto",
          "sans-serif",
        ],
      },
      borderRadius: {
        "2xl": "16px",
      },
      boxShadow: {
        card: "0 1px 0 0 rgba(255,255,255,0.03) inset",
        focusGlow: "0 0 0 1px rgba(95, 214, 138, 0.5), 0 0 24px rgba(95, 214, 138, 0.15)",
      },
    },
  },
  plugins: [],
} satisfies Config;

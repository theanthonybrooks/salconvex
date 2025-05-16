import type { Config } from "tailwindcss";
import tailwindcssAnimate from "tailwindcss-animate";
import { fontFamily } from "tailwindcss/defaultTheme";
import { PluginAPI } from "tailwindcss/types/config";

export default {
  darkMode: ["class"],
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/features/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        tanker: ["var(--font-tanker-reg)", ...fontFamily.sans],
        spaceGrotesk: ["var(--font-space-grotesk)", ...fontFamily.sans],
        spaceMono: ["var(--font-space-mono)", ...fontFamily.mono],
        libreFranklin: ["var(--font-libre-franklin)", ...fontFamily.sans],
        bebasNeue: ["var(--font-bebas-neue)", ...fontFamily.sans],
        ramaE: ["rama-gothic-e", ...fontFamily.sans],
        ramaM: ["rama-gothic-m", ...fontFamily.sans],
        ramaC: ["rama-gothic-c", ...fontFamily.sans],
      },
      screens: {
        lg: "1025px",

        "2xl": "1536px",
        "3xl": "1920px",
        "4xl": "2560px",
        "5xl": "3200px",
        "6xl": "3840px",
      },

      colors: {
        background: "hsl(var(--background))",
        backgroundHex: "var(--background-hex)",
        backgroundDark: "hsl(var(--background-dark))",
        dashboardBgLt: "hsl(var(--dashboard-bg-lt))",
        foreground: "hsl(var(--foreground))",
        salYellow: "hsl(var(--sal-yellow))",
        salYellowLt: "hsl(var(--sal-yellow-light))",
        salYellowLtHover: "hsl(var(--sal-yellow-lt-hover))",
        salYellowHex: "var(--sal-yellow-hex)",
        salYellowDark: "hsl(var(--sal-yellow-dark))",
        salProgress: "var(--sal-progress)",
        salPink: "hsl(var(--sal-pink))",
        salPinkLt: "hsl(var(--sal-pink-light))",
        salPinkLtHover: "hsl(var(--sal-pink-lt-hover))",
        salPinkDark: "hsl(var(--sal-pink-dark))",
        userIcon: "hsl(var(--user-icon))",
        txtMutedForeground: "hsl(var(--txt-muted-foreground))",
        customPurple: "#5C3B58",
        toucanColor: "var(--toucan-color)",
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
          secondary: "hsl(var(--card-secondary))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        chart: {
          "1": "hsl(var(--chart-1))",
          "2": "hsl(var(--chart-2))",
          "3": "hsl(var(--chart-3))",
          "4": "hsl(var(--chart-4))",
          "5": "hsl(var(--chart-5))",
        },
        sidebar: {
          DEFAULT: "hsl(var(--sidebar-background))",
          foreground: "hsl(var(--sidebar-foreground))",
          primary: "hsl(var(--sidebar-primary))",
          "primary-foreground": "hsl(var(--sidebar-primary-foreground))",
          accent: "hsl(var(--sidebar-accent))",
          "accent-foreground": "hsl(var(--sidebar-accent-foreground))",
          border: "hsl(var(--sidebar-border))",
          ring: "hsl(var(--sidebar-ring))",
        },
      },
      spacing: {
        dynamic: "min(10vh, 40px)",
      },
      borderColor: {
        bg: "rgba(0, 0, 0, 0.5)",
      },
      borderWidth: {
        "1.5": "1.5px",
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      boxShadow: {
        sxl: "-7px 7px 0 0 #000000",
        slgHover: "-4px 4px 0 0 #000000",
        slg: "-5px 5px 0 0 #000000",
        slga: "-5px 5px 0 0 rgba(0, 0, 0, 0.7)",
        llg: "5px 5px 0 0 #000000",
        llga: "5px 5px 0 0 rgba(0, 0, 0, 0.7)",
        vlg: "0 5px 0 0 #000000",
        vlga: "0 5px 0 0 rgba(0, 0, 0, 0.7)",
        smd: "-3px 3px 0 0 #000000",
        ssm: "-2px 2px 0 0 #000000",
      },
      zIndex: {
        1: "1",
        2: "2",
        3: "3",
        999: "999",
        top: "9999",
      },
      padding: {
        "10": "2.5rem",
        "12": "3rem",
        "14": "3.5rem",
        "16": "4rem",
        "18": "4.5rem",
        "20": "5rem",
        "25": "100px",
      },
      margin: {
        "10": "2.5rem",
        "12": "3rem",
        "14": "3.5rem",
        "16": "4rem",
        "18": "4.5rem",
        "20": "5rem",
      },
      width: {
        "100dvh": "100dvh",
        "100dvw": "100dvw",
        "2px": "2px",
        "3px": "3px",
        "4px": "4px",
        "5px": "5px",
        "15": "60px",
        "25": "100px",
        "30": "120px",
        "50": "200px",
      },
      maxWidth: {
        "10": "40px",
        "15": "60px",
        "20": "80px",
        "25": "100px",
        "30": "120px",
        "40": "160px",
        "50": "200px",
        "60": "240px",
        "70": "280px",
        "80": "320px",
        "90": "360px",
        "100": "400px",
        "3xl": "1536px",
        "90dvw": "90dvw",
        "80dvw": "80dvw",
        dvw: "100dvw",
        screen: "100vw",
      },
      minWidth: {
        "10": "40px",
        "15": "60px",
        "20": "80px",
        "25": "100px",
        "30": "120px",
        "40": "160px",
        "50": "200px",
        "60": "240px",
        "70": "280px",
        "80": "320px",
        "90": "360px",
        "100": "400px",
        "3xl": "1536px",
        "90dvw": "90dvw",
        "80dvw": "80dvw",
        dvw: "100dvw",
        screen: "100vw",
      },
      height: {
        "13": "52px",
        "15": "60px",
        "25": "100px",
      },
      maxHeight: {
        "13": "52px",
        "15": "60px",
        "25": "100px",
        "30": "120px",
        "50": "200px",
        "70": "280px",
      },
      fontSize: {
        "2xs": "0.6rem",
        "4h": "2.5rem",
      },
      size: {
        "15": "60px",
        "25": "100px",
      },

      keyframes: {
        "background-shine": {
          from: {
            backgroundPosition: "0 0",
          },
          to: {
            backgroundPosition: "-200% 0",
          },
        },
        "border-beam": {
          "100%": {
            "offset-distance": "100%",
          },
        },
        "logo-cloud": {
          from: {
            transform: "translateX(0)",
          },
          to: {
            transform: "translateX(calc(-100% - 4rem))",
          },
        },
        orbit: {
          "0%": {
            transform:
              "rotate(0deg) translateY(calc(var(--radius) * 1px)) rotate(0deg)",
          },
          "100%": {
            transform:
              "rotate(360deg) translateY(calc(var(--radius) * 1px)) rotate(-360deg)",
          },
        },
        gradient: {
          to: {
            backgroundPosition: "var(--bg-size) 0",
          },
        },
        shimmer: {
          "0%, 90%, 100%": {
            "background-position": "calc(-100% - var(--shimmer-width)) 0",
          },
          "30%, 60%": {
            "background-position": "calc(100% + var(--shimmer-width)) 0",
          },
        },
        "accordion-down": {
          from: {
            height: "0",
          },
          to: {
            height: "var(--radix-accordion-content-height)",
          },
        },
        "accordion-up": {
          from: {
            height: "var(--radix-accordion-content-height)",
          },
          to: {
            height: "0",
          },
        },
        buttonheartbeat: {
          "0%": {
            "box-shadow": '0 0 0 0 theme("colors.blue.500")',
            transform: "scale(1)",
          },
          "50%": {
            "box-shadow": '0 0 0 7px theme("colors.blue.500/0")',
            transform: "scale(1.05)",
          },
          "100%": {
            "box-shadow": '0 0 0 0 theme("colors.blue.500/0")',
            transform: "scale(1)",
          },
        },
        "caret-blink": {
          "0%,70%,100%": {
            opacity: "1",
          },
          "20%,50%": {
            opacity: "0",
          },
        },
      },
      animation: {
        "logo-cloud": "logo-cloud 30s linear infinite",
        orbit: "orbit calc(var(--duration)*1s) linear infinite",
        gradient: "gradient 8s linear infinite",
        shimmer: "shimmer 8s infinite",
        buttonheartbeat: "buttonheartbeat 2s infinite ease-in-out",
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "border-beam": "border-beam calc(var(--duration)*1s) infinite linear",
        "background-shine": "background-shine 2s linear infinite",
        "caret-blink": "caret-blink 1.25s ease-out infinite",
      },
    },
  },
  plugins: [
    tailwindcssAnimate,
    function ({
      addUtilities,
    }: {
      addUtilities: (utilities: Record<string, Record<string, string>>) => void;
    }) {
      addUtilities({
        ".stroked": {
          "-webkit-text-stroke": "0.5px black",
        },
        ".unstroked": {
          "-webkit-text-stroke": "0px black",
        },
        // ".hover\\:stroked:hover": {
        //   "-webkit-text-stroke": "1px black", // Optional: Make stroke thicker on hover
        // },
        ".wshadow": {
          "text-shadow": "black -5px 5px",
        },
        ".mask-fade-bottom": {
          "-webkit-mask-image":
            "linear-gradient(to top, transparent 0%, black 2%)",
          "mask-image": "linear-gradient(to top, transparent 0%, black 2%)",
          "-webkit-mask-repeat": "no-repeat",
          "mask-repeat": "no-repeat",
          "-webkit-mask-size": "100% 100%",
          "mask-size": "100% 100%",
        },

        ".mask-fade-top": {
          "-webkit-mask-image":
            "linear-gradient(to bottom, transparent 0%, black 2%)",
          "mask-image": "linear-gradient(to bottom, transparent 0%, black 2%)",
          "-webkit-mask-repeat": "no-repeat",
          "mask-repeat": "no-repeat",
          "-webkit-mask-size": "100% 100%",
          "mask-size": "100% 100%",
        },

        ".mask-fade-top-bottom": {
          "-webkit-mask-image":
            "linear-gradient(to bottom, transparent 0%, black 2%, black 98%, transparent 100%)",
          "mask-image":
            "linear-gradient(to bottom, transparent 0%, black 2%, black 98%, transparent 100%)",
          "-webkit-mask-repeat": "no-repeat",
          "mask-repeat": "no-repeat",
          "-webkit-mask-size": "100% 100%",
          "mask-size": "100% 100%",
        },

        // ".hover\\:wshadow:hover": {
        //   "text-shadow": "black -7px 7px", // Optional: Increase shadow on hover
        // },
      });
    },
    function ({ addVariant, e }: PluginAPI) {
      ["default", "light", "white"].forEach((mode) => {
        addVariant(
          mode,
          (() => {
            return ({
              modifySelectors,
              separator,
            }: {
              modifySelectors: (
                cb: (args: { className: string }) => string,
              ) => void;
              separator: string;
            }) => {
              modifySelectors(({ className }) => {
                return `.${mode} .${e(`${mode}${separator}${className}`)}`;
              });
            };
          })() as () => string,
        );
      });
    },
  ],
} satisfies Config;

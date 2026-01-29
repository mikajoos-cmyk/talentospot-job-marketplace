module.exports = {
  darkMode: ["class"],
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      screens: {
        'layout-sm': '940px',
        'layout-md': '1260px',
        '3xl': '1771px',
      },
      colors: {
        border: "hsl(220, 15%, 90%)",
        input: "hsl(220, 15%, 90%)",
        ring: "hsl(217, 33%, 50%)",
        background: "hsl(0, 0%, 99%)",
        foreground: "hsl(220, 15%, 20%)",
        primary: {
          DEFAULT: "hsl(217, 33%, 50%)",
          foreground: "hsl(0, 0%, 100%)",
          hover: "hsl(217, 33%, 45%)",
          active: "hsl(217, 33%, 40%)",
        },
        secondary: {
          DEFAULT: "hsl(220, 29%, 10%)",
          foreground: "hsl(0, 0%, 98%)",
          hover: "hsl(220, 29%, 14%)",
          active: "hsl(220, 29%, 18%)",
        },
        tertiary: {
          DEFAULT: "hsl(0, 0%, 97%)",
          foreground: "hsl(220, 15%, 20%)",
        },
        accent: {
          DEFAULT: "hsl(28, 45%, 60%)",
          foreground: "hsl(0, 0%, 100%)",
        },
        success: {
          DEFAULT: "hsl(217, 33%, 50%)",
          foreground: "hsl(0, 0%, 100%)",
        },
        warning: {
          DEFAULT: "hsl(40, 100%, 50%)",
          foreground: "hsl(0, 0%, 15%)",
        },
        error: {
          DEFAULT: "hsl(0, 72%, 50%)",
          foreground: "hsl(0, 0%, 98%)",
        },
        info: {
          DEFAULT: "hsl(210, 90%, 60%)",
          foreground: "hsl(0, 0%, 100%)",
        },
        muted: {
          DEFAULT: "hsl(0, 0%, 96%)",
          foreground: "hsl(220, 9%, 46%)",
        },
        popover: {
          DEFAULT: "hsl(0, 0%, 100%)",
          foreground: "hsl(220, 15%, 20%)",
        },
        card: {
          DEFAULT: "hsl(0, 0%, 100%)",
          foreground: "hsl(220, 15%, 20%)",
        },
        neutral: {
          50: "hsl(0, 0%, 98%)",
          100: "hsl(0, 0%, 96%)",
          200: "hsl(0, 0%, 93%)",
          300: "hsl(216, 12%, 84%)",
          400: "hsl(218, 11%, 65%)",
          500: "hsl(220, 9%, 46%)",
          600: "hsl(215, 14%, 34%)",
          700: "hsl(217, 19%, 27%)",
          800: "hsl(215, 28%, 17%)",
          900: "hsl(221, 39%, 11%)",
        },
      },
      fontFamily: {
        sans: ['"Inter"', 'sans-serif'],
        heading: ['"DM Sans"', 'sans-serif'],
        mono: ['"Fira Code"', 'monospace'],
      },
      fontSize: {
        h1: ['36px', { lineHeight: '1.2', fontWeight: '500' }],
        h2: ['30px', { lineHeight: '1.2', fontWeight: '500' }],
        h3: ['24px', { lineHeight: '1.2', fontWeight: '500' }],
        h4: ['20px', { lineHeight: '1.2', fontWeight: '500' }],
        'body-lg': ['18px', { lineHeight: '1.5', fontWeight: '400' }],
        body: ['16px', { lineHeight: '1.5', fontWeight: '400' }],
        'body-sm': ['14px', { lineHeight: '1.5', fontWeight: '400' }],
        caption: ['12px', { lineHeight: '1.5', fontWeight: '400' }],
      },
      spacing: {
        '1': '4px',
        '2': '8px',
        '4': '16px',
        '6': '24px',
        '8': '32px',
        '12': '48px',
        '16': '64px',
        'xs': '8px',
        'sm': '16px',
        'md': '24px',
        'lg': '32px',
        'xl': '48px',
        '2xl': '64px',
      },
      borderRadius: {
        sm: '8px',
        md: '10px',
        lg: '12px',
        full: '9999px',
      },
      boxShadow: {
        sm: '0 1px 3px hsla(220, 15%, 20%, 0.1)',
        md: '0 2px 6px hsla(220, 15%, 20%, 0.15)',
        lg: '0 6px 12px hsla(220, 15%, 20%, 0.18)',
        xl: '0 8px 24px hsla(220, 15%, 20%, 0.24)',
      },
      backgroundImage: {
        'gradient-primary': 'linear-gradient(135deg, hsl(217, 33%, 50%) 0%, hsl(217, 33%, 60%) 100%)',
        'gradient-secondary': 'linear-gradient(135deg, hsl(220, 29%, 14%) 0%, hsl(220, 29%, 22%) 100%)',
        'gradient-accent': 'linear-gradient(135deg, hsl(28, 45%, 60%) 0%, hsl(28, 45%, 70%) 100%)',
      },
      transitionDuration: {
        fast: '150ms',
        normal: '250ms',
        slow: '400ms',
      },
      transitionTimingFunction: {
        'ease-in': 'cubic-bezier(0.4, 0, 1, 1)',
        'ease-out': 'cubic-bezier(0, 0, 0.2, 1)',
        'ease-in-out': 'cubic-bezier(0.4, 0, 0.2, 1)',
      },
      keyframes: {
        'fade-in': {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        'slide-in-right': {
          '0%': { transform: 'translateX(100%)' },
          '100%': { transform: 'translateX(0)' },
        },
        'slide-up': {
          '0%': { transform: 'translateY(10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
      },
      animation: {
        'fade-in': 'fade-in 200ms ease-in-out',
        'slide-in-right': 'slide-in-right 250ms ease-out',
        'slide-up': 'slide-up 250ms ease-out',
      },
    },
  },
  plugins: [],
};

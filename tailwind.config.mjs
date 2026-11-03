import typography from '@tailwindcss/typography';

// Neutrals are tinted a hair toward the brand red (hue 25) instead of
// Tailwind's cool blue slate, so gray text sits in the same family as the
// accent. `slate` is overridden in place so existing classes pick it up.
const neutral = (l, c = 0.008) => `oklch(${l} ${c} 25 / <alpha-value>)`;

/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{astro,html,js,jsx,md,mdx,ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: [
          '"Bricolage Grotesque"',
          'ui-sans-serif',
          'system-ui',
          'sans-serif',
        ],
        serif: ['Literata', 'ui-serif', 'Georgia', 'serif'],
        mono: ['"Geist Mono"', 'ui-monospace', 'monospace'],
      },
      colors: {
        slate: {
          50: neutral(0.975, 0.004),
          100: neutral(0.955, 0.005),
          200: neutral(0.91, 0.007),
          300: neutral(0.85, 0.009),
          400: neutral(0.68, 0.012),
          500: neutral(0.52, 0.014),
          600: neutral(0.42, 0.016),
          700: neutral(0.35, 0.016),
          800: neutral(0.27, 0.016),
          900: neutral(0.21, 0.016),
          950: neutral(0.16, 0.014),
        },
        // "Kırmızı kalem": the red correction pen. Deeper than flag red so it
        // reads as an editor's mark, not an alarm.
        brand: {
          50: 'oklch(0.97 0.014 26 / <alpha-value>)',
          100: 'oklch(0.94 0.03 26 / <alpha-value>)',
          200: 'oklch(0.88 0.06 26 / <alpha-value>)',
          300: 'oklch(0.79 0.1 26 / <alpha-value>)',
          400: 'oklch(0.67 0.16 26 / <alpha-value>)',
          500: 'oklch(0.58 0.19 26 / <alpha-value>)',
          600: 'oklch(0.52 0.19 26 / <alpha-value>)',
          700: 'oklch(0.45 0.17 26 / <alpha-value>)',
          800: 'oklch(0.38 0.14 26 / <alpha-value>)',
          900: 'oklch(0.3 0.1 26 / <alpha-value>)',
        },
        // Money kept: savings, exemptions, net amounts.
        gain: {
          50: 'oklch(0.97 0.02 160 / <alpha-value>)',
          100: 'oklch(0.93 0.045 160 / <alpha-value>)',
          600: 'oklch(0.5 0.11 160 / <alpha-value>)',
          700: 'oklch(0.43 0.1 160 / <alpha-value>)',
          800: 'oklch(0.36 0.08 160 / <alpha-value>)',
        },
        canvas: 'oklch(0.982 0.004 25 / <alpha-value>)',
      },
      zIndex: {
        dropdown: '30',
        sticky: '40',
        overlay: '50',
        modal: '60',
      },
      transitionTimingFunction: {
        'out-quart': 'cubic-bezier(0.25, 1, 0.5, 1)',
      },
    },
  },
  plugins: [typography],
};

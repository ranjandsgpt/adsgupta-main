import type { Config } from 'tailwindcss';
import path from 'path';

export default {
  content: [
    './app/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './src/**/*.{ts,tsx}',
    path.join(__dirname, '../../packages/amazon-audit/src/**/*.{ts,tsx}'),
  ],
  theme: {
    extend: {},
  },
  plugins: [],
} satisfies Config;

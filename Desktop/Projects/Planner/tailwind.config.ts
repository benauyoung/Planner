import type { Config } from "tailwindcss";

export default {
    content: [
        "./pages/**/*.{js,ts,jsx,tsx,mdx}",
        "./components/**/*.{js,ts,jsx,tsx,mdx}",
        "./app/**/*.{js,ts,jsx,tsx,mdx}",
    ],
    darkMode: "class",
    theme: {
        extend: {
            colors: {
                background: "hsl(var(--background))",
                foreground: "hsl(var(--foreground))",
                primary: {
                    DEFAULT: "hsl(var(--primary))",
                    foreground: "hsl(var(--primary-foreground))",
                },
                secondary: {
                    DEFAULT: "hsl(var(--secondary))",
                    foreground: "hsl(var(--secondary-foreground))",
                },
                accent: {
                    DEFAULT: "hsl(var(--accent))",
                    foreground: "hsl(var(--accent-foreground))",
                },
                muted: {
                    DEFAULT: "hsl(var(--muted))",
                    foreground: "hsl(var(--muted-foreground))",
                },
                border: "hsl(var(--border))",
                canvas: "hsl(var(--canvas))",
                node: {
                    goal: "hsl(var(--node-goal))",
                    subgoal: "hsl(var(--node-subgoal))",
                    feature: "hsl(var(--node-feature))",
                    task: "hsl(var(--node-task))",
                },
            },
            fontFamily: {
                sans: ["var(--font-inter)"],
            },
            boxShadow: {
                glow: "0 0 20px rgba(var(--glow-rgb), 0.5)",
                "glow-lg": "0 0 40px rgba(var(--glow-rgb), 0.6)",
            },
        },
    },
    plugins: [],
} satisfies Config;

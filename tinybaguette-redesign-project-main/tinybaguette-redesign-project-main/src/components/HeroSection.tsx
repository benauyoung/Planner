import { motion } from "framer-motion";
import { useState } from "react";
import heroBg from "@/assets/hero-bg.jpg";

const suggestions = ["Online Boutique", "Fitness App", "Recipe Platform", "Portfolio Site", "Learning Hub"];

const headlineWords = ["Plan", "it.", "Build", "it.", "Ship", "it."];

const HeroSection = () => {
  const [inputValue, setInputValue] = useState("");

  return (
    <section className="relative min-h-screen flex items-end pb-20 pt-16 overflow-hidden">
      {/* Full-bleed cinematic background */}
      <motion.div
        initial={{ scale: 1.1 }}
        animate={{ scale: 1 }}
        transition={{ duration: 1.8, ease: "easeOut" }}
        className="absolute inset-0"
      >
        <img
          src={heroBg}
          alt=""
          className="w-full h-full object-cover"
        />
      </motion.div>

      {/* Dark cinematic overlay gradient */}
      <div className="absolute inset-0 bg-gradient-to-t from-foreground/90 via-foreground/50 to-foreground/20" />
      
      {/* Film grain texture */}
      <div className="absolute inset-0 opacity-[0.04] mix-blend-overlay" style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E\")" }} />

      <div className="container mx-auto px-6 relative z-10">
        <div className="max-w-4xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.6 }}
            className="inline-flex items-center gap-2 bg-background/10 backdrop-blur-sm border border-background/20 rounded-full px-4 py-1.5 mb-8"
          >
            <span className="text-xs font-body font-medium text-wheat">✦ Plan first, build with confidence</span>
          </motion.div>

          {/* Giant staggered headline */}
          <div className="flex flex-wrap gap-x-5 gap-y-1 mb-6">
            {headlineWords.map((word, i) => (
              <motion.span
                key={i}
                initial={{ opacity: 0, y: 60 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.8 + i * 0.1 }}
                className={`text-6xl md:text-8xl lg:text-9xl font-display leading-[1] ${
                  i % 2 === 0 ? "text-background" : "italic text-wheat"
                }`}
              >
                {word}
              </motion.span>
            ))}
          </div>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 1.4 }}
            className="text-lg md:text-xl font-body text-background/70 max-w-lg mb-10"
          >
            Every great project starts with a great plan. Describe your idea and get a structured roadmap before you write a single line of code.
          </motion.p>

          {/* Input Card */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 1.6 }}
            className="max-w-2xl"
          >
            <div className="bg-card/95 backdrop-blur-md rounded-2xl shadow-2xl border border-border/50 p-5">
              <textarea
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder="A recipe sharing platform with AI meal planning..."
                className="w-full bg-transparent resize-none border-none outline-none font-body text-foreground placeholder:text-muted-foreground/60 min-h-[80px] text-sm"
              />
              <div className="flex items-center justify-between mt-2 pt-3 border-t border-border">
                <div className="flex flex-wrap gap-2">
                  {suggestions.map((s, i) => (
                    <motion.button
                      key={s}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.3, delay: 1.7 + i * 0.05 }}
                      onClick={() => setInputValue(s)}
                      className="text-xs font-body bg-muted hover:bg-cream-dark text-muted-foreground rounded-full px-3 py-1 transition-colors"
                    >
                      {s}
                    </motion.button>
                  ))}
                </div>
                <button className="bg-primary text-primary-foreground rounded-lg px-5 py-2 text-sm font-body font-medium hover:opacity-90 transition-opacity flex items-center gap-1.5 shrink-0 ml-3">
                  Plan <span className="text-xs">→</span>
                </button>
              </div>
            </div>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 2 }}
              className="text-xs text-background/40 mt-3 font-body"
            >
              <kbd className="bg-background/10 px-1.5 py-0.5 rounded text-[10px]">Enter</kbd> to plan · <kbd className="bg-background/10 px-1.5 py-0.5 rounded text-[10px]">Shift+Enter</kbd> for new line
            </motion.p>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;

import { motion } from "framer-motion";

const Navbar = () => {
  return (
    <motion.nav
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-border"
    >
      <div className="container mx-auto flex items-center justify-between h-16 px-6">
        <div className="flex items-center gap-2">
          <span className="text-2xl">🥖</span>
          <span className="font-display text-xl text-foreground">TinyBaguette</span>
        </div>
        <div className="hidden md:flex items-center gap-8">
          <a href="#features" className="text-sm font-body text-muted-foreground hover:text-foreground transition-colors">
            Features
          </a>
          <a href="#how-it-works" className="text-sm font-body text-muted-foreground hover:text-foreground transition-colors">
            How It Works
          </a>
          <a href="#cta" className="text-sm font-body text-muted-foreground hover:text-foreground transition-colors">
            Pricing
          </a>
        </div>
        <div className="flex items-center gap-3">
          <button className="text-sm font-body text-muted-foreground hover:text-foreground transition-colors">
            Login
          </button>
          <button className="bg-primary text-primary-foreground px-5 py-2 rounded-lg text-sm font-body font-medium hover:opacity-90 transition-opacity">
            Get Started
          </button>
        </div>
      </div>
    </motion.nav>
  );
};

export default Navbar;

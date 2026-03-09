import { motion } from "framer-motion";
import { useState } from "react";

const CtaSection = () => {
  const [email, setEmail] = useState("");

  return (
    <section id="cta" className="py-24 bg-forest">
      <div className="container mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center max-w-lg mx-auto"
        >
          <h2 className="text-4xl md:text-5xl font-display text-cream mb-4">
            Ready to plan?
          </h2>
          <p className="font-body text-cream/70 mb-8">
            Join the waitlist or start building your first project plan for free.
          </p>
          <div className="flex gap-3 max-w-md mx-auto">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your@email.com"
              className="flex-1 bg-cream/10 border border-cream/20 rounded-lg px-4 py-3 text-sm font-body text-cream placeholder:text-cream/40 outline-none focus:border-terracotta transition-colors"
            />
            <button className="bg-terracotta text-accent-foreground px-6 py-3 rounded-lg text-sm font-body font-medium hover:bg-terracotta-dark transition-colors shrink-0">
              Notify Me
            </button>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default CtaSection;

import { motion } from "framer-motion";
import { Sparkles, Heart, Clock } from "lucide-react";

const values = [
  { icon: Sparkles, label: "AI Native" },
  { icon: Heart, label: "Built for You" },
  { icon: Clock, label: "In Minutes" },
];

const ValueBar = () => {
  return (
    <section className="py-8 bg-primary">
      <div className="container mx-auto px-6">
        <div className="flex items-center justify-center gap-8 md:gap-16">
          {values.map((v, i) => (
            <motion.div
              key={v.label}
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="flex items-center gap-2"
            >
              <v.icon className="w-4 h-4 text-primary-foreground/70" />
              <span className="text-xs font-body font-medium tracking-widest uppercase text-primary-foreground">
                {v.label}
              </span>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ValueBar;

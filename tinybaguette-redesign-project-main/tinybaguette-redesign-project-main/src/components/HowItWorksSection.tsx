import { motion } from "framer-motion";

const steps = [
  { number: "01", title: "Describe your idea", description: "Type a sentence about what you want to build." },
  { number: "02", title: "AI breaks it down", description: "Goals, features, and tasks generated instantly." },
  { number: "03", title: "Refine & export", description: "Drag, edit, rearrange — then ship to your tools." },
];

const HowItWorksSection = () => {
  return (
    <section id="how-it-works" className="py-24 bg-muted/50">
      <div className="container mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-display text-foreground mb-4">How it works</h2>
          <p className="text-muted-foreground font-body text-lg">Three steps. Zero friction.</p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
          {steps.map((s, i) => (
            <motion.div
              key={s.number}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.15, duration: 0.5 }}
              className="text-center"
            >
              <div className="font-display text-6xl text-terracotta/20 mb-4">{s.number}</div>
              <h3 className="font-display text-xl text-foreground mb-2">{s.title}</h3>
              <p className="text-sm font-body text-muted-foreground">{s.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HowItWorksSection;

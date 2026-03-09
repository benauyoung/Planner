import { motion } from "framer-motion";
import { Map, Palette, Bot, Plug } from "lucide-react";

const features = [
  {
    icon: Map,
    title: "Visual Planning",
    description: "Interactive canvas with goals, subgoals, features, and tasks — all connected in a living tree.",
  },
  {
    icon: Palette,
    title: "Beautiful Design",
    description: "Auto-generated project blueprints that look good enough to share with stakeholders.",
  },
  {
    icon: Bot,
    title: "AI Agents",
    description: "Smart agents break down your idea into actionable steps, estimate scope, and suggest features.",
  },
  {
    icon: Plug,
    title: "Integrations",
    description: "Export to Jira, Linear, Notion, or GitHub. Your plan goes where your team already works.",
  },
];

const FeaturesSection = () => {
  return (
    <section id="features" className="py-24 bg-background">
      <div className="container mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-display text-foreground mb-4">
            Big Ideas. <span className="text-terracotta">TinyBaguette.</span>
          </h2>
          <p className="text-muted-foreground font-body text-lg max-w-md mx-auto">
            Plan your project in minutes, not weeks.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((f, i) => (
            <motion.div
              key={f.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1, duration: 0.5 }}
              whileHover={{ y: -6 }}
              className="bg-card border border-border rounded-2xl p-6 group cursor-default"
            >
              <div className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center mb-4 group-hover:bg-terracotta/10 transition-colors">
                <f.icon className="w-5 h-5 text-sage group-hover:text-terracotta transition-colors" />
              </div>
              <h3 className="font-display text-lg text-foreground mb-2">{f.title}</h3>
              <p className="text-sm font-body text-muted-foreground leading-relaxed">{f.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;

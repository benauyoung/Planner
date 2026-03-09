const Footer = () => {
  return (
    <footer className="py-8 bg-forest border-t border-cream/10">
      <div className="container mx-auto px-6 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-lg">🥖</span>
          <span className="font-display text-sm text-cream/60">TinyBaguette</span>
        </div>
        <p className="text-xs font-body text-cream/40">© 2026 TinyBaguette. All rights reserved.</p>
      </div>
    </footer>
  );
};

export default Footer;

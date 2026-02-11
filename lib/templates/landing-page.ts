import type { AIPlanNode } from '@/types/chat'

export const LANDING_PAGE_TEMPLATE = {
  title: 'Marketing Landing Page',
  description: 'Conversion-optimized landing page with hero, features, testimonials, pricing, and CTA sections.',
  nodeCount: 20,
  tags: ['frontend', 'marketing', 'design'],
  nodes: [
    { id: 'goal-1', type: 'goal', title: 'Landing Page', description: 'Build a high-converting marketing landing page with responsive design, animations, and analytics.', parentId: null },

    { id: 'subgoal-1-1', type: 'subgoal', title: 'Page Sections', description: 'Core content sections of the landing page.', parentId: 'goal-1' },
    { id: 'subgoal-1-2', type: 'subgoal', title: 'Interactivity & Polish', description: 'Animations, forms, and responsive design.', parentId: 'goal-1' },
    { id: 'subgoal-1-3', type: 'subgoal', title: 'Launch Readiness', description: 'SEO, analytics, performance, and deployment.', parentId: 'goal-1' },

    { id: 'feature-1-1-1', type: 'feature', title: 'Hero Section', description: 'Above-the-fold section with headline, subheadline, CTA button, and hero image/video.', parentId: 'subgoal-1-1' },
    { id: 'task-1-1-1-1', type: 'task', title: 'Design hero layout (desktop + mobile)', description: 'Large headline, supporting text, primary CTA button, optional background image.', parentId: 'feature-1-1-1' },
    { id: 'task-1-1-1-2', type: 'task', title: 'Implement hero with responsive breakpoints', description: 'Stack vertically on mobile, side-by-side on desktop.', parentId: 'feature-1-1-1' },

    { id: 'feature-1-1-2', type: 'feature', title: 'Features Grid', description: '3-4 feature cards with icons, titles, and descriptions.', parentId: 'subgoal-1-1' },
    { id: 'task-1-1-2-1', type: 'task', title: 'Create feature card component', description: 'Icon, title, description. Hover effect with subtle shadow.', parentId: 'feature-1-1-2' },
    { id: 'task-1-1-2-2', type: 'task', title: 'Responsive grid layout', description: '1 column mobile, 2 tablet, 3-4 desktop.', parentId: 'feature-1-1-2' },

    { id: 'feature-1-1-3', type: 'feature', title: 'Testimonials', description: 'Social proof section with customer quotes and avatars.', parentId: 'subgoal-1-1' },
    { id: 'task-1-1-3-1', type: 'task', title: 'Testimonial card component', description: 'Quote, name, role, company, avatar image.', parentId: 'feature-1-1-3' },
    { id: 'task-1-1-3-2', type: 'task', title: 'Carousel or grid display', description: 'Auto-rotating carousel on mobile, grid on desktop.', parentId: 'feature-1-1-3' },

    { id: 'feature-1-1-4', type: 'feature', title: 'Pricing Section', description: 'Pricing tiers with feature comparison and CTA per tier.', parentId: 'subgoal-1-1' },
    { id: 'task-1-1-4-1', type: 'task', title: 'Pricing card component', description: 'Tier name, price, feature list, CTA button. Highlight recommended tier.', parentId: 'feature-1-1-4' },

    { id: 'feature-1-2-1', type: 'feature', title: 'Scroll Animations', description: 'Sections animate in on scroll using Intersection Observer.', parentId: 'subgoal-1-2' },
    { id: 'task-1-2-1-1', type: 'task', title: 'Implement fade-in-up animations', description: 'Use Framer Motion or CSS animations triggered by scroll.', parentId: 'feature-1-2-1' },

    { id: 'feature-1-2-2', type: 'feature', title: 'Contact/Signup Form', description: 'Email capture or contact form with validation.', parentId: 'subgoal-1-2' },
    { id: 'task-1-2-2-1', type: 'task', title: 'Build form with client-side validation', description: 'Email, name, message fields. Error states and success confirmation.', parentId: 'feature-1-2-2' },
    { id: 'task-1-2-2-2', type: 'task', title: 'Form submission handler', description: 'API endpoint or third-party service (Formspree, Resend).', parentId: 'feature-1-2-2' },

    { id: 'feature-1-3-1', type: 'feature', title: 'SEO & Meta Tags', description: 'Proper meta tags, Open Graph, and structured data.', parentId: 'subgoal-1-3' },
    { id: 'task-1-3-1-1', type: 'task', title: 'Add meta tags and OG images', description: 'Title, description, canonical URL, OG image for social sharing.', parentId: 'feature-1-3-1' },

    { id: 'feature-1-3-2', type: 'feature', title: 'Analytics Setup', description: 'Track page views, CTA clicks, and form submissions.', parentId: 'subgoal-1-3' },
    { id: 'task-1-3-2-1', type: 'task', title: 'Integrate analytics (Plausible/GA)', description: 'Page views, scroll depth, CTA click events.', parentId: 'feature-1-3-2' },
  ] as AIPlanNode[],
}

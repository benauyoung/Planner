'use client'

import { motion } from 'framer-motion'

export default function PrivacyPolicyPage() {
  return (
    <section className="relative min-h-screen pt-32 pb-20">
      <div className="absolute inset-0 pointer-events-none">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage:
              'radial-gradient(ellipse 80% 50% at 50% 30%, hsl(var(--primary) / 0.06) 0%, transparent 70%)',
          }}
        />
      </div>

      <div className="relative max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="text-4xl sm:text-5xl font-bold tracking-tight mb-4">
            Privacy Policy
          </h1>
          <p className="text-sm text-muted-foreground mb-10">
            Last updated: February 20, 2026
          </p>

          <div className="space-y-8 text-muted-foreground leading-relaxed">
            <div>
              <h2 className="text-xl font-semibold text-foreground mb-3">1. Information We Collect</h2>
              <p className="mb-2">When you use TinyBaguette, we may collect:</p>
              <ul className="list-disc pl-6 space-y-1.5">
                <li><strong className="text-foreground">Account information</strong> &mdash; email address and display name when you sign in via Firebase Authentication.</li>
                <li><strong className="text-foreground">Project data</strong> &mdash; plans, nodes, PRDs, prompts, and images you create within the app. This data is stored in Google Firestore or your browser&apos;s localStorage.</li>
                <li><strong className="text-foreground">Usage data</strong> &mdash; basic analytics such as page views and feature interactions collected through Vercel Analytics.</li>
              </ul>
            </div>

            <div>
              <h2 className="text-xl font-semibold text-foreground mb-3">2. How We Use Your Information</h2>
              <ul className="list-disc pl-6 space-y-1.5">
                <li>To provide and maintain the TinyBaguette service.</li>
                <li>To generate AI-powered plans, PRDs, and prompts using Google Gemini. Your project context is sent to the Gemini API for processing but is not stored by Google beyond the request lifecycle.</li>
                <li>To improve the product and user experience.</li>
              </ul>
            </div>

            <div>
              <h2 className="text-xl font-semibold text-foreground mb-3">3. Third-Party Services</h2>
              <p>We rely on the following services:</p>
              <ul className="list-disc pl-6 space-y-1.5 mt-2">
                <li><strong className="text-foreground">Firebase</strong> (Google) &mdash; authentication and Firestore database.</li>
                <li><strong className="text-foreground">Google Gemini</strong> &mdash; AI text generation for plans, PRDs, and prompts.</li>
                <li><strong className="text-foreground">Vercel</strong> &mdash; hosting and edge deployment.</li>
              </ul>
              <p className="mt-2">Each service has its own privacy policy. We encourage you to review them.</p>
            </div>

            <div>
              <h2 className="text-xl font-semibold text-foreground mb-3">4. Data Storage &amp; Security</h2>
              <p>
                Project data is stored in Google Firestore when you are signed in. If Firebase is unavailable, data falls back to your browser&apos;s localStorage. Images uploaded to moodboards are stored as base64 data URLs within your project data. We use HTTPS encryption in transit and rely on Firebase&apos;s security infrastructure for data at rest.
              </p>
            </div>

            <div>
              <h2 className="text-xl font-semibold text-foreground mb-3">5. Your Rights</h2>
              <ul className="list-disc pl-6 space-y-1.5">
                <li><strong className="text-foreground">Export</strong> &mdash; you can export your project data as JSON or Markdown at any time.</li>
                <li><strong className="text-foreground">Deletion</strong> &mdash; you can delete any project from your dashboard. To request full account deletion, contact us at <a href="mailto:hello@tinybaguette.com" className="text-primary hover:underline">hello@tinybaguette.com</a>.</li>
                <li><strong className="text-foreground">Access</strong> &mdash; you can view and download all of your data through the export feature.</li>
              </ul>
            </div>

            <div>
              <h2 className="text-xl font-semibold text-foreground mb-3">6. Cookies</h2>
              <p>
                TinyBaguette uses essential cookies for authentication session management. We do not use advertising or tracking cookies.
              </p>
            </div>

            <div>
              <h2 className="text-xl font-semibold text-foreground mb-3">7. Changes to This Policy</h2>
              <p>
                We may update this policy from time to time. Changes will be posted on this page with an updated revision date.
              </p>
            </div>

            <div>
              <h2 className="text-xl font-semibold text-foreground mb-3">8. Contact</h2>
              <p>
                Questions about this policy? Reach out at{' '}
                <a href="mailto:hello@tinybaguette.com" className="text-primary hover:underline">
                  hello@tinybaguette.com
                </a>.
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}

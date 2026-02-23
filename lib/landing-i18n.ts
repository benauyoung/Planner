export type Lang = 'en' | 'fr'

export const i18n = {
    en: {
        // Nav
        navFeatures: 'Features',
        navLogin: 'Login',
        navGetStarted: 'Get Started',

        // Hero
        heroBadge: '✦ AI-powered · Zero setup',
        heroHeadlineStart: 'Your idea.',
        heroHeadlineAccent: 'Your product.',
        heroHeadlineEnd: 'Built in minutes.',
        heroSubtext:
            'TinyBaguette turns a rough idea into a full project plan, visual design, and deployable AI agent — all from a single prompt.',
        heroCta: 'Start Building Free',
        heroCtaSecondary: 'See how it works',
        heroSocialProof: 'No credit card required · Free forever',

        // Features section header
        featuresSectionBadge: 'Everything you need',
        featuresSectionTitle: 'Plan. Design. Deploy.',
        featuresSectionSubtext:
            'Three powerful pillars that work together — from raw idea to shipped product.',
        featureTabPlanning: 'Planning',
        featureTabDesign: 'Design',
        featureTabAgents: 'Agents',
        featureTabIntegrations: 'Integrations',
        featureDescPlanning: 'Visual project planning with an interactive canvas.',
        featureDescDesign: 'Design and preview your application pages visually.',
        featureDescAgents: 'Create, teach, and deploy an AI chatbot in seconds.',
        featureDescIntegrations: 'Connect Supabase, GitHub, and more in one click.',

        // Hero Prompt (CTA)
        heroPromptHeadline: 'What are you',
        heroPromptHeadlineAccent: 'building?',
        heroPromptSubtext: 'Describe your project and we\'ll generate it.',

        // Trust bar
        trustBarLabel: 'Trusted by makers worldwide',
        trustStat1Value: '500+',
        trustStat1Label: 'Projects planned',
        trustStat2Value: '3',
        trustStat2Label: 'AI pillars',
        trustStat3Value: '< 60s',
        trustStat3Label: 'From idea to plan',
        trustStat4Value: 'Free',
        trustStat4Label: 'To get started',
        trustBadge1: 'Station 8 Developed',
        trustBadge2: 'Pioneers VC Approved',

        // Footer
        footerTagline: 'Transform your project ideas into visual, actionable plans with AI.',
        footerMadeWith: 'Made with ❤️ in Paris',
        footerCopyright: '© {year} TinyBaguette. All rights reserved.',
        footerProduct: 'Product',
        footerCompany: 'Company',
        footerLegal: 'Legal',
        footerFeatures: 'Features',
        footerHowItWorks: 'How It Works',
        footerTemplates: 'Templates',
        footerAbout: 'About',
        footerContact: 'Contact',
        footerPrivacy: 'Privacy Policy',
        footerTerms: 'Terms of Service',

        // Language switcher
        switchToFr: 'FR',
        switchToEn: 'EN',
    },

    fr: {
        // Nav
        navFeatures: 'Fonctionnalités',
        navLogin: 'Connexion',
        navGetStarted: 'Commencer',

        // Hero
        heroBadge: '✦ Propulsé par l\'IA · Prêt en 30 secondes',
        heroHeadlineStart: 'Votre idée.',
        heroHeadlineAccent: 'Votre produit.',
        heroHeadlineEnd: 'En quelques minutes.',
        heroSubtext:
            'TinyBaguette transforme une simple idée en plan de projet complet, design visuel et agent IA déployable — depuis un seul prompt.',
        heroCta: 'Commencer gratuitement',
        heroCtaSecondary: 'Voir comment ça marche',
        heroSocialProof: 'Sans carte bancaire · Gratuit pour toujours',

        // Features section header
        featuresSectionBadge: 'Tout ce dont vous avez besoin',
        featuresSectionTitle: 'Planifier. Designer. Déployer.',
        featuresSectionSubtext:
            'Trois piliers puissants qui fonctionnent ensemble — de l\'idée brute au produit livré.',
        featureTabPlanning: 'Planification',
        featureTabDesign: 'Design',
        featureTabAgents: 'Agents',
        featureTabIntegrations: 'Intégrations',
        featureDescPlanning: 'Planification visuelle avec un canvas interactif.',
        featureDescDesign: 'Concevez et prévisualisez vos pages d\'application.',
        featureDescAgents: 'Créez, entraînez et déployez un chatbot IA en secondes.',
        featureDescIntegrations: 'Connectez Supabase, GitHub et plus en un clic.',

        // Hero Prompt (CTA)
        heroPromptHeadline: 'Qu\'est-ce que vous',
        heroPromptHeadlineAccent: 'construisez ?',
        heroPromptSubtext: 'Décrivez votre projet et nous le générerons.',

        // Trust bar
        trustBarLabel: 'Approuvé par des créateurs partout dans le monde',
        trustStat1Value: '500+',
        trustStat1Label: 'Projets planifiés',
        trustStat2Value: '3',
        trustStat2Label: 'Piliers IA',
        trustStat3Value: '< 60s',
        trustStat3Label: 'De l\'idée au plan',
        trustStat4Value: 'Gratuit',
        trustStat4Label: 'Pour commencer',
        trustBadge1: 'Développé par Station 8',
        trustBadge2: 'Approuvé par Pioneers VC',

        // Footer
        footerTagline: 'Transformez vos idées en plans visuels et actionnables grâce à l\'IA.',
        footerMadeWith: 'Fait avec ❤️ à Paris',
        footerCopyright: '© {year} TinyBaguette. Tous droits réservés.',
        footerProduct: 'Produit',
        footerCompany: 'Entreprise',
        footerLegal: 'Légal',
        footerFeatures: 'Fonctionnalités',
        footerHowItWorks: 'Comment ça marche',
        footerTemplates: 'Modèles',
        footerAbout: 'À propos',
        footerContact: 'Contact',
        footerPrivacy: 'Politique de confidentialité',
        footerTerms: 'Conditions d\'utilisation',

        // Language switcher
        switchToFr: 'FR',
        switchToEn: 'EN',
    },
} satisfies Record<Lang, Record<string, string>>

export type I18nStrings = typeof i18n['en']

export function t(lang: Lang | undefined, key: keyof I18nStrings): string {
    return i18n[lang ?? 'en'][key]
}

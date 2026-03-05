export type Lang = 'en' | 'fr'

export const i18n = {
    en: {
        // Nav
        navFeatures: 'Features',
        navLogin: 'Login',
        navGetStarted: 'Get Started',

        // Nav email capture
        navComingSoon: 'Coming soon!',
        navEmailPrompt: 'Leave your email and we\'ll notify you when TinyBaguette launches.',
        navNotifyMe: 'Notify Me',
        navJoining: 'Joining...',
        navNoSpam: 'No spam, ever.',
        navOnList: 'You\'re on the list!',
        navWillNotify: 'We\'ll let you know when TinyBaguette is ready.',
        navMobileComingSoon: 'Coming soon -- get notified:',
        navEmailError: 'Please enter a valid email.',
        navSomethingWrong: 'Something went wrong. Please try again.',

        // Hero
        heroBadge: '✦ AI-powered · Zero setup',
        heroHeadlineStart: 'Your idea.',
        heroHeadlineAccent: 'Your product.',
        heroHeadlineEnd: 'Built in minutes.',
        heroSubtext:
            'TinyBaguette turns a rough idea into a full project plan, visual design, and deployable AI agent -- all from a single prompt.',
        heroCta: 'Start Building Free',
        heroCtaSecondary: 'See how it works',
        heroSocialProof: 'No credit card required · Free forever',

        // Features section header
        featuresSectionBadge: 'Everything you need',
        featuresSectionTitle: 'Plan. Design. Deploy.',
        featuresSectionSubtext:
            'Three powerful pillars that work together -- from raw idea to shipped product.',
        featureTabPlanning: 'Planning',
        featureTabDesign: 'Design',
        featureTabAgents: 'Agents',
        featureTabIntegrations: 'Integrations',
        featureDescPlanning: 'Visual project planning with an interactive canvas.',
        featureDescDesign: 'Design and preview your application pages. Edit content and layout visually.',
        featureDescAgents: 'Create, teach, and deploy an AI chatbot to your website in seconds.',
        featureDescIntegrations: 'Connect your favorite tools in one click. Supabase, GitHub, and more.',

        // Features tabs section
        ftBigIdeas: 'Big Ideas.',
        ftPlanInMinutes: 'Plan your project in minutes.',
        ftTryItFree: 'Try It Free',

        // Features demo UI strings
        ftAiPlanner: 'AI Planner',
        ftAskAiPlanner: 'Ask the AI planner...',
        ftAskAiEditPages: 'Ask AI to edit your pages...',
        ftAgentBuilder: 'Agent Builder',
        ftName: 'Name',
        ftGreeting: 'Greeting',
        ftKnowledge: 'Knowledge',
        ftEnterBotName: 'Enter bot name...',
        ftEnterGreeting: 'Enter greeting message...',
        ftDeployToWebsite: 'Deploy to Website',
        ftDeployingToWebsite: 'Deploying to website...',
        ftDeployedTo: 'Deployed to vibefest.com',
        ftLive: 'Live',
        ftOnline: 'Online',
        ftPreview: 'Preview',
        ftBotName: 'Bot Name',
        ftTypeMessage: 'Type a message...',
        ftIntegrations: 'Integrations',
        ftConnected: 'connected',
        ftConnect: 'Connect',
        ftSyncActivity: 'Sync Activity',
        ftJustNow: 'just now',
        ftAllSynced: 'All integrations synced',
        ftOneConnected: '1 integration connected',
        ftWaitingConnections: 'Waiting for connections...',
        ftEditing: 'Editing',

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

        // Social proof strip
        spAiNative: 'AI native',
        spBuiltForYou: 'Built for you',
        spInMinutes: 'In minutes',

        // Footer
        footerTagline: 'Transform your project ideas into visual, actionable plans with AI.',
        footerMadeWith: 'Made with love',
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

        // Baguette footer
        bfTagline: 'Paris · Made with love · 2026',
        bfCopyright: '© 2026 TinyBaguette. All rights reserved.',

        // Planning playground
        ppTryItNow: 'Try it now -- free',
        ppStartPlanning: 'Start planning',
        ppYourProject: 'your project',
        ppDescribeIdea: 'Describe your idea and watch it transform into an interactive project plan.',
        ppPlan: 'Plan',
        ppPressEnterToPlan: 'to plan',
        ppShiftEnterNewLine: 'for new line',
        ppBuildingPlan: 'Building your project plan...',
        ppPlanGenerated: 'Plan Generated',
        ppExploreYourPlan: 'Explore your plan. Click nodes, answer questions, and add new items to build it out.',
        ppContinuePlanning: 'Continue Planning',
        ppClickNodeExplore: 'Click any node to explore · Answer questions and add nodes to build your plan',
        ppNodes: 'nodes',
        ppActions: 'actions',
        ppParent: 'Parent',
        ppChildren: 'Children',
        ppAdd: 'Add',
        ppPlanningQuestions: 'Planning Questions',
        ppAnswerSaved: 'Answer saved',
        ppWantToRefine: 'Want to refine this plan?',
        ppSignUpHint: 'Sign up to get AI-powered suggestions, drag-and-drop editing, and PRD generation.',
        ppYoureOnARoll: 'You\'re on a roll!',
        ppEnterEmailKeepBuilding: 'Enter your email to keep building',
        ppWithFullCanvas: 'with the full planning canvas, AI tools, and more.',
        ppContinuePlanningBtn: 'Continue Planning',
        ppJoiningEllipsis: 'Joining...',
        ppNoCreditCard: 'No credit card required',
        ppKeepBuilding: 'Keep building!',
        ppEnterEmailAccess: 'Enter your email to access the full canvas for',
        ppWithAiTools: 'with AI tools, drag-and-drop editing, and more.',
        ppGetStartedFree: 'Get Started Free',
        ppBackToPlan: 'Back to plan',
        ppYoureIn: 'You\'re in!',
        ppWellSendAccess: 'We\'ll send you access to continue building',
        ppWithFullPlanningCanvas: 'with the full planning canvas.',
        ppPlanAnother: 'Plan another project',

        // Planning playground: type labels
        ppGoal: 'Goal',
        ppSubgoal: 'Subgoal',
        ppFeature: 'Feature',
        ppTask: 'Task',

        // Planning playground: status labels
        ppNotStarted: 'Not started',
        ppInProgress: 'In progress',
        ppCompleted: 'Completed',

        // Planning playground: loading steps
        ppLoadingStep1: 'Analyzing your idea...',
        ppLoadingStep2: 'Designing the structure...',
        ppLoadingStep3: 'Building your plan...',
        ppLoadingStep4: 'Organizing nodes...',

        // Planning playground: placeholder ideas
        ppPlaceholder1: 'A recipe sharing platform with AI meal planning...',
        ppPlaceholder2: 'An online marketplace for handmade crafts...',
        ppPlaceholder3: 'A fitness app that tracks workouts and nutrition...',
        ppPlaceholder4: 'A community platform for language learners...',
        ppPlaceholder5: 'A portfolio builder for creative professionals...',

        // Planning playground: example chips
        ppChip1: 'Online Boutique',
        ppChip2: 'Fitness App',
        ppChip3: 'Recipe Platform',
        ppChip4: 'Portfolio Site',
        ppChip5: 'Learning Hub',

        // Planning playground: chip prompt template
        ppChipPrompt: 'Build a {chip} with user accounts, a dashboard, and core features.',

        // Waitlist capture
        wcThanks: 'Thanks! We\'ll keep you in the loop.',
        wcDropEmail: 'Want to hear more? Drop your email below.',
        wcNotifyMe: 'Notify Me',
        wcInvalidEmail: 'Please enter a valid email address.',

        // Contact page
        contactTitle: 'Get in Touch',
        contactSubtext: 'Have a question, feedback, or just want to say hi? Drop us an email.',

        // Language switcher
        switchToFr: 'FR',
        switchToEn: 'EN',
    },

    fr: {
        // Nav
        navFeatures: 'Fonctionnalites',
        navLogin: 'Connexion',
        navGetStarted: 'Commencer',

        // Nav email capture
        navComingSoon: 'Bientot disponible !',
        navEmailPrompt: 'Laissez votre email et nous vous notifierons au lancement de TinyBaguette.',
        navNotifyMe: 'Me notifier',
        navJoining: 'Inscription...',
        navNoSpam: 'Pas de spam, jamais.',
        navOnList: 'Vous etes inscrit !',
        navWillNotify: 'Nous vous contacterons quand TinyBaguette sera pret.',
        navMobileComingSoon: 'Bientot disponible -- soyez notifie :',
        navEmailError: 'Veuillez entrer un email valide.',
        navSomethingWrong: 'Une erreur est survenue. Veuillez reessayer.',

        // Hero
        heroBadge: '✦ Propulse par l\'IA · Pret en 30 secondes',
        heroHeadlineStart: 'Votre idee.',
        heroHeadlineAccent: 'Votre produit.',
        heroHeadlineEnd: 'En quelques minutes.',
        heroSubtext:
            'TinyBaguette transforme une simple idee en plan de projet complet, design visuel et agent IA deployable -- depuis un seul prompt.',
        heroCta: 'Commencer gratuitement',
        heroCtaSecondary: 'Voir comment ca marche',
        heroSocialProof: 'Sans carte bancaire · Gratuit pour toujours',

        // Features section header
        featuresSectionBadge: 'Tout ce dont vous avez besoin',
        featuresSectionTitle: 'Planifier. Designer. Deployer.',
        featuresSectionSubtext:
            'Trois piliers puissants qui fonctionnent ensemble -- de l\'idee brute au produit livre.',
        featureTabPlanning: 'Planification',
        featureTabDesign: 'Design',
        featureTabAgents: 'Agents',
        featureTabIntegrations: 'Integrations',
        featureDescPlanning: 'Planification visuelle avec un canvas interactif.',
        featureDescDesign: 'Concevez et previsualisez vos pages d\'application.',
        featureDescAgents: 'Creez, entrainez et deployez un chatbot IA en secondes.',
        featureDescIntegrations: 'Connectez Supabase, GitHub et plus en un clic.',

        // Features tabs section
        ftBigIdeas: 'Grandes idees.',
        ftPlanInMinutes: 'Planifiez votre projet en quelques minutes.',
        ftTryItFree: 'Essayez gratuitement',

        // Features demo UI strings
        ftAiPlanner: 'Planificateur IA',
        ftAskAiPlanner: 'Demandez au planificateur IA...',
        ftAskAiEditPages: 'Demandez a l\'IA de modifier vos pages...',
        ftAgentBuilder: 'Createur d\'agent',
        ftName: 'Nom',
        ftGreeting: 'Message d\'accueil',
        ftKnowledge: 'Connaissances',
        ftEnterBotName: 'Nom du bot...',
        ftEnterGreeting: 'Message d\'accueil...',
        ftDeployToWebsite: 'Deployer sur le site',
        ftDeployingToWebsite: 'Deploiement en cours...',
        ftDeployedTo: 'Deploye sur vibefest.com',
        ftLive: 'En ligne',
        ftOnline: 'En ligne',
        ftPreview: 'Apercu',
        ftBotName: 'Nom du bot',
        ftTypeMessage: 'Ecrire un message...',
        ftIntegrations: 'Integrations',
        ftConnected: 'connecte(s)',
        ftConnect: 'Connecter',
        ftSyncActivity: 'Activite de synchro',
        ftJustNow: 'a l\'instant',
        ftAllSynced: 'Toutes les integrations synchronisees',
        ftOneConnected: '1 integration connectee',
        ftWaitingConnections: 'En attente de connexions...',
        ftEditing: 'Edition',

        // Hero Prompt (CTA)
        heroPromptHeadline: 'Qu\'est-ce que vous',
        heroPromptHeadlineAccent: 'construisez ?',
        heroPromptSubtext: 'Decrivez votre projet et nous le genererons.',

        // Trust bar
        trustBarLabel: 'Approuve par des createurs partout dans le monde',
        trustStat1Value: '500+',
        trustStat1Label: 'Projets planifies',
        trustStat2Value: '3',
        trustStat2Label: 'Piliers IA',
        trustStat3Value: '< 60s',
        trustStat3Label: 'De l\'idee au plan',
        trustStat4Value: 'Gratuit',
        trustStat4Label: 'Pour commencer',
        trustBadge1: 'Developpe par Station 8',
        trustBadge2: 'Approuve par Pioneers VC',

        // Social proof strip
        spAiNative: 'IA native',
        spBuiltForYou: 'Pense pour vous',
        spInMinutes: 'En quelques minutes',

        // Footer
        footerTagline: 'Transformez vos idees en plans visuels et actionnables grace a l\'IA.',
        footerMadeWith: 'Fait avec amour',
        footerCopyright: '© {year} TinyBaguette. Tous droits reserves.',
        footerProduct: 'Produit',
        footerCompany: 'Entreprise',
        footerLegal: 'Legal',
        footerFeatures: 'Fonctionnalites',
        footerHowItWorks: 'Comment ca marche',
        footerTemplates: 'Modeles',
        footerAbout: 'A propos',
        footerContact: 'Contact',
        footerPrivacy: 'Politique de confidentialite',
        footerTerms: 'Conditions d\'utilisation',

        // Baguette footer
        bfTagline: 'Paris · Fait avec amour · 2026',
        bfCopyright: '© 2026 TinyBaguette. Tous droits reserves.',

        // Planning playground
        ppTryItNow: 'Essayez maintenant -- gratuit',
        ppStartPlanning: 'Commencez a planifier',
        ppYourProject: 'votre projet',
        ppDescribeIdea: 'Decrivez votre idee et regardez-la se transformer en plan de projet interactif.',
        ppPlan: 'Planifier',
        ppPressEnterToPlan: 'pour planifier',
        ppShiftEnterNewLine: 'pour un retour a la ligne',
        ppBuildingPlan: 'Construction de votre plan de projet...',
        ppPlanGenerated: 'Plan genere',
        ppExploreYourPlan: 'Explorez votre plan. Cliquez sur les noeuds, repondez aux questions et ajoutez des elements.',
        ppContinuePlanning: 'Continuer la planification',
        ppClickNodeExplore: 'Cliquez sur un noeud pour explorer · Repondez aux questions et ajoutez des noeuds',
        ppNodes: 'noeuds',
        ppActions: 'actions',
        ppParent: 'Parent',
        ppChildren: 'Enfants',
        ppAdd: 'Ajouter',
        ppPlanningQuestions: 'Questions de planification',
        ppAnswerSaved: 'Reponse enregistree',
        ppWantToRefine: 'Vous voulez affiner ce plan ?',
        ppSignUpHint: 'Inscrivez-vous pour des suggestions IA, l\'edition par glisser-deposer et la generation de PRD.',
        ppYoureOnARoll: 'Vous etes lance !',
        ppEnterEmailKeepBuilding: 'Entrez votre email pour continuer a construire',
        ppWithFullCanvas: 'avec le canvas complet, les outils IA et plus encore.',
        ppContinuePlanningBtn: 'Continuer la planification',
        ppJoiningEllipsis: 'Inscription...',
        ppNoCreditCard: 'Sans carte bancaire',
        ppKeepBuilding: 'Continuez a construire !',
        ppEnterEmailAccess: 'Entrez votre email pour acceder au canvas complet pour',
        ppWithAiTools: 'avec les outils IA, l\'edition par glisser-deposer et plus encore.',
        ppGetStartedFree: 'Commencer gratuitement',
        ppBackToPlan: 'Retour au plan',
        ppYoureIn: 'C\'est fait !',
        ppWellSendAccess: 'Nous vous enverrons un acces pour continuer a construire',
        ppWithFullPlanningCanvas: 'avec le canvas de planification complet.',
        ppPlanAnother: 'Planifier un autre projet',

        // Planning playground: type labels
        ppGoal: 'Objectif',
        ppSubgoal: 'Sous-objectif',
        ppFeature: 'Fonctionnalite',
        ppTask: 'Tache',

        // Planning playground: status labels
        ppNotStarted: 'Non commence',
        ppInProgress: 'En cours',
        ppCompleted: 'Termine',

        // Planning playground: loading steps
        ppLoadingStep1: 'Analyse de votre idee...',
        ppLoadingStep2: 'Conception de la structure...',
        ppLoadingStep3: 'Construction de votre plan...',
        ppLoadingStep4: 'Organisation des noeuds...',

        // Planning playground: placeholder ideas
        ppPlaceholder1: 'Une plateforme de partage de recettes avec planification de repas IA...',
        ppPlaceholder2: 'Une marketplace en ligne pour l\'artisanat fait main...',
        ppPlaceholder3: 'Une appli fitness qui suit les entrainements et la nutrition...',
        ppPlaceholder4: 'Une plateforme communautaire pour les apprenants en langues...',
        ppPlaceholder5: 'Un createur de portfolio pour les professionnels creatifs...',

        // Planning playground: example chips
        ppChip1: 'Boutique en ligne',
        ppChip2: 'Appli fitness',
        ppChip3: 'Plateforme recettes',
        ppChip4: 'Site portfolio',
        ppChip5: 'Hub d\'apprentissage',

        // Planning playground: chip prompt template
        ppChipPrompt: 'Construire une {chip} avec des comptes utilisateurs, un tableau de bord et les fonctionnalites principales.',

        // Waitlist capture
        wcThanks: 'Merci ! Nous vous tiendrons au courant.',
        wcDropEmail: 'Envie d\'en savoir plus ? Laissez votre email ci-dessous.',
        wcNotifyMe: 'Me notifier',
        wcInvalidEmail: 'Veuillez entrer une adresse email valide.',

        // Contact page
        contactTitle: 'Contactez-nous',
        contactSubtext: 'Une question, un retour ou juste envie de dire bonjour ? Envoyez-nous un email.',

        // Language switcher
        switchToFr: 'FR',
        switchToEn: 'EN',
    },
} satisfies Record<Lang, Record<string, string>>

export type I18nStrings = typeof i18n['en']

export function t(lang: Lang | undefined, key: keyof I18nStrings): string {
    return i18n[lang ?? 'en'][key]
}

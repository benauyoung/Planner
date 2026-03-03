import { SchemaType, type Schema } from '@google/generative-ai'

export const featureSuggestionsSchema: Schema = {
  type: SchemaType.OBJECT,
  properties: {
    features: {
      type: SchemaType.ARRAY,
      description: 'Suggested features for the project (8-12)',
      items: {
        type: SchemaType.STRING,
        description: 'A concise feature name (2-5 words)',
      },
    },
    tailoredQuestions: {
      type: SchemaType.ARRAY,
      description: '2-4 tailored follow-up questions for planning this project',
      items: {
        type: SchemaType.OBJECT,
        properties: {
          id: {
            type: SchemaType.STRING,
            description: 'Unique identifier for the question (e.g. "q1", "q2")',
          },
          question: {
            type: SchemaType.STRING,
            description: 'The question to ask (short, clear)',
          },
          subtitle: {
            type: SchemaType.STRING,
            description: 'Brief context for why this question matters',
          },
          type: {
            type: SchemaType.STRING,
            description: 'Question type: "single" for single-select, "multi" for multi-select',
            enum: ['single', 'multi'],
          },
          options: {
            type: SchemaType.ARRAY,
            description: '3-5 answer options',
            items: {
              type: SchemaType.OBJECT,
              properties: {
                label: {
                  type: SchemaType.STRING,
                  description: 'Option text (2-4 words)',
                },
                icon: {
                  type: SchemaType.STRING,
                  description: 'Lucide icon name (e.g. "User", "Zap", "Globe", "Shield")',
                },
              },
              required: ['label', 'icon'],
            },
          },
        },
        required: ['id', 'question', 'subtitle', 'type', 'options'],
      },
    },
  },
  required: ['features', 'tailoredQuestions'],
}

export interface TailoredQuestion {
  id: string
  question: string
  subtitle: string
  type: 'single' | 'multi'
  options: { label: string; icon: string }[]
}

export interface FeatureSuggestionsResponse {
  features: string[]
  tailoredQuestions: TailoredQuestion[]
}

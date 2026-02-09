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
  },
  required: ['features'],
}

export interface FeatureSuggestionsResponse {
  features: string[]
}

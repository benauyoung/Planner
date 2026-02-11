import {
  GoogleGenerativeAI,
  SchemaType,
  type Schema,
} from '@google/generative-ai'

let client: GoogleGenerativeAI | null = null

export function getGeminiClient(): GoogleGenerativeAI {
  if (!client) {
    const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY
    if (!apiKey) throw new Error('NEXT_PUBLIC_GEMINI_API_KEY is not set')
    client = new GoogleGenerativeAI(apiKey)
  }
  return client
}

export const progressiveChatSchema: Schema = {
  type: SchemaType.OBJECT,
  properties: {
    message: { type: SchemaType.STRING, description: 'Conversational AI response message' },
    nodes: {
      type: SchemaType.ARRAY,
      description: 'Plan nodes to add or update in the visual graph',
      items: {
        type: SchemaType.OBJECT,
        properties: {
          id: { type: SchemaType.STRING, description: 'Unique node ID (e.g. goal-1, subgoal-1-1)' },
          type: {
            type: SchemaType.STRING,
            enum: ['goal', 'subgoal', 'feature', 'task'],
            description: 'Node type in the hierarchy',
          },
          title: { type: SchemaType.STRING, description: 'Node title' },
          description: { type: SchemaType.STRING, description: 'Node description (1-2 sentences)' },
          parentId: {
            type: SchemaType.STRING,
            description: 'Parent node ID, null for root goals',
            nullable: true,
          },
          questions: {
            type: SchemaType.ARRAY,
            description: 'Decision-oriented multiple-choice questions for this node (2-4 for features/tasks, 0-1 for goals/subgoals)',
            items: {
              type: SchemaType.OBJECT,
              properties: {
                question: { type: SchemaType.STRING, description: 'A specific, decision-oriented question' },
                options: {
                  type: SchemaType.ARRAY,
                  description: '3-5 multiple-choice options for this question',
                  items: { type: SchemaType.STRING },
                },
              },
              required: ['question', 'options'],
            },
          },
        },
        required: ['id', 'type', 'title', 'description', 'parentId'],
      },
    },
    suggestedTitle: {
      type: SchemaType.STRING,
      description: 'Suggested project title, provided once the project idea is clear',
      nullable: true,
    },
    done: {
      type: SchemaType.BOOLEAN,
      description: 'True when the plan is comprehensive enough (30-60 nodes with good coverage)',
    },
  },
  required: ['message', 'nodes', 'done'],
}

export const questionGenerationSchema: Schema = {
  type: SchemaType.OBJECT,
  properties: {
    questions: {
      type: SchemaType.ARRAY,
      description: 'Multiple-choice questions to refine scope and requirements',
      items: {
        type: SchemaType.OBJECT,
        properties: {
          question: { type: SchemaType.STRING, description: 'A decision-oriented question' },
          options: {
            type: SchemaType.ARRAY,
            description: '3-5 concrete answer options',
            items: { type: SchemaType.STRING },
          },
        },
        required: ['question', 'options'],
      },
    },
  },
  required: ['questions'],
}

export const prdGenerationSchema: Schema = {
  type: SchemaType.OBJECT,
  properties: {
    title: { type: SchemaType.STRING, description: 'Short descriptive title for the PRD' },
    content: { type: SchemaType.STRING, description: 'Full PRD content in markdown format' },
  },
  required: ['title', 'content'],
}

export const promptGenerationSchema: Schema = {
  type: SchemaType.OBJECT,
  properties: {
    title: { type: SchemaType.STRING, description: 'Short descriptive title for the prompt' },
    content: { type: SchemaType.STRING, description: 'Full implementation prompt in markdown format' },
  },
  required: ['title', 'content'],
}

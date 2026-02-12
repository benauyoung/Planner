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

export const suggestionSchema: Schema = {
  type: SchemaType.OBJECT,
  properties: {
    suggestions: {
      type: SchemaType.ARRAY,
      description: 'List of proactive suggestions to improve the project plan',
      items: {
        type: SchemaType.OBJECT,
        properties: {
          type: {
            type: SchemaType.STRING,
            enum: ['missing_testing', 'orphan_nodes', 'bottleneck', 'stale_items', 'unbalanced_workload', 'missing_dependencies', 'estimation_gap', 'missing_subtasks', 'risk'],
            description: 'Category of suggestion',
          },
          title: { type: SchemaType.STRING, description: 'Short actionable title' },
          description: { type: SchemaType.STRING, description: '1-2 sentence explanation' },
          nodeIds: {
            type: SchemaType.ARRAY,
            description: 'IDs of affected nodes',
            items: { type: SchemaType.STRING },
          },
          severity: {
            type: SchemaType.STRING,
            enum: ['high', 'medium', 'low'],
            description: 'How important this suggestion is',
          },
          action: {
            type: SchemaType.STRING,
            description: 'Specific action to take',
            nullable: true,
          },
        },
        required: ['type', 'title', 'description', 'nodeIds', 'severity'],
      },
    },
  },
  required: ['suggestions'],
}

export const iterationSchema: Schema = {
  type: SchemaType.OBJECT,
  properties: {
    message: { type: SchemaType.STRING, description: 'Brief explanation of what the AI did' },
    suggestions: {
      type: SchemaType.ARRAY,
      description: 'List of suggested changes to the plan',
      items: {
        type: SchemaType.OBJECT,
        properties: {
          id: { type: SchemaType.STRING, description: 'Unique suggestion ID' },
          type: {
            type: SchemaType.STRING,
            enum: ['add_node', 'update_node', 'delete_node', 'add_edge', 'estimate'],
            description: 'Type of change suggested',
          },
          targetNodeId: {
            type: SchemaType.STRING,
            description: 'ID of the node being modified (for update/delete/estimate)',
            nullable: true,
          },
          node: {
            type: SchemaType.OBJECT,
            description: 'Node data (for add_node and update_node)',
            nullable: true,
            properties: {
              id: { type: SchemaType.STRING },
              type: {
                type: SchemaType.STRING,
                enum: ['goal', 'subgoal', 'feature', 'task'],
              },
              title: { type: SchemaType.STRING },
              description: { type: SchemaType.STRING },
              parentId: { type: SchemaType.STRING, nullable: true },
            },
            required: ['id', 'type', 'title', 'description', 'parentId'],
          },
          edge: {
            type: SchemaType.OBJECT,
            description: 'Edge data (for add_edge)',
            nullable: true,
            properties: {
              source: { type: SchemaType.STRING },
              target: { type: SchemaType.STRING },
              edgeType: { type: SchemaType.STRING, enum: ['blocks', 'depends_on'] },
            },
            required: ['source', 'target', 'edgeType'],
          },
          estimatedHours: {
            type: SchemaType.NUMBER,
            description: 'Estimated hours (for estimate type)',
            nullable: true,
          },
          reason: { type: SchemaType.STRING, description: 'Why this change is suggested' },
          confidence: { type: SchemaType.NUMBER, description: 'Confidence 0.0-1.0' },
        },
        required: ['id', 'type', 'reason', 'confidence'],
      },
    },
  },
  required: ['message', 'suggestions'],
}

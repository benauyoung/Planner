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

export const refinementChatSchema: Schema = {
  type: SchemaType.OBJECT,
  properties: {
    message: { type: SchemaType.STRING, description: 'Brief analysis of what was understood and what needs clarification' },
    questions: {
      type: SchemaType.ARRAY,
      description: 'Clarifying questions tailored to the specific project described — must reference the project domain, features, and terminology',
      items: {
        type: SchemaType.OBJECT,
        properties: {
          id: { type: SchemaType.STRING, description: 'Unique question ID (e.g. q1, q2)' },
          question: { type: SchemaType.STRING, description: 'A project-specific, decision-oriented question using the domain language from the user prompt' },
          options: {
            type: SchemaType.ARRAY,
            description: '3-5 concrete answer options specific to the project domain',
            items: { type: SchemaType.STRING },
          },
          category: {
            type: SchemaType.STRING,
            enum: ['scope', 'technical', 'priority', 'audience', 'timeline'],
            description: 'Question category',
          },
        },
        required: ['id', 'question', 'options', 'category'],
      },
    },
    readyToBuild: {
      type: SchemaType.BOOLEAN,
      description: 'True when enough context has been gathered to build the plan',
    },
    suggestedTitle: {
      type: SchemaType.STRING,
      description: 'Suggested project title if clear enough, null otherwise',
      nullable: true,
    },
  },
  required: ['message', 'questions', 'readyToBuild'],
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
          category: { type: SchemaType.STRING, description: 'Category this question belongs to (e.g. "Technical Approach", "Data Model")' },
        },
        required: ['question', 'options', 'category'],
      },
    },
  },
  required: ['questions'],
}

export const followUpGenerationSchema: Schema = {
  type: SchemaType.OBJECT,
  properties: {
    questions: {
      type: SchemaType.ARRAY,
      description: 'Targeted follow-up questions based on previous answers',
      items: {
        type: SchemaType.OBJECT,
        properties: {
          question: { type: SchemaType.STRING, description: 'A targeted follow-up question' },
          options: {
            type: SchemaType.ARRAY,
            description: '3-5 concrete answer options',
            items: { type: SchemaType.STRING },
          },
          category: { type: SchemaType.STRING, description: 'Category this question belongs to' },
          followUpForId: { type: SchemaType.STRING, description: 'ID of the previous question this follows up on' },
        },
        required: ['question', 'options', 'category', 'followUpForId'],
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
    referencedPrdIds: {
      type: SchemaType.ARRAY,
      description: 'Compound keys of related PRDs referenced in this PRD (format: "nodeId:prdId")',
      items: { type: SchemaType.STRING },
    },
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

export const pageGenerationSchema: Schema = {
  type: SchemaType.OBJECT,
  properties: {
    designSystem: { type: SchemaType.STRING, description: 'Brief description of the chosen design direction' },
    pages: {
      type: SchemaType.ARRAY,
      description: 'Generated page previews',
      items: {
        type: SchemaType.OBJECT,
        properties: {
          id: { type: SchemaType.STRING, description: 'Unique page identifier (e.g. page-dashboard)' },
          title: { type: SchemaType.STRING, description: 'Page name' },
          route: { type: SchemaType.STRING, description: 'Suggested route path' },
          html: { type: SchemaType.STRING, description: 'Complete HTML body content with Tailwind CSS classes' },
          linkedNodeIds: {
            type: SchemaType.ARRAY,
            description: 'Project node IDs this page relates to',
            items: { type: SchemaType.STRING },
          },
        },
        required: ['id', 'title', 'route', 'html', 'linkedNodeIds'],
      },
    },
    edges: {
      type: SchemaType.ARRAY,
      description: 'Navigation flow edges between pages',
      items: {
        type: SchemaType.OBJECT,
        properties: {
          source: { type: SchemaType.STRING, description: 'Source page ID' },
          target: { type: SchemaType.STRING, description: 'Target page ID' },
          label: { type: SchemaType.STRING, description: 'Navigation action label' },
        },
        required: ['source', 'target', 'label'],
      },
    },
  },
  required: ['designSystem', 'pages', 'edges'],
}

export const pageEditSchema: Schema = {
  type: SchemaType.OBJECT,
  properties: {
    html: { type: SchemaType.STRING, description: 'Updated complete HTML body content with Tailwind CSS classes' },
    summary: { type: SchemaType.STRING, description: 'Brief summary of what was changed' },
  },
  required: ['html', 'summary'],
}

export const backendGenerationSchema: Schema = {
  type: SchemaType.OBJECT,
  properties: {
    architecture: { type: SchemaType.STRING, description: 'Brief summary of the backend architecture and tech choices' },
    modules: {
      type: SchemaType.ARRAY,
      description: 'Backend architecture modules',
      items: {
        type: SchemaType.OBJECT,
        properties: {
          id: { type: SchemaType.STRING, description: 'Unique module identifier (e.g. mod-users-endpoint)' },
          type: {
            type: SchemaType.STRING,
            enum: ['endpoint', 'model', 'service', 'middleware', 'database', 'auth', 'config'],
            description: 'Module type',
          },
          title: { type: SchemaType.STRING, description: 'Module name' },
          description: { type: SchemaType.STRING, description: 'What this module does' },
          code: { type: SchemaType.STRING, description: 'TypeScript code for this module' },
          linkedNodeIds: {
            type: SchemaType.ARRAY,
            description: 'Project node IDs this module relates to',
            items: { type: SchemaType.STRING },
          },
          method: {
            type: SchemaType.STRING,
            enum: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
            description: 'HTTP method (endpoints only)',
            nullable: true,
          },
          path: { type: SchemaType.STRING, description: 'Route path (endpoints only)', nullable: true },
          fields: {
            type: SchemaType.ARRAY,
            description: 'Data model fields (models only)',
            nullable: true,
            items: {
              type: SchemaType.OBJECT,
              properties: {
                name: { type: SchemaType.STRING },
                type: { type: SchemaType.STRING },
                required: { type: SchemaType.BOOLEAN },
              },
              required: ['name', 'type', 'required'],
            },
          },
        },
        required: ['id', 'type', 'title', 'description', 'code', 'linkedNodeIds'],
      },
    },
    edges: {
      type: SchemaType.ARRAY,
      description: 'Relationships between modules',
      items: {
        type: SchemaType.OBJECT,
        properties: {
          source: { type: SchemaType.STRING, description: 'Source module ID' },
          target: { type: SchemaType.STRING, description: 'Target module ID' },
          label: { type: SchemaType.STRING, description: 'Relationship label' },
          edgeType: {
            type: SchemaType.STRING,
            enum: ['uses', 'returns', 'stores', 'middleware', 'depends_on'],
            description: 'Type of relationship',
          },
        },
        required: ['source', 'target', 'label', 'edgeType'],
      },
    },
  },
  required: ['architecture', 'modules', 'edges'],
}

export const backendEditSchema: Schema = {
  type: SchemaType.OBJECT,
  properties: {
    code: { type: SchemaType.STRING, description: 'Updated complete TypeScript code for the module' },
    summary: { type: SchemaType.STRING, description: 'Brief summary of what was changed' },
  },
  required: ['code', 'summary'],
}

export const agentGenerationSchema: Schema = {
  type: SchemaType.OBJECT,
  properties: {
    name: { type: SchemaType.STRING, description: 'Agent display name' },
    description: { type: SchemaType.STRING, description: 'Brief description of the agent purpose' },
    persona: { type: SchemaType.STRING, description: 'Agent personality and role description' },
    greeting: { type: SchemaType.STRING, description: 'First message shown to visitors' },
    systemPrompt: { type: SchemaType.STRING, description: 'Detailed system prompt that defines agent behavior (200-400 words)' },
    knowledge: {
      type: SchemaType.ARRAY,
      description: 'Sample knowledge entries for the agent',
      items: {
        type: SchemaType.OBJECT,
        properties: {
          type: { type: SchemaType.STRING, enum: ['text', 'faq'], description: 'Knowledge entry type' },
          title: { type: SchemaType.STRING, description: 'Entry title or question' },
          content: { type: SchemaType.STRING, description: 'Entry content or answer' },
        },
        required: ['type', 'title', 'content'],
      },
    },
    rules: {
      type: SchemaType.ARRAY,
      description: 'Behavior rules and guardrails',
      items: { type: SchemaType.STRING },
    },
  },
  required: ['name', 'description', 'persona', 'greeting', 'systemPrompt', 'knowledge', 'rules'],
}

export const agentChatSchema: Schema = {
  type: SchemaType.OBJECT,
  properties: {
    message: { type: SchemaType.STRING, description: 'The agent response message' },
    actions: {
      type: SchemaType.ARRAY,
      description: 'Optional actions triggered by the response',
      nullable: true,
      items: {
        type: SchemaType.OBJECT,
        properties: {
          type: { type: SchemaType.STRING, enum: ['collect_info', 'redirect', 'show_card'], description: 'Action type' },
          label: { type: SchemaType.STRING, description: 'Action label' },
          data: { type: SchemaType.STRING, description: 'Action data (URL, field name, etc.)', nullable: true },
        },
        required: ['type', 'label'],
      },
    },
  },
  required: ['message'],
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

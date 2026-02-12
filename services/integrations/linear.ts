/**
 * Linear integration service.
 * Bidirectional sync: VisionPath tasks ↔ Linear issues.
 *
 * Requires a Linear API key.
 * Set via integration settings in the app.
 */

import type { PlanNode } from '@/types/project'

interface LinearIssueInput {
  title: string
  description?: string
  teamId: string
  priority?: number
  labelIds?: string[]
}

interface LinearIssueResponse {
  id: string
  identifier: string
  title: string
  url: string
  state: { name: string }
  priority: number
}

const LINEAR_API = 'https://api.linear.app/graphql'

async function linearQuery(
  apiKey: string,
  query: string,
  variables?: Record<string, unknown>
): Promise<unknown> {
  const res = await fetch(LINEAR_API, {
    method: 'POST',
    headers: {
      Authorization: apiKey,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ query, variables }),
  })

  if (!res.ok) {
    throw new Error(`Linear API error (${res.status})`)
  }

  const data = await res.json()
  if (data.errors) {
    throw new Error(`Linear: ${data.errors[0]?.message || 'Unknown error'}`)
  }
  return data.data
}

export async function createLinearIssue(
  apiKey: string,
  input: LinearIssueInput
): Promise<LinearIssueResponse> {
  const mutation = `
    mutation CreateIssue($input: IssueCreateInput!) {
      issueCreate(input: $input) {
        success
        issue {
          id
          identifier
          title
          url
          state { name }
          priority
        }
      }
    }
  `

  const data = (await linearQuery(apiKey, mutation, {
    input: {
      title: input.title,
      description: input.description,
      teamId: input.teamId,
      priority: input.priority,
    },
  })) as { issueCreate: { issue: LinearIssueResponse } }

  return data.issueCreate.issue
}

export async function getLinearTeams(
  apiKey: string
): Promise<{ id: string; name: string; key: string }[]> {
  const query = `
    query Teams {
      teams {
        nodes {
          id
          name
          key
        }
      }
    }
  `

  const data = (await linearQuery(apiKey, query)) as {
    teams: { nodes: { id: string; name: string; key: string }[] }
  }

  return data.teams.nodes
}

export function nodeToLinearPriority(priority: string | undefined): number {
  switch (priority) {
    case 'critical': return 1
    case 'high': return 2
    case 'medium': return 3
    case 'low': return 4
    default: return 0 // No priority
  }
}

export function nodeToLinearInput(node: PlanNode, teamId: string): LinearIssueInput {
  return {
    title: node.title,
    description: node.description || undefined,
    teamId,
    priority: nodeToLinearPriority(node.priority),
  }
}

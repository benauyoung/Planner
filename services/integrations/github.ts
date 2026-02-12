/**
 * GitHub integration service.
 * Creates issues from nodes, syncs status back, links PRs.
 *
 * Requires a GitHub Personal Access Token with repo scope.
 * Set via integration settings in the app.
 */

import type { PlanNode } from '@/types/project'

interface GitHubCreateIssueParams {
  owner: string
  repo: string
  token: string
  title: string
  body: string
  labels?: string[]
}

interface GitHubIssueResponse {
  number: number
  html_url: string
  state: string
  title: string
}

export async function createGitHubIssue({
  owner,
  repo,
  token,
  title,
  body,
  labels,
}: GitHubCreateIssueParams): Promise<GitHubIssueResponse> {
  const res = await fetch(`https://api.github.com/repos/${owner}/${repo}/issues`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
      Accept: 'application/vnd.github+json',
    },
    body: JSON.stringify({ title, body, labels }),
  })

  if (!res.ok) {
    const error = await res.text()
    throw new Error(`GitHub API error (${res.status}): ${error}`)
  }

  return res.json()
}

export function nodeToIssueBody(node: PlanNode): string {
  const sections: string[] = []

  sections.push(`## ${node.title}`)
  if (node.description) sections.push(node.description)

  sections.push(`\n**Type:** ${node.type}`)
  sections.push(`**Status:** ${node.status}`)
  if (node.priority && node.priority !== 'none') sections.push(`**Priority:** ${node.priority}`)
  if (node.estimatedHours) sections.push(`**Estimate:** ${node.estimatedHours}h`)
  if (node.tags && node.tags.length > 0) sections.push(`**Tags:** ${node.tags.join(', ')}`)

  sections.push(`\n---\n_Created from VisionPath_`)

  return sections.join('\n')
}

export async function getGitHubIssue(
  owner: string,
  repo: string,
  token: string,
  issueNumber: number
): Promise<GitHubIssueResponse> {
  const res = await fetch(
    `https://api.github.com/repos/${owner}/${repo}/issues/${issueNumber}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: 'application/vnd.github+json',
      },
    }
  )

  if (!res.ok) {
    throw new Error(`GitHub API error (${res.status})`)
  }

  return res.json()
}

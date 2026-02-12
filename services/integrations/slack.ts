/**
 * Slack integration service.
 * Posts project updates to a Slack channel via incoming webhook.
 *
 * Requires a Slack Incoming Webhook URL.
 * Set via integration settings in the app.
 */

interface SlackMessage {
  text: string
  blocks?: SlackBlock[]
}

interface SlackBlock {
  type: 'section' | 'divider' | 'context'
  text?: { type: 'mrkdwn' | 'plain_text'; text: string }
  elements?: { type: 'mrkdwn' | 'plain_text'; text: string }[]
}

export async function sendSlackMessage(
  webhookUrl: string,
  message: SlackMessage
): Promise<void> {
  const res = await fetch(webhookUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(message),
  })

  if (!res.ok) {
    throw new Error(`Slack webhook error (${res.status})`)
  }
}

export function buildStatusChangeMessage(
  projectTitle: string,
  nodeTitle: string,
  oldStatus: string,
  newStatus: string,
  actorName: string
): SlackMessage {
  return {
    text: `[${projectTitle}] ${actorName} changed "${nodeTitle}" from ${oldStatus} → ${newStatus}`,
    blocks: [
      {
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: `*${projectTitle}*\n${actorName} changed *${nodeTitle}* status`,
        },
      },
      {
        type: 'context',
        elements: [
          { type: 'mrkdwn', text: `_${oldStatus}_ → *${newStatus}*` },
        ],
      },
    ],
  }
}

export function buildCommentMessage(
  projectTitle: string,
  nodeTitle: string,
  comment: string,
  authorName: string
): SlackMessage {
  return {
    text: `[${projectTitle}] ${authorName} commented on "${nodeTitle}": ${comment}`,
    blocks: [
      {
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: `*${projectTitle}*\n💬 ${authorName} commented on *${nodeTitle}*`,
        },
      },
      {
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: `> ${comment.length > 200 ? comment.slice(0, 200) + '…' : comment}`,
        },
      },
    ],
  }
}

export function buildAssignmentMessage(
  projectTitle: string,
  nodeTitle: string,
  assigneeName: string,
  actorName: string
): SlackMessage {
  return {
    text: `[${projectTitle}] ${actorName} assigned "${nodeTitle}" to ${assigneeName}`,
    blocks: [
      {
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: `*${projectTitle}*\n👤 ${actorName} assigned *${nodeTitle}* to *${assigneeName}*`,
        },
      },
    ],
  }
}

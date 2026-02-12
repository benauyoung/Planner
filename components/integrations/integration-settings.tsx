'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Github, MessageSquare, Zap, Check, AlertCircle, ExternalLink } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import type { IntegrationType, IntegrationStatus } from '@/types/integrations'

interface IntegrationCardConfig {
  type: IntegrationType
  name: string
  description: string
  icon: React.ReactNode
  color: string
  fields: { key: string; label: string; placeholder: string; type?: string }[]
}

const INTEGRATIONS: IntegrationCardConfig[] = [
  {
    type: 'github',
    name: 'GitHub',
    description: 'Create issues from nodes, sync PR status, link commits.',
    icon: <Github className="h-5 w-5" />,
    color: '#333',
    fields: [
      { key: 'owner', label: 'Owner', placeholder: 'your-org' },
      { key: 'repo', label: 'Repository', placeholder: 'your-repo' },
      { key: 'token', label: 'Personal Access Token', placeholder: 'ghp_...', type: 'password' },
    ],
  },
  {
    type: 'slack',
    name: 'Slack',
    description: 'Post updates to a channel when tasks change status, get assigned, or receive comments.',
    icon: <MessageSquare className="h-5 w-5" />,
    color: '#4A154B',
    fields: [
      { key: 'webhookUrl', label: 'Webhook URL', placeholder: 'https://hooks.slack.com/services/...' },
      { key: 'channel', label: 'Channel', placeholder: '#project-updates' },
    ],
  },
  {
    type: 'linear',
    name: 'Linear',
    description: 'Bidirectional sync between VisionPath tasks and Linear issues.',
    icon: <Zap className="h-5 w-5" />,
    color: '#5E6AD2',
    fields: [
      { key: 'apiKey', label: 'API Key', placeholder: 'lin_api_...', type: 'password' },
      { key: 'teamId', label: 'Team ID', placeholder: 'team-uuid' },
    ],
  },
]

interface IntegrationSettingsProps {
  open: boolean
  onClose: () => void
}

export function IntegrationSettings({ open, onClose }: IntegrationSettingsProps) {
  const [configs, setConfigs] = useState<Record<string, Record<string, string>>>({})
  const [statuses, setStatuses] = useState<Record<string, IntegrationStatus>>({})
  const [expandedType, setExpandedType] = useState<IntegrationType | null>(null)

  const handleFieldChange = (type: string, key: string, value: string) => {
    setConfigs((prev) => ({
      ...prev,
      [type]: { ...(prev[type] || {}), [key]: value },
    }))
  }

  const handleConnect = (type: IntegrationType) => {
    const config = configs[type]
    if (!config) return

    // Validate all fields have values
    const integration = INTEGRATIONS.find((i) => i.type === type)
    if (!integration) return
    const allFilled = integration.fields.every((f) => config[f.key]?.trim())
    if (!allFilled) return

    setStatuses((prev) => ({ ...prev, [type]: 'connected' }))
  }

  const handleDisconnect = (type: IntegrationType) => {
    setStatuses((prev) => ({ ...prev, [type]: 'disconnected' }))
    setConfigs((prev) => {
      const next = { ...prev }
      delete next[type]
      return next
    })
  }

  if (!open) return null

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            className="fixed inset-0 bg-black/50 z-[100]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />
          <motion.div
            className="fixed top-[8%] left-1/2 -translate-x-1/2 w-full max-w-lg z-[101]"
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            transition={{ duration: 0.15 }}
          >
            <div className="bg-background border rounded-xl shadow-2xl overflow-hidden">
              {/* Header */}
              <div className="flex items-center justify-between px-5 py-3 border-b">
                <h2 className="text-sm font-semibold">Integrations</h2>
                <button onClick={onClose} className="text-muted-foreground hover:text-foreground transition-colors">
                  <X className="h-4 w-4" />
                </button>
              </div>

              {/* Integration cards */}
              <div className="max-h-[70vh] overflow-y-auto divide-y">
                {INTEGRATIONS.map((integration) => {
                  const status = statuses[integration.type] || 'disconnected'
                  const isExpanded = expandedType === integration.type
                  const config = configs[integration.type] || {}

                  return (
                    <div key={integration.type} className="px-5 py-4">
                      <button
                        className="flex items-center gap-3 w-full text-left"
                        onClick={() => setExpandedType(isExpanded ? null : integration.type)}
                      >
                        <div
                          className="w-10 h-10 rounded-lg flex items-center justify-center text-white shrink-0"
                          style={{ backgroundColor: integration.color }}
                        >
                          {integration.icon}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <p className="text-sm font-medium">{integration.name}</p>
                            {status === 'connected' && (
                              <span className="flex items-center gap-1 text-[10px] text-green-500 font-medium">
                                <Check className="h-3 w-3" />
                                Connected
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">
                            {integration.description}
                          </p>
                        </div>
                      </button>

                      {/* Expanded config */}
                      {isExpanded && (
                        <div className="mt-3 ml-13 space-y-2.5 pl-[52px]">
                          {status === 'connected' ? (
                            <div className="space-y-2">
                              <div className="flex items-center gap-2 text-xs text-green-600 bg-green-500/10 px-3 py-2 rounded-lg">
                                <Check className="h-3.5 w-3.5" />
                                Connected and active
                              </div>
                              <Button
                                size="sm"
                                variant="outline"
                                className="text-red-500 hover:text-red-600 hover:border-red-200"
                                onClick={() => handleDisconnect(integration.type)}
                              >
                                Disconnect
                              </Button>
                            </div>
                          ) : (
                            <>
                              {integration.fields.map((field) => (
                                <div key={field.key}>
                                  <label className="text-[10px] font-medium text-muted-foreground mb-1 block">
                                    {field.label}
                                  </label>
                                  <input
                                    type={field.type || 'text'}
                                    value={config[field.key] || ''}
                                    onChange={(e) =>
                                      handleFieldChange(integration.type, field.key, e.target.value)
                                    }
                                    placeholder={field.placeholder}
                                    className="w-full h-8 px-3 text-xs bg-muted rounded border-0 outline-none focus:ring-1 focus:ring-primary placeholder:text-muted-foreground"
                                  />
                                </div>
                              ))}
                              <Button
                                size="sm"
                                onClick={() => handleConnect(integration.type)}
                                disabled={
                                  !integration.fields.every((f) => config[f.key]?.trim())
                                }
                              >
                                Connect
                              </Button>
                            </>
                          )}
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>

              {/* Footer */}
              <div className="px-5 py-2.5 border-t bg-muted/20">
                <p className="text-[10px] text-muted-foreground">
                  Integration credentials are stored locally. For production use, store them server-side with encryption.
                </p>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}

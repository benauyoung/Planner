import type { AIPlanNode } from '@/types/chat'

export const AUTH_SYSTEM_TEMPLATE = {
  title: 'SaaS Authentication System',
  description: 'Complete auth system with email/password, OAuth, JWT tokens, and role-based access control.',
  nodeCount: 24,
  tags: ['auth', 'saas', 'security'],
  nodes: [
    { id: 'goal-1', type: 'goal', title: 'Authentication & Authorization', description: 'Build a secure, scalable auth system with multiple login methods and role-based access.', parentId: null },

    { id: 'subgoal-1-1', type: 'subgoal', title: 'User Authentication', description: 'Core login/signup flows for end users.', parentId: 'goal-1' },
    { id: 'subgoal-1-2', type: 'subgoal', title: 'Authorization & Roles', description: 'Role-based access control and permission management.', parentId: 'goal-1' },
    { id: 'subgoal-1-3', type: 'subgoal', title: 'Security & Infrastructure', description: 'Security hardening, rate limiting, and session management.', parentId: 'goal-1' },

    { id: 'feature-1-1-1', type: 'feature', title: 'Email/Password Login', description: 'Standard email + password authentication with bcrypt hashing.', parentId: 'subgoal-1-1' },
    { id: 'task-1-1-1-1', type: 'task', title: 'Create registration form with validation', description: 'Email format, password strength, confirm password.', parentId: 'feature-1-1-1' },
    { id: 'task-1-1-1-2', type: 'task', title: 'Implement bcrypt password hashing', description: 'Hash on registration, verify on login. Salt rounds: 12.', parentId: 'feature-1-1-1' },
    { id: 'task-1-1-1-3', type: 'task', title: 'Build login endpoint with JWT generation', description: 'POST /auth/login → validate credentials → return JWT + refresh token.', parentId: 'feature-1-1-1' },
    { id: 'task-1-1-1-4', type: 'task', title: 'Email verification flow', description: 'Send verification email on signup, confirm via token link.', parentId: 'feature-1-1-1' },

    { id: 'feature-1-1-2', type: 'feature', title: 'OAuth 2.0 (Google, GitHub)', description: 'Social login via OAuth 2.0 authorization code flow.', parentId: 'subgoal-1-1' },
    { id: 'task-1-1-2-1', type: 'task', title: 'Configure OAuth providers', description: 'Register app with Google and GitHub, store client ID/secret in env.', parentId: 'feature-1-1-2' },
    { id: 'task-1-1-2-2', type: 'task', title: 'Implement OAuth callback handler', description: 'Exchange auth code for tokens, create/link user account.', parentId: 'feature-1-1-2' },
    { id: 'task-1-1-2-3', type: 'task', title: 'Account linking for existing users', description: 'If email matches existing account, link OAuth identity.', parentId: 'feature-1-1-2' },

    { id: 'feature-1-1-3', type: 'feature', title: 'Password Reset', description: 'Forgot password flow with time-limited reset tokens.', parentId: 'subgoal-1-1' },
    { id: 'task-1-1-3-1', type: 'task', title: 'Forgot password email with reset link', description: 'Generate 1-hour expiry token, send via email.', parentId: 'feature-1-1-3' },
    { id: 'task-1-1-3-2', type: 'task', title: 'Reset password form and endpoint', description: 'Validate token, update password hash, invalidate token.', parentId: 'feature-1-1-3' },

    { id: 'feature-1-2-1', type: 'feature', title: 'Role-Based Access Control', description: 'Define roles (admin, member, viewer) with granular permissions.', parentId: 'subgoal-1-2' },
    { id: 'task-1-2-1-1', type: 'task', title: 'Define roles and permissions schema', description: 'Roles table, permissions table, role_permissions junction.', parentId: 'feature-1-2-1' },
    { id: 'task-1-2-1-2', type: 'task', title: 'Auth middleware for route protection', description: 'Check JWT → extract role → verify permission for route.', parentId: 'feature-1-2-1' },
    { id: 'task-1-2-1-3', type: 'task', title: 'Admin panel for role management', description: 'UI to assign/revoke roles, view user permissions.', parentId: 'feature-1-2-1' },

    { id: 'feature-1-3-1', type: 'feature', title: 'Rate Limiting', description: 'Protect auth endpoints from brute force attacks.', parentId: 'subgoal-1-3' },
    { id: 'task-1-3-1-1', type: 'task', title: 'Implement rate limiter middleware', description: '5 login attempts per 15 minutes per IP. Redis-backed counter.', parentId: 'feature-1-3-1' },
    { id: 'task-1-3-1-2', type: 'task', title: 'Account lockout after failed attempts', description: 'Lock account for 30 minutes after 10 failed attempts.', parentId: 'feature-1-3-1' },

    { id: 'feature-1-3-2', type: 'feature', title: 'Session Management', description: 'JWT refresh tokens, session revocation, multi-device support.', parentId: 'subgoal-1-3' },
    { id: 'task-1-3-2-1', type: 'task', title: 'Refresh token rotation', description: 'Issue new refresh token on each use, invalidate old one.', parentId: 'feature-1-3-2' },
    { id: 'task-1-3-2-2', type: 'task', title: 'Logout and session revocation', description: 'Blacklist refresh token on logout. Support "logout all devices".', parentId: 'feature-1-3-2' },
  ] as AIPlanNode[],
}

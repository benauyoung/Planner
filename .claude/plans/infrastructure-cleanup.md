══════════════════════════════════════════════════
IMPLEMENTATION PLAN: Infrastructure & Bloat Cleanup
══════════════════════════════════════════════════

## Goal

Address all pending infrastructure items from PLAN.md and remove
confirmed dead code to reduce project bloat.

──────────────────────────────────────────────────

## Success Criteria

- [ ] Dead code files removed (17 files)
- [ ] PLAN.md updated (refinement-system.ts is NOT dead)
- [ ] Privacy Policy page created, footer link wired
- [ ] Terms of Service page created, footer link wired
- [ ] Share page moved out of (app) auth group
- [ ] changeNodeType validates hierarchy rules
- [ ] Image uploads enforce size limit + compression
- [ ] API routes protected with auth middleware

──────────────────────────────────────────────────

## Dead Code Inventory (17 files to delete)

### Confirmed Dead Components (13 files)
| File | Reason |
|------|--------|
| `components/landing/hero-section.tsx` | Replaced by hero-prompt.tsx |
| `components/canvas/timeline-bar.tsx` | Never imported |
| `components/views/view-switcher.tsx` | Never imported |
| `components/views/agents-view.tsx` | Never imported |
| `components/views/backend-view.tsx` | Never imported |
| `components/views/board-view.tsx` | Never imported |
| `components/views/list-view.tsx` | Never imported |
| `components/views/pages-view.tsx` | Never imported |
| `components/views/table-view.tsx` | Never imported |
| `components/views/timeline-view.tsx` | Never imported |
| `components/collaboration/presence-avatars.tsx` | Never imported |
| `components/collaboration/presence-cursors.tsx` | Never imported |
| `components/comments/activity-feed.tsx` | Never imported |

### Dead Hook (1 file)
| File | Reason |
|------|--------|
| `hooks/use-collaboration.ts` | Never imported |

### Dead Integration Services (3 files)
| File | Reason |
|------|--------|
| `services/integrations/github.ts` | No routes or UI call it |
| `services/integrations/linear.ts` | No routes or UI call it |
| `services/integrations/slack.ts` | No routes or UI call it |

### NOT Dead (PLAN.md correction needed)
| File | Status |
|------|--------|
| `prompts/refinement-system.ts` | USED by planning-chat.tsx and refinement-question-card.tsx |

### NPM Dependencies
All 18 production and 10 dev dependencies are actively used. No bloat.

──────────────────────────────────────────────────

## Implementation Steps

### Step 1: Delete Dead Code (17 files)

Delete all files listed above. Then verify build still passes.

Files:
- `components/landing/hero-section.tsx`
- `components/canvas/timeline-bar.tsx`
- `components/views/view-switcher.tsx`
- `components/views/agents-view.tsx`
- `components/views/backend-view.tsx`
- `components/views/board-view.tsx`
- `components/views/list-view.tsx`
- `components/views/pages-view.tsx`
- `components/views/table-view.tsx`
- `components/views/timeline-view.tsx`
- `components/collaboration/presence-avatars.tsx`
- `components/collaboration/presence-cursors.tsx`
- `components/comments/activity-feed.tsx`
- `hooks/use-collaboration.ts`
- `services/integrations/github.ts`
- `services/integrations/linear.ts`
- `services/integrations/slack.ts`

Remove empty directories if any remain (views/, collaboration/, comments/, integrations/).

### Step 2: Update PLAN.md

- Remove `refinement-system.ts` from Dead Code known issue
- Mark hero-section.tsx cleanup as done
- Mark dead code cleanup as done

### Step 3: Privacy Policy & Terms of Service Pages

**New Files:**
- `app/(marketing)/privacy/page.tsx` — Privacy Policy page
- `app/(marketing)/terms/page.tsx` — Terms of Service page

**Modified File:**
- `components/landing/footer.tsx` — Update `href: '#'` to `/privacy` and `/terms`

Content: Standard SaaS privacy policy and terms covering:
- Data collection (account info, project data, usage analytics)
- Data storage (Firestore, localStorage fallback)
- Third-party services (Google Gemini AI, Firebase, Vercel)
- User rights (data export, deletion)
- Cookie policy
- Contact info (hello@tinybaguette.com)

### Step 4: Move Share Page to Public Route

**Move:**
- `app/(app)/share/[id]/page.tsx` → `app/(marketing)/share/[id]/page.tsx`

The share page only needs to read public project data. It shouldn't require
the AuthProvider wrapper from the (app) layout.

### Step 5: Add changeNodeType Hierarchy Validation

**Modified File:** `stores/project-store.ts`

Add validation to `changeNodeType()` using existing `NODE_CHILD_TYPE` map
from `lib/constants.ts`:
- Check if the node has a parent → verify parent type allows new child type
- Check if the node has children → verify new type allows existing child types
- If invalid, either block the change or warn the user

### Step 6: Image Upload Size Limit & Compression

**Modified File:** `components/panels/node-detail-panel.tsx`

Add to `fileToDataUrl()`:
- Max file size check (e.g., 5MB) — reject with toast if too large
- Canvas-based compression for images > 1MB:
  - Resize to max 1200px on longest side
  - Compress to JPEG quality 0.8
  - Re-encode as data URL
- This keeps Firestore docs under the 1MB document limit

### Step 7: API Route Auth Middleware

**New File:** `middleware.ts` (app root)

Add Next.js middleware that:
- Matches `/api/*` routes
- Checks for Firebase auth token in Authorization header
- Returns 401 if missing/invalid
- Passes through for valid tokens
- Exempts public endpoints if any (e.g., share API)

**Modified Files:** Frontend API callers need to include auth token in
requests (check if they already do via auth context).

──────────────────────────────────────────────────

## Risks & Mitigations

| Risk | Impact | Mitigation |
|------|--------|------------|
| Deleting "dead" code that's actually used | Build break | Run `next build` after deletion |
| Privacy/ToS content accuracy | Legal risk | Add disclaimer: "Last updated [date]", consult lawyer |
| Auth middleware breaks existing flows | App break | Test all API routes after adding middleware |
| Image compression quality loss | UX issue | Only compress images > 1MB, keep quality at 0.8 |
| Share page move breaks existing links | Broken links | URL structure stays `/share/[id]`, only layout changes |

──────────────────────────────────────────────────

## Sequencing & Dependencies

```
Step 1: Delete dead code        ─── independent
Step 2: Update PLAN.md          ─── after Step 1
Step 3: Privacy/ToS pages       ─── independent
Step 4: Move share page         ─── independent
Step 5: Type validation         ─── independent
Step 6: Image compression       ─── independent
Step 7: API auth middleware      ─── independent (do last, most complex)
```

Steps 1, 3, 4, 5, 6 can run in parallel. Step 2 after Step 1.
Step 7 last since it's the most complex and highest risk.

══════════════════════════════════════════════════

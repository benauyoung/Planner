# VisionPath Roadmap

> Milestone tracking with dependencies. Only the Roadmap Gatekeeper can edit which features block others.

---

## Timeline Overview

```
Q1 2025                    Q2 2025                    Q3 2025
├─────────────────────────┼─────────────────────────┼─────────────────────────┤
│  Phase 1: Foundation    │  Phase 3-4: Panels + AI │  Phase 7: Collaboration │
│  Phase 2: Canvas        │  Phase 5-6: Sync + Adv  │  Phase 8: Polish        │
└─────────────────────────┴─────────────────────────┴─────────────────────────┘
```

---

## Milestones

### M1: Working Canvas (Week 2)
**Status**: 🔴 Not Started

**Deliverables**:
- React Flow canvas with dark theme
- All 4 node types rendering
- Dependency edges connecting nodes
- Basic pan/zoom navigation

**Dependencies**: None (starting point)

**Exit Criteria**:
- Can create Goal → Subgoal → Feature → Task chain
- Nodes draggable
- Edges connect correctly

---

### M2: Spring Physics (Week 3)
**Status**: 🔴 Not Started

**Deliverables**:
- d3-force simulation integrated
- Nodes repel to prevent overlap
- Connected nodes cluster together
- Manual drag overrides physics

**Dependencies**: M1 (Working Canvas)

**Exit Criteria**:
- Release a node, it settles into stable position
- Adding nodes causes organic repositioning
- No jittery behavior at rest

---

### M3: Drill-Down Panels (Week 4)
**Status**: 🔴 Not Started

**Deliverables**:
- Slide-out panel on node selection
- Plan tab with Markdown editing
- Chat tab (UI only, no AI yet)
- Details tab with metadata

**Dependencies**: M1 (Working Canvas)

**Exit Criteria**:
- Double-click node opens panel
- Can edit plan checkboxes
- Panel closes cleanly

---

### M4: AI Chat (Week 5)
**Status**: 🔴 Not Started

**Deliverables**:
- Gemini API integration
- Context building from upstream nodes
- Streaming responses in chat
- Decompose/Plan/Review actions

**Dependencies**: M3 (Drill-Down Panels)

**Exit Criteria**:
- Can chat with AI about any node
- AI understands project context
- Actions create child nodes or update plans

---

### M5: Territory Sync (Week 6)
**Status**: 🔴 Not Started

**Deliverables**:
- Markdown serialization with YAML frontmatter
- File watcher for external edits
- Bidirectional sync working
- Conflict detection UI

**Dependencies**: M3 (Drill-Down Panels)

**Exit Criteria**:
- Edit node → file updates
- Edit file → canvas updates
- Conflict modal appears on simultaneous edit

---

### M6: Dependency Validation (Week 7)
**Status**: 🔴 Not Started

**Deliverables**:
- Cycle detection algorithm
- Block invalid edge creation
- Blocked status propagation
- Visual indicators

**Dependencies**: M1 (Working Canvas)

**Exit Criteria**:
- Cannot create circular dependency
- Blocked nodes show red indicator
- Completing parent unblocks children

---

### M7: Real-Time Collaboration (Week 8-9)
**Status**: 🔴 Not Started

**Deliverables**:
- Yjs CRDT integration
- PartyKit WebSocket server
- Multi-user sync
- Presence cursors

**Dependencies**: M5 (Territory Sync)

**Exit Criteria**:
- Two browsers see same canvas
- Changes sync in < 500ms
- User cursors visible

---

### M8: Polish & Launch (Week 10)
**Status**: 🔴 Not Started

**Deliverables**:
- Keyboard shortcuts
- Animations
- Onboarding flow
- Documentation complete

**Dependencies**: All previous milestones

**Exit Criteria**:
- All keyboard shortcuts working
- Smooth animations
- New user can start in < 1 minute

---

## Dependency Graph

```
         ┌─────────────────────────────────────────────┐
         │                                             │
         ▼                                             │
┌─────────────┐                                        │
│ M1: Canvas  │◄─────────────────────────────┐         │
└──────┬──────┘                              │         │
       │                                     │         │
       ├──────────────┬──────────────┐       │         │
       │              │              │       │         │
       ▼              ▼              ▼       │         │
┌─────────────┐ ┌─────────────┐ ┌─────────────┐        │
│ M2: Physics │ │ M3: Panels  │ │ M6: Deps    │        │
└─────────────┘ └──────┬──────┘ └─────────────┘        │
                       │                               │
                       ├──────────────┐                │
                       │              │                │
                       ▼              ▼                │
                ┌─────────────┐ ┌─────────────┐        │
                │ M4: AI Chat │ │ M5: Sync    │        │
                └─────────────┘ └──────┬──────┘        │
                                       │               │
                                       ▼               │
                                ┌─────────────┐        │
                                │ M7: Collab  │        │
                                └──────┬──────┘        │
                                       │               │
                                       ▼               │
                                ┌─────────────┐        │
                                │ M8: Polish  │◄───────┘
                                └─────────────┘
```

---

## Risk Register

| Risk | Impact | Likelihood | Mitigation |
|------|--------|------------|------------|
| Physics performance with many nodes | High | Medium | Throttle simulation, virtualize off-screen |
| Yjs learning curve | Medium | High | Start with simple Y.Map, add complexity |
| Gemini rate limits | Medium | Low | Implement retry with backoff, cache responses |
| File sync race conditions | High | Medium | Debounce, use file locks, conflict UI |
| PartyKit costs at scale | Low | Low | Migrate to self-hosted if needed |

---

## Version Targets

### v0.1.0 - Alpha (M1-M3)
- Basic canvas and panels
- No AI, no sync, no collaboration
- For internal testing only

### v0.5.0 - Beta (M1-M6)
- Full single-user experience
- AI chat working
- File sync working
- Public beta

### v1.0.0 - Launch (M1-M8)
- Real-time collaboration
- Full polish
- Documentation complete
- Production ready

---

## Change Log

| Date | Change | Author |
|------|--------|--------|
| 2025-01-15 | Initial roadmap created | System |

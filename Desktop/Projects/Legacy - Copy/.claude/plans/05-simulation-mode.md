# Simulation Mode - Implementation Plan

> **Goal:** Allow advisors to demonstrate the full Legacy Protocol flow without making actual database changes.

---

## Success Criteria

- [ ] Advisors can enter simulation mode from client detail page
- [ ] Clear visual indicator ("SIMULATION MODE") present throughout
- [ ] Full Legacy Protocol flow is walkable (mark deceased → deputy notification → vault unlock)
- [ ] Deputy Emergency View is viewable in simulation context
- [ ] All mutations are no-ops (no database writes)
- [ ] Can exit simulation at any time
- [ ] Works for demos, training, and client reassurance

---

## Technical Approach

### Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    SimulationContext                         │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ isSimulating: boolean                                │   │
│  │ simulatedClient: { ...client, life_status: 'deceased' } │
│  │ enterSimulation(clientId) / exitSimulation()         │   │
│  └─────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
                              │
         ┌────────────────────┼────────────────────┐
         ▼                    ▼                    ▼
┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐
│ AdvisorClient   │  │ SimulationBanner│  │ DeputyEmergency │
│ Detail.tsx      │  │                 │  │ View.tsx        │
│ (entry point)   │  │ (visual cue)    │  │ (preview mode)  │
└─────────────────┘  └─────────────────┘  └─────────────────┘
```

### Key Design Decisions

| Decision | Choice | Rationale |
|----------|--------|-----------|
| State management | React Context | Simple, no external deps, scoped to simulation |
| Data source | Real client data | More realistic demo, no mock data maintenance |
| Mutation handling | Context-aware hooks | Existing mutations check `isSimulating` flag |
| UI indicator | Fixed banner | Always visible, can't be missed |
| Entry point | Button in Legacy Protocol card | Natural location, advisor-only |

---

## Implementation Steps

### Phase 1: Context & State

**Step 1.1: Create SimulationContext**
- File: `src/contexts/SimulationContext.tsx`
- Provides: `isSimulating`, `simulatedClientId`, `enterSimulation()`, `exitSimulation()`
- Wraps app at root level

**Step 1.2: Create SimulationBanner Component**
- File: `src/components/simulation/SimulationBanner.tsx`
- Fixed position banner at top of screen
- Shows: "SIMULATION MODE - No changes will be saved"
- Exit button to leave simulation
- Pulsing/animated border for visibility

### Phase 2: Advisor Entry Point

**Step 2.1: Add Simulation Button to AdvisorClientDetail**
- File: `src/pages/AdvisorClientDetail.tsx`
- Add "Simulate Legacy Protocol" button in Legacy Protocol card
- Only visible when client is alive
- Opens simulation intro dialog explaining what will happen

**Step 2.2: Create SimulationIntroDialog**
- File: `src/components/simulation/SimulationIntroDialog.tsx`
- Explains what simulation mode does
- Bullet points: "You'll see exactly what deputies experience"
- "Start Simulation" button enters simulation mode

### Phase 3: Simulated Protocol Flow

**Step 3.1: Create SimulatedProtocolActivation Component**
- File: `src/components/simulation/SimulatedProtocolActivation.tsx`
- Mimics the real activation dialog but with simulation styling
- Shows what would happen (vault unlock, deputy notifications)
- "Continue" advances to deputy view preview

**Step 3.2: Create SimulatedDeputyPreview**
- File: `src/components/simulation/SimulatedDeputyPreview.tsx`
- Renders DeputyEmergencyView with real client data
- Read-only (no actual access changes needed since we're the advisor)
- Shows all 6 tiles, contacts, intent video, playbook access

### Phase 4: Mutation Guards

**Step 4.1: Add simulation check to markDeceasedMutation**
- File: `src/pages/AdvisorClientDetail.tsx`
- If `isSimulating`, skip actual mutation, just show success toast
- Advance to simulated deputy view

**Step 4.2: Wrap other sensitive mutations (optional)**
- Any mutation in simulation context becomes a no-op
- Could create a `useSimulationAwareMutation` hook if needed

### Phase 5: Polish & Integration

**Step 5.1: Add simulation mode to DeputyEmergencyView**
- File: `src/components/deputy/DeputyEmergencyView.tsx`
- Accept `isSimulation` prop
- When true: show simulation banner, disable any actions
- Query real data (advisor has access anyway)

**Step 5.2: Navigation flow**
- After "activating" simulated protocol → navigate to `/advisor/clients/:id/simulation`
- New route renders SimulatedDeputyPreview
- Exit button returns to normal client detail page

---

## Files to Create

| File | Purpose |
|------|---------|
| `src/contexts/SimulationContext.tsx` | Global simulation state |
| `src/components/simulation/SimulationBanner.tsx` | Visual indicator |
| `src/components/simulation/SimulationIntroDialog.tsx` | Entry point dialog |
| `src/components/simulation/SimulatedProtocolActivation.tsx` | Mock activation flow |
| `src/components/simulation/SimulatedDeputyPreview.tsx` | Deputy view wrapper |

## Files to Modify

| File | Changes |
|------|---------|
| `src/App.tsx` | Wrap with SimulationProvider |
| `src/pages/AdvisorClientDetail.tsx` | Add "Simulate" button, check simulation context |
| `src/components/deputy/DeputyEmergencyView.tsx` | Accept simulation prop for styling |

---

## Simulation Flow (User Journey)

```
1. Advisor on Client Detail Page
   └── Sees "Simulate Legacy Protocol" button
       └── Clicks button
           └── SimulationIntroDialog opens
               └── "Start Simulation" clicked
                   └── Banner appears: "SIMULATION MODE"
                   └── Protocol card now shows simulated activation
                       └── Advisor clicks "Activate Protocol" (simulated)
                           └── Toast: "Simulated: Deputies would be notified"
                           └── Shows SimulatedDeputyPreview
                               └── Advisor explores 6-tile interface
                               └── Can view documents, contacts, playbook
                               └── Clicks "Exit Simulation"
                                   └── Returns to normal client detail
```

---

## Visual Design

### Simulation Banner
```
┌─────────────────────────────────────────────────────────────────────┐
│ ⚠️  SIMULATION MODE - No changes will be saved    [Exit Simulation] │
└─────────────────────────────────────────────────────────────────────┘
```
- Background: `bg-amber-500` with `animate-pulse` border
- Text: White, bold
- Position: Fixed top, full width, z-50

### Simulation Styling
- All cards get subtle amber border: `border-amber-300`
- Muted amber background tint on interactive elements
- "SIMULATED" badge on any action buttons

---

## Risks & Mitigations

| Risk | Impact | Mitigation |
|------|--------|------------|
| Advisor confuses simulation with real | High | Obvious banner, different button colors, "SIMULATED" labels everywhere |
| Data leaks to unauthorized users | Low | Advisor already has read access to client data |
| Simulation state persists incorrectly | Medium | Clear state on page navigation, no localStorage |

---

## Out of Scope (v1)

- Email preview (showing what deputies would receive)
- PDF export of simulated state
- Recording simulation for playback
- Multi-deputy perspective switching

---

## Estimated Complexity

| Component | Complexity |
|-----------|------------|
| SimulationContext | Low |
| SimulationBanner | Low |
| SimulationIntroDialog | Low |
| SimulatedProtocolActivation | Medium |
| SimulatedDeputyPreview | Medium |
| Integration & Testing | Medium |

**Total: Medium complexity**

---

## Next Steps

1. Approve this plan
2. Create `src/contexts/SimulationContext.tsx`
3. Create `src/components/simulation/` directory and components
4. Integrate into AdvisorClientDetail
5. Test full simulation flow
6. Use `/execute-plan` when ready

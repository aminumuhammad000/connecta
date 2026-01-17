---
description: Guide to implementing the Connecta Collabo Section (Team-based hiring).
---

# Collabo Section Implementation Workflow

This workflow breaks down the implementation of the Collabo Section into manageable tasks.

## Phase 1: Database & Backend Foundation

1.  **Define Data Models**
    - [ ] Create `CollaboProject` schema (or update `Job` model) to support `type: 'collabo'`.
    - [ ] Create `ProjectRole` model: `{ title, budget, skills[], status, freelancerId }`.
    - [ ] Create `CollaboWorkspace` model for chat/tasks.
    - [ ] Run database migrations.

2.  **Backend Services**
    - [ ] Create `src/services/Collabo.service.ts`.
    - [ ] Implement `createCollaboProject` function.
    - [ ] Implement `addRoleToProject` function.

3.  **API Endpoints**
    - [ ] `POST /jobs/collabo/init` (Initialize project).
    - [ ] `POST /jobs/collabo/:id/roles` (Manage roles).
    - [ ] `GET /jobs/collabo/:id` (Get full team status).

## Phase 2: AI Scoping & Job Creation (Client Side)

4.  **AI Service Integration**
    - [ ] Update `AIService` to handle "Project Scoping" prompt.
    - [ ] Input: Description string. Output: JSON `{ roles: [], totalEstimatedBudget: number, timeline: string }`.

5.  **Frontend: Job POST Flow**
    - [ ] Create `PostCollaboJobScreen.tsx`.
    - [ ] Implement "Project Type Selection" (Individual vs Team).
    - [ ] Implement Chat/Form for "Describe your project".
    - [ ] Create "Plan Review" UI to display AI-generated roles/costs.
    - [ ] Allow client to edit roles (add/remove/change budget).

## Phase 3: Hiring & Escrow

6.  **Smart Escrow Logic**
    - [ ] Update `PaymentService` to handle `split_escrow`.
    - [ ] Ensure creating a Collabo project locks total funds but assigns them to `ProjectRole` buckets.

7.  **Auto-Invite System**
    - [ ] Build a matcher in `CollaboService` to find top 3 freelancers per role.
    - [ ] Implement `sendTeamInvite` notification logic.
    - [ ] UI: Freelancer receives "Team Invitation" with role details.

## Phase 4: Collabo Workspace (The Hub)

8.  **Workspace Dashboard UI**
    - [ ] Create `src/screens/CollaboWorkspaceScreen.tsx`.
    - [ ] Implement Tab navigation: Dashboard, Chat, Tasks, Files.

9.  **Real-time Chat**
    - [ ] Implement `TeamChat` component using Socket.io.
    - [ ] Add support for channels (e.g., General, Devs).

10. **Kanban Board**
    - [ ] Create interactive Kanban board (Drag & Drop).
    - [ ] Bind tasks to specific `ProjectRole` assignees.

## Phase 5: Final Polish

11. **Refinement**
    - [ ] Add "AI Project Manager" reminders (cron jobs).
    - [ ] Polish animations and transitions.
    - [ ] Comprehensive testing (Client flow + Prelancer flow).

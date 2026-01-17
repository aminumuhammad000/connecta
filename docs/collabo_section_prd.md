# Product Requirements Document (PRD): Connecta Collabo Section

## 1. Executive Summary
The **Collabo Section** is a revolutionary feature for Connecta that transforms the platform from a simple freelancer marketplace into a high-end team collaboration ecosystem. It enables clients to build entire project teams (e.g., developers, designers, PMs) automatically using AI, manages the team via a dedicated workspace, and handles complex budget splitting and escrow for multiple contributors simultaneously.

## 2. Core Value Proposition
- **For Clients:** Eliminates the headache of managing multiple freelancers separately. AI does the heavy lifting of scoping, role definition, and budgeting.
- **For Freelancers:** Provides access to higher-value, long-term team projects with clear role definitions and guaranteed payouts via role-based escrow.
- **For Connecta:** Differentiates the platform as a "next-gen" solution, moving upmarket to capture complex enterprise-level projects.

## 3. User Flows

### 3.1 Client: Project Creation
1.  **Type Selection:** Client selects **"Collabo Team Job"** (vs Individual).
2.  **AI Interview:** Client describes the idea (e.g., "Build a multi-vendor marketplace").
3.  **AI Analysis:** System generates:
    *   Required Roles (e.g., Backend Dev, UI Designer).
    *   Estimated Timeline & Budget per role.
    *   Total Project Cost.
4.  **Refinement:** Client reviews/edits roles and budget.
5.  **Funding:** Client deposits total budget into Smart Escrow (locked per role).
6.  **Activation:** Project goes live; system starts matching/inviting freelancers.

### 3.2 System: Matching & Assembly
1.  **Auto-Matching:** Algorithm identifies Best Fit freelancers for each role (Skills + Collabo Score + Availability).
2.  **Invitation:** Automated invites sent.
3.  **Acceptance:** Freelancers accept/negotiate.
4.  **Team Finalization:** Once all roles are filled, the workspace is unlocked.

### 3.3 The Collabo Workspace (Post-Hiring)
- **Dashboard:** High-level timeline, budget burn rate, pending milestones.
- **Communication:** Role-based chat channels (@Devs, @Designers, @All).
- **Task Board:** Kanban (To Do, In Progress, Review, Done). Auto-assigned tasks.
- **Files:** Version-controlled file storage.

## 4. Functional Requirements

### 4.1 AI Engine
- **Input:** Natural language project description.
- **Output:** JSON structure containing Roles, Tasks, Estimates.
- **Agent:** "AI Project Manager" that monitors deadlines and suggests reassignments.

### 4.2 Financial / Escrow
- **Multi-Wallet Escrow:** A single project payment is split into sub-escrows for each role.
- **Milestone Release:** Funds released per role upon specific milestone completion.
- **Bonus Pools:** Optional pot for high performers.

### 4.3 Workspace Tools
- **Real-time Chat:** Socket.io based.
- **Kanban Board:** Drag-and-drop task management.
- **File Management:** Cloud storage integration (AWS S3/Google Cloud Storage).

## 5. Technical Architecture Plan

### 5.1 Database Schema (New Models)
*   `CollaboProject` (extends Project, adds team mode flag)
*   `ProjectRole` (Title, Budget, Skills, FreelancerID [nullable initialy], Status)
*   `TeamMember` (Link between User and ProjectRole)
*   `Workspace` (Chat channels, Task lists)
*   `Task` (AssignedTo: RoleID, Status, Deadline)

### 5.2 Backend Services
*   `CollaboService`: Handles creation, role generation, team assembly.
*   `AIManagerService`: Interfaces with LLM for scoping and monitoring.
*   `EscrowService`: Enhanced to handle split-payments.

### 5.3 Frontend Screens
*   **PostJob_TypeSelection:** Initial fork.
*   **PostJob_AIInterview:** Chat-like interface for scoping.
*   **PostJob_PlanReview:** Interactive breakdown of roles/costs.
*   **CollaboDashboard:** The main workspace hub.

## 6. Implementation Phases

### Phase 1: Foundation & Data Layer
*   Design and migrate DB schema.
*   Create basic backend CRUD for Collabo projects.

### Phase 2: AI Scoping Engine
*   Implement AI service to generate role/budget breakdowns.
*   Build the Client "AI Interview" UI.

### Phase 3: Financials & Hiring
*   Implement split-escrow logic.
*   Build auto-invite system.

### Phase 4: Workspace & Collaboration
*   Build the Team Dashboard (Chat + Kanban).
*   Final polish and testing.

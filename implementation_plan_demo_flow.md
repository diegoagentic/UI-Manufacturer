# Implementation Plan - Demo Flow & Simulation Templates

Adapt the guided flow experience from the reference demo to the UI-Dealer project (branch `demo`). The goal is to create a seamless journey between different simulated applications (Email, Dealer Monitor, Expert Hub) using a persistent sidebar and high-end visual elements.

## Strategic Approach: Sandbox Simulation
To maintain absolute independence from the existing frontend and Expert Hub code, we will implement a **Sandbox Simulation** pattern:

1.  **Independent Namespace**: All new demo components will reside in `src/components/simulations/`.
2.  **Demo Context Layer**: A new `DemoContext.tsx` will manage the "Hilo Conductor" state (current step, role, and simulation variables) separately from the main app state.
3.  **App-Level Routing Logic**: `App.tsx` will be modified with a `simulationMode` flag. When active, it will bypass standard navigation and render the `DemoSidebar` (Hilo Conductor) as the primary controller.
4.  **Component "Guides"**: Existing pages (like `Transactions.tsx`) will be used as reference "Snapshots." We will create "Snapshot" versions for the demo that simplify complex logic while preserving the visual fidelity for the presentation.

### 1. New Simulation Templates
Create reusable templates for the different "environments" in the flow.

#### [NEW] [EmailSimulation.tsx](file:///c:/Users/User/Documents/design-system/strata-projects/config-evolution/UI-Dealer/src/components/simulations/EmailSimulation.tsx)
- High-fidelity simulation of an external email app (Gmail-style).
- Supports "External App" visual markers (URL bar, distinct sidebar).
- Call-to-action buttons that trigger cross-app contextual redirects.

#### [NEW] [DealerMonitorKanban.tsx](file:///c:/Users/User/Documents/design-system/strata-projects/config-evolution/UI-Dealer/src/components/simulations/DealerMonitorKanban.tsx)
- AI-Enhanced Kanban board for high-volume process monitoring.
- Cards with "AI Insights" footers (red/pink background with sparkle icons).
- Real-time status pills (e.g., `READY TO DISPATCH`) and badge counts in headers.

#### [NEW] [ExpertHubTransactions.tsx](file:///c:/Users/User/Documents/design-system/strata-projects/config-evolution/UI-Dealer/src/components/simulations/ExpertHubTransactions.tsx)
- Replicates the real `Expert Hub` lifecycle navigation (Quotes, Orders, Acknowledgments).
- **Modular Dashboard Structure**: Uses `BusinessHealthHeader` and `StatsRow` layout patterns.
- **Detail Drill-downs**: Includes expanded detail sections for Revenue, Orders, and Discrepancies (faithful to the real project's `RevenueDetail`, `OrdersDetail`).
- **Escalation Tools**: Integrated "No-action reminders" and bulk approval/escalation bars.
- Supports `SIF` export simulations and high-fidelity data tables with status pills.

#### [NEW] [ServiceNowSimulation.tsx](file:///c:/Users/User/Documents/design-system/strata-projects/config-evolution/UI-Dealer/src/components/simulations/ServiceNowSimulation.tsx)
- **Enterprise Portal Layout**: Classic high-density IT portal with a gray/neutral color palette.
- **Left Sidebar Navigation**: "All Requests", "My Incidents", "Open Requests", "Self Service".
- **Data-Rich Tables**: Managing "Move Requests" and "IT Incidents" as mentioned in the reference demo.
- **Form Templates**: For creating new incidents or requests with multi-field inputs.

#### [NEW] [ConversationalSurvey.tsx](file:///c:/Users/User/Documents/design-system/strata-projects/config-evolution/UI-Dealer/src/components/simulations/ConversationalSurvey.tsx)
- Chat-based UI for interactive feedback.
- Inline action buttons (Yes/No) that update the conversation state.

#### [NEW] [SpecializedCatalog.tsx](file:///c:/Users/User/Documents/design-system/strata-projects/config-evolution/UI-Dealer/src/components/simulations/SpecializedCatalog.tsx)
- Product cards with category labels (Ergonomic, Standard).
- Integrated Sidebar AI Chat widget with quick replies.

#### [MODIFY] [Dashboard.tsx](file:///c:/Users/User/Documents/design-system/strata-projects/config-evolution/UI-Dealer/src/Dashboard.tsx)
- Integration of "Active Agent" widgets.
- Real-time status pulses and progress indicators for automated tasks.

### 2. Implementation of Guided Flow
#### [NEW] [DemoSidebar.tsx](file:///c:/Users/User/Documents/design-system/strata-projects/config-evolution/UI-Dealer/src/components/demo/DemoSidebar.tsx)
- **Hilo Conductor**: Vertical progress tracker with checkmarks for completed steps.
- Handles `appContext` switching (Expert Hub -> Email -> Dealer App).
- Context-aware tooltips for each step.

#### [MODIFY] [App.tsx](file:///c:/Users/User/Documents/design-system/strata-projects/config-evolution/UI-Dealer/src/App.tsx)
- Integrate the `DemoSidebar` (persistent).
- State-driven view switching between simulation templates and the main app.

## Visual & Functional Strategy
- **Highlight System**: `Highlight` component or utility classes for pulsing rings (red/yellow) around high-priority elements.
- **AI Feedback**: Consistent visual language for AI insights (Sparkle icons, tinted footers).
- **Status Color Tokens**: Use `brand-400` (active), `red-500` (critical), and `blue-500` (info) from the Strata Design System.

## Verification Plan
### Manual Verification
1.  Navigate through the sidebar steps.
2.  Verify that clicking a step correctly changes the "App" (e.g., from Transactions to Email).
3.  Check that highlights appear on the expected elements for each step.
4.  Verify visual consistency in Dark Mode.

# Manufacturer App — Diagnostic & Plan (v3 Final)

## Executive Summary

After deep analysis of 100+ components, 22 demo steps across 3 flows, and the dealer's navigation architecture, the plan is:

**Navigation:** 3 top-level tabs (matching dealer pattern) with lifecycle sub-tabs inside each. NOT 6 separate tabs — group related operations by workflow domain.

**AI Automation:** 20 patterns found embedded in demo components must be extracted into standalone, data-driven components and become the DEFAULT behavior on every page.

**Reusability:** ~75% of the codebase can be reused/adapted. The ACK/discrepancy/comparison infrastructure AND the AI automation patterns already exist — they just need decoupling from DemoContext.

---

## Part 1: Navigation Architecture

### Dealer Pattern (the model to follow)
```
3 Navbar Tabs:
  Dashboard          → single page, widget grid, no sub-tabs
  Service Center     → 4 sub-tabs: Requests | Movements | Maintenance | Punch List
  Transactions       → 3 lifecycle tabs: Quotes | Orders | Acknowledgments
                       × 4 status tabs: Active | Completed | All | Metrics
                       × 2 view modes: Pipeline | List
```

**Key principle:** Group by workflow domain, not by data type. Quotes + Orders + ACKs share one nav item because they're the same commercial lifecycle.

### Manufacturer Navigation (following same pattern)

```
3 Navbar Tabs:
  Command Center     → 3 internal tabs: Follow Up | Your Tools | Metrics
                       Follow Up: KPI strip + urgent actions + activity feed
                       Your Tools: customizable draggable widget grid (FeatureManager)
                       Metrics: DashboardMetricsGrid with manufacturer KPIs
  Operations         → 3 lifecycle tabs: Purchase Orders | Acknowledgements | Exceptions
                       × 4 status tabs: Active | Completed | All | Metrics
                       × 2 view modes: Pipeline | List
  Service Center     → 3 sub-tabs: Communications | Issues | Settings
```

**Why this grouping:**
- **Command Center** = Dashboard equivalent. Same 3-tab internal structure (Follow Up / Your Tools / Metrics) with manufacturer-adapted content.
- **Operations** = Transactions equivalent. POs + ACKs + Exceptions are the same PO→ACK→Exception lifecycle chain. Each gets its own lifecycle tab with dedicated pipeline stages, KPIs, and actions. This is the core workflow.
- **Service Center** = MAC equivalent. Communications (email drafts), Issues (punch list/warranty), and Settings (routing config) are support operations that exist outside the main PO→ACK flow.

### Detail Pages (not nav tabs — reached by clicking records)

```
Operations → Purchase Orders tab → click PO row → PO Detail (+ Create ACK sub-view)
Operations → Acknowledgements tab → click ACK row → ACK Detail (+ Revisions + Delta Engine)
Operations → Exceptions tab → click exception → Discrepancy Detail (+ Compare + Resolve)
Service Center → Communications tab → click draft → Draft Detail (+ Edit/Send)
Service Center → Issues tab → click issue → Issue Detail (+ Validation + Resolution)
```

### appToTab Mapping (App.tsx)
```javascript
const appToTab = {
  'command-center': 'command-center',
  'operations':     'operations',        // PO list, ACK list, Exceptions list
  'po-detail':      'operations',        // PO detail stays under Operations tab
  'ack-detail':     'operations',        // ACK detail stays under Operations tab
  'discrepancy':    'operations',        // Exception detail stays under Operations tab
  'service-center': 'service-center',    // Communications, Issues, Settings
  'draft-detail':   'service-center',    // Draft detail stays under Service Center
  'issue-detail':   'service-center',    // Issue detail stays under Service Center
};
```

---

## Part 2: Complete Page Architecture with AI Patterns

### Tab 1: Command Center (Home)

**Structure:** 3 internal tabs (matching dealer Dashboard.tsx `mainTab` pattern)

```
Command Center
  ├─ Follow Up (default)     → Urgent items + recent activity + performance overview
  ├─ Your Tools              → Draggable widget grid + FeatureManager (customizable)
  └─ Metrics                 → Full DashboardMetricsGrid with manufacturer KPIs
```

#### Command Center → Follow Up (default tab)

| Section | AI Pattern | Component Source |
|---|---|---|
| KPI Strip | — | `KPIStrip` (extract from ExpertHubTransactions) |
| | Pending ACKs, Open Exceptions, Auto-Accept Rate, Avg Response Time | |
| Urgent Actions (expandable) | #9 AI Priority | Adapted from Dashboard `urgentActions` cards with severity badges |
| | e.g. "3 ACKs pending >48h", "Exception rate spike on supplier XYZ", "5 POs missing ship dates" | |
| Current Processing | #3 Agent Pipeline | `AgentPipelineStrip` (reuse as-is) |
| | Shows actively running pipelines (PO ingestion, ACK comparison, claim processing) | |
| Recent Activity Feed | #10 Smart Notifications | `NotificationItem` list (reuse as-is) |
| | Role-based: operations vs quality vs finance view | |
| Performance Overview | — | Progress bars for key metrics (ACK turnaround, exception resolution, on-time %) |

#### Command Center → Your Tools (customizable widget grid)

**Pattern:** Identical to dealer Dashboard — `FeatureManager` toggle + `Reorder.Group` (framer-motion) for drag reorder.

| Widget ID | Title | Category | Default | Description |
|---|---|---|---|---|
| `po_inbox` | PO Inbox | core | enabled, required | Recent POs table with status tabs (active/completed/all/metrics), search, pipeline/list toggle |
| `ack_queue` | ACK Processing Queue | core | enabled | Pending ACKs awaiting review — quick-approve/flag actions inline |
| `exception_monitor` | Exception Monitor | core | enabled | Live exception feed with severity + AI insight per item |
| `production_tracker` | Production Tracker | operations | enabled | Order production status with ship date ETA |
| `ai_actions_log` | Recent AI Actions | analytics | enabled | `AgentLogStream` — streaming log of automated actions |
| `shipping_status` | Shipping & Logistics | operations | disabled | Shipment tracking dashboard (carrier, ETA, delivery confirmation) |
| `warranty_claims` | Warranty Claims | support | disabled | Open claims with liability split and resolution status |
| `supplier_scorecard` | Supplier Scorecard | analytics | disabled | Per-supplier metrics: ACK speed, exception rate, accuracy |
| `inventory_forecast` | Inventory Forecast | analytics | disabled | AI-predicted stock levels and reorder suggestions |
| `compliance_dashboard` | Compliance & Audit | finance | disabled | EDI compliance rates, audit trail summary |

**FeatureManager:** Toggle widgets on/off, organized by category (core/operations/analytics/support/finance). Same UX as dealer.

**Reorder:** Drag widgets to reorder. Order persisted in `toolsOrder` state.

**Widget detail views:** Each enabled widget renders its own mini-view:
- `po_inbox`: Full table with status tabs (Active | Completed | All | Metrics), search, client/project filters, list/grid view toggle — mirrors dealer's `recent_orders` widget pattern
- `ack_queue`: Compact pipeline strip + pending items list with inline accept/review buttons
- `exception_monitor`: Kanban-style cards (severity-sorted) with AI one-liner insights (#19)
- `production_tracker`: Timeline/Gantt of active orders with milestones
- `ai_actions_log`: `AgentLogStream` with filters by action type

#### Command Center → Metrics

**Structure:** `DashboardMetricsGrid` adapted with manufacturer KPIs

| Chart | Type | Metric |
|---|---|---|
| PO Volume | Area chart | Incoming POs by day/week/month |
| ACK Turnaround | Bar chart | Time from PO received → ACK sent (avg, P90) |
| Exception Rate | Line chart | % of POs with discrepancies over time |
| Auto-Accept Rate | Gauge | % of ACKs auto-accepted without human review |
| Resolution Time | Bar chart | Avg exception resolution time by problem code |
| On-Time Shipping | Line + target | % orders shipped on/before committed date |
| AI Accuracy | Multi-line | Extraction accuracy, delta engine accuracy, auto-correction accuracy |
| Supplier Performance | Stacked bar | Top 10 suppliers by PO volume × exception rate |
| Cost Impact | Donut | Financial impact of exceptions: resolved savings vs write-offs |

**Demo flow mapping:**
- Steps 1.6-1.10 (Dashboard in dealer) → Follow Up tab
- Steps 2.7 (Smart Notifications) → Follow Up activity feed
- Dealer's "Your Tools" widget pattern → Your Tools tab with manufacturer-specific widgets
- Dealer's DashboardMetricsGrid → Metrics tab with manufacturer KPIs
- ApprovalChainModal widget, MobileDeviceFrame → optional for manufacturer demo

---

### Tab 2: Operations (3 lifecycle sub-tabs)

#### Sub-tab: Purchase Orders

**List view structure:** Same as Transactions.tsx orders tab

| Element | Detail |
|---|---|
| Pipeline stages | `Received → AI Processing → Under Review → ACK Sent → Revision Required → Completed` |
| KPI Strip | Total POs, Pending ACK, With Exceptions, Clean Match Rate |
| Status tabs | Active \| Completed \| All \| Metrics |
| View modes | Pipeline \| List |
| Primary CTA | "Upload PO" / "Import from ERP" |
| Inline AI | When new PO arrives: `ExtractionPipeline` mode="compact" shows in the pipeline card |

**PO Detail page** (reached by clicking a PO row):

| Section | AI Pattern | Component |
|---|---|---|
| Header + metadata | — | Adapted from `OrderDetail.tsx` |
| Breadcrumbs | — | `Breadcrumbs` (reuse) |
| AI Extraction Results | #1 Extraction Pipeline, #2 Confidence | `ExtractionPipeline` + `ConfidenceScoreBadge` per field |
| | Shows: Product 95%, Quantity 88%, Ship-To 92%, Freight 42% | |
| Line Items Table | — | Adapted from OrderDetail line items |
| | Per-field confidence badges on extracted values | |
| Create ACK action | #17 Process Twin | ACK Composer sub-view |
| | Auto-fills from PO data, per-line ship dates, AI confidence | |
| Comparison Tab | #20 3-Way Match | `ThreeWayMatchView` (reuse as-is) |
| | Shows PO vs ACK vs Invoice when ACK exists | |

**Demo flow mapping:**
- Steps 1.1-1.4 map here: Email ingestion → AI extraction → Normalization → confidence scoring
- The DemoProcessPanel "lupa" with AgentPipelineStrip → becomes ExtractionPipeline inline in PO Detail
- The DealerMonitorKanban card previews → become pipeline cards in PO list

#### Sub-tab: Acknowledgements

**List view structure:** Same as Transactions.tsx acknowledgments tab

| Element | Detail |
|---|---|
| Pipeline stages | `Draft → AI Validated → Sent → Confirmed → Revision Pending → Revision Sent` |
| KPI Strip | Pending ACKs, Discrepancies Found, Confirmed, Avg Lead Time, On-Time % |
| Status tabs | Active \| Completed \| All \| Metrics |
| View modes | Pipeline \| List |
| Primary CTA | "Upload ACK" / "Batch Process" |
| Batch action | `BatchAckModal` — bulk approve ready ACKs, review attention items |

**ACK Detail page** (reached by clicking an ACK row):

| Section | AI Pattern | Component |
|---|---|---|
| Header + metadata | — | Adapted from `AckDetail.tsx` |
| Delta Engine Panel | #4 Delta Engine, #5 Auto-Correction | `DeltaEnginePanel` (NEW — extract from ExpertHubTransactions) |
| | Animated phases: scanning → grommet-found → grommet-fixed → dates-found → dates-fixed → qty-found → complete | |
| | Auto-corrected items show green "AI Auto-Corrected" badge | |
| | Escalated items (qty shortfall) show "Expert Review Required" | |
| Expert Review Table | #6 HITL Queue, #7 Inline Edit + Audit | `ExpertReviewTable` (NEW — extract from ExpertHubTransactions) |
| | 50-line table with inline editing for flagged items | |
| | Right sidebar: audit log with timestamps per action | |
| | CTA: "Accept and Send to System of Record" | |
| AI Substitutions | #16 Substitution Engine | Adapted from `AssetReviewArtifact` |
| | Proposes catalog-equivalent replacements with confidence scores | |
| Discrepancy Resolution | #11 Step-Through Resolver | `DiscrepancyResolverArtifact` (reuse as-is) |
| Partial Fulfillment | — | `BackorderTraceCard` (reuse as-is) |
| Approval Chain | #8 Automated Approval | `ApprovalChainModal` (reuse as-is) |
| Revision History | — | New timeline component (version sidebar) |

**Demo flow mapping:**
- Step 2.1 (ACK Intake) → ACK arriving in pipeline with animated card
- Step 2.2 (Normalization) → AgentPipelineStrip with 8 agents, confidence per field
- Step 2.3 (Delta Engine) → DeltaEnginePanel phases (grommet, dates, qty)
- Step 2.4 (Expert Review 50 lines) → ExpertReviewTable with inline edit
- Step 2.5 (Approval Chain) → ApprovalChainModal auto-advancing
- Step 2.6 (Pipeline Resolution) → Pipeline kanban with HAT→Confirmed, AIS→Partial

#### Sub-tab: Exceptions

**List view structure:** Adapted from MACRequests card pattern + DealerMonitorKanban

| Element | Detail |
|---|---|
| Pipeline stages | `New → AI Analyzing → Pending Review → In Progress → Ready to Reprocess → Resolved` |
| KPI Strip | Open Exceptions, Avg Resolution Time, Auto-Resolved %, By Problem Code |
| Status tabs | Active \| Completed \| All \| Metrics |
| View modes | Kanban (by status) \| List |
| Problem codes | Qty Mismatch \| Price Discrepancy \| Part # Mismatch \| Ship Date \| Ship-to \| Spec Issue \| Multiple \| No PO Found |
| Severity | Critical (red) \| High (amber) \| Medium (yellow) \| Low (zinc) |
| AI insight | One-liner per card from AI analysis (Pattern #19) |

**Discrepancy Detail page** (reached by clicking an exception):

| Section | AI Pattern | Component |
|---|---|---|
| Context Panel | — | PO vs ACK header info side-by-side |
| Line Comparison | #20 3-Way Match | `ThreeWayMatchView` (reuse) |
| Step-Through Resolution | #11 Discrepancy Resolver | `DiscrepancyResolverArtifact` (reuse) |
| Business Rules Check | #13 Rules Engine | `BusinessRulesPanel` (NEW — extract from MACPunchList) |
| | Validates against configurable rules: exact match vs contextual judgment | |
| Auto-Resolution | #5 Auto-Correction | Integrated in resolver (confidence-based accept/reject) |
| Escalation | #8 Approval Chain | `ApprovalChainModal` (reuse) |
| Auto-Draft Email | #14 Pipeline | On resolution → auto-generates draft in Communications |

---

### Tab 3: Service Center (3 sub-tabs)

#### Sub-tab: Communications

**Structure:** Adapted from EmailSimulation.tsx (simplified)

| Element | Detail |
|---|---|
| Layout | List + detail split (like email client but simpler) |
| Draft list | Status badges: AI Draft \| Review \| Scheduled \| Sent \| Failed |
| Auto-generation | Drafts auto-created from discrepancy resolution (linked by report IDs) |
| Filters | By PO, by manufacturer, by status |

**Draft Detail page:**

| Section | AI Pattern | Component |
|---|---|---|
| Email Preview | #14 Pipeline (auto-draft) | AI-composed subject + body |
| Discrepancy Table | — | Inline table of discrepancies included in email |
| Edit / Preview Toggle | — | Rich text editor for body modifications |
| Send Action | — | Manual trigger + confirmation |
| Status Timeline | — | Created → Edited → Scheduled → Sent/Failed |

**Demo flow mapping:**
- Steps 1.10, 2.7 (Smart Notifications) → notification digests concept
- AckDetail auto-drafted client email → becomes the draft generation trigger

#### Sub-tab: Issues (Punch List)

**Structure:** Adapted from MACPunchList (extracted patterns)

| Element | Detail |
|---|---|
| Issue list | Reported issues from dealer/installer |
| Pipeline stages | `Reported → AI Validated → Verified → In Repair → Fixed → Shipped → Closed` |
| Priority | High \| Medium \| Low |
| Categories | Freight Damage \| Manufacturing Defect \| Wrong Item \| Missing Parts |

**Issue Detail page:**

| Section | AI Pattern | Component |
|---|---|---|
| AI Validation Checklist | #12 AI Validation | `AIValidationChecklist` (NEW — extract from MACPunchList step 3.1) |
| | 5 required items with confidence: order # (98%), line # (96%), issue photo (94%), label photo (62% ⚠), box photo (0% ❌) | |
| | Expandable AI suggestions, QR scan, upload evidence actions | |
| | Overall completeness score badge | |
| Evidence Upload | #12 sub-actions | Multi-file photo upload with progressive animation |
| Business Rules Check | #13 Rules Engine | `BusinessRulesPanel` (reuse from Exceptions) |
| | Repair threshold, trip charge, certified vendor, labor hours, warranty coverage, duplicate check | |
| | Editable overrides for warning rules | |
| Liability Analysis | #15 AI Liability | `LiabilityAnalysisPanel` (reuse as-is) |
| | AI splits: Carrier 70% vs Manufacturer 30% with reasoning | |
| Claim Submission | #14 Claim Pipeline | `AgentLogStream` (NEW — extract from MACPunchList step 3.4) |
| | 8-step automated pipeline: init → upload photos → compile description → verify address → submit → ACK received → dashboard updated | |
| Tracking | — | `TrackingModal` (reuse as-is) |

**Demo flow mapping:**
- Step 3.1 (Request Intake) → AIValidationChecklist with 5 items, 2 flagged
- Step 3.2 (Labor Quote Requested) → narration/status update
- Step 3.3 (Labor Reimbursement Review) → BusinessRulesPanel with 6 rules, 2 warnings
- Step 3.4 (Claim Submission) → AgentLogStream + LiabilityAnalysisPanel

#### Sub-tab: Settings

**Structure:** New page

| Section | Detail |
|---|---|
| Channel Config | EDI 850/855 \| API/Web Service \| Email/Manual — per manufacturer |
| Comparison Rules | Configurable thresholds (exact match vs contextual judgment) |
| | Uses `BusinessRulesPanel` in "config mode" (editable rules as templates) |
| Auto-Accept Rules | Tolerance % for price, qty, dates before flagging exception |
| Contacts & Endpoints | Email addresses, API endpoints per manufacturer |
| Notification Preferences | Role-based digest config |

---

## Part 3: AI Patterns → Component Extraction Map

### 20 Demo Patterns Mapped to 8 New Components

| New Component | Patterns Covered | Extracted From | Target Pages |
|---|---|---|---|
| **`components/ai/KPIStrip.tsx`** | — | ExpertHubTransactions (ordersSummary, acksSummary) | Command Center, all Operations sub-tabs |
| **`components/ai/AgentLogStream.tsx`** | #14 | MACPunchList (CLAIM_LOG_ENTRIES, step 3.4) | Command Center (recent actions), Issue Detail (claim submission) |
| **`components/ai/ExtractionPipeline.tsx`** | #1, #2, #3, #17 | AIProcessingModal + QuoteExtractionArtifact + DemoProcessPanel | PO Detail (extraction results), ACK Composer (auto-fill) |
| **`components/ai/DeltaEnginePanel.tsx`** | #4, #5 | ExpertHubTransactions (steps 2.2-2.3 phases) | ACK Detail (core comparison engine) |
| **`components/ai/ExpertReviewTable.tsx`** | #6, #7 | ExpertHubTransactions (steps 1.5, 2.4 inline edit + audit) | ACK Detail (50-line expert review) |
| **`components/ai/AIKanbanBoard.tsx`** | #9, #19 | DealerMonitorKanban (3-column kanban + AI insight cards) | Command Center (needs attention), Exceptions list (kanban view) |
| **`components/ai/AIValidationChecklist.tsx`** | #12 | MACPunchList (VALIDATION_ITEMS, step 3.1) | Issue Detail (documentation validation) |
| **`components/ai/BusinessRulesPanel.tsx`** | #13 | MACPunchList (BUSINESS_RULES, step 3.3) | Discrepancy Detail, Issue Detail, Settings (config mode) |

### Existing Components — Reuse As-Is (Tier 1)

| Component | Used In |
|---|---|
| `AgentPipelineStrip` | Command Center, PO Detail, ACK Detail, Issue Detail |
| `ConfidenceScoreBadge` | PO Detail (per field), ACK Detail, Validation Checklist |
| `ThreeWayMatchView` | PO Detail (comparison tab), Discrepancy Detail |
| `DiscrepancyResolverArtifact` | ACK Detail, Discrepancy Detail |
| `ApprovalChainModal` | ACK Detail, Discrepancy Detail (escalation) |
| `BackorderTraceCard` | ACK Detail (partial fulfillment) |
| `LiabilityAnalysisPanel` | Issue Detail |
| `WidgetCard` | Command Center (all widgets) |
| `Breadcrumbs` | All detail pages |
| `Select` | Filters on all list pages |
| `ActionCenter` + `NotificationItem` | Navbar + Command Center activity feed |
| `BatchAckModal` | ACK list (bulk actions) |

### Existing Components — Adapt (Tier 2)

| Component | Adaptation | Target |
|---|---|---|
| `Dashboard.tsx` → `CommandCenter.tsx` | Keep 3 internal tabs (Follow Up / Your Tools / Metrics), replace widgets & KPIs for manufacturer context, add FeatureManager with manufacturer tools | Tab 1 |
| `Transactions.tsx` → `Operations.tsx` | 3 new lifecycle tabs (PO/ACK/Exceptions), new statuses | Tab 2 |
| `MAC.tsx` → `ServiceCenter.tsx` | 3 new sub-tabs (Comms/Issues/Settings) | Tab 3 |
| `OrderDetail.tsx` → `PODetail.tsx` | Add ExtractionPipeline, ACK Composer, ConfidenceScoreBadge | Detail |
| `AckDetail.tsx` → enhanced | Add DeltaEnginePanel, ExpertReviewTable, revision timeline | Detail |
| `MACRequests.tsx` → exceptions list | New statuses + problem codes + severity | Sub-tab |
| `EmailSimulation.tsx` → `Communications.tsx` | Simplify to draft list + detail split | Sub-tab |
| `AIProcessingModal` | Add props for agents, items, logs | Modal |

---

## Part 4: Demo Flow → Manufacturer Feature Mapping

### Flow 1: RFQ to PO Processing → Purchase Orders + Command Center

| Step | Demo Shows | Manufacturer Feature | Page |
|---|---|---|---|
| 1.1 Email Ingestion | EmailSimulation auto-reads email, detects PDF+CSV | PO intake: auto-detect documents from ERP/email | Operations → POs |
| 1.2 AI Extraction | 5-agent pipeline extracts 200 items | `ExtractionPipeline`: agents scan, parse, extract | PO Detail |
| 1.3 Normalization | Confidence scores per field (94% overall) | `ConfidenceScoreBadge` per extracted field | PO Detail |
| 1.4 Quote Draft | AI builds draft with pricing rules | ACK Composer: auto-fill from PO with AI confidence | PO Detail → Create ACK |
| 1.5 Expert Review | HITL review: accept/reject AI corrections + audit log | `ExpertReviewTable` with inline edit | ACK Detail |
| 1.6 Approval Chain | Auto-advancing 3-level approval | `ApprovalChainModal` for ACK routing | ACK Detail |
| 1.7 Quote Approval | Manual review + approve action | Manual ACK approval with AI summary | ACK Detail |
| 1.8 Mobile Approval | Push notification on mobile | Smart notification to mobile | Command Center |
| 1.9 PO Generation | Auto-generate PO + approval chain | Auto-route completed ACK to System of Record | Operations |
| 1.10 Notifications | Role-based digest (dealer vs expert) | Role-based notification digests | Command Center |
| 1.11 Pipeline View | Animated kanban with card transitions | Pipeline view in PO/ACK list with live status updates | Operations |

### Flow 2: PO & ACK Comparison → Acknowledgements + Exceptions

| Step | Demo Shows | Manufacturer Feature | Page |
|---|---|---|---|
| 2.1 ACK Intake | Two ACKs arrive (AIS 50 lines, HAT 5 lines) | ACK arrival animation in pipeline view | Operations → ACKs |
| 2.2 Normalization | 8-agent pipeline, EDI/855 mapping, confidence per field | `ExtractionPipeline` for incoming ACKs, `ConfidenceScoreBadge` | ACK Detail |
| 2.3 Delta Engine | Phase-by-phase: grommet-error→auto-fix, date-shift→accept, qty-short→escalate | `DeltaEnginePanel` with animated phases | ACK Detail |
| 2.4 Expert Review 50 Lines | Inline edit table, qty shortfall correction, audit log | `ExpertReviewTable` for flagged lines | ACK Detail |
| 2.5 Approval Chain | 3-approver auto-advancing chain | `ApprovalChainModal` | ACK Detail |
| 2.6 Pipeline Resolution | HAT→Confirmed, AIS→Partial, animated transitions | Pipeline view with status transitions | Operations → ACKs |
| 2.7 Notifications | Dual-persona digest (dealer updates vs expert exceptions) | Role-based notification center | Command Center |

### Flow 3: Punch List / Warranty → Issues

| Step | Demo Shows | Manufacturer Feature | Page |
|---|---|---|---|
| 3.1 AI Validation | 5-item checklist with confidence (order# 98%, label 62%, box 0%) | `AIValidationChecklist` auto-validates documentation | Service Center → Issues → Issue Detail |
| 3.2 Labor Quote | Narration step (presenter describes process) | Status update: "Labor Quote Requested" | Issue Detail timeline |
| 3.3 Business Rules | 6 rules (4 pass, 2 warning), editable overrides, AI suggestions | `BusinessRulesPanel` validates labor quote | Issue Detail |
| 3.4 Claim Submission | 8-step agent pipeline, evidence upload, manufacturer ACK | `AgentLogStream` + `LiabilityAnalysisPanel` | Issue Detail |
| 3.5 End User Report | Mobile device frame with report + comments | Optional: mobile-responsive report view | N/A for manufacturer |

---

## Part 5: Status Vocabularies

### Purchase Orders Pipeline
```
Received → AI Processing → Under Review → ACK Draft → ACK Sent → Revision Required → Completed
```
Color mapping: `zinc → brand → amber → blue → green → red → green`

### Acknowledgements Pipeline
```
Draft → AI Validated → Sent → Confirmed → Revision Pending → Revision Sent
```
Color mapping: `zinc → brand → blue → green → amber → blue`

### Exceptions Pipeline
```
New → AI Analyzing → Pending Review → In Progress → Reprocess Ready → Resolved
```
Color mapping: `zinc → brand → amber → blue → green → green`

Problem codes (badges): `Qty Mismatch | Price Discrepancy | Part # Mismatch | Ship Date | Ship-to | Spec Issue | Multiple | No PO`

### Communications
```
AI Draft → Review → Scheduled → Sent → Failed
```

### Issues
```
Reported → AI Validated → Verified → In Repair → Fixed → Shipped → Closed
```

---

## Part 6: Implementation Plan

### Phase 0: Foundation (2 days)
**Goal:** Navigation skeleton + AI component extractions

**Navigation:**
1. Update `App.tsx`: 3 top-level pages (command-center, operations, service-center) + detail pages
2. Update `Navbar.tsx`: 3 tabs — Command Center (HomeIcon), Operations (BanknotesIcon), Service Center (WrenchScrewdriverIcon)
3. Create `Operations.tsx` with 3 lifecycle tabs (POs | ACKs | Exceptions) following Transactions.tsx pattern
4. Create `ServiceCenter.tsx` with 3 sub-tabs (Communications | Issues | Settings) following MAC.tsx pattern
5. Adapt `Dashboard.tsx` → `CommandCenter.tsx` (skeleton)

**Cleanup:**
6. Remove unused pages: `CRM.tsx`, `Pricing.tsx`, `Workspace.tsx`, `Inventory.tsx`, `Catalogs.tsx`
7. Remove dealer simulations: `ServiceNowSimulation`, `SpecializedCatalog`, `ConversationalSurvey`
8. Remove demo-only components: `DemoSidebar`, `DemoSpotlight`, `DemoProcessPanel`, `DemoStepBanner`
   (Keep DemoContext temporarily — will refactor later for manufacturer demo)

**AI Component Extractions:**
9. Create `components/ai/` directory
10. Extract `KPIStrip.tsx` from ExpertHubTransactions (~80 lines)
11. Extract `AgentLogStream.tsx` from MACPunchList step 3.4 (~60 lines)
12. Extract `ExtractionPipeline.tsx` from AIProcessingModal + QuoteExtractionArtifact (~200 lines)

### Phase 1: Command Center (3 days)
**Goal:** Operational dashboard with 3 internal tabs, customizable tools, and manufacturer KPIs

**Follow Up tab:**
1. Adapt Dashboard.tsx → CommandCenter.tsx preserving `mainTab` state (follow_up | your_tools | metrics)
2. Wire `KPIStrip`: Pending ACKs, Open Exceptions, Auto-Accept Rate, Avg Response Time
3. Adapt Urgent Actions cards with manufacturer-specific items (pending ACKs, exception alerts, PO deadlines)
4. Add `AgentPipelineStrip` for current processing status
5. Wire `NotificationItem` list for activity feed with role-based filtering

**Your Tools tab:**
6. Adapt `FeatureManager` with manufacturer widget categories (core/operations/analytics/support/finance)
7. Configure 10 manufacturer widgets: po_inbox, ack_queue, exception_monitor, production_tracker, ai_actions_log, shipping_status, warranty_claims, supplier_scorecard, inventory_forecast, compliance_dashboard
8. Wire `Reorder.Group` (framer-motion) for drag reorder — same UX as dealer
9. Build mini-views for each widget (po_inbox with full table, ack_queue with inline actions, exception_monitor with kanban cards)

**Metrics tab:**
10. Adapt `DashboardMetricsGrid` with 9 manufacturer charts: PO Volume, ACK Turnaround, Exception Rate, Auto-Accept Rate, Resolution Time, On-Time Shipping, AI Accuracy, Supplier Performance, Cost Impact

**AI patterns activated:** #3 (pipeline), #9 (kanban), #10 (notifications), #14 (log stream), #19 (AI insights in exception monitor widget)

### Phase 2: Operations — Purchase Orders (3 days)
**Goal:** PO inbox with AI extraction pipeline

1. Create `Operations.tsx` with lifecycle tab structure (Transactions.tsx pattern)
2. **PO list:** Pipeline view with manufacturer statuses, KPIStrip, search/filters
3. **PO Detail:** Adapt OrderDetail.tsx
   - Wire `ExtractionPipeline` mode="inline" for AI extraction results
   - Wire `ConfidenceScoreBadge` per extracted field
   - Add "Create ACK" button → ACK Composer sub-view
   - ACK Composer: auto-fill from PO (Process Twin pattern), per-line ship dates
4. **Comparison Tab:** Wire `ThreeWayMatchView` when ACK exists

**AI patterns activated:** #1 (extraction), #2 (confidence), #17 (process twin), #20 (3-way match)

### Phase 3: Operations — Acknowledgements + Delta Engine (3 days)
**Goal:** ACK management with automated comparison

1. **ACK list tab:** Pipeline view with ACK statuses, KPIStrip, `BatchAckModal` for bulk actions
2. **ACK Detail:** Enhance AckDetail.tsx
   - Extract `DeltaEnginePanel` from ExpertHubTransactions (~300 lines)
   - Extract `ExpertReviewTable` from ExpertHubTransactions (~250 lines)
   - Wire delta engine: animated phase-by-phase comparison (scan → grommet → dates → qty)
   - Wire expert review: 50-line table with inline edit + audit log
   - Wire `BackorderTraceCard` for partial fulfillment
   - Wire `ApprovalChainModal` for routing
   - Add revision timeline sidebar

**AI patterns activated:** #4 (delta engine), #5 (auto-correction), #6 (HITL), #7 (audit), #8 (approval), #16 (substitutions)

### Phase 4: Operations — Exceptions (3 days)
**Goal:** Exception queue with AI pre-analysis and resolution

1. **Exceptions list tab:** Kanban view (AIKanbanBoard) or list with problem code badges, severity
2. **Discrepancy Detail:** Compose from existing components
   - Context panel: PO vs ACK header side-by-side
   - `ThreeWayMatchView` for line comparison
   - `DiscrepancyResolverArtifact` for step-through resolution
   - Extract `BusinessRulesPanel` from MACPunchList (~150 lines)
   - Wire business rules validation (exact match vs contextual judgment)
   - Auto-draft communication trigger on resolution

**AI patterns activated:** #9 (kanban), #11 (resolver), #13 (rules), #19 (AI insights)

### Phase 5: Service Center — Communications (2 days)
**Goal:** AI-drafted email management

1. **Communications tab:** Simplify EmailSimulation.tsx → draft list with status badges
2. **Draft Detail:** AI-composed body with discrepancy table, edit/preview, send action
3. Wire auto-draft trigger from Discrepancy Detail resolution

**AI patterns activated:** #14 (auto-draft from resolution)

### Phase 6: Service Center — Issues (3 days)
**Goal:** Post-delivery issue management with AI validation

1. **Issues tab:** Issue list with status pipeline, priority, categories
2. **Issue Detail:** Compose from extracted patterns
   - Extract `AIValidationChecklist` from MACPunchList (~180 lines)
   - Reuse `BusinessRulesPanel` from Phase 4
   - Wire `LiabilityAnalysisPanel` for carrier vs manufacturer split
   - Wire `AgentLogStream` for claim submission pipeline
   - Wire `TrackingModal` for re-shipment tracking

**AI patterns activated:** #12 (validation), #13 (rules), #14 (claim pipeline), #15 (liability)

### Phase 7: Service Center — Settings (1 day)
**Goal:** Manufacturer configuration

1. Channel config (EDI/API/Email per manufacturer)
2. Comparison rules (thresholds, auto-accept tolerances)
3. `BusinessRulesPanel` in config mode (define rule templates)
4. Contacts & endpoints, notification preferences

### Phase 8: AI Assistant (2 days)
**Goal:** App-wide command palette

1. Adapt `GenUIContext` for manufacturer intents
2. New intent patterns: PO lookup, exception analysis, draft email, claim status
3. Wire `ExtractionPipeline` as standard document upload handler
4. Global processing status in navbar via `AgentPipelineStrip`

**AI patterns activated:** #18 (intent engine)

---

## Part 7: New Components to Create

| Component | Lines Est. | Phase | Extracted From |
|---|---|---|---|
| `components/ai/KPIStrip.tsx` | ~80 | P0 | ExpertHubTransactions summaries |
| `components/ai/AgentLogStream.tsx` | ~60 | P0 | MACPunchList claim log |
| `components/ai/ExtractionPipeline.tsx` | ~200 | P0 | AIProcessingModal + QuoteExtractionArtifact |
| `components/ai/AIKanbanBoard.tsx` | ~200 | P1 | DealerMonitorKanban |
| `components/ai/DeltaEnginePanel.tsx` | ~300 | P3 | ExpertHubTransactions steps 2.2-2.3 |
| `components/ai/ExpertReviewTable.tsx` | ~250 | P3 | ExpertHubTransactions steps 1.5, 2.4 |
| `components/ai/BusinessRulesPanel.tsx` | ~150 | P4 | MACPunchList step 3.3 |
| `components/ai/AIValidationChecklist.tsx` | ~180 | P6 | MACPunchList step 3.1 |

**Total: ~1,420 lines** new code (all extracted from existing patterns)

---

## Part 8: Cross-App Consistency

### Dealer ↔ Manufacturer Mirror

```
UI-Dealer                              UI-Manufacturer
─────────                              ────────────────
Dashboard                              Command Center
  └ Follow Up | Your Tools | Metrics     └ Follow Up | Your Tools | Metrics
Transactions                           Operations
  └ Quotes | Orders | ACKs               └ Purchase Orders | ACKs | Exceptions
Service Center                         Service Center
  └ Requests | Movements |                └ Communications | Issues | Settings
    Maintenance | Punch List
```

**Same navigation pattern** (3 tabs, lifecycle sub-tabs, status filters, pipeline/list toggle).
**Same design tokens** (3-layer CSS architecture, brand colors, status badges).
**Same AI visualization** (AgentPipelineStrip, ConfidenceScoreBadge, AIAgentAvatar).
**Complementary data flow** — same entities, different perspective.

### Shared Module Candidates (future strata-ds extraction)
`AgentPipelineStrip`, `ConfidenceScoreBadge`, `ThreeWayMatchView`, `DiscrepancyResolverArtifact`, `ApprovalChainModal`, `BackorderTraceCard`, `LiabilityAnalysisPanel`, `WidgetCard`, `KPIStrip`, `BusinessRulesPanel`, `AIValidationChecklist`, `AgentLogStream`, `ActionCenter`, `NotificationItem`, `Breadcrumbs`, `Select`

---

## Part 9: Timeline

| Phase | Duration | Dependencies | AI Patterns |
|---|---|---|---|
| P0: Foundation | 2 days | — | KPIStrip, AgentLogStream, ExtractionPipeline |
| P1: Command Center | 3 days | P0 | #3, #9, #10, #14, #19 |
| P2: Purchase Orders | 3 days | P0 | #1, #2, #17, #20 |
| P3: ACKs + Delta | 3 days | P2 | #4, #5, #6, #7, #8, #16 |
| P4: Exceptions | 3 days | P2-3 | #9, #11, #13, #19 |
| P5: Communications | 2 days | P4 | #14 |
| P6: Issues | 3 days | P0 | #12, #13, #14, #15 |
| P7: Settings | 1 day | P0 | #13 config |
| P8: AI Assistant | 2 days | P1-6 | #18 |

**Total: 22 days** (parallelizable: P2+P6, P5+P7)
**Critical path:** P0 → P1 → P2 → P3 → P4 → P5

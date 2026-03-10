#Team Ops Tracker

A lightweight, in-house project management tool built for River.com IT Ops teams. Designed for daily planning, unplanned-work logging, task handoff tracking, and manager standup dashboards.

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **State**: Zustand (client-side, in-memory)
- **Charts**: Recharts
- **Icons**: Lucide React

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) v18+ and npm

### Install & Run

```bash
cd ops-tracker
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Features (per SRS)

| Screen | SRS Ref | Description |
| --- | --- | --- |
| **My Day** | FR-2 | Daily plan items, inline % editing, state transitions |
| **Unplanned** | FR-3 | 60-second modal: title, channel, source, reason, impact, effort |
| **Inbox** | FR-4 | Unified capture queue → Convert to task / Link / Archive |
| **Tasks** | FR-5/6 | Global task list with filters + detail view with actions & timeline |
| **Dashboard** | FR-9 | Manager-only: standup view, interruption chart, waiting aging, weekly trend |

### Key Workflows

- **Handoff** (FR-7): Change a task to "waiting" → records waiting-on team, request type, expected-by
- **Response received**: Clears waiting state, returns task to "active"
- **Wrap Day**: End-of-day panel validates actual %, captures effort buckets, suggests carry-to-tomorrow
- **Two progress truths**: Cumulative % (task-level) + Today's target % (plan-level)

### Locked Design Decisions (R1–R4)

- **R1**: Effort bucket is **not required** (can be omitted or filled at wrap)
- **R2**: "Before standup" badge shown before 10:30 AM (no hard lock)

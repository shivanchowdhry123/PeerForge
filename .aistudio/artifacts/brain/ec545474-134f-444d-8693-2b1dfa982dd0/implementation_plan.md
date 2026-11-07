# Hybrid Minimalist Sidebar & Navigation Architecture

A hybrid navigation system that solves sidebar clutter by combining:
1. **Clean Categorized Sections (Linear/Notion Style)**: Structured grouping with subtle typography headers instead of a wall of loose buttons.
2. **Compact Icon Rail Collapse Mode (Slack/Discord Style)**: A toggleable icon-only rail view with rich tooltips for maximum screen real estate.
3. **Top Navbar Header Integration**: Header quick-action buttons for global utilities (Messages badge, Notifications, Search, AI Match) to keep the sidebar focused.

---

## User Review Required

> [!IMPORTANT]
> **1. Three Clean Categorized Sections**:
> - **`MAIN`**: Home, Student Directory, AI Match Finder
> - **`COMMUNITY & ACADEMIC`**: Projects & Teams, Questions & Requests, Campus Notices, Messages (with unread counter), Notifications (with unread counter)
> - **`SYSTEM & SUPPORT`**: Settings & Privacy, About Us, Contact & Support, Faculty Console (if authorized)
>
> **2. Dual Mode Support (Expanded vs. Compact Icon Rail)**:
> - **Expanded Mode (Default)**: Full navigation labels organized cleanly under quiet uppercase section headers.
> - **Compact Icon Rail Mode**: Sleek 64px width sidebar featuring icon-only buttons with hover tooltip labels and active indicator rings.
> - **Collapse/Expand Toggle**: Instant toggle button (`PanelLeftClose` / `PanelLeftOpen`) at the top of the sidebar.

---

## Proposed Changes

### 1. `src/components/Sidebar.tsx`

- Structure navigation items into 3 typed categories:
  - `MAIN_ITEMS`: Home, Directory, AI Finder.
  - `COMMUNITY_ITEMS`: Projects, Questions, Notices, Messages, Notifications.
  - `SYSTEM_ITEMS`: Settings, About Us, Contact, Faculty Console.
- Add local state `isCompactMode` (with smooth CSS width transitions: `w-64` expanded $\leftrightarrow$ `w-16` compact rail).
- Render clean, unboxed section headers (e.g. `MAIN`, `COMMUNITY`, `SYSTEM`) when expanded.
- In `isCompactMode`:
  - Hide text labels and section headers.
  - Center icons inside touch-friendly target boxes ($\ge 40\text{px}$).
  - Display accessible HTML `title` attributes and floating tooltip labels on hover.
  - Maintain badge overlays (unread notification/message counters) cleanly on top-right of icons.
- Include a sleek Collapse / Expand Sidebar Rail toggle button at the top header of the sidebar.

### 2. `src/components/Navbar.tsx`

- Enhance top header navbar to include direct quick-link buttons for **Messages** and **Notifications** with live unread badge counters.
- Ensure seamless interaction between top header search/actions and sidebar navigation.

---

## Verification Plan

### Automated Build & Unit Tests
1. Run `lint_applet` (`tsc --noEmit`) to verify clean TypeScript compilation.
2. Run `npm test` (`tsx --test src/**/*.test.ts`) to ensure zero test regressions.

### Browser Visual & Interactive Verification (`playwright-cli`)
1. Open `http://localhost:3000/` using `playwright-cli`.
2. Inspect the new categorized sidebar layout in **Expanded Mode**, verifying clean section headers (`MAIN`, `COMMUNITY`, `SYSTEM`).
3. Click the sidebar collapse toggle to switch to **Compact Icon Rail Mode**, verifying that:
   - Width smoothly reduces to 64px (`w-16`).
   - Tooltip titles appear on hover over icon buttons.
   - Unread badges remain clearly visible on Messages and Notifications.
4. Click through key routes (Home, Directory, Messages, Projects, Settings) in both modes to verify seamless navigation.

# Figma Prompt — Enterprise Market Intelligence Tool (Dentsu)

## Product framing
No marketing homepage. The product **opens directly on the input screen**. This is an internal enterprise tool, not a landing page — every screen should feel like something an analyst uses daily, not something being sold to. Design principle for this whole file: **taste over plating** — restrained glassmorphism, no decorative filler, no animation for animation's sake. Every visual element should carry information or hierarchy, nothing purely ornamental.

---

## Design system

**Colors (use exactly)**
- `#231F20` Thunder — primary background
- `#8E9197` Oslo Gray — secondary text, borders, inactive icons
- `#F1F1F1` Seashell — primary text on dark
- `#2DD4BF` Electric Teal — sole accent: active states, CTAs, glowing chart lines, focus rings. Use sparingly — one accent color doing all the work is the point.

**Typography**
- One typeface family, two weights max (Regular / Semibold). No decorative or display fonts.
- Clear scale: Headline (28–32px), Section title (18–20px), Body (14–15px), Caption/meta (12px).

**Glass panel style**
- Background: Thunder at 40–60% opacity, backdrop blur ~16px
- Border: 1px Oslo Gray at low opacity
- Corner radius: 12–16px, consistent across all panels
- Shadow: soft, dark, no colored glow except on active/interactive elements
- Glow is reserved for: focus states, active nav item, primary buttons, live/updating data — not applied to static containers

**Motion**
- Fade + 8–12px slide on section entry, one consistent easing curve across the file
- No parallax, no looping background video, no multi-stage animated pipelines
- Loading states are simple and calm, not elaborate

---

## Sidebar (persistent, all screens)

Minimal. Three items total:
- **Project name** at top (brand being tracked, e.g. "Home Depot")
- **Dashboard** — nav icon, active state = teal glow + Seashell text, inactive = Oslo Gray
- **Reports** — nav icon, same active/inactive treatment
- **New Project** — small link or icon at the bottom to start a new tracking setup

No Knowledge Graph, no Alerts, no Settings in this version. If needed later, they can be added as icons in a compact top-right utility row — not sidebar sections.

---

## Screen 1 — New Project / Input

Centered glass card on a dark Thunder background (static gradient, no video). Title: "Set up a new intelligence project." One-line Oslo Gray subtext underneath.

Fields (frosted input style, Oslo Gray label, teal focus ring):
- Brand Name — text input
- Competitors — multi-tag input
- Products / Categories — multi-tag input
- Market / Country — dropdown
- Keywords to track — multi-tag input

**Signal sources (new, important)** — a row of selectable source chips/toggles: Reddit, YouTube, X/Twitter, News, Reviews, Forums. Multi-select. This selection is not cosmetic — **it determines what data populates the dashboard downstream.** Selected sources should show a filled/teal state; unselected stay outlined Oslo Gray.

Below that, a slightly larger glass card, subtle teal border glow, label: "What do you want to know?" — open text area with rotating placeholder prompts (e.g. "Why are customers switching to our competitor?"). Optional field.

Primary button, bottom: "Start monitoring" — glowing teal, full width or right-aligned.

---

## Screen 2 — Processing (lightweight)

Single centered glass card, not a multi-stage pipeline. One status line that updates in place (e.g. "Collecting signals from Reddit, YouTube…" → "Analyzing…" → done), a simple progress indicator (spinner or thin progress bar, teal), and a live count if available ("1,240 signals collected"). No stage list, no icons per stage, no checkmarks sequence. This screen should be on-screen briefly and feel incidental, not like a feature.

---

## Screen 3 — Dashboard (Results)

This is the core screen. **No knowledge graph, no separate alert feed.** Everything lives here, scrollable, and everything is filtered to only the source(s) selected during setup — see Source Filtering below.

Layout, top to bottom:

1. **Key Insight banner** (top, glass panel, most prominent element on the page) — a 2–3 sentence plain-language summary that directly answers the user's "What do you want to know?" question if they entered one, otherwise a general summary of what the data shows this period. This should read like a headline finding, not a stat block — the "catchy point" that makes someone want to scroll.

2. **Metric row** — 3–4 compact glass cards: Total mentions, Sentiment score, Share of voice vs competitors — each with a number and small trend indicator. Keep this row tight and low-height; it's context, not the main event.

3. **Sentiment trend chart** — teal line chart, brand vs competitors, 30/90-day toggle, hover tooltips. If only one source is selected, chart reflects that source only. If multiple sources selected, add a lightweight per-source tab or toggle above the chart so the user can see combined vs. per-source view.

4. **Analysis sections** (scrollable, one below the other, only shown if relevant to what was tracked) — each a glass panel with a clear section title:
   - **Competitor analysis** — how the brand compares, key movements
   - **Product/category analysis** — pain points and mentions by product
   - **Top pain points** — ranked list, frequency badge, short description
   - **Signals feed** — individual mentions with source icon (only icons for the sources actually selected), date, sentiment tag, link to original

5. **Floating AI assistant** — bottom-right, glass bubble expanding to a chat panel, for follow-up natural-language questions. Answers from this chat should also respect the active source filter.

### Source filtering — required behavior
- If only Reddit was selected at setup → every chart, metric, and signal on the dashboard reflects Reddit data only, and Reddit's icon appears throughout.
- If only YouTube → same, YouTube only.
- If both Reddit and YouTube → dashboard shows combined data by default, with a simple toggle/tabs ("All · Reddit · YouTube") to isolate one source at a time. No source that wasn't selected at setup ever appears.
- This should be visually obvious via a small source-indicator row near the top of the dashboard (icons of active sources, non-interactive — just a confirmation of scope), not just implied.

---

## Screen 4 — Reports (simplified)

Opened from sidebar. Top: "Generate report" glass card — text input pre-filled with the user's original query (editable), date range selector, glowing "Generate" button. Below: list of previously generated reports as simple glass rows (title, date, one-line summary, download icon).

Generated report preview: clean document layout — title, executive summary answering the query, sentiment chart, top pain points, competitor movements, recommended actions. "Export as PDF" button, top right. Keep this screen functional and document-like, not another dashboard.

---

## What was cut from the earlier version
- Full marketing homepage (hero video, nav bar, feature grid, scroll-triggered landing sections)
- Multi-stage animated processing pipeline (6 stages with progress rings)
- Knowledge Graph Explorer screen
- Alerts and Settings as standalone sidebar sections
- Signal Detail modal as a separate screen (folded into the Signals feed within the dashboard instead)

The goal: fewer screens, fewer decorative layers, same visual language, but every pixel earns its place.
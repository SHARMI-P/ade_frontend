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

**Sidebar is fixed, not part of page scroll.** Position it as `position: sticky` (or `fixed`) against the viewport — only the main content column scrolls underneath it. Regardless of how long the dashboard gets (topics, channels, voices, AI visibility, etc.), the sidebar stays pinned in place at full height. In Figma, this means the sidebar frame sits outside the scrolling content frame, not stacked inside the same auto-layout that scrolls.

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

This is the core screen. **No knowledge graph, no separate alert feed.** Everything lives here, in one scrolling content column next to the fixed sidebar, filtered to only the source(s) selected during setup.

Header row above the content: a compact control bar — **Timeframe pills** (Week · Month · Year, active = teal fill) and a **source-indicator row** (icons of only the sources selected at setup — non-interactive, just confirms scope). Keep this row slim; it's a filter/context strip, not a feature.

Layout, top to bottom:

1. **Narrative panel** (top, most prominent panel on the page) — eyebrow label ("This period, in plain language"), then a 2–4 sentence plain-language summary written like an analyst's headline finding, not a stat block. If the user entered a "What do you want to know?" question at setup, this answers it directly first. Below the text, a thin row of small source tags (e.g. "Reddit · YouTube") showing what the narrative is drawn from — quiet, caption-sized, bottom-aligned in the panel.

2. **Optional modules row** — two toggle chips beneath the narrative panel: **Crisis Severity & Timeline** and **Competitive Benchmark**. Off by default, collapsed. Clicking one expands a panel in place below:
   - *Crisis panel*: a few compact stat tiles (Status, Severity score /100, Baseline deviation, Detected date), a short checklist (e.g. news pickup, official response — yes/no), and a simple horizontal timeline strip of 2–4 checkpoints with a score at each.
   - *Competitive Benchmark panel*: a simple table — Entity, Sentiment, Share of Voice, Week-over-week change, Mentions — brand's own row visually highlighted (teal-tinted background).
   These stay optional and collapsed by default so the base dashboard doesn't feel cluttered — only surfaced when the user wants that specific lens.

3. **Core signal grid** — four glass panels in a 2×2 grid (stacks to one column on mobile), all scoped to the active source filter:
   - **Top Discussion Topics** — ranked list, topic name, mention count, small stance dot (green/red/gray... within this file's palette, render as teal / coral / Oslo Gray to stay on-brand)
   - **Top Channels & Sources** — one row per active source only, with mention count and a thin proportion bar; if a source wasn't selected at setup it simply isn't in this list
   - **Positive Sentiment Highlights** — a few representative items, each with a short illustrative quote, the source, and what it's representative of (e.g. "similar to 14 other mentions")
   - **Negative Sentiment Highlights** — same shape, negative lean

4. **Intent Signals panel** (full width) — distinct from general sentiment: explicit "wishlist" or "recommendation" language, each item tagged with a small pill (Wishlist / Recommendation), short quote, and source. This is a different signal type from sentiment and should read as its own category, not folded into pain points.

5. **Top Voices panel** (full width) — ranked creators, threads, or outlets most relevant to the active themes (ranked by relevance, not raw reach). Each row: platform icon, handle/name, platform + reach note, and a one-line note on why they matter this period.

6. **AI & Cross-Platform Visibility panel** (full width) — how AI assistants (ChatGPT, Gemini, Perplexity, etc.) characterize the brand when asked category questions: a headline stat ("38% of tracked category prompts return this brand"), a compact per-engine breakdown (engine name, theme summary, confidence score), and a quiet caveat note for anything inferred indirectly (e.g. platforms without direct API access) — flagged clearly as directional, not a live read.

7. **Floating AI assistant** — bottom-right, glass bubble expanding to a chat panel, for follow-up natural-language questions. Answers respect the active source filter.

### Evidence drawer — required interaction pattern
Every stat, list item, table row, and chart point across the dashboard is clickable. Clicking one opens a **glass drawer sliding in from the right** (not a modal overlay in the center) containing:
- The underlying data record, shown in a clean structured/monospace block (fields like metric, value, confidence, source)
- A one-line analyst note giving context on that specific number
- A source link (or a clearly marked internal-only tag if there's nothing to link to)

This is the trust layer for an enterprise audience — nothing on the dashboard is just an unverifiable number; everything traces back to where it came from. Use a subtle hover state (slight brightness/opacity shift) on any element that's clickable this way, so it reads as interactive without needing a label on every item.

### Source filtering — required behavior
- If only Reddit was selected at setup → every chart, metric, and signal on the dashboard reflects Reddit data only, and Reddit's icon appears throughout.
- If only YouTube → same, YouTube only.
- If both Reddit and YouTube → dashboard shows combined data by default, with a simple toggle/tabs ("All · Reddit · YouTube") to isolate one source at a time. No source that wasn't selected at setup ever appears.
- This should be visually obvious via the source-indicator row near the top of the dashboard, not just implied.

### Note on visual style vs. the reference file
The mentor's reference file uses its own color set (amber/green/red/blue on near-black) — that's fine as a functional/content reference, but **this Figma file keeps the Dentsu palette** (Thunder, Oslo Gray, Seashell, electric teal) as the single accent, per the design system above. Only the content structure, panel types, and the evidence-drawer interaction pattern should be pulled from that reference — not its colors.

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
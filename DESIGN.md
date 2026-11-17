---
name: Simplified DSA
description: Clear Steps. A clean white docs world with one blue accent, where algorithms are drawn one step at a time.
colors:
  page: "#ffffff"
  surface: "#f8f8f9"
  sunken: "#ffffff"
  raised: "#ffffff"
  code-bg: "#f4f4f5"
  hover: "#f1f1f3"
  line: "#e4e4e7"
  line-soft: "#efeff1"
  line-strong: "#d4d4d8"
  edge: "#a1a1aa"
  neutral-fill: "#d4d4d8"
  ink-strong: "#09090b"
  ink: "#18181b"
  ink-body: "#27272a"
  ink-code: "#27272a"
  muted: "#52525b"
  subtle: "#5c5c66"
  faint: "#6b6b74"
  accent: "#1d4ed8"
  accent-hover: "#1e40af"
  accent-soft: "#e0e9ff"
  accent-ink: "#1d4ed8"
  accent-line: "#2563eb"
  link: "#1d4ed8"
  on-accent: "#ffffff"
  look: "#8a5e04"
  look-line: "#d4a12f"
  look-fill: "#fde68a"
  look-soft: "#fef3c7"
  on-look: "#3b2a04"
  done: "#0f766e"
  done-fill: "#ccfbf1"
  visited: "#ecfdf9"
  on-done-fill: "#115e59"
  on-done: "#ffffff"
  danger: "#b91c1c"
  danger-fill: "#fee2e2"
  danger-ink: "#b91c1c"
  on-danger: "#ffffff"
  analogy: "#15803d"
  analogy-ink: "#166534"
  orange: "#c2410c"
  on-solid: "#09090b"
typography:
  display:
    fontFamily: "Geist Variable, system-ui, -apple-system, Segoe UI, Roboto, sans-serif"
    fontSize: "clamp(2.5rem, 5.6vw, 4.1rem)"
    fontWeight: 600
    lineHeight: 1.04
    letterSpacing: "-0.04em"
  headline:
    fontFamily: "Geist Variable, system-ui, sans-serif"
    fontSize: "clamp(2rem, 4vw, 2.6rem)"
    fontWeight: 600
    lineHeight: 1.12
    letterSpacing: "-0.03em"
  section:
    fontFamily: "Geist Variable, system-ui, sans-serif"
    fontSize: "clamp(1.8rem, 3.4vw, 2.4rem)"
    fontWeight: 600
    lineHeight: 1.15
    letterSpacing: "-0.03em"
  title:
    fontFamily: "Geist Variable, system-ui, sans-serif"
    fontSize: "1.6rem"
    fontWeight: 600
    lineHeight: 1.25
    letterSpacing: "-0.022em"
  lead:
    fontFamily: "Geist Variable, system-ui, sans-serif"
    fontSize: "1.16rem"
    fontWeight: 400
    lineHeight: 1.6
  body:
    fontFamily: "Geist Variable, system-ui, sans-serif"
    fontSize: "1.06rem"
    fontWeight: 400
    lineHeight: 1.72
  ui:
    fontFamily: "Geist Variable, system-ui, sans-serif"
    fontSize: "0.94rem"
    fontWeight: 500
    lineHeight: 1.4
  caption:
    fontFamily: "Geist Variable, system-ui, sans-serif"
    fontSize: "0.86rem"
    fontWeight: 400
    lineHeight: 1.45
  mono:
    fontFamily: "Geist Mono Variable, ui-monospace, SFMono-Regular, Consolas, monospace"
    fontSize: "0.95em"
    fontWeight: 600
    fontFeature: "\"liga\" 0, \"calt\" 0"
rounded:
  cell: "6px"
  control: "8px"
  step-card: "12px"
  demo: "14px"
  figure: "16px"
  section-card: "20px"
  band: "24px"
  pill: "999px"
spacing:
  gap-xs: "4px"
  gap-sm: "8px"
  gap-md: "14px"
  gap-lg: "20px"
  gap-xl: "28px"
  column-gap: "56px"
  block: "56px"
  gutter-phone: "16px"
  touch: "44px"
  topbar: "64px"
  topbar-phone: "56px"
  column: "760px"
  toc: "220px"
  tree: "280px"
  home: "1140px"
components:
  button-primary:
    backgroundColor: "{colors.accent}"
    textColor: "{colors.on-accent}"
    rounded: "{rounded.control}"
    height: "44px"
  button-primary-hover:
    backgroundColor: "{colors.accent-hover}"
    textColor: "{colors.on-accent}"
  button-secondary:
    backgroundColor: "{colors.raised}"
    textColor: "{colors.ink-strong}"
    rounded: "{rounded.control}"
    height: "44px"
  button-secondary-hover:
    backgroundColor: "{colors.hover}"
  button-hero:
    height: "48px"
    padding: "0 20px"
  icon-button:
    backgroundColor: "transparent"
    textColor: "{colors.ink}"
    rounded: "{rounded.control}"
    size: "44px"
  input-search:
    backgroundColor: "{colors.raised}"
    textColor: "{colors.ink-strong}"
    rounded: "{rounded.control}"
    height: "44px"
    padding: "0 10px"
  topnav-link:
    textColor: "{colors.ink}"
    rounded: "{rounded.control}"
    height: "44px"
    padding: "0 12px"
  topnav-link-current:
    textColor: "{colors.accent-ink}"
  lesson-link:
    textColor: "{colors.muted}"
    rounded: "{rounded.control}"
    height: "40px"
  lesson-link-active:
    backgroundColor: "{colors.accent-soft}"
    textColor: "{colors.accent-ink}"
  jump-chip:
    backgroundColor: "{colors.raised}"
    textColor: "{colors.ink}"
    rounded: "{rounded.pill}"
    height: "44px"
    padding: "0 14px"
  level-chip:
    backgroundColor: "{colors.accent-soft}"
    textColor: "{colors.accent-ink}"
    rounded: "{rounded.pill}"
    padding: "0 8px"
  step-card:
    backgroundColor: "{colors.raised}"
    textColor: "{colors.ink-strong}"
    rounded: "{rounded.step-card}"
    padding: "16px 18px"
  section-card:
    backgroundColor: "{colors.raised}"
    textColor: "{colors.ink}"
    rounded: "{rounded.section-card}"
    padding: "0 22px 22px"
  course-lesson:
    backgroundColor: "{colors.raised}"
    rounded: "{rounded.step-card}"
  demo:
    backgroundColor: "{colors.surface}"
    rounded: "{rounded.demo}"
  cell:
    backgroundColor: "{colors.raised}"
    textColor: "{colors.ink-strong}"
    rounded: "{rounded.control}"
  cell-look:
    backgroundColor: "{colors.look-fill}"
    textColor: "{colors.on-look}"
  cell-done:
    backgroundColor: "{colors.done}"
    textColor: "{colors.on-done}"
  cell-moved:
    backgroundColor: "{colors.done-fill}"
  closing-band:
    backgroundColor: "{colors.surface}"
    rounded: "{rounded.band}"
    padding: "clamp(36px, 6vw, 64px) 24px"
---

# Design System: Simplified DSA

## Overview

**Creative North Star: "Clear Steps"**

A lesson is a clean documentation page that happens to teach. The frame is the familiar docs shell: a sticky top bar, a lesson tree on the left, one reading column, an "On this page" list on the right. Nothing in the frame competes with the lesson. White paper (or a near-black night page), Geist for everything, hairline borders, and one blue accent that only ever means "go here" or "do this".

What the learner should notice lives inside the figures and demos, and it is marked in a fixed vocabulary that never changes between lessons or themes: gold for what is being looked at, teal for what is settled, moved or on the path, and faded plus crossed out for what has been ruled out. Blue never enters that vocabulary.

The system ships two themes from one set of semantic roles. Light is the default; night follows the system setting until the learner picks one with the theme button (`html[data-theme]`, stored in `localStorage` under `simplified-dsa:theme`, applied by an inline script before first paint). Roles keep their meaning in both themes; only values change. Depth is hairlines and tonal surfaces; the only glow is the home hero's search beam (below) and the closing band.

**Key Characteristics:**
- Docs shell: top bar, lesson tree, 760px column, scroll-spy table of contents at 1200px and up.
- Geist and Geist Mono, self-hosted via `@fontsource-variable`; no font CDN.
- One blue accent for navigation and actions; gold and teal are step states only.
- Ruled out is a form (opacity plus a diagonal strike), never colour alone.
- Flat, hairline-bordered cards; 44px touch targets throughout.

## Colors

Zinc neutrals on white (or near-black), one confident blue, and two state hues that belong to the algorithms.

### Primary
- **Action Blue** (`#1d4ed8` in both themes; `--accent`): primary buttons, the skip link, step badges, focus rings, the TOC's current marker, the active lesson's status dot, list markers, range inputs. Hover deepens to `#1e40af` (light) or lightens to `#2563eb` (night).
- **Blue Ink** (`#1d4ed8` light, `#93b4ff` night; `--accent-ink`): text in the accent: current top-nav link, active lesson title, current TOC entry, the hero's second line, level chip.
- **Blue Wash** (`#e0e9ff` light, `#172554` night; `--accent-soft`): the active lesson row and the level chip background.
- **Link Blue** (`#1d4ed8` light, `#8ab0ff` night; `--link`): inline links, underlined with a 3px offset.

### State colours (not accents)
- **Look Gold** (`--look` `#8a5e04` / `#fcd34d`, `--look-line` `#d4a12f` / `#b8924a`, `--look-fill` `#fde68a` / `#4a3a17`, `--look-soft` `#fef3c7` / `#33291a`, text `--on-look` `#3b2a04` / `#fef3c7`): the cell, node or line being looked at right now; the frontier in grid searches; the cell pointer.
- **Done Teal** (`--done` `#0f766e` / `#4f9c94`, `--done-fill` `#ccfbf1` / `#18332f`, `--visited` `#ecfdf9` / `#1f3a36`, `--on-done-fill` `#115e59` / `#8fd0c8`, `--on-done` `#ffffff` / `#0e1f1d`): found, moved, walked, visited, on the path, completed lessons, the hero check row.
- **Ruled out**: no hue. `opacity: 0.55` plus a 2px diagonal strike in `--faint`.
- **Danger** (`--danger` `#b91c1c` / `#ef4444`, `--danger-fill` `#fee2e2` / `#3a1f1b`, `--danger-ink` `#b91c1c` / `#fca5a5`): wrong quiz answers and warning callouts only.
- **Analogy Green** (`#15803d` / `#4ade80`) and **Orange** (`#c2410c` / `#fb923c`): callout tones, used sparingly.

### Neutral
- **Page** (`#ffffff` / `#0b0b0d`; `--page`): the page and the top bar (92% with a blur).
- **Surface** (`#f8f8f9` / `#111114`; `--surface`): the lesson tree, the lesson header card, demos, the closing band.
- **Raised** (`#ffffff` / `#18181b`; `--raised`): cards, buttons, inputs, figure cells, the search field.
- **Code** (`#f4f4f5` / `#18181b`; `--code-bg`) and **Hover** (`#f1f1f3` / `#1f1f23`; `--hover`).
- **Hairlines**: `--line` `#e4e4e7` / `#27272a` for every border, `--line-soft` `#efeff1` / `#1f1f23`, `--line-strong` `#d4d4d8` / `#3f3f46` for button borders, `--edge` `#a1a1aa` / `#52525b` for hovered borders and figure cells.
- **Ink**: `--ink-strong` `#09090b` / `#fafafa` headings, `--ink` `#18181b` / `#f4f4f5` UI text, `--ink-body` `#27272a` / `#d4d4d8` reading text, `--muted` `#52525b` / `#a1a1aa` leads and summaries, `--subtle` `#5c5c66` / `#a1a1aa` meta, `--faint` `#6b6b74` / `#8b8b94` indexes and the strike line.

### Named Rules
**The Blue Means Go Rule.** `--accent` marks navigation, actions, focus and "you are here". It is never a step state: no blue cell, node, bar or line in a figure or demo.

**The Fixed Vocabulary Rule.** Gold = being looked at, teal = done or on the path, faded and crossed out = ruled out. Same meaning in every lesson, every demo and both themes.

**The Form Not Hue Rule.** Every state is readable without colour: ruled-out cells carry the strike, done items carry a check, the current line carries a marker.

## Typography

**Display Font:** Geist Variable (with system-ui, -apple-system, Segoe UI, Roboto)
**Body Font:** Geist Variable
**Mono Font:** Geist Mono Variable (with ui-monospace, SFMono-Regular, Consolas)

**Character:** One neutral grotesque at different weights and tight negative tracking for headings; mono for anything typed or indexed. Ligatures are off in code, cells, pointers and badges so `<=` reads as typed.

### Hierarchy
- **Display** (600, `clamp(2.5rem, 5.6vw, 4.1rem)`, 1.04, -0.04em): the home hero only. The second line is a block span in `--accent-ink`, a solid colour.
- **Headline** (600, `clamp(2rem, 4vw, 2.6rem)`, 1.12, -0.03em): lesson h1.
- **Section** (600, `clamp(1.8rem, 3.4vw, 2.4rem)`, 1.15, -0.03em): home block headings and the closing band.
- **Title** (600, 1.6rem, 1.25, -0.022em): lesson h2; demo panel h2 at 1.45rem; h3 at 1.12rem; section card title 1.3rem.
- **Lead** (400, 1.16rem, 1.6, `--muted`): lesson lead and hero lead, max 34rem on home.
- **Body** (400, 1.06rem, 1.72, `--ink-body`): lesson paragraphs and lists, inside the 760px column.
- **UI** (500, 0.93-0.96rem): top nav, lesson tree, search, buttons. Section headings in the tree are 600.
- **Caption** (400, 0.82-0.9rem, `--subtle`/`--muted`): course meta, step-card summaries, footer, TOC (0.9rem).
- **Mono** (600 in cells, 0.78rem for array indexes): code, cell values, pointers, trace variables, `kbd`.

### Named Rules
**The One Family Rule.** Geist carries every role; contrast comes from weight (400/500/600), size and tracking, never from a second display face.

## Layout

- **Top bar:** sticky, 64px tall (56px on phones), page colour at 92% with `backdrop-filter: saturate(1.4) blur(10px)`, a bottom hairline. Brand, Course map, Lessons, then GitHub and the theme toggle pushed right. Side padding `clamp(16px, 3vw, 32px)`.
- **Shell:** `280px | 1fr` grid. The lesson tree is sticky under the bar (`top: 64px`, full remaining height) from 761px up. Home drops the tree to a single column.
- **Lesson column:** main padding `44px clamp(20px, 4vw, 48px) 72px`; content capped at 760px. From 1200px the layout becomes `760px | 220px` with a 56px gap, and the right column holds the sticky "On this page" TOC (`top: 96px`) with scroll-spy. Below 1200px the TOC hides and the lesson header shows a "Jump to" chip list instead.
- **Home:** max 1140px, centred. Hero padding `clamp(48px, 9vw, 104px) 0 clamp(40px, 6vw, 72px)`; two columns `1.15fr | 1fr` from 900px, stacked below. Blocks are separated by a top hairline and 56px of padding. Section cards: `repeat(auto-fit, minmax(260px, 1fr))`, 20px gap. Course map: `repeat(auto-fill, minmax(300px, 1fr))`, 10px gap.
- **Phones (760px and down):** one column, the lesson tree folds into a drawer, top nav keeps only the home link, GitHub hides, main padding `24px 16px 56px`.
- **Rhythm:** gaps of 4, 8, 14, 20, 28 and 56px. Every interactive row is at least 44px tall (tree rows 40px).

### Breakpoints
- **760px:** phone layout (JS matches `(min-width: 761px)`).
- **900px:** home hero goes two-column; hero cells grow to 48px.
- **1200px:** right-hand TOC appears; jump chips hide.
- **480px:** demo stage tightens its padding to fit seven cells on a 390px phone.

## Elevation & Depth

Flat by default. Surfaces separate by a 1px `--line` hairline and a tonal step (page, surface, raised), not by shadow. Lesson cards, demos, quizzes and callouts carry no shadow. Three exceptions, all on the home page or as hover feedback:

### Shadow Vocabulary
- **Search beam** (`--beam-core` `#ffffff`, `--beam-glow` `#3b82f6`, `--beam-haze` 22% light / 42% night): the home hero is a full-width band whose one authored moment is a 4px column of light falling on the middle cell of a drawn binary-search step, with layered blue glows, a pool where it lands, a haze at the band's foot, and a slow 4.8s breathe (off under reduced motion; hidden on phones). The beam is our own image: binary search looks at the middle.
- **Numbers panel:** four counts computed from the curriculum at render time (lessons, demos, quiz questions, minutes) in a 16px hairline panel tinted with faint blue and violet corners; 2×2 on phones. Every number is real.
- **Closing tiles and wordmark:** the closing band floats six section-mark tiles (hidden under 900px); the page ends with the name set very large at 12% opacity, fading out by mask into the footer.
- **Section card lift** (`box-shadow: 0 18px 40px -26px rgb(9 9 11 / 35%)`): section cards on hover only, with the border moving to `--edge`.
- **Banner mark** (`box-shadow: 0 10px 24px -12px rgb(0 0 0 / 35%)`): the frosted icon tile on section card banners.
- **Paper** (`--shadow-paper`): small figure values; night uses a deeper value.

### Named Rules
**The Hairline First Rule.** Reach for a border and a surface step before a shadow. A shadow is a response to hover or the one hero moment, not a resting state.

## Shapes

Gently rounded, docs-like. Cells 6-8px, controls and tree rows 8px, step cards, quizzes and lesson header 12px, demos 14px, the hero figure 16px, section cards 20px, the closing band 24px. Chips (level, jump links) are full pills. Status dots are circles (18px). Section card banners are three layered SVG wave bands clipped by the card's 20px corner, with a 72px frosted icon tile (18px radius) and a tab cut from the bottom-left corner (16px top-right radius) that carries the lesson count.

## Components

### Buttons
- **Shape:** 8px radius, 44px minimum height (48px with 20px side padding on the home page).
- **Primary:** `--accent` fill and border, `--on-accent` text, weight 600; hover moves to `--accent-hover`.
- **Secondary:** `--raised` fill, `--line-strong` border, `--ink-strong` text, weight 500; hover `--hover` fill and `--edge` border.
- **Done:** teal-tinted (`--done` 10% over raised, border 45%) with `--on-done-fill` text, for a completed action.
- **Icon button:** 44px square, transparent, `--hover` on hover.
- **Focus:** `outline: 2px solid var(--accent); outline-offset: 2px` on every focusable element.

### Chips
- **Jump to:** pills of `--raised` with a `--line` border, 44px tall; hover shifts the border to `--accent` and the text to `--accent-ink`.
- **Level:** small pill, `--accent-soft` fill, border 35% accent, `--accent-ink` text.

### Cards / Containers
- **Lesson header:** 12px, `--surface`, `--line` border, no shadow.
- **Demo:** 14px, `--surface`, `--line` border; the hero block of each lesson.
- **Prev / next step cards:** 12px, `--raised`, 16px 18px padding; a small "Previous"/"Next" caption, the lesson title (1.02rem/600) and a one-line summary in `--muted`. Hover turns the border `--accent`.
- **Section card:** 20px, `--raised`, wave banner 168px (140px on phones), count tab, title, summary, progress meta.
- **Course lesson:** 12px, `--raised`, status dot, title, summary, meta; hover border `--accent`.
- **Closing band:** 24px, `--surface` with a 12% accent radial wash from the top, centred heading, line, primary button.

### Inputs / Fields
- **Lesson search:** 44px, 8px radius, `--raised`, `--line` border, search icon and a `kbd` hint (`/`; Ctrl/Cmd+K also focuses it). Focus-within turns the border `--accent`.

### Navigation
- **Top nav:** 0.95rem links, 8px radius, `--hover` on hover, current page in `--accent-ink` 600.
- **Lesson tree:** collapsible `<details>` sections that expand in place (chevron rotates from -90deg, 160ms), section count in `--subtle`. Lessons sit on a 1px left rule; each row has an 18px status dot (empty ring, teal with a check when done) and a title in `--muted`. Active row: `--accent-soft` fill, `--accent-ink` title, and a blue ring on the dot.
- **On this page:** a 1px left rule; links in `--muted`, the current one gets a `--accent` left border and `--accent-ink` text via IntersectionObserver.
- **Footer:** page colour, top hairline, 1140px wide, `--subtle` note and `--muted` links (44px tall).

### Figure cells (signature)
- **Default:** 1.5px `--edge` border, 8px radius, `--raised`, Geist Mono 600, tabular numbers; index below in mono 0.78rem `--faint`.
- **Looking at:** `--look-line` border, `--look-fill`, `--on-look` text.
- **Found / on the path:** solid `--done` with `--on-done` text. **Moved / walked:** `--done-fill`.
- **Ruled out:** `opacity: 0.55` plus a 2px diagonal strike in `--faint`.
- **Motion:** 160ms ease on background, width and height, only under `prefers-reduced-motion: no-preference`.

### Icons
An authored 24px outline set (1.5px stroke, round caps and joins, `currentColor`), always `aria-hidden` beside a text label or an `aria-label`.

## Do's and Don'ts

### Do:
- **Do** keep gold for "being looked at", teal for "done / on the path" and faded-plus-struck for "ruled out", in every lesson and both themes.
- **Do** use `--accent` only for navigation, actions, focus and the current location.
- **Do** define every new colour as a role token with a light value on `:root` and a night value under both `prefers-color-scheme: dark` and `:root[data-theme="dark"]`.
- **Do** separate surfaces with a `--line` hairline and a tonal step before considering a shadow.
- **Do** keep interactive targets at 44px and focus rings at 2px `--accent` with a 2px offset.
- **Do** keep Geist and Geist Mono self-hosted through `@fontsource-variable`.

### Don't:
- **Don't** use blue as a step state in any figure, demo, trace or legend.
- **Don't** add eyebrow or kicker labels above headings.
- **Don't** use gradient text; the hero's accent line is a solid `--accent-ink`.
- **Don't** mark a state by colour alone.
- **Don't** add resting shadows to lesson cards, demos, quizzes or callouts.
- **Don't** load fonts or scripts from a CDN.

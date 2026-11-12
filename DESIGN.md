---
name: Simplified DSA
description: Margin Notes. Warm paper, a reading serif, and algorithms drawn step by step in the margin.
colors:
  page: "#f6f1e7"
  surface: "#efe7d8"
  sunken: "#fffdf8"
  raised: "#fffdf8"
  code-bg: "#efe6d4"
  hover: "#ebe1cd"
  line: "#dccfb8"
  line-soft: "#e7ddcb"
  line-strong: "#c4b498"
  edge: "#b5a68d"
  neutral-fill: "#c9bda8"
  accent-line: "#b8924a"
  ink-strong: "#1d1813"
  ink: "#2a241d"
  ink-body: "#2c261f"
  ink-code: "#3b3226"
  muted: "#574e40"
  subtle: "#645a4a"
  faint: "#6f6553"
  look: "#8a5e04"
  link: "#8a5600"
  look-line: "#c08f2c"
  look-fill: "#f4d58c"
  look-soft: "#fbecc6"
  on-look: "#2b1f04"
  done: "#0f6f68"
  done-fill: "#cde8e3"
  visited: "#e2f1ee"
  on-done-fill: "#0b4f4a"
  on-done: "#ffffff"
  danger: "#b03a2a"
  danger-fill: "#f7dcd6"
  danger-ink: "#9c2c1c"
  on-danger: "#ffffff"
  analogy: "#4b8650"
  analogy-ink: "#356b3b"
typography:
  display:
    fontFamily: "Fraunces Variable, Georgia, serif"
    fontSize: "clamp(2.3rem, 5vw, 3.6rem)"
    fontWeight: 620
    lineHeight: 1.04
    letterSpacing: "-0.025em"
  headline:
    fontFamily: "Fraunces Variable, Georgia, serif"
    fontSize: "1.6rem"
    fontWeight: 560
    letterSpacing: "-0.012em"
  title:
    fontFamily: "Fraunces Variable, Georgia, serif"
    fontSize: "1.12rem"
    fontWeight: 600
    letterSpacing: "-0.012em"
  lead:
    fontFamily: "Literata Variable, Georgia, Times New Roman, serif"
    fontSize: "1.24rem"
    lineHeight: 1.55
  body:
    fontFamily: "Literata Variable, Georgia, Times New Roman, serif"
    fontSize: "1.06rem"
    lineHeight: 1.72
  label:
    fontFamily: "system-ui, -apple-system, Segoe UI, Roboto, sans-serif"
    fontSize: "0.88rem"
    fontWeight: 400
  mono:
    fontFamily: "JetBrains Mono Variable, ui-monospace, SFMono-Regular, Consolas, monospace"
    fontSize: "0.84rem"
    fontFeature: "\"liga\" 0, \"calt\" 0"
rounded:
  bar: "4px"
  sm: "8px"
  control: "10px"
  card: "12px"
  panel: "16px"
  full: "999px"
spacing:
  xs: "4px"
  sm: "8px"
  md: "12px"
  lg: "18px"
  xl: "28px"
  2xl: "48px"
components:
  button-primary:
    backgroundColor: "{colors.look-fill}"
    textColor: "{colors.on-look}"
    rounded: "{rounded.control}"
    height: "44px"
  button-secondary:
    backgroundColor: "{colors.raised}"
    textColor: "{colors.ink}"
    rounded: "{rounded.control}"
    height: "44px"
  button-done:
    backgroundColor: "{colors.done-fill}"
    textColor: "{colors.on-done-fill}"
    rounded: "{rounded.control}"
    height: "44px"
  input:
    backgroundColor: "{colors.raised}"
    textColor: "{colors.ink-strong}"
    rounded: "{rounded.control}"
    height: "44px"
  lesson-card:
    backgroundColor: "{colors.sunken}"
    textColor: "{colors.ink-strong}"
    rounded: "{rounded.card}"
    padding: "14px 18px 16px"
  callout:
    backgroundColor: "{colors.sunken}"
    textColor: "{colors.ink-body}"
    rounded: "{rounded.card}"
    padding: "16px 18px 14px"
  cells-figure:
    backgroundColor: "{colors.sunken}"
    rounded: "{rounded.sm}"
    padding: "16px 16px 12px"
  array-cell:
    backgroundColor: "{colors.raised}"
    textColor: "{colors.ink-strong}"
    typography: "{typography.mono}"
    rounded: "{rounded.sm}"
  array-cell-look:
    backgroundColor: "{colors.look-fill}"
    textColor: "{colors.on-look}"
    rounded: "{rounded.sm}"
  array-cell-found:
    backgroundColor: "{colors.done}"
    textColor: "{colors.on-done}"
    rounded: "{rounded.sm}"
  demo:
    rounded: "{rounded.panel}"
    padding: "18px"
  step-badge:
    backgroundColor: "{colors.look-fill}"
    textColor: "{colors.on-look}"
    typography: "{typography.mono}"
    rounded: "{rounded.full}"
    height: "28px"
  quiz:
    backgroundColor: "{colors.sunken}"
    rounded: "{rounded.panel}"
    padding: "18px"
  quiz-option:
    backgroundColor: "{colors.raised}"
    textColor: "{colors.ink}"
    typography: "{typography.body}"
    rounded: "{rounded.card}"
    height: "44px"
  quiz-letter-right:
    backgroundColor: "{colors.done}"
    textColor: "{colors.on-done}"
    rounded: "{rounded.full}"
    size: "28px"
  quiz-letter-wrong:
    backgroundColor: "{colors.danger}"
    textColor: "{colors.on-danger}"
    rounded: "{rounded.full}"
    size: "28px"
  lesson-link:
    textColor: "{colors.ink-strong}"
    rounded: "{rounded.sm}"
    padding: "9px 10px 9px 6px"
  lesson-link-hover:
    backgroundColor: "{colors.hover}"
  lesson-step:
    backgroundColor: "{colors.sunken}"
    textColor: "{colors.ink}"
    rounded: "{rounded.card}"
    padding: "12px"
---

# Design System: Simplified DSA

## Overview

**Creative North Star: "Margin Notes"**

A lesson is a page of a good textbook that someone has worked through in pencil. The reading column stays calm: warm paper, a bookish serif at a long-form measure, quiet ink. The frame carries the world: the contents list in the margin, the lesson card under the title, figures of arrays drawn on paper cards, and the demo, which is the hero block of every lesson. Everything the learner should notice is drawn the way a careful note-taker would mark a page: a gold highlight for what is being looked at, a teal tick for what is settled, a faded strike-through for what has been ruled out.

The system ships in two themes from one set of semantic roles. Paper (light) is the default; Night, the project's original warm-dark palette, follows the reader's system setting. Roles never change meaning between themes; only their values do.

Density is low and patient, built for a beginner on a phone between classes. Depth is paper laid on paper, never glass or glow. Motion is barely there and only for people who have not asked to reduce it.

**Key Characteristics:**
- Warm paper and dark-brown ink; no pure white, no pure black.
- Three serif-adjacent voices: Literata to read, Fraunces to title, JetBrains Mono for code and values only, plus a system sans for small labels.
- One state scale across every figure and demo: look (gold), done (teal), ruled out (faded and crossed out).
- State is always carried by form or words as well as colour.
- Paper cards with one soft shadow; demos and quizzes are the largest, roundest cards.
- An authored line-icon set in the Iconly Light Outline style, always beside words.

## Colors

A warm, low-chroma paper palette with two state accents (gold and teal) and one warning red.

### Primary
- **Pencil Gold** (look): the "being looked at" state and the system's focus colour. Focus rings, active pointer labels, the current lesson's ring, live variable values in the tracer. Night value #f1cd86.
- **Highlighter Gold** (look-fill, with look-line as its edge and on-look as its ink): the filled form of "being looked at". Array cells under inspection (including mid), the current pseudocode line, the step badge, the primary demo button, text selection. Night values #4a3a17 / #b8924a / #fbf0d6.
- **Soft Highlight** (look-soft): the lightest gold, for waiting or frontier cells in graph demos. Night #33291a.
- **Burnt Gold Link** (link): body links and the range slider accent. Night #d9b36a.

### Secondary
- **Ledger Teal** (done, with on-done as its ink): moved, done, found, final place, path. Found cells, sorted bars, path cells, the done status dot, the correct quiz chip and mark. Night #4f9c94 / #0e1f1d.
- **Teal Wash** (done-fill, with on-done-fill as its ink): the filled-but-quiet form of done: moved cells, the "Completed" button, When-to-use-it and Interview-tip callout tags. Night #18332f / #8fd0c8.
- **Visited Wash** (visited): cells a search has already visited. Night #1f3a36.

### Tertiary
- **Correction Red** (danger, danger-fill, danger-ink, on-danger): wrong quiz answers, Watch-out callouts, input errors. Night #c4574a / #3a1f1b / #ec9a8f / #fff4f2.
- **Margin Green** (analogy, analogy-ink): the Analogy callout only. Night #6aa36f / #9bd09f.

### Neutral
- **Paper** (page): the page itself. Night #11110f.
- **Desk** (surface): the sidebar and the demo base. Night #171612.
- **Fresh Sheet** (sunken / raised): cards, figures, inputs and buttons sit on this lighter sheet. Night #191711 / #1d1b16.
- **Code Paper** (code-bg): inline code and code blocks. Night #201d17.
- **Thumb Mark** (hover): hover fill in the contents list. Night #272318.
- **Rules** (line-soft, line, line-strong, edge): hairlines from quietest to firmest; edge outlines array cells. Night #2a2721 / #302d26 / #3a352b / #4a4436.
- **Graphite Fill** (neutral-fill): unsorted bars and walls. Night #5a523f.
- **Brass Rule** (accent-line): hover edges on quiz options and footer links. Night #7b6842.
- **Inks** (ink-strong, ink, ink-body, ink-code): headings, UI text, the reading column, code. Night #f5f0e6 / #ece8dd / #ddd5c6 / #eadfc9.
- **Pencil Greys** (muted, subtle, faint): secondary text, metadata, line numbers and the ruled-out stroke. Night #bdb3a3 / #a99f8d / #8f8676.

### Named Rules
**The Same Meaning Rule.** Gold means "being looked at" and teal means "moved, done, found or on the path" in every figure, demo, legend and list, in both themes. A new demo maps its states onto these roles; it never introduces a new state colour.

**The Two Themes, One Role Rule.** Every colour is used through its semantic role, never as a literal hex in a component. Paper is defined on the root; Night redefines the same roles under the dark colour-scheme query.

## Typography

**Display Font:** Fraunces Variable (with Georgia, serif)
**Body Font:** Literata Variable (with Georgia, Times New Roman, serif)
**Label Font:** system UI sans (system-ui, -apple-system, Segoe UI, Roboto)
**Mono Font:** JetBrains Mono Variable (with ui-monospace, Consolas)

All three families are self-hosted variable fonts; nothing is fetched from a font CDN.

**Character:** Literata is a reading face made for long screen text; Fraunces gives titles a soft, inked, slightly old-style voice; the system sans keeps small labels quiet and native; JetBrains Mono shows code exactly as typed.

### Hierarchy
- **Display** (Fraunces 620, clamp(2.3rem, 5vw, 3.6rem), line-height 1.04, balanced): the lesson title, the single h1 on every page.
- **Headline** (Fraunces 560, 1.6rem; 1.5rem for demo headings): lesson sections and the demo panel heading.
- **Title** (Fraunces 560-600, 1.12rem): h3 and quiz questions; the site title and section names in the contents list also use the display face.
- **Lead** (Literata, 1.24rem, line-height 1.55; 1.12rem on phones): the one-paragraph promise directly under the h1.
- **Body** (Literata, 1.06rem, line-height 1.72, column capped at 72ch): the reading column. Callout and figure text step down to 1rem / 1.6.
- **Label** (system sans, 0.8-0.88rem): lesson metadata, callout tags, legends, button text, counts, status text.
- **Mono** (JetBrains Mono, 0.84rem; 600 weight in array cells, 700 in the step badge): code, pseudocode, variable names and values, array values, pointer labels.

### Named Rules
**The Typed Code Rule.** Mono text never uses ligatures: liga and calt are off on code, array values, pointer labels, the tracer's variables and the step badge, so a beginner reads `<=` and `==` as typed.

**The Mono Is For Values Rule.** JetBrains Mono appears only on code and values. Prose, captions, questions and labels are never set in mono.

## Layout

A two-column shell on wide screens: a 300px contents sidebar beside a lesson column (main up to 980px, padding 48px with clamp(20px, 5vw, 72px) sides; reading column and demo panel capped at 72ch). From 761px up the sidebar is sticky at full viewport height and scrolls on its own.

At 760px and below the shell becomes one column: the contents list folds into a "Lessons" drawer bar (a native details element, 48px tall, with the current lesson's name truncated beside it), so the lesson starts on the first screen. Main padding becomes 30px 16px. The tracer stacks code above variables, and previous/next links stack. At 480px and below, worked figures tighten (4px cell gap, 38px minimum cell) so seven cells fit inside the card, and the speed control takes its own row.

Spacing is an organic rhythm rather than a strict scale: small gaps of 4-12px inside components, 18px card padding, 26-30px between blocks, 42-48px before major sections and demos. Wide pictures and long pseudocode scroll inside their own panel; the page never scrolls sideways.

**The Calm Column Rule.** The reading column carries no decoration; the frame (sidebar, lesson card, figures, demo, quiz) carries the world.

## Elevation & Depth

Depth is paper laid on paper. Flat tonal layers do most of the work (Paper page, Desk surface, Fresh Sheet cards), and one soft shadow lifts the cards that hold a lesson's working: the lesson card, figures, demo stages, the demo panel and the quiz.

### Shadow Vocabulary
- **Paper** (`box-shadow: 0 1px 0 rgb(60 45 20 / 6%), 0 8px 24px -12px rgb(60 45 20 / 22%)`; Night: `0 1px 0 rgb(0 0 0 / 30%), 0 10px 28px -14px rgb(0 0 0 / 60%)`): a sheet resting on the desk. The only elevation in the system.

### Named Rules
**The One Sheet Rule.** There is exactly one shadow, and it means "a sheet of paper on the page". No hover lifts, no glows, no hard offset shadows.

## Shapes

Soft, friendly corners that grow with the container: 4px for bars and grid cells, 8px for array cells, figures and contents-list rows, 10px for demo buttons and inputs, 12px for cards, callouts and quiz options, 16px for the demo and quiz panels. Fully round forms (999px) are reserved for counters and marks: the step badge, quiz letter chips, the Correct / Not this one marks, the level pill and status dots. Borders are 1px hairlines; array cells and the state dots use a firmer 1.5px edge, like a drawn box.

**The Crossed-Out Rule.** Ruled out is a shape, not only a colour: the cell drops to 55% opacity and a 2px diagonal stroke in the faint ink crosses it, the way a note-taker strikes a candidate off.

## Components

### Buttons
Tactile and plain: a labelled control on paper.
- **Shape:** gently rounded (10px), minimum 44px tall; icon-only First is 44px square.
- **Primary** (Play, Mark as complete): highlighter gold fill with a gold edge, dark gold ink, weight 600.
- **Secondary** (Back, Step, First, reset): fresh-sheet fill, firm hairline edge, ink text, system sans.
- **Done** ("Completed"): teal wash with deep teal ink and a check icon.
- **Focus:** a 2px gold outline offset 2px on every interactive element (focus-visible only). Hover changes colour only, in 140ms.

### Inputs / Fields
- **Style:** fresh-sheet fill, firm hairline, 10px corners, 44px tall, strong ink. In demos "Your list" sits in its own row with its button and wraps under only when needed.
- **Error:** the message turns danger ink; it reads as a mistake, not as a result.

### Lesson Opener and Lesson Card
The page opens on the h1 and the lead paragraph, then a margin note: a fresh-sheet card (12px, Paper shadow) holding the section, "Lesson n of m", reading time, a teal-outlined level pill (system sans) and "You will be able to:" goals. The page never opens on admin text.

### Callouts
A tinted note, never a side stripe. Each type sets one tone: the card is a 7% tint of it over fresh sheet, the border a 35% mix of it into the hairline. A small tag in the tone's own ink (16% tone background, 6px corners, 0.8rem, weight 700, sentence case) names the type: Analogy (margin green), Key idea (gold), When to use it and Interview tip (teal), Watch out (red).

### Cells Figure
Arrays drawn on paper: a fresh-sheet card with the Paper shadow, a row of mono value boxes (1.5px edge, 8px corners), gold mono pointer labels above, and a serif caption. State uses the one scale: look = gold fill, found = solid teal, moved = teal wash, ruled out = faded and crossed out.

### Demo Panel (signature)
The hero block of a lesson. A 16px panel tinted 5% gold over the desk, with the Paper shadow and 18px padding. Inside, in order: toolbar rows (inputs first, then the list row with its button), the stage (a fresh-sheet card that scrolls sideways internally), a colour legend in system sans with 14px swatches that use the same state forms, the step player, the caption and the tracer.
- **Player:** First, Back, Play/Pause (primary), Step, a speed slider and a step count. Arrow keys work too.
- **Step badge:** every caption starts with a round highlighter-gold badge holding the step number in mono, like a numbered fold. Screen readers hear "Step n of m".
- **Tracer:** pseudocode with line numbers beside live variables, both on fresh sheet; the running line is a full highlighter-gold band; variable values are gold mono.

### Quiz
A 16px fresh-sheet panel with the Paper shadow. The question is in Fraunces. Options are 12px serif rows (min 44px) led by a round letter chip (A, B, C, 28px, 1.5px edge, system sans 700). After an answer the chip fills teal or red and a written pill mark appears at the row's end: "Correct" or "Not this one". Feedback is announced politely.

### Navigation (contents list)
A quiet table of contents, not a stack of cards. Section rows (44px+, Fraunces 600) with a lesson count; lessons hang off a 1px hairline rule, each with a title and a one-line summary. One 20px status dot per lesson: hollow ring = not yet, gold ring with a gold centre = you are here, solid teal with a white check = done. Hover is the thumb-mark fill; the active row is a 12% gold tint. Below 761px it lives in the Lessons drawer.

### Lesson Footer
"Mark as complete" (primary, becoming Done once pressed), then previous and next lesson links as two 12px fresh-sheet cards with an arrow icon and label in system sans and the lesson title below.

### Icons
An authored set drawn in the Iconly Light Outline style: 24px grid, 1.5px stroke (2.2px when shrunk inside a status dot or on the complete button), round caps and joins, stroke in currentColor, sized at 1.15em. Icons are decorative (aria-hidden) and always sit beside a word, except First, which carries an aria-label.

## Do's and Don'ts

### Do:
- **Do** map every new demo state onto look (gold), done (teal) or ruled out (faded and crossed out), and show it in the legend with the same form.
- **Do** carry state in form or words as well as colour: the crossed-out cell, the check in the done dot, the gold ring, the "Correct" / "Not this one" marks, the screen-reader step count.
- **Do** keep text pairs at WCAG AA in both themes (paper ink on page is 13.6:1, faint on page 5.1:1, gold on desk 4.6:1, white on teal 6.0:1).
- **Do** give every control a 44px target, a visible gold focus ring, and keep the skip link and a single h1 on every page.
- **Do** gate every transition behind a no-preference reduced-motion query, animate only colour and bar size (140-160ms ease), and never move layout.
- **Do** draw new icons in the Iconly Light Outline grammar and put a word beside them.

### Don't:
- **Don't** use side-stripe borders on callouts, cards or alerts; tint the whole note instead.
- **Don't** put eyebrow or kicker labels above headings, and don't use uppercase tracked labels.
- **Don't** use text glyphs or emoji as icons; use the authored SVG set.
- **Don't** set prose, captions or questions in mono.
- **Don't** add a second shadow, a glow or a hard offset shadow.
- **Don't** introduce a new state colour or let gold and teal swap meanings between demos.

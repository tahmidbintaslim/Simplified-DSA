# CSS Guide

CSS controls how the app looks. This project uses one main file:

```text
src/style.css
```

## How CSS Works

HTML gives structure:

```html
<aside class="lesson-sidebar"></aside>
```

CSS styles that structure:

```css
.lesson-sidebar {
  background: #171612;
  padding: 28px 20px;
}
```

The dot means class selector. `.lesson-sidebar` targets every element with `class="lesson-sidebar"`.

## Layout

The main app uses CSS Grid:

```css
.app-shell {
  display: grid;
  grid-template-columns: 300px minmax(0, 1fr);
}
```

This creates:

- A left sidebar that is `300px` wide.
- A main content area that uses the remaining space.

On small screens, the layout becomes one column:

```css
@media (max-width: 760px) {
  .app-shell {
    grid-template-columns: 1fr;
  }
}
```

## Naming

Use names that describe purpose:

```css
.lesson-sidebar {}
.lesson-content {}
.section-button {}
```

Avoid names that describe appearance only:

```css
.big-box {}
.brown-thing {}
.cool-card {}
```

## Spacing

Use consistent values:

```css
8px
12px
16px
20px
28px
48px
```

Do not invent random spacing for every component.

## Beginner Rule

When adding CSS, ask:

1. What HTML element am I styling?
2. Is the class name clear?
3. Does this work on mobile?
4. Can I remove any decoration?

## When To Add Comments

Add comments for layout decisions that may confuse beginners.

Good:

```css
/* Sidebar and lesson content sit side by side on desktop. */
.app-shell {
  display: grid;
}
```

Bad:

```css
/* This changes the color. */
color: #ece8dd;
```

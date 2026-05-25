# JavaScript and OOP Guide

This project uses modern JavaScript with ES modules and small classes.

## What Is A Class?

A class is a blueprint for an object. It groups data and behavior that belong together.

```javascript
class Lesson {
  constructor(title) {
    this.title = title;
  }

  printTitle() {
    console.log(this.title);
  }
}

const lesson = new Lesson('Arrays');
lesson.printTitle();
```

In this example:

- `Lesson` is the class.
- `constructor` runs when a new lesson is created.
- `this.title` stores data on the object.
- `printTitle()` is behavior.

## How OOP Works In This Project

`App` is the main class. It owns the current UI state and decides what to render.

Current state:

```javascript
this.activeSectionId = 'data-structures';
this.activeLessonId = 'arrays-and-strings';
```

Rendering:

```javascript
this.render();
```

Events:

```javascript
this.bindEvents();
```

The class keeps related behavior in one place:

- Which section is active
- Which lesson is active
- What HTML should be shown
- What happens when a button is clicked

## Clean Code Rules

### Use Clear Names

Good:

```javascript
selectLesson(lessonId) {}
```

Bad:

```javascript
doThing(x) {}
```

### Keep Functions Small

A method should do one clear job.

Good:

```javascript
renderLessonHeader() {}
renderLessonMenu(section) {}
```

Bad:

```javascript
renderEverythingAndHandleClicksAndLoadData() {}
```

### Avoid Repetition

If the same logic appears in many places, move it into one helper.

Example:

```javascript
get activeSection() {
  return this.sections.find((section) => section.id === this.activeSectionId);
}
```

Now other methods can use `this.activeSection` instead of repeating the search.

### Comments Explain Why

Good comment:

```javascript
// Event delegation keeps one listener on the root instead of one listener per button.
```

Bad comment:

```javascript
// Set activeLessonId to lessonId.
this.activeLessonId = lessonId;
```

## Module Rules

Use `export` when another file needs something:

```javascript
export class App {}
```

Use `import` to bring it into another file:

```javascript
import { App } from './core/App.js';
```

Keep imports at the top of the file.

## When To Create A New Class

Create a class when one concept has both state and behavior.

Good future examples:

- `ArrayVisualizer`
- `LessonProgress`
- `QuizSession`
- `CodeRunner`
- `LanguageExamplePanel`

Do not create a class for one tiny function. Use a function instead.

## Current OOP Pattern

`App` currently renders the page, listens for clicks, and chooses active lesson/language state.

When this grows, split behavior into new classes:

- `App` coordinates screens.
- `MarkdownRenderer` renders lesson text.
- Future `LanguageExamplePanel` can own language tab rendering.
- Future `CodeRunner` can own editor input and execution status.

Do not split early. Split when one class becomes hard for beginners to read.

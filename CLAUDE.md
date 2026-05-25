# www-grumpycorp-com — Claude Instructions

## Code Style

### Always run lint and build after changes

After making changes (or when checking on things), always run:

```
npm run build && npm run format:fix && npm run lint
```

### Section header comments

Use blank `//` lines above and below the header text to visually separate logical sections within a file:

```typescript
//
// Section name
//
```

For indented contexts (e.g. class members), indent all three lines to match:

```typescript
class MyClass {
  //
  // Section name
  //
  memberMethod() {}
}
```

### Control constructs always use braces

All `if`, `for`, `while`, etc. bodies must use braces, even single-line bodies and `continue`/`break` statements.

### Prefer prefix increment/decrement

Use `++i` / `--i` rather than `i++` / `i--` in loop update expressions.

### Avoid threading shared parameters — use closures instead

When a set of helper functions all share a common parameter, capture it as a closure variable rather than threading it through every function signature. Nest the helpers inside the function that owns the shared value so they close over it naturally.

### CSS property grouping

Within each CSS block, properties are organized into up to five groups (only include groups that have properties), separated by blank lines, in this order:

1. **Text** — typeface, size, weight, line-height, letter-spacing, alignment, color, decoration, text-transform, text-rendering
2. **Positioning** — padding, margin, scroll-margin, position mode (`fixed`/`absolute`/`sticky`/`relative`), offset (`inset-*`, `top-*`, etc.), `z-index`
3. **Sizing** — `w-*`, `h-*`, `size-*`, `max-w-*`, `min-w-*`, `max-h-*`, `min-h-*`, `aspect-ratio`
4. **Outer** — borders, shadows, opacity, transitions/animations, cursor
5. **Inner** — background (`bg-*`), display mode, flex/grid config, alignment, gap, overflow, float

**Comment rule for text-group lines:** Every property in a text `@apply` line gets an inline `/* label */` comment identifying what it controls. Labels: `/* font */`, `/* size */`, `/* weight */`, `/* line height */`, `/* letter spacing */`, `/* color */`, `/* alignment */`, `/* decoration */`, `/* case */`, `/* rendering */`. Multi-purpose utilities (e.g. `text-reset`, `heading-reset`) list what they cover: `/* font, weight, size, line height, letter spacing, color */`.

Each group is prefixed with a `/* GroupName */` comment line. If a block only uses one group, omit the comment.

```css
/* Example */
.my-block {
  /* Text */
  @apply text-xl /* size */ font-normal /* weight */ leading-snug /* line height */ tracking-tight /* letter spacing */;
  @apply text-muted /* color */;

  /* Positioning */
  @apply px-6 py-4;

  /* Sizing */
  @apply max-w-lg;

  /* Outer */
  @apply border border-line;

  /* Inner */
  @apply bg-panel;
  @apply grid gap-4 items-start;
}
```

**Placement of ambiguous properties:**

- `translate-*` / `-translate-*` → Outer (animation/hover effect, not layout flow)
- `transition`, `animation`, `cursor-*` → Outer
- `fixed`, `inset-*`, `z-*` → Positioning
- `list-style-type` → Text
- `scroll-behavior` → Positioning

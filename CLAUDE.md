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

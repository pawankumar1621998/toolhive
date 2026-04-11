# ToolHive — Required Dependencies

Run this command from the project root before building:

```bash
npm install \
  zustand \
  nanoid \
  class-variance-authority \
  clsx \
  lucide-react \
  framer-motion \
  geist
```

## Package rationale

| Package | Version | Purpose |
|---|---|---|
| `zustand` | ^5 | Tool upload/processing state (avoids Context re-render cascade) |
| `nanoid` | ^5 | Unique file IDs in toolStore |
| `class-variance-authority` | ^0.7 | Type-safe component variant API |
| `clsx` | ^2 | Conditional className merging |
| `lucide-react` | ^0.500+ | Icon library (tree-shaken) |
| `framer-motion` | ^11 | Hero animations, page transitions |
| `geist` | ^1 | Geist Sans + Geist Mono fonts via next/font |

## Notes

- `tailwindcss` v4 is already installed — do NOT install `tailwindcss` v3
- `tailwind.config.ts` does not exist in this project — Tailwind v4 is configured entirely via `src/app/globals.css` using `@theme`
- `darkMode: 'class'` is not needed in Tailwind v4 — dark mode uses the `.dark` CSS class via `@variant dark`; add `@variant dark (&:where(.dark, .dark *));` in globals.css if variant issues arise
- `cva` + `clsx` together replace all inline conditional class logic

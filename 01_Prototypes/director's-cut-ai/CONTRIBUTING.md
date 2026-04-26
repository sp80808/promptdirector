# Contributing to Cinematic.AI Studio

Thank you for your interest in contributing to Cinematic.AI Studio! We are building a high-end tool aimed at professional filmmakers, and code quality, styling, and architectural integrity are our top priorities.

## 🤝 How to Contribute

### 1. Branch Naming
- Features: `feature/your-feature-name`
- Bugfixes: `fix/your-bugfix-name`
- Refactors: `refactor/your-refactor-name`

### 2. Code Style & Architecture
- **Strict Typing:** We use TypeScript strictly. Define your interfaces in `store.ts` or a global `types.ts` file if necessary. Never use `any` unless absolutely unavoidable.
- **State Management:** All global application state must live in `zustand` (`src/store.ts`). Avoid prop-drilling more than 2 levels. Use shallow equality checks where rendering performance dictates.
- **eCoT (Embedded Chain of Thought):** Any complex logic, state mutation, or prompt-assembly algorithm MUST be accompanied by an `/* eCoT: [Description] */` comment. This explains the *why* before the *how*, helping future maintainers understand your intent.
- **Styling:** Use Tailwind CSS exclusively. Maintain the strict dark-mode color schema (use Hex codes like `#121212`, `#1A1A1A`, `#222` and slate/orange accents as seen in the rest of the application).
- **Icons:** We use `lucide-react`. Ensure stroke widths and sizes match the surrounding UI (usually `w-3 h-3` or `w-4 h-4`).

### 3. Creating a Pull Request
1. Ensure your code passes all lint checks (`npm run lint`).
2. Verify that there are no TypeScript compiler errors (`npx tsc --noEmit`).
3. Add a description to your PR outlining what issue is being fixed and verify the visual layout hasn't broken in the NLE view.
4. Request review from project maintainers.

## 🐛 Reporting Bugs
Ensure you provide:
1. Environment description (Browser, OS).
2. Steps to reproduce the bug.
3. Expected vs Actual Result.
4. Relevant screenshots of the NLE interface.

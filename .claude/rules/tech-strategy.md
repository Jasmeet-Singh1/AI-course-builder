# Tech Strategy

## Compliance
Use what is listed here. If a task seems to need something else, say so in the spec and wait for approval.

## Stack
| Area | Choice | Notes |
|---|---|---|
| Framework | Next.js 16 App Router, React 19 | Server code goes in route handlers (`app/api/**/route.js`) or server components |
| Language | JavaScript (JSX). TypeScript allowed for new files | Don't convert existing files unless the spec says so |
| Styling | Tailwind 4, shadcn/Radix in `components/ui/` | Reuse `components/ui/*` before writing new primitives |
| Auth | Clerk (`@clerk/nextjs`) | Server: `auth()` / `currentUser()` from `@clerk/nextjs/server` |
| AI | `@google/generative-ai`, model `gemini-2.5-flash`, JSON mode | All calls belong on the server (see `security.md`) |
| Storage | `lib/courseStore.js` → `data/courses.json` | Prototype only. The next step is Postgres. Keep all storage access behind `courseStore` functions so swapping is one file |
| Validation | Hand-written in `lib/courseSchema.js` | No dependency needed at this size. Consider `zod` if schemas multiply |
| Tests | Vitest (`npm test`), files in `tests/` | AI calls are tested with an injected `callModel` fake, never the network |

## Environment Variables
| Name | Scope | Purpose |
|---|---|---|
| `GEMINI_API_KEY` | server only | Gemini API key, read in `lib/courseGenerator.js` |
| `NEXT_PUBLIC_GEMINI_API_KEY` | **legacy name, being retired** | Read server-side only as a fallback until `.env.local` is renamed. Never reference it in client code |
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`, `CLERK_SECRET_KEY` | public / server | Clerk |

Never read, print or edit `.env*` files. Ask the user to change env values.

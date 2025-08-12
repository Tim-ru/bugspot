bugspot

Quick start (Mock mode)

- Install deps: `npm i`
- Start dev UI with mock API: set `VITE_USE_MOCK=true` (create `.env.local`) and run `npm run dev`
- Optional: run server in parallel `npm run dev:full` (UI already works without it in mock mode)

Embedding the widget locally

- Build widget: `npm run build:widget`
- Serve `dist/widget.js` or rely on dev server at `http://localhost:5173/widget.js`
- Use snippet from `Dashboard` → Quick Integration section

Notes

- Mock API intercepts `/api/*` requests when `VITE_USE_MOCK=true`
- Widget falls back to localStorage if network/API unavailable

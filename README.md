# Cultivation (Local + Electron)

This project now runs fully **local-first**:
- data persistence is handled by `localStorage` via `src/api/localApi.js`
- no remote SDK/service dependency is required for app behavior

## Run as web app (dev)

```bash
npm install
npm run dev
```

## Run as Electron app (dev)

```bash
npm install
npm run electron:dev
```

## Run built Electron shell against production bundle

```bash
npm run electron:dist
```

## Tech notes

- React + Vite frontend
- Electron main process in `electron/main.cjs`
- Electron preload bridge in `electron/preload.cjs`
- Hash routing is used so deep links work in desktop/file contexts.

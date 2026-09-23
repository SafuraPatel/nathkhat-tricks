# Rules: View State Persistence & Instant Live Deployment

## 1. View & Navigation State Persistence Across Refreshes
- **Preserve Active Section**: Whenever a user navigates between views, tabs, or modal sections (e.g., Topics, Notes, Bin), persist the active view in `localStorage` and/or `window.location.hash`.
- **Restore on Reload**: On page initialization (`initApp` / DOM load), restore the exact section, tab, and filter that the user had active before refreshing, instead of resetting them to the home screen.
- **Scroll Memory**: If a user was interacting with a specific item or section, retain their context seamlessly.

## 2. Zero-Stale-Cache Deployment & Fast Propagation
- **HTML Caching Invariant**: HTML files (`/*` and `/index.html`) must always be served with `Cache-Control: public, max-age=0, must-revalidate` so browsers instantly fetch the latest deployment.
- **Asset Versioning**: Core CSS and JS files must have explicit cache-busting query strings (e.g. `?v=X.Y`) or content hashes.
- **Avoid Long Immutable Cache on Raw Assets**: Never use `max-age=31536000, immutable` on unhashed file paths, as this prevents mobile and desktop browsers from seeing new features until manual cache wipes.

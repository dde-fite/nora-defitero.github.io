// Detects whether the browser can use an SVG filter as the value of
// `backdrop-filter: url(#id)` — a Chromium-only capability. Everything else
// falls back to a plain blur + saturate.
export function supportsBackdropFilterUrl(): boolean {
  if (typeof window === 'undefined') return false;
  const chrome = (window as Window & { chrome?: unknown }).chrome;
  if (!chrome) return false;
  const testEl = document.createElement('div');
  testEl.style.backdropFilter = 'url(#test)';
  return testEl.style.backdropFilter.includes('url');
}
/** Sync layout viewport height for the app shell (mobile Safari / standalone). */
export function syncAppViewportHeight(): void {
  const inner = window.innerHeight;
  const vv = window.visualViewport;
  // visualViewport.height excludes chrome; innerHeight is the layout viewport. Using only vv
  // leaves a strip below the app (html shorter than the painted area). Max fills that gap.
  const h = vv != null ? Math.max(inner, vv.height) : inner;
  document.documentElement.style.setProperty("--app-vh", `${h}px`);
}

export function subscribeAppViewportHeight(): () => void {
  syncAppViewportHeight();
  const onChange = () => syncAppViewportHeight();
  window.addEventListener("resize", onChange);
  window.visualViewport?.addEventListener("resize", onChange);
  window.visualViewport?.addEventListener("scroll", onChange);
  return () => {
    window.removeEventListener("resize", onChange);
    window.visualViewport?.removeEventListener("resize", onChange);
    window.visualViewport?.removeEventListener("scroll", onChange);
  };
}

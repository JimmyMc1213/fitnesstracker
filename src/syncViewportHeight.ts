/** Sync layout viewport height to the visible viewport (esp. mobile Safari / standalone). */
export function syncAppViewportHeight(): void {
  const h = window.visualViewport?.height ?? window.innerHeight;
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

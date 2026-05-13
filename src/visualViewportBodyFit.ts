/**
 * iOS Safari keeps a "layout viewport" that does not shrink to match the
 * visible viewport while the URL bar / bottom toolbar are shown. That makes
 * `position: fixed; inset: 0` sized to an area taller than what's actually
 * visible, so shell content overlaps the toolbar or leaves odd gaps — but a
 * home-screen Web App hides that chrome, which is why standalone can look fine
 * on another site while Safari tabs stay broken unless the shell pins to the
 * visual viewport.
 */
export function attachVisualViewportBodyFit(): () => void {
  const vv = window.visualViewport;
  const body = document.body;
  if (!vv || !body) return () => {};

  const sync = () => {
    body.style.position = "fixed";
    body.style.left = `${vv.offsetLeft}px`;
    body.style.top = `${vv.offsetTop}px`;
    body.style.width = `${vv.width}px`;
    body.style.height = `${vv.height}px`;
    body.style.right = "auto";
    body.style.bottom = "auto";
  };

  sync();
  vv.addEventListener("resize", sync);
  vv.addEventListener("scroll", sync);
  /** `resize` misses some rotate / safe-area transitions in edge cases */
  window.addEventListener("orientationchange", sync);

  return () => {
    vv.removeEventListener("resize", sync);
    vv.removeEventListener("scroll", sync);
    window.removeEventListener("orientationchange", sync);
    for (const p of ["left", "top", "width", "height", "right", "bottom"] as const) {
      body.style.removeProperty(p);
    }
  };
}

/** Debug-only layout metrics for dead-space investigation. */

function sendLog(hypothesisId: string, location: string, data: Record<string, unknown>) {
  // #region agent log
  fetch("http://127.0.0.1:7458/ingest/51ef13ab-4b59-476b-bf22-1ccd10b1dca8", {
    method: "POST",
    headers: { "Content-Type": "application/json", "X-Debug-Session-Id": "291612" },
    body: JSON.stringify({
      sessionId: "291612",
      location,
      message: "layout metrics",
      data,
      hypothesisId,
      runId: "post-fix",
      timestamp: Date.now(),
    }),
  }).catch(() => {});
  // #endregion
}

export function rectMetrics(el: Element | null | undefined) {
  if (!el) return null;
  const r = el.getBoundingClientRect();
  return { top: Math.round(r.top), bottom: Math.round(r.bottom), height: Math.round(r.height), width: Math.round(r.width) };
}

export function readSafeAreaInsets() {
  const probe = document.createElement("div");
  probe.style.cssText =
    "position:fixed;visibility:hidden;padding:env(safe-area-inset-top) env(safe-area-inset-right) env(safe-area-inset-bottom) env(safe-area-inset-left)";
  document.body.appendChild(probe);
  const cs = getComputedStyle(probe);
  const insets = {
    top: cs.paddingTop,
    right: cs.paddingRight,
    bottom: cs.paddingBottom,
    left: cs.paddingLeft,
  };
  probe.remove();
  return insets;
}

export function readViewportMetrics() {
  const vv = window.visualViewport;
  return {
    innerHeight: window.innerHeight,
    innerWidth: window.innerWidth,
    docClientHeight: document.documentElement.clientHeight,
    bodyClientHeight: document.body.clientHeight,
    vvHeight: vv?.height ?? null,
    vvOffsetTop: vv?.offsetTop ?? null,
  };
}

export function logOnboardingLayout(
  location: string,
  hypothesisId: string,
  els: {
    flow?: Element | null;
    shell?: Element | null;
    body?: Element | null;
    footer?: Element | null;
    step: number;
  },
) {
  const shellStyle = els.shell ? getComputedStyle(els.shell) : null;
  const footerStyle = els.footer ? getComputedStyle(els.footer) : null;
  sendLog(hypothesisId, location, {
    step: els.step,
    viewport: readViewportMetrics(),
    safeArea: readSafeAreaInsets(),
    flow: rectMetrics(els.flow),
    shell: rectMetrics(els.shell),
    body: rectMetrics(els.body),
    footer: rectMetrics(els.footer),
    gapBelowFooter:
      els.footer && els.flow
        ? Math.round(els.flow.getBoundingClientRect().bottom - els.footer.getBoundingClientRect().bottom)
        : null,
    shellPadding: shellStyle
      ? {
          top: shellStyle.paddingTop,
          bottom: shellStyle.paddingBottom,
        }
      : null,
    footerPaddingBottom: footerStyle?.paddingBottom ?? null,
    bodyJustify: els.body ? getComputedStyle(els.body).justifyContent : null,
  });
}

export function logScreenContainerLayout(
  location: string,
  hypothesisId: string,
  els: {
    container?: Element | null;
    content?: Element | null;
    tabbar?: Element | null;
    screen?: Element | null;
    tab: string;
  },
) {
  const containerStyle = els.container ? getComputedStyle(els.container) : null;
  sendLog(hypothesisId, location, {
    tab: els.tab,
    viewport: readViewportMetrics(),
    safeArea: readSafeAreaInsets(),
    container: rectMetrics(els.container),
    content: rectMetrics(els.content),
    screen: rectMetrics(els.screen),
    tabbar: rectMetrics(els.tabbar),
    gapBelowTabbar:
      els.tabbar && els.container
        ? Math.round(els.container.getBoundingClientRect().bottom - els.tabbar.getBoundingClientRect().bottom)
        : null,
    containerPaddingTop: containerStyle?.paddingTop ?? null,
  });
}

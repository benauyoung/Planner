/**
 * This script is injected into the WebContainer preview iframe.
 * It adds a visual element selector overlay that:
 * 1. Highlights elements on hover
 * 2. Selects elements on click
 * 3. Sends element info to the parent frame via postMessage
 */
export const ELEMENT_SELECTOR_SCRIPT = `
<script>
(function() {
  let enabled = false;
  let overlay = null;
  let selectedOverlay = null;
  let selectedEl = null;

  // Listen for enable/disable/navigate from parent
  window.addEventListener('message', function(e) {
    if (e.data?.type === 'tb-selector-enable') {
      enabled = true;
      document.body.style.cursor = 'crosshair';
      createOverlays();
    }
    if (e.data?.type === 'tb-selector-disable') {
      enabled = false;
      document.body.style.cursor = '';
      removeOverlays();
      selectedEl = null;
    }
    if (e.data?.type === 'tb-navigate' && e.data.path) {
      window.history.pushState({}, '', e.data.path);
      window.dispatchEvent(new PopStateEvent('popstate'));
    }
  });

  function createOverlays() {
    if (overlay) return;
    overlay = document.createElement('div');
    overlay.id = 'tb-hover-overlay';
    overlay.style.cssText = 'position:fixed;pointer-events:none;z-index:99998;border:2px solid #3b82f6;background:rgba(59,130,246,0.08);transition:all 0.1s ease;display:none;border-radius:4px;';
    document.body.appendChild(overlay);

    selectedOverlay = document.createElement('div');
    selectedOverlay.id = 'tb-selected-overlay';
    selectedOverlay.style.cssText = 'position:fixed;pointer-events:none;z-index:99999;border:2px solid #8b5cf6;background:rgba(139,92,246,0.08);display:none;border-radius:4px;';
    document.body.appendChild(selectedOverlay);
  }

  function removeOverlays() {
    if (overlay) { overlay.remove(); overlay = null; }
    if (selectedOverlay) { selectedOverlay.remove(); selectedOverlay = null; }
  }

  function positionOverlay(el, ov) {
    var rect = el.getBoundingClientRect();
    ov.style.left = rect.left + 'px';
    ov.style.top = rect.top + 'px';
    ov.style.width = rect.width + 'px';
    ov.style.height = rect.height + 'px';
    ov.style.display = 'block';
  }

  function getElementInfo(el) {
    var cs = window.getComputedStyle(el);
    var text = '';
    // Get direct text content (not children's text)
    for (var i = 0; i < el.childNodes.length; i++) {
      if (el.childNodes[i].nodeType === 3) {
        text += el.childNodes[i].textContent;
      }
    }
    text = text.trim();

    return {
      tag: el.tagName.toLowerCase(),
      text: text || null,
      className: el.className || '',
      id: el.id || null,
      styles: {
        color: cs.color,
        backgroundColor: cs.backgroundColor,
        fontSize: cs.fontSize,
        fontWeight: cs.fontWeight,
        padding: cs.padding,
        margin: cs.margin,
        borderRadius: cs.borderRadius,
        width: cs.width,
        height: cs.height,
        display: cs.display,
      },
      rect: {
        x: Math.round(el.getBoundingClientRect().x),
        y: Math.round(el.getBoundingClientRect().y),
        width: Math.round(el.getBoundingClientRect().width),
        height: Math.round(el.getBoundingClientRect().height),
      },
      path: getElementPath(el),
    };
  }

  function getElementPath(el) {
    var parts = [];
    var current = el;
    while (current && current !== document.body && parts.length < 5) {
      var tag = current.tagName.toLowerCase();
      if (current.id) {
        parts.unshift(tag + '#' + current.id);
        break;
      }
      var cls = (current.className || '').toString().split(' ').filter(function(c) { return c && !c.startsWith('tb-'); }).slice(0, 2).join('.');
      parts.unshift(cls ? tag + '.' + cls : tag);
      current = current.parentElement;
    }
    return parts.join(' > ');
  }

  // Hover
  document.addEventListener('mousemove', function(e) {
    if (!enabled || !overlay) return;
    var el = e.target;
    if (el === overlay || el === selectedOverlay || el.id?.startsWith('tb-')) return;
    positionOverlay(el, overlay);
  }, true);

  document.addEventListener('mouseleave', function() {
    if (overlay) overlay.style.display = 'none';
  }, true);

  // Click to select
  document.addEventListener('click', function(e) {
    if (!enabled) return;
    e.preventDefault();
    e.stopPropagation();

    var el = e.target;
    if (el === overlay || el === selectedOverlay || el.id?.startsWith('tb-')) return;

    selectedEl = el;
    if (selectedOverlay) positionOverlay(el, selectedOverlay);

    var info = getElementInfo(el);
    window.parent.postMessage({ type: 'tb-element-selected', element: info }, '*');
  }, true);

  // ── Route change detection ──
  // Notify parent of current route on load and on every navigation
  function notifyRoute() {
    window.parent.postMessage({ type: 'tb-route-change', path: window.location.pathname }, '*');
  }

  // Patch pushState / replaceState so we detect programmatic navigation
  var origPush = history.pushState;
  var origReplace = history.replaceState;
  history.pushState = function() { origPush.apply(this, arguments); notifyRoute(); };
  history.replaceState = function() { origReplace.apply(this, arguments); notifyRoute(); };
  window.addEventListener('popstate', notifyRoute);

  // Notify on initial load
  notifyRoute();

  // Notify parent we're ready
  window.parent.postMessage({ type: 'tb-selector-ready' }, '*');
})();
</script>
`;

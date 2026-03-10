import html2canvas from 'html2canvas-pro';

/**
 * Resolve CSS custom properties to actual values so html2canvas can render them.
 * html2canvas doesn't support CSS variables natively.
 */
function resolveCssVariables(el: HTMLElement) {
  const computed = getComputedStyle(document.documentElement);
  const allElements = el.querySelectorAll('*');

  const overrides: { el: HTMLElement; prop: string; original: string }[] = [];

  const resolveVar = (value: string): string => {
    return value.replace(/var\(--([^,)]+)(?:,\s*([^)]+))?\)/g, (_match, name, fallback) => {
      const resolved = computed.getPropertyValue(`--${name}`).trim();
      return resolved || fallback?.trim() || '';
    });
  };

  const propsToCheck = [
    'color', 'backgroundColor', 'borderColor', 'borderTopColor',
    'borderBottomColor', 'borderLeftColor', 'borderRightColor',
    'boxShadow', 'textDecorationColor', 'outlineColor',
  ];

  allElements.forEach((child) => {
    const htmlEl = child as HTMLElement;
    const style = getComputedStyle(htmlEl);

    propsToCheck.forEach((prop) => {
      const val = style.getPropertyValue(prop);
      if (val && val.includes('var(')) {
        const resolved = resolveVar(val);
        if (resolved) {
          overrides.push({ el: htmlEl, prop, original: htmlEl.style.getPropertyValue(prop) });
          htmlEl.style.setProperty(prop, resolved);
        }
      }
    });
  });

  return overrides;
}

function restoreCssOverrides(overrides: { el: HTMLElement; prop: string; original: string }[]) {
  overrides.forEach(({ el, prop, original }) => {
    if (original) {
      el.style.setProperty(prop, original);
    } else {
      el.style.removeProperty(prop);
    }
  });
}

export async function exportToPdf(
  elementId: string,
  filename: string = 'amphibian-unite-export'
) {
  const el = document.getElementById(elementId);
  if (!el) {
    console.error(`[exportPdf] Element #${elementId} not found`);
    return;
  }

  // Show a brief loading state
  const toast = document.createElement('div');
  toast.textContent = `Generating ${filename}.png...`;
  Object.assign(toast.style, {
    position: 'fixed',
    bottom: '24px',
    right: '24px',
    background: '#14b8a6',
    color: '#0a0e17',
    padding: '12px 20px',
    borderRadius: '8px',
    fontSize: '13px',
    fontWeight: '600',
    zIndex: '9999',
    boxShadow: '0 4px 20px rgba(20, 184, 166, 0.3)',
  });
  document.body.appendChild(toast);

  // Temporarily disable backdrop-filter and clip-path which html2canvas can't handle
  const backdropEls: { el: HTMLElement; original: string }[] = [];
  el.querySelectorAll('*').forEach((child) => {
    const htmlEl = child as HTMLElement;
    const style = getComputedStyle(htmlEl);
    if (style.backdropFilter && style.backdropFilter !== 'none') {
      backdropEls.push({ el: htmlEl, original: htmlEl.style.backdropFilter });
      htmlEl.style.backdropFilter = 'none';
    }
  });

  // Resolve CSS variables
  const cssOverrides = resolveCssVariables(el);

  // Ensure the element is fully expanded (no scroll clipping)
  const originalOverflow = el.style.overflow;
  const originalHeight = el.style.height;
  const originalMaxHeight = el.style.maxHeight;
  el.style.overflow = 'visible';
  el.style.height = 'auto';
  el.style.maxHeight = 'none';

  try {
    const canvas = await html2canvas(el, {
      backgroundColor: '#0a0e17',
      scale: 2,
      useCORS: true,
      logging: false,
      allowTaint: true,
      windowWidth: Math.max(el.scrollWidth, 1200),
      windowHeight: el.scrollHeight,
      onclone: (clonedDoc) => {
        // In the cloned document, replace any remaining CSS variable references
        // with computed values and remove problematic effects
        const clonedEl = clonedDoc.getElementById(elementId);
        if (clonedEl) {
          // Set explicit dark background on all glass-morphism cards
          clonedEl.querySelectorAll('[class*="bg-surface"], [class*="bg-white/"]').forEach((card) => {
            const htmlCard = card as HTMLElement;
            const computed = getComputedStyle(htmlCard);
            const bg = computed.backgroundColor;
            if (bg === 'rgba(0, 0, 0, 0)' || bg === 'transparent') {
              htmlCard.style.backgroundColor = '#111827';
            }
          });

          // Ensure text is visible
          clonedEl.querySelectorAll('[class*="text-text-"]').forEach((textEl) => {
            const htmlText = textEl as HTMLElement;
            const computed = getComputedStyle(htmlText);
            if (computed.color === 'rgba(0, 0, 0, 0)' || !computed.color) {
              htmlText.style.color = '#e2e8f0';
            }
          });
        }
      },
    });

    // Download as PNG (high quality)
    const link = document.createElement('a');
    link.download = `${filename}.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();

    toast.textContent = `Downloaded ${filename}.png`;
    setTimeout(() => toast.remove(), 2000);
  } catch (err) {
    console.error('[exportPdf] Export failed:', err);
    toast.textContent = 'Export failed. Try again.';
    toast.style.background = '#ef4444';
    toast.style.color = '#fff';
    setTimeout(() => toast.remove(), 3000);
  } finally {
    // Restore everything
    el.style.overflow = originalOverflow;
    el.style.height = originalHeight;
    el.style.maxHeight = originalMaxHeight;

    backdropEls.forEach(({ el: bdEl, original }) => {
      bdEl.style.backdropFilter = original;
    });

    restoreCssOverrides(cssOverrides);
  }
}

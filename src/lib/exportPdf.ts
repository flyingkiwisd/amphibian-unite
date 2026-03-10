import html2canvas from 'html2canvas-pro';

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

  try {
    const canvas = await html2canvas(el, {
      backgroundColor: '#0a0e17',
      scale: 2,
      useCORS: true,
      logging: false,
      windowWidth: el.scrollWidth,
      windowHeight: el.scrollHeight,
    });

    // Download as PNG (high quality, works great for LLM context)
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
  }
}

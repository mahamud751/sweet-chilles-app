/** Build gradient stops from a single brand hex */
export function brandGradient(primary: string): [string, string, string] {
  return [lightenHex(primary, 24), primary, darkenHex(primary, 18)];
}

export function darkenHex(hex: string, amount = 16): string {
  const { r, g, b } = parseHex(hex);
  return rgbToHex(
    Math.max(0, r - amount),
    Math.max(0, g - amount),
    Math.max(0, b - amount),
  );
}

export function lightenHex(hex: string, amount = 24): string {
  const { r, g, b } = parseHex(hex);
  return rgbToHex(
    Math.min(255, r + amount),
    Math.min(255, g + amount),
    Math.min(255, b + amount),
  );
}

function parseHex(hex: string) {
  const h = hex.replace('#', '');
  const full = h.length === 3 ? h.split('').map(c => c + c).join('') : h;
  return {
    r: parseInt(full.slice(0, 2), 16),
    g: parseInt(full.slice(2, 4), 16),
    b: parseInt(full.slice(4, 6), 16),
  };
}

function rgbToHex(r: number, g: number, b: number) {
  return `#${[r, g, b].map(x => x.toString(16).padStart(2, '0')).join('')}`;
}

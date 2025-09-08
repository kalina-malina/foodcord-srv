export const transformName = (name: string) =>
  name
    .replace(/^[\s.]+/, '')
    .replace(/[\s.]+$/, '')
    .replace(/\s+/g, ' ')
    .trim();

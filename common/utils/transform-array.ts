export type TransformArrayOptions = {
  type?: 'number' | 'string' | 'boolean' | 'auto';
  separator?: string;
};

export const transformArray = (
  value: any,
  options: TransformArrayOptions = {},
): any[] => {
  const { type = 'auto', separator = ',' } = options;

  if (Array.isArray(value)) {
    return value;
  }

  if (typeof value === 'string') {
    try {
      const parsed = JSON.parse(value);
      return Array.isArray(parsed) ? parsed : [parsed];
    } catch {
      return value.split(separator).map((item: string) => {
        const trimmed = item.trim();

        switch (type) {
          case 'number':
            return parseInt(trimmed) || 0;
          case 'string':
            return trimmed;
          case 'boolean':
            return trimmed.toLowerCase() === 'true';
          case 'auto':
          default:
            // Автоопределение типа
            if (trimmed === 'true' || trimmed === 'false') {
              return trimmed === 'true';
            }
            if (!isNaN(Number(trimmed))) {
              return Number(trimmed);
            }
            return trimmed;
        }
      });
    }
  }

  return [value];
};

export const transformNumberArray = (value: any) =>
  transformArray(value, { type: 'number' });

export const transformStringArray = (value: any) =>
  transformArray(value, { type: 'string' });

export const transformBooleanArray = (value: any) =>
  transformArray(value, { type: 'boolean' });

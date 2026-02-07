// Helper function to parse comma-separated string to array of numbers
export const parseMultiSelect = (value?: number | string): number[] => {
  if (!value) return [];
  if (typeof value === 'string') {
    return value
      .split(',')
      .map(id => parseInt(id.trim()))
      .filter(id => !isNaN(id));
  }
  return [value];
};

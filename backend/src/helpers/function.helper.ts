export function toDateOnly(value: string | Date): string {
  return new Date(value).toISOString().split('T')[0];
}

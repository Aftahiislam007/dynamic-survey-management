import slugify from 'slugify';

export interface SlugifyOptions {
  replacement?: string;
  remove?: RegExp;
  lower?: boolean;
  strict?: boolean;
  locale?: string;
  trim?: boolean;
}

/**
 * Converts a string to a URL-friendly slug
 * @param text The text to slugify
 * @param options Configuration options for slugify
 * @returns The slugified string
 */
export function createSlug(text: string, options: SlugifyOptions = {}): string {
  const defaultOptions: SlugifyOptions = {
    replacement: '-',
    remove: undefined,
    lower: true,
    strict: false,
    locale: 'vi',
    trim: true,
  };

  const mergedOptions = { ...defaultOptions, ...options };

  return slugify(text, mergedOptions);
}

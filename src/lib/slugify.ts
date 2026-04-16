export function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function generateUniqueSlug(text: string): string {
  const base = slugify(text);
  const suffix = Date.now().toString(36).slice(-4);
  return `${base}-${suffix}`;
}

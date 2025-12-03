export const createSlug = (text: string) =>
    text.toLowerCase()
        .replace(/\+/g, 'plus') // Replace + with plus
        .replace(/[^a-z0-9\s-]/g, '') // Remove special chars
        .trim()
        .replace(/[\s-]+/g, '-') // Replace spaces and multiple hyphens with single hyphen
        .replace(/^-+|-+$/g, ''); // Trim hyphens from start/end

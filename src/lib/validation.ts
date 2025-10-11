// PII (Personally Identifiable Information) detection patterns
const patterns = {
  email: /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g,
  phone: /(?:\+?234|0)[789][01]\d{8}/g, // Nigerian phone numbers
  nin: /\d{11}/g, // Nigerian NIN is 11 digits
};

export const checkForPII = (text: string): boolean => {
  // Check for each PII pattern
  return Object.values(patterns).some(pattern => pattern.test(text));
};

export const stripPII = (text: string): string => {
  // Replace each PII pattern with redacted text
  let sanitized = text;
  Object.entries(patterns).forEach(([type, pattern]) => {
    sanitized = sanitized.replace(pattern, `[REDACTED ${type.toUpperCase()}]`);
  });
  return sanitized;
};

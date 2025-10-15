// Content Security Policy configuration
const policy = {
  'default-src': ["'self'"],
  'script-src': [
    "'self'",
    "'unsafe-inline'",
    process.env.NODE_ENV === 'development' ? "'unsafe-eval'" : '',
  ].filter(Boolean),
  'style-src': ["'self'", "'unsafe-inline'"],
  'font-src': ["'self'"],
  'img-src': ["'self'", 'data:', 'blob:', 'https:'],
  'connect-src': [
    "'self'",
    process.env.NODE_ENV === 'development' ? 'http://localhost:*' : '',
    process.env.NEXT_PUBLIC_BACKEND_URL || 'https://api.workrant.app',
    process.env.NEXT_PUBLIC_MEDIA_URL || '',
  ].filter(Boolean),
};

export function getCSP() {
  const csp = Object.entries(policy)
    .map(([key, values]) => `${key} ${values.join(' ')}`)
    .join('; ');

  return csp;
}

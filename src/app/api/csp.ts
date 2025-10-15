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
    'https://api.workrant.app',
    'https://api.workrant.app/media',
    process.env.NODE_ENV === 'development' ? 'http://localhost:8000' : '',
  ].filter(Boolean),
  'frame-ancestors': ["'none'"],
};

export function getCSP() {
  const csp = Object.entries(policy)
    .map(([key, values]) => `${key} ${values.join(' ')}`)
    .join('; ');

  return csp;
}

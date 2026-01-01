// Sentry is optional - this is a no-op function
export function initSentry() {
  // Do nothing - we're using Winston logs instead
  console.log('Sentry disabled - using file-based logging');
}
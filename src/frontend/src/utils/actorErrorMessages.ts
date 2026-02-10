/**
 * Converts actor/initialization related errors into user-friendly messages
 */
export function getActorErrorMessage(error: unknown): string {
  const errorString = error instanceof Error ? error.message : String(error);
  
  // Check for common actor-related error patterns
  if (
    errorString.includes('Actor not available') ||
    errorString.includes('actor is null') ||
    errorString.includes('actor not initialized')
  ) {
    return 'We are still connecting to the service. Please wait a moment and try again.';
  }
  
  // Network/connection errors
  if (
    errorString.includes('fetch') ||
    errorString.includes('network') ||
    errorString.includes('connection') ||
    errorString.includes('Failed to fetch')
  ) {
    return 'Unable to reach the service. Please check your internet connection and try again.';
  }

  // Timeout errors
  if (errorString.includes('timeout') || errorString.includes('timed out')) {
    return 'The request took too long. Please try again.';
  }

  // Certificate/security errors
  if (errorString.includes('certificate') || errorString.includes('SSL') || errorString.includes('TLS')) {
    return 'There was a security error connecting to the service. Please refresh the page.';
  }
  
  // Generic fallback - avoid showing raw technical errors
  if (errorString.length > 100 || errorString.includes('Error:') || errorString.includes('at ')) {
    return 'We encountered an issue loading the data. Please try again.';
  }
  
  return errorString || 'An unexpected error occurred. Please try again.';
}

/**
 * Returns a user-friendly message for actor initialization failures
 */
export function getActorInitializationErrorMessage(): string {
  return 'Unable to connect to the service. Please check your internet connection and try again.';
}

/**
 * Returns a user-friendly message when actor is still connecting
 */
export function getActorConnectingMessage(): string {
  return 'Connecting to the service. Please wait a moment...';
}

/**
 * Returns a user-friendly message for product loading failures
 */
export function getProductLoadErrorMessage(error: unknown): string {
  const errorString = error instanceof Error ? error.message : String(error);
  
  // Use the general error message helper but with product-specific context
  const baseMessage = getActorErrorMessage(error);
  
  // If it's a generic message, make it more specific to products
  if (baseMessage === 'An unexpected error occurred. Please try again.') {
    return 'We had trouble loading our product catalog. Please try again.';
  }
  
  return baseMessage;
}

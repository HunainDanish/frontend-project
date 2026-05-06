/**
 * Normalize error responses to clean error strings
 * Prevents manual error extraction in every component
 */
export function normalizeError(error: any): string {
  // Handle axios error responses
  if (error.response?.data?.message) {
    return error.response.data.message
  }
  
  // Handle general error messages
  if (error.message) {
    return error.message
  }
  
  // Default fallback
  return 'Something went wrong'
}

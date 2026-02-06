/**
 * Helper to normalize API responses
 * Backend bisa return response dalam berbagai format
 */
export function normalizeApiResponse<T>(data: any): T[] {
  // If data has a 'data' property, use that
  if (data && typeof data === 'object' && 'data' in data) {
    data = data.data;
  }

  // Ensure it's an array
  if (Array.isArray(data)) {
    return data;
  }

  // If single object, wrap in array
  if (data) {
    return [data];
  }

  return [];
}

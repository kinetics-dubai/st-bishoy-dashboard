/**
 * Simple query builder helper for API calls
 * Reusable across all slices - accepts ANY parameters
 */

export const buildQuery = (params = {}) => {
  const query = new URLSearchParams();
  
  // Add ALL parameters dynamically (except undefined and 'all' values)
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== 'all' && value !== '') {
      query.append(key, value);
    }
  });
  
  return query.toString();
};

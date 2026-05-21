export const PAGE_SIZE = 10;

export const buildQuery = (params = {}) => {
  const query = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (
      value !== undefined &&
      value !== null &&
      value !== "all" &&
      value !== ""
    ) {
      query.append(key, value);
    }
  });
  return query.toString();
};

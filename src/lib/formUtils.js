function isEmpty(v) {
  return v === null || v === undefined || v === '';
}

function valuesEqual(a, b) {
  if (isEmpty(a) && isEmpty(b)) return true;
  if (a === b) return true;
  if (Array.isArray(a) && Array.isArray(b)) {
    if (a.length !== b.length) return false;
    return a.every((v, i) => v === b[i]);
  }
  if (typeof a === 'object' && a !== null && typeof b === 'object' && b !== null) {
    return JSON.stringify(a) === JSON.stringify(b);
  }
  return false;
}

export function getDirtyValues(nextValues, initialValues) {
  if (!initialValues) return { ...nextValues };
  const out = {};
  for (const key of Object.keys(nextValues)) {
    if (!valuesEqual(nextValues[key], initialValues[key])) {
      out[key] = nextValues[key];
    }
  }
  return out;
}

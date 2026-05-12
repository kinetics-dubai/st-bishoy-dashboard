export function getApiErrorMessage(error, fallback) {
  const messageFromResponse = error?.response?.data?.message;
  if (typeof messageFromResponse === 'string' && messageFromResponse.trim()) {
    return messageFromResponse;
  }

  const messageFromError = error?.message;
  if (typeof messageFromError === 'string' && messageFromError.trim()) {
    return messageFromError;
  }

  const detail = error?.detail;
  if (typeof detail === 'string' && detail.trim()) {
    return detail;
  }

  return fallback;
}


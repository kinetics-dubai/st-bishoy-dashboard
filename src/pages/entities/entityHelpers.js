export const parseDynamicData = (dynamicData) => {
  if (!dynamicData) return [];

  if (Array.isArray(dynamicData)) return dynamicData;

  if (typeof dynamicData === 'object') {
    if (Array.isArray(dynamicData.summary)) {
      return dynamicData.summary;
    }

    if (typeof dynamicData.summary === 'string') {
      return [dynamicData.summary];
    }

    return [];
  }

  if (typeof dynamicData === 'string') {
    try {
      const parsed = JSON.parse(dynamicData);

      if (Array.isArray(parsed)) {
        return parsed;
      }

      if (parsed && typeof parsed === 'object') {
        if (Array.isArray(parsed.summary)) {
          return parsed.summary;
        }

        if (typeof parsed.summary === 'string') {
          return [parsed.summary];
        }
      }

      return [];
    } catch (error) {
      return [];
    }
  }

  return [];
};

export const getSummaryContent = (dynamicData) => {
  const items = parseDynamicData(dynamicData);
  const firstItem = items[0];

  if (typeof firstItem === 'string') {
    return firstItem;
  }

  if (firstItem?.content) {
    return firstItem.content;
  }

  const summaryItem = items.find((item) => item?.key === 'summary');
  return summaryItem?.content || '';
};

export const buildDynamicDataPayload = (summary) => {
  if (!summary) return null;

  return {summary};
};

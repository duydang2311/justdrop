export const roundToPrecision = (value: number, precision: number) => {
  const factor = Math.pow(10, precision);
  return Math.round(value * factor) / factor;
};

export const formatSize = (size: number, precision: number = 2) => {
  if (size < 1024) {
    return `${size} B`;
  }

  size /= 1024;
  if (size < 1024) {
    return `${roundToPrecision(size, 2)} KB`;
  }

  size /= 1024;
  if (size < 1024) {
    return `${roundToPrecision(size, 2)} MB`;
  }

  size /= 1024;
  return `${roundToPrecision(size, 2)} GB`;
};

export const formatMimeType = (mimeType?: string) => {
  if (!mimeType) return 'Unknown';
  const parts = mimeType.split('/');
  return parts.length > 1 ? parts[1].toUpperCase() : mimeType.toUpperCase();
};

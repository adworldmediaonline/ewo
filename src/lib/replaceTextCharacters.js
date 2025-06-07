export const replaceTextCharacters = (
  text,
  charToReplace,
  replacementChar = ''
) => {
  if (!text) return '';
  if (typeof text !== 'string') return String(text);

  // Escape special characters for RegExp
  const escapedChar = charToReplace.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  return text.replace(new RegExp(escapedChar, 'g'), replacementChar);
};

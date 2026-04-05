export const normalizeArabic = (text: string) => {
  if (!text) return '';
  let n = text
    .toLowerCase() // Convert to lowercase for English support
    .replace(/[\u064B-\u0652]/g, '') // Remove Tashkeel
    .replace(/[أإآ]/g, 'ا')
    .replace(/ة/g, 'ه')
    .replace(/ى/g, 'ي')
    .replace(/ؤ/g, 'و')
    .replace(/ئ/g, 'ي')
    .replace(/لله/g, 'الله');
  
  // Allow Arabic and English characters, remove others
  n = n.replace(/[^a-z\u0621-\u064A\s]/g, ' ');
  
  // Handle common Arabic ASR misrecognitions:
  // 1. Remove spaces after 'ال' (Al-) prefix
  n = n.replace(/(^|\s)ال\s+/g, '$1ال');
  
  // Collapse spaces
  n = n.replace(/\s+/g, ' ').trim();
  
  return n;
};

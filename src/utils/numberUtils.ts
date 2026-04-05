export const parseArabicNumbers = (str: string | number): number => {
  if (typeof str === 'number') return str;
  if (!str) return 0;
  const englishNumbers = str.replace(/[٠-٩]/g, d => '٠١٢٣٤٥٦٧٨٩'.indexOf(d).toString())
                            .replace(/[۰-۹]/g, d => '۰۱۲۳۴۵۶۷۸۹'.indexOf(d).toString());
  return parseInt(englishNumbers, 10) || 0;
};

export const formatNumber = (num: number): string => {
  return new Intl.NumberFormat('en-US', { useGrouping: false }).format(num);
};

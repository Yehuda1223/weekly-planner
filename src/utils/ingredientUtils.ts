import { ParsedIngredient } from '@/src/types';

/**
 * עיצוב מספרים כשברים או עשרוניים (למשל 0.5 -> 1/2)
 */
export const formatNumber = (num: number): string => {
  if (num % 1 === 0) return num.toString();
  const fractionMap: { [key: number]: string } = {
    0.25: '1/4',
    0.5: '1/2',
    0.75: '3/4',
    0.33: '1/3',
    0.66: '2/3',
  };
  const roundedDec = Math.round((num % 1) * 100) / 100;
  const whole = Math.floor(num);
  const fractionStr = fractionMap[roundedDec] || fractionMap[roundedDec - 0.01] || fractionMap[roundedDec + 0.01];

  if (fractionStr) {
    return whole > 0 ? `${whole} ו-${fractionStr}` : fractionStr;
  }
  return num.toFixed(1).replace(/\.0$/, '');
};

/**
 * חישוב כמויות דינמי לפי מנות (ברירת מחדל 4 מנות)
 */
export const scaleIngredient = (
  text: string,
  currentServings: number,
  defaultServings: number = 4
): string => {
  const ratio = currentServings / defaultServings;
  if (ratio === 1) return text;

  const fractionRegex = /^(\d+)\/(\d+)(?:\s+(.*))?$/;
  const fractionMatch = text.match(fractionRegex);
  if (fractionMatch) {
    const num = parseInt(fractionMatch[1], 10);
    const den = parseInt(fractionMatch[2], 10);
    const scaledVal = (num / den) * ratio;
    const rest = fractionMatch[3] ? ' ' + fractionMatch[3] : '';
    return `${formatNumber(scaledVal)}${rest}`;
  }

  const numRegex = /^(\d+\.\d+|\d+)(?:\s+(.*))?$/;
  const numMatch = text.match(numRegex);
  if (numMatch) {
    const val = parseFloat(numMatch[1]);
    const scaledVal = val * ratio;
    const rest = numMatch[2] ? ' ' + numMatch[2] : '';
    return `${formatNumber(scaledVal)}${rest}`;
  }

  return text;
};

/**
 * פענוח טקסט מצרך לכמות, יחידת מידה ושם
 */
export const parseIngredient = (text: string): ParsedIngredient => {
  let cleanText = text.trim();
  let quantity = 0;
  let unit = '';
  let name = cleanText;

  // 1. בדיקת שברים בהתחלה (למשל "1/2", "1/4")
  const fractionRegex = /^(\d+)\/(\d+)\s*(.*)$/;
  const fractionMatch = cleanText.match(fractionRegex);
  if (fractionMatch) {
    quantity = parseInt(fractionMatch[1], 10) / parseInt(fractionMatch[2], 10);
    cleanText = fractionMatch[3].trim();
  } else {
    // 2. בדיקת מספרים עשרוניים או שלמים (למשל "1.5", "2")
    const numRegex = /^(\d+\.\d+|\d+)\s*(.*)$/;
    const numMatch = cleanText.match(numRegex);
    if (numMatch) {
      quantity = parseFloat(numMatch[1]);
      cleanText = numMatch[2].trim();
    }
  }

  // יחידות מידה נפוצות בעברית
  const commonUnits = [
    'כוסות', 'כוס', 'כפות', 'כף', 'כפיות', 'כפית', 'גרם', 'ג׳', 'ק״ג', 'חבילות', 'חבילה', 
    'קופסאות', 'קופסה', 'קופסת', 'מיליליטר', 'מ״ל', 'ראשים', 'ראש', 'שיניים', 'שן', 
    'צרורות', 'צרור', 'פרוסות', 'פרוסה', 'פחיות', 'פחית', 'שקיות', 'שקית', 'גרגרים', 'גרגרי'
  ];

  const words = cleanText.split(/\s+/);
  if (words.length > 1) {
    const possibleUnit = words[0].replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g, ''); // הסרת סימני פיסוק
    if (commonUnits.includes(possibleUnit)) {
      unit = possibleUnit;
      name = words.slice(1).join(' ');
    } else {
      name = cleanText;
    }
  } else {
    name = cleanText;
  }

  name = name.trim().replace(/^של\s+/, '');

  return { quantity, unit, name };
};

/**
 * סטנדרטיזציה של יחידת מידה (מניעת פיצול בין יחיד לרבים)
 */
export const standardizeUnit = (unit: string): string => {
  const u = unit.trim();
  if (['כוס', 'כוסות'].includes(u)) return 'כוס';
  if (['כף', 'כפות'].includes(u)) return 'כף';
  if (['כפית', 'כפיות'].includes(u)) return 'כפית';
  if (['חבילה', 'חבילות'].includes(u)) return 'חבילה';
  if (['קופסה', 'קופסאות', 'קופסת'].includes(u)) return 'קופסה';
  if (['שן', 'שיניים'].includes(u)) return 'שן';
  if (['ראש', 'ראשים'].includes(u)) return 'ראש';
  if (['פרוסה', 'פרוסות'].includes(u)) return 'פרוסה';
  if (['צרור', 'צרורות'].includes(u)) return 'צרור';
  if (['שקית', 'שקיות'].includes(u)) return 'שקית';
  return u;
};

/**
 * קבלת יחידת מידה מתאימה לתצוגה (יחיד או רבים)
 */
export const getDisplayUnit = (unit: string, qty: number): string => {
  if (!unit) return '';
  if (qty > 1) {
    if (unit === 'כוס') return 'כוסות';
    if (unit === 'כף') return 'כפות';
    if (unit === 'כפית') return 'כפיות';
    if (unit === 'חבילה') return 'חבילות';
    if (unit === 'קופסה') return 'קופסאות';
    if (unit === 'שן') return 'שיניים';
    if (unit === 'ראש') return 'ראשים';
    if (unit === 'פרוסה') return 'פרוסות';
    if (unit === 'צרור') return 'צרורות';
    if (unit === 'שקית') return 'שקיות';
  }
  return unit;
};

/**
 * מיון רכיבים לפי קטגוריות סופרמרקט
 */
export const getIngredientCategory = (name: string): string => {
  const text = name.toLowerCase();

  const veggiesAndFruits = [
    'תרד', 'עגבני', 'בצל', 'מלפפון', 'לימון', 'אבוקדו', 'בננה', 'תפוח', 'שום', 'פטרוזיליה', 
    'כוסברה', 'גזר', 'תפוח אדמה', 'פטריות', 'חסה', 'פלפל', 'קישוא', 'חציל', 'כרובית', 'כרוב',
    'פירות', 'אוכמניות', 'תות', 'פטל', 'אננס', 'מנגו'
  ];

  const meatsAndFish = [
    'עוף', 'חזה עוף', 'פרגיות', 'בשר', 'בקר', 'כבש', 'טחינה', 'סלמון', 'טונה', 'דג', 'דגים', 
    'קציצות', 'המבורגר', 'נקניק'
  ];

  const dairyAndFridge = [
    'שמנת', 'חלב', 'גבינה', 'פטה', 'חמאה', 'פרמזן', 'יוגורט', 'מוצרלה', 'קוטג\'', 'ריקוטה', 
    'שוקו', 'ביצה', 'ביצים'
  ];

  const pantryAndSpices = [
    'שמן', 'זית', 'מלח', 'פלפל', 'סוכר', 'קמח', 'אורז', 'פסטה', 'קינואה', 'צ׳יה', 'גרנולה', 
    'שוקולד', 'דבש', 'סילאן', 'חומץ', 'פירורי לחם', 'שומשום', 'שיבולת שועל', 'אבקת', 'ציר',
    'רוטב', 'חרדל', 'מיונז', 'קוקוס', 'שקדים', 'אגוז', 'קקאו', 'תבלין'
  ];

  if (veggiesAndFruits.some(word => text.includes(word))) return 'ירקות ופירות';
  if (meatsAndFish.some(word => text.includes(word))) return 'בשר, עוף ודגים';
  if (dairyAndFridge.some(word => text.includes(word))) return 'מוצרי חלב ומקרר';
  if (pantryAndSpices.some(word => text.includes(word))) return 'מזווה ותבלינים';

  return 'אחר';
};

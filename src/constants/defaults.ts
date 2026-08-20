import { Recipe, MealPlanItem, Workout, MuscleGroup, WorkoutSplit, DateSpot, DateCategory, TaskItem, TaskCategory, TaskPriority } from '@/src/types';

export const RECIPE_CATEGORIES = [
  'מנות עיקריות',
  'תוספות',
  'סלטים וממרחים',
  'מרקים ותבשילים',
  'מאפים ולחמים',
  'קינוחים ומתוקים'
];

export const CATEGORIES = ['הכל', ...RECIPE_CATEGORIES];

export const DEFAULT_RECIPES: Recipe[] = [
  {
    id: 'd1',
    title: 'עוף טוסקני ברוטב שמנת',
    description: 'חזה עוף עסיסי צרוב ברוטב שמנת עשיר עם שום, תרד ועגבניות מיובשות.',
    ingredients: [
      '2 חזות עוף גדולים, פרוסים דק',
      '1 כף שמן זית',
      '1 כוס שמנת לבישול',
      '1/2 כוס ציר עוף (או מים)',
      '1 כפית אבקת שום',
      '2 כוסות תרד טרי',
      '1/2 כוס עגבניות מיובשות'
    ],
    instructions: '1. מתבלים את חזות העוף במלח, פלפל ואבקת שום.\n2. מחממים שמן זית במחבת גדולה על אש בינונית-גבוהה וצורבים את העוף כ-5 דקות מכל צד.\n3. מוציאים את העוף, מוזגים למחבת את ציר העוף והשמנת ומביאים לרתיחה.\n4. מוסיפים את תרד והעגבניות המיובשות ומבשלים עד שהתרד נובל.\n5. מחזירים את העוף למחבת, מצפים ברוטב ומגישים חם.',
    category: 'מנות עיקריות',
    prep_time: '25 דק׳',
    image_gradient: 'from-orange-400 to-amber-500',
    image_url: 'https://images.unsplash.com/photo-1604908176997-125f25cc6f3d?auto=format&fit=crop&w=800&q=80'
  },
  {
    id: 'd2',
    title: 'קערת שייק פירות יער ואבוקדו',
    description: 'קערת בוקר סמיכה ומזינה מלאה בנוגדי חמצון, שומנים בריאים ופירות יער טריים.',
    ingredients: [
      '1 כוס פירות יער קפואים מעורבים',
      '1/2 אבוקדו בשל',
      '1 בננה בשלה',
      '1/2 כוס חלב שקדים (או חלב רגיל)',
      '1 כף זרעי צ׳יה',
      'גרנולה ושבבי קוקוס לקישוט מלמעלה'
    ],
    instructions: '1. טוחנים בבלנדר את פירות היער, האבוקדו, הבננה וחלב השקדים עד לקבלת מרקם חלק וסמיך.\n2. מוזגים לקערה עמוקה.\n3. מקשטים מלמעלה בזרעי צ׳יה, גרנולה, שבבי קוקוס ופירות יער טריים.',
    category: 'קינוחים ומתוקים',
    prep_time: '10 דק׳',
    image_gradient: 'from-pink-400 to-rose-500',
    image_url: 'https://images.unsplash.com/photo-1590301157890-4810ed352733?auto=format&fit=crop&w=800&q=80'
  },
  {
    id: 'd3',
    title: 'סלט קינואה ים-תיכוני',
    description: 'סלט מרענן ועשיר במלפפונים פריכים, עגבניות שרי, זיתי קלמטה, גבינת פטה ורוטב לימון זסט.',
    ingredients: [
      '1 כוס קינואה, מבושלת ומקוררת',
      '1 כוס עגבניות שרי, חצויות',
      '1 מלפפון בינוני, חתוך לקוביות',
      '1/2 כוס זיתי קלמטה מגולענים',
      '1/2 כוס גבינת פטה מפוררת',
      '3 כפות שמן זית',
      'מיץ מלימון טרי אחד'
    ],
    instructions: '1. בקערה גדולה מערבבים את הקינואה המבושלת, עגבניות השרי, המלפפון והזיתים.\n2. בצנצנת קטנה טורפים שמן זית, מיץ לימון, מלח ופלפל.\n3. מוזגים את הרוטב על הסלט ומערבבים בעדינות.\n4. מפזרים מעל את גבינת הפטה המפוררת ומגישים.',
    category: 'סלטים וממרחים',
    prep_time: '15 דק׳',
    image_gradient: 'from-emerald-400 to-teal-500',
    image_url: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=800&q=80'
  },
  {
    id: 'd4',
    title: 'פונדנט שוקולד חם (לבה קייק)',
    description: 'קינוח שוקולד עשיר ומושחת עם מרכז נוזלי וחם, פשוט להכנה באופן מפתיע.',
    ingredients: [
      '1/2 כוס חמאה (100 גרם)',
      '110 גרם שוקולד מריר איכותי',
      '2 ביצים שלמות + 2 חלמונים',
      '1/4 כוס סוכר',
      '2 כפות קמח לבן',
      'קורט מלח'
    ],
    instructions: '1. מחממים תנור ל-220 מעלות צלזיוס. משמנים ומקמחים ארבע קעריות רמקין קטנות.\n2. ממיסים יחד חמאה ושוקולד במיקרוגל בפעימות קצרות.\n3. בקערה נפרדת טורפים ביצים, חלמונים, סוכר ומלח עד לקבלת קצף סמיך ובהיר.\n4. מקפלים בעדינות את תערובת השוקולד המומס והקמח לתוך קצף הביצים.\n5. מחלקים לרמקינים ואופים 12 דקות עד שהשוליים יציבים אך המרכז עדיין רך.',
    category: 'קינוחים ומתוקים',
    prep_time: '20 דק׳',
    image_gradient: 'from-amber-700 to-yellow-800',
    image_url: 'https://images.unsplash.com/photo-1606313564200-e75d5e30476c?auto=format&fit=crop&w=800&q=80'
  }
];

import { getWeekKey } from '@/src/utils/dateUtils';

export const getSampleHistoryMealPlan = (): MealPlanItem[] => {
  const k1 = getWeekKey(-1);   // שבוע שעבר
  const k2 = getWeekKey(-2);   // לפני שבועיים
  const k4 = getWeekKey(-4);   // לפני חודש
  const k8 = getWeekKey(-8);   // לפני חודשיים
  const k12 = getWeekKey(-12); // לפני 3 חודשים
  const k24 = getWeekKey(-24); // לפני חצי שנה
  const k36 = getWeekKey(-36); // לפני 9 חודשים
  const k48 = getWeekKey(-48); // לפני 11 חודשים
  const k52 = getWeekKey(-52); // לפני שנה

  return [
    // 🌟 שבוע שעבר (offset -1)
    { id: 'h1_1', day: 'יום ראשון', meal: 'ארוחת צהריים', customName: 'עוף טוסקני ברוטב שמנת 🍲', weekKey: k1, completed: true, isShared: true },
    { id: 'h1_2', day: 'יום שני', meal: 'אימון יומי', customName: 'אימון A: חזה וזרועות 💪', weekKey: k1, completed: true, isShared: true },
    { id: 'h1_3', day: 'יום שלישי', meal: 'ארוחת ערב', customName: 'שקשוקה ים תיכונית 🍳', weekKey: k1, completed: true, isShared: true },
    { id: 'h1_4', day: 'יום רביעי', meal: 'דייט / בילוי', customName: 'דייט מסעדה יפנית 🍷', weekKey: k1, completed: true, isShared: true },
    { id: 'h1_5', day: 'יום שישי', meal: 'ארוחת ערב', customName: 'סלמון נורווגי ואורז 🐟', weekKey: k1, completed: true, isShared: true },
    { id: 'h1_6', day: 'יום שבת', meal: 'ארוחת צהריים', customName: 'חמין שבת משפחתי 🍲', weekKey: k1, completed: false, isShared: true },

    // 🌟 לפני שבועיים (offset -2)
    { id: 'h2_1', day: 'יום ראשון', meal: 'ארוחת בוקר', customName: 'דייסת שיבולת שועל ☕', weekKey: k2, completed: true, isShared: true },
    { id: 'h2_2', day: 'יום שלישי', meal: 'ארוחת צהריים', customName: 'טורטייה ים-תיכונית 🌯', weekKey: k2, completed: true, isShared: true },
    { id: 'h2_3', day: 'יום חמישי', meal: 'אימון יומי', customName: 'אימון B: גב וכתפיים 💪', weekKey: k2, completed: true, isShared: true },
    { id: 'h2_4', day: 'יום שישי', meal: 'דייט / בילוי', customName: 'ערב סרט ופיצה 🍕', weekKey: k2, completed: true, isShared: true },

    // 🌟 לפני חודש (offset -4)
    { id: 'h4_1', day: 'יום ראשון', meal: 'ארוחת צהריים', customName: 'קערת פוקה טונה אדומה 🥗', weekKey: k4, completed: true, isShared: true },
    { id: 'h4_2', day: 'יום שני', meal: 'אימון יומי', customName: 'אימון רגליים ובטן 🏋️‍♂️', weekKey: k4, completed: true, isShared: true },
    { id: 'h4_3', day: 'יום רביעי', meal: 'ארוחת ערב', customName: 'פסטה בולונז איטלקית 🍝', weekKey: k4, completed: true, isShared: true },
    { id: 'h4_4', day: 'יום שישי', meal: 'דייט / בילוי', customName: 'ערב קוקטיילים 🍸', weekKey: k4, completed: true, isShared: true },

    // 🌟 לפני 2 חודשים (offset -8)
    { id: 'h8_1', day: 'יום ראשון', meal: 'ארוחת בוקר', customName: 'פנקייק חלבון ובננה 🥞', weekKey: k8, completed: true, isShared: true },
    { id: 'h8_2', day: 'יום שלישי', meal: 'אימון יומי', customName: 'אימון אירובי 5 ק״מ 🏃‍♂️', weekKey: k8, completed: true, isShared: true },
    { id: 'h8_3', day: 'יום חמישי', meal: 'ארוחת ערב', customName: 'סטייק אנטריקוט ותפו״א 🥩', weekKey: k8, completed: true, isShared: true },

    // 🌟 לפני 3 חודשים (offset -12)
    { id: 'h12_1', day: 'יום ראשון', meal: 'ארוחת צהריים', customName: 'חזה עוף בגריל ואורז 🍗', weekKey: k12, completed: true, isShared: true },
    { id: 'h12_2', day: 'יום שני', meal: 'אימון יומי', customName: 'אימון חזה וזרועות 💪', weekKey: k12, completed: true, isShared: true },
    { id: 'h12_3', day: 'יום רביעי', meal: 'דייט / בילוי', customName: 'סדנת בישול זוגית 👨‍🍳', weekKey: k12, completed: true, isShared: true },

    // 🌟 לפני חצי שנה (offset -24)
    { id: 'h24_1', day: 'יום ראשון', meal: 'ארוחת צהריים', customName: 'סלט קינואה וטופו 🥗', weekKey: k24, completed: true, isShared: true },
    { id: 'h24_2', day: 'יום שלישי', meal: 'אימון יומי', customName: 'אימון כושר פונקציונלי 🏋️‍♀️', weekKey: k24, completed: true, isShared: true },
    { id: 'h24_3', day: 'יום שישי', meal: 'ארוחת ערב', customName: 'חלת שבת ודגים חריפים 🐟', weekKey: k24, completed: true, isShared: true },

    // 🌟 לפני 9 חודשים (offset -36)
    { id: 'h36_1', day: 'יום שני', meal: 'ארוחת צהריים', customName: 'המבורגר טבעוני מצוין 🍔', weekKey: k36, completed: true, isShared: true },
    { id: 'h36_2', day: 'יום חמישי', meal: 'דייט / בילוי', customName: 'הופעה חיה ובירה 🎸', weekKey: k36, completed: true, isShared: true },

    // 🌟 לפני 11 חודשים (offset -48)
    { id: 'h48_1', day: 'יום ראשון', meal: 'ארוחת בוקר', customName: 'סנדוויץ׳ אבוקדו וביצה 🥑', weekKey: k48, completed: true, isShared: true },
    { id: 'h48_2', day: 'יום רביעי', meal: 'אימון יומי', customName: 'אימון שחייה 🏊‍♂️', weekKey: k48, completed: true, isShared: true },

    // 🌟 לפני שנה בדיוק (offset -52)
    { id: 'h52_1', day: 'יום ראשון', meal: 'ארוחת צהריים', customName: 'ארוחת חג משפחתית 🍷', weekKey: k52, completed: true, isShared: true },
    { id: 'h52_2', day: 'יום שלישי', meal: 'אימון יומי', customName: 'אימון פתיחת שנה 🏃‍♂️', weekKey: k52, completed: true, isShared: true },
    { id: 'h52_3', day: 'יום שישי', meal: 'דייט / בילוי', customName: 'חופשה זוגית בסופ״ש 🏖️', weekKey: k52, completed: true, isShared: true }
  ];
};

export const DEFAULT_MEAL_PLAN: MealPlanItem[] = [];

export const DAYS_OF_WEEK = [
  'יום ראשון',
  'יום שני',
  'יום שלישי',
  'יום רביעי',
  'יום חמישי',
  'יום שישי',
  'יום שבת'
];

export const MEAL_TYPES = ['ארוחת בוקר', 'ארוחת צהריים', 'ארוחת ערב'];

// 🏋️ Fitness Defaults & Constants
export const MUSCLE_GROUPS: MuscleGroup[] = ['חזה', 'גב', 'רגליים', 'כתפיים', 'יד קדמית', 'יד אחורית', 'בטן', 'אירובי'];
export const SPLIT_GROUPS: WorkoutSplit[] = ['אימון A', 'אימון B', 'אימון C', 'אימון D', 'אירובי', 'כללי'];

export const DEFAULT_WORKOUTS: Workout[] = [
  {
    id: 'w1',
    title: 'אימון A - חזה, כתפיים ויד אחורית',
    splitGroup: 'אימון A',
    type: 'strength',
    targetMuscleGroups: ['חזה', 'כתפיים', 'יד אחורית'],
    exercises: [
      { id: 'ex1', name: 'לחיצת חזה כנגד מוט', muscleGroup: 'חזה', sets: 4, reps: 10, weight: 70 },
      { id: 'ex2', name: 'לחיצת חזה בשיפוע חיובי (משקולות)', muscleGroup: 'חזה', sets: 3, reps: 12, weight: 24 },
      { id: 'ex3', name: 'לחיצת כתפיים בישיבה', muscleGroup: 'כתפיים', sets: 3, reps: 10, weight: 20 },
      { id: 'ex4', name: 'פשטת מרפקים בכבל (פולי עליון)', muscleGroup: 'יד אחורית', sets: 3, reps: 12, weight: 35 }
    ],
    notes: 'התמקדות בטכניקה ועבודה על עומס מסתגל.'
  },
  {
    id: 'w2',
    title: 'אימון B - גב, יד קדמית ובטן',
    splitGroup: 'אימון B',
    type: 'strength',
    targetMuscleGroups: ['גב', 'יד קדמית', 'בטן'],
    exercises: [
      { id: 'ex5', name: 'מתח בתוספת משקל', muscleGroup: 'גב', sets: 4, reps: 8, weight: 10 },
      { id: 'ex6', name: 'חתירה כנגד מוט (Bent Over Row)', muscleGroup: 'גב', sets: 4, reps: 10, weight: 60 },
      { id: 'ex7', name: 'כפילת מרפקים כנגד מוט W', muscleGroup: 'יד קדמית', sets: 3, reps: 12, weight: 28 },
      { id: 'ex8', name: 'הרמת ברכיים במתח', muscleGroup: 'בטן', sets: 3, reps: 15, weight: 0 }
    ],
    notes: 'שמירה על גב ישר בכל תרגילי החתירה.'
  },
  {
    id: 'w3',
    title: 'אימון C - רגליים וכתפיים',
    splitGroup: 'אימון C',
    type: 'strength',
    targetMuscleGroups: ['רגליים', 'כתפיים', 'בטן'],
    exercises: [
      { id: 'ex9', name: 'סקוואט כנגד מוט (Back Squat)', muscleGroup: 'רגליים', sets: 4, reps: 8, weight: 90 },
      { id: 'ex10', name: 'דדליפט רומני (RDL)', muscleGroup: 'רגליים', sets: 3, reps: 10, weight: 80 },
      { id: 'ex11', name: 'הרחקת זרועות לצדדים (משקולות)', muscleGroup: 'כתפיים', sets: 4, reps: 15, weight: 10 },
      { id: 'ex12', name: 'פלאנק סטטי', muscleGroup: 'בטן', sets: 3, reps: 60, weight: 0 }
    ],
    notes: 'חימום יסודי לברכיים ולגב התחתון.'
  },
  {
    id: 'w4',
    title: 'אימון אירובי - ריצה ואינטרוולים',
    splitGroup: 'אירובי',
    type: 'cardio',
    targetMuscleGroups: ['אירובי', 'רגליים'],
    exercises: [
      { id: 'ex13', name: 'ריצת נפח בקצב קל', muscleGroup: 'אירובי', sets: 1, reps: 30, weight: 0, notes: '30 דקות ריצה קלה' },
      { id: 'ex14', name: 'ספרינטים בעלייה', muscleGroup: 'אירובי', sets: 6, reps: 1, weight: 0, notes: '30 שניות ספרינט, 60 שניות מנוחה' }
    ],
    notes: 'אימון סיבולת לב-ריאה ושיפור כושר כללי.'
  }
];

// 🥂 Date Night Defaults & Constants
export const DATE_CATEGORIES: DateCategory[] = [
  'מסעדות וברים',
  'טבע, ים ופיקניק',
  'קולנוע ותרבות',
  'בתי קפה וקינוחים',
  'דייט ביתי'
];

export const DEFAULT_DATE_SPOTS: DateSpot[] = [
  {
    id: 'ds1',
    title: 'מסעדת רומא כפרית',
    category: 'מסעדות וברים',
    address: 'שדרות רוטשילד, תל אביב',
    wazeUrl: 'https://waze.com/ul?q=שדרות%20רוטשילד%20תל%20אביב&navigate=yes',
    rating: 5,
    visitCount: 4,
    notes: 'לחם שום ופסטה כמהין מדהימה! מומלץ להזמין מקום מראש.',
    imageUrl: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=800&q=80'
  },
  {
    id: 'ds2',
    title: 'פיקניק בשקיעה מול הים',
    category: 'טבע, ים ופיקניק',
    address: 'חוף גורדון / מדרון יפו',
    wazeUrl: 'https://waze.com/ul?q=חוף%20גורדון%20תל%20אביב&navigate=yes',
    rating: 5,
    visitCount: 6,
    notes: 'להביא מחצלת, סלסלת גבינות, ענבים ויין רוזה צונן!',
    imageUrl: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=80'
  },
  {
    id: 'ds3',
    title: 'ערב סרט ופופקורן בקולנוע לב',
    category: 'קולנוע ותרבות',
    address: 'דיזנגוף סנטר',
    wazeUrl: 'https://waze.com/ul?q=דיזנגוף%20סנטר%20תל%20אביב&navigate=yes',
    rating: 4,
    visitCount: 2,
    notes: 'סרט איכותי, פופקורן חם וגלידה בהפסקה.',
    imageUrl: 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&w=800&q=80'
  },
  {
    id: 'ds4',
    title: 'דייט פיצה ויין בבית',
    category: 'דייט ביתי',
    address: 'בבית',
    rating: 5,
    visitCount: 9,
    notes: 'להכין בצק פיצה ביתי ביחד, להדליק נרות ולשים מוזיקה ג׳אז רגועה.',
    imageUrl: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=800&q=80'
  }
];

// 📝 Tasks & Notes Defaults & Constants
export const TASK_CATEGORIES: TaskCategory[] = [
  'כללי',
  'בית ומשפחה',
  'סידורים',
  'עבודה',
  'קניות',
  'לימודים',
  'אחר'
];

export const DEFAULT_TASKS: TaskItem[] = [
  {
    id: 't1',
    itemType: 'task',
    title: 'קניות מרוכזות לשבת 🛒',
    description: 'לוודא שיש חלות טריות, יין לקידוש, בשר לצלי וירקות לסלטים.',
    category: 'קניות',
    priority: 'high',
    completed: false,
    dueDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    dueTime: '18:00',
    createdAt: new Date().toISOString()
  },
  {
    id: 't2',
    itemType: 'task',
    title: 'סידור וניקוי מקרר ומזווה 🧽',
    description: 'לבדוק תאריכי תפוגה, לזרוק מוצרים ישנים ולארגן קופסאות תבלינים.',
    category: 'בית ומשפחה',
    priority: 'medium',
    completed: false,
    dueDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    createdAt: new Date().toISOString()
  },
  {
    id: 'n1',
    itemType: 'note',
    title: 'רעיונות למתכונים חדשים לחג 🍲',
    description: '1. צלי בקר ביין וערמונים\n2. סלט סלק ותפוחי עץ\n3. עוגת שוקולד לחה ללא גלוטן',
    category: 'כללי',
    priority: 'low',
    completed: false,
    noteColor: 'yellow',
    createdAt: new Date().toISOString()
  },
  {
    id: 'n2',
    itemType: 'note',
    title: 'קודים וסיסמאות לבית 🔑',
    description: 'קוד אינטרקום: 1478\nקוד וויפיי אורחים: FamilyGuest2026\nשעון שבת בלוח חשמל מוגדר לשעה 23:30',
    category: 'בית ומשפחה',
    priority: 'low',
    completed: false,
    noteColor: 'blue',
    createdAt: new Date().toISOString()
  }
];

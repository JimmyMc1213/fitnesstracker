export type CuratedFood = {
  id: string;
  name: string;
  defaultServing: { label: string; grams: number };
  per100g: { cal: number; p: number; c: number; f: number };
  keywords: string[];
};

export const CURATED_FOODS: CuratedFood[] = [
  // Proteins
  { id: 'c_chicken_breast', name: 'Chicken Breast, Cooked', defaultServing: { label: '1 breast (8oz)', grams: 226 }, per100g: { cal: 165, p: 31, c: 0, f: 3.6 }, keywords: ['chicken', 'chicken breast'] },
  { id: 'c_chicken_thigh', name: 'Chicken Thigh, Cooked', defaultServing: { label: '1 thigh (3oz)', grams: 85 }, per100g: { cal: 209, p: 26, c: 0, f: 11 }, keywords: ['chicken', 'chicken thigh'] },
  { id: 'c_ground_beef_80', name: 'Ground Beef 80/20, Cooked', defaultServing: { label: '4oz (113g)', grams: 113 }, per100g: { cal: 254, p: 26, c: 0, f: 17 }, keywords: ['ground beef', 'beef'] },
  { id: 'c_ground_beef_90', name: 'Ground Beef 90/10, Cooked', defaultServing: { label: '4oz (113g)', grams: 113 }, per100g: { cal: 196, p: 28, c: 0, f: 10 }, keywords: ['ground beef', 'lean beef'] },
  { id: 'c_ground_turkey', name: 'Ground Turkey, Cooked', defaultServing: { label: '4oz (113g)', grams: 113 }, per100g: { cal: 189, p: 27, c: 0, f: 9 }, keywords: ['turkey', 'ground turkey'] },
  { id: 'c_salmon', name: 'Salmon, Cooked', defaultServing: { label: '1 fillet (6oz)', grams: 170 }, per100g: { cal: 208, p: 20, c: 0, f: 13 }, keywords: ['salmon', 'fish'] },
  { id: 'c_tuna_can', name: 'Tuna, Canned in Water', defaultServing: { label: '1 can drained (5oz)', grams: 142 }, per100g: { cal: 116, p: 26, c: 0, f: 1 }, keywords: ['tuna', 'canned tuna'] },
  { id: 'c_tilapia', name: 'Tilapia, Cooked', defaultServing: { label: '1 fillet (4oz)', grams: 113 }, per100g: { cal: 128, p: 26, c: 0, f: 3 }, keywords: ['tilapia', 'fish'] },
  { id: 'c_shrimp', name: 'Shrimp, Cooked', defaultServing: { label: '3oz (85g)', grams: 85 }, per100g: { cal: 99, p: 24, c: 0, f: 0.3 }, keywords: ['shrimp'] },
  { id: 'c_egg_whole', name: 'Egg, Whole', defaultServing: { label: '1 large egg', grams: 50 }, per100g: { cal: 143, p: 13, c: 1, f: 10 }, keywords: ['egg', 'eggs', 'whole egg'] },
  { id: 'c_egg_white', name: 'Egg White', defaultServing: { label: '1 large egg white', grams: 33 }, per100g: { cal: 52, p: 11, c: 0.7, f: 0.2 }, keywords: ['egg white', 'egg whites'] },
  { id: 'c_greek_yogurt', name: 'Greek Yogurt, Plain Nonfat', defaultServing: { label: '1 container (5.3oz)', grams: 150 }, per100g: { cal: 59, p: 10, c: 3.6, f: 0.4 }, keywords: ['greek yogurt', 'yogurt'] },
  { id: 'c_cottage_cheese', name: 'Cottage Cheese, 2%', defaultServing: { label: '½ cup (113g)', grams: 113 }, per100g: { cal: 90, p: 11, c: 4, f: 2.5 }, keywords: ['cottage cheese'] },
  { id: 'c_steak_sirloin', name: 'Sirloin Steak, Cooked', defaultServing: { label: '6oz', grams: 170 }, per100g: { cal: 207, p: 30, c: 0, f: 9 }, keywords: ['steak', 'sirloin'] },
  { id: 'c_pork_tenderloin', name: 'Pork Tenderloin, Cooked', defaultServing: { label: '4oz (113g)', grams: 113 }, per100g: { cal: 166, p: 26, c: 0, f: 6 }, keywords: ['pork', 'pork tenderloin'] },

  // Carbs
  { id: 'c_white_rice', name: 'White Rice, Cooked', defaultServing: { label: '1 cup cooked', grams: 186 }, per100g: { cal: 130, p: 2.7, c: 28, f: 0.3 }, keywords: ['white rice', 'rice'] },
  { id: 'c_brown_rice', name: 'Brown Rice, Cooked', defaultServing: { label: '1 cup cooked', grams: 202 }, per100g: { cal: 123, p: 2.7, c: 26, f: 1 }, keywords: ['brown rice', 'rice'] },
  { id: 'c_oats', name: 'Oats, Dry', defaultServing: { label: '½ cup dry (40g)', grams: 40 }, per100g: { cal: 389, p: 17, c: 66, f: 7 }, keywords: ['oats', 'oatmeal'] },
  { id: 'c_sweet_potato', name: 'Sweet Potato, Baked', defaultServing: { label: '1 medium (130g)', grams: 130 }, per100g: { cal: 90, p: 2, c: 21, f: 0.1 }, keywords: ['sweet potato'] },
  { id: 'c_potato', name: 'Potato, Baked', defaultServing: { label: '1 medium (173g)', grams: 173 }, per100g: { cal: 93, p: 2.5, c: 21, f: 0.1 }, keywords: ['potato', 'baked potato'] },
  { id: 'c_pasta', name: 'Pasta, Cooked', defaultServing: { label: '1 cup cooked', grams: 140 }, per100g: { cal: 158, p: 6, c: 31, f: 1 }, keywords: ['pasta', 'spaghetti', 'noodles'] },
  { id: 'c_bread_white', name: 'Bread, White', defaultServing: { label: '1 slice (28g)', grams: 28 }, per100g: { cal: 265, p: 9, c: 49, f: 3.2 }, keywords: ['bread', 'white bread'] },
  { id: 'c_bread_wheat', name: 'Bread, Whole Wheat', defaultServing: { label: '1 slice (28g)', grams: 28 }, per100g: { cal: 247, p: 13, c: 41, f: 4 }, keywords: ['wheat bread', 'whole wheat bread', 'bread'] },
  { id: 'c_banana', name: 'Banana', defaultServing: { label: '1 medium banana', grams: 118 }, per100g: { cal: 89, p: 1.1, c: 23, f: 0.3 }, keywords: ['banana'] },
  { id: 'c_apple', name: 'Apple', defaultServing: { label: '1 medium apple', grams: 182 }, per100g: { cal: 52, p: 0.3, c: 14, f: 0.2 }, keywords: ['apple'] },
  { id: 'c_blueberries', name: 'Blueberries', defaultServing: { label: '1 cup', grams: 148 }, per100g: { cal: 57, p: 0.7, c: 14, f: 0.3 }, keywords: ['blueberries', 'blueberry'] },
  { id: 'c_strawberries', name: 'Strawberries', defaultServing: { label: '1 cup', grams: 152 }, per100g: { cal: 32, p: 0.7, c: 8, f: 0.3 }, keywords: ['strawberries', 'strawberry'] },
  { id: 'c_tortilla_flour', name: 'Flour Tortilla', defaultServing: { label: '1 medium tortilla', grams: 45 }, per100g: { cal: 312, p: 8, c: 51, f: 8 }, keywords: ['tortilla', 'flour tortilla'] },

  // Fats
  { id: 'c_avocado', name: 'Avocado', defaultServing: { label: '½ avocado', grams: 75 }, per100g: { cal: 160, p: 2, c: 9, f: 15 }, keywords: ['avocado'] },
  { id: 'c_olive_oil', name: 'Olive Oil', defaultServing: { label: '1 tbsp', grams: 14 }, per100g: { cal: 884, p: 0, c: 0, f: 100 }, keywords: ['olive oil'] },
  { id: 'c_butter', name: 'Butter', defaultServing: { label: '1 tbsp', grams: 14 }, per100g: { cal: 717, p: 0.9, c: 0.1, f: 81 }, keywords: ['butter'] },
  { id: 'c_almonds', name: 'Almonds', defaultServing: { label: '1oz (28g)', grams: 28 }, per100g: { cal: 579, p: 21, c: 22, f: 50 }, keywords: ['almonds', 'almond'] },
  { id: 'c_peanut_butter', name: 'Peanut Butter', defaultServing: { label: '2 tbsp (32g)', grams: 32 }, per100g: { cal: 588, p: 25, c: 20, f: 50 }, keywords: ['peanut butter'] },

  // Dairy
  { id: 'c_milk_whole', name: 'Milk, Whole', defaultServing: { label: '1 cup (244ml)', grams: 244 }, per100g: { cal: 61, p: 3.2, c: 4.8, f: 3.3 }, keywords: ['whole milk', 'milk'] },
  { id: 'c_milk_2', name: 'Milk, 2%', defaultServing: { label: '1 cup (244ml)', grams: 244 }, per100g: { cal: 50, p: 3.4, c: 4.8, f: 2 }, keywords: ['2% milk', 'milk'] },
  { id: 'c_cheddar', name: 'Cheddar Cheese', defaultServing: { label: '1oz (28g)', grams: 28 }, per100g: { cal: 403, p: 25, c: 1.3, f: 33 }, keywords: ['cheddar', 'cheese'] },
  { id: 'c_mozzarella', name: 'Mozzarella Cheese', defaultServing: { label: '1oz (28g)', grams: 28 }, per100g: { cal: 280, p: 28, c: 2.2, f: 17 }, keywords: ['mozzarella', 'cheese'] },

  // Other common
  { id: 'c_protein_powder', name: 'Whey Protein Powder', defaultServing: { label: '1 scoop (30g)', grams: 30 }, per100g: { cal: 400, p: 80, c: 7, f: 5 }, keywords: ['protein powder', 'whey', 'protein shake'] },
  { id: 'c_black_beans', name: 'Black Beans, Cooked', defaultServing: { label: '½ cup', grams: 86 }, per100g: { cal: 132, p: 8.9, c: 24, f: 0.5 }, keywords: ['black beans', 'beans'] },
  { id: 'c_broccoli', name: 'Broccoli', defaultServing: { label: '1 cup chopped', grams: 91 }, per100g: { cal: 34, p: 2.8, c: 7, f: 0.4 }, keywords: ['broccoli'] },
  { id: 'c_spinach', name: 'Spinach', defaultServing: { label: '1 cup raw', grams: 30 }, per100g: { cal: 23, p: 2.9, c: 3.6, f: 0.4 }, keywords: ['spinach'] },
];

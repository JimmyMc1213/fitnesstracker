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

  // ── Additional Proteins ──────────────────────────────────────────
  { id: 'c_chicken_wing', name: 'Chicken Wings, Cooked', defaultServing: { label: '4 wings (88g)', grams: 88 }, per100g: { cal: 290, p: 27, c: 0, f: 19 }, keywords: ['chicken wings', 'wings', 'chicken'] },
  { id: 'c_chicken_drumstick', name: 'Chicken Drumstick, Cooked', defaultServing: { label: '1 drumstick (52g)', grams: 52 }, per100g: { cal: 172, p: 28, c: 0, f: 6 }, keywords: ['chicken drumstick', 'drumstick', 'chicken'] },
  { id: 'c_chicken_rotisserie', name: 'Rotisserie Chicken, Breast', defaultServing: { label: '3oz (85g)', grams: 85 }, per100g: { cal: 148, p: 27, c: 0, f: 4 }, keywords: ['rotisserie chicken', 'rotisserie'] },
  { id: 'c_turkey_breast', name: 'Turkey Breast, Cooked', defaultServing: { label: '3oz (85g)', grams: 85 }, per100g: { cal: 135, p: 30, c: 0, f: 1 }, keywords: ['turkey breast', 'turkey'] },
  { id: 'c_turkey_deli', name: 'Turkey, Deli Sliced', defaultServing: { label: '2oz (56g)', grams: 56 }, per100g: { cal: 107, p: 18, c: 2, f: 3 }, keywords: ['deli turkey', 'lunch meat', 'turkey'] },
  { id: 'c_ham_deli', name: 'Ham, Deli Sliced', defaultServing: { label: '2oz (56g)', grams: 56 }, per100g: { cal: 107, p: 15, c: 2, f: 4 }, keywords: ['ham', 'deli ham', 'lunch meat'] },
  { id: 'c_bacon', name: 'Bacon, Cooked', defaultServing: { label: '3 strips (34g)', grams: 34 }, per100g: { cal: 541, p: 37, c: 1.4, f: 42 }, keywords: ['bacon'] },
  { id: 'c_turkey_bacon', name: 'Turkey Bacon, Cooked', defaultServing: { label: '3 strips (34g)', grams: 34 }, per100g: { cal: 218, p: 28, c: 1.5, f: 11 }, keywords: ['turkey bacon', 'bacon'] },
  { id: 'c_ribeye', name: 'Ribeye Steak, Cooked', defaultServing: { label: '6oz (170g)', grams: 170 }, per100g: { cal: 291, p: 24, c: 0, f: 21 }, keywords: ['ribeye', 'steak'] },
  { id: 'c_flank_steak', name: 'Flank Steak, Cooked', defaultServing: { label: '4oz (113g)', grams: 113 }, per100g: { cal: 192, p: 28, c: 0, f: 8 }, keywords: ['flank steak', 'steak'] },
  { id: 'c_pork_chop', name: 'Pork Chop, Cooked', defaultServing: { label: '1 chop (87g)', grams: 87 }, per100g: { cal: 231, p: 25, c: 0, f: 14 }, keywords: ['pork chop', 'pork'] },
  { id: 'c_pork_sausage', name: 'Pork Sausage, Cooked', defaultServing: { label: '2 links (57g)', grams: 57 }, per100g: { cal: 339, p: 19, c: 1, f: 29 }, keywords: ['sausage', 'pork sausage'] },
  { id: 'c_italian_sausage', name: 'Italian Sausage, Cooked', defaultServing: { label: '1 link (83g)', grams: 83 }, per100g: { cal: 304, p: 16, c: 4, f: 25 }, keywords: ['italian sausage', 'sausage'] },
  { id: 'c_cod', name: 'Cod, Cooked', defaultServing: { label: '1 fillet (180g)', grams: 180 }, per100g: { cal: 105, p: 23, c: 0, f: 0.9 }, keywords: ['cod', 'fish'] },
  { id: 'c_mahi', name: 'Mahi Mahi, Cooked', defaultServing: { label: '1 fillet (130g)', grams: 130 }, per100g: { cal: 109, p: 24, c: 0, f: 0.9 }, keywords: ['mahi mahi', 'mahi', 'fish'] },
  { id: 'c_scallops', name: 'Scallops, Cooked', defaultServing: { label: '3oz (85g)', grams: 85 }, per100g: { cal: 111, p: 23, c: 3, f: 0.8 }, keywords: ['scallops'] },
  { id: 'c_crab', name: 'Crab, Cooked', defaultServing: { label: '3oz (85g)', grams: 85 }, per100g: { cal: 97, p: 19, c: 0, f: 1.5 }, keywords: ['crab'] },
  { id: 'c_lobster', name: 'Lobster, Cooked', defaultServing: { label: '3oz (85g)', grams: 85 }, per100g: { cal: 89, p: 19, c: 0.5, f: 0.5 }, keywords: ['lobster'] },
  { id: 'c_tofu_firm', name: 'Tofu, Firm', defaultServing: { label: '½ cup (126g)', grams: 126 }, per100g: { cal: 76, p: 8, c: 2, f: 4 }, keywords: ['tofu', 'firm tofu'] },
  { id: 'c_tempeh', name: 'Tempeh', defaultServing: { label: '3oz (85g)', grams: 85 }, per100g: { cal: 193, p: 19, c: 9, f: 11 }, keywords: ['tempeh'] },
  { id: 'c_edamame', name: 'Edamame, Shelled', defaultServing: { label: '½ cup (78g)', grams: 78 }, per100g: { cal: 122, p: 11, c: 10, f: 5 }, keywords: ['edamame'] },

  // ── Protein Powders & Bars ────────────────────────────────────────
  { id: 'c_casein_powder', name: 'Casein Protein Powder', defaultServing: { label: '1 scoop (34g)', grams: 34 }, per100g: { cal: 376, p: 82, c: 6, f: 2 }, keywords: ['casein', 'casein protein', 'protein powder'] },
  { id: 'c_plant_protein', name: 'Plant Protein Powder', defaultServing: { label: '1 scoop (30g)', grams: 30 }, per100g: { cal: 367, p: 73, c: 10, f: 5 }, keywords: ['plant protein', 'vegan protein', 'protein powder'] },
  { id: 'c_quest_bar', name: 'Quest Protein Bar', defaultServing: { label: '1 bar (60g)', grams: 60 }, per100g: { cal: 367, p: 33, c: 40, f: 12 }, keywords: ['quest bar', 'protein bar', 'quest'] },
  { id: 'c_rxbar', name: 'RX Bar', defaultServing: { label: '1 bar (52g)', grams: 52 }, per100g: { cal: 346, p: 23, c: 46, f: 8 }, keywords: ['rxbar', 'rx bar', 'protein bar'] },
  { id: 'c_kind_bar', name: 'KIND Bar', defaultServing: { label: '1 bar (40g)', grams: 40 }, per100g: { cal: 425, p: 8, c: 45, f: 25 }, keywords: ['kind bar', 'kind', 'snack bar'] },
  { id: 'c_clif_bar', name: 'Clif Bar', defaultServing: { label: '1 bar (68g)', grams: 68 }, per100g: { cal: 368, p: 10, c: 65, f: 7 }, keywords: ['clif bar', 'clif', 'energy bar'] },
  { id: 'c_one_bar', name: 'ONE Protein Bar', defaultServing: { label: '1 bar (60g)', grams: 60 }, per100g: { cal: 350, p: 33, c: 37, f: 10 }, keywords: ['one bar', 'one protein bar', 'protein bar'] },
  { id: 'c_built_bar', name: 'Built Bar', defaultServing: { label: '1 bar (40g)', grams: 40 }, per100g: { cal: 325, p: 35, c: 33, f: 8 }, keywords: ['built bar', 'protein bar'] },

  // ── Additional Fruits ─────────────────────────────────────────────
  { id: 'c_orange', name: 'Orange', defaultServing: { label: '1 medium orange', grams: 131 }, per100g: { cal: 47, p: 0.9, c: 12, f: 0.1 }, keywords: ['orange', 'oranges'] },
  { id: 'c_grapes', name: 'Grapes', defaultServing: { label: '1 cup', grams: 92 }, per100g: { cal: 69, p: 0.7, c: 18, f: 0.2 }, keywords: ['grapes', 'grape'] },
  { id: 'c_mango', name: 'Mango', defaultServing: { label: '1 cup sliced', grams: 165 }, per100g: { cal: 60, p: 0.8, c: 15, f: 0.4 }, keywords: ['mango'] },
  { id: 'c_pineapple', name: 'Pineapple', defaultServing: { label: '1 cup chunks', grams: 165 }, per100g: { cal: 50, p: 0.5, c: 13, f: 0.1 }, keywords: ['pineapple'] },
  { id: 'c_watermelon', name: 'Watermelon', defaultServing: { label: '1 cup diced', grams: 152 }, per100g: { cal: 30, p: 0.6, c: 8, f: 0.2 }, keywords: ['watermelon'] },
  { id: 'c_peach', name: 'Peach', defaultServing: { label: '1 medium peach', grams: 150 }, per100g: { cal: 39, p: 0.9, c: 10, f: 0.3 }, keywords: ['peach', 'peaches'] },
  { id: 'c_pear', name: 'Pear', defaultServing: { label: '1 medium pear', grams: 178 }, per100g: { cal: 57, p: 0.4, c: 15, f: 0.1 }, keywords: ['pear', 'pears'] },
  { id: 'c_raspberries', name: 'Raspberries', defaultServing: { label: '1 cup', grams: 123 }, per100g: { cal: 52, p: 1.2, c: 12, f: 0.7 }, keywords: ['raspberries', 'raspberry'] },
  { id: 'c_blackberries', name: 'Blackberries', defaultServing: { label: '1 cup', grams: 144 }, per100g: { cal: 43, p: 1.4, c: 10, f: 0.5 }, keywords: ['blackberries', 'blackberry'] },
  { id: 'c_cherries', name: 'Cherries', defaultServing: { label: '1 cup', grams: 138 }, per100g: { cal: 63, p: 1.1, c: 16, f: 0.2 }, keywords: ['cherries', 'cherry'] },
  { id: 'c_kiwi', name: 'Kiwi', defaultServing: { label: '1 medium kiwi', grams: 76 }, per100g: { cal: 61, p: 1.1, c: 15, f: 0.5 }, keywords: ['kiwi'] },
  { id: 'c_cantaloupe', name: 'Cantaloupe', defaultServing: { label: '1 cup diced', grams: 160 }, per100g: { cal: 34, p: 0.8, c: 8, f: 0.2 }, keywords: ['cantaloupe', 'melon'] },
  { id: 'c_grapefruit', name: 'Grapefruit', defaultServing: { label: '½ grapefruit', grams: 123 }, per100g: { cal: 42, p: 0.8, c: 11, f: 0.1 }, keywords: ['grapefruit'] },
  { id: 'c_lemon', name: 'Lemon', defaultServing: { label: '1 medium lemon', grams: 58 }, per100g: { cal: 29, p: 1.1, c: 9, f: 0.3 }, keywords: ['lemon'] },

  // ── Vegetables ────────────────────────────────────────────────────
  { id: 'c_asparagus', name: 'Asparagus', defaultServing: { label: '5 spears (80g)', grams: 80 }, per100g: { cal: 20, p: 2.2, c: 3.7, f: 0.1 }, keywords: ['asparagus'] },
  { id: 'c_green_beans', name: 'Green Beans', defaultServing: { label: '1 cup', grams: 100 }, per100g: { cal: 31, p: 1.8, c: 7, f: 0.1 }, keywords: ['green beans'] },
  { id: 'c_brussels_sprouts', name: 'Brussels Sprouts', defaultServing: { label: '1 cup', grams: 88 }, per100g: { cal: 43, p: 3.4, c: 9, f: 0.3 }, keywords: ['brussels sprouts'] },
  { id: 'c_cauliflower', name: 'Cauliflower', defaultServing: { label: '1 cup chopped', grams: 107 }, per100g: { cal: 25, p: 1.9, c: 5, f: 0.3 }, keywords: ['cauliflower'] },
  { id: 'c_zucchini', name: 'Zucchini', defaultServing: { label: '1 cup sliced', grams: 113 }, per100g: { cal: 17, p: 1.2, c: 3.1, f: 0.3 }, keywords: ['zucchini'] },
  { id: 'c_bell_pepper', name: 'Bell Pepper', defaultServing: { label: '1 medium pepper', grams: 119 }, per100g: { cal: 31, p: 1, c: 7, f: 0.3 }, keywords: ['bell pepper', 'pepper'] },
  { id: 'c_cucumber', name: 'Cucumber', defaultServing: { label: '½ cup sliced', grams: 52 }, per100g: { cal: 15, p: 0.7, c: 3.6, f: 0.1 }, keywords: ['cucumber'] },
  { id: 'c_tomato', name: 'Tomato', defaultServing: { label: '1 medium tomato', grams: 123 }, per100g: { cal: 18, p: 0.9, c: 3.9, f: 0.2 }, keywords: ['tomato', 'tomatoes'] },
  { id: 'c_onion', name: 'Onion', defaultServing: { label: '½ cup chopped', grams: 80 }, per100g: { cal: 40, p: 1.1, c: 9, f: 0.1 }, keywords: ['onion', 'onions'] },
  { id: 'c_mushrooms', name: 'Mushrooms', defaultServing: { label: '1 cup', grams: 70 }, per100g: { cal: 22, p: 3.1, c: 3.3, f: 0.3 }, keywords: ['mushrooms', 'mushroom'] },
  { id: 'c_kale', name: 'Kale', defaultServing: { label: '1 cup raw', grams: 67 }, per100g: { cal: 35, p: 2.9, c: 4.4, f: 1.5 }, keywords: ['kale'] },
  { id: 'c_carrots', name: 'Carrots', defaultServing: { label: '1 medium carrot', grams: 61 }, per100g: { cal: 41, p: 0.9, c: 10, f: 0.2 }, keywords: ['carrots', 'carrot'] },
  { id: 'c_celery', name: 'Celery', defaultServing: { label: '1 stalk', grams: 40 }, per100g: { cal: 16, p: 0.7, c: 3, f: 0.2 }, keywords: ['celery'] },
  { id: 'c_corn', name: 'Corn, Cooked', defaultServing: { label: '1 ear (90g)', grams: 90 }, per100g: { cal: 96, p: 3.4, c: 21, f: 1.5 }, keywords: ['corn'] },
  { id: 'c_peas', name: 'Peas, Green', defaultServing: { label: '½ cup', grams: 80 }, per100g: { cal: 81, p: 5.4, c: 14, f: 0.4 }, keywords: ['peas', 'green peas'] },

  // ── Frozen Foods ──────────────────────────────────────────────────
  { id: 'c_frozen_broccoli', name: 'Broccoli, Frozen', defaultServing: { label: '1 cup (91g)', grams: 91 }, per100g: { cal: 35, p: 2.6, c: 7, f: 0.4 }, keywords: ['frozen broccoli', 'broccoli'] },
  { id: 'c_frozen_peas', name: 'Peas, Frozen', defaultServing: { label: '½ cup (80g)', grams: 80 }, per100g: { cal: 77, p: 5.2, c: 14, f: 0.2 }, keywords: ['frozen peas', 'peas'] },
  { id: 'c_frozen_corn', name: 'Corn, Frozen', defaultServing: { label: '½ cup (82g)', grams: 82 }, per100g: { cal: 83, p: 3.2, c: 19, f: 0.6 }, keywords: ['frozen corn', 'corn'] },
  { id: 'c_frozen_edamame', name: 'Edamame, Frozen', defaultServing: { label: '½ cup (78g)', grams: 78 }, per100g: { cal: 122, p: 11, c: 10, f: 5 }, keywords: ['frozen edamame', 'edamame'] },
  { id: 'c_frozen_mixed_veg', name: 'Mixed Vegetables, Frozen', defaultServing: { label: '1 cup (91g)', grams: 91 }, per100g: { cal: 65, p: 3.2, c: 13, f: 0.3 }, keywords: ['mixed vegetables', 'frozen vegetables', 'mixed veggies'] },
  { id: 'c_frozen_fries', name: 'French Fries, Frozen Baked', defaultServing: { label: '3oz (85g)', grams: 85 }, per100g: { cal: 163, p: 2.5, c: 26, f: 6 }, keywords: ['frozen fries', 'french fries', 'fries'] },
  { id: 'c_frozen_pizza', name: 'Frozen Pizza, Cheese', defaultServing: { label: '1 slice (107g)', grams: 107 }, per100g: { cal: 266, p: 11, c: 33, f: 10 }, keywords: ['frozen pizza', 'pizza'] },
  { id: 'c_frozen_burrito', name: 'Frozen Burrito, Bean & Cheese', defaultServing: { label: '1 burrito (142g)', grams: 142 }, per100g: { cal: 219, p: 7, c: 33, f: 7 }, keywords: ['frozen burrito', 'burrito'] },
  { id: 'c_frozen_waffles', name: 'Waffles, Frozen', defaultServing: { label: '2 waffles (70g)', grams: 70 }, per100g: { cal: 286, p: 7, c: 43, f: 10 }, keywords: ['frozen waffles', 'waffles'] },

  // ── Grains & Carbs ────────────────────────────────────────────────
  { id: 'c_quinoa', name: 'Quinoa, Cooked', defaultServing: { label: '1 cup cooked', grams: 185 }, per100g: { cal: 120, p: 4.4, c: 22, f: 1.9 }, keywords: ['quinoa'] },
  { id: 'c_bagel', name: 'Bagel, Plain', defaultServing: { label: '1 medium bagel', grams: 98 }, per100g: { cal: 270, p: 10, c: 53, f: 1.7 }, keywords: ['bagel'] },
  { id: 'c_english_muffin', name: 'English Muffin', defaultServing: { label: '1 muffin (57g)', grams: 57 }, per100g: { cal: 223, p: 9, c: 44, f: 1.9 }, keywords: ['english muffin', 'muffin'] },
  { id: 'c_pita', name: 'Pita Bread', defaultServing: { label: '1 pita (60g)', grams: 60 }, per100g: { cal: 275, p: 9, c: 55, f: 1.2 }, keywords: ['pita', 'pita bread'] },
  { id: 'c_corn_tortilla', name: 'Corn Tortilla', defaultServing: { label: '1 tortilla (26g)', grams: 26 }, per100g: { cal: 218, p: 5.7, c: 46, f: 2.5 }, keywords: ['corn tortilla', 'tortilla'] },
  { id: 'c_crackers', name: 'Crackers, Whole Wheat', defaultServing: { label: '16 crackers (30g)', grams: 30 }, per100g: { cal: 433, p: 10, c: 67, f: 15 }, keywords: ['crackers', 'whole wheat crackers'] },
  { id: 'c_rice_cake', name: 'Rice Cakes, Plain', defaultServing: { label: '2 cakes (18g)', grams: 18 }, per100g: { cal: 387, p: 8, c: 81, f: 3 }, keywords: ['rice cake', 'rice cakes'] },
  { id: 'c_granola', name: 'Granola', defaultServing: { label: '¼ cup (30g)', grams: 30 }, per100g: { cal: 471, p: 10, c: 64, f: 20 }, keywords: ['granola'] },
  { id: 'c_cereal_oat', name: 'Cheerios', defaultServing: { label: '1 cup (28g)', grams: 28 }, per100g: { cal: 375, p: 12, c: 68, f: 7 }, keywords: ['cheerios', 'cereal'] },

  // ── Nuts & Seeds ──────────────────────────────────────────────────
  { id: 'c_cashews', name: 'Cashews', defaultServing: { label: '1oz (28g)', grams: 28 }, per100g: { cal: 553, p: 18, c: 30, f: 44 }, keywords: ['cashews', 'cashew'] },
  { id: 'c_walnuts', name: 'Walnuts', defaultServing: { label: '1oz (28g)', grams: 28 }, per100g: { cal: 654, p: 15, c: 14, f: 65 }, keywords: ['walnuts', 'walnut'] },
  { id: 'c_pistachios', name: 'Pistachios', defaultServing: { label: '1oz (28g)', grams: 28 }, per100g: { cal: 560, p: 20, c: 28, f: 45 }, keywords: ['pistachios', 'pistachio'] },
  { id: 'c_sunflower_seeds', name: 'Sunflower Seeds', defaultServing: { label: '¼ cup (35g)', grams: 35 }, per100g: { cal: 584, p: 21, c: 20, f: 51 }, keywords: ['sunflower seeds'] },
  { id: 'c_chia_seeds', name: 'Chia Seeds', defaultServing: { label: '2 tbsp (28g)', grams: 28 }, per100g: { cal: 486, p: 17, c: 42, f: 31 }, keywords: ['chia seeds', 'chia'] },
  { id: 'c_flaxseed', name: 'Flaxseed, Ground', defaultServing: { label: '2 tbsp (14g)', grams: 14 }, per100g: { cal: 534, p: 18, c: 29, f: 42 }, keywords: ['flaxseed', 'flax'] },
  { id: 'c_almond_butter', name: 'Almond Butter', defaultServing: { label: '2 tbsp (32g)', grams: 32 }, per100g: { cal: 614, p: 21, c: 19, f: 56 }, keywords: ['almond butter'] },

  // ── Dairy & Eggs ──────────────────────────────────────────────────
  { id: 'c_milk_skim', name: 'Milk, Skim', defaultServing: { label: '1 cup (244ml)', grams: 244 }, per100g: { cal: 34, p: 3.4, c: 5, f: 0.2 }, keywords: ['skim milk', 'nonfat milk', 'milk'] },
  { id: 'c_milk_oat', name: 'Oat Milk', defaultServing: { label: '1 cup (240ml)', grams: 240 }, per100g: { cal: 46, p: 1.3, c: 8, f: 1.5 }, keywords: ['oat milk'] },
  { id: 'c_milk_almond', name: 'Almond Milk, Unsweetened', defaultServing: { label: '1 cup (240ml)', grams: 240 }, per100g: { cal: 15, p: 0.6, c: 0.6, f: 1.2 }, keywords: ['almond milk'] },
  { id: 'c_cream_cheese', name: 'Cream Cheese', defaultServing: { label: '2 tbsp (29g)', grams: 29 }, per100g: { cal: 342, p: 6, c: 4, f: 34 }, keywords: ['cream cheese'] },
  { id: 'c_sour_cream', name: 'Sour Cream', defaultServing: { label: '2 tbsp (30g)', grams: 30 }, per100g: { cal: 198, p: 2.4, c: 4.6, f: 19 }, keywords: ['sour cream'] },
  { id: 'c_heavy_cream', name: 'Heavy Cream', defaultServing: { label: '1 tbsp (15ml)', grams: 15 }, per100g: { cal: 345, p: 2.1, c: 2.8, f: 37 }, keywords: ['heavy cream', 'heavy whipping cream'] },
  { id: 'c_parmesan', name: 'Parmesan Cheese', defaultServing: { label: '2 tbsp (10g)', grams: 10 }, per100g: { cal: 431, p: 38, c: 4, f: 29 }, keywords: ['parmesan', 'cheese'] },
  { id: 'c_swiss_cheese', name: 'Swiss Cheese', defaultServing: { label: '1 slice (28g)', grams: 28 }, per100g: { cal: 380, p: 27, c: 5, f: 28 }, keywords: ['swiss cheese', 'cheese'] },
  { id: 'c_provolone', name: 'Provolone Cheese', defaultServing: { label: '1 slice (28g)', grams: 28 }, per100g: { cal: 352, p: 26, c: 2.1, f: 27 }, keywords: ['provolone', 'cheese'] },
  { id: 'c_american_cheese', name: 'American Cheese', defaultServing: { label: '1 slice (21g)', grams: 21 }, per100g: { cal: 371, p: 16, c: 8, f: 30 }, keywords: ['american cheese', 'cheese'] },
  { id: 'c_ice_cream', name: 'Ice Cream, Vanilla', defaultServing: { label: '½ cup (66g)', grams: 66 }, per100g: { cal: 207, p: 3.5, c: 24, f: 11 }, keywords: ['ice cream', 'vanilla ice cream'] },
  { id: 'c_halo_top', name: 'Halo Top, Vanilla Bean', defaultServing: { label: '½ cup (76g)', grams: 76 }, per100g: { cal: 105, p: 6.6, c: 20, f: 2 }, keywords: ['halo top', 'light ice cream'] },

  // ── Legumes & Beans ───────────────────────────────────────────────
  { id: 'c_chickpeas', name: 'Chickpeas, Cooked', defaultServing: { label: '½ cup (82g)', grams: 82 }, per100g: { cal: 164, p: 8.9, c: 27, f: 2.6 }, keywords: ['chickpeas', 'garbanzo beans'] },
  { id: 'c_lentils', name: 'Lentils, Cooked', defaultServing: { label: '½ cup (99g)', grams: 99 }, per100g: { cal: 116, p: 9, c: 20, f: 0.4 }, keywords: ['lentils'] },
  { id: 'c_kidney_beans', name: 'Kidney Beans, Cooked', defaultServing: { label: '½ cup (89g)', grams: 89 }, per100g: { cal: 127, p: 8.7, c: 23, f: 0.5 }, keywords: ['kidney beans', 'beans'] },
  { id: 'c_pinto_beans', name: 'Pinto Beans, Cooked', defaultServing: { label: '½ cup (86g)', grams: 86 }, per100g: { cal: 143, p: 9, c: 27, f: 0.7 }, keywords: ['pinto beans', 'beans'] },
  { id: 'c_refried_beans', name: 'Refried Beans', defaultServing: { label: '½ cup (130g)', grams: 130 }, per100g: { cal: 90, p: 5.5, c: 15, f: 1.5 }, keywords: ['refried beans', 'beans'] },

  // ── Sauces & Condiments ───────────────────────────────────────────
  { id: 'c_ketchup', name: 'Ketchup', defaultServing: { label: '1 tbsp (17g)', grams: 17 }, per100g: { cal: 112, p: 1.3, c: 27, f: 0.1 }, keywords: ['ketchup'] },
  { id: 'c_mustard', name: 'Yellow Mustard', defaultServing: { label: '1 tsp (5g)', grams: 5 }, per100g: { cal: 60, p: 3.7, c: 6, f: 3 }, keywords: ['mustard', 'yellow mustard'] },
  { id: 'c_mayo', name: 'Mayonnaise', defaultServing: { label: '1 tbsp (14g)', grams: 14 }, per100g: { cal: 680, p: 1, c: 0.6, f: 75 }, keywords: ['mayo', 'mayonnaise'] },
  { id: 'c_ranch', name: 'Ranch Dressing', defaultServing: { label: '2 tbsp (30g)', grams: 30 }, per100g: { cal: 327, p: 1.5, c: 6, f: 34 }, keywords: ['ranch', 'ranch dressing'] },
  { id: 'c_hot_sauce', name: 'Hot Sauce', defaultServing: { label: '1 tsp (5g)', grams: 5 }, per100g: { cal: 24, p: 1.4, c: 4, f: 0.5 }, keywords: ['hot sauce'] },
  { id: 'c_salsa', name: 'Salsa', defaultServing: { label: '2 tbsp (32g)', grams: 32 }, per100g: { cal: 36, p: 1.7, c: 7, f: 0.2 }, keywords: ['salsa'] },
  { id: 'c_guacamole', name: 'Guacamole', defaultServing: { label: '2 tbsp (30g)', grams: 30 }, per100g: { cal: 150, p: 2, c: 8, f: 13 }, keywords: ['guacamole'] },
  { id: 'c_hummus', name: 'Hummus', defaultServing: { label: '2 tbsp (30g)', grams: 30 }, per100g: { cal: 177, p: 8, c: 14, f: 10 }, keywords: ['hummus'] },
  { id: 'c_bbq_sauce', name: 'BBQ Sauce', defaultServing: { label: '2 tbsp (36g)', grams: 36 }, per100g: { cal: 172, p: 0.9, c: 41, f: 0.5 }, keywords: ['bbq sauce', 'barbecue sauce'] },
  { id: 'c_soy_sauce', name: 'Soy Sauce', defaultServing: { label: '1 tbsp (16g)', grams: 16 }, per100g: { cal: 53, p: 8, c: 5, f: 0.1 }, keywords: ['soy sauce'] },
  { id: 'c_teriyaki', name: 'Teriyaki Sauce', defaultServing: { label: '1 tbsp (18g)', grams: 18 }, per100g: { cal: 89, p: 5.7, c: 16, f: 0.1 }, keywords: ['teriyaki sauce', 'teriyaki'] },
  { id: 'c_pasta_sauce', name: 'Marinara Sauce', defaultServing: { label: '½ cup (125g)', grams: 125 }, per100g: { cal: 53, p: 1.9, c: 9, f: 1.4 }, keywords: ['marinara', 'pasta sauce', 'tomato sauce'] },
  { id: 'c_sriracha', name: 'Sriracha', defaultServing: { label: '1 tsp (6g)', grams: 6 }, per100g: { cal: 93, p: 2.1, c: 19, f: 1 }, keywords: ['sriracha'] },
  { id: 'c_honey', name: 'Honey', defaultServing: { label: '1 tbsp (21g)', grams: 21 }, per100g: { cal: 304, p: 0.3, c: 82, f: 0 }, keywords: ['honey'] },
  { id: 'c_maple_syrup', name: 'Maple Syrup', defaultServing: { label: '1 tbsp (20g)', grams: 20 }, per100g: { cal: 260, p: 0, c: 67, f: 0.1 }, keywords: ['maple syrup', 'syrup'] },
  { id: 'c_zero_sugar_syrup', name: 'Sugar-Free Syrup', defaultServing: { label: '2 tbsp (30ml)', grams: 30 }, per100g: { cal: 20, p: 0, c: 6, f: 0 }, keywords: ['sugar free syrup', 'zero sugar syrup', 'sf syrup'] },
  { id: 'c_coconut_oil', name: 'Coconut Oil', defaultServing: { label: '1 tbsp (14g)', grams: 14 }, per100g: { cal: 862, p: 0, c: 0, f: 100 }, keywords: ['coconut oil'] },

  // ── Snacks & Chips ────────────────────────────────────────────────
  { id: 'c_lays', name: "Lay's Potato Chips", defaultServing: { label: '1oz (28g)', grams: 28 }, per100g: { cal: 536, p: 7, c: 53, f: 34 }, keywords: ["lay's", 'lays', 'potato chips', 'chips'] },
  { id: 'c_doritos', name: 'Doritos, Nacho Cheese', defaultServing: { label: '1oz (28g)', grams: 28 }, per100g: { cal: 500, p: 6, c: 58, f: 26 }, keywords: ['doritos', 'chips'] },
  { id: 'c_pretzels', name: 'Pretzels', defaultServing: { label: '1oz (28g)', grams: 28 }, per100g: { cal: 380, p: 9, c: 80, f: 3 }, keywords: ['pretzels', 'pretzel'] },
  { id: 'c_popcorn', name: 'Popcorn, Air-Popped', defaultServing: { label: '3 cups (24g)', grams: 24 }, per100g: { cal: 387, p: 13, c: 78, f: 4.5 }, keywords: ['popcorn'] },
  { id: 'c_pita_chips', name: 'Pita Chips', defaultServing: { label: '1oz (28g)', grams: 28 }, per100g: { cal: 464, p: 9, c: 61, f: 21 }, keywords: ['pita chips'] },
  { id: 'c_trail_mix', name: 'Trail Mix', defaultServing: { label: '¼ cup (35g)', grams: 35 }, per100g: { cal: 462, p: 12, c: 45, f: 29 }, keywords: ['trail mix'] },
  { id: 'c_beef_jerky', name: 'Beef Jerky', defaultServing: { label: '1oz (28g)', grams: 28 }, per100g: { cal: 338, p: 33, c: 22, f: 12 }, keywords: ['beef jerky', 'jerky'] },

  // ── Candy & Sweets ────────────────────────────────────────────────
  { id: 'c_chocolate_dark', name: 'Dark Chocolate (70-85%)', defaultServing: { label: '1oz (28g)', grams: 28 }, per100g: { cal: 598, p: 7.8, c: 46, f: 43 }, keywords: ['dark chocolate', 'chocolate'] },
  { id: 'c_chocolate_milk', name: 'Milk Chocolate', defaultServing: { label: '1oz (28g)', grams: 28 }, per100g: { cal: 535, p: 7.7, c: 59, f: 30 }, keywords: ['milk chocolate', 'chocolate'] },
  { id: 'c_gummy_bears', name: 'Gummy Bears', defaultServing: { label: '17 pieces (40g)', grams: 40 }, per100g: { cal: 325, p: 6, c: 77, f: 0 }, keywords: ['gummy bears', 'gummies', 'candy'] },
  { id: 'c_skittles', name: 'Skittles', defaultServing: { label: '1oz (28g)', grams: 28 }, per100g: { cal: 407, p: 0, c: 91, f: 4.3 }, keywords: ['skittles', 'candy'] },
  { id: 'c_m_and_ms', name: 'M&Ms', defaultServing: { label: '1oz (28g)', grams: 28 }, per100g: { cal: 500, p: 4.5, c: 70, f: 21 }, keywords: ["m&m's", 'mms', 'candy', 'chocolate'] },
  { id: 'c_oreos', name: 'Oreo Cookies', defaultServing: { label: '3 cookies (34g)', grams: 34 }, per100g: { cal: 471, p: 5, c: 71, f: 20 }, keywords: ['oreos', 'oreo', 'cookies'] },
  { id: 'c_chips_ahoy', name: 'Chips Ahoy Cookies', defaultServing: { label: '3 cookies (33g)', grams: 33 }, per100g: { cal: 485, p: 5, c: 68, f: 22 }, keywords: ['chips ahoy', 'cookies'] },
  { id: 'c_pop_tart', name: 'Pop-Tart, Frosted Strawberry', defaultServing: { label: '1 pastry (52g)', grams: 52 }, per100g: { cal: 392, p: 4.6, c: 73, f: 9 }, keywords: ['pop tart', 'poptart'] },

  // ── Drinks ────────────────────────────────────────────────────────
  { id: 'c_orange_juice', name: 'Orange Juice', defaultServing: { label: '1 cup (248ml)', grams: 248 }, per100g: { cal: 45, p: 0.7, c: 10, f: 0.2 }, keywords: ['orange juice', 'oj'] },
  { id: 'c_apple_juice', name: 'Apple Juice', defaultServing: { label: '1 cup (248ml)', grams: 248 }, per100g: { cal: 46, p: 0.1, c: 11, f: 0.1 }, keywords: ['apple juice'] },
  { id: 'c_whole_milk_latte', name: 'Latte, Whole Milk', defaultServing: { label: '12oz (340ml)', grams: 340 }, per100g: { cal: 61, p: 3.2, c: 6, f: 3.1 }, keywords: ['latte', 'coffee latte'] },
  { id: 'c_protein_shake', name: 'Protein Shake (mixed with water)', defaultServing: { label: '1 shake (300ml)', grams: 300 }, per100g: { cal: 40, p: 8, c: 2, f: 0.5 }, keywords: ['protein shake', 'shake'] },
  { id: 'c_sports_drink', name: 'Gatorade', defaultServing: { label: '20oz bottle', grams: 591 }, per100g: { cal: 26, p: 0, c: 7, f: 0 }, keywords: ['gatorade', 'sports drink'] },
  { id: 'c_coconut_water', name: 'Coconut Water', defaultServing: { label: '1 cup (240ml)', grams: 240 }, per100g: { cal: 19, p: 0.7, c: 3.7, f: 0.2 }, keywords: ['coconut water'] },

  // ── Fast Food & Restaurant ────────────────────────────────────────
  { id: 'c_mcdonalds_big_mac', name: "McDonald's Big Mac", defaultServing: { label: '1 burger (219g)', grams: 219 }, per100g: { cal: 257, p: 13, c: 25, f: 12 }, keywords: ['big mac', 'mcdonalds'] },
  { id: 'c_mcdonalds_fries_med', name: "McDonald's Fries, Medium", defaultServing: { label: '1 medium (117g)', grams: 117 }, per100g: { cal: 312, p: 4, c: 42, f: 15 }, keywords: ['mcdonalds fries', 'mcdonald fries'] },
  { id: 'c_chipotle_chicken_bowl', name: 'Chipotle Chicken Bowl (no rice/beans)', defaultServing: { label: '1 bowl (~300g)', grams: 300 }, per100g: { cal: 123, p: 14, c: 5, f: 6 }, keywords: ['chipotle', 'chipotle bowl'] },
  { id: 'c_subway_turkey_6', name: 'Subway Turkey 6" (no sauce)', defaultServing: { label: '1 sub (228g)', grams: 228 }, per100g: { cal: 193, p: 14, c: 29, f: 3 }, keywords: ['subway turkey', 'subway'] },
  { id: 'c_pizza_cheese_slice', name: 'Pizza, Cheese Slice', defaultServing: { label: '1 slice (107g)', grams: 107 }, per100g: { cal: 266, p: 11, c: 33, f: 10 }, keywords: ['pizza', 'cheese pizza'] },

  // ── More Proteins ─────────────────────────────────────────────────
  { id: 'c_chicken_tender', name: 'Chicken Tenders, Cooked', defaultServing: { label: '3 tenders (84g)', grams: 84 }, per100g: { cal: 185, p: 28, c: 4, f: 6 }, keywords: ['chicken tenders', 'chicken strips', 'chicken'] },
  { id: 'c_chicken_sausage', name: 'Chicken Sausage', defaultServing: { label: '1 link (85g)', grams: 85 }, per100g: { cal: 175, p: 18, c: 4, f: 9 }, keywords: ['chicken sausage', 'sausage'] },
  { id: 'c_bison', name: 'Bison, Ground, Cooked', defaultServing: { label: '4oz (113g)', grams: 113 }, per100g: { cal: 215, p: 26, c: 0, f: 12 }, keywords: ['bison', 'buffalo meat'] },
  { id: 'c_venison', name: 'Venison, Ground, Cooked', defaultServing: { label: '4oz (113g)', grams: 113 }, per100g: { cal: 187, p: 30, c: 0, f: 7 }, keywords: ['venison', 'deer meat'] },
  { id: 'c_lamb_chop', name: 'Lamb Chop, Cooked', defaultServing: { label: '3oz (85g)', grams: 85 }, per100g: { cal: 258, p: 25, c: 0, f: 17 }, keywords: ['lamb', 'lamb chop'] },
  { id: 'c_pepperoni', name: 'Pepperoni', defaultServing: { label: '15 slices (28g)', grams: 28 }, per100g: { cal: 504, p: 20, c: 2, f: 46 }, keywords: ['pepperoni'] },
  { id: 'c_salami', name: 'Salami', defaultServing: { label: '3 slices (30g)', grams: 30 }, per100g: { cal: 407, p: 19, c: 2, f: 36 }, keywords: ['salami'] },
  { id: 'c_hot_dog', name: 'Hot Dog, Beef', defaultServing: { label: '1 frank (57g)', grams: 57 }, per100g: { cal: 290, p: 11, c: 3, f: 26 }, keywords: ['hot dog', 'frank'] },
  { id: 'c_sardines', name: 'Sardines, Canned in Oil', defaultServing: { label: '1 can (92g)', grams: 92 }, per100g: { cal: 208, p: 25, c: 0, f: 11 }, keywords: ['sardines', 'sardine', 'fish'] },
  { id: 'c_anchovies', name: 'Anchovies, Canned', defaultServing: { label: '5 anchovies (20g)', grams: 20 }, per100g: { cal: 210, p: 29, c: 0, f: 10 }, keywords: ['anchovies', 'anchovy'] },
  { id: 'c_smoked_salmon', name: 'Smoked Salmon (Lox)', defaultServing: { label: '2oz (57g)', grams: 57 }, per100g: { cal: 117, p: 18, c: 0, f: 4 }, keywords: ['smoked salmon', 'lox'] },
  { id: 'c_whitefish', name: 'Whitefish, Cooked', defaultServing: { label: '3oz (85g)', grams: 85 }, per100g: { cal: 146, p: 21, c: 0, f: 6 }, keywords: ['whitefish', 'fish'] },
  { id: 'c_trout', name: 'Trout, Cooked', defaultServing: { label: '1 fillet (62g)', grams: 62 }, per100g: { cal: 168, p: 24, c: 0, f: 7 }, keywords: ['trout', 'fish'] },
  { id: 'c_halibut', name: 'Halibut, Cooked', defaultServing: { label: '1 fillet (159g)', grams: 159 }, per100g: { cal: 140, p: 27, c: 0, f: 3 }, keywords: ['halibut', 'fish'] },
  { id: 'c_oysters', name: 'Oysters, Cooked', defaultServing: { label: '3oz (85g)', grams: 85 }, per100g: { cal: 79, p: 9, c: 5, f: 2 }, keywords: ['oysters', 'oyster'] },
  { id: 'c_egg_hardboiled', name: 'Egg, Hard Boiled', defaultServing: { label: '1 large egg', grams: 50 }, per100g: { cal: 155, p: 13, c: 1.1, f: 11 }, keywords: ['hard boiled egg', 'boiled egg', 'egg'] },
  { id: 'c_egg_scrambled', name: 'Egg, Scrambled', defaultServing: { label: '2 eggs (110g)', grams: 110 }, per100g: { cal: 149, p: 10, c: 1.6, f: 11 }, keywords: ['scrambled eggs', 'scrambled egg', 'egg'] },
  { id: 'c_seitan', name: 'Seitan (Wheat Meat)', defaultServing: { label: '3oz (85g)', grams: 85 }, per100g: { cal: 120, p: 21, c: 4, f: 2 }, keywords: ['seitan', 'wheat meat', 'vegan protein'] },

  // ── More Protein Powders & Supplements ───────────────────────────
  { id: 'c_egg_white_powder', name: 'Egg White Protein Powder', defaultServing: { label: '1 scoop (28g)', grams: 28 }, per100g: { cal: 357, p: 82, c: 4, f: 0.5 }, keywords: ['egg white protein', 'egg protein powder'] },
  { id: 'c_collagen_powder', name: 'Collagen Peptides Powder', defaultServing: { label: '1 scoop (10g)', grams: 10 }, per100g: { cal: 360, p: 90, c: 0, f: 0 }, keywords: ['collagen', 'collagen peptides', 'collagen powder'] },
  { id: 'c_mass_gainer', name: 'Mass Gainer Protein', defaultServing: { label: '1 scoop (100g)', grams: 100 }, per100g: { cal: 389, p: 31, c: 63, f: 4 }, keywords: ['mass gainer', 'weight gainer'] },
  { id: 'c_bcaa', name: 'BCAA Powder', defaultServing: { label: '1 scoop (7g)', grams: 7 }, per100g: { cal: 0, p: 0, c: 0, f: 0 }, keywords: ['bcaa', 'amino acids'] },
  { id: 'c_creatine', name: 'Creatine Monohydrate', defaultServing: { label: '1 tsp (5g)', grams: 5 }, per100g: { cal: 0, p: 0, c: 0, f: 0 }, keywords: ['creatine', 'creatine monohydrate'] },
  { id: 'c_premier_protein', name: 'Premier Protein Shake', defaultServing: { label: '1 bottle (325ml)', grams: 325 }, per100g: { cal: 92, p: 9.2, c: 3.4, f: 2.8 }, keywords: ['premier protein', 'protein shake', 'premier'] },
  { id: 'c_fairlife_shake', name: 'Fairlife Nutrition Plan Shake', defaultServing: { label: '1 bottle (325ml)', grams: 325 }, per100g: { cal: 123, p: 11, c: 6, f: 4.6 }, keywords: ['fairlife', 'fairlife shake', 'protein shake'] },
  { id: 'c_muscle_milk', name: 'Muscle Milk Protein Shake', defaultServing: { label: '1 bottle (325ml)', grams: 325 }, per100g: { cal: 108, p: 9.2, c: 7.7, f: 3.5 }, keywords: ['muscle milk', 'protein shake'] },
  { id: 'c_lara_bar', name: 'Larabar', defaultServing: { label: '1 bar (45g)', grams: 45 }, per100g: { cal: 400, p: 6, c: 53, f: 18 }, keywords: ['larabar', 'lara bar', 'snack bar'] },
  { id: 'c_think_bar', name: 'ThinkThin Protein Bar', defaultServing: { label: '1 bar (60g)', grams: 60 }, per100g: { cal: 367, p: 33, c: 40, f: 10 }, keywords: ['thinkthin', 'think bar', 'protein bar'] },
  { id: 'c_pure_protein_bar', name: 'Pure Protein Bar', defaultServing: { label: '1 bar (50g)', grams: 50 }, per100g: { cal: 380, p: 42, c: 32, f: 8 }, keywords: ['pure protein', 'pure protein bar', 'protein bar'] },

  // ── More Grains & Bread ───────────────────────────────────────────
  { id: 'c_sourdough', name: 'Sourdough Bread', defaultServing: { label: '1 slice (32g)', grams: 32 }, per100g: { cal: 289, p: 10, c: 57, f: 1.7 }, keywords: ['sourdough', 'sourdough bread'] },
  { id: 'c_rye_bread', name: 'Rye Bread', defaultServing: { label: '1 slice (32g)', grams: 32 }, per100g: { cal: 259, p: 9, c: 48, f: 3 }, keywords: ['rye bread', 'bread'] },
  { id: 'c_ezekiel_bread', name: 'Ezekiel Bread', defaultServing: { label: '1 slice (34g)', grams: 34 }, per100g: { cal: 294, p: 15, c: 53, f: 3 }, keywords: ['ezekiel bread', 'ezekiel', 'sprouted bread'] },
  { id: 'c_brioche', name: 'Brioche Bun', defaultServing: { label: '1 bun (57g)', grams: 57 }, per100g: { cal: 354, p: 9, c: 47, f: 15 }, keywords: ['brioche', 'brioche bun'] },
  { id: 'c_hamburger_bun', name: 'Hamburger Bun', defaultServing: { label: '1 bun (43g)', grams: 43 }, per100g: { cal: 279, p: 9, c: 50, f: 5 }, keywords: ['hamburger bun', 'bun', 'burger bun'] },
  { id: 'c_hot_dog_bun', name: 'Hot Dog Bun', defaultServing: { label: '1 bun (43g)', grams: 43 }, per100g: { cal: 279, p: 9, c: 51, f: 4 }, keywords: ['hot dog bun', 'bun'] },
  { id: 'c_naan', name: 'Naan Bread', defaultServing: { label: '1 piece (90g)', grams: 90 }, per100g: { cal: 317, p: 9, c: 55, f: 7 }, keywords: ['naan', 'naan bread'] },
  { id: 'c_farro', name: 'Farro, Cooked', defaultServing: { label: '½ cup (90g)', grams: 90 }, per100g: { cal: 170, p: 6, c: 34, f: 1 }, keywords: ['farro'] },
  { id: 'c_barley', name: 'Barley, Cooked', defaultServing: { label: '½ cup (79g)', grams: 79 }, per100g: { cal: 123, p: 2.3, c: 28, f: 0.4 }, keywords: ['barley'] },
  { id: 'c_couscous', name: 'Couscous, Cooked', defaultServing: { label: '½ cup (90g)', grams: 90 }, per100g: { cal: 112, p: 3.8, c: 23, f: 0.2 }, keywords: ['couscous'] },
  { id: 'c_cream_of_wheat', name: 'Cream of Wheat, Cooked', defaultServing: { label: '1 cup (244g)', grams: 244 }, per100g: { cal: 59, p: 2, c: 12, f: 0.2 }, keywords: ['cream of wheat', 'hot cereal'] },
  { id: 'c_grits', name: 'Grits, Cooked', defaultServing: { label: '1 cup (242g)', grams: 242 }, per100g: { cal: 71, p: 1.7, c: 16, f: 0.5 }, keywords: ['grits'] },
  { id: 'c_pancake', name: 'Pancake, Plain', defaultServing: { label: '2 pancakes (114g)', grams: 114 }, per100g: { cal: 227, p: 6, c: 39, f: 6 }, keywords: ['pancakes', 'pancake'] },
  { id: 'c_waffle', name: 'Waffle, Homemade', defaultServing: { label: '1 waffle (75g)', grams: 75 }, per100g: { cal: 291, p: 8, c: 37, f: 13 }, keywords: ['waffle', 'waffles'] },
  { id: 'c_muffin_blueberry', name: 'Blueberry Muffin', defaultServing: { label: '1 muffin (113g)', grams: 113 }, per100g: { cal: 377, p: 5, c: 56, f: 15 }, keywords: ['blueberry muffin', 'muffin'] },
  { id: 'c_croissant', name: 'Croissant', defaultServing: { label: '1 medium (57g)', grams: 57 }, per100g: { cal: 406, p: 9, c: 46, f: 21 }, keywords: ['croissant'] },
  { id: 'c_pasta_whole_wheat', name: 'Whole Wheat Pasta, Cooked', defaultServing: { label: '1 cup cooked', grams: 140 }, per100g: { cal: 124, p: 5, c: 26, f: 0.5 }, keywords: ['whole wheat pasta', 'pasta'] },
  { id: 'c_ramen_noodles', name: 'Ramen Noodles, Cooked', defaultServing: { label: '1 package (85g)', grams: 85 }, per100g: { cal: 437, p: 11, c: 63, f: 17 }, keywords: ['ramen', 'ramen noodles', 'noodles'] },

  // ── More Cereals ──────────────────────────────────────────────────
  { id: 'c_special_k', name: 'Special K Cereal', defaultServing: { label: '1¼ cup (31g)', grams: 31 }, per100g: { cal: 355, p: 13, c: 77, f: 1 }, keywords: ['special k', 'cereal'] },
  { id: 'c_frosted_flakes', name: 'Frosted Flakes', defaultServing: { label: '¾ cup (29g)', grams: 29 }, per100g: { cal: 379, p: 3.4, c: 90, f: 0.3 }, keywords: ['frosted flakes', 'cereal'] },
  { id: 'c_lucky_charms', name: 'Lucky Charms', defaultServing: { label: '¾ cup (27g)', grams: 27 }, per100g: { cal: 370, p: 7, c: 81, f: 3.7 }, keywords: ['lucky charms', 'cereal'] },
  { id: 'c_honey_bunches', name: 'Honey Bunches of Oats', defaultServing: { label: '¾ cup (31g)', grams: 31 }, per100g: { cal: 387, p: 6, c: 81, f: 5 }, keywords: ['honey bunches of oats', 'cereal'] },
  { id: 'c_granola_bar', name: 'Quaker Granola Bar', defaultServing: { label: '1 bar (28g)', grams: 28 }, per100g: { cal: 393, p: 7, c: 68, f: 11 }, keywords: ['granola bar', 'quaker'] },

  // ── More Vegetables ───────────────────────────────────────────────
  { id: 'c_artichoke', name: 'Artichoke, Cooked', defaultServing: { label: '1 medium (120g)', grams: 120 }, per100g: { cal: 53, p: 2.9, c: 12, f: 0.2 }, keywords: ['artichoke'] },
  { id: 'c_beets', name: 'Beets, Cooked', defaultServing: { label: '½ cup sliced (85g)', grams: 85 }, per100g: { cal: 44, p: 1.7, c: 10, f: 0.2 }, keywords: ['beets', 'beet'] },
  { id: 'c_bok_choy', name: 'Bok Choy', defaultServing: { label: '1 cup shredded (70g)', grams: 70 }, per100g: { cal: 13, p: 1.5, c: 2.2, f: 0.2 }, keywords: ['bok choy'] },
  { id: 'c_cabbage', name: 'Cabbage, Raw', defaultServing: { label: '1 cup shredded (89g)', grams: 89 }, per100g: { cal: 25, p: 1.3, c: 6, f: 0.1 }, keywords: ['cabbage'] },
  { id: 'c_eggplant', name: 'Eggplant, Cooked', defaultServing: { label: '1 cup cubed (99g)', grams: 99 }, per100g: { cal: 35, p: 0.8, c: 9, f: 0.2 }, keywords: ['eggplant', 'aubergine'] },
  { id: 'c_leek', name: 'Leeks, Cooked', defaultServing: { label: '½ cup (52g)', grams: 52 }, per100g: { cal: 31, p: 0.8, c: 8, f: 0.2 }, keywords: ['leeks', 'leek'] },
  { id: 'c_radish', name: 'Radishes', defaultServing: { label: '½ cup sliced (58g)', grams: 58 }, per100g: { cal: 16, p: 0.7, c: 3.4, f: 0.1 }, keywords: ['radish', 'radishes'] },
  { id: 'c_snap_peas', name: 'Sugar Snap Peas', defaultServing: { label: '1 cup (63g)', grams: 63 }, per100g: { cal: 42, p: 2.8, c: 8, f: 0.2 }, keywords: ['snap peas', 'sugar snap peas'] },
  { id: 'c_butternut_squash', name: 'Butternut Squash, Cooked', defaultServing: { label: '1 cup cubed (205g)', grams: 205 }, per100g: { cal: 45, p: 1, c: 12, f: 0.1 }, keywords: ['butternut squash', 'squash'] },
  { id: 'c_acorn_squash', name: 'Acorn Squash, Baked', defaultServing: { label: '½ squash (172g)', grams: 172 }, per100g: { cal: 56, p: 1.1, c: 15, f: 0.1 }, keywords: ['acorn squash', 'squash'] },
  { id: 'c_romaine', name: 'Romaine Lettuce', defaultServing: { label: '2 cups shredded (94g)', grams: 94 }, per100g: { cal: 17, p: 1.2, c: 3.3, f: 0.3 }, keywords: ['romaine', 'romaine lettuce', 'lettuce'] },
  { id: 'c_iceberg', name: 'Iceberg Lettuce', defaultServing: { label: '2 cups shredded (72g)', grams: 72 }, per100g: { cal: 14, p: 0.9, c: 3, f: 0.1 }, keywords: ['iceberg lettuce', 'lettuce'] },
  { id: 'c_arugula', name: 'Arugula', defaultServing: { label: '2 cups (40g)', grams: 40 }, per100g: { cal: 25, p: 2.6, c: 3.7, f: 0.7 }, keywords: ['arugula', 'rocket'] },
  { id: 'c_jalapeno', name: 'Jalapeño Pepper', defaultServing: { label: '1 pepper (14g)', grams: 14 }, per100g: { cal: 29, p: 0.9, c: 6, f: 0.4 }, keywords: ['jalapeno', 'jalapeño', 'pepper'] },
  { id: 'c_garlic', name: 'Garlic', defaultServing: { label: '1 clove (3g)', grams: 3 }, per100g: { cal: 149, p: 6, c: 33, f: 0.5 }, keywords: ['garlic'] },
  { id: 'c_ginger', name: 'Ginger Root', defaultServing: { label: '1 tsp (2g)', grams: 2 }, per100g: { cal: 80, p: 1.8, c: 18, f: 0.8 }, keywords: ['ginger', 'ginger root'] },

  // ── More Fruits ───────────────────────────────────────────────────
  { id: 'c_plum', name: 'Plum', defaultServing: { label: '1 medium plum (66g)', grams: 66 }, per100g: { cal: 46, p: 0.7, c: 11, f: 0.3 }, keywords: ['plum', 'plums'] },
  { id: 'c_fig', name: 'Figs, Fresh', defaultServing: { label: '2 medium figs (100g)', grams: 100 }, per100g: { cal: 74, p: 0.8, c: 19, f: 0.3 }, keywords: ['figs', 'fig'] },
  { id: 'c_dates', name: 'Dates, Medjool', defaultServing: { label: '2 dates (48g)', grams: 48 }, per100g: { cal: 277, p: 1.8, c: 75, f: 0.2 }, keywords: ['dates', 'medjool dates'] },
  { id: 'c_pomegranate', name: 'Pomegranate Seeds', defaultServing: { label: '½ cup (87g)', grams: 87 }, per100g: { cal: 83, p: 1.7, c: 19, f: 1.2 }, keywords: ['pomegranate'] },
  { id: 'c_lime', name: 'Lime', defaultServing: { label: '1 medium lime (67g)', grams: 67 }, per100g: { cal: 30, p: 0.7, c: 11, f: 0.2 }, keywords: ['lime'] },
  { id: 'c_apricot', name: 'Apricot', defaultServing: { label: '2 apricots (70g)', grams: 70 }, per100g: { cal: 48, p: 1.4, c: 11, f: 0.4 }, keywords: ['apricot', 'apricots'] },
  { id: 'c_papaya', name: 'Papaya', defaultServing: { label: '1 cup cubed (145g)', grams: 145 }, per100g: { cal: 43, p: 0.5, c: 11, f: 0.3 }, keywords: ['papaya'] },
  { id: 'c_coconut_meat', name: 'Coconut Meat, Fresh', defaultServing: { label: '1oz (28g)', grams: 28 }, per100g: { cal: 354, p: 3.3, c: 15, f: 33 }, keywords: ['coconut', 'coconut meat'] },
  { id: 'c_raisins', name: 'Raisins', defaultServing: { label: '¼ cup (41g)', grams: 41 }, per100g: { cal: 299, p: 3.1, c: 79, f: 0.5 }, keywords: ['raisins'] },
  { id: 'c_dried_cranberries', name: 'Dried Cranberries', defaultServing: { label: '¼ cup (40g)', grams: 40 }, per100g: { cal: 308, p: 0.1, c: 83, f: 1.4 }, keywords: ['dried cranberries', 'craisins'] },

  // ── More Dairy & Alternatives ─────────────────────────────────────
  { id: 'c_milk_cashew', name: 'Cashew Milk, Unsweetened', defaultServing: { label: '1 cup (240ml)', grams: 240 }, per100g: { cal: 17, p: 0.5, c: 1.7, f: 1.3 }, keywords: ['cashew milk'] },
  { id: 'c_milk_coconut', name: 'Coconut Milk (Carton)', defaultServing: { label: '1 cup (240ml)', grams: 240 }, per100g: { cal: 21, p: 0.5, c: 2.1, f: 2 }, keywords: ['coconut milk', 'coconut milk carton'] },
  { id: 'c_coconut_milk_can', name: 'Coconut Milk, Full Fat (Can)', defaultServing: { label: '¼ cup (60ml)', grams: 60 }, per100g: { cal: 197, p: 2, c: 2.8, f: 21 }, keywords: ['canned coconut milk', 'full fat coconut milk'] },
  { id: 'c_milk_soy', name: 'Soy Milk, Unsweetened', defaultServing: { label: '1 cup (240ml)', grams: 240 }, per100g: { cal: 33, p: 3.3, c: 1.8, f: 1.8 }, keywords: ['soy milk'] },
  { id: 'c_kefir', name: 'Kefir, Plain', defaultServing: { label: '1 cup (227g)', grams: 227 }, per100g: { cal: 61, p: 3.5, c: 7, f: 2 }, keywords: ['kefir'] },
  { id: 'c_yogurt_regular', name: 'Yogurt, Plain Whole Milk', defaultServing: { label: '1 cup (245g)', grams: 245 }, per100g: { cal: 61, p: 3.5, c: 4.7, f: 3.3 }, keywords: ['yogurt', 'plain yogurt', 'whole milk yogurt'] },
  { id: 'c_yogurt_lowfat', name: 'Yogurt, Plain Low Fat', defaultServing: { label: '1 cup (245g)', grams: 245 }, per100g: { cal: 63, p: 5.3, c: 7, f: 1.6 }, keywords: ['low fat yogurt', 'yogurt'] },
  { id: 'c_skyr', name: 'Skyr, Plain', defaultServing: { label: '1 container (150g)', grams: 150 }, per100g: { cal: 65, p: 11, c: 4, f: 0.2 }, keywords: ['skyr', 'icelandic yogurt'] },
  { id: 'c_ricotta', name: 'Ricotta Cheese, Whole Milk', defaultServing: { label: '½ cup (124g)', grams: 124 }, per100g: { cal: 174, p: 11, c: 3, f: 13 }, keywords: ['ricotta', 'ricotta cheese'] },
  { id: 'c_brie', name: 'Brie Cheese', defaultServing: { label: '1oz (28g)', grams: 28 }, per100g: { cal: 334, p: 21, c: 0.5, f: 28 }, keywords: ['brie', 'cheese'] },
  { id: 'c_feta', name: 'Feta Cheese', defaultServing: { label: '¼ cup crumbled (38g)', grams: 38 }, per100g: { cal: 264, p: 14, c: 4, f: 21 }, keywords: ['feta', 'feta cheese', 'cheese'] },
  { id: 'c_gouda', name: 'Gouda Cheese', defaultServing: { label: '1oz (28g)', grams: 28 }, per100g: { cal: 356, p: 25, c: 2.2, f: 28 }, keywords: ['gouda', 'cheese'] },
  { id: 'c_pepper_jack', name: 'Pepper Jack Cheese', defaultServing: { label: '1oz (28g)', grams: 28 }, per100g: { cal: 371, p: 22, c: 0.7, f: 31 }, keywords: ['pepper jack', 'cheese'] },
  { id: 'c_string_cheese', name: 'String Cheese', defaultServing: { label: '1 stick (28g)', grams: 28 }, per100g: { cal: 286, p: 25, c: 2.5, f: 20 }, keywords: ['string cheese', 'cheese stick'] },
  { id: 'c_whipped_cream', name: 'Whipped Cream', defaultServing: { label: '2 tbsp (8g)', grams: 8 }, per100g: { cal: 257, p: 1.9, c: 13, f: 22 }, keywords: ['whipped cream'] },
  { id: 'c_frozen_yogurt', name: 'Frozen Yogurt, Vanilla', defaultServing: { label: '½ cup (72g)', grams: 72 }, per100g: { cal: 159, p: 4, c: 24, f: 6 }, keywords: ['frozen yogurt', 'froyo'] },

  // ── Oils & Fats ───────────────────────────────────────────────────
  { id: 'c_avocado_oil', name: 'Avocado Oil', defaultServing: { label: '1 tbsp (14g)', grams: 14 }, per100g: { cal: 884, p: 0, c: 0, f: 100 }, keywords: ['avocado oil'] },
  { id: 'c_canola_oil', name: 'Canola Oil', defaultServing: { label: '1 tbsp (14g)', grams: 14 }, per100g: { cal: 884, p: 0, c: 0, f: 100 }, keywords: ['canola oil', 'vegetable oil'] },
  { id: 'c_sesame_oil', name: 'Sesame Oil', defaultServing: { label: '1 tbsp (14g)', grams: 14 }, per100g: { cal: 884, p: 0, c: 0, f: 100 }, keywords: ['sesame oil'] },
  { id: 'c_sunflower_oil', name: 'Sunflower Oil', defaultServing: { label: '1 tbsp (14g)', grams: 14 }, per100g: { cal: 884, p: 0, c: 0, f: 100 }, keywords: ['sunflower oil'] },
  { id: 'c_ghee', name: 'Ghee', defaultServing: { label: '1 tbsp (13g)', grams: 13 }, per100g: { cal: 900, p: 0, c: 0, f: 100 }, keywords: ['ghee', 'clarified butter'] },
  { id: 'c_lard', name: 'Lard', defaultServing: { label: '1 tbsp (13g)', grams: 13 }, per100g: { cal: 902, p: 0, c: 0, f: 100 }, keywords: ['lard'] },
  { id: 'c_spray_oil', name: 'Cooking Spray (Pam)', defaultServing: { label: '1 spray (0.25g)', grams: 0.25 }, per100g: { cal: 800, p: 0, c: 0, f: 100 }, keywords: ['cooking spray', 'pam', 'spray oil'] },
  { id: 'c_flaxseed_oil', name: 'Flaxseed Oil', defaultServing: { label: '1 tbsp (14g)', grams: 14 }, per100g: { cal: 884, p: 0, c: 0, f: 100 }, keywords: ['flaxseed oil', 'flax oil'] },
  { id: 'c_walnut_oil', name: 'Walnut Oil', defaultServing: { label: '1 tbsp (14g)', grams: 14 }, per100g: { cal: 884, p: 0, c: 0, f: 100 }, keywords: ['walnut oil'] },
  { id: 'c_peanut_oil', name: 'Peanut Oil', defaultServing: { label: '1 tbsp (14g)', grams: 14 }, per100g: { cal: 884, p: 0, c: 0, f: 100 }, keywords: ['peanut oil'] },

  // ── More Nuts & Nut Butters ───────────────────────────────────────
  { id: 'c_pecans', name: 'Pecans', defaultServing: { label: '1oz (28g)', grams: 28 }, per100g: { cal: 691, p: 9, c: 14, f: 72 }, keywords: ['pecans', 'pecan'] },
  { id: 'c_macadamia', name: 'Macadamia Nuts', defaultServing: { label: '1oz (28g)', grams: 28 }, per100g: { cal: 718, p: 8, c: 14, f: 76 }, keywords: ['macadamia', 'macadamia nuts'] },
  { id: 'c_hazelnuts', name: 'Hazelnuts', defaultServing: { label: '1oz (28g)', grams: 28 }, per100g: { cal: 628, p: 15, c: 17, f: 61 }, keywords: ['hazelnuts', 'hazelnut'] },
  { id: 'c_mixed_nuts', name: 'Mixed Nuts', defaultServing: { label: '1oz (28g)', grams: 28 }, per100g: { cal: 607, p: 15, c: 21, f: 54 }, keywords: ['mixed nuts'] },
  { id: 'c_cashew_butter', name: 'Cashew Butter', defaultServing: { label: '2 tbsp (32g)', grams: 32 }, per100g: { cal: 587, p: 17, c: 27, f: 50 }, keywords: ['cashew butter'] },
  { id: 'c_sunbutter', name: 'SunButter (Sunflower Seed Butter)', defaultServing: { label: '2 tbsp (32g)', grams: 32 }, per100g: { cal: 594, p: 20, c: 19, f: 53 }, keywords: ['sunbutter', 'sunflower butter', 'seed butter'] },
  { id: 'c_nutella', name: 'Nutella', defaultServing: { label: '2 tbsp (37g)', grams: 37 }, per100g: { cal: 530, p: 6, c: 57, f: 31 }, keywords: ['nutella', 'hazelnut spread'] },
  { id: 'c_pb2', name: 'PB2 Powdered Peanut Butter', defaultServing: { label: '2 tbsp (12g)', grams: 12 }, per100g: { cal: 375, p: 38, c: 25, f: 13 }, keywords: ['pb2', 'powdered peanut butter'] },

  // ── Zero Sugar & Diet Foods ───────────────────────────────────────
  { id: 'c_diet_coke', name: 'Diet Coke', defaultServing: { label: '1 can (355ml)', grams: 355 }, per100g: { cal: 0, p: 0, c: 0, f: 0 }, keywords: ['diet coke', 'diet cola', 'diet soda'] },
  { id: 'c_coke_zero', name: 'Coca-Cola Zero Sugar', defaultServing: { label: '1 can (355ml)', grams: 355 }, per100g: { cal: 0, p: 0, c: 0.1, f: 0 }, keywords: ['coke zero', 'zero sugar coke'] },
  { id: 'c_pepsi_zero', name: 'Pepsi Zero Sugar', defaultServing: { label: '1 can (355ml)', grams: 355 }, per100g: { cal: 0, p: 0, c: 0, f: 0 }, keywords: ['pepsi zero', 'diet pepsi'] },
  { id: 'c_sprite_zero', name: 'Sprite Zero', defaultServing: { label: '1 can (355ml)', grams: 355 }, per100g: { cal: 0, p: 0, c: 0, f: 0 }, keywords: ['sprite zero', 'diet sprite'] },
  { id: 'c_monster_zero', name: 'Monster Energy Zero Ultra', defaultServing: { label: '1 can (473ml)', grams: 473 }, per100g: { cal: 2, p: 0, c: 0.4, f: 0 }, keywords: ['monster zero', 'monster ultra', 'monster energy'] },
  { id: 'c_celsius', name: 'Celsius Energy Drink', defaultServing: { label: '1 can (355ml)', grams: 355 }, per100g: { cal: 3, p: 0, c: 0.6, f: 0 }, keywords: ['celsius', 'celsius energy'] },
  { id: 'c_bang_energy', name: 'Bang Energy Drink', defaultServing: { label: '1 can (473ml)', grams: 473 }, per100g: { cal: 0, p: 0, c: 0.2, f: 0 }, keywords: ['bang energy', 'bang'] },
  { id: 'c_ghost_energy', name: 'Ghost Energy Drink', defaultServing: { label: '1 can (473ml)', grams: 473 }, per100g: { cal: 5, p: 0, c: 1, f: 0 }, keywords: ['ghost energy', 'ghost'] },
  { id: 'c_reign_energy', name: 'Reign Energy Drink', defaultServing: { label: '1 can (473ml)', grams: 473 }, per100g: { cal: 2, p: 0, c: 0.4, f: 0 }, keywords: ['reign', 'reign energy'] },
  { id: 'c_sugar_free_redbull', name: 'Red Bull Sugar Free', defaultServing: { label: '1 can (250ml)', grams: 250 }, per100g: { cal: 4, p: 0.4, c: 0.5, f: 0 }, keywords: ['red bull sugar free', 'sugar free red bull', 'red bull'] },
  { id: 'c_zevia', name: 'Zevia Zero Calorie Soda', defaultServing: { label: '1 can (355ml)', grams: 355 }, per100g: { cal: 0, p: 0, c: 0, f: 0 }, keywords: ['zevia', 'zero calorie soda'] },
  { id: 'c_halo_top_choc', name: 'Halo Top, Chocolate', defaultServing: { label: '½ cup (76g)', grams: 76 }, per100g: { cal: 112, p: 7, c: 22, f: 2.5 }, keywords: ['halo top chocolate', 'halo top', 'light ice cream'] },
  { id: 'c_enlightened_bar', name: 'Enlightened Ice Cream Bar', defaultServing: { label: '1 bar (51g)', grams: 51 }, per100g: { cal: 137, p: 7, c: 22, f: 3.5 }, keywords: ['enlightened', 'enlightened bar', 'light ice cream'] },
  { id: 'c_sugar_free_jello', name: 'Jello, Sugar Free', defaultServing: { label: '½ cup (92g)', grams: 92 }, per100g: { cal: 8, p: 1.1, c: 0, f: 0 }, keywords: ['jello', 'sugar free jello', 'gelatin'] },
  { id: 'c_sugar_free_pudding', name: 'Pudding, Sugar Free', defaultServing: { label: '½ cup (130g)', grams: 130 }, per100g: { cal: 54, p: 1.8, c: 9, f: 1.3 }, keywords: ['sugar free pudding', 'pudding'] },
  { id: 'c_quest_chips', name: 'Quest Protein Chips', defaultServing: { label: '1 bag (32g)', grams: 32 }, per100g: { cal: 344, p: 44, c: 31, f: 5 }, keywords: ['quest chips', 'protein chips'] },

  // ── More Drinks ───────────────────────────────────────────────────
  { id: 'c_regular_coke', name: 'Coca-Cola', defaultServing: { label: '1 can (355ml)', grams: 355 }, per100g: { cal: 41, p: 0, c: 11, f: 0 }, keywords: ['coke', 'coca cola', 'soda', 'cola'] },
  { id: 'c_pepsi', name: 'Pepsi', defaultServing: { label: '1 can (355ml)', grams: 355 }, per100g: { cal: 41, p: 0, c: 11, f: 0 }, keywords: ['pepsi', 'soda', 'cola'] },
  { id: 'c_sprite', name: 'Sprite', defaultServing: { label: '1 can (355ml)', grams: 355 }, per100g: { cal: 39, p: 0, c: 10, f: 0 }, keywords: ['sprite', 'lemon lime soda', 'soda'] },
  { id: 'c_dr_pepper', name: 'Dr Pepper', defaultServing: { label: '1 can (355ml)', grams: 355 }, per100g: { cal: 42, p: 0, c: 11, f: 0 }, keywords: ['dr pepper', 'soda'] },
  { id: 'c_redbull', name: 'Red Bull', defaultServing: { label: '1 can (250ml)', grams: 250 }, per100g: { cal: 45, p: 0.4, c: 11, f: 0 }, keywords: ['red bull', 'energy drink', 'redbull'] },
  { id: 'c_monster_regular', name: 'Monster Energy', defaultServing: { label: '1 can (473ml)', grams: 473 }, per100g: { cal: 46, p: 0.5, c: 11, f: 0 }, keywords: ['monster energy', 'monster'] },
  { id: 'c_gatorade_zero', name: 'Gatorade Zero', defaultServing: { label: '20oz bottle', grams: 591 }, per100g: { cal: 0, p: 0, c: 0.2, f: 0 }, keywords: ['gatorade zero', 'sports drink zero'] },
  { id: 'c_powerade', name: 'Powerade', defaultServing: { label: '20oz bottle', grams: 591 }, per100g: { cal: 24, p: 0, c: 6, f: 0 }, keywords: ['powerade', 'sports drink'] },
  { id: 'c_powerade_zero', name: 'Powerade Zero', defaultServing: { label: '20oz bottle', grams: 591 }, per100g: { cal: 0, p: 0, c: 0, f: 0 }, keywords: ['powerade zero'] },
  { id: 'c_body_armor', name: 'BODYARMOR Sport Drink', defaultServing: { label: '1 bottle (473ml)', grams: 473 }, per100g: { cal: 25, p: 0, c: 6, f: 0 }, keywords: ['bodyarmor', 'body armor', 'sports drink'] },
  { id: 'c_liquid_iv', name: 'Liquid IV (mixed)', defaultServing: { label: '1 stick in 16oz (473ml)', grams: 473 }, per100g: { cal: 11, p: 0, c: 2.5, f: 0 }, keywords: ['liquid iv', 'hydration multiplier'] },
  { id: 'c_black_coffee', name: 'Coffee, Black', defaultServing: { label: '1 cup (240ml)', grams: 240 }, per100g: { cal: 1, p: 0.1, c: 0, f: 0 }, keywords: ['black coffee', 'coffee'] },
  { id: 'c_espresso', name: 'Espresso', defaultServing: { label: '1 shot (30ml)', grams: 30 }, per100g: { cal: 9, p: 0.6, c: 1.7, f: 0.2 }, keywords: ['espresso', 'coffee'] },
  { id: 'c_cold_brew', name: 'Cold Brew Coffee, Black', defaultServing: { label: '1 cup (240ml)', grams: 240 }, per100g: { cal: 2, p: 0.1, c: 0.4, f: 0 }, keywords: ['cold brew', 'cold brew coffee'] },
  { id: 'c_starbucks_frappuccino', name: 'Starbucks Bottled Frappuccino', defaultServing: { label: '1 bottle (281ml)', grams: 281 }, per100g: { cal: 107, p: 2.8, c: 21, f: 2 }, keywords: ['frappuccino', 'starbucks frappuccino'] },
  { id: 'c_green_tea', name: 'Green Tea, Brewed', defaultServing: { label: '1 cup (240ml)', grams: 240 }, per100g: { cal: 1, p: 0, c: 0.2, f: 0 }, keywords: ['green tea', 'tea'] },
  { id: 'c_black_tea', name: 'Black Tea, Brewed', defaultServing: { label: '1 cup (240ml)', grams: 240 }, per100g: { cal: 1, p: 0, c: 0.3, f: 0 }, keywords: ['black tea', 'tea'] },
  { id: 'c_sweet_tea', name: 'Sweet Tea', defaultServing: { label: '1 cup (240ml)', grams: 240 }, per100g: { cal: 38, p: 0, c: 10, f: 0 }, keywords: ['sweet tea', 'iced tea'] },
  { id: 'c_lipton_iced_tea', name: 'Lipton Iced Tea', defaultServing: { label: '1 bottle (500ml)', grams: 500 }, per100g: { cal: 20, p: 0, c: 5, f: 0 }, keywords: ['lipton iced tea', 'iced tea', 'lipton'] },
  { id: 'c_snapple', name: 'Snapple Peach Tea', defaultServing: { label: '1 bottle (473ml)', grams: 473 }, per100g: { cal: 38, p: 0, c: 10, f: 0 }, keywords: ['snapple', 'peach tea'] },
  { id: 'c_vitamin_water', name: 'Vitaminwater', defaultServing: { label: '1 bottle (591ml)', grams: 591 }, per100g: { cal: 21, p: 0, c: 5.5, f: 0 }, keywords: ['vitaminwater', 'vitamin water'] },
  { id: 'c_vitamin_water_zero', name: 'Vitaminwater Zero', defaultServing: { label: '1 bottle (591ml)', grams: 591 }, per100g: { cal: 0, p: 0, c: 0.8, f: 0 }, keywords: ['vitaminwater zero', 'vitamin water zero'] },
  { id: 'c_lemonade', name: 'Lemonade', defaultServing: { label: '1 cup (248ml)', grams: 248 }, per100g: { cal: 40, p: 0.1, c: 10, f: 0 }, keywords: ['lemonade'] },
  { id: 'c_minute_maid_oj', name: 'Minute Maid Orange Juice', defaultServing: { label: '8oz (240ml)', grams: 240 }, per100g: { cal: 46, p: 0.7, c: 11, f: 0.2 }, keywords: ['minute maid', 'orange juice'] },
  { id: 'c_fairlife_milk', name: 'Fairlife Whole Milk', defaultServing: { label: '1 cup (240ml)', grams: 240 }, per100g: { cal: 63, p: 5, c: 6, f: 3.3 }, keywords: ['fairlife milk', 'fairlife', 'ultra filtered milk'] },

  // ── More Snacks ───────────────────────────────────────────────────
  { id: 'c_cheetos', name: 'Cheetos Crunchy', defaultServing: { label: '1oz (28g)', grams: 28 }, per100g: { cal: 557, p: 7, c: 54, f: 35 }, keywords: ['cheetos', 'chips'] },
  { id: 'c_doritos_cool_ranch', name: 'Doritos Cool Ranch', defaultServing: { label: '1oz (28g)', grams: 28 }, per100g: { cal: 500, p: 6, c: 58, f: 26 }, keywords: ['doritos cool ranch', 'cool ranch', 'doritos', 'chips'] },
  { id: 'c_ruffles', name: 'Ruffles Original', defaultServing: { label: '1oz (28g)', grams: 28 }, per100g: { cal: 536, p: 6, c: 54, f: 33 }, keywords: ['ruffles', 'chips'] },
  { id: 'c_pringles', name: 'Pringles Original', defaultServing: { label: '16 crisps (28g)', grams: 28 }, per100g: { cal: 536, p: 4, c: 54, f: 34 }, keywords: ['pringles', 'chips'] },
  { id: 'c_lays_baked', name: "Lay's Baked Chips", defaultServing: { label: '1oz (28g)', grams: 28 }, per100g: { cal: 393, p: 5, c: 73, f: 9 }, keywords: ["lay's baked", 'baked chips', 'lays baked'] },
  { id: 'c_skinny_pop', name: 'SkinnyPop Popcorn', defaultServing: { label: '1 cup (9g)', grams: 9 }, per100g: { cal: 500, p: 10, c: 57, f: 28 }, keywords: ['skinnypop', 'skinny pop', 'popcorn'] },
  { id: 'c_rice_chips', name: 'Rice Chips (Quaker)', defaultServing: { label: '1oz (28g)', grams: 28 }, per100g: { cal: 393, p: 7, c: 78, f: 5 }, keywords: ['rice chips', 'quaker rice chips'] },
  { id: 'c_goldfish', name: 'Goldfish Crackers', defaultServing: { label: '55 pieces (30g)', grams: 30 }, per100g: { cal: 433, p: 10, c: 63, f: 16 }, keywords: ['goldfish', 'goldfish crackers'] },
  { id: 'c_wheat_thins', name: 'Wheat Thins', defaultServing: { label: '16 crackers (31g)', grams: 31 }, per100g: { cal: 419, p: 8, c: 65, f: 15 }, keywords: ['wheat thins', 'crackers'] },
  { id: 'c_triscuits', name: 'Triscuits', defaultServing: { label: '6 crackers (28g)', grams: 28 }, per100g: { cal: 393, p: 7, c: 64, f: 11 }, keywords: ['triscuits', 'crackers'] },
  { id: 'c_beef_sticks', name: 'Slim Jim / Beef Stick', defaultServing: { label: '1 stick (28g)', grams: 28 }, per100g: { cal: 464, p: 21, c: 7, f: 39 }, keywords: ['slim jim', 'beef stick', 'meat stick', 'jerky'] },
  { id: 'c_cheese_its', name: 'Cheez-Its', defaultServing: { label: '27 crackers (30g)', grams: 30 }, per100g: { cal: 483, p: 10, c: 60, f: 23 }, keywords: ['cheez-its', 'cheezits', 'crackers'] },
  { id: 'c_protein_cookie', name: 'Lenny & Larry Protein Cookie', defaultServing: { label: '1 cookie (113g)', grams: 113 }, per100g: { cal: 372, p: 16, c: 58, f: 11 }, keywords: ['protein cookie', 'lenny larry', 'complete cookie'] },

  // ── More Candy & Sweets ───────────────────────────────────────────
  { id: 'c_reeses', name: "Reese's Peanut Butter Cups", defaultServing: { label: '1 package (42g)', grams: 42 }, per100g: { cal: 524, p: 10, c: 56, f: 31 }, keywords: ["reese's", 'reeses', 'peanut butter cups', 'candy'] },
  { id: 'c_snickers', name: 'Snickers Bar', defaultServing: { label: '1 bar (52g)', grams: 52 }, per100g: { cal: 488, p: 8, c: 64, f: 24 }, keywords: ['snickers', 'candy bar', 'candy'] },
  { id: 'c_kit_kat', name: 'Kit Kat', defaultServing: { label: '1 bar (42g)', grams: 42 }, per100g: { cal: 518, p: 6, c: 67, f: 26 }, keywords: ['kit kat', 'kitkat', 'candy'] },
  { id: 'c_twix', name: 'Twix', defaultServing: { label: '1 package (50g)', grams: 50 }, per100g: { cal: 500, p: 4.4, c: 65, f: 25 }, keywords: ['twix', 'candy bar', 'candy'] },
  { id: 'c_starburst', name: 'Starburst', defaultServing: { label: '8 pieces (40g)', grams: 40 }, per100g: { cal: 400, p: 0, c: 84, f: 7 }, keywords: ['starburst', 'candy'] },
  { id: 'c_haribo', name: 'Haribo Goldbears', defaultServing: { label: '17 pieces (40g)', grams: 40 }, per100g: { cal: 338, p: 6.5, c: 77, f: 0.5 }, keywords: ['haribo', 'gummy bears', 'gummies'] },
  { id: 'c_sour_patch', name: 'Sour Patch Kids', defaultServing: { label: '16 pieces (40g)', grams: 40 }, per100g: { cal: 350, p: 0, c: 88, f: 0 }, keywords: ['sour patch kids', 'sour patch', 'candy'] },
  { id: 'c_swedish_fish', name: 'Swedish Fish', defaultServing: { label: '7 pieces (40g)', grams: 40 }, per100g: { cal: 350, p: 0, c: 88, f: 0 }, keywords: ['swedish fish', 'candy'] },
  { id: 'c_hershey_bar', name: "Hershey's Milk Chocolate Bar", defaultServing: { label: '1 bar (43g)', grams: 43 }, per100g: { cal: 535, p: 8, c: 60, f: 30 }, keywords: ["hershey's", 'hershey bar', 'chocolate bar', 'candy'] },
  { id: 'c_milky_way', name: 'Milky Way', defaultServing: { label: '1 bar (52g)', grams: 52 }, per100g: { cal: 456, p: 3.9, c: 70, f: 18 }, keywords: ['milky way', 'candy bar', 'candy'] },
  { id: 'c_airheads', name: 'Airheads', defaultServing: { label: '1 bar (15g)', grams: 15 }, per100g: { cal: 353, p: 0, c: 85, f: 1.2 }, keywords: ['airheads', 'candy'] },
  { id: 'c_nerds', name: 'Nerds', defaultServing: { label: '1 tbsp (15g)', grams: 15 }, per100g: { cal: 373, p: 0, c: 93, f: 0 }, keywords: ['nerds', 'candy'] },
  { id: 'c_dove_chocolate', name: 'Dove Dark Chocolate', defaultServing: { label: '5 pieces (40g)', grams: 40 }, per100g: { cal: 550, p: 5, c: 57, f: 35 }, keywords: ['dove chocolate', 'dove dark', 'chocolate'] },

  // ── More Fast Food ────────────────────────────────────────────────
  { id: 'c_mcdonalds_mcchicken', name: "McDonald's McChicken", defaultServing: { label: '1 sandwich (154g)', grams: 154 }, per100g: { cal: 247, p: 12, c: 26, f: 10 }, keywords: ['mcchicken', 'mcdonalds'] },
  { id: 'c_mcdonalds_quarter_pounder', name: "McDonald's Quarter Pounder with Cheese", defaultServing: { label: '1 burger (199g)', grams: 199 }, per100g: { cal: 294, p: 18, c: 25, f: 14 }, keywords: ['quarter pounder', 'mcdonalds'] },
  { id: 'c_mcdonalds_fries_large', name: "McDonald's Fries, Large", defaultServing: { label: '1 large (154g)', grams: 154 }, per100g: { cal: 312, p: 4, c: 42, f: 15 }, keywords: ['mcdonalds large fries', 'mcdonalds fries'] },
  { id: 'c_chick_fil_a_sandwich', name: 'Chick-fil-A Chicken Sandwich', defaultServing: { label: '1 sandwich (198g)', grams: 198 }, per100g: { cal: 283, p: 16, c: 37, f: 8 }, keywords: ['chick fil a', 'chick-fil-a', 'chicken sandwich'] },
  { id: 'c_chick_fil_a_nuggets', name: 'Chick-fil-A Nuggets (8pc)', defaultServing: { label: '8 nuggets (113g)', grams: 113 }, per100g: { cal: 257, p: 25, c: 11, f: 12 }, keywords: ['chick fil a nuggets', 'chick-fil-a nuggets', 'nuggets'] },
  { id: 'c_chipotle_burrito', name: 'Chipotle Burrito (chicken, rice, beans, cheese)', defaultServing: { label: '1 burrito (~700g)', grams: 700 }, per100g: { cal: 157, p: 10, c: 18, f: 5 }, keywords: ['chipotle burrito', 'chipotle'] },
  { id: 'c_chipotle_rice', name: 'Chipotle Cilantro Lime Rice', defaultServing: { label: '1 serving (130g)', grams: 130 }, per100g: { cal: 130, p: 2.3, c: 25, f: 2.3 }, keywords: ['chipotle rice', 'cilantro lime rice'] },
  { id: 'c_subway_tuna_6', name: 'Subway Tuna 6" (no sauce)', defaultServing: { label: '1 sub (240g)', grams: 240 }, per100g: { cal: 221, p: 12, c: 29, f: 7 }, keywords: ['subway tuna', 'subway'] },
  { id: 'c_subway_bmt_6', name: 'Subway BMT 6" (no sauce)', defaultServing: { label: '1 sub (238g)', grams: 238 }, per100g: { cal: 239, p: 14, c: 30, f: 8 }, keywords: ['subway bmt', 'subway italian', 'subway'] },
  { id: 'c_taco_bell_taco', name: 'Taco Bell Crunchy Taco', defaultServing: { label: '1 taco (78g)', grams: 78 }, per100g: { cal: 218, p: 9, c: 22, f: 10 }, keywords: ['taco bell', 'crunchy taco', 'taco'] },
  { id: 'c_taco_bell_burrito', name: 'Taco Bell Bean Burrito', defaultServing: { label: '1 burrito (198g)', grams: 198 }, per100g: { cal: 232, p: 9, c: 37, f: 6 }, keywords: ['taco bell burrito', 'bean burrito', 'taco bell'] },
  { id: 'c_wendys_burger', name: "Wendy's Dave's Single", defaultServing: { label: '1 burger (218g)', grams: 218 }, per100g: { cal: 289, p: 17, c: 25, f: 13 }, keywords: ["wendy's", 'wendys burger', 'wendys'] },
  { id: 'c_pizza_pepperoni', name: 'Pizza, Pepperoni Slice', defaultServing: { label: '1 slice (108g)', grams: 108 }, per100g: { cal: 298, p: 13, c: 31, f: 13 }, keywords: ['pepperoni pizza', 'pizza slice', 'pizza'] },
  { id: 'c_panera_chicken_soup', name: 'Panera Chicken Noodle Soup', defaultServing: { label: '1 cup (284g)', grams: 284 }, per100g: { cal: 56, p: 4, c: 6, f: 1.4 }, keywords: ['panera', 'chicken noodle soup', 'panera soup'] },

  // ── More Sauces & Condiments ──────────────────────────────────────
  { id: 'c_dijon_mustard', name: 'Dijon Mustard', defaultServing: { label: '1 tsp (5g)', grams: 5 }, per100g: { cal: 67, p: 3.7, c: 5, f: 4 }, keywords: ['dijon mustard', 'mustard'] },
  { id: 'c_honey_mustard', name: 'Honey Mustard', defaultServing: { label: '1 tbsp (16g)', grams: 16 }, per100g: { cal: 250, p: 1.3, c: 38, f: 11 }, keywords: ['honey mustard'] },
  { id: 'c_caesar_dressing', name: 'Caesar Dressing', defaultServing: { label: '2 tbsp (30g)', grams: 30 }, per100g: { cal: 350, p: 2.5, c: 4, f: 37 }, keywords: ['caesar dressing', 'dressing'] },
  { id: 'c_italian_dressing', name: 'Italian Dressing', defaultServing: { label: '2 tbsp (30g)', grams: 30 }, per100g: { cal: 180, p: 0, c: 5, f: 18 }, keywords: ['italian dressing', 'dressing'] },
  { id: 'c_balsamic_vinegar', name: 'Balsamic Vinegar', defaultServing: { label: '1 tbsp (15g)', grams: 15 }, per100g: { cal: 88, p: 0.5, c: 17, f: 0 }, keywords: ['balsamic vinegar', 'balsamic'] },
  { id: 'c_apple_cider_vinegar', name: 'Apple Cider Vinegar', defaultServing: { label: '1 tbsp (15g)', grams: 15 }, per100g: { cal: 22, p: 0, c: 0.9, f: 0 }, keywords: ['apple cider vinegar', 'acv'] },
  { id: 'c_worcestershire', name: 'Worcestershire Sauce', defaultServing: { label: '1 tsp (6g)', grams: 6 }, per100g: { cal: 78, p: 0, c: 19, f: 0 }, keywords: ['worcestershire', 'worcestershire sauce'] },
  { id: 'c_fish_sauce', name: 'Fish Sauce', defaultServing: { label: '1 tbsp (18g)', grams: 18 }, per100g: { cal: 35, p: 5, c: 3.6, f: 0 }, keywords: ['fish sauce'] },
  { id: 'c_oyster_sauce', name: 'Oyster Sauce', defaultServing: { label: '1 tbsp (16g)', grams: 16 }, per100g: { cal: 81, p: 1.3, c: 18, f: 0.3 }, keywords: ['oyster sauce'] },
  { id: 'c_tahini', name: 'Tahini', defaultServing: { label: '1 tbsp (15g)', grams: 15 }, per100g: { cal: 595, p: 17, c: 21, f: 54 }, keywords: ['tahini', 'sesame paste'] },
  { id: 'c_pesto', name: 'Pesto Sauce', defaultServing: { label: '2 tbsp (30g)', grams: 30 }, per100g: { cal: 321, p: 5, c: 4, f: 32 }, keywords: ['pesto', 'basil pesto'] },
  { id: 'c_tomato_paste', name: 'Tomato Paste', defaultServing: { label: '2 tbsp (33g)', grams: 33 }, per100g: { cal: 82, p: 4.3, c: 19, f: 0.5 }, keywords: ['tomato paste'] },
  { id: 'c_cream_of_mushroom', name: 'Cream of Mushroom Soup', defaultServing: { label: '½ cup (126g)', grams: 126 }, per100g: { cal: 79, p: 1.8, c: 8, f: 4.6 }, keywords: ['cream of mushroom', 'mushroom soup'] },
  { id: 'c_low_sodium_soy', name: 'Low Sodium Soy Sauce', defaultServing: { label: '1 tbsp (16g)', grams: 16 }, per100g: { cal: 50, p: 7.5, c: 4.5, f: 0 }, keywords: ['low sodium soy sauce', 'soy sauce'] },
  { id: 'c_coconut_aminos', name: 'Coconut Aminos', defaultServing: { label: '1 tbsp (16g)', grams: 16 }, per100g: { cal: 47, p: 0.6, c: 11, f: 0 }, keywords: ['coconut aminos'] },

  // ── Prepared & Packaged Meals ─────────────────────────────────────
  { id: 'c_chicken_noodle_soup', name: 'Chicken Noodle Soup, Canned', defaultServing: { label: '1 cup (240g)', grams: 240 }, per100g: { cal: 38, p: 2.6, c: 5, f: 1 }, keywords: ['chicken noodle soup', 'canned soup'] },
  { id: 'c_tomato_soup', name: 'Tomato Soup, Canned', defaultServing: { label: '1 cup (248g)', grams: 248 }, per100g: { cal: 68, p: 1.7, c: 14, f: 0.9 }, keywords: ['tomato soup', 'canned soup'] },
  { id: 'c_mac_and_cheese', name: 'Mac & Cheese (Kraft)', defaultServing: { label: '1 cup prepared (189g)', grams: 189 }, per100g: { cal: 201, p: 7, c: 28, f: 7 }, keywords: ['mac and cheese', 'kraft mac', 'macaroni'] },
  { id: 'c_instant_oatmeal', name: 'Instant Oatmeal, Plain', defaultServing: { label: '1 packet (28g dry)', grams: 28 }, per100g: { cal: 371, p: 13, c: 67, f: 7 }, keywords: ['instant oatmeal', 'oatmeal packet'] },
  { id: 'c_protein_oatmeal', name: 'Kodiak Cakes Protein Oatmeal', defaultServing: { label: '1 packet (52g)', grams: 52 }, per100g: { cal: 346, p: 25, c: 56, f: 4 }, keywords: ['kodiak cakes', 'protein oatmeal', 'kodiak'] },
  { id: 'c_canned_chicken', name: 'Chicken, Canned', defaultServing: { label: '1 can (142g)', grams: 142 }, per100g: { cal: 130, p: 26, c: 0, f: 3 }, keywords: ['canned chicken', 'chicken can'] },
  { id: 'c_spam', name: 'Spam, Classic', defaultServing: { label: '2oz (56g)', grams: 56 }, per100g: { cal: 304, p: 13, c: 4, f: 26 }, keywords: ['spam'] },
  { id: 'c_frozen_chicken_breast', name: 'Chicken Breast, Frozen Grilled', defaultServing: { label: '1 piece (85g)', grams: 85 }, per100g: { cal: 118, p: 22, c: 2, f: 3 }, keywords: ['frozen chicken', 'grilled chicken', 'chicken'] },
  // ── McDonald's ────────────────────────────────────────────────────
  { id: 'ff_mcd_mcdouble', name: "McDonald's McDouble", defaultServing: { label: '1 burger (174g)', grams: 174 }, per100g: { cal: 230, p: 12.6, c: 20.1, f: 10.9 }, keywords: ['mcdouble', 'mcdonalds'] },
  { id: 'ff_mcd_filet_o_fish', name: "McDonald's Filet-O-Fish", defaultServing: { label: '1 sandwich (142g)', grams: 142 }, per100g: { cal: 275, p: 12, c: 26.8, f: 13.4 }, keywords: ['filet o fish', 'fish sandwich', 'mcdonalds'] },
  { id: 'ff_mcd_10pc_nuggets', name: "McDonald's McNuggets (10pc)", defaultServing: { label: '10 pieces (162g)', grams: 162 }, per100g: { cal: 253, p: 16, c: 16, f: 14.8 }, keywords: ['mcnuggets', 'chicken nuggets', 'mcdonalds'] },
  { id: 'ff_mcd_egg_mcmuffin', name: "McDonald's Egg McMuffin", defaultServing: { label: '1 sandwich (135g)', grams: 135 }, per100g: { cal: 230, p: 12.6, c: 22.2, f: 9.6 }, keywords: ['egg mcmuffin', 'mcmuffin', 'mcdonalds breakfast'] },
  { id: 'ff_mcd_sausage_egg_muffin', name: "McDonald's Sausage McMuffin with Egg", defaultServing: { label: '1 sandwich (165g)', grams: 165 }, per100g: { cal: 291, p: 12.7, c: 18.2, f: 18.2 }, keywords: ['sausage mcmuffin', 'mcdonalds breakfast'] },
  { id: 'ff_mcd_mcgriddle', name: "McDonald's Sausage Egg Cheese McGriddle", defaultServing: { label: '1 sandwich (187g)', grams: 187 }, per100g: { cal: 294, p: 10.7, c: 25.7, f: 17.1 }, keywords: ['mcgriddle', 'mcdonalds breakfast'] },
  { id: 'ff_mcd_large_fries', name: "McDonald's Fries, Large", defaultServing: { label: '1 large (154g)', grams: 154 }, per100g: { cal: 318, p: 4.5, c: 42.9, f: 14.9 }, keywords: ['mcdonalds large fries', 'mcdonalds fries'] },
  { id: 'ff_mcd_hash_brown', name: "McDonald's Hash Brown", defaultServing: { label: '1 piece (55g)', grams: 55 }, per100g: { cal: 273, p: 1.8, c: 27.3, f: 16.4 }, keywords: ['hash brown', 'mcdonalds breakfast'] },
  { id: 'ff_mcd_mcflurry_oreo', name: "McDonald's McFlurry Oreo", defaultServing: { label: '1 regular (337g)', grams: 337 }, per100g: { cal: 151, p: 3.9, c: 23.7, f: 5 }, keywords: ['mcflurry', 'mcflurry oreo', 'mcdonalds'] },
  { id: 'ff_mcd_apple_pie', name: "McDonald's Apple Pie", defaultServing: { label: '1 pie (77g)', grams: 77 }, per100g: { cal: 312, p: 2.6, c: 42.9, f: 14.3 }, keywords: ['mcdonalds apple pie', 'apple pie'] },

  // ── Burger King ───────────────────────────────────────────────────
  { id: 'ff_bk_whopper', name: 'Burger King Whopper', defaultServing: { label: '1 burger (291g)', grams: 291 }, per100g: { cal: 227, p: 9.6, c: 16.8, f: 13.7 }, keywords: ['whopper', 'burger king'] },
  { id: 'ff_bk_whopper_jr', name: 'Burger King Whopper Jr', defaultServing: { label: '1 burger (164g)', grams: 164 }, per100g: { cal: 226, p: 10.4, c: 18.9, f: 12.8 }, keywords: ['whopper jr', 'burger king'] },
  { id: 'ff_bk_double_whopper', name: 'Burger King Double Whopper', defaultServing: { label: '1 burger (375g)', grams: 375 }, per100g: { cal: 240, p: 12.8, c: 13.3, f: 15.2 }, keywords: ['double whopper', 'burger king'] },
  { id: 'ff_bk_crispy_chicken', name: 'Burger King Crispy Chicken Sandwich', defaultServing: { label: '1 sandwich (202g)', grams: 202 }, per100g: { cal: 327, p: 12.9, c: 27.7, f: 19.3 }, keywords: ['bk crispy chicken', 'burger king chicken'] },
  { id: 'ff_bk_chicken_fries', name: 'Burger King Chicken Fries (9pc)', defaultServing: { label: '9 pieces (123g)', grams: 123 }, per100g: { cal: 276, p: 16.3, c: 21.1, f: 13.8 }, keywords: ['chicken fries', 'burger king'] },
  { id: 'ff_bk_nuggets', name: 'Burger King Nuggets (10pc)', defaultServing: { label: '10 pieces (118g)', grams: 118 }, per100g: { cal: 288, p: 15.3, c: 20.3, f: 16.1 }, keywords: ['bk nuggets', 'burger king nuggets'] },
  { id: 'ff_bk_onion_rings', name: 'Burger King Onion Rings (medium)', defaultServing: { label: '1 medium (91g)', grams: 91 }, per100g: { cal: 352, p: 4.4, c: 44, f: 17.6 }, keywords: ['onion rings', 'burger king'] },
  { id: 'ff_bk_fries', name: 'Burger King Fries (medium)', defaultServing: { label: '1 medium (117g)', grams: 117 }, per100g: { cal: 325, p: 3.4, c: 45.3, f: 14.5 }, keywords: ['burger king fries', 'bk fries'] },

  // ── Wendy's ───────────────────────────────────────────────────────
  { id: 'ff_wdy_daves_double', name: "Wendy's Dave's Double", defaultServing: { label: '1 burger (292g)', grams: 292 }, per100g: { cal: 284, p: 17.5, c: 14, f: 17.8 }, keywords: ["wendy's dave's double", 'wendys'] },
  { id: 'ff_wdy_baconator', name: "Wendy's Baconator", defaultServing: { label: '1 burger (308g)', grams: 308 }, per100g: { cal: 308, p: 18.5, c: 14, f: 19.8 }, keywords: ['baconator', 'wendys'] },
  { id: 'ff_wdy_spicy_chicken', name: "Wendy's Spicy Chicken Sandwich", defaultServing: { label: '1 sandwich (199g)', grams: 199 }, per100g: { cal: 266, p: 14.1, c: 27.6, f: 11.1 }, keywords: ['wendys spicy chicken', 'wendys'] },
  { id: 'ff_wdy_nuggets_4', name: "Wendy's Nuggets (4pc)", defaultServing: { label: '4 pieces (58g)', grams: 58 }, per100g: { cal: 310, p: 15.5, c: 20.7, f: 17.2 }, keywords: ['wendys nuggets', 'wendys'] },
  { id: 'ff_wdy_frosty', name: "Wendy's Frosty (small)", defaultServing: { label: '1 small (227g)', grams: 227 }, per100g: { cal: 141, p: 3.5, c: 24.7, f: 3.5 }, keywords: ['frosty', 'wendys frosty'] },
  { id: 'ff_wdy_chili', name: "Wendy's Chili (small)", defaultServing: { label: '1 small (227g)', grams: 227 }, per100g: { cal: 75, p: 6.6, c: 7.5, f: 2.6 }, keywords: ["wendy's chili", 'wendys chili'] },
  { id: 'ff_wdy_fries_small', name: "Wendy's Fries (small)", defaultServing: { label: '1 small (98g)', grams: 98 }, per100g: { cal: 286, p: 4.1, c: 37.8, f: 13.3 }, keywords: ['wendys fries'] },

  // ── Chick-fil-A ───────────────────────────────────────────────────
  { id: 'ff_cfa_spicy_sandwich', name: 'Chick-fil-A Spicy Chicken Sandwich', defaultServing: { label: '1 sandwich (206g)', grams: 206 }, per100g: { cal: 233, p: 13.1, c: 27.2, f: 7.3 }, keywords: ['chick fil a spicy', 'spicy chicken sandwich', 'chick-fil-a'] },
  { id: 'ff_cfa_deluxe', name: 'Chick-fil-A Deluxe Sandwich', defaultServing: { label: '1 sandwich (234g)', grams: 234 }, per100g: { cal: 222, p: 13.7, c: 24.4, f: 7.7 }, keywords: ['chick fil a deluxe', 'chick-fil-a'] },
  { id: 'ff_cfa_grilled_sandwich', name: 'Chick-fil-A Grilled Chicken Sandwich', defaultServing: { label: '1 sandwich (195g)', grams: 195 }, per100g: { cal: 164, p: 15.4, c: 18.5, f: 3.1 }, keywords: ['chick fil a grilled', 'grilled chicken sandwich', 'chick-fil-a'] },
  { id: 'ff_cfa_grilled_nuggets', name: 'Chick-fil-A Grilled Nuggets (8pc)', defaultServing: { label: '8 pieces (112g)', grams: 112 }, per100g: { cal: 116, p: 22.3, c: 1.8, f: 2.7 }, keywords: ['chick fil a grilled nuggets', 'chick-fil-a nuggets'] },
  { id: 'ff_cfa_waffle_fries', name: 'Chick-fil-A Waffle Fries (medium)', defaultServing: { label: '1 medium (125g)', grams: 125 }, per100g: { cal: 336, p: 4, c: 40.8, f: 17.6 }, keywords: ['chick fil a waffle fries', 'waffle fries', 'chick-fil-a'] },
  { id: 'ff_cfa_mac_cheese', name: 'Chick-fil-A Mac & Cheese', defaultServing: { label: '1 side (206g)', grams: 206 }, per100g: { cal: 218, p: 8.3, c: 20.9, f: 11.2 }, keywords: ['chick fil a mac and cheese', 'chick-fil-a sides'] },
  { id: 'ff_cfa_cobb_salad', name: 'Chick-fil-A Cobb Salad', defaultServing: { label: '1 salad (351g)', grams: 351 }, per100g: { cal: 142, p: 12, c: 6.6, f: 7.4 }, keywords: ['chick fil a cobb salad', 'chick-fil-a salad'] },

  // ── Taco Bell ─────────────────────────────────────────────────────
  { id: 'ff_tb_soft_taco', name: 'Taco Bell Soft Taco', defaultServing: { label: '1 taco (99g)', grams: 99 }, per100g: { cal: 182, p: 9.1, c: 18.2, f: 8.1 }, keywords: ['taco bell soft taco', 'soft taco'] },
  { id: 'ff_tb_dlt', name: 'Taco Bell Doritos Locos Taco', defaultServing: { label: '1 taco (85g)', grams: 85 }, per100g: { cal: 200, p: 9.4, c: 16.5, f: 10.6 }, keywords: ['doritos locos taco', 'dlt', 'taco bell'] },
  { id: 'ff_tb_crunchwrap', name: 'Taco Bell Crunchwrap Supreme', defaultServing: { label: '1 wrap (254g)', grams: 254 }, per100g: { cal: 209, p: 6.3, c: 26.4, f: 8.3 }, keywords: ['crunchwrap', 'crunchwrap supreme', 'taco bell'] },
  { id: 'ff_tb_beefy_5layer', name: 'Taco Bell Beefy 5-Layer Burrito', defaultServing: { label: '1 burrito (248g)', grams: 248 }, per100g: { cal: 198, p: 7.7, c: 25.4, f: 6.9 }, keywords: ['beefy 5 layer', 'taco bell burrito'] },
  { id: 'ff_tb_chalupa', name: 'Taco Bell Chalupa Supreme', defaultServing: { label: '1 chalupa (153g)', grams: 153 }, per100g: { cal: 235, p: 9.2, c: 24.8, f: 11.1 }, keywords: ['chalupa', 'taco bell'] },
  { id: 'ff_tb_nachos_bellgrande', name: 'Taco Bell Nachos BellGrande', defaultServing: { label: '1 order (305g)', grams: 305 }, per100g: { cal: 239, p: 6.6, c: 25.9, f: 12.5 }, keywords: ['nachos bellgrande', 'taco bell nachos'] },
  { id: 'ff_tb_mexican_pizza', name: 'Taco Bell Mexican Pizza', defaultServing: { label: '1 pizza (216g)', grams: 216 }, per100g: { cal: 250, p: 9.3, c: 25.5, f: 12.5 }, keywords: ['mexican pizza', 'taco bell pizza'] },
  { id: 'ff_tb_cheesy_gordita', name: 'Taco Bell Cheesy Gordita Crunch', defaultServing: { label: '1 item (172g)', grams: 172 }, per100g: { cal: 285, p: 10.5, c: 28.5, f: 14 }, keywords: ['cheesy gordita crunch', 'gordita', 'taco bell'] },
  { id: 'ff_tb_cinnabon_delights', name: 'Taco Bell Cinnabon Delights (2pc)', defaultServing: { label: '2 pieces (52g)', grams: 52 }, per100g: { cal: 327, p: 3.8, c: 38.5, f: 17.3 }, keywords: ['cinnabon delights', 'taco bell dessert'] },

  // ── KFC ───────────────────────────────────────────────────────────
  { id: 'ff_kfc_original_breast', name: 'KFC Original Recipe Chicken Breast', defaultServing: { label: '1 piece (161g)', grams: 161 }, per100g: { cal: 242, p: 24.2, c: 6.8, f: 13 }, keywords: ['kfc original recipe', 'kfc breast', 'kfc'] },
  { id: 'ff_kfc_extra_crispy_breast', name: 'KFC Extra Crispy Chicken Breast', defaultServing: { label: '1 piece (162g)', grams: 162 }, per100g: { cal: 315, p: 21.6, c: 11.7, f: 20.4 }, keywords: ['kfc extra crispy', 'kfc'] },
  { id: 'ff_kfc_original_thigh', name: 'KFC Original Recipe Thigh', defaultServing: { label: '1 piece (126g)', grams: 126 }, per100g: { cal: 222, p: 14.3, c: 7.1, f: 14.3 }, keywords: ['kfc thigh', 'kfc'] },
  { id: 'ff_kfc_sandwich', name: 'KFC Chicken Sandwich', defaultServing: { label: '1 sandwich (182g)', grams: 182 }, per100g: { cal: 357, p: 15.4, c: 37.4, f: 16.5 }, keywords: ['kfc chicken sandwich', 'kfc'] },
  { id: 'ff_kfc_famous_bowl', name: 'KFC Famous Bowl', defaultServing: { label: '1 bowl (425g)', grams: 425 }, per100g: { cal: 167, p: 7.5, c: 18.6, f: 7.3 }, keywords: ['kfc famous bowl', 'famous bowl'] },
  { id: 'ff_kfc_mashed_potatoes', name: 'KFC Mashed Potatoes with Gravy', defaultServing: { label: '1 side (151g)', grams: 151 }, per100g: { cal: 79, p: 2, c: 12.6, f: 2.3 }, keywords: ['kfc mashed potatoes', 'kfc sides'] },
  { id: 'ff_kfc_coleslaw', name: 'KFC Coleslaw', defaultServing: { label: '1 side (130g)', grams: 130 }, per100g: { cal: 115, p: 0.8, c: 16.2, f: 5.4 }, keywords: ['kfc coleslaw', 'kfc sides'] },
  { id: 'ff_kfc_biscuit', name: 'KFC Biscuit', defaultServing: { label: '1 biscuit (57g)', grams: 57 }, per100g: { cal: 316, p: 5.3, c: 42.1, f: 14 }, keywords: ['kfc biscuit'] },

  // ── Popeyes ───────────────────────────────────────────────────────
  { id: 'ff_pop_mild_breast', name: 'Popeyes Chicken Breast (mild)', defaultServing: { label: '1 piece (185g)', grams: 185 }, per100g: { cal: 238, p: 17.8, c: 10.3, f: 14.1 }, keywords: ['popeyes chicken breast', 'popeyes mild'] },
  { id: 'ff_pop_spicy_breast', name: 'Popeyes Chicken Breast (spicy)', defaultServing: { label: '1 piece (185g)', grams: 185 }, per100g: { cal: 249, p: 17.8, c: 10.3, f: 15.1 }, keywords: ['popeyes spicy', 'popeyes breast'] },
  { id: 'ff_pop_sandwich', name: 'Popeyes Chicken Sandwich', defaultServing: { label: '1 sandwich (198g)', grams: 198 }, per100g: { cal: 354, p: 14.1, c: 25.8, f: 21.2 }, keywords: ['popeyes sandwich', 'popeyes chicken sandwich'] },
  { id: 'ff_pop_spicy_sandwich', name: 'Popeyes Spicy Chicken Sandwich', defaultServing: { label: '1 sandwich (198g)', grams: 198 }, per100g: { cal: 354, p: 14.1, c: 25.3, f: 21.7 }, keywords: ['popeyes spicy sandwich'] },
  { id: 'ff_pop_tenders', name: 'Popeyes Tenders (3pc)', defaultServing: { label: '3 tenders (155g)', grams: 155 }, per100g: { cal: 213, p: 20.6, c: 9.7, f: 9.7 }, keywords: ['popeyes tenders', 'popeyes'] },
  { id: 'ff_pop_red_beans_rice', name: 'Popeyes Red Beans & Rice', defaultServing: { label: '1 side (180g)', grams: 180 }, per100g: { cal: 128, p: 4.4, c: 17.8, f: 4.4 }, keywords: ['popeyes red beans', 'red beans and rice'] },
  { id: 'ff_pop_cajun_fries', name: 'Popeyes Cajun Fries', defaultServing: { label: '1 side (113g)', grams: 113 }, per100g: { cal: 274, p: 3.5, c: 34.5, f: 13.3 }, keywords: ['popeyes cajun fries', 'popeyes fries'] },
  { id: 'ff_pop_biscuit', name: 'Popeyes Biscuit', defaultServing: { label: '1 biscuit (60g)', grams: 60 }, per100g: { cal: 433, p: 6.7, c: 43.3, f: 26.7 }, keywords: ['popeyes biscuit'] },
  { id: 'ff_pop_mac_cheese', name: 'Popeyes Mac & Cheese', defaultServing: { label: '1 side (128g)', grams: 128 }, per100g: { cal: 172, p: 7, c: 14.8, f: 9.4 }, keywords: ['popeyes mac and cheese', 'popeyes sides'] },

  // ── Subway ────────────────────────────────────────────────────────
  { id: 'ff_sub_cold_cut', name: "Subway Cold Cut Combo 6\"", defaultServing: { label: '1 sub (231g)', grams: 231 }, per100g: { cal: 160, p: 8.7, c: 19.5, f: 5.2 }, keywords: ['subway cold cut', 'cold cut combo'] },
  { id: 'ff_sub_meatball', name: "Subway Meatball Marinara 6\"", defaultServing: { label: '1 sub (298g)', grams: 298 }, per100g: { cal: 188, p: 7.7, c: 22.1, f: 7.4 }, keywords: ['subway meatball', 'meatball marinara'] },
  { id: 'ff_sub_spicy_italian', name: "Subway Spicy Italian 6\"", defaultServing: { label: '1 sub (231g)', grams: 231 }, per100g: { cal: 225, p: 9.5, c: 19.5, f: 11.7 }, keywords: ['subway spicy italian', 'spicy italian'] },
  { id: 'ff_sub_veggie', name: "Subway Veggie Delite 6\"", defaultServing: { label: '1 sub (182g)', grams: 182 }, per100g: { cal: 110, p: 4.9, c: 22, f: 1.1 }, keywords: ['subway veggie', 'veggie delite'] },
  { id: 'ff_sub_steak_cheese', name: "Subway Steak & Cheese 6\"", defaultServing: { label: '1 sub (250g)', grams: 250 }, per100g: { cal: 148, p: 10, c: 18.8, f: 3.6 }, keywords: ['subway steak and cheese', 'steak and cheese'] },
  { id: 'ff_sub_black_forest_ham', name: "Subway Black Forest Ham 6\"", defaultServing: { label: '1 sub (220g)', grams: 220 }, per100g: { cal: 132, p: 8.2, c: 20.5, f: 2.3 }, keywords: ['subway ham', 'black forest ham'] },
  { id: 'ff_sub_rotisserie', name: "Subway Rotisserie Chicken 6\"", defaultServing: { label: '1 sub (249g)', grams: 249 }, per100g: { cal: 120, p: 10.4, c: 16.1, f: 2 }, keywords: ['subway rotisserie chicken', 'rotisserie chicken sub'] },
  { id: 'ff_sub_footlong_turkey', name: "Subway Turkey Footlong", defaultServing: { label: '1 footlong (456g)', grams: 456 }, per100g: { cal: 127, p: 7.9, c: 19.7, f: 2.2 }, keywords: ['subway footlong turkey', 'footlong'] },

  // ── Chipotle ──────────────────────────────────────────────────────
  { id: 'ff_chip_steak_bowl', name: 'Chipotle Steak Bowl', defaultServing: { label: '1 bowl (465g)', grams: 465 }, per100g: { cal: 162, p: 8.8, c: 17.6, f: 6 }, keywords: ['chipotle steak bowl', 'chipotle steak'] },
  { id: 'ff_chip_carnitas_bowl', name: 'Chipotle Carnitas Bowl', defaultServing: { label: '1 bowl (465g)', grams: 465 }, per100g: { cal: 158, p: 8.2, c: 17.6, f: 5.6 }, keywords: ['chipotle carnitas', 'carnitas bowl'] },
  { id: 'ff_chip_veggie_bowl', name: 'Chipotle Veggie Bowl', defaultServing: { label: '1 bowl (415g)', grams: 415 }, per100g: { cal: 152, p: 4.1, c: 21.7, f: 5.5 }, keywords: ['chipotle veggie bowl', 'chipotle vegetarian'] },
  { id: 'ff_chip_sofritas_bowl', name: 'Chipotle Sofritas Bowl', defaultServing: { label: '1 bowl (440g)', grams: 440 }, per100g: { cal: 152, p: 4.5, c: 20.5, f: 5.5 }, keywords: ['chipotle sofritas', 'sofritas bowl'] },
  { id: 'ff_chip_chips_guac', name: 'Chipotle Chips & Guacamole', defaultServing: { label: '1 order (250g)', grams: 250 }, per100g: { cal: 304, p: 3.6, c: 35.2, f: 17.2 }, keywords: ['chipotle chips guac', 'chipotle guacamole'] },
  { id: 'ff_chip_chips_salsa', name: 'Chipotle Chips & Salsa', defaultServing: { label: '1 order (170g)', grams: 170 }, per100g: { cal: 312, p: 4.1, c: 44.1, f: 13.5 }, keywords: ['chipotle chips salsa', 'chipotle chips'] },
  { id: 'ff_chip_quesadilla', name: 'Chipotle Chicken Quesadilla', defaultServing: { label: '1 quesadilla (270g)', grams: 270 }, per100g: { cal: 296, p: 18.9, c: 20.4, f: 15.9 }, keywords: ['chipotle quesadilla', 'chipotle chicken quesadilla'] },
  { id: 'ff_chip_tacos_3', name: 'Chipotle Chicken Tacos (3)', defaultServing: { label: '3 tacos (255g)', grams: 255 }, per100g: { cal: 190, p: 12.5, c: 19.6, f: 6.7 }, keywords: ['chipotle tacos', 'chipotle chicken tacos'] },
  { id: 'ff_chip_black_beans', name: 'Chipotle Black Beans (side)', defaultServing: { label: '1 side (113g)', grams: 113 }, per100g: { cal: 115, p: 6.2, c: 20.4, f: 1.3 }, keywords: ['chipotle black beans'] },
  { id: 'ff_chip_white_rice', name: 'Chipotle Cilantro Lime White Rice', defaultServing: { label: '1 side (130g)', grams: 130 }, per100g: { cal: 162, p: 3.1, c: 30.8, f: 3.1 }, keywords: ['chipotle white rice', 'cilantro lime rice'] },
  { id: 'ff_chip_brown_rice', name: 'Chipotle Brown Rice', defaultServing: { label: '1 side (130g)', grams: 130 }, per100g: { cal: 138, p: 3.1, c: 26.9, f: 2.3 }, keywords: ['chipotle brown rice'] },
  { id: 'ff_chip_sour_cream', name: 'Chipotle Sour Cream', defaultServing: { label: '1 side (28g)', grams: 28 }, per100g: { cal: 429, p: 3.6, c: 7.1, f: 39.3 }, keywords: ['chipotle sour cream'] },
  { id: 'ff_chip_cheese', name: 'Chipotle Cheese', defaultServing: { label: '1 side (28g)', grams: 28 }, per100g: { cal: 393, p: 25, c: 0, f: 32.1 }, keywords: ['chipotle cheese'] },
  { id: 'ff_chip_fajita_veggies', name: 'Chipotle Fajita Veggies', defaultServing: { label: '1 side (91g)', grams: 91 }, per100g: { cal: 27, p: 1.1, c: 5.5, f: 0.5 }, keywords: ['chipotle fajita veggies', 'fajita vegetables'] },
  { id: 'ff_chip_pico', name: 'Chipotle Pico de Gallo', defaultServing: { label: '1 side (85g)', grams: 85 }, per100g: { cal: 29, p: 1.2, c: 5.9, f: 0 }, keywords: ['chipotle pico', 'pico de gallo'] },
  { id: 'ff_chip_corn_salsa', name: 'Chipotle Corn Salsa', defaultServing: { label: '1 side (85g)', grams: 85 }, per100g: { cal: 94, p: 2.4, c: 17.6, f: 1.8 }, keywords: ['chipotle corn salsa'] },
  { id: 'ff_chip_guac_side', name: 'Chipotle Guacamole (side)', defaultServing: { label: '1 side (85g)', grams: 85 }, per100g: { cal: 271, p: 2.4, c: 11.8, f: 25.9 }, keywords: ['chipotle guac side', 'chipotle guacamole side'] },

  // ── Five Guys ─────────────────────────────────────────────────────
  { id: 'ff_fg_little_hamburger', name: 'Five Guys Little Hamburger', defaultServing: { label: '1 burger (218g)', grams: 218 }, per100g: { cal: 252, p: 11.9, c: 18.3, f: 14.7 }, keywords: ['five guys little hamburger', 'five guys'] },
  { id: 'ff_fg_hamburger', name: 'Five Guys Hamburger', defaultServing: { label: '1 burger (300g)', grams: 300 }, per100g: { cal: 233, p: 11.3, c: 13.3, f: 14.3 }, keywords: ['five guys hamburger', 'five guys burger'] },
  { id: 'ff_fg_cheeseburger', name: 'Five Guys Cheeseburger', defaultServing: { label: '1 burger (326g)', grams: 326 }, per100g: { cal: 258, p: 12.3, c: 12.6, f: 16.9 }, keywords: ['five guys cheeseburger', 'five guys'] },
  { id: 'ff_fg_bacon_cheeseburger', name: 'Five Guys Bacon Cheeseburger', defaultServing: { label: '1 burger (352g)', grams: 352 }, per100g: { cal: 261, p: 12.8, c: 11.6, f: 17.6 }, keywords: ['five guys bacon cheeseburger', 'five guys'] },
  { id: 'ff_fg_little_fries', name: 'Five Guys Little Fries', defaultServing: { label: '1 order (227g)', grams: 227 }, per100g: { cal: 234, p: 3.5, c: 30, f: 11 }, keywords: ['five guys little fries', 'five guys fries'] },
  { id: 'ff_fg_regular_fries', name: 'Five Guys Regular Fries', defaultServing: { label: '1 order (411g)', grams: 411 }, per100g: { cal: 232, p: 3.4, c: 29.7, f: 10.9 }, keywords: ['five guys regular fries', 'five guys fries'] },
  { id: 'ff_fg_milkshake', name: 'Five Guys Vanilla Milkshake', defaultServing: { label: '1 shake (454g)', grams: 454 }, per100g: { cal: 192, p: 3.3, c: 22.9, f: 9.9 }, keywords: ['five guys milkshake', 'five guys shake'] },

  // ── In-N-Out ──────────────────────────────────────────────────────
  { id: 'ff_ino_single', name: 'In-N-Out Single', defaultServing: { label: '1 burger (243g)', grams: 243 }, per100g: { cal: 198, p: 9.1, c: 16, f: 11.1 }, keywords: ['in n out single', 'in-n-out burger'] },
  { id: 'ff_ino_double_double', name: 'In-N-Out Double-Double', defaultServing: { label: '1 burger (330g)', grams: 330 }, per100g: { cal: 203, p: 11.2, c: 12.4, f: 12.4 }, keywords: ['double double', 'in n out', 'in-n-out'] },
  { id: 'ff_ino_animal_burger', name: 'In-N-Out Animal Style Burger', defaultServing: { label: '1 burger (330g)', grams: 330 }, per100g: { cal: 209, p: 11.2, c: 12.7, f: 13.6 }, keywords: ['in n out animal style', 'animal style burger'] },
  { id: 'ff_ino_fries', name: 'In-N-Out Fries', defaultServing: { label: '1 order (125g)', grams: 125 }, per100g: { cal: 316, p: 5.6, c: 43.2, f: 14.4 }, keywords: ['in n out fries', 'in-n-out fries'] },
  { id: 'ff_ino_animal_fries', name: 'In-N-Out Animal Style Fries', defaultServing: { label: '1 order (395g)', grams: 395 }, per100g: { cal: 190, p: 5.3, c: 16.2, f: 11.6 }, keywords: ['in n out animal fries', 'animal style fries'] },
  { id: 'ff_ino_protein_style', name: 'In-N-Out Protein Style (lettuce wrap)', defaultServing: { label: '1 burger (300g)', grams: 300 }, per100g: { cal: 123, p: 7.3, c: 3.7, f: 9 }, keywords: ['in n out protein style', 'lettuce wrap burger'] },
  { id: 'ff_ino_vanilla_shake', name: 'In-N-Out Vanilla Shake', defaultServing: { label: '1 shake (425g)', grams: 425 }, per100g: { cal: 160, p: 3.1, c: 19.5, f: 8.2 }, keywords: ['in n out shake', 'in-n-out milkshake'] },

  // ── Shake Shack ───────────────────────────────────────────────────
  { id: 'ff_ss_shackburger', name: 'Shake Shack ShackBurger', defaultServing: { label: '1 burger (190g)', grams: 190 }, per100g: { cal: 279, p: 14.2, c: 21.1, f: 15.3 }, keywords: ['shackburger', 'shake shack'] },
  { id: 'ff_ss_smokeshack', name: 'Shake Shack SmokeShack', defaultServing: { label: '1 burger (213g)', grams: 213 }, per100g: { cal: 300, p: 15.5, c: 19.2, f: 18.3 }, keywords: ['smokeshack', 'smoke shack', 'shake shack'] },
  { id: 'ff_ss_double_shack', name: 'Shake Shack Double ShackBurger', defaultServing: { label: '1 burger (265g)', grams: 265 }, per100g: { cal: 294, p: 16.6, c: 15.5, f: 18.1 }, keywords: ['double shackburger', 'shake shack'] },
  { id: 'ff_ss_chicken_shack', name: 'Shake Shack Chicken Shack', defaultServing: { label: '1 sandwich (215g)', grams: 215 }, per100g: { cal: 298, p: 14, c: 24.2, f: 16.3 }, keywords: ['chicken shack', 'shake shack chicken'] },
  { id: 'ff_ss_crinkle_fries', name: 'Shake Shack Crinkle Cut Fries', defaultServing: { label: '1 order (170g)', grams: 170 }, per100g: { cal: 247, p: 4.1, c: 32.4, f: 11.8 }, keywords: ['shake shack fries', 'crinkle cut fries'] },
  { id: 'ff_ss_cheese_fries', name: 'Shake Shack Cheese Fries', defaultServing: { label: '1 order (213g)', grams: 213 }, per100g: { cal: 291, p: 6.6, c: 27.7, f: 17.8 }, keywords: ['shake shack cheese fries'] },
  { id: 'ff_ss_shake', name: 'Shake Shack Vanilla Shake', defaultServing: { label: '1 shake (454g)', grams: 454 }, per100g: { cal: 150, p: 3.1, c: 19.2, f: 7.1 }, keywords: ['shake shack shake', 'shake shack vanilla'] },

  // ── Jimmy John's ──────────────────────────────────────────────────
  { id: 'ff_jj_turkey_tom', name: "Jimmy John's Turkey Tom", defaultServing: { label: '1 sub (244g)', grams: 244 }, per100g: { cal: 213, p: 11.9, c: 22.1, f: 8.2 }, keywords: ['jimmy johns turkey tom', 'turkey tom'] },
  { id: 'ff_jj_italian_night_club', name: "Jimmy John's Italian Night Club", defaultServing: { label: '1 sub (280g)', grams: 280 }, per100g: { cal: 239, p: 12.1, c: 20, f: 11.8 }, keywords: ['italian night club', 'jimmy johns'] },
  { id: 'ff_jj_blt', name: "Jimmy John's BLT", defaultServing: { label: '1 sub (222g)', grams: 222 }, per100g: { cal: 257, p: 9.9, c: 24.3, f: 12.6 }, keywords: ['jimmy johns blt', 'jimmy johns'] },
  { id: 'ff_jj_bootlegger', name: "Jimmy John's Bootlegger Club", defaultServing: { label: '1 sub (280g)', grams: 280 }, per100g: { cal: 214, p: 13.2, c: 19.3, f: 8.2 }, keywords: ['bootlegger club', 'jimmy johns'] },
  { id: 'ff_jj_hunters_club', name: "Jimmy John's Hunter's Club", defaultServing: { label: '1 sub (280g)', grams: 280 }, per100g: { cal: 243, p: 13.6, c: 19.3, f: 10.7 }, keywords: ["hunter's club", 'jimmy johns'] },
  { id: 'ff_jj_tuna', name: "Jimmy John's Tuna", defaultServing: { label: '1 sub (258g)', grams: 258 }, per100g: { cal: 256, p: 11.2, c: 20.9, f: 14 }, keywords: ['jimmy johns tuna', 'jimmy johns'] },
  { id: 'ff_jj_unwich', name: "Jimmy John's Unwich (lettuce wrap)", defaultServing: { label: '1 unwich (200g)', grams: 200 }, per100g: { cal: 135, p: 12, c: 3, f: 8 }, keywords: ['unwich', 'jimmy johns lettuce wrap'] },

  // ── Jersey Mike's ─────────────────────────────────────────────────
  { id: 'ff_jm_turkey_provolone', name: "Jersey Mike's Turkey & Provolone", defaultServing: { label: '1 regular (280g)', grams: 280 }, per100g: { cal: 200, p: 11.4, c: 20.7, f: 7.5 }, keywords: ['jersey mikes turkey', 'jersey mikes'] },
  { id: 'ff_jm_club', name: "Jersey Mike's Club Sub", defaultServing: { label: '1 regular (310g)', grams: 310 }, per100g: { cal: 213, p: 12.3, c: 19, f: 9 }, keywords: ['jersey mikes club', 'jersey mikes'] },
  { id: 'ff_jm_italian', name: "Jersey Mike's Italian Sub", defaultServing: { label: '1 regular (310g)', grams: 310 }, per100g: { cal: 242, p: 11.6, c: 18.7, f: 12.9 }, keywords: ['jersey mikes italian', 'jersey mikes'] },
  { id: 'ff_jm_philly', name: "Jersey Mike's Philly Cheese Steak", defaultServing: { label: '1 regular (340g)', grams: 340 }, per100g: { cal: 218, p: 11.8, c: 18.8, f: 9.7 }, keywords: ['jersey mikes philly', 'philly cheesesteak'] },
  { id: 'ff_jm_chicken_philly', name: "Jersey Mike's Chicken Philly", defaultServing: { label: '1 regular (330g)', grams: 330 }, per100g: { cal: 197, p: 12.7, c: 18.5, f: 7 }, keywords: ['jersey mikes chicken philly'] },

  // ── Arby's ────────────────────────────────────────────────────────
  { id: 'ff_arb_classic_roast_beef', name: "Arby's Classic Roast Beef", defaultServing: { label: '1 sandwich (154g)', grams: 154 }, per100g: { cal: 234, p: 14.9, c: 24, f: 9.1 }, keywords: ["arby's roast beef", 'arbys'] },
  { id: 'ff_arb_beef_cheddar', name: "Arby's Beef & Cheddar", defaultServing: { label: '1 sandwich (195g)', grams: 195 }, per100g: { cal: 231, p: 13.3, c: 22.6, f: 9.7 }, keywords: ["arby's beef cheddar", 'arbys'] },
  { id: 'ff_arb_double_roast_beef', name: "Arby's Double Roast Beef", defaultServing: { label: '1 sandwich (227g)', grams: 227 }, per100g: { cal: 225, p: 15.9, c: 16.7, f: 10.1 }, keywords: ['arbys double roast beef'] },
  { id: 'ff_arb_chicken_bacon_swiss', name: "Arby's Chicken Bacon Swiss", defaultServing: { label: '1 sandwich (239g)', grams: 239 }, per100g: { cal: 234, p: 15.5, c: 19.7, f: 9.6 }, keywords: ['arbys chicken bacon swiss', 'arbys chicken'] },
  { id: 'ff_arb_curly_fries', name: "Arby's Curly Fries (medium)", defaultServing: { label: '1 medium (128g)', grams: 128 }, per100g: { cal: 320, p: 3.9, c: 41.4, f: 15.6 }, keywords: ['arbys curly fries', 'curly fries'] },
  { id: 'ff_arb_mozzarella_sticks', name: "Arby's Mozzarella Sticks (4pc)", defaultServing: { label: '4 sticks (137g)', grams: 137 }, per100g: { cal: 314, p: 12.4, c: 27.7, f: 17.5 }, keywords: ['arbys mozzarella sticks', 'mozzarella sticks'] },
  { id: 'ff_arb_jamocha_shake', name: "Arby's Jamocha Shake (small)", defaultServing: { label: '1 small (397g)', grams: 397 }, per100g: { cal: 113, p: 2.5, c: 19.1, f: 3 }, keywords: ['jamocha shake', 'arbys shake'] },

  // ── Domino's ──────────────────────────────────────────────────────
  { id: 'ff_dom_cheese_2sl', name: "Domino's Cheese Pizza (2 slices, hand tossed)", defaultServing: { label: '2 slices (170g)', grams: 170 }, per100g: { cal: 271, p: 10.6, c: 37.6, f: 8.2 }, keywords: ["domino's cheese pizza", 'dominos pizza'] },
  { id: 'ff_dom_pepperoni_2sl', name: "Domino's Pepperoni Pizza (2 slices)", defaultServing: { label: '2 slices (170g)', grams: 170 }, per100g: { cal: 306, p: 11.8, c: 37.6, f: 11.2 }, keywords: ["domino's pepperoni", 'dominos pepperoni'] },
  { id: 'ff_dom_sausage_2sl', name: "Domino's Sausage Pizza (2 slices)", defaultServing: { label: '2 slices (190g)', grams: 190 }, per100g: { cal: 284, p: 10.5, c: 34.7, f: 11.6 }, keywords: ["domino's sausage pizza", 'dominos'] },
  { id: 'ff_dom_bbq_chicken_2sl', name: "Domino's BBQ Chicken Pizza (2 slices)", defaultServing: { label: '2 slices (190g)', grams: 190 }, per100g: { cal: 263, p: 12.6, c: 35.8, f: 7.4 }, keywords: ["domino's bbq chicken pizza", 'dominos'] },
  { id: 'ff_dom_meatzza_2sl', name: "Domino's MeatZZa Pizza (2 slices)", defaultServing: { label: '2 slices (210g)', grams: 210 }, per100g: { cal: 295, p: 12.4, c: 31, f: 13.8 }, keywords: ["domino's meatzza", 'dominos'] },
  { id: 'ff_dom_breadsticks', name: "Domino's Breadsticks (2pc)", defaultServing: { label: '2 sticks (96g)', grams: 96 }, per100g: { cal: 240, p: 7.3, c: 39.6, f: 6.3 }, keywords: ["domino's breadsticks", 'dominos breadsticks'] },
  { id: 'ff_dom_lava_cake', name: "Domino's Lava Cake", defaultServing: { label: '1 cake (77g)', grams: 77 }, per100g: { cal: 325, p: 3.9, c: 48.1, f: 13 }, keywords: ["domino's lava cake", 'dominos dessert'] },

  // ── Pizza Hut ─────────────────────────────────────────────────────
  { id: 'ff_ph_cheese_2sl', name: 'Pizza Hut Cheese Pizza (2 slices, original pan)', defaultServing: { label: '2 slices (178g)', grams: 178 }, per100g: { cal: 292, p: 12.4, c: 33.7, f: 12.4 }, keywords: ['pizza hut cheese', 'pizza hut'] },
  { id: 'ff_ph_pepperoni_2sl', name: 'Pizza Hut Pepperoni Pizza (2 slices)', defaultServing: { label: '2 slices (178g)', grams: 178 }, per100g: { cal: 326, p: 13.5, c: 33.7, f: 15.7 }, keywords: ['pizza hut pepperoni', 'pizza hut'] },
  { id: 'ff_ph_meat_lovers_2sl', name: 'Pizza Hut Meat Lovers (2 slices)', defaultServing: { label: '2 slices (198g)', grams: 198 }, per100g: { cal: 343, p: 15.2, c: 30.3, f: 18.2 }, keywords: ['pizza hut meat lovers', 'meat lovers pizza'] },
  { id: 'ff_ph_supreme_2sl', name: 'Pizza Hut Supreme (2 slices)', defaultServing: { label: '2 slices (198g)', grams: 198 }, per100g: { cal: 313, p: 13.1, c: 31.3, f: 15.2 }, keywords: ['pizza hut supreme', 'pizza hut'] },
  { id: 'ff_ph_wings', name: 'Pizza Hut WingStreet Bone-In (4pc)', defaultServing: { label: '4 wings (116g)', grams: 116 }, per100g: { cal: 267, p: 24.1, c: 0, f: 19 }, keywords: ['pizza hut wings', 'wingstop'] },

  // ── Papa John's ───────────────────────────────────────────────────
  { id: 'ff_pj_cheese_2sl', name: "Papa John's Cheese Pizza (2 slices)", defaultServing: { label: '2 slices (176g)', grams: 176 }, per100g: { cal: 273, p: 11.4, c: 34.1, f: 10.2 }, keywords: ["papa john's cheese", 'papa johns'] },
  { id: 'ff_pj_pepperoni_2sl', name: "Papa John's Pepperoni Pizza (2 slices)", defaultServing: { label: '2 slices (176g)', grams: 176 }, per100g: { cal: 307, p: 12.5, c: 34.1, f: 13.6 }, keywords: ["papa john's pepperoni", 'papa johns'] },
  { id: 'ff_pj_bbq_chicken_2sl', name: "Papa John's BBQ Chicken Bacon (2 slices)", defaultServing: { label: '2 slices (188g)', grams: 188 }, per100g: { cal: 277, p: 12.8, c: 34, f: 9.6 }, keywords: ["papa john's bbq chicken", 'papa johns'] },
  { id: 'ff_pj_garlic_knots', name: "Papa John's Garlic Knots (2pc)", defaultServing: { label: '2 knots (88g)', grams: 88 }, per100g: { cal: 261, p: 6.8, c: 31.8, f: 12.5 }, keywords: ["papa john's garlic knots", 'garlic knots'] },

  // ── Panda Express ─────────────────────────────────────────────────
  { id: 'ff_pe_orange_chicken', name: 'Panda Express Orange Chicken', defaultServing: { label: '1 serving (153g)', grams: 153 }, per100g: { cal: 320, p: 15.7, c: 33.3, f: 15 }, keywords: ['orange chicken', 'panda express'] },
  { id: 'ff_pe_beijing_beef', name: 'Panda Express Beijing Beef', defaultServing: { label: '1 serving (153g)', grams: 153 }, per100g: { cal: 314, p: 9.2, c: 34, f: 17 }, keywords: ['beijing beef', 'panda express'] },
  { id: 'ff_pe_broccoli_beef', name: 'Panda Express Broccoli Beef', defaultServing: { label: '1 serving (153g)', grams: 153 }, per100g: { cal: 98, p: 5.9, c: 8.5, f: 4.6 }, keywords: ['broccoli beef', 'panda express'] },
  { id: 'ff_pe_kung_pao', name: 'Panda Express Kung Pao Chicken', defaultServing: { label: '1 serving (153g)', grams: 153 }, per100g: { cal: 190, p: 13.1, c: 13.7, f: 9.2 }, keywords: ['kung pao chicken', 'panda express'] },
  { id: 'ff_pe_teriyaki_chicken', name: 'Panda Express Grilled Teriyaki Chicken', defaultServing: { label: '1 serving (153g)', grams: 153 }, per100g: { cal: 196, p: 23.5, c: 5.2, f: 8.5 }, keywords: ['panda express teriyaki chicken', 'teriyaki chicken panda'] },
  { id: 'ff_pe_string_bean_chicken', name: 'Panda Express String Bean Chicken', defaultServing: { label: '1 serving (153g)', grams: 153 }, per100g: { cal: 124, p: 9.2, c: 9.2, f: 5.9 }, keywords: ['string bean chicken', 'panda express'] },
  { id: 'ff_pe_mushroom_chicken', name: 'Panda Express Mushroom Chicken', defaultServing: { label: '1 serving (153g)', grams: 153 }, per100g: { cal: 144, p: 9.2, c: 8.5, f: 8.5 }, keywords: ['mushroom chicken', 'panda express'] },
  { id: 'ff_pe_fried_rice', name: 'Panda Express Fried Rice', defaultServing: { label: '1 serving (279g)', grams: 279 }, per100g: { cal: 222, p: 6.5, c: 33, f: 7.2 }, keywords: ['panda express fried rice', 'fried rice'] },
  { id: 'ff_pe_chow_mein', name: 'Panda Express Chow Mein', defaultServing: { label: '1 serving (256g)', grams: 256 }, per100g: { cal: 199, p: 5.1, c: 29.3, f: 7 }, keywords: ['panda express chow mein', 'chow mein'] },
  { id: 'ff_pe_super_greens', name: 'Panda Express Super Greens', defaultServing: { label: '1 serving (237g)', grams: 237 }, per100g: { cal: 38, p: 2.5, c: 5.5, f: 1.1 }, keywords: ['panda express super greens', 'super greens'] },
  { id: 'ff_pe_steamed_rice', name: 'Panda Express Steamed Rice', defaultServing: { label: '1 serving (279g)', grams: 279 }, per100g: { cal: 136, p: 2.9, c: 29.4, f: 0.4 }, keywords: ['panda express steamed rice'] },
  { id: 'ff_pe_egg_roll', name: 'Panda Express Egg Roll', defaultServing: { label: '1 roll (85g)', grams: 85 }, per100g: { cal: 224, p: 7.1, c: 23.5, f: 11.8 }, keywords: ['panda express egg roll', 'egg roll'] },

  // ── Panera Bread ──────────────────────────────────────────────────
  { id: 'ff_pan_broccoli_cheddar', name: 'Panera Broccoli Cheddar Soup', defaultServing: { label: '1 bowl (355g)', grams: 355 }, per100g: { cal: 101, p: 3.9, c: 9, f: 5.6 }, keywords: ['panera broccoli cheddar', 'broccoli cheddar soup'] },
  { id: 'ff_pan_tomato_soup', name: 'Panera Tomato Soup', defaultServing: { label: '1 bowl (283g)', grams: 283 }, per100g: { cal: 53, p: 1.4, c: 7.8, f: 2.1 }, keywords: ['panera tomato soup', 'tomato basil soup'] },
  { id: 'ff_pan_mac_cheese', name: 'Panera Mac & Cheese Bowl', defaultServing: { label: '1 bowl (397g)', grams: 397 }, per100g: { cal: 204, p: 7.8, c: 24.2, f: 8.3 }, keywords: ['panera mac and cheese', 'panera mac'] },
  { id: 'ff_pan_fuji_salad', name: 'Panera Fuji Apple Chicken Salad', defaultServing: { label: '1 salad (356g)', grams: 356 }, per100g: { cal: 146, p: 7.6, c: 15.7, f: 6.2 }, keywords: ['panera fuji apple salad', 'panera chicken salad'] },
  { id: 'ff_pan_caesar_salad', name: 'Panera Caesar Salad', defaultServing: { label: '1 salad (249g)', grams: 249 }, per100g: { cal: 145, p: 5.6, c: 7.2, f: 10.8 }, keywords: ['panera caesar salad', 'panera salad'] },
  { id: 'ff_pan_turkey_sandwich', name: 'Panera Turkey Sandwich', defaultServing: { label: '1 sandwich (280g)', grams: 280 }, per100g: { cal: 193, p: 11.1, c: 23.6, f: 5.7 }, keywords: ['panera turkey sandwich', 'panera sandwich'] },
  { id: 'ff_pan_plain_bagel', name: 'Panera Plain Bagel', defaultServing: { label: '1 bagel (118g)', grams: 118 }, per100g: { cal: 246, p: 8.5, c: 49.2, f: 1.7 }, keywords: ['panera bagel', 'plain bagel'] },
  { id: 'ff_pan_cinnamon_bagel', name: 'Panera Cinnamon Crunch Bagel', defaultServing: { label: '1 bagel (130g)', grams: 130 }, per100g: { cal: 331, p: 8.5, c: 64.6, f: 5.4 }, keywords: ['panera cinnamon bagel', 'cinnamon crunch bagel'] },
  { id: 'ff_pan_chicken_noodle_soup', name: 'Panera Chicken Noodle Soup', defaultServing: { label: '1 cup (284g)', grams: 284 }, per100g: { cal: 56, p: 4, c: 6, f: 1.4 }, keywords: ['panera chicken noodle soup', 'panera soup'] },
  { id: 'ff_pan_cookie', name: 'Panera Chocolate Chip Cookie', defaultServing: { label: '1 cookie (76g)', grams: 76 }, per100g: { cal: 487, p: 5.3, c: 68.4, f: 22.4 }, keywords: ['panera cookie', 'chocolate chip cookie'] },

  // ── Starbucks ─────────────────────────────────────────────────────
  { id: 'ff_sbux_latte_whole', name: 'Starbucks Caffe Latte, Whole Milk (Grande)', defaultServing: { label: '1 grande (473ml)', grams: 473 }, per100g: { cal: 53, p: 2.7, c: 5.3, f: 2.1 }, keywords: ['starbucks latte', 'caffe latte', 'starbucks'] },
  { id: 'ff_sbux_latte_nonfat', name: 'Starbucks Caffe Latte, Nonfat (Grande)', defaultServing: { label: '1 grande (473ml)', grams: 473 }, per100g: { cal: 34, p: 2.7, c: 5.1, f: 0 }, keywords: ['starbucks nonfat latte', 'skinny latte'] },
  { id: 'ff_sbux_caramel_macchiato', name: 'Starbucks Caramel Macchiato (Grande)', defaultServing: { label: '1 grande (473ml)', grams: 473 }, per100g: { cal: 63, p: 2.1, c: 8.9, f: 1.9 }, keywords: ['caramel macchiato', 'starbucks macchiato'] },
  { id: 'ff_sbux_mocha', name: 'Starbucks Mocha (Grande)', defaultServing: { label: '1 grande (473ml)', grams: 473 }, per100g: { cal: 76, p: 2.7, c: 9.5, f: 3.2 }, keywords: ['starbucks mocha', 'mocha latte'] },
  { id: 'ff_sbux_frappuccino_caramel', name: 'Starbucks Caramel Frappuccino (Grande)', defaultServing: { label: '1 grande (473ml)', grams: 473 }, per100g: { cal: 89, p: 1.1, c: 13.9, f: 3.4 }, keywords: ['starbucks frappuccino', 'caramel frappuccino'] },
  { id: 'ff_sbux_pink_drink', name: 'Starbucks Pink Drink (Grande)', defaultServing: { label: '1 grande (473ml)', grams: 473 }, per100g: { cal: 30, p: 0.2, c: 5.7, f: 0.5 }, keywords: ['pink drink', 'starbucks pink drink'] },
  { id: 'ff_sbux_matcha_latte', name: 'Starbucks Matcha Green Tea Latte (Grande)', defaultServing: { label: '1 grande (473ml)', grams: 473 }, per100g: { cal: 51, p: 1.9, c: 7.6, f: 1.5 }, keywords: ['starbucks matcha latte', 'matcha latte'] },
  { id: 'ff_sbux_vanilla_cold_brew', name: 'Starbucks Vanilla Sweet Cream Cold Brew (Grande)', defaultServing: { label: '1 grande (473ml)', grams: 473 }, per100g: { cal: 23, p: 0.2, c: 3, f: 1.1 }, keywords: ['vanilla sweet cream cold brew', 'starbucks cold brew'] },
  { id: 'ff_sbux_cold_brew', name: 'Starbucks Cold Brew, Black (Grande)', defaultServing: { label: '1 grande (473ml)', grams: 473 }, per100g: { cal: 1, p: 0, c: 0, f: 0 }, keywords: ['starbucks cold brew black'] },
  { id: 'ff_sbux_flat_white', name: 'Starbucks Flat White (Grande)', defaultServing: { label: '1 grande (473ml)', grams: 473 }, per100g: { cal: 47, p: 2.5, c: 4, f: 2.3 }, keywords: ['flat white', 'starbucks flat white'] },
  { id: 'ff_sbux_egg_cheddar', name: 'Starbucks Egg & Cheddar Sandwich', defaultServing: { label: '1 sandwich (103g)', grams: 103 }, per100g: { cal: 301, p: 12.6, c: 30.1, f: 15.5 }, keywords: ['starbucks egg sandwich', 'starbucks breakfast'] },
  { id: 'ff_sbux_turkey_bacon', name: 'Starbucks Turkey Bacon Sandwich', defaultServing: { label: '1 sandwich (115g)', grams: 115 }, per100g: { cal: 200, p: 14.8, c: 22.6, f: 6.1 }, keywords: ['starbucks turkey bacon sandwich', 'starbucks breakfast'] },
  { id: 'ff_sbux_spinach_wrap', name: 'Starbucks Spinach Egg White Wrap', defaultServing: { label: '1 wrap (114g)', grams: 114 }, per100g: { cal: 254, p: 17.5, c: 28.9, f: 7 }, keywords: ['starbucks spinach wrap', 'egg white wrap'] },
  { id: 'ff_sbux_butter_croissant', name: 'Starbucks Butter Croissant', defaultServing: { label: '1 croissant (72g)', grams: 72 }, per100g: { cal: 361, p: 6.9, c: 41.7, f: 19.4 }, keywords: ['starbucks croissant', 'butter croissant'] },
  { id: 'ff_sbux_blueberry_muffin', name: 'Starbucks Blueberry Muffin', defaultServing: { label: '1 muffin (141g)', grams: 141 }, per100g: { cal: 326, p: 5, c: 51.1, f: 11.3 }, keywords: ['starbucks blueberry muffin', 'starbucks muffin'] },

  // ── Dunkin' ───────────────────────────────────────────────────────
  { id: 'ff_dun_glazed_donut', name: "Dunkin' Glazed Donut", defaultServing: { label: '1 donut (60g)', grams: 60 }, per100g: { cal: 400, p: 6.7, c: 53.3, f: 18.3 }, keywords: ["dunkin' glazed donut", 'dunkin donut', 'glazed donut'] },
  { id: 'ff_dun_boston_cream', name: "Dunkin' Boston Cream Donut", defaultServing: { label: '1 donut (85g)', grams: 85 }, per100g: { cal: 341, p: 5.9, c: 49.4, f: 14.1 }, keywords: ["dunkin' boston cream", 'boston cream donut'] },
  { id: 'ff_dun_munchkins', name: "Dunkin' Munchkins Glazed (5pc)", defaultServing: { label: '5 pieces (55g)', grams: 55 }, per100g: { cal: 364, p: 5.5, c: 50.9, f: 16.4 }, keywords: ['munchkins', 'dunkin munchkins'] },
  { id: 'ff_dun_bacon_egg_cheese', name: "Dunkin' Bacon Egg & Cheese Sandwich", defaultServing: { label: '1 sandwich (152g)', grams: 152 }, per100g: { cal: 303, p: 13.8, c: 27, f: 15.1 }, keywords: ["dunkin' bacon egg cheese", 'dunkin breakfast'] },
  { id: 'ff_dun_iced_coffee', name: "Dunkin' Iced Coffee with Cream & Sugar (medium)", defaultServing: { label: '1 medium (473ml)', grams: 473 }, per100g: { cal: 32, p: 0.4, c: 4.7, f: 1.3 }, keywords: ["dunkin' iced coffee", 'dunkin coffee'] },

  // ── Raising Cane's ────────────────────────────────────────────────
  { id: 'ff_rc_chicken_finger', name: "Raising Cane's Chicken Finger", defaultServing: { label: '1 finger (55g)', grams: 55 }, per100g: { cal: 273, p: 23.6, c: 12.7, f: 14.5 }, keywords: ["raising cane's", 'canes chicken finger'] },
  { id: 'ff_rc_3pc_combo', name: "Raising Cane's 3-Finger Combo", defaultServing: { label: '3 fingers (165g)', grams: 165 }, per100g: { cal: 273, p: 23.6, c: 12.7, f: 14.5 }, keywords: ["raising cane's combo", 'canes 3 finger'] },
  { id: 'ff_rc_fries', name: "Raising Cane's Crinkle Cut Fries", defaultServing: { label: '1 order (142g)', grams: 142 }, per100g: { cal: 239, p: 3.5, c: 31, f: 12 }, keywords: ["raising cane's fries", 'canes fries'] },
  { id: 'ff_rc_canes_sauce', name: "Raising Cane's Sauce", defaultServing: { label: '1 container (43g)', grams: 43 }, per100g: { cal: 442, p: 0, c: 7, f: 46.5 }, keywords: ["cane's sauce", 'raising canes sauce'] },
  { id: 'ff_rc_texas_toast', name: "Raising Cane's Texas Toast", defaultServing: { label: '1 slice (40g)', grams: 40 }, per100g: { cal: 275, p: 5, c: 37.5, f: 11.3 }, keywords: ["raising cane's texas toast", 'texas toast'] },

  // ── Wingstop ──────────────────────────────────────────────────────
  { id: 'ff_ws_classic_wings', name: 'Wingstop Classic Wings (6pc)', defaultServing: { label: '6 wings (192g)', grams: 192 }, per100g: { cal: 297, p: 21.9, c: 0, f: 22.9 }, keywords: ['wingstop classic wings', 'wingstop wings'] },
  { id: 'ff_ws_boneless_wings', name: 'Wingstop Boneless Wings (6pc)', defaultServing: { label: '6 pieces (192g)', grams: 192 }, per100g: { cal: 281, p: 15.6, c: 17.7, f: 16.1 }, keywords: ['wingstop boneless wings', 'wingstop'] },
  { id: 'ff_ws_lemon_pepper', name: 'Wingstop Lemon Pepper Wings (6pc)', defaultServing: { label: '6 wings (192g)', grams: 192 }, per100g: { cal: 333, p: 21.9, c: 3.1, f: 25.5 }, keywords: ['wingstop lemon pepper', 'lemon pepper wings'] },
  { id: 'ff_ws_garlic_parm', name: 'Wingstop Garlic Parmesan Wings (6pc)', defaultServing: { label: '6 wings (192g)', grams: 192 }, per100g: { cal: 349, p: 22.4, c: 2.1, f: 27.1 }, keywords: ['wingstop garlic parmesan', 'garlic parm wings'] },
  { id: 'ff_ws_cajun_wings', name: 'Wingstop Cajun Wings (6pc)', defaultServing: { label: '6 wings (192g)', grams: 192 }, per100g: { cal: 313, p: 21.9, c: 1, f: 24 }, keywords: ['wingstop cajun wings', 'cajun wings'] },
  { id: 'ff_ws_seasoned_fries', name: 'Wingstop Seasoned Fries', defaultServing: { label: '1 order (142g)', grams: 142 }, per100g: { cal: 232, p: 3.5, c: 30.3, f: 11.3 }, keywords: ['wingstop fries', 'wingstop seasoned fries'] },

  // ── Buffalo Wild Wings ────────────────────────────────────────────
  { id: 'ff_bdubs_traditional', name: 'Buffalo Wild Wings Traditional Wings (6pc)', defaultServing: { label: '6 wings (201g)', grams: 201 }, per100g: { cal: 214, p: 16.9, c: 0, f: 15.9 }, keywords: ['buffalo wild wings traditional', 'bdubs wings', 'bww wings'] },
  { id: 'ff_bdubs_boneless', name: 'Buffalo Wild Wings Boneless Wings (6pc)', defaultServing: { label: '6 pieces (196g)', grams: 196 }, per100g: { cal: 235, p: 11.7, c: 20.4, f: 11.7 }, keywords: ['buffalo wild wings boneless', 'bdubs boneless'] },
  { id: 'ff_bdubs_nashville_hot', name: 'Buffalo Wild Wings Nashville Hot Wings (6pc)', defaultServing: { label: '6 wings (201g)', grams: 201 }, per100g: { cal: 249, p: 16.9, c: 2.5, f: 18.9 }, keywords: ['buffalo wild wings nashville hot', 'bdubs'] },
  { id: 'ff_bdubs_nachos', name: 'Buffalo Wild Wings Nachos', defaultServing: { label: '1 order (454g)', grams: 454 }, per100g: { cal: 249, p: 9.5, c: 24.2, f: 13.2 }, keywords: ['buffalo wild wings nachos', 'bdubs nachos'] },

  // ── Sonic ─────────────────────────────────────────────────────────
  { id: 'ff_son_classic_burger', name: 'Sonic Classic Burger', defaultServing: { label: '1 burger (186g)', grams: 186 }, per100g: { cal: 296, p: 13.4, c: 23.7, f: 16.1 }, keywords: ['sonic burger', 'sonic classic burger'] },
  { id: 'ff_son_double_burger', name: 'Sonic Double Burger', defaultServing: { label: '1 burger (260g)', grams: 260 }, per100g: { cal: 277, p: 14.2, c: 17.3, f: 16.9 }, keywords: ['sonic double burger', 'sonic'] },
  { id: 'ff_son_crispy_chicken', name: 'Sonic Crispy Chicken Sandwich', defaultServing: { label: '1 sandwich (196g)', grams: 196 }, per100g: { cal: 270, p: 11.2, c: 29.6, f: 11.7 }, keywords: ['sonic crispy chicken', 'sonic chicken'] },
  { id: 'ff_son_tater_tots', name: 'Sonic Tater Tots (medium)', defaultServing: { label: '1 medium (142g)', grams: 142 }, per100g: { cal: 218, p: 2.1, c: 25.4, f: 11.3 }, keywords: ['sonic tater tots', 'tater tots'] },
  { id: 'ff_son_corn_dog', name: 'Sonic Corn Dog', defaultServing: { label: '1 corn dog (75g)', grams: 75 }, per100g: { cal: 293, p: 8, c: 29.3, f: 16 }, keywords: ['sonic corn dog', 'corn dog'] },
  { id: 'ff_son_blast_oreo', name: 'Sonic Blast Oreo (medium)', defaultServing: { label: '1 medium (375g)', grams: 375 }, per100g: { cal: 181, p: 3.5, c: 25.6, f: 7.5 }, keywords: ['sonic blast', 'sonic oreo blast'] },
  { id: 'ff_son_strawberry_slush', name: 'Sonic Strawberry Slush (medium)', defaultServing: { label: '1 medium (454ml)', grams: 454 }, per100g: { cal: 55, p: 0, c: 14.3, f: 0 }, keywords: ['sonic slush', 'strawberry slush'] },

  // ── Jack in the Box ───────────────────────────────────────────────
  { id: 'ff_jitb_jumbo_jack', name: 'Jack in the Box Jumbo Jack', defaultServing: { label: '1 burger (285g)', grams: 285 }, per100g: { cal: 207, p: 8.4, c: 18.9, f: 10.9 }, keywords: ['jumbo jack', 'jack in the box'] },
  { id: 'ff_jitb_ultimate_cheese', name: 'Jack in the Box Ultimate Cheeseburger', defaultServing: { label: '1 burger (330g)', grams: 330 }, per100g: { cal: 248, p: 13, c: 16.4, f: 14.8 }, keywords: ['ultimate cheeseburger', 'jack in the box'] },
  { id: 'ff_jitb_spicy_chicken', name: 'Jack in the Box Spicy Chicken Sandwich', defaultServing: { label: '1 sandwich (191g)', grams: 191 }, per100g: { cal: 293, p: 11, c: 28.8, f: 14.7 }, keywords: ['jack in the box spicy chicken', 'jitb'] },
  { id: 'ff_jitb_tacos', name: 'Jack in the Box Tacos (2pc)', defaultServing: { label: '2 tacos (142g)', grams: 142 }, per100g: { cal: 218, p: 8.5, c: 21.1, f: 12 }, keywords: ['jack in the box tacos', 'jitb tacos'] },
  { id: 'ff_jitb_curly_fries', name: 'Jack in the Box Curly Fries (medium)', defaultServing: { label: '1 medium (128g)', grams: 128 }, per100g: { cal: 336, p: 4.7, c: 39.1, f: 18 }, keywords: ['jack in the box curly fries', 'jitb fries'] },
  { id: 'ff_jitb_sourdough_jack', name: 'Jack in the Box Sourdough Jack', defaultServing: { label: '1 burger (271g)', grams: 271 }, per100g: { cal: 262, p: 11.4, c: 19.9, f: 15.5 }, keywords: ['sourdough jack', 'jack in the box'] },

  // ── Whataburger ───────────────────────────────────────────────────
  { id: 'ff_wbgr_whataburger', name: 'Whataburger', defaultServing: { label: '1 burger (310g)', grams: 310 }, per100g: { cal: 190, p: 9.4, c: 18.1, f: 8.7 }, keywords: ['whataburger'] },
  { id: 'ff_wbgr_double', name: 'Double Whataburger', defaultServing: { label: '1 burger (390g)', grams: 390 }, per100g: { cal: 218, p: 12.8, c: 14.6, f: 11.8 }, keywords: ['double whataburger', 'whataburger'] },
  { id: 'ff_wbgr_jr', name: 'Whataburger Jr', defaultServing: { label: '1 burger (182g)', grams: 182 }, per100g: { cal: 170, p: 7.7, c: 19.2, f: 7.1 }, keywords: ['whataburger jr', 'whataburger'] },
  { id: 'ff_wbgr_spicy_chicken', name: 'Whataburger Spicy Chicken Sandwich', defaultServing: { label: '1 sandwich (224g)', grams: 224 }, per100g: { cal: 237, p: 11.2, c: 26.3, f: 9.8 }, keywords: ['whataburger spicy chicken', 'whataburger'] },
  { id: 'ff_wbgr_onion_rings', name: 'Whataburger Onion Rings (medium)', defaultServing: { label: '1 medium (91g)', grams: 91 }, per100g: { cal: 352, p: 4.4, c: 37.4, f: 20.9 }, keywords: ['whataburger onion rings'] },
  { id: 'ff_wbgr_fries', name: 'Whataburger Fries (medium)', defaultServing: { label: '1 medium (113g)', grams: 113 }, per100g: { cal: 310, p: 3.5, c: 39.8, f: 15 }, keywords: ['whataburger fries', 'whatafries'] },

  // ── Cava ──────────────────────────────────────────────────────────
  { id: 'ff_cava_chicken_bowl', name: 'Cava Harissa Honey Chicken Bowl', defaultServing: { label: '1 bowl (480g)', grams: 480 }, per100g: { cal: 142, p: 8.3, c: 15.8, f: 5 }, keywords: ['cava chicken bowl', 'cava bowl', 'cava'] },
  { id: 'ff_cava_lamb_bowl', name: 'Cava Braised Lamb Bowl', defaultServing: { label: '1 bowl (480g)', grams: 480 }, per100g: { cal: 156, p: 7.3, c: 15.8, f: 7.1 }, keywords: ['cava lamb bowl', 'braised lamb', 'cava'] },
  { id: 'ff_cava_falafel_bowl', name: 'Cava Falafel Bowl', defaultServing: { label: '1 bowl (480g)', grams: 480 }, per100g: { cal: 152, p: 4.6, c: 18.8, f: 6.9 }, keywords: ['cava falafel bowl', 'cava vegetarian'] },
  { id: 'ff_cava_pita', name: 'Cava Pita Bread', defaultServing: { label: '1 pita (87g)', grams: 87 }, per100g: { cal: 310, p: 10.3, c: 56.3, f: 5.7 }, keywords: ['cava pita', 'cava'] },
  { id: 'ff_cava_tzatziki', name: 'Cava Tzatziki', defaultServing: { label: '1 side (57g)', grams: 57 }, per100g: { cal: 79, p: 3.5, c: 5.3, f: 5.3 }, keywords: ['cava tzatziki', 'tzatziki'] },

  // ── Halal Guys ────────────────────────────────────────────────────
  { id: 'ff_hg_chicken_rice', name: 'Halal Guys Chicken & Rice Platter', defaultServing: { label: '1 platter (560g)', grams: 560 }, per100g: { cal: 163, p: 8.4, c: 18.8, f: 6.1 }, keywords: ['halal guys chicken rice', 'halal guys'] },
  { id: 'ff_hg_beef_lamb_rice', name: 'Halal Guys Beef & Lamb over Rice', defaultServing: { label: '1 platter (560g)', grams: 560 }, per100g: { cal: 173, p: 7.9, c: 18.8, f: 7.1 }, keywords: ['halal guys beef lamb', 'halal guys'] },
  { id: 'ff_hg_combo_rice', name: 'Halal Guys Combo over Rice', defaultServing: { label: '1 platter (560g)', grams: 560 }, per100g: { cal: 177, p: 8.9, c: 18.8, f: 7.1 }, keywords: ['halal guys combo', 'halal guys'] },
  { id: 'ff_hg_white_sauce', name: 'Halal Guys White Sauce', defaultServing: { label: '1 container (57g)', grams: 57 }, per100g: { cal: 456, p: 0, c: 8.8, f: 47.4 }, keywords: ['halal guys white sauce', 'white sauce'] },

  // ── Del Taco ──────────────────────────────────────────────────────
  { id: 'ff_dt_del_taco', name: 'Del Taco Crunchy Taco', defaultServing: { label: '1 taco (113g)', grams: 113 }, per100g: { cal: 239, p: 10.6, c: 19.5, f: 12.4 }, keywords: ['del taco crunchy', 'del taco'] },
  { id: 'ff_dt_double_del', name: 'Del Taco Double Del Taco', defaultServing: { label: '1 taco (178g)', grams: 178 }, per100g: { cal: 242, p: 11.2, c: 16.9, f: 14 }, keywords: ['double del taco', 'del taco'] },
  { id: 'ff_dt_cheeseburger', name: 'Del Taco Cheeseburger', defaultServing: { label: '1 burger (170g)', grams: 170 }, per100g: { cal: 253, p: 11.8, c: 20.6, f: 12.9 }, keywords: ['del taco cheeseburger', 'del taco'] },
  { id: 'ff_dt_fries', name: 'Del Taco Crinkle Cut Fries', defaultServing: { label: '1 order (142g)', grams: 142 }, per100g: { cal: 282, p: 3.5, c: 36.6, f: 13.4 }, keywords: ['del taco fries', 'del taco'] },

  // ── Culver's ──────────────────────────────────────────────────────
  { id: 'ff_cul_butterburger_single', name: "Culver's ButterBurger Single", defaultServing: { label: '1 burger (215g)', grams: 215 }, per100g: { cal: 181, p: 9.8, c: 14.4, f: 9.3 }, keywords: ["culver's butterburger", 'culvers'] },
  { id: 'ff_cul_butterburger_double', name: "Culver's ButterBurger Double", defaultServing: { label: '1 burger (289g)', grams: 289 }, per100g: { cal: 204, p: 11.8, c: 11.1, f: 12.5 }, keywords: ["culver's double butterburger", 'culvers'] },
  { id: 'ff_cul_cheese_curds', name: "Culver's Cheese Curds", defaultServing: { label: '1 order (149g)', grams: 149 }, per100g: { cal: 336, p: 12.8, c: 27.5, f: 19.5 }, keywords: ["culver's cheese curds", 'cheese curds'] },
  { id: 'ff_cul_fish_sandwich', name: "Culver's North Atlantic Cod Sandwich", defaultServing: { label: '1 sandwich (198g)', grams: 198 }, per100g: { cal: 273, p: 11.6, c: 27.8, f: 12.6 }, keywords: ["culver's fish sandwich", 'culvers'] },

  // ── Moe's Southwest ───────────────────────────────────────────────
  { id: 'ff_moes_homewrecker', name: "Moe's Homewrecker Burrito", defaultServing: { label: '1 burrito (726g)', grams: 726 }, per100g: { cal: 143, p: 6.9, c: 18.3, f: 4.7 }, keywords: ["moe's homewrecker", 'moes burrito'] },
  { id: 'ff_moes_bowl', name: "Moe's Joey Bag of Donuts Bowl", defaultServing: { label: '1 bowl (560g)', grams: 560 }, per100g: { cal: 138, p: 7.7, c: 16.1, f: 4.5 }, keywords: ["moe's bowl", 'moes bowl'] },

  // ── Qdoba ─────────────────────────────────────────────────────────
  { id: 'ff_qdoba_chicken_burrito', name: 'Qdoba Chicken Burrito', defaultServing: { label: '1 burrito (700g)', grams: 700 }, per100g: { cal: 140, p: 7.9, c: 16.6, f: 4.7 }, keywords: ['qdoba chicken burrito', 'qdoba'] },
  { id: 'ff_qdoba_nachos', name: 'Qdoba 3-Cheese Nachos with Chicken', defaultServing: { label: '1 order (510g)', grams: 510 }, per100g: { cal: 208, p: 9.8, c: 18, f: 10.8 }, keywords: ['qdoba nachos', 'qdoba'] },

  // ── Bojangles ─────────────────────────────────────────────────────
  { id: 'ff_boj_chicken_biscuit', name: "Bojangles Bo's Chicken Biscuit", defaultServing: { label: '1 sandwich (168g)', grams: 168 }, per100g: { cal: 286, p: 14.3, c: 25, f: 14.3 }, keywords: ["bojangles chicken biscuit", 'bojangles'] },
  { id: 'ff_boj_cajun_filet', name: 'Bojangles Cajun Filet Sandwich', defaultServing: { label: '1 sandwich (196g)', grams: 196 }, per100g: { cal: 265, p: 14.3, c: 25.5, f: 11.7 }, keywords: ['bojangles cajun filet', 'bojangles'] },
  { id: 'ff_boj_dirty_rice', name: 'Bojangles Dirty Rice', defaultServing: { label: '1 side (185g)', grams: 185 }, per100g: { cal: 178, p: 5.4, c: 25.9, f: 5.9 }, keywords: ['bojangles dirty rice', 'dirty rice'] },
  { id: 'ff_boj_biscuit', name: 'Bojangles Biscuit', defaultServing: { label: '1 biscuit (80g)', grams: 80 }, per100g: { cal: 338, p: 6.3, c: 41.3, f: 16.3 }, keywords: ['bojangles biscuit'] },

  // ── Church's Chicken ──────────────────────────────────────────────
  { id: 'ff_chx_original_leg', name: "Church's Chicken Original Leg", defaultServing: { label: '1 piece (104g)', grams: 104 }, per100g: { cal: 221, p: 18.3, c: 5.8, f: 14.4 }, keywords: ["church's chicken leg", 'churchs chicken'] },
  { id: 'ff_chx_original_breast', name: "Church's Chicken Original Breast", defaultServing: { label: '1 piece (163g)', grams: 163 }, per100g: { cal: 215, p: 16.6, c: 7.4, f: 13.5 }, keywords: ["church's chicken breast", 'churchs chicken'] },
  { id: 'ff_chx_honey_biscuit', name: "Church's Honey Butter Biscuit", defaultServing: { label: '1 biscuit (57g)', grams: 57 }, per100g: { cal: 439, p: 5.3, c: 45.6, f: 26.3 }, keywords: ["church's honey biscuit", 'honey butter biscuit'] },

  // ── Little Caesars ────────────────────────────────────────────────
  { id: 'ff_lc_hot_ready_cheese', name: "Little Caesars Hot-N-Ready Cheese (2 slices)", defaultServing: { label: '2 slices (170g)', grams: 170 }, per100g: { cal: 259, p: 10.6, c: 31.8, f: 9.4 }, keywords: ['little caesars cheese', 'little caesars', 'hot n ready'] },
  { id: 'ff_lc_pepperoni', name: "Little Caesars Pepperoni (2 slices)", defaultServing: { label: '2 slices (170g)', grams: 170 }, per100g: { cal: 282, p: 11.8, c: 31.8, f: 11.8 }, keywords: ['little caesars pepperoni', 'little caesars'] },
  { id: 'ff_lc_crazy_bread', name: "Little Caesars Crazy Bread (2pc)", defaultServing: { label: '2 pieces (78g)', grams: 78 }, per100g: { cal: 231, p: 7.7, c: 38.5, f: 6.4 }, keywords: ['crazy bread', 'little caesars crazy bread'] },

  // ── IHOP ──────────────────────────────────────────────────────────
  { id: 'ff_ihop_pancakes', name: 'IHOP Original Buttermilk Pancakes (3)', defaultServing: { label: '3 pancakes (330g)', grams: 330 }, per100g: { cal: 179, p: 3.9, c: 32.1, f: 4.2 }, keywords: ['ihop pancakes', 'buttermilk pancakes'] },
  { id: 'ff_ihop_bacon_omelette', name: 'IHOP Bacon Temptation Omelette', defaultServing: { label: '1 omelette (355g)', grams: 355 }, per100g: { cal: 214, p: 12.7, c: 2.3, f: 17.5 }, keywords: ['ihop omelette', 'ihop bacon omelette'] },
  { id: 'ff_ihop_eggs_benedict', name: 'IHOP Eggs Benedict', defaultServing: { label: '1 order (355g)', grams: 355 }, per100g: { cal: 175, p: 7.9, c: 12.4, f: 10.7 }, keywords: ['ihop eggs benedict', 'eggs benedict'] },
  { id: 'ff_ihop_french_toast', name: 'IHOP French Toast (2 slices)', defaultServing: { label: '2 slices (204g)', grams: 204 }, per100g: { cal: 240, p: 6.4, c: 27.5, f: 12.3 }, keywords: ['ihop french toast', 'french toast'] },

  // ── Denny's ───────────────────────────────────────────────────────
  { id: 'ff_den_grand_slam', name: "Denny's Grand Slam", defaultServing: { label: '1 order (476g)', grams: 476 }, per100g: { cal: 151, p: 7.6, c: 12.4, f: 8 }, keywords: ["denny's grand slam", 'dennys breakfast'] },
  { id: 'ff_den_lumberjack', name: "Denny's Lumberjack Slam", defaultServing: { label: '1 order (630g)', grams: 630 }, per100g: { cal: 162, p: 7.9, c: 12.4, f: 9.2 }, keywords: ["denny's lumberjack slam", 'dennys'] },
  { id: 'ff_den_moons_hammy', name: "Denny's Moons Over My Hammy", defaultServing: { label: '1 order (340g)', grams: 340 }, per100g: { cal: 200, p: 11.2, c: 16.2, f: 9.4 }, keywords: ["denny's moons over my hammy", 'dennys'] },
  { id: 'ff_den_fit_slam', name: "Denny's Fit Slam", defaultServing: { label: '1 order (340g)', grams: 340 }, per100g: { cal: 115, p: 9.1, c: 12.9, f: 2.6 }, keywords: ["denny's fit slam", 'dennys healthy'] },

  // ── Waffle House ──────────────────────────────────────────────────
  { id: 'ff_wh_waffle', name: 'Waffle House Waffle', defaultServing: { label: '1 waffle (90g)', grams: 90 }, per100g: { cal: 322, p: 6.7, c: 36.7, f: 16.7 }, keywords: ['waffle house waffle', 'waffle house'] },
  { id: 'ff_wh_hash_browns', name: 'Waffle House Hash Browns', defaultServing: { label: '1 order (155g)', grams: 155 }, per100g: { cal: 168, p: 2.6, c: 23.9, f: 7.1 }, keywords: ['waffle house hash browns', 'waffle house'] },
  { id: 'ff_wh_cheese_omelette', name: 'Waffle House Cheese Omelette', defaultServing: { label: '1 omelette (210g)', grams: 210 }, per100g: { cal: 214, p: 12.4, c: 1, f: 17.6 }, keywords: ['waffle house omelette', 'cheese omelette'] },
  { id: 'ff_wh_grilled_chicken', name: 'Waffle House Grilled Chicken', defaultServing: { label: '1 breast (113g)', grams: 113 }, per100g: { cal: 159, p: 26.5, c: 1.8, f: 5.3 }, keywords: ['waffle house chicken', 'waffle house grilled chicken'] },

  // ── Olive Garden ──────────────────────────────────────────────────
  { id: 'ff_og_tour_of_italy', name: 'Olive Garden Tour of Italy', defaultServing: { label: '1 plate (490g)', grams: 490 }, per100g: { cal: 310, p: 12.2, c: 19.8, f: 20 }, keywords: ['olive garden tour of italy', 'olive garden'] },
  { id: 'ff_og_chicken_parm', name: 'Olive Garden Chicken Parmigiana', defaultServing: { label: '1 plate (397g)', grams: 397 }, per100g: { cal: 267, p: 17.1, c: 19.9, f: 12.6 }, keywords: ['olive garden chicken parmigiana', 'chicken parmesan'] },
  { id: 'ff_og_fettuccine_alfredo', name: 'Olive Garden Fettuccine Alfredo', defaultServing: { label: '1 plate (397g)', grams: 397 }, per100g: { cal: 300, p: 9.1, c: 23.9, f: 18.9 }, keywords: ['olive garden fettuccine alfredo', 'fettuccine alfredo'] },
  { id: 'ff_og_spaghetti_meat', name: 'Olive Garden Spaghetti with Meat Sauce', defaultServing: { label: '1 plate (495g)', grams: 495 }, per100g: { cal: 143, p: 7.3, c: 18.6, f: 4 }, keywords: ['olive garden spaghetti', 'spaghetti meat sauce'] },
  { id: 'ff_og_breadstick', name: 'Olive Garden Breadstick', defaultServing: { label: '1 stick (59g)', grams: 59 }, per100g: { cal: 254, p: 8.5, c: 44.1, f: 5.9 }, keywords: ['olive garden breadstick', 'breadstick'] },
  { id: 'ff_og_minestrone', name: 'Olive Garden Minestrone Soup', defaultServing: { label: '1 bowl (227g)', grams: 227 }, per100g: { cal: 48, p: 2.2, c: 8.8, f: 0.7 }, keywords: ['olive garden minestrone', 'minestrone soup'] },
  { id: 'ff_og_tiramisu', name: 'Olive Garden Tiramisu', defaultServing: { label: '1 serving (170g)', grams: 170 }, per100g: { cal: 306, p: 5.3, c: 37.1, f: 15.9 }, keywords: ['olive garden tiramisu', 'tiramisu'] },

  // ── Chili's ───────────────────────────────────────────────────────
  { id: 'ff_chilis_big_mouth_burger', name: "Chili's Big Mouth Burger", defaultServing: { label: '1 burger (410g)', grams: 410 }, per100g: { cal: 251, p: 11.7, c: 18.5, f: 14.6 }, keywords: ["chili's big mouth burger", 'chilis burger'] },
  { id: 'ff_chilis_crispers', name: "Chili's Chicken Crispers (6pc)", defaultServing: { label: '6 pieces (397g)', grams: 397 }, per100g: { cal: 262, p: 12.3, c: 15.6, f: 16.4 }, keywords: ["chili's chicken crispers", 'chilis chicken'] },
  { id: 'ff_chilis_baby_back_ribs', name: "Chili's Baby Back Ribs (full rack)", defaultServing: { label: '1 full rack (700g)', grams: 700 }, per100g: { cal: 240, p: 15, c: 9, f: 16.1 }, keywords: ["chili's baby back ribs", 'baby back ribs'] },
  { id: 'ff_chilis_chicken_fajitas', name: "Chili's Chicken Fajitas", defaultServing: { label: '1 order (454g)', grams: 454 }, per100g: { cal: 115, p: 8.6, c: 9.3, f: 4.8 }, keywords: ["chili's fajitas", 'chilis chicken fajitas'] },
  { id: 'ff_chilis_molten_cake', name: "Chili's Molten Chocolate Cake", defaultServing: { label: '1 cake (212g)', grams: 212 }, per100g: { cal: 467, p: 5.7, c: 65.1, f: 21.7 }, keywords: ["chili's molten cake", 'molten chocolate cake'] },

  // ── Cracker Barrel ────────────────────────────────────────────────
  { id: 'ff_cb_country_boy_breakfast', name: 'Cracker Barrel Country Boy Breakfast', defaultServing: { label: '1 order (640g)', grams: 640 }, per100g: { cal: 153, p: 7.3, c: 11.3, f: 8.9 }, keywords: ['cracker barrel country boy breakfast', 'cracker barrel breakfast'] },
  { id: 'ff_cb_chicken_dumplings', name: "Cracker Barrel Chicken & Dumplings", defaultServing: { label: '1 plate (397g)', grams: 397 }, per100g: { cal: 111, p: 6, c: 14.1, f: 3 }, keywords: ['cracker barrel chicken dumplings', 'chicken and dumplings'] },
  { id: 'ff_cb_meatloaf', name: 'Cracker Barrel Meatloaf', defaultServing: { label: '1 plate (340g)', grams: 340 }, per100g: { cal: 144, p: 8.8, c: 10.6, f: 7.1 }, keywords: ['cracker barrel meatloaf', 'cracker barrel'] },
  { id: 'ff_cb_biscuit', name: 'Cracker Barrel Buttermilk Biscuit', defaultServing: { label: '1 biscuit (71g)', grams: 71 }, per100g: { cal: 282, p: 5.6, c: 39.4, f: 11.3 }, keywords: ['cracker barrel biscuit', 'buttermilk biscuit'] },

  // ── Applebee's ────────────────────────────────────────────────────
  { id: 'ff_app_classic_burger', name: "Applebee's Classic Burger", defaultServing: { label: '1 burger (320g)', grams: 320 }, per100g: { cal: 234, p: 11.6, c: 17.2, f: 13.4 }, keywords: ["applebee's burger", 'applebees'] },
  { id: 'ff_app_chicken_tenders', name: "Applebee's Chicken Tenders Platter", defaultServing: { label: '1 order (397g)', grams: 397 }, per100g: { cal: 317, p: 11.8, c: 31.2, f: 16.6 }, keywords: ["applebee's chicken tenders", 'applebees'] },
  { id: 'ff_app_fiesta_lime_chicken', name: "Applebee's Fiesta Lime Chicken", defaultServing: { label: '1 plate (340g)', grams: 340 }, per100g: { cal: 194, p: 12.4, c: 17.6, f: 7.9 }, keywords: ["applebee's fiesta lime chicken", 'applebees'] },
  { id: 'ff_app_3cheese_penne', name: "Applebee's 3-Cheese Chicken Penne", defaultServing: { label: '1 plate (397g)', grams: 397 }, per100g: { cal: 282, p: 13.6, c: 24.9, f: 14.1 }, keywords: ["applebee's chicken penne", 'applebees pasta'] },

  // ── Dairy Queen ───────────────────────────────────────────────────
  { id: 'ff_dq_soft_serve', name: 'Dairy Queen Vanilla Soft Serve (small)', defaultServing: { label: '1 small (142g)', grams: 142 }, per100g: { cal: 162, p: 4.2, c: 26.8, f: 4.9 }, keywords: ['dairy queen soft serve', 'dq soft serve', 'dq vanilla'] },
  { id: 'ff_dq_blizzard_oreo', name: 'Dairy Queen Blizzard Oreo (medium)', defaultServing: { label: '1 medium (397g)', grams: 397 }, per100g: { cal: 184, p: 4, c: 26.9, f: 6.8 }, keywords: ['dq blizzard oreo', 'dairy queen blizzard'] },
  { id: 'ff_dq_blizzard_reeses', name: "Dairy Queen Blizzard Reese's (medium)", defaultServing: { label: '1 medium (397g)', grams: 397 }, per100g: { cal: 217, p: 5.3, c: 27.7, f: 10.1 }, keywords: ["dq blizzard reeses", 'dairy queen blizzard'] },
  { id: 'ff_dq_dilly_bar', name: 'Dairy Queen Dilly Bar', defaultServing: { label: '1 bar (85g)', grams: 85 }, per100g: { cal: 259, p: 3.5, c: 31.8, f: 14.1 }, keywords: ['dilly bar', 'dairy queen dilly bar'] },
  { id: 'ff_dq_cheeseburger', name: 'Dairy Queen Cheeseburger', defaultServing: { label: '1 burger (161g)', grams: 161 }, per100g: { cal: 242, p: 11.2, c: 19.9, f: 13 }, keywords: ['dairy queen cheeseburger', 'dq burger'] },
  { id: 'ff_dq_chicken_strip_basket', name: 'Dairy Queen Chicken Strip Basket (4pc)', defaultServing: { label: '1 basket (450g)', grams: 450 }, per100g: { cal: 222, p: 8.4, c: 22.7, f: 10.9 }, keywords: ['dairy queen chicken strips', 'dq chicken basket'] },

  // ── Jamba Juice ───────────────────────────────────────────────────
  { id: 'ff_jamba_mango_ago', name: 'Jamba Juice Mango-a-Go-Go (original)', defaultServing: { label: '1 original (591ml)', grams: 591 }, per100g: { cal: 56, p: 0.7, c: 13.2, f: 0.3 }, keywords: ['jamba juice mango', 'mango a go go', 'jamba'] },
  { id: 'ff_jamba_strawberries_wild', name: 'Jamba Juice Strawberries Wild (original)', defaultServing: { label: '1 original (591ml)', grams: 591 }, per100g: { cal: 47, p: 0.5, c: 11.5, f: 0.1 }, keywords: ['jamba strawberries wild', 'jamba juice'] },
  { id: 'ff_jamba_protein_berry', name: 'Jamba Juice Protein Berry Workout', defaultServing: { label: '1 original (591ml)', grams: 591 }, per100g: { cal: 63, p: 3, c: 11.7, f: 0.5 }, keywords: ['jamba protein berry', 'jamba juice protein'] },
  { id: 'ff_jamba_acai_bowl', name: 'Jamba Juice Acai Primo Bowl', defaultServing: { label: '1 bowl (454g)', grams: 454 }, per100g: { cal: 101, p: 2, c: 17.2, f: 3.1 }, keywords: ['jamba acai bowl', 'acai bowl'] },

  // ── Smoothie King ─────────────────────────────────────────────────
  { id: 'ff_sk_hulk_vanilla', name: 'Smoothie King The Hulk Vanilla (20oz)', defaultServing: { label: '1 smoothie (591ml)', grams: 591 }, per100g: { cal: 163, p: 6.8, c: 23, f: 4.6 }, keywords: ['smoothie king hulk', 'hulk smoothie'] },
  { id: 'ff_sk_activator_strawberry', name: 'Smoothie King The Activator Strawberry (20oz)', defaultServing: { label: '1 smoothie (591ml)', grams: 591 }, per100g: { cal: 81, p: 3.7, c: 15.4, f: 0.7 }, keywords: ['smoothie king activator', 'smoothie king strawberry'] },
  { id: 'ff_sk_lean1_strawberry', name: 'Smoothie King Lean1 Strawberry (20oz)', defaultServing: { label: '1 smoothie (591ml)', grams: 591 }, per100g: { cal: 56, p: 3.7, c: 9, f: 0.8 }, keywords: ['smoothie king lean1', 'lean1 smoothie'] },
  { id: 'ff_sk_angel_food', name: 'Smoothie King Angel Food (20oz)', defaultServing: { label: '1 smoothie (591ml)', grams: 591 }, per100g: { cal: 56, p: 1, c: 12.9, f: 0.2 }, keywords: ['smoothie king angel food', 'angel food smoothie'] },

  // ── Baskin-Robbins ────────────────────────────────────────────────
  { id: 'ff_br_vanilla', name: 'Baskin-Robbins Vanilla Ice Cream (1 scoop)', defaultServing: { label: '1 scoop (106g)', grams: 106 }, per100g: { cal: 255, p: 4.7, c: 31.1, f: 12.3 }, keywords: ['baskin robbins vanilla', 'baskin-robbins'] },
  { id: 'ff_br_chocolate', name: 'Baskin-Robbins Chocolate Ice Cream (1 scoop)', defaultServing: { label: '1 scoop (106g)', grams: 106 }, per100g: { cal: 264, p: 4.7, c: 31.1, f: 13.2 }, keywords: ['baskin robbins chocolate', 'baskin-robbins'] },
  { id: 'ff_br_pralines_cream', name: "Baskin-Robbins Pralines 'n Cream (1 scoop)", defaultServing: { label: '1 scoop (106g)', grams: 106 }, per100g: { cal: 283, p: 4.7, c: 34.9, f: 14.2 }, keywords: ['baskin robbins pralines cream', 'pralines and cream'] },
  { id: 'ff_br_waffle_cone', name: 'Baskin-Robbins Waffle Cone', defaultServing: { label: '1 cone (37g)', grams: 37 }, per100g: { cal: 405, p: 8.1, c: 75.7, f: 10.8 }, keywords: ['baskin robbins waffle cone', 'waffle cone'] },
  { id: 'ff_br_sundae', name: 'Baskin-Robbins Sundae (small)', defaultServing: { label: '1 small (213g)', grams: 213 }, per100g: { cal: 244, p: 3.8, c: 31.5, f: 11.7 }, keywords: ['baskin robbins sundae', 'ice cream sundae'] },

  // ── Cold Stone Creamery ───────────────────────────────────────────
  { id: 'ff_cs_vanilla', name: 'Cold Stone Creamery Vanilla (Like It)', defaultServing: { label: '1 Like It (177g)', grams: 177 }, per100g: { cal: 220, p: 4, c: 27.1, f: 10.7 }, keywords: ['cold stone vanilla', 'cold stone creamery'] },
  { id: 'ff_cs_chocolate', name: 'Cold Stone Creamery Chocolate (Like It)', defaultServing: { label: '1 Like It (177g)', grams: 177 }, per100g: { cal: 243, p: 4.5, c: 31.1, f: 11.3 }, keywords: ['cold stone chocolate', 'cold stone creamery'] },
  { id: 'ff_cs_oreo_overload', name: 'Cold Stone Oreo Overload (Like It)', defaultServing: { label: '1 Like It (227g)', grams: 227 }, per100g: { cal: 286, p: 4.4, c: 37, f: 13.7 }, keywords: ['cold stone oreo overload', 'cold stone oreo'] },
  { id: 'ff_cs_waffle_bowl', name: 'Cold Stone Waffle Bowl', defaultServing: { label: '1 bowl (66g)', grams: 66 }, per100g: { cal: 439, p: 7.6, c: 75.8, f: 12.1 }, keywords: ['cold stone waffle bowl'] },

];

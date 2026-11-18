import { Category } from '../../app/data-access/models';

export interface CategoryFixture extends Category {
  readonly hue: number;
}

/** Mirrors the main category tabs on the real momoshop home page. */
export const CATEGORY_FIXTURES: readonly CategoryFixture[] = [
  { id: 'appliance', name: '家電', hue: 205 },
  { id: 'gaming', name: '電玩', hue: 265 },
  { id: 'phone', name: '手機/相機', hue: 220 },
  { id: 'computer', name: '電腦/組件', hue: 190 },
  { id: 'accessory', name: '3C週邊', hue: 175 },
  { id: 'health', name: '保健/醫療', hue: 140 },
  { id: 'food', name: '食品/飲料', hue: 30 },
  { id: 'fresh', name: '生鮮', hue: 100 },
  { id: 'women', name: '女時尚', hue: 330 },
  { id: 'men', name: '男時尚', hue: 230 },
  { id: 'beauty', name: '美妝保養', hue: 345 },
  { id: 'daily', name: '日用婦幼', hue: 50 },
];

export const CATEGORIES: readonly Category[] = CATEGORY_FIXTURES.map(({ id, name }) => ({
  id,
  name,
}));

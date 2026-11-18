import { Product, ProductTag, SpecGroup } from '../../app/data-access/models';
import { placeholderImage } from '../placeholder';
import { Random, createRandom } from '../seed';
import { CATEGORY_FIXTURES } from './categories';

interface CategoryTemplate {
  readonly brands: readonly string[];
  readonly nouns: readonly string[];
  readonly priceRange: readonly [number, number];
  readonly specs: readonly SpecGroup[];
}

const colors = (...labels: string[]): SpecGroup => ({
  name: '顏色',
  options: labels.map((label, index) => ({ id: `color-${index}`, label })),
});

const options = (name: string, ...labels: string[]): SpecGroup => ({
  name,
  options: labels.map((label, index) => ({ id: `${name}-${index}`, label })),
});

const TEMPLATES: Readonly<Record<string, CategoryTemplate>> = {
  appliance: {
    brands: ['Panasonic 國際牌', 'SAMPO 聲寶', 'TECO 東元', 'Dyson', 'Philips 飛利浦'],
    nouns: ['變頻滾筒洗衣機 13kg', '蒸氣掛燙機', '無線吸塵器', '空氣清淨機', 'IH 電子鍋 6人份'],
    priceRange: [1990, 39900],
    specs: [colors('白色', '香檳金', '灰色')],
  },
  gaming: {
    brands: ['Nintendo 任天堂', 'Sony', 'Xbox'],
    nouns: ['遊戲主機 標準版', '無線控制器', '遊戲片 典藏版', '收納包 + 保護貼組'],
    priceRange: [690, 17980],
    specs: [options('版本', '台灣公司貨', '同捆組')],
  },
  phone: {
    brands: ['Apple', 'Samsung 三星', 'Google', 'Sony'],
    nouns: ['智慧型手機', '摺疊手機', '微單眼相機 單機身', '定焦鏡頭 50mm'],
    priceRange: [8990, 59900],
    specs: [colors('黑色', '白色', '藍色'), options('容量', '256GB', '512GB')],
  },
  computer: {
    brands: ['ASUS 華碩', 'Acer 宏碁', 'MSI 微星', 'Lenovo 聯想'],
    nouns: ['14吋輕薄筆電', '16吋電競筆電', '27吋 4K 螢幕', '桌上型主機'],
    priceRange: [6990, 69900],
    specs: [options('記憶體', '16GB', '32GB')],
  },
  accessory: {
    brands: ['Logitech 羅技', 'Anker', 'Bose', 'JBL'],
    nouns: ['無線靜音滑鼠', '行動電源 20000mAh', 'Ultra 開放式耳機', '防水藍牙喇叭'],
    priceRange: [490, 9990],
    specs: [colors('黑色', '白色', '奶茶色')],
  },
  health: {
    brands: ['善存', '白蘭氏', '桂格', '大研生醫'],
    nouns: ['綜合維他命 100錠', '雞精 12入', '葉黃素 60粒', 'Omega-3 魚油 90粒'],
    priceRange: [399, 2990],
    specs: [options('組合', '單入', '3入組')],
  },
  food: {
    brands: ['義美', '統一', '金車 伯朗', '桂格'],
    nouns: ['厚燒海苔 12包', '三合一咖啡 48入', '無糖氣泡水 24瓶', '鮮蝦泡麵 箱購'],
    priceRange: [199, 1290],
    specs: [options('組合', '1箱', '2箱')],
  },
  fresh: {
    brands: ['台灣好農', '鮮食家', '漁季', '舞鶴'],
    nouns: ['日本富士蘋果 12入', '智利鮭魚切片 10片', '澎湖野生白蝦 1kg', '台灣溫體梅花肉片'],
    priceRange: [399, 2490],
    specs: [options('規格', '1盒', '2盒')],
  },
  women: {
    brands: ['Lativ', 'NET', 'Queen Shop', 'MA-1'],
    nouns: ['刷毛連帽外套', '高腰直筒牛仔褲', '軟糯針織毛衣', '輕量羽絨背心'],
    priceRange: [299, 2490],
    specs: [colors('米白', '黑色', '酒紅'), options('尺寸', 'S', 'M', 'L')],
  },
  men: {
    brands: ['Lativ', 'NET', 'Hang Ten', 'Champion'],
    nouns: ['機能防風外套', '刷毛長袖 Polo', '彈性休閒褲', '保暖發熱衣'],
    priceRange: [299, 2990],
    specs: [colors('深藍', '黑色', '卡其'), options('尺寸', 'M', 'L', 'XL')],
  },
  beauty: {
    brands: ['寶拉珍選', '蘭蔻', '理膚寶水', '肌研'],
    nouns: ['2%水楊酸精華液', '超進化肌因賦活露 50ml', 'B5 全面修復霜', '極潤保濕化粧水'],
    priceRange: [350, 4990],
    specs: [options('容量', '標準', '加大')],
  },
  daily: {
    brands: ['舒潔', '幫寶適', '好奇', '白鴿'],
    nouns: [
      '抽取式衛生紙 100抽x60包',
      '一級幫 黏貼型尿布 箱購',
      '洗衣精補充包 6入',
      '純水濕紙巾 80抽x12包',
    ],
    priceRange: [199, 1690],
    specs: [options('組合', '1箱', '2箱')],
  },
};

export const PRODUCTS_PER_CATEGORY = 5;
const BASE_DATE = Date.UTC(2026, 10, 1);
const DAY_MS = 86_400_000;

/** Prices end in 0 or 9, like most real listings. */
const roundPrice = (value: number, random: Random): number =>
  Math.max(9, Math.round(value / 10) * 10 - (random.chance(0.6) ? 1 : 0));

function createTags(random: Random): ProductTag[] {
  const tags: ProductTag[] = [];
  if (random.chance(0.5)) tags.push({ type: 'coupon', label: '折價券' });
  if (random.chance(0.5)) tags.push({ type: 'mo-coin', label: `mo幣${random.int(1, 10)}%回饋` });
  if (random.chance(0.6)) tags.push({ type: 'fast-delivery', label: '快速到貨' });
  if (random.chance(0.3)) tags.push({ type: 'free-shipping', label: '免運' });
  if (random.chance(0.2)) tags.push({ type: 'limited', label: '限時搶購' });
  return tags;
}

export function generateProducts(seed = 20261118): Product[] {
  const random = createRandom(seed);

  return CATEGORY_FIXTURES.flatMap((category) => {
    const template = TEMPLATES[category.id];

    return Array.from({ length: PRODUCTS_PER_CATEGORY }, (_, index): Product => {
      const brand = random.pick(template.brands);
      const noun = template.nouns[index % template.nouns.length];
      const [min, max] = template.priceRange;
      const price = roundPrice(min + random.next() * (max - min), random);
      const discounted = random.chance(0.65);
      const name = `${brand} ${noun}`;

      return {
        id: `${category.id}-${String(index + 1).padStart(3, '0')}`,
        name,
        brand,
        categoryId: category.id,
        price,
        originalPrice: discounted ? roundPrice(price * (1.1 + random.next() * 0.5), random) : null,
        images: ['主圖', '細節', '情境'].map((sublabel, variant) =>
          placeholderImage({
            label: noun,
            sublabel: `${brand}・${sublabel}`,
            hue: category.hue,
            variant,
          }),
        ),
        tags: createTags(random),
        specs: template.specs,
        rating: Math.round((3.8 + random.next() * 1.2) * 10) / 10,
        reviewCount: random.int(0, 3200),
        soldCount: random.int(10, 25000),
        description: `${name}，${category.name}熱銷商品。台灣公司貨，享原廠保固，momo 快速到貨。`,
        createdAt: new Date(BASE_DATE - random.int(0, 90) * DAY_MS).toISOString().slice(0, 10),
      };
    });
  });
}

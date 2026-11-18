import { AppLink, Banner, HomeSection, Product, PromoTile } from '../../app/data-access/models';
import { placeholderImage } from '../placeholder';

const search = (keyword: string): AppLink => ({ commands: ['/search'], queryParams: { keyword } });
const category = (categoryId: string): AppLink => ({
  commands: ['/search'],
  queryParams: { categoryId },
});

const banner = (
  id: string,
  title: string,
  subtitle: string,
  hue: number,
  link: AppLink,
): Banner => ({
  id,
  title,
  subtitle,
  link,
  image: placeholderImage({ label: title, sublabel: subtitle, hue, width: 660, height: 860 }),
});

const tile = (
  id: string,
  title: string,
  caption: string,
  hue: number,
  link: AppLink,
): PromoTile => ({
  id,
  title,
  caption,
  link,
  image: placeholderImage({ label: title, hue, width: 240, height: 240 }),
});

/** Home page layout as a CMS would deliver it. Copy mirrors the real site's campaigns. See ADR 0004. */
export function buildHomeLayout(products: readonly Product[]): HomeSection[] {
  const idsWhere = (predicate: (product: Product) => boolean, limit = 10): string[] =>
    products
      .filter(predicate)
      .slice(0, limit)
      .map((product) => product.id);

  const bestSellers = [...products]
    .sort((a, b) => b.soldCount - a.soldCount)
    .slice(0, 10)
    .map((product) => product.id);

  return [
    {
      type: 'hero-carousel',
      id: 'hero',
      banners: [
        banner('b1', 'SAMSUNG 超級品牌日', '最高回饋27%・11.19 限定', 0, search('Samsung')),
        banner(
          'b2',
          'Ultra 開放式耳機 第二代',
          '全新劇院模式・11/18 開賣',
          330,
          search('開放式耳機'),
        ),
        banner('b3', 'moPro 會員專屬', '歐都納保暖外套 專屬價 $990', 345, category('men')),
        banner('b4', '秋末採買季', '超取 $290 免運', 30, search('衛生紙')),
        banner('b5', '全站加碼送', '最高送 $900 mo幣', 320, search('洗衣機')),
      ],
      todayBrand: {
        title: '今日大牌',
        tiles: [
          tile('t1', '影音日', '回饋28%', 220, category('accessory')),
          tile('t2', '文具玩具日', '最高折200', 50, category('daily')),
          tile('t3', '義美生醫', '滿額贈11%', 140, search('義美')),
          tile('t4', '寶拉珍選', '最高折1111', 345, search('寶拉珍選')),
        ],
      },
    },
    {
      type: 'quick-entry',
      id: 'quick-entry',
      items: [
        tile('q1', '日用婦幼', '抽iPhone', 50, category('daily')),
        tile('q2', '休閒旅遊', '銅板價', 190, search('行動電源')),
        tile('q3', '家電集購', '早鳥下殺', 205, category('appliance')),
        tile('q4', '時尚穿搭', '一日特談', 330, category('women')),
        tile('q5', '家居生活', '下殺68折', 30, search('吸塵器')),
        tile('q6', '3C達人', '回饋24%', 175, category('accessory')),
        tile('q7', '熱銷美食', '抽年菜組', 100, category('fresh')),
        tile('q8', '美妝保養', '飆低3折up', 345, category('beauty')),
      ],
    },
    {
      type: 'product-rail',
      id: 'flash-sale',
      title: '限時搶購',
      productIds: idsWhere((product) => product.tags.some((tag) => tag.type === 'limited')),
      moreLink: search(''),
    },
    {
      type: 'promo-banner',
      id: 'today-only',
      title: '今日限定 全站加碼 $900',
      subtitle: 'moPro 好運轉轉樂 抽 388 點',
      image: placeholderImage({
        label: '今日限定 全站加碼',
        sublabel: '好運轉轉樂',
        hue: 320,
        width: 1200,
        height: 240,
      }),
      link: search(''),
    },
    {
      type: 'product-rail',
      id: 'best-sellers',
      title: '熱銷排行',
      productIds: bestSellers,
    },
    {
      type: 'product-rail',
      id: 'appliance-picks',
      title: '家電推薦',
      productIds: idsWhere((product) => product.categoryId === 'appliance'),
      moreLink: category('appliance'),
    },
    {
      type: 'product-rail',
      id: 'beauty-picks',
      title: '美妝保養',
      productIds: idsWhere((product) => product.categoryId === 'beauty'),
      moreLink: category('beauty'),
    },
    {
      type: 'product-feed',
      id: 'for-you',
      title: '為你推薦',
      pageSize: 10,
      autoLoadPerRound: 2,
    },
  ];
}

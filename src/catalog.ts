import type { CopyKey } from './i18n'

const productImages = import.meta.glob('./assets/products/*', { eager: true, query: '?url', import: 'default' }) as Record<string, string>

export type CatalogProduct = {
  id: number
  category: CopyKey
  zh: string
  en: string
  price: number
  stock: number
  image: string
  sourceImage: string
}

const image = (filename: string) => productImages[`./assets/products/${filename}`]

// Product names, prices, categories, and source links are transcribed from the supplied table.
export const standardProducts: CatalogProduct[] = [
  { id: 1, category: 'snacks', zh: "MAMEE 媽咪面", en: "MAMEE Monster Noodles", price: 5, stock: 10, image: image('01.jpg'), sourceImage: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTrmbzbsLJB1ZBqhibGYZ3FxYmz9EtAr9SCZ6UVHCT_eA&s=10" },
  { id: 2, category: 'snacks', zh: "日清合味道大杯麵條（海鮮味）", en: "Nissin big cup noodles (Seafood flavour)", price: 10, stock: 10, image: image('02.jpg'), sourceImage: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSK0oJZOXAhZgXJCR_UWLCx_PWXnPRQ0yyHRkwEibM8Ug&s=10" },
  { id: 3, category: 'snacks', zh: "Jack 'n Jill 牛肉味脆片", en: "Jack 'n Jill Beef Flavor Crisps", price: 5, stock: 10, image: image('03.jpg'), sourceImage: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSa3TWET_ry_M5UaKPIUBwSzRmaFPYwW1NE-1Me82ctNA&s=10" },
  { id: 4, category: 'snacks', zh: "Roller Coaster 圈圈薯片", en: "Roller Coaster Ring Potato Chips", price: 6, stock: 10, image: image('04.jpg'), sourceImage: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQG_sLvMZGQpeYmO53xNO9U0PdgnF_gUaFVfBGx0bxWow&s" },
  { id: 5, category: 'snacks', zh: "Lay's 樂事酸忌廉洋葱味薯片", en: "Lay's Sour Cream & Onion Potato Chips", price: 8, stock: 10, image: image('05.jpg'), sourceImage: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTNr7UORk7V_Un5MWir_Ze2njaf1oUZYk_B5Dwupl_TPg&s=10" },
  { id: 6, category: 'snacks', zh: "Calbee 卡樂比薯片", en: "Calbee Potato Chips", price: 8, stock: 10, image: image('06.jpg'), sourceImage: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRPqpsI2PDqWlQqPwPxqK0pyUpK2FklRM0i7SD_J29vDg&s=10" },
  { id: 7, category: 'snacks', zh: "Oreo 奧利奧餅乾", en: "Oreo Cookies", price: 7, stock: 10, image: image('07.jpg'), sourceImage: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRxJAztFyyZPbRbSjPPGLKdYXoFO2PTD_da6aLzUef3hg&s=10" },
  { id: 8, category: 'snacks', zh: "Maltesers 麥提莎巧克力", en: "Maltesers Chocolate", price: 10, stock: 10, image: image('08.jpg'), sourceImage: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTEq7a1IXMN6a332i_D1ZAJnKrm1ZFbEK4CSjQDOcl2Cw&s=10" },
  { id: 9, category: 'snacks', zh: "Pocky 百奇餅乾棒", en: "Pocky Biscuit Sticks", price: 7, stock: 10, image: image('09.jpg'), sourceImage: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQ8Cps1M3zPBuBBq0U6fpi8k4Xi58R6aJpzW7OJ6RYCNPiOHv7qSOGAYaE&s=10" },
  { id: 10, category: 'snacks', zh: "Pretz 百力滋餅乾棒", en: "Pretz Biscuit Sticks", price: 6, stock: 10, image: image('10.jpg'), sourceImage: "https://medias.pns.hk/publishing/PNSHK-103131-front-zoom.jpg?version=1732701694" },
  { id: 11, category: 'snacks', zh: "利賓納黑加侖子軟糖", en: "Blackcurrant pastilles", price: 8, stock: 10, image: image('11.jpg'), sourceImage: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQpTYrcBqaSF5eVwb0Py7dWcggU8pX2arkwdyqEtU47Rg&s=10" },
  { id: 12, category: 'snacks', zh: "Hi-Chew 果汁軟糖", en: "Hi-Chew Fruit Chews", price: 6, stock: 10, image: image('12.jpg'), sourceImage: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTOLipSC4DUVZt4lliwv_ovOVgcaef67TTsCck2yJjP5A&s=10" },
  { id: 13, category: 'snacks', zh: "森永碎朱古力曲奇", en: "Morinaga Chocochips Cookie", price: 15, stock: 10, image: image('13.jpg'), sourceImage: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRwFEbmZKjZZVOjyezPG_QVClSeddAIHQZK0hsIq7kaOw&s=10" },
  { id: 14, category: 'snacks', zh: "Pepero 巧克力餅乾棒", en: "Pepero Chocolate Biscuit Sticks", price: 8, stock: 10, image: image('14.jpg'), sourceImage: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRVHVvou5LG0Qlt5aGPkooZ-GBb332z34maI9mSPfhqhQ&s=10" },
  { id: 15, category: 'snacks', zh: "Pringles 品客薯片", en: "Pringles Potato Chips", price: 10, stock: 10, image: image('15.jpg'), sourceImage: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRIDXRigJccH83b8cs3i2V5Q8VNx_uww0yU7193u6RpeA&s=10" },
  { id: 16, category: 'snacks', zh: "Doritos 多力多滋玉米片", en: "Doritos Tortilla Chips", price: 8, stock: 10, image: image('16.avif'), sourceImage: "https://www.costco.com.tw/medias/sys_master/images/h8e/h6c/69511255556126.jpg" },
  { id: 17, category: 'snacks', zh: "旺旺系列零食", en: "Want Want Series Snacks", price: 6, stock: 10, image: image('17.jpg'), sourceImage: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTxLLI8JBBfGbcw1l5l1Mclu8JXy7G8PjtNhiBsKBWqWA&s=10" },
  { id: 18, category: 'drinks', zh: "Coca-Cola 可口可樂原味", en: "Coca-Cola Original", price: 6, stock: 10, image: image('18.jpg'), sourceImage: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcS5VMdYDQCms2bCY0pNVyuX5iGzCeKPw6m4chuJ1h_cVw&s" },
  { id: 19, category: 'drinks', zh: "Coca-Cola Coke Zero 零度可樂", en: "Coca-Cola Coke Zero", price: 6, stock: 10, image: image('19.jpg'), sourceImage: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRjGzbCH24k72WNmv_XfWEG430OSPXAxdYZ8S3bXmF0SNUTFlCfdVog2z4f&s=10" },
  { id: 20, category: 'drinks', zh: "玉泉忌廉梳打檸檬汽水", en: "Schweppes Cream Soda (Lemon)", price: 11, stock: 10, image: image('20.jpg'), sourceImage: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTgLfgOtNsK6AM1WxMGOFNFtjL2toYm2YsnE7z8KmVcbA&s=10" },
  { id: 21, category: 'drinks', zh: "Monster 魔爪能量饮料", en: "Monster Energy Drink", price: 7, stock: 10, image: image('21.jpg'), sourceImage: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQxqsGHxQfNtOQHXoc0fwn9mmyd_MHV2d81MEE67F4UcA&s=10" },
  { id: 22, category: 'drinks', zh: "Nescafé 雀巢罐装咖啡", en: "Nescafé Canned Coffee", price: 7, stock: 10, image: image('22.jpg'), sourceImage: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcR11KE7aKd5Il8UmVyRWcn73UUpinFvw101iyPuoR011g&s=10" },
  { id: 23, category: 'drinks', zh: "Minute Maid 果粒橙", en: "Minute Maid Orange Juice", price: 7, stock: 10, image: image('23.jpg'), sourceImage: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcR3O2cQvp1_yjzlmRjAlhtbMZmPJ24Q2vX70x2oo1J6zQ&s=10" },
  { id: 24, category: 'drinks', zh: "Minute Maid 蘆薈粒青提", en: "Minute Maid White Grape Juice Drink", price: 7, stock: 10, image: image('24.jpg'), sourceImage: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTv1hlSyxBRi6j_oarhmeBhyBHO5HpnrFIwa7DxWGDVoA&s=10" },
  { id: 25, category: 'drinks', zh: "IF椰子水", en: "IF Coconut Water", price: 9, stock: 10, image: image('25.jpg'), sourceImage: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTuAW7YdbO78oqY3ZiroRk_l_xyTbk0p7sVElxbSv8bjA&s=10" },
  { id: 26, category: 'drinks', zh: "阿華田", en: "Ovaltine", price: 6, stock: 10, image: image('26.jpg'), sourceImage: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQCpz7CnVV9CMbp_oEiGG4LaEcyjqziRL8rBY8O2TWQwA&s=10" },
  { id: 27, category: 'drinks', zh: "維他朱古力奶", en: "Vita Chocolate Milk", price: 6, stock: 10, image: image('27.png'), sourceImage: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQjEUTSO9WMaWHgAmGThhsmTqXxHJIdu2CkftK6wN1r7Q&s=10" },
  { id: 28, category: 'drinks', zh: "維他檸檬茶", en: "Vita Lemon Tea", price: 6, stock: 10, image: image('28.jpg'), sourceImage: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQUgZLhHoTXffXMskPe1CFyVqZupkKpIATN0yidARvcqA&s=10" },
  { id: 29, category: 'drinks', zh: "維他奶豆奶", en: "Vita Soy Milk", price: 6, stock: 10, image: image('29.png'), sourceImage: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTiaBzR1lvuKYV_eO1qbOBLwHeWUuiqpVGv8kqVFUzI5A&s=10" },
  { id: 30, category: 'drinks', zh: "維他茉莉花茶", en: "Vita Jasmine Green Tea", price: 6, stock: 10, image: image('30.jpg'), sourceImage: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRh41EFJ-aQ1NWz72oo1eM8tCxDSGhrn01qtzitm23q7A&s=10" },
  { id: 31, category: 'drinks', zh: "維他冷泡無糖茉莉香片茶支裝", en: "Vita Cold Brew No Sugar Jasmine Tea Bottle Drink", price: 9, stock: 10, image: image('31.jpg'), sourceImage: "https://img.rtacdn-os.com/20260907/9650765f-9edd-3a9e-8c65-63ff86cae0b9" },
  { id: 32, category: 'drinks', zh: "道地蜂蜜綠茶", en: "Tao Ti Honey Green Tea", price: 8, stock: 10, image: image('32.jpg'), sourceImage: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcS6nwX9n_LKNlPXKqId5F3x1GECVUzDVcgUM7-CRuCgJA&s=10" },
  { id: 33, category: 'drinks', zh: "奧地利紅牛", en: "Red Bull", price: 15, stock: 10, image: image('33.jpg'), sourceImage: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSxrlH5Z9QuZpNopDLZpTRNpbrf1t7Hb45hgzuKMEJlRg&s=10" },
  { id: 34, category: 'drinks', zh: "魔爪超越幻紫", en: "Monster Ultra Violet", price: 5, stock: 10, image: image('34.jpg'), sourceImage: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSuiGdyJii_uAT9oV-ZCAtRxJCzmvjUX8wFXkVipzaZ0w&s=10" },
  { id: 35, category: 'stationery', zh: "白板筆", en: "Whiteboard Marker", price: 8, stock: 10, image: image('35.jpg'), sourceImage: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQ_jpGRduJsW9XES4ePIiRhFmIxBYAqETw2_XPhvuyoBA&s=10" },
  { id: 36, category: 'stationery', zh: "普通圓珠筆", en: "Standard Ballpoint Pen", price: 3, stock: 10, image: image('36.jpg'), sourceImage: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcR04VrueJHNiGxj-BxFp7STMTXsjnFD02V9jHcinzdXUg&s=10" },
  { id: 37, category: 'stationery', zh: "Pilot原子筆", en: "Pilot Ball Pen", price: 5, stock: 10, image: image('37.jpg'), sourceImage: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTaKnH4eYlJ-NjTfZvIG44HGhka-7lfIxavGowQ_dStWg&s=10" },
  { id: 38, category: 'stationery', zh: "Pentel 修正筆", en: "Pentel Correction Pen", price: 12, stock: 10, image: image('38.jpg'), sourceImage: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTZJhmZss-IuYnrFSAtMKNV1qTFQOGYx3HRS1KXCw7qXw&s=10" },
  { id: 39, category: 'stationery', zh: "得力固体膠", en: "Deli Solid Glue", price: 4, stock: 10, image: image('39.jpg'), sourceImage: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQXEe6EsoTNFed124YWeP9LbHkXHEcod_lK_S98pPvzhA&s=10" },
  { id: 40, category: 'stationery', zh: "UNI 0.5 2B 自動鉛筆芯", en: "UNI 0.5 2B Mechanical Pencil Lead", price: 8, stock: 10, image: image('40.jpg'), sourceImage: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSbU-Q1G6ALAQ6qL5cMfBqZwcSd6w-XycedMOukmtD_wA&s" },
  { id: 41, category: 'stationery', zh: "PLUS 修正帶", en: "PLUS Correction Tape", price: 7, stock: 10, image: image('41.jpg'), sourceImage: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSCVKDJ8c-g1zXr0R24msbg0lv8c_966MwOv0k5lhpkpQ&s=10" },
  { id: 42, category: 'stationery', zh: "得力直尺", en: "Deli Ruler", price: 5, stock: 10, image: image('42.webp'), sourceImage: "https://img.alicdn.com/imgextra/O1CN01KUdNBr1Pss17KK20G_!!6000000001897-2-yinhe.png_q50.jpg_.webp" },
  { id: 43, category: 'stationery', zh: "單張紙類用品", en: "Loose Paper Stationery", price: 1, stock: 10, image: image('43.webp'), sourceImage: "https://images.shopcdn.co.uk/40/74/4074797d2a60da020e16855ba0b9f41b/512x512/webp/resize" },
  { id: 44, category: 'stationery', zh: "KOKUYO B5 筆記本", en: "KOKUYO B5 Notebook", price: 8, stock: 10, image: image('44.jpg'), sourceImage: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSOR-ASteOBeF5ZcX_6sjf4_o7LZping6bWHpSZTqDBrw&s=10" },
  { id: 45, category: 'stationery', zh: "KOKUYO A5 筆記本", en: "KOKUYO A5 Notebook", price: 6, stock: 10, image: image('45.jpg'), sourceImage: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRoBbDCArL0IslfF6TVCm9re6ulov6JYUEleqiTEBmFSw&s=10" },
  { id: 46, category: 'stationery', zh: "文件紙／透明資料袋", en: "Document Paper / Clear Plastic Pockets", price: 3, stock: 10, image: image('46.jpg'), sourceImage: "https://img.boutirapp.com/1sr3F-YIw1a6nkcT5MNFQdkNUGbHSXylJ7AWSCxik5Tnr5vBEggYobbq6T5Vhp89UIIHSF8ZSwPYU7kgqNEwoN" },
  { id: 47, category: 'stationery', zh: "訂書機", en: "Stapler", price: 12, stock: 10, image: image('47.jpg'), sourceImage: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRzoQ6Pc9ebjFuMrR1UGyqrHSu0sFz6LANSuZoHcOniTQ&s=10" },
  { id: 48, category: 'stationery', zh: "訂書釘", en: "Staples", price: 4, stock: 10, image: image('48.jpg'), sourceImage: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTrVefZsjZCLUAF3eneYclrKkTuFzDYEJarWVjE8BBZ_g&s=10" },
  { id: 49, category: 'stationery', zh: "膠帶", en: "Adhesive Tape", price: 5, stock: 10, image: image('49.jpg'), sourceImage: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcREKzMg1pf43MtpqfgoX718Zt05hZBC6tpOS7U1ML-4nQ&s=10" },
  { id: 50, category: 'stationery', zh: "剪刀", en: "Scissors", price: 10, stock: 10, image: image('50.jpg'), sourceImage: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQwKqn2ddWBwMgB_uKBBdGDkGxqdCFqi7raT7-dGghi5w&s=10" },
  { id: 51, category: 'stationery', zh: "鉛筆及其他書寫工具", en: "Pencils and Other Writing Tools", price: 3, stock: 10, image: image('51.jpg'), sourceImage: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSAamBhJQY5crsx496JgLwGLjxGZoqLUJxuHkgB1JQYnQ&s=10" },
  { id: 52, category: 'iceCream', zh: "雀巢DRUMSTICK 甜筒雲呢拿味", en: "Nestlé Ice Cream Drumstick Cone Vanilla Flavour", price: 15, stock: 10, image: image('52.jpg'), sourceImage: "https://img.rtacdn-os.com/20260715/5d82b368-f0d0-378f-8b60-71d9ca8bce7e" },
  { id: 53, category: 'iceCream', zh: "雀巢 KITKAT 雪糕", en: "Nestlé kit kat ice cream", price: 13, stock: 10, image: image('53.jpg'), sourceImage: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTmEa1FLx3aIqYscLai1SabEL0zUUfZBK66OaUDZ6VA5A&s=10" },
  { id: 54, category: 'iceCream', zh: "Oreo 雪糕條", en: "Oreo Ice Cream Stick", price: 16, stock: 10, image: image('54.jpg'), sourceImage: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQUYhhYEDAji37w4PFRr9oUFarIVmIx24quEPpyF5uRpg&s=10" },
  { id: 55, category: 'iceCream', zh: "Häagen‑Dazs 比利時黑朱古力雪糕批", en: "Dark Belgian Chocolate Ice Cream Bar", price: 40, stock: 10, image: image('55.jpg'), sourceImage: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSxC-apwYM84TEOJ47wjFZky0ZqI-850BzvINZo6F6t5FWp7U1p6bpCHcHG&s=10" },
  { id: 56, category: 'iceCream', zh: "Häagen‑Dazs 意大利芝士蛋糕迷你杯", en: "Häagen-Dazs Tiramisu Ice Cream Mini Cup", price: 39, stock: 10, image: image('56.jpg'), sourceImage: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQeaBi9LzMcMNF-INKjM68KoV-6BJ-6Y-5Rgowj1v-2rA&s=10" },
]

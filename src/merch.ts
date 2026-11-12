import led from './assets/merch/led-stand.jpg'
import tumbler from './assets/merch/tumbler.jpg'
import foldable from './assets/merch/foldable-umbrella.jpg'
import longUmbrella from './assets/merch/long-umbrella.jpg'
import pin from './assets/merch/pin.jpg'
import tote from './assets/merch/tote.jpg'
import cardHolder from './assets/merch/card-holder.jpg'
import certificate from './assets/merch/certificate-holder.jpg'
import navy from './assets/merch/hoodie-navy.jpg'
import green from './assets/merch/hoodie-green.jpg'
import miniBlock from './assets/merch/mini-block-mini.jpg'
import largeBlock from './assets/merch/mini-block-large.jpg'
import handa from './assets/merch/handa-plush.jpg'
import handaGraduation from './assets/merch/handa-graduation.jpg'
import graduateFigures from './assets/merch/graduate-figures.jpg'

export type Merch = {
  id:number; en:string; zh:string; price:number; image?:string; stock:number; detailsEn:string; detailsZh:string; pickupOnly?:boolean; selector?:'style'|'size'
}

export const merchandise: Merch[] = [
  {id:101,en:'HSUHK LED Display Stand',zh:'恒生大學 LED 展示燈',price:200,image:led,stock:3,detailsEn:'Item: 17.8 (L) × 4.5 (W) × 18.7 (H) cm · Package: 22 (L) × 5 (W) × 26.2 (H) cm · Net 295 g · With package 602 g · Power: Type-C cable (included).',detailsZh:'貨品：17.8（長）× 4.5（闊）× 18.7（高）厘米 · 包裝：22（長）× 5（闊）× 26.2（高）厘米 · 淨重 295 克 · 連包裝 602 克 · 電源：Type-C 線（附送）。'},
  {id:102,en:'HSUHK Tumbler',zh:'恒生大學保溫隨行杯',price:120,image:tumbler,stock:6,selector:'style',detailsEn:'Two styles: Chic Style (Left), Preppy Style (Right) · Item: Ø9.5 × 17 (H) cm · Package: 9.5 (L) × 9.5 (W) × 18.5 (H) cm · Capacity 500 ml · Inner SUS 304 stainless steel · With handle.',detailsZh:'兩款款式：時尚款（左）、學院款（右）· 貨品：Ø9.5 × 17（高）厘米 · 包裝：9.5（長）× 9.5（闊）× 18.5（高）厘米 · 容量 500 毫升 · 內層 SUS 304 不鏽鋼 · 附手柄。'},
  {id:103,en:'HSUHK Foldable Umbrella',zh:'恒生大學摺疊雨傘',price:90,image:foldable,stock:8,detailsEn:'Item: 25 (L) cm · Expanded Ø53 cm · 3-folded · Net 180 g.',detailsZh:'貨品：25（長）厘米 · 展開 Ø53 厘米 · 三摺 · 淨重 180 克。'},
  {id:104,en:'HSUHK Long Umbrella',zh:'恒生大學直身雨傘',price:100,image:longUmbrella,stock:4,pickupOnly:true,detailsEn:'Item: 58 (L) cm · Expanded Ø53 cm · Not available for delivery, please purchase at HSUHK.',detailsZh:'貨品：58（長）厘米 · 展開 Ø53 厘米 · 不設送貨，請到訪香港恒生大學購買。'},
  {id:105,en:'HSUHK Pin',zh:'恒生大學徽章',price:25,image:pin,stock:12,detailsEn:'Item: Ø2.5 cm · Package: 4.5 (L) × 4 (W) × 1.9 (H) cm · Net 5 g · With package 14 g.',detailsZh:'貨品：Ø2.5 厘米 · 包裝：4.5（長）× 4（闊）× 1.9（高）厘米 · 淨重 5 克 · 連包裝 14 克。'},
  {id:106,en:'HSUHK Tote Bag (with Bottom)',zh:'恒生大學加闊帆布袋',price:35,image:tote,stock:7,detailsEn:'Tote: 33.5 (H) × 33 (L) × 7.4 (W) cm · Hand strap: 60 (L) × 2.5 (W) cm.',detailsZh:'帆布袋：33.5（高）× 33（長）× 7.4（闊）厘米 · 手挽：60（長）× 2.5（闊）厘米。'},
  {id:107,en:'HSUHK Twofold Card Holder',zh:'恒生大學雙摺卡套',price:100,image:cardHolder,stock:5,detailsEn:'Details to be confirmed.',detailsZh:'產品詳情有待確認。'},
  {id:108,en:'Graduation Certificate Holder',zh:'恒生大學畢業證書套',price:100,image:certificate,stock:5,detailsEn:'Details to be confirmed.',detailsZh:'產品詳情有待確認。'},
  {id:109,en:'HSUHK Zip-Up Hoodie (Navy)',zh:'拉鏈連帽外套（海軍藍）',price:150,image:navy,stock:3,selector:'size',detailsEn:'XS 45 × 57 cm · S 48 × 61 cm · M 52 × 65 cm · L 55 × 67.5 cm · XL 58 × 70.5 cm · Net 400 g.',detailsZh:'XS 45 × 57 厘米 · S 48 × 61 厘米 · M 52 × 65 厘米 · L 55 × 67.5 厘米 · XL 58 × 70.5 厘米 · 淨重 400 克。'},
  {id:110,en:'HSUHK Zip-Up Hoodie (Green)',zh:'拉鏈連帽外套（綠色）',price:150,image:green,stock:3,selector:'size',detailsEn:'XS 45 × 57 cm · S 48 × 61 cm · M 52 × 65 cm · L 55 × 67.5 cm · XL 58 × 70.5 cm · Net 400 g.',detailsZh:'XS 45 × 57 厘米 · S 48 × 61 厘米 · M 52 × 65 厘米 · L 55 × 67.5 厘米 · XL 58 × 70.5 厘米 · 淨重 400 克。'},
  {id:111,en:'HSUHK Campus Mini-Block Model (Mini)',zh:'恒生大學校園積木模型（迷你版）',price:100,image:miniBlock,stock:6,detailsEn:'Item: 9.6 (L) × 5.5 (W) × 7.2 (H) cm · Package: 13 (L) × 4 (W) × 9 (H) cm · Includes building instructions.',detailsZh:'貨品：9.6（長）× 5.5（闊）× 7.2（高）厘米 · 包裝：13（長）× 4（闊）× 9（高）厘米 · 附砌積木說明。'},
  {id:112,en:'HSUHK Campus Mini-Block Model (Large)',zh:'恒生大學校園積木模型（大型版）',price:400,image:largeBlock,stock:2,detailsEn:'Item: 29 (L) × 10.5 (W) × 19.5 (H) cm · Package: 31 (L) × 7 (W) × 22 (H) cm · Includes building instructions.',detailsZh:'貨品：29（長）× 10.5（闊）× 19.5（高）厘米 · 包裝：31（長）× 7（闊）× 22（高）厘米 · 附砌積木說明。'},
  {id:113,en:'Handa Plush Toy',zh:'恒恒毛公仔',price:280,image:handa,stock:3,detailsEn:'Folded: 25 (W) × 30 (H) cm · Clothes with velcro, freely dress on/off.',detailsZh:'摺疊：25（闊）× 30（高）厘米 · 衣服附魔術貼，可自由穿脫。'},
  {id:114,en:'Handa with Graduation Gown',zh:'恒恒畢業毛公仔',price:400,image:handaGraduation,stock:2,detailsEn:'Folded: 25 (W) × 35 (H) cm · Clothes with velcro, freely dress on/off.',detailsZh:'摺疊：25（闊）× 35（高）厘米 · 衣服附魔術貼，可自由穿脫。'},
  {id:115,en:'HSUHK Brick – Graduate Figure',zh:'恒生大學積木模型 – 畢業人偶',price:60,image:graduateFigures,stock:5,detailsEn:'Item: 3 (W) × 4 (H) cm each · Pair of figures with various hairstyles · Package: 9.5 (L) × 2.5 (W) × 11 (H) cm.',detailsZh:'每個貨品：3（闊）× 4（高）厘米 · 一對不同髮型人偶 · 包裝：9.5（長）× 2.5（闊）× 11（高）厘米。'}
]

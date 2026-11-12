import Database from 'better-sqlite3'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const dataDir = path.join(__dirname, 'data')
if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true })

const dbFile = path.join(dataDir, 'app.db')
const isFresh = !fs.existsSync(dbFile)

export const db = new Database(dbFile)
db.pragma('journal_mode = WAL')
db.pragma('foreign_keys = ON')

if (isFresh) {
  console.log('[db] creating fresh database at', dbFile)
  const schema = fs.readFileSync(path.join(__dirname, 'schema.sql'), 'utf8')
  db.exec(schema)
  const seed = fs.readFileSync(path.join(__dirname, 'seed.sql'), 'utf8')
  db.exec(seed)
  console.log('[db] schema + seed applied')
} else {
  console.log('[db] using existing database')
}

// ==========================================
// 1. FORCE INJECT USER (Ensures FK integrity)
// ==========================================
const userCount = db.prepare('SELECT COUNT(*) as count FROM users').get().count
if (userCount === 0) {
  console.log('[db] No users found. Injecting demo user...')
  db.prepare(`
    INSERT INTO users (id, email, username, password_hash, full_name, roles, created_at)
    VALUES ('u_1', 's123456@hsu.edu.hk', 'KC823', '$2b$10$WetMYmMsFDTkAKPg1Jc..ODiKdyHgMCrUL4I3c4RfzbXZIbymI2uq', 'Chan Tai Ming Kevin', '["student","staff","admin"]', ?)
  `).run(new Date().toISOString())
}

// ==========================================
// 2. FORCE INJECT PRODUCTS (Ensures FK integrity)
// ==========================================
const productCount = db.prepare('SELECT COUNT(*) as count FROM products').get().count
if (productCount < 70) {
  console.log('[db] Auto-injecting all 71 products...')
  db.prepare('DELETE FROM products').run()
  
  const standard = [
    { id: 1, cat: 'snacks', en: "MAMEE Monster Noodles", zh: "MAMEE 媽咪面", price: 5 },
    { id: 2, cat: 'snacks', en: "Nissin Big Cup Noodles", zh: "日清合味道大杯麵條", price: 10 },
    { id: 3, cat: 'snacks', en: "Jack 'n Jill Beef Flavor", zh: "Jack 'n Jill 牛肉味脆片", price: 5 },
    { id: 4, cat: 'snacks', en: "Roller Coaster Ring Chips", zh: "Roller Coaster 圈圈薯片", price: 6 },
    { id: 5, cat: 'snacks', en: "Lay's Sour Cream & Onion", zh: "Lay's 樂事酸忌廉洋蔥味薯片", price: 8 },
    { id: 6, cat: 'snacks', en: "Calbee Potato Chips", zh: "Calbee 卡樂比薯片", price: 8 },
    { id: 7, cat: 'snacks', en: "Oreo Cookies", zh: "Oreo 奧利奧餅乾", price: 7 },
    { id: 8, cat: 'snacks', en: "Maltesers Chocolate", zh: "Maltesers 麥提莎巧克力", price: 10 },
    { id: 9, cat: 'snacks', en: "Pocky Biscuit Sticks", zh: "Pocky 百奇餅乾棒", price: 7 },
    { id: 10, cat: 'snacks', en: "Pretz Biscuit Sticks", zh: "Pretz 百力滋餅乾棒", price: 6 },
    { id: 11, cat: 'snacks', en: "Blackcurrant pastilles", zh: "利賓納黑加侖子軟糖", price: 8 },
    { id: 12, cat: 'snacks', en: "Hi-Chew Fruit Chews", zh: "Hi-Chew 果汁軟糖", price: 6 },
    { id: 13, cat: 'snacks', en: "Morinaga Cookie", zh: "森永碎朱古力曲奇", price: 15 },
    { id: 14, cat: 'snacks', en: "Pepero Biscuit Sticks", zh: "Pepero 巧克力餅乾棒", price: 8 },
    { id: 15, cat: 'snacks', en: "Pringles Potato Chips", zh: "Pringles 品客薯片", price: 10 },
    { id: 16, cat: 'snacks', en: "Doritos Tortilla Chips", zh: "Doritos 多力多滋玉米片", price: 8 },
    { id: 17, cat: 'snacks', en: "Want Want Series Snacks", zh: "旺旺系列零食", price: 6 },
    { id: 18, cat: 'drinks', en: "Coca-Cola Original", zh: "Coca-Cola 可口可樂原味", price: 6 },
    { id: 19, cat: 'drinks', en: "Coca-Cola Coke Zero", zh: "Coca-Cola Coke Zero 零度可樂", price: 6 },
    { id: 20, cat: 'drinks', en: "Schweppes Cream Soda", zh: "玉泉忌廉梳打檸檬汽水", price: 11 },
    { id: 21, cat: 'drinks', en: "Monster Energy Drink", zh: "Monster 魔爪能量饮料", price: 7 },
    { id: 22, cat: 'drinks', en: "Nescafé Canned Coffee", zh: "Nescafé 雀巢罐装咖啡", price: 7 },
    { id: 23, cat: 'drinks', en: "Minute Maid Orange Juice", zh: "Minute Maid 果粒橙", price: 7 },
    { id: 24, cat: 'drinks', en: "Minute Maid White Grape", zh: "Minute Maid 蘆薈粒青提", price: 7 },
    { id: 25, cat: 'drinks', en: "IF Coconut Water", zh: "IF椰子水", price: 9 },
    { id: 26, cat: 'drinks', en: "Ovaltine", zh: "阿華田", price: 6 },
    { id: 27, cat: 'drinks', en: "Vita Chocolate Milk", zh: "維他朱古力奶", price: 6 },
    { id: 28, cat: 'drinks', en: "Vita Lemon Tea", zh: "維他檸檬茶", price: 6 },
    { id: 29, cat: 'drinks', en: "Vita Soy Milk", zh: "維他奶豆奶", price: 6 },
    { id: 30, cat: 'drinks', en: "Vita Jasmine Green Tea", zh: "維他茉莉花茶", price: 6 },
    { id: 31, cat: 'drinks', en: "Vita Cold Brew Jasmine Tea", zh: "維他冷泡無糖茉莉香片", price: 9 },
    { id: 32, cat: 'drinks', en: "Tao Ti Honey Green Tea", zh: "道地蜂蜜綠茶", price: 8 },
    { id: 33, cat: 'drinks', en: "Red Bull", zh: "奧地利紅牛", price: 15 },
    { id: 34, cat: 'drinks', en: "Monster Ultra Violet", zh: "魔爪超越幻紫", price: 5 },
    { id: 35, cat: 'stationery', en: "Whiteboard Marker", zh: "白板筆", price: 8 },
    { id: 36, cat: 'stationery', en: "Standard Ballpoint Pen", zh: "普通圓珠筆", price: 3 },
    { id: 37, cat: 'stationery', en: "Pilot Ball Pen", zh: "Pilot原子筆", price: 5 },
    { id: 38, cat: 'stationery', en: "Pentel Correction Pen", zh: "Pentel 修正筆", price: 12 },
    { id: 39, cat: 'stationery', en: "Deli Solid Glue", zh: "得力固体膠", price: 4 },
    { id: 40, cat: 'stationery', en: "UNI 0.5 2B Pencil Lead", zh: "UNI 0.5 2B 自動鉛筆芯", price: 8 },
    { id: 41, cat: 'stationery', en: "PLUS Correction Tape", zh: "PLUS 修正帶", price: 7 },
    { id: 42, cat: 'stationery', en: "Deli Ruler", zh: "得力直尺", price: 5 },
    { id: 43, cat: 'stationery', en: "Loose Paper", zh: "單張紙類用品", price: 1 },
    { id: 44, cat: 'stationery', en: "KOKUYO B5 Notebook", zh: "KOKUYO B5 筆記本", price: 8 },
    { id: 45, cat: 'stationery', en: "KOKUYO A5 Notebook", zh: "KOKUYO A5 筆記本", price: 6 },
    { id: 46, cat: 'stationery', en: "Clear Plastic Pockets", zh: "透明資料袋", price: 3 },
    { id: 47, cat: 'stationery', en: "Stapler", zh: "訂書機", price: 12 },
    { id: 48, cat: 'stationery', en: "Staples", zh: "訂書釘", price: 4 },
    { id: 49, cat: 'stationery', en: "Adhesive Tape", zh: "膠帶", price: 5 },
    { id: 50, cat: 'stationery', en: "Scissors", zh: "剪刀", price: 10 },
    { id: 51, cat: 'stationery', en: "Pencils & Writing Tools", zh: "鉛筆及書寫工具", price: 3 },
    { id: 52, cat: 'iceCream', en: "Nestlé Drumstick Vanilla", zh: "雀巢DRUMSTICK 甜筒雲呢拿味", price: 15 },
    { id: 53, cat: 'iceCream', en: "Nestlé KitKat Ice Cream", zh: "雀巢 KITKAT 雪糕", price: 13 },
    { id: 54, cat: 'iceCream', en: "Oreo Ice Cream Stick", zh: "Oreo 雪糕條", price: 16 },
    { id: 55, cat: 'iceCream', en: "Häagen-Dazs Dark Choc", zh: "Häagen-Dazs 比利時黑朱古力雪糕批", price: 40 },
    { id: 56, cat: 'iceCream', en: "Häagen-Dazs Tiramisu", zh: "Häagen-Dazs 意大利芝士蛋糕迷你杯", price: 39 },
  ]
  
  const merch = [
    { id: 101, en: "HSUHK LED Display Stand", zh: "恒生大學 LED 展示燈", price: 200 },
    { id: 102, en: "HSUHK Tumbler", zh: "恒生大學保溫隨行杯", price: 120 },
    { id: 103, en: "HSUHK Foldable Umbrella", zh: "恒生大學摺疊雨傘", price: 90 },
    { id: 104, en: "HSUHK Long Umbrella", zh: "恒生大學直身雨傘", price: 100 },
    { id: 105, en: "HSUHK Pin", zh: "恒生大學徽章", price: 25 },
    { id: 106, en: "HSUHK Tote Bag", zh: "恒生大學加闊帆布袋", price: 35 },
    { id: 107, en: "HSUHK Twofold Card Holder", zh: "恒生大學雙摺卡套", price: 100 },
    { id: 108, en: "Graduation Certificate Holder", zh: "恒生大學畢業證書套", price: 100 },
    { id: 109, en: "HSUHK Zip-Up Hoodie (Navy)", zh: "拉鏈連帽外套（海軍藍）", price: 150 },
    { id: 110, en: "HSUHK Zip-Up Hoodie (Green)", zh: "拉鏈連帽外套（綠色）", price: 150 },
    { id: 111, en: "HSUHK Campus Mini-Block (Mini)", zh: "恒生大學校園積木模型（迷你版）", price: 100 },
    { id: 112, en: "HSUHK Campus Mini-Block (Large)", zh: "恒生大學校園積木模型（大型版）", price: 400 },
    { id: 113, en: "Handa Plush Toy", zh: "恒恒毛公仔", price: 280 },
    { id: 114, en: "Handa with Graduation Gown", zh: "恒恒畢業毛公仔", price: 400 },
    { id: 115, en: "HSUHK Brick – Graduate Figure", zh: "恒生大學積木模型 – 畢業人偶", price: 60 }
  ]

  const insert = db.prepare('INSERT INTO products (id, category, name_en, name_zh, price, stock, low_stock_threshold, is_merch, is_active, created_at) VALUES (?,?,?,?,?,?,?,?,?,?)')
  for (const p of standard) insert.run(p.id, p.cat, p.en, p.zh, p.price, 10, 4, 0, 1, new Date().toISOString())
  for (const p of merch) insert.run(p.id, 'merchandise', p.en, p.zh, p.price, 5, 4, 1, 1, new Date().toISOString())
  console.log('[db] Injected all 71 products successfully!')
}
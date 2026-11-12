-- Demo user (password: Tuck1234)
INSERT INTO users (
  id, email, username, password_hash, full_name, phone,
  is_hsu_student, programme, year_of_entrance, student_id,
  roles, wallet_balance, loyalty_stamps, avatar_url,
  created_at, last_login
) VALUES (
  'u_1', 's123456@hsu.edu.hk', 'KC823',
  '$2b$10$WetMYmMsFDTkAKPg1Jc..ODiKdyHgMCrUL4I3c4RfzbXZIbymI2uq', -- PLACEHOLDER
  'Chan Tai Ming Kevin', '', 1, 'BA-AC', 2023, 's123456',
  '["student","staff","admin"]', 99999, 7, NULL,
  '2023-09-01T00:00:00Z', NULL
);

INSERT INTO time_slots (id, slot_date, start_time, end_time, location, capacity, booked, enabled) VALUES
  ('s1', date('now'), '10:30', '11:00', 'Lee Quo Wei Academic Building, G/F', 8, 5, 1),
  ('s2', date('now'), '11:00', '11:30', 'Lee Quo Wei Academic Building, G/F', 8, 4, 1),
  ('s3', date('now'), '12:30', '13:00', 'Lee Quo Wei Academic Building, G/F', 8, 6, 1),
  ('s4', date('now'), '13:00', '13:30', 'Lee Quo Wei Academic Building, G/F', 8, 8, 1);

INSERT INTO products (id, category, name_en, name_zh, price, stock, low_stock_threshold, is_merch, is_active, created_at) VALUES
  (1,'snacks','MAMEE Monster Noodles','MAMEE 媽咪面',5,10,4,0,1,datetime('now')),
  (2,'snacks','Nissin Big Cup Noodles','日清合味道大杯麵條',10,10,4,0,1,datetime('now')),
  (3,'snacks','Jack ''n Jill Beef Flavor Crisps','Jack ''n Jill 牛肉味脆片',5,10,4,0,1,datetime('now')),
  (4,'snacks','Roller Coaster Ring Potato Chips','Roller Coaster 圈圈薯片',6,10,4,0,1,datetime('now')),
  (5,'snacks','Lay''s Sour Cream & Onion Potato Chips','Lay''s 樂事酸忌廉洋蔥味薯片',8,10,4,0,1,datetime('now')),
  (6,'snacks','Calbee Potato Chips','Calbee 卡樂比薯片',8,10,4,0,1,datetime('now')),
  (7,'snacks','Oreo Cookies','Oreo 奧利奧餅乾',7,10,4,0,1,datetime('now')),
  (8,'snacks','Maltesers Chocolate','Maltesers 麥提莎巧克力',10,10,4,0,1,datetime('now')),
  (9,'snacks','Pocky Biscuit Sticks','Pocky 百奇餅乾棒',7,10,4,0,1,datetime('now')),
  (10,'snacks','Pretz Biscuit Sticks','Pretz 百力滋餅乾棒',6,10,4,0,1,datetime('now')),
  (18,'drinks','Coca-Cola Original','Coca-Cola 可口可樂原味',6,10,4,0,1,datetime('now')),
  (19,'drinks','Coca-Cola Coke Zero','Coca-Cola Coke Zero 零度可樂',6,10,4,0,1,datetime('now')),
  (20,'drinks','Schweppes Cream Soda','玉泉忌廉梳打檸檬汽水',11,10,4,0,1,datetime('now')),
  (21,'drinks','Monster Energy Drink','Monster 魔爪能量饮料',7,10,4,0,1,datetime('now')),
  (22,'drinks','Nescafé Canned Coffee','Nescafé 雀巢罐装咖啡',7,10,4,0,1,datetime('now')),
  (23,'drinks','Minute Maid Orange Juice','Minute Maid 果粒橙',7,10,4,0,1,datetime('now')),
  (24,'drinks','Minute Maid White Grape Juice','Minute Maid 蘆薈粒青提',7,10,4,0,1,datetime('now')),
  (35,'stationery','Whiteboard Marker','白板筆',8,10,4,0,1,datetime('now')),
  (36,'stationery','Standard Ballpoint Pen','普通圓珠筆',3,10,4,0,1,datetime('now')),
  (52,'iceCream','Nestlé Drumstick Cone Vanilla','雀巢DRUMSTICK 甜筒雲呢拿味',15,10,4,0,1,datetime('now')),
  (53,'iceCream','Nestlé KitKat Ice Cream','雀巢 KITKAT 雪糕',13,10,4,0,1,datetime('now')),
  (54,'iceCream','Oreo Ice Cream Stick','Oreo 雪糕條',16,10,4,0,1,datetime('now')),
  (101,'merchandise','HSUHK LED Display Stand','恒生大學 LED 展示燈',200,3,4,1,1,datetime('now')),
  (102,'merchandise','HSUHK Tumbler','恒生大學保溫隨行杯',120,6,4,1,1,datetime('now')),
  (104,'merchandise','HSUHK Long Umbrella','恒生大學直身雨傘',100,4,4,1,1,datetime('now')),
  (109,'merchandise','HSUHK Zip-Up Hoodie (Navy)','拉鏈連帽外套（海軍藍）',150,3,4,1,1,datetime('now')),
  (115,'merchandise','HSUHK Brick – Graduate Figure','恒生大學積木模型 – 畢業人偶',60,5,4,1,1,datetime('now'));

-- Add some dummy demo orders so the Staff Dashboard isn't empty
INSERT INTO orders (id, user_id, status, payment_method, payment_status, slot_id, slot_time, location, total, pickup_code_hash, created_at) VALUES
  ('#4901','u_1','PAID','HSU Wallet','paid','s1','10:30–11:00','Lee Quo Wei Academic Building, G/F',50, 'hash1', datetime('now')),
  ('#4902','u_1','PREPARING','Octopus','paid','s2','11:00–11:30','Lee Quo Wei Academic Building, G/F',120, 'hash2', datetime('now')),
  ('#4903','u_1','READY','PayMe','paid','s3','12:30–13:00','Lee Quo Wei Academic Building, G/F',30, 'hash3', datetime('now'));

INSERT INTO order_items (order_id, product_id, quantity, unit_price) VALUES
  ('#4901', 1, 2, 5),
  ('#4902', 102, 1, 120),
  ('#4903', 2, 3, 10);


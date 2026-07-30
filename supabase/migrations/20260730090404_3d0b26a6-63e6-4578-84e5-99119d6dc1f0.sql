-- lock down security definer functions
revoke all on function public.handle_new_user() from public, anon, authenticated;
revoke all on function public.notify_order_status() from public, anon, authenticated;
revoke all on function public.set_updated_at() from public, anon, authenticated;
revoke all on function public.has_role(uuid, public.app_role) from public, anon;
revoke all on function public.is_staff(uuid) from public, anon;
grant execute on function public.has_role(uuid, public.app_role) to authenticated;
grant execute on function public.is_staff(uuid) to authenticated;

insert into public.categories (name, slug, emoji, tint, sort_order) values
('Pizza','pizza','🍕','22 90% 60%',0),
('Burger','burger','🍔','38 92% 58%',1),
('Sandwich','sandwich','🥪','84 70% 55%',2),
('Rolls','rolls','🌯','14 85% 60%',3),
('Chinese','chinese','🍜','0 80% 62%',4),
('South Indian','south-indian','🥘','45 90% 58%',5),
('North Indian','north-indian','🍛','28 85% 55%',6),
('Coffee','coffee','☕','26 45% 45%',7),
('Cold Drinks','cold-drinks','🥤','196 85% 55%',8),
('Desserts','desserts','🍮','320 70% 65%',9) on conflict (slug) do nothing;

insert into public.menu_items (name, slug, description, price, category_id, rating, reviews, available, prep_time_mins, emoji, tint, veg, calories, tags, popularity) values
('Margherita Classic','margherita-classic','Hand-stretched base, San Marzano sauce, fresh mozzarella and torn basil, baked at 320°C.',189,(select id from public.categories where slug='pizza'),4.7,412,true,14,'🍕','22 90% 60%',true,720,ARRAY['Bestseller','Stone baked']::text[],96),
('Peri Peri Paneer Pizza','peri-peri-paneer-pizza','Smoked paneer, roasted peppers and a peri peri drizzle on a thin crust.',249,(select id from public.categories where slug='pizza'),4.6,268,true,16,'🍕','12 88% 58%',true,840,ARRAY['Spicy']::text[],88),
('Chicken Tikka Pizza','chicken-tikka-pizza','Tandoori chicken tikka, red onion, coriander and a mint mayo swirl.',289,(select id from public.categories where slug='pizza'),4.8,501,true,18,'🍕','18 85% 55%',false,910,ARRAY['Bestseller']::text[],98),
('Four Cheese Pizza','four-cheese-pizza','Mozzarella, cheddar, parmesan and a blue cheese crumble with honey.',279,(select id from public.categories where slug='pizza'),4.5,187,false,17,'🍕','45 85% 60%',true,980,ARRAY['Rich']::text[],71),
('Garlic Bread Sticks','garlic-bread-sticks','Buttery garlic sticks with herbs, served with jalapeño cheese dip.',119,(select id from public.categories where slug='pizza'),4.4,233,true,9,'🥖','40 80% 60%',true,380,ARRAY['Side']::text[],74),
('Campus Cheeseburger','campus-cheeseburger','Double smashed patty, aged cheddar, pickles and house burger sauce.',199,(select id from public.categories where slug='burger'),4.8,634,true,11,'🍔','38 92% 58%',false,760,ARRAY['Bestseller']::text[],99),
('Crispy Veg Burger','crispy-veg-burger','Golden crumb-fried patty, lettuce, tomato and tangy mayo in a potato bun.',149,(select id from public.categories where slug='burger'),4.5,388,true,10,'🍔','84 70% 55%',true,610,ARRAY['Student favourite']::text[],90),
('Peri Chicken Burger','peri-chicken-burger','Grilled chicken thigh, peri peri glaze, slaw and toasted brioche.',219,(select id from public.categories where slug='burger'),4.7,295,true,13,'🍔','8 85% 58%',false,690,ARRAY['Spicy']::text[],87),
('Loaded Masala Fries','loaded-masala-fries','Crinkle fries tossed in masala, cheese sauce and spring onion.',129,(select id from public.categories where slug='burger'),4.6,421,true,8,'🍟','44 90% 58%',true,520,ARRAY['Side']::text[],92),
('Bombay Grill Sandwich','bombay-grill-sandwich','Layered potato, beetroot and cucumber with chutney, grilled in butter.',109,(select id from public.categories where slug='sandwich'),4.6,302,true,8,'🥪','84 70% 55%',true,430,ARRAY['Quick']::text[],89),
('Corn Cheese Toastie','corn-cheese-toastie','Sweet corn, molten cheese and cracked pepper on sourdough.',129,(select id from public.categories where slug='sandwich'),4.5,214,true,9,'🥪','48 85% 60%',true,470,ARRAY[]::text[],78),
('Chicken Club Sandwich','chicken-club-sandwich','Triple decker with grilled chicken, egg, lettuce and smoky mayo.',179,(select id from public.categories where slug='sandwich'),4.7,256,true,12,'🥪','30 70% 55%',false,640,ARRAY['High protein']::text[],84),
('Paneer Tikka Sub','paneer-tikka-sub','Char-grilled paneer, peppers and mint mayo in a herbed sub roll.',169,(select id from public.categories where slug='sandwich'),4.4,148,true,11,'🥖','20 75% 58%',true,590,ARRAY[]::text[],70),
('Egg Kathi Roll','egg-kathi-roll','Flaky paratha rolled with spiced egg, onions and green chutney.',119,(select id from public.categories where slug='rolls'),4.6,331,true,9,'🌯','14 85% 60%',false,500,ARRAY['Quick']::text[],91),
('Chicken Seekh Roll','chicken-seekh-roll','Charcoal seekh kebab, pickled onion and mint yoghurt wrap.',169,(select id from public.categories where slug='rolls'),4.8,289,true,13,'🌯','6 82% 55%',false,620,ARRAY['Bestseller']::text[],93),
('Aloo Chatpata Roll','aloo-chatpata-roll','Crisp spiced potato, sev and tamarind chutney in a soft roomali.',99,(select id from public.categories where slug='rolls'),4.3,176,true,8,'🌯','36 80% 58%',true,450,ARRAY['Under ₹100']::text[],76),
('Hakka Veg Noodles','hakka-veg-noodles','Wok-tossed noodles with julienne vegetables and a soy garlic finish.',159,(select id from public.categories where slug='chinese'),4.5,402,true,12,'🍜','0 80% 62%',true,610,ARRAY['Wok fresh']::text[],90),
('Chilli Paneer Dry','chilli-paneer-dry','Crisped paneer cubes in a sticky chilli-soy glaze with capsicum.',189,(select id from public.categories where slug='chinese'),4.7,358,true,14,'🍲','10 80% 58%',true,560,ARRAY['Spicy']::text[],92),
('Chicken Fried Rice','chicken-fried-rice','Burnt garlic fried rice with shredded chicken and spring onion.',179,(select id from public.categories where slug='chinese'),4.6,287,true,13,'🍚','40 70% 58%',false,700,ARRAY[]::text[],85),
('Veg Manchow Soup','veg-manchow-soup','Peppery broth with crunchy fried noodles and coriander.',89,(select id from public.categories where slug='chinese'),4.3,142,true,7,'🍲','120 40% 50%',true,220,ARRAY['Light']::text[],64),
('Momos (Steamed)','momos-steamed','Eight hand-pleated momos with fiery schezwan chutney.',129,(select id from public.categories where slug='chinese'),4.8,517,true,11,'🥟','196 60% 55%',true,420,ARRAY['Bestseller']::text[],97),
('Masala Dosa','masala-dosa','Crisp fermented crepe with potato masala, sambar and two chutneys.',119,(select id from public.categories where slug='south-indian'),4.8,688,true,12,'🥘','45 90% 58%',true,480,ARRAY['Bestseller']::text[],99),
('Idli Sambar (3 pcs)','idli-sambar-3-pcs','Steamed rice cakes with lentil sambar and coconut chutney.',79,(select id from public.categories where slug='south-indian'),4.6,421,true,6,'🍚','50 60% 70%',true,260,ARRAY['Under ₹100']::text[],88),
('Medu Vada (2 pcs)','medu-vada-2-pcs','Crisp lentil doughnuts fried to order, served with sambar.',69,(select id from public.categories where slug='south-indian'),4.4,233,true,8,'🍩','38 70% 55%',true,310,ARRAY[]::text[],75),
('Ghee Podi Uttapam','ghee-podi-uttapam','Thick pancake with onion, ghee roasted podi and tomato chutney.',139,(select id from public.categories where slug='south-indian'),4.5,191,true,13,'🥞','30 80% 58%',true,520,ARRAY[]::text[],72),
('Filter Coffee Combo','filter-coffee-combo','Masala dosa with a tumbler of strong degree filter coffee.',159,(select id from public.categories where slug='south-indian'),4.7,209,false,14,'🍽️','26 45% 45%',true,590,ARRAY['Combo']::text[],80),
('Paneer Butter Masala Thali','paneer-butter-masala-thali','Paneer in tomato-cashew gravy, dal, rice, two rotis and salad.',219,(select id from public.categories where slug='north-indian'),4.7,356,true,16,'🍛','28 85% 55%',true,890,ARRAY['Full meal']::text[],94),
('Rajma Chawal','rajma-chawal','Slow-cooked kidney beans with steamed basmati and pickled onion.',149,(select id from public.categories where slug='north-indian'),4.5,271,true,10,'🍚','18 60% 45%',true,640,ARRAY['Comfort']::text[],83),
('Butter Chicken Bowl','butter-chicken-bowl','Tandoori chicken in a silky makhani gravy with jeera rice.',259,(select id from public.categories where slug='north-indian'),4.9,478,true,18,'🍗','12 80% 55%',false,830,ARRAY['Bestseller']::text[],98),
('Chole Bhature','chole-bhature','Spiced chickpeas with two fluffy bhature and onion salad.',139,(select id from public.categories where slug='north-indian'),4.6,394,true,14,'🥘','36 75% 52%',true,780,ARRAY[]::text[],89),
('Cold Brew Black','cold-brew-black','18-hour steeped single origin, poured over clear ice.',129,(select id from public.categories where slug='coffee'),4.7,213,true,4,'☕','26 45% 40%',true,15,ARRAY['Low cal']::text[],86),
('Cappuccino','cappuccino','Double ristretto with velvet microfoam and a cocoa dust finish.',109,(select id from public.categories where slug='coffee'),4.6,340,true,5,'☕','30 40% 50%',true,120,ARRAY[]::text[],91),
('Hazelnut Latte','hazelnut-latte','Espresso, steamed milk and a house hazelnut syrup.',139,(select id from public.categories where slug='coffee'),4.5,187,true,5,'🥛','34 45% 55%',true,210,ARRAY[]::text[],79),
('Masala Chai','masala-chai','Assam CTC brewed with ginger, cardamom and a hit of black pepper.',49,(select id from public.categories where slug='coffee'),4.8,903,true,4,'🍵','35 60% 50%',true,90,ARRAY['Under ₹100','Bestseller']::text[],100),
('Fresh Lime Soda','fresh-lime-soda','Hand-squeezed lime, mint and soda — sweet or salted.',69,(select id from public.categories where slug='cold-drinks'),4.5,265,true,3,'🥤','150 60% 55%',true,80,ARRAY['Under ₹100']::text[],87),
('Cold Coffee Frappe','cold-coffee-frappe','Blended coffee, milk and ice topped with whipped cream.',149,(select id from public.categories where slug='cold-drinks'),4.7,412,true,5,'🥤','28 40% 48%',true,320,ARRAY['Bestseller']::text[],95),
('Mango Lassi','mango-lassi','Alphonso pulp whipped with thick curd and a pinch of cardamom.',119,(select id from public.categories where slug='cold-drinks'),4.6,198,true,4,'🥭','42 90% 58%',true,280,ARRAY['Seasonal']::text[],82),
('Blue Lagoon Cooler','blue-lagoon-cooler','Blue curaçao mocktail with lemon, mint and crushed ice.',99,(select id from public.categories where slug='cold-drinks'),4.3,121,true,4,'🧊','205 90% 60%',true,170,ARRAY[]::text[],68),
('Molten Chocolate Cake','molten-chocolate-cake','Warm cocoa sponge with a flowing 70% chocolate centre.',149,(select id from public.categories where slug='desserts'),4.9,388,true,9,'🍫','20 40% 35%',true,480,ARRAY['Bestseller']::text[],96),
('Gulab Jamun (2 pcs)','gulab-jamun-2-pcs','Khoya dumplings soaked in warm saffron-cardamom syrup.',79,(select id from public.categories where slug='desserts'),4.7,302,true,5,'🍮','30 70% 48%',true,340,ARRAY['Under ₹100']::text[],88),
('Belgian Waffle','belgian-waffle','Crisp waffle with chocolate sauce, banana and vanilla scoop.',169,(select id from public.categories where slug='desserts'),4.6,221,true,10,'🧇','40 80% 58%',true,520,ARRAY[]::text[],81),
('Kulfi Falooda','kulfi-falooda','Malai kulfi, rose syrup, falooda sev and toasted nuts.',129,(select id from public.categories where slug='desserts'),4.5,164,false,7,'🍨','320 70% 65%',true,390,ARRAY[]::text[],73) on conflict (slug) do nothing;

insert into public.inventory_items (name, sku, category, stock, unit, reorder_at, cost_per_unit, supplier) values
('Mozzarella Cheese','DRY-CHZ-001','Dairy',18,'kg',25,420,'Sahyadri Dairy'),
('Chicken Breast','MEA-CHK-004','Meat',26,'kg',30,290,'Coastal Poultry'),
('Paneer Block','DRY-PNR-002','Dairy',12,'kg',20,340,'Sahyadri Dairy'),
('Refined Flour (Maida)','STP-FLR-011','Staples',120,'kg',60,46,'Annapurna Mills'),
('Basmati Rice','STP-RCE-007','Staples',210,'kg',80,92,'Annapurna Mills'),
('Arabica Coffee Beans','BEV-COF-003','Beverage',7,'kg',12,1180,'Baba Budan Roasters'),
('Full Cream Milk','DRY-MLK-005','Dairy',96,'L',60,62,'Sahyadri Dairy'),
('Potatoes','VEG-POT-009','Produce',168,'kg',90,28,'Green Valley Farms'),
('Tomatoes','VEG-TOM-010','Produce',34,'kg',50,44,'Green Valley Farms'),
('Sunflower Oil','STP-OIL-014','Staples',74,'L',40,138,'Annapurna Mills'),
('Burger Buns','BKY-BUN-006','Bakery',240,'pcs',150,12,'Crust & Co.'),
('Dark Chocolate 70%','BKY-CHO-021','Bakery',9,'kg',10,760,'Cocoa Trail'),
('Schezwan Paste','SAU-SZC-017','Sauces',22,'kg',15,210,'Wok Supply Co.'),
('Paper Takeaway Boxes','PKG-BOX-030','Packaging',1450,'pcs',800,6,'EcoPack India'),
('Urad Dal','STP-DAL-012','Staples',41,'kg',25,118,'Annapurna Mills') on conflict (sku) do nothing;

insert into public.coupons (code, description, type, value, min_order, uses, max_uses, expires_at, active) values
('CAMPUS20','20% off for first-year students on all lunch orders','percent',20,200,842,2000,'2026-09-30'::date,true),
('CHAI49','Flat ₹30 off on any beverage combo before 11 AM','flat',30,99,1310,5000,'2026-12-31'::date,true),
('LATENIGHT','15% off on orders placed between 9 PM and midnight','percent',15,150,476,1500,'2026-08-31'::date,true),
('HOSTEL50','Flat ₹50 off on hostel block delivery over ₹400','flat',50,400,289,800,'2026-08-15'::date,true),
('FRESHER10','10% welcome discount for newly registered students','percent',10,0,1922,2000,'2026-07-15'::date,false),
('EXAMFUEL','Flat ₹40 off on coffee + dessert during exam week','flat',40,220,133,1000,'2026-11-20'::date,true) on conflict (code) do nothing;

insert into public.notifications (user_id, title, body, kind) values
(null,'Welcome to CanteenOS','Live ordering, kitchen queue and analytics are now connected to your canteen.','system');
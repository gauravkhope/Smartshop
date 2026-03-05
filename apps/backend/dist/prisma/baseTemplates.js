"use strict";
// apps/backend/prisma/baseTemplates.ts
// Programmatic generator for 200+ base product templates across many categories.
// Each template has: mainCategory, category, name, brand, price, image, description.
Object.defineProperty(exports, "__esModule", { value: true });
function rand(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}
// Utility to build a unique-ish image URL per template
function imageFor(query, idx) {
    // Use Picsum Photos for reliable random images
    const seed = `${query}-${idx}`;
    return `https://picsum.photos/seed/${encodeURIComponent(seed)}/800/800`;
}
// A small helper to create descriptive product name patterns
function makeName(brand, sub, variant) {
    return `${brand} ${sub} ${variant}`;
}
// Master category configuration: subcategories, sample brands, base product titles
const CATS = [
    {
        main: "Fashion & Apparel",
        subs: [
            {
                name: "Women's Clothing",
                brands: ["Zara", "H&M", "Forever21", "Mango", "Shein"],
                titlePatterns: ["Floral Dress", "A-line Skirt", "Silk Blouse", "Maxi Dress", "Cardigan"],
                imageQuery: "women-fashion",
            },
            {
                name: "Men's Clothing",
                brands: ["Levi's", "U.S. Polo", "Tommy Hilfiger", "Jack & Jones", "Allen Solly"],
                titlePatterns: ["Denim Jacket", "Polo Shirt", "Chino Pants", "Bomber Jacket", "Formal Shirt"],
                imageQuery: "men-fashion",
            },
            {
                name: "Children's Clothing",
                brands: ["Carter's", "GAP Kids", "Mothercare", "Mini Klub", "H&M Kids"],
                titlePatterns: ["Baby Romper", "Kids T-Shirt", "Girls Dress", "Boys Shorts", "Pajama Set"],
                imageQuery: "kids-clothing",
            },
            {
                name: "Footwear",
                brands: ["Nike", "Adidas", "Puma", "Skechers", "Reebok"],
                titlePatterns: ["Running Shoes", "Casual Sneakers", "Formal Shoes", "Sports Sandals", "Loafers"],
                imageQuery: "shoes",
            },
            {
                name: "Accessories",
                brands: ["Fossil", "H&M", "Aldo", "Tommy Hilfiger", "Guess"],
                titlePatterns: ["Leather Belt", "Canvas Bag", "Silk Scarf", "Wool Hat", "Sunglasses"],
                imageQuery: "fashion-accessories",
            },
            {
                name: "Jewelry & Watches",
                brands: ["Titan", "Fossil", "Fastrack", "Skagen", "Michael Kors"],
                titlePatterns: ["Quartz Watch", "Gold Plated Necklace", "Diamond Studs", "Bracelet", "Analog Watch"],
                imageQuery: "jewelry",
            },
            {
                name: "Lingerie & Underwear",
                brands: ["Triumph", "Enamor", "H&M", "Calvin Klein", "Zivame"],
                titlePatterns: ["Lace Bra", "Seamless Briefs", "Cotton Panty", "Shapewear", "Thermal Set"],
                imageQuery: "lingerie",
            },
            {
                name: "Sportswear & Activewear",
                brands: ["Nike", "Adidas", "Puma", "Under Armour", "Reebok"],
                titlePatterns: ["Yoga Leggings", "Track Jacket", "Sports Bra", "Gym Shorts", "Compression Tee"],
                imageQuery: "activewear",
            },
        ],
    },
    {
        main: "Electronics & Gadgets",
        subs: [
            {
                name: "Mobile Phones & Accessories",
                brands: ["Apple", "Samsung", "OnePlus", "Xiaomi", "Realme"],
                titlePatterns: ["Smartphone", "Case", "Screen Protector", "Wireless Charger", "Power Bank"],
                imageQuery: "smartphone",
            },
            {
                name: "Laptops & Computers",
                brands: ["Apple", "Dell", "HP", "Lenovo", "Asus"],
                titlePatterns: ["Laptop", "Ultrabook", "Gaming Laptop", "2-in-1", "Chromebook"],
                imageQuery: "laptop",
            },
            {
                name: "Tablets & E-readers",
                brands: ["Apple", "Samsung", "Amazon", "Lenovo", "Huawei"],
                titlePatterns: ["Tablet", "E-reader", "Stylus Bundle", "Kids Tablet", "Foldable Tablet"],
                imageQuery: "tablet",
            },
            {
                name: "Cameras & Photography",
                brands: ["Canon", "Nikon", "Sony", "Fujifilm", "GoPro"],
                titlePatterns: ["DSLR Camera", "Mirrorless Camera", "Action Camera", "Tripod", "Camera Lens"],
                imageQuery: "camera",
            },
            {
                name: "Audio (headphones, speakers)",
                brands: ["Sony", "Bose", "JBL", "Sennheiser", "Boat"],
                titlePatterns: ["Over-Ear Headphones", "Wireless Earbuds", "Soundbar", "Bluetooth Speaker", "Noise Cancelling"],
                imageQuery: "headphones",
            },
            {
                name: "Gaming (consoles, accessories)",
                brands: ["Sony", "Microsoft", "Nintendo", "Logitech", "Razer"],
                titlePatterns: ["Gaming Console", "Controller", "Gaming Headset", "Gaming Chair", "RGB Keyboard"],
                imageQuery: "gaming",
            },
            {
                name: "Smart Home Devices",
                brands: ["Google", "Amazon", "Philips", "Mi", "TP-Link"],
                titlePatterns: ["Smart Bulb", "Smart Speaker", "Smart Plug", "Home Camera", "Smart Hub"],
                imageQuery: "smart-home",
            },
            {
                name: "Wearable Technology",
                brands: ["Apple", "Samsung", "Fitbit", "Garmin", "Noise"],
                titlePatterns: ["Smartwatch", "Fitness Band", "Health Monitor", "GPS Watch", "Smart Glasses"],
                imageQuery: "wearable",
            },
        ],
    },
    {
        main: "Home & Living",
        subs: [
            {
                name: "Furniture",
                brands: ["Ikea", "HomeTown", "Urban Ladder", "Nilkamal", "Godrej Interio"],
                titlePatterns: ["Sofa", "Dining Table", "Bed Frame", "TV Unit", "Office Chair"],
                imageQuery: "furniture",
            },
            {
                name: "Home Décor",
                brands: ["FabIndia", "H&M Home", "The White Teak", "Indiska", "Home Centre"],
                titlePatterns: ["Wall Art", "Vase", "Rug", "Cushion Cover", "Decorative Lamp"],
                imageQuery: "homedecor",
            },
            {
                name: "Kitchen & Dining",
                brands: ["Prestige", "Westinghouse", "Philips", "Kenwood", "Tefal"],
                titlePatterns: ["Cookware Set", "Non-stick Pan", "Coffee Maker", "Kitchen Knife Set", "Dinner Set"],
                imageQuery: "kitchen",
            },
            {
                name: "Bedding & Bath",
                brands: ["Home Centre", "AmazonBasics", "Spaces", "Ddecor", "Bombay Dyeing"],
                titlePatterns: ["Bedsheet Set", "Pillow", "Comforter", "Towel Set", "Mattress Topper"],
                imageQuery: "bedding",
            },
            {
                name: "Lighting",
                brands: ["Philips", "Havells", "Syska", "Wipro", "Philips Hue"],
                titlePatterns: ["Pendant Light", "Table Lamp", "LED Bulb", "Chandelier", "Floor Lamp"],
                imageQuery: "lighting",
            },
            {
                name: "Appliances (large & small)",
                brands: ["Whirlpool", "Samsung", "LG", "IFB", "Bosch"],
                titlePatterns: ["Refrigerator", "Washing Machine", "Microwave Oven", "Air Cooler", "Blender"],
                imageQuery: "appliance",
            },
            {
                name: "Home Improvement & Tools",
                brands: ["Bosch", "Stanley", "Black+Decker", "3M", "Milwaukee"],
                titlePatterns: ["Drill Machine", "Tool Set", "Paint Sprayer", "Safety Gloves", "Measuring Tape"],
                imageQuery: "tools",
            },
            {
                name: "Gardening & Outdoor",
                brands: ["Gardena", "Hozelock", "Bosch", "CGH", "Sun Joe"],
                titlePatterns: ["Garden Hose", "Planter", "Garden Tool Set", "Outdoor Chair", "BBQ Grill"],
                imageQuery: "garden",
            },
        ],
    },
    {
        main: "Beauty & Personal Care",
        subs: [
            {
                name: "Skincare",
                brands: ["Neutrogena", "The Body Shop", "Nivea", "Olay", "Kiehl's"],
                titlePatterns: ["Face Wash", "Moisturizer", "Serum", "Sunscreen", "Sheet Mask"],
                imageQuery: "skincare",
            },
            {
                name: "Makeup",
                brands: ["Maybelline", "L'Oreal", "MAC", "Nykaa", "Colorbar"],
                titlePatterns: ["Lipstick", "Foundation", "Mascara", "Eyeshadow Palette", "Compact Powder"],
                imageQuery: "makeup",
            },
            {
                name: "Hair Care",
                brands: ["L'Oreal", "Dove", "Tresemme", "Sunsilk", "Pantene"],
                titlePatterns: ["Shampoo", "Conditioner", "Hair Oil", "Hair Serum", "Hair Mask"],
                imageQuery: "haircare",
            },
            {
                name: "Fragrances",
                brands: ["Calvin Klein", "Davidoff", "Nivea", "Yardley", "Gucci"],
                titlePatterns: ["Eau de Parfum", "Body Mist", "Aftershave", "Fragrance Set", "Perfume"],
                imageQuery: "perfume",
            },
            {
                name: "Bath & Body",
                brands: ["Dettol", "Dove", "Lux", "Himalaya", "The Body Shop"],
                titlePatterns: ["Body Wash", "Soap", "Bath Salt", "Scrub", "Body Lotion"],
                imageQuery: "bath",
            },
            {
                name: "Men's Grooming",
                brands: ["Gillette", "Beardo", "The Man Company", "Nivea Men", "Philips"],
                titlePatterns: ["Shaving Kit", "Beard Oil", "Trimmer", "Aftershave", "Face Wash"],
                imageQuery: "mens-grooming",
            },
            {
                name: "Health & Wellness Supplements",
                brands: ["HealthKart", "GNC", "Himalaya", "MuscleBlaze", "Amway"],
                titlePatterns: ["Multivitamins", "Protein Powder", "Omega-3", "Probiotics", "Herbal Supplement"],
                imageQuery: "supplements",
            },
        ],
    },
    {
        main: "Health & Wellness",
        subs: [
            {
                name: "Vitamins & Supplements",
                brands: ["GNC", "MuscleBlaze", "HealthKart", "Himalaya", "NOW"],
                titlePatterns: ["Vitamin C", "Protein Powder", "Omega 3", "Multivitamin", "Fiber Supplement"],
                imageQuery: "supplements",
            },
            {
                name: "Fitness Equipment",
                brands: ["Decathlon", "Fitkit", "PowerMax", "ProForm", "Reebok"],
                titlePatterns: ["Treadmill", "Exercise Bike", "Dumbbell Set", "Yoga Mat", "Resistance Bands"],
                imageQuery: "fitness",
            },
            {
                name: "Medical Supplies",
                brands: ["3M", "Dr Trust", "Omron", "Accu-Chek", "Braun"],
                titlePatterns: ["Blood Pressure Monitor", "Glucometer", "Thermometer", "Pulse Oximeter", "First Aid Kit"],
                imageQuery: "medical",
            },
            {
                name: "Personal Care Appliances",
                brands: ["Philips", "Panasonic", "Braun", "Havells", "Philips Norelco"],
                titlePatterns: ["Electric Trimmer", "Hair Dryer", "Electric Toothbrush", "Steam Iron", "Vaporizer"],
                imageQuery: "appliance",
            },
            {
                name: "Yoga & Meditation Products",
                brands: ["Decathlon", "Aurion", "JadeYoga", "Himalayan", "Manduka"],
                titlePatterns: ["Yoga Mat", "Meditation Cushion", "Yoga Blocks", "Strap", "Bolster"],
                imageQuery: "yoga",
            },
        ],
    },
    {
        main: "Food & Grocery",
        subs: [
            {
                name: "Fresh Produce",
                brands: ["LocalFarm", "FreshFarm", "Organic Valley", "Nature's Basket", "FarmFresh"],
                titlePatterns: ["Organic Apples", "Fresh Tomatoes", "Leafy Greens", "Banana Bunch", "Carrots"],
                imageQuery: "fresh-produce",
            },
            {
                name: "Packaged Foods",
                brands: ["Nestle", "Kellogg's", "Pringles", "Haldiram's", "ITC"],
                titlePatterns: ["Breakfast Cereal", "Ready to Eat", "Noodle Pack", "Biscuits", "Sauce Jar"],
                imageQuery: "packaged-food",
            },
            {
                name: "Beverages",
                brands: ["Coca-Cola", "Pepsi", "Red Bull", "Tata Tea", "NESCAFÉ"],
                titlePatterns: ["Cold Drink", "Energy Drink", "Green Tea", "Coffee Beans", "Juice Pack"],
                imageQuery: "beverages",
            },
            {
                name: "Snacks & Confectionery",
                brands: ["Cadbury", "Lays", "Mars", "Kellogg's", "Haldiram's"],
                titlePatterns: ["Chocolate Bar", "Potato Chips", "Cookies", "Candy Pack", "Snack Mix"],
                imageQuery: "snacks",
            },
            {
                name: "Organic & Specialty Foods",
                brands: ["Organic Tattva", "Fabbox", "Annam Organics", "24 Mantra", "Organic India"],
                titlePatterns: ["Organic Rice", "Organic Oil", "Honey Jar", "Quinoa Pack", "Gluten Free Snack"],
                imageQuery: "organic-food",
            },
        ],
    },
    {
        main: "Baby & Kids",
        subs: [
            {
                name: "Baby Clothing",
                brands: ["Carter's", "Mothercare", "Babyhug", "LuvLap", "Tinycare"],
                titlePatterns: ["Baby Romper", "Onesie", "Baby Set", "Sleepsuit", "Cotton Onesie"],
                imageQuery: "baby-clothes",
            },
            {
                name: "Diapering",
                brands: ["Pampers", "Huggies", "MamyPoko", "Libero", "Johnson's"],
                titlePatterns: ["Disposable Diapers", "Cloth Diapers", "Nappy Pants", "Diaper Rash Cream", "Diaper Pack"],
                imageQuery: "diapers",
            },
            {
                name: "Feeding & Nursing",
                brands: ["Philips Avent", "Dr Brown's", "Pigeon", "MeeMee", "Lifebuoy"],
                titlePatterns: ["Feeding Bottle", "Nursing Pillow", "Bottle Sterilizer", "Breast Pump", "High Chair"],
                imageQuery: "baby-feeding",
            },
            {
                name: "Toys & Games",
                brands: ["Fisher-Price", "Lego", "Funskool", "Hasbro", "Mattel"],
                titlePatterns: ["Building Blocks", "Soft Toy", "Puzzle", "Board Game", "Educational Toy"],
                imageQuery: "kids-toys",
            },
            {
                name: "Strollers & Car Seats",
                brands: ["Graco", "Chicco", "LuvLap", "BabyZen", "Evenflo"],
                titlePatterns: ["Stroller", "Car Seat", "Infant Carrier", "Travel System", "Pram"],
                imageQuery: "stroller",
            },
        ],
    },
    {
        main: "Sports & Outdoors",
        subs: [
            {
                name: "Exercise & Fitness",
                brands: ["Decathlon", "Reebok", "Fitkit", "ProForm", "PowerMax"],
                titlePatterns: ["Treadmill", "Dumbbell Set", "Resistance Bands", "Kettlebell", "Exercise Bike"],
                imageQuery: "fitness",
            },
            {
                name: "Camping & Hiking",
                brands: ["Quechua", "Coleman", "Wildcraft", "Himalayan", "Naturehike"],
                titlePatterns: ["Tent", "Sleeping Bag", "Camping Stove", "Backpack", "Hiking Boots"],
                imageQuery: "camping",
            },
            {
                name: "Cycling",
                brands: ["Giant", "Trek", "Btwin", "Hero", "Montra"],
                titlePatterns: ["Mountain Bike", "Cycle Helmet", "Cycling Jersey", "Bike Light", "Repair Kit"],
                imageQuery: "cycling",
            },
            {
                name: "Water Sports",
                brands: ["Speedo", "Decathlon", "Aqua Sphere", "O'Neill", "Quiksilver"],
                titlePatterns: ["Swimwear", "Life Jacket", "Diving Mask", "Snorkeling Kit", "Water Shoes"],
                imageQuery: "water-sports",
            },
            {
                name: "Team Sports",
                brands: ["Nike", "Adidas", "Puma", "SS", "Kookaburra"],
                titlePatterns: ["Cricket Bat", "Football", "Team Jersey", "Batting Gloves", "Shin Guards"],
                imageQuery: "sports-equipment",
            },
        ],
    },
    {
        main: "Automotive",
        subs: [
            {
                name: "Car Accessories",
                brands: ["Bosch", "3M", "Wurth", "Xenon", "Philips"],
                titlePatterns: ["Car Cover", "Seat Cover", "Floor Mat", "Car Vacuum", "Steering Cover"],
                imageQuery: "car-accessories",
            },
            {
                name: "Motorcycle Gear",
                brands: ["Studds", "Royal Enfield", "Bilt", "Alpinestars", "LS2"],
                titlePatterns: ["Helmet", "Riding Jacket", "Gloves", "Tank Bag", "Boots"],
                imageQuery: "motorcycle",
            },
            {
                name: "Auto Parts & Tools",
                brands: ["Bosch", "Mahle", "Bosch", "3M", "Philips"],
                titlePatterns: ["Brake Pads", "Spark Plug", "Oil Filter", "Wiper Blade", "Tool Kit"],
                imageQuery: "auto-parts",
            },
            {
                name: "Tires & Wheels",
                brands: ["MRF", "Michelin", "Bridgestone", "JK Tyre", "Apollo Tyres"],
                titlePatterns: ["All-Terrain Tire", "Alloy Wheel", "Wheel Nut", "Tire Repair Kit", "Wheel Cover"],
                imageQuery: "tires",
            },
            {
                name: "Car Electronics",
                brands: ["Pioneer", "Sony", "JBL", "Kenwood", "Alpine"],
                titlePatterns: ["Car Stereo", "Reverse Camera", "Dash Cam", "Amplifier", "Subwoofer"],
                imageQuery: "car-electronics",
            },
        ],
    },
    {
        main: "Books, Movies & Music",
        subs: [
            {
                name: "Physical Books",
                brands: ["Penguin", "HarperCollins", "Random House", "Rupa", "Bloomsbury"],
                titlePatterns: ["Fiction Novel", "Self Help Book", "Biography", "Cookbook", "Children's Book"],
                imageQuery: "books",
            },
            {
                name: "E-books & Audiobooks",
                brands: ["Audible", "Kindle", "Scribd", "Kobo", "Google Play"],
                titlePatterns: ["Ebook", "Audiobook", "Interactive E-book", "Self-help E-book", "Memoir"],
                imageQuery: "audiobook",
            },
            {
                name: "Movies & TV Shows",
                brands: ["Warner Bros", "Paramount", "Sony", "Disney", "Universal"],
                titlePatterns: ["Blu-ray", "DVD", "Collector's Edition", "Box Set", "Special Edition"],
                imageQuery: "movies",
            },
            {
                name: "Music (CDs, vinyl, instruments)",
                brands: ["Universal", "Sony Music", "Warner", "Gibson", "Yamaha"],
                titlePatterns: ["Vinyl Record", "CD Album", "Acoustic Guitar", "Keyboard", "Microphone"],
                imageQuery: "music",
            },
            {
                name: "Musical Instruments",
                brands: ["Yamaha", "Fender", "Gibson", "Casio", "Roland"],
                titlePatterns: ["Acoustic Guitar", "Keyboard", "Drum Set", "Ukulele", "Microphone"],
                imageQuery: "instruments",
            },
        ],
    },
    {
        main: "Pet Supplies",
        subs: [
            {
                name: "Pet Food",
                brands: ["Pedigree", "Royal Canin", "Drools", "Purina", "Whiskas"],
                titlePatterns: ["Dog Food", "Cat Food", "Puppy Food", "Senior Dog Food", "Wet Food"],
                imageQuery: "pet-food",
            },
            {
                name: "Toys & Accessories",
                brands: ["Kong", "Petstages", "PetSafe", "Frisco", "Chewy"],
                titlePatterns: ["Dog Toy", "Cat Toy", "Chew Toy", "Interactive Toy", "Pet Ball"],
                imageQuery: "pet-toys",
            },
            {
                name: "Grooming",
                brands: ["Himalaya", "Groomers", "Petkin", "Burt's Bees", "Vetericyn"],
                titlePatterns: ["Shampoo", "Brush", "Grooming Kit", "Nail Clippers", "Ear Cleaner"],
                imageQuery: "pet-grooming",
            },
            {
                name: "Beds & Furniture",
                brands: ["K&H", "PetFusion", "AmazonBasics", "Frisco", "MidWest"],
                titlePatterns: ["Pet Bed", "Cat Tree", "Pet Crate", "Pet Sofa", "Elevated Bed"],
                imageQuery: "pet-bed",
            },
            {
                name: "Health & Wellness",
                brands: ["Zoetis", "Vetoquinol", "Bayer", "Frontline", "Heartgard"],
                titlePatterns: ["Flea Treatment", "Pet Vitamins", "Joint Supplement", "Antibiotic Ointment", "Dental Care"],
                imageQuery: "pet-care",
            },
        ],
    },
    {
        main: "Office & Stationery",
        subs: [
            {
                name: "Office Supplies",
                brands: ["Staples", "3M", "Avery", "Camlin", "Dollar Tree"],
                titlePatterns: ["Stapler", "File Organizer", "Paper Ream", "Sticky Notes", "Pens Set"],
                imageQuery: "office-supplies",
            },
            {
                name: "Furniture & Storage",
                brands: ["Ikea", "Featherlite", "Godrej Interio", "Urban Ladder", "Nilkamal"],
                titlePatterns: ["Office Chair", "Desk", "Filing Cabinet", "Wall Shelf", "Storage Box"],
                imageQuery: "office-furniture",
            },
            {
                name: "Printers & Ink",
                brands: ["HP", "Canon", "Epson", "Brother", "Lexmark"],
                titlePatterns: ["Ink Cartridge", "Printer", "Photo Paper", "Printer Drum", "Toner"],
                imageQuery: "printer",
            },
            {
                name: "Art & Craft Supplies",
                brands: ["Camlin", "Faber-Castell", "Staedtler", "Crayola", "Winsor & Newton"],
                titlePatterns: ["Acrylic Paint Set", "Sketchbook", "Watercolor", "Brush Set", "Glue Stick"],
                imageQuery: "art-supplies",
            },
            {
                name: "School Supplies",
                brands: ["Classmate", "Staedtler", "Camlin", "Faber-Castell", "Max"],
                titlePatterns: ["Backpack", "Geometry Box", "Pencil Box", "Notebooks", "Lunch Box"],
                imageQuery: "school-supplies",
            },
        ],
    },
    {
        main: "Jewelry & Accessories (detail)",
        subs: [
            {
                name: "Fine Jewelry",
                brands: ["Tanishq", "CaratLane", "BlueStone", "Malabar Gold", "Kalyan Jewellers"],
                titlePatterns: ["Gold Necklace", "Diamond Ring", "Pearl Earrings", "Silver Bracelet", "Platinum Ring"],
                imageQuery: "fine-jewelry",
            },
            {
                name: "Fashion Jewelry",
                brands: ["Forever21", "Zara", "H&M", "Accessorize", "Claire's"],
                titlePatterns: ["Statement Necklace", "Fashion Earrings", "Charm Bracelet", "Anklet", "Brooch"],
                imageQuery: "fashion-jewelry",
            },
            {
                name: "Sunglasses",
                brands: ["Ray-Ban", "Oakley", "Fastrack", "Prada", "Armani"],
                titlePatterns: ["Aviator Sunglasses", "Polarized Sunglasses", "Round Sunglasses", "Cat Eye Sunglasses", "Sport Sunglasses"],
                imageQuery: "sunglasses",
            },
            {
                name: "Wallets & Bags",
                brands: ["Herschel", "Coach", "Fossil", "Baggit", "Caprese"],
                titlePatterns: ["Leather Wallet", "Backpack", "Crossbody Bag", "Tote Bag", "Clutch"],
                imageQuery: "bags",
            },
            {
                name: "Watches",
                brands: ["Rolex", "Titan", "Fossil", "Casio", "Timex"],
                titlePatterns: ["Luxury Watch", "Chronograph Watch", "Sport Watch", "Digital Watch", "Classic Watch"],
                imageQuery: "watches",
            },
        ],
    },
    {
        main: "Travel & Luggage",
        subs: [
            {
                name: "Suitcases & Bags",
                brands: ["American Tourister", "Samsonite", "VIP", "Skybags", "Wildcraft"],
                titlePatterns: ["Spinner Suitcase", "Trolley Bag", "Duffel Bag", "Carry-on Case", "Travel Set"],
                imageQuery: "luggage",
            },
            {
                name: "Travel Accessories",
                brands: ["Lewis N Clark", "AmazonBasics", "Trtl", "Cabeau", "Eagle Creek"],
                titlePatterns: ["Travel Pillow", "Luggage Lock", "Travel Adapter", "Packing Cubes", "Neck Pillow"],
                imageQuery: "travel-accessories",
            },
            {
                name: "Backpacks",
                brands: ["Wildcraft", "Fjallraven", "Nike", "Adidas", "Puma"],
                titlePatterns: ["Daypack", "Hiking Backpack", "Laptop Backpack", "Hydration Pack", "Travel Backpack"],
                imageQuery: "backpack",
            },
            {
                name: "Outdoor Gear",
                brands: ["Quechua", "Coleman", "Decathlon", "Wildcraft", "The North Face"],
                titlePatterns: ["Sleeping Bag", "Camping Stove", "Hiking Pole", "Trekking Shoes", "Camping Chair"],
                imageQuery: "outdoor-gear",
            },
        ],
    },
    {
        main: "Toys, Hobbies & Collectibles",
        subs: [
            {
                name: "Action Figures",
                brands: ["Hasbro", "Funko", "Mattel", "NECA", "Bandai"],
                titlePatterns: ["Action Figure", "Collectible Figure", "Statue", "Model Figure", "Limited Edition Figure"],
                imageQuery: "action-figures",
            },
            {
                name: "Board Games & Puzzles",
                brands: ["Hasbro", "Spin Master", "Ravensburger", "Mattel", "Asmodee"],
                titlePatterns: ["Board Game", "Puzzle", "Strategy Game", "Card Game", "Family Game"],
                imageQuery: "board-games",
            },
            {
                name: "Collectibles",
                brands: ["Funko", "Sideshow", "Pop Culture", "Local Artisans", "NECA"],
                titlePatterns: ["Collector's Item", "Limited Edition", "Signed Print", "Figurine", "Model Kit"],
                imageQuery: "collectibles",
            },
            {
                name: "Arts & Crafts",
                brands: ["Faber-Castell", "Camlin", "Arteza", "Winsor & Newton", "Canson"],
                titlePatterns: ["Paint Set", "Craft Kit", "Brush Set", "Canvas", "DIY Kit"],
                imageQuery: "arts-crafts",
            },
            {
                name: "Model Kits",
                brands: ["Tamiya", "Revell", "Airfix", "Bandai", "Hasegawa"],
                titlePatterns: ["Model Kit", "Scale Model", "Plastic Kit", "Diecast Model", "Assembly Kit"],
                imageQuery: "model-kits",
            },
        ],
    },
    {
        main: "Gifts & Seasonal",
        subs: [
            {
                name: "Gift Cards",
                brands: ["Amazon", "Flipkart", "Starbucks", "Google Play", "Itunes"],
                titlePatterns: ["Gift Card", "E-Gift Card", "Store Voucher", "Gift Voucher", "Holiday Gift Card"],
                imageQuery: "gift-card",
            },
            {
                name: "Holiday Decorations",
                brands: ["Home Centre", "FabIndia", "Local Crafts", "Ikea", "H&M Home"],
                titlePatterns: ["Christmas Decoration", "Diwali Lights", "Festive Garland", "Ornament", "Holiday Banner"],
                imageQuery: "holiday-decor",
            },
            {
                name: "Personalized Gifts",
                brands: ["PrintVenue", "Personalised", "Happily Unmarried", "Archies", "Fnp"],
                titlePatterns: ["Personalized Mug", "Photo Frame", "Custom T-Shirt", "Engraved Pen", "Custom Canvas"],
                imageQuery: "personalized-gifts",
            },
            {
                name: "Party Supplies",
                brands: ["Party City", "Local Store", "Hobby Lobby", "AmazonBasics", "Home Centre"],
                titlePatterns: ["Party Balloon", "Birthday Banner", "Tableware Set", "Party Hat", "Cake Topper"],
                imageQuery: "party-supplies",
            },
        ],
    },
    {
        main: "Industrial & Scientific",
        subs: [
            {
                name: "Lab Equipment",
                brands: ["Fisher Scientific", "VWR", "Sigma-Aldrich", "Mettler Toledo", "Eppendorf"],
                titlePatterns: ["Micropipette", "Lab Balance", "Centrifuge", "Glassware Set", "Incubator"],
                imageQuery: "lab-equipment",
            },
            {
                name: "Safety Gear",
                brands: ["3M", "Honeywell", "Ansell", "Dupont", "Uvex"],
                titlePatterns: ["Safety Helmet", "Safety Gloves", "Reflective Vest", "Safety Goggles", "Ear Protection"],
                imageQuery: "safety-gear",
            },
            {
                name: "Tools & Hardware",
                brands: ["Bosch", "Stanley", "Black+Decker", "Makita", "Milwaukee"],
                titlePatterns: ["Hammer Drill", "Socket Set", "Wrench Set", "Toolbox", "Screwdriver Set"],
                imageQuery: "tools",
            },
            {
                name: "Janitorial Supplies",
                brands: ["3M", "Rubbermaid", "Clorox", "Ecolab", "Zep"],
                titlePatterns: ["Trash Bags", "Disinfectant", "Mop Set", "Cleaning Chemicals", "Microfiber Cloth"],
                imageQuery: "janitorial",
            },
        ],
    },
    {
        main: "Digital Products",
        subs: [
            {
                name: "Software",
                brands: ["Microsoft", "Adobe", "JetBrains", "Atlassian", "Autodesk"],
                titlePatterns: ["Antivirus Software", "Design Suite", "IDE License", "Project Management Tool", "3D Software"],
                imageQuery: "software",
            },
            {
                name: "Online Courses",
                brands: ["Coursera", "Udemy", "Pluralsight", "edX", "LinkedIn Learning"],
                titlePatterns: ["Online Course", "Certification", "Bootcamp", "Tutorial Pack", "Course Bundle"],
                imageQuery: "online-course",
            },
            {
                name: "E-books",
                brands: ["Penguin", "HarperCollins", "Kindle", "Scribd", "O'Reilly"],
                titlePatterns: ["Ebook", "Guide", "Technical Book", "Fiction Ebook", "Children Ebook"],
                imageQuery: "ebook",
            },
            {
                name: "Stock Photos & Graphics",
                brands: ["Shutterstock", "iStock", "Adobe Stock", "Unsplash", "Pexels"],
                titlePatterns: ["Stock Photo", "Vector Pack", "Icon Set", "Graphic Bundle", "Texture Pack"],
                imageQuery: "stock-photos",
            },
            {
                name: "Music Downloads",
                brands: ["iTunes", "Amazon Music", "Spotify", "Google Play", "Bandcamp"],
                titlePatterns: ["Music Album", "Single Track", "Beat Pack", "Instrumental", "Sample Pack"],
                imageQuery: "music",
            },
        ],
    },
];
// Build templates programmatically using the defined CATS metadata
const baseTemplates = [];
let idx = 1;
for (const cat of CATS) {
    for (const sub of cat.subs) {
        const brandList = sub.brands;
        const patterns = sub.titlePatterns;
        // Create 6-12 templates per subcategory to reach 200+ total across all subs
        const countPerSub = Math.max(6, Math.min(12, Math.ceil(220 / (CATS.reduce((s, c) => s + c.subs.length, 0))))); // approx distribution
        for (let i = 0; i < countPerSub; i++) {
            const brand = brandList[i % brandList.length];
            const pattern = patterns[i % patterns.length];
            const variant = (i % 5) + 1;
            // Price strategy: categories have different baseline ranges; slight randomization
            const basePriceCategory = (() => {
                const main = cat.main.toLowerCase();
                if (main.includes("electronics"))
                    return rand(5000, 150000);
                if (main.includes("fashion") || main.includes("apparel"))
                    return rand(499, 14999);
                if (main.includes("home"))
                    return rand(999, 79999);
                if (main.includes("beauty") || main.includes("health"))
                    return rand(199, 14999);
                if (main.includes("food"))
                    return rand(49, 1999);
                if (main.includes("baby"))
                    return rand(199, 7999);
                if (main.includes("sports"))
                    return rand(499, 49999);
                if (main.includes("automotive"))
                    return rand(299, 49999);
                if (main.includes("books"))
                    return rand(99, 1999);
                if (main.includes("pet"))
                    return rand(199, 9999);
                if (main.includes("office"))
                    return rand(99, 19999);
                if (main.includes("digital"))
                    return rand(199, 49999);
                if (main.includes("gifts"))
                    return rand(99, 9999);
                return rand(199, 29999);
            })();
            const price = Math.round(basePriceCategory * (0.85 + Math.random() * 0.5));
            const name = makeName(brand, pattern, `Model ${variant}`);
            const image = imageFor(sub.imageQuery || sub.name, idx);
            const description = `${name} by ${brand}. ${pattern} designed for ${cat.main}. High quality and value for money.`;
            baseTemplates.push({
                mainCategory: cat.main,
                category: sub.name,
                name,
                brand,
                price,
                image,
                description,
            });
            idx += 1;
        }
    }
}
// ✅ Export final data for seeding
exports.default = baseTemplates;

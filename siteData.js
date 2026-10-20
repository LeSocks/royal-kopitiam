/**
 * ============================================================================
 * ROYAL KOPITIAM (KEDAI KOPITIAM • 东方皇家 • ROYAL ORIENTAL)
 * Central Website Configuration & Complete 61-Item Official Menu Data
 * ============================================================================
 */

window.ROYAL_KOPITIAM_DATA = {
  restaurantInfo: {
    name: "Royal Kopitiam",
    officialTitle: "Kedai Kopitiam Royal Oriental",
    chineseTitle: "东方皇家",
    chinesePinyin: "Dōng Fāng Huáng Jiā",
    tagline: "Classic Kopitiam & Royal Oriental Culinary Craft",
    halalAssurance: "NO PORK • NO LARD",
    establishedNote: "Kedai Kopitiam • Royal Oriental",
    shortStory:
      "Rooted in the warmth of classic kopitiam coffeehouses and Royal Oriental culinary craftsmanship, Royal Kopitiam brings people together over aromatic sock-brewed kopi, golden Kaya Toast, and wok-seared signatures in a breezy, sunlit sanctuary.",
    address: {
      street: "Jl. Boulevard Raya No. 88, Blok RK-01",
      district: "Kelapa Gading / Senopati Area",
      city: "Jakarta, Indonesia",
      postalCode: "14240",
      landmark: "Main Boulevard Corner — Easy Valet & Courtyard Parking",
      googleMapsUrl: "https://maps.google.com/?q=Royal+Kopitiam+Indonesia",
      mapEmbedUrl:
        "https://www.openstreetmap.org/export/embed.html?bbox=106.815%2C-6.235%2C106.845%2C-6.215&layer=mapnik"
    },
    hours: {
      openHour24: 7,
      closeHour24: 22,
      weekdayLabel: "Monday – Friday: 07:00 – 22:00 WIB",
      weekendLabel: "Saturday – Sunday & Holidays: 06:30 – 23:00 WIB",
      breakfastNote: "Morning Kopi & Toast Ritual served from opening until late"
    },
    contact: {
      whatsappNumber: "6281288889999",
      whatsappDisplay: "+62 812-8888-9999",
      instagramHandle: "@royalkopitiam.id",
      instagramUrl: "https://instagram.com/",
      tiktokHandle: "@royalkopitiam",
      email: "hello@royalkopitiam.id"
    }
  },

  menuCategories: [
    {
      id: "all",
      name: "All Menu",
      chinese: "全部菜单",
      rangeLabel: "01 – 61",
      bannerImage: "assets/food/dish-hainan-white.jpg",
      description:
        "Explore all 61 official Royal Oriental dishes, toasts, bamboo dim sum starters, and signature drinks."
    },
    {
      id: "signature",
      name: "Signature Dishes",
      chinese: "招牌名菜",
      rangeLabel: "01 – 06",
      bannerImage: "assets/food/dish-hainan-white.jpg",
      description:
        "Our house signatures — fragrant Nasi Lemak, silky Hainan Chicken Rice, handmade Ban Mee, and crispy Ayam Goreng Kampung."
    },
    {
      id: "nasi-goreng",
      name: "Nasi Goreng",
      chinese: "特色炒饭",
      rangeLabel: "07 – 11",
      bannerImage: "assets/food/dish-nasgor-kampung.jpg",
      description:
        "High-heat wok-fried rice infused with smoky wok hei, aromatic spices, and generous proteins."
    },
    {
      id: "char-kway-teow",
      name: "Char Kway Teow",
      chinese: "炒粿条",
      rangeLabel: "12 – 14",
      bannerImage: "assets/food/dish-ckt-prawn.jpg",
      description:
        "Flat rice noodles seared over roaring flames with dark soy, chives, bean sprouts, and your choice of chicken, beef, or prawn."
    },
    {
      id: "mee-goreng",
      name: "Mee Goreng",
      chinese: "招牌炒面",
      rangeLabel: "15 – 17",
      bannerImage: "assets/food/dish-meegoreng.jpg",
      description:
        "Springy yellow noodles tossed in our savory-sweet house spice paste with crisp greens and kerupuk."
    },
    {
      id: "curry-prata",
      name: "Curry & Prata",
      chinese: "咖喱与印度煎饼",
      rangeLabel: "18 – 20",
      bannerImage: "assets/food/dish-pratha-curry.jpg",
      description:
        "Rich, slow-simmered golden chicken curry paired with flaky layered pratha, fragrant Nasi Lemak, or warm noodles."
    },
    {
      id: "starter",
      name: "Starter",
      chinese: "精选小食与点心",
      rangeLabel: "21 – 35",
      bannerImage: "assets/food/dish-dimsum-siomay-hakau.jpg",
      description:
        "Steamed bamboo dim sum, Har Cheong Gai chicken wings, Lumpia Semarang, flaky pratha, and crispy sharing plates."
    },
    {
      id: "drink",
      name: "Drink",
      chinese: "传统咖啡与特饮",
      rangeLabel: "36 – 50",
      bannerImage: "assets/food/drink-kopi-o-c.jpg",
      description:
        "Traditional sock-brewed Kopi O & Kopi C, frothy Teh Tarik, Yuan Yang, Aren & Pandan Lattes, and refreshing house teas."
    },
    {
      id: "toast",
      name: "Toast",
      chinese: "传统烤面包与半熟蛋",
      rangeLabel: "51 – 56",
      bannerImage: "assets/food/dish-kaya-toast.jpg",
      description:
        "Crisp golden toast layered with house srikaya jam, chilled butter, Milo, peanut butter, or savory tuna mayo, plus soft-boiled eggs."
    },
    {
      id: "dessert",
      name: "Dessert",
      chinese: "精选甜品",
      rangeLabel: "57 – 61",
      bannerImage: "assets/food/dish-taro-grassjelly.jpg",
      description:
        "Velvety Taro Sago, silky Grass Jelly Milk, golden Fried Banana, and classic ice cream scoops."
    }
  ],

  menuItems: [
    // ==================== SIGNATURE DISHES (01 - 06) ====================
    {
      number: "01",
      name: "Nasi Lemak with Fried Chicken Cutlet",
      category: "signature",
      categoryLabel: "Signature Dishes",
      priceK: 40,
      image: "assets/food/dish-01-nasi-lemak-cutlet.jpg",
      hasIndividualPhoto: true,
      badges: ["Signature", "Best Seller"],
      spicy: true,
      description:
        "Fragrant coconut milk rice served with a golden-crispy marinated chicken cutlet, house-made sweet-spicy sambal, crisp cucumber slices, and warm savory broth.",
      pairings: ["36", "38", "51"]
    },
    {
      number: "02",
      name: "Hainan Chicken Rice White Chicken",
      category: "signature",
      categoryLabel: "Signature Dishes",
      priceK: 40,
      image: "assets/food/dish-02-hainan-white-chicken.jpg",
      hasIndividualPhoto: true,
      badges: ["Signature", "Chef's Pick"],
      spicy: false,
      description:
        "Silky poached Hainan white chicken topped with crispy golden garlic bits, served alongside aromatic ginger-poached rice, dark soy chili dip, and clear chicken soup.",
      pairings: ["37", "24", "47"]
    },
    {
      number: "03",
      name: "Hainan Chicken Rice Fried Chicken",
      category: "signature",
      categoryLabel: "Signature Dishes",
      priceK: 42,
      image: "assets/food/dish-03-hainan-fried-chicken.jpg",
      hasIndividualPhoto: true,
      badges: ["Signature", "Best Seller"],
      spicy: false,
      description:
        "Crispy-skinned golden fried chicken cutlet over fragrant Hainan ginger-garlic rice, accompanied by tangy chili sauce and comforting broth.",
      pairings: ["38", "25", "58"]
    },
    {
      number: "04",
      name: "Ban Mee with Chicken Balls (Soup)",
      category: "signature",
      categoryLabel: "Signature Dishes",
      priceK: 42,
      image: "assets/food/dish-04-ban-mee-soup.jpg",
      hasIndividualPhoto: true,
      badges: ["Signature", "Comfort Bowl"],
      spicy: false,
      description:
        "Handmade flat Ban Mee noodles in a rich, slow-simmered broth topped with bouncy chicken meatballs, braised mushrooms, greens, and sliced red chilies.",
      pairings: ["26", "46", "36"]
    },
    {
      number: "05",
      name: "Dry Chilli Oil Ban Mee with Chicken Ball",
      category: "signature",
      categoryLabel: "Signature Dishes",
      priceK: 45,
      image: "assets/food/dish-05-dry-chilli-oil-ban-mee.jpg",
      hasIndividualPhoto: true,
      badges: ["Signature", "Spicy"],
      spicy: true,
      description:
        "Springy Ban Mee noodles tossed dry in our aromatic house-infused roasted chilli oil, savory soy glaze, tender chicken meatballs, and crisp greens.",
      pairings: ["38", "40", "27"]
    },
    {
      number: "06",
      name: "Nasi Ayam Goreng Kampung",
      category: "signature",
      categoryLabel: "Signature Dishes",
      priceK: 55,
      image: "assets/food/dish-06-ayam-goreng-kampung.jpg",
      hasIndividualPhoto: true,
      badges: ["Signature", "Royal Special"],
      spicy: true,
      description:
        "Traditional spice-marinated free-range kampung chicken fried to golden perfection and topped with crunchy rempah crumbs (kremesan), steamed rice, fresh lalapan, and fiery sambal terasi.",
      pairings: ["47", "38", "57"]
    },

    // ==================== NASI GORENG (07 - 11) ====================
    {
      number: "07",
      name: "Nasi Goreng Kampung",
      category: "nasi-goreng",
      categoryLabel: "Nasi Goreng",
      priceK: 35,
      image: "assets/food/dish-07-nasgor-kampung.jpg",
      hasIndividualPhoto: true,
      badges: ["Best Seller", "Wok Hei"],
      spicy: true,
      description:
        "Homestyle kampung fried rice wok-tossed with aromatic shallots, bird's eye chili, long beans, egg, and crisp prawn crackers.",
      pairings: ["36", "47", "21"]
    },
    {
      number: "08",
      name: "Nasi Goreng Singapore",
      category: "nasi-goreng",
      categoryLabel: "Nasi Goreng",
      priceK: 40,
      image: "assets/food/dish-08-nasgor-singapore.jpg",
      hasIndividualPhoto: true,
      badges: ["Wok Hei"],
      spicy: false,
      description:
        "Singapore-style fragrant wok-fried rice with light golden seasoning, tender chicken, egg ribbons, and crisp seasonal vegetables.",
      pairings: ["37", "25", "46"]
    },
    {
      number: "09",
      name: "Nasi Goreng Chicken",
      category: "nasi-goreng",
      categoryLabel: "Nasi Goreng",
      priceK: 37,
      image: "assets/food/dish-09-nasgor-chicken.jpg",
      hasIndividualPhoto: true,
      badges: ["Wok Hei"],
      spicy: false,
      description:
        "Smoky wok-seared fried rice loaded with tender marinated chicken slices, egg, crisp greens, pickled acar, and crackers.",
      pairings: ["38", "22", "44"]
    },
    {
      number: "10",
      name: "Nasi Goreng Beef",
      category: "nasi-goreng",
      categoryLabel: "Nasi Goreng",
      priceK: 42,
      image: "assets/food/dish-10-nasgor-beef.jpg",
      hasIndividualPhoto: true,
      badges: ["Chef's Pick", "Wok Hei"],
      spicy: false,
      description:
        "Rich, savory fried rice seared over high flame with tender sliced beef, caramelized soy, egg, fresh lettuce, and crispy kerupuk.",
      pairings: ["39", "24", "47"]
    },
    {
      number: "11",
      name: "Nasi Goreng Prawn",
      category: "nasi-goreng",
      categoryLabel: "Nasi Goreng",
      priceK: 45,
      image: "assets/food/dish-11-nasgor-prawn.jpg",
      hasIndividualPhoto: true,
      badges: ["Seafood", "Wok Hei"],
      spicy: false,
      description:
        "High-flame wok-fried rice with plump, juicy prawns, garlic, egg, scallions, and crisp crackers.",
      pairings: ["47", "25", "57"]
    },

    // ==================== CHAR KWAY TEOW (12 - 14) ====================
    {
      number: "12",
      name: "Char Kway Teow Chicken",
      category: "char-kway-teow",
      categoryLabel: "Char Kway Teow",
      priceK: 37,
      image: "assets/food/dish-12-ckt-chicken.jpg",
      hasIndividualPhoto: true,
      badges: ["Wok Hei"],
      spicy: false,
      description:
        "Silky flat rice noodles wok-fried at high heat with tender chicken, crunchy bean sprouts, chives, egg, and our signature sweet-savory dark soy glaze.",
      pairings: ["36", "47", "24"]
    },
    {
      number: "13",
      name: "Char Kway Teow Beef",
      category: "char-kway-teow",
      categoryLabel: "Char Kway Teow",
      priceK: 42,
      image: "assets/food/dish-13-ckt-beef.jpg",
      hasIndividualPhoto: true,
      badges: ["Best Seller", "Wok Hei"],
      spicy: false,
      description:
        "Smoky flat kway teow noodles seared with succulent sliced beef, egg, garlic chives, and crisp bean sprouts.",
      pairings: ["38", "26", "48"]
    },
    {
      number: "14",
      name: "Char Kway Teow Prawn",
      category: "char-kway-teow",
      categoryLabel: "Char Kway Teow",
      priceK: 45,
      image: "assets/food/dish-14-ckt-prawn.jpg",
      hasIndividualPhoto: true,
      badges: ["Signature", "Seafood", "Wok Hei"],
      spicy: true,
      description:
        "High-flame Char Kway Teow crowned with plump seared prawns, smoky caramelized dark soy, egg, garlic chives, and bean sprouts.",
      pairings: ["37", "25", "58"]
    },

    // ==================== MEE GORENG (15 - 17) ====================
    {
      number: "15",
      name: "Mee Goreng Chicken",
      category: "mee-goreng",
      categoryLabel: "Mee Goreng",
      priceK: 37,
      image: "assets/food/dish-15-meegoreng-chicken.jpg",
      hasIndividualPhoto: true,
      badges: ["Wok Hei"],
      spicy: false,
      description:
        "Wok-tossed yellow noodles coated in savory house seasoning with tender chicken, egg, greens, pickled acar, and crackers.",
      pairings: ["38", "27", "46"]
    },
    {
      number: "16",
      name: "Mee Goreng Beef",
      category: "mee-goreng",
      categoryLabel: "Mee Goreng",
      priceK: 42,
      image: "assets/food/dish-16-meegoreng-beef.jpg",
      hasIndividualPhoto: true,
      badges: ["Wok Hei"],
      spicy: true,
      description:
        "Full-flavored wok-seared yellow noodles with sliced beef, aromatic spices, crisp vegetables, and prawn crackers.",
      pairings: ["39", "21", "47"]
    },
    {
      number: "17",
      name: "Mee Goreng Prawn",
      category: "mee-goreng",
      categoryLabel: "Mee Goreng",
      priceK: 45,
      image: "assets/food/dish-17-meegoreng-prawn.jpg",
      hasIndividualPhoto: true,
      badges: ["Best Seller", "Seafood"],
      spicy: true,
      description:
        "Springy yellow noodles wok-fried with succulent prawns, savory-spicy house sauce, choy sum, tomatoes, and crackers.",
      pairings: ["47", "25", "57"]
    },

    // ==================== CURRY & PRATA (18 - 20) ====================
    {
      number: "18",
      name: "Nasi Lemak with Chicken Curry",
      category: "curry-prata",
      categoryLabel: "Curry & Prata",
      priceK: 48,
      image: "assets/food/dish-18-nasi-lemak-curry.jpg",
      hasIndividualPhoto: true,
      badges: ["Signature", "Chef's Pick"],
      spicy: true,
      description:
        "Aromatic pandan-coconut Nasi Lemak paired with slow-braised chicken leg & potato curry in rich, velvety coconut rempah gravy.",
      pairings: ["38", "45", "51"]
    },
    {
      number: "19",
      name: "Chicken Curry Noodle",
      category: "curry-prata",
      categoryLabel: "Curry & Prata",
      priceK: 45,
      image: "assets/food/dish-19-chicken-curry-noodle.jpg",
      hasIndividualPhoto: true,
      badges: ["Comfort Bowl", "Spicy"],
      spicy: true,
      description:
        "Warm noodles bathed in our fragrant, creamy golden curry broth with tender bone-in chicken and soft-braised potatoes.",
      pairings: ["46", "47", "26"]
    },
    {
      number: "20",
      name: "Pratha with Chicken Curry",
      category: "curry-prata",
      categoryLabel: "Curry & Prata",
      priceK: 42,
      image: "assets/food/dish-20-pratha-chicken-curry.jpg",
      hasIndividualPhoto: true,
      badges: ["Best Seller"],
      spicy: true,
      description:
        "Flaky, golden-crisp layered roti pratha served hot with a generous bowl of rich house chicken curry and sambal on the side.",
      pairings: ["38", "37", "40"]
    },

    // ==================== STARTER (21 - 35) ====================
    {
      number: "21",
      name: "Har Cheong Gai Chicken Wings",
      category: "starter",
      categoryLabel: "Starter",
      priceK: 35,
      image: "assets/food/dish-21-har-cheong-gai.jpg",
      hasIndividualPhoto: true,
      badges: ["Best Seller", "Crispy"],
      spicy: false,
      description:
        "Signature fermented prawn-paste chicken wings fried to an ultra-shattering golden crunch while staying juicy inside.",
      pairings: ["02", "14", "47"]
    },
    {
      number: "22",
      name: "Fried Spring Roll",
      category: "starter",
      categoryLabel: "Starter",
      priceK: 35,
      image: "assets/food/dish-22-fried-spring-roll.jpg",
      hasIndividualPhoto: true,
      badges: ["Crispy"],
      spicy: false,
      description:
        "Golden-crisp Oriental spring rolls stuffed with seasoned vegetables and chicken, served with sweet-tangy dipping sauce.",
      pairings: ["04", "38", "46"]
    },
    {
      number: "23",
      name: "Cakwe with Ice Cream",
      category: "starter",
      categoryLabel: "Starter",
      priceK: 20,
      image: "assets/food/dish-23-cakwe-ice-cream.jpg",
      hasIndividualPhoto: true,
      badges: ["Chef's Pick", "Sweet & Savory"],
      spicy: false,
      description:
        "Warm, crispy fried Chinese crullers (cakwe) paired with a cool, creamy scoop of vanilla ice cream and caramel drizzle.",
      pairings: ["36", "41", "44"]
    },
    {
      number: "24",
      name: "Siomay",
      category: "starter",
      categoryLabel: "Starter",
      priceK: 25,
      image: "assets/food/dish-24-siomay.jpg",
      hasIndividualPhoto: true,
      badges: ["Dim Sum"],
      spicy: false,
      description:
        "Steamed open-top chicken & prawn dim sum dumplings served piping hot in a traditional bamboo basket.",
      pairings: ["25", "36", "46"]
    },
    {
      number: "25",
      name: "Hakau Prawn",
      category: "starter",
      categoryLabel: "Starter",
      priceK: 25,
      image: "assets/food/dish-25-hakau-prawn.jpg",
      hasIndividualPhoto: true,
      badges: ["Dim Sum", "Best Seller"],
      spicy: false,
      description:
        "Delicate translucent crystal dumplings filled with whole, snappy seasoned prawns, steamed fresh in bamboo baskets.",
      pairings: ["24", "26", "46"]
    },
    {
      number: "26",
      name: "Lumpia Kulit Tahu",
      category: "starter",
      categoryLabel: "Starter",
      priceK: 25,
      image: "assets/food/dish-26-lumpia-kulit-tahu.jpg",
      hasIndividualPhoto: true,
      badges: ["Dim Sum", "Crispy"],
      spicy: false,
      description:
        "Savory chicken and prawn filling wrapped in delicate beancurd skin and fried until golden and flaky.",
      pairings: ["24", "25", "37"]
    },
    {
      number: "27",
      name: "Fried Wonton",
      category: "starter",
      categoryLabel: "Starter",
      priceK: 25,
      image: "assets/food/dish-27-fried-wonton.jpg",
      hasIndividualPhoto: true,
      badges: ["Crispy"],
      spicy: false,
      description:
        "Crispy golden wonton parcels with savory seasoned filling, served with sweet chili dipping sauce.",
      pairings: ["04", "19", "47"]
    },
    {
      number: "28",
      name: "Onde Onde Kacang Hijau",
      category: "starter",
      categoryLabel: "Starter",
      priceK: 25,
      image: "assets/food/dish-28-onde-onde-kacang-hijau.jpg",
      hasIndividualPhoto: true,
      badges: ["Heritage Snack"],
      spicy: false,
      description:
        "Warm sesame-crusted glutinous rice balls with a fragrant, sweet mung bean (kacang hijau) center.",
      pairings: ["36", "37", "46"]
    },
    {
      number: "29",
      name: "Pratha",
      category: "starter",
      categoryLabel: "Starter",
      priceK: 25,
      image: "assets/food/dish-29-pratha-plain.jpg",
      hasIndividualPhoto: true,
      badges: ["Kopitiam Classic"],
      spicy: false,
      description:
        "Pan-griddled flaky layered flatbread, crisp on the outside and tender within.",
      pairings: ["38", "37", "20"]
    },
    {
      number: "30",
      name: "Pratha with Condensed Milk",
      category: "starter",
      categoryLabel: "Starter",
      priceK: 28,
      image: "assets/food/dish-30-pratha-condensed-milk.jpg",
      hasIndividualPhoto: true,
      badges: ["Kopitiam Classic", "Sweet"],
      spicy: false,
      description:
        "Hot, flaky pan-seared pratha generously drizzled with sweet creamy condensed milk.",
      pairings: ["36", "38", "41"]
    },
    {
      number: "31",
      name: "Lumpia Semarang",
      category: "starter",
      categoryLabel: "Starter",
      priceK: 42,
      image: "assets/food/dish-31-lumpia-semarang.jpg",
      hasIndividualPhoto: true,
      badges: ["Chef's Pick", "Heritage Snack"],
      spicy: false,
      description:
        "Authentic Semarang-style crispy spring rolls filled with savory braised bamboo shoots (rebung) and chicken, served with sweet garlic sauce and pickled shallots.",
      pairings: ["36", "46", "06"]
    },
    {
      number: "32",
      name: "Crispy Mushroom",
      category: "starter",
      categoryLabel: "Starter",
      priceK: 29,
      image: "assets/food/dish-32-crispy-mushroom.jpg",
      hasIndividualPhoto: true,
      badges: ["Crispy", "Vegetarian Friendly"],
      spicy: false,
      description:
        "Lightly battered oyster mushrooms fried to golden crispness and tossed with savory seasoning.",
      pairings: ["47", "48", "12"]
    },
    {
      number: "33",
      name: "Crispy Cassava",
      category: "starter",
      categoryLabel: "Starter",
      priceK: 29,
      image: "assets/food/dish-33-crispy-cassava.jpg",
      hasIndividualPhoto: true,
      badges: ["Heritage Snack", "Vegetarian Friendly"],
      spicy: false,
      description:
        "Fluffy inside, golden-crisp outside — traditional fried singkong wedges ideal for sharing over kopi.",
      pairings: ["36", "37", "44"]
    },
    {
      number: "34",
      name: "French Fries",
      category: "starter",
      categoryLabel: "Starter",
      priceK: 30,
      image: "assets/food/dish-34-french-fries.jpg",
      hasIndividualPhoto: true,
      badges: ["Crispy"],
      spicy: false,
      description:
        "Crisp golden shoestring fries lightly salted and served hot with chili and tomato dipping sauces.",
      pairings: ["40", "49", "53"]
    },
    {
      number: "35",
      name: "Potato Wedges",
      category: "starter",
      categoryLabel: "Starter",
      priceK: 30,
      image: "assets/food/dish-35-potato-wedges.jpg",
      hasIndividualPhoto: true,
      badges: ["Crispy"],
      spicy: false,
      description:
        "Thick-cut skin-on potato wedges seasoned with herbs and fried to a fluffy golden crunch.",
      pairings: ["40", "44", "53"]
    },

    // ==================== DRINK (36 - 50) ====================
    {
      number: "36",
      name: "Kopi O",
      category: "drink",
      categoryLabel: "Drink",
      priceK: 25,
      image: "assets/food/drink-36-kopi-o.jpg",
      hasIndividualPhoto: true,
      badges: ["Signature", "Kopitiam Kopi"],
      spicy: false,
      description:
        "Traditional dark-roasted kopitiam coffee pulled through a cloth sock filter for a bold, full-bodied, caramelized aroma.",
      pairings: ["51", "56", "33"]
    },
    {
      number: "37",
      name: "Kopi C",
      category: "drink",
      categoryLabel: "Drink",
      priceK: 30,
      image: "assets/food/drink-37-kopi-c.jpg",
      hasIndividualPhoto: true,
      badges: ["Best Seller", "Kopitiam Kopi"],
      spicy: false,
      description:
        "Smooth sock-brewed kopitiam coffee mellowed with silky evaporated milk and balanced sweetness.",
      pairings: ["51", "56", "02"]
    },
    {
      number: "38",
      name: "Teh Tarik",
      category: "drink",
      categoryLabel: "Drink",
      priceK: 22,
      image: "assets/food/drink-38-teh-tarik.jpg",
      hasIndividualPhoto: true,
      badges: ["Best Seller", "Kopitiam Classic"],
      spicy: false,
      description:
        "Fragrant Ceylon black tea pulled high with creamy condensed and evaporated milk for a velvety, frothy crown.",
      pairings: ["20", "01", "51"]
    },
    {
      number: "39",
      name: "Yuan Yang",
      category: "drink",
      categoryLabel: "Drink",
      priceK: 30,
      image: "assets/food/drink-39-yuan-yang.jpg",
      hasIndividualPhoto: true,
      badges: ["Signature", "Kopitiam Kopi"],
      spicy: false,
      description:
        "The beloved kopitiam marriage of bold sock-brewed coffee and aromatic milk tea — rich, complex, and silky smooth.",
      pairings: ["51", "55", "14"]
    },
    {
      number: "40",
      name: "Milo Dino",
      category: "drink",
      categoryLabel: "Drink",
      priceK: 20,
      image: "assets/food/drink-40-milo-dino.jpg",
      hasIndividualPhoto: true,
      badges: ["Best Seller"],
      spicy: false,
      description:
        "Iced creamy chocolate malt drink crowned with a generous mountain of crunchy, unblended Milo powder.",
      pairings: ["52", "30", "34"]
    },
    {
      number: "41",
      name: "Americano",
      category: "drink",
      categoryLabel: "Drink",
      priceK: 20,
      image: "assets/food/drink-41-americano.jpg",
      hasIndividualPhoto: true,
      badges: ["Espresso Bar"],
      spicy: false,
      description:
        "Clean, aromatic double-shot espresso over hot water or ice for a crisp coffee finish.",
      pairings: ["51", "54", "23"]
    },
    {
      number: "42",
      name: "Cappucinno",
      category: "drink",
      categoryLabel: "Drink",
      priceK: 30,
      image: "assets/food/drink-42-cappuccino.jpg",
      hasIndividualPhoto: true,
      badges: ["Espresso Bar"],
      spicy: false,
      description:
        "Rich espresso topped with velvety steamed milk and microfoam latte art.",
      pairings: ["51", "55", "59"]
    },
    {
      number: "43",
      name: "Caffé Latte",
      category: "drink",
      categoryLabel: "Drink",
      priceK: 30,
      image: "assets/food/drink-43-caffe-latte.jpg",
      hasIndividualPhoto: true,
      badges: ["Espresso Bar"],
      spicy: false,
      description:
        "Smooth espresso blended with creamy steamed milk, served hot or over ice.",
      pairings: ["51", "53", "59"]
    },
    {
      number: "44",
      name: "Aren Latte",
      category: "drink",
      categoryLabel: "Drink",
      priceK: 35,
      image: "assets/food/drink-44-aren-latte.jpg",
      hasIndividualPhoto: true,
      badges: ["Signature", "Best Seller"],
      spicy: false,
      description:
        "Creamy iced latte ribboned with caramel-like Indonesian organic palm sugar (gula aren) and bold espresso.",
      pairings: ["51", "33", "59"]
    },
    {
      number: "45",
      name: "Pandan Latte",
      category: "drink",
      categoryLabel: "Drink",
      priceK: 25,
      image: "assets/food/drink-45-pandan-latte.jpg",
      hasIndividualPhoto: true,
      badges: ["Signature", "Chef's Pick"],
      spicy: false,
      description:
        "Layered iced latte infused with fragrant house-extracted pandan leaf syrup, fresh milk, and roasted espresso.",
      pairings: ["51", "28", "01"]
    },
    {
      number: "46",
      name: "Ice / Hot Tea (Sweet or Unsweet)",
      category: "drink",
      categoryLabel: "Drink",
      priceK: 22,
      image: "assets/food/drink-46-ice-hot-tea.jpg",
      hasIndividualPhoto: true,
      badges: ["Refreshing"],
      spicy: false,
      description:
        "Freshly brewed aromatic house tea served hot or chilled over ice, sweetened to your preference.",
      pairings: ["02", "24", "25"]
    },
    {
      number: "47",
      name: "Ice Lemon Tea",
      category: "drink",
      categoryLabel: "Drink",
      priceK: 25,
      image: "assets/food/drink-47-ice-lemon-tea.jpg",
      hasIndividualPhoto: true,
      badges: ["Refreshing", "Best Seller"],
      spicy: false,
      description:
        "Brisk brewed black tea chilled over ice with fresh-squeezed lemon wheels for a bright, zesty lift.",
      pairings: ["06", "07", "14"]
    },
    {
      number: "48",
      name: "Secret Garden",
      category: "drink",
      categoryLabel: "Drink",
      priceK: 25,
      image: "assets/food/drink-48-secret-garden.jpg",
      hasIndividualPhoto: true,
      badges: ["Signature", "Refreshing"],
      spicy: false,
      description:
        "Our signature specialty iced tea infusion blending fragrant floral notes and crisp citrus refreshment.",
      pairings: ["01", "13", "21"]
    },
    {
      number: "49",
      name: "Soft Drink",
      category: "drink",
      categoryLabel: "Drink",
      priceK: 15,
      image: "assets/food/drink-49-soft-drink.jpg",
      hasIndividualPhoto: true,
      badges: ["Refreshing"],
      spicy: false,
      description: "Chilled classic carbonated soft drinks served with ice.",
      pairings: ["34", "35", "21"]
    },
    {
      number: "50",
      name: "Bottle Water",
      category: "drink",
      categoryLabel: "Drink",
      priceK: 10,
      image: "assets/food/drink-50-bottle-water.jpg",
      hasIndividualPhoto: true,
      badges: ["Pure"],
      spicy: false,
      description: "Chilled or room-temperature pure mineral water.",
      pairings: ["01", "02", "06"]
    },

    // ==================== TOAST (51 - 56) ====================
    {
      number: "51",
      name: "Kaya Toast",
      category: "toast",
      categoryLabel: "Toast",
      priceK: 26,
      image: "assets/food/dish-51-kaya-toast.jpg",
      hasIndividualPhoto: true,
      badges: ["Signature", "Best Seller", "Morning Ritual"],
      spicy: false,
      description:
        "Double-layered golden-toasted bread generously spread with slow-cooked pandan-coconut srikaya jam and slabs of cold salted butter.",
      pairings: ["56", "36", "37"]
    },
    {
      number: "52",
      name: "Milo Toast",
      category: "toast",
      categoryLabel: "Toast",
      priceK: 26,
      image: "assets/food/dish-52-milo-toast.jpg",
      hasIndividualPhoto: true,
      badges: ["Best Seller", "Sweet"],
      spicy: false,
      description:
        "Warm, thick-cut toast draped in creamy condensed milk glaze and buried under a mountain of malty Milo powder.",
      pairings: ["40", "37", "56"]
    },
    {
      number: "53",
      name: "Tuna Mayo Toast",
      category: "toast",
      categoryLabel: "Toast",
      priceK: 26,
      image: "assets/food/dish-53-tuna-mayo-toast.jpg",
      hasIndividualPhoto: true,
      badges: ["Savory"],
      spicy: false,
      description:
        "Hearty toasted sandwich packed with seasoned flaky tuna, creamy mayo, melted cheese, and scallions.",
      pairings: ["41", "47", "34"]
    },
    {
      number: "54",
      name: "Peanut Butter Toast",
      category: "toast",
      categoryLabel: "Toast",
      priceK: 26,
      image: "assets/food/dish-54-peanut-butter-toast.jpg",
      hasIndividualPhoto: true,
      badges: ["Kopitiam Classic"],
      spicy: false,
      description:
        "Crisp golden toast slathered with rich, roasted chunky peanut butter and a dusting of cocoa-cinnamon.",
      pairings: ["36", "37", "56"]
    },
    {
      number: "55",
      name: "Peanut Butter Jelly Toast",
      category: "toast",
      categoryLabel: "Toast",
      priceK: 26,
      image: "assets/food/dish-55-pb-jelly-toast.jpg",
      hasIndividualPhoto: true,
      badges: ["Sweet & Nutty"],
      spicy: false,
      description:
        "Golden toasted bread layered with creamy peanut butter and bright ruby fruit preserve.",
      pairings: ["39", "42", "56"]
    },
    {
      number: "56",
      name: "Soft Boiled Egg (2 Pcs)",
      category: "toast",
      categoryLabel: "Toast",
      priceK: 15,
      image: "assets/food/dish-56-soft-boiled-eggs.jpg",
      hasIndividualPhoto: true,
      badges: ["Signature", "Morning Ritual"],
      spicy: false,
      description:
        "Two kampung-style eggs coddled to velvety perfection with runny golden yolks — season with white pepper and dark soy for dipping your Kaya Toast.",
      pairings: ["51", "36", "37"]
    },

    // ==================== DESSERT (57 - 61) ====================
    {
      number: "57",
      name: "Taro Sago",
      category: "dessert",
      categoryLabel: "Dessert",
      priceK: 30,
      image: "assets/food/dish-57-taro-sago.jpg",
      hasIndividualPhoto: true,
      badges: ["Signature", "Best Seller"],
      spicy: false,
      description:
        "Chilled, velvety taro cream soup studded with translucent, chewy sago pearls.",
      pairings: ["14", "06", "25"]
    },
    {
      number: "58",
      name: "Grass Jelly Milk",
      category: "dessert",
      categoryLabel: "Dessert",
      priceK: 28,
      image: "assets/food/dish-58-grass-jelly-milk.jpg",
      hasIndividualPhoto: true,
      badges: ["Refreshing"],
      spicy: false,
      description:
        "Cooling herbal grass jelly cubes (cincau) swimming in sweet, chilled creamy milk over crushed ice.",
      pairings: ["01", "18", "16"]
    },
    {
      number: "59",
      name: "Fried Banana",
      category: "dessert",
      categoryLabel: "Dessert",
      priceK: 35,
      image: "assets/food/dish-59-fried-banana.jpg",
      hasIndividualPhoto: true,
      badges: ["Best Seller", "Warm Dessert"],
      spicy: false,
      description:
        "Caramelized ripe bananas fried in a lacy, shattering-crisp batter — an irresistible companion to afternoon kopi.",
      pairings: ["36", "44", "60"]
    },
    {
      number: "60",
      name: "Ice Cream 1 Scoop",
      category: "dessert",
      categoryLabel: "Dessert",
      priceK: 15,
      image: "assets/food/dish-60-ice-cream-1-scoop.jpg",
      hasIndividualPhoto: true,
      badges: ["Sweet"],
      spicy: false,
      description: "A single generous scoop of classic creamy ice cream.",
      pairings: ["59", "51", "40"]
    },
    {
      number: "61",
      name: "Ice Cream 2 Scoops",
      category: "dessert",
      categoryLabel: "Dessert",
      priceK: 25,
      image: "assets/food/dish-61-ice-cream-2-scoops.jpg",
      hasIndividualPhoto: true,
      badges: ["Sweet"],
      spicy: false,
      description: "Double scoops of chilled, creamy ice cream to finish your meal.",
      pairings: ["59", "52", "44"]
    }
  ],

  // ==========================================================================
  // INTERACTIVE ROYAL KOPITIAM DRINK BAR GUIDE (#36 – #45)
  // ==========================================================================
  kopiRitualGuide: [
    {
      id: "kopi-o",
      menuNumber: "36",
      name: "Kopi O",
      chinese: "咖啡乌",
      price: "25 K",
      pronunciation: "Koh-Pee Oh",
      tagline: "Bold, Dark & Aromatic",
      layers: [
        {
          shortLabel: "85% Dark Kopi",
          label: "Sock-Brewed Kopitiam Dark Roast",
          pct: 80,
          color: "#2A160D",
          textColor: "#FFFDF8"
        },
        {
          shortLabel: "15% Cane Sugar",
          label: "Aromatic Cane Sugar",
          pct: 20,
          color: "#8B5A2B",
          textColor: "#FFFDF8"
        }
      ],
      notes:
        "Roasted with rich caramel notes and pulled through a traditional cloth sock filter. Pure, bold, and deeply aromatic without dairy.",
      pairWith: "51. Kaya Toast + 56. Soft Boiled Egg (2 Pcs)"
    },
    {
      id: "kopi-c",
      menuNumber: "37",
      name: "Kopi C",
      chinese: "咖啡丝",
      price: "30 K",
      pronunciation: "Koh-Pee See",
      tagline: "Silky Evaporated Milk Balance",
      layers: [
        {
          shortLabel: "65% Sock Kopi",
          label: "Sock-Brewed Kopitiam Coffee",
          pct: 60,
          color: "#3A2012",
          textColor: "#FFFDF8"
        },
        {
          shortLabel: "25% Evap Milk",
          label: "Silky Evaporated Milk",
          pct: 22,
          color: "#E8D5B7",
          textColor: "#1D1714"
        },
        {
          shortLabel: "10% Sugar",
          label: "Light Sugar Syrup",
          pct: 18,
          color: "#9E6B35",
          textColor: "#FFFDF8"
        }
      ],
      notes:
        "The 'C' honours classic Hainanese kopitiam tradition (evaporated milk), creating a smoother, lighter-bodied cup than condensed milk kopi.",
      pairWith: "02. Hainan Chicken Rice White Chicken"
    },
    {
      id: "teh-tarik",
      menuNumber: "38",
      name: "Teh Tarik",
      chinese: "拉茶",
      price: "22 K",
      pronunciation: "Teh Tah-Rik",
      tagline: "High-Pulled Frothy Milk Tea",
      layers: [
        {
          shortLabel: "20% Pulled Froth",
          label: "Aerated Pulled Tea Foam",
          pct: 22,
          color: "#F7EBCD",
          textColor: "#1D1714"
        },
        {
          shortLabel: "55% Black Tea",
          label: "Brewed Ceylon Black Tea",
          pct: 54,
          color: "#9C5221",
          textColor: "#FFFDF8"
        },
        {
          shortLabel: "25% Rich Milk",
          label: "Condensed & Evaporated Milk",
          pct: 24,
          color: "#EED9AD",
          textColor: "#1D1714"
        }
      ],
      notes:
        "Poured back and forth from a height to cool the tea and whip up a cloud-like frothy head with rich caramel-milk depth.",
      pairWith: "20. Pratha with Chicken Curry"
    },
    {
      id: "yuan-yang",
      menuNumber: "39",
      name: "Yuan Yang",
      chinese: "鸳鸯",
      price: "30 K",
      pronunciation: "Yuen Yang",
      tagline: "Harmony of Kopi & Teh",
      layers: [
        {
          shortLabel: "45% Milk Tea",
          label: "Pulled Black Milk Tea",
          pct: 44,
          color: "#A45C27",
          textColor: "#FFFDF8"
        },
        {
          shortLabel: "35% Dark Kopi",
          label: "Sock-Brewed Kopitiam Coffee",
          pct: 34,
          color: "#341C0F",
          textColor: "#FFFDF8"
        },
        {
          shortLabel: "20% Sweet Milk",
          label: "Creamy Sweetened Milk",
          pct: 22,
          color: "#EFE0BF",
          textColor: "#1D1714"
        }
      ],
      notes:
        "Fifty-fifty marriage of fragrant black milk tea and bold kopitiam coffee — floral tea briskness meets deep roasted cocoa-coffee notes.",
      pairWith: "14. Char Kway Teow Prawn"
    },
    {
      id: "aren-latte",
      menuNumber: "44",
      name: "Aren Latte",
      chinese: "椰糖拿铁",
      price: "35 K",
      pronunciation: "Ah-Ren Lah-Tay",
      tagline: "Caramel Gula Aren Espresso",
      layers: [
        {
          shortLabel: "25% Espresso",
          label: "Double Espresso Shot",
          pct: 25,
          color: "#3A2012",
          textColor: "#FFFDF8"
        },
        {
          shortLabel: "50% Fresh Milk",
          label: "Chilled Creamy Fresh Milk",
          pct: 50,
          color: "#F8EFE0",
          textColor: "#1D1714"
        },
        {
          shortLabel: "25% Gula Aren",
          label: "Organic Indonesian Palm Sugar",
          pct: 25,
          color: "#7A4419",
          textColor: "#FFFDF8"
        }
      ],
      notes:
        "Creamy iced latte ribboned with smoky, caramel-like Indonesian organic palm sugar (gula aren) and a bold double espresso shot.",
      pairWith: "59. Fried Banana or 33. Crispy Cassava"
    },
    {
      id: "pandan-latte",
      menuNumber: "45",
      name: "Pandan Latte",
      chinese: "斑兰拿铁",
      price: "25 K",
      pronunciation: "Pan-Dan Lah-Tay",
      tagline: "Fragrant Pandan & Espresso",
      layers: [
        {
          shortLabel: "25% Espresso",
          label: "Double Espresso Shot",
          pct: 25,
          color: "#3A2012",
          textColor: "#FFFDF8"
        },
        {
          shortLabel: "50% Fresh Milk",
          label: "Velvety Chilled Fresh Milk",
          pct: 50,
          color: "#F8EFE0",
          textColor: "#1D1714"
        },
        {
          shortLabel: "25% Pandan",
          label: "House-Extracted Pandan Reduction",
          pct: 25,
          color: "#1B6B32",
          textColor: "#FFFDF8"
        }
      ],
      notes:
        "Three-layer iced specialty latte infused with aromatic house-extracted pandan leaf reduction, chilled milk, and roasted espresso.",
      pairWith: "51. Kaya Toast or 28. Onde Onde Kacang Hijau"
    }
  ],

  // ==========================================================================
  // 16-SLOT ATMOSPHERE & VIBES GALLERY (100% Editorial Generated Photography)
  // ==========================================================================
  galleryZones: [
    { id: "all", label: "All Moments" },
    { id: "space", label: "Space & Architecture" },
    { id: "morning", label: "Morning Rituals" },
    { id: "culinary", label: "Wok & Table Spread" },
    { id: "evening", label: "Warm Gatherings" }
  ],

  galleryPhotos: [
    {
      id: "gal-01",
      zone: "space",
      span: "wide-tall",
      image: "assets/gallery/atmo-interior-hall.png",
      title: "The Royal Oriental Dining Hall",
      caption:
        "Warm timber framing, heritage green accents, and natural daylight welcoming every guest.",
      slotLabel: "01 • Main Hall"
    },
    {
      id: "gal-02",
      zone: "morning",
      span: "tall",
      image: "assets/gallery/atmo-morning-sunlight.png",
      title: "Morning Sunlight & Kopi Ritual",
      caption:
        "Golden Kaya Toast, soft-boiled kampung eggs, and aromatic Kopi O on classic marble tables.",
      slotLabel: "02 • Morning Table"
    },
    {
      id: "gal-03",
      zone: "space",
      span: "wide",
      image: "assets/gallery/atmo-veranda-seating.png",
      title: "Sunlit Veranda & Louvered Terrace",
      caption:
        "Breezy semi-outdoor seating with tall heritage green timber shutters, dappled daylight, and marble bistro tables.",
      slotLabel: "03 • Veranda Seating"
    },
    {
      id: "gal-04",
      zone: "morning",
      span: "normal",
      image: "assets/gallery/atmo-kopi-pour.png",
      title: "High-Pour Kopitiam Kopi Craft",
      caption:
        "Rich dark-roasted coffee poured hot from a long-spout brass pot into classic floral porcelain cups.",
      slotLabel: "04 • Kopi Craft"
    },
    {
      id: "gal-05",
      zone: "evening",
      span: "normal",
      image: "assets/gallery/atmo-family-table.png",
      title: "Round-Table Gathering Feast",
      caption:
        "Steaming bamboo dim sum baskets, Hainan Chicken Rice, Teh Tarik, and Kaya Toast shared around the marble table.",
      slotLabel: "05 • Shared Table"
    },
    {
      id: "gal-06",
      zone: "culinary",
      span: "wide",
      image: "assets/food/dish-hainan-white.jpg",
      title: "Silky Hainan Chicken Rice (#02)",
      caption:
        "Poached white chicken drizzled with fragrant sesame soy and crispy garlic alongside ginger rice and soup.",
      slotLabel: "06 • Royal Signature"
    },
    {
      id: "gal-07",
      zone: "morning",
      span: "normal",
      image: "assets/food/dish-kaya-toast.jpg",
      title: "Charcoal-Grilled Kaya Butter Toast (#51)",
      caption:
        "Crisp golden toast layered with house-steamed pandan srikaya jam and thick slabs of cold butter.",
      slotLabel: "07 • Morning Toast"
    },
    {
      id: "gal-08",
      zone: "morning",
      span: "normal",
      image: "assets/food/dish-soft-boiled-eggs.jpg",
      title: "Kampung Soft-Boiled Eggs (#56)",
      caption:
        "Velvety runny yolks seasoned with dark soy sauce and white pepper on a porcelain saucer.",
      slotLabel: "08 • Morning Ritual"
    },
    {
      id: "gal-09",
      zone: "culinary",
      span: "wide",
      image: "assets/food/dish-ckt-prawn.jpg",
      title: "High-Flame Wok Hei Char Kway Teow (#14)",
      caption:
        "Flat rice noodles seared over roaring flames with plump prawns, dark soy glaze, garlic chives, and bean sprouts.",
      slotLabel: "09 • Wok Hei Craft"
    },
    {
      id: "gal-10",
      zone: "evening",
      span: "normal",
      image: "assets/food/dish-dimsum-siomay-hakau.jpg",
      title: "Steaming Bamboo Dim Sum Baskets (#24–#26)",
      caption:
        "Translucent Prawn Hakau, Chicken-Prawn Siomay, and crispy Lumpia Kulit Tahu with house chili oil.",
      slotLabel: "10 • Dim Sum"
    },
    {
      id: "gal-11",
      zone: "culinary",
      span: "normal",
      image: "assets/food/dish-pratha-curry.jpg",
      title: "Flaky Layered Pratha & Golden Curry (#20)",
      caption:
        "Pan-griddled crisp roti pratha paired with a rich bowl of slow-simmered chicken and potato curry.",
      slotLabel: "11 • Curry & Prata"
    },
    {
      id: "gal-12",
      zone: "morning",
      span: "wide",
      image: "assets/food/drink-kopi-o-c.jpg",
      title: "Traditional Floral Porcelain Kopi O & Kopi C (#36–#37)",
      caption:
        "Sock-brewed dark kopitiam coffee served steaming hot in classic green-and-white porcelain cups.",
      slotLabel: "12 • Kopitiam Cups"
    },
    {
      id: "gal-13",
      zone: "culinary",
      span: "normal",
      image: "assets/food/dish-ayam-kampung.jpg",
      title: "Nasi Ayam Goreng Kampung (#06)",
      caption:
        "Spice-marinated kampung chicken crowned with airy golden rempah crumbs and fiery sambal terasi.",
      slotLabel: "13 • Kampung Special"
    },
    {
      id: "gal-14",
      zone: "culinary",
      span: "normal",
      image: "assets/food/dish-meegoreng.jpg",
      title: "Savory Mee Goreng Prawn (#17)",
      caption:
        "Springy yellow noodles wok-tossed with juicy prawns, choy sum greens, tomatoes, and crispy kerupuk.",
      slotLabel: "14 • Wok Noodles"
    },
    {
      id: "gal-15",
      zone: "evening",
      span: "normal",
      image: "assets/food/drink-aren-pandan-latte.jpg",
      title: "Layered Aren & Pandan Iced Lattes (#44–#45)",
      caption:
        "House-crafted iced espresso lattes layered with organic Gula Aren palm sugar and fragrant pandan.",
      slotLabel: "15 • Specialty Lattes"
    },
    {
      id: "gal-16",
      zone: "evening",
      span: "normal",
      image: "assets/food/dish-taro-grassjelly.jpg",
      title: "Chilled Taro Sago & Grass Jelly Milk (#57–#58)",
      caption:
        "Velvety purple taro sago pearls and cooling herbal grass jelly in sweet milk to finish the evening.",
      slotLabel: "16 • Sweet Finishes"
    }
  ]
};

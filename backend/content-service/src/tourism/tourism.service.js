"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TourismService = void 0;
const common_1 = require("@nestjs/common");
const database_1 = require("@dpgc/database");
const shared_1 = require("@dpgc/shared");
const crypto_1 = require("node:crypto");

// ---------------------------------------------------------------------------
// Seed Data Constants
// ---------------------------------------------------------------------------
const SEED_CIRCUITS = [
    {
        name: "North Kolkata Heritage & Bonedi Bari Trail",
        slug: "north-kolkata-heritage-bonedi-bari",
        region: "North Kolkata",
        description: "Experience the aristocratic aristocracy of 200+ year-old ancestral household Pujas alongside century-old community celebrations in old Kolkata.",
        duration: "1 Day (8 - 10 Hours)",
        bestTimeOfDay: "Morning 7:30 AM - 1:00 PM & Evening 6:00 PM - 10:00 PM",
        recommendedTransport: "AC Metro + Walking + Heritage Tram",
        crowdLevel: "Moderate to High",
        tags: ["Bonedi Bari", "Heritage", "Aristocratic", "Historical", "Walking Trail"],
        coverImageUrl: "https://images.unsplash.com/photo-1601662528567-526cd06f6582?auto=format&fit=crop&w=1200&q=80",
        highlightPandals: [
            { name: "Shovabazar Rajbari", location: "33/1, Raja Nabakrishna Street, Shovabazar", highlight: "Started by Raja Nabakrishna Deb in 1757, quintessential Dala-Katha pratima in traditional courtyard." },
            { name: "Bagbazar Sarbojanin", location: "7/1, Bagbazar Street, Bagbazar", highlight: "Established 1919, grand classic Ekchala Durga with traditional Daaker Saaj." },
            { name: "Laha Bari Puja", location: "2A, Bidhan Sarani, College Street", highlight: "No animal or vegetable sacrifice, offering of over 50 varieties of dry sweets, serene courtyard." },
            { name: "Kumartuli Park", location: "Kumartuli, North Kolkata", highlight: "Adjacent to idol-makers colony; remarkable traditional architecture and thematic illumination." }
        ],
        isFeatured: true,
        sortOrder: 1
    },
    {
        name: "South Kolkata Megapandal & Contemporary Art Odyssey",
        slug: "south-kolkata-art-odyssey",
        region: "South Kolkata",
        description: "A showcase of UNESCO-recognized avant-garde art installations, grand themed architectural marvels, and festive street energy.",
        duration: "1 to 2 Days",
        bestTimeOfDay: "Late Afternoon 4:00 PM - Midnight 2:00 AM",
        recommendedTransport: "AC Bus / Chauffeured Cab / Metro Line 1",
        crowdLevel: "Peak",
        tags: ["Thematic Art", "Modern Architecture", "Illumination", "Food Trail", "Youth Culture"],
        coverImageUrl: "https://images.unsplash.com/photo-1596461404969-9ae70f2830c1?auto=format&fit=crop&w=1200&q=80",
        highlightPandals: [
            { name: "Ekdalia Evergreen Club", location: "15, Ekdalia Road, Gariahat", highlight: "Famous for replicating ancient Indian temple architecture with breathtaking chandelier illumination." },
            { name: "Maddox Square", location: "Ritchie Road, Ballygunge", highlight: "The social heartbeat of Kolkata youth; sprawling green park, traditional pratima, vibrant cultural gatherings." },
            { name: "Ballygunge Cultural Association", location: "57, Jatin Das Road, Lake Terrace", highlight: "Celebrated for innovative artistic social themes and sublime clay idol craftsmanship." },
            { name: "Suruchi Sangha", location: "New Alipore", highlight: "Pioneering state-themed pavilions showcasing tribal folk heritage and immersive audio-visual environments." },
            { name: "Chetla Agrani Club", location: "Chetla", highlight: "Pioneering eco-friendly sustainable artisan materials and master-level sculpture." }
        ],
        isFeatured: true,
        sortOrder: 2
    },
    {
        name: "Central Kolkata & Colonial Riverbank Trail",
        slug: "central-kolkata-riverbank-trail",
        region: "Central Kolkata",
        description: "Discover historic illuminated water tanks, collegiate heritage, artisans of Kumartuli, and sunset views over the majestic Hooghly river.",
        duration: "1 Day (6 - 8 Hours)",
        bestTimeOfDay: "Evening 5:00 PM - 11:30 PM",
        recommendedTransport: "Green Line Metro / Walking / Ferry",
        crowdLevel: "High",
        tags: ["Colonial Heritage", "Water Illumination", "Riverbank", "Kumartuli Artisans"],
        coverImageUrl: "https://images.unsplash.com/photo-1567157577867-05ccb1388e66?auto=format&fit=crop&w=1200&q=80",
        highlightPandals: [
            { name: "College Square", location: "53, College Street, Bowbazar", highlight: "Iconic reflection of towering illuminated palace structures on the historic swimming pool waters." },
            { name: "Mohammad Ali Park", location: "CR Avenue, Bowbazar", highlight: "Grand scale palace replica surrounded by historic city architecture and rich food stalls." },
            { name: "Kumartuli Artisans Colony", location: "Potters Lane, Kumartuli", highlight: "Walk through the birthplace of clay idols where master sculptors bring the Divine Mother to life." }
        ],
        isFeatured: true,
        sortOrder: 3
    },
    {
        name: "Salt Lake & Eastern Corridor Modern Spectacles",
        slug: "salt-lake-eastern-corridor",
        region: "Salt Lake & Bypass",
        description: "Sprawling parks, wide tree-lined avenues, and some of the grandest budget architectural spectacles in Eastern India.",
        duration: "Evening Trail (5 - 6 Hours)",
        bestTimeOfDay: "Evening 6:00 PM - Midnight 1:00 AM",
        recommendedTransport: "Private Cab / App Cab / Green Line Metro",
        crowdLevel: "Peak",
        tags: ["Grand Illumination", "Family Friendly", "Spacious", "Modern Themes"],
        coverImageUrl: "https://images.unsplash.com/photo-1601662528567-526cd06f6582?auto=format&fit=crop&w=1200&q=80",
        highlightPandals: [
            { name: "Sreebhumi Sporting Club", location: "VIP Road, Lake Town", highlight: "Internationally famous for gigantic scale architectural replicas (Disneyland, Burj Khalifa, Vatican)." },
            { name: "FD Block Salt Lake", location: "Sector III, Bidhannagar", highlight: "Awe-inspiring dynamic theme installations with interactive lighting and social awareness concepts." },
            { name: "BJ Block Salt Lake", location: "Sector II, Bidhannagar", highlight: "Handcrafted traditional Indian folk arts, terracotta murals, and community cultural programmes." }
        ],
        isFeatured: false,
        sortOrder: 4
    },
    {
        name: "Howrah, Belur Math & French Colonial River Trail",
        slug: "howrah-belur-math-river-trail",
        region: "Howrah & Hooghly",
        description: "A divine and historical journey crossing the Hooghly river, witnessing Kumari Puja at Belur Math, and exploring French heritage in Chandannagar.",
        duration: "Full Day (9:00 AM - 7:00 PM)",
        bestTimeOfDay: "Daytime 8:30 AM - 5:30 PM",
        recommendedTransport: "WBTDCL River Vessel + Chauffeured AC Coach",
        crowdLevel: "Moderate",
        tags: ["Kumari Puja", "River Cruise", "French Heritage", "Spiritual", "Serene"],
        coverImageUrl: "https://images.unsplash.com/photo-1596461404969-9ae70f2830c1?auto=format&fit=crop&w=1200&q=80",
        highlightPandals: [
            { name: "Belur Math Kumari Puja", location: "Belur, Howrah", highlight: "Swami Vivekananda initiated Kumari Puja here in 1901. A transcendent spiritual experience on Maha Ashtami." },
            { name: "Chandannagar Sacred Heart & Strand", location: "Chandannagar, Hooghly", highlight: "French colonial architecture, river promenade, and world-renowned dynamic electrical light art." },
            { name: "Ramkrishnapur & Shibpur Heritage Pujas", location: "Howrah Riverfront", highlight: "Centuries-old suburban community traditions overlooking the Kolkata skyline." }
        ],
        isFeatured: false,
        sortOrder: 5
    },
    {
        name: "Rarh Bengal Terracotta & Rural Cultural Circuit",
        slug: "rarh-bengal-terracotta-rural",
        region: "Rarh Bengal & Santiniketan",
        description: "Journey beyond Kolkata into the cultural soul of Bengal: 17th-century terracotta temples in Bishnupur, red soil rhythms, and Tagore's autumnal Santiniketan.",
        duration: "2 to 3 Days",
        bestTimeOfDay: "Morning & Sunset",
        recommendedTransport: "Express Train / AC Tourist Coach",
        crowdLevel: "Pleasant & Moderate",
        tags: ["Terracotta", "Rural Bengal", "Tagore Heritage", "Handicrafts", "UNESCO Tentative"],
        coverImageUrl: "https://images.unsplash.com/photo-1567157577867-05ccb1388e66?auto=format&fit=crop&w=1200&q=80",
        highlightPandals: [
            { name: "Malla Rajbari Puja & Madanmohan Temple", location: "Bishnupur, Bankura", highlight: "Over 1000-year-old royal family puja with sacred cannon firing ritual and classical Malla music." },
            { name: "Santiniketan Autumn Festivities", location: "Bolpur, Birbhum", highlight: "Open-air celebrations, Baul folk music under Chhatim trees, and Dokra artisan villages." }
        ],
        isFeatured: false,
        sortOrder: 6
    },
    {
        name: "Vijaya Dashami Immersion & Red Road Carnival Spectacular",
        slug: "carnival-immersion-spectacular",
        region: "Central Kolkata & Red Road",
        description: "Experience the monumental culmination of Durga Puja: traditional Sindoor Khela, Hooghly ghat immersions, and the majestic UNESCO Red Road Carnival.",
        duration: "2 Days (Dashami + Carnival)",
        bestTimeOfDay: "Afternoon 3:00 PM - Night 10:00 PM",
        recommendedTransport: "Designated Tourist Shuttle / VIP Pass Zone",
        crowdLevel: "Spectacular Gala",
        tags: ["Sindoor Khela", "Ghat Immersion", "Red Road Carnival", "UNESCO Showcase", "VIP Access"],
        coverImageUrl: "https://images.unsplash.com/photo-1601662528567-526cd06f6582?auto=format&fit=crop&w=1200&q=80",
        highlightPandals: [
            { name: "Babu Ghat & Bagbazar Ghat Immersions", location: "Strand Road Ghats", highlight: "Witness the tearful yet triumphant immersion of hundreds of clay idols with Dhak beats and river torches." },
            { name: "Red Road Durga Puja Carnival", location: "Red Road, Maidan, Kolkata", highlight: "Over 100 top award-winning pandal idols parade before hundreds of thousands with folk dance and brass bands." }
        ],
        isFeatured: true,
        sortOrder: 7
    }
];

const SEED_STAYS = [
    {
        name: "WBTDCL Udayan Tourism Property",
        slug: "wbtdcl-udayan-tourism-property",
        type: "WBTDCL Govt Lodge",
        location: "Kolkata Centre, Near Salt Lake Stadium",
        city: "Kolkata",
        district: "Kolkata",
        priceRange: "₹2,200 - ₹4,500 / night",
        budgetTier: "MID_RANGE",
        starRating: 3,
        amenities: ["Official WBTDC Concierge", "AC Rooms", "Free WiFi", "Bengali Cuisine Restaurant", "Puja Tour Pickup"],
        contactPhone: "+91 33 2243 7260",
        contactEmail: "tourism@wb.gov.in",
        bookingUrl: "https://www.wbtdcl.wbtourism.gov.in",
        description: "Official West Bengal Tourism Development Corporation property with direct access to Puja Parikrama coaches and hospitality staff.",
        coverImageUrl: "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1200&q=80",
        isWbtdc: true,
        isFeatured: true
    },
    {
        name: "The Rajbari Bawali",
        slug: "the-rajbari-bawali-heritage",
        type: "Heritage Palace / Haveli",
        location: "Bawali, 24 Parganas South (1.5 hrs from city)",
        city: "Kolkata Suburbs",
        district: "South 24 Parganas",
        priceRange: "₹9,500 - ₹22,000 / night",
        budgetTier: "HERITAGE",
        starRating: 5,
        amenities: ["300-year-old Zamindari Palace", "Royal Dining", "Swimming Pool", "Heritage Walks", "Spa"],
        contactPhone: "+91 90733 13428",
        contactEmail: "stay@therajbari.com",
        bookingUrl: "https://therajbari.com",
        description: "A meticulously restored 300-year-old aristocratic palace offering royal Bengal hospitality and private heritage Puja rituals.",
        coverImageUrl: "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=1200&q=80",
        isWbtdc: false,
        isFeatured: true
    },
    {
        name: "The Oberoi Grand Kolkata",
        slug: "the-oberoi-grand-kolkata",
        type: "5-Star Luxury",
        location: "15, Jawaharlal Nehru Road, New Market, Esplanade",
        city: "Kolkata",
        district: "Kolkata",
        priceRange: "₹14,000 - ₹32,000 / night",
        budgetTier: "LUXURY",
        starRating: 5,
        amenities: ["Prime Central Location", "Colonial Luxury", "Pool & Spa", "Award-Winning Restaurants", "24/7 Concierge"],
        contactPhone: "+91 33 2249 2323",
        contactEmail: "reservations.kolkata@oberoihotels.com",
        bookingUrl: "https://www.oberoihotels.com",
        description: "The Grande Dame of Chowringhee, standing since the 1880s right at the nexus of Kolkata's metro and shopping hub.",
        coverImageUrl: "https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=1200&q=80",
        isWbtdc: false,
        isFeatured: true
    },
    {
        name: "Calcutta Bungalow",
        slug: "calcutta-bungalow-boutique",
        type: "Boutique Heritage Hotel",
        location: "5, Radha Kanta Jew Street, Fariapukur, Shyambazar",
        city: "Kolkata",
        district: "Kolkata",
        priceRange: "₹5,500 - ₹9,500 / night",
        budgetTier: "HERITAGE",
        starRating: 4,
        amenities: ["1920s Townhouse", "North Kolkata Heart", "Curated Local Experiences", "Breakfast Included", "Walking Tours"],
        contactPhone: "+91 98301 84030",
        contactEmail: "enquiries@calcuttabungalow.com",
        bookingUrl: "https://calcuttabungalow.com",
        description: "A restored 1920s heritage townhouse in the very heart of North Kolkata, surrounded by century-old Bonedi Bari pujas.",
        coverImageUrl: "https://images.unsplash.com/photo-1571003123894-1f0594d2b5d9?auto=format&fit=crop&w=1200&q=80",
        isWbtdc: false,
        isFeatured: true
    },
    {
        name: "ITC Royal Bengal & Sonar",
        slug: "itc-royal-bengal-sonar",
        type: "5-Star Luxury",
        location: "1, JBS Haldane Avenue, EM Bypass",
        city: "Kolkata",
        district: "Kolkata",
        priceRange: "₹12,000 - ₹28,000 / night",
        budgetTier: "LUXURY",
        starRating: 5,
        amenities: ["Bespoke Luxury", "Multiple Fine Dining (Grand Market Pavilion, Peshawri)", "Direct Bypass Access", "Helipad"],
        contactPhone: "+91 33 4446 4646",
        contactEmail: "reservations.itcroyalbengal@itchotels.in",
        bookingUrl: "https://www.itchotels.com",
        description: "Monumental architectural homage to Bengal's aristocratic heritage, positioned conveniently along the Eastern Bypass corridor.",
        coverImageUrl: "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?auto=format&fit=crop&w=1200&q=80",
        isWbtdc: false,
        isFeatured: false
    },
    {
        name: "WBTDCL Rangabitan Tourist Lodge (Santiniketan)",
        slug: "wbtdcl-rangabitan-santiniketan",
        type: "WBTDCL Govt Lodge",
        location: "Bolpur, Santiniketan, Birbhum",
        city: "Bolpur",
        district: "Birbhum",
        priceRange: "₹1,800 - ₹3,600 / night",
        budgetTier: "BUDGET",
        starRating: 3,
        amenities: ["Peaceful Rural Setting", "Tagore Heritage Proximity", "Traditional Food", "WBTDCL Guided Tours"],
        contactPhone: "+91 3463 252 699",
        contactEmail: "santiniketan@wbtourism.gov.in",
        bookingUrl: "https://www.wbtdcl.wbtourism.gov.in",
        description: "Tranquil governmental tourist lodge in the heart of red soil country, ideal for combining Kolkata puja with rural heritage.",
        coverImageUrl: "https://images.unsplash.com/photo-1578683010236-d716f9a3f461?auto=format&fit=crop&w=1200&q=80",
        isWbtdc: true,
        isFeatured: false
    }
];

const SEED_TRANSPORTS = [
    {
        name: "Kolkata Metro Rail (All-Night Puja Special)",
        category: "Metro Rail",
        operatingHours: "24 Hours (Midnight to Dawn Special Services on Sasthi, Saptami, Ashtami, Navami)",
        routeDescription: "Blue Line (Dakshineswar - Kavi Subhash via Central/Shyambazar/Kalighat) & Green Line (Howrah Maidan - Esplanade underwater metro).",
        fareGuide: "₹5 to ₹30 per trip (Smart Token or Tourist Metro Card recommended)",
        bookingOrHelpline: "1800-345-0033 / Kolkata Metro Help Desk at all terminals",
        tips: [
            "Purchase a multi-ride Smart Card or UPI QR ticket to avoid ticket counter lines.",
            "Shyambazar and Sovabazar stations directly serve North Kolkata Bonedi Bari circuits.",
            "Kalighat, Netaji Bhavan, and Rabindra Sarobar stations exit directly into South Kolkata mega pandals.",
            "Green Line connects Howrah Railway Station to Esplanade under the river in just 45 seconds!"
        ],
        coverImageUrl: "https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?auto=format&fit=crop&w=1200&q=80",
        isActive: true,
        sortOrder: 1
    },
    {
        name: "WBTDCL Official Puja Parikrama AC Buses",
        category: "WBTDCL Luxury Bus",
        operatingHours: "Morning Trips (8:00 AM - 2:00 PM) & Night Luxury Trails (8:00 PM - 4:00 AM)",
        routeDescription: "Dedicated AC Volvo coaches covering curated North, South, and suburban Puja trails with police escort.",
        fareGuide: "₹1,200 - ₹3,500 per seat (Includes traditional Bhog lunch/dinner & VIP pass entries)",
        bookingOrHelpline: "WBTDCL Helpline: +91 33 2243 7260 / Online Portal",
        tips: [
            "Official Government vetted tour with reserved priority entry at all pandals.",
            "Includes pure Bengali Bhog meals cooked by renowned traditional caterers.",
            "Accompanied by professional bilingual cultural guides."
        ],
        coverImageUrl: "https://images.unsplash.com/photo-1570125909232-eb263c188f7e?auto=format&fit=crop&w=1200&q=80",
        isActive: true,
        sortOrder: 2
    },
    {
        name: "Hooghly Riverfront Ferry & Immersion Vessels",
        category: "River Ferry & Cruise",
        operatingHours: "6:00 AM - 10:00 PM (Extended till 1:00 AM on Dashami for Immersion)",
        routeDescription: "Fairlie Place, Babughat, Howrah Station, Bagbazar Ghat, and Belur Math river jetties.",
        fareGuide: "₹6 to ₹20 for regular ferry; ₹500 - ₹1,800 for special evening cultural cruises",
        bookingOrHelpline: "WBSIDCL Riverine Transport Cell / Babughat Booking Jetty",
        tips: [
            "Avoid road congestion completely when travelling between Central Kolkata and Howrah/Belur Math.",
            "Dashami evening immersion cruise gives unobstructed views of idol immersion ceremonies.",
            "Stunning sunset photography of Howrah Bridge and Vidyasagar Setu."
        ],
        coverImageUrl: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=80",
        isActive: true,
        sortOrder: 3
    },
    {
        name: "Yatri Sathi Govt App Cabs & 24x7 Cabs",
        category: "App Cab & Taxi",
        operatingHours: "24x7 with designated Kolkata Police Fair-Fare kiosks",
        routeDescription: "City-wide on-demand cab network managed with West Bengal Govt monitoring.",
        fareGuide: "Govt regulated meter fare without surge gouging",
        bookingOrHelpline: "Download Yatri Sathi App (Android/iOS) or visit Police Yellow Cab booths at airport & railway stations",
        tips: [
            "Zero cancellation policy enforced by traffic authorities.",
            "Yellow cabs with blue beacon lights are authorized emergency night transit vehicles.",
            "Keep cash or UPI active for quick drop-offs near barricaded pedestrian zones."
        ],
        coverImageUrl: "https://images.unsplash.com/photo-1449965408869-eaa3f722e40d?auto=format&fit=crop&w=1200&q=80",
        isActive: true,
        sortOrder: 4
    }
];

const SEED_FESTIVAL_CALENDAR = [
    {
        tithiName: "Mahalaya",
        date: new Date("2026-10-10T06:00:00.000Z"),
        rituals: "Sacred Tarpan rituals at sunrise on Hooghly river banks; paying homage to ancestors. Radio broadcast of Birendra Krishna Bhadra's Mahishasuramardini at 4:00 AM.",
        tourismTips: "Arrive at Babughat or Bagbazar Ghat by 5:30 AM to witness hundreds of thousands offering prayers in the river mist.",
        bestTimeWindows: "4:30 AM - 8:30 AM",
        highlights: ["Tarpan at River Ghats", "Birendra Krishna Bhadra Chanting", "Artisans painting eyes of Durga (Chokkhudaan) in Kumartuli"],
        sortOrder: 1
    },
    {
        tithiName: "Maha Sasthi",
        date: new Date("2026-10-16T18:00:00.000Z"),
        rituals: "Kalparambho, Bodhon (awakening of the Goddess under Bilva tree), Amantran and Adhibas. The divine idol is unveiled in solemn Vedic chanting.",
        tourismTips: "Ideal evening to start pandal hopping before maximum weekend crowds arrive. Pandals are freshly illuminated and artists are present.",
        bestTimeWindows: "6:00 PM - 11:30 PM",
        highlights: ["Bodhon Rituals", "Unveiling of Idols", "Traditional Dhaak Drum Beats commence"],
        sortOrder: 2
    },
    {
        tithiName: "Maha Saptami",
        date: new Date("2026-10-17T07:00:00.000Z"),
        rituals: "Nabapatrika Snan (bathing of the 'Kola Bou' banana bride in the sacred river), Pran Pratistha, and first grand Saptami Pushpanjali.",
        tourismTips: "Watch the Nabapatrika procession at Bagbazar or Ahiritola ghats at 6:30 AM. Afternoon is prime time for traditional Bengali Bhog feasts.",
        bestTimeWindows: "6:30 AM - 10:30 AM (Ghats) & 8:00 PM - 3:00 AM (All-night parikrama)",
        highlights: ["Kola Bou Snan at Ghats", "Saptami Pushpanjali", "Community Street Food Stalls open 24x7"],
        sortOrder: 3
    },
    {
        tithiName: "Maha Ashtami",
        date: new Date("2026-10-18T10:00:00.000Z"),
        rituals: "The most sacred day: Maha Ashtami Vrata, Kumari Puja (worship of a young girl as Goddess), and the dramatic Sandhi Puja at the confluence of Ashtami and Navami with 108 lotus flowers and 108 clay lamps.",
        tourismTips: "Belur Math Kumari Puja starts at 9:00 AM (must arrive by 7:30 AM for seating). Experience Sandhi Puja at Shovabazar Rajbari or Maddox Square.",
        bestTimeWindows: "8:00 AM - 12:00 PM (Kumari Puja) & Conjunction time for Sandhi Puja",
        highlights: ["Kumari Puja at Belur Math", "108 Lotus Sandhi Puja", "Wearing traditional Dhoti & Lal-Par Saree"],
        sortOrder: 4
    },
    {
        tithiName: "Maha Navami",
        date: new Date("2026-10-19T18:00:00.000Z"),
        rituals: "Maha Aarti, Navami Homa, and the electrifying Dhunuchi Naach (incense burner dance performed to frenzied Dhak drumming).",
        tourismTips: "Peak festive night in Kolkata. The entire city is on foot till 4:00 AM. Best night for photography and street revelry.",
        bestTimeWindows: "7:00 PM - 4:00 AM (All-night carnival atmosphere)",
        highlights: ["Dhunuchi Naach Competitions", "Grand Lighting Illuminations", "Midnight Street Feasting"],
        sortOrder: 5
    },
    {
        tithiName: "Vijaya Dashami",
        date: new Date("2026-10-20T11:00:00.000Z"),
        rituals: "Darpan Bisarjan, traditional Sindoor Khela (vermilion play among married women), sweet exchange ('Shubho Bijoya'), and immersion of the clay idols into the Hooghly river.",
        tourismTips: "Witness Sindoor Khela between 10:00 AM - 1:00 PM at Bagbazar Sarbojanin or Maddox Square. Book a river cruise for the evening immersion.",
        bestTimeWindows: "10:00 AM - 1:30 PM (Sindoor Khela) & 4:30 PM - 9:30 PM (River Ghats)",
        highlights: ["Emotional Sindoor Khela", "Ghat Immersion Ceremonies", "Shubho Bijoya Sweets (Sandesh, Rosogolla)"],
        sortOrder: 6
    },
    {
        tithiName: "Red Road Immersion Carnival",
        date: new Date("2026-10-23T16:00:00.000Z"),
        rituals: "The grand finale: West Bengal Government's UNESCO Heritage Carnival where the top 100 award-winning Durga Puja clubs parade along Red Road.",
        tourismTips: "Special grandstands with reserved diaspora and tourist seating. Apply through Tourism Concierge for accreditation.",
        bestTimeWindows: "4:00 PM - 10:00 PM",
        highlights: ["100+ Award-Winning Tableaux", "International Diplomatic Delegates", "Traditional Chhau, Baul & Raibenshe Dancers"],
        sortOrder: 7
    }
];

const SEED_ITINERARIES = [
    {
        title: "3-Day Essential Kolkata Heritage & Megapandals",
        slug: "3-day-essential-heritage-megapandals",
        durationDays: 3,
        targetAudience: "Diaspora Visitors & First-Time Tourists",
        overview: "A perfectly balanced 72-hour journey capturing the historic soul of old Kolkata, top contemporary art pandals, and sacred rituals with zero stress.",
        includedHighlights: [
            "VIP Pandal Access & Guided Assistance",
            "North Kolkata 200-Year-Old Bonedi Bari Trail",
            "South Kolkata Avant-Garde Thematic Pandals",
            "Authentic Bengali Royal Bhog Dining Experience",
            "Kumartuli Artisan Colony Walk"
        ],
        coverImageUrl: "https://images.unsplash.com/photo-1601662528567-526cd06f6582?auto=format&fit=crop&w=1200&q=80",
        dayPlans: [
            {
                day: 1,
                title: "North Kolkata Aristocracy & Artisans Colony",
                morning: "Arrive in Kolkata, check into hotel. At 10:00 AM, walking tour of Kumartuli to observe final idol flourishes and potter artistry.",
                afternoon: "Traditional Bengali lunch at 6 Ballygunge Place / Oh! Calcutta. Rest and recharge.",
                evening: "Explore Shovabazar Rajbari and Laha Bari ancestral Pujas. Experience the serene courtyard devotional atmosphere.",
                night: "Visit Bagbazar Sarbojanin and College Square illuminated lake palace. Midnight Kolkata Biryani dinner at Arsalan.",
                pandals: ["Kumartuli Park", "Shovabazar Rajbari", "Bagbazar Sarbojanin", "College Square"],
                foodHighlights: "Kachori & Jalebi breakfast, authentic Ilish Paturi lunch, Dacre's Lane mutton stew.",
                transportTip: "Use North-South Metro Line 1 (Sovabazar Metro Station) to avoid traffic jams."
            },
            {
                day: 2,
                title: "South Kolkata Contemporary Art & Belur Math",
                morning: "Early boat ride to Belur Math for peaceful morning prayer and riverfront contemplation.",
                afternoon: "Special Durga Puja Bhog feast (Khichuri, Labra, Beguni, Payesh, Chutney).",
                evening: "Venture through South Kolkata's top art installations: Ekdalia Evergreen Club, Ballygunge Cultural, and Singhi Park.",
                night: "Maddox Square open-air cultural gathering. Immerse yourself in the youth adda and acoustic music.",
                pandals: ["Ekdalia Evergreen", "Ballygunge Cultural", "Singhi Park", "Maddox Square"],
                foodHighlights: "Community Bhog lunch, Kathi Rolls at Kusum Rolls, Mishti Doi at Balaram Mullick.",
                transportTip: "AC Tourist Coach with designated drop-off passes near Gariahat."
            },
            {
                day: 3,
                title: "Ritual Confluence & Farewell Celebrations",
                morning: "Witness morning Pushpanjali and traditional Dhunuchi dance demonstrations.",
                afternoon: "Rest and visit the Indian Museum or Victoria Memorial grounds.",
                evening: "Witness Sandhi Puja with 108 lamps at a heritage household. Spectacular illumination tour in Salt Lake / Sreebhumi.",
                night: "Riverfront ferry sunset, dinner celebration, and preparation for Dashami immersion.",
                pandals: ["Sreebhumi Sporting Club", "FD Block Salt Lake"],
                foodHighlights: "Kosha Mangsho at Golbari / Peter Cat Chelo Kebab.",
                transportTip: "Green Line underwater metro between Howrah and Esplanade."
            }
        ],
        isCurated: true,
        sortOrder: 1
    },
    {
        title: "5-Day Grand Durga Puja Odyssey (Sasthi to Dashami)",
        slug: "5-day-grand-durga-puja-odyssey",
        durationDays: 5,
        targetAudience: "Global Bengali Diaspora & Cultural Connoisseurs",
        overview: "The definitive full-festival immersion covering all five festive days: Bodhon rituals, Kumari Puja, Sandhi Puja, Dhunuchi Naach, Sindoor Khela, and river immersions.",
        includedHighlights: [
            "Complete Sasthi to Dashami Ritual Lifecycle",
            "Belur Math Kumari Puja Reserved Seating",
            "Sandhi Puja 108 Diya Illuminations",
            "Traditional Sindoor Khela Participation & Photography",
            "Private River Immersion Vessel on Dashami Evening"
        ],
        coverImageUrl: "https://images.unsplash.com/photo-1596461404969-9ae70f2830c1?auto=format&fit=crop&w=1200&q=80",
        dayPlans: [
            {
                day: 1,
                title: "Maha Sasthi: The Awakening (Bodhon)",
                morning: "Welcome reception at hotel. Orientation briefing on Puja etiquette and custom map distribution.",
                afternoon: "Artisans of Bengal workshop and handicraft market preview at Swabhumi.",
                evening: "Witness Maha Sasthi Bodhon ceremonies under Bilva tree; inaugural viewing of North Kolkata classics.",
                night: "Taste Kolkata street culinary delicacies on Park Street.",
                pandals: ["Kumartuli Park", "Bagbazar Sarbojanin"],
                foodHighlights: "Welcome Daab Sherbet, Phuchka, and Mughlai Paratha.",
                transportTip: "Dedicated private chauffeured AC vehicle for the full duration."
            },
            {
                day: 2,
                title: "Maha Saptami: Sacred River & Kola Bou Bath",
                morning: "6:30 AM excursion to the Hooghly riverbank to witness Nabapatrika Snan (Kola Bou bathing).",
                afternoon: "Saptami Pushpanjali participation followed by sumptuous Rajbari style lunch.",
                evening: "Central Kolkata heritage circuit: College Square, Mohammad Ali Park, and Bowbazar.",
                night: "First night parikrama till 2:00 AM taking in illuminated architectural replicas.",
                pandals: ["College Square", "Mohammad Ali Park", "Santosh Mitra Square"],
                foodHighlights: "Radhaballavi and Chholar Dal, Bhetki Paturi, Rosogolla.",
                transportTip: "Walking sections through heritage lanes with tour security."
            },
            {
                day: 3,
                title: "Maha Ashtami: Kumari Puja & 108 Lamp Sandhi Puja",
                morning: "Early departure to Belur Math for the transcendent Kumari Puja.",
                afternoon: "Sacred Mahashtami vegetarian feast.",
                evening: "Witness the intense energy of Sandhi Puja at an aristocratic palace with conch shells and cannons.",
                night: "Explore South Kolkata's crowning jewels: Suruchi Sangha, Chetla Agrani, Tridhara Sammilani.",
                pandals: ["Suruchi Sangha", "Chetla Agrani", "Tridhara Sammilani"],
                foodHighlights: "Khichuri bhog, Chhanar Dalna, Mango Chutney.",
                transportTip: "VIP Fast-Track entry badges provided."
            },
            {
                day: 4,
                title: "Maha Navami: Dhunuchi Naach & Midnight Revelry",
                morning: "Late relaxed morning. Heritage tram ride through colonial Kolkata.",
                afternoon: "Rest and royal Mughlai luncheon.",
                evening: "High-octane Dhunuchi Naach dances performed before the Goddess with burning coconut husk incense.",
                night: "Join millions on the illuminated boulevards of South Kolkata and Eastern Bypass.",
                pandals: ["Ekdalia Evergreen", "Singhi Park", "Sreebhumi"],
                foodHighlights: "Kolkata Mutton Biryani, Rezala, Sandesh.",
                transportTip: "All-night Metro services available."
            },
            {
                day: 5,
                title: "Vijaya Dashami: Sindoor Khela & River Immersion",
                morning: "Experience the deeply emotional Sindoor Khela ceremony with married women bidding farewell to Ma Durga.",
                afternoon: "Traditional Shubho Bijoya sweet-sharing gathering.",
                evening: "Board private chartered river vessel on the Hooghly to witness the immersion of idols amidst twilight flares.",
                night: "Grand farewell dinner celebrating Bengal cultural diplomacy.",
                pandals: ["Bagbazar Ghat", "Babu Ghat", "Maddox Square"],
                foodHighlights: "Labanga Latika, Joynagarer Moa, Darjeeling Tea.",
                transportTip: "Chartered River Cruise from Millennium Park Jetty."
            }
        ],
        isCurated: true,
        sortOrder: 2
    }
];

const SEED_KNOWLEDGE = [
    {
        category: "Cultural Etiquette",
        title: "Visitor Protocol & Cultural Etiquette",
        content: "Durga Puja in Bengal is a unique blend of solemn Vedic devotion and open-hearted secular carnival. When entering the sanctum sanctorum or ancestral household courtyards, remove your shoes and maintain silence during chanting. Modest, comfortable cotton attire is ideal for walking. Taking photographs is widely welcomed, but avoid using flash photography directly during aarti or sacred fires.",
        quickTips: [
            "Remove shoes at pandal inner sanctums.",
            "Photography is permitted in almost all public pandals.",
            "Wear comfortable sneakers or slip-on walking shoes.",
            "Accept prasad or sweets with your right hand."
        ],
        sortOrder: 1
    },
    {
        category: "Crowd Safety & Timing",
        title: "Beating the Crowds & Optimal Visiting Windows",
        content: "Over 10 million people celebrate on the streets of Kolkata during the peak nights. To experience the artwork in serenity, the early morning window (5:00 AM - 9:00 AM) offers nearly empty pandals with magical dawn light. The late afternoon (3:30 PM - 5:30 PM) is also pleasant before evening crowds surge. Between 8:00 PM and 1:00 AM queues at mega pandals can exceed 2 hours without VIP passes.",
        quickTips: [
            "Dawn 5:00 AM - 9:00 AM is best for crowd-free viewing and photography.",
            "Keep emergency contact numbers handy on paper.",
            "Stay hydrated; carry a refillable water bottle.",
            "Agree on a designated meeting spot in case group members get separated."
        ],
        sortOrder: 2
    },
    {
        category: "Emergency & Police Assistance",
        title: "Emergency Contacts & Tourist Safety Services",
        content: "Kolkata Police deploys over 40,000 officers, tourist assistance booths, and mobile first-aid units across the city during the festival. Every major pandal has a designated police assistance desk with medical personnel and lost-and-found services.",
        quickTips: [
            "Kolkata Police Emergency Helpline: 100 / 112 / 1090",
            "Tourist Police Cell: +91 33 2214 3644",
            "Ambulance Services: 102 / 108",
            "Women Helpline: 1091"
        ],
        sortOrder: 3
    },
    {
        category: "VIP Passes & Diaspora Services",
        title: "Tourist & Diaspora VIP Pass Information",
        content: "West Bengal Tourism provides accredited VIP and Diaspora Passes for overseas visitors, senior citizens, and official delegates. These passes grant access to priority express lanes at over 150 top pandals and access to the Red Road Carnival grandstand. You can request VIP pass assistance directly through the Tourism Concierge enquiry form.",
        quickTips: [
            "Carry a government photo ID or passport copy with your pass.",
            "One pass is typically valid for the bearer plus one companion.",
            "Priority entry operates through designated gate signs ('VIP / Tourism Pass')."
        ],
        sortOrder: 4
    },
    {
        category: "Food & Feasts",
        title: "Bhog, Feasts & Iconic Street Food Guide",
        content: "Durga Puja is Bengal's ultimate gastronomic carnival. Community pandals distribute sacred Bhog (Khichuri, fried vegetables, chutney, payesh) between 1:00 PM and 3:00 PM (tokens often distributed early morning). Kolkata's legendary restaurants stay open till dawn serving iconic dishes from Kolkata Biryani to Golda Chingri.",
        quickTips: [
            "Taste traditional Bhog on Saptami or Ashtami.",
            "Try street Phuchka at Vivekananda Park and Southern Avenue.",
            "Sample Kolkata Biryani at Arsalan, Shiraz, or Aminia.",
            "Indulge in festive sweets: Nolen Gur Sandesh, Mishti Doi, Cham Cham."
        ],
        sortOrder: 5
    }
];

const SEED_OPERATORS = [
    {
        name: "West Bengal Tourism Development Corporation (WBTDCL)",
        licenseNo: "WBTDCL/OFFICIAL/2026/001",
        operatorType: "Govt Accredited Tour Operator",
        contactPerson: "Tourism Concierge Officer",
        phone: "+91 33 2243 7260",
        email: "tourism@wb.gov.in",
        website: "https://wbtourism.gov.in",
        address: "Udayachal Tourist Lodge, DG Block, Sector II, Salt Lake, Kolkata 700091",
        rating: 4.8,
        isVerified: true,
        packagesOffered: [
            { name: "Sanatani Puja Parikrama (North Kolkata)", price: "₹1,800 / person", duration: "Daytime 8 AM - 3 PM", meals: "Bhog Included" },
            { name: "Utsav Special AC Coach (South Kolkata)", price: "₹2,200 / person", duration: "Evening 5 PM - 1 AM", meals: "Dinner Included" },
            { name: "Immersion River Cruise Package (Dashami)", price: "₹3,500 / person", duration: "Dashami Evening 4 PM - 9 PM", meals: "Festive High Tea" }
        ]
    },
    {
        name: "Bengal Heritage Walks & Cultural Tours",
        licenseNo: "INBOUND-WB-2024-883",
        operatorType: "Registered Heritage Tour Agency",
        contactPerson: "Anindita Roy",
        phone: "+91 98305 91823",
        email: "contact@bengalheritagewalks.com",
        website: "https://bengalheritagewalks.com",
        address: "12, Dr. Sarat Banerjee Road, Lake Market, Kolkata 700029",
        rating: 4.9,
        isVerified: true,
        packagesOffered: [
            { name: "Aristocratic Bonedi Bari Morning Walk", price: "₹1,200 / person", duration: "4 Hours (Morning 7 AM - 11 AM)" },
            { name: "Kumartuli Artisan Workshop & Clay Modeling", price: "₹950 / person", duration: "3 Hours" }
        ]
    },
    {
        name: "Kolkata City Explorers & Night Expeditions",
        licenseNo: "WB-TOUR-2023-412",
        operatorType: "Cultural Walking Tour Specialist",
        contactPerson: "Kaushik Sengupta",
        phone: "+91 91234 56789",
        email: "info@kolkatacityexplorers.in",
        website: "https://kolkatacityexplorers.in",
        address: "45, Shakespeare Sarani, Kolkata 700017",
        rating: 4.7,
        isVerified: true,
        packagesOffered: [
            { name: "Midnight Pandal Photography Safari", price: "₹2,500 / person", duration: "Night 11 PM - 4 AM", includes: "VIP passes, midnight cab, snacks" },
            { name: "Street Food & Puja Trail Combo", price: "₹1,500 / person", duration: "Evening 6 PM - 11 PM" }
        ]
    }
];

let TourismService = class TourismService {
    prisma;
    logger = new common_1.Logger(TourismService.name);
    isDbReady = false;

    constructor(prisma) {
        this.prisma = prisma;
    }

    async onModuleInit() {
        await this.initDatabaseTables();
    }

    async initDatabaseTables() {
        try {
            await this.prisma.$executeRawUnsafe(`
                CREATE TABLE IF NOT EXISTS tourism_circuits (
                    id SERIAL PRIMARY KEY,
                    name VARCHAR(255) NOT NULL,
                    slug VARCHAR(255) UNIQUE NOT NULL,
                    region VARCHAR(100) NOT NULL,
                    description TEXT NOT NULL,
                    highlight_pandals JSONB,
                    tags TEXT[] DEFAULT '{}',
                    duration VARCHAR(100) NOT NULL,
                    best_time_of_day VARCHAR(100),
                    recommended_transport VARCHAR(255),
                    crowd_level VARCHAR(50),
                    cover_image_url VARCHAR(1000),
                    gallery_images JSONB,
                    is_active BOOLEAN NOT NULL DEFAULT true,
                    is_featured BOOLEAN NOT NULL DEFAULT false,
                    sort_order INT NOT NULL DEFAULT 0,
                    created_at TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
                    updated_at TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
                    deleted_at TIMESTAMP(3)
                );
            `);

            await this.prisma.$executeRawUnsafe(`
                CREATE TABLE IF NOT EXISTS tourism_stays (
                    id SERIAL PRIMARY KEY,
                    name VARCHAR(255) NOT NULL,
                    slug VARCHAR(255) UNIQUE NOT NULL,
                    type VARCHAR(100) NOT NULL,
                    location TEXT NOT NULL,
                    city VARCHAR(100) NOT NULL DEFAULT 'Kolkata',
                    district VARCHAR(100) NOT NULL DEFAULT 'Kolkata',
                    price_range VARCHAR(100) NOT NULL,
                    budget_tier VARCHAR(50) NOT NULL DEFAULT 'MID_RANGE',
                    star_rating INT DEFAULT 3,
                    amenities TEXT[] DEFAULT '{}',
                    contact_phone VARCHAR(50),
                    contact_email VARCHAR(180),
                    booking_url VARCHAR(500),
                    description TEXT,
                    cover_image_url VARCHAR(1000),
                    is_wbtdc BOOLEAN NOT NULL DEFAULT false,
                    is_active BOOLEAN NOT NULL DEFAULT true,
                    is_featured BOOLEAN NOT NULL DEFAULT false,
                    created_at TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
                    updated_at TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
                );
            `);

            await this.prisma.$executeRawUnsafe(`
                CREATE TABLE IF NOT EXISTS tourism_transports (
                    id SERIAL PRIMARY KEY,
                    name VARCHAR(255) NOT NULL,
                    category VARCHAR(100) NOT NULL,
                    operating_hours VARCHAR(255) NOT NULL,
                    route_description TEXT NOT NULL,
                    fare_guide VARCHAR(255) NOT NULL,
                    booking_or_helpline VARCHAR(255),
                    tips JSONB,
                    cover_image_url VARCHAR(1000),
                    is_active BOOLEAN NOT NULL DEFAULT true,
                    sort_order INT NOT NULL DEFAULT 0,
                    created_at TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
                    updated_at TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
                );
            `);

            await this.prisma.$executeRawUnsafe(`
                CREATE TABLE IF NOT EXISTS tourism_festival_days (
                    id SERIAL PRIMARY KEY,
                    tithi_name VARCHAR(100) NOT NULL,
                    date TIMESTAMP(3) NOT NULL,
                    rituals TEXT NOT NULL,
                    tourism_tips TEXT NOT NULL,
                    best_time_windows VARCHAR(255) NOT NULL,
                    highlights JSONB,
                    sort_order INT NOT NULL DEFAULT 0,
                    created_at TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
                    updated_at TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
                );
            `);

            await this.prisma.$executeRawUnsafe(`
                CREATE TABLE IF NOT EXISTS tourism_itineraries (
                    id SERIAL PRIMARY KEY,
                    title VARCHAR(255) NOT NULL,
                    slug VARCHAR(255) UNIQUE NOT NULL,
                    duration_days INT NOT NULL DEFAULT 3,
                    target_audience VARCHAR(150) NOT NULL,
                    overview TEXT NOT NULL,
                    day_plans JSONB NOT NULL,
                    included_highlights TEXT[] DEFAULT '{}',
                    cover_image_url TEXT,
                    is_curated BOOLEAN NOT NULL DEFAULT true,
                    is_active BOOLEAN NOT NULL DEFAULT true,
                    sort_order INT NOT NULL DEFAULT 0,
                    created_at TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
                    updated_at TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
                );
            `);

            await this.prisma.$executeRawUnsafe(`
                CREATE TABLE IF NOT EXISTS tourism_knowledge (
                    id SERIAL PRIMARY KEY,
                    category VARCHAR(100) NOT NULL,
                    title VARCHAR(255) NOT NULL,
                    content TEXT NOT NULL,
                    quick_tips TEXT[] DEFAULT '{}',
                    sort_order INT NOT NULL DEFAULT 0,
                    is_active BOOLEAN NOT NULL DEFAULT true,
                    created_at TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
                    updated_at TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
                );
            `);

            await this.prisma.$executeRawUnsafe(`
                CREATE TABLE IF NOT EXISTS tourism_operators (
                    id SERIAL PRIMARY KEY,
                    name VARCHAR(255) NOT NULL,
                    license_no VARCHAR(100),
                    operator_type VARCHAR(100) NOT NULL,
                    contact_person VARCHAR(150),
                    phone VARCHAR(50) NOT NULL,
                    email VARCHAR(180) NOT NULL,
                    website VARCHAR(500),
                    address TEXT,
                    packages_offered JSONB,
                    rating NUMERIC(2, 1) DEFAULT 4.5,
                    is_verified BOOLEAN NOT NULL DEFAULT true,
                    is_active BOOLEAN NOT NULL DEFAULT true,
                    created_at TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
                    updated_at TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
                );
            `);

            await this.prisma.$executeRawUnsafe(`
                CREATE TABLE IF NOT EXISTS tourism_enquiries (
                    id SERIAL PRIMARY KEY,
                    enquiry_code VARCHAR(50) UNIQUE NOT NULL,
                    full_name VARCHAR(150) NOT NULL,
                    email VARCHAR(180) NOT NULL,
                    phone VARCHAR(50) NOT NULL,
                    country VARCHAR(100) NOT NULL DEFAULT 'India',
                    city VARCHAR(100),
                    number_of_travellers INT NOT NULL DEFAULT 1,
                    start_date TIMESTAMP(3),
                    end_date TIMESTAMP(3),
                    duration_preference VARCHAR(100),
                    preferred_circuits JSONB,
                    interests TEXT[] DEFAULT '{}',
                    stay_preference VARCHAR(100),
                    transport_preference VARCHAR(100),
                    puja_preferences TEXT[] DEFAULT '{}',
                    special_requirements TEXT,
                    status VARCHAR(50) NOT NULL DEFAULT 'NEW',
                    assigned_to_id INT,
                    admin_remarks TEXT,
                    consent_given BOOLEAN NOT NULL DEFAULT true,
                    preferred_language VARCHAR(10) NOT NULL DEFAULT 'en',
                    created_at TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
                    updated_at TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
                );
            `);

            await this.prisma.$executeRawUnsafe(`
                CREATE TABLE IF NOT EXISTS tourism_enquiry_history (
                    id SERIAL PRIMARY KEY,
                    enquiry_id INT NOT NULL,
                    changed_by_id INT,
                    action VARCHAR(50) NOT NULL,
                    from_status VARCHAR(50),
                    to_status VARCHAR(50),
                    comment TEXT,
                    created_at TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
                );
            `);

            // Seed if circuits are empty
            const circuitCount = await this.prisma.$queryRawUnsafe(`SELECT COUNT(*)::int AS cnt FROM tourism_circuits WHERE deleted_at IS NULL;`);
            if ((circuitCount[0]?.cnt ?? 0) === 0) {
                this.logger.log('Seeding initial Tourism Concierge circuits, stays, transport, calendar, itineraries, knowledge, operators...');
                
                // Circuits
                for (const c of SEED_CIRCUITS) {
                    await this.prisma.$executeRawUnsafe(`
                        INSERT INTO tourism_circuits (name, slug, region, description, duration, best_time_of_day, recommended_transport, crowd_level, tags, cover_image_url, highlight_pandals, is_featured, sort_order, updated_at)
                        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11::jsonb, $12, $13, NOW())
                        ON CONFLICT (slug) DO NOTHING;
                    `, c.name, c.slug, c.region, c.description, c.duration, c.bestTimeOfDay, c.recommendedTransport, c.crowdLevel, c.tags, c.coverImageUrl, JSON.stringify(c.highlightPandals), c.isFeatured, c.sortOrder);
                }

                // Stays
                for (const s of SEED_STAYS) {
                    await this.prisma.$executeRawUnsafe(`
                        INSERT INTO tourism_stays (name, slug, type, location, city, district, price_range, budget_tier, star_rating, amenities, contact_phone, contact_email, booking_url, description, cover_image_url, is_wbtdc, is_featured, updated_at)
                        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, NOW())
                        ON CONFLICT (slug) DO NOTHING;
                    `, s.name, s.slug, s.type, s.location, s.city, s.district, s.priceRange, s.budgetTier, s.starRating, s.amenities, s.contactPhone, s.contactEmail, s.bookingUrl, s.description, s.coverImageUrl, s.isWbtdc, s.isFeatured);
                }

                // Transports
                for (const t of SEED_TRANSPORTS) {
                    await this.prisma.$executeRawUnsafe(`
                        INSERT INTO tourism_transports (name, category, operating_hours, route_description, fare_guide, booking_or_helpline, tips, cover_image_url, is_active, sort_order, updated_at)
                        VALUES ($1, $2, $3, $4, $5, $6, $7::jsonb, $8, $9, $10, NOW());
                    `, t.name, t.category, t.operatingHours, t.routeDescription, t.fareGuide, t.bookingOrHelpline, JSON.stringify(t.tips), t.coverImageUrl, t.isActive, t.sortOrder);
                }

                // Festival Calendar
                for (const f of SEED_FESTIVAL_CALENDAR) {
                    await this.prisma.$executeRawUnsafe(`
                        INSERT INTO tourism_festival_days (tithi_name, date, rituals, tourism_tips, best_time_windows, highlights, sort_order, updated_at)
                        VALUES ($1, $2, $3, $4, $5, $6::jsonb, $7, NOW());
                    `, f.tithiName, f.date, f.rituals, f.tourismTips, f.bestTimeWindows, JSON.stringify(f.highlights), f.sortOrder);
                }

                // Itineraries
                for (const it of SEED_ITINERARIES) {
                    await this.prisma.$executeRawUnsafe(`
                        INSERT INTO tourism_itineraries (title, slug, duration_days, target_audience, overview, day_plans, included_highlights, cover_image_url, is_curated, sort_order, updated_at)
                        VALUES ($1, $2, $3, $4, $5, $6::jsonb, $7, $8, $9, $10, NOW())
                        ON CONFLICT (slug) DO NOTHING;
                    `, it.title, it.slug, it.durationDays, it.targetAudience, it.overview, JSON.stringify(it.dayPlans), it.includedHighlights, it.coverImageUrl, it.isCurated, it.sortOrder);
                }

                // Knowledge
                for (const k of SEED_KNOWLEDGE) {
                    await this.prisma.$executeRawUnsafe(`
                        INSERT INTO tourism_knowledge (category, title, content, quick_tips, sort_order, updated_at)
                        VALUES ($1, $2, $3, $4, $5, NOW());
                    `, k.category, k.title, k.content, k.quickTips, k.sortOrder);
                }

                // Operators
                for (const op of SEED_OPERATORS) {
                    await this.prisma.$executeRawUnsafe(`
                        INSERT INTO tourism_operators (name, license_no, operator_type, contact_person, phone, email, website, address, packages_offered, rating, is_verified, updated_at)
                        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9::jsonb, $10, $11, NOW());
                    `, op.name, op.licenseNo, op.operatorType, op.contactPerson, op.phone, op.email, op.website, op.address, JSON.stringify(op.packagesOffered), op.rating, op.isVerified);
                }

                // Sample Enquiry
                const sampleCode = 'TC-2026-DEMO01';
                const enqRes = await this.prisma.$queryRawUnsafe(`
                    INSERT INTO tourism_enquiries (enquiry_code, full_name, email, phone, country, city, number_of_travellers, duration_preference, interests, stay_preference, transport_preference, special_requirements, status, consent_given, updated_at)
                    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, NOW())
                    RETURNING id;
                `, sampleCode, 'Priyanka Mukherjee', 'priyanka.mukherjee@example.com', '+44 7911 123456', 'United Kingdom', 'London', 3, '3-4 Days', ['Heritage', 'Bonedi Bari', 'VIP Pass'], 'WBTDCL Govt Lodge', 'Metro & AC Bus', 'Travelling with elderly mother; request wheelchair accessibility info and VIP Pandal Pass advice.', 'NEW', true);

                if (enqRes[0]?.id) {
                    await this.prisma.$executeRawUnsafe(`
                        INSERT INTO tourism_enquiry_history (enquiry_id, action, from_status, to_status, comment)
                        VALUES ($1, 'CREATED', NULL, 'NEW', 'Enquiry submitted online via Tourism Concierge portal.');
                    `, enqRes[0].id);
                }

                this.logger.log('Tourism Concierge tables verified and seeded successfully.');
            }

            // Ensure cover_image_url is TEXT across tourism tables to support rich data URLs and long image links
            try {
                await this.prisma.$executeRawUnsafe(`ALTER TABLE tourism_itineraries ALTER COLUMN cover_image_url TYPE text;`);
                await this.prisma.$executeRawUnsafe(`ALTER TABLE tourism_circuits ALTER COLUMN cover_image_url TYPE text;`);
                await this.prisma.$executeRawUnsafe(`ALTER TABLE tourism_stays ALTER COLUMN cover_image_url TYPE text;`);
                await this.prisma.$executeRawUnsafe(`ALTER TABLE tourism_transports ALTER COLUMN cover_image_url TYPE text;`);
            } catch {
                // Silently ignore if table does not exist or already altered
            }

            // Sync any existing legacy operator types to match standard master taxonomy subcategories
            try {
                await this.prisma.$executeRawUnsafe(`
                    UPDATE tourism_operators SET operator_type = 'Govt Accredited Tour Operator' WHERE operator_type = 'Government Authority';
                    UPDATE tourism_operators SET operator_type = 'Registered Heritage Tour Agency' WHERE operator_type = 'Accredited Heritage Operator';
                    UPDATE tourism_operators SET operator_type = 'Cultural Walking Tour Specialist' WHERE operator_type = 'Specialty Night Tour Operator';
                `);
            } catch {
                // Silently ignore if table does not exist or query fails
            }

            // Ensure Transport Category and Subcategories in Master Data (Taxonomy)
            await this.ensureTransportMasterData();

            // Ensure Circuit Category and Subcategories in Master Data (Taxonomy)
            await this.ensureCircuitMasterData();

            // Ensure Tour Operator Category and Subcategories in Master Data (Taxonomy)
            await this.ensureTourOperatorMasterData();

            this.isDbReady = true;
        } catch (err) {
            this.logger.error(`Error initializing Tourism Concierge database tables: ${err.message}`, err.stack);
        }
    }

    async ensureTransportMasterData() {
        try {
            let transportCat = await this.prisma.category.findUnique({
                where: { slug: 'transport' }
            });

            if (!transportCat) {
                transportCat = await this.prisma.category.create({
                    data: {
                        name: 'Transport',
                        slug: 'transport',
                        description: 'Festive transit options, metro corridors, special parikrama buses, river ferries, and local shuttles.',
                        status: 'ACTIVE',
                    }
                });
                this.logger.log(`Created master Category 'Transport' (ID: ${transportCat.id})`);
            }

            const defaultSubcats = [
                { name: 'Metro Corridor', slug: 'metro-corridor', description: 'Kolkata Metro Blue, Green, and Purple corridor services.' },
                { name: 'Special AC Bus / Parikrama Coach', slug: 'special-ac-bus-parikrama-coach', description: 'WBTDCL & state luxury festival parikrama bus tours.' },
                { name: 'Heritage River Cruise & Ferry', slug: 'heritage-river-cruise-ferry', description: 'Ganga river ferry crossings and ghat cruise vessels.' },
                { name: 'Tourist Taxi & App Cab', slug: 'tourist-taxi-app-cab', description: 'Official prepaid taxi stands and app cab pickup zones.' },
                { name: 'Suburban Railway', slug: 'suburban-railway', description: 'Eastern & South Eastern Railway EMU special festival locals.' },
                { name: 'Heritage Tramway', slug: 'heritage-tramway', description: 'Heritage Kolkata tram routes and vintage festival rides.' },
                { name: 'E-Rickshaw & Local Shuttle', slug: 'e-rickshaw-local-shuttle', description: 'Last-mile neighbourhood battery rickshaws and puja shuttles.' },
            ];

            for (const sub of defaultSubcats) {
                const existing = await this.prisma.subcategory.findFirst({
                    where: { categoryId: transportCat.id, slug: sub.slug }
                });
                if (!existing) {
                    await this.prisma.subcategory.create({
                        data: {
                            categoryId: transportCat.id,
                            name: sub.name,
                            slug: sub.slug,
                            description: sub.description,
                            status: 'ACTIVE',
                        }
                    });
                }
            }
        } catch (err) {
            this.logger.warn(`Could not sync transport master taxonomy: ${err.message}`);
        }
    }

    async syncSubcategoryToMaster(subcategoryName) {
        try {
            if (!subcategoryName || typeof subcategoryName !== 'string') return;
            let transportCat = await this.prisma.category.findUnique({
                where: { slug: 'transport' }
            });
            if (!transportCat) {
                transportCat = await this.prisma.category.create({
                    data: {
                        name: 'Transport',
                        slug: 'transport',
                        description: 'Festive transit options, metro lines, special buses, river cruises, and local shuttles.',
                        status: 'ACTIVE',
                    }
                });
            }
            const slug = (0, shared_1.slugify)(subcategoryName.trim());
            const existing = await this.prisma.subcategory.findFirst({
                where: { categoryId: transportCat.id, slug }
            });
            if (!existing) {
                await this.prisma.subcategory.create({
                    data: {
                        categoryId: transportCat.id,
                        name: subcategoryName.trim(),
                        slug,
                        description: `${subcategoryName} transport service for Durga Puja festive transit.`,
                        status: 'ACTIVE',
                    }
                });
            }
        } catch (err) {
            // Silently continue
        }
    }

    async ensureCircuitMasterData() {
        try {
            let circuitCat = await this.prisma.category.findUnique({
                where: { slug: 'circuit' }
            });

            if (!circuitCat) {
                circuitCat = await this.prisma.category.create({
                    data: {
                        name: 'Circuit',
                        slug: 'circuit',
                        description: 'Curated pilgrimage circuits, thematic art trails, heritage walking circuits, and festive corridor zones.',
                        status: 'ACTIVE',
                    }
                });
                this.logger.log(`Created master Category 'Circuit' (ID: ${circuitCat.id})`);
            }

            const defaultSubcats = [
                { name: 'North Kolkata Heritage & Bonedi Bari', slug: 'north-kolkata-heritage-bonedi-bari', description: 'Ancestral bonedi bari and century-old traditional household pujas in North Kolkata.' },
                { name: 'South Kolkata Contemporary & Art Odyssey', slug: 'south-kolkata-art-odyssey', description: 'Thematic art installations, modern architectural megapandals, and youth cultural trails.' },
                { name: 'Central Kolkata & Colonial Riverbank', slug: 'central-kolkata-riverbank-trail', description: 'Historic water tank illumination, College Square, and Kumartuli artisan quarters.' },
                { name: 'Salt Lake & Eastern Corridor', slug: 'salt-lake-eastern-corridor', description: 'Sprawling parkland spectacles, Sreebhumi architectural replicas, and modern thematic pavilions.' },
                { name: 'Howrah & Hooghly Riverfront', slug: 'howrah-hooghly-riverfront', description: 'Sacred riverfront ghat celebrations, Belur Math, and historic riverside pujas.' },
                { name: 'Rarh Bengal & Santiniketan', slug: 'rarh-bengal-santiniketan', description: 'Terracotta temple pujas, rural Bengal cultural traditions, and Santiniketan festive spirit.' },
            ];

            for (const sub of defaultSubcats) {
                const existing = await this.prisma.subcategory.findFirst({
                    where: { categoryId: circuitCat.id, slug: sub.slug }
                });
                if (!existing) {
                    await this.prisma.subcategory.create({
                        data: {
                            categoryId: circuitCat.id,
                            name: sub.name,
                            slug: sub.slug,
                            description: sub.description,
                            status: 'ACTIVE',
                        }
                    });
                }
            }
        } catch (err) {
            this.logger.warn(`Could not sync circuit master taxonomy: ${err.message}`);
        }
    }

    async syncCircuitSubcategoryToMaster(subcategoryName) {
        try {
            if (!subcategoryName || typeof subcategoryName !== 'string') return;
            let circuitCat = await this.prisma.category.findUnique({
                where: { slug: 'circuit' }
            });
            if (!circuitCat) {
                circuitCat = await this.prisma.category.create({
                    data: {
                        name: 'Circuit',
                        slug: 'circuit',
                        description: 'Curated pilgrimage circuits, thematic art trails, heritage walking circuits, and festive corridor zones.',
                        status: 'ACTIVE',
                    }
                });
            }
            const slug = (0, shared_1.slugify)(subcategoryName.trim());
            const existing = await this.prisma.subcategory.findFirst({
                where: { categoryId: circuitCat.id, slug }
            });
            if (!existing) {
                await this.prisma.subcategory.create({
                    data: {
                        categoryId: circuitCat.id,
                        name: subcategoryName.trim(),
                        slug,
                        description: `${subcategoryName} circuit for Durga Puja pilgrimage trails.`,
                        status: 'ACTIVE',
                    }
                });
            }
        } catch (err) {
            // Silently continue
        }
    }

    async ensureTourOperatorMasterData() {
        try {
            let operatorCat = await this.prisma.category.findUnique({
                where: { slug: 'tour-operator' }
            });

            if (!operatorCat) {
                operatorCat = await this.prisma.category.create({
                    data: {
                        name: 'Tour Operator',
                        slug: 'tour-operator',
                        description: 'Certified travel agencies, government-accredited operators, heritage tour guides, and luxury concierge partners.',
                        status: 'ACTIVE',
                    }
                });
                this.logger.log(`Created master Category 'Tour Operator' (ID: ${operatorCat.id})`);
            }

            const defaultSubcats = [
                { name: 'Govt Accredited Tour Operator', slug: 'govt-accredited-tour-operator', description: 'Ministry of Tourism & WBTDCL recognized official travel agencies.' },
                { name: 'WBTDCL Approved Partner', slug: 'wbtdcl-approved-partner', description: 'Official West Bengal Tourism Development Corporation franchise partners.' },
                { name: 'Registered Heritage Tour Agency', slug: 'registered-heritage-tour-agency', description: 'Specialized historical walks, rajbari tours, and cultural immersion organizers.' },
                { name: 'Cultural Walking Tour Specialist', slug: 'cultural-walking-tour-specialist', description: 'Curated heritage walks through Kumartuli, Bonedi Bari, and artist quarters.' },
                { name: 'Luxury VIP Parikrama Service', slug: 'luxury-vip-parikrama-service', description: 'Chauffeured luxury coach parikrama tours with express pandal access.' },
                { name: 'Private Destination Management Company', slug: 'private-destination-management-company', description: 'Full-service incoming travel management companies for diaspora & international groups.' },
                { name: 'Festival Transport & Logistics Partner', slug: 'festival-transport-logistics-partner', description: 'Fleet operators, tourist AC buses, and festival mobility coordinators.' },
            ];

            for (const sub of defaultSubcats) {
                const existing = await this.prisma.subcategory.findFirst({
                    where: { categoryId: operatorCat.id, slug: sub.slug }
                });
                if (!existing) {
                    await this.prisma.subcategory.create({
                        data: {
                            categoryId: operatorCat.id,
                            name: sub.name,
                            slug: sub.slug,
                            description: sub.description,
                            status: 'ACTIVE',
                        }
                    });
                }
            }
        } catch (err) {
            this.logger.warn(`Could not sync tour operator master taxonomy: ${err.message}`);
        }
    }

    async syncOperatorSubcategoryToMaster(subcategoryName) {
        try {
            if (!subcategoryName || typeof subcategoryName !== 'string') return;
            let operatorCat = await this.prisma.category.findUnique({
                where: { slug: 'tour-operator' }
            });
            if (!operatorCat) {
                operatorCat = await this.prisma.category.create({
                    data: {
                        name: 'Tour Operator',
                        slug: 'tour-operator',
                        description: 'Certified travel agencies, government-accredited operators, heritage tour guides, and luxury concierge partners.',
                        status: 'ACTIVE',
                    }
                });
            }
            const slug = (0, shared_1.slugify)(subcategoryName.trim());
            const existing = await this.prisma.subcategory.findFirst({
                where: { categoryId: operatorCat.id, slug }
            });
            if (!existing) {
                await this.prisma.subcategory.create({
                    data: {
                        categoryId: operatorCat.id,
                        name: subcategoryName.trim(),
                        slug,
                        description: `${subcategoryName} tour operator classification for Durga Puja tourism.`,
                        status: 'ACTIVE',
                    }
                });
            }
        } catch (err) {
            // Silently continue
        }
    }

    // ---------------------------------------------------------------------------
    // Public Listings
    // ---------------------------------------------------------------------------

    async getCircuits(query = {}) {
        let sql = `SELECT * FROM tourism_circuits WHERE deleted_at IS NULL AND is_active = true`;
        const params = [];
        let pIndex = 1;

        if (query.region && query.region !== 'all') {
            sql += ` AND region = $${pIndex++}`;
            params.push(query.region);
        }
        if (query.search) {
            sql += ` AND (name ILIKE $${pIndex} OR description ILIKE $${pIndex})`;
            params.push(`%${query.search}%`);
            pIndex++;
        }
        sql += ` ORDER BY sort_order ASC, id ASC`;

        const rows = await this.prisma.$queryRawUnsafe(sql, ...params);
        return rows.map(r => this.mapCircuit(r));
    }

    async getCircuitBySlug(slug) {
        const rows = await this.prisma.$queryRawUnsafe(
            `SELECT * FROM tourism_circuits WHERE slug = $1 AND deleted_at IS NULL LIMIT 1;`,
            slug
        );
        if (!rows || rows.length === 0) {
            throw shared_1.ServiceException.notFound(`Circuit '${slug}' not found`);
        }
        const circuit = this.mapCircuit(rows[0]);

        // Enrich highlight pandals with live Pandal Atlas entries if available
        try {
            const pandals = await this.prisma.pandalAtlas.findMany({
                where: { status: 'APPROVED', deletedAt: null },
                select: { id: true, name: true, location: true, latitude: true, longitude: true, timing: true, photos: true, virtualTourUrl: true }
            });
            const pandalByName = new Map(pandals.map(p => [p.name.toLowerCase().trim(), p]));

            if (Array.isArray(circuit.highlightPandals)) {
                circuit.highlightPandals = circuit.highlightPandals.map(hp => {
                    const match = pandalByName.get(hp.name.toLowerCase().trim());
                    if (match) {
                        return {
                            ...hp,
                            pandalAtlasId: match.id,
                            latitude: Number(match.latitude),
                            longitude: Number(match.longitude),
                            timing: match.timing,
                            photos: match.photos,
                            virtualTourUrl: match.virtualTourUrl
                        };
                    }
                    return hp;
                });
            }
        } catch (e) {
            // Non-blocking enrichment
        }

        return circuit;
    }

    async getStays(query = {}) {
        let sql = `SELECT * FROM tourism_stays WHERE is_active = true`;
        const params = [];
        let pIndex = 1;

        if (query.type && query.type !== 'all') {
            sql += ` AND type ILIKE $${pIndex++}`;
            params.push(`%${query.type}%`);
        }
        if (query.isWbtdc !== undefined && query.isWbtdc !== '') {
            sql += ` AND is_wbtdc = $${pIndex++}`;
            params.push(String(query.isWbtdc) === 'true');
        }
        if (query.budgetTier && query.budgetTier !== 'all') {
            sql += ` AND budget_tier = $${pIndex++}`;
            params.push(query.budgetTier);
        }
        if (query.search) {
            sql += ` AND (name ILIKE $${pIndex} OR location ILIKE $${pIndex} OR city ILIKE $${pIndex})`;
            params.push(`%${query.search}%`);
            pIndex++;
        }
        sql += ` ORDER BY is_featured DESC, is_wbtdc DESC, id ASC`;

        const rows = await this.prisma.$queryRawUnsafe(sql, ...params);
        return rows.map(r => this.mapStay(r));
    }

    async getTransports() {
        const rows = await this.prisma.$queryRawUnsafe(
            `SELECT * FROM tourism_transports WHERE is_active = true ORDER BY sort_order ASC, id ASC;`
        );
        return rows.map(r => this.mapTransport(r));
    }

    async getFestivalCalendar() {
        const rows = await this.prisma.$queryRawUnsafe(
            `SELECT * FROM tourism_festival_days ORDER BY sort_order ASC, date ASC;`
        );
        return rows.map(r => this.mapFestivalDay(r));
    }

    async getItineraries(query = {}) {
        let sql = `SELECT * FROM tourism_itineraries WHERE is_active = true`;
        const params = [];
        let pIndex = 1;

        if (query.durationDays) {
            sql += ` AND duration_days = $${pIndex++}`;
            params.push(Number(query.durationDays));
        }
        sql += ` ORDER BY sort_order ASC, duration_days ASC`;

        const rows = await this.prisma.$queryRawUnsafe(sql, ...params);
        return rows.map(r => this.mapItinerary(r));
    }

    async getItineraryBySlug(slug) {
        const rows = await this.prisma.$queryRawUnsafe(
            `SELECT * FROM tourism_itineraries WHERE slug = $1 AND is_active = true LIMIT 1;`,
            slug
        );
        if (!rows || rows.length === 0) {
            throw shared_1.ServiceException.notFound(`Itinerary '${slug}' not found`);
        }
        return this.mapItinerary(rows[0]);
    }

    async getKnowledge() {
        const rows = await this.prisma.$queryRawUnsafe(
            `SELECT * FROM tourism_knowledge WHERE is_active = true ORDER BY sort_order ASC, id ASC;`
        );
        return rows.map(r => this.mapKnowledge(r));
    }

    async getOperators() {
        const rows = await this.prisma.$queryRawUnsafe(
            `SELECT * FROM tourism_operators WHERE is_active = true ORDER BY is_verified DESC, rating DESC, id ASC;`
        );
        return rows.map(r => this.mapOperator(r));
    }

    // ---------------------------------------------------------------------------
    // Recommendation Engine
    // ---------------------------------------------------------------------------

    async getRecommendations(req) {
        const circuits = await this.getCircuits();
        const stays = await this.getStays();
        const transports = await this.getTransports();
        const itineraries = await this.getItineraries();
        const calendar = await this.getFestivalCalendar();

        const durationStr = (req.duration || '').toLowerCase();
        const travellersStr = (req.travellers || '').toLowerCase();
        const interests = Array.isArray(req.interests) ? req.interests.map(i => i.toLowerCase()) : [];
        const regions = Array.isArray(req.regions) ? req.regions.map(r => r.toLowerCase()) : [];
        const stayPref = (req.stayPreference || '').toLowerCase();
        const transPref = (req.transportPreference || '').toLowerCase();
        const pujaPrefs = Array.isArray(req.pujaPreferences) ? req.pujaPreferences.map(p => p.toLowerCase()) : [];

        // Score circuits
        const scoredCircuits = circuits.map(c => {
            let score = 50;
            const cRegion = c.region.toLowerCase();
            const cTags = (c.tags || []).map(t => t.toLowerCase());

            // Region match
            if (regions.length > 0 && regions.some(r => cRegion.includes(r) || r.includes(cRegion))) {
                score += 35;
            }
            // Interest match
            interests.forEach(interest => {
                if (cTags.some(t => t.includes(interest) || interest.includes(t)) ||
                    c.description.toLowerCase().includes(interest) ||
                    c.name.toLowerCase().includes(interest)) {
                    score += 20;
                }
            });
            // Travellers match
            if (travellersStr.includes('senior') && (c.crowdLevel === 'Moderate' || c.tags.includes('Heritage'))) {
                score += 15;
            }
            if (travellersStr.includes('family') && (c.region.includes('Salt Lake') || c.region.includes('Central'))) {
                score += 15;
            }
            if (pujaPrefs.some(p => p.includes('carnival')) && c.slug.includes('carnival')) {
                score += 40;
            }
            if (pujaPrefs.some(p => p.includes('bonedi')) && c.slug.includes('bonedi')) {
                score += 35;
            }

            return {
                circuit: c,
                matchScore: Math.min(100, score),
                matchReasons: [
                    regions.length > 0 && regions.some(r => cRegion.includes(r)) ? `Aligns with preferred region: ${c.region}` : null,
                    interests.length > 0 ? `Matches interests: ${c.tags.slice(0, 2).join(', ')}` : null,
                    c.isFeatured ? 'Curated West Bengal Tourism Highlight' : null
                ].filter(Boolean)
            };
        });

        scoredCircuits.sort((a, b) => b.matchScore - a.matchScore);
        const topCircuits = scoredCircuits.slice(0, 3);

        // Match Itinerary
        let daysWanted = 3;
        if (durationStr.includes('1') || durationStr.includes('2')) daysWanted = 2;
        else if (durationStr.includes('4')) daysWanted = 4;
        else if (durationStr.includes('5') || durationStr.includes('week')) daysWanted = 5;

        let matchedItinerary = itineraries.find(it => it.durationDays === daysWanted) || itineraries[0];

        // Filter Stays
        let matchedStays = stays;
        if (stayPref.includes('wbtdc') || stayPref.includes('govt')) {
            matchedStays = stays.filter(s => s.isWbtdc);
        } else if (stayPref.includes('heritage')) {
            matchedStays = stays.filter(s => s.type.toLowerCase().includes('heritage'));
        } else if (stayPref.includes('luxury') || stayPref.includes('5-star')) {
            matchedStays = stays.filter(s => s.budgetTier === 'LUXURY' || s.starRating === 5);
        }
        if (matchedStays.length === 0) matchedStays = stays.slice(0, 3);

        // Suggested Transport
        let matchedTransports = transports;
        if (transPref.includes('metro')) {
            matchedTransports = transports.filter(t => t.category.toLowerCase().includes('metro'));
        } else if (transPref.includes('bus') || transPref.includes('parikrama')) {
            matchedTransports = transports.filter(t => t.category.toLowerCase().includes('bus'));
        } else if (transPref.includes('ferry') || transPref.includes('river') || transPref.includes('cruise')) {
            matchedTransports = transports.filter(t => t.category.toLowerCase().includes('ferry'));
        }
        if (matchedTransports.length === 0) matchedTransports = transports.slice(0, 2);

        // Personalized summary recommendation
        const summary = `Based on your request for a ${req.duration || '3-day'} visit for ${req.travellers || 'travellers'}, we recommend exploring the "${topCircuits[0]?.circuit.name}" accompanied by the "${matchedItinerary?.title}". We recommend staying at ${matchedStays[0]?.name} and utilizing ${matchedTransports[0]?.name} for seamless festive transit.`;

        return {
            recommendedCircuits: topCircuits,
            recommendedItinerary: matchedItinerary,
            suggestedStays: matchedStays.slice(0, 3),
            recommendedTransports: matchedTransports.slice(0, 2),
            pertinentCalendarDays: calendar.slice(1, 6),
            summaryNote: summary,
            generatedAt: new Date().toISOString()
        };
    }

    // ---------------------------------------------------------------------------
    // AI / Chatbot Assistant
    // ---------------------------------------------------------------------------

    async handleChatbot(payload) {
        const userMsg = (payload.message || '').trim();
        const lang = payload.language || 'en';
        const lower = userMsg.toLowerCase();

        // Built-in intelligent RAG & Conversational Knowledge Engine
        let reply = "";
        let quickOptions = [];

        // Greetings
        if (/^(hi|hello|namaskar|nomoshkar|pranam|hey|নমস্কার|প্রণাম|नमस्ते)/i.test(lower)) {
            if (lang === 'bn') {
                reply = "নমস্কার! আমি দুর্গোৎসব ট্যুরিজম কনসিয়ার্জ সহকারী। আমি আপনাকে সেরা পুজো পরিক্রমা, ঐতিহাসিক বনেদি বাড়ির পথ, আবাসন (WBTDCL লজ), মেট্রো ও পরিবহন গাইড, অঞ্জলি ও সন্ধিপুজোর সময়সূচী এবং ভিআইপি পাস সম্পর্কে তথ্য দিয়ে সাহায্য করতে পারি। আপনি কীভাবে উৎসব উপভোগ করতে চান?";
                quickOptions = ["সেরা উত্তর ও দক্ষিণ কলকাতা পুজো", "অষ্টমীর সন্ধিপুজোর সময়সূচী", "কোথায় থাকব (WBTDCL লজ)?", "রাতভর মেট্রো চলাচলের সময়", "কনসিয়ার্জের কাছে আবেদন করুন"];
            } else if (lang === 'hi') {
                reply = "नमस्ते! मैं दुर्गा पूजा टूरिज्म कंसीयर्ज असिस्टेंट हूँ। मैं आपको सबसे प्रसिद्ध पूजा सर्किट, बोनेदी बाड़ी हेरिटेज, होटल व WBTDCL लॉज, मेट्रो व बस रूट और वीआईपी पास की जानकारी में मदद कर सकता हूँ। आप क्या जानना चाहते हैं?";
                quickOptions = ["प्रमुख पूजा सर्किट", "अष्टमी संधि पूजा का समय", "होटल व WBTDCL स्टे", "रातभर मेट्रो ट्रेन सुविधा", "कंसीयर्ज इन्क्वायरी फॉर्म"];
            } else {
                reply = "Welcome to Durga Puja Tourism Concierge Assistant! I can help you with curated pandal circuits, heritage Bonedi Bari routes, WBTDCL stay options, midnight metro schedules, Sandhi Puja ritual timings, and VIP pass accreditation. How may I assist your festive trip?";
                quickOptions = ["Best Circuits (North & South)", "Sandhi Puja & Ritual Timings", "Stay & WBTDCL Lodges", "Metro & Transport Guide", "Book / Enquire with Concierge"];
            }
            return { reply, quickOptions, language: lang };
        }

        // Pandal Circuits & Recommendations
        if (lower.includes('circuit') || lower.includes('pandal') || lower.includes('route') || lower.includes('north') || lower.includes('south') || lower.includes('সার্কিট') || lower.includes('প্যান্ডেল') || lower.includes('पुजा') || lower.includes('पंडाल')) {
            if (lang === 'bn') {
                reply = "আমরা দুর্গোৎসব ২০২৬ এর জন্য বিশেষ সার্কিট তৈরি করেছি:\n\n1. **উত্তর কলকাতা হেরিটেজ ও বনেদি বাড়ি ট্রেইল**: শোভাবাজার রাজবাড়ি, লাহা বাড়ি ও বাগবাজার সর্বজনীন (সকাল ও সন্ধ্যার জন্য আদর্শ)।\n2. **দক্ষিণ কলকাতা থিম ও আধুনিক আর্ট সার্কিট**: একডালিয়া এভারগ্রিন, সিংহী পার্ক, ম্যাডক্স স্কোয়ার ও সুরুচি সংঘ (বিকেল ও মধ্যরাতের আলোর জন্য সেরা)।\n3. **মধ্য কলকাতা ও রিভারব্যাঙ্ক ট্রেইল**: কলেজ স্কোয়ার, মহম্মদ আলি পার্ক ও কুমারটুলির প্রতিমা শিল্পীদের পল্লী।\n4. **রেড রোড কার্নিভাল**: দশমীর পর শীর্ষ ১০০ পুরস্কৃত প্রতিমার বর্ণাঢ্য কুচকাওয়াজ।\n\nআপনি কোন অঞ্চলটি আগে দেখতে চান?";
                quickOptions = ["উত্তর কলকাতা বনেদি বাড়ি", "দক্ষিণ কলকাতা মেগাপ্যান্ডেল", "কুমারটুলি প্রতিমা শিল্পী", "আমার জন্য প্ল্যান বানান"];
            } else if (lang === 'hi') {
                reply = "दुर्गा पूजा के मुख्य दर्शनीय सर्किट:\n\n1. **उत्तर कोलकाता हेरिटेज व बोनेदी बाड़ी**: 200+ साल पुरानी पारंपरिक पारिवारिक पूजाएँ (शोभाबाजार राजबाड़ी, लाहा बाड़ी, बागबाजार)।\n2. **दक्षिण कोलकाता मेगापंडाल व आर्ट**: एकडालिया एवरग्रीन, मैडॉक्स स्क्वायर, सुरुचि संघ (भव्य लाइटिंग व कलात्मक पंडाल)।\n3. **सेंट्रल कोलकाता व रिवरफ्रंट**: कॉलेज स्क्वायर और कुमरटुली मूर्तिकार कॉलोनी।\n4. **रेड रोड कार्निवल**: यूनेस्को विश्व धरोहर परेड।";
                quickOptions = ["बोनेदी बाड़ी सर्किट", "साउथ कोलकाता पंडाल", "कंसीयर्ज से टूर बुक करें"];
            } else {
                reply = "Here are our top curated Durga Puja circuits for 2026:\n\n1. **North Kolkata Heritage & Bonedi Bari Trail**: 250+ year-old ancestral household Pujas including Shovabazar Rajbari, Laha Bari, Marble Palace, and centenary Bagbazar Sarbojanin.\n2. **South Kolkata Contemporary Art Trail**: Architectural spectacles including Ekdalia Evergreen, Maddox Square, Ballygunge Cultural, and Suruchi Sangha.\n3. **Central & Riverbank Trail**: College Square illuminated water reflection, Mohammad Ali Park, and the Kumartuli artisan quarter.\n4. **Red Road UNESCO Immersion Carnival**: Grand parade of the top 100 award-winning idols along Red Road.\n\nWould you like a custom day plan for any of these?";
                quickOptions = ["North Kolkata Heritage", "South Kolkata Mega Pandals", "Kumartuli Artisan Walk", "Plan My Trip"];
            }
            return { reply, quickOptions, language: lang };
        }

        // Calendar & Rituals
        if (lower.includes('calendar') || lower.includes('ritual') || lower.includes('sandhi') || lower.includes('kumari') || lower.includes('date') || lower.includes('ashtami') || lower.includes('ক্যালেন্ডার') || lower.includes('সন্ধিপুজো') || lower.includes('অষ্টমী') || lower.includes('तिथि')) {
            if (lang === 'bn') {
                reply = "মহোৎসব ২০২৬ এর মুখ্য তিথি ও আচার:\n\n• **মহালয়া (১০ অক্টোবর)**: ভোরবেলায় গঙ্গাবক্ষে তর্পণ এবং বীরেন্দ্রকৃষ্ণ ভদ্রের মহিষাসুরমর্দিনী।\n• **মহা ষষ্ঠী (১৬ অক্টোবর)**: সায়াহ্নে দেবীর বোধন ও আমন্ত্রণ-অধিবাস।\n• **মহা সপ্তমী (১৭ অক্টোবর)**: ভোরে নবপত্রিকা স্নান (কলাবউ স্নান) ও সপ্তমী পুষ্পাঞ্জলি।\n• **মহা অষ্টমী (১৮ অক্টোবর)**: বেলুড় মঠে ঐতিহ্যবাহী কুমারী পুজো (সকাল ৯:০০ টা) এবং ১০৮ পদ্ম ও প্রদীপে বিশেষ সন্ধিপুজো।\n• **মহা নবমী (১৯ অক্টোবর)**: ধুনুচি নাচ ও নবমী হোম।\n• **বিজয়া দশমী (২০ অক্টোবর)**: দর্পণ বিসর্জন, সিঁদুর খেলা ও বাবুঘাটে বিসর্জন।\n• **রেড রোড কার্নিভাল (২৩ অক্টোবর)**: বিশ্বমানের কার্নিভাল প্রদর্শনী।";
                quickOptions = ["কুমারী পুজো বেলুড় মঠ", "সিঁদুর খেলা কোথায় দেখব?", "কার্নিভাল পাস কীভাবে পাব?"];
            } else {
                reply = "Key Dates & Ritual Windows for Durga Puja 2026:\n\n• **Mahalaya (Oct 10)**: Ancestral Tarpan at sunrise along Hooghly river ghats.\n• **Maha Sasthi (Oct 16)**: Evening Bodhon (Awakening) & unveiling of pandal idols.\n• **Maha Saptami (Oct 17)**: Sacred Nabapatrika Snan (Kola Bou river bath) at 6:30 AM & Saptami Pushpanjali.\n• **Maha Ashtami (Oct 18)**: Divine Kumari Puja at Belur Math (9:00 AM) & 108-Lotus Sandhi Puja at conjunction.\n• **Maha Navami (Oct 19)**: Energetic Dhunuchi Naach dances & midnight illumination revelry.\n• **Vijaya Dashami (Oct 20)**: Traditional Sindoor Khela (10 AM - 1 PM) & river immersions at Babughat.\n• **Red Road Carnival (Oct 23)**: UNESCO Heritage Parade with award-winning idols.";
                quickOptions = ["Belur Math Kumari Puja", "Where to see Sindoor Khela", "Sandhi Puja Timing", "VIP Pandal Passes"];
            }
            return { reply, quickOptions, language: lang };
        }

        // Stays & Accommodations
        if (lower.includes('stay') || lower.includes('hotel') || lower.includes('lodge') || lower.includes('wbtdc') || lower.includes('accommodation') || lower.includes('থাকা') || lower.includes('হোটেল') || lower.includes('होटल')) {
            if (lang === 'bn') {
                reply = "পশ্চিমবঙ্গ পর্যটন উন্নয়ন নিগম (WBTDCL) এবং অনুমোদিত আবাসনের তালিকা:\n\n1. **WBTDCL উদয়ন ট্যুরিজম প্রপার্টি (সল্টলেক)**: সরকারি তত্ত্বাবধানে নিরাপদ আবাসন ও পুজো পরিক্রমা বাসের সরাসরি পিকআপ পয়েন্ট।\n2. **দ্য রাজবাড়ি বাওয়ালি**: ৩০০ বছরের প্রাচীন জমিদারি রাজপ্রাসাদে রাজকীয় আতিথেয়তা ও ব্যক্তিগত পারিবারিক পুজো।\n3. **ক্যালকাটা বাংলো**: উত্তর কলকাতার শ্যামবাজারে ১৯২০-এর দশকের ঐতিহ্যবাহী বুটিক টাউনহাউস।\n4. **দ্য ওবেরয় গ্র্যান্ড ও আইটিসি রয়েল বেঙ্গল**: ৫-তারকা আন্তর্জাতিক মানের বিলাসিতা ও খাঁটি বাঙালি খাবারের রসাস্বাদন।\n\nআপনি সরাসরি আমাদের কনসিয়ার্জের মাধ্যমে বুকিং অনুসন্ধান করতে পারেন।";
                quickOptions = ["WBTDCL লজ বুকিং", "ঐতিহ্যবাহী রাজবাড়ি স্টে", "ইনকোয়ারি ফর্ম পূরণ করুন"];
            } else {
                reply = "Recommended Stay & Accommodation Options for Durga Puja:\n\n1. **WBTDCL Udayan Tourism Property (Kolkata)**: Official Govt Tourism lodge with direct connection to Puja Parikrama AC coaches (₹2,200 - ₹4,500/night).\n2. **The Rajbari Bawali**: A 300-year-old restored Zamindari palace with private heritage puja experiences (₹9,500+).\n3. **Calcutta Bungalow**: Restored 1920s heritage townhouse right in the heart of North Kolkata Bonedi Bari territory (₹5,500+).\n4. **The Oberoi Grand & ITC Royal Bengal**: Premier 5-star luxury with royal dining and festival concierge desks.\n\nWould you like our concierge team to reserve accommodations for your dates?";
                quickOptions = ["WBTDCL Lodge Details", "Heritage Palace Stays", "Submit Enquiry Form"];
            }
            return { reply, quickOptions, language: lang };
        }

        // Transport & Metro
        if (lower.includes('transport') || lower.includes('metro') || lower.includes('bus') || lower.includes('cab') || lower.includes('ferry') || lower.includes('night') || lower.includes('মেট্রো') || lower.includes('বাস') || lower.includes('গাড়ি') || lower.includes('यातायात')) {
            if (lang === 'bn') {
                reply = "দুর্গাপুজোয় কলকাতা পরিবহন ব্যবস্থা:\n\n• **কলকাতা মেট্রো**: ষষ্ঠী থেকে নবমী পর্যন্ত সারারাত বিশেষ মেট্রো পরিষেবা চালু থাকে। ব্লু লাইন ও নতুন গ্রিন লাইন (গঙ্গার তলদেশ দিয়ে হাওড়া-এসপ্ল্যানেড) দ্রুততম মাধ্যম।\n• **WBTDCL এয়ার কন্ডিশনড বাস পরিক্রমা**: সরকারি গাইড সহ উত্তর ও দক্ষিণ কলকাতার পুজো ভ্রমণ (ভোগের ব্যবস্থা সহ)।\n• **হুগলি রিভার ফেরি ও ক্রুজ**: বাবুঘাট, বাগবাজার ও হাওড়ার মধ্যে যানজটহীন প্রাকৃতিক নৌ-চলাচল।\n• **যাত্রী সাথী সরকারি ক্যাব**: নো-সার্জ রেগুলেটেড মিটার ক্যাব।";
                quickOptions = ["মেট্রো স্টেশন গাইড", "WBTDCL বাস প্যাকেজ", "গঙ্গা রিভার ক্রুজ"];
            } else {
                reply = "Kolkata Transit Guide during Durga Puja:\n\n• **Kolkata Metro Rail**: Runs special 24-hour all-night services from Sasthi through Navami! Blue Line connects North & South Kolkata; Green Line crosses under the Hooghly river between Howrah and Esplanade in just 45 seconds.\n• **WBTDCL Luxury AC Bus Parikrama**: Fully guided morning and night bus packages with police escort, priority entries, and traditional bhog lunch.\n• **Hooghly River Ferries**: Bypass all street gridlock between Howrah, Babughat, Bagbazar, and Belur Math.\n• **Yatri Sathi Govt Cabs**: Standardized meter fares with designated 24x7 police help desks at airport and stations.";
                quickOptions = ["Metro Special Schedules", "WBTDC Luxury Bus Tours", "Book Concierge Assistance"];
            }
            return { reply, quickOptions, language: lang };
        }

        // VIP Passes & Accreditation
        if (lower.includes('vip') || lower.includes('pass') || lower.includes('carnival') || lower.includes('ticket') || lower.includes('পাস') || lower.includes('কার্নিভাল') || lower.includes('पास')) {
            reply = lang === 'bn' 
                ? "পশ্চিমবঙ্গ পর্যটন দপ্তর প্রবাসী বাঙালি ও বিদেশি পর্যটকদের জন্য বিশেষ ভিআইপি ও কার্নিভাল পাস প্রদান করে। এই পাসের মাধ্যমে ১৫০+ শীর্ষ পুজোয় লাইন ছাড়া অগ্রাধিকার প্রবেশ এবং রেড রোড কার্নিভালের বিশেষ ভিআইপি গ্যালারিতে বসার সুযোগ মেলে। আমাদের কনসিয়ার্জ অনুসন্ধান ফর্মটি পূরণ করে আপনি সরাসরি পাসের জন্য আবেদন করতে পারেন।"
                : "West Bengal Tourism issues accredited VIP and Diaspora Passes for overseas tourists, out-of-state visitors, and delegates. These passes grant express priority entry at over 150 top pandals and access to the prestigious Red Road Immersion Carnival grandstand. You can request VIP pass assistance directly through our Enquiry Form below.";
            quickOptions = lang === 'bn' ? ["কনসিয়ার্জ ফর্ম পূরণ করুন", "ট্যুর অপারেটর তালিকা"] : ["Fill Concierge Form", "Tour Operator Listing"];
            return { reply, quickOptions, language: lang };
        }

        // Default response guiding to enquiry
        reply = lang === 'bn'
            ? "আপনার অনুরোধের জন্য ধন্যবাদ। আমাদের পশ্চিমবঙ্গ পর্যটন কনসিয়ার্জ দল আপনাকে পুজো পরিক্রমা, আবাসন, ভিআইপি পাস ও বিশেষ যাতায়াত পরিকল্পনায় সম্পূর্ণ সহায়তা দিতে প্রস্তুত। আপনি কি একটি কাস্টমাইজড ভ্রমণ পরিকল্পনা বা অনুসন্ধান জমা দিতে চান?"
            : lang === 'hi'
            ? "धन्यवाद! हमारी पश्चिम बंगाल पर्यटन कंसीयर्ज टीम आपके लिए अनुकूलित यात्रा योजना, होटल स्टे, और वीआईपी पास की व्यवस्था करने के लिए तैयार है। क्या आप व्यक्तिगत इन्क्वायरी सबमिट करना चाहते हैं?"
            : "Thank you for reaching out! Our West Bengal Tourism Concierge team is dedicated to curating your personalized Durga Puja journey—covering private transport, WBTDCL stays, VIP pass accreditation, and day-by-day itineraries. Would you like to submit an enquiry or explore our curated circuits?";

        quickOptions = lang === 'bn' 
            ? ["সার্কিট দেখুন", "ক্যালেন্ডার দেখুন", "ইনকোয়ারি ফর্ম জমা দিন"]
            : ["View Circuits", "Festival Calendar", "Submit Concierge Enquiry"];

        return { reply, quickOptions, language: lang };
    }

    // ---------------------------------------------------------------------------
    // Enquiry & Bot Protection
    // ---------------------------------------------------------------------------

    generateCaptcha() {
        return (0, shared_1.createRegistrationCaptcha)();
    }

    async submitEnquiry(payload) {
        // 1. Bot Honeypot Check
        if (payload._hp && payload._hp.trim() !== '') {
            return {
                enquiryCode: 'TC-2026-SPAM00',
                message: 'Enquiry received successfully.'
            };
        }

        // 2. Arithmetic Captcha Verification
        const isCaptchaValid = (0, shared_1.verifyRegistrationCaptcha)(payload.captchaToken, payload.captchaAnswer);
        if (!isCaptchaValid) {
            throw shared_1.ServiceException.badRequest('Security verification failed. Please solve the math problem correctly.');
        }

        // 3. Validation
        if (!payload.fullName || payload.fullName.trim().length < 2) {
            throw shared_1.ServiceException.badRequest('Please enter your full name.');
        }
        if (!payload.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(payload.email.trim())) {
            throw shared_1.ServiceException.badRequest('Please enter a valid email address.');
        }
        if (!payload.phone || payload.phone.trim().length < 6) {
            throw shared_1.ServiceException.badRequest('Please enter a valid telephone number.');
        }
        if (!payload.consentGiven) {
            throw shared_1.ServiceException.badRequest('You must consent to being contacted regarding tourism services.');
        }

        // 4. Generate unique enquiry code: TC-2026-XXXXXX
        const randomChars = (0, crypto_1.randomBytes)(3).toString('hex').toUpperCase();
        const enquiryCode = `TC-2026-${randomChars}`;

        const numberOfTravellers = Number(payload.numberOfTravellers) || 1;
        const startDate = payload.startDate ? new Date(payload.startDate) : null;
        const endDate = payload.endDate ? new Date(payload.endDate) : null;
        const preferredCircuits = Array.isArray(payload.preferredCircuits) ? payload.preferredCircuits : [];
        const interests = Array.isArray(payload.interests) ? payload.interests : [];
        const pujaPreferences = Array.isArray(payload.pujaPreferences) ? payload.pujaPreferences : [];

        // Insert Enquiry
        const insertRes = await this.prisma.$queryRawUnsafe(`
            INSERT INTO tourism_enquiries (
                enquiry_code, full_name, email, phone, country, city,
                number_of_travellers, start_date, end_date, duration_preference,
                preferred_circuits, interests, stay_preference, transport_preference,
                puja_preferences, special_requirements, status, consent_given, preferred_language
            ) VALUES (
                $1, $2, $3, $4, $5, $6, $7, $8, $9, $10,
                $11::jsonb, $12, $13, $14, $15, $16, 'NEW', $17, $18
            ) RETURNING id, enquiry_code, full_name, email, status, created_at;
        `,
            enquiryCode,
            payload.fullName.trim(),
            payload.email.trim().toLowerCase(),
            payload.phone.trim(),
            payload.country ? payload.country.trim() : 'India',
            payload.city ? payload.city.trim() : null,
            numberOfTravellers,
            startDate,
            endDate,
            payload.durationPreference || null,
            JSON.stringify(preferredCircuits),
            interests,
            payload.stayPreference || null,
            payload.transportPreference || null,
            pujaPreferences,
            payload.specialRequirements ? payload.specialRequirements.trim() : null,
            Boolean(payload.consentGiven),
            payload.preferredLanguage || 'en'
        );

        const newEnquiry = insertRes[0];

        // Insert History entry
        await this.prisma.$executeRawUnsafe(`
            INSERT INTO tourism_enquiry_history (enquiry_id, action, from_status, to_status, comment)
            VALUES ($1, 'CREATED', NULL, 'NEW', 'Enquiry submitted online via Tourism Concierge portal.');
        `, newEnquiry.id);

        // Connect with Notification Outbox (NotificationLog)
        try {
            await this.prisma.notificationLog.create({
                data: {
                    channel: 'EMAIL',
                    recipient: newEnquiry.email,
                    template: 'tourism_enquiry_received',
                    subject: `Your Durga Puja 2026 Tourism Concierge Enquiry: ${newEnquiry.enquiry_code}`,
                    payload: {
                        enquiryCode: newEnquiry.enquiry_code,
                        fullName: newEnquiry.full_name,
                        numberOfTravellers,
                        duration: payload.durationPreference,
                        preferredCircuits
                    },
                    status: 'QUEUED'
                }
            });
        } catch (e) {
            this.logger.warn(`Could not log notification outbox for enquiry ${enquiryCode}: ${e.message}`);
        }

        return {
            id: newEnquiry.id,
            enquiryCode: newEnquiry.enquiry_code,
            fullName: newEnquiry.full_name,
            email: newEnquiry.email,
            status: newEnquiry.status,
            createdAt: newEnquiry.created_at,
            message: 'Your Tourism Concierge enquiry has been registered successfully! Our concierge desk will contact you with a customized itinerary.'
        };
    }

    async trackEnquiry(code) {
        if (!code) throw shared_1.ServiceException.badRequest('Please provide a valid enquiry code.');
        const cleanCode = code.trim().toUpperCase();

        const rows = await this.prisma.$queryRawUnsafe(`
            SELECT e.*, u.name AS assigned_user_name, u.email AS assigned_user_email
            FROM tourism_enquiries e
            LEFT JOIN users u ON u.id = e.assigned_to_id
            WHERE e.enquiry_code = $1
            LIMIT 1;
        `, cleanCode);

        if (!rows || rows.length === 0) {
            throw shared_1.ServiceException.notFound(`No enquiry found with code '${cleanCode}'. Please verify your code.`);
        }

        const enquiry = rows[0];
        const histories = await this.prisma.$queryRawUnsafe(`
            SELECT h.*, u.name AS changed_by_name
            FROM tourism_enquiry_history h
            LEFT JOIN users u ON u.id = h.changed_by_id
            WHERE h.enquiry_id = $1
            ORDER BY h.created_at ASC;
        `, enquiry.id);

        return {
            id: enquiry.id,
            enquiryCode: enquiry.enquiry_code,
            fullName: enquiry.full_name,
            email: enquiry.email,
            country: enquiry.country,
            city: enquiry.city,
            numberOfTravellers: enquiry.number_of_travellers,
            durationPreference: enquiry.duration_preference,
            preferredCircuits: enquiry.preferred_circuits,
            interests: enquiry.interests,
            stayPreference: enquiry.stay_preference,
            transportPreference: enquiry.transport_preference,
            pujaPreferences: enquiry.puja_preferences,
            specialRequirements: enquiry.special_requirements,
            status: enquiry.status,
            assignedOfficer: enquiry.assigned_user_name || 'West Bengal Tourism Helpdesk',
            createdAt: enquiry.created_at,
            updatedAt: enquiry.updated_at,
            history: histories.map(h => ({
                action: h.action,
                fromStatus: h.from_status,
                toStatus: h.to_status,
                comment: h.comment,
                timestamp: h.created_at
            }))
        };
    }

    // ---------------------------------------------------------------------------
    // Admin CMS & Workflow Operations
    // ---------------------------------------------------------------------------

    async getAdminStats() {
        const counts = await this.prisma.$queryRawUnsafe(`
            SELECT 
                COUNT(*)::int AS total_enquiries,
                COUNT(*) FILTER (WHERE status = 'NEW')::int AS new_count,
                COUNT(*) FILTER (WHERE status = 'UNDER_REVIEW')::int AS under_review_count,
                COUNT(*) FILTER (WHERE status = 'ASSIGNED')::int AS assigned_count,
                COUNT(*) FILTER (WHERE status = 'CONTACTED')::int AS contacted_count,
                COUNT(*) FILTER (WHERE status = 'ITINERARY_SENT')::int AS itinerary_sent_count,
                COUNT(*) FILTER (WHERE status = 'CLOSED')::int AS closed_count
            FROM tourism_enquiries;
        `);

        const circuitCount = await this.prisma.$queryRawUnsafe(`SELECT COUNT(*)::int AS cnt FROM tourism_circuits WHERE deleted_at IS NULL;`);
        const stayCount = await this.prisma.$queryRawUnsafe(`SELECT COUNT(*)::int AS cnt FROM tourism_stays WHERE is_active = true;`);
        const operatorCount = await this.prisma.$queryRawUnsafe(`SELECT COUNT(*)::int AS cnt FROM tourism_operators WHERE is_active = true;`);

        return {
            enquiries: counts[0] || {
                total_enquiries: 0,
                new_count: 0,
                under_review_count: 0,
                assigned_count: 0,
                contacted_count: 0,
                itinerary_sent_count: 0,
                closed_count: 0
            },
            totalCircuits: circuitCount[0]?.cnt || 0,
            totalStays: stayCount[0]?.cnt || 0,
            totalOperators: operatorCount[0]?.cnt || 0
        };
    }

    async getAdminEnquiries(query = {}) {
        const page = Math.max(1, Number(query.page) || 1);
        const perPage = Math.min(100, Math.max(1, Number(query.perPage) || 15));
        const offset = (page - 1) * perPage;

        let sql = `
            SELECT e.*, u.name AS assigned_user_name
            FROM tourism_enquiries e
            LEFT JOIN users u ON u.id = e.assigned_to_id
            WHERE 1=1
        `;
        let countSql = `SELECT COUNT(*)::int AS total FROM tourism_enquiries WHERE 1=1`;
        const params = [];
        let pIndex = 1;

        if (query.status && query.status !== 'all') {
            sql += ` AND e.status = $${pIndex}`;
            countSql += ` AND status = $${pIndex}`;
            params.push(query.status);
            pIndex++;
        }
        if (query.search) {
            const searchParam = `%${query.search}%`;
            sql += ` AND (e.enquiry_code ILIKE $${pIndex} OR e.full_name ILIKE $${pIndex} OR e.email ILIKE $${pIndex} OR e.country ILIKE $${pIndex})`;
            countSql += ` AND (enquiry_code ILIKE $${pIndex} OR full_name ILIKE $${pIndex} OR email ILIKE $${pIndex} OR country ILIKE $${pIndex})`;
            params.push(searchParam);
            pIndex++;
        }

        sql += ` ORDER BY e.created_at DESC LIMIT ${perPage} OFFSET ${offset};`;

        const [rows, totalRes] = await Promise.all([
            this.prisma.$queryRawUnsafe(sql, ...params),
            this.prisma.$queryRawUnsafe(countSql, ...params)
        ]);

        const total = totalRes[0]?.total || 0;
        const lastPage = Math.ceil(total / perPage);

        return {
            items: rows.map(r => this.mapEnquiry(r)),
            pagination: {
                page,
                perPage,
                total,
                lastPage,
                hasPreviousPage: page > 1,
                hasNextPage: page < lastPage
            }
        };
    }

    async getAdminEnquiryDetail(id) {
        const rows = await this.prisma.$queryRawUnsafe(`
            SELECT e.*, u.name AS assigned_user_name, u.email AS assigned_user_email
            FROM tourism_enquiries e
            LEFT JOIN users u ON u.id = e.assigned_to_id
            WHERE e.id = $1
            LIMIT 1;
        `, Number(id));

        if (!rows || rows.length === 0) {
            throw shared_1.ServiceException.notFound(`Enquiry #${id} not found`);
        }

        const enquiry = this.mapEnquiry(rows[0]);
        const histories = await this.prisma.$queryRawUnsafe(`
            SELECT h.*, u.name AS changed_by_name
            FROM tourism_enquiry_history h
            LEFT JOIN users u ON u.id = h.changed_by_id
            WHERE h.enquiry_id = $1
            ORDER BY h.created_at DESC;
        `, Number(id));

        enquiry.histories = histories.map(h => ({
            id: h.id,
            action: h.action,
            fromStatus: h.from_status,
            toStatus: h.to_status,
            comment: h.comment,
            changedByName: h.changed_by_name || 'System',
            createdAt: h.created_at
        }));

        return enquiry;
    }

    async updateEnquiryStatus(payload) {
        const { id, status, comment, adminUserId } = payload;
        const validStatuses = ['NEW', 'UNDER_REVIEW', 'ASSIGNED', 'CONTACTED', 'ITINERARY_SENT', 'CLOSED'];
        if (!validStatuses.includes(status)) {
            throw shared_1.ServiceException.badRequest(`Invalid enquiry status '${status}'. Must be one of: ${validStatuses.join(', ')}`);
        }

        const currentRes = await this.prisma.$queryRawUnsafe(`SELECT status FROM tourism_enquiries WHERE id = $1;`, Number(id));
        if (!currentRes || currentRes.length === 0) {
            throw shared_1.ServiceException.notFound(`Enquiry #${id} not found`);
        }

        const fromStatus = currentRes[0].status;

        await this.prisma.$executeRawUnsafe(`
            UPDATE tourism_enquiries
            SET status = $1, updated_at = CURRENT_TIMESTAMP
            WHERE id = $2;
        `, status, Number(id));

        await this.prisma.$executeRawUnsafe(`
            INSERT INTO tourism_enquiry_history (enquiry_id, changed_by_id, action, from_status, to_status, comment)
            VALUES ($1, $2, 'STATUS_CHANGE', $3, $4, $5);
        `, Number(id), adminUserId || null, fromStatus, status, comment || `Status updated from ${fromStatus} to ${status}`);

        return this.getAdminEnquiryDetail(id);
    }

    async assignEnquiry(payload) {
        const { id, assignedToId, comment, adminUserId } = payload;
        await this.prisma.$executeRawUnsafe(`
            UPDATE tourism_enquiries
            SET assigned_to_id = $1, status = CASE WHEN status = 'NEW' THEN 'ASSIGNED' ELSE status END, updated_at = CURRENT_TIMESTAMP
            WHERE id = $2;
        `, Number(assignedToId) || null, Number(id));

        await this.prisma.$executeRawUnsafe(`
            INSERT INTO tourism_enquiry_history (enquiry_id, changed_by_id, action, from_status, to_status, comment)
            VALUES ($1, $2, 'ASSIGNED', NULL, 'ASSIGNED', $3);
        `, Number(id), adminUserId || null, comment || `Assigned to staff officer #${assignedToId}`);

        return this.getAdminEnquiryDetail(id);
    }

    async addEnquiryNote(payload) {
        const { id, comment, adminUserId } = payload;
        if (!comment) throw shared_1.ServiceException.badRequest('Note content cannot be empty.');

        await this.prisma.$executeRawUnsafe(`
            INSERT INTO tourism_enquiry_history (enquiry_id, changed_by_id, action, from_status, to_status, comment)
            VALUES ($1, $2, 'NOTE_ADDED', NULL, NULL, $3);
        `, Number(id), adminUserId || null, comment);

        return this.getAdminEnquiryDetail(id);
    }

    // Circuits CRUD
    async createCircuit(payload) {
        if (payload.region) {
            await this.syncCircuitSubcategoryToMaster(payload.region);
        }
        const slug = payload.slug || (0, shared_1.slugify)(payload.name);
        const rows = await this.prisma.$queryRawUnsafe(`
            INSERT INTO tourism_circuits (name, slug, region, description, highlight_pandals, tags, duration, best_time_of_day, recommended_transport, crowd_level, cover_image_url, is_featured, sort_order, updated_at)
            VALUES ($1, $2, $3, $4, $5::jsonb, $6, $7, $8, $9, $10, $11, $12, $13, NOW())
            RETURNING *;
        `, payload.name, slug, payload.region, payload.description, JSON.stringify(payload.highlightPandals || []), payload.tags || [], payload.duration, payload.bestTimeOfDay || null, payload.recommendedTransport || null, payload.crowdLevel || 'Moderate', payload.coverImageUrl || null, Boolean(payload.isFeatured), Number(payload.sortOrder) || 0);

        return this.mapCircuit(rows[0]);
    }

    async updateCircuit(payload) {
        const { id, ...rest } = payload;
        if (rest.region) {
            await this.syncCircuitSubcategoryToMaster(rest.region);
        }
        const rows = await this.prisma.$queryRawUnsafe(`
            UPDATE tourism_circuits
            SET name = COALESCE($1, name),
                region = COALESCE($2, region),
                description = COALESCE($3, description),
                duration = COALESCE($4, duration),
                best_time_of_day = COALESCE($5, best_time_of_day),
                recommended_transport = COALESCE($6, recommended_transport),
                crowd_level = COALESCE($7, crowd_level),
                cover_image_url = COALESCE($8, cover_image_url),
                highlight_pandals = COALESCE($9::jsonb, highlight_pandals),
                tags = COALESCE($10, tags),
                is_active = COALESCE($11, is_active),
                is_featured = COALESCE($12, is_featured),
                sort_order = COALESCE($13, sort_order),
                updated_at = CURRENT_TIMESTAMP
            WHERE id = $14
            RETURNING *;
        `, rest.name ?? null, rest.region ?? null, rest.description ?? null, rest.duration ?? null, rest.bestTimeOfDay ?? null, rest.recommendedTransport ?? null, rest.crowdLevel ?? null, rest.coverImageUrl ?? null, rest.highlightPandals ? JSON.stringify(rest.highlightPandals) : null, rest.tags ?? null, rest.isActive ?? null, rest.isFeatured ?? null, rest.sortOrder ?? null, Number(id));

        if (!rows || rows.length === 0) throw shared_1.ServiceException.notFound(`Circuit #${id} not found`);
        return this.mapCircuit(rows[0]);
    }

    async deleteCircuit(id) {
        await this.prisma.$executeRawUnsafe(`UPDATE tourism_circuits SET deleted_at = CURRENT_TIMESTAMP, is_active = false WHERE id = $1;`, Number(id));
        return { id: Number(id), deleted: true };
    }

    // Stays CRUD
    async createStay(payload) {
        const slug = payload.slug || (0, shared_1.slugify)(payload.name);
        const rows = await this.prisma.$queryRawUnsafe(`
            INSERT INTO tourism_stays (name, slug, type, location, city, district, price_range, budget_tier, star_rating, amenities, contact_phone, contact_email, booking_url, description, cover_image_url, is_wbtdc, is_featured, updated_at)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, NOW())
            RETURNING *;
        `, payload.name, slug, payload.type, payload.location, payload.city || 'Kolkata', payload.district || 'Kolkata', payload.priceRange, payload.budgetTier || 'MID_RANGE', Number(payload.starRating) || 3, payload.amenities || [], payload.contactPhone || null, payload.contactEmail || null, payload.bookingUrl || null, payload.description || null, payload.coverImageUrl || null, Boolean(payload.isWbtdc), Boolean(payload.isFeatured));

        return this.mapStay(rows[0]);
    }

    async updateStay(payload) {
        const { id, ...rest } = payload;
        const rows = await this.prisma.$queryRawUnsafe(`
            UPDATE tourism_stays
            SET name = COALESCE($1, name),
                type = COALESCE($2, type),
                location = COALESCE($3, location),
                city = COALESCE($4, city),
                district = COALESCE($5, district),
                price_range = COALESCE($6, price_range),
                budget_tier = COALESCE($7, budget_tier),
                star_rating = COALESCE($8, star_rating),
                amenities = COALESCE($9, amenities),
                contact_phone = COALESCE($10, contact_phone),
                contact_email = COALESCE($11, contact_email),
                booking_url = COALESCE($12, booking_url),
                description = COALESCE($13, description),
                cover_image_url = COALESCE($14, cover_image_url),
                is_wbtdc = COALESCE($15, is_wbtdc),
                is_active = COALESCE($16, is_active),
                is_featured = COALESCE($17, is_featured),
                updated_at = CURRENT_TIMESTAMP
            WHERE id = $18
            RETURNING *;
        `, rest.name ?? null, rest.type ?? null, rest.location ?? null, rest.city ?? null, rest.district ?? null, rest.priceRange ?? null, rest.budgetTier ?? null, rest.starRating ?? null, rest.amenities ?? null, rest.contactPhone ?? null, rest.contactEmail ?? null, rest.bookingUrl ?? null, rest.description ?? null, rest.coverImageUrl ?? null, rest.isWbtdc ?? null, rest.isActive ?? null, rest.isFeatured ?? null, Number(id));

        if (!rows || rows.length === 0) throw shared_1.ServiceException.notFound(`Stay #${id} not found`);
        return this.mapStay(rows[0]);
    }

    async deleteStay(id) {
        await this.prisma.$executeRawUnsafe(`DELETE FROM tourism_stays WHERE id = $1;`, Number(id));
        return { id: Number(id), deleted: true };
    }

    // Transports CRUD
    async createTransport(payload) {
        if (payload.category) {
            await this.syncSubcategoryToMaster(payload.category);
        }
        const rows = await this.prisma.$queryRawUnsafe(`
            INSERT INTO tourism_transports (name, category, operating_hours, route_description, fare_guide, booking_or_helpline, tips, cover_image_url, is_active, sort_order, updated_at)
            VALUES ($1, $2, $3, $4, $5, $6, $7::jsonb, $8, $9, $10, NOW())
            RETURNING *;
        `, payload.name, payload.category, payload.operatingHours, payload.routeDescription, payload.fareGuide, payload.bookingOrHelpline || null, JSON.stringify(payload.tips || []), payload.coverImageUrl || null, payload.isActive !== false, Number(payload.sortOrder) || 0);
        return this.mapTransport(rows[0]);
    }

    async updateTransport(payload) {
        const { id, ...rest } = payload;
        if (rest.category) {
            await this.syncSubcategoryToMaster(rest.category);
        }
        const rows = await this.prisma.$queryRawUnsafe(`
            UPDATE tourism_transports
            SET name = COALESCE($1, name),
                category = COALESCE($2, category),
                operating_hours = COALESCE($3, operating_hours),
                route_description = COALESCE($4, route_description),
                fare_guide = COALESCE($5, fare_guide),
                booking_or_helpline = COALESCE($6, booking_or_helpline),
                tips = COALESCE($7::jsonb, tips),
                cover_image_url = COALESCE($8, cover_image_url),
                is_active = COALESCE($9, is_active),
                sort_order = COALESCE($10, sort_order),
                updated_at = CURRENT_TIMESTAMP
            WHERE id = $11
            RETURNING *;
        `, rest.name ?? null, rest.category ?? null, rest.operatingHours ?? null, rest.routeDescription ?? null, rest.fareGuide ?? null, rest.bookingOrHelpline ?? null, rest.tips ? JSON.stringify(rest.tips) : null, rest.coverImageUrl ?? null, rest.isActive ?? null, rest.sortOrder ?? null, Number(id));
        if (!rows || rows.length === 0) throw shared_1.ServiceException.notFound(`Transport #${id} not found`);
        return this.mapTransport(rows[0]);
    }

    async deleteTransport(id) {
        await this.prisma.$executeRawUnsafe(`DELETE FROM tourism_transports WHERE id = $1;`, Number(id));
        return { id: Number(id), deleted: true };
    }

    async createItinerary(payload) {
        let baseSlug = payload.slug || (0, shared_1.slugify)(payload.title) || 'itinerary';
        let slug = baseSlug;
        let counter = 1;
        while (true) {
            const existing = await this.prisma.$queryRawUnsafe(`SELECT id FROM tourism_itineraries WHERE slug = $1 LIMIT 1;`, slug);
            if (!existing || existing.length === 0) break;
            slug = `${baseSlug}-${counter++}`;
        }

        const rows = await this.prisma.$queryRawUnsafe(`
            INSERT INTO tourism_itineraries (title, slug, duration_days, target_audience, overview, day_plans, included_highlights, cover_image_url, is_curated, is_active, sort_order, updated_at)
            VALUES ($1, $2, $3, $4, $5, $6::jsonb, $7, $8, $9, $10, $11, NOW())
            RETURNING *;
        `, payload.title, slug, Number(payload.durationDays) || 3, payload.targetAudience, payload.overview, JSON.stringify(payload.dayPlans || []), payload.includedHighlights || [], payload.coverImageUrl || null, payload.isCurated !== false, payload.isActive !== false, Number(payload.sortOrder) || 0);
        return this.mapItinerary(rows[0]);
    }

    async updateItinerary(payload) {
        const { id, ...rest } = payload;
        const rows = await this.prisma.$queryRawUnsafe(`
            UPDATE tourism_itineraries
            SET title = COALESCE($1, title),
                duration_days = COALESCE($2, duration_days),
                target_audience = COALESCE($3, target_audience),
                overview = COALESCE($4, overview),
                day_plans = COALESCE($5::jsonb, day_plans),
                included_highlights = COALESCE($6, included_highlights),
                cover_image_url = COALESCE($7, cover_image_url),
                is_curated = COALESCE($8, is_curated),
                is_active = COALESCE($9, is_active),
                sort_order = COALESCE($10, sort_order),
                updated_at = CURRENT_TIMESTAMP
            WHERE id = $11
            RETURNING *;
        `, rest.title ?? null, rest.durationDays ?? null, rest.targetAudience ?? null, rest.overview ?? null, rest.dayPlans ? JSON.stringify(rest.dayPlans) : null, rest.includedHighlights ?? null, rest.coverImageUrl ?? null, rest.isCurated ?? null, rest.isActive ?? null, rest.sortOrder ?? null, Number(id));
        if (!rows || rows.length === 0) throw shared_1.ServiceException.notFound(`Itinerary #${id} not found`);
        return this.mapItinerary(rows[0]);
    }

    async deleteItinerary(id) {
        await this.prisma.$executeRawUnsafe(`DELETE FROM tourism_itineraries WHERE id = $1;`, Number(id));
        return { id: Number(id), deleted: true };
    }

    // Knowledge CRUD
    async createKnowledge(payload) {
        const rows = await this.prisma.$queryRawUnsafe(`
            INSERT INTO tourism_knowledge (category, title, content, quick_tips, sort_order, is_active, updated_at)
            VALUES ($1, $2, $3, $4, $5, $6, NOW())
            RETURNING *;
        `, payload.category, payload.title, payload.content, payload.quickTips || [], Number(payload.sortOrder) || 0, payload.isActive !== false);
        return this.mapKnowledge(rows[0]);
    }

    async updateKnowledge(payload) {
        const { id, ...rest } = payload;
        const rows = await this.prisma.$queryRawUnsafe(`
            UPDATE tourism_knowledge
            SET category = COALESCE($1, category),
                title = COALESCE($2, title),
                content = COALESCE($3, content),
                quick_tips = COALESCE($4, quick_tips),
                sort_order = COALESCE($5, sort_order),
                is_active = COALESCE($6, is_active),
                updated_at = CURRENT_TIMESTAMP
            WHERE id = $7
            RETURNING *;
        `, rest.category ?? null, rest.title ?? null, rest.content ?? null, rest.quickTips ?? null, rest.sortOrder ?? null, rest.isActive ?? null, Number(id));
        if (!rows || rows.length === 0) throw shared_1.ServiceException.notFound(`Knowledge #${id} not found`);
        return this.mapKnowledge(rows[0]);
    }

    async deleteKnowledge(id) {
        await this.prisma.$executeRawUnsafe(`DELETE FROM tourism_knowledge WHERE id = $1;`, Number(id));
        return { id: Number(id), deleted: true };
    }

    // Operators CRUD
    async createOperator(payload) {
        if (payload.operatorType) {
            await this.syncOperatorSubcategoryToMaster(payload.operatorType);
        }
        const rows = await this.prisma.$queryRawUnsafe(`
            INSERT INTO tourism_operators (name, license_no, operator_type, contact_person, phone, email, website, address, packages_offered, rating, is_verified, is_active, updated_at)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9::jsonb, $10, $11, $12, NOW())
            RETURNING *;
        `, payload.name, payload.licenseNo || null, payload.operatorType, payload.contactPerson || null, payload.phone, payload.email, payload.website || null, payload.address || null, JSON.stringify(payload.packagesOffered || []), Number(payload.rating) || 4.5, payload.isVerified !== false, payload.isActive !== false);
        return this.mapOperator(rows[0]);
    }

    async updateOperator(payload) {
        const { id, ...rest } = payload;
        if (rest.operatorType) {
            await this.syncOperatorSubcategoryToMaster(rest.operatorType);
        }
        const rows = await this.prisma.$queryRawUnsafe(`
            UPDATE tourism_operators
            SET name = COALESCE($1, name),
            license_no = COALESCE($2, license_no),
            operator_type = COALESCE($3, operator_type),
            contact_person = COALESCE($4, contact_person),
            phone = COALESCE($5, phone),
            email = COALESCE($6, email),
            website = COALESCE($7, website),
            address = COALESCE($8, address),
            packages_offered = COALESCE($9::jsonb, packages_offered),
            rating = COALESCE($10, rating),
            is_verified = COALESCE($11, is_verified),
            is_active = COALESCE($12, is_active),
            updated_at = CURRENT_TIMESTAMP
            WHERE id = $13
            RETURNING *;
        `, rest.name ?? null, rest.licenseNo ?? null, rest.operatorType ?? null, rest.contactPerson ?? null, rest.phone ?? null, rest.email ?? null, rest.website ?? null, rest.address ?? null, rest.packagesOffered ? JSON.stringify(rest.packagesOffered) : null, rest.rating ?? null, rest.isVerified ?? null, rest.isActive ?? null, Number(id));
        if (!rows || rows.length === 0) throw shared_1.ServiceException.notFound(`Operator #${id} not found`);
        return this.mapOperator(rows[0]);
    }

    async deleteOperator(id) {
        await this.prisma.$executeRawUnsafe(`DELETE FROM tourism_operators WHERE id = $1;`, Number(id));
        return { id: Number(id), deleted: true };
    }

    // ---------------------------------------------------------------------------
    // Row Mappers
    // ---------------------------------------------------------------------------
    mapCircuit(r) {
        return {
            id: r.id,
            name: r.name,
            slug: r.slug,
            region: r.region,
            description: r.description,
            highlightPandals: r.highlight_pandals ?? r.highlightPandals ?? [],
            tags: r.tags ?? [],
            duration: r.duration,
            bestTimeOfDay: r.best_time_of_day ?? r.bestTimeOfDay,
            recommendedTransport: r.recommended_transport ?? r.recommendedTransport,
            crowdLevel: r.crowd_level ?? r.crowdLevel,
            coverImageUrl: r.cover_image_url ?? r.coverImageUrl,
            galleryImages: r.gallery_images ?? r.galleryImages ?? [],
            isActive: r.is_active ?? r.isActive,
            isFeatured: r.is_featured ?? r.isFeatured,
            sortOrder: r.sort_order ?? r.sortOrder,
            createdAt: r.created_at ?? r.createdAt,
            updatedAt: r.updated_at ?? r.updatedAt
        };
    }

    mapStay(r) {
        return {
            id: r.id,
            name: r.name,
            slug: r.slug,
            type: r.type,
            location: r.location,
            city: r.city,
            district: r.district,
            priceRange: r.price_range ?? r.priceRange,
            budgetTier: r.budget_tier ?? r.budgetTier,
            starRating: r.star_rating ?? r.starRating,
            amenities: r.amenities ?? [],
            contactPhone: r.contact_phone ?? r.contactPhone,
            contactEmail: r.contact_email ?? r.contactEmail,
            bookingUrl: r.booking_url ?? r.bookingUrl,
            description: r.description,
            coverImageUrl: r.cover_image_url ?? r.coverImageUrl,
            isWbtdc: r.is_wbtdc ?? r.isWbtdc,
            isActive: r.is_active ?? r.isActive,
            isFeatured: r.is_featured ?? r.isFeatured,
            createdAt: r.created_at ?? r.createdAt,
            updatedAt: r.updated_at ?? r.updatedAt
        };
    }

    mapTransport(r) {
        return {
            id: r.id,
            name: r.name,
            category: r.category,
            operatingHours: r.operating_hours ?? r.operatingHours,
            routeDescription: r.route_description ?? r.routeDescription,
            fareGuide: r.fare_guide ?? r.fareGuide,
            bookingOrHelpline: r.booking_or_helpline ?? r.bookingOrHelpline,
            tips: r.tips ?? [],
            coverImageUrl: r.cover_image_url ?? r.coverImageUrl,
            isActive: r.is_active ?? r.isActive,
            sortOrder: r.sort_order ?? r.sortOrder,
            createdAt: r.created_at ?? r.createdAt,
            updatedAt: r.updated_at ?? r.updatedAt
        };
    }

    mapFestivalDay(r) {
        return {
            id: r.id,
            tithiName: r.tithi_name ?? r.tithiName,
            date: r.date,
            rituals: r.rituals,
            tourismTips: r.tourism_tips ?? r.tourismTips,
            bestTimeWindows: r.best_time_windows ?? r.bestTimeWindows,
            highlights: r.highlights ?? [],
            sortOrder: r.sort_order ?? r.sortOrder,
            createdAt: r.created_at ?? r.createdAt
        };
    }

    mapItinerary(r) {
        return {
            id: r.id,
            title: r.title,
            slug: r.slug,
            durationDays: r.duration_days ?? r.durationDays,
            targetAudience: r.target_audience ?? r.targetAudience,
            overview: r.overview,
            dayPlans: r.day_plans ?? r.dayPlans ?? [],
            includedHighlights: r.included_highlights ?? r.includedHighlights ?? [],
            coverImageUrl: r.cover_image_url ?? r.coverImageUrl,
            isCurated: r.is_curated ?? r.isCurated,
            isActive: r.is_active ?? r.isActive,
            sortOrder: r.sort_order ?? r.sortOrder,
            createdAt: r.created_at ?? r.createdAt,
            updatedAt: r.updated_at ?? r.updatedAt
        };
    }

    mapKnowledge(r) {
        return {
            id: r.id,
            category: r.category,
            title: r.title,
            content: r.content,
            quickTips: r.quick_tips ?? r.quickTips ?? [],
            sortOrder: r.sort_order ?? r.sortOrder,
            isActive: r.is_active ?? r.isActive,
            createdAt: r.created_at ?? r.createdAt
        };
    }

    mapOperator(r) {
        return {
            id: r.id,
            name: r.name,
            licenseNo: r.license_no ?? r.licenseNo,
            operatorType: r.operator_type ?? r.operatorType,
            contactPerson: r.contact_person ?? r.contactPerson,
            phone: r.phone,
            email: r.email,
            website: r.website,
            address: r.address,
            packagesOffered: r.packages_offered ?? r.packagesOffered ?? [],
            rating: Number(r.rating) || 4.5,
            isVerified: r.is_verified ?? r.isVerified,
            isActive: r.is_active ?? r.isActive,
            createdAt: r.created_at ?? r.createdAt
        };
    }

    mapEnquiry(r) {
        return {
            id: r.id,
            enquiryCode: r.enquiry_code ?? r.enquiryCode,
            fullName: r.full_name ?? r.fullName,
            email: r.email,
            phone: r.phone,
            country: r.country,
            city: r.city,
            numberOfTravellers: r.number_of_travellers ?? r.numberOfTravellers,
            startDate: r.start_date ?? r.startDate,
            endDate: r.end_date ?? r.endDate,
            durationPreference: r.duration_preference ?? r.durationPreference,
            preferredCircuits: r.preferred_circuits ?? r.preferredCircuits ?? [],
            interests: r.interests ?? [],
            stayPreference: r.stay_preference ?? r.stayPreference,
            transportPreference: r.transport_preference ?? r.transportPreference,
            pujaPreferences: r.puja_preferences ?? r.pujaPreferences ?? [],
            specialRequirements: r.special_requirements ?? r.specialRequirements,
            status: r.status,
            assignedToId: r.assigned_to_id ?? r.assignedToId,
            assignedUserName: r.assigned_user_name ?? r.assignedUserName,
            adminRemarks: r.admin_remarks ?? r.adminRemarks,
            consentGiven: r.consent_given ?? r.consentGiven,
            preferredLanguage: r.preferred_language ?? r.preferredLanguage ?? 'en',
            createdAt: r.created_at ?? r.createdAt,
            updatedAt: r.updated_at ?? r.updatedAt
        };
    }
};

exports.TourismService = TourismService;
exports.TourismService = TourismService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [database_1.PrismaService])
], TourismService);

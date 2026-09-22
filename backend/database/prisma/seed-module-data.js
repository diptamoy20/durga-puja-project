/**
 * Demo module data ported from DurgapujaPHP_old.zip seeders and SQL dumps.
 * Called after core RBAC/users/taxonomy seed in seed.js.
 */
const {
  PrismaClient,
  AtlasStatus,
  ArticleStatus,
  CommitteeStatus,
  DiasporaStatus,
  RsvpStatus,
  WebinarStatus,
  InvestmentOpportunityStatus,
} = require('@prisma/client');

const SAMPLE_DIASPORA = [
  {
    registrationNo: 'DGC-D-2026-A1B2C3D4',
    fullName: 'Ananya Sen',
    dob: new Date('1990-05-12'),
    gender: 'female',
    email: 'ananya.sen@example.com',
    mobile: '+447700900123',
    country: 'United Kingdom',
    city: 'London',
    nationality: 'British',
    address1: '14 Camden High Street',
    state: 'England',
    postalCode: 'NW1 0JH',
    districtOrigin: 'Kolkata',
    relationshipWithBengal: 'Born in Bengal, living abroad',
    languages: 'Bengali, English',
    interests: ['culture', 'volunteering'],
    volunteer: true,
    receiveUpdates: true,
    termsAccepted: true,
    status: DiasporaStatus.VERIFIED,
  },
  {
    registrationNo: 'DGC-D-2026-E5F6G7H8',
    fullName: 'Rahul Mukherjee',
    dob: new Date('1985-11-03'),
    gender: 'male',
    email: 'rahul.m@example.com',
    mobile: '+14155550123',
    country: 'United States',
    city: 'San Francisco',
    nationality: 'American',
    address1: '500 Market Street',
    state: 'California',
    postalCode: '94105',
    districtOrigin: 'Howrah',
    relationshipWithBengal: 'Second-generation diaspora',
    languages: 'Bengali, English, Hindi',
    interests: ['heritage', 'travel'],
    volunteer: false,
    receiveUpdates: true,
    termsAccepted: true,
    status: DiasporaStatus.PENDING,
  },
];

const SAMPLE_COMMITTEES = [
  {
    registrationNo: 'DGC-C-2026-COMM001',
    committeeId: 'DPCOM-2026-00001',
    committeeName: 'Bagbazar Sarbojanin Durgotsav Committee',
    establishedYear: 1919,
    pujaType: 'Community Sarbojanin',
    pujaCategory: 'Heritage',
    committeeDescription: 'One of the oldest community Durga Puja celebrations in Kolkata.',
    contactPersonName: 'Debashis Chatterjee',
    designation: 'General Secretary',
    email: 'contact@bagbazarpuja.example.com',
    mobile: '+919876543210',
    country: 'India',
    state: 'West Bengal',
    city: 'Kolkata',
    postalCode: '700003',
    venueName: 'Bagbazar Sarbojanin Ground',
    venueAddress: '7/1, Bagbazar Street, Bagbazar, North Kolkata',
    landmark: 'Near Bagbazar Ghat',
    address: '7/1, Bagbazar Street, Bagbazar, North Kolkata, West Bengal 700003',
    registrationCertificate: 'committee-documents/sample-registration.pdf',
    addressProof: 'committee-documents/sample-address.pdf',
    pandalImage: 'committee-documents/sample-pandal.jpg',
    declaration: true,
    status: CommitteeStatus.APPROVED,
  },
  {
    registrationNo: 'DGC-C-2026-COMM002',
    committeeId: 'DPCOM-2026-00002',
    committeeName: 'Ekdalia Evergreen Club',
    establishedYear: 1943,
    pujaType: 'Club Puja',
    pujaCategory: 'Traditional',
    committeeDescription: 'Renowned South Kolkata puja known for traditional idol craftsmanship.',
    contactPersonName: 'Suman Das',
    designation: 'President',
    email: 'info@ekdaliaevergreen.example.com',
    mobile: '+919123456789',
    country: 'India',
    state: 'West Bengal',
    city: 'Kolkata',
    postalCode: '700019',
    venueName: 'Ekdalia Evergreen Club Ground',
    venueAddress: '15, Ekdalia Road, Gariahat',
    landmark: 'Near Gariahat Market',
    address: '15, Ekdalia Road, Gariahat, South Kolkata, West Bengal 700019',
    registrationCertificate: 'committee-documents/sample-registration-2.pdf',
    addressProof: 'committee-documents/sample-address-2.pdf',
    pandalImage: 'committee-documents/sample-pandal-2.jpg',
    declaration: true,
    status: CommitteeStatus.APPROVED,
  },
];

const SAMPLE_PANDALS = [
  {
    name: 'Bagbazar Sarbojanin Durgotsav',
    location: '7/1, Bagbazar Street, Bagbazar, North Kolkata, West Bengal 700003',
    latitude: '22.6026850',
    longitude: '88.3683220',
    photos: [
      'https://images.unsplash.com/photo-1601662528567-526cd06f6582?auto=format&fit=crop&w=1200&q=80',
    ],
    timing: 'Open 24 Hours (Best visiting: 8:00 AM - 1:00 AM)',
    ritualSchedule: 'Maha Sasthi Bodhon at 6:30 PM; Sandhi Puja on Ashtami.',
    livestreamUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    virtualTourUrl: 'https://www.google.com/maps/@22.602685,88.368322,3a,75y,90t/data=!3m8!1e1',
    status: AtlasStatus.APPROVED,
  },
  {
    name: 'Ekdalia Evergreen Club',
    location: '15, Ekdalia Road, Gariahat, South Kolkata, West Bengal 700019',
    latitude: '22.5218760',
    longitude: '88.3680410',
    photos: [
      'https://images.unsplash.com/photo-1596461404969-9ae70f2830c1?auto=format&fit=crop&w=1200&q=80',
    ],
    timing: 'Morning 7:00 AM – Midnight 2:00 AM',
    ritualSchedule: 'Sandhi Puja 5:15 PM; Boron & Sindoor Utsav on Dashami.',
    livestreamUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    virtualTourUrl: 'https://pannellum.org/images/alma.jpg',
    status: AtlasStatus.APPROVED,
  },
  {
    name: 'Maddox Square Puja',
    location: 'Ritchie Road, Ballygunge, South Kolkata, West Bengal 700019',
    latitude: '22.5298900',
    longitude: '88.3592100',
    photos: [
      'https://images.unsplash.com/photo-1567157577867-05ccb1388e66?auto=format&fit=crop&w=1200&q=80',
    ],
    timing: 'Open 24 Hours',
    ritualSchedule: 'Daily Anjali 9:30 AM - 11:30 AM; Dashami Sindoor Khela 10:00 AM.',
    livestreamUrl: null,
    virtualTourUrl: 'https://www.google.com/maps/@22.52989,88.35921,3a,75y/data=!3m8!1e1',
    status: AtlasStatus.APPROVED,
  },
];

const SAMPLE_ARTICLES = [
  {
    title: 'Exclusive Look: Maddox Square Pandal Reveal',
    slug: 'exclusive-look-maddox-square-pandal-reveal',
    subcategorySlug: 'news',
    status: ArticleStatus.PUBLISHED,
    publishedAt: new Date(Date.now() - 2 * 86400000),
  },
  {
    title: 'Spotlight on Artisans of Kumartuli',
    slug: 'spotlight-on-artisans-of-kumartuli',
    subcategorySlug: 'heritage',
    status: ArticleStatus.APPROVED,
    approvedAt: new Date(Date.now() - 5 * 3600000),
  },
  {
    title: 'Top 10 Cuisine Trails for Navami',
    slug: 'top-10-cuisine-trails-for-navami',
    subcategorySlug: 'travel-tourism',
    status: ArticleStatus.SCHEDULED,
    scheduledAt: new Date(Date.now() + 2 * 86400000),
    approvedAt: new Date(Date.now() - 10 * 3600000),
  },
];

const SAMPLE_WEBINARS = [
  {
    slug: 'global-durga-puja-heritage-and-sustainable-tourism',
    title: 'Global Durga Puja Heritage & Sustainable Tourism',
    subtitle: 'Exploring cultural diplomacy, eco-friendly pandals, and global festival tourism.',
    description: 'Join international heritage scholars and puja committee leaders for an in-depth symposium.',
    scheduledStartTime: new Date(Date.now() + 3 * 86400000 + 18.5 * 3600000),
    scheduledEndTime: new Date(Date.now() + 3 * 86400000 + 20 * 3600000),
    status: WebinarStatus.SCHEDULED,
    isFeatured: true,
    maxAttendees: 250,
    liveStreamUrl: 'https://www.youtube.com/watch?v=live_stream_sample_1',
    liveMeetingUrl: 'https://zoom.us/j/9876543210',
    liveMeetingPasscode: 'GS2026',
    speakers: [{ name: 'Dr. Anirban Mukherjee', designation: 'Cultural Anthropologist' }],
    rsvps: [
      { name: 'Siddharth Roy', email: 'siddharth@example.com', organization: 'Kolkata Tourism Forum', cityCountry: 'Kolkata, India' },
      { name: 'Meera Sengupta', email: 'meera.s@example.org', organization: 'London Sharad Utsav', cityCountry: 'London, UK' },
    ],
  },
  {
    slug: 'virtual-pandal-architecture-masterclass',
    title: 'Virtual Pandal Architecture Masterclass: From Clay to Canopy',
    subtitle: 'Live interactive demonstration with celebrated artisans.',
    description: 'Experience a behind-the-scenes masterclass streaming live from Kumartuli.',
    scheduledStartTime: new Date(Date.now() - 30 * 60000),
    scheduledEndTime: new Date(Date.now() + 60 * 60000),
    status: WebinarStatus.LIVE,
    isFeatured: true,
    maxAttendees: 500,
    liveStreamUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    speakers: [{ name: 'Bhabatosh Sutar', designation: 'Installation Artist' }],
    rsvps: [],
  },
];

async function seedModuleData(prisma = new PrismaClient()) {
  const admin = await prisma.user.findFirst({
    where: { email: 'admin@durgapujaglobalconnect.in' },
    select: { id: true },
  });
  if (!admin) {
    console.log('  Module data: skipped (admin user not found)');
    return;
  }

  const adminId = admin.id;
  let diasporaCount = 0;
  for (const row of SAMPLE_DIASPORA) {
    await prisma.diasporaRegistration.upsert({
      where: { email: row.email },
      update: { ...row },
      create: {
        ...row,
        ...(row.status === DiasporaStatus.VERIFIED
          ? { verifiedById: adminId, verifiedAt: new Date() }
          : {}),
      },
    });
    diasporaCount += 1;
  }

  const committeeIds = [];
  let committeeCount = 0;
  for (const row of SAMPLE_COMMITTEES) {
    const committee = await prisma.pujaCommittee.upsert({
      where: { registrationNo: row.registrationNo },
      update: { ...row, approvedById: adminId, approvedAt: new Date() },
      create: { ...row, approvedById: adminId, approvedAt: new Date() },
    });
    committeeIds.push(committee.id);
    committeeCount += 1;
  }

  let pandalCount = 0;
  for (let i = 0; i < SAMPLE_PANDALS.length; i += 1) {
    const row = SAMPLE_PANDALS[i];
    const committeeId = committeeIds[i % committeeIds.length];
    const existing = await prisma.pandalAtlas.findFirst({
      where: { name: row.name, pujaCommitteeId: committeeId },
      select: { id: true },
    });
    const data = {
      ...row,
      pujaCommitteeId: committeeId,
      approvedById: adminId,
      approvedAt: new Date(),
      createdById: adminId,
      updatedById: adminId,
    };
    if (existing) {
      await prisma.pandalAtlas.update({ where: { id: existing.id }, data });
    } else {
      await prisma.pandalAtlas.create({ data });
    }
    pandalCount += 1;
  }

  const newsSubcategory = await prisma.subcategory.findFirst({
    where: { slug: 'news', category: { slug: 'article' } },
    select: { id: true },
  });
  let articleCount = 0;
  if (newsSubcategory) {
    for (const row of SAMPLE_ARTICLES) {
      const subcategory = await prisma.subcategory.findFirst({
        where: { slug: row.subcategorySlug, category: { slug: 'article' } },
        select: { id: true },
      });
      if (!subcategory) continue;
      await prisma.article.upsert({
        where: { slug: row.slug },
        update: {
          title: row.title,
          status: row.status,
          subcategoryId: subcategory.id,
          publishedAt: row.publishedAt ?? null,
          scheduledAt: row.scheduledAt ?? null,
          approvedAt: row.approvedAt ?? null,
          approvedById: row.approvedAt ? adminId : null,
        },
        create: {
          title: row.title,
          slug: row.slug,
          subcategoryId: subcategory.id,
          excerpt: `Short excerpt for ${row.title}.`,
          content: `<p>Full content for ${row.title}, ported from the legacy PHP CMS seed.</p>`,
          status: row.status,
          authorId: adminId,
          createdById: adminId,
          updatedById: adminId,
          publishedAt: row.publishedAt ?? null,
          scheduledAt: row.scheduledAt ?? null,
          approvedAt: row.approvedAt ?? null,
          approvedById: row.approvedAt ? adminId : null,
        },
      });
      articleCount += 1;
    }
  }

  let webinarCount = 0;
  let rsvpCount = 0;
  for (const row of SAMPLE_WEBINARS) {
    const { rsvps, ...webinarData } = row;
    const webinar = await prisma.webinar.upsert({
      where: { slug: row.slug },
      update: {
        ...webinarData,
        isPublished: true,
        requiresRegistration: true,
        updatedById: adminId,
      },
      create: {
        ...webinarData,
        isPublished: true,
        requiresRegistration: true,
        createdById: adminId,
        updatedById: adminId,
      },
    });
    webinarCount += 1;
    for (const rsvp of rsvps ?? []) {
      await prisma.webinarRegistration.upsert({
        where: { webinarId_email: { webinarId: webinar.id, email: rsvp.email } },
        update: { ...rsvp, status: RsvpStatus.CONFIRMED },
        create: {
          ...rsvp,
          webinarId: webinar.id,
          registrationCode: `WR-${Math.random().toString(16).slice(2, 10).toUpperCase()}`,
          status: RsvpStatus.CONFIRMED,
        },
      });
      rsvpCount += 1;
    }
  }

  // Seed Industry Associations
  const SAMPLE_ASSOCIATIONS = [
    {
      code: 'BCCI',
      name: 'The Bengal Chamber of Commerce and Industry',
      category: 'Apex Chamber',
      description: 'The oldest chamber of commerce in India, established in 1853, actively promoting economic growth and investment across West Bengal.',
      contactPerson: 'Arunav Ghosh (Director General)',
      email: 'invest@bengalchamber.com',
      phone: '+91-33-2220-8332',
      website: 'https://bengalchamber.com',
      address: 'Royal Exchange, 6 Netaji Subhas Road, Kolkata 700001',
      sortOrder: 1,
    },
    {
      code: 'CII-ER',
      name: 'Confederation of Indian Industry (Eastern Region)',
      category: 'Apex Chamber',
      description: 'Premier business association driving industrial competitiveness, tourism development, and public-private partnerships.',
      contactPerson: 'Priyanka Mukherjee (Head - Investment Promotion)',
      email: 'invest.east@cii.in',
      phone: '+91-33-2280-7320',
      website: 'https://cii.in',
      address: '6 Netaji Subhas Road, Dalhousie, Kolkata 700001',
      sortOrder: 2,
    },
    {
      code: 'ICC',
      name: 'Indian Chamber of Commerce',
      category: 'National Chamber',
      description: 'Pioneering chamber facilitating regional cross-border commerce, diaspora investments, and MSME integration in West Bengal.',
      contactPerson: 'Sanjay Sen (Director - Trade & Investment)',
      email: 'investor.desk@indianchamber.net',
      phone: '+91-33-2253-4200',
      website: 'https://indianchamber.net',
      address: 'ICC Towers, 4 India Exchange Place, Kolkata 700001',
      sortOrder: 3,
    },
    {
      code: 'BNCCI',
      name: 'Bengal National Chamber of Commerce & Industry',
      category: 'Heritage Chamber',
      description: 'Established in 1887, promoting indigenous industries, creative crafts, and heritage hospitality in Bengal.',
      contactPerson: 'Debolina Roy (Secretary)',
      email: 'bncci@bncci.com',
      phone: '+91-33-2248-2951',
      website: 'https://bncci.com',
      address: '23 R.N. Mukherjee Road, Kolkata 700001',
      sortOrder: 4,
    },
    {
      code: 'FOSMI',
      name: 'Federation of Small & Medium Industries',
      category: 'MSME Council',
      description: 'Dedicated body championing micro and small enterprise manufacturing, artisan clusters, and supply chain modernisation.',
      contactPerson: 'Kamal Nandi (Vice President)',
      email: 'info@fosmi.org.in',
      phone: '+91-33-2248-5114',
      website: 'https://fosmi.org.in',
      address: '23 Circus Avenue, Kolkata 700017',
      sortOrder: 5,
    },
  ];

  const associationMap = {};
  let associationCount = 0;
  for (const assoc of SAMPLE_ASSOCIATIONS) {
    const record = await prisma.industryAssociation.upsert({
      where: { code: assoc.code },
      update: { ...assoc, isActive: true },
      create: { ...assoc, isActive: true },
    });
    associationMap[assoc.code] = record.id;
    associationCount += 1;
  }

  // Seed Investment Opportunities
  const SAMPLE_OPPORTUNITIES = [
    {
      title: 'Heritage Boutique Hotels & Riverfront Stays along Hooghly',
      slug: 'heritage-boutique-hotels-hooghly-riverfront',
      sector: 'Tourism & Hospitality',
      category: 'Heritage Restoration',
      location: 'Kolkata, Howrah & Hooghly Ghats',
      district: 'Kolkata',
      summary: 'Adaptive reuse of 18th & 19th-century colonial rajbaris, Dutch trading houses, and ghat warehouses into experiential boutique heritage hotels for high-yield festival tourism.',
      description: `<h3>Project Overview</h3>
<p>Durga Puja attracts over 2 million global and domestic visitors to Kolkata annually. This project offers private investors and diaspora hoteliers turn-key architectural conservation sites along the historic Hooghly River corridor with fast-track single window approvals.</p>
<h3>Investment Scope</h3>
<ul>
  <li>5 identified riverfront heritage mansions ready for adaptive hospitality reuse</li>
  <li>Private jetty connectivity for luxury Durga Puja pandal-hopping river cruises</li>
  <li>Curated gastronomy showcasing royal Bengal cuisine and culinary heritage</li>
</ul>`,
      investmentRange: '₹5 Cr - ₹20 Cr',
      investmentMin: 50000000,
      investmentMax: 200000000,
      projectType: 'PPP & Private Equity',
      expectedRoi: '18% - 24% IRR',
      highlights: [
        'Prime riverfront ghat access with dedicated cruise docking',
        'State heritage tax rebates & concessional electricity tariffs',
        'Pre-approved master architectural conservation blueprints',
        'Guaranteed autumn festival peak occupancy pipeline',
      ],
      incentives: 'West Bengal Tourism Policy 2023 provides 20% capital investment subsidy up to ₹1.5 Crore, 100% stamp duty waiver, and power tariff incentives for 5 years.',
      coverImageUrl: 'https://images.unsplash.com/photo-1590059390047-94a56a6ecfa1?auto=format&fit=crop&w=1200&q=80',
      associationCode: 'BCCI',
      contactEmail: 'heritage.invest@bengalchamber.com',
      contactPhone: '+91-33-2220-8332',
      status: InvestmentOpportunityStatus.PUBLISHED,
      isFeatured: true,
      publishedAt: new Date('2026-02-01'),
    },
    {
      title: 'Kumartuli Idol Craft & Clay Artisan Modernisation Hub',
      slug: 'kumartuli-idol-craft-artisan-hub',
      sector: 'Handicrafts & Artisans',
      category: 'Creative Manufacturing',
      location: 'Kumartuli, North Kolkata',
      district: 'Kolkata',
      summary: 'Modernised solar-powered drying units, eco-friendly natural clay R&D laboratory, and export-grade fiberglass packing facility for global diaspora Puja deliveries.',
      description: `<h3>Preserving Heritage, Expanding Global Reach</h3>
<p>Kumartuli crafts over 4,500 Durga idols annually, exporting to 45+ countries. This project creates common facility centers, dehumidified drying chambers, lightweight material casting, and global logistics corridors.</p>`,
      investmentRange: '₹50 Lakhs - ₹2 Cr',
      investmentMin: 5000000,
      investmentMax: 20000000,
      projectType: 'Joint Venture & Impact Investment',
      expectedRoi: '15% - 20% IRR',
      highlights: [
        'Direct export linkage to 500+ global diaspora Puja committees',
        'State-of-the-art climate-controlled curing and packaging center',
        'Eco-friendly non-toxic natural pigment certification laboratory',
      ],
      incentives: 'MSME Cluster Development subsidy up to 70% of project machinery costs under West Bengal MSME Policy.',
      coverImageUrl: 'https://images.unsplash.com/photo-1601050690597-df0568f70950?auto=format&fit=crop&w=1200&q=80',
      associationCode: 'FOSMI',
      contactEmail: 'artisan.cluster@fosmi.org.in',
      contactPhone: '+91-33-2248-5114',
      status: InvestmentOpportunityStatus.PUBLISHED,
      isFeatured: true,
      publishedAt: new Date('2026-02-15'),
    },
    {
      title: 'AR/VR Durga Puja Immersive Metaverse & Cultural Tech Platform',
      slug: 'ar-vr-durga-puja-metaverse-cultural-tech',
      sector: 'IT & Cultural Tech',
      category: 'Digital Media & Web3',
      location: 'Silicon Valley Hub, New Town, Kolkata',
      district: 'North 24 Parganas',
      summary: 'High-fidelity spatial computing and VR live streaming infrastructure enabling diaspora worldwide to participate in Kolkata’s UNESCO heritage festival virtually.',
      description: `<h3>Digitalizing Bengal’s Living Heritage</h3>
<p>Building an ultra-low latency photogrammetric 3D capture and live spatial audio streaming platform connecting 200+ landmark pandals with global VR headset users and mobile apps.</p>`,
      investmentRange: '₹1 Cr - ₹5 Cr',
      investmentMin: 10000000,
      investmentMax: 50000000,
      projectType: 'Venture Capital & Angel Syndicate',
      expectedRoi: '25%+ IRR',
      highlights: [
        'Official digital streaming partnership with top 100 Sarbojanin pandals',
        'Monetisation via VIP virtual darshan passes, VR puja kits, and diaspora sponsorships',
        'Incubated at New Town Silicon Valley IT corridor',
      ],
      incentives: 'West Bengal IT & ITeS Policy 2024 offers 100% electricity duty waiver for 5 years and up to ₹50 Lakhs innovation grant.',
      coverImageUrl: 'https://images.unsplash.com/photo-1593508512255-86ab42a8e620?auto=format&fit=crop&w=1200&q=80',
      associationCode: 'CII-ER',
      contactEmail: 'tech.invest@cii.in',
      contactPhone: '+91-33-2280-7320',
      status: InvestmentOpportunityStatus.PUBLISHED,
      isFeatured: true,
      publishedAt: new Date('2026-03-01'),
    },
    {
      title: 'Terracotta & Dokra Creative Village Tourism Corridor',
      slug: 'terracotta-dokra-creative-village-tourism-corridor',
      sector: 'Creative Economy',
      category: 'Rural Tourism & Crafts',
      location: 'Bishnupur & Bikna, Bankura District',
      district: 'Bankura',
      summary: 'Integrated rural artisan residency, terracotta craft retail experiential pavilion, and heritage homestay cluster in Bankura.',
      description: `<h3>Empowering Rural Master Craftsmen</h3>
<p>An eco-resort and artisan village corridor where international visitors experience terracotta temple history and dokra lost-wax metal casting firsthand.</p>`,
      investmentRange: '₹2 Cr - ₹8 Cr',
      investmentMin: 20000000,
      investmentMax: 80000000,
      projectType: 'PPP & Social Impact Capital',
      expectedRoi: '14% - 18% IRR',
      highlights: [
        'Adjacent to UNESCO tentative list Bishnupur Terracotta Temples',
        'Direct livelihood impact for 800+ indigenous artisan families',
        'Integrated GI-tagged Baluchari silk weaving and Dokra metal craft',
      ],
      incentives: 'Homestay & Rural Tourism Subsidy scheme providing 1.5x capital incentive in rural districts.',
      coverImageUrl: 'https://images.unsplash.com/photo-1582650625119-3a31f8418365?auto=format&fit=crop&w=1200&q=80',
      associationCode: 'BNCCI',
      contactEmail: 'craft.investment@bncci.com',
      contactPhone: '+91-33-2248-2951',
      status: InvestmentOpportunityStatus.APPROVED, // APPROVED but not PUBLISHED (tests visibility rule)
      isFeatured: false,
      approvedAt: new Date('2026-03-10'),
    },
    {
      title: 'Green Solar Microgrid & Eco Infrastructure for Pandals',
      slug: 'green-solar-microgrid-pandal-infrastructure',
      sector: 'Smart City & Clean Tech',
      category: 'Renewable Energy',
      location: 'Greater Kolkata Urban Area',
      district: 'Kolkata',
      summary: 'Modular plug-and-play solar storage units, quiet hybrid battery banks, and biodegradable decor supply chain for zero-carbon Durga Puja celebrations.',
      description: `<h3>Powering Zero-Emission Festivities</h3>
<p>Transitioning 3,000+ Kolkata pandals from diesel generator sets to hybrid solar-lithium battery microgrids and smart energy metering.</p>`,
      investmentRange: '₹1 Cr - ₹3 Cr',
      investmentMin: 10000000,
      investmentMax: 30000000,
      projectType: 'Equipment Leasing & Green Infra Debt',
      expectedRoi: '16% - 20% IRR',
      highlights: [
        'Massive recurring annual equipment rental contracts across 500+ puja committees',
        'Carbon credit generation through verified diesel generator displacement',
      ],
      incentives: 'Green Energy Open Access & Renewable Energy subsidy from WBREDA.',
      coverImageUrl: 'https://images.unsplash.com/photo-1509391365360-2e959784a276?auto=format&fit=crop&w=1200&q=80',
      associationCode: 'ICC',
      contactEmail: 'green.energy@indianchamber.net',
      contactPhone: '+91-33-2253-4200',
      status: InvestmentOpportunityStatus.PENDING_APPROVAL, // PENDING_APPROVAL
      isFeatured: false,
      submittedAt: new Date('2026-03-12'),
    },
    {
      title: 'Authentic Bengali Sweets & Culinary Cold Chain Export Network',
      slug: 'bengali-sweets-culinary-cold-chain-export-network',
      sector: 'F&B & Agri-business',
      category: 'Food Processing & Export',
      location: 'Dankuni Food Park, Hooghly',
      district: 'Hooghly',
      summary: 'Cryogenic freezing and MAP packaging hub for GI-tagged Joynagar Moa, Bengal Rosogolla, and festive delicacies for international delivery.',
      description: `<h3>Global Export of Bengal’s Heritage Sweets</h3>
<p>Modernized food processing facility with modified atmosphere packaging and direct air-freight consolidation to North America, Europe, and Middle East.</p>`,
      investmentRange: '₹3 Cr - ₹10 Cr',
      investmentMin: 30000000,
      investmentMax: 100000000,
      projectType: 'Private Equity & Export Venture',
      expectedRoi: '20% - 28% IRR',
      highlights: [
        'Dedicated GI-certified production lines',
        'Pre-booked holiday festive diaspora distribution agreements',
      ],
      incentives: 'Food Processing Capital Subsidy of up to ₹2.5 Crore under West Bengal Agri-Marketing scheme.',
      coverImageUrl: 'https://images.unsplash.com/photo-1505253758473-96b7015fcd40?auto=format&fit=crop&w=1200&q=80',
      associationCode: 'BCCI',
      contactEmail: 'agri.food@bengalchamber.com',
      contactPhone: '+91-33-2220-8332',
      status: InvestmentOpportunityStatus.DRAFT, // DRAFT
      isFeatured: false,
    },
  ];

  let opportunityCount = 0;
  for (const opp of SAMPLE_OPPORTUNITIES) {
    const { associationCode, ...data } = opp;
    const associationId = associationCode ? associationMap[associationCode] : null;

    await prisma.investmentOpportunity.upsert({
      where: { slug: opp.slug },
      update: {
        ...data,
        associationId,
        updatedById: adminId,
      },
      create: {
        ...data,
        associationId,
        createdById: adminId,
        updatedById: adminId,
        submittedById: opp.status === InvestmentOpportunityStatus.PENDING_APPROVAL ? adminId : null,
        approvedById: (opp.status === InvestmentOpportunityStatus.APPROVED || opp.status === InvestmentOpportunityStatus.PUBLISHED) ? adminId : null,
        publishedById: opp.status === InvestmentOpportunityStatus.PUBLISHED ? adminId : null,
        histories: {
          create: [
            {
              userId: adminId,
              action: 'created',
              newStatus: InvestmentOpportunityStatus.DRAFT,
            },
            ...(opp.status === InvestmentOpportunityStatus.PENDING_APPROVAL
              ? [{ userId: adminId, action: 'submitted', previousStatus: InvestmentOpportunityStatus.DRAFT, newStatus: InvestmentOpportunityStatus.PENDING_APPROVAL }]
              : []),
            ...(opp.status === InvestmentOpportunityStatus.APPROVED
              ? [{ userId: adminId, action: 'approved', previousStatus: InvestmentOpportunityStatus.PENDING_APPROVAL, newStatus: InvestmentOpportunityStatus.APPROVED }]
              : []),
            ...(opp.status === InvestmentOpportunityStatus.PUBLISHED
              ? [
                  { userId: adminId, action: 'approved', previousStatus: InvestmentOpportunityStatus.PENDING_APPROVAL, newStatus: InvestmentOpportunityStatus.APPROVED },
                  { userId: adminId, action: 'published', previousStatus: InvestmentOpportunityStatus.APPROVED, newStatus: InvestmentOpportunityStatus.PUBLISHED },
                ]
              : []),
          ],
        },
      },
    });
    opportunityCount += 1;
  }

  console.log(`  Module data: ${diasporaCount} diaspora, ${committeeCount} committees, ${pandalCount} pandals, ${articleCount} articles, ${webinarCount} webinars, ${rsvpCount} RSVPs, ${associationCount} associations, ${opportunityCount} investment opportunities`);
}

module.exports = { seedModuleData };

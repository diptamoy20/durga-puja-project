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

  console.log(`  Module data: ${diasporaCount} diaspora, ${committeeCount} committees, ${pandalCount} pandals, ${articleCount} articles, ${webinarCount} webinars, ${rsvpCount} RSVPs`);
}

module.exports = { seedModuleData };

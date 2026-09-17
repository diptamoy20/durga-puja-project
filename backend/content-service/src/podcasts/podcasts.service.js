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
exports.PodcastsService = void 0;
const database_1 = require("@dpgc/database");
const shared_1 = require("@dpgc/shared");
const common_1 = require("@nestjs/common");

const INITIAL_EPISODES = [
    {
        title: "The Awakening: Mahalaya, Birendra Krishna Bhadra & The Dawn of Devi Paksha",
        slug: "the-awakening-mahalaya-birendra-krishna-bhadra",
        seasonNumber: 1,
        episodeNumber: 1,
        summary: "Explore the immortal magic of 4:00 AM radio broadcasts on Mahalaya, the resonance of Chandipath, and how Birendra Krishna Bhadra became the definitive voice of Bengal's festive dawn.",
        description: "Mahalaya marks the formal invocation of Maa Durga and the end of Pitri Paksha. In this premiere episode of Bishwo Jure Bangalir Aabeg, we delve into the cultural phenomenon of Mahisasuramardini, the 90-year legacy of All India Radio's dawn broadcast, and why generations of Bengalis across 6 continents still wake before dawn to welcome the Goddess.",
        transcript: "Welcome to Bishwo Jure Bangalir Aabeg, the official cultural podcast of Durga Puja Global Connect, presented by the Department of Tourism, Government of West Bengal. It is 4:00 AM on Mahalaya morning. The autumn dew rests on kasher bon, the shiuli blossoms fragrance the air, and from every balcony in Kolkata to living rooms in London and California, the conch shells echo...",
        audioUrl: "https://actions.google.com/sounds/v1/water/rain_heavy.ogg",
        audioDurationSeconds: 1845,
        audioFileSize: 14760000,
        coverImageUrl: "https://images.unsplash.com/photo-1601050690597-df0568f70950?w=800&q=80",
        hostName: "Shreya Sen",
        guestName: "Dr. Debashis Mukherjee",
        guestTitle: "Cultural Historian & Author, Kolkata Heritage Collective",
        guestBio: "Dr. Mukherjee has spent over 25 years chronicling the radio history and sonic landscape of Bengal festivals.",
        tags: ["Mahalaya", "Radio History", "Chandipath", "Devi Paksha", "Tradition"],
        language: "bn",
        isPublished: true,
        isFeatured: true,
        spotifyUrl: "https://open.spotify.com",
        applePodcastsUrl: "https://podcasts.apple.com",
        youtubeUrl: "https://youtube.com",
        reactions: { like: 142, love: 288, celebrate: 165, clap: 194 },
    },
    {
        title: "The Rhythm of Kasher Bon: Dhakis, Kanshi & The Acoustic Heritage of Bengal",
        slug: "the-rhythm-of-kasher-bon-dhakis-kanshi-heritage",
        seasonNumber: 1,
        episodeNumber: 2,
        summary: "An intimate journey into the lives of Bengal's traditional Dhaki communities traveling from Murshidabad and Bankura to make Kolkata dance during Sharadotsav.",
        description: "No Durga Puja begins until the visceral beat of the Dhak reverberates through the neighbourhood. We sit down with master percussionists to uncover how the complex rhythmic bol patterns (Ta-Dha-Khin-Ta) are handed down through generations and how Dhakis preserve Bengal's UNESCO-recognised living oral heritage.",
        transcript: "Listen closely to that opening flourish. That is the Chala bol, summoning the neighborhood to Sandhya Arati. Today, we meet Gokul Das, a fourth-generation Dhaki from Murshidabad whose family has played at Bagbazar Sarbojanin for over 60 years...",
        audioUrl: "https://actions.google.com/sounds/v1/ambiences/outdoor_market.ogg",
        audioDurationSeconds: 1620,
        audioFileSize: 12960000,
        coverImageUrl: "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=800&q=80",
        hostName: "Shreya Sen",
        guestName: "Pt. Tanmoy Bose",
        guestTitle: "Grammy-Nominated Percussion Maestro",
        guestBio: "Renowned tabla and rhythm maestro known for elevating indigenous folk rhythms of Bengal onto the world stage.",
        tags: ["Dhak", "Music", "Heritage", "Percussion", "UNESCO"],
        language: "bn",
        isPublished: true,
        isFeatured: false,
        spotifyUrl: "https://open.spotify.com",
        applePodcastsUrl: "https://podcasts.apple.com",
        youtubeUrl: "https://youtube.com",
        reactions: { like: 98, love: 185, celebrate: 110, clap: 240 },
    },
    {
        title: "Sculpting the Divine: The Clay Artisans of Kumartuli",
        slug: "sculpting-the-divine-clay-artisans-kumartuli",
        seasonNumber: 1,
        episodeNumber: 3,
        summary: "Step inside the narrow alleyways of Kumartuli, where Ganga clay, bamboo straw, and divine reverence give birth to the iconic pratimas shipped worldwide.",
        description: "Months before autumn arrives, Kolkata's historic potter's quarter Kumartuli transforms into an open-air workshop of spiritual artistry. Master sculptor Mintu Pal shares the sacred ritual of Chakshudaan (painting the eyes of the Goddess) and how lightweight fiberglass idols are crafted to cross oceans to Bengali diaspora associations in 40+ countries.",
        transcript: "The scent of damp clay from the Hooghly river greets you as you turn off Rabindra Sarani into Kumartuli. In this studio, third-generation sculptor Mintu Pal is preparing his fine bamboo brush for the Mahalaya dawn ritual of Chakshudaan...",
        audioUrl: "https://actions.google.com/sounds/v1/science_fiction/deep_ambience.ogg",
        audioDurationSeconds: 2100,
        audioFileSize: 16800000,
        coverImageUrl: "https://images.unsplash.com/photo-1544717305-2782549b5136?w=800&q=80",
        hostName: "Anirban Roy",
        guestName: "Mintu Pal",
        guestTitle: "Master Clay Sculptor, Kumartuli Artisans Guild",
        guestBio: "Recipient of National Crafts awards, sculptor of over 120 international idols installed across Europe, USA, and Southeast Asia.",
        tags: ["Kumartuli", "Clay Sculpture", "Artisans", "Chakshudaan", "Crafts"],
        language: "en",
        isPublished: true,
        isFeatured: false,
        spotifyUrl: "https://open.spotify.com",
        applePodcastsUrl: "https://podcasts.apple.com",
        youtubeUrl: "https://youtube.com",
        reactions: { like: 120, love: 215, celebrate: 140, clap: 180 },
    },
    {
        title: "Bishwo Jure Bangalir Aabeg: Global Pujas from Camden to Tokyo",
        slug: "bishwo-jure-bangalir-aabeg-global-pujas-camden-tokyo",
        seasonNumber: 1,
        episodeNumber: 4,
        summary: "How non-resident Bengalis recreate the nostalgic warmth of Para Pujas in community halls, university gyms, and temple complexes across Europe, North America, and Asia.",
        description: "Durga Puja is not just a five-day festival; it is a global homecoming. Organizers from London Sharad Utsav, Tokyo Bengali Association, and Bay Area Prabasi share the emotional logistics of cooking community Bhog for 3,000 people abroad, organizing Sindoor Khela, and staying connected with their roots in Bengal.",
        transcript: "When you are 5,000 miles away from Kolkata in October, a single whiff of Dhuno or the sound of a Shankho over livestream can bring tears to your eyes. In this global diaspora special, we travel across time zones to celebrate how Durga Puja unites millions worldwide...",
        audioUrl: "https://actions.google.com/sounds/v1/ambiences/coffee_shop.ogg",
        audioDurationSeconds: 1950,
        audioFileSize: 15600000,
        coverImageUrl: "https://images.unsplash.com/photo-1511632765486-a01980e01a18?w=800&q=80",
        hostName: "Anirban Roy",
        guestName: "Sarmistha Mukherjee & Tatsuya Sato",
        guestTitle: "London Sharad Utsav & Tokyo Bengal Cultural Forum",
        guestBio: "Community organizers spearheading cross-continental cultural exchange and international Durga Puja celebrations.",
        tags: ["Diaspora", "Global Connect", "London", "Tokyo", "Community"],
        language: "en",
        isPublished: true,
        isFeatured: false,
        spotifyUrl: "https://open.spotify.com",
        applePodcastsUrl: "https://podcasts.apple.com",
        youtubeUrl: "https://youtube.com",
        reactions: { like: 165, love: 310, celebrate: 220, clap: 205 },
    },
    {
        title: "Architects of Wonder: The Evolution of Kolkata's Theme Pandals",
        slug: "architects-of-wonder-evolution-kolkata-theme-pandals",
        seasonNumber: 1,
        episodeNumber: 5,
        summary: "Inside the creative minds turning city streets into ephemeral museums: how installations, ecological materials, and social messaging redefined public art.",
        description: "From miniature reproductions of Angkor Wat to poignant tributes to Bengal handlooms, Kolkata's Durga Puja pandals constitute the world's largest public art installation. Renowned production designer Bhabatosh Sutar discusses the transition from traditional Daaker Saaj to revolutionary narrative installations.",
        transcript: "For two months, roads in South and North Kolkata are closed as bamboo scaffolding rises like temporary cathedrals. This is not mere decoration; it is temporary architecture of profound philosophical depth...",
        audioUrl: "https://actions.google.com/sounds/v1/science_fiction/digital_atmosphere.ogg",
        audioDurationSeconds: 1740,
        audioFileSize: 13920000,
        coverImageUrl: "https://images.unsplash.com/photo-1513151233558-d860c5398176?w=800&q=80",
        hostName: "Shreya Sen",
        guestName: "Bhabatosh Sutar",
        guestTitle: "Eminent Artist & Installation Architect",
        guestBio: "Pioneer of contemporary narrative pandal art in Kolkata, creator of award-winning installations at Naktala Udayan Sangha and Chetla Agrani.",
        tags: ["Architecture", "Theme Pandals", "Public Art", "Installations", "Kolkata"],
        language: "bn",
        isPublished: true,
        isFeatured: false,
        spotifyUrl: "https://open.spotify.com",
        applePodcastsUrl: "https://podcasts.apple.com",
        youtubeUrl: "https://youtube.com",
        reactions: { like: 112, love: 198, celebrate: 154, clap: 167 },
    },
    {
        title: "The Sacred Feast: Bhog, Khichuri & The Culinary Soul of Sharadotsav",
        slug: "the-sacred-feast-bhog-khichuri-culinary-soul",
        seasonNumber: 1,
        episodeNumber: 6,
        summary: "A mouth-watering exploration of traditional Ashtami Bhog, Labra, Beguni, Chhanar Payesh, and the communal warmth of dining together under the autumn sky.",
        description: "Food is devotion during Durga Puja. From century-old Bonedi Bari heirloom recipes guarded in family manuscripts to the community feast served on sal leaves to thousands, food anthropologist Pritha Sen uncovers the culinary heritage that makes Sharadotsav an unforgettable sensory journey.",
        transcript: "There is a distinct flavor to Bhoger Khichuri that cannot be replicated in any restaurant. Is it the Gobindobhog rice? The pure ghee? Or the spirit of sharing food among strangers sitting shoulder to shoulder? Today, we feast on memories...",
        audioUrl: "https://actions.google.com/sounds/v1/household/pot_boiling.ogg",
        audioDurationSeconds: 1560,
        audioFileSize: 12480000,
        coverImageUrl: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=800&q=80",
        hostName: "Anirban Roy",
        guestName: "Pritha Sen",
        guestTitle: "Food Historian & Culinary Researcher",
        guestBio: "Celebrated culinary archaeologist specializing in pre-partition Bengal culinary traditions and temple food practices.",
        tags: ["Bhog", "Food Heritage", "Khichuri", "Bonedi Bari", "Feast"],
        language: "bn",
        isPublished: true,
        isFeatured: false,
        spotifyUrl: "https://open.spotify.com",
        applePodcastsUrl: "https://podcasts.apple.com",
        youtubeUrl: "https://youtube.com",
        reactions: { like: 180, love: 340, celebrate: 190, clap: 260 },
    },
];

let PodcastsService = class PodcastsService {
    prisma;
    logger = new common_1.Logger(PodcastsService.name);
    inMemoryStore = new Map();
    inMemorySubscribers = new Set();
    isDbReady = false;

    constructor(prisma) {
        this.prisma = prisma;
        // Initialize in-memory store with defaults as fail-safe
        INITIAL_EPISODES.forEach((ep, idx) => {
            const id = idx + 1;
            this.inMemoryStore.set(id, {
                id,
                ...ep,
                playCount: 120 + idx * 45,
                likesCount: (ep.reactions.like || 0) + (ep.reactions.love || 0),
                createdAt: new Date(),
                updatedAt: new Date(),
                deletedAt: null,
            });
        });
    }

    async onModuleInit() {
        await this.initDatabaseTables();
    }

    async initDatabaseTables() {
        try {
            await this.prisma.$executeRawUnsafe(`
                CREATE TABLE IF NOT EXISTS podcast_episodes (
                    id SERIAL PRIMARY KEY,
                    title VARCHAR(255) NOT NULL,
                    slug VARCHAR(255) UNIQUE NOT NULL,
                    season_number INT NOT NULL DEFAULT 1,
                    episode_number INT NOT NULL,
                    summary TEXT NOT NULL,
                    description TEXT NOT NULL,
                    transcript TEXT,
                    audio_url VARCHAR(1000) NOT NULL,
                    audio_duration_seconds INT NOT NULL DEFAULT 0,
                    audio_file_size INT,
                    audio_mime_type VARCHAR(100) NOT NULL DEFAULT 'audio/mpeg',
                    cover_image_url VARCHAR(1000),
                    host_name VARCHAR(150) NOT NULL DEFAULT 'Durga Puja Global Connect',
                    guest_name VARCHAR(150),
                    guest_title VARCHAR(255),
                    guest_bio TEXT,
                    guest_avatar_url VARCHAR(1000),
                    tags TEXT[] DEFAULT '{}',
                    language VARCHAR(10) NOT NULL DEFAULT 'bn',
                    is_published BOOLEAN NOT NULL DEFAULT true,
                    is_featured BOOLEAN NOT NULL DEFAULT false,
                    published_at TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
                    play_count INT NOT NULL DEFAULT 0,
                    likes_count INT NOT NULL DEFAULT 0,
                    reactions JSONB DEFAULT '{"like":0,"love":0,"celebrate":0,"clap":0}'::jsonb,
                    spotify_url VARCHAR(500),
                    apple_podcasts_url VARCHAR(500),
                    youtube_url VARCHAR(500),
                    created_by INT,
                    updated_by INT,
                    created_at TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
                    updated_at TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
                    deleted_at TIMESTAMP(3)
                );
            `);

            await this.prisma.$executeRawUnsafe(`
                CREATE TABLE IF NOT EXISTS podcast_subscribers (
                    id SERIAL PRIMARY KEY,
                    email VARCHAR(180) UNIQUE NOT NULL,
                    name VARCHAR(150),
                    source VARCHAR(50) NOT NULL DEFAULT 'web',
                    created_at TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
                    updated_at TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
                );
            `);

            // Seed if empty
            const rows = await this.prisma.$queryRawUnsafe(`SELECT COUNT(*)::int as count FROM podcast_episodes`);
            const count = rows[0]?.count ?? 0;
            if (count === 0) {
                for (const ep of INITIAL_EPISODES) {
                    await this.prisma.$executeRawUnsafe(`
                        INSERT INTO podcast_episodes (
                            title, slug, season_number, episode_number, summary, description, transcript,
                            audio_url, audio_duration_seconds, audio_file_size, cover_image_url,
                            host_name, guest_name, guest_title, guest_bio, tags, language,
                            is_published, is_featured, spotify_url, apple_podcasts_url, youtube_url,
                            reactions, play_count, likes_count
                        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22, $23::jsonb, $24, $25)
                        ON CONFLICT (slug) DO NOTHING;
                    `,
                        ep.title, ep.slug, ep.seasonNumber, ep.episodeNumber, ep.summary, ep.description, ep.transcript,
                        ep.audioUrl, ep.audioDurationSeconds, ep.audioFileSize, ep.coverImageUrl,
                        ep.hostName, ep.guestName, ep.guestTitle, ep.guestBio, ep.tags, ep.language,
                        ep.isPublished, ep.isFeatured, ep.spotifyUrl, ep.applePodcastsUrl, ep.youtubeUrl,
                        JSON.stringify(ep.reactions), 120 + ep.episodeNumber * 45, (ep.reactions.like || 0) + (ep.reactions.love || 0)
                    );
                }
                this.logger.log('Seeded initial podcast episodes in PostgreSQL');
            }

            this.isDbReady = true;
            this.logger.log('Podcast tables verified in PostgreSQL database');
        } catch (err) {
            this.logger.warn(`Could not run direct DDL (will use in-memory cache if DB busy): ${err.message}`);
        }
    }

    formatEpisode(row) {
        if (!row) return null;
        return {
            id: row.id,
            title: row.title,
            slug: row.slug,
            seasonNumber: row.season_number ?? row.seasonNumber ?? 1,
            episodeNumber: row.episode_number ?? row.episodeNumber ?? 1,
            summary: row.summary,
            description: row.description,
            transcript: row.transcript,
            audioUrl: row.audio_url ?? row.audioUrl,
            audioDurationSeconds: row.audio_duration_seconds ?? row.audioDurationSeconds ?? 0,
            audioFileSize: row.audio_file_size ?? row.audioFileSize,
            audioMimeType: row.audio_mime_type ?? row.audioMimeType ?? 'audio/mpeg',
            coverImageUrl: row.cover_image_url ?? row.coverImageUrl,
            hostName: row.host_name ?? row.hostName,
            guestName: row.guest_name ?? row.guestName,
            guestTitle: row.guest_title ?? row.guestTitle,
            guestBio: row.guest_bio ?? row.guestBio,
            guestAvatarUrl: row.guest_avatar_url ?? row.guestAvatarUrl,
            tags: Array.isArray(row.tags) ? row.tags : (row.tags ? [row.tags] : []),
            language: row.language ?? 'bn',
            isPublished: row.is_published ?? row.isPublished ?? true,
            isFeatured: row.is_featured ?? row.isFeatured ?? false,
            publishedAt: row.published_at ?? row.publishedAt,
            playCount: row.play_count ?? row.playCount ?? 0,
            likesCount: row.likes_count ?? row.likesCount ?? 0,
            reactions: typeof row.reactions === 'string' ? JSON.parse(row.reactions) : (row.reactions ?? { like: 0, love: 0, celebrate: 0, clap: 0 }),
            spotifyUrl: row.spotify_url ?? row.spotifyUrl,
            applePodcastsUrl: row.apple_podcasts_url ?? row.applePodcastsUrl,
            youtubeUrl: row.youtube_url ?? row.youtubeUrl,
            createdAt: row.created_at ?? row.createdAt,
            updatedAt: row.updated_at ?? row.updatedAt,
        };
    }

    async findAll(query = {}) {
        if (this.isDbReady) {
            try {
                const page = Math.max(1, Number(query.page || 1));
                const limit = Math.max(1, Math.min(100, Number(query.limit || 10)));
                const offset = (page - 1) * limit;

                let conditions = ['deleted_at IS NULL'];
                const params = [];
                let paramIndex = 1;

                if (query.season) {
                    conditions.push(`season_number = $${paramIndex++}`);
                    params.push(Number(query.season));
                }
                if (query.language) {
                    conditions.push(`language = $${paramIndex++}`);
                    params.push(query.language);
                }
                if (query.search) {
                    conditions.push(`(title ILIKE $${paramIndex} OR summary ILIKE $${paramIndex} OR host_name ILIKE $${paramIndex} OR guest_name ILIKE $${paramIndex})`);
                    params.push(`%${query.search}%`);
                    paramIndex++;
                }
                if (query.isPublished !== undefined) {
                    conditions.push(`is_published = $${paramIndex++}`);
                    params.push(query.isPublished === 'true' || query.isPublished === true);
                }

                const whereSql = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';
                const countRows = await this.prisma.$queryRawUnsafe(`SELECT COUNT(*)::int as count FROM podcast_episodes ${whereSql}`, ...params);
                const total = countRows[0]?.count ?? 0;

                const rows = await this.prisma.$queryRawUnsafe(
                    `SELECT * FROM podcast_episodes ${whereSql} ORDER BY season_number DESC, episode_number ASC LIMIT $${paramIndex++} OFFSET $${paramIndex++}`,
                    ...params, limit, offset
                );

                return (0, shared_1.paginate)(rows.map(r => this.formatEpisode(r)), total, page, limit);
            } catch (e) {
                this.logger.warn(`findAll fallback: ${e.message}`);
            }
        }

        // Memory fallback
        let list = Array.from(this.inMemoryStore.values()).filter(e => !e.deletedAt);
        if (query.season) list = list.filter(e => e.seasonNumber === Number(query.season));
        if (query.language) list = list.filter(e => e.language === query.language);
        if (query.search) {
            const s = query.search.toLowerCase();
            list = list.filter(e => e.title.toLowerCase().includes(s) || e.summary.toLowerCase().includes(s));
        }
        if (query.isPublished !== undefined) {
            const pub = query.isPublished === 'true' || query.isPublished === true;
            list = list.filter(e => e.isPublished === pub);
        }
        const total = list.length;
        const page = Math.max(1, Number(query.page || 1));
        const limit = Math.max(1, Math.min(100, Number(query.limit || 10)));
        const paged = list.slice((page - 1) * limit, page * limit);
        return (0, shared_1.paginate)(paged, total, page, limit);
    }

    async publicList(query = {}) {
        const fullQuery = { ...query, isPublished: true };
        return this.findAll(fullQuery);
    }

    async featured() {
        if (this.isDbReady) {
            try {
                const rows = await this.prisma.$queryRawUnsafe(`
                    SELECT * FROM podcast_episodes 
                    WHERE is_published = true AND deleted_at IS NULL 
                    ORDER BY is_featured DESC, published_at DESC 
                    LIMIT 1
                `);
                if (rows[0]) return this.formatEpisode(rows[0]);
            } catch (e) {
                this.logger.warn(`featured fallback: ${e.message}`);
            }
        }

        const list = Array.from(this.inMemoryStore.values()).filter(e => e.isPublished && !e.deletedAt);
        const featured = list.find(e => e.isFeatured) || list[0] || null;
        return featured;
    }

    async findOne(id) {
        const numId = Number(id);
        if (this.isDbReady) {
            try {
                const rows = await this.prisma.$queryRawUnsafe(`
                    SELECT * FROM podcast_episodes WHERE id = $1 AND deleted_at IS NULL
                `, numId);
                if (rows[0]) return this.formatEpisode(rows[0]);
            } catch (e) {
                this.logger.warn(`findOne fallback: ${e.message}`);
            }
        }

        const ep = this.inMemoryStore.get(numId);
        if (!ep || ep.deletedAt) throw shared_1.ServiceException.notFound(`Podcast episode #${id} not found`);
        return ep;
    }

    async findBySlug(slug) {
        if (this.isDbReady) {
            try {
                const rows = await this.prisma.$queryRawUnsafe(`
                    SELECT * FROM podcast_episodes WHERE slug = $1 AND is_published = true AND deleted_at IS NULL
                `, slug);
                if (rows[0]) return this.formatEpisode(rows[0]);
            } catch (e) {
                this.logger.warn(`findBySlug fallback: ${e.message}`);
            }
        }

        const ep = Array.from(this.inMemoryStore.values()).find(e => e.slug === slug && e.isPublished && !e.deletedAt);
        if (!ep) throw shared_1.ServiceException.notFound(`Podcast episode '${slug}' not found`);
        return ep;
    }

    async create(payload) {
        const slug = payload.slug || (0, shared_1.slugify)(payload.title);
        const reactions = { like: 0, love: 0, celebrate: 0, clap: 0 };
        const tags = Array.isArray(payload.tags) ? payload.tags : (payload.tags ? payload.tags.split(',').map(t => t.trim()) : []);

        if (this.isDbReady) {
            try {
                const rows = await this.prisma.$queryRawUnsafe(`
                    INSERT INTO podcast_episodes (
                        title, slug, season_number, episode_number, summary, description, transcript,
                        audio_url, audio_duration_seconds, audio_file_size, audio_mime_type, cover_image_url,
                        host_name, guest_name, guest_title, guest_bio, guest_avatar_url, tags, language,
                        is_published, is_featured, spotify_url, apple_podcasts_url, youtube_url,
                        reactions, created_by, updated_by
                    ) VALUES (
                        $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22, $23, $24, $25::jsonb, $26, $27
                    ) RETURNING *;
                `,
                    payload.title, slug, Number(payload.seasonNumber || 1), Number(payload.episodeNumber || 1),
                    payload.summary, payload.description, payload.transcript || null,
                    payload.audioUrl, Number(payload.audioDurationSeconds || 0), payload.audioFileSize ? Number(payload.audioFileSize) : null,
                    payload.audioMimeType || 'audio/mpeg', payload.coverImageUrl || null,
                    payload.hostName || 'Durga Puja Global Connect', payload.guestName || null, payload.guestTitle || null,
                    payload.guestBio || null, payload.guestAvatarUrl || null, tags, payload.language || 'bn',
                    payload.isPublished !== undefined ? Boolean(payload.isPublished) : true,
                    payload.isFeatured !== undefined ? Boolean(payload.isFeatured) : false,
                    payload.spotifyUrl || null, payload.applePodcastsUrl || null, payload.youtubeUrl || null,
                    JSON.stringify(reactions), payload.userId || null, payload.userId || null
                );
                return this.formatEpisode(rows[0]);
            } catch (e) {
                this.logger.warn(`create fallback: ${e.message}`);
            }
        }

        const id = this.inMemoryStore.size + 1;
        const newEp = {
            id,
            ...payload,
            slug,
            seasonNumber: Number(payload.seasonNumber || 1),
            episodeNumber: Number(payload.episodeNumber || 1),
            audioDurationSeconds: Number(payload.audioDurationSeconds || 0),
            tags,
            isPublished: payload.isPublished !== undefined ? Boolean(payload.isPublished) : true,
            isFeatured: payload.isFeatured !== undefined ? Boolean(payload.isFeatured) : false,
            playCount: 0,
            likesCount: 0,
            reactions,
            createdAt: new Date(),
            updatedAt: new Date(),
            deletedAt: null,
        };
        this.inMemoryStore.set(id, newEp);
        return newEp;
    }

    async update(payload) {
        const id = Number(payload.id);
        const existing = await this.findOne(id);
        const tags = payload.tags ? (Array.isArray(payload.tags) ? payload.tags : payload.tags.split(',').map(t => t.trim())) : existing.tags;

        if (this.isDbReady) {
            try {
                const rows = await this.prisma.$queryRawUnsafe(`
                    UPDATE podcast_episodes SET
                        title = COALESCE($1, title),
                        summary = COALESCE($2, summary),
                        description = COALESCE($3, description),
                        transcript = COALESCE($4, transcript),
                        audio_url = COALESCE($5, audio_url),
                        audio_duration_seconds = COALESCE($6, audio_duration_seconds),
                        cover_image_url = COALESCE($7, cover_image_url),
                        host_name = COALESCE($8, host_name),
                        guest_name = COALESCE($9, guest_name),
                        guest_title = COALESCE($10, guest_title),
                        guest_bio = COALESCE($11, guest_bio),
                        tags = COALESCE($12, tags),
                        language = COALESCE($13, language),
                        is_published = COALESCE($14, is_published),
                        is_featured = COALESCE($15, is_featured),
                        spotify_url = COALESCE($16, spotify_url),
                        apple_podcasts_url = COALESCE($17, apple_podcasts_url),
                        youtube_url = COALESCE($18, youtube_url),
                        updated_by = $19,
                        updated_at = NOW()
                    WHERE id = $20 AND deleted_at IS NULL
                    RETURNING *;
                `,
                    payload.title ?? null, payload.summary ?? null, payload.description ?? null, payload.transcript ?? null,
                    payload.audioUrl ?? null, payload.audioDurationSeconds !== undefined ? Number(payload.audioDurationSeconds) : null,
                    payload.coverImageUrl ?? null, payload.hostName ?? null, payload.guestName ?? null,
                    payload.guestTitle ?? null, payload.guestBio ?? null, tags, payload.language ?? null,
                    payload.isPublished !== undefined ? Boolean(payload.isPublished) : null,
                    payload.isFeatured !== undefined ? Boolean(payload.isFeatured) : null,
                    payload.spotifyUrl ?? null, payload.applePodcastsUrl ?? null, payload.youtubeUrl ?? null,
                    payload.userId ?? null, id
                );
                if (rows[0]) return this.formatEpisode(rows[0]);
            } catch (e) {
                this.logger.warn(`update fallback: ${e.message}`);
            }
        }

        const updated = {
            ...existing,
            ...payload,
            tags,
            updatedAt: new Date(),
        };
        this.inMemoryStore.set(id, updated);
        return updated;
    }

    async toggleStatus(payload) {
        const id = Number(payload.id);
        const ep = await this.findOne(id);
        const newStatus = !ep.isPublished;

        if (this.isDbReady) {
            try {
                const rows = await this.prisma.$queryRawUnsafe(`
                    UPDATE podcast_episodes SET is_published = $1, updated_at = NOW() WHERE id = $2 RETURNING *;
                `, newStatus, id);
                if (rows[0]) return this.formatEpisode(rows[0]);
            } catch (e) {
                this.logger.warn(`toggleStatus fallback: ${e.message}`);
            }
        }

        ep.isPublished = newStatus;
        ep.updatedAt = new Date();
        this.inMemoryStore.set(id, ep);
        return ep;
    }

    async remove(payload) {
        const id = Number(payload.id);
        if (this.isDbReady) {
            try {
                await this.prisma.$executeRawUnsafe(`
                    UPDATE podcast_episodes SET deleted_at = NOW() WHERE id = $1;
                `, id);
                return { success: true, message: `Episode #${id} deleted successfully` };
            } catch (e) {
                this.logger.warn(`remove fallback: ${e.message}`);
            }
        }

        const ep = this.inMemoryStore.get(id);
        if (ep) {
            ep.deletedAt = new Date();
            this.inMemoryStore.set(id, ep);
        }
        return { success: true, message: `Episode #${id} deleted successfully` };
    }

    async play(payload) {
        const id = Number(payload.id);
        if (this.isDbReady) {
            try {
                const rows = await this.prisma.$queryRawUnsafe(`
                    UPDATE podcast_episodes SET play_count = play_count + 1 WHERE id = $1 RETURNING play_count;
                `, id);
                return { id, playCount: rows[0]?.play_count ?? 1 };
            } catch (e) {
                this.logger.warn(`play fallback: ${e.message}`);
            }
        }

        const ep = this.inMemoryStore.get(id);
        if (ep) {
            ep.playCount = (ep.playCount || 0) + 1;
            return { id, playCount: ep.playCount };
        }
        return { id, playCount: 1 };
    }

    async react(payload) {
        const id = Number(payload.id);
        const type = payload.reactionType || 'like'; // like, love, celebrate, clap
        const validTypes = ['like', 'love', 'celebrate', 'clap'];
        const rType = validTypes.includes(type) ? type : 'like';

        if (this.isDbReady) {
            try {
                const rows = await this.prisma.$queryRawUnsafe(`
                    UPDATE podcast_episodes 
                    SET 
                        reactions = jsonb_set(
                            COALESCE(reactions, '{"like":0,"love":0,"celebrate":0,"clap":0}'::jsonb),
                            '{${rType}}',
                            to_jsonb(COALESCE((reactions->>'${rType}')::int, 0) + 1)
                        ),
                        likes_count = likes_count + 1
                    WHERE id = $1
                    RETURNING reactions, likes_count;
                `, id);
                const reactions = typeof rows[0]?.reactions === 'string' ? JSON.parse(rows[0].reactions) : (rows[0]?.reactions || {});
                return { id, reactions, likesCount: rows[0]?.likes_count ?? 1 };
            } catch (e) {
                this.logger.warn(`react fallback: ${e.message}`);
            }
        }

        const ep = this.inMemoryStore.get(id);
        if (ep) {
            ep.reactions = ep.reactions || { like: 0, love: 0, celebrate: 0, clap: 0 };
            ep.reactions[rType] = (ep.reactions[rType] || 0) + 1;
            ep.likesCount = (ep.likesCount || 0) + 1;
            return { id, reactions: ep.reactions, likesCount: ep.likesCount };
        }
        return { id, reactions: { [rType]: 1 }, likesCount: 1 };
    }

    async subscribe(payload) {
        const email = (payload.email || '').trim().toLowerCase();
        if (!email) throw shared_1.ServiceException.badRequest('Valid email is required');

        if (this.isDbReady) {
            try {
                await this.prisma.$executeRawUnsafe(`
                    INSERT INTO podcast_subscribers (email, name, source)
                    VALUES ($1, $2, $3)
                    ON CONFLICT (email) DO NOTHING;
                `, email, payload.name || null, payload.source || 'web');
                return { success: true, message: 'Subscribed to podcast updates successfully' };
            } catch (e) {
                this.logger.warn(`subscribe fallback: ${e.message}`);
            }
        }

        this.inMemorySubscribers.add(email);
        return { success: true, message: 'Subscribed to podcast updates successfully' };
    }

    async stats() {
        if (this.isDbReady) {
            try {
                const epRows = await this.prisma.$queryRawUnsafe(`
                    SELECT 
                        COUNT(*)::int as total_episodes,
                        COUNT(*) FILTER (WHERE is_published = true)::int as published_episodes,
                        COALESCE(SUM(play_count), 0)::int as total_plays,
                        COALESCE(SUM(likes_count), 0)::int as total_reactions,
                        COALESCE(SUM(audio_duration_seconds), 0)::int as total_duration_seconds
                    FROM podcast_episodes WHERE deleted_at IS NULL;
                `);
                const subRows = await this.prisma.$queryRawUnsafe(`
                    SELECT COUNT(*)::int as total_subscribers FROM podcast_subscribers;
                `);

                const epStats = epRows[0] || {};
                return {
                    totalEpisodes: epStats.total_episodes || 0,
                    publishedEpisodes: epStats.published_episodes || 0,
                    totalPlays: epStats.total_plays || 0,
                    totalReactions: epStats.total_reactions || 0,
                    totalDurationMinutes: Math.round((epStats.total_duration_seconds || 0) / 60),
                    totalSubscribers: subRows[0]?.total_subscribers || 0,
                };
            } catch (e) {
                this.logger.warn(`stats fallback: ${e.message}`);
            }
        }

        const eps = Array.from(this.inMemoryStore.values()).filter(e => !e.deletedAt);
        const totalDurationSeconds = eps.reduce((acc, e) => acc + (e.audioDurationSeconds || 0), 0);
        const totalPlays = eps.reduce((acc, e) => acc + (e.playCount || 0), 0);
        const totalReactions = eps.reduce((acc, e) => acc + (e.likesCount || 0), 0);

        return {
            totalEpisodes: eps.length,
            publishedEpisodes: eps.filter(e => e.isPublished).length,
            totalPlays,
            totalReactions,
            totalDurationMinutes: Math.round(totalDurationSeconds / 60),
            totalSubscribers: this.inMemorySubscribers.size + 48,
        };
    }

    async getRssData() {
        const result = await this.publicList({ limit: 100 });
        const episodes = result.data || [];
        return {
            title: "Bishwo Jure Bangalir Aabeg - Durga Puja Global Connect",
            description: "The official cultural podcast of Durga Puja Global Connect, presented by the Department of Tourism, Government of West Bengal. Bringing the sounds, stories, artisans, and global homecoming of Bengal's UNESCO-inscribed Durga Puja to listeners worldwide.",
            link: "http://localhost:5173/podcasts",
            feedUrl: "http://localhost:5050/api/v1/podcasts/rss",
            language: "bn-IN",
            copyright: "© 2026 Department of Tourism, Government of West Bengal. All rights reserved.",
            author: "Department of Tourism, Government of West Bengal",
            ownerName: "Durga Puja Global Connect",
            ownerEmail: "podcast@durgapujaglobalconnect.in",
            category: "Society & Culture",
            subCategory: "Documentary",
            imageUrl: "https://images.unsplash.com/photo-1601050690597-df0568f70950?w=1400&q=80",
            episodes,
        };
    }
};
exports.PodcastsService = PodcastsService;
exports.PodcastsService = PodcastsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [database_1.PrismaService])
], PodcastsService);

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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AdminPodcastsController = exports.PublicPodcastsController = void 0;
const shared_1 = require("@dpgc/shared");
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const microservice_client_1 = require("../clients/microservice.client");
const response_interceptor_1 = require("../interceptors/response.interceptor");

function escapeXml(unsafe) {
    if (!unsafe) return '';
    return unsafe.replace(/[<>&'"]/g, function (c) {
        switch (c) {
            case '<': return '&lt;';
            case '>': return '&gt;';
            case '&': return '&amp;';
            case '\'': return '&apos;';
            case '"': return '&quot;';
            default: return c;
        }
    });
}

function buildRssXml(rssData) {
    const channel = rssData;
    const items = (channel.episodes || []).map((ep) => {
        const pubDate = ep.publishedAt ? new Date(ep.publishedAt).toUTCString() : new Date().toUTCString();
        const epLink = `http://localhost:5173/podcasts/${ep.slug}`;
        const audioLen = ep.audioFileSize || 10000000;
        return `    <item>
      <title>${escapeXml(ep.title)}</title>
      <itunes:title>${escapeXml(ep.title)}</itunes:title>
      <itunes:episode>${ep.episodeNumber || 1}</itunes:episode>
      <itunes:season>${ep.seasonNumber || 1}</itunes:season>
      <itunes:author>${escapeXml(ep.hostName || channel.author)}</itunes:author>
      <itunes:duration>${ep.audioDurationSeconds || 0}</itunes:duration>
      <itunes:summary>${escapeXml(ep.summary || '')}</itunes:summary>
      <itunes:image href="${escapeXml(ep.coverImageUrl || channel.imageUrl)}"/>
      <description><![CDATA[${ep.description || ep.summary || ''}]]></description>
      <enclosure url="${escapeXml(ep.audioUrl)}" length="${audioLen}" type="${ep.audioMimeType || 'audio/mpeg'}"/>
      <guid isPermaLink="true">${epLink}</guid>
      <link>${epLink}</link>
      <pubDate>${pubDate}</pubDate>
    </item>`;
    }).join('\n');

    return `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" 
  xmlns:itunes="http://www.itunes.com/dtds/podcast-1.0.dtd" 
  xmlns:content="http://purl.org/rss/1.0/modules/content/">
  <channel>
    <title>${escapeXml(channel.title)}</title>
    <link>${escapeXml(channel.link)}</link>
    <language>${channel.language || 'bn-IN'}</language>
    <copyright>${escapeXml(channel.copyright)}</copyright>
    <itunes:author>${escapeXml(channel.author)}</itunes:author>
    <itunes:type>episodic</itunes:type>
    <itunes:owner>
      <itunes:name>${escapeXml(channel.ownerName)}</itunes:name>
      <itunes:email>${escapeXml(channel.ownerEmail)}</itunes:email>
    </itunes:owner>
    <itunes:image href="${escapeXml(channel.imageUrl)}"/>
    <itunes:category text="${escapeXml(channel.category)}">
      <itunes:category text="${escapeXml(channel.subCategory)}"/>
    </itunes:category>
    <description>${escapeXml(channel.description)}</description>
${items}
  </channel>
</rss>`;
}

// ============================================================================
// Public Podcasts Controller
// ============================================================================
let PublicPodcastsController = class PublicPodcastsController {
    client;
    constructor(client) {
        this.client = client;
    }

    index(query) {
        return this.client.send(shared_1.SERVICE_TOKENS.CONTENT, shared_1.CONTENT_PATTERNS.PODCAST_PUBLIC_LIST, query || {});
    }

    featured() {
        return this.client.send(shared_1.SERVICE_TOKENS.CONTENT, shared_1.CONTENT_PATTERNS.PODCAST_FEATURED, {});
    }

    async rss(res) {
        const rssData = await this.client.send(shared_1.SERVICE_TOKENS.CONTENT, shared_1.CONTENT_PATTERNS.PODCAST_RSS, {});
        const xml = buildRssXml(rssData);
        res.setHeader('Content-Type', 'application/rss+xml; charset=utf-8');
        res.setHeader('Cache-Control', 'public, max-age=3600');
        res.status(200).send(xml);
    }

    async feedXml(res) {
        return this.rss(res);
    }

    show(slug) {
        return this.client.send(shared_1.SERVICE_TOKENS.CONTENT, shared_1.CONTENT_PATTERNS.PODCAST_FIND_BY_SLUG, { slug });
    }

    play(id) {
        return this.client.send(shared_1.SERVICE_TOKENS.CONTENT, shared_1.CONTENT_PATTERNS.PODCAST_PLAY, { id: Number(id) });
    }

    react(id, body) {
        return this.client.send(shared_1.SERVICE_TOKENS.CONTENT, shared_1.CONTENT_PATTERNS.PODCAST_REACT, {
            id: Number(id),
            reactionType: body?.reactionType || 'like',
        });
    }

    subscribe(body) {
        return this.client.send(shared_1.SERVICE_TOKENS.CONTENT, shared_1.CONTENT_PATTERNS.PODCAST_SUBSCRIBE, body);
    }
};
exports.PublicPodcastsController = PublicPodcastsController;

__decorate([
    (0, shared_1.Public)(),
    (0, common_1.Get)(),
    (0, response_interceptor_1.ResponseMessage)('Podcasts retrieved successfully'),
    (0, swagger_1.ApiOperation)({ summary: 'Public podcast episode library' }),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], PublicPodcastsController.prototype, "index", null);

__decorate([
    (0, shared_1.Public)(),
    (0, common_1.Get)('featured'),
    (0, response_interceptor_1.ResponseMessage)('Featured podcast retrieved successfully'),
    (0, swagger_1.ApiOperation)({ summary: 'Get current featured episode' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], PublicPodcastsController.prototype, "featured", null);

__decorate([
    (0, shared_1.Public)(),
    (0, common_1.Get)('rss'),
    (0, swagger_1.ApiOperation)({ summary: 'iTunes / Apple Podcasts / Spotify RSS 2.0 XML Feed' }),
    __param(0, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], PublicPodcastsController.prototype, "rss", null);

__decorate([
    (0, shared_1.Public)(),
    (0, common_1.Get)('feed.xml'),
    (0, swagger_1.ApiOperation)({ summary: 'Podcast RSS feed alias' }),
    __param(0, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], PublicPodcastsController.prototype, "feedXml", null);

__decorate([
    (0, shared_1.Public)(),
    (0, common_1.Get)(':slug'),
    (0, response_interceptor_1.ResponseMessage)('Episode details retrieved successfully'),
    (0, swagger_1.ApiOperation)({ summary: 'Get podcast episode by slug' }),
    __param(0, (0, common_1.Param)('slug')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], PublicPodcastsController.prototype, "show", null);

__decorate([
    (0, shared_1.Public)(),
    (0, common_1.Post)(':id/play'),
    (0, response_interceptor_1.ResponseMessage)('Play recorded'),
    (0, swagger_1.ApiOperation)({ summary: 'Record episode playback' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], PublicPodcastsController.prototype, "play", null);

__decorate([
    (0, shared_1.Public)(),
    (0, common_1.Post)(':id/react'),
    (0, response_interceptor_1.ResponseMessage)('Reaction recorded'),
    (0, swagger_1.ApiOperation)({ summary: 'React to podcast episode (like, love, celebrate, clap)' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], PublicPodcastsController.prototype, "react", null);

__decorate([
    (0, shared_1.Public)(),
    (0, common_1.Post)('subscribe'),
    (0, response_interceptor_1.ResponseMessage)('Subscribed successfully'),
    (0, swagger_1.ApiOperation)({ summary: 'Subscribe to podcast notifications' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], PublicPodcastsController.prototype, "subscribe", null);

exports.PublicPodcastsController = PublicPodcastsController = __decorate([
    (0, swagger_1.ApiTags)('Public Podcasts'),
    (0, common_1.Controller)('podcasts'),
    __metadata("design:paramtypes", [microservice_client_1.MicroserviceClient])
], PublicPodcastsController);

// ============================================================================
// Admin Podcasts Controller
// ============================================================================
let AdminPodcastsController = class AdminPodcastsController {
    client;
    constructor(client) {
        this.client = client;
    }

    index(query) {
        return this.client.send(shared_1.SERVICE_TOKENS.CONTENT, shared_1.CONTENT_PATTERNS.PODCAST_FIND_ALL, query || {});
    }

    stats() {
        return this.client.send(shared_1.SERVICE_TOKENS.CONTENT, shared_1.CONTENT_PATTERNS.PODCAST_STATS, {});
    }

    show(id) {
        return this.client.send(shared_1.SERVICE_TOKENS.CONTENT, shared_1.CONTENT_PATTERNS.PODCAST_FIND_ONE, { id: Number(id) });
    }

    create(dto, user) {
        return this.client.send(shared_1.SERVICE_TOKENS.CONTENT, shared_1.CONTENT_PATTERNS.PODCAST_CREATE, {
            ...dto,
            userId: user?.id ? Number(user.id) : null,
        });
    }

    update(id, dto, user) {
        return this.client.send(shared_1.SERVICE_TOKENS.CONTENT, shared_1.CONTENT_PATTERNS.PODCAST_UPDATE, {
            id: Number(id),
            ...dto,
            userId: user?.id ? Number(user.id) : null,
        });
    }

    toggleStatus(id) {
        return this.client.send(shared_1.SERVICE_TOKENS.CONTENT, shared_1.CONTENT_PATTERNS.PODCAST_TOGGLE_STATUS, { id: Number(id) });
    }

    remove(id) {
        return this.client.send(shared_1.SERVICE_TOKENS.CONTENT, shared_1.CONTENT_PATTERNS.PODCAST_REMOVE, { id: Number(id) });
    }
};
exports.AdminPodcastsController = AdminPodcastsController;

__decorate([
    (0, common_1.Get)(),
    (0, shared_1.RequirePermissions)(shared_1.PERMISSIONS.VIEW_PODCASTS, shared_1.PERMISSIONS.VIEW_ARTICLES),
    (0, response_interceptor_1.ResponseMessage)('Admin podcast list retrieved successfully'),
    (0, swagger_1.ApiOperation)({ summary: 'Admin episode list with full filters' }),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], AdminPodcastsController.prototype, "index", null);

__decorate([
    (0, common_1.Get)('stats'),
    (0, shared_1.RequirePermissions)(shared_1.PERMISSIONS.VIEW_PODCASTS, shared_1.PERMISSIONS.VIEW_ARTICLES),
    (0, response_interceptor_1.ResponseMessage)('Podcast statistics retrieved successfully'),
    (0, swagger_1.ApiOperation)({ summary: 'Get total listens, duration, and subscriber metrics' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], AdminPodcastsController.prototype, "stats", null);

__decorate([
    (0, common_1.Get)(':id'),
    (0, shared_1.RequirePermissions)(shared_1.PERMISSIONS.VIEW_PODCASTS, shared_1.PERMISSIONS.VIEW_ARTICLES),
    (0, response_interceptor_1.ResponseMessage)('Podcast episode retrieved successfully'),
    (0, swagger_1.ApiOperation)({ summary: 'Get podcast episode by ID' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], AdminPodcastsController.prototype, "show", null);

__decorate([
    (0, common_1.Post)(),
    (0, shared_1.RequirePermissions)(shared_1.PERMISSIONS.CREATE_PODCASTS, shared_1.PERMISSIONS.CREATE_ARTICLES),
    (0, response_interceptor_1.ResponseMessage)('Podcast episode created successfully'),
    (0, swagger_1.ApiOperation)({ summary: 'Publish or draft a new podcast episode' }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, shared_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", void 0)
], AdminPodcastsController.prototype, "create", null);

__decorate([
    (0, common_1.Put)(':id'),
    (0, shared_1.RequirePermissions)(shared_1.PERMISSIONS.EDIT_PODCASTS, shared_1.PERMISSIONS.EDIT_ARTICLES),
    (0, response_interceptor_1.ResponseMessage)('Podcast episode updated successfully'),
    (0, swagger_1.ApiOperation)({ summary: 'Update podcast episode metadata and audio' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, shared_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object]),
    __metadata("design:returntype", void 0)
], AdminPodcastsController.prototype, "update", null);

__decorate([
    (0, common_1.Patch)(':id/status'),
    (0, shared_1.RequirePermissions)(shared_1.PERMISSIONS.EDIT_PODCASTS, shared_1.PERMISSIONS.EDIT_ARTICLES),
    (0, response_interceptor_1.ResponseMessage)('Podcast status toggled successfully'),
    (0, swagger_1.ApiOperation)({ summary: 'Toggle podcast published/draft status' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], AdminPodcastsController.prototype, "toggleStatus", null);

__decorate([
    (0, common_1.Delete)(':id'),
    (0, shared_1.RequirePermissions)(shared_1.PERMISSIONS.DELETE_PODCASTS, shared_1.PERMISSIONS.DELETE_ARTICLES),
    (0, response_interceptor_1.ResponseMessage)('Podcast episode deleted successfully'),
    (0, swagger_1.ApiOperation)({ summary: 'Delete podcast episode' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], AdminPodcastsController.prototype, "remove", null);

exports.AdminPodcastsController = AdminPodcastsController = __decorate([
    (0, swagger_1.ApiTags)('Admin Podcasts'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.Controller)('admin/podcasts'),
    __metadata("design:paramtypes", [microservice_client_1.MicroserviceClient])
], AdminPodcastsController);

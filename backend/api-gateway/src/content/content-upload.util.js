"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.articleFeaturedUploadOptions = articleFeaturedUploadOptions;
exports.cmsMediaUploadOptions = cmsMediaUploadOptions;
exports.detectContentFileType = detectContentFileType;
exports.relativeContentPath = relativeContentPath;
exports.relativeArticleFeaturedPath = relativeArticleFeaturedPath;
const common_1 = require("@nestjs/common");
const multer_1 = require("multer");
const node_fs_1 = require("node:fs");
const node_path_1 = require("node:path");
const IMAGE_MIME = new Set(['image/jpeg', 'image/png', 'image/webp']);
const VIDEO_MIME = new Set(['video/mp4']);
const DOCUMENT_MIME = new Set(['application/pdf']);
const CMS_ALLOWED_MIME = new Set([...IMAGE_MIME, ...VIDEO_MIME, ...DOCUMENT_MIME]);
const ARTICLE_FEATURED_MAX = 10 * 1024 * 1024;
const CMS_MEDIA_MAX = 20 * 1024 * 1024;
function ensureDir(dir) {
    if (!(0, node_fs_1.existsSync)(dir)) {
        (0, node_fs_1.mkdirSync)(dir, { recursive: true });
    }
}
function detectContentFileType(mimeType) {
    if (IMAGE_MIME.has(mimeType))
        return 'image';
    if (VIDEO_MIME.has(mimeType))
        return 'video';
    if (DOCUMENT_MIME.has(mimeType))
        return 'document';
    return null;
}
function relativeContentPath(file, fileType) {
    if (!file || !fileType)
        return '';
    return (0, node_path_1.join)('media', `${fileType}s`, file.filename).replace(/\\/g, '/');
}
function relativeArticleFeaturedPath(file) {
    return file ? (0, node_path_1.join)('articles', file.filename).replace(/\\/g, '/') : '';
}
function articleFeaturedUploadOptions(uploadDir) {
    const targetDir = (0, node_path_1.join)(uploadDir, 'articles');
    ensureDir(targetDir);
    return {
        storage: (0, multer_1.diskStorage)({
            destination: (_req, _file, cb) => cb(null, targetDir),
            filename: (_req, file, cb) => {
                const ext = (0, node_path_1.extname)(file.originalname || '').toLowerCase() || '.jpg';
                cb(null, `${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`);
            },
        }),
        limits: { fileSize: ARTICLE_FEATURED_MAX },
        fileFilter: (_req, file, cb) => {
            if (!IMAGE_MIME.has(file.mimetype)) {
                return cb(new common_1.BadRequestException('Featured images must be JPG, PNG, or WebP.'), false);
            }
            cb(null, true);
        },
    };
}
function cmsMediaUploadOptions(uploadDir) {
    return {
        storage: (0, multer_1.diskStorage)({
            destination: (_req, file, cb) => {
                const fileType = detectContentFileType(file.mimetype);
                if (!fileType) {
                    return cb(new common_1.BadRequestException('Unsupported file type.'), '');
                }
                const targetDir = (0, node_path_1.join)(uploadDir, 'media', `${fileType}s`);
                ensureDir(targetDir);
                cb(null, targetDir);
            },
            filename: (_req, file, cb) => {
                const ext = (0, node_path_1.extname)(file.originalname || '').toLowerCase() || '.bin';
                cb(null, `${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`);
            },
        }),
        limits: { fileSize: CMS_MEDIA_MAX },
        fileFilter: (_req, file, cb) => {
            if (!CMS_ALLOWED_MIME.has(file.mimetype)) {
                return cb(new common_1.BadRequestException('Upload jpg, png, webp, pdf, or mp4 files only.'), false);
            }
            cb(null, true);
        },
    };
}

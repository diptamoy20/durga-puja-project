"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.committeeMediaUploadOptions = committeeMediaUploadOptions;
exports.detectMediaType = detectMediaType;
const common_1 = require("@nestjs/common");
const multer_1 = require("multer");
const node_fs_1 = require("node:fs");
const node_path_1 = require("node:path");
const PHOTO_MIME = new Set(['image/jpeg', 'image/png', 'image/webp']);
const VIDEO_MIME = new Set(['video/mp4', 'video/webm', 'video/quicktime', 'video/mpeg']);
const ALLOWED_MIME = new Set([...PHOTO_MIME, ...VIDEO_MIME]);
const PHOTO_MAX = 10 * 1024 * 1024;
const VIDEO_MAX = 50 * 1024 * 1024;
function detectMediaType(mimeType) {
    if (VIDEO_MIME.has(mimeType))
        return 'VIDEO';
    if (PHOTO_MIME.has(mimeType))
        return 'PHOTO';
    return null;
}
function committeeMediaUploadOptions(uploadDir) {
    const targetDir = (0, node_path_1.join)(uploadDir, 'committee-media');
    if (!(0, node_fs_1.existsSync)(targetDir)) {
        (0, node_fs_1.mkdirSync)(targetDir, { recursive: true });
    }
    return {
        storage: (0, multer_1.diskStorage)({
            destination: (_req, _file, cb) => cb(null, targetDir),
            filename: (_req, file, cb) => {
                const ext = (0, node_path_1.extname)(file.originalname || '').toLowerCase() || '.bin';
                cb(null, `${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`);
            },
        }),
        limits: { fileSize: VIDEO_MAX },
        fileFilter: (_req, file, cb) => {
            if (!ALLOWED_MIME.has(file.mimetype)) {
                return cb(new common_1.BadRequestException('Upload jpg, png, webp, mp4, webm, or mov files.'), false);
            }
            const maxSize = VIDEO_MIME.has(file.mimetype) ? VIDEO_MAX : PHOTO_MAX;
            if (file.size && file.size > maxSize) {
                return cb(new common_1.BadRequestException(`File exceeds the ${VIDEO_MIME.has(file.mimetype) ? '50 MB' : '10 MB'} limit.`), false);
            }
            cb(null, true);
        },
    };
}

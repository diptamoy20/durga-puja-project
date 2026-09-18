"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.atlasUploadOptions = atlasUploadOptions;
exports.atlasMultipartOptions = atlasMultipartOptions;
exports.relativeAtlasPhotoPath = relativeAtlasPhotoPath;
exports.relativeAtlasTourPath = relativeAtlasTourPath;
const common_1 = require("@nestjs/common");
const multer_1 = require("multer");
const node_fs_1 = require("node:fs");
const node_path_1 = require("node:path");
const PHOTO_MIME = new Set(['image/jpeg', 'image/png', 'image/webp']);
const PHOTO_MAX = 10 * 1024 * 1024;
const TOUR_MAX = 15 * 1024 * 1024;
function ensureDir(dir) {
    if (!(0, node_fs_1.existsSync)(dir)) {
        (0, node_fs_1.mkdirSync)(dir, { recursive: true });
    }
}
function atlasUploadOptions(uploadDir) {
    const targetDir = (0, node_path_1.join)(uploadDir, 'pandal-atlas');
    ensureDir(targetDir);
    return {
        storage: (0, multer_1.diskStorage)({
            destination: (_req, _file, cb) => cb(null, targetDir),
            filename: (_req, file, cb) => {
                const ext = (0, node_path_1.extname)(file.originalname || '').toLowerCase() || '.jpg';
                cb(null, `${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`);
            },
        }),
        limits: { fileSize: PHOTO_MAX, files: 10 },
        fileFilter: (_req, file, cb) => {
            if (!PHOTO_MIME.has(file.mimetype)) {
                return cb(new common_1.BadRequestException('Photos must be JPG, PNG, or WebP.'), false);
            }
            cb(null, true);
        },
    };
}
function atlasMultipartOptions(uploadDir) {
    const photoDir = (0, node_path_1.join)(uploadDir, 'pandal-atlas');
    const tourDir = (0, node_path_1.join)(uploadDir, 'pandal-atlas', 'tours');
    ensureDir(photoDir);
    ensureDir(tourDir);
    return {
        storage: (0, multer_1.diskStorage)({
            destination: (_req, file, cb) => {
                cb(null, file.fieldname === 'virtual_tour_file' ? tourDir : photoDir);
            },
            filename: (_req, file, cb) => {
                const ext = (0, node_path_1.extname)(file.originalname || '').toLowerCase() || '.jpg';
                cb(null, `${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`);
            },
        }),
        limits: { fileSize: TOUR_MAX, files: 11 },
        fileFilter: (_req, file, cb) => {
            if (!PHOTO_MIME.has(file.mimetype)) {
                return cb(new common_1.BadRequestException('Upload JPG, PNG, or WebP images only.'), false);
            }
            cb(null, true);
        },
    };
}
exports.atlasMultipartOptions = atlasMultipartOptions;
function relativeAtlasPhotoPath(file) {
    return file ? (0, node_path_1.join)('pandal-atlas', file.filename).replace(/\\/g, '/') : '';
}
function relativeAtlasTourPath(file) {
    return file ? (0, node_path_1.join)('pandal-atlas', 'tours', file.filename).replace(/\\/g, '/') : '';
}

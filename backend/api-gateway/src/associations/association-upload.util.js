"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.associationImageUploadOptions = associationImageUploadOptions;
exports.relativeAssociationImagePath = relativeAssociationImagePath;
const common_1 = require("@nestjs/common");
const multer_1 = require("multer");
const node_fs_1 = require("node:fs");
const node_path_1 = require("node:path");
const IMAGE_MIME = new Set(['image/jpeg', 'image/png', 'image/webp']);
const IMAGE_MAX = 10 * 1024 * 1024;
function ensureDir(dir) {
    if (!(0, node_fs_1.existsSync)(dir)) {
        (0, node_fs_1.mkdirSync)(dir, { recursive: true });
    }
}
function associationImageUploadOptions(uploadDir) {
    const targetDir = (0, node_path_1.join)(uploadDir, 'association-documents');
    ensureDir(targetDir);
    return {
        storage: (0, multer_1.diskStorage)({
            destination: (_req, _file, cb) => cb(null, targetDir),
            filename: (_req, file, cb) => {
                const ext = (0, node_path_1.extname)(file.originalname || '').toLowerCase() || '.jpg';
                cb(null, `${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`);
            },
        }),
        limits: { fileSize: IMAGE_MAX },
        fileFilter: (_req, file, cb) => {
            if (!IMAGE_MIME.has(file.mimetype)) {
                return cb(new common_1.BadRequestException('Images must be JPG, PNG, or WebP.'), false);
            }
            cb(null, true);
        },
    };
}
function relativeAssociationImagePath(file) {
    return file ? (0, node_path_1.join)('association-documents', file.filename).replace(/\\/g, '/') : '';
}
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.webinarBannerUploadOptions = webinarBannerUploadOptions;
const common_1 = require("@nestjs/common");
const multer_1 = require("multer");
const node_fs_1 = require("node:fs");
const node_path_1 = require("node:path");
const ALLOWED_MIME = new Set(['image/jpeg', 'image/png', 'image/webp']);
const MAX_SIZE = 4 * 1024 * 1024;
function webinarBannerUploadOptions(uploadDir) {
    const targetDir = (0, node_path_1.join)(uploadDir, 'webinar-banners');
    if (!(0, node_fs_1.existsSync)(targetDir)) {
        (0, node_fs_1.mkdirSync)(targetDir, { recursive: true });
    }
    return {
        storage: (0, multer_1.diskStorage)({
            destination: (_req, _file, cb) => cb(null, targetDir),
            filename: (_req, file, cb) => {
                const ext = (0, node_path_1.extname)(file.originalname || '').toLowerCase() || '.jpg';
                cb(null, `${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`);
            },
        }),
        limits: { fileSize: MAX_SIZE },
        fileFilter: (_req, file, cb) => {
            if (!ALLOWED_MIME.has(file.mimetype)) {
                return cb(new common_1.BadRequestException('Upload jpg, png, or webp banner images only.'), false);
            }
            cb(null, true);
        },
    };
}

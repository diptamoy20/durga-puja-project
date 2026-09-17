"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.committeeUploadOptions = committeeUploadOptions;
const common_1 = require("@nestjs/common");
const multer_1 = require("multer");
const node_fs_1 = require("node:fs");
const node_path_1 = require("node:path");
const ALLOWED_MIME = new Set([
    'application/pdf',
    'image/jpeg',
    'image/jpg',
    'image/png',
]);
function committeeUploadOptions(uploadDir) {
    const targetDir = (0, node_path_1.join)(uploadDir, 'committee-documents');
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
        limits: { fileSize: 5 * 1024 * 1024 },
        fileFilter: (_req, file, cb) => {
            if (!ALLOWED_MIME.has(file.mimetype)) {
                return cb(new common_1.BadRequestException('Upload PDF, JPG, or PNG files up to 5 MB.'), false);
            }
            cb(null, true);
        },
    };
}

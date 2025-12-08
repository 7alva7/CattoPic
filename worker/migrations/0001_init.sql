-- 图片主表
CREATE TABLE images (
    id TEXT PRIMARY KEY,
    original_name TEXT NOT NULL,
    upload_time TEXT NOT NULL,
    expiry_time TEXT,
    orientation TEXT NOT NULL CHECK (orientation IN ('landscape', 'portrait')),
    format TEXT NOT NULL,
    width INTEGER NOT NULL,
    height INTEGER NOT NULL,
    path_original TEXT NOT NULL,
    path_webp TEXT,
    path_avif TEXT,
    size_original INTEGER NOT NULL,
    size_webp INTEGER DEFAULT 0,
    size_avif INTEGER DEFAULT 0
);

-- 索引优化查询
CREATE INDEX idx_images_orientation ON images(orientation);
CREATE INDEX idx_images_upload_time ON images(upload_time DESC);
CREATE INDEX idx_images_expiry_time ON images(expiry_time) WHERE expiry_time IS NOT NULL;

-- 标签表
CREATE TABLE tags (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL UNIQUE
);

CREATE INDEX idx_tags_name ON tags(name);

-- 图片-标签关联表 (多对多)
CREATE TABLE image_tags (
    image_id TEXT NOT NULL,
    tag_id INTEGER NOT NULL,
    PRIMARY KEY (image_id, tag_id),
    FOREIGN KEY (image_id) REFERENCES images(id) ON DELETE CASCADE,
    FOREIGN KEY (tag_id) REFERENCES tags(id) ON DELETE CASCADE
);

CREATE INDEX idx_image_tags_tag_id ON image_tags(tag_id);
CREATE INDEX idx_image_tags_image_id ON image_tags(image_id);

-- API 密钥表
CREATE TABLE api_keys (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    key TEXT NOT NULL UNIQUE,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    last_used_at TEXT
);

CREATE INDEX idx_api_keys_key ON api_keys(key);

-- 系统配置表
CREATE TABLE config (
    key TEXT PRIMARY KEY,
    value TEXT NOT NULL
);

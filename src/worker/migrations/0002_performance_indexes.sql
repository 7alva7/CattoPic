-- Performance optimization indexes
-- Add composite index for orientation + upload_time (most common query pattern)
CREATE INDEX IF NOT EXISTS idx_images_orientation_upload_time
ON images(orientation, upload_time DESC);

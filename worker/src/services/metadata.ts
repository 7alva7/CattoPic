import type { ImageMetadata, ImageFilters, Tag, ImageRow } from '../types';

// D1 Metadata Service
export class MetadataService {
  constructor(private db: D1Database) {}

  // === Image CRUD ===

  async saveImage(metadata: ImageMetadata): Promise<void> {
    const statements: D1PreparedStatement[] = [];

    // 1. Insert image record
    statements.push(
      this.db.prepare(`
        INSERT INTO images (
          id, original_name, upload_time, expiry_time, orientation,
          format, width, height, path_original, path_webp, path_avif,
          size_original, size_webp, size_avif
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).bind(
        metadata.id,
        metadata.originalName,
        metadata.uploadTime,
        metadata.expiryTime || null,
        metadata.orientation,
        metadata.format,
        metadata.width,
        metadata.height,
        metadata.paths.original,
        metadata.paths.webp || null,
        metadata.paths.avif || null,
        metadata.sizes.original,
        metadata.sizes.webp,
        metadata.sizes.avif
      )
    );

    // 2. Ensure tags exist and create associations
    for (const tag of metadata.tags) {
      statements.push(
        this.db.prepare(`INSERT OR IGNORE INTO tags (name) VALUES (?)`).bind(tag)
      );
      statements.push(
        this.db.prepare(`
          INSERT INTO image_tags (image_id, tag_id)
          SELECT ?, id FROM tags WHERE name = ?
        `).bind(metadata.id, tag)
      );
    }

    await this.db.batch(statements);
  }

  async getImage(id: string): Promise<ImageMetadata | null> {
    const image = await this.db.prepare(`
      SELECT * FROM images WHERE id = ?
    `).bind(id).first<ImageRow>();

    if (!image) return null;

    const tagsResult = await this.db.prepare(`
      SELECT t.name FROM tags t
      JOIN image_tags it ON t.id = it.tag_id
      WHERE it.image_id = ?
    `).bind(id).all<{ name: string }>();

    return this.rowToMetadata(image, tagsResult.results?.map(t => t.name) || []);
  }

  async updateImage(id: string, updates: Partial<ImageMetadata>): Promise<ImageMetadata | null> {
    const image = await this.getImage(id);
    if (!image) return null;

    const statements: D1PreparedStatement[] = [];

    // Handle tag changes
    if (updates.tags) {
      const oldTags = new Set(image.tags);
      const newTags = new Set(updates.tags);

      // Remove old tag associations
      for (const tag of oldTags) {
        if (!newTags.has(tag)) {
          statements.push(
            this.db.prepare(`
              DELETE FROM image_tags WHERE image_id = ? AND tag_id = (SELECT id FROM tags WHERE name = ?)
            `).bind(id, tag)
          );
        }
      }

      // Add new tag associations
      for (const tag of newTags) {
        if (!oldTags.has(tag)) {
          statements.push(
            this.db.prepare(`INSERT OR IGNORE INTO tags (name) VALUES (?)`).bind(tag)
          );
          statements.push(
            this.db.prepare(`
              INSERT OR IGNORE INTO image_tags (image_id, tag_id)
              SELECT ?, id FROM tags WHERE name = ?
            `).bind(id, tag)
          );
        }
      }
    }

    // Update expiry time
    if (updates.expiryTime !== undefined) {
      statements.push(
        this.db.prepare(`UPDATE images SET expiry_time = ? WHERE id = ?`)
          .bind(updates.expiryTime || null, id)
      );
    }

    if (statements.length > 0) {
      await this.db.batch(statements);
    }

    return this.getImage(id);
  }

  async deleteImage(id: string): Promise<boolean> {
    const result = await this.db.prepare(`
      DELETE FROM images WHERE id = ?
    `).bind(id).run();

    // ON DELETE CASCADE handles image_tags cleanup
    return result.success && (result.meta?.changes || 0) > 0;
  }

  // === Image Queries ===

  async getImageIds(orientation?: string): Promise<string[]> {
    let query = 'SELECT id FROM images';
    const params: string[] = [];

    if (orientation) {
      query += ' WHERE orientation = ?';
      params.push(orientation);
    }

    query += ' ORDER BY upload_time DESC';

    const result = await this.db.prepare(query).bind(...params).all<{ id: string }>();
    return result.results?.map(r => r.id) || [];
  }

  async getImages(filters: ImageFilters): Promise<{ images: ImageMetadata[]; total: number }> {
    const { page = 1, limit = 12, tag, orientation } = filters;
    const offset = (page - 1) * limit;

    let baseQuery = 'FROM images i';
    const whereConditions: string[] = [];
    const params: (string | number)[] = [];

    if (tag) {
      baseQuery += ' JOIN image_tags it ON i.id = it.image_id JOIN tags t ON it.tag_id = t.id';
      whereConditions.push('t.name = ?');
      params.push(tag);
    }

    if (orientation) {
      whereConditions.push('i.orientation = ?');
      params.push(orientation);
    }

    const whereClause = whereConditions.length > 0
      ? 'WHERE ' + whereConditions.join(' AND ')
      : '';

    // Get total count
    const countResult = await this.db.prepare(
      `SELECT COUNT(DISTINCT i.id) as count ${baseQuery} ${whereClause}`
    ).bind(...params).first<{ count: number }>();

    const total = countResult?.count || 0;

    // Get paginated data
    const imagesResult = await this.db.prepare(`
      SELECT DISTINCT i.* ${baseQuery} ${whereClause}
      ORDER BY i.upload_time DESC LIMIT ? OFFSET ?
    `).bind(...params, limit, offset).all<ImageRow>();

    const images = await this.enrichWithTags(imagesResult.results || []);

    return { images, total };
  }

  async getRandomImage(filters?: {
    tags?: string[];
    exclude?: string[];
    orientation?: string;
  }): Promise<ImageMetadata | null> {
    let query = 'SELECT i.* FROM images i';
    const whereConditions: string[] = [];
    const params: (string | number)[] = [];

    // Tag filter (AND logic)
    if (filters?.tags?.length) {
      query += ' JOIN image_tags it ON i.id = it.image_id JOIN tags t ON it.tag_id = t.id';
      const placeholders = filters.tags.map(() => '?').join(',');
      whereConditions.push(`t.name IN (${placeholders})`);
      params.push(...filters.tags);
    }

    // Exclude tags
    if (filters?.exclude?.length) {
      const placeholders = filters.exclude.map(() => '?').join(',');
      whereConditions.push(`i.id NOT IN (
        SELECT it2.image_id FROM image_tags it2
        JOIN tags t2 ON it2.tag_id = t2.id
        WHERE t2.name IN (${placeholders})
      )`);
      params.push(...filters.exclude);
    }

    // Orientation filter
    if (filters?.orientation) {
      whereConditions.push('i.orientation = ?');
      params.push(filters.orientation);
    }

    const whereClause = whereConditions.length > 0
      ? 'WHERE ' + whereConditions.join(' AND ')
      : '';

    // For AND logic on tags, need GROUP BY and HAVING
    let groupClause = '';
    if (filters?.tags?.length) {
      groupClause = ` GROUP BY i.id HAVING COUNT(DISTINCT t.name) = ?`;
      params.push(filters.tags.length);
    }

    const result = await this.db.prepare(`
      ${query} ${whereClause} ${groupClause} ORDER BY RANDOM() LIMIT 1
    `).bind(...params).first<ImageRow>();

    if (!result) return null;
    return this.getImage(result.id);
  }

  // === Tag Management ===

  async getAllTags(): Promise<Tag[]> {
    const result = await this.db.prepare(`
      SELECT t.name, COUNT(it.image_id) as count
      FROM tags t
      LEFT JOIN image_tags it ON t.id = it.tag_id
      GROUP BY t.id, t.name
      ORDER BY t.name
    `).all<{ name: string; count: number }>();

    return result.results || [];
  }

  async createTag(name: string): Promise<void> {
    await this.db.prepare(`
      INSERT OR IGNORE INTO tags (name) VALUES (?)
    `).bind(name).run();
  }

  async renameTag(oldName: string, newName: string): Promise<number> {
    // Get count of affected images
    const countResult = await this.db.prepare(`
      SELECT COUNT(*) as count FROM image_tags it
      JOIN tags t ON it.tag_id = t.id WHERE t.name = ?
    `).bind(oldName).first<{ count: number }>();

    // Rename the tag
    await this.db.prepare(`
      UPDATE tags SET name = ? WHERE name = ?
    `).bind(newName, oldName).run();

    return countResult?.count || 0;
  }

  async deleteTag(name: string): Promise<number> {
    // Get count of affected images
    const countResult = await this.db.prepare(`
      SELECT COUNT(*) as count FROM image_tags it
      JOIN tags t ON it.tag_id = t.id WHERE t.name = ?
    `).bind(name).first<{ count: number }>();

    // Delete the tag (ON DELETE CASCADE handles image_tags)
    await this.db.prepare(`
      DELETE FROM tags WHERE name = ?
    `).bind(name).run();

    return countResult?.count || 0;
  }

  async batchUpdateTags(imageIds: string[], addTags: string[], removeTags: string[]): Promise<number> {
    const statements: D1PreparedStatement[] = [];

    // Ensure all new tags exist
    for (const tag of addTags) {
      statements.push(
        this.db.prepare(`INSERT OR IGNORE INTO tags (name) VALUES (?)`).bind(tag)
      );
    }

    for (const id of imageIds) {
      // Remove tags
      for (const tag of removeTags) {
        statements.push(
          this.db.prepare(`
            DELETE FROM image_tags WHERE image_id = ?
            AND tag_id = (SELECT id FROM tags WHERE name = ?)
          `).bind(id, tag)
        );
      }

      // Add tags
      for (const tag of addTags) {
        statements.push(
          this.db.prepare(`
            INSERT OR IGNORE INTO image_tags (image_id, tag_id)
            SELECT ?, id FROM tags WHERE name = ?
          `).bind(id, tag)
        );
      }
    }

    await this.db.batch(statements);
    return imageIds.length;
  }

  // === Cleanup ===

  async getExpiredImages(): Promise<ImageMetadata[]> {
    const now = new Date().toISOString();

    const result = await this.db.prepare(`
      SELECT * FROM images WHERE expiry_time IS NOT NULL AND expiry_time < ?
    `).bind(now).all<ImageRow>();

    return this.enrichWithTags(result.results || []);
  }

  // === Private Helper Methods ===

  private rowToMetadata(row: ImageRow, tags: string[]): ImageMetadata {
    return {
      id: row.id,
      originalName: row.original_name,
      uploadTime: row.upload_time,
      expiryTime: row.expiry_time || undefined,
      orientation: row.orientation as 'landscape' | 'portrait',
      tags,
      format: row.format,
      width: row.width,
      height: row.height,
      paths: {
        original: row.path_original,
        webp: row.path_webp || '',
        avif: row.path_avif || ''
      },
      sizes: {
        original: row.size_original,
        webp: row.size_webp,
        avif: row.size_avif
      }
    };
  }

  private async enrichWithTags(rows: ImageRow[]): Promise<ImageMetadata[]> {
    if (rows.length === 0) return [];

    const imageIds = rows.map(r => r.id);
    const placeholders = imageIds.map(() => '?').join(',');

    const tagsResult = await this.db.prepare(`
      SELECT it.image_id, t.name FROM image_tags it
      JOIN tags t ON it.tag_id = t.id
      WHERE it.image_id IN (${placeholders})
    `).bind(...imageIds).all<{ image_id: string; name: string }>();

    const tagMap = new Map<string, string[]>();
    for (const row of tagsResult.results || []) {
      if (!tagMap.has(row.image_id)) {
        tagMap.set(row.image_id, []);
      }
      tagMap.get(row.image_id)!.push(row.name);
    }

    return rows.map(row => this.rowToMetadata(row, tagMap.get(row.id) || []));
  }
}

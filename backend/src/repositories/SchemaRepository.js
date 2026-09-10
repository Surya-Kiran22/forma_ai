import { FormSchema } from '../models/FormSchema.js';

class SchemaCache {
  constructor() {
    this.cache = new Map();
    this.ttl = 300000; // 5 minutes TTL
  }

  get(key) {
    const item = this.cache.get(key);
    if (!item) return null;
    if (Date.now() > item.expiry) {
      this.cache.delete(key);
      return null;
    }
    return item.data;
  }

  set(key, data) {
    this.cache.set(key, {
      data,
      expiry: Date.now() + this.ttl,
    });
  }

  invalidate(formType) {
    for (const key of this.cache.keys()) {
      if (key.startsWith(formType)) {
        this.cache.delete(key);
      }
    }
  }
}

export class SchemaRepository {
  constructor() {
    this.cache = new SchemaCache();
  }

  async findLatestByFormType(formType) {
    const cacheKey = `${formType}:latest`;
    const cached = this.cache.get(cacheKey);
    if (cached) return cached;

    const schema = await FormSchema.findOne({ formType, isPublished: true })
      .sort({ version: -1 })
      .lean();

    if (schema) {
      this.cache.set(cacheKey, schema);
    }
    return schema;
  }

  async findByFormTypeAndVersion(formType, version) {
    const cacheKey = `${formType}:v${version}`;
    const cached = this.cache.get(cacheKey);
    if (cached) return cached;

    const schema = await FormSchema.findOne({ formType, version }).lean();
    if (schema) {
      this.cache.set(cacheKey, schema);
    }
    return schema;
  }

  async listAllPublished(page = 1, limit = 20) {
    const skip = (page - 1) * limit;
    
    // Aggregation to get latest published version of each form type
    const schemas = await FormSchema.aggregate([
      { $match: { isPublished: true } },
      { $sort: { version: -1 } },
      {
        $group: {
          _id: '$formType',
          doc: { $first: '$$ROOT' },
        },
      },
      { $replaceRoot: { newRoot: '$doc' } },
      { $skip: skip },
      { $limit: limit },
    ]);

    const totalCount = (await FormSchema.distinct('formType', { isPublished: true })).length;

    return {
      schemas,
      pagination: {
        page,
        limit,
        total: totalCount,
        totalPages: Math.ceil(totalCount / limit),
      },
    };
  }

  async createSchema(schemaData) {
    const newSchema = new FormSchema(schemaData);
    const saved = await newSchema.save();
    this.cache.invalidate(schemaData.formType);
    return saved;
  }
}

export const schemaRepository = new SchemaRepository();

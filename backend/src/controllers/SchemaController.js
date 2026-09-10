import { schemaService } from '../services/SchemaService.js';
import { z } from 'zod';

export const createSchemaBody = z.object({
  formType: z.string().min(2),
  title: z.string().min(2),
  description: z.string().optional(),
  sections: z.array(z.record(z.unknown())),
});

export class SchemaController {
  async getLatestSchema(req, res, next) {
    try {
      const { formType } = req.params;
      const schema = await schemaService.getLatestSchema(formType);
      res.status(200).json({
        success: true,
        data: schema,
      });
    } catch (err) {
      next(err);
    }
  }

  async getSchemaByVersion(req, res, next) {
    try {
      const { formType, version } = req.params;
      const schema = await schemaService.getSchemaByVersion(formType, parseInt(version, 10));
      res.status(200).json({
        success: true,
        data: schema,
      });
    } catch (err) {
      next(err);
    }
  }

  async listSchemas(req, res, next) {
    try {
      const page = parseInt(req.query.page || '1', 10);
      const limit = parseInt(req.query.limit || '10', 10);
      const result = await schemaService.listSchemas(page, limit);
      res.status(200).json({
        success: true,
        data: result.schemas,
        pagination: result.pagination,
      });
    } catch (err) {
      next(err);
    }
  }

  async createSchema(req, res, next) {
    try {
      const schema = await schemaService.createSchema(req.body);
      res.status(201).json({
        success: true,
        data: schema,
      });
    } catch (err) {
      next(err);
    }
  }
}

export const schemaController = new SchemaController();

import { schemaRepository } from '../repositories/SchemaRepository.js';
import { NotFoundError, BadRequestError } from '../utils/errors.js';

export class SchemaService {
  async getLatestSchema(formType) {
    const schema = await schemaRepository.findLatestByFormType(formType);
    if (!schema) {
      throw new NotFoundError(`Form schema for type '${formType}' was not found`);
    }
    return schema;
  }

  async getSchemaByVersion(formType, version) {
    const schema = await schemaRepository.findByFormTypeAndVersion(formType, version);
    if (!schema) {
      throw new NotFoundError(`Form schema for '${formType}' version ${version} was not found`);
    }
    return schema;
  }

  async listSchemas(page, limit) {
    return schemaRepository.listAllPublished(page, limit);
  }

  async createSchema(schemaData) {
    // Check if previous version exists
    const latest = await schemaRepository.findLatestByFormType(schemaData.formType);
    const nextVersion = latest ? latest.version + 1 : 1;

    const newSchema = await schemaRepository.createSchema({
      ...schemaData,
      version: nextVersion,
    });

    return newSchema;
  }

  /**
   * Helper to collect all fields defined across all sections of a schema
   */
  extractAllFields(schema) {
    const fields = [];
    for (const section of schema.sections || []) {
      for (const field of section.fields || []) {
        fields.push(field);
        if (field.type === 'nested_group' && Array.isArray(field.fields)) {
          fields.push(...field.fields);
        }
      }
    }
    return fields;
  }
}

export const schemaService = new SchemaService();

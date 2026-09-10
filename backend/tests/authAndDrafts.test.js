import request from 'supertest';
import app from '../src/app.js';
import { connectDB, disconnectDB } from '../src/config/db.js';
import { seedDatabase } from '../src/scripts/seed.js';

describe('Auth & Drafts Integration API Tests', () => {
  let authToken = '';
  let refreshToken = '';

  beforeAll(async () => {
    await connectDB();
    await seedDatabase();

    const res = await request(app).post('/api/v1/auth/login').send({
      email: 'user@forma.ai',
      password: 'Password123!',
    });

    expect(res.status).toBe(200);
    authToken = res.body.data.tokens.accessToken;
    refreshToken = res.body.data.tokens.refreshToken;
  });

  afterAll(async () => {
    await disconnectDB();
  });

  test('POST /api/v1/auth/login - should authenticate user and return JWT tokens', () => {
    expect(authToken).toBeDefined();
    expect(refreshToken).toBeDefined();
  });

  test('GET /api/v1/schemas/auto_claim - should return published schema with version 1', async () => {
    const res = await request(app).get('/api/v1/schemas/auto_claim');
    expect(res.status).toBe(200);
    expect(res.body.data.formType).toBe('auto_claim');
    expect(res.body.data.version).toBe(1);
    expect(res.body.data.sections.length).toBeGreaterThan(0);
  });

  test('POST /api/v1/drafts/auto_claim - should save draft idempotently and compute missing fields', async () => {
    const draftPayload = {
      schemaVersion: 1,
      idempotencyKey: 'idemp_test_123',
      data: {
        'incident.type': 'animal_collision',
        'vehicle.make': 'Honda',
      },
    };

    const res = await request(app)
      .post('/api/v1/drafts/auto_claim')
      .set('Authorization', `Bearer ${authToken}`)
      .send(draftPayload);

    expect(res.status).toBe(200);
    expect(res.body.data.formType).toBe('auto_claim');
    expect(res.body.data.completionPercentage).toBeGreaterThanOrEqual(0);
    expect(Array.isArray(res.body.data.missingFields)).toBe(true);
  });

  test('GET /api/v1/drafts/auto_claim - should retrieve saved draft for authenticated user', async () => {
    const res = await request(app)
      .get('/api/v1/drafts/auto_claim')
      .set('Authorization', `Bearer ${authToken}`);

    expect(res.status).toBe(200);
    expect(res.body.data.data['incident.type']).toBe('animal_collision');
  });

  test('POST /api/v1/extraction/extract - should parse natural language narrative and extract structured JSON', async () => {
    const res = await request(app)
      .post('/api/v1/extraction/extract')
      .send({
        formType: 'auto_claim',
        narrativeText: 'I hit a deer on I-95 yesterday in my Honda, and the windshield shattered.',
      });

    expect(res.status).toBe(200);
    expect(res.body.data.extractedData['incident.type']).toBe('animal_collision');
    expect(res.body.data.extractedData['vehicle.make']).toBe('Honda');
    expect(res.body.data.confidenceScores).toBeDefined();
  });
});

const request = require('supertest');

const app = require('../src/app');

describe('Medequip API', () => {
  it('GET /health -> 200', async () => {
    const res = await request(app).get('/health');
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ status: 'ok' });
  });

  it('POST /api/auth/login - body inválido -> 400', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'no-es-email', password: '' });

    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty('status');
    expect(res.body.status).toBe('error');
  });
});


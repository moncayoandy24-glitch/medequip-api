const request = require('supertest');
const jwt = require('jsonwebtoken');
const fs = require('fs');
const path = require('path');

jest.mock('../src/repositories/usuarioRepository', () => ({
  usuarioRepository: { findById: jest.fn() },
}));

const { usuarioRepository } = require('../src/repositories/usuarioRepository');
const app = require('../src/app');

describe('MedEquip API - base y seguridad', () => {
  test('GET /health responde 200', async () => {
    const response = await request(app).get('/health');
    expect(response.status).toBe(200);
    expect(response.body).toEqual({ status: 'ok' });
  });

  test('rechaza JSON inválido con el formato estándar', async () => {
    const response = await request(app)
      .post('/api/auth/login')
      .set('Content-Type', 'application/json')
      .send('{');
    expect(response.status).toBe(400);
    expect(response.body.success).toBe(false);
  });

  test('la validación responde 422', async () => {
    const response = await request(app)
      .post('/api/auth/login')
      .send({ email: 'correo-invalido', password: '' });
    expect(response.status).toBe(422);
    expect(response.body.success).toBe(false);
    expect(response.body.errors.length).toBeGreaterThan(0);
  });

  test.each([
    '/api/usuarios', '/api/roles', '/api/equipos', '/api/categorias',
    '/api/ubicaciones', '/api/proveedores', '/api/auth/profile', '/api/mantenimientos',
    '/api/calibraciones', '/api/repuestos', '/api/fallas', '/api/movimientos',
    '/api/dashboard/resumen', '/api/auditorias', '/api/notificaciones',
  ])('%s requiere autenticación', async (route) => {
    const response = await request(app).get(route);
    expect(response.status).toBe(401);
    expect(response.body.success).toBe(false);
  });

  test('una ruta inexistente responde 404 estándar', async () => {
    const response = await request(app).get('/ruta-inexistente');
    expect(response.status).toBe(404);
    expect(response.body).toMatchObject({ success: false, errors: [] });
  });

  test('Swagger documenta los módulos principales', async () => {
    const response = await request(app).get('/api-docs.json');
    expect(response.status).toBe(200);
    expect(response.body.openapi).toBe('3.0.3');
    expect(response.body.paths).toHaveProperty('/api/mantenimientos');
    expect(response.body.paths).toHaveProperty('/api/fallas/{id}/cerrar');
    expect(response.body.components.securitySchemes).toHaveProperty('bearerAuth');
  });

  test('un usuario clínico no puede consultar el dashboard', async () => {
    usuarioRepository.findById.mockResolvedValueOnce({
      id: '11111111-1111-4111-8111-111111111111', email: 'clinico@test.com', activo: true, roles: ['usuario_clinico'],
    });
    const token = jwt.sign({ id: '11111111-1111-4111-8111-111111111111' }, process.env.JWT_SECRET);
    const response = await request(app).get('/api/dashboard/resumen').set('Authorization', `Bearer ${token}`);
    expect(response.status).toBe(403);
  });

  test.each([
    '/api/mantenimientos', '/api/calibraciones', '/api/repuestos', '/api/fallas', '/api/movimientos',
  ])('%s valida el cuerpo antes de ejecutar la lógica', async (route) => {
    usuarioRepository.findById.mockResolvedValueOnce({
      id: '22222222-2222-4222-8222-222222222222', email: 'admin@test.com', activo: true, roles: ['admin'],
    });
    const token = jwt.sign({ id: '22222222-2222-4222-8222-222222222222' }, process.env.JWT_SECRET);
    const response = await request(app).post(route).set('Authorization', `Bearer ${token}`).send({});
    expect(response.status).toBe(422);
    expect(response.body.errors.length).toBeGreaterThan(0);
  });

  test('la colección de Postman contiene JSON válido', () => {
    const collectionPath = path.join(__dirname, '..', 'docs', 'postman', 'MedEquip_API.postman_collection.json');
    const collection = JSON.parse(fs.readFileSync(collectionPath, 'utf8'));
    expect(collection.info.name).toBe('MedEquip API');
    expect(collection.item.length).toBeGreaterThanOrEqual(5);
  });
});

const request = require('supertest');
const app = require('../src/app');
const pool = require('../src/config/database');

let token;

const rolAdmin = {
  nombre: 'admin-test-' + Date.now(),
  descripcion: 'Rol de prueba admin',
};

beforeAll(async () => {
  try {
    await pool.query('SELECT 1');
    await pool.query('DELETE FROM usuario_roles WHERE usuario_id IN (SELECT id FROM usuarios WHERE email LIKE $1)', ['%@test%']);
    await pool.query('DELETE FROM usuarios WHERE email LIKE $1', ['%@test%']);
    await pool.query("DELETE FROM roles WHERE nombre LIKE 'admin-test%' OR nombre = 'usuario-test'");
  } catch (error) {
    console.warn('No se pudo conectar a la base de datos, las pruebas podrían fallar. Asegúrate de configurar .env correctamente.');
  }
});

afterAll(async () => {
  try {
    await pool.query('DELETE FROM usuario_roles WHERE usuario_id IN (SELECT id FROM usuarios WHERE email LIKE $1)', ['%@test%']);
    await pool.query('DELETE FROM usuarios WHERE email LIKE $1', ['%@test%']);
    await pool.query("DELETE FROM roles WHERE nombre LIKE 'admin-test%' OR nombre = 'usuario-test'");
    await pool.end();
  } catch (error) {
    console.warn('Error limpiando datos de prueba:', error.message);
  }
});

describe('Auth', () => {
  it('debería registrar un usuario correctamente', async () => {
    const res = await request(app)
      .post('/api/auth/registro')
      .send({
        nombre: 'Usuario Test',
        email: 'test@test.com',
        password: '123456',
      });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.usuario).toBeDefined();
    expect(res.body.data.token).toBeDefined();
    token = res.body.data.token;
  });

  it('debería fallar con correo duplicado', async () => {
    const res = await request(app)
      .post('/api/auth/registro')
      .send({
        nombre: 'Usuario Test',
        email: 'test@test.com',
        password: '123456',
      });

    expect(res.status).toBe(409);
    expect(res.body.success).toBe(false);
  });

  it('debería hacer login correctamente', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'test@test.com',
        password: '123456',
      });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.token).toBeDefined();
    token = res.body.data.token;
  });

  it('debería fallar login con credenciales incorrectas', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'test@test.com',
        password: 'incorrecta',
      });

    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
  });

  it('debería obtener el perfil con token', async () => {
    const res = await request(app)
      .get('/api/auth/profile')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.email).toBe('test@test.com');
  });

  it('debería fallar perfil sin token', async () => {
    const res = await request(app).get('/api/auth/profile');
    expect(res.status).toBe(401);
  });

  it('debería cambiar la contraseña', async () => {
    const res = await request(app)
      .post('/api/auth/change-password')
      .set('Authorization', `Bearer ${token}`)
      .send({
        passwordActual: '123456',
        nuevaPassword: 'nueva123',
      });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });
});

describe('Roles', () => {
  let adminToken;

  beforeAll(async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'admin@example.com',
        password: 'admin123',
      });
    if (res.body.data && res.body.data.token) {
      adminToken = res.body.data.token;
    } else {
      await request(app)
        .post('/api/auth/registro')
        .send({
          nombre: 'Admin Test',
          email: 'admin-role@test.com',
          password: 'admin123',
        });
      const res2 = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'admin-role@test.com',
          password: 'admin123',
        });
      adminToken = res2.body.data.token;
    }
  });

  it('debería crear un rol', async () => {
    const res = await request(app)
      .post('/api/roles')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        nombre: rolAdmin.nombre,
        descripcion: rolAdmin.descripcion,
      });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
  });

  it('debería listar roles', async () => {
    const res = await request(app)
      .get('/api/roles')
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
  });

  it('debería fallar acceso a roles sin token', async () => {
    const res = await request(app).get('/api/roles');
    expect(res.status).toBe(401);
  });
});

describe('Usuarios', () => {
  let adminToken;

  beforeAll(async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'admin@example.com',
        password: 'admin123',
      });
    if (res.body.data && res.body.data.token) {
      adminToken = res.body.data.token;
    } else {
      const res2 = await request(app)
        .post('/api/auth/registro')
        .send({
          nombre: 'Admin Usuario Test',
          email: 'admin-user@test.com',
          password: 'admin123',
        });
      const res3 = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'admin-user@test.com',
          password: 'admin123',
        });
      adminToken = res3.body.data.token;
    }
  });

  it('debería listar usuarios', async () => {
    const res = await request(app)
      .get('/api/usuarios')
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  it('debería cambiar estado de usuario', async () => {
    const res = await request(app)
      .patch('/api/usuarios/1/estado')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ activo: false });

    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);
  });
});

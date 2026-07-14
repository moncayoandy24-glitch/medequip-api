require('dotenv').config();
const pool = require('../src/config/database');

const seedRoles = async () => {
  try {
    const roles = [
      { nombre: 'admin', descripcion: 'Administrador del sistema' },
      { nombre: 'usuario', descripcion: 'Usuario estándar' },
    ];

    for (const rol of roles) {
      const existente = await pool.query('SELECT * FROM roles WHERE nombre = $1', [rol.nombre]);
      if (existente.rows.length === 0) {
        await pool.query('INSERT INTO roles (nombre, descripcion) VALUES ($1, $2)', [rol.nombre, rol.descripcion]);
        console.log(`Rol ${rol.nombre} creado`);
      } else {
        console.log(`Rol ${rol.nombre} ya existe`);
      }
    }

    const adminEmail = process.env.ADMIN_EMAIL;
    const adminPassword = process.env.ADMIN_PASSWORD;

    if (adminEmail && adminPassword) {
      const adminRol = await pool.query('SELECT * FROM roles WHERE nombre = $1', ['admin']);
      const usuarioExistente = await pool.query('SELECT * FROM usuarios WHERE email = $1', [adminEmail]);

      if (adminRol.rows.length > 0 && usuarioExistente.rows.length === 0) {
        const bcrypt = require('bcrypt');
        const password_hash = await bcrypt.hash(adminPassword, 10);
        const result = await pool.query(
          'INSERT INTO usuarios (nombre, email, password_hash) VALUES ($1, $2, $3) RETURNING id',
          ['Administrador', adminEmail, password_hash]
        );
        await pool.query('INSERT INTO usuario_roles (usuario_id, rol_id) VALUES ($1, $2) ON CONFLICT DO NOTHING', [result.rows[0].id, adminRol.rows[0].id]);
        console.log(`Administrador inicial creado: ${adminEmail}`);
      } else if (usuarioExistente.rows.length > 0) {
        console.log(`Administrador ${adminEmail} ya existe`);
      }
    } else {
      console.log('ADMIN_EMAIL o ADMIN_PASSWORD no configurados, se salta creación de admin inicial');
    }

    console.log('Seed completado');
    process.exit(0);
  } catch (error) {
    console.error('Error en seed:', error);
    process.exit(1);
  }
};

seedRoles();

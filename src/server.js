const app = require('./app');
const pool = require('./config/database');

const PORT = process.env.PORT || 3000;
let server;

const start = async () => {
  await pool.query('SELECT 1');
  server = app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
};

start().catch((error) => {
  console.error('No se pudo iniciar la API. Verifica la conexión PostgreSQL:', error.message);
  process.exit(1);
});

process.on('unhandledRejection', (error) => {
  console.error('Unhandled Promise Rejection:', error);
  if (server) server.close(() => process.exit(1));
  else process.exit(1);
});

process.on('SIGTERM', async () => {
  if (server) server.close();
  await pool.end();
});

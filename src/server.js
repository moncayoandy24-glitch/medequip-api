require('dotenv').config();

const app = require('./app');

if (!process.env.JWT_SECRET || process.env.JWT_SECRET.trim() === '') {
  console.error('Error: JWT_SECRET no está configurado en las variables de entorno.');
  process.exit(1);
}

const PORT = process.env.PORT || 3000;

const server = app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

process.on('unhandledRejection', (err) => {
  console.error('Unhandled Promise Rejection:', err);
  server.close(() => process.exit(1));
});

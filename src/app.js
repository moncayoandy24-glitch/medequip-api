require('dotenv').config({ quiet: true });
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const cookieParser = require('cookie-parser');
const morgan = require('morgan');
const swaggerUi = require('swagger-ui-express');
const specs = require('./config/swagger');
const { errorHandler } = require('./middlewares/errorHandler');
const authRoutes = require('./routes/authRoutes');
const usuarioRoutes = require('./routes/usuarioRoutes');
const rolRoutes = require('./routes/rolRoutes');
const equipoRoutes = require('./routes/equipoRoutes');
const categoriaRoutes = require('./routes/categoriaRoutes');
const ubicacionRoutes = require('./routes/ubicacionRoutes');
const proveedorRoutes = require('./routes/proveedorRoutes');
const mantenimientoRoutes = require('./routes/mantenimientoRoutes');
const calibracionRoutes = require('./routes/calibracionRoutes');
const repuestoRoutes = require('./routes/repuestoRoutes');
const fallaRoutes = require('./routes/fallaRoutes');
const movimientoRoutes = require('./routes/movimientoRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');
const auditoriaRoutes = require('./routes/auditoriaRoutes');
const notificacionRoutes = require('./routes/notificacionRoutes');

const app = express();

app.use(helmet());
app.use(compression());
app.use(cors({ origin: process.env.CORS_ORIGIN || '*' }));
app.use(express.json());
app.use((err, req, res, next) => {
  if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
    return res.status(400).json({ success: false, message: 'JSON inválido', errors: [] });
  }
  next(err);
});
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(morgan('dev'));

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs));
app.get('/api-docs.json', (req, res) => res.json(specs));

app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok' });
});

app.use('/api/auth', authRoutes);
app.use('/api/usuarios', usuarioRoutes);
app.use('/api/roles', rolRoutes);
app.use('/api/equipos', equipoRoutes);
app.use('/api/categorias', categoriaRoutes);
app.use('/api/ubicaciones', ubicacionRoutes);
app.use('/api/proveedores', proveedorRoutes);
app.use('/api/mantenimientos', mantenimientoRoutes);
app.use('/api/calibraciones', calibracionRoutes);
app.use('/api/repuestos', repuestoRoutes);
app.use('/api/fallas', fallaRoutes);
app.use('/api/movimientos', movimientoRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/auditorias', auditoriaRoutes);
app.use('/api/notificaciones', notificacionRoutes);

app.use((req, res) => {
  res.status(404).json({ success: false, message: 'Ruta no encontrada', errors: [] });
});

app.use(errorHandler);

module.exports = app;

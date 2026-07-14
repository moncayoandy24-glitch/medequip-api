const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const cookieParser = require('cookie-parser');
const morgan = require('morgan');
const swaggerJsDoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');
const { sendError } = require('./utils/responseHelper');
const authRoutes = require('./routes/authRoutes');
const usuarioRoutes = require('./routes/usuarioRoutes');
const rolRoutes = require('./routes/rolRoutes');

const app = express();

app.use(helmet());
app.use(compression());
app.use(cors());
app.use(express.json());
app.use((req, res, next) => {
  if (req.headers['content-type'] && req.headers['content-type'].includes('application/json')) {
    return next();
  }
  if (req.method === 'POST' || req.method === 'PUT' || req.method === 'PATCH') {
    return next();
  }
  next();
});
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(morgan('dev'));

const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Medequip API',
      version: '1.0.0',
    },
  },
  apis: [],
};

const specs = swaggerJsDoc(swaggerOptions);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs));

app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok' });
});

app.use('/api/auth', authRoutes);
app.use('/api/usuarios', usuarioRoutes);
app.use('/api/roles', rolRoutes);

app.use((req, res) => {
  res.status(404).json({ success: false, message: 'Not Found' });
});

app.use((err, req, res, next) => {
  if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
    return res.status(400).json({ success: false, message: 'JSON inválido' });
  }
  sendError(err, req, res, next);
});

module.exports = app;

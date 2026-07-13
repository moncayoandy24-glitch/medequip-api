const { authService } = require('../services/authService');
const { asyncHandler } = require('../utils/asyncHandler');

const authController = {
  /**
   * @openapi
   * /api/auth/registro:
   *   post:
   *     summary: Registrar un usuario
   *     tags: [Auth]
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required: [nombre, email, password]
   *             properties:
   *               nombre:
   *                 type: string
   *               email:
   *                 type: string
   *               password:
   *                 type: string
   *               rol_id:
   *                 type: string
   *                 description: UUID opcional del rol
   *     responses:
   *       201:
   *         description: Usuario creado y token JWT
   *       400:
   *         description: Datos inválidos
   *       500:
   *         description: Error interno
   */
  registrar: asyncHandler(async (req, res) => {
    const resultado = await authService.registrar(req.body);
    res.status(201).json(resultado);
  }),

  /**
   * @openapi
   * /api/auth/login:
   *   post:
   *     summary: Iniciar sesión
   *     tags: [Auth]
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required: [email, password]
   *             properties:
   *               email:
   *                 type: string
   *               password:
   *                 type: string
   *     responses:
   *       200:
   *         description: Token JWT
   *       400:
   *         description: Datos inválidos
   *       401:
   *         description: Credenciales inválidas
   */
  login: asyncHandler(async (req, res) => {
    const resultado = await authService.login(req.body);
    res.json(resultado);
  }),
};

const validaciones = {
  registrar: [
    require('express-validator').body('nombre').notEmpty().withMessage('El nombre es obligatorio').isString().isLength({ max: 100 }),
    require('express-validator').body('email').isEmail().withMessage('Email inválido').isLength({ max: 150 }),
    require('express-validator').body('password').isLength({ min: 6 }).withMessage('La contraseña debe tener al menos 6 caracteres'),
    require('express-validator').body('rol_id').optional().isUUID(4).withMessage('Rol inválido'),
  ],
  login: [
    require('express-validator').body('email').isEmail().withMessage('Email inválido'),
    require('express-validator').body('password').notEmpty().withMessage('La contraseña es obligatoria'),
  ],
};

module.exports = { authController, validaciones };

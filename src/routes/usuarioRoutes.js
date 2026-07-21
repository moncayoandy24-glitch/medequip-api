const express = require('express');
const { usuarioController, validaciones } = require('../controllers/usuarioController');
const { authorize } = require('../middlewares/role');
const { auth } = require('../middlewares/auth');
const { validate } = require('../middlewares/validate');
const { audit } = require('../middlewares/audit');

const router = express.Router();

router.use(auth, authorize('admin'), audit('usuarios'));

router.get('/', validate(validaciones.listar), usuarioController.listar);
router.get('/:id', validate(validaciones.obtener), usuarioController.obtener);
router.post('/', validate(validaciones.crear), usuarioController.crear);
router.put('/:id', validate(validaciones.actualizar), usuarioController.actualizar);
router.patch('/:id/estado', validate(validaciones.cambiarEstado), usuarioController.cambiarEstado);
router.delete('/:id', validate(validaciones.eliminar), usuarioController.eliminar);

module.exports = router;

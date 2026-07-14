const express = require('express');
const { usuarioController, validaciones } = require('../controllers/usuarioController');
const { auth } = require('../middlewares/auth');
const { authorize } = require('../middlewares/role');
const { validate } = require('../middlewares/validate');

const router = express.Router();

router.use(auth);

router.get('/', authorize('admin'), validate(validaciones.listar), usuarioController.listar);
router.get('/:id', authorize('admin'), validate(validaciones.obtener), usuarioController.obtener);
router.post('/', authorize('admin'), validate(validaciones.crear), usuarioController.crear);
router.put('/:id', authorize('admin'), validate(validaciones.actualizar), usuarioController.actualizar);
router.patch('/:id/estado', authorize('admin'), validate(validaciones.cambiarEstado), usuarioController.cambiarEstado);

module.exports = router;

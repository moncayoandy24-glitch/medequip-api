const express = require('express');
const { usuarioController, validaciones } = require('../controllers/usuarioController');
const { authorize } = require('../middlewares/role');
const { validate } = require('../middlewares/validate');

const router = express.Router();

router.get('/', authorize('admin'), validate(validaciones.listar), usuarioController.listar);
router.get('/:id', authorize('admin'), validate(validaciones.obtener), usuarioController.obtener);
router.post('/', authorize('admin'), validate(validaciones.crear), usuarioController.crear);
router.put('/:id', authorize('admin'), validate(validaciones.actualizar), usuarioController.actualizar);
router.delete('/:id', authorize('admin'), validate(validaciones.eliminar), usuarioController.eliminar);

module.exports = router;

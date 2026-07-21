const express = require('express');
const { rolController, validaciones } = require('../controllers/rolController');
const { authorize } = require('../middlewares/role');
const { auth } = require('../middlewares/auth');
const { validate } = require('../middlewares/validate');
const { audit } = require('../middlewares/audit');

const router = express.Router();

router.use(auth, authorize('admin'), audit('roles'));

router.get('/', validate(validaciones.listar), rolController.listar);
router.get('/:id', validate(validaciones.obtener), rolController.obtener);
router.post('/', validate(validaciones.crear), rolController.crear);
router.put('/:id', validate(validaciones.actualizar), rolController.actualizar);
router.patch('/:id/estado', validate(validaciones.cambiarEstado), rolController.cambiarEstado);
router.delete('/:id', validate(validaciones.eliminar), rolController.eliminar);

module.exports = router;

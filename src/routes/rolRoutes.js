const express = require('express');
const { rolController, validaciones } = require('../controllers/rolController');
const { auth } = require('../middlewares/auth');
const { authorize } = require('../middlewares/role');
const { validate } = require('../middlewares/validate');

const router = express.Router();

router.use(auth);

router.get('/', authorize('admin'), validate(validaciones.listar), rolController.listar);
router.get('/:id', authorize('admin'), validate(validaciones.obtener), rolController.obtener);
router.post('/', authorize('admin'), validate(validaciones.crear), rolController.crear);
router.put('/:id', authorize('admin'), validate(validaciones.actualizar), rolController.actualizar);

module.exports = router;

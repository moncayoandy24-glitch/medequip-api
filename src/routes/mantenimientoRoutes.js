const router=require('express').Router();const {mantenimientoController:c,validaciones:v}=require('../controllers/mantenimientoController');
const {auth}=require('../middlewares/auth');const {authorize}=require('../middlewares/role');const {validate}=require('../middlewares/validate');const {audit}=require('../middlewares/audit');
const lectores=['admin','ingeniero_biomedico','tecnico'];router.use(auth,audit('mantenimientos'));
router.get('/proximos',authorize(...lectores),validate(v.dias),c.proximos);router.get('/vencidos',authorize(...lectores),c.vencidos);
router.get('/',authorize(...lectores),validate(v.listar),c.listar);router.get('/:id',authorize(...lectores),validate(v.obtener),c.obtener);
router.post('/',authorize('admin','ingeniero_biomedico','tecnico'),validate(v.crear),c.crear);router.put('/:id',authorize('admin','ingeniero_biomedico','tecnico'),validate(v.actualizar),c.actualizar);
router.patch('/:id/estado',authorize('admin','ingeniero_biomedico','tecnico'),validate(v.estado),c.estado);router.post('/:id/repuestos',authorize('admin','ingeniero_biomedico','tecnico'),validate(v.repuesto),c.agregarRepuesto);
module.exports=router;

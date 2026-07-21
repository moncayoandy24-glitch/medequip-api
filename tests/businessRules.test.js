jest.mock('../src/repositories/mantenimientoRepository',()=>({mantenimientoRepository:{findById:jest.fn(),update:jest.fn(),syncEquipo:jest.fn(),addRepuesto:jest.fn()}}));
jest.mock('../src/repositories/equipoRepository',()=>({equipoRepository:{findById:jest.fn(),setEstado:jest.fn()}}));
jest.mock('../src/repositories/usuarioRepository',()=>({usuarioRepository:{findById:jest.fn()}}));
jest.mock('../src/repositories/movimientoRepository',()=>({movimientoRepository:{findActiveByEquipo:jest.fn(),create:jest.fn(),findById:jest.fn(),devolver:jest.fn()}}));
jest.mock('../src/repositories/ubicacionRepository',()=>({ubicacionRepository:{findById:jest.fn()}}));
jest.mock('../src/repositories/fallaRepository',()=>({fallaRepository:{findById:jest.fn(),update:jest.fn()}}));
jest.mock('../src/repositories/notificacionRepository',()=>({notificacionRepository:{createForRoles:jest.fn()}}));
jest.mock('../src/repositories/repuestoRepository',()=>({repuestoRepository:{findById:jest.fn(),changeStock:jest.fn(),setStock:jest.fn()}}));
jest.mock('../src/repositories/proveedorRepository',()=>({proveedorRepository:{findById:jest.fn()}}));

const {mantenimientoRepository}=require('../src/repositories/mantenimientoRepository');
const {equipoRepository}=require('../src/repositories/equipoRepository');
const {usuarioRepository}=require('../src/repositories/usuarioRepository');
const {movimientoRepository}=require('../src/repositories/movimientoRepository');
const {ubicacionRepository}=require('../src/repositories/ubicacionRepository');
const {fallaRepository}=require('../src/repositories/fallaRepository');
const {repuestoRepository}=require('../src/repositories/repuestoRepository');
const {mantenimientoService}=require('../src/services/mantenimientoService');
const {movimientoService}=require('../src/services/movimientoService');
const {fallaService}=require('../src/services/fallaService');
const {repuestoService}=require('../src/services/repuestoService');
const {Mantenimiento,Equipo,Ubicacion,Usuario,ReporteFalla,Repuesto}=require('../src/entities');

beforeEach(()=>jest.clearAllMocks());

test('no completa un mantenimiento sin resultado y fecha',async()=>{
 mantenimientoRepository.findById.mockResolvedValue(new Mantenimiento({id:'m1',equipo_id:'e1',estado:'en_proceso'}));
 await expect(mantenimientoService.cambiarEstado('m1',{estado:'completado'})).rejects.toMatchObject({statusCode:422});
 expect(mantenimientoRepository.update).not.toHaveBeenCalled();
});

test('al completar mantenimiento actualiza las fechas y estado del equipo',async()=>{
 mantenimientoRepository.findById.mockResolvedValueOnce(new Mantenimiento({id:'m1',equipo_id:'e1',estado:'en_proceso'})).mockResolvedValueOnce(new Mantenimiento({id:'m1',estado:'completado'}));
 mantenimientoRepository.update.mockResolvedValue({id:'m1'});
 await mantenimientoService.cambiarEstado('m1',{estado:'completado',resultado:'Conforme',fecha_realizacion:'2026-07-17',proxima_fecha_mantenimiento:'2027-01-17'});
 expect(mantenimientoRepository.syncEquipo).toHaveBeenCalledWith('e1',{estado:'operativo',fechaRealizacion:'2026-07-17',proximaFecha:'2027-01-17'});
});

test('impide prestar un equipo fuera de servicio',async()=>{
 equipoRepository.findById.mockResolvedValue(new Equipo({id:'e1',activo:true,estado:'fuera_de_servicio'}));
 await expect(movimientoService.crear({equipo_id:'e1',tipo:'prestamo',ubicacion_destino_id:'u2'},'user')).rejects.toMatchObject({statusCode:409});
 expect(movimientoRepository.create).not.toHaveBeenCalled();
});

test('exige fecha de devolución para un préstamo',async()=>{
 equipoRepository.findById.mockResolvedValue(new Equipo({id:'e1',activo:true,estado:'operativo',ubicacion_id:'u1'}));
 movimientoRepository.findActiveByEquipo.mockResolvedValue(null);
 ubicacionRepository.findById.mockResolvedValue(new Ubicacion({id:'u2',activo:true}));
 await expect(movimientoService.crear({equipo_id:'e1',tipo:'prestamo',ubicacion_destino_id:'u2'},'user')).rejects.toMatchObject({statusCode:422});
});

test('solo permite asignar fallas a personal técnico',async()=>{
 fallaRepository.findById.mockResolvedValue(new ReporteFalla({id:'f1',estado:'reportada'}));
 usuarioRepository.findById.mockResolvedValue(new Usuario({id:'u1',activo:true,roles:['usuario_clinico']}));
 await expect(fallaService.asignar('f1','u1')).rejects.toMatchObject({statusCode:400});
});

test('cerrar una falla registra solución y restablece el equipo',async()=>{
 fallaRepository.findById.mockResolvedValue(new ReporteFalla({id:'f1',equipo_id:'e1',estado:'resuelta'}));
 fallaRepository.update.mockResolvedValue({id:'f1',estado:'cerrada'});
 await fallaService.cerrar('f1',{solucion:'Reparado'});
 expect(fallaRepository.update).toHaveBeenCalledWith('f1',expect.objectContaining({estado:'cerrada',solucion:'Reparado'}));
 expect(equipoRepository.setEstado).toHaveBeenCalledWith('e1','operativo');
});

test('no permite una salida de inventario sin stock',async()=>{
 repuestoRepository.findById.mockResolvedValue(new Repuesto({id:'r1',activo:true,cantidad_disponible:1}));
 repuestoRepository.changeStock.mockResolvedValue(null);
 await expect(repuestoService.actualizarStock('r1',{tipo:'salida',cantidad:2})).rejects.toMatchObject({statusCode:409});
});

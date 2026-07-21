const {
  Usuario, Equipo, Repuesto, Mantenimiento, MantenimientoRepuesto,
  ReporteFalla, MovimientoEquipo, Calibracion,
} = require('../src/entities');

describe('Entidades de dominio', () => {
  test('Usuario protege el hash de contraseña al serializar', () => {
    const usuario = new Usuario({ id: 'u1', email: 'test@test.com', password_hash: 'secreto', activo: true, roles: ['admin'] });
    expect(usuario.tieneRol('admin')).toBe(true);
    expect(usuario.toJSON()).not.toHaveProperty('password_hash');
    expect(usuario.password_hash).toBe('secreto');
  });

  test('Equipo determina si puede prestarse', () => {
    expect(new Equipo({ activo: true, estado: 'operativo' }).puedePrestarse()).toBe(true);
    expect(new Equipo({ activo: true, estado: 'en_reparacion' }).puedePrestarse()).toBe(false);
    expect(new Equipo({ activo: false, estado: 'disponible' }).estaDadoDeBaja()).toBe(true);
  });

  test('Repuesto controla stock y mínimo', () => {
    const repuesto = new Repuesto({ activo: true, cantidad_disponible: 2, stock_minimo: 2 });
    expect(repuesto.tieneStock(2)).toBe(true);
    expect(repuesto.tieneStock(3)).toBe(false);
    expect(repuesto.estaBajoStock()).toBe(true);
  });

  test('Mantenimiento exige datos para completarse', () => {
    const mantenimiento = new Mantenimiento({ estado: 'en_proceso' });
    expect(mantenimiento.puedeCompletarse({ resultado: 'Conforme', fecha_realizacion: '2026-07-17' })).toBe(true);
    expect(mantenimiento.puedeCompletarse({ resultado: '' })).toBe(false);
  });

  test('MantenimientoRepuesto calcula su subtotal', () => {
    expect(new MantenimientoRepuesto({ cantidad: 3, precio_unitario: '12.50' }).subtotal()).toBe(37.5);
  });

  test('ReporteFalla reconoce criticidad y cierre', () => {
    const falla = new ReporteFalla({ prioridad: 'critica', estado: 'resuelta' });
    expect(falla.esCritica()).toBe(true);
    expect(falla.puedeCerrarse('Reparación terminada')).toBe(true);
  });

  test('MovimientoEquipo detecta un préstamo vencido', () => {
    const movimiento = new MovimientoEquipo({ tipo: 'prestamo', estado: 'activo', fecha_prevista_devolucion: '2020-01-01' });
    expect(movimiento.estaVencido(new Date('2026-01-01'))).toBe(true);
  });

  test('Calibracion determina vigencia por fecha', () => {
    const calibracion = new Calibracion({ estado: 'vigente', proxima_fecha: '2025-01-01' });
    expect(calibracion.estaVencida(new Date('2026-01-01'))).toBe(true);
  });
});

const { repuestoRepository } = require('../repositories/repuestoRepository');
const { proveedorRepository } = require('../repositories/proveedorRepository');
const { AppError } = require('../utils/appError');

const repuestoService = {
  obtenerTodos: (filters) => repuestoRepository.findAll(filters),
  obtenerBajoStock: () => repuestoRepository.findLowStock(),
  async obtenerPorId(id) {
    const row = await repuestoRepository.findById(id);
    if (!row) throw new AppError('Repuesto no encontrado', 404);
    return row;
  },
  async validar(data, actual) {
    if (data.codigo && (!actual || data.codigo.toLowerCase() !== actual.codigo.toLowerCase()) && await repuestoRepository.findByCode(data.codigo)) {
      throw new AppError('El código del repuesto ya está registrado', 409);
    }
    if (data.proveedor_id) {
      const proveedor = await proveedorRepository.findById(data.proveedor_id);
      if (!proveedor?.activo) throw new AppError('Proveedor no válido', 400);
    }
  },
  async crear(data) { await this.validar(data); return repuestoRepository.create(data); },
  async actualizar(id, data) { const actual = await this.obtenerPorId(id); await this.validar(data, actual); return repuestoRepository.update(id, data); },
  async actualizarStock(id, { tipo, cantidad }) {
    const actual = await this.obtenerPorId(id);
    if (tipo === 'salida' && !actual.tieneStock(cantidad)) throw new AppError('Stock insuficiente', 409);
    const result = tipo === 'ajuste'
      ? await repuestoRepository.setStock(id, cantidad)
      : await repuestoRepository.changeStock(id, tipo === 'entrada' ? cantidad : -cantidad);
    if (!result) throw new AppError('Stock insuficiente', 409);
    return result;
  },
  async cambiarEstado(id, activo) { await this.obtenerPorId(id); return repuestoRepository.setActive(id, activo); },
};
module.exports = { repuestoService };

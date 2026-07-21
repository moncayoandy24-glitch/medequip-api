CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE IF NOT EXISTS roles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  nombre VARCHAR(50) UNIQUE NOT NULL,
  descripcion VARCHAR(255),
  activo BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);
ALTER TABLE roles ADD COLUMN IF NOT EXISTS activo BOOLEAN NOT NULL DEFAULT TRUE;

CREATE TABLE IF NOT EXISTS usuarios (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  nombre VARCHAR(100) NOT NULL,
  apellido VARCHAR(100),
  email VARCHAR(150) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  telefono VARCHAR(30),
  cargo VARCHAR(100),
  activo BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);
ALTER TABLE usuarios ADD COLUMN IF NOT EXISTS apellido VARCHAR(100);
ALTER TABLE usuarios ADD COLUMN IF NOT EXISTS telefono VARCHAR(30);
ALTER TABLE usuarios ADD COLUMN IF NOT EXISTS cargo VARCHAR(100);

CREATE TABLE IF NOT EXISTS usuario_roles (
  usuario_id UUID REFERENCES usuarios(id) ON DELETE CASCADE,
  rol_id UUID REFERENCES roles(id) ON DELETE RESTRICT,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (usuario_id, rol_id)
);

CREATE TABLE IF NOT EXISTS categorias_equipos (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  nombre VARCHAR(100) UNIQUE NOT NULL,
  descripcion TEXT,
  activo BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS ubicaciones (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  nombre VARCHAR(120) UNIQUE NOT NULL,
  piso VARCHAR(30),
  numero_habitacion VARCHAR(30),
  responsable VARCHAR(150),
  descripcion TEXT,
  activo BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS proveedores (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  nombre VARCHAR(150) NOT NULL,
  ruc VARCHAR(30) UNIQUE,
  email VARCHAR(150),
  telefono VARCHAR(30),
  direccion TEXT,
  persona_contacto VARCHAR(150),
  activo BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS equipos (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  codigo_interno VARCHAR(50) UNIQUE NOT NULL,
  nombre VARCHAR(150) NOT NULL,
  tipo_equipo VARCHAR(100),
  marca VARCHAR(100),
  modelo VARCHAR(100),
  numero_serie VARCHAR(120) UNIQUE NOT NULL,
  fabricante VARCHAR(150),
  fecha_adquisicion DATE,
  precio_adquisicion NUMERIC(14,2) CHECK (precio_adquisicion IS NULL OR precio_adquisicion >= 0),
  vida_util_estimada INTEGER CHECK (vida_util_estimada IS NULL OR vida_util_estimada >= 0),
  estado VARCHAR(30) NOT NULL DEFAULT 'disponible' CHECK (estado IN ('operativo','en_mantenimiento','fuera_de_servicio','dado_de_baja','en_reparacion','disponible','prestado')),
  categoria_id UUID REFERENCES categorias_equipos(id) ON DELETE RESTRICT,
  ubicacion_id UUID REFERENCES ubicaciones(id) ON DELETE RESTRICT,
  proveedor_id UUID REFERENCES proveedores(id) ON DELETE SET NULL,
  servicio_hospitalario VARCHAR(120),
  nivel_riesgo VARCHAR(20) NOT NULL DEFAULT 'bajo' CHECK (nivel_riesgo IN ('bajo','medio','alto','critico')),
  fecha_ultimo_mantenimiento DATE,
  fecha_proximo_mantenimiento DATE,
  observaciones TEXT,
  imagen_url TEXT,
  activo BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS repuestos (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  nombre VARCHAR(150) NOT NULL,
  codigo VARCHAR(60) UNIQUE NOT NULL,
  descripcion TEXT,
  cantidad_disponible INTEGER NOT NULL DEFAULT 0 CHECK (cantidad_disponible >= 0),
  stock_minimo INTEGER NOT NULL DEFAULT 0 CHECK (stock_minimo >= 0),
  precio NUMERIC(14,2) NOT NULL DEFAULT 0 CHECK (precio >= 0),
  proveedor_id UUID REFERENCES proveedores(id) ON DELETE SET NULL,
  activo BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS mantenimientos (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  equipo_id UUID NOT NULL REFERENCES equipos(id) ON DELETE RESTRICT,
  tipo VARCHAR(30) NOT NULL CHECK (tipo IN ('preventivo','correctivo','predictivo','calibracion','inspeccion','instalacion')),
  fecha_programada DATE NOT NULL,
  fecha_realizacion DATE,
  tecnico_id UUID REFERENCES usuarios(id) ON DELETE SET NULL,
  descripcion_trabajo TEXT,
  diagnostico TEXT,
  actividades_realizadas TEXT,
  costo NUMERIC(14,2) NOT NULL DEFAULT 0 CHECK (costo >= 0),
  resultado TEXT,
  estado VARCHAR(20) NOT NULL DEFAULT 'programado' CHECK (estado IN ('programado','en_proceso','completado','cancelado','pendiente')),
  proxima_fecha_mantenimiento DATE,
  observaciones TEXT,
  created_by UUID REFERENCES usuarios(id) ON DELETE SET NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE IF NOT EXISTS mantenimiento_repuestos (
  mantenimiento_id UUID REFERENCES mantenimientos(id) ON DELETE CASCADE,
  repuesto_id UUID REFERENCES repuestos(id) ON DELETE RESTRICT,
  cantidad INTEGER NOT NULL CHECK (cantidad > 0),
  precio_unitario NUMERIC(14,2) NOT NULL CHECK (precio_unitario >= 0),
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (mantenimiento_id, repuesto_id)
);

CREATE TABLE IF NOT EXISTS calibraciones (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  equipo_id UUID NOT NULL REFERENCES equipos(id) ON DELETE RESTRICT,
  fecha DATE NOT NULL,
  tecnico_id UUID REFERENCES usuarios(id) ON DELETE SET NULL,
  empresa VARCHAR(150),
  certificado_url TEXT,
  resultado VARCHAR(30) NOT NULL CHECK (resultado IN ('aprobado','rechazado','condicional')),
  parametros_evaluados TEXT,
  proxima_fecha DATE,
  estado VARCHAR(20) NOT NULL DEFAULT 'vigente' CHECK (estado IN ('vigente','vencida','cancelada')),
  observaciones TEXT,
  created_by UUID REFERENCES usuarios(id) ON DELETE SET NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS reportes_fallas (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  equipo_id UUID NOT NULL REFERENCES equipos(id) ON DELETE RESTRICT,
  reportado_por UUID NOT NULL REFERENCES usuarios(id) ON DELETE RESTRICT,
  descripcion TEXT NOT NULL,
  prioridad VARCHAR(20) NOT NULL DEFAULT 'media' CHECK (prioridad IN ('baja','media','alta','critica')),
  evidencia_url TEXT,
  estado VARCHAR(25) NOT NULL DEFAULT 'reportada' CHECK (estado IN ('reportada','revisada','en_reparacion','resuelta','cerrada','rechazada')),
  tecnico_asignado_id UUID REFERENCES usuarios(id) ON DELETE SET NULL,
  solucion TEXT,
  fecha_cierre TIMESTAMP,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS movimientos_equipos (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  equipo_id UUID NOT NULL REFERENCES equipos(id) ON DELETE RESTRICT,
  tipo VARCHAR(20) NOT NULL CHECK (tipo IN ('traslado','prestamo')),
  ubicacion_origen_id UUID REFERENCES ubicaciones(id) ON DELETE SET NULL,
  ubicacion_destino_id UUID NOT NULL REFERENCES ubicaciones(id) ON DELETE RESTRICT,
  responsable_entrega_id UUID REFERENCES usuarios(id) ON DELETE SET NULL,
  responsable_recibe_id UUID REFERENCES usuarios(id) ON DELETE SET NULL,
  fecha_salida TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  fecha_prevista_devolucion TIMESTAMP,
  fecha_real_devolucion TIMESTAMP,
  motivo TEXT NOT NULL,
  estado VARCHAR(20) NOT NULL DEFAULT 'activo' CHECK (estado IN ('activo','devuelto','completado','cancelado')),
  observaciones TEXT,
  estado_equipo_anterior VARCHAR(30),
  created_by UUID REFERENCES usuarios(id) ON DELETE SET NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);
ALTER TABLE movimientos_equipos ADD COLUMN IF NOT EXISTS estado_equipo_anterior VARCHAR(30);
ALTER TABLE movimientos_equipos DROP CONSTRAINT IF EXISTS movimientos_equipos_estado_check;
ALTER TABLE movimientos_equipos ADD CONSTRAINT movimientos_equipos_estado_check CHECK (estado IN ('activo','devuelto','completado','cancelado'));

CREATE TABLE IF NOT EXISTS auditorias (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  usuario_id UUID REFERENCES usuarios(id) ON DELETE SET NULL,
  accion VARCHAR(50) NOT NULL,
  modulo VARCHAR(60) NOT NULL,
  registro_id UUID,
  datos_anteriores JSONB,
  datos_nuevos JSONB,
  ip VARCHAR(64),
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS notificaciones (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  usuario_id UUID REFERENCES usuarios(id) ON DELETE CASCADE,
  tipo VARCHAR(60) NOT NULL,
  titulo VARCHAR(180) NOT NULL,
  mensaje TEXT NOT NULL,
  referencia_id UUID,
  leida BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_equipos_estado ON equipos(estado);
CREATE INDEX IF NOT EXISTS idx_equipos_categoria ON equipos(categoria_id);
CREATE INDEX IF NOT EXISTS idx_equipos_ubicacion ON equipos(ubicacion_id);
CREATE INDEX IF NOT EXISTS idx_equipos_riesgo ON equipos(nivel_riesgo);
CREATE INDEX IF NOT EXISTS idx_mantenimientos_equipo ON mantenimientos(equipo_id);
CREATE INDEX IF NOT EXISTS idx_mantenimientos_fechas ON mantenimientos(fecha_programada, estado);
CREATE INDEX IF NOT EXISTS idx_calibraciones_equipo ON calibraciones(equipo_id);
CREATE INDEX IF NOT EXISTS idx_calibraciones_proxima ON calibraciones(proxima_fecha, estado);
CREATE INDEX IF NOT EXISTS idx_fallas_equipo ON reportes_fallas(equipo_id);
CREATE INDEX IF NOT EXISTS idx_fallas_estado_prioridad ON reportes_fallas(estado, prioridad);
CREATE INDEX IF NOT EXISTS idx_movimientos_equipo ON movimientos_equipos(equipo_id);
CREATE INDEX IF NOT EXISTS idx_auditorias_modulo_registro ON auditorias(modulo, registro_id);
CREATE INDEX IF NOT EXISTS idx_notificaciones_usuario ON notificaciones(usuario_id, leida);

CREATE OR REPLACE FUNCTION actualizar_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_roles_updated_at ON roles;
CREATE TRIGGER trg_roles_updated_at BEFORE UPDATE ON roles FOR EACH ROW EXECUTE FUNCTION actualizar_updated_at();
DROP TRIGGER IF EXISTS trg_usuarios_updated_at ON usuarios;
CREATE TRIGGER trg_usuarios_updated_at BEFORE UPDATE ON usuarios FOR EACH ROW EXECUTE FUNCTION actualizar_updated_at();
DROP TRIGGER IF EXISTS trg_categorias_updated_at ON categorias_equipos;
CREATE TRIGGER trg_categorias_updated_at BEFORE UPDATE ON categorias_equipos FOR EACH ROW EXECUTE FUNCTION actualizar_updated_at();
DROP TRIGGER IF EXISTS trg_ubicaciones_updated_at ON ubicaciones;
CREATE TRIGGER trg_ubicaciones_updated_at BEFORE UPDATE ON ubicaciones FOR EACH ROW EXECUTE FUNCTION actualizar_updated_at();
DROP TRIGGER IF EXISTS trg_proveedores_updated_at ON proveedores;
CREATE TRIGGER trg_proveedores_updated_at BEFORE UPDATE ON proveedores FOR EACH ROW EXECUTE FUNCTION actualizar_updated_at();
DROP TRIGGER IF EXISTS trg_equipos_updated_at ON equipos;
CREATE TRIGGER trg_equipos_updated_at BEFORE UPDATE ON equipos FOR EACH ROW EXECUTE FUNCTION actualizar_updated_at();
DROP TRIGGER IF EXISTS trg_repuestos_updated_at ON repuestos;
CREATE TRIGGER trg_repuestos_updated_at BEFORE UPDATE ON repuestos FOR EACH ROW EXECUTE FUNCTION actualizar_updated_at();
DROP TRIGGER IF EXISTS trg_mantenimientos_updated_at ON mantenimientos;
CREATE TRIGGER trg_mantenimientos_updated_at BEFORE UPDATE ON mantenimientos FOR EACH ROW EXECUTE FUNCTION actualizar_updated_at();
DROP TRIGGER IF EXISTS trg_calibraciones_updated_at ON calibraciones;
CREATE TRIGGER trg_calibraciones_updated_at BEFORE UPDATE ON calibraciones FOR EACH ROW EXECUTE FUNCTION actualizar_updated_at();
DROP TRIGGER IF EXISTS trg_fallas_updated_at ON reportes_fallas;
CREATE TRIGGER trg_fallas_updated_at BEFORE UPDATE ON reportes_fallas FOR EACH ROW EXECUTE FUNCTION actualizar_updated_at();
DROP TRIGGER IF EXISTS trg_movimientos_updated_at ON movimientos_equipos;
CREATE TRIGGER trg_movimientos_updated_at BEFORE UPDATE ON movimientos_equipos FOR EACH ROW EXECUTE FUNCTION actualizar_updated_at();

INSERT INTO roles (nombre, descripcion) VALUES
  ('admin', 'Acceso total al sistema'),
  ('ingeniero_biomedico', 'Gestión técnica de equipos'),
  ('tecnico', 'Consulta y mantenimiento de equipos'),
  ('usuario_clinico', 'Consulta de equipos y reporte de fallas')
ON CONFLICT (nombre) DO NOTHING;

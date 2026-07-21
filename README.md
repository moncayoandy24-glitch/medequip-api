# MedEquip API

API REST para la gestión de equipos médicos, construida con Node.js, Express y PostgreSQL.

## Requisitos

- Node.js 18 o superior
- PostgreSQL

## Instalación

```bash
npm install
```

1. Copia `.env.example` como `.env` y configura la conexión.
2. Ejecuta `database/init.sql` en PostgreSQL. El script puede ejecutarse nuevamente y crea los roles iniciales.
3. Inicia el servidor:

```bash
npm run dev
```

La API usa `/health` como comprobación de disponibilidad y `/api-docs` para Swagger.
El documento OpenAPI en JSON está disponible en `/api-docs.json`.

## Arquitectura y entidades

La API conserva PostgreSQL mediante `pg` y organiza el código en capas:

```text
Ruta → Middleware → Controlador → Servicio → Repositorio → PostgreSQL
                                      ↓
                                  Entidades
```

`src/entities` contiene las entidades de dominio correspondientes a las tablas. Estas clases declaran explícitamente sus atributos, constantes de estados y comportamientos como `Equipo.puedePrestarse()`, `Mantenimiento.puedeCompletarse()` y `Repuesto.tieneStock()`.

Los repositorios convierten las filas de PostgreSQL en entidades. Se mantienen los nombres `snake_case` para preservar los contratos JSON y las consultas existentes. Las entidades no sustituyen a `pg` ni crean tablas; la persistencia continúa definida en `database/init.sql`.

```text
src/entities/
├── Usuario.js
├── Rol.js
├── Equipo.js
├── Mantenimiento.js
├── Calibracion.js
├── Repuesto.js
├── ReporteFalla.js
├── MovimientoEquipo.js
└── ...
```

## Variables de entorno

| Variable | Descripción |
|---|---|
| `PORT` | Puerto de la API |
| `DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASSWORD`, `DB_NAME` | Conexión PostgreSQL |
| `DATABASE_URL` | URL completa de PostgreSQL; tiene prioridad sobre las variables separadas |
| `DB_SSL` | Usa SSL cuando su valor es `true` |
| `JWT_SECRET` | Secreto para firmar tokens; debe cambiarse en cada entorno |
| `JWT_EXPIRES_IN` | Duración del token, por ejemplo `24h` |
| `NODE_ENV` | `development`, `test` o `production` |
| `CORS_ORIGIN` | Origen permitido para el frontend |

## Autenticación

```text
POST /api/auth/register
POST /api/auth/registro       # alias compatible
POST /api/auth/login
GET  /api/auth/profile
POST /api/auth/change-password
```

Las rutas protegidas requieren:

```text
Authorization: Bearer <token>
```

El registro público asigna únicamente el rol `usuario_clinico`. Los roles privilegiados solo pueden asignarse desde el módulo administrativo de usuarios.

## Usuarios y roles

```text
GET    /api/usuarios
GET    /api/usuarios/:id
POST   /api/usuarios
PUT    /api/usuarios/:id
PATCH  /api/usuarios/:id/estado
DELETE /api/usuarios/:id             # baja lógica

GET    /api/roles
GET    /api/roles/:id
POST   /api/roles
PUT    /api/roles/:id
PATCH  /api/roles/:id/estado
DELETE /api/roles/:id                # baja lógica
```

## Equipos, categorías, ubicaciones y proveedores

```text
GET    /api/equipos
GET    /api/equipos/:id
POST   /api/equipos
PUT    /api/equipos/:id
PATCH  /api/equipos/:id/estado
DELETE /api/equipos/:id              # baja lógica y estado dado_de_baja

GET|POST /api/categorias
GET|PUT  /api/categorias/:id
PATCH    /api/categorias/:id/estado

GET|POST /api/ubicaciones
GET|PUT  /api/ubicaciones/:id
PATCH    /api/ubicaciones/:id/estado

GET|POST /api/proveedores
GET|PUT  /api/proveedores/:id
PATCH    /api/proveedores/:id/estado
GET      /api/proveedores/:id/equipos
```

### Consulta de equipos

`GET /api/equipos` acepta:

- `page`, `limit`
- `search`
- `estado`, `riesgo`, `tipo`
- `categoria`, `ubicacion`
- `codigo`, `numero_serie`
- `sort=nombre|codigo|estado|riesgo|created_at`
- `order=asc|desc`
- `activo=true|false`

Ejemplo:

```text
GET /api/equipos?estado=operativo&riesgo=alto&search=monitor&page=1&limit=10
```

## Mantenimientos, calibraciones y repuestos

```text
GET|POST /api/mantenimientos
GET|PUT  /api/mantenimientos/:id
PATCH    /api/mantenimientos/:id/estado
POST     /api/mantenimientos/:id/repuestos
GET      /api/mantenimientos/proximos
GET      /api/mantenimientos/vencidos
GET      /api/equipos/:id/mantenimientos

GET|POST /api/calibraciones
GET|PUT  /api/calibraciones/:id
GET      /api/calibraciones/proximas
GET      /api/calibraciones/vencidas

GET|POST /api/repuestos
GET|PUT  /api/repuestos/:id
PATCH    /api/repuestos/:id/stock
GET      /api/repuestos/bajo-stock
```

El consumo de repuestos se ejecuta en una transacción: descuenta inventario, registra la relación con el mantenimiento y suma el costo. No se permite completar un mantenimiento sin resultado y fecha de realización.

## Fallas y movimientos

```text
GET|POST /api/fallas
GET|PUT  /api/fallas/:id
PATCH    /api/fallas/:id/asignar
PATCH    /api/fallas/:id/prioridad
PATCH    /api/fallas/:id/estado
PATCH    /api/fallas/:id/cerrar

GET|POST /api/movimientos
GET      /api/movimientos/prestados
PATCH    /api/movimientos/:id/devolver
GET      /api/equipos/:id/movimientos
```

No se puede prestar un equipo fuera de servicio, en mantenimiento, en reparación o dado de baja.

## Dashboard, auditoría y notificaciones

```text
GET /api/dashboard/resumen
GET /api/dashboard/equipos-por-estado
GET /api/dashboard/equipos-por-area
GET /api/dashboard/equipos-por-categoria
GET /api/dashboard/equipos-por-riesgo
GET /api/dashboard/fallas
GET /api/dashboard/mantenimientos
GET /api/dashboard/costos
GET /api/auditorias
GET /api/notificaciones
PATCH /api/notificaciones/:id/leida
```

Las operaciones de escritura se registran automáticamente en auditoría. Las notificaciones internas cubren fallas críticas, mantenimientos y calibraciones próximas o vencidas, bajo stock y préstamos vencidos.

## Roles iniciales

- `admin`
- `ingeniero_biomedico`
- `tecnico`
- `usuario_clinico`

Para crear el primer administrador, registra un usuario y asigna el rol `admin` directamente en PostgreSQL durante la configuración inicial. Después, la administración se realiza mediante la API protegida.

## Respuestas

Las respuestas siguen la estructura:

```json
{
  "success": true,
  "message": "Operación completada correctamente",
  "data": {}
}
```

Las listas incluyen `pagination`. Los errores incluyen `success: false`, `message` y `errors`.

## Pruebas

```bash
npm test
```

La colección de Postman está en `docs/postman/MedEquip_API.postman_collection.json`.

## Despliegue en Render

El archivo `render.yaml` contiene la configuración base. En Render se deben definir `DATABASE_URL` y `CORS_ORIGIN`; `JWT_SECRET` se genera de forma segura. Después del despliegue, ejecuta `database/init.sql` sobre la base PostgreSQL administrada.

## Base de datos

`database/init.sql` crea las tablas de los cuatro integrantes:

- `roles`, `usuarios`, `usuario_roles`
- `categorias_equipos`, `ubicaciones`, `proveedores`, `equipos`
- `mantenimientos`, `calibraciones`, `repuestos`, `mantenimiento_repuestos`
- `reportes_fallas`, `movimientos_equipos`, `auditorias`, `notificaciones`

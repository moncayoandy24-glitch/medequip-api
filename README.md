# medequip-api

API REST para **Medequip**.

## Stack
- Node.js + Express.js (JavaScript)
- PostgreSQL (`pg`)
- JWT (JSON Web Token)
- bcrypt (hash de contraseñas)
- Roles/Permisos
- express-validator
- Swagger (swagger-jsdoc + swagger-ui-express)
- Jest + Supertest

## Endpoints
- `GET /health` — health check
- `POST /api/auth/registro` — registrar usuario
- `POST /api/auth/login` — login (devuelve token JWT)
- `GET/POST/PUT/DELETE /api/usuarios` — CRUD (requiere rol `admin`)
- `GET/POST/PUT/DELETE /api/roles` — CRUD (requiere rol `admin`)

## Documentación Swagger
- Swagger UI: `GET /api-docs`

## Requisitos
- Node.js 18+ recomendado
- PostgreSQL

## Variables de entorno
Crea un archivo `.env` basado en `.env.example`.

Variables usadas por el proyecto:
- `PORT`
- `NODE_ENV`
- `JWT_SECRET`
- `DB_HOST`
- `DB_PORT`
- `DB_USER`
- `DB_PASSWORD`
- `DB_NAME`

## Desarrollo local
```bash
npm install
npm run dev
```

## Tests
```bash
npm test
```

## Migraciones / Inicialización de base de datos
El script se encuentra en:
- `database/init.sql`

Ejecuta ese SQL contra tu PostgreSQL (idealmente con `psql` o pgAdmin) para crear:
- `roles`
- `usuarios`
- `usuario_roles`

## Despliegue (GitHub + Render)
### 1) GitHub
- Sube el repo a GitHub.

### 2) Render (Web Service)
En Render crea un **Web Service** apuntando al repo.
- Build command: `npm install`
- Start command: `npm run start`

### 3) PostgreSQL en la nube (Render / Neon / Supabase)
- Crea una base de datos PostgreSQL gestionada.
- Configura sus credenciales en Render (como variables de entorno):
  - `DB_HOST`
  - `DB_PORT`
  - `DB_USER`
  - `DB_PASSWORD`
  - `DB_NAME`

### 4) Variables de entorno en Render
Configura también:
- `JWT_SECRET`
- `NODE_ENV=production` (recomendado)
- `PORT` (si aplica)

> Nota: `pg` usa `DB_HOST/DB_PORT/DB_USER/DB_PASSWORD/DB_NAME`.

## Manejo de errores
El proyecto incluye `src/middlewares/errorHandler.js` para respuestas consistentes.

## Autenticación y Seguridad
- El cliente debe enviar el JWT en header:
  - `Authorization: Bearer <token>`
- Los endpoints de usuarios/roles requieren rol `admin` mediante middleware de autorización.


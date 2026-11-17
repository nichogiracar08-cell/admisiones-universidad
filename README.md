# Admisiones Universidad — API REST con Node.js, Express y MongoDB

Página de admisiones universitarias con backend en **Node.js + Express**, base de datos **MongoDB** (con **Mongoose**) y un frontend sencillo en HTML/CSS/JS que consume la API.

## Estructura (patrón MVC)

```
admisiones-universidad/
├── .env                      # Variables de entorno (puerto y conexión a Mongo)
├── package.json
├── pruebas.http              # Peticiones de prueba (extensión REST Client)
├── public/                   # Frontend: la página de admisiones
│   ├── login.html            # Inicio de sesión / registro
│   ├── index.html            # Panel de admisiones (protegido)
│   ├── styles.css
│   └── app.js                # fetch() a la API
└── src/
    ├── server.js             # Punto de entrada: conecta a Mongo y levanta el servidor
    ├── app.js                # Configuración de Express, middlewares y rutas
    ├── config/db.js          # Conexión a MongoDB
    ├── models/               # Esquemas de Mongoose
    │   ├── Facultad.js
    │   ├── Programa.js       # → pertenece a una Facultad
    │   ├── Estudiante.js     # → se inscribe en un Programa
    │   ├── Usuario.js        # usuarios del login
    │   └── Sesion.js         # sesiones activas / historial
    ├── controllers/          # Lógica de cada recurso (CRUD)
    ├── routes/               # Definición de endpoints
    ├── middlewares/          # errores.js (manejo de errores) y auth.js (protege rutas con JWT)
    ├── seed.js               # Datos de ejemplo
    └── memoria.js            # Arranque con Mongo en memoria (sin instalar Mongo)
```

## Tablas (colecciones) de la base de datos

| Colección | Para qué sirve |
|---|---|
| `facultades` | Facultades de la universidad |
| `programas` | Programas académicos (cada uno pertenece a una facultad) |
| `estudiantes` | **Tabla adicional del proyecto**: aspirantes inscritos y su estado de admisión |
| `usuarios` | **Autenticación**: usuarios del sistema (contraseña encriptada con bcrypt, rol admin/asesor) |
| `sesiones` | **Autenticación**: registro de cada inicio de sesión (IP, navegador, expiración). El logout la cierra e invalida el token |

```
Facultad 1 ──── N Programa 1 ──── N Estudiante
Usuario  1 ──── N Sesion
```

## Inicio de sesión

- La página `/login.html` permite **iniciar sesión** y **registrarse**.
- Al ingresar, el servidor genera un **token JWT** (8 h) y guarda la sesión en `sesiones`.
- El frontend guarda el token y lo envía en cada petición (`Authorization: Bearer <token>`).
- Todas las rutas de la API (excepto login/registro) están protegidas. Sin token → 401 y vuelve al login.
- **Roles**: `admin` puede crear/eliminar facultades, programas y estudiantes; `asesor` inscribe estudiantes y cambia su estado.

**Usuarios de prueba** (los crea el seed):

| Rol | Email | Contraseña |
|---|---|---|
| admin | admin@universidad.edu | Admin123* |
| asesor | asesor@universidad.edu | Asesor123* |

## Cómo ejecutarlo

```bash
npm install
```

**Opción A — sin tener MongoDB instalado (datos de ejemplo en memoria):**
```bash
npm run dev:memoria
```

**Opción B — con MongoDB local o Atlas:** configura `MONGO_URI` en `.env` y:
```bash
npm run seed     # carga datos de ejemplo (opcional)
npm run dev      # servidor con recarga automática
```

Abre **http://localhost:3000** → te lleva al login. La API está en **http://localhost:3000/api**.
Para probar la API desde VS Code instala la extensión **REST Client** y abre `pruebas.http` (ejecuta primero el login).

## Endpoints

| Método | Ruta | Descripción |
|---|---|---|
| POST | `/api/auth/registro` | Crea usuario (rol asesor) y devuelve token |
| POST | `/api/auth/login` | Inicia sesión, devuelve token |
| POST | `/api/auth/logout` | Cierra la sesión (el token deja de servir) |
| GET | `/api/auth/perfil` | Datos del usuario logueado |
| GET | `/api/auth/sesiones` | Historial de sesiones del usuario |
| GET | `/api/facultades` | Lista facultades (con sus programas) |
| GET | `/api/facultades/:id` | Detalle de una facultad |
| POST | `/api/facultades` | Crea facultad |
| PUT | `/api/facultades/:id` | Actualiza facultad |
| DELETE | `/api/facultades/:id` | Elimina (si no tiene programas) |
| GET | `/api/programas?facultad=&nivel=&modalidad=&activo=` | Lista programas con filtros |
| GET | `/api/programas/:id` | Detalle + número de inscritos |
| POST | `/api/programas` | Crea programa |
| PUT | `/api/programas/:id` | Actualiza programa |
| DELETE | `/api/programas/:id` | Elimina (si no tiene estudiantes) |
| GET | `/api/estudiantes?buscar=&estado=&programa=` | Lista estudiantes con filtros |
| GET | `/api/estudiantes/:id` | Detalle de un estudiante |
| POST | `/api/estudiantes` | Inscribe un estudiante (estado inicial: Inscrito) |
| PUT | `/api/estudiantes/:id` | Actualiza datos |
| PATCH | `/api/estudiantes/:id/estado` | Cambia estado (Inscrito, En revisión, Admitido, Rechazado). Valida cupos |
| DELETE | `/api/estudiantes/:id` | Elimina estudiante |
| GET | `/api/estadisticas` | Resumen: totales, por estado y por programa |

## Validaciones incluidas
- Campos obligatorios, email válido, ICFES entre 0 y 500.
- Documento, email y códigos únicos (responde 409 si se repiten).
- No se puede crear un programa con una facultad inexistente, ni inscribir a un programa inexistente o inactivo.
- No se puede admitir más estudiantes que los cupos del programa.
- No se puede borrar una facultad con programas ni un programa con estudiantes.

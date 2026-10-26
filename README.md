# Agronomatrix · Portal Técnico de la Central de Beneficio

Aplicación web especializada para el rol de **Técnico de la Central de Beneficio** dentro del ecosistema Agronomatrix. Permite la consulta y trazabilidad integral segmentada dinámicamente por **Asociación o Cooperativa Cacaotera**:

- 👥 **Listado de Productores Cacaoteros**: consulta de familias productoras vinculadas a la asociación, cédula, contacto directo por WhatsApp y llamada telefónica, verificación de autorización de datos (Habeas Data) y recuento de predios.
- 🏡 **Listado de Fincas y Predios**: visualización de predios georreferenciados, hectáreas totales y de cacao, altitud sobre el nivel del mar, distribución clonal (CCN-51, ICS-95, FEAR-5, FLE-2), estado de verificación antideforestación (EUDR) y coordenadas GPS con enlace directo a satélite.
- 🏭 **Listado de Centrales de Beneficio**: capacidad mensual de procesamiento en baba (kg/mes), rendimiento estimado en grano seco, batería de cajones de fermentación en madera escalonada, superficie de secado solar en m² y estado operativo.
- ⚖️ **Módulo de Recepción y Control de Lotes**: registro ágil de lotes entregados por productores en central, cálculo automático de rendimiento seco (36%), asignación de cajón y monitoreo de grados Brix y temperatura.
- 🗺️ **Visualizador de Mapa Geográfico**: mapa radial de puntos GPS de fincas y plantas de beneficio con enlaces a Google Maps.

---

## 🛠️ Tecnologías Utilizadas

- **Framework**: React 19 + TypeScript
- **Bundler & Dev Server**: Vite 8
- **Estilos**: TailwindCSS v4 + Glassmorphism personalizado
- **Iconografía**: Lucide React
- **Base de Datos & Sincronización**: Google Cloud Firestore en tiempo real con respaldo local offline (localStorage)
- **Tipografía**: Plus Jakarta Sans, Playfair Display y JetBrains Mono
- **Seguridad**: Doble Factor de Autenticación (2FA) obligatorio con Google Authenticator (RFC 6238 TOTP) + Rol estricto de **Central de Beneficio**.

---

## 🔐 Control de Acceso Autorizado (Firebase Authenticator & Google Authenticator)

La aplicación utiliza **exclusivamente las cuentas registradas en la aplicación web administrativa** sincronizadas en tiempo real desde **Google Cloud Firestore** (`records` / `ecosystem_users`) y validadas por el servicio **Firebase Authentication**.

### 🔄 Flujo de Acceso en Dos Pasos

1. **Paso 1: Validación de Correo y Contraseña**:
   - El operador ingresa su correo electrónico corporativo (o usuario) y contraseña.
   - Las credenciales se validan contra el servicio **Firebase Authentication** y la base de datos de usuarios del ecosistema.
   - Se comprueba que la cuenta disponga de permisos para la **Central de Beneficio** (`assignedApps: ['central', ...]`).
   - Si las credenciales no coinciden o la cuenta no tiene permisos, el acceso se deniega inmediatamente.

2. **Paso 2: Doble Factor con Google Authenticator (TOTP RFC 6238)**:
   - Una vez superado el primer paso, el sistema solicita el código dinámico de **6 dígitos** generado en **Google Authenticator**.
   - Se valida contra la clave secreta `totpSecret` de la cuenta guardada en la base de datos.
   - **Si coincide**: se autoriza el ingreso completo al Portal Técnico de la Central de Beneficio.
   - **En caso contrario**: se bloquea el acceso.

### 👤 Cuentas Registradas en la Aplicación Administrativa

- **Administrador Raíz**: `juanpablo.garzonruiz@gmail.com` *(Director General / Super Administrador)*.
- **Administrador Ecosistema**: `mayerlimarroquin@hotmail.com` *(Acceso a Campo, Central y Admin)*.
- Cualquier otra cuenta registrada o creada desde la sección de seguridad de la aplicación web administrativa con acceso asignado a la **App Central de Beneficio**.

---

## 🚀 Puesta en Marcha Local

### Requisitos
- [Node.js](https://nodejs.org/) v18+ o [Bun](https://bun.sh/) v1.0+

### Instalación de Dependencias
```bash
bun install
# o con npm:
npm install
```

### Ejecución en Desarrollo
```bash
bun run dev
# o con npm:
npm run dev
```

La aplicación estará disponible en: [http://localhost:3001](http://localhost:3001).

### Construcción para Producción
```bash
bun run build
# o con npm:
npm run build
```

---

## 🗂️ Abrir en una Nueva Ventana de Antigravity

Para abrir este proyecto como un espacio de trabajo independiente en una nueva ventana de **Antigravity**:

1. En el menú superior de Antigravity: `File` (Archivo) -> `Open Folder...` (Abrir Carpeta...).
2. Selecciona la carpeta:
   ```
   /Users/jpgarzonjaveriana.edu.co/Desktop/Agronomatrix/agronomatrix-central-tecnico
   ```
3. O desde tu terminal de macOS:
   ```bash
   antigravity /Users/jpgarzonjaveriana.edu.co/Desktop/Agronomatrix/agronomatrix-central-tecnico
   ```

---

## 🐙 Repositorio en GitHub

Para sincronizar con un nuevo repositorio en GitHub bajo tu cuenta:

```bash
cd /Users/jpgarzonjaveriana.edu.co/Desktop/Agronomatrix/agronomatrix-central-tecnico
git init
git add .
git commit -m "feat: initial commit - portal tecnico de la central de beneficio"
git branch -M main
git remote add origin https://github.com/juanpablogarzonruiz/agronomatrix-central-tecnico.git
git push -u origin main
```

---

Desarrollado con 💚 para la trazabilidad y calidad del Cacao Colombiano en el ecosistema **Agronomatrix**.

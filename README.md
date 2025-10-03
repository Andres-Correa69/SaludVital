# SaludVital

Proyecto full-stack con Node.js (backend) y Angular (frontend).

## Estructura del Proyecto

```
SaludVital/
├── backend/          # API REST con Node.js y Express
├── frontend/         # Aplicación Angular
└── README.md
```

## Configuración y Ejecución

### Backend (Node.js + Express)

1. Navegar al directorio backend:
   ```bash
   cd backend
   ```

2. Instalar dependencias:
   ```bash
   npm install
   ```

3. Ejecutar en modo desarrollo:
   ```bash
   npm run dev
   ```

4. El servidor estará disponible en: `http://localhost:3000`

### Frontend (Angular)

1. Navegar al directorio frontend:
   ```bash
   cd frontend
   ```

2. Instalar dependencias:
   ```bash
   npm install
   ```

3. Ejecutar en modo desarrollo:
   ```bash
   ng serve
   ```

4. La aplicación estará disponible en: `http://localhost:4200`

## API Endpoints

- `GET /` - Información del servidor
- `GET /api/health` - Estado de la API
- `GET /api/usuarios` - Lista de usuarios (ejemplo)

## Tecnologías Utilizadas

### Backend
- Node.js
- Express.js
- CORS
- dotenv

### Frontend
- Angular 20
- TypeScript
- CSS

## Scripts Disponibles

### Backend
- `npm start` - Ejecutar en producción
- `npm run dev` - Ejecutar en modo desarrollo con nodemon

### Frontend
- `ng serve` - Servidor de desarrollo
- `ng build` - Construir para producción
- `ng test` - Ejecutar pruebas

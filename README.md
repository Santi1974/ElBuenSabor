# El Buen Sabor - React + TypeScript + Vite

Santiago Beneitez, Sebastian Ortiz

### Descripción General
El Buen Sabor es una aplicación web construida con React y TypeScript utilizando Vite como herramienta de construcción. Trabajo final para la TUP de la UTN

### Sistema de Colores
La aplicación utiliza un sistema de colores consistente basado en la siguiente paleta:
- **Primario**: #D87D4D (Naranja) - Color principal de la marca
- **Peligro**: #FF4F4F (Rojo) - Para acciones destructivas
- **Blanco Primario**: #F9F9F9 (Gris claro) - Fondo principal
- **Blanco Secundario**: #EEEEEE (Gris medio) - Fondo secundario
- **Éxito**: #6DBC62 (Verde) - Para confirmaciones
- **Interfaz**: #747474 (Gris oscuro) - Para interfaces no cliente

El sistema de colores se implementa a través de variables CSS en `src/styles/theme.css`.

### Estructura del Proyecto
```
el-buen-sabor/
├── node_modules/        # Dependencias
├── public/              # Archivos estáticos
├── src/                 # Código fuente
│   ├── assets/          # Recursos del proyecto (imágenes, fuentes, etc.)
│   ├── components/      # Componentes UI reutilizables
│   ├── context/         # Contextos de React
│   ├── pages/           # Páginas de la aplicación
│   ├── routes/          # Configuración de rutas
│   ├── services/        # Servicios y llamadas a API
│   ├── styles/          # Estilos globales y tema
│   ├── types/           # Definiciones de tipos TypeScript
│   ├── App.tsx          # Componente principal App
│   ├── App.css          # Estilos específicos de App
│   ├── index.css        # Estilos globales
│   ├── main.tsx         # Punto de entrada de la aplicación
│   └── vite-env.d.ts    # Declaraciones de tipos del entorno Vite
├── .gitignore           # Configuración de Git ignore
├── eslint.config.js     # Configuración de ESLint
├── index.html           # Punto de entrada HTML
├── package.json         # Metadatos y dependencias del proyecto
├── package-lock.json    # Bloqueo de versiones de dependencias
├── tsconfig.json        # Configuración de TypeScript
├── tsconfig.app.json    # Configuración específica de TypeScript para la aplicación
├── tsconfig.node.json   # Configuración específica de TypeScript para Node
├── vite.config.ts       # Configuración de Vite
└── WORK_LOG.md          # Registro de trabajo y cambios
```

### Comenzando

1. **Prerrequisitos**
   - Node.js (v14.0.0 o posterior)
   - npm (v6.0.0 o posterior)

2. **Instalación**
   ```bash
   npm install
   ```

3. **Desarrollo**
   ```bash
   npm run dev
   ```
   Esto iniciará el servidor de desarrollo en http://localhost:5173/

4. **Construcción para Producción**
   ```bash
   npm run build
   ```
   Esto generará los archivos optimizados en el directorio `dist`.

5. **Ejecución de Pruebas**
   ```bash
   npm run test
   ```

### Tecnologías Utilizadas
- **React**: Una biblioteca JavaScript para construir interfaces de usuario
- **TypeScript**: Superset tipado de JavaScript
- **Vite**: Herramienta frontend de próxima generación
- **ESLint**: Herramienta de calidad de código
- **CSS**: Estilos

### Convenciones del Proyecto
- Los archivos de componentes usan la extensión `.tsx`
- Los archivos de estilo usan la extensión `.css`
- El modo estricto de TypeScript está habilitado


# El Buen Sabor - React + TypeScript + Vite

Santiago Beneitez, Sebastian Ortiz

### Descripción General
El Buen Sabor es una aplicación web construida con React y TypeScript utilizando Vite como herramienta de construcción. Trabajo final para la TUP de la UTN.

La aplicación incluye un **sistema administrativo completo** con gestión de empleados, clientes, productos, ingredientes y categorías, implementado con componentes genéricos y reutilizables.

## 🚀 Funcionalidades Principales

### Sistema Administrativo (ABM)
- **Gestión de Empleados**: CRUD completo con información personal y direcciones
- **Gestión de Clientes**: CRUD completo con información personal y direcciones  
- **Gestión de Productos**: Soporte para productos manufacturados e inventario
- **Gestión de Ingredientes**: Control de stock, costos y unidades de medida
- **Gestión de Categorías**: Categorías jerárquicas separadas por tipo

### Tipos de Productos
- **Productos Manufacturados**: Incluyen receta, tiempo de preparación e ingredientes
- **Productos de Inventario**: Incluyen stock, costos y unidades de medida (ej: Coca Cola)

### Sistema de Categorías
- **Categorías de Productos**: Para productos manufacturados (`/manufactured_item_category/`)
- **Categorías de Ingredientes**: Para ingredientes y productos de inventario (`/inventory_item_category/`)
- **Jerarquía**: Soporte para categorías padre-hijo (subcategorías)

### Funcionalidades Avanzadas
- **Paginación**: Implementada en productos e ingredientes
- **Carga de Imágenes**: Conversión automática a base64
- **Búsqueda Semántica**: Filtros y búsquedas en las tablas
- **Modales de Vista**: Visualización detallada de información
- **Validaciones**: Formularios con validación completa

## 🏗️ Arquitectura del Sistema

### Componentes Principales
```
src/
├── components/
│   └── GenericABM/
│       └── GenericABM.tsx     # Componente genérico para todas las operaciones CRUD
├── pages/
│   ├── Employees.tsx          # Página de gestión de empleados
│   ├── Clients.tsx            # Página de gestión de clientes
│   ├── Inventory.tsx          # Página de gestión de productos
│   ├── Ingredients.tsx        # Página de gestión de ingredientes
│   └── Categories.tsx         # Página de gestión de categorías
└── services/
    ├── employeeService.ts     # API para empleados
    ├── clientService.ts       # API para clientes
    ├── inventoryService.ts    # API para productos
    ├── ingredientService.ts   # API para ingredientes
    └── categoryService.ts     # API para categorías
```

### API Endpoints
```
# Empleados
GET/POST/PUT/DELETE /employee/

# Clientes  
GET/POST/PUT/DELETE /client/

# Productos Manufacturados
GET/POST/PUT/DELETE /manufactured_item/

# Productos de Inventario
GET/POST/PUT/DELETE /inventory_item/products/all

# Ingredientes
GET/POST/PUT/DELETE /inventory_item/ingredients/all

# Categorías de Productos
GET/POST/PUT/DELETE /manufactured_item_category/
GET /manufactured_item_category/top-level/all

# Categorías de Ingredientes
GET/POST/PUT/DELETE /inventory_item_category/
GET /inventory_item_category/top-level/all

# Unidades de Medida
GET /measurement_unit/
```

## 📋 Guía de Uso

### Gestión de Productos
1. **Crear Producto Manufacturado**:
   - Seleccionar "Producto Manufacturado"
   - Completar nombre, descripción, precio
   - Agregar receta y tiempo de preparación
   - Seleccionar categoría (tipo manufactured)
   - Agregar ingredientes necesarios

2. **Crear Producto de Inventario**:
   - Seleccionar "Producto de Inventario"
   - Completar información básica
   - Configurar stock actual y mínimo
   - Establecer costo de compra
   - Seleccionar unidad de medida
   - Elegir categoría (tipo inventory)

### Gestión de Categorías
- **Categorías de Productos**: Para hamburguesas, bebidas, postres, etc.
- **Categorías de Ingredientes**: Para carnes, verduras, lácteos, etc.
- **Subcategorías**: Crear jerarquías (ej: Bebidas > Gaseosas, Bebidas > Jugos)

### Gestión de Ingredientes
- Control completo de inventario
- Stock actual vs stock mínimo
- Precios de compra y venta
- Unidades de medida (kg, litros, unidades, etc.)

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
   - API Backend corriendo en http://localhost:8000

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
- **Bootstrap**: Framework CSS para diseño responsivo
- **CSS**: Estilos personalizados

### Convenciones del Proyecto
- Los archivos de componentes usan la extensión `.tsx`
- Los archivos de estilo usan la extensión `.css`
- El modo estricto de TypeScript está habilitado
- Servicios API centralizados en la carpeta `services/`
- Componentes genéricos y reutilizables en `components/`

## 🔧 Características Técnicas

### Componente GenericABM
- **Reutilizable**: Un solo componente maneja todas las operaciones CRUD
- **Tipado**: Completamente tipado con TypeScript
- **Flexible**: Configurable para diferentes tipos de datos
- **Responsive**: Diseño adaptativo con Bootstrap

### Manejo de Estado
- Estado local con React hooks
- Gestión de formularios dinámicos
- Paginación eficiente
- Carga lazy de datos

### Validaciones
- Validación de formularios en tiempo real
- Manejo de errores de API
- Mensajes de confirmación para acciones destructivas
- Validación de tipos de archivos para imágenes


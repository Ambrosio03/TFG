# Documentación del Proyecto TFG

## 1. Análisis del Problema

### 1.1. Introducción
Este proyecto consiste en el desarrollo de una tienda online completa que permite a los usuarios realizar compras de productos y a los administradores gestionar el inventario, pedidos y usuarios. La aplicación está desarrollada utilizando React para el frontend y PHP para el backend, con MySQL como sistema de gestión de base de datos.

### 1.2. Objetivos
- Desarrollar una plataforma de comercio electrónico funcional y escalable
- Implementar un sistema de gestión de productos eficiente
- Crear un panel de administración completo
- Proporcionar una experiencia de usuario intuitiva y atractiva
- Implementar un sistema seguro de autenticación y autorización
- Facilitar la gestión de pedidos y usuarios

### 1.3. Funciones y Rendimientos Deseados
1. **Gestión de Usuarios**
   - Registro e inicio de sesión
   - Perfiles de usuario personalizables
   - Roles diferenciados (admin/cliente)

2. **Gestión de Productos**
   - CRUD completo de productos
   - Importación masiva desde CSV
   - Gestión de imágenes
   - Control de stock

3. **Carrito de Compras**
   - Añadir/eliminar productos
   - Modificar cantidades
   - Cálculo de totales en tiempo real

4. **Sistema de Pedidos**
   - Creación y seguimiento de pedidos
   - Historial de compras
   - Estados de pedido

5. **Panel de Administración**
   - Dashboard con estadísticas
   - Gestión completa de productos y pedidos
   - Gestión de usuarios

### 1.4. Planteamiento y Evaluación de Soluciones
Se evaluaron varias alternativas para el desarrollo:

1. **Frontend**
   - React vs Angular vs Vue
   - Tailwind CSS vs Bootstrap vs Material UI
   - Context API vs Redux vs MobX

2. **Backend**
   - PHP vs Node.js vs Python
   - MySQL vs PostgreSQL vs MongoDB
   - REST vs GraphQL

### 1.5. Justificación de la Solución Elegida
- **React**: Por su flexibilidad, rendimiento y gran ecosistema
- **Tailwind CSS**: Para un desarrollo rápido y consistente
- **PHP**: Por su facilidad de despliegue y mantenimiento
- **MySQL**: Por su robustez y compatibilidad con PHP
- **REST**: Por su simplicidad y amplia adopción

### 1.6. Modelado de la Solución

#### 1.6.1. Recursos Humanos
- 1 Desarrollador Full Stack
- 1 Diseñador UI/UX
- 1 Tester

#### 1.6.2. Recursos Hardware
- Servidor de desarrollo
  - CPU: 4 cores
  - RAM: 8GB
  - Almacenamiento: 256GB SSD
- Servidor de producción
  - CPU: 8 cores
  - RAM: 16GB
  - Almacenamiento: 512GB SSD

#### 1.6.3. Recursos Software
- Sistema Operativo: Windows/Linux
- IDE: Visual Studio Code
- Control de Versiones: Git
- Servidor Web: Apache/Nginx
- Base de Datos: MySQL 5.7+
- PHP 8.1+
- Node.js 16+
- Composer
- npm/yarn

### 1.7. Planificación Temporal
1. **Fase 1: Análisis y Diseño** (2 semanas)
   - Análisis de requisitos
   - Diseño de arquitectura
   - Diseño de base de datos

2. **Fase 2: Desarrollo Backend** (4 semanas)
   - Implementación de API
   - Desarrollo de modelos
   - Implementación de autenticación

3. **Fase 3: Desarrollo Frontend** (4 semanas)
   - Implementación de componentes
   - Desarrollo de páginas
   - Integración con backend

4. **Fase 4: Testing** (2 semanas)
   - Pruebas unitarias
   - Pruebas de integración
   - Pruebas de usuario

5. **Fase 5: Despliegue** (1 semana)
   - Configuración de servidores
   - Despliegue de aplicación
   - Documentación final

## 2. Diseño e Implementación

## 3. Fase de Pruebas

### 3.1. Pruebas Unitarias
- Pruebas de componentes React
- Pruebas de controladores PHP
- Pruebas de modelos

### 3.2. Pruebas de Integración
- Pruebas de API
- Pruebas de flujos de usuario
- Pruebas de base de datos

### 3.3. Pruebas de Rendimiento
- Pruebas de carga
- Pruebas de estrés
- Optimización de consultas

## 4. Documentación de la Aplicación

### 4.1. Introducción a la Aplicación

## Índice
1. [Descripción General](#descripción-general)
2. [Arquitectura](#arquitectura)
3. [Backend](#backend)
   - [Tecnologías](#tecnologías-backend)
   - [Estructura](#estructura-backend)
   - [Endpoints](#endpoints)
4. [Frontend](#frontend)
   - [Tecnologías](#tecnologías-frontend)
   - [Estructura](#estructura-frontend)
   - [Componentes](#componentes)
5. [Base de Datos](#base-de-datos)
6. [Despliegue](#despliegue)

## Descripción General

Esta aplicación es una tienda online desarrollada con React en el frontend y PHP en el backend. Permite a los usuarios ver productos, realizar compras y gestionar su cuenta, mientras que los administradores pueden gestionar productos, pedidos y usuarios.

## Arquitectura

La aplicación sigue una arquitectura cliente-servidor:

- **Frontend**: Aplicación React que maneja la interfaz de usuario
- **Backend**: API REST desarrollada en PHP que maneja la lógica de negocio
- **Base de Datos**: MySQL para el almacenamiento de datos

## Backend

### Tecnologías Backend
- PHP 8.1
- MySQL
- Composer para gestión de dependencias

### Estructura Backend
```
backend/
├── config/
│   └── database.php
├── controllers/
│   ├── AuthController.php
│   ├── ProductController.php
│   └── OrderController.php
├── models/
│   ├── User.php
│   ├── Product.php
│   └── Order.php
└── public/
    └── images/
        └── products/
```

### Endpoints

#### Autenticación
```php
POST /api/auth/login
POST /api/auth/register
POST /api/auth/logout
GET /api/auth/me
```

#### Productos
```php
GET /api/product/all
GET /api/product/{id}
POST /api/product
PUT /api/product/{id}
DELETE /api/product/{id}
POST /api/product/import-csv
```

#### Pedidos
```php
GET /api/order/user
POST /api/order
GET /api/order/{id}
```

## Frontend

### Tecnologías Frontend
- React 18
- Tailwind CSS
- React Router
- Context API para gestión de estado

### Estructura Frontend
```
frontend/
├── src/
│   ├── components/
│   ├── pages/
│   ├── context/
│   ├── hooks/
│   └── utils/
└── public/
```

### Componentes Principales

1. **Páginas**
   - `HomePage`: Página principal con listado de productos
   - `ProductPage`: Detalles de un producto
   - `CartPage`: Carrito de compras
   - `AdminPage`: Panel de administración
   - `LoginPage`: Inicio de sesión
   - `RegisterPage`: Registro de usuarios

2. **Componentes Reutilizables**
   - `Navbar`: Barra de navegación
   - `ProductCard`: Tarjeta de producto
   - `CartItem`: Item del carrito
   - `Modal`: Componente modal reutilizable

3. **Contextos**
   - `AuthContext`: Gestión de autenticación
   - `CartContext`: Gestión del carrito

## Base de Datos

### Tablas Principales

1. **users**
   - id
   - email
   - password
   - role
   - created_at

2. **products**
   - id
   - nombre
   - descripcion
   - precio
   - stock
   - visible
   - created_at

3. **orders**
   - id
   - user_id
   - total
   - status
   - created_at

4. **order_items**
   - id
   - order_id
   - product_id
   - quantity
   - price

## Despliegue

### Requisitos del Sistema

- PHP 8.1 o superior
- MySQL 5.7 o superior
- Node.js 16 o superior
- Composer
- npm o yarn

### Pasos de Instalación


1.**Clonacion**
   ```bash
   git clone https://github.com/Ambrosio03/TFG.git
   ```

2. **Backend**
   ```bash
   cd backend
   composer install
   cp .env.example .env
   # Configurar variables de entorno
   php artisan migrate
   ```

3. **Frontend**
   ```bash
   cd frontend
   npm install
   cp .env.example .env
   # Configurar variables de entorno
   npm run build
   ```

### Variables de Entorno

#### Backend (.env)
```
DB_HOST=localhost
DB_DATABASE=tienda
DB_USERNAME=root
DB_PASSWORD=
JWT_SECRET=your-secret-key
```

#### Frontend (.env)
```
VITE_API_URL=http://localhost:8000/api
```

## Características Principales

1. **Gestión de Usuarios**
   - Registro e inicio de sesión
   - Roles de usuario (admin/cliente)
   - Perfil de usuario

2. **Gestión de Productos**
   - CRUD de productos
   - Importación masiva desde CSV
   - Gestión de imágenes
   - Control de stock

3. **Carrito de Compras**
   - Añadir/eliminar productos
   - Modificar cantidades
   - Cálculo de totales

4. **Pedidos**
   - Creación de pedidos
   - Historial de pedidos
   - Estados de pedido

5. **Panel de Administración**
   - Dashboard con estadísticas
   - Gestión de productos
   - Gestión de pedidos
   - Gestión de usuarios 

### 4.2. Manual de Instalación
[Contenido de la sección "Despliegue" anterior]

### 4.3. Manual de Usuario
1. **Registro e Inicio de Sesión**
   - Crear cuenta
   - Iniciar sesión
   - Recuperar contraseña

2. **Navegación por la Tienda**
   - Ver productos
   - Filtrar y buscar
   - Ver detalles de producto

3. **Carrito de Compras**
   - Añadir productos
   - Modificar cantidades
   - Realizar pedido

4. **Gestión de Cuenta**
   - Ver perfil
   - Modificar datos
   - Ver historial de pedidos

### 4.4. Manual de Administración
1. **Panel de Control**
   - Ver estadísticas
   - Gestionar productos
   - Gestionar pedidos

2. **Gestión de Productos**
   - Añadir productos
   - Modificar productos
   - Importar productos

3. **Gestión de Usuarios**
   - Ver usuarios
   - Modificar roles
   - Gestionar permisos

## 5. Conclusiones Finales

### 5.1. Grado de Cumplimiento de Objetivos
- Todos los objetivos principales han sido cumplidos
- La aplicación cumple con los requisitos de rendimiento
- La experiencia de usuario es satisfactoria

### 5.2. Propuestas de Mejora
1. **Corto Plazo**
   - Implementar sistema de notificaciones
   - Añadir más opciones de pago
   - Mejorar el sistema de búsqueda

2. **Medio Plazo**
   - Implementar sistema de recomendaciones
   - Añadir sistema de valoraciones
   - Desarrollar aplicación móvil

3. **Largo Plazo**
   - Implementar sistema de fidelización
   - Añadir marketplace
   - Internacionalización

## 6. Bibliografía

### 6.1. Documentación Oficial
- [React Documentation](https://reactjs.org/docs/getting-started.html)
- [PHP Documentation](https://www.php.net/docs.php)
- [MySQL Documentation](https://dev.mysql.com/doc/)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)

### 6.2. Libros
- "Clean Code" - Robert C. Martin
- "Designing Data-Intensive Applications" - Martin Kleppmann
- "React Design Patterns and Best Practices" - Carlos Santana Roldán

### 6.3. Artículos y Tutoriales
- [React Best Practices](https://reactjs.org/docs/hooks-rules.html)
- [PHP Best Practices](https://phptherightway.com/)
- [REST API Design Best Practices](https://restfulapi.net/)

### 6.4. Herramientas y Recursos
- [GitHub](https://github.com)
- [Stack Overflow](https://stackoverflow.com)
- [MDN Web Docs](https://developer.mozilla.org) 
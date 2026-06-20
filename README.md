# Sistema de Facturación Librería El Estudiante

Proyecto integrador recreado con apoyo de herramientas de Inteligencia Artificial.

## Descripción

Sistema web frontend para la gestión de facturación, ventas, compras, inventario, clientes, proveedores, usuarios y roles de la Librería El Estudiante, ubicada en Jinotepe, Carazo, Nicaragua.

El sistema fue desarrollado con HTML5, CSS3 y JavaScript Vanilla, utilizando LocalStorage como mecanismo de persistencia para simular una base de datos local.

## Tecnologías utilizadas

- HTML5
- CSS3
- JavaScript Vanilla
- LocalStorage
- Visual Studio Code

## Módulos principales

- Login
- Dashboard
- Categorías
- Marcas
- Productos
- Clientes
- Proveedores
- Usuarios
- Roles
- Compras
- Ventas
- Inventario
- Facturas
- Devoluciones
- Reportes

## Roles del sistema

### Propietario

Tiene acceso total al sistema. Puede gestionar usuarios, roles, reportes, catálogos, compras, ventas, inventario, facturas y devoluciones.

### Administrador

Puede gestionar catálogos, compras, ventas, inventario, facturas y devoluciones.

### Empleado

Puede registrar ventas y consultar productos, clientes, inventario y facturas. No puede eliminar registros ni gestionar usuarios.

## Credenciales de prueba

```txt
Propietario:
usuario: propietario
contraseña: 1234

Administrador:
usuario: admin
contraseña: 1234

Empleado:
usuario: empleado
contraseña: 1234

Funcionalidades destacadas
Registro de compras.
Registro de ventas.
Generación automática de facturas.
Actualización automática del inventario.
Control de stock insuficiente.
Registro de movimientos de inventario.
Devoluciones parciales.
Anulación de facturas.
Reintegro de stock por devolución o anulación.
Reportes de ventas y compras.
Dashboard con indicadores principales.
Reglas de negocio implementadas
Una compra aumenta el stock del producto.
Una venta disminuye el stock del producto.
No se permite vender más cantidad que el stock disponible.
Toda compra, venta, devolución o anulación genera movimientos de inventario.
Las facturas anuladas revierten el stock.
Las devoluciones reintegran productos al inventario.
Estructura del proyecto
Sistema-Facturacion-Libreria-El-Estudiante/
│
├── index.html
├── styles.css
├── app.js
└── README.md
Cómo ejecutar el proyecto
Descargar o clonar el proyecto.
Abrir la carpeta en Visual Studio Code.
Abrir el archivo index.html en el navegador.
Iniciar sesión con cualquiera de las credenciales de prueba.
Nota académica

Este proyecto fue recreado desde cero haciendo uso de herramientas de Inteligencia Artificial, tomando como referencia un proyecto integrador previo desarrollado para la Librería El Estudiante. La versión recreada mantiene los módulos principales del sistema original, pero utiliza LocalStorage para simular la persistencia de datos sin necesidad de backend ni base de datos real.

Autor

Francisco Sánchez Avellan
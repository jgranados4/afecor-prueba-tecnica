# Prueba Técnica AFECOR - Sistema de Pedidos

Prueba técnica para evaluar las habilidades de un desarrollador full-stack junior en: desarrollo back-end, front-end, APIs REST y bases de datos.

## Instrucciones de Entrega

Para evitar problemas con archivos adjuntos, debes:

1. **Hacer fork de este repositorio** en GitHub
2. **Completar el desarrollo** en tu fork
3. **Enviar la URL de tu repositorio** al finalizar

### Tu repositorio debe contener:

- ✅ Carpeta **"backend"** con la API en .NET
- ✅ Carpeta **"frontend"** con la aplicación Angular
- ✅ Carpeta **"database"** con el script SQL que contenga la estructura de la base de datos
- ✅ **README.md** en cada carpeta explicando cómo ejecutar tu código

## Contexto del Negocio

**AFECOR** es una empresa que comercializa productos agroquímicos.

Necesitan un sistema para **registrar pedidos** y calcular la **rentabilidad** de cada venta en tiempo real.

## Requerimientos Técnicos

- **Frontend:** Angular 17+ (preferible 19-20)
- **Backend:** .NET 8 Web API
- **Base de datos:** SQL Server
- **Tiempo:** 3 horas

## Funcionalidad Requerida

Desarrollar un **sistema CRUD de pedidos** con cálculo automático de rentabilidad.

### El sistema debe permitir:

1. **Crear, editar, listar y eliminar pedidos**
2. **Estructura cabecera-detalle:**
   - **Cabecera:** Selector de cliente, fecha, totales
   - **Detalle:** Productos, cantidades, precios, rentabilidad
3. **Calcular rentabilidad automáticamente:** `((Precio Venta - Costo) / Precio Venta) * 100`
4. **Mostrar indicador visual global** por pedido según rentabilidad promedio:
   - 🔴 **Rojo:** < 20% (Baja rentabilidad/pérdida)
   - 🟡 **Amarillo:** 20-35% (Rentabilidad media)
   - 🟢 **Verde:** > 35% (Buena rentabilidad)

### Datos de Prueba

Incluye datos iniciales apropiados para productos agroquímicos y algunos clientes de ejemplo.

## Restricciones de Negocio

- Los pedidos deben tener estructura cabecera-detalle
- Un pedido debe pertenecer a un cliente
- Un pedido debe tener al menos un producto en el detalle

## Backend

### Modelo de Datos (SQL Server)

Diseña las tablas necesarias para:

- Clientes
- Productos (con costos y precios)
- Pedidos (cabecera)
- Detalle de pedidos
- _Incluye datos de prueba apropiados_

### API REST (.NET)

Implementa endpoints para:

- **Pedidos:** CRUD completo (`GET`, `POST`, `PUT`, `DELETE`)
- **Productos:** Listar disponibles (`GET`)
- **Clientes:** Listar disponibles (`GET`)
- Manejo apropiado de códigos HTTP (200, 201, 400, 404, etc.)

## Frontend (Angular)

Desarrolla una aplicación web que permita:

### Pantallas Requeridas:

**1. Lista de Pedidos**

- Grilla con pedidos existentes
- Botones para crear, editar y eliminar pedidos

**2. Formulario de Pedido (Crear/Editar)**

- **Cabecera:** Selector de cliente, fecha
- **Detalle:** Grilla para agregar/modificar productos con cantidades y precios
- **Cálculo automático:** Rentabilidad total del pedido
- **Indicador visual:** Color según rentabilidad global
- Botones guardar/cancelar

_El frontend debe consumir toda la información desde la API, no acceso directo a BD._

## Criterios de Evaluación

- **Funcionalidad (35%):** ¿El sistema de pedidos funciona correctamente?
- **Arquitectura (20%):** Separación apropiada frontend/backend y estructura de datos
- **Código (20%):** Limpieza, organización y legibilidad del código
- **API REST (15%):** Diseño de endpoints y manejo de respuestas HTTP
- **Base de datos (5%):** Modelo relacional lógico y consistente
- **Interfaz (5%):** Usabilidad y presentación de la información

## Extras (Bonus)

- Validaciones de negocio avanzadas
- Manejo de excepciones
- Responsive design
- Documentación de API (Swagger)
- Filtros y búsquedas
- Confirmaciones antes de eliminar

## Enviando el Resultado

1. Asegúrate que tu código compile y ejecute correctamente
2. Incluye instrucciones claras en los README
3. Haz commit de todos los archivos necesarios
4. **Envía la URL de tu repositorio fork**

Si necesitas más tiempo, háznoslo saber.

Posterior a la entrega del código, se realizará una entrevista técnica donde se discutirán las decisiones de arquitectura, dificultades encontradas y posibles mejoras al sistema desarrollado.

**Uso de Herramientas de IA:** Puedes apoyarte de herramientas de IA, pero recuerda que al final tendrás que sustentar el código que realizaste en la entrevista técnica, donde se demostrará si realmente sabes lo que implementaste.

**Nota:** Gestiona tu tiempo sabiamente. Es mejor entregar algo funcional que muchas funcionalidades incompletas. La gestión del tiempo también es parte de la evaluación.

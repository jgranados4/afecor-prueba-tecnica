
CREATE DATABASE AFECORDB;
GO

USE AFECORDB;
GO

CREATE TABLE Clientes (
    ClienteID INT IDENTITY(1,1) PRIMARY KEY,
    Nombre NVARCHAR(100) NOT NULL,
    Direccion NVARCHAR(200),
    Telefono NVARCHAR(20),
    Email NVARCHAR(100)
);
GO

CREATE TABLE Productos (
    ProductoID INT IDENTITY(1,1) PRIMARY KEY,
    Nombre NVARCHAR(100) NOT NULL,
    Costo DECIMAL(18,2) NOT NULL,
    PrecioVenta DECIMAL(18,2) NOT NULL
);
GO

-- TABLA PEDIDOS (CABECERA)
CREATE TABLE Pedidos (
    PedidoID INT IDENTITY(1,1) PRIMARY KEY,
    ClienteID INT NOT NULL,
    FechaPedido DATE NOT NULL DEFAULT GETDATE(),
    Total DECIMAL(18,2) DEFAULT 0,
    CONSTRAINT FK_Pedidos_Clientes FOREIGN KEY (ClienteID) REFERENCES Clientes(ClienteID)
);
GO

-- TABLA DETALLE DE PEDIDOS

CREATE TABLE PedidoDetalle (
    DetalleID INT IDENTITY(1,1) PRIMARY KEY,
    PedidoID INT NOT NULL,
    ProductoID INT NOT NULL,
    Cantidad INT NOT NULL,
    PrecioUnitario DECIMAL(18,2) NOT NULL, -- precio de venta en ese pedido
    Subtotal DECIMAL(18,2) NOT NULL,       -- Cantidad * PrecioUnitario
    Rentabilidad DECIMAL(5,2) NOT NULL,    -- % de rentabilidad de la línea
    CONSTRAINT FK_PedidoDetalle_Pedidos FOREIGN KEY (PedidoID) REFERENCES Pedidos(PedidoID),
    CONSTRAINT FK_PedidoDetalle_Productos FOREIGN KEY (ProductoID) REFERENCES Productos(ProductoID)
);
GO

-- ==============================
-- DATOS DE PRUEBA
-- ==============================
-- Clientes
INSERT INTO Clientes (Nombre, Direccion, Telefono, Email) VALUES
('Agroindustrias Sierra Verde', 'Av. Principal 123, Quito', '0991234567', 'contacto@sierraverde.com'),
('Cooperativa Agropecuaria El Campo', 'Calle 45 #67, Guayaquil', '0987654321', 'ventas@elcampo.ec'),
('Distribuidora Los Ríos', 'Km 10 Vía Quevedo', '0974567890', 'info@losrios.com');

-- Productos (Agroquímicos)
INSERT INTO Productos (Nombre, Costo, PrecioVenta) VALUES
('Herbicida Glifosato 1L', 5.00, 8.50),
('Fungicida Mancozeb 1Kg', 7.00, 12.00),
('Insecticida Clorpirifos 1L', 6.50, 11.00);


-- Pedido de ejemplo (Cabecera)
INSERT INTO Pedidos (ClienteID, FechaPedido, Total) VALUES
(1, '2025-09-19', 0);  -- Cliente 1

-- Detalle del pedido
DECLARE @PedidoID INT = SCOPE_IDENTITY();

INSERT INTO PedidoDetalle (PedidoID, ProductoID, Cantidad, PrecioUnitario, Subtotal, Rentabilidad)
SELECT 
    @PedidoID,
    ProductoID,
    10, -- cantidad
    PrecioVenta,
    10 * PrecioVenta,
    ((PrecioVenta - Costo) / PrecioVenta) * 100
FROM Productos
WHERE ProductoID IN (1,2); 
-- Actualizar total del pedido
UPDATE Pedidos
SET Total = (SELECT SUM(Subtotal) FROM PedidoDetalle WHERE PedidoID = Pedidos.PedidoID)
WHERE PedidoID = @PedidoID;
GO

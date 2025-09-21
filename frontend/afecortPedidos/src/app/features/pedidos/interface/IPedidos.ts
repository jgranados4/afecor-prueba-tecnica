export interface Cliente {
  clienteId: number;
  nombre: string;
  email: string;
}
export interface ClienteResponse extends Cliente {
  direccion: string;
  telefono: string;
}

export type ProductoResponse = Producto;
export interface Producto {
  productoId: number;
  nombre: string;
  costo: number;
  precioVenta: number;
}

export interface DetallePedidoForm {
  productoId: number;
  productoNombre?: string;
  cantidad: number;
  precioUnitario: number;
  rentabilidad: number;
}

export interface PedidoForm {
  clienteId: number;
  fechaPedido: string;
  total: number;
  detalles: DetallePedidoForm[];
}

export interface DetallePedido {
  productoNombre: string;
  cantidad: number;
  precioUnitario: number;
  rentabilidad: number;
}

export interface PedidoData {
  id?: number;
  pedidoId?: number;
  clienteNombre: string;
  fechaPedido: string;
  total: number;
  detalles: DetallePedido[];
  estado?: 'rentabilidad-alta' | 'rentabilidad-media' | 'rentabilidad-baja';
}

// Para la tabla, creamos una interfaz que incluya campos calculados
export interface PedidoDisplay extends PedidoData {
  id: number;
  pedidoId?: number;
  rentabilidadPromedio: number;
  estado: 'rentabilidad-alta' | 'rentabilidad-media' | 'rentabilidad-baja';
}
export interface PedidoRequest {
  clienteId: number;
  fechaPedido: string; // formato ISO: YYYY-MM-DD
  total: number;
  detalles: DetallePedidoRequest[];
}
interface DetallePedidoRequest {
  productoId: number;
  cantidad: number;
  precioUnitario: number;
  rentabilidad: number;
}

export type pedidoResponse = PedidoRequest;

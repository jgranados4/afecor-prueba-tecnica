import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  inject,
  signal,
} from '@angular/core';
import { AngularMaterialModule } from 'src/app/angular-material/angular-material-module';
import { Pedido } from '../../servicio/pedido';
import {
  DetallePedido,
  PedidoData,
  PedidoDisplay,
} from '../../interface/IPedidos';
import { MatTableDataSource } from '@angular/material/table';
import { CommonModule } from '@angular/common';
import { provideNativeDateAdapter } from '@angular/material/core';
import { MatDialog } from '@angular/material/dialog';
import { FormularioPedido } from '../formulario-pedido/formulario-pedido';
import { Mensaje } from '../mensaje/mensaje';

@Component({
  selector: 'app-pedido-list',
  imports: [AngularMaterialModule, CommonModule],
  templateUrl: './pedido-list.html',
  styleUrl: './pedido-list.scss',
  providers: [provideNativeDateAdapter()],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PedidoList {
  pedidos = inject(Pedido);
  readonly dialog = inject(MatDialog);

  constructor() {
    // Effect para debugging (solo en desarrollo)
    effect(() => {
      if (this.pedidos.ObtenerPedidos.hasValue()) {
        console.log('Pedidos cargados:', this.pedidos.ObtenerPedidos.value());
      }
      if (this.pedidos.ObtenerPedidos.error()) {
        console.error('Error en pedidos:', this.pedidos.ObtenerPedidos.error());
      }
    });
  }

  // Signals para filtros
  filtroCliente = signal<string>('');
  filtroFechaDesde = signal<Date | null>(null);
  filtroFechaHasta = signal<Date | null>(null);

  // Computed para obtener los datos raw del resource de forma reactiva
  private rawPedidos = computed<PedidoData[]>(() => {
    if (this.pedidos.ObtenerPedidos.hasValue()) {
      const data = this.pedidos.ObtenerPedidos.value();
      return Array.isArray(data) ? data : [];
    }
    return [];
  });

  // Computed para el estado de carga
  isLoading = computed(() => this.pedidos.ObtenerPedidos.isLoading());

  // Computed para errores
  error = computed(() => this.pedidos.ObtenerPedidos.error());
  reload = computed(() => this.pedidos.ObtenerPedidos.reload());

  // Computed para verificar si hay datos
  hasData = computed(() => this.pedidos.ObtenerPedidos.hasValue());

  // Computed signals para datos derivados
  pedidosFiltrados = computed<PedidoDisplay[]>(() => {
    const pedidos = this.rawPedidos();
    const cliente = this.filtroCliente();
    const fechaDesde = this.filtroFechaDesde();
    const fechaHasta = this.filtroFechaHasta();

    let filtrados = this.transformarPedidos(pedidos);

    if (cliente) {
      filtrados = filtrados.filter((p) =>
        p.clienteNombre.toLowerCase().includes(cliente.toLowerCase())
      );
    }

    if (fechaDesde) {
      filtrados = filtrados.filter(
        (p) => new Date(p.fechaPedido) >= fechaDesde
      );
    }

    if (fechaHasta) {
      filtrados = filtrados.filter(
        (p) => new Date(p.fechaPedido) <= fechaHasta
      );
    }

    return filtrados;
  });

  // DataSource para la tabla Material
  dataSource = computed(() => new MatTableDataSource(this.pedidosFiltrados()));

  // Estadísticas computadas
  totalPedidos = computed(() => this.pedidosFiltrados().length);

  totalMonto = computed(() =>
    this.pedidosFiltrados().reduce((sum, p) => sum + p.total, 0)
  );

  rentabilidadPromedio = computed(() => {
    const pedidos = this.pedidosFiltrados();
    if (pedidos.length === 0) return 0;
    const suma = pedidos.reduce((sum, p) => sum + p.rentabilidadPromedio, 0);
    return Number((suma / pedidos.length).toFixed(2));
  });

  // Configuración de la tabla
  displayedColumns: string[] = [
    'id',
    'clienteNombre',
    'fechaPedido',
    'total',
    'rentabilidadPromedio',
    'estado',
    'acciones',
  ];

  private transformarPedidos(pedidos: PedidoData[]): PedidoDisplay[] {
    return pedidos.map((pedido, index) => {
      const rentabilidadPromedio = this.calcularRentabilidadPromedio(
        pedido.detalles
      );

      return {
        ...pedido,
        id: typeof pedido.id === 'number' ? pedido.id : index + 1,
        rentabilidadPromedio,
        estado: this.getEstadoPorRentabilidad(rentabilidadPromedio),
      };
    });
  }

  private calcularRentabilidadPromedio(detalles: DetallePedido[]): number {
    if (detalles.length === 0) return 0;
    const suma = detalles.reduce(
      (sum, detalle) => sum + detalle.rentabilidad,
      0
    );
    return Number((suma / detalles.length).toFixed(2));
  }

  // Métodos para filtros
  onFiltroClienteChange(cliente: string): void {
    this.filtroCliente.set(cliente);
  }

  onFiltroFechaDesdeChange(fecha: Date | null): void {
    this.filtroFechaDesde.set(fecha);
  }

  onFiltroFechaHastaChange(fecha: Date | null): void {
    this.filtroFechaHasta.set(fecha);
  }

  limpiarFiltros(): void {
    this.filtroCliente.set('');
    this.filtroFechaDesde.set(null);
    this.filtroFechaHasta.set(null);
  }
  getEstadoPorRentabilidad(
    rentabilidad: number
  ): 'rentabilidad-alta' | 'rentabilidad-media' | 'rentabilidad-baja' {
    if (rentabilidad > 35) return 'rentabilidad-alta'; // 🟢 Verde
    if (rentabilidad >= 20) return 'rentabilidad-media'; // 🟡 Amarillo
    return 'rentabilidad-baja'; // 🔴 Rojo
  }
  // Métodos para acciones de la tabla
  getRentabilidadClass(rentabilidad: number): string {
    if (rentabilidad > 35) return 'rentabilidad-alta'; // 🟢 Verde
    if (rentabilidad >= 20) return 'rentabilidad-media'; // 🟡 Amarillo
    return 'rentabilidad-baja'; // 🔴 Rojo
  }

  onEditarPedido(pedido: PedidoDisplay): void {
    console.log('Editar pedido:', pedido);
    const dialogRef = this.dialog.open(FormularioPedido, {
      width: '80%',
      maxWidth: '800px',
      height: '90%',
      maxHeight: '700px',
      data: {
        pedido: pedido,
      },
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        // Si se guardó exitosamente, recargar la lista
        this.pedidos.ObtenerPedidos.reload();
      }
    });
    // Implementar lógica de edición
  }

  onVerDetalles(pedido: PedidoDisplay): void {
    console.log('Ver detalles:', pedido);
    // Implementar modal o navegación a detalles
  }

  onEliminarPedido(pedido: PedidoDisplay): void {
    const dialogRef = this.dialog.open(Mensaje, {
      height: '250px',
      data: { mensaje: `¿Desea eliminar el pedido #${pedido.pedidoId}?` },
    });
    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        console.log('Eliminar pedido:', pedido);
        this.pedidos.eliminarPedido(pedido.pedidoId!).subscribe({
          next: () => {
            console.log('Eliminado');
            this.pedidos.ObtenerPedidos.reload();
          },
        });
      }
    });
  }

  onNuevoPedido(): void {
    console.log('Crear nuevo pedido');
    const dialogRef = this.dialog.open(FormularioPedido, {
      width: '80%',
      maxWidth: '800px',
      height: '90%',
      maxHeight: '700px',
    });
    // Implementar navegación a formulario
  }
}

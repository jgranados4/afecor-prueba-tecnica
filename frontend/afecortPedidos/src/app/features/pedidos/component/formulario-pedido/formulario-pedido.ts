import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  DestroyRef,
  effect,
  inject,
  input,
  signal,
} from '@angular/core';
import {
  FormArray,
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { provideNativeDateAdapter } from '@angular/material/core';
import { Router } from '@angular/router';
import { AngularMaterialModule } from 'src/app/angular-material/angular-material-module';
import {
  Cliente,
  PedidoDisplay,
  PedidoForm,
  PedidoRequest,
  Producto,
} from '../../interface/IPedidos';
import {
  MAT_DIALOG_DATA,
  MatDialogClose,
  MatDialogRef,
} from '@angular/material/dialog';
import { Pedido } from '../../servicio/pedido';
import { debounceTime, startWith } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

@Component({
  selector: 'app-formulario-pedido',
  imports: [
    AngularMaterialModule,
    CommonModule,
    ReactiveFormsModule,
    MatDialogClose,
  ],
  providers: [provideNativeDateAdapter()],
  templateUrl: './formulario-pedido.html',
  styleUrl: './formulario-pedido.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FormularioPedido {
  private fb = inject(FormBuilder);
  private router = inject(Router);
  private pedido = inject(Pedido);
  #ref = inject(DestroyRef);
  readonly dialogRef = inject(MatDialogRef<FormularioPedido>);
  readonly data = inject(MAT_DIALOG_DATA, { optional: true });
  private pedidoAEditar = signal<PedidoDisplay | null>(null);
  // Inputs para modo edición
  //Signal
  totalItems = signal(0);
  totalPedido = signal(0);
  totalRentabilidad = signal(0);
  // Computed
  clientes = computed(() => this.pedido.ObtenerCliente.value());
  productos = computed(() => this.pedido.ObtenerProducto.value());

  // Estado del formulario
  isLoading = signal(false);
  isEditMode = signal(false);
  // Computed signals
  detallesArray = computed(() => {
    const formArray = this.pedidoForm.get('detalles') as FormArray;
    return formArray.controls;
  });

  // Formulario reactivo
  pedidoForm: FormGroup;

  // Configuración de la tabla
  displayedColumns = [
    'producto',
    'cantidad',
    'precioUnitario',
    'subtotal',
    'rentabilidad',
    'acciones',
  ];

  constructor() {
    this.pedidoForm = this.fb.group({
      clienteId: ['', Validators.required],
      fechaPedido: [new Date(), Validators.required],
      detalles: this.fb.array([]),
    });
    if (this.data?.pedido) {
      this.isEditMode.set(true);
      console.log('📝 Datos recibidos para edición:', this.data.pedido);
      this.pedidoAEditar.set(this.data.pedido);
    } else {
      console.log('➕ Estableciendo modo creación: FALSE');
      this.isEditMode.set(false);
    }
    // Effect para logging en desarrollo
    effect(() => {
      const pedidoData = this.pedidoAEditar();
      if (this.isEditMode() && pedidoData) {
        this.cargarPedidoParaEdicion();
      }
      console.log('📊 Estado del pedido:');
      console.log('- Total items:', this.totalItems());
      console.log('- Total monto:', this.totalPedido());
      console.log(
        '- Rentabilidad promedio:',
        this.totalRentabilidad().toFixed(2) + '%'
      );
    });
    this.setupReactiveCalculations();
  }

  ngOnInit() {}

  // Métodos para gestión de detalles
  get detallesFormArray(): FormArray {
    return this.pedidoForm.get('detalles') as FormArray;
  }

  agregarDetalle(): void {
    const detalleGroup = this.fb.group({
      productoId: ['', Validators.required],
      cantidad: [1, [Validators.required, Validators.min(1)]],
      precioUnitario: [0, [Validators.required, Validators.min(0)]],
      rentabilidad: [0],
    });

    this.detallesFormArray.push(detalleGroup);
  }

  eliminarDetalle(index: number): void {
    this.detallesFormArray.removeAt(index);
  }

  // Eventos de cambio
  onClienteChange(clienteId: number): void {
    console.log('Cliente seleccionado:', clienteId);
  }

  onFechaChange(fecha: Date | null): void {
    if (fecha) {
      console.log('Fecha seleccionada:', fecha.toISOString().split('T')[0]);
    }
  }

  onProductoChange(index: number, productoId: number): void {
    const producto = this.productos()!.find((p) => p.productoId === productoId);
    if (producto) {
      const detalleControl = this.detallesFormArray.at(index);
      detalleControl.get('precioUnitario')?.setValue(producto.precioVenta);
      this.calcularRentabilidadDetalle(index);
    }
  }

  onCantidadChange(index: number, cantidad: string): void {
    this.calcularRentabilidadDetalle(index);
  }

  onPrecioChange(index: number, precio: string): void {
    this.calcularRentabilidadDetalle(index);
  }

  // Cálculos
  calcularSubtotal(index: number): number {
    const detalle = this.detallesFormArray.at(index);
    const cantidad = detalle.get('cantidad')?.value || 0;
    const precio = detalle.get('precioUnitario')?.value || 0;
    return cantidad * precio;
  }

  calcularRentabilidad(index: number): number {
    const detalle = this.detallesFormArray.at(index);
    const productoId = detalle.get('productoId')?.value;
    const precioUnitario = detalle.get('precioUnitario')?.value || 0;

    const producto = this.productos()!.find((p) => p.productoId === productoId);
    if (!producto || !producto.costo || precioUnitario <= 0) return 0;

    const rentabilidad =
      ((precioUnitario - producto.costo) / precioUnitario) * 100;
    return Math.max(-100, Math.min(100, rentabilidad));
  }

  private calcularRentabilidadDetalle(index: number): void {
    const rentabilidad = this.calcularRentabilidad(index);
    const detalleControl = this.detallesFormArray.at(index);
    detalleControl
      .get('rentabilidad')
      ?.setValue(rentabilidad, { emitEvent: false });
  }

  // Clases CSS para rentabilidad
  getRentabilidadClass(rentabilidad: number): string {
    if (rentabilidad >= 40) return 'rentabilidad-alta';
    if (rentabilidad >= 20) return 'rentabilidad-media';
    return 'rentabilidad-baja';
  }

  getRentabilidadGlobalClass(): string {
    return this.getRentabilidadClass(this.totalRentabilidad());
  }
  private formatDateForBackend(date: Date): string {
    if (!date) return '';

    // Obtener componentes de fecha en zona horaria local
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');

    return `${year}-${month}-${day}`;
  }

  // Acciones del formulario
  onSubmit(): void {
    if (this.pedidoForm.valid && this.detallesFormArray.length > 0) {
      this.isLoading.set(true);
      const fechaFormulario = this.pedidoForm.value.fechaPedido;
      const pedidoData: PedidoForm = {
        clienteId: this.pedidoForm.value.clienteId,
        fechaPedido: this.formatDateForBackend(fechaFormulario),
        total: this.totalPedido(),
        detalles: this.detallesFormArray.controls.map((control, index) => ({
          productoId: control.get('productoId')?.value,
          cantidad: control.get('cantidad')?.value,
          precioUnitario: control.get('precioUnitario')?.value,
          rentabilidad: this.calcularRentabilidad(index),
        })),
      };

      if (this.isEditMode()) {
        const pedidoActualizar: PedidoRequest = {
          clienteId: this.pedidoForm.value.clienteId,
          fechaPedido: new Date(this.pedidoForm.value.fechaPedido)
            .toISOString()
            .split('T')[0], // del form, no del original
          total: this.totalPedido(), // calculado o del form
          detalles: this.pedidoForm.value.detalles.map((detalle: any) => ({
            productoId: detalle.productoId,
            cantidad: detalle.cantidad,
            precioUnitario: detalle.precioUnitario,
            rentabilidad: detalle.rentabilidad,
          })),
        };
        this.pedido
          .actualizarPedido(this.pedidoAEditar()?.pedidoId!, pedidoActualizar)
          .subscribe({
            next: (response) => {
              console.log('✅ Pedido actualizado exitosamente:', response);
              this.pedido.ObtenerPedidos.reload();
              this.dialogRef.close(true);
              this.isLoading.set(false);
            },
            error: (error) => {
              console.error('❌ Error al actualizar pedido:', error);
              this.isLoading.set(false);
            },
          });
      } else {
        console.log('🚀 Creando nuevo pedido:', pedidoData);

        this.pedido.crearPedidos(pedidoData).subscribe({
          next: (response) => {
            console.log('✅ Pedido creado exitosamente:', response);
            this.pedido.ObtenerPedidos.reload();
            this.dialogRef.close(true);
            this.isLoading.set(false);
          },
          error: (error) => {
            console.error('❌ Error al crear pedido:', error);
            this.isLoading.set(false);
          },
        });
      }
    }
  }

  onVolver(): void {
    this.router.navigate(['/pedidos']);
  }
  //Mapeos
  private obtenerClienteIdPorNombre(nombreCliente: string): number | null {
    const cliente = this.clientes()!.find((c) => c.nombre === nombreCliente);
    return cliente ? cliente.clienteId : null;
  }

  private obtenerProductoIdPorNombre(nombreProducto: string): number | null {
    const producto = this.productos()!.find((p) => p.nombre === nombreProducto);
    return producto ? producto.productoId : null;
  }
  private cargarPedidoParaEdicion(): void {
    const pedidoData = this.pedidoAEditar();
    if (!pedidoData) return;
    console.log('Cargando pedido para edición:', pedidoData);
    // Mapear nombre del cliente a clienteId
    const clienteId = this.obtenerClienteIdPorNombre(pedidoData.clienteNombre);
    if (!clienteId) {
      console.error(
        'No se pudo encontrar el cliente:',
        pedidoData.clienteNombre
      );
    }
    // Cargar datos de cabecera
    this.pedidoForm.patchValue({
      clienteId: clienteId,
      fechaPedido: new Date(pedidoData.fechaPedido),
    });

    // Limpiar detalles existentes
    const detallesArray = this.pedidoForm.get('detalles') as FormArray;
    while (detallesArray.length) {
      detallesArray.removeAt(0);
    }
    // Cargar detalles mapeando nombres de productos a IDs
    if (pedidoData.detalles && pedidoData.detalles.length > 0) {
      pedidoData.detalles.forEach((detalle) => {
        const productoId = this.obtenerProductoIdPorNombre(
          detalle.productoNombre
        );

        if (!productoId) {
          console.warn(
            'No se pudo encontrar el producto:',
            detalle.productoNombre
          );
          return;
        }

        const detalleGroup = this.fb.group({
          productoId: [productoId, Validators.required],
          cantidad: [
            detalle.cantidad,
            [Validators.required, Validators.min(1)],
          ],
          precioUnitario: [
            detalle.precioUnitario,
            [Validators.required, Validators.min(0)],
          ],
          rentabilidad: [detalle.rentabilidad || 0],
        });

        detallesArray.push(detalleGroup);
      });
    }

    // Forzar recálculo de totales
    this.recalcularTotales();
  }
  private setupReactiveCalculations(): void {
    // Escuchar cambios en el FormArray de detalles
    this.detallesFormArray.valueChanges
      .pipe(
        startWith(this.detallesFormArray.value), // Emitir valor inicial
        debounceTime(100), // Evitar cálculos excesivos
        takeUntilDestroyed(this.#ref)
      )
      .subscribe(() => {
        this.recalcularTotales();
      });
  }
  /**
   * Recalcula todos los totales de manera reactiva
   */
  private recalcularTotales(): void {
    const detalles = this.detallesFormArray.controls;
    if (detalles.length === 0) {
      this.totalItems.set(0);
      this.totalPedido.set(0);
      this.totalRentabilidad.set(0);
      return;
    }
    // Calcular total de items
    const items = detalles.reduce((total, control) => {
      const cantidad = control.get('cantidad')?.value || 0;
      return total + Number(cantidad);
    }, 0);

    // Calcular total del pedido
    const total = detalles.reduce((total, control, index) => {
      return total + this.calcularSubtotal(index);
    }, 0);

    // Calcular rentabilidad promedio
    const rentabilidades = detalles.map((_, index) =>
      this.calcularRentabilidad(index)
    );
    const rentabilidadValidas = rentabilidades.filter((r) => r > 0);
    const promedioRentabilidad =
      rentabilidadValidas.length > 0
        ? rentabilidadValidas.reduce((sum, r) => sum + r, 0) /
          rentabilidadValidas.length
        : 0;

    // Actualizar signals
    this.totalItems.set(items);
    this.totalPedido.set(total);
    this.totalRentabilidad.set(promedioRentabilidad);
  }
}

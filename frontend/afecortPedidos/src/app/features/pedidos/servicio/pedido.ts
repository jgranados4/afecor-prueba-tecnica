import { HttpClient, HttpHeaders, httpResource } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from 'src/environments/environment.development';
import {
  ClienteResponse,
  PedidoRequest,
  pedidoResponse,
  ProductoResponse,
} from '../interface/IPedidos';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class Pedido {
  private readonly API = environment.apiUrl;
  private readonly headers = new HttpHeaders({
    'Content-Type': 'application/json; charset=utf-8',
  });
  http = inject(HttpClient);
  ObtenerPedidos = httpResource<pedidoResponse>(() => `${this.API}/Pedidos`);
  ObtenerProducto = httpResource<ProductoResponse[]>(
    () => `${this.API}/Productos`
  );
  ObtenerCliente = httpResource<ClienteResponse[]>(
    () => `${this.API}/Clientes`
  );
  crearPedidos(datos: PedidoRequest) {
    return this.http.post(`${this.API}/Pedidos`, datos, {
      headers: this.headers,
    });
  }
  actualizarPedido(id: number, pedido: PedidoRequest): Observable<any> {
    return this.http.put(`${this.API}/Pedidos/${id}`, pedido);
  }
  eliminarPedido(id: number): Observable<void> {
    return this.http.delete<void>(`${this.API}/Pedidos/${id}`);
  }
}

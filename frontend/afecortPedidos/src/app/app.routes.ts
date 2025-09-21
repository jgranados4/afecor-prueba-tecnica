import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: 'pedidos',
    loadChildren: () =>
      import('./features/pedidos/pedido.routes').then((m) => m.Pedidoroutes),
  },
  { path: '**', redirectTo: 'pedidos' },
];

import { Routes } from '@angular/router';
import { ComandaComponent } from './comandas/comanda.component';
import { PedidosComponent } from './pedidos/pedidos.component';
import { IntercambiosComponent } from './intercambios/intercambios.component';
import { DeudasComponent } from './deudas/deudas.component';
import { ClientesComponent } from './clientes/clientes.component';
import { ProductosComponent } from './productos/productos.component';
import { InicioComponent } from './inicio/inicio.component';
import { EntradasComponent } from './entradas/entradas.component';
import { LoginComponent } from './autentica/login/login.component';
import { nodeguardGuard } from './autentica/nodeguard.guard';

export const routes: Routes = [
    {
        path: "",
        canActivate: [nodeguardGuard],
        component: InicioComponent,
        pathMatch: 'full'
    },
    {
        path: 'entrar',
        component: LoginComponent,
        data: {
            logueando: true
        }
    },
    {
        path: 'crear-comanda/crear',
        component: ComandaComponent,
        canActivate: [nodeguardGuard],
        data: {
            accion: 'crear'
        }
    },
    {
        path: 'crear-comanda/actualizar/:reserva',
        component: ComandaComponent,
        canActivate: [nodeguardGuard],
        data: {
            accion: 'actualizar'
        }
    },
    {
        path: 'crear-comanda/pagar/:reserva',
        component: ComandaComponent,
        canActivate: [nodeguardGuard],
        data: {
            accion: 'pagar'
        }
    },
    {
        path: 'deudas',
        canActivate: [nodeguardGuard],
        component: DeudasComponent
    },
    {
        path: 'deudas/:deudaid',
        canActivate: [nodeguardGuard],
        component: DeudasComponent
    },
    {
        path: 'intercambios',
        canActivate: [nodeguardGuard],
        component: IntercambiosComponent
    },
    {
        path: 'clientes',
        canActivate: [nodeguardGuard],
        component: ClientesComponent
    },
    {
        path: 'productos',
        canActivate: [nodeguardGuard],
        component: ProductosComponent
    },
    {
        path: 'pedidos',
        canActivate: [nodeguardGuard],
        component: PedidosComponent
    },
    {
        path: 'comandas',
        canActivate: [nodeguardGuard],
        component: EntradasComponent
    },
    {
        path: '*', canActivate: [nodeguardGuard], redirectTo: ''
    },
    {
        path: '**', canActivate: [nodeguardGuard], redirectTo: ''
    }
];

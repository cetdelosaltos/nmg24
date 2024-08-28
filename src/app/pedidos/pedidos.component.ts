import { Subscription } from 'rxjs';
import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, type OnInit } from '@angular/core';
import { NgbDatepickerModule, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ReservasService } from '../../servicios/reservas.service';
import { RouterModule } from '@angular/router';
import { PedidosModalComponent } from './pedidos-modal/pedidos-modal.component';
import { ClientesService } from '../../servicios/clientes.service';
import { FormsModule } from '@angular/forms';
import { DatosCompradorComponent } from './datos-comprador/datos-comprador.component';

@Component({
  selector: 'app-pedidos',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterModule,
    NgbDatepickerModule,
    DatosCompradorComponent
  ],
  templateUrl: './pedidos.component.html',
  styleUrls: ['./pedidos.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PedidosComponent implements OnInit {
  cargado: boolean = false;
  reservaciones: any = { pendientes: [], entregadas: [], vencidas: [] };
  reservacion: any;
  comprador: any;
  activo = 0;
  estatusConexion: boolean = false;
  filtraLocal: any = "Todas";
  estatusConexion$: Subscription = Subscription.EMPTY;
  completado: boolean = false;
  losprods: any;
  listafiltrada: any = 'todas';
  conexion: boolean = false;
  vencidas: any;
  activas: any;
  entregadas: any;
  filtrante: string = '';
  constructor(
    public app: ReservasService,
    public compra: ClientesService,
    private modal: NgbModal,
    private cambios: ChangeDetectorRef
  ) { }
  async ngOnInit(): Promise<void> {
    (await this.app.traerReservaciones()).subscribe((res: any) => {
      var palpote: any = { pendientes: [], vencidas: [], entregadas: [] };
      var hoynew = new Date();
      var hoyfor = hoynew.getFullYear() + '-' + (hoynew.getMonth() + 1) + '-' + hoynew.getDate();
      var hoy = Date.parse(hoyfor);
      console.log(res);
      res.forEach((item: any) => {
        let a: any = item;
        var reservita = a.reserva;
        let fechan = new Date(reservita.fechaDeEntrega);
        let fechanpanu = fechan.getFullYear() + '-' + (fechan.getMonth() + 1) + '-' + fechan.getDate();
        let fechau = Date.parse(fechanpanu);
        if (hoy <= fechau && (reservita.estatus == 'pendiente' || reservita.estatus == 'procesado')) {
          palpote.pendientes.push(a);
        }
        if (reservita.estatus == 'entregado') {
          palpote.entregadas.push(a);
        }
        if (hoy > fechau && reservita.estatus !== 'entregado' && reservita.estatus !== 'pagada') {
          palpote.vencidas.push(a);
        }
      });
      this.reservaciones = palpote;
      this.activas = this.reservaciones.pendientes.sort((a: any, b: any) => a.fecha - b.fecha);
      this.vencidas = this.reservaciones.vencidas.sort((b: any, a: any) => a.fecha - b.fecha);
      this.entregadas = this.reservaciones.entregadas.sort((b: any, a: any) => a.fecha - b.fecha);
      this.cambios.detectChanges();
    })
  }
  verReservacion(reserva: any) {
    var emerge = this.modal.open(PedidosModalComponent)
    emerge.componentInstance.reservacion = reserva;
    emerge.closed.subscribe(() => {

    })
  }
  filtrarLista(lista: any) {
    this.activas = this.reservaciones.pendientes.filter((u: any) => {
      return new RegExp(this.filtrante.normalize("NFD").replace(/[\u0300-\u036f]/g, ""), 'mi').test(u.cliente.nombre.normalize("NFD").replace(/[\u0300-\u036f]/g, "") + u.cliente.telefono);
    }
    )
  }
}

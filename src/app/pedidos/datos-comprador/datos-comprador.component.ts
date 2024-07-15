import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, Input, type OnInit } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { Subscription } from 'rxjs';
import { ConvertirFechaService } from '../../../servicios/convertirFecha.service';
import { PedidosModalComponent } from '../pedidos-modal/pedidos-modal.component';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'datos-comprador',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule
  ],
  templateUrl: './datos-comprador.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DatosCompradorComponent implements OnInit {

  @Input() pedido: any = [];
  estatusConexion: boolean = false;
  estatusConexion$: Subscription = Subscription.EMPTY;
  dia: any;
  hora: any;
  constructor(
    private modal: NgbModal,
    private fechas: ConvertirFechaService
  ) { }

  ngOnInit() {
    this.dia = this.fechas.fecha(this.pedido.reserva.fechaDeEntrega);
  }
  verReservacion(reserva: any) {
    var emerge = this.modal.open(PedidosModalComponent)
    emerge.componentInstance.reservacion = reserva;
    emerge.closed.subscribe(() => {
    })
  }
}


import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { NgbActiveModal, NgbModalModule } from '@ng-bootstrap/ng-bootstrap';
import { ReservasService } from '../../../servicios/reservas.service';
import { Router } from '@angular/router';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { TasaDeCambioService } from '../../../servicios/tasa-de-cambio.service';
import Swal from 'sweetalert2';
import { SocketService } from '../../../servicios/socket.service';

@Component({
  selector: 'app-pedidos-modal',
  standalone: true,
  imports: [
    CommonModule,
    NgbModalModule,
    RouterModule,
  ],
  templateUrl: './pedidos-modal.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PedidosModalComponent implements OnInit {
  reservacion: any;
  conexion: boolean = false;
  cargaEntregar: boolean = false;
  cargaEliminar: boolean = false;
  fecha: any = { dia: '', hora: '' };
  hora: any;
  total: any;
  tasadecambio: any = { fecha: '', tasa: 0 };
  totalbs: any = 0;
  esinter: boolean = false;
  constructor(
    private modo: NgbActiveModal,
    public app: ReservasService,
    public radio: SocketService,
    public ruta: Router,
    public rutica: ActivatedRoute,
    public tasa: TasaDeCambioService,
    public cambio: ChangeDetectorRef
  ) {
  }
  async ngOnInit(): Promise<void> {
    var hoyes = new Date(this.reservacion.reserva.fechaDeEntrega);
    this.fecha = hoyes.toLocaleString('es-VE');
    let cuenta: number = 0;

    this.reservacion.pedidos.map((pedido: any) => {

      let llevo = pedido.cantidad * pedido.producto.precio;
      cuenta += llevo;

    })
    this.total = cuenta;
    (await this.tasa.traerTDCEX()).subscribe((res: any) => {
      this.tasadecambio.tasa = res.promedio;
      this.tasadecambio.createdAt = res.fechaActualizacion
      this.totalbs = this.tasadecambio.tasa * this.reservacion.total
      this.cambio.detectChanges();
    })
  }
  telefonoComprador(telefono: any) {
    if (telefono) {
      if (telefono.startsWith('+')) {
        telefono = telefono.substring(1)
      }
      if (telefono.startsWith('04')) {
        var tele = telefono.substring(1)
        telefono = '58' + tele;
      }
      if (telefono.indexOf(' ') != -1) {
        telefono = telefono.replaceAll(' ', '');
      }
      if (telefono.indexOf('-') != -1) {
        telefono = telefono.replaceAll('-', '');
      }
      return telefono;
    }
  }

  async entregarPedido(llave: any) {
    this.cargaEntregar = true;
    await this.app.entregarReservacion(llave).then(
      (resp: any) => {
        resp.subscribe((reso: any) => {
          if (reso.entregado == 'entregado') {
            this.radio.emitirReserva('entregado')
          }
          this.modo.close('entregado');

        })
      }
    )
  }
  reactivarPedido(pedido: any) {
    this.cargaEntregar = true;
    /*     this.app.reactivarReservacion(pedido.$key).then((res: any) => {
          this.modo.close('actualizar')
        }) */
  }
  pagarReservacion(reserva: any) {
    this.modo.close('pagar');
  }
  eliminarReservacion(id: any) {
    Swal.fire({
      title: 'Eliminar Reservación',
      text: '¿Desea realmente eliminar esta reservación?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Eliminar Definitivamente',
      cancelButtonText: 'Cancelar',
      confirmButtonColor: '#bb2d3b'
    }).then((res: any) => {
      if (res.isConfirmed) {
        this.app.borrarReservacion(id).then((res: any) => {
          Swal.fire('Reservación Eliminada', undefined, 'success').then((res: any) => {
            this.radio.emitirReserva('cambio');
            this.modo.close('actualizar')
          });
        })
      }
    })
  }
  cerramodo() {
    this.modo.close('actualizar')
  }
}

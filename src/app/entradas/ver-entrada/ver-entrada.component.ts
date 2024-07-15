
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
  templateUrl: './ver-entrada.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class VerEntradaComponent implements OnInit {
  reservacion: any;
  conexion: boolean = false;
  cargaEntregar: boolean = false;
  cargaEliminar: boolean = false;
  fecha: any = { dia: '', hora: '' };
  hora: any;
  total: any;
  tasadecambio: any = [];
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
    (await this.tasa.traerTDCEX()).subscribe((res: any) => {
      this.tasadecambio.tasa = res.promedio;
      this.tasadecambio.createdAt = res.fechaActualizacion
      this.cambio.detectChanges();
    })
    var hoyes = new Date(this.reservacion.createdAt);
    this.fecha = hoyes.toLocaleString('es-VE');
    let cuenta: number = 0;
    this.reservacion.comanda.pedidos.map((pedido: any) => {
      let llevo = Number(pedido.cantidad) * Number(pedido.precio);
      cuenta += llevo;
    })
    this.total = cuenta;
    this.totalbs = Number(this.tasadecambio.tasa) * cuenta;
    this.cambio.detectChanges()
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
    const pasado = { estatus: 'entregado' }
    this.app.entregarReservacion(llave).then(
      (resp: any) => {
        this.modo.close('entregado');
      }
    )
  }
  reactivarPedido(pedido: any) {
    this.cargaEntregar = true;
    /*    this.app.reactivarReservacion(pedido.$key).then((res: any) => {
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
          this.radio.emitirReserva('cambio');
          Swal.fire('Reservación Eliminada', undefined, 'success').then((res: any) => {
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

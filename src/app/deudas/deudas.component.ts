import { CommonModule, Location } from '@angular/common';
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Input, signal, type OnInit } from '@angular/core';
import { ComandasService } from '../../servicios/comandas.service';
import { RouterModule } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { TasaDeCambioService } from '../../servicios/tasa-de-cambio.service';
import { PagarDeudaComponent } from './pagar-deuda/pagar-deuda.component';
import { SocketService } from '../../servicios/socket.service';
import { Pagos } from '../../interfaces/pagos';
import { Tasadecambio } from '../../interfaces/tasadecambio';

@Component({
  selector: 'app-deudas',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule
  ],
  templateUrl: './deudas.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DeudasComponent implements OnInit {
  @Input() deudaid: any;

  deudas = signal([{
    id: 0,
    clienteId: 0,
    locacion: '',
    estatus: '',
    total: '',
    createdAt: '',
    updatedAt: '',
    cliente: {
      id: 0,
      nombre: '',
      telefono: '',
      correo: '',
      createdAt: '',
      updatedAt: '',
      intercambios: [
        {
          id: 0,
          clienteId: 0,
          monto: '',
          descripcion: '',
          estatus: '',
          createdAt: '',
          updatedAt: ''
        }
      ],
      pagos: [
        {
          id: 0,
          clienteId: 0,
          comandaId: 0,
          monto: '',
          metodoDePago: '',
          tasadecambio: '',
          createdAt: '',
          updatedAt: ''
        }
      ]
    },
    pedidos: [
      {
        id: 0,
        comandaId: 0,
        cantidad: 0,
        observacion: '',
        producto: '',
        precio: '',
        estatus: '',
        createdAt: '',
        updatedAt: ''
      }
    ],
    reserva: null,
    pagos: [{
      id: 44,
      clienteId: 17,
      comandaId: 125,
      monto: '',
      metodoDePago: '',
      tasadecambio: '',
      createdAt: '',
      updatedAt: ''
    }],
    restadeuda: ''
  }]);
  titulo: string = "Deudas";
  montodeuda: number = 0;
  deudadetalle: any = [];
  lospagos: any = [];
  listactiva: any = 0;
  tasadeldia = signal({
    tasa: 0,
    createdAt: ''
  })
  constructor(
    private coman: ComandasService,
    private modo: NgbModal,
    private tdc: TasaDeCambioService,
    private radio: SocketService,
    private local: Location
  ) {
  }
  async ngOnInit(): Promise<void> {
    (await this.tdc.traerTDCEX()).subscribe((tas: any) => {
      if (tas) {
        var tasiencia: Tasadecambio = { tasa: tas.promedio, createdAt: tas.fechaActualizacion }
        this.tasadeldia.set(tasiencia);
      }
    });
    (await this.coman.traerDeudas()).subscribe({
      next: (res: any) => {
        if (res.code || res.length == 0) {
          this.titulo = "No hay Deudas"
          return
        } else {
          this.titulo = "Deudas";
          // calcular cuanto falta
          var deudafront: any = [];
          var palpago: any = [];
          res.forEach((deu: any) => {
            var estadeuda: any = deu;
            if (deu.pagos && deu.pagos.length > 0) {
              var vanpagos: number = 0;
              var estepago: any;
              var nuevospagos: any = [];
              deu.pagos.forEach((pago: any) => {
                estepago = pago;
                estepago.metodoDePago = pago.metodoDePago ? JSON.parse(pago.metodoDePago) : undefined;
                nuevospagos.push(estepago);
                vanpagos += Number(pago.monto);
              });
              estadeuda.pagos = nuevospagos;
              estadeuda.restadeuda = deu.total - vanpagos;
            } else {
              estadeuda.restadeuda = deu.total
            }
            deudafront.push(estadeuda);
          });
        }
        this.lospagos = deudafront;
        this.deudas.set(deudafront);
        var llevala = 1;
        if (this.deudaid) {
          this.deudas().filter((deudita: any) => {
            if (this.deudaid == deudita.id) {
              this.deudadetalle = deudita;
              this.listactiva = llevala
            }
            llevala++;

          })
        }
      }, error: (erro) => {
      }
    })
    await this.radio.oirReserva().subscribe(async (radiores) => {
      (await this.coman.traerDeudas()).subscribe((res: any) => {
        if (res.code || res.length == 0) {
          this.titulo = "No hay Deudas"
          return
        } else {
          this.titulo = "Deudas";
          // calcular cuanto falta
          var deudafront: any = [];
          var palpago: any = [];
          res.forEach((deu: any) => {
            var estadeuda: any = deu;
            if (deu.pagos && deu.pagos.length > 0) {
              var vanpagos: number = 0;
              var estepago: any;
              deu.pagos.forEach((pago: any) => {
                estepago = pago;
                estepago.metodoDePago = pago.metodoDePago ? JSON.parse(pago.metodoDePago) : undefined;
                palpago.push(estepago);
                vanpagos += Number(pago.monto);
              });
              estadeuda.restadeuda = deu.total - vanpagos;
            } else {
              estadeuda.restadeuda = deu.total
            }
            deudafront.push(estadeuda);
          });
          this.lospagos = deudafront;
          this.deudas.set(deudafront);
        }
      })
    });

  }
  verDeuda(detalles: any, index: number) {
    this.deudadetalle = detalles;
    this.listactiva = index + 1
    this.local.go('deudas/' + detalles.id)
  }
  hacerPago(reserva: any) {
    var paguito = this.modo.open(PagarDeudaComponent, { size: 'lg' });
    paguito.componentInstance.principal = reserva;
    paguito.componentInstance.pedidos = reserva.pedidos;
    paguito.componentInstance.cliente = reserva.cliente;
    paguito.componentInstance.total = reserva.total;
    paguito.componentInstance.tasadeldia = this.tasadeldia;
    paguito.closed.subscribe(() => {
      this.radio.emitirReserva('cambio');
    })
  }
  filtrar(llegando: any) {
    var filtrados = Object.assign([], this.lospagos).filter(
      (item: any) => {
        return new RegExp(llegando.normalize("NFD").replace(/[\u0300-\u036f]/g, ""), 'mi').test(item.cliente.nombre.normalize("NFD").replace(/[\u0300-\u036f]/g, ""));
      }
    )
    this.deudas.set(filtrados);
  }
  verTodos() {
    this.deudas.set(this.lospagos)
  }
}

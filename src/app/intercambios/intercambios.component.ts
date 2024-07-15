import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, signal, type OnInit } from '@angular/core';
import { NgbModal, NgbModalModule } from '@ng-bootstrap/ng-bootstrap';
import { CrearIntercambioComponent } from './crear-intercambio/crear-intercambio.component';
import { IntercambiosService } from '../../servicios/intercambios.service';
import { PedidosModalComponent } from '../pedidos/pedidos-modal/pedidos-modal.component';
import Swal from 'sweetalert2';
import { SocketService } from '../../servicios/socket.service';
import { ComandasService } from '../../servicios/comandas.service';

@Component({
  selector: 'app-intercambios',
  standalone: true,
  imports: [
    CommonModule,
    NgbModalModule
  ],
  templateUrl: './intercambios.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class IntercambiosComponent implements OnInit {
  intercambios = signal([{
    correo: '',
    createdAt: '',
    deuda: 0,
    id: 0,
    nombre: '',
    telefono: '',
    updatedAt: '',
    intercambios: {
      clienteId: 0,
      createdAt: '',
      descripcion: '',
      estatus: '',
      id: 0,
      monto: '',
      updatedAt: '',
    },
    pagos: {
      clienteId: 0,
      comandaId: 0,
      createdAt: '',
      id: 0,
      metodoDePago: '',
      monto: '',
      tasadecambio: '',
      updatedAt: ''
    }
  }]);
  // public intercambios: any = [];
  listactiva: number = 0;
  public detalles: any = [];
  listatotal: any = [];
  constructor(
    private modo: NgbModal,
    private interc: IntercambiosService,
    private comanda: ComandasService,
    private radio: SocketService

  ) { }
  async ngOnInit(): Promise<void> {
    (await this.interc.traerIntercambios()).subscribe((res: any) => {
      if (!res.error) {
        var clientesidos: any = []
        res.forEach((clie: any) => {
          var pagopalfin: any = [];
          var clientestogo: any = {
          }
          var pagostotales: number = 0
          var intercambiostotales: number = 0
          // buscar pagos con intercambio


          if (clie.pagos.length > 0) {
            clie.pagos.forEach((pago: any) => {
              var buscalo: boolean = pago.metodoDePago.includes('Intercambio')
              if (buscalo == true) {
                pagopalfin.push(pago);
                pagostotales += Number(pago.monto)
              }
            });
          } else {
            pagostotales = 0
          }
          if (clie.intercambios.length > 0) {
            clie.intercambios.forEach((interc: any) => {
              intercambiostotales = intercambiostotales + Number(interc.monto)
            });
          } else {
            intercambiostotales = 0
          }
          var ledebo: number = intercambiostotales - pagostotales;
          clientestogo = clie;
          clientestogo.deuda = ledebo;
          clientestogo.pagos = pagopalfin;
          clientesidos.push(clientestogo)
          // restar los pagos
          // procesar datos del cliente
        });
        this.intercambios.set(clientesidos)
        this.listatotal = clientesidos;
      }
      this.detalles = [];
      // this.cambio.detectChanges();
    })
    await this.radio.oirReserva().subscribe(async () => {
      (await this.interc.traerIntercambios()).subscribe((res: any) => {
        if (!res.error) {
          var clientesidos: any = []
          res.forEach((clie: any) => {
            var pagopalfin: any = [];
            var clientestogo: any = {
            }
            var pagostotales: number = 0
            var intercambiostotales: number = 0
            // buscar pagos con intercambio


            if (clie.pagos.length > 0) {
              clie.pagos.forEach((pago: any) => {
                var buscalo = pago.metodoDePago.includes('Intercambio')
                if (buscalo == true) {
                  pagopalfin.push(pago);
                  pagostotales += Number(pago.monto)
                }
              });
            } else {
              pagostotales = 0
            }
            if (clie.intercambios.length > 0) {
              clie.intercambios.forEach((interc: any) => {
                intercambiostotales = intercambiostotales + Number(interc.monto)
              });
            } else {
              intercambiostotales = 0
            }
            var ledebo: number = intercambiostotales - pagostotales;
            clientestogo = clie;
            clientestogo.deuda = ledebo;
            clientestogo.pagos = pagopalfin;
            // restar los pagos
            // procesar datos del cliente
            clientesidos.push(clientestogo)
          });
          this.intercambios.set(clientesidos)
          this.listatotal = clientesidos;
        }
        this.detalles = [];
      })
    });

  }
  crearIntercambio() {
    var carga = this.modo.open(CrearIntercambioComponent);

  }
  verIntercambio(cambio: any, index: number) {
    this.listactiva = index + 1
    this.detalles = cambio;
  }
  async verEntrada(id: any) {
    (await this.comanda.traerReserva(id)).subscribe((res: any) => {
      if (res && res.id == id) {
        var emergente = this.modo.open(PedidosModalComponent);
        emergente.componentInstance.reservacion = res;
        emergente.componentInstance.esinter = true;
      }
    })
  }
  eliminarIntercambio(id: any) {
    Swal.fire({
      title: 'ESTA OPERACIÓN NO SE PUEDE REVERTIR',
      text: 'Una vez borrado el intercambio, no se puede revertir y puede afectar el cálculo de los pagos.',
      showCancelButton: true,
      showDenyButton: true,
      confirmButtonColor: 'red',
      denyButtonColor: 'green',
      icon: 'warning'
    }).then(async (res: any) => {
      if (res.isConfirmed) {
        Swal.close();
        Swal.fire({
          title: 'Borrando Intercambio',
          text: '',
          icon: 'warning',
          iconColor: 'red',
          showConfirmButton: false,
          allowOutsideClick: false,
          allowEnterKey: false,
        });
        (await this.interc.borrarIntercambio(id)).subscribe((res: any) => {
          Swal.close();
          if (res.error) {
            Swal.fire('ERROR', 'Hubo un problema procesando el borrado. Intente más tarde', 'warning');
          } else {
            Swal.fire('Borrado', '', 'success');
            this.radio.emitirReserva('cambio')
          }
        })

      }
    })
  }
  filtrar(llegando: any) {
    var filtrados = Object.assign([], this.listatotal).filter(
      (item: any) => {
        return new RegExp(llegando.normalize("NFD").replace(/[\u0300-\u036f]/g, ""), 'mi').test(item.nombre.normalize("NFD").replace(/[\u0300-\u036f]/g, ""));
      }
    )
    this.intercambios.set(filtrados);
  }
  verTodos() {
    this.intercambios.set(this.listatotal)
  }
}

import { CommonModule, CurrencyPipe } from '@angular/common';
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, type OnInit } from '@angular/core';
import { ComandasService } from '../../../servicios/comandas.service';
import { FormBuilder, FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { IntercambiosService } from '../../../servicios/intercambios.service';
import Swal from 'sweetalert2';
import { Pedido } from '../../../interfaces/pedido';
import { Comanda } from '../../../interfaces/comanda';
import { Reserva } from '../../../interfaces/reserva';
import { Pagos } from '../../../interfaces/pagos';

@Component({
  selector: 'app-crear-pago',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,

  ],
  providers: [CurrencyPipe],
  templateUrl: './crear-pago.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CrearPagoComponent implements OnInit {
  datosPago: any = [];
  principal: any = [];
  pedidos: any = [];
  cliente: any = [];
  reservacion: any = [];
  planillaPago: any = [];
  metodosDePago: any = [];
  total: number = 0;
  tasadeldia: any = [];
  intercambio: boolean = false;
  moneda: any = 'usd';
  valido: boolean = false;
  cuantopago: any = 'suficiente';
  cuantofalta: number = 0;
  totalbsd: any;
  totalusd: any;
  estado: any;
  montoint: number = 0;
  pagoconinterc: boolean = false;
  mensaje: string = "Confirme los Datos y seleccione al menos 1(un) Método de Pago";
  mismafecha: boolean = true;
  metodoshtml: any = [
    {
      control: 'usd_cash',
      nombre: 'USD Cash'
    },
    {
      control: 'efectivo_bs',
      nombre: 'Efectivo Bs'
    },
    {
      control: 'pago_movil',
      nombre: 'Pago Móvil'
    },
    {
      control: 'zelle',
      nombre: 'Zelle'
    },
    {
      control: 'paypal',
      nombre: 'Paypal'
    },
    {
      control: 'zinli',
      nombre: 'Zinli'
    },
    {
      control: 'caja',
      nombre: 'Caja'
    }
  ]
  constructor(
    private fb: FormBuilder,
    public modoAct: NgbActiveModal,
    private comanda: ComandasService,
    private cambios: ChangeDetectorRef,
  ) {
    const pretotalbs = this.total * this.tasadeldia.tasa
    const totalbs = Number(pretotalbs.toFixed(2))
    this.metodosDePago = this.fb.group({
      usd_cash: [false],
      efectivo_bs: [false],
      pago_movil: [false],
      zelle: [false],
      paypal: [false],
      zinli: [false],
      caja: [false],
    })
    this.planillaPago = this.fb.group({
      comandaId: [this.datosPago.comanda_id],
      clienteId: [this.datosPago.cliente_id],
      tasa_del_dia: [this.tasadeldia],
      montoPagoUSD: [this.total],
      montoPagoBSD: [totalbs],
    })
  }
  async ngOnInit(): Promise<void> {
    if (this.cliente.intercambios.length > 0) {
      var intermontos = 0;
      var interpagos = 0;
      this.cliente.intercambios.forEach((inti: any) => {

        intermontos += Number(inti.monto)
      });
      this.cliente.pagos.forEach((pago: any) => {
        var buscalo = pago.metodoDePago.includes('Intercambio')
        if (buscalo) {
          interpagos += Number(pago.monto)
        }
      });
      const lequedan = intermontos - interpagos
      this.montoint = lequedan;
      if (lequedan > 0) {
        this.metodosDePago.addControl('intercambio', new FormControl(false))
        this.metodoshtml.push({ control: 'intercambio', nombre: "Intercambio $" + lequedan })
      }
      this.intercambio = true;
    } else {
      this.intercambio = false;
    }
    this.calcularPago();
    this.cambios.detectChanges();
  }
  cerrarCrearPago() {
    this.modoAct.dismiss('cerrado');
  }
  abonarPago() {

  }
  async ingresarPago(inda: any) {
    var montoapagar: any;
    const lospagos = this.planillaPago.value;
    const losusd = lospagos.montoPagoUSD
    const losbsd = lospagos.montoPagoBSD
    var comandaes: string = 'reserva';
    var reservaes: string = 'pendiente';
    switch (inda) {
      case 'pago':
        comandaes = 'pago'
        reservaes = 'pagada'
        break;
      case 'pago-reserva':
        comandaes = 'pago'
        reservaes = 'pendiente'

        break;
      case 'deuda':
        comandaes = 'deuda'
        reservaes = 'pagada'

        break;
      case 'deuda-entregar':
        comandaes = 'deuda'
        reservaes = 'entregado'

        break;
      case 'deuda-reserva':
        comandaes = 'deuda'
        reservaes = 'pendiente'
        break;
      default:
        break;
    }
    const FechaTotal = this.datosPago.fecha_entrega + "T" + this.datosPago.hora_entrega;
    const fechautc = new Date(FechaTotal);
    const fechafinal = fechautc.toISOString();

    if (this.moneda == 'bsd') {
      const montoalcambio = losbsd / this.tasadeldia.tasa
      montoapagar = Number(montoalcambio.toFixed(2));
    } else {
      montoapagar = losusd;
    }

    var datacomanda: Comanda = {
      clienteId: this.cliente.id,
      locacion: this.datosPago.locacion,
      estatus: comandaes,
      total: Number(this.total).toFixed(2)
    }
    if (this.principal) {
      datacomanda.id = this.principal
    }
    (await this.comanda.meterComanda(datacomanda)).subscribe(async (comanda: any) => {
      this.pedidos.map(async (plan: any) => {
        var cadapedido: Pedido = {
          comandaId: comanda[0].id ? comanda[0].id : this.principal,
          cantidad: Number(plan.value.cantidad),
          observacion: plan.value.observacion,
          producto: plan.value.producto.nombre ? plan.value.producto.nombre : plan.controls.producto.value,
          precio: plan.value.producto.precio ? Number(plan.value.producto.precio).toFixed(2) : Number(plan.controls.precio.value).toFixed(2)
        }
        if (plan.value.id) {
          cadapedido.id = plan.value.id;
        }
        (await this.comanda.meterPedidos(cadapedido)).subscribe((pedido: any) => { });
      })
      var reserva: Reserva = {
        comandaId: comanda[0].id ? comanda[0].id : this.principal,
        fechaDeEntrega: fechafinal,
        estatus: reservaes
      };
      if (this.reservacion) {
        reserva.id = this.reservacion.id
      };
      (await this.comanda.meterReserva(reserva)).subscribe(async (res: any) => {
        var metodo: any = [];
        if (this.intercambio) {
          // restar del intercambio
          metodo = ['Intercambio']
        } else {
          var todosMetodos: any = this.metodosDePago.controls
          Object.keys(todosMetodos).forEach((metod: any) => {
            if (todosMetodos[metod].value) {
              var metidito = this.metodoshtml.filter((res: any) => {
                return res.control == metod ? res.nombre : null
              })
              metodo.push(metidito[0].nombre)
            }
          });
        }
        var palpago: Pagos = {
          clienteId: this.cliente.id,
          monto: montoapagar,
          metodoDePago: JSON.stringify(metodo),
          comandaId: comanda[0].id,
          tasadecambio: this.tasadeldia.tasa
        };
        (await this.comanda.meterPago(palpago)).subscribe((res: any) => {
          Swal.close();
          this.modoAct.close('exito');
        })

      })
    })
  }
  productoArray(paso: any) {
    return (typeof (paso) == 'string') ? false : true;
  }
  validarMetodoDePago(campito: any) {
    const metos = this.metodosDePago.value
    const nuevosmets = this.metodosDePago.controls;
    var metoval = false;
    if (campito == 'intercambio') {
      Object.keys(nuevosmets).forEach((metod: any) => {
        if (nuevosmets.intercambio.value == true) {
          if (metod !== 'intercambio') {
            nuevosmets[metod].disable();
            nuevosmets[metod].setValue(false);
            metoval = true;
          } else {
            nuevosmets.intercambio.enable()
            metoval = true;
          }
        } else {
          nuevosmets[metod].enable();
        }
      })
    } else {
      Object.keys(nuevosmets).forEach((met: any) => {
        const pasito = nuevosmets[met];
        pasito.enable();
        if (metos[met] == true) {
          metoval = true;
        }
      })
    }
    this.mensaje = (metoval) ? 'Confirme los Datos' : 'Confirme los Dtos  y seleccione al menos 1(un) Método de Pago'

    this.valido = metoval;
    this.calcularPago();
  }
  calcularPago() {
    const traigousd = this.planillaPago.controls.montoPagoUSD;
    const traigobsd = this.planillaPago.controls.montoPagoBSD;
    const totalbs = Number((this.tasadeldia.tasa * this.total).toFixed(2))
    const totalusd = Number((this.total).toFixed(2))
    var montodolar: number = 0;
    if (traigousd.value) {
      montodolar = Number((traigousd.value).toFixed(2))
    }
    const montobs = Number((traigobsd.value).toFixed(2))
    if (this.moneda === 'usd') {
      const llevobs = Number((montodolar * this.tasadeldia.tasa).toFixed(2))
      traigobsd.setValue(llevobs)
      this.cuantofalta = this.total - montodolar
      if (totalusd == montodolar) {
        this.cuantopago = 'suficiente'
        this.mensaje = 'Proceda al Pago'
      }
      if (totalusd < montodolar) {
        this.cuantopago = 'sobra'
      }
      if (totalusd > montodolar) {
        this.cuantopago = 'falta'
      }
    }
    if (this.moneda === 'bsd') {
      const llevous = Number((montobs / this.tasadeldia.tasa).toFixed(2))
      traigousd.setValue(llevous)
      this.cuantofalta = this.total - llevous
      this.totalusd = llevous;
      if (totalbs == montobs || this.cuantofalta == 0) {
        this.cuantopago = 'suficiente'
        this.mensaje = 'Proceda al Pago'
      }
      if (totalbs < montobs) {
        this.cuantopago = 'sobra'
      }
      if (totalbs > montobs) {
        this.cuantopago = 'falta'
      }
    }
    if (this.metodosDePago.controls.intercambio && this.metodosDePago.controls.intercambio.value == true) {

      if (montodolar > this.montoint || montodolar > totalusd) {
        this.cuantopago = 'sobra';
      }
      if (montodolar < totalusd) {
        this.cuantopago = 'falta';
      }
      if (montodolar == this.montoint) {
        if (montodolar < totalusd) {
          this.cuantopago = 'falta';
        } else {
          this.cuantopago = 'suficiente';
        }
      }
    }
    const FechaTotal = this.datosPago.fecha_entrega + "T" + this.datosPago.hora_entrega;
    var ahorita = new Date().toISOString();
    const fecha = new Date(FechaTotal).toISOString();
    if (ahorita >= fecha) {
      this.mismafecha = true;
    } else {
      this.mismafecha = false;
    }
  }
}

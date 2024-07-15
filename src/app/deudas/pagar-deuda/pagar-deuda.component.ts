import { CommonModule, CurrencyPipe } from '@angular/common';
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, type OnInit } from '@angular/core';
import { ComandasService } from '../../../servicios/comandas.service';
import { FormBuilder, FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { IntercambiosService } from '../../../servicios/intercambios.service';
import Swal from 'sweetalert2';
import { Comanda } from '../../../interfaces/comanda';
import { Pagos } from '../../../interfaces/pagos';
import { Reserva } from '../../../interfaces/reserva';
import { SocketService } from '../../../servicios/socket.service';

@Component({
  selector: 'app-pagar-deuda',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,

  ],
  providers: [CurrencyPipe],
  templateUrl: './pagar-deuda.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PagarDeudaComponent implements OnInit {
  principal: any = [];
  pedidos: any = [];
  cliente: any = [];
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
  montoint: number = 0;
  pagoconinterc: boolean = false;
  mensaje: string = "Confirme los Datos y seleccione al menos 1(un) Método de Pago";
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
      control: 'tarjeta_de_debito',
      nombre: 'Tarjeta de Débito'
    },
    {
      control: 'tarjeta_de_credito',
      nombre: 'Tarjeta de Crédito'
    }
  ]
  deuda: any = 0;
  constructor(
    private fb: FormBuilder,
    public modoAct: NgbActiveModal,
    private comanda: ComandasService,
    private radio: SocketService,
    private cambios: ChangeDetectorRef,
  ) {
    this.metodosDePago = this.fb.group({
      usd_cash: [false],
      efectivo_bs: [false],
      pago_movil: [false],
      zelle: [false],
      paypal: [false],
      zinli: [false],
      tarjeta_de_debito: [false],
      tarjeta_de_credito: [false],
    })
  }
  async ngOnInit(): Promise<void> {
    const pretotalbs = this.principal.restadeuda * this.tasadeldia.tasa
    const totalbs = Number(pretotalbs.toFixed(2))

    this.planillaPago = this.fb.group({
      comandaId: [this.principal.comandaId],
      clienteId: [this.principal.clienteId],
      tasa_del_dia: [this.tasadeldia],
      montoPagoUSD: [this.principal.restadeuda],
      montoPagoBSD: [totalbs],
    })
    if (this.cliente.intercambios) {
      var intermontos = 0;
      var interpagos = 0;
      this.cliente.intercambios.forEach((inti: any) => {

        intermontos += Number(inti.monto)
      });
      this.cliente.pagos.forEach((pago: any) => {
        interpagos += Number(pago.monto)
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
  async ingresarPago(inda: any) {
    var montoapagar: any;
    const lospagos = this.planillaPago.value;
    const losusd = lospagos.montoPagoUSD
    const losbsd = lospagos.montoPagoBSD
    if (this.moneda == 'bsd') {
      const montoalcambio = losbsd / this.tasadeldia.tasa
      montoapagar = Number(montoalcambio).toFixed(2);
    } else {
      montoapagar = Number(losusd).toFixed(2);
    }
    var datacomanda: Comanda = {
      id: this.principal.id,
      locacion: this.principal.locacion,
      estatus: 'deuda',
      clienteId: this.principal.cliente.id
    }
    var datareserva: Reserva = {
      id: this.principal.reserva.id,
      comandaId: this.principal.id,
      estatus: this.principal.reserva.estatus,
      fechaDeEntrega: this.principal.reserva.fechaDeEntrega,
    }
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
      comandaId: this.principal.id,
      monto: montoapagar,
      metodoDePago: JSON.stringify(metodo),
      tasadecambio: this.tasadeldia().tasa
    }
    if (this.cuantopago == 'suficiente') {
      datareserva.estatus = 'pagada';
      datacomanda.estatus = 'pago'
    }
    (await this.comanda.meterPago(palpago)).subscribe(async (res: any) => {
      (await this.comanda.actualizarComanda(datacomanda)).subscribe(async (comanda: any) => {
        (await this.comanda.meterReserva(datareserva)).subscribe((res: any) => { })
        Swal.close();
        this.modoAct.close('exito');
        this.radio.emitirReserva('cambio');
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
    const totalbs = Number((this.tasadeldia.tasa * this.total))
    const totalusd = Number(this.principal.restadeuda)
    const montodolar = Number(traigousd.value)
    const montobs = Number(traigobsd.value)
    if (this.moneda === 'usd') {
      const llevobs = Number((montodolar * this.tasadeldia.tasa)).toFixed(2)
      traigobsd.setValue(llevobs)
      this.cuantofalta = this.principal.restadeuda - montodolar
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
      this.cuantofalta = this.principal.restadeuda - llevous
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
    if (this.metodosDePago.controls.intercambio && this.metodosDePago.controls.intercambio.value) {
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
  }
}

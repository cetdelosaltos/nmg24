import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Injectable, signal, ViewEncapsulation, type OnInit } from '@angular/core';
import { NgbCalendar, NgbDate, NgbDateParserFormatter, NgbDateStruct, NgbDatepickerModule, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { TasaDeCambioService } from '../../servicios/tasa-de-cambio.service';
import { ReservasService } from '../../servicios/reservas.service';
import { Router, RouterModule } from '@angular/router';
import { PedidosModalComponent } from '../pedidos/pedidos-modal/pedidos-modal.component';
import { SocketService } from '../../servicios/socket.service';

@Component({
  selector: 'app-inicio',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    NgbDatepickerModule
  ],
  templateUrl: './inicio.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  styleUrl: './inicio.component.css'
})


export class InicioComponent implements OnInit {
  crudo: any = [];
  hoy: any;
  reservas: any = [];
  comandas: any = [];
  date: { year: number; month: number; } | undefined;
  locacion: any = "Tienda Física";
  todasReservas: any = [];
  contadorReloj: any;
  reloj: any = signal(new Date());
  fecha_final: any;
  tasadecambio: any = {};
  constructor(
    private modal: NgbModal,
    public ruta: Router,
    private calendar: NgbCalendar,
    private tasa: TasaDeCambioService,
    private app: ReservasService,
    public cambios: ChangeDetectorRef,
    private radio: SocketService,
    public formatter: NgbDateParserFormatter,

  ) {

  }

  async ngOnInit() {

    (await this.tasa.traerTDCEX()).subscribe((res: any) => {
      this.tasadecambio.tasa = res.promedio;
      this.tasadecambio.createdAt = res.fechaActualizacion
    })

    this.radio.oirReserva().subscribe(async (res: any) => {
      this.reservas = [];
      (await this.app.traerHomeEX()).subscribe(
        {
          next: res => {
            this.todasReservas = res;
            this.todasReservas.map((ras: any) => {
              const entrega = new Date(ras.reserva.fechaDeEntrega).toLocaleDateString('es-VE');
              const hoy = new Date().toLocaleDateString('es-VE');
              if (entrega === hoy) {
                this.reservas.push(ras)
              }
            })
            this.tienePedido(this.hoy);
            this.cambios.detectChanges();

          }, error: (err: any) => {
            if (err.error.message == 'MAMAMELO') {
              this.ruta.navigate(['/entrar']);
            }
          }
        }
      );
      await (await this.tasa.traerTDCEX()).subscribe((res: any) => {
        this.tasadecambio.tasa = res.promedio;
        this.tasadecambio.createdAt = res.fechaActualizacion
      })
      this.cambios.detectChanges();
    })
    this.hoy = this.traerHoy();
    (await this.app.traerHomeEX()).subscribe({
      next: (res: any) => {
        this.reservas = [];
        this.todasReservas = res;
        this.todasReservas.map((ras: any) => {
          const entrega = new Date(ras.reserva.fechaDeEntrega).toLocaleDateString();
          const hoy = new Date().toLocaleDateString();
          if (entrega === hoy) {
            this.reservas.push(ras)
          }
        })
        this.tienePedido(this.hoy);
        this.cambios.detectChanges();
      }, error: (err: any) => {
        if (err.error.message == 'MAMAMELO') {
          this.ruta.navigate(['/entrar']);
        }
      }
    })

    this.contadorReloj = setInterval(() => {
      this.reloj.set(new Date());
    }, 30000);


  }
  eshoy(fecha: any) {
    var diita = this.convertirFecha(fecha);
    if (diita == this.hoy) {
      return true;
    } else {
      return false;
    }
  }
  esFinde(fecha: NgbDate, selected: boolean, focused: boolean) {
    var diita: Date = new Date(fecha.year, fecha.month - 1, fecha.day);
    var clasita = ' ';
    if (diita.getDay() < 1) {
      clasita += 'text-primary '
    }
    if (diita.getDay() > 5 || diita.getDay() < 1) {
      clasita += 'bg-primary-subtle ';
    }
    if (selected) {
      clasita = 'bg-secondary '
    }
    if (focused) {
      clasita = 'bg-secondary '
    }
    if (this.eshoy(fecha)) {
      clasita = 'bg-primary text-white'
    }
    if (this.tienePedido(fecha)) {
      clasita = 'border bg-white '
    }
    return clasita;
  }
  traerHoy() {
    var elhoy = this.calendar.getToday();
    var hoyconv = this.convertirFecha(elhoy);
    this.hoy = hoyconv;
    return hoyconv;
  }
  fecha(tiempo: any) {
    var fechares = new Date(tiempo);
    const fecha = { year: fechares.getFullYear(), month: fechares.getMonth() + 1, day: fechares.getDate() };
    const anio = fecha.year;
    const mes = (fecha.month < 10) ? "0" + fecha.month : fecha.month;
    const dia = (fecha.day < 10) ? "0" + fecha.day : fecha.day;
    var retorno: any = { dia: [], hora: [] };
    retorno.dia = anio + "-" + mes + "-" + dia;
    retorno.hora = fechares.toLocaleString('en-US', { hour: 'numeric', minute: 'numeric', hour12: true });
    return retorno;
  }
  reservaenCal(eve: any) {
    var pedidos: any = [];
    this.todasReservas.map((element: any) => {
      const fechacomp = this.fecha(element.reserva.fechaDeEntrega);
      let fechaobj: any = [];
      if (typeof (eve) == 'object') {
        fechaobj = this.convertirFecha(eve);
      } else {
        fechaobj = eve;
      }
      if (fechaobj == fechacomp.dia) {
        pedidos.push(element)
      }
    });
    this.reservas = pedidos;
  }


  convertirFecha(fecha: any) {

    const anio = fecha.year;
    const mes = (fecha.month < 10) ? "0" + fecha.month : fecha.month;
    const dia = (fecha.day < 10) ? "0" + fecha.day : fecha.day;
    var eldia = anio + "-" + mes + "-" + dia;
    return eldia;
  }
  iniciarHome() {
    return
  }
  tienePedido(fecha: NgbDateStruct) {
    if (this.todasReservas) {
      var diita = this.convertirFecha(fecha);
      var retorno: boolean = false;

      for (var i = 0; i < this.todasReservas.length; i++) {
        var fechares = this.fecha(this.todasReservas[i].reserva.fechaDeEntrega);
        var fechacomp = fechares.dia;
        if (fechacomp == diita) {
          retorno = true;
        }
      }
      return retorno;
    } else {
      return false;
    }
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

  verReserva(reserva: any) {
    var emergente = this.modal.open(PedidosModalComponent)
    emergente.componentInstance.reservacion = reserva;
    emergente.closed.subscribe(() => {
      this.reservas = [];
    })
  }


  async procesarPedido(pedido: any, estatus: any) {
    var pasado;
    if (estatus === 'procesado') {
      pasado = (await this.app.estatusPedido(pedido, 'pendiente')).subscribe();
    }
    else {
      pasado = (await this.app.estatusPedido(pedido, 'procesado')).subscribe()
    }
    this.radio.emitirReserva('cambio')
  }

}

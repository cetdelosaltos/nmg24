import { CommonModule, CurrencyPipe, DatePipe } from '@angular/common';
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, ElementRef, ViewChild, type OnInit } from '@angular/core';
import { NgbCalendar, NgbDate, NgbDateParserFormatter, NgbModal, NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { ColumnMode, DatatableComponent, NgxDatatableModule, SelectionType } from '@swimlane/ngx-datatable';
import { Router } from '@angular/router';
import { PagosService } from '../../servicios/pagos.service';
import { isObject } from 'lodash';
import { TasaDeCambioService } from '../../servicios/tasa-de-cambio.service';
import { VerEntradaComponent } from './ver-entrada/ver-entrada.component';
import { SocketService } from '../../servicios/socket.service';

@Component({
  selector: 'app-entradas',
  standalone: true,
  providers: [
    CurrencyPipe,
    DatePipe,
  ],

  imports: [
    NgxDatatableModule,
    CommonModule,
    NgbModule
  ],
  templateUrl: './entradas.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EntradasComponent implements OnInit {
  @ViewChild(DatatableComponent) compras!: DatatableComponent;
  @ViewChild('compradorInput') compradorInput!: ElementRef;
  @ViewChild('metodoInput') metodoInput!: ElementRef;
  rows: any = [];
  columns: any = [];
/*   datatableElement: DataTableDirective;
 */  lista: any;
  hoyes: any = new Date();
  estemes: any = this.hoyes.getMonth() + 1;
  esteanio: any = this.hoyes.getYear();

  /*   dtOptions: DataTables.Settings = {};
    dtTrigger: Subject<any> = new Subject<any>(); */
  tablacargada: boolean = false;
  selected: any = [];
  SelectionType = SelectionType;
  filitas: number = 10;
  ColumnMode = ColumnMode;
  hoveredDate: NgbDate | null = null;
  fromDate!: NgbDate | null;
  toDate!: NgbDate | null;
  hoy!: NgbDate;
  totaldeldia: number = 0;
  totaldelmes: number = 0;
  tasadecambio: number = 0;
  constructor(
    private pagos: PagosService,
    public ruta: Router,
    public moda: NgbModal,
    public moneda: CurrencyPipe,
    private radio: SocketService,
    public fechacon: DatePipe,
    private calendar: NgbCalendar,
    public formatter: NgbDateParserFormatter,
    public tdc: TasaDeCambioService,
    public cambio: ChangeDetectorRef
  ) {

  }
  async ngOnInit(): Promise<void> {
    this.fromDate = this.calendar.getToday();
    this.toDate = this.calendar.getToday();
    this.hoy = this.calendar.getToday();

    (await this.tdc.traerTDCEX()).subscribe((tas: any) => {
      if (tas) {
        this.tasadecambio = tas.promedio;
      }
    });
    (await this.pagos.traerPagos()).subscribe((data: any) => {
      this.lista = [];
      var ao = 1;
      var b: any = [];
      this.totaldeldia = 0;
      this.totaldelmes = 0;
      data.forEach((item: any) => {
        let a: any = item;
        const fechaventa = new Date(a.createdAt);
        const fechacompuesta = fechaventa.getFullYear() + '/' + (fechaventa.getMonth() + 1) + '/' + fechaventa.getDate();
        const hoycompuesta = this.hoy.year + '/' + this.hoy.month + '/' + this.hoy.day;
        const totalbs = Number(a.monto) * Number(a.tasadecambio);
        var tasdeca = (a.tasadecambio) ? this.moneda.transform(a.tasadecambio, 'USD') : this.moneda.transform(a.totalbs / a.totalusd, "VEF");
        var palrow = {
          fecha: (a.createdAt) ? a.createdAt : 'Sin Fecha',
          comprador: (a.cliente.nombre) ? a.cliente.nombre : 'Sin Nombre',
          metodo: '',
          tasa: (tasdeca) ? tasdeca : 0,
          totalusd: (a.monto) ? Number(a.monto) : 0,
          totalbs: (totalbs) ? totalbs : 0,
          extra: []
        }
        if (fechacompuesta == hoycompuesta) {
          this.totaldeldia += palrow.totalusd
        }
        if (fechaventa.getFullYear() == this.hoy.year && (fechaventa.getMonth() + 1) == this.hoy.month) {
          this.totaldelmes += palrow.totalusd
        }
        const metodoArray: any[] = a.metodoDePago.replace("[", "").replace("]", "").split(",");
        if (metodoArray !== undefined && isObject(metodoArray)) {
          var i = 1;
          for (let key in metodoArray) {
            let child = metodoArray[key].replace('"', '').replace('"', '');
            var meti = child
            if (i < Object.keys(metodoArray).length) {
              meti += ' - ';
            }
            palrow.metodo += meti;
            i++;
            // Your Code
          }
        }
        var fechita = new Date(a.created_at);
        a.fechacompra = {};
        a.fechacompra.mes = fechita.getMonth() + 1;
        a.fechacompra.año = fechita.getFullYear();
        a.fechacompra.dia = fechita.getDate();
        a.id = item.id;
        palrow.extra = a;
        b.push(palrow);

        if (ao == data.length) {
          this.lista = b;
          this.dibujartabla(b);
        }
        ao++;
      })
      this.cambio.detectChanges()
    })
    this.radio.oirReserva().subscribe(async () => {
      (await this.pagos.traerPagos()).subscribe((data: any) => {
        this.lista = [];
        var ao = 1;
        var b: any = [];
        this.totaldeldia = 0;
        this.totaldelmes = 0;
        data.forEach((item: any) => {
          let a: any = item;
          const fechaventa = new Date(a.createdAt);
          const fechacompuesta = fechaventa.getFullYear() + '/' + (fechaventa.getMonth() + 1) + '/' + fechaventa.getDate();
          const hoycompuesta = this.hoy.year + '/' + this.hoy.month + '/' + this.hoy.day;
          const totalbs = Number(a.monto) * Number(a.tasadecambio);
          var tasdeca = (a.tasadecambio) ? this.moneda.transform(a.tasadecambio, 'USD') : this.moneda.transform(a.totalbs / a.totalusd, "VEF");
          var palrow = {
            fecha: (a.createdAt) ? a.createdAt : 'Sin Fecha',
            comprador: (a.cliente.nombre) ? a.cliente.nombre : 'Sin Nombre',
            metodo: '',
            tasa: (tasdeca) ? tasdeca : 0,
            totalusd: (a.monto) ? Number(a.monto) : 0,
            totalbs: (totalbs) ? totalbs : 0,
            extra: []
          }
          if (fechacompuesta == hoycompuesta) {
            this.totaldeldia += palrow.totalusd
          }
          if (fechaventa.getFullYear() == this.hoy.year && (fechaventa.getMonth() + 1) == this.hoy.month) {
            this.totaldelmes += palrow.totalusd
          }
          const metodoArray: any[] = a.metodoDePago.replace("[", "").replace("]", "").split(",");
          if (metodoArray !== undefined && isObject(metodoArray)) {
            var i = 1;
            for (let key in metodoArray) {
              let child = metodoArray[key].replace('"', '').replace('"', '');
              var meti = child
              if (i < Object.keys(metodoArray).length) {
                meti += ' - ';
              }
              palrow.metodo += meti;
              i++;
              // Your Code
            }
          }
          var fechita = new Date(a.created_at);
          a.fechacompra = {};
          a.fechacompra.mes = fechita.getMonth() + 1;
          a.fechacompra.año = fechita.getFullYear();
          a.fechacompra.dia = fechita.getDate();
          a.id = item.id;
          palrow.extra = a;
          b.push(palrow);

          if (ao == data.length) {
            this.lista = b;
            this.dibujartabla(b);
          }
          ao++;
        })
        this.cambio.detectChanges()
      })
    })
  }
  dibujartabla(b: any) {
    if (b !== this.lista) {
      this.rows = b;
      this.columns = [{ prop: 'fecha', name: "Fecha" }, { prop: 'comprador', name: 'Comprador' }, { prop: 'metodo', name: 'Método de Pago' }, { prop: 'tasa', name: "Tasa", sortable: false }, { prop: 'totalusd', name: "Total $", sortable: false }, { prop: 'totalbs', name: "Total Bs", sortable: false }];
    } else {
      this.rows = this.lista
    }
    this.tablacargada = true;
  }
  onDateSelection(res: NgbDate) {
    if (!this.fromDate && !this.toDate) {
      this.fromDate = res;
    } else if (this.fromDate && !this.toDate && res && res.after(this.fromDate)) {
      this.toDate = res;
    } else {
      this.toDate = null;
      this.fromDate = res;
    }
    const desde = new Date(this.fromDate.year, this.fromDate.month - 1, this.fromDate.day);
    const hasta = (this.toDate) ? new Date(this.toDate.year, this.toDate.month - 1, this.toDate.day) : this.hoyes;
    var porfecha = this.rows.filter((res: any) => {
      const acti = new Date(res.fecha);
      const actual = new Date(acti.getFullYear(), acti.getMonth(), acti.getDay());
      if (actual.getTime() >= desde.getTime() && actual.getTime() <= hasta.getTime()) {
        return res;
      }
    })
    this.dibujartabla(porfecha);
    if (this.toDate == null) {
      this.dibujartabla(this.lista);
    }
  }
  resetearTabla() {
    this.rows = this.lista;
    this.toDate = null;
    this.fromDate = null;
    this.compradorInput.nativeElement.value = "";
  }
  buscarComprador(event: any) {
    if (event.target.value) {
      const val: string = event.target.value;
      const temp = this.rows.filter((d: any) => {
        return new RegExp(val.normalize("NFD").replace(/[\u0300-\u036f]/g, ""), 'mi')
          .test(d.comprador.normalize("NFD").replace(/[\u0300-\u036f]/g, ""))
      });
      this.compras.offset = 0;
      this.dibujartabla(temp);
    } else {
      this.resetearTabla();
    }

  }
  cambiarFilas(e: any) {
    this.filitas = e.target.value;
  }
  verEntrada(entrada: any) {
    const venta = this.moda.open(VerEntradaComponent, { size: 'lg' })
    venta.componentInstance.reservacion = entrada.selected[0].extra;
  }
  validateInput(currentValue: NgbDate | null, input: string): NgbDate | null {
    const parsed = this.formatter.parse(input);
    return parsed && this.calendar.isValid(NgbDate.from(parsed)) ? NgbDate.from(parsed) : currentValue;
  }
  isHovered(date: NgbDate) {
    return (
      this.fromDate && !this.toDate && this.hoveredDate && date.after(this.fromDate) && date.before(this.hoveredDate)
    );
  }

  isInside(date: NgbDate) {
    return this.toDate && date.after(this.fromDate) && date.before(this.toDate);
  }

  isRange(date: NgbDate) {
    return (
      date.equals(this.fromDate) ||
      (this.toDate && date.equals(this.toDate)) ||
      this.isInside(date) ||
      this.isHovered(date)
    );
  }
  buscarMetodo(e: any) {
    if (e.target.value) {
      var newlista = this.lista.filter((res: any) => {
        if (res.metodo.indexOf(e.target.value) > -1) {
          return res;
        }
      })
      this.dibujartabla(newlista);
    } else {
      this.resetearTabla();
    }
  }
}

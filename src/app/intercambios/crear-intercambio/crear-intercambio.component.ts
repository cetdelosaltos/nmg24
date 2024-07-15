import { ClientesService } from './../../../servicios/clientes.service';
import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnChanges, SimpleChanges, type OnInit } from '@angular/core';
import { FormBuilder, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { NgbModalModule, NgbActiveModal, NgbTypeaheadModule } from '@ng-bootstrap/ng-bootstrap';
import { Clientes } from '../../../interfaces/clientes';
import { Observable, OperatorFunction, debounceTime, distinctUntilChanged, filter, map } from 'rxjs';
import { TasaDeCambioService } from '../../../servicios/tasa-de-cambio.service';
import { Intercambio } from '../../../interfaces/intercambio';
import { IntercambiosService } from '../../../servicios/intercambios.service';
import Swal from 'sweetalert2';
import { SocketService } from '../../../servicios/socket.service';

@Component({
  selector: 'app-crear-intercambio',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    NgbModalModule,
    NgbTypeaheadModule,
    ReactiveFormsModule
  ],
  templateUrl: './crear-intercambio.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CrearIntercambioComponent implements OnInit, OnChanges {
  planillaIntercambio: any = [];
  clientes: Clientes[] = [];
  filtrado: any;
  moneda: string = 'usd';
  totalusd: any = 0;
  cuantofalta: number = 0;
  tasadeldia: any = [];
  valido: boolean = false;
  mensaje: string = "Llena los campos";
  constructor(
    private modo: NgbActiveModal,
    private fb: FormBuilder,
    private radio: SocketService,
    private cliser: ClientesService,
    private tdc: TasaDeCambioService,
    private interc: IntercambiosService,
  ) { }
  async ngOnInit(): Promise<void> {
    this.planillaIntercambio = this.fb.group({
      clienteId: [0, Validators.required],
      montoBSD: [0, Validators.required],
      montoUSD: [0, Validators.required],
      descripcion: ['', Validators.required],
      estatus: ['abierto'],
    });

    (await this.cliser.traerClientes()).subscribe((res: any) => {
      this.clientes = res;
    });

    (await this.tdc.traerTDCEX()).subscribe((tas: any) => {
      if (tas) {
        this.tasadeldia.tasa = tas.promedio;
        this.tasadeldia.createdAt = tas.fechaActualizacion
      }
    });
    this.validarPlantilla();
  }
  ngOnChanges(changes: SimpleChanges): void {
    this.validarPlantilla();
  }

  validarPlantilla() {
    if (this.filtrado && this.planillaIntercambio.valid && this.planillaIntercambio.controls.montoUSD.value > 0) {
      this.valido = true;
      this.mensaje = "";
    } else {
      this.valido = false;
      this.mensaje = "Valide los Datos";
    }
  }
  cerrarModo() {
    this.modo.close('locierro')
  }
  async IngresarIntercambio() {
    if (this.valido) {
      this.valido = false;
      this.mensaje = "Procesando Intercambio";
      const datosinter = this.planillaIntercambio.value;
      var interlleva: Intercambio = {
        clienteId: this.filtrado.id,
        monto: Number(datosinter.montoUSD).toFixed(2),
        descripcion: datosinter.descripcion,
        estatus: 'abierto'
      };
      (await this.interc.meterIntercambio(interlleva)).subscribe((res: any) => {
        if (res) {
          this.radio.emitirReserva('cambio');
          this.modo.close();
        } else {
          Swal.fire('FALLO', 'Hubo un problema haciendo el registro', 'warning');
          this.modo.close();
        }

      })
    }
  }
  formatComprador = (comprador: Clientes) => comprador.nombre + " - " + comprador.telefono;
  buscarComprador: OperatorFunction<string, readonly Clientes[]> = (text$: Observable<string>) =>
    text$.pipe(
      debounceTime(200),
      distinctUntilChanged(),
      filter((term) => term.length >= 2),
      map((term) =>
        this.clientes.filter((comprador: Clientes) =>
          new RegExp(term.normalize("NFD").replace(/[\u0300-\u036f]/g, ""), 'mi')
            .test(comprador.nombre.normalize("NFD").replace(/[\u0300-\u036f]/g, "") + comprador.telefono)
        )
          .slice(0, 10)
      )
    );
  calcularPago() {
    const traigousd = this.planillaIntercambio.controls.montoUSD;
    const traigobsd = this.planillaIntercambio.controls.montoBSD;
    const totalbs = this.tasadeldia.tasa * this.totalusd;
    // const totalusd = this.totalbsd;
    const montodolar = traigousd.value;
    const montobs = traigobsd.value;
    if (this.moneda === 'usd') {
      const llevobs = Number((montodolar * this.tasadeldia.tasa).toFixed(2))
      traigobsd.setValue(llevobs)
      this.totalusd = montodolar;
    }
    if (this.moneda === 'bsd') {
      const llevous = Number((montobs / this.tasadeldia.tasa).toFixed(2))
      traigousd.setValue(llevous)
      this.totalusd = llevous;
    }
  }
}

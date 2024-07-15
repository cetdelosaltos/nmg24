import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, type OnInit } from '@angular/core';
import { FormBuilder, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { ClientesService } from '../../../servicios/clientes.service';
import { Clientes } from '../../../interfaces/clientes';
import { TelefonoService } from '../../../servicios/telefono.service';
import { SocketService } from '../../../servicios/socket.service';

@Component({
  selector: 'app-crear-cliente',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule
  ],
  templateUrl: './crear-cliente.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CrearClienteComponent implements OnInit {
  planillaComprador: any;
  mensaje: string = 'Llene los Campos';
  quehacer: string = 'actualizar';
  comprador: any;
  regreso: any;
  codigo: string = '58';
  operadora: string = '412';
  telefon: string = '0';
  constructor(
    private fb: FormBuilder,
    public modoAct: NgbActiveModal,
    private db: ClientesService,
    private telf: TelefonoService,
    private radio: SocketService
  ) { }
  ngOnInit(): void {
    if (this.comprador !== undefined) {
      var numtel = this.telf.limpiarTelefono(this.comprador.telefono);
      this.codigo = numtel.codigo ? String(numtel.codigo) : '58';
      this.operadora = numtel.operadora ? numtel.operadora : '412';
      this.telefon = numtel.telefon ? numtel.telefon : '0000000';
    }
    if (this.quehacer == 'actualizar') {
      this.planillaComprador = this.fb.group({
        id: [this.comprador.id, Validators.required],
        nombre: [this.comprador.nombre, Validators.required],
        telefono: this.fb.group({
          codigo: [this.codigo, Validators.required],
          operadora: [this.operadora, Validators.required],
          telefon: [this.telefon, Validators.required]
        }),
        correo: [this.comprador.correo]
      })
    } else {
      this.planillaComprador = this.fb.group({
        nombre: ['', Validators.required],
        telefono: this.fb.group({
          codigo: [58, Validators.required],
          operadora: ['412', Validators.required],
          telefon: [Number('0000000'), Validators.required]
        }),
        correo: ['']
      });
    }
  }
  async actualizarComprador() {
    if (this.planillaComprador.valid) {
      const compradorNuevo: Clientes = this.planillaComprador.value;
      const tele = this.telf.crearTelef(compradorNuevo.telefono);
      var nuevo: Clientes = {
        id: compradorNuevo.id,
        nombre: compradorNuevo.nombre,
        telefono: tele,
        correo: compradorNuevo.correo,
      };
      (await this.db.meterCliente(nuevo)).subscribe({
        next: (res: any) => {
          this.radio.emitirReserva('cambio');
          this.modoAct.close('exito');
        }
        , error: () => { }
      })
    } else {
      this.mensaje = "Revise sus Datos";
    }
  }
  borrarPlanilla() {
    this.planillaComprador.reset();
  }
  async registrarComprador() {
    if (this.planillaComprador.valid) {
      const compradorNuevo: Clientes = this.planillaComprador.value;
      const tele = this.telf.crearTelef(compradorNuevo.telefono);
      var nuevo: Clientes = {
        id: compradorNuevo.id,
        nombre: compradorNuevo.nombre,
        telefono: tele,
        correo: compradorNuevo.correo,
      };
      (await this.db.meterCliente(nuevo)).subscribe(
        (res: any) => {
          this.radio.emitirReserva("cambio");
          this.modoAct.close('exito');
        }
      )
    }
  }
  cerrarCrearComprador() {
    this.modoAct.close();
  }
  regresar() {
    this.modoAct.close(this.regreso)
  }
}

import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, type OnInit } from '@angular/core';
import { FormControl, ReactiveFormsModule, UntypedFormBuilder, Validators } from '@angular/forms';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { InputMaskModule, createMask } from '@ngneat/input-mask';
import { ProductosService } from '../../../servicios/productos.service';
import { Productos } from '../../../interfaces/productos';
import Swal from 'sweetalert2';
import { SocketService } from '../../../servicios/socket.service';

@Component({
  selector: 'app-crear-producto',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    InputMaskModule
  ],
  templateUrl: './crear-producto.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CrearProductoComponent implements OnInit {
  planillaProducto: any;
  mensaje: string = 'Llene los Campos';
  quehacer: string = 'actualizar';
  producto: any;
  public lalista: any;
  public listafinal: any;
  regreso: any;
  constructor(
    private fb: UntypedFormBuilder,
    public radio: SocketService,
    public modoAct: NgbActiveModal,
    private db: ProductosService,
    private cambios: ChangeDetectorRef
  ) {

  }
  async ngOnInit(): Promise<void> {
    if (this.quehacer == 'actualizar') {
      this.planillaProducto = this.fb.group({
        id: [this.producto.id, Validators.required],
        sku: [this.producto.sku, [Validators.required]],
        nombre: [this.producto.nombre, Validators.required],
        precio: [this.producto.precio, Validators.required]
      })
    } else {
      this.planillaProducto = this.fb.group({
        nombre: ['', Validators.required],
        sku: ['', [Validators.required, this.verificarSKU(this.lalista)]],
        precio: ['']
      });
    }
  }
  async actualizarProducto() {
    if (this.planillaProducto.valid) {
      var plani: Productos = this.planillaProducto.value
      const compradorNuevo: Productos = {
        id: plani.id,
        nombre: plani.nombre,
        precio: Number(plani.precio).toFixed(2),
        sku: plani.sku
      };
      (await this.db.meterProductos(compradorNuevo)).subscribe((res: any) => {
        this.modoAct.close('exito');
        this.radio.emitirReserva('cambio');
      })
    } else {
      this.mensaje = "Revise sus Datos";
    }
  }
  async crearProducto() {
    if (this.planillaProducto.valid) {
      var plani: Productos = this.planillaProducto.value
      const compradorNuevo: Productos = {
        nombre: plani.nombre,
        precio: Number(plani.precio).toFixed(2),
        sku: plani.sku
      };
      (await this.db.meterProductos(compradorNuevo)).subscribe((res: any) => {
        this.modoAct.close('exito');
        this.radio.emitirReserva('cambio');
      })
    } else {
      this.mensaje = "Revise sus Datos";
    }
  }
  borrarPlanilla() {
    this.planillaProducto.reset();
    this.quehacer = 'ingresar';
  }
  borrarProducto(producto: Productos) {
    this.modoAct.close('exito')
    Swal.fire({
      title: '¿Desea Eliminar el Producto?',
      text: `${producto.sku} - ${producto.nombre} - ${producto.id}`,
      showDenyButton: true,
      confirmButtonText: 'Eliminar',
      denyButtonText: 'Cancelar'
    }).then(
      async (res: any) => {
        if (res.isConfirmed && producto.id) {
          (await this.db.borrarProductos(producto)).subscribe((res: any) => {
            Swal.close();
            Swal.fire({
              title: 'Producto Eliminado',
            }).then(() => {
              Swal.close();
              this.radio.emitirReserva('cambio');
            })
          })
        }
      }
    )

  }
  verificarSKU(lista: any) {
    return function (input: FormControl) {
      if (input.value) {
        const yaes = lista.findIndex((x: any) => x.sku === input.value)
        if (yaes >= 0) {
          return { yaExiste: true };
        } else {
          return null;
        }
      } else {
        return null;
      }
    }
  }

  cerrarCrearComprador() {
    this.modoAct.close();
  }
  regresar() {
    this.modoAct.close(this.regreso)
  }
  currencyInputMask = createMask({
    alias: 'numeric',
    groupSeparator: '.',
    digits: 2,
    digitsOptional: false,
    prefix: '',
    placeholder: '0',
  });
}

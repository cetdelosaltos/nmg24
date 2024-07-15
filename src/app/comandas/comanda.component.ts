import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Input, type OnInit } from '@angular/core';
import { FormBuilder, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { Clientes } from '../../interfaces/clientes';
import { ClientesService } from '../../servicios/clientes.service';
import { NgbModal, NgbTypeaheadModule } from '@ng-bootstrap/ng-bootstrap';
import { Observable, OperatorFunction, debounceTime, distinctUntilChanged, filter, map } from 'rxjs';
import { Router, RouterModule } from '@angular/router';
import { Productos } from '../../interfaces/productos';
import { ProductosService } from '../../servicios/productos.service';
import { Hora24a12Pipe } from '../../pipes/hora24a12.pipe';
import { TasaDeCambioService } from '../../servicios/tasa-de-cambio.service';
import Swal from 'sweetalert2';
import { CrearClienteComponent } from '../clientes/crear-cliente/crear-cliente.component';
import { CrearProductoComponent } from '../productos/crear-producto/crear-producto.component';
import { ComandasService } from '../../servicios/comandas.service';
import { CrearPagoComponent } from '../pagos/crear-pago/crear-pago.component';
import { SocketService } from '../../servicios/socket.service';
import { Comanda } from '../../interfaces/comanda';
import { Pedido } from '../../interfaces/pedido';
import { Reserva } from '../../interfaces/reserva';
@Component({
  selector: 'app-comanda',
  standalone: true,
  imports: [CommonModule, NgbTypeaheadModule, FormsModule, RouterModule, ReactiveFormsModule, Hora24a12Pipe],
  templateUrl: './comanda.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ComandaComponent implements OnInit {
  @Input() reserva: any;
  @Input() accion: string = 'crear';

  cargado: boolean = true;
  planillaOtrosDatos: any = [];
  formularioPedidos: any = [];
  clientes: Clientes[] = [];
  productos: Productos[] = [];
  fechahoy: any = new Date();
  filtrado: any;
  tasadeldia: any = [];
  eltotal: number = 0.00;
  totalbs: number = 0.00;
  mensaje: string = "Llena Todos los Campos ";
  reservacion: any;
  reservaid: any = [];
  planivalido: boolean = false
  mismafecha: boolean = true
  constructor(
    private modo: NgbModal,
    private cliser: ClientesService,
    private proser: ProductosService,
    private comanda: ComandasService,
    private fb: FormBuilder,
    private ruta: Router,
    private tdc: TasaDeCambioService,
    private cambios: ChangeDetectorRef,
    private radio: SocketService
  ) {
    var hoya = new Date().toISOString();
    var tiempo = this.horaYFecha(hoya);
    this.planillaOtrosDatos = this.fb.group({
      fecha_entrega: [tiempo.dia, Validators.required],
      hora_entrega: [tiempo.hora, Validators.required],
      locacion: ['Tienda Física', Validators.required],
    })
  }

  async ngOnInit(): Promise<void> {
    (await this.tdc.traerTDCEX()).subscribe((tas: any) => {
      if (tas) {
        this.tasadeldia.tasa = tas.promedio;
        this.tasadeldia.createdAt = tas.fechaActualizacion
      }
    })
    this.formularioPedidos = [
      this.fb.group({
        id: [],
        cantidad: [1],
        producto: [[], Validators.required],
        precio: [, Validators.required],
        total: [, Validators.required],
        observacion: ['']
      })
    ];
    this.cambios.detectChanges();
    if (this.accion !== 'crear') {
      (await this.comanda.traerReserva(this.reserva)).subscribe((res: any) => {
        this.reservacion = res.reserva;
        if (res.estatus == 'deuda') {
          this.ruta.navigateByUrl('deudas/' + res.id);
          return;
        }
        this.filtrado = res.cliente;
        this.reservaid = res;
        var fecha = this.horaYFecha(res.reserva.fechaDeEntrega);
        this.planillaOtrosDatos.controls.fecha_entrega.setValue(fecha.dia)
        this.planillaOtrosDatos.controls.hora_entrega.setValue(fecha.hora)
        this.planillaOtrosDatos.controls.locacion.setValue(res.locacion)
        var pediditos: any = [];
        res.pedidos.forEach((ped: any) => {
          var palpedido = this.fb.group({
            id: [ped.id],
            cantidad: [ped.cantidad],
            producto: [{ nombre: ped.producto }, Validators.required],
            precio: [ped.precio, Validators.required],
            total: [ped.precio * ped.cantidad, Validators.required],
            observacion: [ped.observacion]
          })
          pediditos.push(palpedido);
        });
        this.formularioPedidos = pediditos;
        this.calcularTotal();
        this.validarPlanilla();
        this.cambios.detectChanges();
      })
    }
    (await this.cliser.traerClientes()).subscribe((res: any) => {
      this.clientes = res;
    });
    (await this.proser.traerProductos()).subscribe((res: any) => {
      this.productos = res;
    })
    this.radio.oirReserva().subscribe(async res => {

      (await this.cliser.traerClientes()).subscribe((res: any) => {
        this.clientes = res;
      });
      (await this.proser.traerProductos()).subscribe((res: any) => {
        this.productos = res;
      });
      if (this.accion == 'actualizar') {
        (await this.comanda.traerReserva(this.reserva)).subscribe((res: any) => {
          if (res && res.estatus == 'deuda') {
            this.ruta.navigate(['deudas']);
            return;
          }
          this.filtrado = res.cliente;
          this.reservaid = res;
          var fecha = this.horaYFecha(res.reserva.fechaDeEntrega);
          this.planillaOtrosDatos.controls.fecha_entrega.setValue(fecha.dia)
          this.planillaOtrosDatos.controls.hora_entrega.setValue(fecha.hora)
          this.planillaOtrosDatos.controls.locacion.setValue(res.locacion)
          var pediditos: any = [];
          res.pedidos.forEach((ped: any) => {
            var palpedido = this.fb.group({
              id: [ped.id],
              cantidad: [ped.cantidad],
              producto: [{ nombre: ped.producto }, Validators.required],
              precio: [ped.precio, Validators.required],
              total: [ped.precio * ped.cantidad, Validators.required],
              observacion: [ped.observacion]
            })
            pediditos.push(palpedido);
          });
          this.formularioPedidos = pediditos;
          this.calcularTotal();
          this.cambios.detectChanges();
        })
      }
    })
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
  formatoProd = (prodito: Productos) => prodito.nombre;
  buscarProductos: OperatorFunction<string, readonly Productos[]> = (text$: Observable<string>) =>
    text$.pipe(
      debounceTime(200),
      distinctUntilChanged(),
      filter((term) =>
        term.length >= 2
      ),
      map((term) =>
        this.productos.filter((producto: Productos) =>
          new RegExp(term.normalize("NFD").replace(/[\u0300-\u036f]/g, ""), 'gi')
            .test(producto.nombre.normalize("NFD").replace(/[\u0300-\u036f]/g, ""))
        )
          .slice(0, 10)
      )
    );
  async calcularTotal() {
    this.eltotal = 0;
    this.totalbs = 0;
    (await this.tdc.traerTDCEX()).subscribe((tas: any) => {
      if (tas) {
        this.tasadeldia.tasa = tas.promedio;
        this.tasadeldia.createdAt = tas.fechaActualizacion
        this.formularioPedidos.forEach((element: any) => {
          var elprecio = element.controls.cantidad.value * element.controls.precio.value
          element.controls.total.setValue(elprecio)
          this.eltotal += elprecio;
          this.totalbs = this.tasadeldia.tasa * this.eltotal;
        });
        this.cambios.detectChanges()
      }
    })
  }
  seleccionaProducto(produ: any, i: number) {
    this.formularioPedidos[i].controls.precio.setValue(produ.item.precio)
    this.formularioPedidos[i].controls.total.setValue(this.formularioPedidos[i].controls.cantidad.value * this.formularioPedidos[i].controls.precio.value)
    this.calcularTotal();
    this.validarPlanilla();
  }
  agregarFila() {
    this.formularioPedidos.push(this.fb.group({
      id: [],
      cantidad: [1],
      producto: [[], Validators.required],
      precio: [, Validators.required],
      total: [, Validators.required],
      observacion: [''],
    })
    )
  }
  borrarFila(toDelete: any) {
    let aux: any[] = [];
    if (toDelete.value.id !== null) {

      Swal.fire({
        title: 'Confirme que desea eliminar esta fila',
        icon: 'warning',
        iconColor: '#dc3545',
        confirmButtonColor: '#dc3545',
        confirmButtonText: 'Borrar',
        showCancelButton: true,
        cancelButtonColor: "gray"
      }).then(async (del: any) => {
        if (del.isConfirmed) {
          (await this.comanda.borrarPedido(toDelete.value.id)).subscribe((delm: any) => {
            if (delm.error) {
              Swal.close()
              Swal.fire('Hubo un problema procesando el pedido', '', 'error');
            } else {
              this.radio.emitirReserva('cambio');
              Swal.close();
            }
          })
        }
      })
    } else {
      for (let form of this.formularioPedidos) {
        if (toDelete !== form) {
          aux.push(form);
        }
      }
      this.formularioPedidos = aux;
      this.calcularTotal();
    }
/*    
 */  }
  validarPlanilla() {
    const planilla = this.formularioPedidos;
    var esvalido: boolean = true;
    const validito = planilla.map((res: any) => {
      if (!res.valid) {
        this.planivalido = false
        return false;
      } else {
        this.planivalido = true
        return true;
      }
    }
    );
    if (validito.indexOf(false) > -1 || this.planillaOtrosDatos.valid == false || !this.filtrado) {
      this.planivalido = false
      esvalido = false;
    } else {
      this.planivalido = true
      esvalido = true;
    }
    this.verificarFechas();
    return esvalido;

    //verificar las fecha

  }
  verificarFechas() {
    const otrosdatos = this.planillaOtrosDatos.value;
    const FechaTotal = otrosdatos.fecha_entrega + "T" + otrosdatos.hora_entrega;
    var ahorita = new Date().toISOString();
    const fecha = new Date(FechaTotal).toISOString();
    if (ahorita >= fecha) {
      this.mismafecha = true;
    } else {
      this.mismafecha = false;
    }
  }

  async hacerReservacion() {
    this.planivalido = this.validarPlanilla();
    if (this.planivalido && this.filtrado) {
      this.mensaje = "Procesando la Reservación.";
      Swal.fire({
        title: "Procesando la Comanda",
        showCancelButton: false,
        showConfirmButton: false,
      });
      const otrosdatos = this.planillaOtrosDatos.value;
      const FechaTotal = otrosdatos.fecha_entrega + "T" + otrosdatos.hora_entrega;
      const fechautc = new Date(FechaTotal);
      const fechafinal = fechautc.toISOString();

      // comanda es:       
      var datacomanda: Comanda = {
        clienteId: Number(this.filtrado.id),
        locacion: otrosdatos.locacion,
        estatus: 'reserva',
        total: Number(this.eltotal).toFixed(2),
      };
      (await this.comanda.meterComanda(datacomanda)).subscribe(async (comanda: any) => {
        Swal.close()
        Swal.fire({
          title: "Procesando el Pedido",
          showCancelButton: false,
          showConfirmButton: false,
        });

        this.formularioPedidos.map(async (plan: any) => {
          var cadapedido: Pedido = {
            comandaId: Number(comanda[0].id),
            cantidad: Number(plan.value.cantidad),
            observacion: plan.value.observacion,
            producto: plan.value.producto.nombre ? plan.value.producto.nombre : plan.controls.producto.value,
            precio: plan.value.producto.precio ? Number(plan.value.producto.precio).toFixed(2) : Number(plan.controls.precio.value).toFixed(2)
          };
          (await this.comanda.meterPedidos(cadapedido)).subscribe((pedido: any) => { })
        });
        // Meter la reserva
        var reserva: Reserva = {
          comandaId: Number(comanda[0].id),
          fechaDeEntrega: fechafinal,
          estatus: 'pendiente'
        };
        Swal.close()
        Swal.fire({
          title: "Haciendo la Reservación",
          showCancelButton: false,
          showConfirmButton: false,
        });
        (await this.comanda.meterReserva(reserva)).subscribe((res: any) => {
          if (!res.error) {
            Swal.close();
            this.ruta.navigate(['/'])
          } else {
            Swal.fire({
              title: "FALLO"
            })
          }
        });
      });
    }
  }

  pagarReservacion() {
    var paguito = this.modo.open(CrearPagoComponent, { size: 'lg' });
    paguito.componentInstance.principal = this.reserva;
    paguito.componentInstance.estado = 'pagar-reservar';
    paguito.componentInstance.datosPago = this.planillaOtrosDatos.value;
    paguito.componentInstance.reservacion = this.reservacion;
    paguito.componentInstance.pedidos = this.formularioPedidos;
    paguito.componentInstance.cliente = this.filtrado;
    paguito.componentInstance.total = this.eltotal;
    paguito.componentInstance.tasadeldia = this.tasadeldia;
    paguito.closed.subscribe(() => {
      this.ruta.navigate(['/'])
    })
    paguito.dismissed.subscribe(() => {
    })
  }
  async actualizarReservacion() {
    this.planivalido = this.validarPlanilla();
    if (this.planivalido && this.filtrado) {
      this.mensaje = "Procesando la Reservación.";
      Swal.fire({
        title: "Procesando la Reservación",
        showCancelButton: false,
        showConfirmButton: false,
      });
      const otrosdatos = this.planillaOtrosDatos.value;
      const FechaTotal = otrosdatos.fecha_entrega + "T" + otrosdatos.hora_entrega;
      const fechautc = new Date(FechaTotal);
      const fechafinal = fechautc.toISOString();
      var datacomanda: any = {
        clienteId: Number(this.filtrado.id),
        locacion: otrosdatos.locacion,
        estatus: 'reserva',
        total: Number(this.eltotal).toFixed(2),
      }
      datacomanda.id = Number(this.reserva);
      (await this.comanda.actualizarComanda(datacomanda)).subscribe(async (comanda: any) => {
        this.formularioPedidos.map(async (plan: any) => {
          var cadapedido: Pedido = {
            comandaId: Number(this.reserva),
            cantidad: Number(plan.value.cantidad),
            observacion: plan.value.observacion,
            producto: plan.value.producto.nombre ? plan.value.producto.nombre : plan.controls.producto.value,
            precio: plan.value.producto.precio ? Number(plan.value.producto.precio).toFixed(2) : Number(plan.controls.precio.value).toFixed(2)
          }
          if (plan.value.id) {
            cadapedido.id = plan.value.id;
          }
          (await this.comanda.meterPedidos(cadapedido)).subscribe(async (pedido: any) => { })
        })
        // Meter la reserva
        var reserva: Reserva = {
          id: this.reservaid.reserva.id,
          fechaDeEntrega: fechafinal,
          comandaId: this.reserva,
          estatus: 'pendiente'
        };
        (await this.comanda.meterReserva(reserva)).subscribe((resva: any) => {
          if (!resva.error) {
            Swal.close();
            this.radio.emitirReserva('cambio');
          } else {
            Swal.fire({
              title: "FALLO"
            })
          }
        })
      })
    }
  }
  ingresarCompradorModal() {
    const planilla = this.modo.open(CrearClienteComponent, { size: 'lg' });
    planilla.componentInstance.quehacer = 'ingresar';
    planilla.result.then((res: any) => {
      if (res == 'exito') {
        planilla.close();
        this.radio.emitirReserva('cambio');
      } else {
        Swal.fire({
          title: 'Hubo un Problema',
          text: 'No se pudo registrar al usuario',
          icon: 'warning'
        })
      }
    });
  }
  meterProducto() {
    this.modo.open(CrearProductoComponent, { size: 'lg' });
  }
  actualizarComprador(filtrado: Clientes) {
    const planilla = this.modo.open(CrearClienteComponent, { size: 'lg' });
    planilla.componentInstance.quehacer = 'actualizar';
    planilla.componentInstance.comprador = filtrado;
    planilla.result.then((res: any) => {
      if (res == 'exito') {
        planilla.close();
      } else {
        Swal.fire({
          title: 'Hubo un Problema',
          text: 'No se pudo registrar al usuario',
          icon: 'warning'
        })
      }
    });
  }
  horaYFecha(tiempo: any) {
    if (!tiempo) {
      var tiempoDate = new Date();
    }
    else {
      var tiempoDate = new Date(tiempo);

    }
    var anio = tiempoDate.getFullYear();
    var mes = tiempoDate.getMonth() + 1;
    var dia = tiempoDate.getDate();
    var newdia = (dia < 10) ? '0' + dia : dia;
    var newmes = (mes < 10) ? '0' + mes : mes
    var fechaplan = anio + '-' + newmes + '-' + newdia
    var horas = tiempoDate.getHours();
    var minutos = tiempoDate.getMinutes();
    var newhoras = (horas < 10) ? '0' + horas : horas
    var newminutos = (minutos < 10) ? '0' + minutos : minutos
    var horaplan = newhoras + ':' + newminutos + ':00';
    var palsali = { dia: fechaplan, hora: horaplan }
    return palsali
  }
}

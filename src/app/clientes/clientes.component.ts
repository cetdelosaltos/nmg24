import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, type OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { CrearClienteComponent } from './crear-cliente/crear-cliente.component';
import Swal from 'sweetalert2';
import { Clientes } from '../../interfaces/clientes';
import { ClientesService } from '../../servicios/clientes.service';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { SocketService } from '../../servicios/socket.service';

@Component({
  selector: 'app-clientes',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule
  ],
  templateUrl: './clientes.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ClientesComponent implements OnInit {
  cargado: boolean = false;
  compradores: any = [];
  compraBorra: any;
  filtrados: any = [];
  compraid: any = 0;
  completado: boolean = false;

  constructor(
    private compra: ClientesService,
    private radio: SocketService,
    private modo: NgbModal,
    public comprador: ActivatedRoute,
    public ruta: Router,
    public ruteo: ActivatedRoute,
    public cambios: ChangeDetectorRef
  ) {
  }
  async ngOnInit(): Promise<void> {
    (await this.compra.traerClientes()).subscribe((res: any) => {
      this.compradores = [];
      this.filtrados = [];
      var compris: any = [];
      res.forEach((item: any) => {
        let a: any = item;
        compris.push(a as Clientes);
      })
      this.compradores = compris;
      this.filtrados = compris;
      this.cambios.detectChanges()
    })
    await this.radio.oirReserva().subscribe(async () => {
      (await this.compra.traerClientes()).subscribe((res: any) => {
        this.compradores = [];
        this.filtrados = [];
        var compris: any = [];
        res.forEach((item: any) => {
          let a: any = item;
          compris.push(a as Clientes);
        })
        this.compradores = compris;
        this.filtrados = compris;
        this.cambios.detectChanges()
      })
    })
  }

  filtrar(llegando: any) {
    this.filtrados = Object.assign([], this.compradores).filter(
      (item: any) => {
        const haycorreo = (item?.correo?.toLowerCase().indexOf(llegando.toLowerCase()) > -1) ? item.correo.toLowerCase().indexOf(llegando.toLowerCase()) > -1 : false;
        const haytelefono = item.telefono.toLowerCase().indexOf(llegando.toLowerCase()) > -1;
        const haynombre = new RegExp(llegando.normalize("NFD").replace(/[\u0300-\u036f]/g, ""), 'mi').test(item.nombre.normalize("NFD").replace(/[\u0300-\u036f]/g, "") + item.telefono);
        if (haycorreo || haynombre || haytelefono) {
          return true;
        } else {
          return false;
        }
      }
    )
  }
  borrarCompradorModal(comprador: any) {
    this.compraBorra = comprador;
    Swal.fire({
      title: 'Realmente desea borrar a \r' + comprador.nombre,
      text: 'También se borrarán sus reservaciones y todos los datos asociados',
      icon: 'warning',
      showCancelButton: true,
      showConfirmButton: true,
      cancelButtonText: 'Cancelar',
      confirmButtonText: 'Eliminar Definitivamente'
    }).then(async (res: any) => {
      if (res.isConfirmed) {
        Swal.fire({
          title: 'Borrando a:' + comprador.nombre,
          text: 'Un momento por favor',
          icon: 'info',
          showCancelButton: false,
          showConfirmButton: false
        });
        (await this.compra.eliminarCliente(this.compraBorra)).subscribe(() => {
          Swal.close();
          this.radio.emitirReserva('cambio');
        })
      }
    })
  }
  actualizarCompradorModal(comprador: any) {
    const planilla = this.modo.open(CrearClienteComponent, { size: 'lg' });
    planilla.componentInstance.comprador = comprador;
    planilla.componentInstance.quehacer = 'actualizar';
    planilla.result.then((res: any) => {
      this.radio.emitirReserva('cambio')
    });
    planilla.closed.subscribe(() => {
    })
    planilla.dismissed.subscribe(() => {
    })
  }
  ingresarCompradorModal() {
    this.compraid = ""

    const planilla = this.modo.open(CrearClienteComponent, { size: 'lg' });
    planilla.componentInstance.quehacer = 'ingresar';
    planilla.result.then((res: any) => {
      this.radio.emitirReserva('cambio');
    });
    planilla.closed.subscribe(() => {
      this.radio.emitirReserva('cambio')
    })
    planilla.dismissed.subscribe(() => {
    })
  }

}

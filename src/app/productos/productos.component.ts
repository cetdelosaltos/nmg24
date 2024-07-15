import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, type OnInit } from '@angular/core';
import { ProductosService } from '../../servicios/productos.service';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { Productos } from '../../interfaces/productos';
import { CrearProductoComponent } from './crear-producto/crear-producto.component';
import { OrderByPipe } from '../../servicios/orderBy.pipe';
import { SocketService } from '../../servicios/socket.service';

@Component({
  selector: 'app-productos',
  standalone: true,
  imports: [
    CommonModule,
    OrderByPipe
  ],
  templateUrl: './productos.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProductosComponent implements OnInit {
  losproductos: any = [];
  filtrados: any;
  completado: boolean = false;
  productos: any;
  constructor(
    public produs: ProductosService,
    private radio: SocketService,
    public modo: NgbModal,
    public cambios: ChangeDetectorRef
  ) { }
  async ngOnInit(): Promise<void> {
    (await this.produs.traerProductos()).subscribe((res: any) => {
      this.losproductos = [];
      this.filtrados = [];
      var compris: any = [];
      res.forEach((item: any) => {
        let a: any = item;
        compris.push(a as Productos);
      })
      this.losproductos = compris;
      this.filtrados = compris;
      this.cambios.detectChanges()
    })
    await this.radio.oirReserva().subscribe(async () => {
      (await this.produs.traerProductos()).subscribe((res: any) => {
        this.losproductos = [];
        this.filtrados = [];
        var compris: any = [];
        res.forEach((item: any) => {
          let a: any = item;
          compris.push(a as Productos);
        })
        this.losproductos = compris;
        this.filtrados = compris;
        this.cambios.detectChanges()
      })
    })

  }
  filtrar(llegando: any) {
    this.filtrados = Object.assign([], this.losproductos).filter(
      (item: any) => {
        var haynombre = item.nombre.toLowerCase().indexOf(llegando.toLowerCase()) > -1;
        var haysku = item.sku.toLowerCase().indexOf(llegando.toLowerCase()) > -1;
        if (haynombre || haysku) {
          return true;
        } else {
          return false;
        }
      }
    )
  }
  verTodos() {
    this.filtrados = this.losproductos
  }
  agregarProducto() {
    const planilla = this.modo.open(CrearProductoComponent);
    planilla.componentInstance.quehacer = 'ingresar';
    planilla.componentInstance.lalista = this.losproductos;
    planilla.closed.subscribe(() => {
      this.radio.emitirReserva('cambio');
    })
  }
  editarProducto(producto: any) {
    const planilla = this.modo.open(CrearProductoComponent);
    planilla.componentInstance.quehacer = 'actualizar';
    planilla.componentInstance.producto = producto;
    planilla.componentInstance.lalista = this.losproductos;
  }
}

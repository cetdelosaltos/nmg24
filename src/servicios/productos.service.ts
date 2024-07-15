import { Injectable } from '@angular/core';
import { ExDBCon } from './conectorex';
import { Productos } from '../interfaces/productos';
import { HttpClient } from '@angular/common/http';
@Injectable({
  providedIn: 'root',
})
export class ProductosService {
  constructor(
    private url: ExDBCon,
    private exdb: HttpClient
  ) { }
  async traerProductos() {
    return await this.exdb.get(this.url.url('productos'), { headers: this.url.toque() });
  }
  async meterProductos(produ: Productos) {
    return await this.exdb.post(this.url.url('productos/crear'), produ, { headers: this.url.toque() });
  }
  async actualizarProductos(produ: Productos) {
    console.log(produ);
    return await this.exdb.post(this.url.url('productos/actualizar'), produ, { headers: this.url.toque() });
  }
  async borrarProductos(produ: Productos) {
    return await this.exdb.delete(this.url.url('productos/borrar'), { body: { id: produ.id }, headers: this.url.toque() });
  }
} 

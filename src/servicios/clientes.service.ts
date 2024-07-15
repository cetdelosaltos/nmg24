import { Injectable } from '@angular/core';
import { Clientes } from '../interfaces/clientes';
import { HttpClient } from '@angular/common/http';
import { ExDBCon } from './conectorex';
@Injectable({
  providedIn: 'root'
})
export class ClientesService {
  constructor(
    private url: ExDBCon,
    private exdb: HttpClient,
  ) { }
  async traerClientes() {
    // return await this.dbs.from('clientes').select();
    return await this.exdb.get(this.url.url('clientes'), { headers: this.url.toque() });
  }
  async meterCliente(planilla: Clientes) {
    return await this.exdb.post(this.url.url('clientes/crear'), planilla, { headers: this.url.toque() });
  }
  async eliminarCliente(cliente: any) {
    return await this.exdb.delete(this.url.url('clientes/borrar'), { body: { id: cliente.id }, headers: this.url.toque() })
  }
}

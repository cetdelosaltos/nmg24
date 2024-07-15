import { Injectable } from '@angular/core';
import { ExDBCon } from './conectorex';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class IntercambiosService {
  constructor(
    private url: ExDBCon,
    private exdb: HttpClient
  ) { }

  async traerIntercambios() {
    return await this.exdb.get(this.url.url('intercambios'), { headers: this.url.toque() });
  }
  async borrarIntercambio(id: any) {
    return await this.exdb.delete(this.url.url('intercambios/borrar'), { body: { id: id }, headers: this.url.toque() });
  }
  async meterIntercambio(intercambio: any) {
    return await this.exdb.post(this.url.url('intercambios/crear'), intercambio, { headers: this.url.toque() });

  }
}

import { Injectable } from '@angular/core';
import { ExDBCon } from './conectorex';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class PagosService {
  constructor(
    private url: ExDBCon,
    private exdb: HttpClient
  ) { }
  async traerPagos() {
    return await this.exdb.get(this.url.url('pagos'), { headers: this.url.toque() });
  }
}

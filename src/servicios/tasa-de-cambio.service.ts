import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ExDBCon } from './conectorex';
@Injectable({
  providedIn: 'root',
})
export class TasaDeCambioService {
  constructor(
    private exdb: HttpClient,
    private url: ExDBCon
  ) {

  }
  async traerTDCEX() {
    return await this.exdb.get('https://ve.dolarapi.com/v1/dolares/oficial')
  }
  async meterTDCEX(tasava: any) {
    const tasares = await this.exdb.post(this.url.url('tasa/crear'), tasava);
    return tasares;
  }
}

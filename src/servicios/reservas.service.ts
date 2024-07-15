import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { ExDBCon } from './conectorex';

@Injectable({
  providedIn: 'root'
})
export class ReservasService {
  constructor(
    private url: ExDBCon,
    private exdb: HttpClient,
  ) { };
  async traerHomeEX() {
    const esto = await this.exdb.get(this.url.url('home'), { headers: this.url.toque() });
    return esto;
  }
  async traerReservaciones() {
    return await this.exdb.get(this.url.url('pedidos'), { headers: this.url.toque() })
  }
  async estatusPedido(id: any, estatus: any) {
    const respuesta = await this.exdb.put(this.url.url('pedidos/estatus'), { 'id': id, 'estatus': estatus }, { headers: this.url.toque() })
    return respuesta
  }
  async entregarReservacion(id: any) {
    const respuesta = await this.exdb.put(this.url.url('entregar-reserva'), { 'id': id }, { headers: this.url.toque() })
    return respuesta;
  }

  async borrarReservacion(id: any) {
    console.log(id);
    const borrado = await this.exdb.delete(this.url.url('borrar-comanda'), { body: { id: id.id }, headers: this.url.toque() });
    borrado.subscribe(res => {
      console.log(res);
    })
  }
}

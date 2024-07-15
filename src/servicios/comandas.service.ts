import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ExDBCon } from './conectorex';
@Injectable({
  providedIn: 'root',
})
export class ComandasService {
  constructor(
    private exdb: HttpClient,
    private url: ExDBCon
  ) { }

  async meterComanda(comanda: any) {
    return await this.exdb.post(this.url.url('crear-comanda'), comanda, { headers: this.url.toque() });
  }
  async meterPedidos(pedidos: any) {
    const esto = await this.exdb.post(this.url.url('meter-pedidos'), pedidos, { headers: this.url.toque() });
    return esto;
  }
  async meterReserva(reserva: any) {
    return await this.exdb.post(this.url.url('meter-reserva'), reserva, { headers: this.url.toque() })
  }
  async meterPago(comanda: any) {
    return await this.exdb.post(this.url.url('pagos/crear'), comanda, { headers: this.url.toque() });
  }
  async traerReserva(id: any) {
    const esto = await this.exdb.get(this.url.url('comanda/' + id), { headers: this.url.toque() });
    return esto;
  }
  async traerDeudas() {
    return await this.exdb.get(this.url.url('/deudas'), { headers: this.url.toque() });
  }
  async actualizarComanda(coman: any) {
    return await this.exdb.post(this.url.url('actualizar-comanda'), coman, { headers: this.url.toque() });
  }
  async borrarPedido(id: any) {
    return await this.exdb.delete(this.url.url('borrar-pedido'), { body: { id: id }, headers: this.url.toque() });
  }

}
import { Injectable } from '@angular/core';
import { NMGSocketService } from './socketserv';

@Injectable({
  providedIn: 'root'
})
export class SocketService {

  constructor(
    private io: NMGSocketService
  ) { }
  emitirReserva(mensaje: any) {
    this.io.emit('cambio', mensaje);
  }

  // listen event
  oirReserva() {
    return this.io.fromEvent('cambio');
  }
}

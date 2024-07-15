import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class TelefonoService {

  constructor() { }
  limpiarTelefono(numero: string) {
    var inicia = numero.charAt(0);
    var codigo;
    var operadora;
    var telefon;
    // si empieza con 0
    switch (inicia) {
      case "0":
        codigo = 58;
        operadora = numero.slice(1, 4);
        telefon = numero.slice(4);
        break;
      case "+":
        codigo = numero.slice(1, 3);
        operadora = numero.slice(3, 6);
        telefon = numero.slice(6);
        break;
      case "4":
        codigo = 58;
        operadora = numero.slice(0, 3);
        telefon = numero.slice(3);
        break;
    }
    var sale = {
      codigo: codigo,
      operadora: operadora,
      telefon: telefon
    }
    return sale;
  }
  crearTelef(objeto: any) {
    var telef = "+" + objeto.codigo + objeto.operadora + objeto.telefon;
    return telef;
  }

}

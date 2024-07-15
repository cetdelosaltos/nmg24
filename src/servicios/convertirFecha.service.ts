import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ConvertirFechaService {

  constructor() { }
  timestamp(dia: any, hora: any) {
    const FechaTotal = dia + "T" + hora;
    const fechautc = new Date(FechaTotal);
    const fechafinal = fechautc.getTime();
    return fechafinal;
  }
  fecha(tiempo: any) {
    var fechares = new Date(tiempo);
    const fecha = { year: fechares.getFullYear(), month: fechares.getMonth() + 1, day: fechares.getDate() };
    const anio = fecha.year;
    const mes = (fecha.month < 10) ? "0" + fecha.month : fecha.month;
    const dia = (fecha.day < 10) ? "0" + fecha.day : fecha.day;
    var retorno: any = { dia: [], hora: [] };
    retorno.dia = anio + "-" + mes + "-" + dia;
    retorno.hora = fechares.toLocaleString('en-US', { hour: 'numeric', minute: 'numeric', hour12: true });
    return retorno;
  }
  hora(hora: any) {
    const [time, modifier] = hora.split(" ");
    let [hours, minutes] = time.split(":");
    if (hours === "12") {
      hours = "00";
    }
    if (modifier === "PM") {
      hours = parseInt(hours, 10) + 12;
    }
    return `${hours}:${minutes}`;
  }
}
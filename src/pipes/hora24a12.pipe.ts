import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'hora24a12',
  standalone: true
})
export class Hora24a12Pipe implements PipeTransform {

  transform(time: any): any {
    return this.time24To12(time);
  }
  time24To12(a: any) {
    //below date doesn't matter.
    const fecha = "1955-11-05T" + a + "Z";
    const fechafin = new Date(fecha);
    const fechaformat = fechafin.toLocaleTimeString("bestfit", {
      timeZone: "UTC",
      hour12: !0,
      hour: "numeric",
      minute: "numeric"
    });
    console.log(fecha, fechafin, fechaformat);
    return fechaformat
  };

}

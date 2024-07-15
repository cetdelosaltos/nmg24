import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, type OnInit } from '@angular/core';
import { TasaDeCambioService } from '../../../../servicios/tasa-de-cambio.service';
import { FormBuilder, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { InputMaskModule, createMask } from '@ngneat/input-mask';
import { ConvertirFechaService } from '../../../../servicios/convertirFecha.service';
import { SocketService } from '../../../../servicios/socket.service';
import { NgbModal, NgbModalModule } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-crear-tasa',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    NgbModalModule,
    InputMaskModule
  ],
  templateUrl: './crear-tasa.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CrearTasaComponent implements OnInit {
  plantillaTasa: any = []
  constructor(
    private tasaser: TasaDeCambioService,
    private modo: NgbModal,
    private fecha: ConvertirFechaService,
    private radio: SocketService,
    private fb: FormBuilder
  ) {
    const hoy = this.fecha.fecha(new Date());
    const palhoy = new Date().toISOString();
    const dehoy = palhoy.substring(0, palhoy.length - 1)
    this.plantillaTasa = this.fb.group({
      tasa: [, Validators.required],
      createdAt: [dehoy, Validators.required]
    })
  }
  async ngOnInit(): Promise<void> {

  }
  currencyInputMask = createMask({
    alias: 'numeric',
    groupSeparator: '.',
    digits: 2,
    digitsOptional: false,
    prefix: '',
    placeholder: '0',
  });
  meterTasa() {
    if (this.plantillaTasa.valid) {
      const datos = this.plantillaTasa.value;
      this.tasaser.meterTDCEX(datos).then((res) => {
        res.subscribe((restas) => {
          if (restas) {
            this.radio.emitirReserva('nuevatasa');
            this.modo.dismissAll()
          }
        })
      }).catch((err) => {
      })
    }
    else {
      alert('Revise sus Datos')
    }
  }
}

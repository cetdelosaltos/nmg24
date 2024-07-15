import { ChangeDetectorRef, Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TasaDeCambioService } from '../../../servicios/tasa-de-cambio.service';
import { SocketService } from '../../../servicios/socket.service';
import { InputMaskModule, createMask } from '@ngneat/input-mask';
import { FormsModule } from '@angular/forms';
import { NgbModal, NgbModalModule } from '@ng-bootstrap/ng-bootstrap';
import { CrearTasaComponent } from './crear-tasa/crear-tasa.component';
import { Tasadecambio } from '../../../interfaces/tasadecambio';

@Component({
  selector: 'app-tasadecambio',
  standalone: true,
  imports: [CommonModule, InputMaskModule, FormsModule, NgbModalModule],
  templateUrl: './tasadecambio.component.html',
  styleUrl: './tasadecambio.component.css'
})
export class TasadecambioComponent {
  tasita = signal({ tasa: 0, createdAt: '' });
  bolivares: any;
  dolares: any = '1';
  constructor(
    private tdc: TasaDeCambioService,
    private radio: SocketService,
    private modo: NgbModal,
    private cambio: ChangeDetectorRef
  ) {
  }
  async ngOnInit(): Promise<void> {
    (await this.tdc.traerTDCEX()).subscribe((res: any) => {
      if (res) {
        const tasalleva = { tasa: res.promedio, createdAt: res.fechaActualizacion };
        this.tasita.set(tasalleva)
        this.convertirTasa('dolares');
      }
    });
    await this.radio.oirReserva().subscribe(async (rad: any) => {
      if (rad.includes('nuevatasa')) {
        (await this.tdc.traerTDCEX()).subscribe((res: any) => {
          if (res) {
            const tasalleva = { tasa: res.promedio, createdAt: res.fechaActualizacion };
            this.tasita.set(tasalleva)
            this.convertirTasa('dolares');
            this.cambio.detectChanges();
          }
        });
      }
    })
  }
  currencyInputMask = createMask({
    alias: 'numeric',
    groupSeparator: '.',
    digits: 2,
    digitsOptional: false,
    prefix: '',
    placeholder: '0',
  });
  convertirTasa(moneda: string) {
    if (moneda == "bolivares") {
      const losbolivares = parseFloat(this.bolivares.replaceAll(",", ""))
      this.dolares = losbolivares / this.tasita().tasa
    } else {
      const losdolares = parseFloat(this.dolares.replaceAll(",", ""))
      this.bolivares = losdolares * this.tasita().tasa;
    }
  }
  crearTasa() {
    const tasam = this.modo.open(CrearTasaComponent)
    tasam.componentInstance.tasa = this.tasita
  }
}

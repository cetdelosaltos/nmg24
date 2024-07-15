import { Component } from '@angular/core';
import { TasadecambioComponent } from '../tasadecambio/tasadecambio.component';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-encabezado',
  standalone: true,
  imports: [TasadecambioComponent, RouterModule],
  templateUrl: './encabezado.component.html',
  styleUrl: './encabezado.component.css'
})
export class EncabezadoComponent {

}

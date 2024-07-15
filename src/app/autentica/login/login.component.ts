import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, type OnInit } from '@angular/core';
import { FormBuilder, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { ExDBCon } from '../../../servicios/conectorex';
import Swal from 'sweetalert2';
@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    RouterModule
  ],
  templateUrl: './login.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LoginComponent implements OnInit {
  iniciaPlan: any = [];
  mensaje: string = "Ingresa los datos";
  logeo: string = 'text-primary'
  constructor(
    public fb: FormBuilder,
    public db: HttpClient,
    private ruta: Router,
    private cambio: ChangeDetectorRef,
    private url: ExDBCon
  ) { }
  ngOnInit(): void {
    this.iniciaPlan = this.fb.group({
      usuario: ['', Validators.required],
      lacontra: ['', Validators.required],
    });
    this.salirse();

  }
  salirse() {
    localStorage.removeItem('tochada');
    this.ruta.navigate(['/entrar']);
  }
  async entrar() {
    this.mensaje = "Entrando";
    this.logeo = 'text-primary'
    await this.db.post(this.url.url('gente/entra'), this.iniciaPlan.value).subscribe((res: any) => {
      if (res.error !== undefined) {
        if (res.error == 'mamamelo') {
          this.mensaje = "Usuario no Encontrado"
          this.logeo = 'text-danger'
          this.cambio.detectChanges()
        }
        if (res.error == 'jodete') {
          this.mensaje = "Contraseña Incorrecta"
          this.logeo = 'text-danger'
          this.cambio.detectChanges()
        }
      }

      if (res.toque !== undefined) {
        localStorage.setItem('tochada', res.toque);
        this.ruta.navigate(['/']);
      } else {
        Swal.fire('No se pudo iniciar Sesion', 'Revise sus datos', 'error').then((cierre) => {
          if (cierre.isDismissed) {
            this.mensaje = 'No se inició sesión';
            this.logeo = 'text-danger'
            this.cambio.detectChanges()
          }
        })
      }
    })
  }
}

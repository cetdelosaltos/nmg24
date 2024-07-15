import { inject } from '@angular/core';
import { Router, type CanActivateFn } from '@angular/router';

export const nodeguardGuard: CanActivateFn = (route, state) => {
  const toquetazo = localStorage.getItem('tochada');
  const sipuedo: boolean = toquetazo !== null ? true : false;
  if (!sipuedo) {
    inject(Router).navigate(['entrar']);
  }
  return sipuedo;
};

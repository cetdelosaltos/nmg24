import { HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class EltoqueService {

  constructor() { }
  private toquecito = () => {
    const taka = localStorage.getItem('tochada');
    const toke = `Bearer ${taka}`;
    return toke
  }
  public cabeza() {
    return new HttpHeaders().set('Authorization', this.toquecito())
  }

}

import { HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
@Injectable({
    providedIn: 'root',
})
export class ExDBCon {
    url(url: string) {
        return 'https://nmg.cetadev.xyz/' + url;
    }
    toque() {
        const taka = localStorage.getItem('tochada');
        const toke = `Bearer ${taka}`;
        return new HttpHeaders().set('Authorization', toke)
    }
}

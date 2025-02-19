import { Injectable } from '@angular/core';
import { Socket, SocketIoConfig } from 'ngx-socket-io';

const config: SocketIoConfig = {
    url: 'https://nmg.cetadev.xyz',
    options: {}
};

@Injectable({
    providedIn: 'root'
})
export class NMGSocketService extends Socket {

    constructor() {
        super(config)
    }
}
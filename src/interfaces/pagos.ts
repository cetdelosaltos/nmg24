export interface Pagos {
    id?: number,
    createdAt?: string,
    updatedAt?: string,
    comandaId: number,
    clienteId: number,
    monto: number,
    metodoDePago: any,
    tasadecambio: any
}

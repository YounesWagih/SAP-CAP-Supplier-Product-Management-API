declare module "@sap/cds" {
    export interface Request {
        data: any;
        params: any;
        method: string;
        path: string;
    }

    export interface Service {
        on(event: string, handler: Function): void;
        before(event: string, handler: Function): void;
        after(event: string, handler: Function): void;
    }

    export function serve(serviceName: string): any;
}

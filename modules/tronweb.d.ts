// tronweb.d.ts
declare module 'tronweb' {
  export default class TronWeb {
    constructor(config: {
      fullHost: string;
      headers?: Record<string, string>;
    });
    
    trx: {
      getTransaction(hash: string): Promise<any>;
    };
    
    address: {
      fromHex(hex: string): string;
      toHex(address: string): string;
    };
  }
}
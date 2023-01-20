export enum InvoiceCurrency {
  Rupee = 'Rupee',
  Dollar = 'Dollar',
}

export interface Invoice {
  name: string;
  emailId: string;
  walletAddress: string;
  amount: {
    value: number;
    currency: InvoiceCurrency;
  };
}

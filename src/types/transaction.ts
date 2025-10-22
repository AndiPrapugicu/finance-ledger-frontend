
export interface Transaction {
    id: number;
    account_id: number;
    date: string;
    desc:string;
    splits:Split[];
    tags:string[];
    necessary: boolean;
}
export interface Split{
    accountId:number;
    amount:string;
}
export interface CreateTransactionRequest {
    date: string;
    desc:string;
    splits:Split[];
    tags:string[];
    necessary: boolean;
}
export interface TransactionsApiResponse {
  transactions: Transaction[];
  count: number;
  undo_stack_size: number;
}
export interface GroupedTransactions {
    [key: string]: Transaction[];
}
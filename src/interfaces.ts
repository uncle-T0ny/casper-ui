export interface Lock {
  lock_id: string;
  token_address: string;
  recipient: string;
  destination: string;
  amount: string;
}

export interface LockArgs {
  lock_id: string;
  token_address: string;
  recipient: string;
  destination: string;
}

export interface UnlockArgs {
  lock_id: string;
  recipient: string;
  amount: string;
  lock_source: string;
  token_source: string;
  token_source_address: string;
  signature: string;
}

export type UnlockArgsToSign = Omit<UnlockArgs, "signature">;

export enum TokenType {
  NATIVE = "Native",
  WRAPPED = "Wrapped",
}

export interface NewToken {
  tokenSource: string;
  tokenSourceAddress: string;
  token_address: string;
  tokenType: TokenType;
  min_fee: string;
  precision: number;
}

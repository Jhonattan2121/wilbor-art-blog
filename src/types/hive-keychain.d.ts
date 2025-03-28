export interface HiveKeychainResponse {
  success: boolean;
  message?: string;
  result?: any;
  publicKey?: string;
  username?: string;
  data?: any;
  request_id?: string;
}

export interface HiveKeychainInterface {
  requestHandshake: (callback: () => void) => void;
  getCurrentAccount: () => string | null;
  requestSignBuffer: (
    username: string,
    message: string,
    keyType: string,
    callback: (response: HiveKeychainResponse) => void,
    rpc?: string,
    useHiveKeychain?: boolean
  ) => void;
  requestBroadcast: (
    username: string,
    operations: any[],
    keyType: string,
    callback: (response: HiveKeychainResponse) => void,
  ) => void;
  requestSignTx: (
    username: string,
    tx: any,
    keyType: string,
    callback: (response: HiveKeychainResponse) => void,
  ) => void;
  requestAddAccountAuthority: (
    username: string, 
    authorizedUsername: string,
    role: string,
    weight: number,
    callback: (response: HiveKeychainResponse) => void,
  ) => void;
  requestRemoveAccountAuthority: (
    username: string, 
    authorizedUsername: string,
    role: string,
    callback: (response: HiveKeychainResponse) => void,
  ) => void;
  requestVerifyKey: (
    username: string, 
    encrypted: string,
    keyType: string,
    callback: (response: HiveKeychainResponse) => void,
  ) => void;
  requestPost: (
    username: string,
    title: string,
    body: string,
    parentPermlink: string,
    parentAuthor: string,
    jsonMetadata: string,
    permlink: string,
    options: any,
    callback: (response: HiveKeychainResponse) => void,
  ) => void;
  requestCustomJson: (
    username: string,
    jsonId: string,
    keyType: string,
    jsonData: string,
    displayName: string,
    callback: (response: HiveKeychainResponse) => void,
  ) => void;
}

declare global {
  interface Window {
    hive_keychain?: HiveKeychainInterface;
  }
}

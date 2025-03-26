type HiveKeychainResponse = {
  success: boolean;
  message?: string;
  result?: any;
};

interface HiveKeychain {
  requestHandshake: (callback: () => void) => void;
  getCurrentAccount: () => string | null;
  requestSignBuffer: (
    username: string,
    message: string,
    key: string,
    callback: (response: HiveKeychainResponse) => void
  ) => void;
  requestBroadcast: (
    username: string,
    operations: any[],
    key: string,
    callback: (response: HiveKeychainResponse) => void
  ) => void;
}

declare global {
  interface Window {
    hive_keychain?: HiveKeychain;
  }
} 
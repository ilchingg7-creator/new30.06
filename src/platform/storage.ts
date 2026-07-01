export interface StoragePort {
  load(key: string): Promise<string | null>;
  save(key: string, value: string): Promise<void>;
}

export function createLocalStoragePort(storage: Storage = window.localStorage): StoragePort {
  return {
    async load(key) {
      return storage.getItem(key);
    },
    async save(key, value) {
      storage.setItem(key, value);
    }
  };
}

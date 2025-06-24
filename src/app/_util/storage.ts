export class Storage {
  static getItem(key: string): string {
    const item = window.localStorage.getItem(key) || '';
    return item ? JSON.parse(item) : '';
  }

  static setItem(key: string, value: object): void {
    window.localStorage.setItem(key, JSON.stringify(value));
  }

  static removeItem(key: string): void {
    window.localStorage.removeItem(key);
  }

  static clear(): void {
    window.localStorage.clear();
  }
}

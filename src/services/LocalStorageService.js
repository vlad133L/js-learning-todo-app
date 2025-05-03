export class LocalStorageService {
  constructor(storageKey = "todoItems") {
    this.storageKey = storageKey;
  }

  save(items) {
    try {
      const jsonData = JSON.stringify(items);
      localStorage.setItem(this.storageKey, jsonData);
    } catch (error) {
      console.error("Failed to save to localStorage:", error);
    }
  }

  load() {
    try {
      const storedData = localStorage.getItem(this.storageKey);
      return storedData ? JSON.parse(storedData) : [];
    } catch (error) {
      console.error("Failed to load from localStorage:", error);
      return [];
    }
  }

  clear() {
    try {
      localStorage.removeItem(this.storageKey);
    } catch (error) {
      console.error("Failed to clear localStorage:", error);
    }
  }
}

class StorageViewer {
  constructor(storageType = "localStorage") {
    if (storageType !== "localStorage" && storageType !== "sessionStorage") {
      throw new Error(
        'Invalid storage type. Use "localStorage" or "sessionStorage".'
      );
    }
    this.storage = window[storageType];
  }

  get(key) {
    return this.storage.getItem(key);
  }

  set(key, value) {
    this.storage.setItem(key, value);
  }

  remove(key) {
    this.storage.removeItem(key);
  }

  clear() {
    this.storage.clear();
  }

  getAllKeys() {
    return Object.keys(this.storage);
  }
}

// Exporting the module
export default StorageViewer;

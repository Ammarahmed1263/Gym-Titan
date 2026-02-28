import { idb } from "./idb.js";

class DBService {
  constructor() {
    this.db = null;
  }

  async init() {
    if (this.db) return this.db;
    this.db = await idb.open("titan-db", 1, (upgradeDB) => {
      if (!upgradeDB.objectStoreNames.contains("settings")) {
        upgradeDB.createObjectStore("settings", { keyPath: "id" });
      }

      if (!upgradeDB.objectStoreNames.contains("profile")) {
        upgradeDB.createObjectStore("profile", { keyPath: "id" });
      }

      if (!upgradeDB.objectStoreNames.contains("weight_history")) {
        const store = upgradeDB.createObjectStore("weight_history", {
          keyPath: "id",
          autoIncrement: true,
        });
        store.createIndex("date", "date", { unique: false });
      }

      if (!upgradeDB.objectStoreNames.contains("exercises")) {
        const store = upgradeDB.createObjectStore("exercises", {
          keyPath: "id",
          autoIncrement: true,
        });
        store.createIndex("date", "date", { unique: false });
      }
    });
    return this.db;
  }

  async addWeight(weightKg, date) {
    await this.init();
    const tx = this.db.transaction("weight_history", "readwrite");
    const store = tx.objectStore("weight_history");
    await store.add({
      weight: parseFloat(weightKg),
      date: new Date(date).toISOString(),
      timestamp: Date.now(),
    });
    await tx.complete;
  }

  async getWeights() {
    await this.init();
    const tx = this.db.transaction("weight_history", "readonly");
    const store = tx.objectStore("weight_history");
    return await store.getAll();
  }

  async deleteWeight(id) {
    await this.init();
    const tx = this.db.transaction("weight_history", "readwrite");
    const store = tx.objectStore("weight_history");
    await store.delete(id);
    await tx.complete;
  }

  async getLatestWeight() {
    await this.init();
    const tx = this.db.transaction("weight_history", "readonly");
    const store = tx.objectStore("weight_history");

    const all = await store.getAll();
    return all.sort((a, b) => new Date(b.date) - new Date(a.date))[0] || null;
  }

  async setHeight(heightCm) {
    await this.init();
    const tx = this.db.transaction("profile", "readwrite");
    const store = tx.objectStore("profile");
    await store.put({ id: "height", value: parseFloat(heightCm) });
    await tx.complete;
  }

  async getHeight() {
    await this.init();
    const tx = this.db.transaction("profile", "readonly");
    const store = tx.objectStore("profile");
    const result = await store.get("height");
    return result ? result.value : null;
  }

  async saveBMI(bmi, ratio) {
    await this.init();
    const tx = this.db.transaction("profile", "readwrite");
    const store = tx.objectStore("profile");
    await store.put({ id: "bmi", value: bmi, updatedAt: Date.now() });
    await store.put({ id: "ratio", value: ratio, updatedAt: Date.now() });
    await tx.complete;
  }

  async getBMI() {
    await this.init();
    const tx = this.db.transaction("profile", "readonly");
    const record = await tx.objectStore("profile").get("bmi");
    return record ? record.value : null;
  }

  async getRatio() {
    await this.init();
    const tx = this.db.transaction("profile", "readonly");
    const record = await tx.objectStore("profile").get("ratio");
    return record ? record.value : null;
  }

  async addExercise(name, sets, reps, weightKg, date) {
    await this.init();
    const tx = this.db.transaction("exercises", "readwrite");
    await tx.objectStore("exercises").add({
      name,
      sets: parseInt(sets),
      reps: parseInt(reps),
      weight: parseFloat(weightKg),
      date: new Date(date).toISOString(),
      timestamp: Date.now(),
    });
    await tx.complete;
  }

  async deleteExercise(id) {
    await this.init();
    const tx = this.db.transaction("exercises", "readwrite");
    const store = tx.objectStore("exercises");
    await store.delete(id);
    await tx.complete;
  }

  async getExercises() {
    await this.init();
    const tx = this.db.transaction("exercises", "readonly");
    const store = tx.objectStore("exercises");
    return await store.getAll();
  }

  async getSetting(key) {
    await this.init();
    const tx = this.db.transaction("settings", "readonly");
    const store = tx.objectStore("settings");
    const result = await store.get(key);
    return result ? result.value : null;
  }

  async setSetting(key, value) {
    await this.init();
    const tx = this.db.transaction("settings", "readwrite");
    const store = tx.objectStore("settings");
    await store.put({ id: key, value: value });
    await tx.complete;
  }
}

export const dbService = new DBService();

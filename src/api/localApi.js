/**
 * Local API
 *
 * localStorage-backed data layer used by the app in local/electron mode.
 */

const generateId = () => `${Date.now()}-${Math.random().toString(36).slice(2, 11)}`;

class EntityStore {
  constructor(storageKey) {
    this.storageKey = storageKey;
  }

  _getAll() {
    try {
      const raw = localStorage.getItem(this.storageKey);
      return raw ? JSON.parse(raw) : [];
    } catch (error) {
      console.error(`Error reading ${this.storageKey}:`, error);
      return [];
    }
  }

  _saveAll(items) {
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(items));
    } catch (error) {
      console.error(`Error saving ${this.storageKey}:`, error);
    }
  }

  list(orderBy = null, limit = null) {
    let items = this._getAll();

    if (orderBy) {
      const descending = orderBy.startsWith('-');
      const field = descending ? orderBy.slice(1) : orderBy;
      items = [...items].sort((a, b) => {
        const aVal = a[field];
        const bVal = b[field];

        if (aVal == null && bVal == null) return 0;
        if (aVal == null) return 1;
        if (bVal == null) return -1;

        const comparison = String(aVal).localeCompare(String(bVal));
        return descending ? -comparison : comparison;
      });
    }

    if (limit && limit > 0) {
      items = items.slice(0, limit);
    }

    return Promise.resolve(items);
  }

  filter(criteria = {}, orderBy = null, limit = null) {
    return this.list(orderBy, limit).then((items) => items.filter((item) => (
      Object.entries(criteria).every(([key, value]) => item[key] === value)
    )));
  }

  get(id) {
    const item = this._getAll().find((entry) => entry.id === id);
    return Promise.resolve(item ?? null);
  }

  create(data) {
    const items = this._getAll();
    const item = {
      id: generateId(),
      created_date: new Date().toISOString(),
      ...data,
    };
    items.push(item);
    this._saveAll(items);
    return Promise.resolve(item);
  }

  update(id, patch) {
    const items = this._getAll();
    const index = items.findIndex((entry) => entry.id === id);

    if (index === -1) {
      return Promise.reject(new Error(`Item with id ${id} not found`));
    }

    items[index] = {
      ...items[index],
      ...patch,
      updated_date: new Date().toISOString(),
    };

    this._saveAll(items);
    return Promise.resolve(items[index]);
  }

  delete(id) {
    const items = this._getAll();
    const filtered = items.filter((entry) => entry.id !== id);
    this._saveAll(filtered);
    return Promise.resolve({ success: true });
  }
}

export const localApi = {
  entities: {
    Cultivation: new EntityStore('cultivation_cultivations'),
    Practice: new EntityStore('cultivation_practices'),
  },
};

export default localApi;

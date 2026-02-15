/**
 * Local Storage Database
 * 
 * A localStorage-based replacement for Base44 entities.
 * Provides the same API interface for Cultivation and Practice entities.
 */

// Generate unique ID
const generateId = () => {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};

// Generic entity store
class EntityStore {
  constructor(storageKey) {
    this.storageKey = storageKey;
  }

  // Get all items from storage
  _getAll() {
    try {
      const data = localStorage.getItem(this.storageKey);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error(`Error reading ${this.storageKey}:`, error);
      return [];
    }
  }

  // Save all items to storage
  _saveAll(items) {
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(items));
    } catch (error) {
      console.error(`Error saving ${this.storageKey}:`, error);
    }
  }

  // List all items
  list(orderBy = null, limit = null) {
    let items = this._getAll();
    
    // Apply ordering
    if (orderBy) {
      const descending = orderBy.startsWith('-');
      const field = descending ? orderBy.slice(1) : orderBy;
      items.sort((a, b) => {
        const aVal = a[field];
        const bVal = b[field];
        if (aVal === undefined || aVal === null) return 1;
        if (bVal === undefined || bVal === null) return -1;
        const comparison = String(aVal).localeCompare(String(bVal));
        return descending ? -comparison : comparison;
      });
    }

    // Apply limit
    if (limit && limit > 0) {
      items = items.slice(0, limit);
    }

    return Promise.resolve([...items]);
  }

  // Filter items by criteria
  filter(criteria = {}, orderBy = null, limit = null) {
    return this.list(orderBy, limit).then(items => {
      return items.filter(item => {
        return Object.entries(criteria).every(([key, value]) => {
          return item[key] === value;
        });
      });
    });
  }

  // Get single item by ID
  get(id) {
    const items = this._getAll();
    const item = items.find(i => i.id === id);
    return Promise.resolve(item || null);
  }

  // Create new item
  create(data) {
    const items = this._getAll();
    const newItem = {
      id: generateId(),
      created_date: new Date().toISOString(),
      ...data,
    };
    items.push(newItem);
    this._saveAll(items);
    return Promise.resolve(newItem);
  }

  // Update existing item
  update(id, data) {
    const items = this._getAll();
    const index = items.findIndex(i => i.id === id);
    if (index === -1) {
      return Promise.reject(new Error(`Item with id ${id} not found`));
    }
    items[index] = {
      ...items[index],
      ...data,
      updated_date: new Date().toISOString(),
    };
    this._saveAll(items);
    return Promise.resolve(items[index]);
  }

  // Delete item
  delete(id) {
    const items = this._getAll();
    const filtered = items.filter(i => i.id !== id);
    this._saveAll(filtered);
    return Promise.resolve({ success: true });
  }
}

// Create entity stores
const Cultivation = new EntityStore('cultivation_cultivations');
const Practice = new EntityStore('cultivation_practices');

// Export base44-compatible API
export const base44 = {
  entities: {
    Cultivation,
    Practice,
  },
};

export default base44;

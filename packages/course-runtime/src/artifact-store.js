const DEFAULT_KEY = 'ai-academy-artifacts-v3';

function readJson(storage, key) {
  try {
    return JSON.parse(storage.getItem(key) ?? '{}');
  } catch {
    return {};
  }
}

export class ArtifactStore {
  constructor({ storage = window.localStorage, key = DEFAULT_KEY, eventBus } = {}) {
    this.storage = storage;
    this.key = key;
    this.eventBus = eventBus;
    this.state = readJson(storage, key);
  }

  get(name) {
    return name ? this.state[name] : structuredClone(this.state);
  }

  has(name) {
    return Object.prototype.hasOwnProperty.call(this.state, name);
  }

  set(name, value, metadata = {}) {
    this.state = {
      ...this.state,
      [name]: value,
      __meta: {
        ...(this.state.__meta ?? {}),
        [name]: {
          updatedAt: new Date().toISOString(),
          ...metadata,
        },
      },
    };
    this.#persist(name);
    return value;
  }

  merge(patch, metadata = {}) {
    for (const [name, value] of Object.entries(patch)) {
      this.set(name, value, metadata);
    }
    return this.get();
  }

  reset() {
    this.state = {};
    this.storage.setItem(this.key, '{}');
    this.eventBus?.emit('artifact:reset', {});
  }

  #persist(changedName) {
    this.storage.setItem(this.key, JSON.stringify(this.state));
    this.eventBus?.emit('artifact:change', {
      name: changedName,
      value: this.state[changedName],
      artifacts: this.get(),
    });
  }
}

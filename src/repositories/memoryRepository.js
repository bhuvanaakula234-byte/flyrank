class MemoryItemRepository {
  constructor() {
    this.items = [
      {
        id: 1,
        title: 'Sample Item 1',
        description: 'In-memory item before DB migration',
        status: 'pending',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
    ];
    this.nextId = 2;
  }

  async findAll() {
    return [...this.items];
  }

  async findById(id) {
    const numericId = parseInt(id, 10);
    return this.items.find(item => item.id === numericId) || null;
  }

  async create(data) {
    const newItem = {
      id: this.nextId++,
      title: data.title,
      description: data.description || '',
      status: data.status || 'pending',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    this.items.push(newItem);
    return newItem;
  }

  async update(id, data) {
    const numericId = parseInt(id, 10);
    const index = this.items.findIndex(item => item.id === numericId);
    if (index === -1) return null;

    this.items[index] = {
      ...this.items[index],
      ...data,
      updated_at: new Date().toISOString()
    };
    return this.items[index];
  }

  async delete(id) {
    const numericId = parseInt(id, 10);
    const index = this.items.findIndex(item => item.id === numericId);
    if (index === -1) return false;

    this.items.splice(index, 1);
    return true;
  }
}

module.exports = MemoryItemRepository;

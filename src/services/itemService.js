class ItemService {
  constructor(itemRepository) {
    this.itemRepository = itemRepository;
  }

  async getAllItems() {
    return await this.itemRepository.findAll();
  }

  async getItemById(id) {
    const item = await this.itemRepository.findById(id);
    if (!item) {
      const error = new Error('Item not found');
      error.statusCode = 404;
      throw error;
    }
    return item;
  }

  async createItem(data) {
    if (!data.title || data.title.trim() === '') {
      const error = new Error('Title is required');
      error.statusCode = 400;
      throw error;
    }
    return await this.itemRepository.create(data);
  }

  async updateItem(id, data) {
    await this.getItemById(id); // Throws 404 if not exists
    return await this.itemRepository.update(id, data);
  }

  async deleteItem(id) {
    await this.getItemById(id); // Throws 404 if not exists
    return await this.itemRepository.delete(id);
  }
}

module.exports = ItemService;

const path = require('path');
const fs = require('fs').promises;

// Path to our "database" JSON file
const dbPath = path.join(__dirname, '../../data/items.json');

// Helper function to read the database file
async function readDatabase() {
  try {
    const data = await fs.readFile(dbPath, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    // If file doesn't exist or is empty, return an empty array
    if (error.code === 'ENOENT') {
      await fs.mkdir(path.dirname(dbPath), { recursive: true });
      await fs.writeFile(dbPath, JSON.stringify({ items: [] }), 'utf8');
      return { items: [] };
    }
    throw error;
  }
}

// Helper function to write to the database file
async function writeDatabase(data) {
  await fs.writeFile(dbPath, JSON.stringify(data, null, 2), 'utf8');
}

// Controller methods
exports.getAllItems = async (req, res, next) => {
  try {
    const db = await readDatabase();
    res.status(200).json(db.items);
  } catch (error) {
    next(error);
  }
};

exports.getItemById = async (req, res, next) => {
  try {
    const db = await readDatabase();
    const item = db.items.find(item => item.id === req.params.id);
    
    if (!item) {
      return res.status(404).json({ message: 'Item not found' });
    }
    
    res.status(200).json(item);
  } catch (error) {
    next(error);
  }
};

exports.createItem = async (req, res, next) => {
  try {
    const { name, description } = req.body;
    
    if (!name) {
      return res.status(400).json({ message: 'Name is required' });
    }
    
    const db = await readDatabase();
    const newItem = {
      id: Date.now().toString(),
      name,
      description: description || '',
      createdAt: new Date().toISOString()
    };
    
    db.items.push(newItem);
    await writeDatabase(db);
    
    res.status(201).json(newItem);
  } catch (error) {
    next(error);
  }
};

exports.updateItem = async (req, res, next) => {
  try {
    const { name, description } = req.body;
    const db = await readDatabase();
    const itemIndex = db.items.findIndex(item => item.id === req.params.id);
    
    if (itemIndex === -1) {
      return res.status(404).json({ message: 'Item not found' });
    }
    
    // Update the item
    db.items[itemIndex] = {
      ...db.items[itemIndex],
      name: name || db.items[itemIndex].name,
      description: description !== undefined ? description : db.items[itemIndex].description,
      updatedAt: new Date().toISOString()
    };
    
    await writeDatabase(db);
    
    res.status(200).json(db.items[itemIndex]);
  } catch (error) {
    next(error);
  }
};

exports.deleteItem = async (req, res, next) => {
  try {
    const db = await readDatabase();
    const itemIndex = db.items.findIndex(item => item.id === req.params.id);
    
    if (itemIndex === -1) {
      return res.status(404).json({ message: 'Item not found' });
    }
    
    // Remove the item
    const deletedItem = db.items[itemIndex];
    db.items.splice(itemIndex, 1);
    
    await writeDatabase(db);
    
    res.status(200).json(deletedItem);
  } catch (error) {
    next(error);
  }
};
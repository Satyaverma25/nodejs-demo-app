// DOM Elements
const itemForm = document.getElementById('item-form');
const nameInput = document.getElementById('name');
const descriptionInput = document.getElementById('description');
const itemsContainer = document.getElementById('items-container');

// API endpoints
const API_URL = '/api/items';

// Event Listeners
document.addEventListener('DOMContentLoaded', fetchItems);
itemForm.addEventListener('submit', handleFormSubmit);

// Fetch all items from the API
async function fetchItems() {
  try {
    const response = await fetch(API_URL);
    const items = await response.json();
    
    renderItems(items);
  } catch (error) {
    console.error('Error fetching items:', error);
    showError('Failed to load items. Please try again later.');
  }
}

// Handle form submission to create a new item
async function handleFormSubmit(e) {
  e.preventDefault();
  
  const name = nameInput.value.trim();
  const description = descriptionInput.value.trim();
  
  if (!name) {
    showError('Name is required');
    return;
  }
  
  try {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ name, description })
    });
    
    if (!response.ok) {
      throw new Error('Failed to create item');
    }
    
    const newItem = await response.json();
    
    // Reset form
    itemForm.reset();
    
    // Add new item to the list
    addItemToDOM(newItem);
    
    // Show success message with a subtle animation
    showSuccess('Item added successfully!');
  } catch (error) {
    console.error('Error creating item:', error);
    showError('Failed to add item. Please try again.');
  }
}

// Delete an item
async function deleteItem(id) {
  try {
    const response = await fetch(`${API_URL}/${id}`, {
      method: 'DELETE'
    });
    
    if (!response.ok) {
      throw new Error('Failed to delete item');
    }
    
    // Remove item from DOM
    document.getElementById(`item-${id}`).remove();
    
    // Show success message
    showSuccess('Item deleted successfully!');
    
    // Check if there are no more items
    checkEmptyState();
  } catch (error) {
    console.error('Error deleting item:', error);
    showError('Failed to delete item. Please try again.');
  }
}

// Render all items to the DOM
function renderItems(items) {
  if (items.length === 0) {
    itemsContainer.innerHTML = '<p class="empty-message">No items yet. Add one above!</p>';
    return;
  }
  
  itemsContainer.innerHTML = '';
  
  items.forEach(item => {
    addItemToDOM(item);
  });
}

// Add a single item to the DOM
function addItemToDOM(item) {
  // Remove empty message if it exists
  const emptyMessage = itemsContainer.querySelector('.empty-message');
  if (emptyMessage) {
    emptyMessage.remove();
  }
  
  // Create item element
  const itemElement = document.createElement('div');
  itemElement.classList.add('item');
  itemElement.id = `item-${item.id}`;
  
  // Format date
  const date = new Date(item.createdAt);
  const formattedDate = date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
  
  // Set item content
  itemElement.innerHTML = `
    <h3>${item.name}</h3>
    <p>${item.description || 'No description provided.'}</p>
    <small>Created: ${formattedDate}</small>
    <div class="item-actions">
      <button class="btn btn-small btn-edit" data-id="${item.id}">Edit</button>
      <button class="btn btn-small btn-danger" data-id="${item.id}">Delete</button>
    </div>
  `;
  
  // Add event listeners to buttons
  const deleteButton = itemElement.querySelector('.btn-danger');
  deleteButton.addEventListener('click', () => {
    if (confirm('Are you sure you want to delete this item?')) {
      deleteItem(item.id);
    }
  });
  
  // Append to container
  itemsContainer.appendChild(itemElement);
}

// Check if the items container is empty and show empty message if needed
function checkEmptyState() {
  if (itemsContainer.children.length === 0) {
    itemsContainer.innerHTML = '<p class="empty-message">No items yet. Add one above!</p>';
  }
}

// Show error message
function showError(message) {
  const errorDiv = document.createElement('div');
  errorDiv.classList.add('message', 'error-message');
  errorDiv.textContent = message;
  
  document.querySelector('.container').prepend(errorDiv);
  
  // Remove after 3 seconds
  setTimeout(() => {
    errorDiv.remove();
  }, 3000);
}

// Show success message
function showSuccess(message) {
  const successDiv = document.createElement('div');
  successDiv.classList.add('message', 'success-message');
  successDiv.textContent = message;
  
  document.querySelector('.container').prepend(successDiv);
  
  // Remove after 3 seconds
  setTimeout(() => {
    successDiv.remove();
  }, 3000);
}

// Additional styles for messages
const style = document.createElement('style');
style.textContent = `
  .message {
    padding: var(--space-3) var(--space-4);
    border-radius: 4px;
    margin-bottom: var(--space-4);
    animation: slideDown 0.3s ease-out;
    text-align: center;
  }
  
  .error-message {
    background-color: #FEE2E2;
    color: var(--color-error);
    border-left: 4px solid var(--color-error);
  }
  
  .success-message {
    background-color: #D1FAE5;
    color: var(--color-accent-dark);
    border-left: 4px solid var(--color-accent);
  }
  
  @keyframes slideDown {
    from { transform: translateY(-20px); opacity: 0; }
    to { transform: translateY(0); opacity: 1; }
  }
`;

document.head.appendChild(style);
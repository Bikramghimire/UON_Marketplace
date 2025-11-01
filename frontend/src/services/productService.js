// Mock product data - Replace with actual API calls later
const mockProducts = [
  {
    id: 1,
    title: "Calculus Textbook - 3rd Edition",
    price: 45.99,
    category: "Textbooks",
    description: "Used but in excellent condition. No highlighting or notes.",
    image: "📚",
    seller: "John D.",
    location: "Campus Dorm",
    datePosted: "2 days ago",
    condition: "Excellent"
  },
  {
    id: 2,
    title: "MacBook Pro 13 inch 2020",
    price: 899.99,
    category: "Electronics",
    description: "M1 chip, 256GB SSD, 8GB RAM. Great condition, barely used.",
    image: "💻",
    seller: "Sarah M.",
    location: "Off-Campus",
    datePosted: "1 week ago",
    condition: "Like New"
  },
  {
    id: 3,
    title: "Nike Air Max Sneakers Size 10",
    price: 65.00,
    category: "Clothing",
    description: "Gently worn, still in great shape. Original box included.",
    image: "👟",
    seller: "Mike T.",
    location: "Student Union",
    datePosted: "3 days ago",
    condition: "Good"
  },
  {
    id: 4,
    title: "Desk Chair - Office Style",
    price: 35.00,
    category: "Furniture",
    description: "Comfortable office chair. Adjustable height, good condition.",
    image: "🪑",
    seller: "Emily R.",
    location: "Campus Dorm",
    datePosted: "5 days ago",
    condition: "Good"
  },
  {
    id: 5,
    title: "iPhone 12 - 128GB",
    price: 450.00,
    category: "Electronics",
    description: "Unlocked, works perfectly. Minor scratches on screen. Includes charger.",
    image: "📱",
    seller: "David L.",
    location: "Off-Campus",
    datePosted: "1 day ago",
    condition: "Fair"
  },
  {
    id: 6,
    title: "Organic Chemistry Textbook Set",
    price: 85.00,
    category: "Textbooks",
    description: "Complete set with study guide. Barely used, like new condition.",
    image: "📖",
    seller: "Lisa K.",
    location: "Library",
    datePosted: "4 days ago",
    condition: "Excellent"
  },
  {
    id: 7,
    title: "Winter Jacket - Medium",
    price: 40.00,
    category: "Clothing",
    description: "North Face jacket, warm and waterproof. Perfect for winter.",
    image: "🧥",
    seller: "Tom W.",
    location: "Campus Dorm",
    datePosted: "6 days ago",
    condition: "Good"
  },
  {
    id: 8,
    title: "Study Desk with Drawers",
    price: 55.00,
    category: "Furniture",
    description: "Wooden desk with storage drawers. Easy to assemble.",
    image: "🪑",
    seller: "Anna B.",
    location: "Off-Campus",
    datePosted: "1 week ago",
    condition: "Good"
  },
  {
    id: 9,
    title: "iPad Air 4th Gen",
    price: 350.00,
    category: "Electronics",
    description: "64GB, WiFi only. Great for taking notes in class. Includes case.",
    image: "📱",
    seller: "Chris P.",
    location: "Student Union",
    datePosted: "2 days ago",
    condition: "Excellent"
  },
  {
    id: 10,
    title: "Physics Lab Manual",
    price: 20.00,
    category: "Textbooks",
    description: "Required for Physics 101. Some pages filled but still usable.",
    image: "📘",
    seller: "Rachel S.",
    location: "Library",
    datePosted: "3 days ago",
    condition: "Fair"
  },
  {
    id: 11,
    title: "Graphing Calculator TI-84",
    price: 60.00,
    category: "Electronics",
    description: "Works perfectly. Batteries included. Great for math courses.",
    image: "🔢",
    seller: "Kevin H.",
    location: "Campus Dorm",
    datePosted: "1 day ago",
    condition: "Excellent"
  },
  {
    id: 12,
    title: "Backpack - Laptop Compatible",
    price: 30.00,
    category: "Clothing",
    description: "Spacious backpack with laptop compartment. Water resistant.",
    image: "🎒",
    seller: "Jessica N.",
    location: "Off-Campus",
    datePosted: "4 days ago",
    condition: "Good"
  }
];

// Simulate API call delay
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// Get all products
export const getAllProducts = async (filters = {}) => {
  await delay(300); // Simulate network delay
  
  let filteredProducts = [...mockProducts];
  
  // Apply category filter
  if (filters.category && filters.category !== 'All') {
    filteredProducts = filteredProducts.filter(
      product => product.category === filters.category
    );
  }
  
  // Apply search filter
  if (filters.search) {
    const searchTerm = filters.search.toLowerCase();
    filteredProducts = filteredProducts.filter(
      product =>
        product.title.toLowerCase().includes(searchTerm) ||
        product.description.toLowerCase().includes(searchTerm)
    );
  }
  
  // Apply price range filter
  if (filters.minPrice !== undefined) {
    filteredProducts = filteredProducts.filter(
      product => product.price >= filters.minPrice
    );
  }
  
  if (filters.maxPrice !== undefined) {
    filteredProducts = filteredProducts.filter(
      product => product.price <= filters.maxPrice
    );
  }
  
  // Sort products
  if (filters.sortBy) {
    switch (filters.sortBy) {
      case 'price-low':
        filteredProducts.sort((a, b) => a.price - b.price);
        break;
      case 'price-high':
        filteredProducts.sort((a, b) => b.price - a.price);
        break;
      case 'newest':
        filteredProducts.sort((a, b) => {
          const dateA = parseInt(a.datePosted);
          const dateB = parseInt(b.datePosted);
          return dateA - dateB;
        });
        break;
      default:
        break;
    }
  }
  
  return filteredProducts;
};

// Get product by ID
export const getProductById = async (id) => {
  await delay(200);
  return mockProducts.find(product => product.id === parseInt(id));
};

// Get unique categories
export const getCategories = () => {
  const categories = [...new Set(mockProducts.map(product => product.category))];
  return categories;
};

export default {
  getAllProducts,
  getProductById,
  getCategories
};

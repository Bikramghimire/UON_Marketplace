import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import auth from "./routes/auth.js";
import products from "./routes/products.js";
import categories from "./routes/categories.js";
import test from "./routes/test.js";

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// API routes
app.use('/api/auth', auth);
app.use('/api/products', products);
app.use('/api/categories', categories);
app.use('/api/test', test);





// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Marketplace API is running' });
});


// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📱 API available at http://localhost:${PORT}`);
  console.log(`🌐 Frontend URL: ${process.env.FRONTEND_URL || 'http://localhost:3000'}`);
});

export default app;

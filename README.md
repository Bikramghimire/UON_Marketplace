# Lifecycle Marketplace

A student-focused online marketplace platform for University of Newcastle (UoN) students. Buy, sell, and connect within the university community.

## 🚀 Features

- **User Authentication** with email verification
- **Product Listings** - Create, browse, and manage product listings
- **Messaging System** - Real-time communication between buyers and sellers
- **Admin Dashboard** - Manage users, products, and categories
- **Email Verification** - Secure account verification via email codes
- **PostgreSQL Database** - Robust and scalable database solution

## 🛠️ Technology Stack

### Frontend
- React.js
- React Router
- Context API for state management
- CSS3

### Backend
- Node.js
- Express.js
- PostgreSQL with Sequelize ORM
- JWT Authentication
- bcrypt for password hashing
- Nodemailer for email services

### Database
- PostgreSQL

## 📋 Prerequisites

- Node.js (v14 or higher)
- PostgreSQL (v12 or higher)
- npm or yarn

## 🚀 Quick Start

### 1. Clone the repository
```bash
git clone <repository-url>
cd uon_marketplace
```

### 2. Backend Setup

```bash
cd backend
npm install
```

Create a `.env` file (copy from `env.example.txt`):
```env
PORT=5000
NODE_ENV=development
FRONTEND_URL=http://localhost:3000

# PostgreSQL
DB_HOST=localhost
DB_PORT=5432
DB_NAME=uon_marketplace
DB_USER=postgres
DB_PASSWORD=your-postgres-password

# JWT
JWT_SECRET=your-secret-key

# Email (Optional - for email verification)
EMAIL_SERVICE=gmail
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-password
EMAIL_FROM="Lifecycle Marketplace <your-email@gmail.com>"
```

Run database migration:
```bash
npm run migrate
```

Seed database (optional):
```bash
npm run seed
```

Start backend:
```bash
npm start
# or for development
npm run dev
```

### 3. Frontend Setup

```bash
cd frontend
npm install
```

Create a `.env` file:
```env
REACT_APP_API_URL=http://localhost:5000/api
```

Start frontend:
```bash
npm start
```

## 📖 User Flow

1. **Sign Up** → User registers with email
2. **Email Verification** → User receives 6-digit code via email
3. **Verify Email** → User enters code to verify account
4. **Login** → User logs in with verified account
5. **Access App** → User can browse, list products, and message

## 🔐 Authentication

- **Email Verification Required**: Users must verify their email before logging in
- **JWT Tokens**: Secure token-based authentication
- **Password Hashing**: bcrypt for secure password storage

## 📧 Email Verification

The system uses email verification codes:
- 6-digit verification code sent to user's email
- Code expires in 15 minutes
- Users can resend verification codes
- Only verified users can log in

## 🗄️ Database Management

### Available Scripts

```bash
# Create/update database tables
npm run migrate

# Seed database with sample data
npm run seed

# Create admin user
npm run create-admin

# Fix user passwords (if needed)
npm run fix-passwords

# Drop all tables (delete data, keep structure)
npm run drop-db

# Drop all tables completely
npm run drop-db:all

# Force drop (no confirmation)
npm run drop-db:force
```

## 📁 Project Structure

```
uon_marketplace/
├── backend/
│   ├── config/          # Database configuration
│   ├── models/          # Sequelize models
│   ├── routes/          # API routes
│   ├── middleware/      # Auth middleware
│   ├── services/        # Email service
│   ├── scripts/         # Database scripts
│   └── server.js        # Entry point
├── frontend/
│   ├── src/
│   │   ├── components/  # React components
│   │   ├── pages/       # Page components
│   │   ├── context/     # Context providers
│   │   ├── services/    # API services
│   │   └── App.js       # Main app component
│   └── public/
└── README.md
```

## 🔑 Default Test Accounts

After seeding, you can use these accounts (password: `password123`):

- **Admin**: `admin@uon.edu` or username `admin`
- **John**: `john@example.com` or username `johndoe`
- **Sarah**: `sarah@example.com` or username `sarahm`
- **Mike**: `mike@example.com` or username `miket`
- **Emily**: `emily@example.com` or username `emilyr`

**Note**: These accounts are created with `emailVerified: false` by default. You'll need to verify them or update the seed script.

## 📝 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user
- `POST /api/auth/verify-email` - Verify email with code
- `POST /api/auth/resend-verification` - Resend verification code

### Products
- `GET /api/products` - Get all products
- `GET /api/products/:id` - Get product by ID
- `POST /api/products` - Create product (auth required)
- `PUT /api/products/:id` - Update product (auth required)
- `DELETE /api/products/:id` - Delete product (auth required)

### Messages
- `GET /api/messages` - Get all conversations
- `GET /api/messages/conversation/:userId` - Get conversation
- `POST /api/messages` - Send message

## 🛡️ Security Features

- Password hashing with bcrypt
- JWT token authentication
- Email verification required
- Protected routes
- Input validation
- SQL injection prevention (Sequelize ORM)

## 📚 Documentation

For detailed setup instructions, see [SETUP_GUIDE.md](./SETUP_GUIDE.md)

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the ISC License.

## 👥 Authors

University of Newcastle - Marketplace Team

# How to Login as Admin

## 🚀 Quick Setup

### Option 1: Use the Seed Script (Recommended)

The seed script automatically creates an admin user:

```bash
cd backend
npm run seed
```

**Admin Credentials:**
- **Email:** `admin@uon.edu`
- **Password:** `password123`

### Option 2: Create Admin User Manually

Run the admin creation script:

```bash
cd backend
npm run create-admin
```

**Admin Credentials:**
- **Email:** `admin@uon.edu`
- **Password:** `admin123`

### Option 3: Create Admin via Registration API

You can register a new user, then promote them to admin:

1. Register via API:
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "admin",
    "email": "admin@uon.edu",
    "password": "admin123",
    "firstName": "Admin",
    "lastName": "User"
  }'
```

2. Then update the user role to admin in MongoDB:
```javascript
// Connect to MongoDB
// In MongoDB shell or Compass:
db.users.updateOne(
  { email: "admin@uon.edu" },
  { $set: { role: "admin" } }
)
```

## 📝 Login Steps

1. **Start your backend server:**
   ```bash
   cd backend
   npm start
   ```

2. **Start your frontend (in another terminal):**
   ```bash
   cd frontend
   npm start
   ```

3. **Navigate to login page:**
   - Open: `http://localhost:3000/login`

4. **Enter admin credentials:**
   - Email: `admin@uon.edu`
   - Password: `password123` (or `admin123` if you used create-admin script)

5. **Access admin panel:**
   - After login, you'll see an "Admin" link in the header
   - Click "Admin" to access the dashboard

## 🔐 Admin Features

Once logged in as admin, you can:

- ✅ **Dashboard** - View statistics and overview
- ✅ **User Management** - View, edit, delete users
- ✅ **Product Management** - View, edit, delete products
- ✅ **Change User Roles** - Promote users to admin
- ✅ **Manage Product Status** - Change product status (active/sold/inactive)

## 🛠️ Promote Existing User to Admin

If you already have a user account and want to make it admin:

### Method 1: Using MongoDB
```javascript
// In MongoDB shell or MongoDB Compass
db.users.updateOne(
  { email: "your-email@example.com" },
  { $set: { role: "admin" } }
)
```

### Method 2: Using Admin Script
Edit `scripts/create-admin.js` and change the email to your existing user's email, then run:
```bash
npm run create-admin
```

### Method 3: Using API (if you're already an admin)
```bash
curl -X PUT http://localhost:5000/api/admin/users/{user_id} \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"role": "admin"}'
```

## ⚠️ Important Notes

1. **Default Admin Password**: After seeding, change the admin password for security
2. **Multiple Admins**: You can have multiple admin users
3. **Role Field**: The `role` field in the User model must be set to `"admin"`
4. **Security**: Admin routes are protected and require both authentication AND admin role

## 🔒 Security Tips

- Change default admin password after first login
- Use strong passwords in production
- Don't commit admin credentials to version control
- Limit admin access to trusted users only

## 📞 Troubleshooting

**Can't see Admin link?**
- Make sure you're logged in
- Verify your user has `role: "admin"` in the database
- Check browser console for errors

**Getting "Access denied" error?**
- Verify your JWT token includes the admin role
- Check if token is expired
- Try logging out and logging back in

**Forgot admin credentials?**
- Check the seed script output for credentials
- Or create a new admin using: `npm run create-admin`


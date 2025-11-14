Lifecycle Marketplace - Setup Guide

This guide will help you set up and run the Lifecycle Marketplace application with PostgreSQL backend.

Quick Start

Prerequisites

1.Node.js
2.PostgreSQL

Backend Setup

1.Navigating to backend
   cd backend

2.Installing dependencies
   npm install


3.Creating PostgreSQL database

   psql -U postgres
   CREATE DATABASE uon_marketplace;


4. Create .env file both in frontend and backend
   Copy env.example.txt to .env

5.Updating .env with your PostgreSQL credentials:
   # Server Configuration
   PORT=5000
   NODE_ENV=development
   FRONTEND_URL=http://localhost:3000
   
   # PostgreSQL Configuration
   DB_HOST=localhost
   DB_PORT=5432
   DB_NAME=uon_marketplace
   DB_USER=postgres
   DB_PASSWORD=your-actual-postgres-password
   
   # JWT Secret
   JWT_SECRET=your-secret-key-change-this-in-production
   
   # Email Configuration (Optional - for email verification)
   # For Gmail: Use EMAIL_SERVICE=gmail and EMAIL_USER/EMAIL_PASSWORD
   # For SMTP: Use EMAIL_HOST, EMAIL_PORT, EMAIL_USER, EMAIL_PASSWORD
   # For Development: Leave empty to log emails to console
   EMAIL_SERVICE=gmail
   EMAIL_HOST=smtp.gmail.com
   EMAIL_PORT=587
   EMAIL_SECURE=false
   EMAIL_USER=your-email@gmail.com
   EMAIL_PASSWORD=your-app-password
   EMAIL_FROM="Lifecycle Marketplace <your-email@gmail.com>"
   

6. Run database migration which creates all tables:

   npm run migrate


7. Seeding the database it is optional that creates sample data:
   cd bacakend
   npm run seed
  
   
   This will creates:
   - 4 categories like Textbooks, Electronics, Clothing, Furniture
   - 5 test users with password of password123
   After running npm run seed, you can use these test accounts:

-Email:admin@uon.edu | Password:password123 | Username: admin (Admin account)
-Email: john@example.com | Password: password123 | Username: johndoe
-Email: sarah@example.com | Password: password123 | Username: sarahm
-Email: mike@example.com | Password: password123 | Username: miket
-Email: emily@example.com | Password: password123 | Username: emilyr


8. Creating admin user
  
   npm run create-admin
   Creates admin account:
   - Email: admin@uon.edu
   - Password: admin123


11. Starting the backend server:
   cd backend
   npm run dev
======================================================================
Frontend Setup

1.Navigate to frontend directory:
   cd frontend


2.Install dependencies:
   npm install


3.Create .env file: and add all the credential as in .env example file
 add all the keys needed.

4.Start the frontend
   npm start


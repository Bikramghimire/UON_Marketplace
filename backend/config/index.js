
import database from "./database.js";

export { database };

export const config = {
    port: process.env.PORT || 5000,
    db: database,
    jwtSecret: process.env.JWT_SECRET || "your-secret-key-change-this-in-production",
    frontendUrl: process.env.FRONTEND_URL || "http://localhost:3000",
    backendUrl: process.env.BACKEND_URL || "http://localhost:5000",
    nodeEnv: process.env.NODE_ENV || "development",
    dbUser: process.env.DB_USER || "postgres",
    dbHost: process.env.DB_HOST || "localhost",
    dbName: process.env.DB_NAME || "uon_marketplace",
    dbPassword: process.env.DB_PASSWORD || "password",
    dbPort: process.env.DB_PORT || 5432,
}
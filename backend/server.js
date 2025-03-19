const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const path = require("path"); // Required for serving static files

// Load environment variables before importing routes
dotenv.config();

// Import routes after environment variables are loaded
const metricsRoutes = require("./routes/metrics");
const logsRoutes = require("./routes/logs");

const app = express();

// CORS Configuration
app.use(cors({
    origin: process.env.NODE_ENV === "production" ? process.env.ALLOWED_ORIGIN || '*' : '*', 
    methods: ['GET', 'POST'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true })); // Add support for URL-encoded bodies

// API Routes
app.use('/api/metrics', metricsRoutes);
app.use('/api/logs', logsRoutes);

// Health check endpoint
app.get('/health', (req, res) => {
    res.status(200).json({ status: 'ok' });
});

// Serve static files from the frontend (Only for Production)
if (process.env.NODE_ENV === "production") {
    app.use(express.static(path.join(__dirname, "../frontend/build")));

    app.get("*", (req, res) => {
        res.sendFile(path.resolve(__dirname, "../frontend/build", "index.html"));
    });
}

// 404 handler for API routes
app.use('/api/*', (req, res) => {
    res.status(404).json({ error: "API endpoint not found" });
});

// Global Error Handling Middleware
app.use((err, req, res, next) => {
    console.error("🔥 Server Error:", err);
    res.status(err.statusCode || 500).json({ 
        error: err.message || "Internal Server Error",
        stack: process.env.NODE_ENV === "development" ? err.stack : undefined
    });
});

// Start Server
const PORT = process.env.PORT || 5000;
const server = app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT} in ${process.env.NODE_ENV || 'development'} mode`));

// Graceful shutdown
process.on("SIGTERM", gracefulShutdown);
process.on("SIGINT", gracefulShutdown);

function gracefulShutdown() {
    console.log("🛑 Received shutdown signal, closing server...");
    server.close(() => {
        console.log("✅ Server closed");
        process.exit(0);
    });
    
    // Force close after 10 seconds if server hasn't closed
    setTimeout(() => {
        console.error("⚠️ Could not close connections in time, forcefully shutting down");
        process.exit(1);
    }, 10000);
}

// Global Error Handling
process.on("uncaughtException", (err) => {
    console.error("🔥 Uncaught Exception:", err);
    gracefulShutdown();
});

process.on("unhandledRejection", (reason, promise) => {
    console.error("🚨 Unhandled Rejection at:", promise, "reason:", reason);
    gracefulShutdown();
});

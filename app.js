import express from 'express';
import session from "express-session";
import cors from "cors";
import mongoose from 'mongoose';
import "dotenv/config";

// Import routes
import Hello from "./hello.js"
import Lab5 from "./lab5.js";
import CourseRoutes from "./courses/routes.js";
import UserRoutes from "./users/routes.js";
import ModuleRoutes from "./modules/routes.js";
import AssignmentRoutes from './assignments/routes.js';

// Ensure required environment variables are set
const requiredEnv = ['FRONTEND_URL', 'MONGODB_URI', 'SESSION_SECRET', 'PORT'];
requiredEnv.forEach(envVar => {
  if (!process.env[envVar]) {
    console.error(`Missing required environment variable: ${envVar}`);
    process.exit(1);
  }
});

// Setup MongoDB connection
mongoose.connect(process.env.MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .catch(err => {
    console.error('MongoDB connection error:', err.message);
    process.exit(1);
  });

const app = express();

const allowedOrigins = process.env.FRONTEND_URL ? [process.env.FRONTEND_URL] : [];
app.use(cors({
  credentials: true,
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  }
}));


// Session configuration
const sessionOptions = {
  secret: 'keyboard cat',
  resave: false,
  saveUninitialized: false,
  cookie: {}
};

if (process.env.NODE_ENV === 'production') {
  app.set('trust proxy', 1); // Trust first proxy
  sessionOptions.cookie.secure = true; // Serve secure cookies
  sessionOptions.cookie.sameSite = 'none';
}

app.use(session(sessionOptions));

// Middleware for JSON payload parsing
app.use(express.json());

// Route setup
UserRoutes(app);
CourseRoutes(app);
ModuleRoutes(app);
AssignmentRoutes(app);
Lab5(app);
Hello(app);

// Start server
const PORT = process.env.PORT || 8000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

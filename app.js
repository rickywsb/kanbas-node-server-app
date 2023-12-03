import express from 'express';
import session from "express-session";
import "dotenv/config";
import Hello from "./hello.js"
import Lab5 from "./lab5.js";
import CourseRoutes from "./courses/routes.js";
import cors from "cors";
import mongoose from 'mongoose';
import UserRoutes from "./users/routes.js";
import ModuleRoutes from "./modules/routes.js";
import AssignmentRoutes from './assignments/routes.js';


mongoose.connect("mongodb+srv://wusiboricky:zyq19960123@web5610.duup1ki.mongodb.net/kanbas");

const app = express();
app.use(
    cors({
      credentials: true,
      origin: process.env.FRONTEND_URL
    })
   );

const sessionOptions = {
    secret: "any string",
    resave: false,
    saveUninitialized: false,
  };
  if (process.env.NODE_ENV !== "development") {
    sessionOptions.proxy = true;
    sessionOptions.cookie = {
      sameSite: "none",
      secure: true,
    };
  }
  app.use(session(sessionOptions));
  
  
// app.use(cors({
//     credentials: true,
//     origin: function (origin, callback) {
//         if (!origin || allowedOrigins.indexOf(origin) !== -1) {
//             callback(null, true);
//         } else {
//             callback(new Error('Not allowed by CORS'));
//         }
//     }
// }));
app.use(express.json());
// const allowedOrigins = ['http://localhost:3000', 'https://a5--creative-nougat-9b83f1.netlify.app'];

// app.use(cors({
//     credentials: true,
//     origin: function (origin, callback) {
//         if (!origin || allowedOrigins.indexOf(origin) !== -1) {
//             callback(null, true);
//         } else {
//             callback(new Error('Not allowed by CORS'));
//         }
//     }
// }));

UserRoutes(app);

CourseRoutes(app);

ModuleRoutes(app);
AssignmentRoutes(app);
Lab5(app);
Hello(app);
app.listen(process.env.PORT ||8000);

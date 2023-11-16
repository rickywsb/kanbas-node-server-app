import express from 'express';
import Hello from "./hello.js"
import Lab5 from "./lab5.js";
import CourseRoutes from "./courses/routes.js";
import cors from "cors";
import ModuleRoutes from "./modules/routes.js";
import AssignmentRoutes from './assignments/routes.js';
import "dotenv/config";


const app = express();
const allowedOrigins = ['http://localhost:3000', 'https://creative-nougat-9b83f1.netlify.app'];

app.use(cors({
    credentials: true,
    origin: function (origin, callback) {
        if (!origin || allowedOrigins.indexOf(origin) !== -1) {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    }
}));


CourseRoutes(app);
app.use(express.json());
ModuleRoutes(app);
AssignmentRoutes(app);
Lab5(app);
Hello(app);
app.listen(process.env.PORT ||8000);

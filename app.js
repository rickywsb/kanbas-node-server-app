import express from 'express';
import Hello from "./hello.js"
import Lab5 from "./lab5.js";
import CourseRoutes from "./courses/routes.js";
import cors from "cors";
import ModuleRoutes from "./modules/routes.js";



const app = express();
app.use(cors());
app.use(express.json());
CourseRoutes(app);
app.use(express.json());
ModuleRoutes(app);
Lab5(app);
Hello(app);
app.listen(8000);

import exprees from "express";
import morgan from "morgan";
import cookieParser from "cookie-parser"
import cors from "cors"

import accessRoutes from "./routes/access.routes.js";
import adminRoutes from "./routes/admin.routes.js"

const app = exprees();

app.use(cors({
    origin: ["https://cristian3410.github.io","http://localhost:5173","https://backendproyetofinalv2.onrender.com"],


    credentials:true
}));                                                                    

app.use(morgan("dev"));
app.use(exprees.json());
app.use(cookieParser());

app.use("/api",accessRoutes);
app.use("/api",adminRoutes);


export default app;
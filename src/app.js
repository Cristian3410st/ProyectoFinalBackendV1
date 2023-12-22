import exprees from "express";
import morgan from "morgan";
import cookieParser from "cookie-parser"
import cors from "cors"

import accessRoutes from "./routes/access.routes.js";
import adminRoutes from "./routes/admin.routes.js"

const app = exprees();

app.use(cors({
    origin: ["proyecto-final-frontend-v1.vercel.app", "http://localhost:5173"],


    credentials:true
}));      



app.use(morgan("dev"));
app.use(exprees.json());
app.use(cookieParser());

app.use("/api",accessRoutes);
app.use("/api",adminRoutes);


export default app;
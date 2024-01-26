import exprees from "express";
import morgan from "morgan";
import cookieParser from "cookie-parser"
import cors from "cors"

import accessRoutes from "./routes/access.routes.js";
import adminRoutes from "./routes/admin.routes.js"

const app = exprees();

const corsOptions = {
    origin: ['https://frontendsubdomain.mgdtbackednv1.online','http://localhost:5173'],
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
  };


  app.use(cors(corsOptions))


app.use(morgan("dev"));
app.use(exprees.json());
app.use(cookieParser());

app.use("/api",accessRoutes);
app.use("/api",adminRoutes);


export default app;
import express from "express";
import compression from "compression";
import morgan from "morgan";
import helmet from "helmet";
import cors from "cors";
import dotenv from "dotenv";
import swaggerUi from "swagger-ui-express";
import swaggerFile from "./config/swagger.json" with { type: "json" };
import path from "path";
import cookieParser from "cookie-parser";

import db from "./config/db.js";
import routes from "./routes.js";

dotenv.config();
db.config(process.env.db);

const app = express();

const projectRoot = path.resolve('.');

const staticPaths = {
    '/Imagens': path.join(projectRoot, '../Images'),
    '/styles': path.join(projectRoot, '../frontend/pages/styles'),
    '/scripts': path.join(projectRoot, '../frontend/pages/scripts'),
};

for (const [url, dir] of Object.entries(staticPaths)) {
    app.use(url, express.static(dir));
}

app.set("view engine", "ejs");
app.set("views", path.join(projectRoot, "../frontend/pages/views"));
app.use(cors());
app.use(cookieParser());
app.use(helmet());
app.use(compression());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan("dev"));
app.get("/favicon.ico", (req, res) => {
    res.sendFile(path.join(projectRoot, '../Images/favicon.ico'));
});
app.use("/swagger", swaggerUi.serve, swaggerUi.setup(swaggerFile));
app.use(routes);

export default app;
// Requires
import express from "express";
import bodyParser from "body-parser";

// Ejecutar express
const app = express();

// Cargar archivos de rutas
import user_routes from "./routes/user.js";
import topic_routes from "./routes/topic.js";
import comment_routes from "./routes/comment.js";

// Middlewares
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// Reescribir rutas
app.use("/api", user_routes);
app.use("/api", topic_routes);
app.use("/api", comment_routes);

// Exportar el modulo
export default app;

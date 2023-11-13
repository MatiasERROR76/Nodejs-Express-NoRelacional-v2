import mongoose from "mongoose";
import app from "./app.js";

const port = process.env.PORT || 3999;

mongoose.Promise = global.Promise;

mongoose
  .connect("mongodb://127.0.0.1:27017/api_rest_node_v2")
  .then(() => {
    console.log(
      "La conexión a la base de datos se ha realizado correctamente."
    );
    // Crear el servidor
    app.listen(port, () => {
      console.log(`El servidor http://127.0.0.1:${port} está funcionando.`);
    });
  })
  .catch((error) => console.log(error));

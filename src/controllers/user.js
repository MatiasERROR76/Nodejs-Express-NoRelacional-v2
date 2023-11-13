import validator from "validator";
import User from "../models/user.js";
import { createToken } from "./services/jwt.js";
import bcrypt from "bcrypt";
import fs from "fs";
import path from "path";
const saltRounds = 10;
import { fileURLToPath } from "url";
import { dirname } from "path";

export const createUser = async (req, res) => {
  try {
    const params = req.body;
    const validate_name = params.name ? !validator.isEmpty(params.name) : false;
    const validate_surname = params.surname
      ? !validator.isEmpty(params.surname)
      : false;
    const validate_email = params.email
      ? !validator.isEmpty(params.email) && validator.isEmail(params.email)
      : false;
    const validate_password = params.password
      ? !validator.isEmpty(params.password)
      : false;

    if (
      validate_name &&
      validate_surname &&
      validate_password &&
      validate_email
    ) {
      const user = new User();
      user.name = params.name;
      user.surname = params.surname;
      user.email = params.email.toLowerCase();
      user.role = "ROLE_USER";
      user.image = null;

      const issetUser = await User.findOne({ email: user.email });

      if (!issetUser) {
        const hash = await bcrypt.hash(params.password, saltRounds);
        user.password = hash;

        try {
          const userStored = await user.save();
          return res.status(200).send({
            status: "success",
            user: userStored,
          });
        } catch (err) {
          return res.status(500).send({
            message: "Error al guardar el usuario",
          });
        }
      } else {
        return res.status(500).send({
          message: "El usuario ya está registrado",
        });
      }
    } else {
      return res.status(400).send({
        message: "Faltan datos por enviar",
      });
    }
  } catch (err) {
    return res.status(500).send({
      message: "Error al comprobar duplicidad de usuario",
    });
  }
};

export const login = async (req, res) => {
  const params = req.body;
  try {
    const validate_email =
      !validator.isEmpty(params.email) && validator.isEmail(params.email);
    const validate_password = !validator.isEmpty(params.password);

    if (!validate_email || !validate_password) {
      throw new Error(
        "Los datos son incorrectos, envíalos de la manera adecuada"
      );
    }

    const user = await User.findOne({ email: params.email.toLowerCase() });

    if (!user) {
      throw new Error(
        "No se encontró ningún usuario con ese correo electrónico"
      );
    }

    const passwordMatch = await bcrypt.compare(params.password, user.password);

    if (passwordMatch) {
      if (params.gettoken) {
        return res.status(200).send({
          token: createToken(user),
        });
      } else {
        user.password = undefined;

        return res.status(200).send({
          message: "success",
          user: user,
        });
      }
    } else {
      throw new Error("La contraseña no es válida");
    }
  } catch (err) {
    return res.status(400).send({
      message: err.message,
    });
  }
};

export const updateUser = async (req, res) => {
  try {
    // recoger los datos del usuario
    const params = req.body;

    // validar datos
    const validate_name = params.name ? !validator.isEmpty(params.name) : false;
    const validate_surname = params.surname
      ? !validator.isEmpty(params.surname)
      : false;
    const validate_email = params.email
      ? !validator.isEmpty(params.email) && validator.isEmail(params.email)
      : false;

    // Comprobar si algún dato no es válido
    if (!(validate_name && validate_surname && validate_email)) {
      throw new Error("Faltan datos por enviar");
    }

    // eliminar propiedades innecesarias
    delete params.password;
    // obtener id de usuario
    const userId = req.user.sub;

    console.log(userId);

    // Comprobar si el nuevo email ya está en uso
    const existingUser = await User.findOne({ email: params.email });
    if (existingUser && existingUser._id.toString() !== userId) {
      throw new Error("El email ya está en uso");
    }

    // buscar y actualizar documento en la bd
    const userUpdated = await User.findOneAndUpdate({ _id: userId }, params, {
      new: true,
    });

    if (!userUpdated) {
      return res.status(400).send({
        status: "error",
        message: "error al actualizar usuario",
      });
    }

    // devolver una respuesta
    return res.status(200).send({
      status: "success",
      user: userUpdated,
    });
  } catch (err) {
    return res.status(200).send({
      message: err.message, // Devolver el mensaje de error
    });
  }
};

export const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;

    // sacar id del topic de la url
    // find and delete por topic id y por id
    const userRemoved = await User.findOneAndDelete({
      _id: id,
    });

    if (!userRemoved) {
      return res.status(500).send({
        status: "error",
        message: "No se ha logrado borrar el usuario",
      });
    }

    // devolver respuesta
    return res.status(200).send({
      status: "success",
      user: userRemoved,
    });
  } catch (err) {
    return res.status(500).send({
      status: "error",
      message: "Error en la peticion",
    });
  }
};

export const uploadAvatar = async (req, res) => {
  try {
    // configurar el modulo multiparty (md) OK
    // recoger el fichero de la peticion
    const file_error = "Avatar no subido...";

    if (!req.files) {
      return res.status(404).send({
        status: "error",
        message: file_error,
      });
    }

    // conseguir el nombre y la ext del archivo subido
    const file_path = req.files.file0.path;
    const file_split = file_path.split("\\");

    // nombre del archivo
    const file_name = file_split[8];

    // extension del archivo
    const ext_split = file_name.split(".");
    const file_ext = ext_split[1];
    // comprobar extension(solo imagenes), si no es valida borrar fichero subido
    if (
      file_ext != "png" &&
      file_ext != "jpg" &&
      file_ext != "jpeg" &&
      file_ext != "gif"
    ) {
      await fs.promises.unlink(file_path);

      return res.status(200).send({
        status: "error",
        message: "la extension del archivo no es valida.",
      });
    } else {
      // sacar el id del usuario identificado
      const userId = req.user.sub;

      // find and update documento de la bd
      const userUpdated = await User.findOneAndUpdate(
        { _id: userId },
        { image: file_name },
        { new: true }
      );

      if (!userUpdated) {
        return res.status(500).send({
          status: "error",
          message: "Error al guardar usuario",
        });
      }
      // devolver una respuesta
      return res.status(200).send({
        status: "success",
        user: userUpdated,
      });
    }
  } catch (err) {
    console.error(err);
    return res.status(500).send({
      status: "error",
      message: "Error interno del servidor",
    });
  }
};


export const avatarUser = async (req, res) => {
  const __filename = fileURLToPath(import.meta.url);
  const __dirname = dirname(__filename);
  const fileName = req.params.fileName;
  const pathFile = path.resolve(__dirname, "../uploads/users/", fileName);
  console.log("Ruta del archivo:", pathFile);

  try {
    if (fs.existsSync(pathFile)) {
      return res.sendFile(pathFile);
    } else {
      return res.status(404).send({
        message: "La imagen no existe",
      });
    }
  } catch (error) {
    console.error("Error al intentar enviar el archivo:", error);
    return res.status(500).send({
      message: "Error interno del servidor al intentar enviar el archivo",
    });
  }
};

export const getUsers = async (req, res) => {
  try {
    const users = await User.find();

    if (!users || users.length === 0) {
      return res.status(404).send({
        status: "error",
        message: "No hay usuarios que mostrar",
      });
    }
    return res.status(200).send({
      status: "success",
      users,
    });
  } catch (error) {
    return res.status(500).send({
      status: "error",
      message: "Error al obtener los usuarios",
      error: error.message,
    });
  }
};

export const getUser = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findById(id);

    if (!user || user.length === 0) {
      return res.status(404).send({
        status: "error",
        message: "No hay usuarios que mostrar",
      });
    }
    return res.status(200).send({
      status: "success",
      user,
    });
  } catch (error) {
    return res.status(500).send({
      status: "error",
      message: "Error al obtener el usuario",
      error: error.message,
    });
  }
};

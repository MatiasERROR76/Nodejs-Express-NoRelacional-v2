import express from "express";
import multipart from "connect-multiparty";
import { authenticated } from "../middlewares/authenticated.js";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const md_upload = multipart({
  uploadDir: path.join(__dirname, "../uploads/users"),
});

const router = express.Router();
import {
  createUser,
  deleteUser,
  getUsers,
  getUser,
  login,
  updateUser,
  uploadAvatar,
  avatarUser,
} from "../controllers/user.js";

// Rutas de prueba
router.post("/create-user", createUser);
router.put("/edit-user", authenticated, updateUser);
router.delete("/delete-user/:id", deleteUser);
router.get("/user/:id", getUser);
router.get("/all-users", getUsers);
router.post("/upload-avatar/:id", [md_upload, authenticated], uploadAvatar);
router.post("/login", login);
router.get("/avatar/:fileName", avatarUser);

// Rutas de usuarios
export default router;

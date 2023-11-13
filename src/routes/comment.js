import express from "express";
import { authenticated } from "../middlewares/authenticated.js";
import {
  createComment,
  deleteComment,
  updateComment,
} from "../controllers/comment.js";

const router = express.Router();

router.post("/comment/topic/:topicId", [authenticated], createComment);
router.put("/comment/:commentId", [authenticated], updateComment);
router.delete("/comment/:topicId/:commentId", [authenticated], deleteComment);
export default router;

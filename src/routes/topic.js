import express from "express";
import { authenticated } from "../middlewares/authenticated.js";

import {
  createTopic,
  getTopics,
  getTopicsByUser,
  getTopic,
  deleteTopic,
  updateTopic,
  searchTopic,
} from "../controllers/topic.js";

const router = express.Router();

router.post("/create-topic", [authenticated], createTopic);
router.get("/topics/:page?", getTopics);
router.get("/topic/:id", getTopic);
router.get("/user-topics/:user", getTopicsByUser);
router.put("/topic/:id", [authenticated], updateTopic);
router.delete("/topic/:id", [authenticated], deleteTopic);
router.get("/search/:search", searchTopic);
export default router;

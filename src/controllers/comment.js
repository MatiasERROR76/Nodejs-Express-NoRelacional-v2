import validator from "validator";
import Topic from "../models/topic.js";

export const createComment = async (req, res) => {
  try {
    // Get the topic ID from the URL
    const topicId = req.params.topicId;

    // Find the topic by ID
    const topic = await Topic.findById(topicId);

    if (!topic) {
      return res.status(404).send({
        status: "error",
        message: "No existe el tema",
      });
    }

    // Check user object and validate data

    if (!req.body.content) {
      return res.status(200).send({
        message: "¡No has comentado nada!",
      });
    }

    const validateContent = !validator.isEmpty(req.body.content);

    if (!validateContent) {
      return res.status(200).send({
        message: "No se han validado los datos del comentario",
      });
    }

    const comment = {
      user: req.user.sub,
      content: req.body.content,
    };

    // Push the comment to the 'comments' property of the topic object
    topic.comments.push(comment);

    // Save the complete topic
    await topic.save();

    // Return response
    return res.status(200).send({
      status: "success",
      topic,
    });
  } catch (error) {
    return res.status(500).send({
      status: "error",
      message: "Error en la petición",
    });
  }
};

export const updateComment = async (req, res) => {
  try {
    const { commentId } = req.params;
    const { content } = req.body;

    if (!content) {
      return res.status(200).send({
        message: "No has comentado nada!!",
      });
    }

    const topicUpdated = await Topic.findOneAndUpdate(
      { "comments._id": commentId },
      {
        $set: {
          "comments.$.content": content,
        },
      },
      { new: true }
    );

    if (!topicUpdated) {
      return res.status(404).send({
        status: "error",
        message: "No existe el tema",
      });
    }

    return res.status(200).send({
      status: "success",
      topic: topicUpdated,
    });
  } catch (error) {
    return res.status(500).send({
      status: "error",
      message: "Error en la petición",
    });
  }
};

export const deleteComment = async (req, res) => {
  try {
    const { topicId, commentId } = req.params;

    // Find the topic
    const topic = await Topic.findById(topicId);

    if (!topic) {
      return res.status(404).send({
        status: "error",
        message: "No existe el tema",
      });
    }

    // Select the subdocument (comment)
    const comment = topic.comments.id(commentId);

    // Check if the comment exists
    if (comment) {
      // Remove the comment from the array of comments
      topic.comments.pull(commentId);

      // Save the topic
      await topic.save();

      // Return response
      return res.status(200).send({
        status: "success",
        topic,
      });
    } else {
      return res.status(404).send({
        status: "error",
        message: "No existe el comentario",
      });
    }
  } catch (error) {
    return res.status(500).send({
      status: "error",
      message: "Error en la petición",
    });
  }
};

import validator from "validator";
import Topic from "../models/topic.js";

export const createTopic = async (req, res) => {
  const params = req.body;

  try {
    const validate_title = !validator.isEmpty(params.title);
    const validate_content = !validator.isEmpty(params.content);
    const validate_lang = !validator.isEmpty(params.lang);

    if (validate_content && validate_title && validate_lang) {
      const topic = new Topic();
      topic.title = params.title;
      topic.content = params.content;
      topic.code = params.code;
      topic.lang = params.lang;
      topic.user = req.user.sub;

      const topicStored = await topic.save();

      if (!topicStored) {
        return res.status(404).send({
          status: "error",
          message: "El tema no se ha guardado",
        });
      }

      return res.status(200).send({
        status: "success",
        topic: topicStored,
      });
    } else {
      return res.status(200).send({
        message: "Los datos no son válidos",
      });
    }
  } catch (err) {
    return res.status(200).send({
      message: "Faltan datos por enviar",
    });
  }
};

export const getTopics = async (req, res) => {
  // cargar la libreria de paginacion en la clase(modelo)
  // recoger la pag actual
  const page =
    !req.params.page ||
    req.params.page == 0 ||
    req.params.page == "0" ||
    req.params.page == undefined
      ? 1
      : parseInt(req.params.page);

  // indicar las opciones de paginacion
  const options = {
    sort: { date: -1 },
    populate: "user",
    limit: 5,
    page: page,
  };

  try {
    // find paginado
    const topics = await Topic.paginate({}, options);

    if (!topics || topics.docs.length === 0) {
      return res.status(404).send({
        status: "notfound",
        message: "No hay topics",
      });
    }

    // devolver resultado(topics, total de topics, total de pags)
    return res.status(200).send({
      status: "success",
      topics: topics.docs,
      totalDocs: topics.totalDocs,
      totalPages: topics.totalPages,
    });
  } catch (err) {
    return res.status(500).send({
      status: "error",
      message: "Error al hacer la consulta",
    });
  }
};

export const getTopicsByUser = async (req, res) => {
  const userId = req.params.user;

  try {
    const topics = await Topic.find({ user: userId }).sort({ date: -1 });

    if (!topics || topics.length === 0) {
      return res.status(404).send({
        status: "error",
        message: "No hay topics para mostrar",
      });
    }

    return res.status(200).send({
      status: "success",
      topics,
    });
  } catch (err) {
    return res.status(500).send({
      status: "error",
      message: "Error en la petición",
    });
  }
};

export const getTopic = async (req, res) => {
  const topicId = req.params.id;
  Topic.findById(topicId)
    .populate("user")
    .then((topic) => {
      if (!topic) {
        return res.status(404).send({
          status: "error",
          message: "No existe el tema",
        });
      }

      return res.status(200).send({
        status: "success",
        topic,
      });
    })
    .catch((err) => {
      return res.status(500).send({
        status: "error",
        message: "Error en la peticion",
      });
    });
};

export const updateTopic = async (req, res) => {
  const topicId = req.params.id;
  const params = req.body;

  try {
    const validateTitle = !validator.isEmpty(params.title);
    const validateContent = !validator.isEmpty(params.content);
    const validateLang = !validator.isEmpty(params.lang);

    if (!(validateTitle && validateContent && validateLang)) {
      throw new Error("Faltan datos por enviar");
    }

    const update = {
      title: params.title,
      content: params.content,
      code: params.code,
      lang: params.lang,
    };

    const topicUpdated = await Topic.findOneAndUpdate(
      { _id: topicId, user: req.user.sub },
      update,
      { new: true }
    );

    if (!topicUpdated) {
      return res.status(404).send({
        status: "error",
        message: "No se ha actualizado el tema",
      });
    }

    return res.status(200).send({
      status: "success",
      topic: topicUpdated,
    });
  } catch (err) {
    return res.status(500).send({
      message: err.message || "Error interno del servidor",
    });
  }
};

export const deleteTopic = async (req, res) => {
  try {
    // sacar id del topic de la url
    const { id } = req.params;
    // find and delete por topic id y por userid
    const topicRemoved = await Topic.findOneAndDelete({
      _id: id,
      user: req.user.sub,
    });

    if (!topicRemoved) {
      return res.status(500).send({
        status: "error",
        message: "No se ha borrado el tema",
      });
    }

    // devolver respuesta
    return res.status(200).send({
      status: "success",
      topic: topicRemoved,
    });
  } catch (err) {
    return res.status(500).send({
      status: "error",
      message: "Error en la peticion",
    });
  }
};

export const searchTopic = async (req, res) => {
  try {
    // Extract search string from the URL
    const searchString = req.params.search;

    // Find using $or
    const topics = await Topic.find({
      $or: [
        { title: { $regex: searchString, $options: "i" } },
        { content: { $regex: searchString, $options: "i" } },
        { lang: { $regex: searchString, $options: "i" } },
        { code: { $regex: searchString, $options: "i" } },
      ],
    }).sort([["date", "descending"]]);

    if (!topics || topics.length === 0) {
      return res.status(404).send({
        status: "error",
        message: "No hay temas disponibles",
      });
    }

    // Return the result
    return res.status(200).send({
      status: "success",
      topics,
    });
  } catch (err) {
    return res.status(500).send({
      status: "error",
      message: "Error en la petición",
    });
  }
};

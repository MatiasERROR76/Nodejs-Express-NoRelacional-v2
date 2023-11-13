import jwt from "jwt-simple";
import moment from "moment";

const secret = "clave-secreta-para-generar-el-token-9999";

export const authenticated = (req, res, next) => {
  // Check if authorization header is present
  if (!req.headers.authorization) {
    return res.status(403).send({
      message: "La petición no tiene la cabecera de autorización",
    });
  }

  // Clean the token and remove quotes
  const token = req.headers.authorization.replace(/['"']+/g, "");
  const payload = jwt.decode(token, secret);

  try {
    // Decode the token
    // Check token expiration
    if (payload.exp <= moment().unix()) {
      return res.status(404).send({
        message: "El token ha expirado",
      });
    }
  } catch (ex) {
    return res.status(404).send({
      message: "El token no es valido",
    });
  }

  // Attach identified user to the request
  req.user = payload;
  // Proceed to the next action
  next();
};

import jwt from "jwt-simple";
import moment from "moment";

export const createToken = (user) => {
  const payload = {
    sub: user._id,
    name: user.name,
    surname: user.surname,
    email: user.email,
    role: user.role,
    image: user.image,
    iat: moment().unix(),
    exp: moment().add(30, "days").unix(),
  };

  return jwt.encode(payload, "clave-secreta-para-generar-el-token-9999");
};

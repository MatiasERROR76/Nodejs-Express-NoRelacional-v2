import mongoose from "mongoose";

const { Schema } = mongoose;

const UserSchema = new Schema({
  name: String,
  surname: String,
  email: String,
  password: String,
  image: String,
  role: String,
});

UserSchema.methods.toJSON = function () {
  const obj = this.toObject();
  delete obj.password;

  return obj;
};

export default mongoose.model("User", UserSchema);

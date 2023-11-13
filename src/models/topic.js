import mongoose from "mongoose";
import mongoosePaginate from "mongoose-paginate-v2";

const { Schema } = mongoose;

// modelo de comment
const CommentSchema = new Schema({
  content: String,
  date: { type: Date, default: Date.now },
  user: { type: Schema.ObjectId, ref: "User" },
});

const Comment = mongoose.model("Comment", CommentSchema);

// modelo de topic
const TopicSchema = new Schema({
  title: String,
  content: String,
  code: String,
  lang: String,
  date: { type: Date, default: Date.now },
  user: { type: Schema.ObjectId, ref: "User" },
  comments: [CommentSchema],
});

// cargar paginacion
TopicSchema.plugin(mongoosePaginate);

export default mongoose.model("Topic", TopicSchema);

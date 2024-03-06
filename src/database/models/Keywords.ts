import { Document, model, Schema } from "mongoose";

export interface Keywords extends Document {
  keywords: [string];
}

const Keywords = new Schema(
  {
    keywords: {
      type: [String],
      required: true,
    },
  },
  { timestamps: true }
);

export default model<Keywords>('Keywords', Keywords);

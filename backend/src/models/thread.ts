import mongoose from "mongoose";
import { Schema, Document } from "mongoose";

export interface AThread extends Document {
    title: string;
    owner: mongoose.Types.ObjectId;
}

const threadSchema = new Schema<AThread>({
    title: {
        type: String,
        required: true,
        trim: true
    },
    owner: {
        type: Schema.Types.ObjectId,
        ref: "User"
    }
});

export const Thread = mongoose.model("Thread", threadSchema);
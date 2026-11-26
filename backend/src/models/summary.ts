import mongoose from "mongoose";
import { Schema, Document } from "mongoose";

interface ASummary extends Document {
    msg: string;
    belongsTo: mongoose.Types.ObjectId;
}

const summarySchema = new Schema<ASummary>({
    msg: {
        type: String,
        required: true
    },
    belongsTo: {
        type: Schema.Types.ObjectId,
        ref: "Thread"
    }
});

export const Summary = mongoose.model("Summary", summarySchema);
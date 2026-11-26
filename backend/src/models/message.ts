import mongoose from "mongoose";
import {Schema, Document} from "mongoose";

export interface AMessage extends Document {
    msg: string;
    sendBy: string;
    belongsTo: mongoose.Types.ObjectId;
}

const messageSchema = new Schema<AMessage>({
    msg: {
        type: String,
        required: true,
        trim: true
    },
    sendBy: {
        type: String,
        required: true
    },
    belongsTo: {
        type: Schema.Types.ObjectId,
        ref: "Thread"
    }
});

export const Message = mongoose.model("Message", messageSchema);
import mongoose from "mongoose";
import { Schema, Document } from "mongoose";

export interface IUser extends Document {
    name: string;
    userName: string;
    password: string;
}

const userSchema = new Schema<IUser>({
    name: {
        type: String,
        required: true
    },
    userName: {
        type: String,
        required: true,
        unique: true,
    },
    password: {
        type: String,
        required: true,
    }
}, {
    timestamps: true
});

export const User = mongoose.model("User", userSchema);

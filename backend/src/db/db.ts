import mongoose from "mongoose";

export const connectToDb = () => {
    if (typeof (process.env.MONGO_URI) === "string") {
        mongoose.connect(process.env.MONGO_URI)
            .then(() => {
                console.log("connected to DB");
            })
            .catch((error) => {
                console.log("Error connecting DB:", error);
            });
    }
}
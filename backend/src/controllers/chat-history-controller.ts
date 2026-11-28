import type { Request, Response } from "express";
import { Thread } from "../models/thread.js";
import { Message } from "../models/message.js";
import type { Types } from "mongoose";
import { Summary } from "../models/summary.js";

export const saveUserHistory = async (req: Request, res: Response) => {
    // get the userId, get the title, get the messages and save them
    try {
        let { title, userId } = req.body;
        interface Msgs {
            msg: string;
            sendBy: string;
        }
        interface MsgsWithBelongsTo extends Msgs {
            belongsTo: Types.ObjectId;
        }
        let msgs: Msgs[] = req.body.msgs;
        if (!msgs) {
            return res.status(401).json("No Message to save");
        }
        if (!userId) {
            return res.status(401).json("Unauthorized");
        }
        if (!title) {
            title = "Anonymous";
        }
        const newThread = await new Thread({
            title: title,
            owner: userId
        });
        await newThread.save();
        const updatedArray: MsgsWithBelongsTo[] = msgs.map(msg => ({
            ...msg,
            belongsTo: newThread._id
        }))
        const newMessages = await Message.insertMany(updatedArray);
        return res.status(200).json({ message: "Chat history preserved" });
    } catch (error: any) {
        // console.log(error)
        res.status(500).json({ message: "Interval server error" });
    }
}

export const showChat = async (req: Request, res: Response) => {
    // get the threadId and find the chats belongs to that chat id and return
    try {
        const threadId = req.params.id;
        if (!threadId) {
            return res.status(400).json({ message: "No Message exists!" });
        }
        const Messages = await Message.find({ belongsTo: threadId });
        return res.status(200).json({ message: "here is your message", Messages });
    } catch (error: any) {
        // console.log(error)
        res.status(500).json({ message: "Interval server error" });
    }
}

export const deleteChat = async (req: Request, res: Response) => {
    try {
        const threadId = req.params.id;
        if (!threadId) {
            return res.status(400).json({ message: "No Message exists!" });
        }
        const deletedMessages = await Message.deleteMany({belongsTo: threadId});
        await Summary.deleteMany({ belongsTo: threadId });
        const deletedThread = await Thread.deleteOne({_id: threadId});
        // console.log(deletedMessages);
        // console.log(deletedThread);
        res.status(200).json({message: "Deleted"});
    } catch (error: any) {
        // console.log(error)
        res.status(500).json({ message: "Interval server error" });
    }
}

import type { Request, Response } from "express";
import jwt from "jsonwebtoken";
import type { JwtPayload } from "jsonwebtoken";
import { User } from "../models/user.js";
import { Thread } from "../models/thread.js";


interface CustomJwtPayload extends JwtPayload {
    id: string;
}

export const indexController = async (req: Request, res: Response) => {
    const token: string = req.cookies.token;
    if (!token) {
        return res.status(400).json({ message: "Unauthorized" });
    }
    try {
        const secret: string = typeof process.env.JWT_SECRET === "string" ? process.env.JWT_SECRET : "feze458fklij8";
        const decoded = jwt.verify(token, secret) as CustomJwtPayload;
        // req.user = decoded;
        // console.log(decoded);
        const user = await User.findById(decoded.id);
        const threads = await Thread.find({owner: decoded.id});
        const name: string = user?.name || "";
        const firstLetter: string = name.length > 0 ? name.charAt(0) : "?";
        let lastLetter: string = "";
        for (let i = 0; i < name.length; i++) {
            if (name.charAt(i) === " " && name.charAt(i + 1) != " ") {
                lastLetter = name.charAt(i + 1);
            }
        }
        const userName: string = typeof user?.userName === "string" ? user.userName : "";
        const letters: string = firstLetter + lastLetter;

        return res.status(200).json({ message: "user found", userName, letters, userId: decoded.id, threads });
    } catch (error: any) {
        if (error.name === "TokenExpiredError") {
            return res.status(401).json({ message: "Unauthorized" });
        }
        // console.log(err);
    }
}
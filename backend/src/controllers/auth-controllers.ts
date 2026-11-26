import type { Request, Response } from "express";
import { User, type IUser } from "../models/user.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";


const generateToken = (userId: string): string => {
    return jwt.sign(
        { id: userId },
        typeof (process.env.JWT_SECRET) === "string" ? process.env.JWT_SECRET : "feze458fklij8",
        { expiresIn: "7d" }
    );
}

type cookieOptions = {
    httpOnly: boolean;
    secure: boolean;
    sameSite: "strict" | "lax" | "none";
    maxAge: number;
    // partitioned: boolean;
    // path: string;
}
const options: cookieOptions = {
    httpOnly: true,
    secure: false,
    sameSite: "lax",
    maxAge: 7 * 24 * 60 * 60 * 1000,
    // partitioned: true,
    // path: "/"
}

export const login = async (req: Request<{}, any, IUser>, res: Response): Promise<void> => {
    try {
        let { userName, password } = req.body;

        if (userName === "" || password === "" || !userName || !password) {
            res.status(422).json({ message: "Invalid Data" });
            return;
        }
        userName = userName.trim();
        password = password.trim();

        const userExist = await User.findOne({ userName });
        if (!userExist) {
            res.status(400).json({ message: "Wrong username or password" });
            return;
        }
        const isMatch: boolean = await bcrypt.compare(password, userExist.password);
        if (!isMatch) {
            res.status(400).json({ message: "Wrong username or password" });
            return;
        }

        const name: string = userExist.name || "";
        const firstLetter: string = name.length > 0 ? name.charAt(0) : "?";
        let lastLetter: string = "";
        for(let i = 0; i < name.length; i++) {
            if(name.charAt(i) === " " && name.charAt(i + 1) != " ") {
                lastLetter = name.charAt(i + 1);
            }
        }
        // const lastLetter: string = name.length > 0 ?  name.charAt(name.length - 1) : "";
        const letters = firstLetter + lastLetter;

        const token: string = generateToken(userExist._id.toString());
        const userId = userExist._id.toString();
        res.cookie("token", token, options);
        res.status(200).json({ message: "Logged in successfully", name: userName, letters, userId});
        return;
    } catch (error: any) {
        res.status(500).json({ message: "Internal server error" });
        return;
    }
}

export const signup = async (req: Request<{}, any, IUser>, res: Response): Promise<void> => {
    try {
        console.log(req.body);
        let { name, userName, password } = req.body;
        if (name === "" || userName === "" || password === "" || !name || !userName || !password) {
            res.status(422).json({ message: "Invalid Data" });
            return;
        }
        name = name.trim();
        userName = userName.trim();
        password = password.trim();
        const userExist = await User.findOne({ userName });
        if (userExist) {
            res.status(409).json({ message: "User already exists" });
            return;
        }
        const hashedPassword: string = await bcrypt.hash(password, 10);

        const newUser = await User.create({
            name,
            userName,
            password: hashedPassword
        });
        // const name: string = userExist.name || "";
        const firstLetter: string = name.length > 0 ? name.charAt(0) : "?";
        let lastLetter: string = "";
        for(let i = 0; i < name.length; i++) {
            if(name.charAt(i) === " " && name.charAt(i + 1) != " ") {
                lastLetter = name.charAt(i + 1);
            }
        }
        //  = name.length > 0 ?  name.charAt(name.length - 1) : "";
        const letters = firstLetter + lastLetter;
        const token: string = generateToken(newUser._id.toString());
        const userId = newUser._id.toString();
        res.cookie("token", token, options);
        res.status(200).json({ message: "User created successfully", name: userName, letters, userId });
        return;
    } catch (error: any) {
        console.log(error)
        res.status(500).json({ message: "Internal server error" });
        return;
    }
}

export const logout = (req: Request, res: Response): void => {

    res.clearCookie("token", options).status(200).json({ message: "Logged out successfully" });
}
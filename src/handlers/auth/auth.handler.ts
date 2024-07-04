import { Request, Response } from "express";
import { IUser, User } from "../../model/user/user.model";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import { Company } from "../../model/employee/emp.model";

dotenv.config();

export function handleError(
  res: Response,
  message: string,
  statusCode: number
) {
  return res.status(statusCode).json({ error: true, message });
}
export function handleSuccess(res: Response, message: string) {
  return res.status(200).json({ error: false, message });
}

const JWT_SECRET = process.env.JWT_SECRET || "default_jwt_secret";
const JWT_EXPIRY = process.env.JWT_EXPIRY || "1h";

export async function Register(req: Request, res: Response) {
  try {
    const { name, email, password, type } = req.body;
    let Collection: any;

    if (type === "user") {
      Collection = User;
    } else if (type === "company") {
      Collection = Company;
    } else {
      return handleError(res, "Invalid user type specified", 400);
    }

    if (!name || !email || !password) {
      return handleError(res, "All fields are required", 400);
    }

    const isExistingUser = await Collection.findOne({ email });

    if (isExistingUser) {
      return handleError(res, "Email already exists, please login", 400);
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    let newUserOrCompany;
    if (type === "user") {
      newUserOrCompany = await User.create({
        email,
        password: hashedPassword,
        name,
      });
    } else if (type === "company") {
      newUserOrCompany = await Company.create({
        email,
        password: hashedPassword,
        name,
      });
    }

    if (newUserOrCompany) {
      return handleSuccess(res, "Registration successful");
    } else {
      return handleError(res, "Failed to register user or company", 500);
    }
  } catch (error) {
    console.error(error);
    return handleError(res, "Internal Server Error", 500);
  }
}

export async function Login(req: Request, res: Response) {
  try {
    const { email, password, type } = req.body;
    let Collection: any;

    if (type === "user") {
      Collection = User;
    } else if (type === "company") {
      Collection = Company;
    } else {
      return handleError(res, "Invalid user type specified", 400);
    }
    if (!email || !password) {
      return handleError(res, "All fields are required", 400);
    }
    const isExistingUser = await Collection.findOne({ email });

    if (!isExistingUser) {
      return handleError(res, "Email is invalid", 400);
    }

    const isPasswordValid = await bcrypt.compare(
      password,
      isExistingUser.password
    );
    if (!isPasswordValid) {
      return handleError(res, "Password is invalid", 400);
    }

    const token = jwt.sign({ userId: isExistingUser._id, type }, JWT_SECRET, {
      expiresIn: JWT_EXPIRY,
    });

    res.cookie("token", token, {
      httpOnly: true,
      secure: true,
      maxAge: 3600000,
      sameSite: "strict",
    });
    return handleSuccess(res, "Login successful");
  } catch (error) {
    console.error(error);
    return handleError(res, "Internal Server Error", 500);
  }
}

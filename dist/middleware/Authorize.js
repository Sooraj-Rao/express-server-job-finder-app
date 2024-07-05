"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthorizeRequest = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const user_model_1 = require("../model/user/user.model");
const dotenv_1 = __importDefault(require("dotenv"));
const emp_model_1 = require("../model/employee/emp.model");
const auth_handler_1 = require("../handlers/auth/auth.handler");
dotenv_1.default.config();
const JWT_SECRET = process.env.JWT_SECRET || "default_jwt_secret";
const AuthorizeRequest = async (req, res, next) => {
    try {
        const { token } = req.cookies;
        let Collection;
        if (!token) {
            return (0, auth_handler_1.handleError)(res, "Unauthorized", 401);
        }
        const decoded = jsonwebtoken_1.default.verify(token, JWT_SECRET);
        if (!decoded?.userId || !decoded?.type) {
            return (0, auth_handler_1.handleError)(res, "Unauthorized", 401);
        }
        if (decoded?.type === "user") {
            Collection = user_model_1.User;
        }
        else if (decoded?.type === "company") {
            Collection = emp_model_1.Company;
        }
        else {
            return (0, auth_handler_1.handleError)(res, "Invalid user type specified", 400);
        }
        const user = await Collection.findById(decoded?.userId);
        if (!user) {
            return (0, auth_handler_1.handleError)(res, "Unauthorized", 401);
        }
        if (req.session.userData) {
            req.user = req.session.userData;
        }
        else {
            return (0, auth_handler_1.handleError)(res, "Unauthorized", 401);
        }
        next();
    }
    catch (error) {
        return (0, auth_handler_1.handleError)(res, "Unauthorized", 401);
    }
};
exports.AuthorizeRequest = AuthorizeRequest;

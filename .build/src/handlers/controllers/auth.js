"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.user = exports.login = exports.register = void 0;
const client_1 = require("@prisma/client");
const exception_1 = __importDefault(require("../../exceptions/exception"));
const bcrypt_1 = require("bcrypt");
const jwt = __importStar(require("jsonwebtoken"));
const secrets_1 = require("../../../secrets");
const register = (_event, _context) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const prismaClient = new client_1.PrismaClient({
            log: ['query']
        });
        const { name, email, password } = JSON.parse(_event.body);
        let user = yield prismaClient.user.findFirst({ where: { email: email } });
        if (user) {
            return new exception_1.default("User already exists", 422);
        }
        user = yield prismaClient.user.create({
            data: {
                name,
                email,
                password: (0, bcrypt_1.hashSync)(password, 10)
            }
        });
        const message = 'user registered successfully';
        const status = 201;
        const responseData = {
            message,
        };
        return {
            statusCode: status,
            body: JSON.stringify(responseData),
            headers: {
                "Content-Type": "application/json"
            }
        };
    }
    catch (err) {
        return new exception_1.default(err.message || 'Error', null, 500);
    }
});
exports.register = register;
const login = (_event, _context) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const prismaClient = new client_1.PrismaClient({
            log: ['query']
        });
        const { email, password } = JSON.parse(_event.body);
        let user = yield prismaClient.user.findFirst({ where: { email: email } });
        if (!user) {
            return new exception_1.default("User not found", 404);
        }
        if (!(0, bcrypt_1.compareSync)(password, user.password)) {
            return new exception_1.default("Invalid credentials", 403);
        }
        const token = jwt.sign({
            userId: user.id
        }, secrets_1.JWT_SECRET, { expiresIn: '1h' });
        const loggedInUser = {
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role
        };
        const responseData = {
            message: 'login successful',
            user: loggedInUser,
            token,
        };
        return {
            statusCode: 200,
            body: JSON.stringify(responseData),
            headers: {
                "Content-Type": "application/json"
            }
        };
    }
    catch (err) {
        return new exception_1.default(err.message || 'Error', null, 500);
    }
});
exports.login = login;
const user = (_event, _context) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        console.log('I got access');
        const { authUser } = JSON.parse(_event.body);
        if (!authUser) {
            return new exception_1.default("User not found", 404);
        }
        const responseData = {
            message: 'User profile retrieved successfully',
            user: authUser
        };
        return {
            statusCode: 200,
            body: JSON.stringify(responseData),
            headers: {
                "Content-Type": "application/json"
            }
        };
    }
    catch (err) {
        return new exception_1.default(err.message || 'Error', null, 500);
    }
});
exports.user = user;

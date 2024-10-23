"use strict";
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
exports.register = void 0;
const client_1 = require("@prisma/client");
const exception_1 = __importDefault(require("../../exceptions/exception"));
const bcrypt_1 = require("bcrypt");
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

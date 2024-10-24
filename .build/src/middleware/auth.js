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
exports.authMiddleware = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const client_1 = require("@prisma/client");
const secrets_1 = require("../../secrets");
const authMiddleware = (_event, _context) => __awaiter(void 0, void 0, void 0, function* () {
    const prismaClient = new client_1.PrismaClient({
        log: ['query'],
    });
    try {
        const authHeader = _event.headers.Authorization || _event.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return {
                statusCode: 401,
                body: JSON.stringify({
                    message: 'Authorization token missing or malformed',
                }),
                headers: {
                    'Content-Type': 'application/json',
                },
            };
        }
        const token = authHeader.split(' ')[1];
        console.log('Extracted Token:', token);
        const decoded = jsonwebtoken_1.default.verify(token, secrets_1.JWT_SECRET);
        console.log('Decoded Token:', decoded);
        const user = yield prismaClient.user.findUnique({
            where: { id: decoded.userId },
        });
        if (!user) {
            return {
                statusCode: 403,
                body: JSON.stringify({
                    message: 'Unauthorized. User not found.',
                }),
                headers: {
                    'Content-Type': 'application/json',
                },
            };
        }
        console.log('Authenticated User:', user);
        const methodArn = _event.methodArn;
        return {
            principalId: user.id,
            policyDocument: {
                Version: '2012-10-17',
                Statement: [
                    {
                        Effect: 'Allow',
                        Action: 'execute-api:Invoke',
                        Resource: methodArn,
                    },
                ],
            },
            context: {
                authUser: {
                    id: user.id,
                    name: user.name,
                    email: user.email,
                    role: user.role,
                },
            },
        };
    }
    catch (err) {
        return {
            statusCode: 401,
            body: JSON.stringify({
                message: err.message || 'Unauthorized attempt',
            }),
            headers: {
                'Content-Type': 'application/json',
            },
        };
    }
});
exports.authMiddleware = authMiddleware;

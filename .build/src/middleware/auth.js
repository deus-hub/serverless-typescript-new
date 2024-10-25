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
exports.authMiddleware = authMiddleware;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const client_1 = require("@prisma/client");
const secrets_1 = require("../../secrets");
function authMiddleware(_event, _context) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const prismaClient = new client_1.PrismaClient();
            const authHeader = _event.headers.Authorization || _event.headers.authorization;
            if (!authHeader || !authHeader.startsWith('Bearer ')) {
                return generateAuthResponse("user", "Deny", _event.routeArn);
            }
            const token = authHeader.split(' ')[1];
            const decoded = jsonwebtoken_1.default.verify(token, secrets_1.JWT_SECRET);
            const user = yield prismaClient.user.findUnique({
                where: { id: decoded.userId },
            });
            if (!user) {
                return generateAuthResponse("user", "Deny", _event.routeArn);
            }
            const authUser = {
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role,
            };
            return generateAuthResponse(user.id, "Allow", _event.routeArn, {
                user: authUser,
            });
        }
        catch (err) {
            console.log('Authentication error', err);
            return generateAuthResponse("user", "Deny", _event.routeArn);
        }
    });
}
;
function generateAuthResponse(principalId, effect, arn, extra = null) {
    const policyDocument = {
        Version: "2012-10-17",
        Statement: [
            {
                Action: "execute-api:Invoke",
                Effect: effect,
                Resource: arn
            }
        ],
    };
    return {
        principalId,
        policyDocument,
        context: {
            extras: JSON.stringify(extra)
        },
    };
}

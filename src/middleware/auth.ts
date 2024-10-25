import jwt from "jsonwebtoken";
import { PrismaClient } from "@prisma/client";
import { JWT_SECRET } from "../../secrets";

export async function authMiddleware (_event: any, _context: any) {
    try {
        const prismaClient = new PrismaClient();

        const authHeader = _event.headers.Authorization || _event.headers.authorization;

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return generateAuthResponse("user", "Deny", _event.routeArn);
        }

        const token = authHeader.split(' ')[1];
        const decoded = jwt.verify(token, JWT_SECRET) as jwt.JwtPayload;

        const user = await prismaClient.user.findUnique({
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
        }

        return generateAuthResponse((user as any).id, "Allow", _event.routeArn, {
            user: authUser,
        });
            

    } catch (err: any) {
        console.log('Authentication error', err);
        return generateAuthResponse("user", "Deny", _event.routeArn);
    }
};

function generateAuthResponse(principalId: string, effect: any, arn: string, extra: any = null) {
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
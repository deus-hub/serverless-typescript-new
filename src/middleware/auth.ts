import { APIGatewayProxyEvent, APIGatewayProxyResultV2, Context } from "aws-lambda";
import jwt from "jsonwebtoken";
import { PrismaClient } from "@prisma/client";
import { JWT_SECRET } from "../../secrets";

export const authMiddleware = async (
  _event: APIGatewayProxyEvent,
  _context: Context,
): Promise<any> => {
  const prismaClient = new PrismaClient({
    log: ['query'],
  });

  try {
    const authHeader =
      _event.headers.Authorization || _event.headers.authorization;

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

    const decoded = jwt.verify(token, JWT_SECRET) as jwt.JwtPayload;
    console.log('Decoded Token:', decoded);

    const user = await prismaClient.user.findUnique({
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

    const methodArn = (_event as any).methodArn;
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

  } catch (err: any) {
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
};
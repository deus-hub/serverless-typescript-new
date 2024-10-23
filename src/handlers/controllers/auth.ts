import { PrismaClient } from "@prisma/client";
import { APIGatewayProxyEvent, APIGatewayProxyStructuredResultV2, Context, Handler } from "aws-lambda";
import Exception from "../../exceptions/exception";
import { hashSync } from "bcrypt";

export const register: Handler = async (
    _event: APIGatewayProxyEvent,
    _context: Context
): Promise<APIGatewayProxyStructuredResultV2> => {
    try {

        const prismaClient = new PrismaClient({
            log:['query']
        })
        const {name, email, password} = JSON.parse(_event.body as any);
    
        let user = await prismaClient.user.findFirst({where: {email: email}})
    
        if (user) {
            return new Exception("User already exists", 422);
        }
    
        user = await prismaClient.user.create({
            data:{
                name,
                email,
                password: hashSync(password, 10)
            }
        })

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
    } catch (err: any) {
        return new Exception(
            err.message || 'Error',
            null,
            500
        );
    }
};
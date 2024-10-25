import { PrismaClient } from "@prisma/client";
import { APIGatewayProxyEvent, APIGatewayProxyStructuredResultV2, Context, Handler } from "aws-lambda";
import Exception from "../../exceptions/exception";
import { compareSync, hashSync } from "bcrypt";
import * as jwt from "jsonwebtoken"
import {JWT_SECRET} from "../../../secrets"

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

export const login: Handler = async (
    _event: APIGatewayProxyEvent,
    _context: Context
): Promise<APIGatewayProxyStructuredResultV2> => {
    try {

        const prismaClient = new PrismaClient({
            log:['query']
        })
        const {email, password} = JSON.parse(_event.body as any);
    
        let user = await prismaClient.user.findFirst({where: {email: email}})
    
        if (!user) {
            return new Exception("User not found", 404);
        }

        if (!compareSync(password, user.password)) {
            return new Exception("Invalid credentials", 403);
        }

        const token = jwt.sign(
            {
                userId: user.id
            }, 
            JWT_SECRET,
            { expiresIn: '1h' }
        );

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
    } catch (err: any) {
        return new Exception(
            err.message || 'Error',
            null,
            500
        );
    }
};

export const user: Handler = async (
    _event: APIGatewayProxyEvent,
    _context: Context
): Promise<APIGatewayProxyStructuredResultV2> => {
    try {
        const authUser = JSON.parse(_event.requestContext?.authorizer?.lambda?.extras).user;
        if (!authUser) {
            return new Exception("User not found", 404);
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
    } catch (err: any) {
        return new Exception(
            err.message || 'Error',
            null,
            500
        );
    }
};
import { APIGatewayProxyEventV2, APIGatewayProxyStructuredResultV2, Context, Handler } from "aws-lambda";

export const handler: Handler = async (
    _event: APIGatewayProxyEventV2,
    _context: Context
): Promise<APIGatewayProxyStructuredResultV2> => {
    const message = 'congrats! serverless TypeScript app compiled successfully';
    const status = 200;
    const responseData = {
        status,
        message,
    };

    return {
        statusCode: 200,
        body: JSON.stringify(responseData),
        headers: {
            "Content-Type": "application/json"
        }
    };
};

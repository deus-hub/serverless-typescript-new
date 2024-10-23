"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class Exception {
    constructor(message, data, statusCode, headers) {
        this.message = message;
        this.data = data;
        this.success = (statusCode || 200) < 400;
        this.statusCode = statusCode || 200;
        this.headers = headers || {};
        this.body = JSON.stringify({
            success: this.success,
            message: this.message,
            data: this.data,
        });
    }
}
exports.default = Exception;

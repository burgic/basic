"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handler = void 0;
const handler = async () => {
    return {
        statusCode: 200,
        body: JSON.stringify({
            message: 'Test function is working'
        })
    };
};
exports.handler = handler;

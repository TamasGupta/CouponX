"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.swaggerSpec = void 0;
const swagger_jsdoc_1 = __importDefault(require("swagger-jsdoc"));
const options = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'CouponX API',
            version: '1.0.0',
            description: 'Coupon exchange marketplace API',
        },
        servers: [{ url: '/api', description: 'API base' }],
        components: {
            securitySchemes: {
                bearerAuth: {
                    type: 'http',
                    scheme: 'bearer',
                    bearerFormat: 'JWT',
                },
            },
            schemas: {
                Error: {
                    type: 'object',
                    properties: {
                        message: { type: 'string' },
                    },
                },
                User: {
                    type: 'object',
                    properties: {
                        _id: { type: 'string' },
                        name: { type: 'string' },
                        email: { type: 'string' },
                        avatar: { type: 'string' },
                        phone: { type: 'string' },
                        location: { type: 'string' },
                    },
                },
                Offer: {
                    type: 'object',
                    properties: {
                        _id: { type: 'string' },
                        title: { type: 'string' },
                        description: { type: 'string' },
                        originalPrice: { type: 'number' },
                        sellingPrice: { type: 'number' },
                        expiryDate: { type: 'string', format: 'date' },
                        category: { type: 'string' },
                        images: { type: 'array', items: { type: 'string' } },
                        status: { type: 'string', enum: ['active', 'claimed', 'expired'] },
                        seller: { $ref: '#/components/schemas/User' },
                        createdAt: { type: 'string', format: 'date-time' },
                    },
                },
                Order: {
                    type: 'object',
                    properties: {
                        _id: { type: 'string' },
                        offer: { $ref: '#/components/schemas/Offer' },
                        buyer: { $ref: '#/components/schemas/User' },
                        seller: { $ref: '#/components/schemas/User' },
                        type: { type: 'string', enum: ['free', 'paid'] },
                        amount: { type: 'number' },
                        status: { type: 'string', enum: ['pending', 'confirmed', 'completed', 'cancelled'] },
                        createdAt: { type: 'string', format: 'date-time' },
                    },
                },
                Conversation: {
                    type: 'object',
                    properties: {
                        _id: { type: 'string' },
                        participants: { type: 'array', items: { $ref: '#/components/schemas/User' } },
                        lastMessage: { type: 'string' },
                        lastMessageAt: { type: 'string', format: 'date-time' },
                    },
                },
                Message: {
                    type: 'object',
                    properties: {
                        _id: { type: 'string' },
                        conversation: { type: 'string' },
                        sender: { $ref: '#/components/schemas/User' },
                        text: { type: 'string' },
                        createdAt: { type: 'string', format: 'date-time' },
                    },
                },
                Review: {
                    type: 'object',
                    properties: {
                        _id: { type: 'string' },
                        reviewer: { $ref: '#/components/schemas/User' },
                        reviewee: { type: 'string' },
                        order: { type: 'string' },
                        rating: { type: 'number', minimum: 1, maximum: 5 },
                        comment: { type: 'string' },
                        createdAt: { type: 'string', format: 'date-time' },
                    },
                },
                Category: {
                    type: 'object',
                    properties: {
                        _id: { type: 'string' },
                        name: { type: 'string' },
                        slug: { type: 'string' },
                        icon: { type: 'string' },
                        active: { type: 'boolean' },
                    },
                },
                Banner: {
                    type: 'object',
                    properties: {
                        _id: { type: 'string' },
                        image: { type: 'string' },
                        title: { type: 'string' },
                        subtitle: { type: 'string' },
                        link: { type: 'string' },
                        order: { type: 'number' },
                        active: { type: 'boolean' },
                    },
                },
            },
        },
    },
    apis: ['./src/routes/*.ts'],
};
exports.swaggerSpec = (0, swagger_jsdoc_1.default)(options);
//# sourceMappingURL=swagger.js.map
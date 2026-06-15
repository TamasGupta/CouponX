"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const http_1 = __importDefault(require("http"));
const swagger_ui_express_1 = __importDefault(require("swagger-ui-express"));
const swagger_1 = require("./config/swagger");
const db_1 = require("./config/db");
const env_1 = require("./config/env");
const error_1 = require("./middleware/error");
const socket_1 = require("./socket");
const auth_1 = __importDefault(require("./routes/auth"));
const offers_1 = __importDefault(require("./routes/offers"));
const orders_1 = __importDefault(require("./routes/orders"));
const chat_1 = __importDefault(require("./routes/chat"));
const reviews_1 = __importDefault(require("./routes/reviews"));
const upload_1 = __importDefault(require("./routes/upload"));
const categories_1 = __importDefault(require("./routes/categories"));
const banners_1 = __importDefault(require("./routes/banners"));
const payment_1 = __importDefault(require("./routes/payment"));
const seed_1 = require("./seed");
const app = (0, express_1.default)();
const server = http_1.default.createServer(app);
app.use((0, cors_1.default)());
app.use(express_1.default.json());
app.use('/api/auth', auth_1.default);
app.use('/api/offers', offers_1.default);
app.use('/api/orders', orders_1.default);
app.use('/api/chat', chat_1.default);
app.use('/api/reviews', reviews_1.default);
app.use('/api/upload', upload_1.default);
app.use('/api/categories', categories_1.default);
app.use('/api/banners', banners_1.default);
app.use('/api/payments', payment_1.default);
app.use('/api-docs', swagger_ui_express_1.default.serve, swagger_ui_express_1.default.setup(swagger_1.swaggerSpec));
app.get('/api/health', (_req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});
app.use(error_1.errorHandler);
(0, socket_1.setupSocket)(server);
(0, db_1.connectDB)().then(async () => {
    await (0, seed_1.seedCategories)();
    server.listen(env_1.env.PORT, () => {
        console.log(`Server running on http://localhost:${env_1.env.PORT}`);
    });
});
exports.default = app;
//# sourceMappingURL=index.js.map
"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const dotenv_1 = __importDefault(require("dotenv"));
const helmet_1 = __importDefault(require("helmet"));
const cors_1 = __importDefault(require("cors"));
const AuthRoutes_1 = __importDefault(require("./interfaces/routes/AuthRoutes"));
const UserRoutes_1 = __importDefault(require("./interfaces/routes/UserRoutes"));
const CourierRoutes_1 = __importDefault(require("./interfaces/routes/CourierRoutes"));
const env_1 = require("./config/env");
dotenv_1.default.config();
const app = (0, express_1.default)();
const PORT = env_1.config.port;
app.use((0, helmet_1.default)());
app.use((0, cors_1.default)());
app.use(express_1.default.json({ limit: '10mb' }));
app.use(express_1.default.urlencoded({ extended: true, limit: '10mb' }));
app.get('/health', (req, res) => {
    res.status(200).json({
        status: 'OK',
        message: 'User Management Service is running',
        timestamp: new Date().toISOString()
    });
});
app.use('/auth', AuthRoutes_1.default);
app.use('/users', UserRoutes_1.default);
app.use('/couriers', CourierRoutes_1.default);
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({
        error: 'Internal Server Error',
        message: env_1.config.nodeEnv === 'development' ? err.message : undefined
    });
});
app.listen(PORT, () => {
    console.log(`User Management Service listening on port ${PORT}`);
});
//# sourceMappingURL=main.js.map
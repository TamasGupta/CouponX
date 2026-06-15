"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.errorHandler = errorHandler;
function errorHandler(err, _req, res, _next) {
    console.error('Error:', err.message);
    res.status(500).json({ message: err.message || 'Internal server error' });
}
//# sourceMappingURL=error.js.map
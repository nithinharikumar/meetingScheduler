"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validate = void 0;
const zod_1 = require("zod");
const validate = (schema) => {
    return async (req, res, next) => {
        try {
            const parsed = await schema.parseAsync({
                body: req.body,
                query: req.query,
                params: req.params,
            });
            // Replace req objects with verified/coerced ones
            req.body = parsed.body;
            req.query = parsed.query;
            req.params = parsed.params;
            next();
        }
        catch (error) {
            if (error instanceof zod_1.ZodError) {
                res.status(400).json({
                    success: false,
                    error: {
                        code: 'VALIDATION_ERROR',
                        message: 'Invalid request parameters',
                        details: error.errors.map((err) => ({
                            field: err.path.join('.'),
                            message: err.message,
                        })),
                    },
                });
                return;
            }
            next(error);
        }
    };
};
exports.validate = validate;

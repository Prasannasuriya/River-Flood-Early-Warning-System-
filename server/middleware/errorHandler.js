// Centralized Error Handling Middleware
const notFoundHandler = (req, res, next) => {
    res.status(404).json({
        success: false,
        message: `Endpoint Not Found - ${req.originalUrl}`
    });
};

const globalErrorHandler = (err, req, res, next) => {
    console.error('Unhandled Application Error:', err);
    res.status(err.status || 500).json({
        success: false,
        message: err.message || 'Internal Server Error',
        error: process.env.NODE_ENV === 'development' ? err : {}
    });
};

module.exports = { notFoundHandler, globalErrorHandler };

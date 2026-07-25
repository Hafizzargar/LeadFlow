class ApiResponse {
  static success(res, data, statusCode = 200, meta = {}) {
    const response = {
      success: true,
      data,
    };

    if (meta.pagination) {
      response.pagination = meta.pagination;
    }

    return res.status(statusCode).json(response);
  }

  static created(res, data) {
    return this.success(res, data, 201);
  }

  static error(res, message, statusCode = 500) {
    return res.status(statusCode).json({
      success: false,
      error: message,
      statusCode,
    });
  }

  static badRequest(res, message = 'Bad request') {
    return this.error(res, message, 400);
  }

  static unauthorized(res, message = 'Unauthorized') {
    return this.error(res, message, 401);
  }

  static forbidden(res, message = 'Forbidden') {
    return this.error(res, message, 403);
  }

  static notFound(res, message = 'Resource not found') {
    return this.error(res, message, 404);
  }
}

module.exports = ApiResponse;

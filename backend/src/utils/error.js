/**
 * Utility functions for error handling
 */

/**
 * Handles server errors and sends appropriate response
 * @param {Object} res - Express response object
 * @param {Error} error - Error object
 * @param {string} message - Optional custom error message
 * @returns {Object} Response with error status and message
 */
const handleServerError = (res, error, message = 'Server error') => {
  console.error(`Server Error: ${error.message}`, error);
  return res.status(500).json({
    success: false,
    message: message,
    error: process.env.NODE_ENV === 'development' ? error.message : undefined
  });
};

module.exports = {
  handleServerError
}; 
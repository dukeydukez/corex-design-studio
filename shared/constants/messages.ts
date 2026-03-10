# API Error Codes

export enum ApiErrorCode {
  INVALID_REQUEST = 'INVALID_REQUEST',
  UNAUTHORIZED = 'UNAUTHORIZED',
  FORBIDDEN = 'FORBIDDEN',
  NOT_FOUND = 'NOT_FOUND',
  CONFLICT = 'CONFLICT',
  RATE_LIMITED = 'RATE_LIMITED',
  SERVER_ERROR = 'SERVER_ERROR',
  SERVICE_UNAVAILABLE = 'SERVICE_UNAVAILABLE',
}

# User Messages

export const UserMessages = {
  SUCCESS: 'Operation completed successfully',
  ERROR_GENERIC: 'An error occurred. Please try again.',
  AUTH_REQUIRED: 'Authentication required',
  PERMISSION_DENIED: 'You do not have permission to perform this action',
  NOT_FOUND: 'Resource not found',
  DESIGN_GENERATED: 'Design generated successfully',
  DESIGN_GENERATION_FAILED: 'Failed to generate design',
};

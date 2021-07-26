export class ValidationError extends Error {
  constructor(message: string) {
    super(message);

    Object.defineProperty(this, 'name', {value: 'ValidationError'});

    Object.setPrototypeOf(this, ValidationError.prototype);
    Error.captureStackTrace(this, this.constructor);
  }
}

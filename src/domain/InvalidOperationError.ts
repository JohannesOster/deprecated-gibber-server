export class InvalidOperationError extends Error {
  constructor(message: string) {
    super(message);

    Object.defineProperty(this, 'name', {value: 'InvalidOperationError'});

    Object.setPrototypeOf(this, InvalidOperationError.prototype);
    Error.captureStackTrace(this, this.constructor);
  }
}

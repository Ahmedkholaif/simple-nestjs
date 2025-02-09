import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpStatus,
} from '@nestjs/common';
import { Response } from 'express';
import { QueryFailedError } from 'typeorm';

@Catch(QueryFailedError)
export class DatabaseExceptionFilter implements ExceptionFilter {
  catch(exception: QueryFailedError, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    const { message, driverError } = exception;
    const detail =
      driverError && 'detail' in driverError ? driverError.detail : '';
    const errorMessage = detail || message || 'Database error occurred';
    let statusCode = HttpStatus.INTERNAL_SERVER_ERROR;

    if (
      exception.message.includes(
        'duplicate key value violates unique constraint',
      )
    ) {
      statusCode = HttpStatus.CONFLICT;
    }

    response.status(statusCode).json({
      statusCode,
      message: errorMessage,
    });
  }
}

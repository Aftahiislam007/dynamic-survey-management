import { Injectable, NestMiddleware, Logger } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

@Injectable()
export class LoggerMiddleware implements NestMiddleware {
  private logger = new Logger('HTTP');

  use(request: Request, response: Response, next: NextFunction): void {
    const { ip, method, originalUrl } = request;
    const userAgent = request.get('user-agent') || '';
    const start = process.hrtime();

    response.on('finish', () => {
      const { statusCode } = response;
      const contentLength = response.get('content-length');
      const diff = process.hrtime(start);
      const responseTime = diff[0] * 1e3 + diff[1] * 1e-6; // Convert to milliseconds

      this.logger.log(
        `${method} ${originalUrl} ${statusCode} ${responseTime.toFixed(2)}ms ${contentLength || '-'} - ${userAgent} ${ip}`,
      );

      // Log slow requests specifically
      if (responseTime > 1000) {
        // Example threshold: 1 second
        this.logger.warn(
          `SLOW REQUEST: ${method} ${originalUrl} took ${responseTime.toFixed(2)}ms`,
        );
      }
    });

    next();
  }
}

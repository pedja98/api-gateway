import { Injectable, NestMiddleware, BadRequestException } from '@nestjs/common'
import { Request, Response, NextFunction } from 'express'
import { UserTypes } from '../consts/common'

@Injectable()
export class HeadersValidateMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    const requiredHeaders = ['x-user-type', 'x-username']

    const missingHeaders = requiredHeaders.filter((header) => !req.headers[header])

    if (missingHeaders.length > 0) {
      throw new BadRequestException(`Missing required headers: ${missingHeaders.join(', ')}`)
    }

    if (!Object.values(UserTypes).includes(req.headers['x-user-type'] as string)) {
      throw new BadRequestException(`Invalid user type: ${req.headers['x-user-type'] as string}`)
    }

    next()
  }
}

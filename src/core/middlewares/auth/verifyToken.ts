import { PrismaClient } from '@prisma/client'
import { NextFunction, Response } from 'express'
import jwt, { JwtPayload } from 'jsonwebtoken'
import AuthRepository from '../../../modules/auth/auth-repository'
import { Config } from '../../config/env'
import { AuthenticationError, ForbiddenError } from '../../helpers/error'
import { onError } from '../../helpers/response'

const env = Config.instance
const userRepository: AuthRepository = new AuthRepository(new PrismaClient())

export interface Token extends JwtPayload {
  payload: string
}

export async function verifyToken(
  request: any,
  response: Response,
  next: NextFunction
) {
  try {
    const token = request.headers.authorization?.replace('Bearer ', '')
    const decodedToken: any = jwt.verify(token, `${env.config.jwtSecret}`)
    const dbUser = await userRepository.findByEmail(`${decodedToken.payload}`)

    if (!dbUser) throw new AuthenticationError('Usuário não encontrado')

    if (!dbUser.status || dbUser.status !== 'approved')
      throw new ForbiddenError('Usuário não autorizado')

    request.user = dbUser

    next()
  } catch (error: any) {
    return onError(response, error)
  }
}

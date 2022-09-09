// @ts-expect-error
import { PrismaClient, user } from '@prisma/client'
import AuthRepository from './auth-repository'
import bcrypt from 'bcrypt'
import * as yup from 'yup'
import jwt from 'jsonwebtoken'
import fs from 'fs'
import path from 'path'
import { sendEmail } from '../../core/providers/nodemailer'
import {
  AuthenticationError,
  BadRequestError,
  NotFoundError,
  UnprocessableEntityError,
} from '../../core/helpers/error'
import {
  UserLoginPayload,
  UserRegisterPayload,
  UserForgotPasswordPayloadDTO,
} from './auth-interfaces'
import { Config } from '../../core/config/env'

const env = Config.instance
export default class AuthService {
  private readonly authRepository: AuthRepository

  constructor(public prismaClient: PrismaClient) {
    this.authRepository = new AuthRepository(prismaClient)
  }

  private _generateAuthToken(email: string, expiresIn: string = '24h') {
    return jwt.sign({ payload: email }, env.config.jwtSecret, { expiresIn })
  }

  async login(payload: UserLoginPayload) {
    const userSchema = yup.object({
      email: yup.string().email().required(),
      password: yup.string().min(8).required(),
    })
    const validatedData = await userSchema.validate(payload)

    const user = await this.authRepository.findByEmail(validatedData.email)

    if (!user) throw new AuthenticationError('Usuário inválido!')

    const isPasswordValid = await bcrypt.compare(
      validatedData.password,
      user.password
    )

    if (!isPasswordValid) throw new AuthenticationError('Usuário inválido!')

    const { password, ...userResponse } = user

    return {
      token: this._generateAuthToken(user.email),
      user: userResponse,
    }
  }

  async register(payload: UserRegisterPayload) {
    console.log('payload', payload)
    const userSchema = yup.object({
      name: yup.string().min(3).required(),
      email: yup.string().email().required(),
      password: yup.string().min(8).required(),
      roleId: yup.number().required(),
    })
    const validatedData = await userSchema.validate(payload)

    const isRegistered = await this.authRepository.findByEmail(
      validatedData.email
    )

    if (isRegistered) throw new AuthenticationError('Usuário inválido!')

    const salt = await bcrypt.genSalt()
    const hashPassword = await bcrypt.hash(validatedData.password, salt)

    let data = payload
    data = {
      ...data,
      password: hashPassword
    }

    console.log('{...data, ...payload}', data)
    const { password, ...userResponse } = await this.authRepository.store(data)
    return { user: userResponse }
  }

  async forgotPassword(email: string) {
    const userSchema = yup.object({
      email: yup.string().email().required(),
    })
    const validatedData = await userSchema.validate(email)

    const user = await this.authRepository.findByEmail(validatedData.email)

    if (!user) throw new AuthenticationError('Usuário inválido!')

    const template = fs.readFileSync(
      path.resolve(__dirname, '../../templates/forgot-password.html')
    )

    const token = this._generateAuthToken(user.email, '1h')

    const success = this.authRepository.saveConfirmationCode(user.id, token)

    if (!success)
      throw new UnprocessableEntityError('Erro ao processar solicitação')

    let emailBody = template
      .toString()
      .replace('#front-url#', env.config.frontURL)
    emailBody = emailBody.replace('#confirmation-code#', `${token}`)

    const message = await sendEmail(
      user.email,
      'Esqueci Minha Senha',
      emailBody
    )

    return message
  }

  async me(requestUser: user) {
    const dbUser = await this.authRepository.findByEmail(requestUser.email)

    if (!dbUser) throw new NotFoundError('Usuário não encontrado!')

    // @ts-ignore
    const { password, confirmationCode, ...userResponse } = dbUser
    return { user: userResponse }
  }

  async updatePassword(payload: UserForgotPasswordPayloadDTO) {
    const userSchema = yup.object({
      newPassword: yup.string().min(8).required(),
      newPasswordConfirmation: yup.string().min(8).required(),
      confirmationCode: yup.string().required(),
    })

    const validatedData = await userSchema.validate(payload)

    if (validatedData.newPassword !== validatedData.newPasswordConfirmation)
      throw new BadRequestError('Senha inválida!')

    const decodedToken = jwt.verify(
      validatedData.confirmationCode,
      env.config.jwtSecret
    )
    const user = await this.authRepository.findByConfirmationCode(
      validatedData.confirmationCode
    )

    if (!decodedToken || !user) throw new BadRequestError('Código inválido!')

    await this.authRepository.saveConfirmationCode(user.id, null)

    const salt = await bcrypt.genSalt()
    const hashPassword = await bcrypt.hash(validatedData.newPassword, salt)

    const isPassSaved = await this.authRepository.updatePassword(
      user.id,
      hashPassword
    )

    if (!isPassSaved) throw new UnprocessableEntityError('Senha Inválida!')

    return `Senha atualizada com sucesso!`
  }
}

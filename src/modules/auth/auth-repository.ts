// @ts-expect-error
import { PrismaClient, user } from '@prisma/client'
//import { UserRegisterPayload } from './auth-interfaces'

export default class AuthRepository {
  constructor(private readonly client: PrismaClient) {}

  public async findByEmail(email: string): Promise<user | null> {
    const user = await this.client.user.findFirst({
      where: { email },
      include:{
        role: true, 
      }
    })
    if(user){
      console.log('user',user)
    }
    return user
  }

  public async findByConfirmationCode(
    confirmationCode: string
  ): Promise<user | null> {
    const user = await this.client.user.findFirst({
      // @ts-ignore
      where: { confirmationCode },
    })
    return user
  }

  public async saveConfirmationCode(
    id: number,
    confirmationCode: string | null
  ): Promise<user> {
    const user = await this.client.user.update({
      where: { id },
      // @ts-ignore
      data: { confirmationCode },
    })

    return user
  }

  public async updatePassword(id: number, password: string): Promise<user> {
    const user = await this.client.user.update({
      where: { id },
      data: { password },
    })

    return user
  }

  public async store(data: any): Promise<user> {
   
    const user = await this.client.user.create({
      data,
    })

    return user
  }
}

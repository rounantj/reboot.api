'use strict'
import fs from 'fs'
import express, { Application, Router } from 'express'
import { Module } from './modules/module-interface'
import cors from 'cors'
import { verifyToken } from './core/middlewares/auth/verifyToken'
import { Config } from './core/config/env'
import AuthModule from './modules/auth/auth-module'
import morgan from 'morgan'

export { onSuccess, onError } from './core/helpers/response'
export * from './core/helpers/error'
export interface Bootstrap {
  modules: Array<Module>
  context: string
  version: string
}
export class PullupModules implements Bootstrap {
  public modules: Array<Module> = [new AuthModule('auth')]
  public context: string
  public version: string
  private _env: Config

  constructor(modules: Array<Module>) {
    this._env = Config.instance
    this.modules = this.modules.concat(modules)
    this.context = this._env.config.apiContext || 'api'
    this.version = this._env.config.apiVersion || 'v1'
  }

  public bootstrap() {
    const router: Router = Router()
    const app: Application = express()

    app.disable('x-powered-by')
    app.use(morgan('dev'))
    app.use(
      cors({
        allowedHeaders: [
          'Origin',
          'X-Requested-With',
          'Content-Type',
          'queue-token',
          'Accept',
          'X-Access-Token',
          'Authorization',
        ],
        credentials: true,
        methods: 'GET,HEAD,OPTIONS,PUT,PATCH,POST,DELETE',
        origin: '*',
        preflightContinue: false,
      })
    )
    app.use(express.json({ limit: '5mb' }))
    app.use(express.urlencoded({ extended: true }))

    this.modules.forEach((module) => {
      router.use(
        `/${this.context}/${this.version}/${module.moduleName}`,
        -!module.isPublic ? verifyToken : (_, __, next) => next(),
        module.router.router
      )
    })
    app.use(router)

    app
      .listen(this._env.config.serverPort, () => {
        console.log(
          `Server up and running on port: ${this._env.config.serverPort} `
        )
      })
      .on('error', (error) => console.error(`Error: ${error}`))

    return app
  }
}

export class StartModules {
  modules: Array<string>
  folderName: string = 'unknow'
  constructor(modules: Array<string>, folderName: string = 'unknowContext') {
    this.folderName = folderName
    this.modules = modules
  }

  async createModules(srcDirName: string) {
    const moduleFiles: string[] = []
    let files: any
    if (!fs.existsSync(`${srcDirName}/modules`)) {
      fs.mkdirSync(`${srcDirName}/modules`, { recursive: true })
    }

    files = fs.readdirSync(`${srcDirName}/modules`)

    this.modules.forEach((module) => {
      let isOk = true
      for (const file in files) {
        if (file === module) {
          isOk = false
        }
      }
      if (isOk) {
        moduleFiles.push(module)
      }
    })

    moduleFiles.forEach((moduleFile) => {
      let modelName = moduleFile.charAt(0).toUpperCase() + moduleFile.slice(1)
      if (!fs.existsSync(`${srcDirName}/modules/${moduleFile}`)) {
        fs.mkdir(
          `${srcDirName}/modules/${moduleFile}`,
          { recursive: true },
          (err) => {
            if (err) console.error(err)
          }
        )
      }

      if (
        fs.existsSync(
          srcDirName +
            '/node_modules/@pullup.tech/cms/samples/controller-sample.txt'
        )
      ) {
        let controller = fs.readFileSync(
          srcDirName +
            '/node_modules/@pullup.tech/cms/samples/controller-sample.txt'
        )
        const controllerCode = Buffer.from(controller)
          .toString()
          .replace(/{{MODULE_NAME}}/g, moduleFile)
          .replace(/{{MODEL_NAME}}/g, modelName)
        fs.writeFile(
          `${srcDirName}/modules/${moduleFile}/${moduleFile}-controller.ts`,
          controllerCode,
          (err) => {
            if (err) console.error(err)
            else {
              console.log('Controller File written successfully\n')
            }
          }
        )
      } else {
        console.log('Controller File not written\n')
      }

      if (
        fs.existsSync(
          srcDirName +
            '/node_modules/@pullup.tech/cms/samples/router-sample.txt'
        )
      ) {
        let controller = fs.readFileSync(
          srcDirName +
            '/node_modules/@pullup.tech/cms/samples/router-sample.txt'
        )
        const controllerCode = Buffer.from(controller)
          .toString()
          .replace(/{{MODULE_NAME}}/g, moduleFile)
          .replace(/{{MODEL_NAME}}/g, modelName)
        fs.writeFile(
          `${srcDirName}/modules/${moduleFile}/${moduleFile}-router.ts`,
          controllerCode,
          (err) => {
            if (err) console.error(err)
            else {
              console.log('Router File written successfully\n')
            }
          }
        )
      } else {
        console.log('Router File not written\n')
      }

      if (
        fs.existsSync(
          srcDirName +
            '/node_modules/@pullup.tech/cms/samples/service-sample.txt'
        )
      ) {
        let controller = fs.readFileSync(
          srcDirName +
            '/node_modules/@pullup.tech/cms/samples/service-sample.txt'
        )
        const controllerCode = Buffer.from(controller)
          .toString()
          .replace(/{{MODULE_NAME}}/g, moduleFile)
          .replace(/{{MODEL_NAME}}/g, modelName)
        fs.writeFile(
          `${srcDirName}/modules/${moduleFile}/${moduleFile}-service.ts`,
          controllerCode,
          (err) => {
            if (err) console.error(err)
            else {
              console.log('Service File written successfully\n')
            }
          }
        )
      } else {
        console.log('Service File not written\n')
      }

      if (
        fs.existsSync(
          srcDirName +
            '/node_modules/@pullup.tech/cms/samples/repository-sample.txt'
        )
      ) {
        let controller = fs.readFileSync(
          srcDirName +
            '/node_modules/@pullup.tech/cms/samples/repository-sample.txt'
        )
        const controllerCode = Buffer.from(controller)
          .toString()
          .replace(/{{MODULE_NAME}}/g, moduleFile)
          .replace(/{{MODEL_NAME}}/g, modelName)
        fs.writeFile(
          `${srcDirName}/modules/${moduleFile}/${moduleFile}-repository.ts`,
          controllerCode,
          (err) => {
            if (err) console.error(err)
            else {
              console.log('Repository File written successfully\n')
            }
          }
        )
      } else {
        console.log('Repository File not written\n')
      }

      if (
        fs.existsSync(
          srcDirName +
            '/node_modules/@pullup.tech/cms/samples/module-sample.txt'
        )
      ) {
        let controller = fs.readFileSync(
          srcDirName +
            '/node_modules/@pullup.tech/cms/samples/module-sample.txt'
        )
        const controllerCode = Buffer.from(controller)
          .toString()
          .replace(/{{MODULE_NAME}}/g, moduleFile)
          .replace(/{{MODEL_NAME}}/g, modelName)
        fs.writeFile(
          `${srcDirName}/modules/${moduleFile}/${moduleFile}-module.ts`,
          controllerCode,
          (err) => {
            if (err) console.error(err)
            else {
              console.log('Module File written successfully\n')
            }
          }
        )
      } else {
        console.log('Module File not written\n')
      }

      if (
        fs.existsSync(
          srcDirName +
            '/node_modules/@pullup.tech/cms/samples/interfaces-sample.txt'
        )
      ) {
        let controller = fs.readFileSync(
          srcDirName +
            '/node_modules/@pullup.tech/cms/samples/interfaces-sample.txt'
        )
        const controllerCode = Buffer.from(controller)
          .toString()
          .replace(/{{MODULE_NAME}}/g, moduleFile)
          .replace(/{{MODEL_NAME}}/g, modelName)
        fs.writeFile(
          `${srcDirName}/modules/${moduleFile}/${moduleFile}-interfaces.ts`,
          controllerCode,
          (err) => {
            if (err) console.error(err)
            else {
              console.log('Interfaces File written successfully\n')
            }
          }
        )
      } else {
        console.log('Interfaces File not written\n')
      }
    })
  }

  removeModule(srcDirName: string, name: string) {
    if (fs.existsSync(`${srcDirName}/modules/${name}`)) {
      fs.rmdir(
        `${srcDirName}/modules/${name}`,
        { recursive: true },
        (error) => {
          if (error) {
            console.error(error)
          } else {
            console.log('Folder Deleted!')
          }
        }
      )
    }
  }
}

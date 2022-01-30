import { envSchema, EnvSchemaOpt } from 'env-schema'
import { FastifyInstance, FastifyServerOptions, fastify as buildFastify } from 'fastify'

import { buildDataStorageClient } from '../clients/dataStorage'
import { buildMediaStorageClient, registerGetMediaRoute } from '../clients/mediaStorage'
import { onFastifyCloseHandler } from '../hooks/onFastifyClose'
import { Environment, environmentSchema } from '../schemas/environment'

import { buildBot } from './bot'
import { retrieveConfiguration } from './configuration'
import { setupInternationalization } from './i18n'

export const buildService = async (): Promise<FastifyInstance> => {
  const envOptions: EnvSchemaOpt = { schema: environmentSchema, dotenv: true }
  const environment = envSchema(envOptions) as Environment

  const fastifyOpts: FastifyServerOptions = { logger: { level: environment.LOG_LEVEL } }
  const fastify = buildFastify(fastifyOpts)

  fastify.decorate('env', environment)

  const i18n = await setupInternationalization(fastify)
  fastify.decorate('i18n', i18n)

  const configuration = await retrieveConfiguration(fastify)
  fastify.decorate('configuration', configuration)

  const dataStorageClient = buildDataStorageClient(fastify)
  fastify.decorate('dataStorageClient', dataStorageClient)

  const mediaStorageClient = buildMediaStorageClient(fastify)
  fastify.decorate('mediaStorageClient', mediaStorageClient)
  registerGetMediaRoute(fastify)

  const bot = buildBot(fastify)
  fastify.decorate('bot', bot)
  await fastify.bot.launch()

  fastify.addHook('onClose', onFastifyCloseHandler)

  await fastify.ready()

  return fastify
}
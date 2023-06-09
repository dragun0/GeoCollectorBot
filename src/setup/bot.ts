import { FastifyInstance } from 'fastify'
import { Telegraf } from 'telegraf'

import {
  buildAbortCommandHandler,
  buildCallbackQueryHandler,
  buildCollectCommandHandler,
  buildHelpCommandHandler,
  buildLocationHandler,
  buildMediaHandler,
  buildStartCommandHandler,
  buildTextHandler,
  buildSkipCommandHandler,
} from '../handlers'
import {
  buildExtractInfoMiddleware,
  buildHandleErrorMiddleware,
  buildRetrieveInteractionMiddleware,
  buildSetLanguageMiddleware,
  buildUnsupportedUpdateMiddleware,
} from '../middlewares'
import { DecoratedContext } from '../models/DecoratedContext'
import { MediaStepSubtype } from '../models/Flow'

const BOT_WEBHOOK_PATH = '/bot'

const setupWebhook = async (service: FastifyInstance, bot: Telegraf<DecoratedContext<any>>) => {
  const { env: { PUBLIC_URL } } = service

  if (!PUBLIC_URL) {
    throw new Error('You must provide the PUBLIC_URL env variable to use webhook mode')
  }

  service.post(BOT_WEBHOOK_PATH, (request, reply) => { bot.handleUpdate(request.body as any, reply.raw) })

  await bot.telegram.setWebhook(`${PUBLIC_URL}${BOT_WEBHOOK_PATH}`)
}

export const buildBot = async (service: FastifyInstance): Promise<Telegraf<DecoratedContext>> => {
  const { env: { TELEGRAM_AUTH_TOKEN, UPDATE_MODE } } = service

  const bot = new Telegraf<DecoratedContext>(TELEGRAM_AUTH_TOKEN)

  if (UPDATE_MODE === 'webhook') { await setupWebhook(service, bot) }

  bot
    .use(buildSetLanguageMiddleware(service))
    .start(buildStartCommandHandler(service))
    .help(buildHelpCommandHandler(service))
    //
    .use(buildExtractInfoMiddleware(service))
    .command('collect', buildCollectCommandHandler(service))
    //
    .use(buildRetrieveInteractionMiddleware(service))
    .command('abort', buildAbortCommandHandler(service))
    .command('skip', buildSkipCommandHandler(service))
    .on('text', buildTextHandler(service))
    .action(/^mcq::/, buildCallbackQueryHandler(service))
    .on('location', buildLocationHandler(service))
    .on('photo', buildMediaHandler(service, { mediaType: MediaStepSubtype.PHOTO }))
    .on('video', buildMediaHandler(service, { mediaType: MediaStepSubtype.VIDEO }))
    //
    .use(buildUnsupportedUpdateMiddleware(service))
    //
    .catch(buildHandleErrorMiddleware(service))

  return bot
}

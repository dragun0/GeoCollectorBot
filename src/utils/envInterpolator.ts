import { FastifyInstance } from 'fastify'
import * as Handlebars from 'handlebars'

function interpolateObjectValuesDeep (obj: Record<string, any>, env: Record<string, any>) {
  Object
    .keys(obj)
    .forEach(key => {
      const value = obj[key]

      if (value instanceof Object && !Array.isArray(value)) { interpolateObjectValuesDeep(value, env) }

      if (typeof value !== 'string') { return }

      obj[key] = Handlebars.compile(obj[key])(env)
    })
}

export const interpolateEnv = (obj: Record<string, any>, service: FastifyInstance): void => {
  const { env } = service

  service.log.debug({ env, obj }, 'Pre')

  interpolateObjectValuesDeep(obj, env)

  service.log.debug({ obj }, 'Post')
}

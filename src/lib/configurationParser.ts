import { FastifyLoggerInstance } from 'fastify'

import { getDataStorageBaseKeys } from '../clients/dataStorage'
import { ParsedFlow, ParsedSteps, StepType } from '../models/Flow'
import { BaseInteractionKeys } from '../models/Interaction'
import { BotConfiguration, DataStorage, FlowStep, MediaStorage } from '../schemas/config'

const parseSteps = (
  logger: FastifyLoggerInstance,
  rawSteps: FlowStep[],
  allStepsIds: string[],
  dataStorageConfig: DataStorage,
  mediaStorageConfig?: MediaStorage
): ParsedSteps => {
  const hasMediaStorage = Boolean(mediaStorageConfig)

  const dataStorageBaseKeys = getDataStorageBaseKeys(dataStorageConfig.type)
  const internalBaseKeys = Object.values(BaseInteractionKeys)
  const reservedKeys = new Set([...dataStorageBaseKeys, ...internalBaseKeys])

  const foundDbKeys: string[] = []

  return rawSteps.reduce((currSteps, currRawStep) => {
    const { persistAs, ...rest } = currRawStep
    const { type } = currRawStep.config
    const dbKey = persistAs || currRawStep.id

    if (currSteps[currRawStep.id]) {
      logger.error({ id: currRawStep.id }, 'Error parsing steps configuration: id is not unique')
      throw new Error('Error parsing steps configuration: id is not unique')
    }

    if (currRawStep.nextStepId != null && !allStepsIds.includes(currRawStep.nextStepId)) {
      logger.error({ step: currSteps }, 'Error parsing steps configuration: cannot find next step')
      throw new Error('Error parsing steps configuration: cannot find next step')
    }

    if (currRawStep.nextStepId === currRawStep.id) {
      logger.error({ step: currSteps }, 'Error parsing steps configuration: circular dependency')
      throw new Error('Error parsing steps configuration: circular dependency')
    }

    if (foundDbKeys.includes(dbKey)) {
      logger.error({ step: currSteps }, 'Error parsing steps configuration: duplicate db key')
      throw new Error('Error parsing steps configuration: duplicate db key')
    }

    if (reservedKeys.has(dbKey)) {
      logger.error({ step: currSteps, reservedKeys }, 'Error parsing steps configuration: cannot use a db reserved key')
      throw new Error('Error parsing steps configuration: cannot use a db reserved key')
    }

    foundDbKeys.push(dbKey)

    if ((type === StepType.SINGLE_MEDIA || type === StepType.MULTIPLE_MEDIA) && !hasMediaStorage) {
      logger.error({ step: currSteps }, 'Error parsing steps configuration: missing media storage config')
      throw new Error('Error parsing steps configuration: missing media storage config')
    }

    currSteps[currRawStep.id] = { ...rest, persistAs: dbKey }

    return currSteps
  }, {} as ParsedSteps)
}

export const parseFlow = (rawConfig: BotConfiguration, logger: FastifyLoggerInstance): ParsedFlow => {
  const { flow: rawFlow, dataStorage, mediaStorage } = rawConfig
  const { firstStepId, steps: rawSteps } = rawFlow

  const allStepsIds = rawSteps.map(step => step.id)

  if (!allStepsIds.includes(firstStepId)) {
    logger.error({ firstStepId }, 'Error parsing flow configuration: cannot find first step')
    throw new Error('Error parsing flow configuration: cannot find first step')
  }

  const parsedSteps = parseSteps(logger, rawSteps, allStepsIds, dataStorage, mediaStorage)

  return { firstStepId, steps: parsedSteps }
}

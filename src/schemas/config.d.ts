/* eslint-disable */
/**
 * This file was automatically generated by json-schema-to-typescript.
 * DO NOT MODIFY IT BY HAND. Instead, modify the source JSONSchema file,
 * and run `yarn make-types` to regenerate this file.
 */

export type DataStorage = PgConfig
export type MediaStorage = FsConfig
export type LocalizedText =
  | string
  | {
      en: string
      [k: string]: string
    }
export type FlowStepConfig =
  | TextFlowStepConfig
  | MultipleChoiceFlowStepConfig
  | LocationFlowStepConfig
  | SingleMediaFlowStepConfig
  | MultipleMediaFlowStepConfig

export interface BotConfiguration {
  $schema?: string
  settings?: Settings
  dataStorage: DataStorage
  mediaStorage?: MediaStorage
  flow: Flow
}
export interface Settings {
  /**
   * 'If set to true, user's data will be returned by the get interactions api'
   */
  includeUserInfoInGetInteractionsApi?: boolean
}
export interface PgConfig {
  type: "postgres"
  configuration: {
    connectionString: string
    interactionsTable: string
    ssl: boolean
  }
}
export interface FsConfig {
  type: "fileSystem"
  configuration: {
    folderPath: string
  }
}
export interface Flow {
  firstStepId: string
  /**
   * @minItems 1
   */
  steps: [FlowStep, ...FlowStep[]]
}
export interface FlowStep {
  id: string
  question: LocalizedText
  persistAs?: string
  nextStepId?: string
  config: FlowStepConfig
  skippable?: boolean
}
export interface TextFlowStepConfig {
  type: "text"
}
export interface MultipleChoiceFlowStepConfig {
  type: "multipleChoice"
  /**
   * @minItems 1
   */
  options: [
    [
      {
        text: LocalizedText
        value: string
      },
      ...{
        text: LocalizedText
        value: string
      }[]
    ],
    ...[
      {
        text: LocalizedText
        value: string
      },
      ...{
        text: LocalizedText
        value: string
      }[]
    ][]
  ]
}
export interface LocationFlowStepConfig {
  type: "location"
}
export interface SingleMediaFlowStepConfig {
  type: "singleMedia"
  acceptOnly?: "photo" | "video"
}
export interface MultipleMediaFlowStepConfig {
  type: "multipleMedia"
  maxItems?: number
  acceptOnly?: "photo" | "video"
}

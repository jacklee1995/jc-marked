import fs from 'node:fs'
import path from 'node:path'
import { logger } from './logger'
import { Parser } from './main'

function readFile(filepath: string) {
  return fs.readFileSync(filepath).toString()
}
const examplePath = path.join(path.resolve(__dirname, '..'), 'example.md')

const example = readFile(examplePath)

const machine = new Parser(example);
// 启动状态机
machine.executeInput();
logger.info(JSON.stringify(machine.res));
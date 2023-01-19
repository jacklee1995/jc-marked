import path from 'node:path'
import log4js from 'log4js'

log4js.configure({  
  appenders: {  
      fileout: { type: "file", filename: path.join(__dirname,'fileout.log') }, 
      datafileout: {
          type: "dateFile", 
          filename: "datafileout.log", 
          pattern: ".yyyy-MM-dd-hh-mm-ss-SSS"
      },
      consoleout: { type: "console" }, 
  }, 
  categories: {    
      default: { appenders: ["fileout", "consoleout"], level: "debug" },   
      anything: { appenders: ["consoleout"], level: "debug" }
  }
});
const logger = log4js.getLogger();

export {
  logger
}
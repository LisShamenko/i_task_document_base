const path = require("path");

// конфигурировать переменные процесса
exports.initDotenv = function () {

  let envFileName;
  if (process.env.NODE_ENV === "production") {
    envFileName = "config/.env.prod";
  } else {
    envFileName = "config/.env.local";
  }

  // 
  let dotenv = require("dotenv");
  dotenv.config({ 
    path: path.resolve(process.cwd(), envFileName) 
  });
}

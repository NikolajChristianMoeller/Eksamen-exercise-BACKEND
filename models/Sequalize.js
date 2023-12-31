import { Sequelize } from "sequelize";
import "dotenv/config";
import fs from "fs";

//set connection credentials and accespoint for backend to use

const pEnv = process.env;

const PORT = pEnv.PORT | 3000;


const sequelize = new Sequelize(
    pEnv.MYSQL_DATABASE,
    pEnv.MYSQL_USER,
    pEnv.MYSQL_PASSWORD,
    {
      host: pEnv.MYSQL_HOST,
      dialect: "mysql",
      dialectOptions: {
        ssl: {
          ca: fs.readFileSync("./DigiCertGlobalRootCA.crt.pem"),
        },
      },
    }
  );

  export default sequelize
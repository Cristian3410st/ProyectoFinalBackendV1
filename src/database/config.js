import mysql from "promise-mysql"
import {
    DB_HOST,
    DB_NAME,
    DB_USER,
    DB_PASSWORD,
    DB_PORT,
} from "../variables.js"

const connection = mysql.createConnection({
    user: DB_USER,
    password:DB_PASSWORD,
    host: DB_HOST,
    port: DB_PORT,
    database: DB_NAME
});


const getconnection = async () => {
    try{
    await connection;
    console.log("conectado a la base de datos");
    return connection;
    
    }catch(error){
        console.log(error);
    }
}


export default getconnection;
import mysql from "promise-mysql"
import dotenv from "dotenv"
dotenv.config()

const connection = mysql.createConnection({
    user: process.env.DB_USER,
    password:process.env.DB_PASSWORD,
    host:process.env.DB_HOST,
    port:process.env.DB_PORT,
    database:process.env.DB_NAME
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
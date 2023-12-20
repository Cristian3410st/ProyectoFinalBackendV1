import {createPool} from "mysql2/promise"
import dotenv from "dotenv"
dotenv.config()

const pool = createPool({
    connectionLimit:10,
    user: process.env.DB_USER,
    password:process.env.DB_PASSWORD,
    host:process.env.DB_HOST,
    port:process.env.DB_PORT,
    database:process.env.DB_NAME,
   
});


const getconnection = async () => {

    let connection 

    try{
         connection = await pool.getConnection();
        console.log("conectado a la base de datos");
        return connection;
    }catch(error){
        console.error("error al obtener la conexion", error)
        throw error;
    }finally{
        if(connection){
            connection.release();
            console.log("conexion liberada")
        }
    }
}


  

export default getconnection
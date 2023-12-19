import getconnection from "../database/config.js";
import bcrypt from "bcryptjs";
import { createAccessToken } from "../libs/jwt.js";
import jwt from "jsonwebtoken"
import dotenv from "dotenv"
dotenv.config()
const TOKEN_SECRET = process.env.TOKEN_SECRET;


export const register = async (req, res) => {
  const { username,password,nombresApellidos,edad,email,cargo,supervisor} = req.body;

  const findUserQuery = "SELECT * FROM usuarios WHERE username = ?";
  const connection = await getconnection();

  try {
    const [userExist] = await connection.query(findUserQuery, [username]);

    if (userExist.length > 0) {

      return res.status(400).json({ message: "El usuario ya se encuentra registrado" });
    } else {
      const passwordHash =  await bcrypt.hash(password,10)

        const newUser =  await connection.query("INSERT INTO usuarios SET ?",{
        username:username,
        password:passwordHash,
        nombresYapellidos:nombresApellidos,
        Edad:edad,
        correoCorporativo:email,
        Cargo:cargo,
        supervisorEncargado:supervisor,
        });

        const idResult = newUser[0];

        const resUser = {id:idResult.insertId,username,email};
        console.log(resUser)
        const token =  await createAccessToken({ id:resUser.id })
          res.cookie("token",token);
          res.status(200).json({
          id:resUser.id,
         username:resUser.username,
          email:resUser.email
     })
    }
  } catch (error) {
    console.error("Error al buscar el usuario:", error);
    return res.status(500).json({ status: "error", message: "Error en la consulta SQL", error });
  }
};
      

export const login = async (req, res) => {

  const connection = await getconnection();
  const { email, password } = req.body;
  const findQuery = "SELECT * FROM usuarios WHERE correoCorporativo = ?";


  try {
      const [emailExist] = await connection.query(findQuery, [email]);

      if (!emailExist.length > 0) {
          return res.status(400).json(["Credenciales inválidas"]);
      } else {
          const passhash = emailExist[0].password;
          const compare = await bcrypt.compare(password, passhash);

          if (!compare) {
              return res.status(400).json(["Credenciales inválidas"]);
          } else {
              const saveUser = {
                  id: emailExist[0].id,
                  username: emailExist[0].username,
                  email: emailExist[0].correoCorporativo
              };

              const token = await createAccessToken({ id: saveUser.id });
              res.cookie("token", token);
              res.status(200).json({
                  id: saveUser.id,
                  username: saveUser.username,
                  email: saveUser.email
              });
          }
      }
  } catch (error) {
      console.error("Error al buscar el usuario:", error);
      return res.status(500).json({ status: "error", message: "Error en la consulta SQL", error });
  } finally{
    connection.end();
  }
};




export const profile = async (req,res)=>{
  try{
    const connection = await getconnection();
    const [find] = await connection.query("SELECT * FROM usuarios WHERE id = ?",[req.user.id])
    if(!find.length >0){
      return res.status(400).json({message:"usuario no encontrado"})
    }
    const userProfile ={
      id:find[0].id,
      username: find[0].username,
      email:find[0].correoCorporativo,
    };
    return res.status(200).json(userProfile)
  }catch(error){
    console.error("error en la consulta del perfil", error)
    return res.status(500).json({message:"error en el intento del servidor"})
  }
}


export const verifyToken = async (req, res) => {
  try {
    const { token } = req.cookies;
    if (!token) return res.send(false);

    const user = jwt.verify(token, TOKEN_SECRET);
    const connection = await getconnection();
    const finduser = "SELECT * FROM usuarios WHERE id = ?";
    
    try {
      const result = await connection.query(finduser, [user.id]);

      if (result.error || !result.length) {
        return res.sendStatus(401);
      }

      const userFound = result[0];

      return res.json({
        id: userFound.id,
        username: userFound.username,
        email: userFound.correoCorporativo,
      });
    } catch (dbError) {
      console.error("Error en la consulta SQL:", dbError);
      return res.status(500).json({ message: "Error en la consulta SQL" });
    }
  } catch (error) {
    console.error("Error al verificar el token", error);
    return res.status(401).json({ message: "Token inválido" });
  }
};



export const logout = (req,res) =>{

  res.cookie("token","",{
    httpOnly:true,
    secure:true,
  expires: new Date(0)
  });
  return res.sendStatus(200);
}



import getconnection from "../database/config.js";
import bcrypt from "bcryptjs";
import { createAccessToken } from "../libs/jwt.js";
import jwt from "jsonwebtoken"
import dotenv from "dotenv"
dotenv.config()

const TOKEN_SECRET = process.env.TOKEN_SECRET;


export const register = async (req,res) => {

 const {username,password,nombresApellidos,edad,email,cargo,supervisor} = req.body
  const find = "SELECT * FROM usuarios WHERE username = ?"
   const connection = await getconnection();
   try{
    const userExist = await connection.query(find,[username])
    if(userExist.length>0){
        return res.status(400).json(["el usuario ya se encuentra registrado"])}

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

      const resUser = {id:newUser.insertId,username,email};
      const token =  await createAccessToken({ id: resUser.id })
      res.cookie("token",token);
      res.status(200).json({
       id:resUser.id,
        username:resUser.username,
        email:resUser.email
     })

}catch(error){
  res.status(500).json({status:"error",message:"error en la consulta sql"})
}
}



export const login = async (req,res)=> {
    const {email,password} = req.body
    const connection = await getconnection();
    const find = await connection.query("SELECT * FROM usuarios WHERE correoCorporativo = ?",[email])
    if(!find.length>0){ return res.status(400).json(["credenciales invalidas"])}
    const passhash = await find[0].password
    const compare = await bcrypt.compare(password,passhash)
    if(!compare){ return res.status(400).json(["credenciales invalidas"])}

    const saveUser ={
    id:find[0].id,
    username:find[0].username,
    email:find[0].correoCorporativo
}
    const token =  await createAccessToken({ id: saveUser.id })
    res.cookie("token",token);
    res.status(200).json({
        id:saveUser.id,
         username:saveUser.username,
          email:saveUser.email
      })
}



export const profile = async (req,res)=>{
   const connection =  await getconnection();
   const find = await connection.query("SELECT * FROM usuarios WHERE id = ?", [req.user.id]);
   if(!find.length>0) return res.status(400).json({message:"usuario no encontrado"});

    return res.status(200).json({
      id:find[0].id,
      username:find[0].username,
      email:find[0].correoCorporativo,
    })
}


export const verifyToken = async (req,res) => {
 const {token} = req.cookies
 if(!token) return res.send(false)
 jwt.verify(token,TOKEN_SECRET,async (error,user)=>{
if(error) return res.sendStatus(401)
const connection = await getconnection();
const findUser = "SELECT * FROM usuarios WHERE id= ?";
connection.query(findUser,[user.id], async (dbError, result)=>{
   if (dbError||!result.length ) return res.sendStatus(401)

   const userFound = result[0];
   return res.json({
    id:userFound.id,
    username:userFound.username,
    email:userFound.correoCorporativo,
   })
})
})
} 


export const logout = (req,res) =>{

  res.cookie("token","",{
    httpOnly:true,
    secure:true,
  expires: new Date(0)
  });
  return res.sendStatus(200);
}



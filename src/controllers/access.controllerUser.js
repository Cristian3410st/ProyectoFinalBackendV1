import getconnection from "../database/config.js";
import bcrypt from "bcryptjs";
import { createAccessToken } from "../libs/jwt.js";
import jwt from "jsonwebtoken"
import dotenv from "dotenv"
dotenv.config()
const TOKEN_SECRET = process.env.TOKEN_SECRET;



export const register = async (req, res) => {
  const connection = await getconnection();
  const {username,password,nombresYapellidos,Edad,correoCorporativo,cargo,jefeDirecto,rol} = req.body
  const findQuery = "SELECT * FROM usuarios WHERE username = ? or correoCorporativo = ?"
  try{
   const [datesExists] = await connection.query(findQuery,[username,correoCorporativo])
    
   if(datesExists.length>0)
   {return res.status(400).json(['ya se encuentra registrado el usuario o el email'])}

   else{
    const passhash = await bcrypt.hash(password,10)
    const InsertUser = await connection.query("INSERT INTO usuarios SET ?",{
      username:username,
      password:passhash,
      nombresYapellidos:nombresYapellidos,
      Edad:Edad,
      correoCorporativo:correoCorporativo,
      Cargo:cargo,
      supervisorEncargado:jefeDirecto,
      rol_nombre:rol
    })
     const [findUser] = await connection.query("SELECT * FROM usuarios WHERE username = ?",[username])
     console.log(findUser[0])

     const resUser={
      username:findUser[0].username,
      email:findUser[0].correoCorporativo,
      rol:findUser[0].rol_nombre
     }

     const token = await createAccessToken({username:resUser.username})
      res.cookie("token",token,{
        secure:true
      })
      console.log("token creado",token)
      console.log("token almacenado en la cookies")
     console.log(resUser)
     res.status(200).json(resUser)
     
    }

   


  }catch(error){
    console.log(error)
    res.status(500).json({message:"error en el servidor"})
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
                  username:emailExist[0].username,
                  email:emailExist[0].correoCorporativo,
                  rol:emailExist[0].rol_nombre
              };

              const token = await createAccessToken({ username:saveUser.username});
              res.cookie("token",token)
              console.log("token creado",token)
              console.log('Token almacenado en cookies.');
              console.log(saveUser)
              res.status(200).json(saveUser);
          }
      }
  } catch (error) {
      console.error("Error al buscar el usuario:", error);
      return res.status(500).json({ status: "error", message: "Error en la consulta SQL", error });
  } finally{
    
  }
};





export const verifyToken = async (req, res) => {
  
  try {
    const { token } = req.cookies;
    console.log('Token recibido:',token);
    if (!token) return res.send(false);
    console.log('Inicio de la verificación del token');
    const user = jwt.verify(token, TOKEN_SECRET);
    const connection = await getconnection();
    const finduser = "SELECT * FROM usuarios WHERE username = ?";
    
    try {
      const result = await connection.query(finduser, [user.username]);

      if (result.error || !result.length) {
        return res.sendStatus(401);
      }

      const userFound = result[0];

      return res.json({
        username:userFound.username,
        email:userFound.correoCorporativo,
        rol:userFound.rol_nombre,
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
  return res.status(200).json({ message: "logout exitoso" });
}



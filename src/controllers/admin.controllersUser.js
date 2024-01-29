import getconnection from "../database/config.js";
import bcrypt from "bcryptjs"


export const getsSchedule = async (req,res) => {
   const id = req.user.username;
   const connection = await getconnection();
   const find ="SELECT u.username, h.diaSemana, h.horaEntradaAsignada ,h.horaSalidaAsignada,h.horaEntradaRegistrada,h.horaSalidaRegistrada, DATE_FORMAT(h.fecha,'%Y-%m-%d') as fecha, h.descanso FROM usuarios u LEFT JOIN horarios h ON u.username = h.created_by WHERE u.username = ?";
   
   try{
    const results = await connection.query(find,[id]);
    if (!results  || results.length === 0){
      return res.status(400).json(["no se encontraron horarios registrados"])
    }
    console.log(results[0]);
    return res.status(200).json(results[0])
   }catch(error){
    return res.status(500).json({ message: "Error en la consulta SQL" });
   }
}



export const markEntry = async (req,res) => {
    const id = req.user.username;
    const ahora = new Date();
    const horaActual = ahora.toTimeString().slice(0,8)
    try{
        const connection = await getconnection();
        const insert = "UPDATE horarios SET horaEntradaRegistrada = ? WHERE created_by = ? AND fecha = CURDATE()"
        const  result =  await connection.query(insert,[horaActual,id])
        console.log(horaActual)
        res.status(200).json(horaActual)
    }catch(error){
        res.status(500).json({message:"Error en la consulta SQL"})
    }
}


export const markExit = async (req,res) => {
    const id = req.user.username;
    const ahora = new Date();
    const horaActual = ahora.toTimeString().slice(0,8)
    try{
        const connection = await getconnection();
        const insert = "UPDATE horarios SET horaSalidaRegistrada = ? WHERE created_by = ? AND fecha = CURDATE()"
        const  result =  await connection.query(insert,[horaActual,id])
        console.log(horaActual)
        res.status(200).json(horaActual)
    }catch(error){
        res.status(500).json({message:"Error en la consulta SQL"})
    }
}


export const alterPassword = async (req,res)=>{
    const id = req.user.username;
    const {contraseñaActual,nuevaContraseña} = req.body;
    const connection = await getconnection();
    try{
        const [user] = await connection.query("SELECT * FROM usuarios WHERE username = ?",[id])
       if(!user.length>0){return res.status(404).json(["no se encontro el usuario"])}

        
        
         
          const compare = await bcrypt.compare(contraseñaActual,user[0].password)
         if(!compare){return res.status(404).json(["la contraseña actual es incorrecta,valide credenciales ingresadas."])}
         if(nuevaContraseña){
            const nuevaContraseñaHash = await bcrypt.hash(nuevaContraseña,10)
          await connection.query("UPDATE usuarios SET password = ? WHERE username = ?",[nuevaContraseñaHash,id])
        }
        res.status(200).json(["Cambio de contraseña realizado con éxito. Por favor, cierre sesión y vuelva a ingresar para validar su nueva contraseña"])

    }catch(error){
        console.log(error)
    }finally{
        connection.release();
    }
    
  }

 //administrador
 export const consultarHorarios = async(req,res)=>{
    const {username} = req.body
    console.log(username)
    const connection = await getconnection();
    const findUser = "SELECT u.username, h.diaSemana, h.horaEntradaAsignada ,h.horaSalidaAsignada,h.horaEntradaRegistrada,h.horaSalidaRegistrada, DATE_FORMAT(h.fecha,'%Y-%m-%d') as fecha, h.descanso FROM usuarios u LEFT JOIN horarios h ON u.username = h.created_by WHERE u.username = ?"
      const result = await connection.query(findUser,[username])
      if(!result.length>0){return res.status(404).json({message:'usuario no econtrado por favor verifique los datos ingresados'})}
      else{
        console.log(result[0])
        return res.status(200).json(result[0])

      }
 }



 export const modificarHorarios = async(req,res) =>{

  try{
  const {username,diaSemana,horaEntradaAsignada,horaSalidaAsignada,horaEntradaRegistrada,horaSalidaRegistrada,fecha} = req.body;
  const connection = await getconnection();
  const findUser = "SELECT u.username, h.diaSemana, h.horaEntradaAsignada,h.horaSalidaAsignada,h.horaEntradaRegistrada,h.horaSalidaRegistrada, DATE_FORMAT(h.fecha,'%Y-%m-%d') as fecha FROM usuarios u LEFT JOIN horarios h ON u.username = h.created_by WHERE u.username = ?";
  const result = await connection.query(findUser,[username])

  if(!result.length>0){return res.status(404).json({message:"usuario no encontrado, por favor verifique los datos ingresados"})}
  else{
    const modify = await connection.query("UPDATE horarios SET horaEntradaAsignada = ?, horaSalidaAsignada = ?, horaEntradaRegistrada = ?, horaSalidaRegistrada = ? WHERE created_by = ? AND diaSemana = ? AND fecha = ?",
    [horaEntradaAsignada,horaSalidaAsignada,horaEntradaRegistrada,horaSalidaRegistrada,username,diaSemana,fecha]);
     
  }
     }catch(error){
      console.log(error)
     }  
 }

 
 
 
 export const asignacionHorarios = async (req, res) => {

  try{
  let { username, diasLaborales, entradaAsignada, salidaAsignada, fechaInicio, fechaFin } = req.body;
  const connection = await getconnection();
  const [queryUser] = await connection.query("SELECT * FROM horarios WHERE created_by = ?", [username])
  const [queryid] = await connection.query("SELECT id FROM horarios WHERE created_by = ?", [username]);
  const [queryUsername] = await connection.query("SELECT * FROM usuarios WHERE username = ?",[username])

  if(!queryUsername.length>0){res.status(400).json({message:"el usuario no se encontro registrado por favor registrese en el sistema para asignar horarios"})}

  else{
  if (queryUser.length>0){
    const fechaInicioDate = new Date(fechaInicio);
    const fechaFinDate = new Date(fechaFin);

      let fechas = [];

    while(fechaInicioDate <= fechaFinDate){
      const fechaFormateada = fechaInicioDate.toISOString().split('T')[0];
      fechas.push(fechaFormateada);
      fechaInicioDate.setDate(fechaInicioDate.getDate() + 1);

    }

    for (let i = 0; i < queryid.length && i < fechas.length; i++) {
      const { id } = queryid[i];
      const fecha = fechas[i];

      const find = await connection.query("UPDATE horarios SET fecha = ? WHERE id = ?", [fecha, id]);
    }     

    const updateTimes = await connection.query("UPDATE horarios SET horaEntradaAsignada = ?, horaSalidaAsignada = ?  WHERE created_by = ?"
    ,[entradaAsignada,salidaAsignada,username]);

    return  res.status(200).json({message:'Asignación exitosa. Por favor, vuelva a consultar los horarios para ver las modificaciones'});

  }else{
    const diasLaborales = ['lunes', 'martes', 'miercoles', 'jueves', 'viernes','sabado','domingo'];
    const fechaInicioDate = new Date(fechaInicio);
    const fechaFinDate = new Date(fechaFin);
    let fechas = [];

    while(fechaInicioDate <= fechaFinDate){
      const fechaFormateada = fechaInicioDate.toISOString().split('T')[0];
      fechas.push(fechaFormateada);
      fechaInicioDate.setDate(fechaInicioDate.getDate() + 1 );

    }


    const combinaciones = fechas.map((fecha, index) => ({ fecha, diaLaboral: diasLaborales[index] }));

   
    
    for(const{fecha,diaLaboral}of combinaciones){
     
      const find = await connection.query("INSERT INTO horarios(created_by,diaSemana,horaEntradaAsignada,horaSalidaAsignada,fecha)VALUES(?,?,?,?,?)",[username,diaLaboral,entradaAsignada,salidaAsignada,fecha])
    }

    return res.status(200).json({message:'Asignación exitosa. Por favor, vuelva a consultar los horarios para ver las modificaciones'});

  };
  };
  }catch(error){
    console.log("error en la consulta sql",error)
    res.status(500).json({error:"error en el servidor"})
  }
};



export const rest =  async (req,res) =>{
 const {username,diaDescanso,fechaDescanso}  = req.body 
 console.log(username,diaDescanso,fechaDescanso)
 const connection = await getconnection()
const findUser = await connection.query("SELECT * FROM usuarios WHERE username = ?",[username])
 if(!findUser.length>0){
return res.status(400).json(["el usuario no se encontro por favor valide credenciales"])
 }else{
   const UpdateQuery =`
     UPDATE horarios
      SET
      horaEntradaAsignada = '00:00:00',
    horaSalidaAsignada = '00:00:00',
      horaEntradaRegistrada = '00:00:00',
      horaSalidaRegistrada = '00:00:00',
      descanso = 'DIA DE DESCANSO'
      WHERE
      created_by = ? 
      AND diaSemana = ? 
      AND fecha = ?;
   `;

    const updateResults = await connection.query(UpdateQuery,[username,diaDescanso,fechaDescanso])

    return res.status(200).json(["asignacion de descanso realizada con exito por favor vuelva a validar los horarios para confirmar la asigancion"])
 }
}


export const UserGens = async(req,res)=>{
  try{
  const connection = await getconnection();
   const [usersGen] =  await connection.query("SELECT username, nombresYapellidos, Edad, correoCorporativo , Cargo ,supervisorEncargado,rol_nombre FROM usuarios")

   res.status(200).json(usersGen)
  }catch(error){
    console.log(error)
  }
};
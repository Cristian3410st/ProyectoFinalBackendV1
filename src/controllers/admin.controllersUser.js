import getconnection from "../database/config.js";
import bcrypt from "bcryptjs"


export const getsSchedule = async (req,res) => {
   const id = req.user.username;
   const connection = await getconnection();
   const find ="SELECT u.username, h.diaSemana, h.horaEntradaAsignada ,h.horaSalidaAsignada,h.horaEntradaRegistrada,h.horaSalidaRegistrada, DATE_FORMAT(h.fecha,'%Y-%m-%d') as fecha FROM usuarios u LEFT JOIN horarios h ON u.username = h.created_by WHERE u.username = ?";
   
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
        const [user] = await connection.query("SELECT * FROM usuarios WHERE id = ?",[id])
       if(!user.length>0){return res.status(404).json({message:"Usuario no encontrado"})}

        
        
         
          const compare = await bcrypt.compare(contraseñaActual,user[0].password)
         if(!compare){return res.status(404).json({message:"la contraseña actual es incorrecta"})}
         if(nuevaContraseña){
            const nuevaContraseñaHash = await bcrypt.hash(nuevaContraseña,10)
          await connection.query("UPDATE usuarios SET password = ? WHERE id = ?",[nuevaContraseñaHash,id])
        }
         res.status(200).json({message:"la constraseña se ha cambiado de forma exitosa"})

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
    const findUser = "SELECT u.username, h.diaSemana, h.horaEntradaAsignada ,h.horaSalidaAsignada,h.horaEntradaRegistrada,h.horaSalidaRegistrada, DATE_FORMAT(h.fecha,'%Y-%m-%d') as fecha FROM usuarios u LEFT JOIN horarios h ON u.username = h.created_by WHERE u.username = ?"
      const result = await connection.query(findUser,[username])
      if(!result.length>0){return res.status(404).json({message:'usuario no econtrado por favor verifique los datos ingresados'})}
      else{
        console.log(result[0])
        return res.status(200).json(result[0])

      }
 }



 export const modificarHorarios = async(req,res) =>{
  const {username,diaSemana,horaEntradaAsignada,horaSalidaAsignada,horaEntradaRegistrada,horaSalidaRegistrada,fecha} = req.body;
  const connection = await getconnection();
  const findUser = "SELECT u.username, h.diaSemana, h.horaEntradaAsignada,h.horaSalidaAsignada,h.horaEntradaRegistrada,h.horaSalidaRegistrada, DATE_FORMAT(h.fecha,'%Y-%m-%d') as fecha FROM usuarios u LEFT JOIN horarios h ON u.username = h.created_by WHERE u.username = ?";
  const result = await connection.query(findUser,[username])

  if(!result.length>0){return res.status(404).json({message:"usuario no encontrado, por favor verifique los datos ingresados"})}
  else{
    const modify = await connection.query("UPDATE horarios SET horaEntradaAsignada = ?, horaSalidaAsignada = ?, horaEntradaRegistrada = ?, horaSalidaRegistrada = ? WHERE created_by = ? AND diaSemana = ? AND fecha = ?",
    [horaEntradaAsignada,horaSalidaAsignada,horaEntradaRegistrada,horaSalidaRegistrada,username,diaSemana,fecha]);
     

    
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
    const diasLaborales = ['lunes', 'martes', 'miercoles', 'jueves', 'viernes'];
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



     
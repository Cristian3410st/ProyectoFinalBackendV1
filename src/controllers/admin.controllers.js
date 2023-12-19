import getconnection from "../database/config.js";


export const getsSchedule = async (req,res) => {
   const id = req.user.id;
   const connection = await getconnection();
   const find = 
   "SELECT u.id, u.username, h.diaSemana, TIME_FORMAT(h.horaEntradaAsignada,'%H:%i') AS horaEntradaAsignada, TIME_FORMAT(h.horaSalidaAsignada,'%H:%i') AS horaSalidaAsignada, DATE_FORMAT(h.fecha, '%Y-%m-%d') AS fecha, IF(TIME_TO_SEC(h.horaEntradaAsignada) = 0 AND TIME_TO_SEC(h.horaSalidaAsignada) = 0, 'Descanso', '') AS indicadorDescanso FROM usuarios u LEFT JOIN horarios h ON u.id = h.created_by WHERE u.id = ?";

   try{
    const results = await connection.query(find,[id]);
    const  userData = results.map(result =>{
        return{
            id: result[0].id,
            username:result[0].username,
            diaSemana: result[0].diaSemana,
            horaEntradaAsignada:result[0].horaEntradaAsignada,
            horaSalidaAsignada: result[0].horaSalidaAsignada,
            fecha:result[0].fecha,
            indicadorDescanso:result[0].indicadorDescanso

        }
    })
    if (userData.some(item => item.diaSemana === null)){
        return res.status(400).json(["no se encontraron horarios registrados"])
    }
    console.log(userData);
    return res.status(200).json(userData)
   }catch(error){
    return res.status(500).json({ message: "Error en la consulta SQL" });
   }
}



export const markEntry = async (req,res) => {
    const id = req.user.id
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
    const id = req.user.id
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


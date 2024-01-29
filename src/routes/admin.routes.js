import {Router} from "express"
import {accessRequired} from "../middlewares/validateToken.js"
import {getsSchedule,markEntry,markExit,alterPassword,consultarHorarios,modificarHorarios,asignacionHorarios,rest,UserGens} from "../controllers/admin.controllersUser.js"


const router = Router();



router.get('/getsSchedule',accessRequired,getsSchedule)
router.post('/markEntry',accessRequired,markEntry)
router.post('/markExit',accessRequired,markExit)
router.post('/alterPassword',accessRequired,alterPassword)

router.post('/consultarHorarios',accessRequired,consultarHorarios)

router.post("/modificarHorarios",accessRequired,modificarHorarios)

router.post("/asignacionHorarios",accessRequired,asignacionHorarios)

router.post("/rest",accessRequired,rest)

router.get('/GenUsers',accessRequired,UserGens)

export default router
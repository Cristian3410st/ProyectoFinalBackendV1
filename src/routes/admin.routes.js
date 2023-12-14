import {Router} from "express"
import {accessRequired} from "../middlewares/validateToken.js"
import {getsSchedule,markEntry,markExit} from "../controllers/admin.controllers.js"


const router = Router();



router.get('/getsSchedule',accessRequired,getsSchedule)
router.post('/markEntry',accessRequired,markEntry)
router.post('/markExit',accessRequired,markExit)

export default router
import { Router } from "express";
import {register,login,logout,verifyToken} from "../controllers/access.controllerUser.js";
import {validatorRegister} from "../schemas/express.validator.js"
import {handlesErros} from "../middlewares/handlesErros.js"


const router = Router();


router.post("/register",validatorRegister,handlesErros,register);

router.post("/login",login);

router.post("/logout",logout)

router.get("/verify",verifyToken)





export default router;
import { Router } from "express";
import { register,login,logout,profile,verifyToken} from "../controllers/access.controller.js";
import {accessRequired} from "../middlewares/validateToken.js"
import {validatorRegister} from "../schemas/express.validator.js"
import {handlesErros} from "../middlewares/handlesErros.js"


const router = Router();


router.post("/register",validatorRegister,handlesErros,register);

router.post("/login",login);

router.post("/logout",logout)

router.get("/verify",verifyToken)

router.get ("/profile",accessRequired,profile)





export default router;
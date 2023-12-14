import {check} from "express-validator"


export const validatorRegister = [
    check("username")
    .isLength({min:11, max:15}).withMessage("El Usuario debe tener entre 11 y 15 caracteres"), 
]
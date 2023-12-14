import {validationResult} from "express-validator"

export const handlesErros = (req,res,next) =>{
    const erros = validationResult(req);
    if(!erros.isEmpty()){
        const MensageError = erros.array().map((error)=> error.msg)
        return res.status(404).json(MensageError)
    }
    next();
}
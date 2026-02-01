const { addMember } = require("../controllers/member");
const idProof = require("./memberIdProof");
const Block = require("../models/block")
function uploadWithError(req,res,next){
    idProof.single("idProof")(req,res,async function(err){
        if(err){
            req.multerError = err.message;
        }
        next();
    });
}
module.exports = uploadWithError;
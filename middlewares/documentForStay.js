const multer = require("multer");
const path = require("path")
    
    const storage =multer.diskStorage({
        destination:function(req,file,cb){
            cb(null,path.join("public/documentForStay"))
        },
        filename:function(req,file,cb){
            const ext = path.extname(file.originalname);
            const uniqueName =`${Date.now()}${ext}`;
            cb(null,uniqueName)
        }
    });
    
    function fileFilter (req,file,cb){
        const allowTypes =["image/jpeg", "image/png", "image/jpg"];
        if(!allowTypes.includes(file.mimetype)){
            cb(new Error("Only JPG, JPEG, PNG files are allowed"), false);
        }else{
            cb(null,true);  
        }
    }


    const documentForStay = multer({storage,limits:{ fileSize: 2 * 1024 * 1024},fileFilter});
    
    module.exports = documentForStay;

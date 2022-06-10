const multer = require("multer");
const path = require("path");

// Multer config
module.exports = multer({
    storage: multer.diskStorage({}),
    fileFilter: (req, file, cb) => {    // filFilter nó sẽ kiểm soát việc file nào nên tải lên và file nào không 
        let ext = path.extname(file.originalname);
        if(ext !== ".jpg" && ext !== ".JPG" && 
        ext != ".jpeg" && ext != ".JPEG" && 
        ext != ".png" && ext != ".PNG" &&
        ext != ".gif" && ext != ".GIF"){
            cb(new Error("File type is not supported"), false);
            return;
        }
        cb(null, true);
    }
})
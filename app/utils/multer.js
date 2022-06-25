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
        ext != ".gif" && ext != ".GIF" &&
        ext != ".mov" && ext != ".mp4" &&
        ext != ".m4p" && ext != ".mpg" &&
        ext != ".mp2" && ext != ".mpeg" &&
        ext != ".mpe" && ext != ".m4v" &&
        ext != ".avi" && ext != ".flv" &&
        ext != ".wmv"){
            cb(new Error("File type is not supported"), false);
            return;
        }
        cb(null, true);
    }
})
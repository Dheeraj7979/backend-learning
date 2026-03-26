import multer from 'multer'

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    console.log("-> Multer is trying to save:", file.fieldname);
    cb(null, './public/temp')
  },
  filename: function (req, file, cb) {
    console.log("-> File original name:", file.originalname);
    cb(null, file.originalname)
  }
})

export const upload = multer({ storage: storage })
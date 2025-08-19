import multer from "multer";

const storage = multer.memoryStorage(); // simpan di memori dulu
const upload = multer({ storage });

export default upload;

import express from "express";
import postsRoute from "./routes/posts.js"
import authRoute from "./routes/auth.js"
import userRoute from "./routes/users.js"
import cors from "cors";
import cookieParser from "cookie-parser";
import multer from "multer";

const app=express()

app.use(cors({
    origin: "http://localhost:3000",
    credentials: true
}));

app.use(express.json())
app.use(cookieParser())

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, "../client/blogweb/public/upload");
    },
    filename: function (req, file, cb) {
      cb(null, Date.now() + file.originalname);
    },
  });
  
  const upload = multer({ storage });
  
  app.post("/api/upload", upload.single("file"), function (req, res) {
    const file = req.file;
    res.status(200).json(file.filename);
  });

app.use("/api/posts",postsRoute)
app.use("/api/users",userRoute)
app.use("/api/auth",authRoute)


app.listen(8800,()=>{
    console.log("connected")
})


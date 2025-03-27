import {db} from "../db.js"
import bcrypt, { hash } from "bcryptjs";
import jwt from "jsonwebtoken";

export const register=(req,res)=>{

    //CHECK IF USER ALREADY EXISTS
    const q="SELECT * FROM user where email=? OR username=?" //this ? mean , we will add value for this in below query 

    db.query(q, [req.body.email, req.body.username], (err, data) => {
        if (err) return res.status(500).json(err);
        if (data.length) return res.status(409).json("User already exists!");
    

        //hash pwd and create user
        const salt = bcrypt.genSaltSync(10);
        const hash = bcrypt.hashSync(req.body.password, salt);

        //query for inserting
        const q="INSERT INTO user(`username`,`email`,`password`) VALUES (?)"
        const values=[
            req.body.username,
            req.body.email,
            hash
        ];
        db.query(q,[values],(err,data)=>{
            if(err) {
                console.error("Error inserting user:", err);
                return res.status(500).json({ error: "Database insert error", details: err });
            }
            return res.status(200).json("user created");
        });
});
};
export const login=(req,res)=>{
    //check user exists
    const q="SELECT * from user where username=?"
    db.query(q, [req.body.username],(err,data)=>{
        if(err){
            return res.json(err);
        }
        if(data.length===0){
            return res.status(404).json("user not found");
        }

        //if all ok, then check pwd
        const isPwdCorrect= bcrypt.compareSync(req.body.password,data[0].password);
        if(!isPwdCorrect){
            return res.status(404).json("wrong username or pwd");
        }
        //if everything is fine(pwd is correct), then 
        const token=jwt.sign({id:data[0].id},"jwtkey");
        const {password,...other}=data[0]

        res.cookie("access_token",token,{
            httpOnly:true,   //means ,any script cant reach this cookie directly,only can be used while making api requests
        })
        .status(200)
        .json(other);
    });
};

export const logout=(req,res)=>{
    
}
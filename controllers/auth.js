import {db} from "../db.js"
import bcrypt from "bcryptjs";
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
    
}

export const logout=(req,res)=>{
    
}
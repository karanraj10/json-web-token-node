const express = require('express')
const app = express()

const jwt = require('jsonwebtoken')

require('dotenv').config()
app.use(express.json())

// Implementation of JWT Tokens

const posts = [{
    username:"karan",
    title:"post 1"
},{
    username:"raj",
    title:"post 2"
}]

app.get('/posts', authenticateToken, (req,res) => {
    res.json(posts.filter(post=>post.username===req.user.username))
})

// On Login, generating Token
app.post('/login', (req,res)=>{
    const username = req.body.username
    const user = {username: username}
    const accessToken = jwt.sign(user,process.env.SECRET_ACCESS)
    res.json({accessToken: accessToken})

})

// Authenticate Token
function authenticateToken(req,res,next){
    const authHeader = req.headers.token
    // check if authHeader available and then split
    const token = authHeader && authHeader.split(' ')[1]
    if(token==null) return res.sendStatus(401)

    jwt.verify(token,process.env.SECRET_ACCESS, (err,user)=>{
        if(err){
            return res.sendStatus(403)
        }
        //it will store user fetched from token to req which will get by above function
        // this function will run before that function so we can store user in req which will be fetched by above function
        // next() to transfer from this middlewear to above function
        req.user = user
        next()
    })
}

app.listen(3000)
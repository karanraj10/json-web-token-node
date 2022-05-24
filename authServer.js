const express = require('express')
const app = express()

const jwt = require('jsonwebtoken')

require('dotenv').config()
app.use(express.json())

// Implementation of JWT Tokens and Refersh Tokens
// Concept: Token will expire in few mins or seconds,
// so from refersh token we can generate new token to use


// For learning purpose only
// otherwise store in database or cahce storage

// Array of refershtokens
let refreshTokenArray = []

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

app.post('/login', (req,res)=>{
    const username = req.body.username
    const user = {username: username}
    const accessToken = generateAccessToken(user)
    const refreshToken = jwt.sign(user,process.env.REFRESH_ACCESS)
    refreshTokenArray.push(refreshToken)
    res.json({accessToken: accessToken, refreshToken: refreshToken})

})

// It will generate new accessToken from refresh token
app.post('/token', (req,res)=>{
    const refreshToken = req.body.token
    if(refreshToken==null){
        res.sendStatus(401)
    }
    if(!refreshTokenArray.includes(refreshToken)){
        res.sendStatus(403)
    }
    jwt.verify(refreshToken,process.env.REFRESH_ACCESS, (err,user)=>{
        if(err) return res.sendStatus(403)
        const accessToken = generateAccessToken({username: user.username})
        res.json({accessToken: accessToken})
    })
})

// To delete refresh token from array
app.delete('/logout', (req,res)=>{
    // In Production it will be deleted from database
    refreshTokenArray = refreshTokenArray.filter(token => token !== req.body.token)
    res.sendStatus(204)
})

function authenticateToken(req,res,next){
    const authHeader = req.headers.token
    const token = authHeader && authHeader.split(' ')[1]
    if(token==null) return res.sendStatus(401)

    jwt.verify(token,process.env.SECRET_ACCESS, (err,user)=>{
        if(err){
            return res.sendStatus(403)
        }
        req.user = user
        next()
    })
}

function generateAccessToken(user){
    return jwt.sign(user,process.env.SECRET_ACCESS,{expiresIn: '20s'})
}

app.listen(4000)
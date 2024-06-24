const express = require('express')
const mongoose = require('mongoose')
const dotenv = require('dotenv')
const Cors = require('cors')
const userRoutes = require('./routes/user.route')
const authRoutes = require('./routes/auth.route')
const PostRoutes = require('./routes/post.route')
const cookieParser = require('cookie-parser')
const path = require('path')

const app = express()
app.use(express.json())
app.use(cookieParser())
dotenv.config()
app.use(Cors({ origin: true, credentials: true }));
const _dirname = path.resolve()

app.use('/api/user', userRoutes)
app.use('/api/auth', authRoutes)
app.use('/api/post', PostRoutes)

app.use(express.static(path.join(_dirname, 'client/dist')))

app.get('*', (req, res) => {
    res.sendFile(path.join(_dirname, 'client', 'dist', 'index.html'))
})


mongoose
    .connect(`${process.env.MONGO_URL}`)
    .then(() => {
        app.listen(3000, () => {
            console.log('Server is Running ')
        })
    })
    .catch((err) => {
        console.log(err.message)
    })


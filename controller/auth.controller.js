const User = require('../models/user.model')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const { SendResponse } = require("../helpers/helper")

const AuthController = {
    signUp: async (req, res) => {
        try {
            const { userName, email, password } = req.body
            const obj = { userName, email, password }
            const errArr = []

            if (!obj.userName) {
                errArr.push('User Name is Required')
            }
            if (!obj.email) {
                errArr.push('Email is Required')
            }
            if (!obj.password) {
                errArr.push('Password is Required')
            }
            if (errArr.length > 0) {
                res.status(400).send(SendResponse(false, 'Crediantals Not Found', errArr))
            }

            const checkUser = await User.findOne({ email: obj.email })
            if (checkUser) {
                res.send(SendResponse(false, 'User Already Exist', null))
                return
            }

            obj.password = await bcrypt.hash(obj.password, 10)

            const newUser = new User(obj)
            const saveUser = await newUser.save()

            if (saveUser) {
                res.status(200).send(SendResponse(true, 'User Added Successfully', newUser))
            }
        }
        catch (error) {
            res.status(500).send(SendResponse(false, 'Internal Server Error', error.message))

        }

    },
    signIn: async (req, res) => {
        try {
            const { email, password } = req.body
            const obj = { email, password }
            const errArr = []

            if (!obj.email) {
                errArr.push('Email Is Required')
            }
            if (!obj.password) {
                errArr.push('Password Is Required')
            }
            if (errArr.length > 0) {
                res.status(400).send(SendResponse(false, 'Please Filled Out All Fields', errArr))
            }

            const userExist = await User.findOne({ email: obj.email })
            if (userExist) {
                const correctPassword = await bcrypt.compare(obj.password, userExist.password)
                if (correctPassword) {
                    const token = jwt.sign({ id: userExist._id, isAdmin: userExist.isAdmin }, process.env.JWT_SECRET)
                    res.status(200).cookie('access_token', token).send(SendResponse(true, "Login Successfully", { data: { user: userExist, token: token } }))
                }
                else {
                    res.status(404).send(SendResponse(false, "Your Password is incorrect", null))
                }
            }
            else {
                res.status(404).send(SendResponse(false, 'Your Email is invalid', null))
            }

        } catch (error) {
            res.status(500).send(SendResponse(false, 'Internal Server Error', error.message))

        }
    },
    googleOAuth: async (req, res) => {
        const { name, email, googlePhotoUrl } = req.body
        const user = await User.findOne({ email: email })
        if (user) {
            const token = jwt.sign({ id: user._id, isAdmin: user.isAdmin }, process.env.JWT_SECRET)
            res.status(200).cookie('access_token', token).send(SendResponse(true, "Login Successfully", { user: user, token: token }))
        }
        else {
            const generatedPassword = await bcrypt.genSalt(10)
            console.log(generatedPassword)
            const hashedPassword = await bcrypt.hash(generatedPassword, 10)
            const newUser = new User({
                userName: name.toLowerCase().split(' ').join('') + Math.random().toString(9).slice(-4),
                email: email,
                password: hashedPassword,
                profilePicture: googlePhotoUrl
            })
            await newUser.save()
            console.log(newUser)
            const token = jwt.sign({ id: newUser._id, isAdmin: newUser.isAdmin }, process.env.JWT_SECRET)
            res.status(200).cookie('access_token', token).send(SendResponse(true, "Login Successfully", { user: newUser, token: token }))
        }
    }

}

module.exports = AuthController
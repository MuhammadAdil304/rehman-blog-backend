const express = require('express')
const AuthController = require('../controller/auth.controller')

const router = express.Router()

router.post('/signup' , AuthController.signUp)
router.post('/signin' , AuthController.signIn)
router.post('/google',AuthController.googleOAuth)

module.exports = router
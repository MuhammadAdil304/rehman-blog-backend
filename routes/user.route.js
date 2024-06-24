const express = require("express");
const UserController = require("../controller/user.controller");

const router = express.Router();

router.put("/update/:id", UserController.updateUser);
router.delete('/delete/:id', UserController.deleteUser)
router.post('/signOut', UserController.signOut);
router.get('/getUsers', UserController.getUsers)
router.delete('/deleteUser/:id', UserController.deleteUser)
router.put('/updateStatus/:id', UserController.updateStatus)

module.exports = router;

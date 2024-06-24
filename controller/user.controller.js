const { SendResponse } = require("../helpers/helper");
const bcrypt = require("bcryptjs");
const User = require("../models/user.model");

const UserController = {
  updateUser: async (req, res) => {
    try {
      const id = req.params.id;
      const { userName, email, password, profilePicture } = req.body
      const obj = { userName, email, password, profilePicture };
      if (obj.password) {
        if (obj.password.length < 6) {
          return res
            .status(400)
            .send(
              SendResponse(false, "Password must be at least 6 characters", null)
            );
        }
        obj.password = await bcrypt.hash(obj.password, 10);
      }
      if (obj.userName) {
        if (obj.userName.length < 7 || obj.userName.length > 20) {
          return res
            .status(400)
            .send(
              SendResponse(
                false,
                "User Name must be at least 7 characters and at most 20 characters",
                null
              )
            );
        }
        if (obj.userName.includes(" ")) {
          return res
            .status(400)
            .send(SendResponse(false, "User Name must not contain spaces", null));
        }
        if (obj.userName !== obj.userName.toLowerCase()) {
          return res
            .status(400)
            .send(SendResponse(false, "User Name must be in lowercase", null));
        }
        if (!obj.userName.match(/^[a-zA-Z0-9]+$/)) {
          return res
            .status(400)
            .send(
              SendResponse(
                false,
                "User Name must contain only alphanumeric characters",
                null
              )
            );
        }

        const updatedUser = await User.findByIdAndUpdate(id, { $set: obj }, { new: true });
        res.status(200).send(SendResponse(true, "User Updated Successfully", updatedUser));

      }
    }
    catch (error) {
      res.status(500).send(SendResponse(false, 'Internal Server Error', error.message))
    }
  },
  deleteUser: async (req, res) => {
    try {
      const id = req.params.id;
      const deletedUser = await User.findByIdAndDelete(id);
      res.status(200).send(SendResponse(true, "User Deleted Successfully", deletedUser));
    }
    catch (error) {
      res.status(500).send(SendResponse(false, 'Internal Server Error', error.message))
    }
  },
  signOut: (req, res) => {
    try {
      res.clearCookie('access_token').status(200).send(SendResponse(true, 'Signing out', null))
    }
    catch (error) {
      res.status(500).send(SendResponse(false, error.message, null))
    }
  },
  getUsers: async (req, res) => {
    try {
      const startIndex = parseInt(req.query.startIndex) || 0
      const limit = parseInt(req.query.limit) || 9
      const sortDirection = req.query.order === 'asc' ? 1 : -1

      const users = await User.find().sort({ createdAt: sortDirection }).skip(startIndex).limit(limit)

      const usersWithoutPassword = users.map((user) => {
        const { password, ...rest } = user._doc
        console.log(rest)
        return rest
      })

      const totalUsers = await User.countDocuments()

      const now = new Date()

      const oneMonthAgo = new Date(
        now.getFullYear(),
        now.getMonth() - 1,
        now.getDate(),
        now.getHours(),
      )

      const lastMonthUsers = await User.countDocuments({
        createdAt: {
          $gte: oneMonthAgo,
        }
      })
      res.status(200).send(SendResponse(true, 'All Users', { usersWithoutPassword, totalUsers, lastMonthUsers }));
    }
    catch (error) {
      res.status(500).send(SendResponse(false, error.message, null))
    }
  },
  updateStatus: async (req, res) => {
    try {
      const id = req.params.id;
      const userStatus = await User.findById(id)
      userStatus.isAdmin = !userStatus.isAdmin
      await userStatus.save()
      res.status(200).send(SendResponse(true, "User Status Updated Successfully", userStatus));
    }
    catch (error) {
      res.status(500).send(SendResponse(false, error.message, null))
    }
  }
};

module.exports = UserController;

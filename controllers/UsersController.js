const express = require('express');
const sha1 = require('sha1');
const dbClient = require('../utils/db');

const router = express.Router();

router.use(express.json());

const UsersController = {
  postNew: async (req, res) => {
    console.log(">>>>>>>>", req.body);
    const { email, password } = req.body;

    if (!email) {
      return res.status(400).json({ error: 'Missing email' });
    }
    if (!password) {
      return res.status(400).json({ error: 'Missing password' });
    }

    try {
      const userExists = await dbClient.findUserByEmail(email);
      if (userExists) {
        return res.status(400).json({ error: 'Already exist' });
      }

      const hashedPassword = sha1(password);

      const newUser = await dbClient.createUser({ email, password: hashedPassword });
      console.log(newUser)
      return res.status(201).json({ email: newUser.email, id: newUser.id });
    } catch (error) {
      console.error('Error creating user:', error);
      return res.status(500).json({ error: 'Internal Server Error' });
    }
  }
};

module.exports = router;
module.exports = UsersController;

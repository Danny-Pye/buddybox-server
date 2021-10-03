import express from "express";

const router = express.Router();

//**Middleware**//
import {requireSignin} from '../middlewares/index'

// **Controllers** //
import {register, login, currentUser, forgotPassword, updateProfile, findPeople, addFollower, userFollow, userFollowing, removeFollower, userUnfollow, searchUser, getUser} from "../controllers/auth.js"


// **Endpoints** //
router.post('/register', register);
router.post("/login", login);
// (for protecting routes) checking user token,
router.get("/current-user", requireSignin, currentUser);
router.post("/forgot-password", forgotPassword);
router.put("/profile-update", requireSignin, updateProfile);
router.get("/find-people", requireSignin, findPeople);
router.put("/user-follow", requireSignin, addFollower, userFollow);
router.put("/user-unfollow", requireSignin, removeFollower, userUnfollow);
router.get("/user-following", requireSignin, userFollowing);
router.get(`/search-user/:query`, searchUser);
router.get(`/user/:username`, getUser);

module.exports = router;
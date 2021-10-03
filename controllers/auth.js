import User from "../models/user";
import  {hashPassword, comparePassword} from "../helpers/auth";
import jwt from "jsonwebtoken";
// import {nanoid} from 'nanoid'





export const register = async (req, res) => {
    // console.log("REGISTER ENDPOINT =>", req.body);
    const {username, name, email, password, secret} = req.body;
    if (!username) {
        return res.json({
            error: "Please provide unique username",
        });
    }
    if (!name) {
        return res.json({
            error: "Please provide name",
        });
    }
    if (!password || password.length < 6) {
        return res.json({
            error: "A password of more that 6 characters is required",
        })
    }
    if (!secret) {
        return res.json({
            error: "answer is required",
        });
    }
    const exist = await User.findOne({email});
    if(exist) {
        return res.json({
            error: "Email already exists",
        });
    }
    const userExist = await User.findOne({username});
    if(userExist) {
        return res.json({
            error: "Username already exists",
        });
    }
    // Hash Password //
    const hashedPassword = await hashPassword(password);

    const user = new User({name, email, password: hashedPassword, secret, username});
    try {
        await user.save();
        // console.log('REGISTERED USER =>', user);
        return res.json({ok: true, });

    } catch (err) {
        console.log('register failed =>', err);
        return res.status(400).send('Error, try again');
    }

};

export const login = async (req, res) => {
    // console.log(req.body);
    // ** data submitted on login page, compare to data saved in database. **//
    try {
        // destructure values from login request //
        const {email, password} = req.body;

        // save user from database into variable //
        const user = await User.findOne({email});
        if (!user) {
            return res.json ({
                error: 'Email not found.',
            })
        }

        // if email is found then will next check password, using function in helpers/auth  //
        const match = await comparePassword(password, user.password);
        if (!match) {
            return res.json ({
                error: 'Password is not correct',
            })
        }
        // if passwords match create a jwt token //
        const token = jwt.sign({_id: user._id}, process.env.JWT_SECRET, {expiresIn: "7d", });
        // to make sure we are not sending out sensitive user data in json response //
        user.password = undefined;
        user.secret = undefined;
        res.json({
            token, user,
        })

    } catch (err) {
        console.log(err)
        return res.status(400).send('Error, try again');
    }
};


export const currentUser = async (req, res) => {
    try {
        const user = await User.findById(req.user._id);
        // res.json(user);
        res.json({ok:true});
    } catch (err) {
        console.log(err);
        res.sendStatus(400);
    }
};

export const forgotPassword = async (req, res) => {
    //destructure from the request body//
    const {email, newPassword, secret} = req.body;
    //validation//
    if (!newPassword || newPassword < 6) {
        return res.json({
            error: 'password of more than six characters required',
        });
    }
    if (!secret) {
        return res.json({
            error: 'secret is required',
        });
    }
    const user = await User.findOne({email, secret});
    if(!user){
        return res.json({
            error: 'verification failed, please check details.'
        });
    }

    try {
        const hashed = await hashPassword(newPassword);
        await User.findByIdAndUpdate(user._id, {password: hashed});
        return res.json({
            success: "You can now login with your new password"
        })
    } catch (err) {
        console.log(err);
        return res.json({
            error: "something went wrong",
        })
    }
};

export const updateProfile = async (req, res) => {
    try {
        const data = {};

        if (req.body.name) {
            data.name = req.body.name;
        }

        if (req.body.password) {
            if (req.body.password < 8) {
                return res.json({
                    error: 'Password is too short.'
                });
            } else {
                data.password = await hashPassword(req.body.password);
            }
        }

        if (req.body.about) {
            data.about = req.body.about;
        }
        if (req.body.secret) {
            data.secret = req.body.secret;
        }
        if (req.body.image) {
            data.image = req.body.image;
        }
        let user = await User.findByIdAndUpdate(req.user._id, data, {new: true});
        user.password = undefined;
        user.secret = undefined;
        res.json(user);
    } catch (err) {
        console.log(err);
    }
};

export const findPeople = async (req, res) => {
    try {
        const user = await User.findById(req.user._id);
        // user already following
        let following = user.following;
        // include self so own profile does not show up, cant follow yourself!
        following.push(user._id);
        const people = await User.find({_id: { $nin: following }}).select("-password -secret").limit(10);
        res.json(people);
    } catch (err) {
        console.log(err);
    }
};

// Follow & following //
// addFollower is middleware //

export const addFollower = async (req, res, next) => {
    try {
        const user = await User.findByIdAndUpdate(req.body._id, {
            $addToSet: {followers: req.user._id},
        });
        next();
    } catch (err) {
        console.log(err);
    }
};

export const userFollow = async (req, res) => {
    try {
        const user = await User.findByIdAndUpdate(req.user._id, {
            $addToSet: {following: req.body._id}, }, {new: true}
        // remove password and secret data from response //
        ).select("-password -secret");
        res.json(user);
    } catch (err) {
        console.log(err);
    }

};

export const userFollowing = async (req, res) => {
    try {
        const user = await User.findById(req.user._id);
        const following = await User.find({_id: user.following}).limit(100);
        res.json(following);
    } catch (err) {
        console.log(err);
    }
};

export const removeFollower = async (req, res, next) => {
    try {
        const user = await User.findByIdAndUpdate(req.body._id, {
            $pull: {followers: req.user._id},
        });
        next();
    } catch (err) {
        console.log(err);
    }
};


export const userUnfollow = async (req, res) => {
    try {
        const user = await User.findByIdAndUpdate(req.user._id, {
            $pull: {following: req.body._id},
        }, {new: true});
        res.json(user);
    } catch (err) {
        console.log(err);
    }
};

export const searchUser = async (req, res) => {
    const {query} = req.params;
    if (!query) return;
    try {
        const user = await User.find({
            $or: [
                {name: {$regex: query, $options: 'i'}},
                {username: {$regex: query, $options: 'i'}}
            ]
        }).select("-password -secret");
        res.json(user);
    } catch (err) {
        console.log(err);
    }
};

export const getUser = async (req, res) => {
    try {
        const user = await User.findOne({
            username: req.params.username
        }).select("-password -secret");
        res.json(user);
    } catch (err) {
        console.log(err);
    }
};
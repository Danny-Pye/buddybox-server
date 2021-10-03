import Post from '../models/post';
import expressJwt from "express-jwt";

// jwt verifies the users token using the secret from the .env file. //
export const requireSignin = expressJwt({
    secret: process.env.JWT_SECRET,
    algorithms: ["HS256"]
});

// third argument required on middleware, 'next' //
export const canEditDeletePost = async (req, res, next) => {
    try {
        const post = await Post.findById(req.params._id);
        if (req.user._id != post.postedBy) {
            return res.status(400).send('Unauthorised to change this post.');
        } else {
            // logic passed, move on passed this middleware.
            next();
        }

    }catch(err) {
        console.log(err);

    }
};
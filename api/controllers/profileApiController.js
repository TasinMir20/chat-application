exports.profileRoot = async (req, res, next) => {

    try {
        res.send("profile Root");

    } catch (err) {
        next(err);
    }

}
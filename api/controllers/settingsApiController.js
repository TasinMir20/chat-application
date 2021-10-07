exports.settingsRoot = async (req, res, next) => {

    try {
        res.send("settings Root");

    } catch (err) {
        next(err);
    }

}
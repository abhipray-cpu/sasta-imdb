module.exports = (req, res, next) => {
    if (req.session.isloggedIn === true)
        return next();
    else
        return res.render('login.ejs', {
            pageTitle: 'Login',
            err:3,
            user: '',

        })
}
module.exports = (req, res, next) => {
    if (req.session.isLoggedIn === true)
        return next();
    else
        return res.render('login.ejs', {
            pageTitle: 'Login',
            err:3,
            user: '',

        })
}
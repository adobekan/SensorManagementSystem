var express = require('express')
  , everyauth = require('everyauth');

everyauth.debug = true;

var usersByLogin = {
    'jim': {
        login: 'jim',
        email: 'jim@jimpick.com'
    , password: 'jim'
    }
};

everyauth
  .password
// .loginWith('email')
    .loginWith('login')
    .getLoginPath('/login')
    .postLoginPath('/login')
    .loginView('login.jade')
    .loginLocals(function (req, res, done) {
        setTimeout(function () {
            done(null, {
                title: 'Async login'
            });
        }, 200);
    })
    .authenticate(function (login, password) {
        var errors = [];
        if (!login) errors.push('Missing login');
        if (!password) errors.push('Missing password');
        if (errors.length) return errors;
        var user = usersByLogin[login];
        if (!user) return ['Login failed'];
        if (user.password !== password) return ['Login failed'];
        return user;
    })

    .getRegisterPath('/register')
    .postRegisterPath('/register')
    .registerView('register.jade')
    .registerLocals(function (req, res, done) {
        setTimeout(function () {
            done(null, {
                title: 'Async Register'
            });
        }, 200);
    })
    .extractExtraRegistrationParams(function (req) {
        return {
            email: req.body.email
        };
    })
    .validateRegistration(function (newUserAttrs, errors) {
        var login = newUserAttrs.login;
        if (usersByLogin[login]) errors.push('Login already taken');
        return errors;
    })
    .registerUser(function (newUserAttrs) {
        var login = newUserAttrs[this.loginKey()];
        return usersByLogin[login] = newUserAttrs;
    })

    .loginSuccessRedirect('/')
    .registerSuccessRedirect('/');

var app = express();

app.use(express.bodyParser());
app.use(express.static(__dirname + "/public"));
app.use(express.cookieParser());
app.use(express.session({ secret: 'htuayreve' }));
app.use(everyauth.middleware());

app.configure(function () {
    app.set('views', __dirname + '/views2')
    app.set('view engine', 'jade');
});

app.get('/', function (req, res) {
    res.render('home', { users: JSON.stringify(usersByLogin, null, 2) });
});

//everyauth.helpExpress(app);

app.listen(3001);
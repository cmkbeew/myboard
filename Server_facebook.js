// MongoDB 접속 코드
const mongoclient  = require('mongodb').MongoClient;
const ObjId = require('mongodb').ObjectId;
const url = 'mongodb+srv://admin:1234@cluster0.g0ho0.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0';

let mydb;
mongoclient.connect(url)
    .then((client) => {
        mydb = client.db('myboard'); // 데이터베이스 접근
        // mydb.collection('post').find().toArray().then(result => {
        //     console.log(result);
        // })
        
        app.listen(8080, function() {
            console.log("포트 8080으로 서버 대기중...");
        });
}).catch(err => {
    console.log(err);
});

// MySQL + Node.js 접속 코드
var mysql = require('mysql');
var conn = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "1234",
    database: "myboard"
});

conn.connect();

const express = require('express');
const app = express();
const sha = require("sha256");
const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy; // local에서 인증 기능을 구현하기 위해서 사용
const FacebookStrategy = require("passport-facebook").Strategy;

// 세션 생성
let session = require("express-session");
app.use(session({
    secret: "qeawe39034fad8j31asd",
    resave: false,
    saveUninitialized: true
}));

app.use(passport.initialize()); // req.session이 있는지 확인하고 존재한다면 req.session.passport.user를 추가
app.use(passport.session()); // deserializeUser() 실행 (이미 인증된 사용자일 경우 수행)

// body-parser 라이브러리 추가
const bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({extended:true}));

// ejs 라이브러리 추가
app.set('view engine', 'ejs');

// 정적 파일 사용
app.use(express.static("public"));

app.get('/', function(req, res) {
    res.render("index.ejs", {user : null});
});

app.get("/login", function(req, res) {
    if(req.session.user) {
        console.log("세션 유지");
        res.render("index.ejs", {user : req.session.user})
    } else {
        res.render("login.ejs");
    }
});

// 로그인 성공했을 때 호출
passport.serializeUser(function(user, done) {
    console.log("serializeUser");
    done(null, user); // 세션으로 저장
});

// 로그인 이후에 모든 요청에 passport.session() 미들웨어가 passport.deserializeUser() 함수를 매번 호출
passport.deserializeUser(function(user, done) {
    console.log("deserializeUser");

    mydb.collection("account").findOne({userkey : user.userkey})
    .then(result => {
        console.log(result);
        done(null, result);
    });
});

app.post("/login", 
    passport.authenticate("local", { // 인증 과정 -> LocalStrategy 객체 생성
        failureRedirect: "/fail", // 인증 실패 시 요청
    }),
    function(req, res) { // 인증 과정이 끝나면 수행
        console.log(req.session);
        console.log(req.session.passport);
        res.render("index.ejs", {user : req.session.passport});
    }
);

passport.use(
    new LocalStrategy({
        usernameField: "userid",
        passwordField: "userpw",
        session: true,
        passReqToCallback: false,
    },
    function(inputid, inputpw, done) { // 아이디, 비밀번호가 들어오면 실행
        mydb.collection("account").findOne({userid : inputid})
        .then(result => {
            if(result.userpw == sha(inputpw)) {
                console.log("새로운 로그인");
                done(null, result); // done() 함수는 passport.serializeUser() 호출
            } else {
                done(null, false, {message : "비밀번호 틀림"});
            }
        });
    })
);

app.get("/logout", function(req, res) {
    console.log("로그아웃");
    req.session.destroy();
    res.render("index.ejs", {user : null});
});

app.get("/facebook", 
    passport.authenticate("facebook")
);

app.get("/facebook/callback",
    passport.authenticate(
        "facebook",
        {
            // successRedirect: "/",
            failureRedirect: "/login",
        }
    ),
    function(req, res) {
        console.log("session : " + req.session);
        console.log("passport : " + req.session.passport);
        res.render("index.ejs", {user : req.session.passport});
    }
);

passport.use(new FacebookStrategy({
    clientID: "1075011337152274",
    clientSecret: "0104d429d00557f1df659c3413b3ad01",
    callbackURL: "/facebook/callback"
},
    function(accessToken, refreshToken, profile, done) {
        console.log(profile);
        var authkey = "facebook" + profile.id;
        var authName = profile.displayName;

        let loop = 0;
        while(loop < 2) {
            mydb.collection("account").findOne({userkey : authkey})
            .then(result => {
                if(result != null) {
                    done(null, result);
                } else {
                    mydb.collection("account").insertOne({
                        userkey : authkey,
                        userid : authName,
                    });
                }
            }).catch(error => {
                done(null, false, error);
            });

            loop++;
        }
    }
));
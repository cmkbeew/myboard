// 라우터 분리하고 동작하게 하기 위한 설정 코드
var router = require("express").Router();

const mongoclient  = require('mongodb').MongoClient;
const ObjId = require('mongodb').ObjectId;
const url = process.env.DB_URL;

let mydb;
mongoclient.connect(url)
    .then((client) => {
        mydb = client.db('myboard'); // 데이터베이스 접근
}).catch(err => {
    console.log(err);
});

const sha = require("sha256");
let session = require("express-session");
router.use(session({
    secret: "qeawe39034fad8j31asd",
    resave: false,
    saveUninitialized: true
}));

let cookieParser = require("cookie-parser");
router.use(cookieParser("vfdsav33g3901azc"));

router.get("/cookie", function(req, res) {
    // let milk = parseInt(req.cookies.milk) + 1000;
    let milk = parseInt(req.signedCookies.milk) + 1000;
    
    if(isNaN(milk)) {
        milk = 0;
    }

    res.cookie("milk", milk, {signed : true});
    res.send("product : " + milk + "원");
});

router.get("/session", function(req, res) {
    if(isNaN(req.session.milk)) {
        req.session.milk = 0;
    }

    req.session.milk = req.session.milk + 1000;
    res.send("session : " + req.session.milk + "원");
});

router.get("/login", function(req, res) {
    console.log(req.session); 
    if(req.session.user) {
        console.log("세션 유지");
        res.render("index.ejs", {user : req.session.user})
    } else {
        res.render("login.ejs");
    }
});

router.post("/login", function(req, res) {
    console.log("아이디 : " + req.body.userid);
    console.log("비밀번호 : " + req.body.userpw);

    mydb.collection("account").findOne({userid: req.body.userid})
    .then(result => {
        if(result.userpw == sha(req.body.userpw)) {
            req.session.user = req.body;
            console.log("새로운 로그인");

            res.render("index.ejs", {user : req.session.user});
        } else {
            res.render("login.ejs");
        }
    })    
});

router.get("/logout", function(req, res) {
    console.log("로그아웃");
    req.session.destroy();
    res.render("index.ejs", {user : null});
});

router.get("/signup", function(req, res) {
    res.render("signup.ejs");
});

router.post("/signup", function(req, res) {
    console.log(req.body.userid);
    console.log(sha(req.body.userpw));
    console.log(req.body.usergroup);
    console.log(req.body.useremail);

    mydb.collection("account").insertOne({
        userid: req.body.userid,
        userpw: sha(req.body.userpw),
        usergroup: req.body.usergroup,
        useremail: req.body.useremail
    }).then(result => {
        console.log("회원가입 성공");
    });

    res.redirect("/");
});

module.exports = router; // router 변수를 외부로 내보낸다.
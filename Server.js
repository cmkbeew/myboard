// 환경변수 사용을 위한 env 라이브러리
const dotenv = require("dotenv").config();

// MongoDB 접속 코드
const mongoclient  = require('mongodb').MongoClient;
const ObjId = require('mongodb').ObjectId;
const url = process.env.DB_URL;

let mydb;
mongoclient.connect(url)
    .then((client) => {
        mydb = client.db('myboard'); // 데이터베이스 접근
        // mydb.collection('post').find().toArray().then(result => {
        //     console.log(result);
        // })
        
        app.listen(process.env.PORT, function() {
            console.log("포트 8080으로 서버 대기중...");
        });
}).catch(err => {
    console.log(err);
});

// MySQL + Node.js 접속 코드
// var mysql = require('mysql');
// var conn = mysql.createConnection({
//     host: "localhost",
//     user: "root",
//     password: "1234",
//     database: "myboard"
// });

// conn.connect();

const express = require('express');
const app = express();
// const sha = require("sha256");

// 세션 생성
// let session = require("express-session");
// app.use(session({
//     secret: "qeawe39034fad8j31asd",
//     resave: false,
//     saveUninitialized: true
// }));

// body-parser 라이브러리 추가
const bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({extended:true}));

// ejs 라이브러리 추가
app.set('view engine', 'ejs');

let path = require("path");

// 정적 파일 사용
app.use(express.static(path.join(__dirname, "public")));

// 라우터 파일 참조
app.use("/", require("./routes/post.js"));
app.use("/", require("./routes/add.js"));
app.use("/", require("./routes/auth.js"));

// 쿠키 생성
// let cookieParser = require("cookie-parser");

// multer 라이브러리
// let multer = require("multer");

// let storage = multer.diskStorage({
//     destination : function(req, file, done) {
//         done(null, "./public/image");
//     },
//     filename : function(req, file, done) {
//         done(null, file.originalname);
//     }
// });

app.get('/book', function(req, res) {
    res.send('도서 목록 관련 페이지입니다.');
});

app.get('/', function(req, res) {
    res.render("index.ejs", {user : null});
});

app.get("/search", function(req, res) {
    console.log(req.query);

    mydb.collection("post").find({title : req.query.value}).toArray()
    .then(result => {
        console.log(result);
        res.render("sresult.ejs", {data : result});
    });
});
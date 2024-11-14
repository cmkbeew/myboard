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

let multer = require("multer");

let storage = multer.diskStorage({
    destination : function(req, file, done) {
        done(null, "./public/image");
    },
    filename : function(req, file, done) {
        done(null, file.originalname);
    }
});

let upload = multer({storage : storage});
let imagepath = "";

router.get('/enter', function(req, res) {
    res.render('enter.ejs');
});

router.post('/save', (req, res) => {
    console.log(req.body.title);
    console.log(req.body.content);
    console.log(req.body.someDate);
    // 몽고DB에 저장하기
    mydb.collection('post').insertOne(
        {
            title: req.body.title,
            content: req.body.content,
            date: req.body.someDate,
            path: imagepath
        }
    ).then(result => {
        console.log(result);
        console.log('데이터 추가 성공');
    });


    // MySQL DB에 저장하기
    // let sql = "insert into post(title, content, created) values(?, ?, NOW())";
    // let params = [req.body.title, req.body.content];

    // conn.query(sql, params, function(err, result) {
    //     if(err) throw err;
    //     console.log(result);
    // });

    res.redirect("/list");
});

router.post("/photo", upload.single("picture"), function(req, res) {
    console.log(req.file.path);
    console.log(req.file.filename);
    imagepath = req.file.filename;
});

module.exports = router; // router 변수를 외부로 내보낸다.
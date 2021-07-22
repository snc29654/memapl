var express = require('express');
var router = express.Router();

var sqlite3 = require('sqlite3');

//データベースオブジェクトの取得
const db = new sqlite3.Database('memo_data.sqlite3');

router.get('/', function(req, res, next) {
    db.serialize(() => {
        //SQL文, memosテーブルから全てのレコードを取得する（* は全て）
        db.all("select * from memos", (err, rows) => {
            if (!err) {
                const data = {
                    title: 'To Do メモ 一覧表示',
                    content: rows //DataBaseから返された全レコードがrowsに配列で入ります
                }
                //viewファイルのmemo/indexにdataオブジェクトが渡されます
                //res.render(テンプレートファイル名, { 渡す値をオブジェクトで }) → テンプレートファイルを描画する
                res.render('memo/index', data);
            }
        })
    })
});

router.get('/add', function(req, res, next) {
    const data = {
        title: '追加add',
        content: '新しいデータを入力してください'
    }
    res.render('memo/add', data);
});

router.get('/all', function(req, res, next) {
    const data = {
        title: '種別選択',
        content: '選択する種別を入力してください'
    }
    res.render('memo/all', data);
});


router.post('/add', function(req, res, next) {
    const tx = req.body.text;
    const kd = req.body.kind;
    //SQL文, DataBaseのレコード作成
    db.run('insert into memos (text,kind) values (?,?)', memos=[tx,kd])
    //res.redirect() 引数に指定したアドレスにリダイレクト
    res.redirect('/memo');
});

router.post('/all', function(req, res, next) {
    const kd = req.body.kind;
    db.serialize(() => {
        //SQL文, memosテーブルから全てのレコードを取得する（* は全て）
        db.all("select * from memos where kind =?",memos=[kd], (err, rows) => {
            if (!err) {
                const data = {
                    title: 'To Do メモ 種別表示',
                    content: rows //DataBaseから返された全レコードがrowsに配列で入ります
                }
                //viewファイルのmemo/indexにdataオブジェクトが渡されます
                //res.render(テンプレートファイル名, { 渡す値をオブジェクトで }) → テンプレートファイルを描画する
                res.render('memo/index', data);
            }
        })
    })
});

router.get('/edit', function(req, res, next) {
    const id = req.query.id;
    db.serialize(() => {
        const q = "select * from memos where id = ?";
        db.get(q, [id], (err, row) => {
            if (!err) {
                const data = {
                    title: '更新',
                    content: 'id = ' + id + 'のレコードを更新',
                    memoData: row
                }
                res.render('memo/edit', data);
            }
        })
    })
});

router.post('/edit', function(req, res, next) {
    //POST送信された値はreq.body内にまとまられている
    const id = req.body.id;
    const tx = req.body.text;
    const kd = req.body.kind;
    const q = "update memos set text = ? where id = ?";
    db.run(q, tx, id);
    const q2 = "update memos set kind = ? where id = ?";
    db.run(q2, kd, id);
    res.redirect('/memo');
});


router.get('/delete', function(req, res, next) {
    const id = req.query.id;
    db.serialize(() => {
        const q = "select * from memos where id = ?";
        db.get(q, [id], (err, row) => {
            if (!err) {
                const data = {
                    title: '削除',
                    content: 'id = ' + id + 'のメモを削除しますか？',
                    memoData: row
                }
                res.render('memo/delete', data);
            }
        })
    })
});

router.post('/delete', function(req, res, next) {
    const id = req.body.id;
    const q = "delete from memos where id = ?";
    db.run(q, id);
    res.redirect('/memo');
});

module.exports = router;

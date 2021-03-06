var express = require('express');
var router = express.Router();

var sqlite3 = require('sqlite3');

//データベースオブジェクトの取得
const db = new sqlite3.Database('../../memo_data.sqlite3');
const dbej = new sqlite3.Database('../../ejdict.sqlite3');


router.get('/', function(req, res, next) {
    db.serialize(() => {
        //SQL文, memosテーブルから全てのレコードを取得する（* は全て）
        db.all("select * from memos", (err, rows) => {
            if (!err) {
                const data = {
                    title: '',
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
        title: '追加',
        content: '新しいデータを入力してください'
    }
    res.render('memo/add', data);
});
router.get('/scrape', function(req, res, next) {
    const data = {
        title: 'スクレイピング',
        content: 'スクレイピングデータを入力してください'
    }
    res.render('memo/scrape', data);
});

router.get('/selkind', function(req, res, next) {
    const data = {
        title: '種別選択',
        content: '選択する種別を入力してください'
    }
    res.render('memo/selkind', data);
});
router.get('/ejdict', function(req, res, next) {
    const data = {
        title: '英和辞書',
        content: '調べたい英単語を入力してください'
    }
    res.render('memo/ejdict', data);
});

router.get('/word', function(req, res, next) {
    const data = {
        title: 'ワード検索',
        content: '検索するワードを入力してください'
    }
    res.render('memo/word', data);
});
router.get('/worddict', function(req, res, next) {
    const data = {
        title: 'ワード検索',
        content: '検索するワードを入力してください'
    }
    res.render('memo/worddict', data);
});
router.get('/last', function(req, res, next) {
    const data = {
        title: '最後のレコード',
        content: '以下のボタンを押してください'
    }
    res.render('memo/last', data);
});
router.get('/delall', function(req, res, next) {
    const data = {
        title: '全削除',
        content: 'すべてのレコードを削除します'
    }
    res.render('memo/delall', data);
});

router.get('/top', function(req, res, next) {
    const data = {
        title: 'メイン',
        content: '入り口の画面です'
    }
    res.render('memo/top', data);
});


router.post('/add', function(req, res, next) {
    require('date-utils');

    var dt = new Date();
    var formatted = dt.toFormat("YYYY/MM/DD HH24時MI分SS秒");
    console.log(formatted);
    const tx = formatted+ "-------" + req.body.text;
    const kd = req.body.kind;
    const jpgpath = req.body.jpgpath;

    //SQL文, DataBaseのレコード作成
    db.run('insert into memos (text,kind,jpgpath) values (?,?,?)', memos=[tx,kd,jpgpath])

    db.all("select * from memos where id in ( select max( id ) from memos )", (err, rows) => {
        if (!err) {
            const data = {
                title: '最後のレコード',
                content: rows //DataBaseから返された全レコードがrowsに配列で入ります
            }
            //viewファイルのmemo/indexにdataオブジェクトが渡されます
            //res.render(テンプレートファイル名, { 渡す値をオブジェクトで }) → テンプレートファイルを描画する
            res.render('memo/index', data);
        }
    })


    //res.redirect() 引数に指定したアドレスにリダイレクト
//    res.redirect('/memo/last');
});
router.post('/scrape', function(req, res, next) {
    require('date-utils');

    var dt = new Date();
    var formatted = dt.toFormat("YYYY/MM/DD HH24時MI分SS秒");
    console.log(formatted);

    const tx = req.body.text;
    const kd = req.body.kind;

    const rp = require('request-promise');
    const ch = require('cheerio');
    
    const option = {
        transform: (body) => {
            return ch.load(body);
        }
    };
    rp.get(tx, option)
        .then(($) => {
            let element = $('a').text();
            //追加
            if (element == "") {
                return "none";
            }
            return element;
        }).then((element) => {
            console.log(element);
            //SQL文, DataBaseのレコード作成
            element = formatted+ "-------" + element;
            db.run('insert into memos (text,kind) values (?,?)', memos=[element,kd])
            //res.redirect() 引数に指定したアドレスにリダイレクト
            res.redirect('/memo');

        }).catch((error) => {
            console.error('Error:', error);
        });

    //SQL文, DataBaseのレコード作成
//    db.run('insert into memos (text,kind) values (?,?)', memos=[element,kd])
    //res.redirect() 引数に指定したアドレスにリダイレクト
//    res.redirect('/memo');
});

router.post('/top', function(req, res, next) {
    const tx = req.body.text;
    const kd = req.body.kind;
    //SQL文, DataBaseのレコード作成
    db.run('insert into memos (text,kind) values (?,?)', memos=[tx,kd])
    //res.redirect() 引数に指定したアドレスにリダイレクト
    res.redirect('memo/top');
});

router.post('/selkind', function(req, res, next) {
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

router.post('/ejdict', function(req, res, next) {
    const kd = req.body.kind;
    dbej.serialize(() => {
        //SQL文, memosテーブルから全てのレコードを取得する（* は全て）
        dbej.all("select * from items where word like ?",memos=[kd+"%"], (err, rows) => {
            if (!err) {
                const data = {
                    title: '英和辞書',
                    content: rows //DataBaseから返された全レコードがrowsに配列で入ります
                }
                //viewファイルのmemo/indexにdataオブジェクトが渡されます
                //res.render(テンプレートファイル名, { 渡す値をオブジェクトで }) → テンプレートファイルを描画する
                res.render('memo/index_ej', data);
            }
        })
    })
});

router.post('/word', function(req, res, next) {
    const kd = req.body.kind;
    const tx = req.body.text;
    db.serialize(() => {
        //SQL文, memosテーブルから全てのレコードを取得する（* は全て）
        db.all("select * from memos where text like ?",memos=["%"+kd+"%"], (err, rows) => {
            if (!err) {
                const data = {
                    title: 'ワード選択',
                    content: rows //DataBaseから返された全レコードがrowsに配列で入ります
                }
                //viewファイルのmemo/indexにdataオブジェクトが渡されます
                //res.render(テンプレートファイル名, { 渡す値をオブジェクトで }) → テンプレートファイルを描画する
                data.content.forEach( function( value ) {
 

                    //console.log( value.text );
                    var str =value.text
                    var result = str.replace( kd, '●'+ kd);
                    value.text = result    
                });

                const stringifySync = require("csv-stringify/lib/sync");

                const records = data.content;
                
                const csvString = stringifySync(records, {
                  header: true,
                  columns: {
                    id: "ID",
                    kind: "種別",
                    text: "内容"
                  },
                  quoted_string: true
                });
                
                console.log(csvString);

                const fs = require("fs");

                // 書き込むデータ準備


                const csvdata = csvString;
                // 書き込み
                fs.writeFile("../../csv_out.csv", csvdata ,(err) => {
                  if (err) throw err;
                  console.log('正常に書き込みが完了しました');
                });

                res.render('memo/index', data);
            }
        })
    })
});

router.post('/worddict', function(req, res, next) {
    const kd = req.body.kind;
    const tx = req.body.text;
    dbej.serialize(() => {
        //SQL文, memosテーブルから全てのレコードを取得する（* は全て）
        dbej.all("select * from items where mean like ?",memos=["%"+kd+"%"], (err, rows) => {
            if (!err) {
                const data = {
                    title: '和英検索',
                    content: rows //DataBaseから返された全レコードがrowsに配列で入ります
                }
                //viewファイルのmemo/indexにdataオブジェクトが渡されます
                //res.render(テンプレートファイル名, { 渡す値をオブジェクトで }) → テンプレートファイルを描画する
                data.content.forEach( function( value ) {
 

                    //console.log( value.mean );
                    var str =value.mean
                    var result = str.replace( kd, '●'+ kd);
                    value.mean = result    
                });

                const stringifySync = require("csv-stringify/lib/sync");

                const records = data.content;
                
                const csvString = stringifySync(records, {
                  header: true,
                  columns: {
                    id: "ID",
                    word: "英単語",
                    mean: "意味"
                  },
                  quoted_string: true
                });
                
                console.log(csvString);
                const stringifySync_ej = require("csv-stringify/lib/sync");

                const records_ej = data.content;
                
                const csvString_ej = stringifySync_ej(records_ej, {
                  header: true,
                  columns: {
                    id: "ID",
                    word: "英単語",
                    mean: "意味"
                  },
                  quoted_string: true
                });
                
                console.log(csvString_ej);

                const fs = require("fs");

                // 書き込むデータ準備


                const csvdata = csvString_ej;
                // 書き込み
                fs.writeFile("../../csv_out_ej.csv", csvdata ,(err) => {
                  if (err) throw err;
                  console.log('正常に書き込みが完了しました');
                });


                res.render('memo/index_ej', data);
            }
        })
    })
});


router.post('/last', function(req, res, next) {
    const kd = req.body.kind;
    const tx = req.body.text;
    db.serialize(() => {
        //SQL文, memosテーブルから全てのレコードを取得する（* は全て）
        db.all("select * from memos where id in ( select max( id ) from memos )", (err, rows) => {
            if (!err) {
                const data = {
                    title: '最後のレコード',
                    content: rows //DataBaseから返された全レコードがrowsに配列で入ります
                }
                //viewファイルのmemo/indexにdataオブジェクトが渡されます
                //res.render(テンプレートファイル名, { 渡す値をオブジェクトで }) → テンプレートファイルを描画する
                res.render('memo/index', data);
            }
        })
    })
});

router.post('/delall', function(req, res, next) {
    const kd = req.body.kind;
    const tx = req.body.text;
    const fs = require('fs');
    fs.copyFile('../../memo_data.sqlite3', '../../memo_data.sqlite3.bak', (err) => {
        if (err) {
            console.log(err.stack);
        }
        else {
            console.log('Done.');
        }
    });
    db.serialize(() => {
        //SQL文, memosテーブルから全てのレコードを取得する（* は全て）
        db.all("delete from memos", (err, rows) => {
            if (!err) {
                const data = {
                    title: '全削除',
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
    const jp = req.body.jpgpath;

    const q = "update memos set text = ? where id = ?";
    db.run(q, tx, id);
    const q2 = "update memos set kind = ? where id = ?";
    db.run(q2, kd, id);
    const q3 = "update memos set jpgpath = ? where id = ?";
    db.run(q3, jp, id);
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

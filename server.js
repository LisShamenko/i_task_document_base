// конфигурация
const config = require("./config/config");
config.initDotenv();

// 
const path = require('path');
const express = require('express');
const app = express();
app.use(express.static(path.join(__dirname, 'public')));
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// парсинг - тело запроса
const bodyParser = require("body-parser");
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

// 
app.get('/', (req, res) => res.render('pages/index'));
app.get('/test', (req, res) => { 
    res.send(req.query); 
});

// 
const database = require('./db/database')({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE,
    port: process.env.DB_PORT,
});

// getAllData, addNewFolder(ParentId), addNewFile(ParentId, TypeFile)
const databaseRoutes = database.setRouters(express);
app.use(databaseRoutes);

// 
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`http://localhost:${ PORT }/`));

/*
var fs = require('fs');
var check = require('syntax-error');

var file = __dirname + '/views/pages/index.ejs';
var src = fs.readFileSync(file);

var err = check(src, file);
if (err) {
    console.error('ERROR DETECTED' + Array(62).join('!'));
    console.error(err);
    console.error(Array(76).join('-'));
}
*/

/* генератор UUID
const { v4: uuidv4 } = require('uuid');
uuidv4(); // ⇨ '1b9d6bcd-bbfd-4b2d-9b5d-ab8dfbbd4bed'
*/
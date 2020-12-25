// база данных
const crypto = require("crypto");
const pg = require("pg");

let options;
let pgWrapper;

module.exports = (injectedOptions) => {
    options = injectedOptions;
    pgWrapper = require("./pgWrapper")(pg, options);

    return {
        selectAllData: selectAllData,
        insertNewFolder: insertNewFolder,
        insertNewFile: insertNewFile,
        setRouters: setRouters,
    };
}

function selectAllData(cbFunc) {
    let result = {
        files: null,
        folders: null,
        filesToFolder: null,
        foldersToFolder: null
    };

    // 
    Promise.all([
        selectQuery(`SELECT * FROM files`, (results) => result.files = results),
        selectQuery(`SELECT * FROM folders`, (results) => result.folders = results),
        selectQuery(`SELECT * FROM files_to_folder`, (results) => result.filesToFolder = results),
        selectQuery(`SELECT * FROM folders_to_folder`, (results) => result.foldersToFolder = results)
    ]).then(values => {
        cbFunc(result);
    });
}

function selectQuery(query, cbFunc) {
    return new Promise((resolve, reject) => {
        pgWrapper.query(query, (err, results) => {
            if (err || results == null) return reject(response.error);
            cbFunc(results.rows);
            resolve('ok');
        });
    });
}

function insertNewFolder(parentId, cbFunc) {
    pgWrapper.transaction(
        () => {
            return `INSERT INTO public.folders(type, name, starred, shared, date) VALUES (0, 'newFolder', false, true, NOW()) returning *`
        },
        (results) => {
            if (results.rows && results.rowCount >= 1)
                return `INSERT INTO public.folders_to_folder(parent_id, child_id) VALUES (${parentId}, ${results.rows[0].id}) returning *`
            else
                return null;
        },
        (err, firstRes, secondRes) => {
            if (err) return cbFunc(err);
            cbFunc(false, firstRes.rows[0], secondRes.rows[0]);
        });
}

function insertNewFile(parentId, typeFile, cbFunc) {
    pgWrapper.transaction(
        () => {
            return `INSERT INTO public.files(type, name, starred, shared, date) VALUES (${typeFile}, 'newFile', false, true, NOW()) returning *`
        },
        (results) => {
            if (results.rows && results.rowCount >= 1)
                return `INSERT INTO public.files_to_folder(parent_id, child_id) VALUES (${parentId}, ${results.rows[0].id}) returning *`
            else
                return null;
        },
        (err, firstRes, secondRes) => {
            if (err) return cbFunc(err);
            cbFunc(false, firstRes.rows[0], secondRes.rows[0]);
        });
}

function setRouters(express) {
    const router = express.Router();

    router.get('/getAllData', (req, res) => {
        selectAllData((results) => {
            res.json(results);
        });
    });

    router.post('/addNewFolder', (req, res) => {
        let parentId = req.body.ParentId;
        insertNewFolder(parentId, (err, folder, folderToFolder) => {
            if (err) return sendJson(res, err.message, 'fail', null);
            sendJson(res, '', 'success', { folder: folder, folderToFolder: folderToFolder });
        });
    });

    router.post('/addNewFile', (req, res) => {
        let parentId = req.body.ParentId;
        let typeFile = req.body.TypeFile;
        insertNewFile(parentId, typeFile, (err, file, fileToFolder) => {
            if (err) return sendJson(res, err.message, 'fail', null);
            sendJson(res, '', 'success', { file: file, fileToFolder: fileToFolder });
        });
    });

    return router;
}

// отправку json ответа
function sendJson(res, message, status, results) {
    return res.json({
        Message: message,
        Status: status,
        Result: results,
    });
}
const fs = require('fs')

exports.readNovel = function (name, callBack) {
    const route = `${__dirname}/../books/${name}`
    if (fs.existsSync(route)) {
        fs.readFile(`${route}/list.json`, {}, (error, data) => {
            if (error) console.log(error)
            callBack(null, data)
        })
    } else {
        callBack('目录不存在')
    }
}
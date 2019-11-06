const fs = require('fs')

exports.readNovel = function (name, masterStation, callBack) {
    const route = `${__dirname}/../books/${masterStation.split('://')[1]}/${name}`
    if (fs.existsSync(route)) {
        fs.readFile(`${route}/list.json`, {}, (error, data) => {
            if (error) console.log(error)
            callBack(null, data)
        })
    } else {
        callBack('目录不存在')
    }
}
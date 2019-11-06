const fs = require('fs')

/** 写入本地 */
exports.save = function (masterStation, name, list) {
    if (!list || !list.length) return console.log('没有找到目录')
    const route = `${__dirname}/../books/${masterStation}/${name}`
    if (!fs.existsSync(route)) {
        // recursive：递归创建文件夹
        fs.mkdir(route, { recursive: true }, (err) => {
            if (err) console.log(err)
            fs.writeFileSync(`${route}/list.json`, JSON.stringify(list), (error) => {
                if (error) console.log(error)
            })
            console.log(name + '存入本地完成！')
        })
    } else {
        console.log('目录已存在')
    }
}
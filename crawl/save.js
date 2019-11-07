const fs = require('fs')

/** 写入本地
 * @param masterStation 主站地址
 * @param name 书籍名称
 * @param list
 * @param {(success: boolean, msg: string) => void} callBack
 */
exports.save = function (masterStation, name, list, callBack) {
    if (!list || !list.length) return callBack(false, '没有找到目录')
    const route = `${__dirname}/../books/${masterStation}/${name}`
    if (!fs.existsSync(route)) {
        // recursive：递归创建文件夹
        fs.mkdir(route, { recursive: true }, (err) => {
            if (err) console.log(err)
            let isErr = false
            fs.writeFileSync(`${route}/list.json`, JSON.stringify(list), (error) => {
                if (error) {
                    callBack(false, error)
                    isErr = true
                }
            })
            if (!isErr) callBack(true, name + '存入本地完成！')
        })
    } else {
        callBack(false, '目录已存在')
    }
}
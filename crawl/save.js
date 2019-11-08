/** 将内容写入本地 */
const fs = require('fs')

/** 写入本地
 * @param route 写入路径
 * @param name 文件名称
 * @param list 写入内容
 * @param {(success: boolean, msg: string) => void} callBack
 */
exports.save = function (route, name, list, callBack) {
    if (!list || !list.length) return callBack(false, '要写入的内容不存在')
    if (fs.existsSync(route)) deleteFolderRecursive(route)
    // recursive：递归创建文件夹
    fs.mkdir(route, { recursive: true }, (err) => {
        if (err) console.log(err)
        let isErr = false
        fs.writeFileSync(`${route}/${name}`, JSON.stringify(list), (error) => {
            if (error) {
                callBack(false, error)
                isErr = true
            }
        })
        if (!isErr) callBack(true, '存入本地完成！')
    })
}

/** 递归删除文件夹和文件 */
function deleteFolderRecursive(path) {
    if (fs.existsSync(path)) {
        fs.readdirSync(path).forEach(function (file) {
            var curPath = path + "/" + file
            if (fs.statSync(curPath).isDirectory()) { // recurse
                deleteFolderRecursive(curPath)
            } else {
                fs.unlinkSync(curPath)
            }
        });
        fs.rmdirSync(path)
    }
}

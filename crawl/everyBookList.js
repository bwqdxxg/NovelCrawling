/** 爬取所有书籍目录方法集 */
const { getHtml } = require('./getHtml')
const { analysisHtml } = require('./analysisHtml')
const { save } = require('./save')

exports.api = { allBookList, crawlNovel }

/** 爬取allBooks中所有书籍的目录
 * @param index 递归数
 * @param {Array<{name:string, address:string, novelOtherAddress:string, classOtherAddress:string, classArr:Array<any>}>} comparisonIndex
 * @param {Array<{name:string, author:string, id:string, className:string, classId:string}>} list
 * @param {(msg:string) => void} callBack
 */
function allBookList(index, comparisonIndex, list, callBack) {
    const li = list[index]
    if (!li) return callBack('书籍目录爬取写入完成！')
    crawlNovel(li.name, comparisonIndex.address, comparisonIndex.novelOtherAddress + li.id, 'list', (success, msg) => {
        if (success) console.log(`爬取并写入${li.name}成功，开始爬取下一本`)
        else console.log(`爬取并写入${li.name}失败，错误：${msg}，开始爬取下一本`)
        allBookList(index + 1, comparisonIndex, list, callBack)
    })
}

/**
 * 爬取小说目录/内容
 * @param name 书籍名称
 * @param masterStation 主站地址
 * @param address 书籍路径/ID
 * @param {'list' | 'content'} type 爬取类型
 * @param callBack 回调程序
 */
function crawlNovel(name, masterStation, address, type, callBack) {
    getHtml(name, masterStation, address, (err, html) => {
        if (err) callBack(false, err)
        else {
            console.log(masterStation + '：' + name + ' 的HTML已获取完成，开始解析。。。')
            analysisHtml(masterStation, name, html, type, (err, name, data) => {
                if (err) console.log(err)
                else {
                    console.log(masterStation + '：' + name + ' 的HTML已解析完成！')
                    switch (type) {
                        case 'content': {
                            callBack(true, name, data)
                            break
                        }
                        case 'list': {
                            const route = `${__dirname}/../books/${masterStation.split('://')[1]}/${name}`
                            save(route, 'list.json', data, (success, msg) => {
                                callBack(success, msg)
                            })
                            break
                        }
                        default: break
                    }
                }
            })
        }
    })
}

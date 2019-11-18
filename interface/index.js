const fs = require('fs')
const express = require('express')
const app = express()
const { bookContent, crawlNovel } = require('../crawl').api
const comparison = require('../comparison.json')

// 设置跨域访问
app.all('*', function (req, res, next) {
    res.header("Access-Control-Allow-Origin", "*")
    res.header("Access-Control-Allow-Headers", "X-Requested-With")
    res.header("Access-Control-Allow-Methods", "PUT,POST,GET,DELETE,OPTIONS")
    res.header("X-Powered-By", ' 3.2.1')
    res.header("Content-Type", "application/json;charset=utf-8")
    next()
})

/** 获取debug
 */
app.get('/debug', function (req, res) {
    const debug = fs.readFileSync(`${__dirname}/../debug.txt`)
    resMethods(res, 200, debug.toString())
})

/** 获取源配置文件
 */
app.get('/comparison', function (req, res) {
    resMethods(res, 200, comparison)
})

/** 获取指定源分类列表
 * query:
 * @param {number} master 使用第几个源
 */
app.get('/classList', function (req, res) {
    const query = req.query
    if (query) {
        const { master } = query
        if (!master) return resMethods(res, 501, '没有指定源参数')
        if (!comparison[master]) return resMethods(res, 501, '没有配置该源')
        resMethods(res, 200, { class: comparison[master].classArr })
    } else {
        resMethods(res, 501, '没有任何参数')
        return
    }
})

/** 获取指定源书籍列表
 * query:
 * @param {number} master 使用第几个源
 * @param {string} id 书分类ID
 * @param {string} start 从第几条数据开始
 * @param {string} end 到第几条数据结束
 */
app.get('/bookList', function (req, res) {
    const query = req.query
    if (query) {
        const { master, id, start, end } = query
        if (!master) return resMethods(res, 501, '没有指定源参数')
        if (!id) return resMethods(res, 501, '没有分类ID参数')
        if (!start) return resMethods(res, 501, '没有start参数')
        if (!end) return resMethods(res, 501, '没有end参数')
        const masterStation = comparison[master].address.split('://')[1].slice(0, -1)
        const route = `${__dirname}/../books/${masterStation}/`
        if (fs.existsSync(route)) {
            let allBooks = fs.readFileSync(route + 'allBooks.json')
            if (allBooks) {
                let list = []
                allBooks = JSON.parse(allBooks.toString())
                for (let i = 0, num = 0; i < allBooks.length; i++) {
                    if (allBooks[i].classId === id) {
                        num++
                        if (num > end) break
                        if (num >= start) {
                            list.push(allBooks[i])
                        }
                    }
                }
                resMethods(res, 200, { list })
            } else {
                resMethods(res, 500, '没有爬取过该源的数据')
            }
        } else {
            resMethods(res, 500, '没有对应的源')
        }

    } else {
        resMethods(res, 501, '没有任何参数')
        return
    }
})

/** 获取指定源书籍目录
 * 第一次获取会从爬取源获取，之后会直接读取缓存在本地的数据
 * query:
 * @param {number} master 使用第几个源
 * @param {string} id 要查找的书ID
 * @param {string} start? 从第几条目录开始
 * @param {string} end? 到第几条目录结束
 */
app.get('/book', function (req, res) {
    const query = req.query
    if (query) {
        const { master, id } = query
        if (!master) return resMethods(res, 501, '没有指定源参数')
        if (!id) return resMethods(res, 501, '没有书籍ID参数')
        const comparisonIndex = comparison[master]
        const fullMasterStation = comparisonIndex.address
        const masterStation = fullMasterStation.split('://')[1].slice(0, -1)
        const route = `${__dirname}/../books/${masterStation}/`
        if (fs.existsSync(route)) {
            let allBooks = fs.readFileSync(route + 'allBooks.json')
            if (allBooks) {
                allBooks = JSON.parse(allBooks.toString())
                const base = allBooks.find((val) => val.id === id)
                if (base) {
                    let list = []
                    if (fs.existsSync(route + base.name + '/list.json')) {
                        list = JSON.parse(fs.readFileSync(route + base.name + '/list.json').toString())
                        resMethods(res, 200, { base, list })
                    } else {
                        crawlNovel(base.name, fullMasterStation, comparisonIndex.novelOtherAddress + base.id, 'list', (success, name, data) => {
                            if (!success) console.log(`${base.name}：爬取失败`)
                            else list = data
                            resMethods(res, 200, { base, list })
                        }, true)
                    }
                } else {
                    resMethods(res, 500, '该源没有此书籍的数据')
                }
            } else {
                resMethods(res, 500, '没有爬取过该源的数据')
            }
        } else {
            resMethods(res, 500, '没有对应的源')
        }
    } else {
        resMethods(res, 501, '没有任何参数')
        return
    }
})

/** 更新书籍目录
 * query:
 * @param {number} master 使用第几个源
 * @param {string} id 要查找的书ID
 */
app.get('/updataBook', function (req, res) {
    const query = req.query
    if (query) {
        const { master, id } = query
        if (!master) return resMethods(res, 501, '没有指定源参数')
        if (!id) return resMethods(res, 501, '没有书籍ID参数')
        const comparisonIndex = comparison[master]
        const fullMasterStation = comparisonIndex.address
        const masterStation = fullMasterStation.split('://')[1].slice(0, -1)
        const route = `${__dirname}/../books/${masterStation}/`
        if (fs.existsSync(route)) {
            let allBooks = fs.readFileSync(route + 'allBooks.json')
            if (allBooks) {
                allBooks = JSON.parse(allBooks.toString())
                const base = allBooks.find((val) => val.id === id)
                if (base) {
                    let list = []
                    crawlNovel(base.name, fullMasterStation, comparisonIndex.novelOtherAddress + base.id, 'list', (success, name, data) => {
                        if (!success) console.log(`${base.name}：爬取失败`)
                        else list = data
                        resMethods(res, 200, { base, list })
                    }, true)
                } else {
                    resMethods(res, 500, '该源没有此书籍的数据')
                }
            } else {
                resMethods(res, 500, '没有爬取过该源的数据')
            }
        } else {
            resMethods(res, 500, '没有对应的源')
        }
    } else {
        resMethods(res, 501, '没有任何参数')
        return
    }
})

/** 搜索书籍
 * query:
 * @param {number} master 使用第几个源
 * @param {string} name 要查找的书名
 */
app.get('/search', function (req, res) {
    const query = req.query
    if (query) {
        const { master, name } = query
        if (!master) return resMethods(res, 501, '没有指定源参数')
        if (!name) return resMethods(res, 501, '没有书籍名称参数')
        const comparisonIndex = comparison[master]
        const fullMasterStation = comparisonIndex.address
        const masterStation = fullMasterStation.split('://')[1].slice(0, -1)
        const route = `${__dirname}/../books/${masterStation}/`
        if (fs.existsSync(route)) {
            let allBooks = fs.readFileSync(route + 'allBooks.json')
            if (allBooks) {
                allBooks = JSON.parse(allBooks.toString())
                let list = []
                for (let i = 0; i < allBooks.length; i++) {
                    if (allBooks[i].name.indexOf(name) !== -1) {
                        list.push(allBooks[i])
                    }
                }
                resMethods(res, 200, { list })
            } else {
                resMethods(res, 500, '没有爬取过该源的数据')
            }
        } else {
            resMethods(res, 500, '没有对应的源')
        }
    } else {
        resMethods(res, 501, '没有任何参数')
        return
    }
})

/** 获取指定源对应书籍文章
 * query:
 * @param {number} master 使用第几个源
 * @param {string} id 要查找的书ID
 * @param {string} chapter 章节ID
 */
app.get('/content', function (req, res) {
    const query = req.query
    if (query) {
        const { master, id, chapter } = query
        if (!master) return resMethods(res, 501, '没有指定源参数')
        if (!id) return resMethods(res, 501, '没有书籍ID参数')
        if (!chapter) return resMethods(res, 501, '没有书籍文章ID参数')
        const masterStation = comparison[master].address
        const novelOtherAddress = comparison[master].novelOtherAddress
        bookContent(null, masterStation, `${novelOtherAddress}${id}/${chapter}`, (err, name, data) => {
            if (err) resMethods(res, 501, err)
            else resMethods(res, 200, data)
        })
    } else {
        resMethods(res, 501, '没有任何参数')
        return
    }
})

function resMethods(res, status, msg) {
    res.status(status)
    res.json(msg)
}

/** 配置服务端口 */
const server = app.listen(3002, function () {
    const host = server.address().address
    const port = server.address().port
    console.log('listen at http://%s:%s', host, port)
})

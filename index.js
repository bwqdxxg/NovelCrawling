const comparison = require('./comparison.json')
const { integration, masterStationClassBooksMethods, allBooksSaveLocalhost, crawlNovel, everyClassBooks, classBooks } = require('./crawl').api
const { readNovel } = require('./load')

/**
 * 程序：
 * 1.书籍由服务器上的node程序定时爬取所有配置源所得，并存于服务器上（可以暂时只有链接地址，不爬取书本内容）
 * 2.进入书籍目录或内容页面，优先使用手机本地缓存文件（手动缓存指定源数据） => 根据当前使用源在服务器上查找并返回目录或内容（进入书籍页面自动使用第一个源或上次使用的源）
 * 2.1.手动缓存指定源，是将服务器上的文本内容和目录内容（若只存了链接地址，则爬取后发送）发往手机并调用手机API存储于指定文件夹内
 * 2.2.读取缓存，是读取缓存的目录和内容文件
 * 2.3.node需要写接口程序供前端调用返回对应数据
 * 2.4.缓存的数据可存于数据库或服务器本地文件
 * 3.每个源的解析方式都不同，所以每个源都需要单独写解析，将其每本书对应的网址和其相关资源进行存储
 * 3.1.每个源的爬取解析程序由三部分组成：爬取全部书籍、爬取每本书的目录、爬取每章节的所有文章内容
 * 3.2.全部书籍对应的目录信息都存入本地，每章节的内容则只临时爬取后返回
 * 页面组成部分：
 * 1.个人书架/书城/我的（暂定）
 * 2.点击书籍=》书籍介绍（书籍封面/介绍/加入书架/其他书籍推荐/全本缓存/阅读/目录）
 * 3.【书籍封面/介绍/加入书架/其他书籍推荐】使用自己的；【全本缓存/阅读/目录】使用对应源头爬取的
 * 未完成：
 * 1.接口程序
 * 2.定时爬取所有源对应所有书籍目录到本地
 * 2.1.爬取源无效/无法获取，自动跳到下个源；爬取书籍过程超时自动重连，重连次数超过指定数自动跳过开始爬取下一本
 */

/**
 * 爬取小说
 * @param name 书籍名称
 * @param masterStation 主站地址（源）
 * @param address 书籍路径
 * @param {'list'|'content'} type 爬取类型
 */
function crawl(name, masterStation, address, type) {
    crawlNovel(name, masterStation, address, type, (success, name, data) => {
        if (!success) console.log('爬取失败')
        else if (type === 'content') {
            console.log(name, data.slice(0, 100))
        }
    })
}

/** 读取本地书籍数据
 * @param name 书籍名称
 * @param masterStation 主站地址（源）
 * @param callBack 数据回调
 */
function read(name, masterStation, callBack) {
    readNovel(name, masterStation, (err, data) => {
        if (err) {
            console.log(err)
            callBack()
        } else callBack(data)
    })
}

const argv = process.argv
const cs = comparison[0]
if (argv[2] === 'crawl') {
    crawl('仙逆', cs.address, cs.otherAddress + '0/352/10299759.html', 'content')
} else if (argv[2] === 'load') {
    read(argv[3], cs.address)
}

const Koa = require('koa')
const path = require('path')
const Router = require('koa-router')

const Url = require('url')
const {JSDOM} = require('jsdom')
const Segment = require('segment'); //中文分词模块
var segment = new Segment();
segment.useDefault();

let app = new Koa()
app.listen(7000,()=>{
    console.log('服务器启动在7000')
})

app.use(require('koa-static')(path.resolve('./')));

const router = new Router()
router.get('/getUrl',async function (ctx) {
    console.log(ctx.request.query)
    let res = await getUrl(ctx.request.query.str)
    // console.log(res)
    ctx.body={res}
})
app.use(router.routes());


function getUrl(sUrl) {
    return new Promise((resolve,reject)=>{
        let urlObj = Url.parse(sUrl)
        let http;
        console.log(urlObj)
        if (urlObj.protocol=='http:') {
            http = require('http')
        }else{
            http = require('https')
        }
         
        let req =  http.request({
            'hostname':urlObj.hostname,
            'path':urlObj.path
        },res=>{
            if (res.statusCode ==200) {
                var str = ''
                res.on('data',buffer=>{
                    str+=buffer
                })
                res.on('end',()=>{
                    let DOM = new JSDOM(str)
                    let document = DOM.window.document
                    var content = document.querySelector('.read-content').innerHTML.replace(/<[^>]+>/g,'')
                    var arr = segment.doSegment(content)
                    // console.log(arr)
                    var myarr = []
                    arr.forEach(data => {
                        if (data.p != 2048) {   //标点符号的去除
                            myarr.push(data.w)
                        }
                    });
                    var myjson ={}
                    myarr.forEach(data=>{
                        if (!myjson[data]) {
                            myjson[data] = 1
                        }else{
                            myjson[data]++
                        }
                    })
                    // console.log(myjson)
            
                    let arr2=[]
                    for (const key in myjson) {//筛选出现次数大于10的
                        if (myjson[key]<=10) {   
                            continue
                        }
                        arr2.push({
                            w:key,
                            c:myjson[key]
                        })
                    }
                    arr2.sort((json1,json2)=> json2.c - json1.c)    //出现次数从大到小排
                    // console.log(arr2)
                    resolve(arr2)
                })
            }
            // else if (res.statusCode == 302 || res.statusCode == 301) {
            //     getUrl(res.headers.location)
            // }
            
        })
        req.end()
        req.on('error',()=>{
            console.log('哥们,出错了')
        })
    })
    
}

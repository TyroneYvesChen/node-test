const express = require('express')
const path = require('path')
const http = require('http')
const config = require('config-lite')(__dirname)
const pkg = require('./package')
const app = express()

const proxyMiddleWare = require("http-proxy-middleware");
const proxyPath = "http://10.10.198.108:7000";//目标后端服务地址()
const proxyOption ={
    target: proxyPath,
    changeOrigoin: true,
    pathRewrite: {
        "/wocao": ""
    }
};

let params = {
    router:"homeService.login",
    account:"root",
    password:111111
}
//这里要注意"/discern" 是匹配的路由,它会将匹配的路由进行转发，没匹配到的就不会转发。('/discern'完全可以写成'/'就是说所有路由都可以访问)

// http.get('http://10.10.198.108:7000/platform-aos/http/do.jhtml', params, (res) => {
//     console.log(res, "resresres")
//     // Do stuff with response
// });

var qs = require('querystring');

var post_data = {
    router:"homeService.login",
    account:"root",
    password:111111
};//这是需要提交的数据


var content = qs.stringify(post_data);

var options = {
    hostname: '127.0.0.1',
    // hostname: 'http://10.10.198.108',
    port: 3000,
    path: '/post',
    method: 'POST',
    headers: {
        'Content-Type': 'application/x-www-form-urlencoded;'
    }
};

var req = http.request(options, function (res) {
    console.log('STATUS: ' + res.statusCode);
    console.log('HEADERS: ' + JSON.stringify(res.headers));
    res.setEncoding('utf8');
    res.on('data', function (chunk) {
        console.log('BODY: ' + chunk);
    });
});

req.on('error', function (e) {
    console.log('problem with request: ' + e.message);
});

// write data to request body
req.write(content);

req.end();

app.use(express.static(path.join(__dirname, 'public')))

//设置跨域访问
app.all('*', function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "X-Requested-With");
    res.header("Access-Control-Allow-Methods","PUT,POST,GET,DELETE,OPTIONS");
    res.header("X-Powered-By",' 3.2.1');
    res.header("Content-Type", "application/json;charset=utf-8");
    next();
});

app.use("/wocao/platform-aos",proxyMiddleWare(proxyOption))


app.get('/123',function(req,res){
    res.status(200)
    res.json({a:1})
});

app.use('/post',function(req,res){
    res.status(200)
    res.json({a:999})
});

//之前规则都没匹配到后重定向
app.use('/', function(req, res, next) {
    res.json("木有页面！")
    // next()
});


if (module.parent) {
    // 被 require，则导出 app
    module.exports = app
} else {
    // 监听端口，启动程序
    let server = app.listen(config.port, function (req, res) {
        var host = server.address().address;
        var port = server.address().port;
        console.log('Example app listening at http://%s:%s', host, port);
        console.log(`${pkg.name} listening on port ${config.port}`)
    })
}
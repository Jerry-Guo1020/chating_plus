const express = require('express')
//这一步是：引入node.js的http模块，这个的作用是为了能够创建http服务器和客户端的功能
const http = require('http')

const { Server } = require("socket.io")
const { join } = require('node.path')
const { log } = require('console')

const app = express()
const server = http.createServer(app)
const io = new Server(server)
const port = 3000

// app.use()这个作用是访问请求对象、响应对象和对于应用程序的请求的一个中间件函数，
// 他可以
// 执行任何代码、
// 更改请求和响应对象、
// 结束/调用请求

// express.static() 这个的作用是提供静态文件服务


// join(__dirname, '../client') 这个的作用是： 通过使用 path.join 来进行拼接完整文件目录，从而可以将index.html的内容展示出来

app.use(express.static(join(__dirname, '../client')));
server.listen(port, () => {
    console.log(`Server listing on port ${port}`);
});

// 两者区别：

// app.get('/', (req, res) => res.send('Hello World!'))
// app.listen(port, () => console.log(`Example app listening on port ${port}!`))

// 每当有一个新用户来连接socket.io的服务器的时候 就会用io.on("connection", ...) 的回调函数会针对这个特定的客户端执行一次
// 这里有一个备注：为什么disconnect会放在connecttion
// 这个是因为：disconnect 是客户端连接生命周期的一部分，你首先要有新用户进来 然后在这个过程当中会有用户退出去 所以这是包含关系

io.on('connection', (socket) => {
    console.log("有一位用户进来啦", socket.id);
    socket.on('disconnect', () => {
        console.log("有一位用户退出了", socket.id);
    });
    
    socket.on("chat message", (msg) => {
        console.log("message", + msg, socket.id);
        io.emit("chat message", msg)
    })
})
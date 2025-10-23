const socket = io();
let selfID = null;
let username = localStorage.getItem('username') || "用户" + Math.floor(Math.random() * 1000);

// 初始化用户
function initUser() {
    localStorage.setItem('username', username);
    socket.emit('join', username);
};

initUser();

// 对发送信息的操作
const messages = document.getElementById('message'); // 修正为与HTML中一致的ID
const input = document.getElementById('input');
const sendBtn = document.getElementById('sendBtn');
const userCount = document.getElementById('userCount');


// 该对象传入的属性每一个的含义 
// text：输入的内容  
// username：用户名   
// time：时间    
// self：是否为当前用户发送    
// system：判断是否为系统发送的消息，比如说如果有新用户进来的情况，那么系统会有一个消息：“xxx进入了房间”这种提示，那么这种的消息就是用另一种的css来进行展示

function addMessage({ text, username, time, self = false, system = false}) {
    if(system) {
        //定义一个sys 来新建一个div标签元素 然后后面的内容就是调用它就是用div标签包住
        const sys = document.createElement('div');
        // 设置他的css类名
        sys.className = 'system-msg';
        sys.textContent = `${new Date(time).toLocaleDateString()} - ${text}`;
        messages.appendChild(sys);
    } else {
        // 定义msg变量
        const msg = document.createElement('div');
        // 设置msg的属性

        // 用三元表达式 - 判断是否是自己发的消息
        msg.className = 'message' + (self ? 'self' : '');
        msg.innerHTML = `
        <div class="avatar"></div>
        <div>
            <div class="bubble">${text}</div>
            <div class="meta">${username} : ${new Date(time).toLocaleString([], {hour:'2-digit', minute:'2-digit'})} </div>
        </div>
        `;
        // 将msg的元素连接到dom中
        messages.appendChild(msg);
    }
    // 这个的作用就是：当我有新消息出现时候我能够自动滑动窗户看得到最新消息
    messages.scrollTop = messages.scrollHeight;
}

//发送消息的输入框
function sendMessage() {
    const text = input.value.trim();
    if(!text) return;
    socket.emit('chat message', { text });
    input.value = '';
}

// 点击发送按钮
sendBtn.onclick = sendMessage;

// 使用enter发送消息
input.addEventListener("keyup", function(event) {
    if(event.key === "Enter") {
        // 获取输入框的文本
        sendMessage();
        console.log(`${username}发的消息是`, input.value);
    }
})

// socket事件

// 1、当客户端成功连接到服务器进入聊天室的时候会有一个joined的事件传到客户端
socket.on('joined', (data) => {
    selfID = data.id;
})

socket.on('chat message', (msg) => {
    addMessage({
        // 使用展开运算符将msg对象的所有属性复制到新的对象当中
        ...msg,
        self: msg.id === selfID,
        system: msg.system || false
    });
});

// 添加用户计数更新处理
socket.on('user count', (count) => {
    userCount.textContent = `当前在线：${count}人`;
});

// 断开连接的重新处理
socket.on('disconnect', () => {
    addMessage({
        text: "与服务器断开连接，正在尝试重新连接…",
        time: Date.now(),
        system: true
    });
});

socket.on('connect', () => {
    addMessage({
        text:"成功重新连上服务器，欢迎使用！",
        time: Date.now(),
        system: true
    });
    
    socket.emit('join', username);
});
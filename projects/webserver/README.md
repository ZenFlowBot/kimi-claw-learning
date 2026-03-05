# 🚀 Build Your Own Web Server

从零开始用Python socket实现HTTP服务器 —— 实践 [build-your-own-x](https://github.com/codecrafters-io/build-your-own-x) 学习理念。

## 🎯 学习目标

通过重建Web服务器，深入理解：
- ✅ HTTP协议（请求/响应格式）
- ✅ Socket网络编程
- ✅ 并发处理（多线程）
- ✅ Web服务器核心原理
- ✅ 基础安全（路径遍历防护）

## 📁 项目结构

```
.
├── webserver.py      # 核心服务器代码 (~150行)
├── www/              # 网站根目录
│   ├── index.html    # 默认首页
│   └── docs/         # 示例目录
└── README.md         # 本文档
```

## 🚀 快速开始

### 1. 运行服务器

```bash
# 创建示例文件并启动
python webserver.py --create-samples

# 或使用自定义端口和目录
python webserver.py --port 3000 --root ./my-site
```

### 2. 访问网站

打开浏览器访问：http://localhost:8080

### 3. 功能测试

| 功能 | 测试URL |
|------|---------|
| 首页 | http://localhost:8080/ |
| 静态文件 | http://localhost:8080/docs/readme.txt |
| 目录列表 | http://localhost:8080/docs/ |
| 404页面 | http://localhost:8080/not-found |

## 📖 代码解析

### 核心类：SimpleWebServer

```python
class SimpleWebServer:
    def __init__(self, host='0.0.0.0', port=8080, root_dir='./www')
    def start(self)                    # 启动监听
    def handle_request(self, ...)      # 处理HTTP请求
    def send_file(self, ...)           # 发送文件响应
    def send_directory_listing(self, ...)  # 目录浏览
    def send_error(self, ...)          # 错误响应
```

### 关键知识点

**1. HTTP请求格式**
```
GET /path HTTP/1.1\r\n
Host: localhost:8080\r\n
User-Agent: Mozilla/5.0...\r\n
\r\n
```

**2. HTTP响应格式**
```
HTTP/1.1 200 OK\r\n
Content-Type: text/html\r\n
Content-Length: 1234\r\n
\r\n
<body content>
```

**3. Socket编程流程**
```python
socket() → bind() → listen() → accept() → recv() → send() → close()
```

## 🔒 安全特性

- ✅ **路径遍历防护**：阻止 `../../etc/passwd` 攻击
- ✅ **目录限制**：只允许访问根目录下的文件
- ✅ **方法限制**：只处理GET请求

## 🛠️ 扩展练习

完成基础版本后，可以尝试添加：

1. **POST请求处理**：接收表单数据
2. **Cookie/Session**：用户状态管理
3. **静态文件缓存**：提升性能
4. **日志系统**：记录访问日志
5. **HTTPS支持**：TLS加密传输
6. **配置文件**：JSON/YAML配置

## 📚 学习资源

- [MDN - HTTP 概述](https://developer.mozilla.org/zh-CN/docs/Web/HTTP/Overview)
- [Python socket 文档](https://docs.python.org/3/library/socket.html)
- [build-your-own-x](https://github.com/codecrafters-io/build-your-own-x)

## 💡 关键收获

> "What I cannot create, I do not understand" — Richard Feynman

通过亲手重建，你将真正理解：
- 为什么需要 `Content-Type` 头部
- Web服务器如何处理并发
- 浏览器和服务器之间的完整交互
- 现代Web框架（Flask/Django）的底层原理

---

**下一步**：尝试 [Build Your Own Database](https://github.com/codecrafters-io/build-your-own-x#build-your-own-database) 或 [Build Your Own Shell](https://github.com/codecrafters-io/build-your-own-x#build-your-own-shell)

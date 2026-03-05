#!/usr/bin/env python3
"""
Build Your Own Web Server
从零开始用Python socket实现HTTP服务器

学习目标：
- 理解HTTP协议基础（请求/响应格式）
- 掌握socket网络编程
- 理解Web服务器工作原理

参考：build-your-own-x项目理念
"""

import socket
import threading
import os
from datetime import datetime
from urllib.parse import unquote


class SimpleWebServer:
    """
    简单的HTTP Web服务器
    支持：静态文件服务、目录列表、404处理
    """
    
    def __init__(self, host='0.0.0.0', port=8080, root_dir='./www'):
        self.host = host
        self.port = port
        self.root_dir = os.path.abspath(root_dir)
        # 创建根目录
        if not os.path.exists(self.root_dir):
            os.makedirs(self.root_dir)
    
    def start(self):
        """启动服务器"""
        # 创建TCP socket
        server_socket = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
        # 允许端口复用
        server_socket.setsockopt(socket.SOL_SOCKET, socket.SO_REUSEADDR, 1)
        # 绑定地址和端口
        server_socket.bind((self.host, self.port))
        # 开始监听，最大连接数5
        server_socket.listen(5)
        
        print(f"🚀 Web Server started at http://{self.host}:{self.port}")
        print(f"📁 Serving files from: {self.root_dir}")
        print("Press Ctrl+C to stop\n")
        
        try:
            while True:
                # 接受客户端连接
                client_socket, client_addr = server_socket.accept()
                # 为每个连接创建新线程
                thread = threading.Thread(
                    target=self.handle_request,
                    args=(client_socket, client_addr)
                )
                thread.daemon = True
                thread.start()
        except KeyboardInterrupt:
            print("\n🛑 Server stopped")
        finally:
            server_socket.close()
    
    def handle_request(self, client_socket, client_addr):
        """处理HTTP请求"""
        try:
            # 接收请求数据（最大8KB）
            request_data = client_socket.recv(8192).decode('utf-8', errors='ignore')
            
            if not request_data:
                return
            
            # 解析请求行（GET /path HTTP/1.1）
            lines = request_data.split('\r\n')
            request_line = lines[0]
            parts = request_line.split()
            
            if len(parts) < 3:
                return
            
            method, path, version = parts[0], parts[1], parts[2]
            
            # 只处理GET请求
            if method != 'GET':
                self.send_error(client_socket, 405, "Method Not Allowed")
                return
            
            # URL解码路径
            path = unquote(path)
            
            # 安全处理：防止目录遍历攻击
            if '..' in path:
                self.send_error(client_socket, 403, "Forbidden")
                return
            
            # 构建完整文件路径
            if path == '/':
                path = '/index.html'
            
            file_path = os.path.join(self.root_dir, path.lstrip('/'))
            
            # 检查路径是否在根目录内
            real_path = os.path.realpath(file_path)
            if not real_path.startswith(self.root_dir):
                self.send_error(client_socket, 403, "Forbidden")
                return
            
            # 如果是目录，显示目录列表
            if os.path.isdir(file_path):
                self.send_directory_listing(client_socket, path, file_path)
                return
            
            # 发送文件
            if os.path.exists(file_path) and os.path.isfile(file_path):
                self.send_file(client_socket, file_path)
            else:
                self.send_error(client_socket, 404, "Not Found")
                
        except Exception as e:
            print(f"Error handling request: {e}")
        finally:
            client_socket.close()
    
    def send_file(self, client_socket, file_path):
        """发送文件响应"""
        # 获取文件扩展名确定Content-Type
        ext = os.path.splitext(file_path)[1].lower()
        content_types = {
            '.html': 'text/html',
            '.css': 'text/css',
            '.js': 'application/javascript',
            '.json': 'application/json',
            '.png': 'image/png',
            '.jpg': 'image/jpeg',
            '.gif': 'image/gif',
            '.txt': 'text/plain'
        }
        content_type = content_types.get(ext, 'application/octet-stream')
        
        try:
            # 读取文件内容
            with open(file_path, 'rb') as f:
                content = f.read()
            
            # 构建HTTP响应
            response = f"""HTTP/1.1 200 OK\r
Content-Type: {content_type}\r
Content-Length: {len(content)}\r
Connection: close\r
Date: {datetime.utcnow().strftime('%a, %d %b %Y %H:%M:%S GMT')}\r
Server: SimpleWebServer/1.0\r
\r\n"""
            
            # 发送响应头和内容
            client_socket.send(response.encode())
            client_socket.send(content)
            
        except Exception as e:
            self.send_error(client_socket, 500, "Internal Server Error")
    
    def send_directory_listing(self, client_socket, request_path, dir_path):
        """发送目录列表"""
        files = os.listdir(dir_path)
        
        # 构建HTML列表
        items = []
        # 返回上级链接
        if request_path != '/':
            items.append('<li><a href="../">📁 ../</a></li>')
        
        for filename in sorted(files):
            full_path = os.path.join(dir_path, filename)
            if os.path.isdir(full_path):
                items.append(f'<li><a href="{filename}/">📁 {filename}/</a></li>')
            else:
                items.append(f'<li><a href="{filename}">📄 {filename}</a></li>')
        
        html = f"""<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Directory Listing - {request_path}</title>
    <style>
        body {{ font-family: Arial, sans-serif; max-width: 800px; margin: 40px auto; padding: 0 20px; }}
        h1 {{ color: #333; }}
        ul {{ list-style: none; padding: 0; }}
        li {{ padding: 8px 0; border-bottom: 1px solid #eee; }}
        a {{ text-decoration: none; color: #0366d6; }}
        a:hover {{ text-decoration: underline; }}
    </style>
</head>
<body>
    <h1>📁 Directory: {request_path}</h1>
    <ul>{''.join(items)}</ul>
    <hr>
    <p><small>SimpleWebServer/1.0</small></p>
</body>
</html>"""
        
        response = f"""HTTP/1.1 200 OK\r
Content-Type: text/html\r
Content-Length: {len(html.encode())}\r
Connection: close\r
\r
{html}"""
        
        client_socket.send(response.encode())
    
    def send_error(self, client_socket, code, message):
        """发送错误响应"""
        html = f"""<!DOCTYPE html>
<html>
<head><title>{code} {message}</title></head>
<body>
    <h1>{code} {message}</h1>
    <p>The server encountered an error.</p>
</body>
</html>"""
        
        response = f"""HTTP/1.1 {code} {message}\r
Content-Type: text/html\r
Content-Length: {len(html.encode())}\r
Connection: close\r
\r
{html}"""
        
        client_socket.send(response.encode())


def create_sample_files(root_dir):
    """创建示例文件"""
    # 创建首页
    index_html = """<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>My Web Server</title>
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            max-width: 800px;
            margin: 60px auto;
            padding: 0 20px;
            line-height: 1.6;
            color: #333;
        }
        h1 { color: #2c3e50; }
        .success { 
            background: #d4edda; 
            padding: 15px; 
            border-radius: 5px;
            border-left: 4px solid #28a745;
        }
        code {
            background: #f4f4f4;
            padding: 2px 6px;
            border-radius: 3px;
            font-family: 'Consolas', 'Monaco', monospace;
        }
    </style>
</head>
<body>
    <h1>🎉 Congratulations!</h1>
    <div class="success">
        <strong>You've built your own web server!</strong><br>
        This page is served by a Python web server written from scratch.
    </div>
    
    <h2>What you learned:</h2>
    <ul>
        <li>HTTP protocol basics (Request/Response)</li>
        <li>Socket programming in Python</li>
        <li>Multi-threading for concurrent connections</li>
        <li>URL routing and file serving</li>
        <li>Basic security (path traversal prevention)</li>
    </ul>
    
    <h2>Try it out:</h2>
    <p>✅ Static file serving (this HTML file)</p>
    <p>✅ Directory listing: <a href="/docs/">View /docs/</a></p>
    <p>✅ 404 handling: <a href="/nonexistent">Try a broken link</a></p>
    
    <h2>Next steps:</h2>
    <p>1. Add POST request handling</p>
    <p>2. Implement logging</p>
    <p>3. Add configuration file support</p>
    <p>4. Support HTTPS with TLS</p>
    
    <hr>
    <p><small>Built with ❤️ by learning from GitHub's build-your-own-x</small></p>
</body>
</html>"""
    
    # 创建目录和文件
    os.makedirs(os.path.join(root_dir, 'docs'), exist_ok=True)
    
    with open(os.path.join(root_dir, 'index.html'), 'w', encoding='utf-8') as f:
        f.write(index_html)
    
    with open(os.path.join(root_dir, 'docs', 'readme.txt'), 'w', encoding='utf-8') as f:
        f.write("This is a sample text file served by your web server!\n")
    
    print(f"✅ Sample files created in: {root_dir}")


if __name__ == '__main__':
    import argparse
    
    parser = argparse.ArgumentParser(description='Simple Web Server')
    parser.add_argument('--port', '-p', type=int, default=8080, help='Port to listen on')
    parser.add_argument('--root', '-r', default='./www', help='Root directory to serve')
    parser.add_argument('--create-samples', '-c', action='store_true', help='Create sample files')
    
    args = parser.parse_args()
    
    # 创建示例文件
    if args.create_samples or not os.path.exists(args.root):
        create_sample_files(args.root)
    
    # 启动服务器
    server = SimpleWebServer(port=args.port, root_dir=args.root)
    server.start()

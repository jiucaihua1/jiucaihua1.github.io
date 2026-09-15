---
author: jiucaihua1
pubDatetime: 2026-05-14T09:43:59+08:00
title: "概念"
slug: lamp与lnmp
featured: false
draft: false
tags:
  - 随笔
description: "在 LAMP 架构中，Web 服务器是 **Apache**。"
---
- **L (Linux):** 宿主操作系统。它提供底层的文件系统、网络协议栈以及进程调度环境（例如你在练习中常用的 Ubuntu 或 CentOS）。
 
- **M (MySQL):** 关系型数据库管理系统（RDBMS）。负责结构化数据的持久化存储、查询与事务处理。
 
- **P (PHP):** 服务端解释型脚本语言。负责接收请求参数、执行业务逻辑、执行 SQL 语句与数据库交互，并最终生成 HTML 或 JSON 等格式的响应数据。
### 0.1 LAMP 架构 (Linux + Apache + MySQL + PHP)

在 LAMP 架构中，Web 服务器是 **Apache**。

- **运行机制：** 传统 LAMP 架构通常采用模块化运行方式。Apache 会加载 `mod_php` 模块，这意味着 **PHP 解释器被直接嵌入到了 Apache 的工作进程中**。
 
- **请求处理：** 当客户端发送一个访问 `.php` 文件的 HTTP 请求时，Apache 进程接收到请求后，无需与其他服务通信，直接在当前进程内调用 PHP 解释器执行代码，然后将结果返回给客户端。
 
- **架构特点：** 耦合度高，PHP 的执行依赖于 Apache 的生命周期。配置相对简单，兼容性强。但由于 Apache 采用多进程/多线程模型，每个并发连接都需要占用独立的进程或线程资源，在高并发场景下内存开销较大。
### 0.2 LNMP 架构 (Linux + Nginx + MySQL + PHP)

在 LNMP 架构中，Web 服务器是 **Nginx**。

- **运行机制：** Nginx 采用的是异步非阻塞的事件驱动架构（基于 epoll），它自身**不具备解析 PHP 代码的能力**。在 LNMP 中，PHP 代码的执行交由独立的 **php-fpm** (FastCGI Process Manager，进程管理器) 来负责。
 
- **请求处理（动静分离）：**
 
 - 当接收到**静态资源请求**（如图片、JS、CSS）时，Nginx 利用其高效的 I/O 处理能力直接读取文件并返回。
 
 - 当接收到**动态资源请求**（如 `.php` 文件）时，Nginx 会扮演**反向代理**的角色。它将 HTTP 请求封装成 `FastCGI` 协议格式，通过网络套接字（Socket）或本地端口转发给后端的 `php-fpm` 进程池。`php-fpm` 执行完毕后，将结果返回给 Nginx，Nginx 再将 HTTP 响应发送给客户端。
 
- **架构特点：** 彻底的解耦。Nginx 只负责网络和高并发调度，PHP-FPM 专职处理逻辑计算。这种架构极大地提升了系统的并发承载能力，资源利用率更高，是目前企业级生产环境的主流标准。

### 0.3 总结
LAMP 是“内置模块解析”，适合追求稳定和配置简便的场景；LNMP 是“代理转发解析”，实现了动静分离和组件解耦，更适合高并发和高负载的网络环境
# 工作流程
### 0.1 LAMP
1、客户端发起请求

客户端发送 HTTP 请求到 web 服务器（运行 LAMP 架构）的 80 端口；

2、Linux 操作系统接受请求

服务器的 Linux 操作系统作为底层平台，负责网络协议（如 TCP/IP）的处理，将用户的 HTTP 请求转发给运行在系统上的 Apache Web 服务器（默认监听 80 端口，HTTPS 为 443 端口）。

3、**Apache Web 服务器处理请求**

Apache 作为 web 服务器，接收和处理 HTTP 请求，首先分析请求的资源类型：

- 静态资源（如HTML、CSS、JavaScript文件等）：Apache 会查找该资源并直接返回给客户端；
 
- 动态资源（如PHP文件）：Apache 加载并调用与 PHP 解析相关的模块（如 libphpX.so）来解析 PHP 代码；
 

4、PHP 解释器处理动态逻辑

Apache 将 .php 脚本文件的路径和请求参数传递给 PHP 解释器，PHP 开始执行脚本中的逻辑：
- 处理用户输入数据；
 
- 若需要操作数据（如查询、插入、更新），PHP 通过数据库扩展（如MySQLi、PDO）与 MySQL 数据库建立连接，发送 SQL 命令；
 
- MySQL 执行 SQL 命令，处理数据（如查询表中记录），并将结果返回给 PHP；
 
5、**PHP 生成动态响应内容**

PHP 接收 MySQL 返回的数据后，结合脚本逻辑（如条件判断、循环处理）生成动态 HTML 内容（也可能是 JSON、XML 等格式），并将结果返回给 Apache；

6、**Apache 返回响应给用户**

Apache 接收 PHP 生成的动态内容，将其封装为标准 HTTP 响应（包含响应头、响应体），通过 Linux 操作系统的网络协议栈返回给客户端。
### 0.2 LNMP
**1、客户端发起请求** _(与 LAMP 完全相同)_ 客户端发送 HTTP 请求到 web 服务器。

**2、Linux 操作系统接受请求** _(基本相同)_ Linux 操作系统接收请求并转发给监听端口的 Web 服务器。不同的是，这里监听 80/443 端口的是 **Nginx**。

**3、Nginx 处理请求（核心差异开始）** Nginx 接收到请求后，也会分析资源类型：

- **静态资源：** Nginx 凭借其异步非阻塞的特性，会极其高效地直接读取静态文件并返回给客户端。
 
- **动态资源（PHP文件）：** **这里与 Apache 完全不同。** Nginx 自身没有任何解析 PHP 的模块，它不会加载类似 `libphp.so` 的东西。相反，它会扮演一个“反向代理”的角色，将关于 `.php` 的请求打包，转换成 `FastCGI` 协议的数据格式，准备发送给别人处理。
 
**4、PHP-FPM 处理动态逻辑（独立服务登场）** 在 LNMP 中，PHP 不再是依附于 Web 服务器的模块，而是一个**完全独立运行的后台系统服务**，由 **PHP-FPM**（FastCGI 进程管理器）来管理。

- Nginx 通过本地 Socket 或 TCP 网络，将打包好的 FastCGI 数据发送给 PHP-FPM。
 
- PHP-FPM 接收到请求后，会唤醒旗下的一个空闲 PHP 工作进程（Worker）来执行你的 PHP 脚本。
 
- 后续 PHP 处理输入、连接 MySQL 数据库执行 SQL 命令等操作，就与你的描述完全一致了。
 
**5、PHP-FPM 返回动态响应内容** PHP 工作进程执行完毕生成 HTML/JSON 后，将数据交还给 PHP-FPM。PHP-FPM 顺着刚才与 Nginx 建立的通道，把数据传回给 **Nginx**。

**6、Nginx 返回响应给用户** Nginx 拿到 PHP-FPM 传回来的动态结果，将其封装为标准的 HTTP 响应报文，最后通过 Linux 网络协议栈返回给客户端。

## 1 总结

| **维度** | **LAMP ** | **LNMP** |
| ------------ | -------------------- | ------------------------- |
| **Web 服务器** | Apache | Nginx |
| **PHP 运行形态** | 寄生在 Apache 内部的**模块** | 独立运行的**系统服务** (`php-fpm`) |
| **两者通信方式** | 进程内部直接调用 | 基于网络的通信协议 (FastCGI) |
| **架构隐喻** | Apache 前店后厂全包了 | Nginx 是接单员，PHP-FPM 是中央厨房 |
简而言之，LAMP 是一体化的处理流程，而 LNMP 则是接力式的处理流程。正是因为这种把网络接入（Nginx）和逻辑运算（PHP-FPM）拆开的模式，才造就了 LNMP 极其优秀的抗并发能力。

# 部署实战
## 1 安装apache
`apt install apache2 -y`
![PixPin_2026-04-21_15-47-42.png](https://pics-1311301304.cos.ap-beijing.myqcloud.com/image_obsidian/20260421154749560.webp?imageSlim)
`dkpg -l apache2 | grep ii`
![PixPin_2026-04-21_15-48-25.png](https://pics-1311301304.cos.ap-beijing.myqcloud.com/image_obsidian/20260421154827583.webp?imageSlim)
查看启动状态
![PixPin_2026-04-21_16-07-18.png](https://pics-1311301304.cos.ap-beijing.myqcloud.com/image_obsidian/20260421160727991.webp?imageSlim)
查看监听端口
`lsof -i :80`
![PixPin_2026-04-21_16-29-31.png](https://pics-1311301304.cos.ap-beijing.myqcloud.com/image_obsidian/20260421162933507.webp?imageSlim)
查看管理工具
![PixPin_2026-04-21_16-32-12.png](https://pics-1311301304.cos.ap-beijing.myqcloud.com/image_obsidian/20260421163244906.webp?imageSlim)
## 2 配置解读
Apache2 的配置主要分为三部份，分别是全局配置，虚拟主机配置，模块配置，这些配置项分散在不同的目录和文件中，在主配置文件中以文件包含的形式引用它们。配置文件中每一行包含一个配置指令，并指定值，配置指令不区分大小写，**但值区分大小写**。以 # 开头的行是注释行，注释不能出现在指令的后边，空白行和指令前的空白字符将被忽略，因此可以采用缩进以保持配置层次的清晰。
```bash
apache2.conf      #主配置文件
conf-available/   #子配置文件目录
conf-enabled/     #生效的子配置文件，链接到 confavailable中
envvars           #全局环境变量配置文件
magic             #配合 mod_mime_magic 模块判断 MIME 类型的配置文件
mods-available/   #可用的模块配置文件
mods-enabled/     #生效的模块配置文件，链接到 modsavailable 中
ports.conf        #默认端口配置文件
sites-available/  #可用的虚拟主机配置文件
sites-enabled/    #生效的虚似主机配置文件，链接到 sitesavailable 中
```
![PixPin_2026-04-21_16-55-23.png](https://pics-1311301304.cos.ap-beijing.myqcloud.com/image_obsidian/20260421165534057.webp?imageSlim)
## 3 配置检测
![PixPin_2026-04-22_09-13-56.png](https://pics-1311301304.cos.ap-beijing.myqcloud.com/image_obsidian/20260422091424207.webp?imageSlim)
查看首页面
![PixPin_2026-04-22_09-16-41.png](https://pics-1311301304.cos.ap-beijing.myqcloud.com/image_obsidian/20260422091649509.webp?imageSlim)
## 4 安装php软件
### 4.1 模块形式
`apachectl -M | grep mpm`
![PixPin_2026-04-22_09-30-59.png](https://pics-1311301304.cos.ap-beijing.myqcloud.com/image_obsidian/20260422093105577.webp?imageSlim)
`apt-get update`
`apt install php -y`
检查安装之后的效果
![PixPin_2026-04-22_09-42-34.png](https://pics-1311301304.cos.ap-beijing.myqcloud.com/image_obsidian/20260422094236966.webp?imageSlim)
![PixPin_2026-04-22_09-44-23.png](https://pics-1311301304.cos.ap-beijing.myqcloud.com/image_obsidian/20260422094425534.webp?imageSlim)
### 4.2 软件形式
![PixPin_2026-04-22_09-44-43.png](https://pics-1311301304.cos.ap-beijing.myqcloud.com/image_obsidian/20260422094445203.webp?imageSlim)
## 5 Apache2配置php
rm -f /etc/apache2/sites-enabled/vhost.conf
ln -s /etc/apache2/sites-available/000-default.conf /etc/apache2/sites-enabled/
![PixPin_2026-04-22_09-47-50.png](https://pics-1311301304.cos.ap-beijing.myqcloud.com/image_obsidian/20260422094752505.webp?imageSlim)
设置首页
`echo '<?php phpinfo(); ?>' > /var/www/html/index.php
重启服务
`systemctl restart apache2
访问首页
![PixPin_2026-04-22_09-55-57.png](https://pics-1311301304.cos.ap-beijing.myqcloud.com/image_obsidian/20260422095604131.webp?imageSlim)
## 6 部署mysql
安装mysql-server软件包
`apt install -y mysql-server`
查看端口监听
![PixPin_2026-04-22_10-14-07.png](https://pics-1311301304.cos.ap-beijing.myqcloud.com/image_obsidian/20260422101409848.webp?imageSlim)
初始化mysql
`ALTER USER 'root'@'localhost' IDENTIFIED WITH mysql_native_password BY 'root';`
![PixPin_2026-04-22_10-23-44.png](https://pics-1311301304.cos.ap-beijing.myqcloud.com/image_obsidian/20260422102347246.webp?imageSlim)
## 7 安装php和mysql模块
`apt install php-fpm php-cli php-mysqlnd php-json php-gd php-xml php-mbstring php-zip`
![PixPin_2026-04-22_10-27-21.png](https://pics-1311301304.cos.ap-beijing.myqcloud.com/image_obsidian/20260422102724080.webp?imageSlim)
## 8 配置php与mysql连接
```sql
-- 创建数据库
DROP DATABASE IF EXISTS test_db;
CREATE DATABASE IF NOT EXISTS test_db;
-- 使用数据库
USE test_db;
-- 创建表：指定存储引擎（InnoDB 支持事务、外键，适合业务表）
-- 字段注释按需补充，增强可读性
CREATE TABLE IF NOT EXISTS users (
id INT UNSIGNED PRIMARY KEY AUTO_INCREMENT COMMENT '用户唯一ID，自增',
username VARCHAR(50) NOT NULL COMMENT '用户名，最长50字符',
email VARCHAR(100) NOT NULL UNIQUE COMMENT '用户邮箱，唯一约束',
password VARCHAR(255) NOT NULL COMMENT '密码，建议哈希存储',
created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '注册时间'
);
-- 插入数据：显式指定字段（单行格式 + 字符串转义）
INSERT INTO users (username, email, password) VALUES ('user1','user1@example.com', 'pass1');
INSERT INTO users (username, email, password) VALUES ('user2','user2@example.com', 'pass2');
INSERT INTO users (username, email, password) VALUES ('user3','user3@example.com', 'pass3');
```
![PixPin_2026-04-22_10-32-06.png](https://pics-1311301304.cos.ap-beijing.myqcloud.com/image_obsidian/20260422103208658.webp?imageSlim)
## 9 测试连接
```php
<?php 
// 数据库配置（关键：容器里不能用 localhost！） 
$host = '172.18.0.2'; // 容器内部IP 或直接写服务名 local-wp-db 
$dbname = 'test_db'; 
$username = 'root'; 
$password = 'root'; // 创建连接（使用英文逗号！） 
$mysqli = mysqli_connect($host, $username, $password, $dbname); 
// 检查连接 
if (!$mysqli) { die("连接失败：" . mysqli_connect_error()); } echo "恭喜！数据库连接成功！"; 
// 关闭连接 
mysqli_close($mysqli); 
?>
```
![PixPin_2026-04-22_10-46-17.png](https://pics-1311301304.cos.ap-beijing.myqcloud.com/image_obsidian/20260422104619720.webp?imageSlim)

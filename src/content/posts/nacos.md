---
author: jiucaihua1
pubDatetime: 2026-09-13T16:08:37+08:00
title: "Nacos配置管理"
slug: nacos
featured: false
draft: false
tags:
  - 运维
  - 服务治理
description: "Nacos配置管理"
---
## 1 简介
Nacos是阿里的一个开源产品，它是针对微服务架构中的服务发现、配置管理、服务治理的综合型解决方案。
### 1.1 配置
应用程序在启动和运行的时候往往需要读取一些配置信息，配置基本上伴随着应用程序的整个生命周期，比如：数据库连接参数、启动参数等。
配置主要有以下几个特点：
- 配置是独立于程序的只读变量
配置对于程序是只读的，程序通过读取配置来改变自己的行为，但是程序不应该去改变配置
- 配置伴随应用的整个生命周期
配置贯穿于应用的整个生命周期，应用在启动时通过读取配置来初始化，在运行时根据配置调整行为。比如：启动时需要读取服务的端口号、系统在运行过程中需要读取定时策略执行定时任务等。
- 配置可以有多种加载方式
常见的有程序内部hard code，配置文件，环境变量，启动参数，基于数据库等
- 配置需要治理
### 1.2 配置中心
![Pasted image 20260909091618](https://pics-1311301304.cos.ap-beijing.myqcloud.com/Pasted%20image%2020260909091618.png)
在微服务架构中，当系统从一个单体应用，被拆分成分布式系统上一个个服务节点后，配置文件也必须跟着迁移（分割），这样配置就分散了，不仅如此，分散中还包含着冗余。
配置中心将各服务的配置文件独立出来，
![Pasted image 20260909092036](https://pics-1311301304.cos.ap-beijing.myqcloud.com/Pasted%20image%2020260909092036.png)
### 1.3 Nacos简介
主流配置中心

| 对比项 | Spring Cloud Config | Apollo | Nacos |
| ---------------------- | ------------------------ | -------------------------------------- | --------------------------------- |
| **配置实时推送** | 支持（依赖 Spring Cloud Bus） | 支持（HTTP 长轮询，1s 内） | 支持（2.x 升级 gRPC 双向流，毫秒级） |
| **版本管理** | 支持（依赖 Git） | 支持（内置版本号） | 支持（内置版本管理 + 监听查询） |
| **配置回滚** | 支持（依赖 Git revert） | 支持（一键回滚） | 支持（一键回滚 + 2.5.0 起 Beta 灰度历史回看） |
| **灰度发布** | 支持（依赖 Bus） | 支持，业界最完善（按 IP/标签/规则） | 较弱（1.x 有 Beta 发布，2.5.0 才补灰度历史） |
| **权限管理** | 支持（依赖 Git 权限） | 支持，细粒度（Namespace/App/User/角色） | 2.x 起有内置认证 + RBAC，粒度比 Apollo 粗 |
| **多集群** | 支持 | 支持 | 支持 |
| **多环境** | 支持（依赖 Git 分支） | 支持（自带环境隔离） | 支持（Namespace + Group） |
| **服务发现** | 不包含 | 不包含 | 包含（注册中心 + 配置中心二合一） |
| **配置格式** | properties/yaml 等 | properties 为主 | 支持 properties/yaml/json/xml（最丰富） |
| **部署复杂度** | 中（需配 Git + Bus） | 重（Portal+Admin+Config Service，HA 9 节点） | 轻（HA 仅 3 节点 + MySQL） |
| **性能（单机读）**&#8203; | 依赖 Git 拉取 | ~9k TPS | ~15k TPS（最高） |
| **社区生态** | Spring Cloud 官方，迭代慢 | 携程开源，活跃度中等 | 阿里开源，Spring Cloud Alibaba 核心，迭代最快 |
| **现状（2026.09）**&#8203; | 2024.0 已 EOL（2025-12-31） | 仍活跃 | 2.5.0/3.0-Alpha 持续发布 |
### 1.4 Nacos特性
nacos主要提供四大功能
- 服务发现与服务健康检查
Nacos使服务更容易注册，并通过DNS或HTTP接口发现其他服务，Nacos还提供服务的实时健康检查，以防止向不健康的主机或服务实例发送请求。
- 动态配置管理
动态配置服务允许您在所有环境中以集中和动态的方式管理所有服务的配置。Nacos消除了在更新配置时重新部署应用程序，这使配置的更改更加高效和灵活。
- 动态dns服务
Nacos提供基于DNS协议的服务发现能力，旨在支持异构语言的服务发现，支持将注册在Nacos上的服务以域名的方式暴露端点，让三方应用方便的查阅及发现。
- 服务和元数据管理
Nacos能让您从微服务平台建设的视角管理数据中心的所有服务及元数据，包括管理服务的描述、生命周期、服务的静态依赖分析、服务的健康状态、服务的流量管理、路由及安全策略。
## 2 Nacos部署
选择在wsl中安装。
```bash
#下载jdk
sudo apt update
sudo apt install -y openjdk-17-jdk
#下载Nacos发行包
cd /opt
curl -LO https://github.com/alibaba/nacos/releases/download/2.5.1/nacos-server-2.5.1.tar.gz
tar -xzvf nacos-server-2.5.1.tar.gz
```
启动nacos
```bash
cd /opt/nacos/bin
# Linux 下用启动脚本
sh startup.sh -m standalone
#提示错误使用bash运行
bash startup.sh -m standalone
```
有时候使用sh会报错的原因

| 写法 | 含义 | 适用 |
| ------------- | ------------------------------- | ------------- |
| `sh xxx.sh` | 用系统默认 sh（Ubuntu=dash） | 只跑纯 POSIX 脚本 |
| `bash xxx.sh` | 明确用 Bash 跑 | 通用，推荐 |
| `./xxx.sh` | 依赖脚本第一行 `#!/bin/bash` 的 shebang | 需先 `chmod +x` |
访问nacos`http://localhost:8848/nacos`
![Pasted image 20260909095623](https://pics-1311301304.cos.ap-beijing.myqcloud.com/Pasted%20image%2020260909095623.png)
用命令测试
```bash
curl -X POST "http://localhost:8848/nacos/v1/cs/configs?dataId=nacos.cfg.dataId&group=test&content=HelloWorld"
```
![Pasted image 20260909100004](https://pics-1311301304.cos.ap-beijing.myqcloud.com/Pasted%20image%2020260909100004.png)
发布配置是正常的。
获取配置
```bash
curl -X GET "http://127.0.0.1:8848/nacos/v1/cs/configs?dataId=nacos.cfg.dataId&group=test"
```
![Pasted image 20260909104725](https://pics-1311301304.cos.ap-beijing.myqcloud.com/Pasted%20image%2020260909104725.png)
删除配置
```bash
# 删除（成功返回 true）
curl -X DELETE "http://127.0.0.1:8848/nacos/v1/cs/configs?dataId=nacos.cfg.dataId&group=test"
```
![Pasted image 20260909104852](https://pics-1311301304.cos.ap-beijing.myqcloud.com/Pasted%20image%2020260909104852.png)
### 2.1 数据存储
Nacos 自身默认用内置的 Derby 数据库做持久化（单机模式），但生产环境强烈建议改成外部 MySQL。

|存储方案|特点|适用场景|
|---|---|---|
|**内置 Derby**（默认）|Nacos 自己带的小型嵌入式数据库，零配置、开箱即用|✅ 学习、单机测试|
|**外部 MySQL**|Nacos 只把数据存到独立 MySQL 里，可备份、可共享|✅ 生产、集群、真实业务|

**关键原因**：集群模式下多个 Nacos 节点要**共享同一份配置数据**。如果每个节点都用自己的 Derby，数据各存各的、互相看不见，那就没法组成一个统一的注册/配置中心了。所以**外部 MySQL 是 Nacos 集群的刚需**。
### 2.2 创建mysql数据库并接入
```bash
# 建库（名字随意，这里用 nacos_config）
mysql -uroot -p -e "CREATE DATABASE nacos_config CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci;"

# 导入 Nacos 自带的建表脚本（关键！）
mysql -uroot -p nacos_config < /opt/nacos/conf/mysql-schema.sql

# 建用户（MySQL 8.0 默认认证 caching_sha2_password，不要写 mysql_native_password，会报 ERROR 1524）
mysql -uroot -p -e "
CREATE USER 'nacos'@'localhost' IDENTIFIED BY '123456';
GRANT ALL PRIVILEGES ON nacos_config.* TO 'nacos'@'localhost';
FLUSH PRIVILEGES;
"

# 用新账号验证能登录、能看到库
mysql -unacos -p123456 -e "SHOW DATABASES;"
# 看到 nacos_config 即成功

# Nacos 发行包自带的 SQL，负责建好 config_info/users 等所有表
mysql -unacos -p123456 nacos_config < /opt/nacos/conf/mysql-schema.sql

# 验证表是否建好
mysql -unacos -p123456 nacos_config -e "SHOW TABLES;"
# 应看到 config_info、users、roles、tenant_info 等

```
改配置文件
```bash
vi /opt/nacos/conf/application.properties
```
找到并确认这 6 行（去掉 `#` 注释，改对库名和账号）：
```properties
spring.datasource.platform=mysql
db.num=1
db.url.0=jdbc:mysql://127.0.0.1:3306/nacos_config?characterEncoding=utf8&connectTimeout=1000&socketTimeout=3000&autoReconnect=true&useUnicode=true&useSSL=false&serverTimezone=Asia/Shanghai
db.user.0=nacos
db.password.0=123456

```
重启Nacos
```bash
# 停掉旧的失败进程
pkill -f nacos
sleep 2

# 用 bash 启动（别用 sh——Ubuntu 的 sh 是 dash，不认脚本里的 ）
# -m standalone = 单机模式
bash /opt/nacos/bin/startup.sh -m standalone

# 等待启动完成后看日志
sleep 15
tail -n 30 /opt/nacos/logs/start.out

```
测试
```bash
# 发布配置（成功返回 true）
curl -X POST "http://127.0.0.1:8848/nacos/v1/cs/configs?dataId=nacos.cfg.dataId&group=test&content=HelloWorld"

# 读取配置（成功返回 HelloWorld）
curl "http://127.0.0.1:8848/nacos/v1/cs/configs?dataId=nacos.cfg.dataId&group=test"

# 删除配置（成功返回 true）
curl -X DELETE "http://127.0.0.1:8848/nacos/v1/cs/configs?dataId=nacos.cfg.dataId&group=test"

```

![Pasted image 20260909143740](https://pics-1311301304.cos.ap-beijing.myqcloud.com/Pasted%20image%2020260909143740.png)
### 2.3 快速配置入门
#### 2.3.1 发布配置
![Pasted image 20260909145554](https://pics-1311301304.cos.ap-beijing.myqcloud.com/Pasted%20image%2020260909145554.png)
Java获取配置 ---略
## 3 Nacos配置管理基础应用
![Pasted image 20260909151726](https://pics-1311301304.cos.ap-beijing.myqcloud.com/Pasted%20image%2020260909151726.png)

**配置集(Data ID)**
在系统中，一个配置文件通常就是一个配置集，一个配置集可以包含了系统的各种配置信息，例如，一个配置集可能包含了数据源、线程池、日志级別等配置项。每个配置集都可以定义一个有意义的名称，就是配置集的ID即Data ID.
**配置项**
配置集中包含的一个个配置内容就是配置项。它代表一个具体的可配置的参数与其值域，通常以key=value的形式存在。例如我们常配置系统的日志输出级别（IogLevel=INFO|WARN|ERROR）就是一个配置项。
**配置分组(Group)**
配置分组是对配置集进行分组通过一个有意义的字符串（如Buy或Trade）来表示，不同的配置分组下可以有相同的配置集（DataID）。当您在Nacos上创建一个配置时，如果未填写配置分组的名称，则配置分组的名称默认采用DEFAULT_GROUP。配置分组的常见场景：可用于区分不同的项目或应用，例如：学生管理系统的配置集可以定义一个group为：STUDENT_GROUP。
![Pasted image 20260909154038](https://pics-1311301304.cos.ap-beijing.myqcloud.com/Pasted%20image%2020260909154038.png)
### 3.1 命名空间管理
namespace的设计是nacos基于此做多环境以及多租户（多个用户共同使用nacos)数据(配置和服务)隔离的。
- 从一个租户(用户)的角度来看，如果有多套不同的环境，那么这个时候可以根据指定的环境来创建不同的namespce，以此来实现多环境的隔离。例如，你可能有开发，测试和生产三个不同的环境，那么使用一套nacos集群可以分别建以下三个不同的namespace。如下图所示：
![Pasted image 20260909154556](https://pics-1311301304.cos.ap-beijing.myqcloud.com/Pasted%20image%2020260909154556.png)
### 3.2 配置管理
图形化界面，学习方便，历史版本可以回滚修改
![Pasted image 20260909165409](https://pics-1311301304.cos.ap-beijing.myqcloud.com/Pasted%20image%2020260909165409.png)
## 4 分布式系统
### 4.1 单体架构
Web应用程序发展的早期，大部分web工程师将所有的功能模块打包到一起并放在一个web容器中运行，所有功能模块使用同一个数据库，同时，它还提供API或者UI访问的web模块等。
![Pasted image 20260910091423](https://pics-1311301304.cos.ap-beijing.myqcloud.com/Pasted%20image%2020260910091423.png)
单体架构有很多好处：
- 开发效率高：模块之间交互采用本地方法调用，并节省微服务之间的交互讨论时间与开发成本。
- 容易测试：IDE都是为开发单个应用设计的、容易测试—一在本地就可以启动完整的系统。
- 容易部署**：运维成本小，直接打包为一个完整的包，拷贝到web容器的某个目录下即可运行。
但是，上述的好处是有条件的，它适用于小型简单应用，对于大规模的复杂应用，就会展现出来以下的不
足：
- 复杂性逐渐变高，可维护性逐渐变差：所有业务模块部署在一起，复杂度越来越高，修改时牵一发动全身。
- 版本迭代速度逐渐变慢：修改一个地方就要将整个应用全部编译、部署、启动时间过长、回归测试周期过
长。
- 阻碍技术创新：若更新技术框架，除非你愿意将系统全部重写，无法实现部分技术更新。
- 无法按需伸缩：通过冗余部署完整应用的方式来实现水平扩展，无法针对某业务按需伸缩。
### 4.2 微服务架构
一个微服务一般完成某个特定的功能，比如订单服务、用户服务等等。每一个微服务都是完整应用，都有自己的业务逻辑和数据库。一些微服务还会发布API给其它微服务和应用客户端使用。
![Pasted image 20260910100137](https://pics-1311301304.cos.ap-beijing.myqcloud.com/Pasted%20image%2020260910100137.png)
### 4.3 分布式应用配置管理
![Pasted image 20260910102223](https://pics-1311301304.cos.ap-beijing.myqcloud.com/Pasted%20image%2020260910102223.png)
可拓展的配置:`[13-自定义扩展dataid_哔哩哔哩_bilibili](https://www.bilibili.com/video/BV1VJ411X7xX/?p=13)`
### 4.4 配置的优先级
![Pasted image 20260911093047](https://pics-1311301304.cos.ap-beijing.myqcloud.com/Pasted%20image%2020260911093047.png)

![Pasted image 20260911095841](https://pics-1311301304.cos.ap-beijing.myqcloud.com/Pasted%20image%2020260911095841.png)
### 4.5 集群部署
分为单机部署和多机部署
单机部署类似1.2 副本集架构目标
![Pasted image 20260913094602](https://pics-1311301304.cos.ap-beijing.myqcloud.com/Pasted%20image%2020260913094602.png)
真实生产环境中的配置
通过vip来进行抢占LVS+Keepalived+HAproxy

# Nacos服务发现
## 1 1简介
在微服务架构中，整个系统会按职责能力划分为多个服务】通过服务之间协作来实现业务目标。这样在我们的代码中免不了要进行服务间的远程调用，服务的消费方要调用服务的生产方，为了完成一次请求，消费方需要知道服务生产方的网络位置(IP地址和端口号)。
![Pasted image 20260913104324](https://pics-1311301304.cos.ap-beijing.myqcloud.com/Pasted%20image%2020260913104324.png)
service A理论上可以通过在配置文件中写入其他服务的地址和端口，但是实际情况下这样却有非常大的弊端，首先微服务架构是不断扩充的，不能每次更新新服务都去更新配置文件。
![Pasted image 20260913131051](https://pics-1311301304.cos.ap-beijing.myqcloud.com/Pasted%20image%2020260913131051.png)
解决办法就是创建一个额外的服务发展中心，记录所有的服务。
![Pasted image 20260913131125](https://pics-1311301304.cos.ap-beijing.myqcloud.com/Pasted%20image%2020260913131125.png)
### 1.1 Spring Cloud服务协作流程
SpringCloud常见的集成方式是使用Feign+Ribbon技术来完成服务间远程调用及负载均衡的。
![Pasted image 20260913131607](https://pics-1311301304.cos.ap-beijing.myqcloud.com/Pasted%20image%2020260913131607.png)
- Ribbon：Spring Cloud提供的负载均衡功能(**Ribbon 被移除**，官方替代品是 **Spring Cloud LoadBalancer（SCLB）**)
- Feign: Spring Cloud 提供的调用功能
在这里，Ribbon属于客户端负载均衡。
服务端负载均衡类似于nginx，由nginx储存相关信息，当客户端请求来到服务端，由nginx决定哪台服务器提供服务。
![Pasted image 20260913132330](https://pics-1311301304.cos.ap-beijing.myqcloud.com/Pasted%20image%2020260913132330.png)
F5是硬件级负载均衡，Nginx是第七层，应用层的负载均衡，LVS则是osi第四层的传输层的负载均衡2.1.2 负载均衡的分层模型（基于 OSI）

## 2 Nacos服务发现基础应用
![Pasted image 20260913134257](https://pics-1311301304.cos.ap-beijing.myqcloud.com/Pasted%20image%2020260913134257.png)
- 服务：提供给客户端的软件功能，通过预定义接口网络访问。
- 服务名：服务提供的标识，通过该标识可以唯一确定其指代的服务。
- 实例：提供一个或多个服务的具有可访问网络地址（IP:Port）的进程，启动一个服务，就产生了一个服务实例。元信息
- Nacos数据（如配置和服务）：描述信息，如服务版本、权重、容灾策略、负载均衡策略、鉴权配置、各种自定义标签(label)，从作用范围来看，分为服务级别的元信息、集群的元信息及实例的元信息。
## 3 Spring Cloud Alibaba 综合集成架构演示
前面说到，SpringCloud是一个较为全面的微服务框架集，集成了如服务注册发现、配置中心、消息总线、负载均衡、断路器、API网关等功能实现。而在网上经常会发现SpringCloud与阿里巴巴的Dubbo进行选择对比，这样做其实不是很妥当，前者是一套较为完整的架构方案，而Dubbo只是服务治理与RPC实现方案。
Dubbo在国内有着非常大的用户群体，但是其周边设施与组件相对来说并不那么完善。很多开发者用户又很希望享受SpringCloud的生态，因此也会有一些SpringCloud与Dubbo一起使用的案例与方法出现，但是一直以来大部分Spring Cloud整合Dubbe的使用方案都不完善。直到Spring Cloud Alibaba的出现，才得以解决这样的问题。
在此之前，我们已经学了如何使用Spring CloudAlibaba来集成Nacos与Spring Cloud应用，并且在此之下可以如传统的Spring Cloud应用一样地使用Ribbon或Feign来微服务之间的协作。由于Feign是基于HttpRestful的调用，在高并发下的性能不够理想，RPC方案能否切换为Dubbo？SpringCloud与阿里系的若干组件能否完美集成呢？
可以！
![Pasted image 20260913141707](https://pics-1311301304.cos.ap-beijing.myqcloud.com/Pasted%20image%2020260913141707.png)
### 3.1 总体结构
![Pasted image 20260913141039](https://pics-1311301304.cos.ap-beijing.myqcloud.com/Pasted%20image%2020260913141039.png)

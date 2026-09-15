---
author: jiucaihua1
pubDatetime: 2026-05-19T21:44:00+08:00
title: "Redis"
slug: redis
featured: false
draft: false
tags:
  - 运维
  - 数据库
description: "这部分是面试官必问、工作必用的核心技能。强烈建议结合 Docker Compose 在本地把这些集群亲自拉起来跑一遍，直接作为项目经验写进简历。"
---
## 1 简介
1.1 🌟 第一梯队：运维的核心饭碗（必须实操吃透）

这部分是面试官必问、工作必用的核心技能。强烈建议结合 Docker Compose 在本地把这些集群亲自拉起来跑一遍，直接作为项目经验写进简历。

- **P28 - P46（持久化与备份）**：RDB、AOF 及其混合模式。了解数据怎么落盘，宕机了怎么恢复。
 
- **P55 - P62（主从架构）**：一主多从的配置与复制流程。
 
- **P63 - P73（哨兵机制）**：Sentinel 的搭建、选举算法和自动故障转移（非常重要）。
 
- **P74 - P92（分片集群）**：Cluster 槽位分配、3主3从搭建、扩容与缩容实战（含金量极高）。
 
- **P142 - P144（内存打满与淘汰策略）**：OOM 故障排查和 8 种淘汰策略配置。
 
- **P165 - P177（IO多路复用底层机制）**：深入 Linux 内核的 `select`、`poll`、`epoll`。这部分和你扎实的 Linux 底层知识完美契合，搞懂后可以直接在面试中对面试官降维打击。
 

1.2 💡 第二梯队：常见排障与面试必考理论（看懂即可，方便对线）

日常处理监控告警和配合研发排查问题时，这些理论是必备的沟通语言。

- **P11 - P27（10大数据类型基础）**：不用全记住，重点知道有哪些类型，日常进去查数据会用就行。
 
- **P104 - P106（BigKey 排障）**：运维痛点，学习怎么发现和清理导致 CPU 飙升的大 Key。
 
- **P123 - P128（经典缓存三大问题）**：搞懂缓存预热、雪崩、穿透、击穿的原理。
 
- **P107 - P111（双写一致性）**：稍微了解一下 Canal 订阅 Binlog 的概念即可。
 

1.3 🚫 第三梯队：纯开发与源码研读（果断跳过，一秒都不看）

这些对运维毫无加分项，直接拖进度条跳过，把精力省下来练集群。

- **P93 - P99（SpringBoot 整合）**：纯 Java 代码配置，运维不需要写。
 
- **P129 - P141（分布式锁与 Redisson底层源码）**：如何用 Java 写锁逻辑，直接跳。
 
- **P145 - P164（C 语言底层结构源码分析）**：讲底层的 SDS、哈希表、跳表怎么用 C 语言写的，除非你想去开发 Redis 数据库本身，否则完全没必要看。

### 1.1 Redis是什么
**Remote Dictionary SerVer(远程字典服务)** 是完全开源的，使用ANSIC语言编写遵守BSD协议，是一个高性能的Key-Value数据库提供了丰富的数据结构，例如String、Hash、List、Set、SortedSet等等。数据是存在内存中的，同时Redis支持事务、持久化、LUA脚本、发布/订阅、缓存淘汰、流技术等多种功能特性提供了主从模式、RedisSentinel和RedisCluster集群架构方案。

### 1.2 主流功能介绍
#### 1.2.1 分布式缓存
在mysql前一层的工具。为了给mysql做缓冲。
NOSQL KV键值对数据，不是关系数据库
 ![PixPin_2026-05-14_13-18-41.png](https://pics-1311301304.cos.ap-beijing.myqcloud.com/image_obsidian/20260514131843730.webp?imageSlim)
 用户先去访问redis，如果缓冲可以命中，直接返回相关数据，不再去请求sql数据库了。

redis数据操作在内存，而mysql主要储存在磁盘。
redis在某些场景使用要明显优于mysql，例如计数器，排行榜。
两者并不是相互竞争的关系，而是互补。
#### 1.2.2 内存储存和持久化（RDB+AOF）
redis支持异步将内存中的数据集写到硬盘上，同时不影响继续服务
#### 1.2.3 高可用架构搭配
单机、主从、哨兵、集群
#### 1.2.4 缓存穿透、击穿、雪崩

#### 1.2.5 分布式锁
### 1.3 优势
相较于传统的sql数据库，redis存在以下优势。
 - 性能极高-Redis能读的速度是110000次/秒，写的速度是81000次/秒Redis数据类型丰富，不仅仅支持简单的key-value类型的数据，
- 同时还提供list，sět，zset，hash等数据结构的存储
- Redis支持数据的持久化，可以将内存中的数据保持在磁盘中，重启的时候可以再次加载进行使用
- Redis支持数据的备份，即master-slave模式的数据备份
 
### 1.4 redis迭代演化

截止2026年五月，redis已经更新到8.6.3

## 2 安装
### 2.1 手动编译安装
首先需要安装gcc
```bash
apt install gcc
#查看gcc版本与位数
gcc -V
getconf LONG_BIT
#下载github最新安装包 
wget https://download.redis.io/releases/redis-7.2.4.tar.gz
#解压
tar -xzvf redis-7.2.4.tar.gz 
cd redis-7.2.4
#编译
make && make install
#测试
make test
#备份配置文件
cp redis.conf  redis_backp.conf
#进入安装路径
cd /usr/local/bin
#配置内存
echo "vm.overcommit_memory = 1" >> /etc/sysctl.conf
sysctl -p
#启动服务
redis-server redis.conf
#连接服务
redis-cli -a 123456
Warning: Using a password with '-a' or '-u' option on the command line interface may not be safe.
127.0.0.1:6379> 

```

>Redis的默认端口是6379，是由手机键盘字母MERZ的位置决定的。MERZ在Antirez的朋友圈语言中是"愚蠢和傻B"的代名词，它源于意大利广告女郎AlessiaMerz在电视节目上说了一堆愚蠢的话，redis之父对她有"特殊"印象，就给她弄成端口号了

### 2.2 docker安装

```bash
docker pull redis
#下载配置文件
wget https://raw.githubusercontent.com/redis/redis/7.2/redis.conf
```

编写compose文件
```yaml
version: '3.8'
services:
  redis:
    image: redis:7.2.4
    container_name: my-redis
    restart: always
    ports:
      - "6379:6379"
    # 【修改点】干净利落，只读文件
    command: redis-server /opt/redis-env/redis.conf
    volumes:
      - ./redis.conf:/opt/redis-env/redis.conf
      - ./data:/data
    environment:
      - TZ=Asia/Shanghai
```
启动容器
```bash
docker compose up -d
#进入容器
docker exec -it 容器id redis-cli
```

### 2.3 redis配置
```yaml
# redis.conf 推荐配置，一些记录
#全局配置
requirepass 123456 #验证
appendonly yes #AOF持久化
daemonize yes #后端启动
protected-mode no #远程连接，正式环境需要关闭
#RDB持久化
save 3600 1      # 3600 秒内至少 1 次修改，写一次快照（适合业务写少场景）
save 300 100     # 300 秒内至少 100 次修改
save 60 10000    # 60 秒内至少 10000 次修改
stop-writes-on-bgsave-error yes  # 磁盘空间不足时禁止写入，防止数据不一致
rdbcompression yes                # 压缩 .rdb 文件（节省磁盘但消耗 CPU）
rdbchecksum yes                   # 校验和，防止文件损坏
#AOF持久化
appendonly #是否开启 aof appendonly yes
appendfilename #文件名称 appendfilename "appendonly.aof"
appendfsync #同步方式 everysec/always/no
no-appendfsync-on-rewriteauto-aof-rewrite #aof 重写期间是否同步 no-appendfsync-on-rewrite no
#AOF重写
auto-aof-rewrite- percentage 100 #根据上次重写后的aof大小，判断当前aof大小是不是增长了1倍
auto-aof-rewrite-min-size 64mb  #重写时满足的文件大小
#同时满足上方两个条件

```

## 3 十大类型

## 4 Redis持久化
**概念：** 将内存中的数据写入磁盘以获取持久化。
**RDB**
**AOF**
![PixPin_2026-05-14_15-51-41.png](https://pics-1311301304.cos.ap-beijing.myqcloud.com/image_obsidian/20260514155143122.webp?imageSlim)
### 4.1 RDB 
RDB持久性以指定的时间间隔执行数据集的时间点快照，把某一时刻的数据和状态以文件的形式写到磁盘上，也就是快照，这样即便机器宕机，快照文件也不会丢失，数据的可靠性也就得到了保证。
保存的是dump.rdb。
查看redis容器挂载到本地的dump.rdb文件。
![PixPin_2026-05-18_09-01-26.png](https://pics-1311301304.cos.ap-beijing.myqcloud.com/image_obsidian/20260518090252471.webp?imageSlim)
redis常用命令
```bash
config get/set 
```
![PixPin_2026-05-18_15-28-45.png](https://pics-1311301304.cos.ap-beijing.myqcloud.com/image_obsidian/20260518152913307.webp?imageSlim)
 对于RDB持久化来说，一定要做好备份文件的分机隔离，因为当redis宕机时，会立即产生一个.rdb文件。
#### 4.1.1 RDB 持久化触发时机

RDB 并不是“宕机时立即产生 .rdb”，而是**在满足以下任一条件时生成快照**：

- **手动执行** `save` 或 `bgsave` 命令（`bgsave` 是后台 fork 子进程，不阻塞主进程）
- **自动按配置规则**：例如 `save 900 1`（900 秒内至少 1 次修改）触发
- **关闭 Redis 服务时**（正常 shutdown）会执行一次 `save` 生成最新快照
- **主从全量复制时**，master 也会触发 `bgsave` 生成快照传给 slave
- 执行flushall/flushdb命令也会产生dump.rdb文件，但里面是空的，无意义

> 所以如果**宕机是突然断电**，最后一次快照之后的数据会丢失，损失范围取决于 `save` 配置的频率。

#### 4.1.2 为什么需要“分机隔离”？

**场景举例**：

- 生产环境中，`dump.rdb` 每次都是**同名覆盖写入**，一旦写入过程中磁盘故障或文件损坏，你可能丢失整份备份。
- 如果多个环境（开发/测试/生产）共用一个备份目录，误操作可能污染生产数据。

**推荐方案**：

- **定时增量/全量备份**：用 cron 或 rsync 将每天的 `dump.rdb` 按日期重命名复制到不同目录或远程存储，保留 N 天历史。
- **备份文件分类**：按环境（`dump-dev.rdb`、`dump-prod.rdb`）或用途（`dump-before-upgrade.rdb`）区分，避免覆盖。
- **异地容灾**：核心数据建议额外把 RDB 备份传到另一台服务器或对象存储（如 S3、COS）。

**备份隔离实践**：建议每天定时将 dump.rdb 复制为 `dump.$(date +%Y%m%d).rdb`，并保留最近 7 天文件。同时将备份文件存储到与 Redis 实例不同的磁盘或远程机器上（如 COS/S3）。如果同时开启了 AOF，可以以 RDB 作为全量快照、AOF 作为增量日志，实现 `全量 + 增量` 双重保障。
#### 4.1.3 RDB的优缺点
**优点**
 - RDB是Redis数据的一个非常紧凑的单文件时间点表示。RDB文件非常适合备份。例如，您可能希望在最近的24小时内每小时归档一次RDB文件，并在30天内每天保存一个RDB快照。这使您可以在发生灾难时轻松恢复不同版本的数据集。
- RDB非常适合灾难恢复，它是一个可以传输到远程数据中心或AmazonS3（可能已加密）的压缩文件。
- RDB最大限度地提高了Redis的性能，因为Redis父进程为了持久化而需要做的唯一工作就是派生一个将完成所有其余工作的子进程。父进程永远不会执行磁盘Ⅰ/O或类似操作。
- 与AOF相比，RDB允许使用大数据集更快地重启。
- 在副本上，RDB支持重启和故障转移后的部分重新同步。
**缺点**
- RDB在没有正确关闭的情况下停止工作，很大概率会导致最新数据的丢失。
- RDB需要经常fork()以便使用子进程在磁盘上持久化，如果数据集很大，fork()可能会很耗时，如果cpu性能较弱的情况下， Redis甚至出现几毫秒或者更高的停止服务。虽然AOF也需要fork()但平率较低。
#### 4.1.4 RDB优化参数
```bash
save <seconds> <changes>
dbfilename
dir
stop-writes-on-bgsave-error   #默认yes，如果配置成no，表示你不在乎数据不一致或者有其他的手段发现和控制这种不一致，那么在快照写入失败时，也能确保redis继续接受新的写请求
rdbcompression    #对于存储到磁盘中的快照，可以设置是否进行压缩存储。如果是的话，redis会采用LZF算法进行压缩。如果你不想消耗CPU来进行压缩的话，可以设置为关闭此功能
rdbchecksum #合法性校验，增大10%的性能消耗
rdb-del-sync-files #在没有持久性的情况下删除复制中使用的RDB文件启用。默认情况下no，些选项是禁用的。
```
![PixPin_2026-05-18_16-06-41.png](https://pics-1311301304.cos.ap-beijing.myqcloud.com/image_obsidian/20260518160644389.webp?imageSlim)
### 4.2 AOF持久化
**概念**以日志的形式来记录每个写操作，将Redis执行过的所有写指令记录下来(读操作不记录），只许追加文件但不以改写文件，redis启动之初会读取该文件重新构建数据，换言之，redis重启的话就根据日志文件的内容将写指令从前到后执行一次以完成数据的恢复工作。

默认情况下，redis是没有开启AOF(append only file)的。开启AOF功能需要设置配置：appendonly yes

AOF的保存文件是appendonly.aof

#### 4.2.1 工作流程
![PixPin_2026-05-18_16-17-38.png](https://pics-1311301304.cos.ap-beijing.myqcloud.com/image_obsidian/20260518161741594.webp?imageSlim)

Client作为命令的来源，会有多个源头以及源源不断的请求命令。
在这些命令到达RedisSerVer以后并不是直接写入AOF文件，会将其这些命令先放入AOF缓存中进行保存。这里的AOF缓冲区实际上是内存中的一片区域，存在的目的是当这些命令达到一定量以后再写入磁盘，避免频繁的磁盘IO操作。
AOF缓冲会根据AOF缓冲区同步文件的三种写回策略将命令写入磁盘上的AOF文件。
随着写入AOF内容的增加为避免文件膨胀，会根据规则进行命令的合并(又称AOF重写)，从而起到AOF文件压缩的目的。

**三种写回策略**
- **Always：** 同步写回，每个写命令执行完立刻同步地将日志写回磁盘
- **everysec：** 每秒写回，每个写命令执行完，只是先把日志写到AOF文件的内存缓冲区，每隔1秒把缓冲区中的内容写入磁盘。
- **no：** 操作系统控制的写回，每个写命令执行完，只是先把日志写到AOF文件的内存缓冲区，由操作系统决定何时将缓冲区内容写回磁盘

| 配置项 | 写回时机 | 优点 | 缺点 |
| -------- | --------- | ------------ | --------------- |
| Always | 同步写回 | 可靠性高，数据基本不丢失 | 每个写命令都要落盘，性能影响大 |
| Everysec | 每秒写回 | 性能适中 | 宕机时丢失1秒内数据 |
| No | 操作系统控制的写回 | 性能好 | 宕机时丢失数据多 |

#### 4.2.2 案例演示
Redis7具有一些新特性，革命化变化。
![PixPin_2026-05-18_16-36-44.png](https://pics-1311301304.cos.ap-beijing.myqcloud.com/image_obsidian/20260518163645874.webp?imageSlim)
**正常恢复**
1. **正常启动** Redis，确认数据和持久化文件正常，重启后数据也可正确加载。
2. **模拟故障**：写入一些测试数据，备份文件。然后执行 `FLUSHDB` 清空数据库，再执行 `SHUTDOWN`。此时 Redis 会生成新的 `dump.rdb` 和 `appendonly.aof` 文件，但这两个文件记录的是清空后的状态（即空数据）。
3. **备份当前空状态的 AOF 文件**（例如命名为 `aof.bak`），然后**删除**当前的 `dump.rdb` 和 `appendonly.aof`。
4. **尝试恢复**：重启 Redis，由于持久化文件已被删除，Redis 会以空数据启动（相当于再次清空）。
5. **使用备份恢复**：停止服务器，拿出之前第一次备份的 `aof.bak`，然后将修改后的文件放回原位置（重命名为 `appendonly.aof`）。
6. **重新启动 Redis**，此时由于 AOF 中不含 `FLUSHDB`，Redis 重新执行命令恢复数据，结果成功恢复到了 `FLUSHDB` 之前的状态。
**异常恢复** 
故意乱写正常的AOF文件，模拟网络闪断文件写error
重启Redis 之后就会进行AOF文件的载入，发现启动都不行，异常修复命令：`redis-check-aof--fix` 进行修复。
#### 4.2.3 AOF优缺点
**优点**
- 使用AOFRedis更加持久：您可以有不同的fsync策略：根本不fsync、每秒fsync、每次查询时fsync。使用每秒fsync的默认策略，写入性能仍然很棒。fsync是使用后台线程执行的，当没有fsync正在进行时，主线程将努力执行写入，因此您只能丢失一秒钟的写入。
- AOF日志是一个仅附加日志，因此不会出现寻道问题，也不会在断电时出现损坏问题。即使由于某种原因（磁盘已满或其他原因）日志以写一半的命令结尾，redis-check-aof工具也能够轻松修复它。
- 当AOF变得太大时，Redis能够在后台自动重写AOF。重写是完全安全的，因为当Redis继续附加到日文件时，会使用创建当前数据集所需的最少操作集生成一个全新的文件，一旦第二个文件准备就绪，Redis就会切换两者并开始附加到新的那一个。
- AOF以易于理解和解析的格式依次包含所有操作的日志。您甚至可以轻松导出AOF文件。例如，即使您不小V心使用该FLUSHALL命令刷新了所有内容，只要在此期间没有执行日志重写，您仍然可以通过停止服务器、删除最新命令并重新启动Redis来保存您的数据集。
**缺点**
- AOF文件通常比相同数据集的等效RDB文件大。
- 根据确切的fsync策略，AOF可能比RDB慢。一般来说，将fsync设置为每秒性能仍然非常高，并且在禁用fsync的情况下，即使在高负载下它也应该与RDB一样快。即使在巨大的写入负载的情况下，RDB仍然能够提供关于最大延迟的更多保证。
#### 4.2.4 AOF重写机制
由于AOF持久化是Redis不断将写命令记录到AOF文件中，随着Redis不断的进行，AOF的文件会越来越大，文件越大，占用服务器内存越大以及AOF恢复要求时间越长。
为了解决这个问题，Redis新增了重写机制，当AOF文件的大小超过所设定的峰值时，Redis就会自动启动AOF文件的内容压缩，只保留可以恢复数据的最小指令集或者可以手动使用命令bgrewriteaof来重写。
触发条件见配置文件2.3 redis配置
**重写原理**
1：在重写开始前，redis会创建一个“重写子进程”，这个子进程会读取现有的AOF文件，并将其包含的指令进行分析压缩并写入到一个临时文件中。
2：与此同时，主进程会将新接收到的写指令一边累积到内存缓冲区中，一边继续写入到原有的AOF文件中，这样做是保证原有的AOF文件的可用性，避免在重写过程中出现意外。
3：当“重写子进程”完成重写工作后，它会给父进程发一个信号，父进程收到信号后就会将内存中缓存的写指令追加到新AOF文件中
4：当追加结束后，redis就会用新AOF文件来代替旧AOF文件，之后再有新的写指令，就都会追加到新的AOF文件中
5：重写aof文件的操作，并没有读取旧的aof文件，而是将整个内存中的数据库内容用命令的方式重写了一个新的aof文件，这点和快照有点类似
 
![PixPin_2026-05-18_17-21-43.png](https://pics-1311301304.cos.ap-beijing.myqcloud.com/image_obsidian/20260518172146018.webp?imageSlim)

![PixPin_2026-05-18_17-26-01.png](https://pics-1311301304.cos.ap-beijing.myqcloud.com/image_obsidian/20260518172604557.webp?imageSlim)

![PixPin_2026-05-18_17-24-52.png](https://pics-1311301304.cos.ap-beijing.myqcloud.com/image_obsidian/20260518172454173.webp?imageSlim)

>也就是说AOF文件重写并不是对原文件进行重新整理，而是直接读取服务器现有的键值对，然后用一条命令去代替之前记录这个键值对的多条命令，生成一个新的文件后去替换原来的AOF文件。
AOF文件重写触发机制：通过redis.conf配置文件中的auto-aof-rewrite-percentage：默认值为100，以及auto-aof-rewrite-min-size：64mb配置，也就是说默认Redis会记录上次重写时的AOF大小，默认配置是当AOF文件大小是上次rewrite后大小的一倍且文件大于64M时触发。 

### 4.3 AOF与RDB混合持久化

|对比维度|纯 RDB|纯 AOF|混合持久化|
|---|---|---|---|
|恢复速度|极快|慢（大量命令重放）|快（RDB 部分快速加载）|
|数据丢失|丢失上次快照后的所有数据|最多丢失 1 秒（everysec）|最多丢失 1 秒（同 AOF）|
|文件体积|小|通常更大|介于两者之间，重写后较小|
|可读性|二进制|纯文本，可手动编辑|头部二进制不可读，尾部日志可读|

1. **触发 AOF 重写**（自动或 `bgrewriteaof` 手动触发）。
2. 子进程将当前内存数据**序列化为 RDB 格式**，写入新 AOF 文件头部。
3. 重写期间的新写入命令，由父进程缓存在内存缓冲区。
4. 子进程完成后，父进程将缓冲区中的增量命令以 **AOF 格式**追加到文件尾部。
5. 原子替换旧 AOF 文件

混合持久化**兼顾了 RDB 的快速恢复与 AOF 的低数据丢失**，是生产环境推荐配置。
混合持久化让你的 Redis 既拥有 RDB 的“冷启动速度”，又享受 AOF 的“准实时恢复”能力。搭配合理的备份策略，能在大多数宕机场景下将数据损失控制在秒级，且恢复时间降至最低。
## 5 复制（replica）
就是主从复制，master以写为主，Slave以读为主，当master数据变化的时候，自动将新的数据异步同步到其它slave数据库。
**功能**
- 读写分离，主机负责写，从机负责读
- 容灾恢复
- 数据备份
- 水平扩容高并发
```bash
#基本操作命令

info replication #可以查看复制节点的主从关系
replicaof<主库IP> <主库端口> #一般写进redis.conf 文件中
slaveof <主库IP> <主库端口>
slaveof no one #使当前数据库成为单独的主数据库
```
### 5.1 案例演示
准备两台虚拟机，ip地址如下

| redis-master | redis-back |
| -------------- | -------------- |
| 192.168.88.140 | 192.168.88.141 |

 master如果配置了reguirepass参数，需要密码登陆那么slave就要配置masterauth来设置校验密码，否则的话master会拒绝slave的访问请求。
```yaml
#配置文件
4.指定端口
5.指定当前工作目录，dir 
6. pid文件名字,pidfile
7.log文件名字,logfile
8.requirepass 
9.dump.rdb名字
10.aof文件,appendfilename
11.从机访问主机的通行密码masterauth，必须从机需要配置，主机不用
```

主机启动redis
![PixPin_2026-05-19_10-03-01.png](https://pics-1311301304.cos.ap-beijing.myqcloud.com/image_obsidian/20260519100313882.webp?imageSlim)
从机启动redis
![PixPin_2026-05-19_10-03-31.png](https://pics-1311301304.cos.ap-beijing.myqcloud.com/image_obsidian/20260519100338418.webp?imageSlim)
主机设置一个测试值
![PixPin_2026-05-19_10-26-18.png](https://pics-1311301304.cos.ap-beijing.myqcloud.com/image_obsidian/20260519102620471.webp?imageSlim)
从机成功同步
![PixPin_2026-05-19_10-26-49.png](https://pics-1311301304.cos.ap-beijing.myqcloud.com/image_obsidian/20260519102658576.webp?imageSlim)
从机尝试写入，发现没有写入权 限。
![PixPin_2026-05-19_10-57-08.png](https://pics-1311301304.cos.ap-beijing.myqcloud.com/image_obsidian/20260519105717487.webp?imageSlim)

### 5.2 核心机制
Redis 主从复制的最核心机制：**全量同步（Full Resynchronization）**与**命令传播（Command Propagation）**。 

**主机 shutdown 后，从机会上位吗？**
答案：绝对不会。

- **原理解析：** 纯粹的主从复制（只配置了 `replicaof`）是非常“死脑筋”的。主机挂了之后，从机会一直处于“原地待命”状态。如果你看从机的日志，它会疯狂报错 `Connection refused`，不断尝试重连主机。同时，从机默认是只读的，所以整个架构将无法处理新的写入请求。
 
- **运维进阶：** 要想实现“主机挂了，从机自动上位当主机”，你需要引入另外一个 Redis 组件——**哨兵机制（Sentinel）**，或者直接使用 **Redis Cluster（集群模式）**。它们会有专门的“监控员”发现主机死了，然后举行“选举”，把某个从机提拔为主机。
-
**主机 shutdown 后，重启后主从关系还在吗？从机还能否顺利复制？**

答案：关系还在，能顺利复制（但有一个极其危险的配置）。

- **原理解析：** 只要你的配置文件（`redis.conf`）还在，主从的契约就在。主机重启后，从机会自动重连上去，发现主机回来了，就会继续跟着同步。如果是命令行方式配置的话，关系不会回来了。
 
- **🚨 运维坑（致命警告）：** 如果你的**主机没有配置任何持久化（没开 AOF，也没开 RDB）**，它重启后内存里是一个**空库**。 此时从机连上来，请求同步。主机会生成一个**空的 RDB 文件**扔给从机。从机一收到，会毫不犹豫地**清空自己的内存**来加载这个空文件。 **结果：** 主机重启，导致从机里的存货也被瞬间洗白，数据彻底灰飞烟灭！所以，**主节点必须开启持久化**，这是铁律。

**某台从机 down 后，master 继续，从机重启后它能跟上大部队吗？**

答案：能跟上。并且会根据断开的时间长短，采取两种不同的策略。

- **情况 A（断联一小会）：增量复制 (PSYNC)** 如果从机只是网络抖动闪断了一下，或者重启得非常快。主机的“复制积压缓冲区（repl_backlog_buffer）”里还保留着它错过的那几条指令。从机一连上说：我上次同步到偏移量 1000 了”。主机一看，缓冲区里 1000 以后的数据还在，直接以**增量**的形式补发给它。速度极快，开销极小。
 
- **情况 B（断联时间过长）：全量复制 (一锅端)** 如果从机 down 了很久，主机一直在处理新业务，那个固定大小的“复制积压缓冲区”早就被新的写命令循环覆盖掉了。从机连上来说：“我同步到 1000 了”。主机一看，最早的记录都已经是 50000 了。没办法，重新执行一次 **BGSAVE**，打一个完整的 RDB 镜像发给从机。这就是**全量复制**。
### 5.3 级联复制
**“主 -> 从 -> 从” (A -> B -> C)** 的链式或树状复制结构。
假设有一个 Master（主机），下面挂了 10 个 Slave（从机）。 当这 10 个从机同时连上来请求同步时，主机需要疯狂地 `fork` 子进程去生成 10 份 RDB 快照，并占用巨大的网络带宽同时发送给 10 个从机。这会导致主机 CPU 和网卡瞬间被打满，也就是可怕的“复制风暴”。

为了给主机减负，Redis 允许一个从机（Slave）同时扮演另外几个从机的“伪主机”。

- A (总机) -> B (一级从机) -> C (二级从机)
 
- A 只需要把数据传给 B。
 
- B 收到数据后，不仅自己写进内存，还顺手把这份数据作为“火种”，继续传递给 C。
 
- 在这个过程中，B 的身份既是 A 的从机，又是 C 的主机。

### 5.4 SLAVEOF NO ONE（反客为主）
当主机挂掉后，运维人员（或者自动化的哨兵程序）可以登录到那台一直报错的从机（Slave）内部，敲下这个命令：`SLAVEOF NO ONE`。
- 它立刻停止尝试连接那个死掉的主机，不再做无用的网络重试。
 
- 它的身份瞬间从只读的从机（Slave）变成了可以读写的主机（Master）。
 
- 此时，其他剩下的从机就可以通过 `replicaof <它的IP>` 命令，重新确认他为主机。
### 5.5 总结 
**工作流程**
- slave启动，全部同步
- 首次连接，全量复制
- 心跳持续，保持通信
- 进入平稳，增量复制
- 从机下线，重连续传
**存在的问题**
1. 负载延时，信号衰减
2. 主机宕机，从机不会自动选举新主机，需要人工操作 解决办法6 哨兵
## 6 哨兵（sentinel）
### 6.1 简介
解决主从复制时，不会自动选举新主机的问题。（高可用能力）
吹哨人巡查监控后台master主机是否故障，如果故障了根据投票数自动将某一个从库转换为新主库，继续对外服务。
**哨兵的作用**
- 监控redis运行状态，包括master与slave
- 当master宕机，能自动将slave切换成新master
为了防止哨兵服务器宕机，哨兵也需要集群部署。

### 6.2 案例演示

```yaml
port 26379

# 关闭保护模式，允许宿主机和其他机器访问
protected-mode no

# 哨兵运行时的临时数据存放目录
dir /tmp

# 【核心雷达】告诉哨兵：去盯住 192.168.88.140 这个主机！
# mymaster 是你给集群起的名字，1 代表只要有1个哨兵觉得它死了，就立刻执行切换，因为配置能力有限，无法模拟真实的投票机制
sentinel monitor mymaster 192.168.88.140 6379 1

# 告诉哨兵：连接 140 主机需要的密码是 123456
sentinel auth-pass mymaster 123456

# 心跳检测：如果主机 5000 毫秒（5秒）不回话，就判定它主观下线
sentinel down-after-milliseconds mymaster 5000

# 故障转移的超时时间（15秒内如果没完成切换，就认为这次救援失败）
sentinel failover-timeout mymaster 15000
~                                                
```

`sentinel monitor mymaster <ip port> quorum`
quorum :确认下线的最少哨兵数量。
所以需要部署哨兵集群，网络是不可靠的，有时候一个sentinel会因为网络堵塞而误以为一个masterredis已经死掉了，在sentinel集群环境下需要多个sentinel互相沟通来确认某个master是否真的死了，quorum这个参数是进行客观

docker配置文件
```yaml
services:
  sentinel:
    image: redis:7.2.4
    container_name: my-sentinel
    restart: always
    ports:
      - "26379:26379"
    # 注意这里：命令变了！是用 redis-sentinel 启动，并指向容器内的配置文件
    command: redis-sentinel /opt/redis-env/sentinel.conf
    volumes:
      # 把宿主机刚刚手写的配置，挂载进容器内部
      - ./sentinel.conf:/opt/redis-env/sentinel.conf
```

启动docker，查看日志`docker logs -f my-sentinel`

![PixPin_2026-05-19_14-54-15.png](https://pics-1311301304.cos.ap-beijing.myqcloud.com/image_obsidian/20260519145421842.webp?imageSlim)

看到最后两列代表三台机器都正常。
关闭master

![PixPin_2026-05-19_15-01-12.png](https://pics-1311301304.cos.ap-beijing.myqcloud.com/image_obsidian/20260519150124490.webp?imageSlim)
这里其实是先选举一个哨兵，然后由被选举的哨兵在继续选择新的redis服务器作为master。
![PixPin_2026-05-19_16-28-17.png](https://pics-1311301304.cos.ap-beijing.myqcloud.com/image_obsidian/20260519162819330.webp?imageSlim)

启动master 
![PixPin_2026-05-19_15-03-50.png](https://pics-1311301304.cos.ap-beijing.myqcloud.com/image_obsidian/20260519150350921.webp?imageSlim)

即使旧master重新上线，哨兵也不会将他切回主master，在lvs中这个概念是抢占式模式与非抢占式模式
查看旧master的配置文件，发现被哨兵更改了。
![PixPin_2026-05-19_17-14-40.png](https://pics-1311301304.cos.ap-beijing.myqcloud.com/image_obsidian/20260519171447657.webp?imageSlim)

master突然下线时，会出现BRoken Pipe错误。
 **Broken Pipe：** 这个异常是客户端读取超时关闭了连接，这时候服务器端再向客户端已经断开的连接写数据时就发生了broken pipe异常！

### 6.3 哨兵运行流程以及选举原理
**原理：** 当一个主从配置中的master失效之后，sentinel可以选举出一个新的master用于自动接替原master的工作，主从置中的其他redis服务器自动指向新的master同步数据。一般建议sentinel采取奇数台，防止某台sentinel无法连接到master导致误切换
**运行流程**
- 三个哨兵监控一主二从，正常运行中
- SDown主观下线(Subjectively Down）
- ODown客观下线(Objectively Down)
- 选举出领导者哨兵（哨兵中选出兵王）
由兵王开始推动故障切换流程并选出一个新master

哨兵选举算法：**RAFT算法** ， 先到先得思想，A向B请求成为领导者，B之前未同意其他用户成为领导者，则会同意A成为领导者。
### 6.4 新master选举算法
master服务器选举算法：在健康的redis服务器集群中，选举算法如下。
![PixPin_2026-05-19_17-16-47.png](https://pics-1311301304.cos.ap-beijing.myqcloud.com/image_obsidian/20260519171719818.webp?imageSlim)

**优先级 (Priority)**

- **判断依据**：基于配置文件中的 `replica-priority`（或老版本的 `slave-priority`）参数值。
 
- **筛选规则**：选择数值最小的节点。若某节点该值为 0，则直接被排除在选举之外。
 
- **结果处理**：若存在唯一的最小值节点，则直接当选；若出现并列最小值，则这些并列的节点进入下一轮比较。
 

**2. 复制偏移量 (Replication Offset)**

- **判断依据**：基于从节点记录的 `master_repl_offset` 值，该值反映了从节点同步主节点数据的进度。
 
- **筛选规则**：选择偏移量最大的节点（即数据最新、丢失数据最少的节点）。
 
- **结果处理**：若存在唯一的最大值节点，则直接当选；若多个节点的偏移量完全一致，则进入最后一轮兜底比较。
 

**3. 运行 ID (Run ID)**

- **判断依据**：基于 Redis 进程每次启动时自动生成的 40 位十六进制随机字符串。
 
- **筛选规则**：按照字典序（Lexicographical order）进行比对，选择 Run ID 最小的从节点当选为新主节点。
 
- **结果处理**：由于 Run ID 具备全局唯一性，此步骤为硬性兜底策略，确保最终必然产生唯一的选举结果。

1. 执行slaveof noone命令让选出来的从节点成为新的主节点，并通过slaveof命令让其他节点成为其从节点
2. Sentinel leader会对选举出的新master执slaveof noone操作，将其提升为master节点
3. Sentinel leader向其它slave发送命令，让剩余的slave成为新的master节点的slave
![PixPin_2026-05-19_17-26-36.png](https://pics-1311301304.cos.ap-beijing.myqcloud.com/image_obsidian/20260519172643256.webp?imageSlim)

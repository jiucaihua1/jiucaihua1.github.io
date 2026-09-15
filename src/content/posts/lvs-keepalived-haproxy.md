---
author: jiucaihua1
pubDatetime: 2026-05-13T15:18:30+08:00
title: "LVS+Keepalived+HAproxy"
slug: lvs-keepalived-haproxy
featured: false
draft: false
tags:
  - 随笔
description: "在构建应对千万级甚至亿级日均 PV 的大型网站时，底层架构的演进是保障高可用和高性能的核心。针对高并发场景，业界标准解决方案主要围绕“横向扩容（Scale Out）”思想，并依托 LVS（Linux Virtual Server）构建高性能"
---
# 相关概念
 
## 1 简介

在构建应对千万级甚至亿级日均 PV 的大型网站时，底层架构的演进是保障高可用和高性能的核心。针对高并发场景，业界标准解决方案主要围绕“横向扩容（Scale Out）”思想，并依托 LVS（Linux Virtual Server）构建高性能的流量调度入口。

随着业务流量的增长，单台服务器的性能瓶颈（CPU、内存、网卡、磁盘 I/O）会迅速显现。扩展维度包括：
1. **纵向扩容（Scale Up）**：升级单机硬件，但存在物理上限和成本递增问题，且无法消除单点故障。
2. **横向扩容（Scale Out）**：增加服务器节点，通过负载均衡分发流量，是大型网站的首选。

## 2 集群

### 2.1 LB（Load Balancing，负载均衡）
- **目标**：提高服务的并发处理能力。
- 通过多台服务器共同承担流量，实现水平扩展。
- 常用软件方案：LVS、HAproxy、Nginx；硬件方案：F5 BIG-IP、Citrix NetScaler、A10、深信服等。

#### 2.1.1 负载均衡的核心目标
- 公平、高效地分发流量
- 提高系统并发能力（水平扩展）
- 消除单点故障（配合高可用）
- 提升用户体验（响应时间更短）

#### 2.1.2 负载均衡的分层模型（基于 OSI）

| OSI 层级 | 负载均衡方式 | 代表技术 | 特点 |
|----------|--------------|----------|------|
| 四层（传输层） | IP + Port 分发 | LVS NAT、HAproxy TCP 模式、F5 | 性能高，不解析应用层 |
| 七层（应用层） | 应用协议分发（HTTP/HTTPS） | HAproxy、Nginx、Traefik | 功能丰富，可基于 URL、Cookie 路由 |
| 二层（数据链路层） | MAC 地址修改 | LVS DR 模式 | 性能最高，响应不经过调度器 |
| 三层（网络层） | IP 隧道封装 | LVS TUN 模式 | 可跨网段部署 |

#### 2.1.3 负载均衡的方式

1. **重定向负载均衡**（HTTP 302） 
 - 原理：返回 302 响应，客户端重新访问指定服务器。 
 - 缺点：性能差，不推荐生产环境。

2. **DNS 负载均衡** 
 - 原理：同一域名绑定多个 IP；可结合地域智能解析。 
 - 缺点：缓存导致分发不均，无法主动健康检查。

3. **反向代理负载均衡** 
 - 代表：Nginx、HAproxy、Apache mod_proxy。 
 - 工作层次：七层（HTTP/HTTPS）或四层（TCP）。 
 - 优点：SSL 卸载、缓存、压缩、URL 重写。 
 - 缺点：所有流量经过代理，可能成为瓶颈。

4. **IP 负载均衡**（四层） 
 - 代表：LVS NAT 模式。 
 - 优点：性能较高，支持端口映射。 
 - 缺点：响应流量也经过调度器。

5. **数据链路层负载均衡**（二层） 
 - 代表：LVS DR 模式。 
 - 优点：性能极高，响应不经过调度器。 
 - 要求：后端服务器同网段，需配置 VIP 并抑制 ARP。

6. **F5 硬件负载均衡** 
 - 代表：F5 BIG-IP、Citrix NetScaler、A10、深信服。 
 - 优点：高性能、稳定、内置 DDoS 防护。 
 - 缺点：价格昂贵。

#### 2.1.4 负载均衡的层次

- **四层负载**：基于 IP + 端口分发，典型代表 LVS、F5。 
- **七层负载**：基于应用层协议（HTTP/HTTPS）分发，典型代表 HAproxy、Nginx。 
- **二层负载**：基于 MAC 地址，典型代表 LVS DR 模式。 
- **三层负载**：基于 IP 隧道，典型代表 LVS TUN 模式。

#### 2.1.5 软件 vs 硬件负载均衡对比

| 对比维度 | 软件负载均衡（LVS、HAproxy、Nginx） | 硬件负载均衡（F5、A10） |
|----------|--------------------------------------|--------------------------|
| 价格 | 免费或低成本 | 高昂（数十万起） |
| 性能 | 受服务器限制，可横向扩展 | 专用芯片，单机极高 |
| 灵活性 | 高，可定制 | 较低，受厂商限制 |
| 维护成本 | 需自行运维 | 厂家支持 |
| 适用规模 | 中小到大型 | 超大规模或高要求场景 |

### 2.2 HA（High Availability，高可用）
- **目标**：提高服务可用性，避免因宕机导致服务不可用。
- 常用软件：Keepalived（基于 VRRP 协议，提供 VIP 浮动和健康检查）。

#### 2.2.1 Keepalived 核心功能
- **VRRP**：实现主备切换，提供虚拟 IP（VIP）。
- **健康检查**：检测后端服务器或 LVS 调度器状态，故障时自动转移。
- **联动 LVS**：通过 `vrrp_instance` 和 `virtual_server` 配置，实现 LVS 高可用。

### 2.3 HPC（High Performance Computing，高性能计算）
- **目标**：处理海量数据或复杂计算任务。
- 代表技术：Hadoop、MPI 等。

## 3 负载均衡产品分类

### 3.1 软件负载均衡
- LVS
- HAproxy
- Nginx

### 3.2 硬件负载均衡
- F5 BIG-IP
- Citrix NetScaler
- A10
- 深信服

# LVS
## 1 LVS概述
linux Virtual Server ，linux虚拟服务器。
lvs工作在一台服务器上，本身并不提供服务，只是把特定请求转发给对应的提供服务的真正主机，从而实现集群环境中的负载均衡。
## 2 LVS工作模式

| 模式 | 原理 | 对应 OSI 层 | 优点 | 缺点 |
| ------------------ | ----------- | --------- | --------------- | ---------------- |
| NAT | 修改目标 IP/端口 | 传输层（四层） | 支持端口映射，无需修改后端网络 | 瓶颈在调度器 |
| DR（Direct Routing） | 修改目标 MAC 地址 | 数据链路层（二层） | 性能极高，响应不经过调度器 | 要求同网段，需配置 ARP 抑制 |
| TUN（IP Tunneling） | IP 封装 | 网络层（三层） | 可跨地域后端 | 配置复杂，开销高 |

## 3 NAT模式
优点：隔离内部环境，节约IP地址
缺点：当服务器过多时，lvs系统会成为瓶颈
### 3.1 实操
![PixPin_2026-05-09_12-05-38.png](https://pics-1311301304.cos.ap-beijing.myqcloud.com/image_obsidian/20260509120605432.webp?imageSlim)
设备上安装apache服务，作为区分，同时设置默认路由为lvs服务器的内部地址
![PixPin_2026-05-09_13-03-56.png](https://pics-1311301304.cos.ap-beijing.myqcloud.com/image_obsidian/20260509130359160.webp?imageSlim)

安装lvs
![PixPin_2026-05-09_13-14-14.png|477](https://pics-1311301304.cos.ap-beijing.myqcloud.com/image_obsidian/20260509131417698.webp?imageSlim)
临时打开路由转发功能
```bash
echo 1 > /proc/sys/net/ipv4/ip_forward
```
配置lvs
```bash

root@ubuntu:/etc/netplan# ipvsadm -A -t 192.168.88.135:80 -s rr
root@ubuntu:/etc/netplan# ipvsadm -a -t 192.168.88.135:80 -r 192.168.32.129:80 -m
root@ubuntu:/etc/netplan# ipvsadm -a -t 192.168.88.135:80 -r 192.168.32.130:80 -m

```

关闭防火墙
```bash
sudo iptables -F
sudo iptables -t nat -F
sudo iptables -P INPUT ACCEPT
sudo iptables -P FORWARD ACCEPT
sudo iptables -P OUTPUT ACCEPT
```

```bash
sudo sysctl -w net.ipv4.conf.all.rp_filter=0
sudo sysctl -w net.ipv4.conf.default.rp_filter=0
sudo sysctl -w net.ipv4.conf.ens33.rp_filter=0
sudo sysctl -w net.ipv4.conf.ens37.rp_filter=0
sudo sysctl -p
```

![PixPin_2026-05-09_14-01-11.png](https://pics-1311301304.cos.ap-beijing.myqcloud.com/image_obsidian/20260509140119011.webp?imageSlim)

## 4 DR直接路由模式
![PixPin_2026-05-11_14-52-31.png](https://pics-1311301304.cos.ap-beijing.myqcloud.com/image_obsidian/20260511145245088.webp?imageSlim)

用户请求时仍然通过lvs服务器，但是服务器返回数据时直接和用户通信，不经过lvs服务器。
服务器中都配置lvs的地址，lvs服务器通过mac地址负责选择响应服务器。
#### 4.1.1 实操
![PixPin_2026-05-11_16-28-31.png](https://pics-1311301304.cos.ap-beijing.myqcloud.com/image_obsidian/20260511162833111.webp?imageSlim)
不同于nat模式，dr模式中，每台服务器都必须拥有直接与客户端通信的能力，所以lvs服务器在真实环境中一般是独臂部署

lvs服务器配置
```bash
root@ubuntu:/etc/netplan# ip addr add 192.168.32.135/32 dev ens33
root@ubuntu:/etc/netplan# ipvsadm -C
root@ubuntu:/etc/netplan# ipvsadm -A -t 192.168.32.135:80 -s rr
root@ubuntu:/etc/netplan# ipvsadm -a -t 192.168.32.135:80 -r 192.168.32.129:80 -g
root@ubuntu:/etc/netplan# ipvsadm -a -t 192.168.32.135:80 -r 192.168.32.130:80 -g
root@ubuntu:/etc/netplan# sudo ipvsadm -Ln
IP Virtual Server version 1.2.1 (size=4096)
Prot LocalAddress:Port Scheduler Flags
  -> RemoteAddress:Port           Forward Weight ActiveConn InActConn
TCP  192.168.32.135:80 rr
  -> 192.168.32.129:80            Route   1      0          0         
  -> 192.168.32.130:80            Route   1      0          0         
root@ubuntu:/etc/netplan# 
```

后端服务器配置
```bash
#目的是让后端服务器“闭嘴”，收到寻找 `135` 这个 VIP 的 ARP 广播时不要举手回答
sudo sysctl -w net.ipv4.conf.all.arp_ignore=1
sudo sysctl -w net.ipv4.conf.lo.arp_ignore=1
sudo sysctl -w net.ipv4.conf.all.arp_announce=2
sudo sysctl -w net.ipv4.conf.lo.arp_announce=2
#绑定vip到本地回环网卡
sudo ip addr add 192.168.32.135/32 dev lo
#VIP 的子网掩码必须是 `32`，表示这是一个独立的 IP，不代表一个网段。
```

测试
![PixPin_2026-05-11_16-00-26.png](https://pics-1311301304.cos.ap-beijing.myqcloud.com/image_obsidian/20260511160033169.webp?imageSlim)
```bash
for i in {1..10}; do curl --connect-timeout 2 http://192.168.32.135; done
```
在lvs服务器上查看
![image.png](https://pics-1311301304.cos.ap-beijing.myqcloud.com/image_obsidian/20260511162256468.webp?imageSlim)
说明我们配置成功了。
## 5 TUN-IP隧道模式

## 6 FULL-NAT
可以解决lvs和RS跨vlan问题

## 7 模式对比

## 8 LVS算法
RR、轮询
WRR、加权轮询
DH 目标地址hash
Sh 源地址hash
动态调服方法
LC 最少连接
WLC 加权最少连接
LBLC 基于本地的最少连接
LBLCR大夫只的基于本地的最少连接

# Keepalived
## 1 简介

### 1.1 衡量标准 

### 1.2 自动切换/故障转移
当A服务器无法正常提供服务时，系统可以自动切换到其他服务，并且用户感知不到为其提供服务的对象已经更换。

### 1.3 自动检测
由主机上的软件通过冗余侦测线，经过复杂的监听程序，逻辑判断，来相互侦测对方运行的情况。
常用的方法是，集群各节点间通过心跳信息判断节点是否出现故障。
**脑裂**
当两个集群的心跳线断开时，本来为一个整体的HA系统，分裂为两个独立的个体，无法互相通信，两个个体像“裂脑人”一样，抢夺共享资源，竞争服务，会导致同时读写共享存储，导致死锁以及数据损坏。
**解决方法**
添加冗余的心跳线
启用磁盘锁
设置仲裁机制
裂脑的监控报警

## 2 工作原理
keepalied是以VRRp协议为实现基础的，即虚拟路由协议
将N台提供相同功能的服务器组成一个服务器组，这个组里面有一个master和多个backup，master上面有一个对外提供服务的vip，master会发**组播**，当backup收不到vrrp包时就认为master宕机了，这时就需要根据VRRP的优先级来选举一个backup当master。

组播是主机间一对多的通讯模式， 组播是一种允许一个或多个组播源发送同一报文到多个接收者的技术。
广播是主机间一对所有的通讯模式，设备会将报文发送到网络中的所有可能接收者。设备简单地将它收到的任何广播报文都复制并转发到除该报文到达的接口外的每个接口。广播处理流程简单，不用选择路径。
## 3 模块
分别是core、check和vrp。
Core模块为keepalived的核心，负责主进程的启动、维护以及全局配置文件的加载和解析。
check负责健康检查，包括常见的各种检查方式。
VIrp模块是来实现VRRP协议的。
## 4 实验1 keepalived
### 4.1 拓扑环境
![PixPin_2026-05-12_10-06-55.png](https://pics-1311301304.cos.ap-beijing.myqcloud.com/image_obsidian/20260512100709191.webp?imageSlim)

### 4.2 服务器配置
两台服务器都安装keepalived。
```bash
#安装keepalived
apt install -y keepalived
#进入工作目录
cd /etc/keepalived
#修改配置文件
vim keepalived.conf.sample
```

主节点配置内容
```bash 
! Configuration File for keepalived

global_defs {
   router_id LVS_MASTER_01  # 本节点标识，建议唯一
}

vrrp_instance VI_1 {
    state MASTER            # 初始状态设为MASTER
    interface ens33          # 监听VRRP通告和绑定VIP的网卡名，请根据实际情况修改
    virtual_router_id 51    # 虚拟路由ID，同一集群内主备节点必须相同（0-255）
    priority 100            # 优先级（1-254），主节点应高于备节点
    advert_int 1            # 通告间隔（秒）

    unicast_src_ip 192.168.88.137  # 本机的真实IP地址
    unicast_peer {
        192.168.88.138             # 对端备节点的真实IP地址
    }
    
    authentication {        # 认证配置，主备需一致
        auth_type PASS      # 认证类型
        auth_pass 1111      # 认证密码
    }

    virtual_ipaddress {
        192.168.88.200/24   # 定义的虚拟IP(VIP)，可多个
    }
}

```
备节点配置内容
```bash
! Configuration File for keepalived

global_defs {
   router_id LVS_BACKUP_01  # 备节点标识
}

vrrp_instance VI_1 {
    state BACKUP            # 初始状态设为BACKUP
    interface ens33
    virtual_router_id 51    # 必须与主节点相同
    priority 90             # 优先级低于主节点
    advert_int 1
    
    unicast_src_ip 192.168.88.138  # 本机的真实IP地址
    unicast_peer {
        192.168.88.137             # 对端备节点的真实IP地址
    }

    authentication {
        auth_type PASS
        auth_pass 1111      # 密码与主节点相同
    }

    virtual_ipaddress {
        192.168.88.200/24
    }
}

```
需要将配置文件重名为`keepalived.conf`
### 4.3 测试 
在主服务器上查看，发现虚拟ip绑定在主服务器上。
![PixPin_2026-05-12_09-57-11.png](https://pics-1311301304.cos.ap-beijing.myqcloud.com/image_obsidian/20260512095750772.webp?imageSlim)
访问虚拟ip
![PixPin_2026-05-12_09-58-04.png](https://pics-1311301304.cos.ap-beijing.myqcloud.com/image_obsidian/20260512095811443.webp?imageSlim)
关闭主服务器的keepalived服务模仿宕机，查看备服务器的ip
![PixPin_2026-05-12_09-59-24.png](https://pics-1311301304.cos.ap-beijing.myqcloud.com/image_obsidian/20260512095939005.webp?imageSlim)
再次访问
![PixPin_2026-05-12_09-59-48.png](https://pics-1311301304.cos.ap-beijing.myqcloud.com/image_obsidian/20260512095955348.webp?imageSlim)
重新启动主服务器的keepalived服务。
![PixPin_2026-05-12_10-02-09.png](https://pics-1311301304.cos.ap-beijing.myqcloud.com/image_obsidian/20260512100212618.webp?imageSlim)
发现又换回主服务器了，是因为当前使用的是抢占式服务
### 4.4 非抢占模式
默认情况下，Keepalived工作在**抢占模式**。这意味着当原Master节点恢复后，它会重新抢占VIP，夺回Master身份。在某些场景下，我们可能希望故障恢复后的节点作为新的备份，以避免服务因再次切换而波动。这时可以配置**非抢占模式**。

在`vrrp_instance`配置段中添加：

```bash
nopreempt  # 启用非抢占模式
```

需要注意的是，在非抢占模式下，初始状态`state`建议都设置为`BACKUP`。

>因为keepalived工作在网络层，他并不关心应用层服务的是否正常，所以需要添加额外脚本来检查应用层的服务。

配置文件中加入
```bash
vrrp_script ** { # ** 代表脚本名称
script "" #脚本路径
interval 2 #间隔2s执行脚本
weight -5
#fall 3
#}
track_script {
 ** #脚本名称，脚本需要加入可执行权限
}
```

## 5 实验2LVS+keepalived

### 5.1 拓扑环境
![PixPin_2026-05-12_11-46-30.png](https://pics-1311301304.cos.ap-beijing.myqcloud.com/image_obsidian/20260512114633772.webp?imageSlim)

### 5.2 服务器配置
主lvs配置
```bash
! Configuration File for keepalived

global_defs {
   router_id LVS_MASTER_01
}

vrrp_instance VI_1 {
    state MASTER
    interface ens33
    virtual_router_id 51
    priority 100
    advert_int 1

    unicast_src_ip 192.168.88.136
    unicast_peer {
        192.168.88.135
    }

    authentication {
        auth_type PASS
        auth_pass 1111
    }

    virtual_ipaddress {
        192.168.88.200/24
    }
}

virtual_server 192.168.88.200 80 {
    delay_loop 3
    lb_algo rr
    lb_kind DR
    protocol TCP

    real_server 192.168.88.137 80 {
        weight 1
        TCP_CHECK {
            connect_timeout 3
        }
    }

    real_server 192.168.88.138 80 {
        weight 1
        TCP_CHECK {
            connect_timeout 3
        }
    }
}

```
备lvs配置
```bash
! Configuration File for keepalived

global_defs {
   router_id LVS_BACKUP_01  # 备节点标识
}

vrrp_instance VI_1 {
    state BACKUP            # 初始状态设为BACKUP
    interface ens33
    virtual_router_id 51    # 必须与主节点相同
    priority 90             # 优先级低于主节点
    advert_int 1
    
    unicast_src_ip 192.168.88.135  # 本机的真实IP地址
    unicast_peer {
        192.168.88.136            # 对端备节点的真实IP地址
    }

    authentication {
        auth_type PASS
        auth_pass 1111      # 密码与主节点相同
    }

    virtual_ipaddress {
        192.168.88.200/24
    }
    
}
		    #lvs
    virtual-server 192.168.88.200 {
			delay_loop 3
			lb_algo rr
			lb_kind DR
			protocol TCP
			real_server 192.168.88.137:80{
			weight 1
			TCP_CHECK {
				connect_timeout 3}
}
			reak_server 192.168.88.138:80{
			weight 1
			TCP_CHECK{
				connect_timeout 3}
}
}

```
后端服务器配置
首先需要把上个实验开启的keepalived服务停止，

```bash
#arp抑制
# 1. 将抑制规则追加到 sysctl.conf 文件末尾
sudo tee -a /etc/sysctl.conf << 'EOF'

# LVS-DR ARP Suppression
net.ipv4.conf.all.arp_ignore=1
net.ipv4.conf.lo.arp_ignore=1
net.ipv4.conf.all.arp_announce=2
net.ipv4.conf.lo.arp_announce=2
EOF

# 2. 强制刷新内核参数，让刚才写入的规则立刻生效
sudo sysctl -p

# 1. 防御性操作：把可能绑错在物理网卡(ens33)上的 VIP 强行删掉
sudo ip addr del 192.168.88.200/32 dev ens33 2>/dev/null
sudo ip addr del 192.168.88.200/24 dev ens33 2>/dev/null

# 2. 防御性操作：把 lo 上的旧 VIP 也先删掉
sudo ip addr del 192.168.88.200/32 dev lo 2>/dev/null

# 3. 终极正确操作：把 VIP 重新绑在 lo 网卡上（掩码必须是 32！）
sudo ip addr add 192.168.88.200/32 dev lo

```

测试
```bash
for i in {1..10}; do curl http://192.168.88.200; sleep 1; done
```
根据客户端的输出也可以看出每次提供服务的机器不同。
![PixPin_2026-05-12_11-37-48.png](https://pics-1311301304.cos.ap-beijing.myqcloud.com/image_obsidian/20260512113801184.webp?imageSlim)
在当前的主lvs服务器上查看，发现轮询成功
![PixPin_2026-05-12_11-37-05.png](https://pics-1311301304.cos.ap-beijing.myqcloud.com/image_obsidian/20260512113710366.webp?imageSlim)
现在停止主服务器的keepalived服务，看到备lvs服务接管了虚拟ip
![PixPin_2026-05-12_11-39-09.png](https://pics-1311301304.cos.ap-beijing.myqcloud.com/image_obsidian/20260512113911525.webp?imageSlim)
客户端继续测试
![PixPin_2026-05-12_11-40-04.png](https://pics-1311301304.cos.ap-beijing.myqcloud.com/image_obsidian/20260512114014458.webp?imageSlim)
发现也可以正常工作。
让主lvs重新上线，由于我们配置的是抢占式，可以看到主lvs重新接管了虚拟ip
![PixPin_2026-05-12_11-40-48.png](https://pics-1311301304.cos.ap-beijing.myqcloud.com/image_obsidian/20260512114144944.webp?imageSlim)
# Haproxy
## 1 简介
工作在应用层的负载均衡。
4层负载均衡将网络流量负载，平衡到多个服务器的最简单方法，是使用第4层（传输层）负载平衡。以这种方式进行负载均衡将根据IP范围和端口转发用户流量。

## 2 实验

### 2.1 拓扑环境
![PixPin_2026-05-12_15-53-40.png](https://pics-1311301304.cos.ap-beijing.myqcloud.com/image_obsidian/20260512155346216.webp?imageSlim)

### 2.2 HAproxy配置

```bash
apt update
apt install haproxy -y
```
安装完成后，修改配置文件
```bash
vim /etc/haproxy/haproxy.cfg
```

```bash
# ---------------------------------------------------------------------
# 全局配置 (Global settings)
# ---------------------------------------------------------------------
global
    log /dev/log local0
    log /dev/log local1 notice
    chroot /var/lib/haproxy
    stats socket /run/haproxy/admin.sock mode 660 level admin expose-fd listeners
    stats timeout 30s
    user haproxy
    group haproxy
    daemon

# ---------------------------------------------------------------------
# 默认配置 (Default settings)
# ---------------------------------------------------------------------
defaults
    log     global
    mode    http                # ⚠️ 关键：工作在七层（HTTP模式），而不是 LVS 的四层
    option  httplog             # 记录丰富的 HTTP 请求日志
    option  dontlognull         # 不记录空连接
    timeout connect 5000ms      # 连接后端服务器超时时间
    timeout client  50000ms     # 客户端等待超时时间
    timeout server  50000ms     # 后端服务器响应超时时间

# ---------------------------------------------------------------------
# 前端配置 (Frontend) - 接收客户端请求
# ---------------------------------------------------------------------
frontend http_front
    bind *:80                   # 监听本机所有 IP 的 80 端口
    default_backend web_servers # 把请求全部扔给下面定义的 web_servers 后端池

# ---------------------------------------------------------------------
# 后端配置 (Backend) 
# ---------------------------------------------------------------------
backend web_servers
    balance roundrobin          # 负载均衡算法：轮询 (一人一次)
    # option httpchk GET /      # 可选：更高级的七层健康检查，请求根目录看状态码
    # 你的两台真实后端服务器
    # check 代表开启健康检查，如果挂了会自动剔除
    server web1 192.168.88.141:80 check 
    server web2 192.168.88.139:80 check 

# ---------------------------------------------------------------------
#HAProxy 可视化监控面板
# ---------------------------------------------------------------------
listen stats
    bind *:8404                 # 监控面板的端口
    stats enable                # 开启监控
    stats uri /stats            # 监控面板的访问路径
    stats refresh 10s           # 页面每 10 秒自动刷新一次
    stats hide-version          # 隐藏 HAProxy 版本号（安全习惯）
    stats auth admin:123456     # 登录账号和密码 (你可以自行修改)

```

```bash
#语法检查命令
sudo haproxy -c -f /etc/haproxy/haproxy.cfg
#重启服务
sudo systemctl restart haproxy
#设置开机自启
sudo systemctl enable haproxy
```

```bash
#查看监听端口
sudo ss -tlnp | grep haproxy
```
查看

### 2.3 测试
![PixPin_2026-05-12_16-05-04.png](https://pics-1311301304.cos.ap-beijing.myqcloud.com/image_obsidian/20260512160513540.webp?imageSlim)
![PixPin_2026-05-12_16-05-23.png](https://pics-1311301304.cos.ap-beijing.myqcloud.com/image_obsidian/20260512160525096.webp?imageSlim)
访问`192.168.88.136:8404/stats`
![PixPin_2026-05-12_16-07-05.png](https://pics-1311301304.cos.ap-beijing.myqcloud.com/image_obsidian/20260512160709900.webp?imageSlim)
## 3 haproxy代理mysql
haproxy可以通过 **TCP协议** 来代理MySQL。
>待补充。。。
# Haproxy与nginx、LVS对比
Haproxy不仅可以做网页的负载均衡，更为重要的是，Haproxy可以对一些sql数据库、redis缓存做负载均衡，尽管nginx也能实现这些功能，但是表现大不如Haproxy

| **对比维度** | **Nginx | **HAProxy ** | **LVS (高速收费站)** |
| -------------- | -------------------------- | ------------------------ | -------------------- |
| **核心定位** | Web 服务器 + 7 层反向代理 | 纯粹的 4/7 层负载均衡器 | 纯粹的 4 层网络转发 (内核级) |
| **OSI 工作层级** | 主要 7 层 (HTTP/HTTPS)，兼顾 4 层 | 4 层 (TCP) 和 7 层 (HTTP) | 仅 4 层 (TCP/UDP) |
| **处理性能/并发** | 极高 (数万到十万级并发) | 极高 (十万级并发) | **最强** (百万级并发，抗洪峰首选) |
| **静态资源托管** | **支持且极强** (可直接返回 HTML/图片) | ❌ 不支持 (完全不管网页内容) | ❌ 不支持 |
| **缓存能力** | **强大** (支持边缘缓存加速) | ❌ 不支持 | ❌ 不支持 |
| **URL 正则路由** | **极其灵活** (根据路径、头部精准分发) | 支持，但规则编写相对繁琐 | ❌ 不支持 (只看端口不看路径) |
| **数据库/TCP 代理** | 支持 (Stream 模块)，但健康检查偏弱 | **行业标杆** (原生支持高级心跳检测) | 支持，但缺乏连接会话管理 |
| **过载保护(排队)** | 默认直接拒绝连接 (返回 502/504) | **强大** (将超量请求放入队列缓冲) | ❌ 无此机制 |
| **监控面板** | 需付费版或第三方模块支持 | **自带完美可视化大屏 (Stats)** | 需敲命令行或依赖 Keepalived |
| **会话保持** | 基于 IP Hash 或 Cookie | 基于 IP Hash、Cookie、甚至请求参数 | 基于 IP Hash |

标准的三层防御阵型是：
1. 最外层：**LVS** 扛下百万级别的连接冲锋，纯做 4 层报文分发。
2. 中间层：**HAProxy** 接管流量，处理 SSL 解密，并利用排队机制吸收瞬时洪峰。
3. 业务层：**Nginx** 拆解 HTTP 细节，执行正则路由，拦下所有静态请求，最后将核心动态请求精准喂给后端应用。
nginx

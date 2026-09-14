---
author: jiucaihua1
pubDatetime: 2026-09-03T17:44:26+08:00
title: "Ansible 详细介绍"
slug: ansible
featured: false
draft: false
tags:
  - 运维
  - linux进阶
description: "Ansible 是一款开源的 IT 自动化工具，主要用于配置管理、应用部署、任务编排和多节点编排。它由 Michael DeHaan 于 2012 年创建，2015 年被 Red Hat 收购。 与其他自动化工具（如 Puppet、Chef"
---
## 1 什么是 Ansible？

Ansible 是一款开源的 IT 自动化工具，主要用于配置管理、应用部署、任务编排和多节点编排。它由 Michael DeHaan 于 2012 年创建，2015 年被 Red Hat 收购。 
与其他自动化工具（如 Puppet、Chef、SaltStack）相比，Ansible 最大的特点是**无代理（Agentless）**——它通过 SSH（Linux/Unix）或 WinRM（Windows）远程执行任务，无需在目标节点上安装任何额外软件。

- **官网**：[https://www.ansible.com](https://www.ansible.com) 
- **源码**：[https://github.com/ansible/ansible](https://github.com/ansible/ansible)

---

## 2 核心特性

- **无代理架构**：仅需 SSH 或 WinRM 即可管理节点，控制节点需要安装 Ansible，**被控节点无需安装任何client/agents**。
- **易读易写**：使用 YAML 语言编写 Playbook，语法接近自然语言。
- **幂等性**：多次执行相同操作不会产生额外副作用（如多次安装软件包只会安装一次）。
- **模块化设计**：功能通过模块实现，目前官方模块数量超过 3000 个。
- **扩展性强**：支持自定义模块和插件。
- **编排能力**：支持任务并行执行、滚动更新、蓝图（playbook）复用等。
- **管理方便** ：拥有Web管理界面和rest api平台。

---

## 3 架构与核心概念
![](https://pics-1311301304.cos.ap-beijing.myqcloud.com/20260902083340131.png)

### 3.1 控制节点（Control Node）
安装了 Ansible 的机器，用于执行管理命令和 Playbook。可以是个人笔记本，也可以是专用服务器。 
支持系统：Linux（推荐）、macOS、WSL；Windows 下可通过虚拟机或 WSL 运行。

### 3.2 被控节点（Managed Nodes）
被 Ansible 管理的服务器或设备。无需安装代理，只需开放 SSH（Linux/Unix）或 WinRM（Windows），并保证 Python 环境（通常 Linux 默认已安装）。

### 3.3 清单（Inventory）
定义被控节点的列表，可以按组划分。支持静态文件（INI 或 YAML 格式）或动态清单（从云平台、CMDB 获取）。

#### 3.3.1 静态清单示例（INI 格式）
```ini
[webservers]
web1.example.com
web2.example.com

[dbservers]
db1.example.com ansible_user=admin
db2.example.com ansible_host=192.168.1.50
```

#### 3.3.2 动态清单
- 插件：`aws_ec2`、`gcp_compute`、`azure_rm` 等
- 自定义脚本返回 JSON 格式的清单数据

### 3.4 模块（Modules）
Ansible 执行的原子操作单元，分为核心模块和自定义模块。

常用模块示例：
- `command` / `shell`：执行命令
- `copy`：复制文件到远程节点
- `template`：使用 Jinja2 模板生成文件
- `yum` / `apt` / `package`：软件包管理
- `service` / `systemd`：服务管理
- `user` / `group`：用户和组管理
- `file`：文件和目录属性管理
- `git` / `pip` / `docker` 等具备特定功能

### 3.5 任务（Tasks）
调用模块并赋予参数的一次操作。Playbook 中最基本的执行单位。

```yaml
- name: 安装 Nginx
  ansible.builtin.apt:
    name: nginx
    state: present
```

### 3.6 Playbook
由一组有序任务组成的 YAML 文件，描述了一台或多台主机要达到的目标状态。 
Playbook 可以包含多个 Play，每个 Play 作用于一组主机，并执行一系列任务。

```yaml
---
- name: Web 服务器配置
  hosts: webservers
  become: yes
  vars:
    http_port: 80
  tasks:
    - name: 安装 Nginx
      ansible.builtin.apt:
        name: nginx
        state: latest

    - name: 启动 Nginx 服务
      ansible.builtin.service:
        name: nginx
        state: started
        enabled: yes
```

### 3.7 角色（Roles）
用于组织和复用 Playbook 的目录结构，包含变量、任务、模板、文件、处理器等。 
一个标准的角色目录结构如下：
```
roles/
└── nginx/
    ├── tasks/
    │   └── main.yml
    ├── handlers/
    │   └── main.yml
    ├── templates/
    │   └── nginx.conf.j2
    ├── files/
    ├── vars/
    │   └── main.yml
    ├── defaults/
    │   └── main.yml
    └── meta/
        └── main.yml
```

### 3.8 变量（Variables）
用于动态化配置，支持多层次定义：
- Playbook 中 `vars` / `vars_files`
- 主机变量和组变量（host_vars / group_vars）
- 命令行 `-e` 额外变量
- 角色 defaults 和 vars
- 从事实（Facts）自动收集

### 3.9 Facts
Ansible 自动收集的目标主机信息（如操作系统、IP 地址、硬件配置）。 
可通过 `gather_facts: yes`（默认开启）获取，并像普通变量一样使用：
```
{{ ansible_facts['distribution'] }}
```

### 3.10 处理器（Handlers）
类似任务，但仅在收到通知时执行，通常用于重启服务等操作（确保只在配置变更时执行）。
```yaml
tasks:
  - name: 更新 Nginx 配置
    ansible.builtin.template:
      src: nginx.conf.j2
      dest: /etc/nginx/nginx.conf
    notify: 重启 nginx

handlers:
  - name: 重启 nginx
    ansible.builtin.service:
      name: nginx
      state: restarted
```

---

## 4 Ad-Hoc 命令

用于执行一次性任务，无需编写 Playbook。常用于快速检查或排错。

**语法**：
```bash
ansible <pattern> -m <module> -a "<arguments>" [options]
```

**示例**：
```bash
# Ping 所有节点
ansible all -m ping

# 查看所有主机的 uptime
ansible all -a "uptime"

# 在 webservers 组安装 vim
ansible webservers -m package -a "name=vim state=present" -b
```

---

## 5 常用工具与组件

| 工具 | 用途 |
|------|------|
| `ansible` | 执行 Ad-Hoc 命令的主程序 |
| `ansible-playbook` | 执行 Playbook |
| `ansible-inventory` | 查看/验证清单 |
| `ansible-doc` | 查看模块文档（例如 `ansible-doc copy`） |
| `ansible-galaxy` | 管理角色和集合，从 Galaxy 下载 |
| `ansible-vault` | 加密/解密敏感文件 |
| `ansible-console` | 交互式 REPL 控制台 |
| `ansible-config` | 查看和检查配置 |

---

## 6 工作流程

1. **编写清单**：定义管理的节点。
2. **编写 Playbook**：用 YAML 描述期望状态。
3. **执行**：控制节点通过 SSH/WinRM 连接节点，推送 Python 代码执行模块，完成后删除临时文件。
4. **返回结果**：每台主机的任务状态（ok / changed / failed / unreachable）汇总返回。

---

## 7 最佳实践

- **使用版本控制**：将 Inventory、Playbook、角色纳入 Git 管理。
- **使用 Roles 组织代码**：提高可读性和复用性。
- **变量分层管理**：defaults → group_vars → host_vars → 命令行 `-e`。
- **金丝雀/灰度发布**：通过 `serial` 或 `batch` 控制滚动更新批次。
- **先检查再执行**：使用 `--check` / `--diff` 模式模拟运行。
- **加密敏感数据**：使用 `ansible-vault` 保护密码、密钥。
- **保持幂等性**：尽量使用专用模块而非 `shell`/`command`。
- **使用标签（Tags）**：便于运行部分任务 `ansible-playbook --tags "install"`。

---

## 8 与其他工具对比

| 特性 | Ansible | Puppet | Chef | SaltStack |
|------|---------|--------|------|-----------|
| 架构 | 无代理，通过 SSH | 代理+主从（Agent-Server） | 代理+主从 | 代理（可选无代理） |
| 语言 | YAML | 自研 DSL | Ruby DSL | YAML + Jinja |
| 上手难度 | 低 | 中高 | 高 | 中 |
| 社区生态 | 强大，Ansible Galaxy | 强 | 强 | 较强 |
| 编排能力 | 原生支持 | 较弱 | 较弱 | 较强 |

---

## 9 适用场景

- **配置管理**：批量初始化服务器、统一环境配置。
- **应用部署**：一键部署 Web 应用、微服务等。
- **持续交付/部署（CI/CD）**：结合 Jenkins、GitLab CI 使用。
- **安全合规**：批量安全基线检查和修复。
- **云资源编排**：管理 AWS、Azure、GCP 等云资源。
- **网络设备管理**：支持 Cisco、Juniper、Arista 等网络模块。

---

## 10 学习路线推荐

1. **基础**：安装 Ansible → 配置 SSH 免密 → 编写静态 Inventory → 使用 Ad-Hoc 命令
2. **进阶**：掌握 YAML 语法 → 编写 Playbook → 学习常用模块 → 使用变量和 Facts
3. **高级**：定义 Roles → 使用模板 → 管理动态清单 → 优化性能（缓存 Facts 等）
4. **实战**：编写生产级部署 Playbook → 使用 Ansible Vault → 结合 CI/CD → 自定义模块开发

---
# Ansible部署
## 1 配置环境
服务器与客户端均为ubuntu系统
ansible服务器配置ip 192.168.122.139
客户机配置192.168.122.140，192.168.122.141
ansible服务器配置域名解析，ansible客户机无需配置，提前关闭防火墙。
设置dns解析（dns resolve）
![](https://pics-1311301304.cos.ap-beijing.myqcloud.com/20260902092012600.png)
修改完成后测试通信
![](https://pics-1311301304.cos.ap-beijing.myqcloud.com/20260902092056005.png)
## 2 服务端安装ansible
```bash
sudo apt update
sudo apt install ansible
```
安装完成后，输入命令验证
```bash
root@jch:/home/jch# ansible --version
ansible [core 2.16.3]
  config file = None
  configured module search path = ['/root/.ansible/plugins/modules', '/usr/share/ansible/plugins/modules']
  ansible python module location = /usr/lib/python3/dist-packages/ansible
  ansible collection location = /root/.ansible/collections:/usr/share/ansible/collections
  executable location = /usr/bin/ansible
  python version = 3.12.3 (main, Apr 10 2024, 05:33:47) [GCC 13.2.0] (/usr/bin/python3)
  jinja version = 3.1.2
  libyaml = True
root@jch:/home/jch# 

```
检测部署命令
```bash
dpkg -ql ansible #列出所有文件
dpkg -qc ansible #查看配置文件
ansible --help #查看帮助
ansible-doc -l #查看所有模块
ansible-doc -s apt #查看apt模块
```
## 3 配置远程连接（SSH）
在ansible服务器，即控制节点上生成shh私钥
```bash
ssh-keygen
```
![image.png](https://pics-1311301304.cos.ap-beijing.myqcloud.com/20260902105405218.png)
执行ssh-copy-id命令，在受控主机之间共享ssh密钥
```bash
ssh-copy-id host1
ssh-copy-id host2
```
![image.png](https://pics-1311301304.cos.ap-beijing.myqcloud.com/20260902110756886.png)
host2主机上也这样配置
![image.png](https://pics-1311301304.cos.ap-beijing.myqcloud.com/20260902135627450.png)
## 4 ansible基础
### 4.1 配置主机清单
```bash
vim /etc/ansible/hosts
```
之前我们配置过域名解析，所以直接使用名字即可（IP也可以）
### 4.2 测试连通性
测试连通性`ansible host1 -m ping`
![image.png](https://pics-1311301304.cos.ap-beijing.myqcloud.com/20260902141559413.png)
### 4.3 简洁输出
加入参数`-o`，如测试连通性命令
![image.png](https://pics-1311301304.cos.ap-beijing.myqcloud.com/20260902142507945.png)
适合多任务时使用
>ansible的ping命令并非经典的ping命令，他完全不使用icmp协议，探测的是ssh应用是否连通
>ICMP（传统ping命令）：处于网络层，仅仅验证两台主机路由是否可达
>Ansible（ping）：处于应用层，检查网络、ssh端口、ssh认证、远程、python等环境情况
>Ansible(wair_for/net_ping)：才是真正的传统ping命令

## 5 主机清单（Inventory）
修改主机文件`/etc/ansible/hosts`，将两个测试主机加入一组中
![Pasted image 20260902152006](/images/posts/ansible/Pasted image 20260902152006.png)
以测试连通性命令为例子，主机名可以直接写组名，会对组内所有主机都发送命令。
![Pasted image 20260902152036](/images/posts/ansible/Pasted image 20260902152036.png)
对于主机清单可以自定义用户和密码
![Pasted image 20260902152901](/images/posts/ansible/Pasted image 20260902152901.png)
主机清单也可以为了安全性，更改端口号，对于ansible服务端就需要在主机清单中加入自定义端口了，`ansible_port=''`
### 5.1 分组变量
为了区分主机分组以及分组的变量，在设置整个组的变量时，可以用如下的格式
`[组名称:vars]`

### 5.2 子分组
将不同的分组进行组合，如下图，将apache和nginx组成一个新的组。
![Pasted image 20260903105141](/images/posts/ansible/Pasted image 20260903105141.png)
### 5.3 自定义主机列表
host文件可以迁移，在不同设备上不用重复配置，如果全写入/etc/ansible/hosts也不方便管理。
`ansible -i hostlist `调用hostlist文件。
两者的底层本质完全一致，都是 Ansible 的 Inventory（主机清单）文件，语法规范、分组逻辑与变量支持毫无区别；唯一差异在于加载机制与存放位置——执行命令时不带 `-i` 参数默认读取全局的 `/etc/ansible/hosts`，而使用 `-i <文件名>` 参数则会显式指定读取当前路径下的自定义清单（如 `hostlist`）并覆盖默认路径，这种做法常用于多项目隔离、避免污染全局配置以及方便将清单随 Playbook 一同提交到 Git 进行版本管理。
## 6 AD-Hoc-点对点模式
临时的，在ansible是指需要快速执行的单条命令，且不需要保存的命令，对于复杂的密令则为playbook
### 6.1 shell模块

### 6.2 复制模块
```bash
ansible webtest -m copy -a 'src=/etc/hosts dest=/tmp/2,txt'
```
![Pasted image 20260903141120](/images/posts/ansible/Pasted image 20260903141120.png)
`backup ='yes'`参数若之前的目标文件已被修改，ansible在覆盖内容之前回将原文件重命名且备份。
### 6.3 用户模块
进行用户管理的方法。
```bash
ansible webtest -m user -a 'name=jiu state=present'
```
![Pasted image 20260903143415](/images/posts/ansible/Pasted image 20260903143415.png)
Ansible 修改用户密码必须传入**加密后的哈希密文**，直接传明文会导致登录失败；生成密文通常使用系统自带的 Python 命令 `python3 -c 'import crypt; print(crypt.crypt("明文密码", crypt.mksalt(crypt.METHOD_SHA512)))'`（或使用系统工具 `openssl passwd -6 "明文密码"`），输出形式通常为类似 `$6$salt$hash...` 的 SHA-512 格式字符串。
拿到加密字符串后，修改密码的 Ansible 命令如下：
```bash
ansible webtest -m user -a "name=jiu password='生成的密文'"
```
（该命令通过 `user` 模块的 `password` 参数接收密文，Ansible 会将其直接写入目标主机的 `/etc/shadow` 文件中完成密码更新）。
![Pasted image 20260903144329](/images/posts/ansible/Pasted image 20260903144329.png)
### 6.4 apt模块
`yum`（以及新版的 `dnf`）是 RedHat 系列（CentOS、RHEL、Rocky Linux）特有的包管理器，Ubuntu 系统底层根本没有 `yum` 命令，调用会报错。Ubuntu使用的是apt模块
如果不确定目标机器是 Ubuntu 还是 CentOS，可以使用 **`package` 模块**。它是一个通用胶水模块，会自动检测目标系统类型：在 Ubuntu 上自动调用 `apt`，在 CentOS 上自动调用 `yum`/`dnf`。
```bash
ansible webtest -m apt -a 'name=apache2 state=present update_cache=yes'
```
### 6.5 服务模块
```bash
ansible webtest -m service -a 'name=apache2 state=started'
#启动webtest上的apache服务
```
![Pasted image 20260903153836](/images/posts/ansible/Pasted image 20260903153836.png)
![Pasted image 20260903154115](/images/posts/ansible/Pasted image 20260903154115.png)
### 6.6 文件模块
```bash
ansible webtest -m file -a 'path=/tmp/88.txt mode=777 state=touch'#创建文件
ansible webtest -m file -a 'path=/tmp/88.txt mode=777 state=directory'#递归创建目录
```
### 6.7 收集模块
**定义**：用于自动化收集目标主机的软硬件环境及系统信息，输出格式为 JSON，数据称为 **Facts 变量**。
**基础命令与常用过滤（filter 支持通配符 `*`）**：
```Bash
ansible <组名> -m setup                                   # 采集全量信息
ansible <组名> -m setup -a 'filter=ansible_default_ipv4'  # 主网卡IP/网关/MAC
ansible <组名> -m setup -a 'filter=ansible_distribution*' # 发行版名/大版本号
ansible <组名> -m setup -a 'filter=ansible_memtotal_mb'   # 物理总内存(MB)
ansible <组名> -m setup -a 'filter=ansible_processor*'    # CPU型号/核心数/架构
```
**核心 Facts 变量速查**

|**变量名**|**说明**|**示例值**|
|---|---|---|
|`ansible_hostname`|主机名|`web01`|
|`ansible_distribution`|发行版系列|`Ubuntu` / `CentOS`|
|`ansible_distribution_major_version`|系统主版本|`24` / `7`|
|`ansible_default_ipv4.address`|默认 IPv4 地址|`192.168.1.100`|
|`ansible_memtotal_mb`|内存总量 (MB)|`4096`|
|`ansible_processor_vcpus`|CPU 逻辑核数|`4`|

**Playbook 应用技巧**：
- **条件分支**：通过 `when: ansible_distribution == "Ubuntu"` 判断调用 `apt` 或 `yum`。
- **禁用加速**：剧本若不依赖系统变量，首行添加 `gather_facts: no`，跳过探测大幅提升并发执行速度。

## 7 Shell模块
**shell 模块在能力上确实可以实现上面提到的所有功能**，因为它的底层原理就是把命令原封不动地扔给目标机的 `/bin/sh` 去跑——只要你在 Linux 终端里手动能敲出来的命令（如 `useradd`、`apt install`、`touch`、`systemctl`），shell 模块全都能执行。
**不推荐用 shell 替代专用模块的核心缺陷**：
- **缺乏天然幂等性**：专用模块仅在状态不符时做变更（未变返回绿色 `changed: false`），而 `shell` 只要退出码为 0 一律标为已修改（黄色 `changed: true`），难以追踪真实变更。
- **缺少跨平台抽象**：专用模块（如 `package`、`service`）底层自动兼容各发行版，`shell` 则高度依赖目标系统的具体命令（如区分 `apt`/`yum`），降低剧本通用性。
- **输出非结构化**：专用模块返回规范的 JSON 字典变量便于逻辑引用，`shell` 仅返回非结构化的文本标准输出（stdout），难以在后续任务中精确解析。
- **转义与注入隐患**：复杂命令涉及变量、管道符、特殊引号时极易因本地 Shell 提前解析出错，存在安全与语法解析风险。
**shell 模块的推荐应用场景**：
- 目标应用缺少 Ansible 官方专用模块支持（如私有运维脚本、自研 CLI 工具）。
- 必须依赖 Shell 原生特性的复杂操作（如多重管道 `|`、输出重定向 `>`/`>>`、通配符批处理）。
- 临时排查故障或执行一次性 Ad-hoc 探测命令。
```bash
ansible webtest -m shell -a 'hostname' -o
```
![Pasted image 20260903155917](/images/posts/ansible/Pasted image 20260903155917.png)
## 8 Playbook 
### 8.1 YAML 语言

YAML（YAML Ain't Markup Language）是一种人类易读的数据序列化格式，广泛用于配置文件。Ansible 的 Playbook、Inventory（YAML 格式）和变量文件都使用 YAML。

#### 8.1.1 基本语法

- 大小写敏感
- 使用空格缩进表示层级，**不能使用 Tab**
- 同一层级缩进必须一致
- 使用 `#` 注释
- 键值对写法：`key: value`，冒号后必须至少一个空格
- 文档开头可用 `---`，结尾可用 `...`，Ansible Playbook 通常以 `---` 开头

#### 8.1.2 标量类型

```yaml
name: "web01"      # 字符串
port: 8080          # 整数
ratio: 1.5          # 浮点数
is_active: true     # 布尔值
date: 2026-09-03
empty: null         # 空值，也可用 ~
```

字符串引号：
- 不带引号：简单字符串
- 单引号 `'...'`：保持原样，不转义
- 双引号 `"..."`：支持转义，如 `"\n"`

#### 8.1.3 对象/字典

```yaml
server:
  name: web01
  port: 8080
  enable_https: true
```

内联写法：

```yaml
server: {name: web01, port: 8080}
```

#### 8.1.4 列表/数组

```yaml
ports:
  - 80
  - 443
  - 8080
```

内联写法：

```yaml
ports: [80, 443, 8080]
```

#### 8.1.5 多行字符串

`|` 保留换行：

```yaml
description: |
  这是第一行
  这是第二行
```

`>` 折叠换行为空格：

```yaml
description: >
  这是前一段文字，
  仍属于同一段。
```

`|-` / `>-` 去掉末尾换行。

#### 8.1.6 锚点与合并

用于复用配置：

```yaml
http_defaults: &http_defaults
  timeout: 30
  retries: 3

server1:
  <<: *http_defaults
  host: 192.168.1.10
```

- `&` 定义锚点
- `*` 引用锚点
- `<<` 合并键

#### 8.1.7 YAML 与 JSON 对比

YAML 更易读，支持注释和锚点；JSON 更通用，几乎所有语言原生支持。YAML 可以视为 JSON 的超集，很多 JSON 也是合法 YAML。
### 8.2 Playbook应用yaml
 Playbook本质就是一个 `.yaml` 文件。它把一系列复杂、有先后依赖的任务打包成一个剧本，一键自动化跑完：
- 一个 Playbook 文件可以包含多个 Play
- Play 以 `hosts:` 开头，任务列表用 `- name:` 开始
- 模块参数与 name 同级再缩进
- 严格要求空格对齐，不能混用 Tab
- `:`后要加空格，`-`后也必须加空格
- 变量使用 `{{ variable }}`
- YAML 中 `yes` / `no` / `on` / `off` 可能被解析为布尔值，使用时留意
示例：
```yaml
---
- hosts: webtest
  become: yes
  tasks:
    - name: 1. 安装 Apache
      apt:
        name: apache2
        state: present

    - name: 2. 覆盖默认网页
      copy:
        src: index.html
        dest: /var/www/html/index.html

    - name: 3. 启动并设置开机自启
      service:
        name: apache2
        state: started
        enabled: yes
```
语法测试校验
```bash
ansible-playbook apache.yaml --syntax-check
```

![Pasted image 20260903162709](/images/posts/ansible/Pasted image 20260903162709.png)
访问测试
![Pasted image 20260903163402](/images/posts/ansible/Pasted image 20260903163402.png)
## 9 Role
在 Ansible 中，**Role（角色）** 是一种**将 Playbook 代码进行模块化、工程化组织的最高标准目录结构**。

如果你写一个几十行的 `apache.yaml` 剧本，单文件很清晰；但当自动化任务包含安装依赖、配置虚拟主机、分发 SSL 证书、定义数十个变量、触发多项服务重启时，单文件会变得极长、难以维护且无法复用。

**Role 的核心价值：把“任务、变量、配置文件、触发器”解耦并存放在固定约定的目录中，方便在不同剧本间反复调用。**

**1. Role 的标准目录骨架**
通过官方脚手架命令可自动生成标准骨架：
```Bash
ansible-galaxy role init apache
```
生成后的标准目录树及各目录分工如下：
```Plaintext
apache/
├── defaults/
│   └── main.yaml    # 默认变量（优先级最低，允许剧本外部轻松覆盖）
├── vars/
│   └── main.yaml    # 角色私有变量（优先级较高，通常不建议外部修改）
├── tasks/
│   └── main.yaml    # 核心任务清单（相当于 playbook 中的 tasks 部分）
├── handlers/
│   └── main.yaml    # 触发器（如 notify 调用的重启服务逻辑）
├── templates/
│   └── httpd.conf.j2# Jinja2 动态模板文件（自动渲染变量）
├── files/
│   └── index.html   # 静态分发文件（copy 模块默认来这里找文件）
└── meta/
    └── main.yaml    # 角色元数据（作者、版本要求、依赖的其他 Role）
```

> **约定优于配置**：当任务在 `tasks/main.yaml` 中调用 `copy: src=index.html` 时，Ansible 会**自动**去 `files/` 目录下找，不需要你再写绝对路径。

**2. 如何在 Playbook 中调用 Role**

一旦定义好了 Role，Playbook 就变成了极其干净的调度清单：
```YAML
---
- hosts: webtest
  become: yes
  roles:
    - apache
    - mysql
```
Ansible 运行时会自动按标准目录加载变量、执行任务、触发重启，实现基础设施的“积木式”组装。
### 9.1 示例
```bash
#创建Role角色目录
mkdir -p roles/apache/{tasks,handlers,files,vars}
```
![Pasted image 20260903165043](/images/posts/ansible/Pasted image 20260903165043.png)
将之前的 `apache.yaml` 剧本重构为标准 Role 的完整实践步骤如下：

**1. 创建 Role 目录结构**
在工作目录（`/home/jch`）下创建名为 `apache` 的精简角色结构：
```Bash
mkdir -p roles/apache/{tasks,handlers,files,vars}
```

**2. 填充各组件文件**
**① 准备静态文件：`roles/apache/files/index.html`**
```HTML
<h1>Hello from Ansible Apache Role!</h1>
```
_(注：Role 体系中，`copy` 模块会自动到 `files/` 目录下定位同名文件)_
**② 编写核心任务流：`roles/apache/tasks/main.yaml`**

```YAML
---
- name: 1. 安装 Apache
  apt:
    name: apache2
    state: present

- name: 2. 部署默认首页
  copy:
    src: index.html
    dest: /var/www/html/index.html
    owner: www-data
    group: www-data
    mode: '0644'
  notify: 重启 Apache 服务 # <--- 如果这次拷贝导致文件内容发生变动（changed），则在事件簿上登记通知

- name: 3. 启动并配置开机自启
  service:
    name: apache2
    state: started
    enabled: yes
```

**③ 编写触发器：`roles/apache/handlers/main.yaml`**

```YAML
---
- name: 重启 Apache 服务 # <--- 名字必须与 task 中的 notify 字段一字不差匹配
  service:
    name: apache2
    state: restarted
```

_(注：当且仅当 `index.html` 内容被修改产生 `changed` 时，`notify` 才会触发该 handler，保持操作幂等)_
>如果把重启直接写在 `tasks` 中，哪怕配置文件一个标点都没改，每次运行剧本服务都会被强行重启一次；如果有 5 个 task 都改动了配置，服务会被连续重启 5 次。
使用 `handlers` 的机制：
 **仅在有变更时运行**：没改配置文件绝不重启服务。
-**多次通知，合并执行**：即便有多个 task 触发了同一个 `notify: reload nginx`，Ansible 也只会在整批任务全部结束时**集中重启一次**，避免频繁中断线上服务。

**3. 编写顶层调度入口：`site.yaml`**
在根目录创建剧本site.yaml文件，调用刚才封装好的 Role：
```YAML
---
- hosts: webtest
  become: yes
  roles:
    - role: apache
```

**4. 目录层级一览与执行**
最终的目录树结构为：
![Pasted image 20260903165741](/images/posts/ansible/Pasted image 20260903165741.png)
一个项目推荐的结构
![Pasted image 20260903170258](/images/posts/ansible/Pasted image 20260903170258.png)
执行命令运行 Role 部署：

```Bash
ansible-playbook site.yaml
```

![Pasted image 20260903171043](/images/posts/ansible/Pasted image 20260903171043.png)

以 Nginx 配置根据 CPU 核心数动态调整为例：

**1. 模板文件 (`templates/nginx.conf.j2`)**：
```Nginx
# 自动填入系统逻辑 CPU 总核数，也可以直接做数学运算
worker_processes {{ ansible_processor_vcpus }};
worker_rlimit_nofile {{ ansible_processor_vcpus * 10000 }};

events {
    worker_connections 1024;
}
```

**2. 目标机上的实际生成效果**：
- 在 **2 核机器（host1）** 上生成的最终文件：
 ```    Nginx
    worker_processes 2;
    worker_rlimit_nofile 20000;
    ```
- 在 **8 核机器（host2）** 上生成的最终文件： 
 ```    Nginx
    worker_processes 8;
    worker_rlimit_nofile 80000;
    ```
目标机本身不需要安装 Jinja2 引擎，它收到的就是一个完全静态、已经计算替换好的普通配置文件。
jinja2可以插入ansible的变量，也可以自定义变量。
### 9.2 Ansible 自定义变量定义位置
**核心定义位置与场景**：
- **Role 默认变量 (`defaults/main.yaml`)**：优先级最低，最易被外部覆盖，适合存放开源/公共角色的默认配置。
- **Role 私有变量 (`vars/main.yaml`)**：优先级较高，存放该角色内部锁定、不建议外部随意修改的参数。
- **主机/组变量 (`group_vars/` 与 `host_vars/`)**：与清单（inventory）平级存放，按主机组（如 `group_vars/webtest.yaml`）或单机隔离差异化配置（如环境区分）。
- **Playbook 内部声明 (`vars` / `vars_files`)**：在剧本顶层通过 `vars:` 直接定义，或用 `vars_files:` 导入独立的 `.yaml` 变量文件。
- **命令行动态传参 (`-e` / `--extra-vars`)**：优先级最高，用于临时调试或 CI/CD 流程中强制覆盖任意变量（如 `-e "http_port=9000"`）。
**最佳实践**：
- 编写可复用 Role 时：对外可配参数放 `defaults/main.yaml`，内部固定参数放 `vars/main.yaml`。
- 区分生产/测试环境时：环境差异参数放 `group_vars/`，避免将环境参数硬编码在 Playbook 或 Task 内部。
### 9.3 为什么 templates 与 files 必须分立？
- **模块寻路约定**: `copy` 默认自动查找 `files/`，`template` 默认自动查找 `templates/`；若合并，必须手动写死复杂路径，破坏 Role 规范性。
- **动静逻辑隔离**: `files/` 存放纯静态文件直接推送无额外开销；`templates/` 存放动态模板需经 Jinja2 解析计算，分立便于代码审计与维护。

# Supabase 登录与学习进度同步配置

项目已经接入 Supabase Auth、Postgres 和 RLS。上线前只需要在 Supabase 控制台完成下面三步。

## 1. 初始化数据库

1. 打开 Supabase Dashboard。
2. 进入当前项目。
3. 打开 **SQL Editor**。
4. 点击 **New query**。
5. 将仓库中的 `supabase/schema.sql` 全部粘贴进去。
6. 点击 **Run**。

执行成功后会创建：

- `profiles`
- `lesson_progress`
- `exam_results`
- `artifacts`

所有表都已开启 Row Level Security。登录用户只能访问自己的记录。

## 2. 配置 Auth 跳转地址

进入：

`Authentication -> URL Configuration`

### Site URL

```text
https://ai-app-engineer-academy.colafang233.workers.dev/
```

### Redirect URLs

```text
https://ai-app-engineer-academy.colafang233.workers.dev/**
http://127.0.0.1:4176/**
http://localhost:4176/**
```

保存设置。

## 3. 保留 Magic Link 邮件模板

进入：

`Authentication -> Email Templates -> Magic Link`

模板中需要保留：

```text
{{ .ConfirmationURL }}
```

当前前端使用邮箱 Magic Link 登录。用户第一次提交邮箱时会自动创建账号。

## 工作方式

- 未登录：课程进度继续保存在浏览器 `localStorage`。
- 登录后：本机进度与 Supabase 自动合并。
- 合并规则：课程完成状态取并集，考试保留更高分，项目成果保留更新时间更新的版本。
- 网络失败：本地学习不受影响，恢复网络后自动同步。
- 退出登录：只退出当前设备，不删除本地学习记录和云端记录。

## 安全说明

前端只包含 Supabase Project URL 和 Publishable Key。Publishable Key 本身允许放在浏览器中，数据访问权限由登录 JWT 和数据库 RLS 策略控制。

禁止把以下内容提交到仓库：

- `service_role`
- `sb_secret_...`
- 数据库管理员密码
- 数据库连接字符串
- Supabase Personal Access Token

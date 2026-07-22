# 发布到 GitHub

当前仓库已经完成 `git init` 和初始提交。

## 推荐方式：GitHub CLI

先在你自己的电脑安装并登录 GitHub CLI：

```bash
gh auth login
```

进入仓库目录后执行：

```bash
gh repo create ai-app-engineer-academy \
  --private \
  --source=. \
  --remote=origin \
  --push
```

需要公开仓库时，将 `--private` 改为 `--public`。

## 已经创建了空仓库

SSH：

```bash
git remote add origin git@github.com:YOUR_NAME/YOUR_REPO.git
git push -u origin main
```

HTTPS：

```bash
git remote add origin https://github.com/YOUR_NAME/YOUR_REPO.git
git push -u origin main
```

不要把 Personal Access Token 粘贴到聊天或提交到仓库。请在本机使用 `gh auth login`、系统凭据管理器或 SSH Key。

## 从 Git bundle 恢复

```bash
git clone ai-app-engineer-academy.bundle ai-app-engineer-academy
cd ai-app-engineer-academy
git log --oneline
```

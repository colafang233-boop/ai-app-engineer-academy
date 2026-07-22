# Contributing

## 分支建议

- `main`：稳定可运行版本
- `feat/lesson-xx-*`：单课开发
- `refactor/course-runtime`：运行时重构
- `fix/*`：死锁、加载或解锁修复

## 提交格式

```text
feat(lesson-03): add TypeScript repair lab
fix(unlock): allow retry after wrong answer
refactor(runtime): scope lesson event listeners
content(lesson-07): simplify Zod explanation
qa(column-02): add mobile and unlock regression
```

## Pull Request 检查

- [ ] 文案直白，无不必要术语
- [ ] 知识准确，并标注版本敏感信息
- [ ] 没有提前依赖后续课程知识
- [ ] 答错可重试
- [ ] 图示无需远程资源即可加载
- [ ] 390px 宽度无页面级横向溢出
- [ ] 完整解锁路径可通过

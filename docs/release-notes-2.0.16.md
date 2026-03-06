# Zvibe 2.0.16 Release Notes

## 2026-03-07

### Features
- `setup` 现支持将内置 `templates/zellij` 目录作为发布内容写入 `~/.config/zellij`。
- 发布包新增 `templates/`，包含 `config.kdl`、`layouts/zvibe.kdl`、`themes/cyber.kdl` 和 `VERSION`。

### Improvements
- `setup` 在覆盖 `~/.config/zellij` 前会自动备份目录内的非备份文件（排除 `.bak/.backup/*~` 文件）。
- `setup/status --doctor` 的插件校验项扩展为检查完整 `zellij` 配置文件集合。

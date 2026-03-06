# zvibe

Zvibe is a session-first terminal workspace launcher for vibe coding on top of zellij.
Zvibe 是一个基于 zellij 的会话优先终端工作台启动器。

## Core Capabilities / 核心能力

- Multi-agent launch: `codex` / `claude` / `opencode`
- 双 Agent 模式：`zvibe code`
- Terminal-only mode: `zvibe terminal` or `zvibe -t`
- Session management: list / attach / kill
- Live bottom state bar: CPU / GPU / MEM / NET / MODEL / TOK / CTX / COST
- Config and ops commands: `setup` / `config` / `status` / `update`

## Install / 安装

### Global install / 全局安装

```bash
npm i -g @zanetach/zvibe
```

### Temporary run / 临时执行

```bash
npx @zanetach/zvibe setup
```

### Local package install / 本地打包安装

```bash
npm pack
npm i -g ./zanetach-zvibe-<version>.tgz
```

## Quick Start / 快速开始

```bash
zvibe setup
zvibe status --doctor
```

## Run Modes / 启动模式

```bash
zvibe
zvibe codex|claude|opencode
zvibe code
zvibe terminal
zvibe -t
zvibe <dir> [codex|claude|opencode|code|terminal]
zvibe [codex|claude|opencode|code|terminal] <dir>
zvibe <agent> -p <agent args...>
zvibe <agent> -- <agent args...>
```

### `-t, --terminal` behavior / 参数语义

- `zvibe -t` (no explicit agent): starts terminal-only minimal layout
- `zvibe codex -t`: keeps agent mode and adds right terminal pane
- `zvibe code -t`: still runs dual-agent mode (no extra terminal pane)

## Commands / 命令

### Setup / 初始化

```bash
zvibe setup
zvibe setup --repair
zvibe setup --no-repair
zvibe setup --yes
```

`setup` is a 3-phase flow:
- Phase 1: plugin/dependency auto-install (brew/formula/cask + plugin configs)
- Phase 2: interactive, ordered per-agent confirmation/install (`codex` -> `claude` -> `opencode`)
  - `claude` is installed via the official installer: `curl -fsSL https://claude.ai/install.sh | bash`
- Phase 3: config wizard (`DefaultAgent`, `AgentMode` layout, etc.)

### Config / 配置

```bash
zvibe config wizard
zvibe config get <key>
zvibe config set <key> <value>
zvibe config validate
zvibe config explain
```

### Status / Update / Session

```bash
zvibe status
zvibe status --doctor
zvibe update
zvibe session list
zvibe session attach <name>
zvibe session kill <name>
zvibe session kill all
zvibe session -l
zvibe session -a <name>
zvibe session -k <name>
zvibe session -k all
```

## Global Flags / 全局参数

- `--backend zellij`: zellij backend only / 当前仅支持 zellij
- `--fresh-session`: force rebuild existing session / 强制重建当前目录会话
- `--reuse-session`: compatibility flag (attach-first is default) / 兼容参数
- `-p, --passthrough`: pass remaining args to agent / 透传参数给 agent
- `-t, --terminal`: terminal-only when standalone, or right terminal pane in explicit agent mode
- `--yes`: non-interactive setup with defaults / setup 无交互默认值执行
- `--json`: JSON output
- `--verbose`: verbose diagnostics

## Config File / 配置文件

- Default path: `~/.config/zvibe/config.json`
- Legacy read path: `~/.config/vibe/config.json`

Example:

```json
{
  "defaultAgent": "codex",
  "agentPair": ["opencode", "codex"],
  "backend": "zellij",
  "fallback": true,
  "rightTerminal": false,
  "autoGitInit": true,
  "initialized": true
}
```

## Full Test Checklist / 全功能测试清单

### 1) CLI and help / 命令与帮助

```bash
zvibe --help
zvibe help
zvibe --json status
```

Expect / 预期:
- Help shows bilingual command descriptions
- `terminal` mode appears in run commands

### 2) Setup and config / 初始化与配置

```bash
zvibe setup --repair
zvibe setup --yes
zvibe config validate
zvibe config explain
zvibe config get defaultAgent
zvibe config set defaultAgent codex
```

### 3) Run modes / 启动模式

```bash
zvibe --fresh-session
zvibe codex --fresh-session
zvibe code --fresh-session
zvibe terminal --fresh-session
zvibe -t --fresh-session
```

Expect / 预期:
- `terminal` or standalone `-t`: one clean terminal pane + bottom state only
- `codex|claude|opencode`: normal agent workspace layout
- `code`: dual-agent layout

### 4) Session ops / 会话管理

```bash
zvibe session list
zvibe session attach <name>
zvibe session kill <name>
```

### 5) Monitor bar / 监控栏

Expect / 预期:
- Bottom state updates live
- Metrics include CPU/GPU/MEM/NET in/out + model/token/context/cost (if source available)
- Colors change by threshold and trend

If some icons are missing (common in `Terminal.app` without Nerd Font), set icon style manually:

```bash
export ZVIBE_ICON_SET=ascii   # or: unicode / nerd / auto
```

### 6) Packaging / 打包

```bash
npm run verify:all
npm pack
```

`zvibe update` now performs a full update for already-installed tooling:
- brew update/upgrade/cleanup
- update installed formulas/casks/plugins only (no auto-install in update)
- update only agents you selected in `managedAgents`
- `claude` upgrade tries `claude update`, then falls back to `claude upgrade` for compatibility
- plugin config regeneration
- missing-item validation (report only)

## Development / 开发

```bash
git clone https://github.com/Zanetach/zvibe.git
cd zvibe
node src/cli.js --help
npm run verify:all
```

Architecture and stability notes:
- [docs/architecture-and-stability.md](docs/architecture-and-stability.md)

## License / 许可证

MIT

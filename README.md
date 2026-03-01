# Zvibe Kits

      ______     _ _        _        _  ___ _ _     
     |___  /    (_) |      | |      | |/ (_) | |    
        / /_   _ _| |__ ___| | _____| ' / _| | |_   
       / /| | | | | '_ \_  / |/ / _ \  < | | | __|  
      / /_| |_| | | |_) / /|   <  __/ . \| | | |_   
     /_____\__,_|_|_.__/___|_|\_\___|_|\_\_|_|\__|  

                     Zvibe Kits

**Zvibe Kits** is a Ghostty-powered multi-agent development workspace
launcher for macOS.

It automatically orchestrates:

-   `yazi` (file manager)
-   AI agents (Codex / Claude / OpenCode)
-   `keifu`
-   Ghostty split layout
-   Auto git initialization
-   Dependency update detection

------------------------------------------------------------------------

## Install

### Global Install (Recommended)

``` bash
npm i -g zvibe-kits
```

Then run:

``` bash
zvibe setup
```

### Run via npx (No Global Install)

``` bash
npx zvibe-kits setup
```

------------------------------------------------------------------------

## Commands

``` bash
zvibe setup        # First-time bootstrap (install + config)
zvibe install      # Explicit install
zvibe doctor       # Check environment
zvibe update       # Upgrade all brew dependencies

zvibe              # Start default agent
zvibe codex        # Start Codex
zvibe claude       # Start Claude Code
zvibe opencode     # Start OpenCode
zvibe code         # Dual-agent layout
```

------------------------------------------------------------------------

## Layout

### Single Agent Mode

    ┌───────────────┬────────────────────────┐
    │ yazi          │ Agent                  │
    ├───────────────┤                        │
    │ keifu         │                        │
    └───────────────┴────────────────────────┘

### Dual Agent Mode

    ┌───────────────┬────────────────────────┐
    │ yazi          │ Agent A                │
    ├───────────────┼────────────────────────┤
    │ keifu         │ Agent B                │
    └───────────────┴────────────────────────┘

------------------------------------------------------------------------

## Configuration

Config file:

    ~/.config/vibe/config.json

Example:

``` json
{
  "defaultAgent": "codex",
  "AgentMode": ["opencode", "codex"]
}
```

Supported agents:

-   codex
-   claude
-   opencode

------------------------------------------------------------------------

## Update

If outdated packages are detected during startup, you'll see:

    ⚠️  2 dependencies outdated.
    ℹ️  Run: zvibe update

To upgrade everything:

``` bash
zvibe update
```

------------------------------------------------------------------------

## Requirements

-   macOS
-   Homebrew
-   Ghostty

------------------------------------------------------------------------

## Development

``` bash
git clone https://github.com/Zanetach/zvibe-kits.git
cd zvibe-kits
chmod +x bin/zvibe
npm link
zvibe doctor
```

------------------------------------------------------------------------

## License

MIT © 2026 Zanetach

------------------------------------------------------------------------

Repository: https://github.com/Zanetach/zvibe-kits

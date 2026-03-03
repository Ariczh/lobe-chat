# Patch Release (Weekly) Changelog Example

A real-world changelog reference for weekly patch release PR bodies.

---

This release includes **90 commits**. Key updates are below.

### ✨ New Features and Enhancements

- 🤖 Added **Discord IM bot integration** for receiving and responding to messages within Discord channels. ([#12517](https://github.com/lobehub/lobehub/pull/12517))
- 🧩 Introduced **Agent Skills** support with progressive disclosure via `lobe-tools`, allowing agents to expose task-specific capabilities. ([#12424](https://github.com/lobehub/lobehub/pull/12424), [#12489](https://github.com/lobehub/lobehub/pull/12489))
- 🧠 Added **Memory Settings** for configuring memory effort and tool permissions. ([#12514](https://github.com/lobehub/lobehub/pull/12514))
- 📧 Support for **changing email address** in profile settings. ([#12549](https://github.com/lobehub/lobehub/pull/12549))
- 🛡️ Added **unsaved changes guard** to prevent data loss on navigation. ([#12332](https://github.com/lobehub/lobehub/pull/12332))
- 🖱️ Support **Cmd+Click to open sidebar nav in new tab**. ([#12574](https://github.com/lobehub/lobehub/pull/12574))
- 🧮 Added **calculator builtin tool** for agents. ([#11715](https://github.com/lobehub/lobehub/pull/11715))

### 🤖 Models and Provider Expansion

- 🌟 Added **Kimi K2 thinking models** (Moonshot). ([#12630](https://github.com/lobehub/lobehub/pull/12630))
- 🍌 Added **Nano Banana 2** support. ([#12493](https://github.com/lobehub/lobehub/pull/12493), [#12496](https://github.com/lobehub/lobehub/pull/12496))
- 🎨 Added **Seedream 5 Lite** image generation model. ([#12459](https://github.com/lobehub/lobehub/pull/12459))
- 💨 Added **Qwen3.5 Flash** and Qwen3.5 OSS models. ([#12465](https://github.com/lobehub/lobehub/pull/12465))
- 🔮 Added **GLM-5**, **GLM-4.6V**, and **GLM-Image** for Zhipu. ([#12272](https://github.com/lobehub/lobehub/pull/12272))
- 📦 Batch updated model lists for AI360, Hunyuan, InternLM, Spark, StepFun, Wenxin, and Seedream. ([#12371](https://github.com/lobehub/lobehub/pull/12371))

### 🏗️ Architecture

- ⚡ **Migrated frontend from Next.js App Router to Vite SPA** — a major architectural change improving dev experience and build performance. ([#12404](https://github.com/lobehub/lobehub/pull/12404))
- 📂 Restructured SPA routes to `src/routes` and `src/router`. ([#12542](https://github.com/lobehub/lobehub/pull/12542))
- ♻️ Refactored client agent runtime. ([#12482](https://github.com/lobehub/lobehub/pull/12482))

### 🖥️ Desktop Improvements

- 🔧 Fixed better-auth client stub for Electron renderer. ([#12563](https://github.com/lobehub/lobehub/pull/12563))

### Stability, Security, and UX Fixes

- Fixed topic/thread title summarization to respect `responseLanguage` setting. ([#12627](https://github.com/lobehub/lobehub/pull/12627))
- Fixed MCP tool install loading state. ([#12629](https://github.com/lobehub/lobehub/pull/12629))
- Fixed mermaid rendering in notebook documents. ([#12624](https://github.com/lobehub/lobehub/pull/12624))
- Fixed global memory setting and tool enabled logic. ([#12610](https://github.com/lobehub/lobehub/pull/12610))
- Fixed Vertex AI 400 error caused by duplicate tool function declarations. ([#12604](https://github.com/lobehub/lobehub/pull/12604))
- Fixed multiple Vertex AI and Moonshot runtime issues. ([#12595](https://github.com/lobehub/lobehub/pull/12595))
- Fixed SiliconCloud model thinking mode toggle. ([#10011](https://github.com/lobehub/lobehub/pull/10011))
- Fixed model select panel flickering and improved list implementation. ([#12485](https://github.com/lobehub/lobehub/pull/12485))
- Fixed memory tools to run in server correctly with correct cron schedule. ([#12471](https://github.com/lobehub/lobehub/pull/12471), [#12568](https://github.com/lobehub/lobehub/pull/12568))
- Added username and fullName length validation. ([#12614](https://github.com/lobehub/lobehub/pull/12614))

### 🙏 Credits

Huge thanks to these contributors (alphabetical):

@Innei @arvinxx @canisminor1990 @cy948 @eaten-cake @eronez @hezhijie0327 @mikelambert @nekomeowww @rdmclin2 @sxjeru @tjx666

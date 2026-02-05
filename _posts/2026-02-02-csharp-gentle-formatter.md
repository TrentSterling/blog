---
title: "C# Gentle Formatter - Stop Stripping My Blank Lines"
date: 2026-02-02
categories: [devblog]
tags: [vscode, csharp, formatter, tools, open-source]
description: "VS Code extension that formats C# without destroying blank line indentation."
image: "/assets/img/blog/csharp-gentle-formatter.png"
---

![C# Gentle Formatter](/assets/img/blog/csharp-gentle-formatter.png){: .align-center }

Made a VS Code extension because every other C# formatter pissed me off.

[GitHub](https://github.com/TrentSterling/csharp-gentle-formatter) | [v1.0.0 Release](https://github.com/TrentSterling/csharp-gentle-formatter/releases/tag/v1.0.0)

## The Problem

Every C# formatter I've used - OmniSharp, CSharpier, whatever - strips whitespace from blank lines. Sounds harmless, right?

It's not. When you're on a team and someone uses a different editor or formatter, those blank lines flip-flop between "has indentation" and "completely empty" on every commit. Your git diffs become full of phantom changes on lines nobody actually edited. It's maddening. You're trying to review actual code changes and half the diff is just whitespace noise on blank lines.

## What It Does

**C# Gentle Formatter** formats your C# code but leaves blank lines alone. They keep their indentation. That's it. That's the whole pitch.

But it also does proper formatting stuff:

- **Indentation** based on brace depth - unfucked flat code gets properly nested
- **Keyword spacing** - `if(x)` becomes `if (x)`, same for `for`, `while`, `foreach`, etc.
- **Operator spacing** - `a=b+c` becomes `a = b + c`
- **Auto-detects tabs vs spaces** from your file - doesn't force one or the other

## What It Doesn't Break

This was the hard part. A naive formatter would wreck your strings and comments. This one is context-aware:

- Regular strings `"..."`
- Verbatim strings `@"..."`
- Interpolated strings `$"..."`
- Raw string literals `"""..."""`
- Single-line comments `//`
- Multi-line comments `/* */`
- Generics like `List<int>` (no space before `<`)
- Null-conditional `?.` (no spaces added)

It handles all of that correctly in a single pass.

## Usage

Install the `.vsix`, set it as your default C# formatter:

```json
"[csharp]": {
    "editor.defaultFormatter": "trentsterling.csharp-gentle-formatter"
}
```

`Shift+Alt+F` to format. Done.

## Tech

TypeScript, VS Code Extension API. Single-pass formatter that tracks context (are we in a string? a comment? what brace depth?). No Roslyn, no AST parsing, just straightforward text processing that doesn't try to be smarter than it needs to be.

MIT licensed. Grab it if noisy git diffs drive you as crazy as they drive me.

---
layout: post
title: "Why I Use Git With AI Tools"
date: 2026-04-26 00:00:00 -0500
categories: [engineering, security, ai]
tags: [git, ai, llms, version-control, software-engineering]
excerpt: "AI tools make it easy to change a lot of files quickly. Git makes it possible to see what actually changed and get back to a working version."
image: /assets/site-social-image.jpg
permalink: /why-we-use-git/
---

A friend recently broke his setup while using a few different AI tools to help with configuration and code. One tool generated the first version, another tried to fix it, and a third explained the new error. Each answer added another change until nobody knew which version had worked.

There was no Git repository or other useful history, so troubleshooting meant comparing files by hand and trying to remember what had been pasted where.

The AI tools were not really the interesting part of the problem. The same thing can happen when following old documentation, copying commands from a forum, or making several changes late at night. The problem was that there was no record of the changes and no easy way back.

## Keep a working checkpoint

Before changing a script or configuration, I want a copy of the last version that worked. Git gives me that without creating folders full of files named things like:

- `script-old.ps1`
- `script-fixed.ps1`
- `script-final.ps1`
- `script-final-2.ps1`

A commit is just a known point I can return to. It also tells me when the change was made and, if I wrote a useful commit message, why I made it.

This applies to more than application code. I use Git for PowerShell, Markdown, JSON, YAML, infrastructure definitions, documentation, and other text files. If a file matters and changes over time, keeping its history is useful.

## Look at the diff

AI tools are usually very confident when describing what they changed. That description is not a substitute for checking the files.

```bash
git diff
```

The diff shows the actual changes. If I asked for one line to be corrected and the result includes an unrelated rewrite, I want to see that before I run anything.

For a larger change I normally start with:

```bash
git status
git diff --stat
git diff
```

`git status` shows which files were touched. `git diff --stat` gives me a quick idea of the size of the change, and `git diff` shows the details.

This is useful even when the generated code is correct. It is easy for a tool to reformat a file, remove a comment, change a default, or update something that was not part of the request.

## Make smaller changes

It is much easier to review one small change than a complete rewrite. I try to start from a working commit, ask for one specific change, review it, test it, and then commit it before moving on.

A basic workflow looks like this:

```bash
git init
git add .
git commit -m "Working baseline"
```

After making a change:

```bash
git status
git diff

# Run whatever test or validation makes sense for the project.

git add path/to/changed-file
git commit -m "Describe the change"
```

If a change is wrong, I can compare it with the previous version or restore the affected file. `git restore` discards uncommitted changes, so I check `git diff` first and restore only the file I intend to throw away:

```bash
git restore -- path/to/changed-file
```

For experimental work, a branch is also cheap:

```bash
git switch -c try-new-approach
```

If the experiment works, I can keep it. If it does not, the working branch is still available.

## Give the tool the project, not a fragment

AI tools tend to give better answers when they can see the repository instead of a single copied error message. The current files, README, tests, and recent commits explain how the project is supposed to work.

That context does not make the answer automatically correct, but it reduces guessing. It also makes the result easier for me to review because the proposed change is made against the same files I am actually using.

## Git does not replace testing

Git records a change; it does not prove the change is safe. A clean diff can still contain a bad command, an insecure default, or code that simply does not work.

I still need to read the result, test it somewhere appropriate, and avoid putting secrets into prompts or repositories. Git just makes those steps manageable by showing me exactly what I am reviewing and giving me a way back when something goes wrong.

AI tools make it very easy to change a lot of text quickly. That can be useful, but it is also a good reason to keep the work in Git. I would rather spend a few seconds making a checkpoint than spend an evening reconstructing one.

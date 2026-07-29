---
layout: post
title:  "VS Code on Android"
date:   2021-05-18 06:10:00 -0500
comments: false
categories: vscode android
tags: [vscode, android]
excerpt: Running a VS Code-style editor in an Android browser with code-server and UserLAnd.
permalink: "/vscode-on-android/"
---

Code-server provides a VS Code-style editor in a web browser. On Android, it can run inside an Ubuntu environment provided by [UserLAnd](https://play.google.com/store/apps/details?id=tech.ula).

1. Install UserLAnd and create an Ubuntu session.
2. Open its terminal and install the basic packages:

   ```bash
   sudo apt update
   sudo apt install -y nodejs npm curl
   ```

3. Code-server currently requires Node.js 22. Download the nvm installer instead of piping it directly into a shell:

   ```bash
   curl -fsSLo /tmp/nvm-install.sh \
     https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh
   less /tmp/nvm-install.sh
   bash /tmp/nvm-install.sh
   rm /tmp/nvm-install.sh
   ```

   Review the script before running it. Exit the Ubuntu terminal and reopen it when the installation completes.

4. Install Node.js 22 and code-server:

   ```bash
   nvm install 22
   nvm use 22
   npm install --global code-server
   ```

5. Start code-server:

   ```bash
   code-server
   ```

6. Open `http://127.0.0.1:8080` in the Android browser. Use the password stored in `~/.config/code-server/config.yaml`.

Leave code-server bound to `127.0.0.1` and keep password authentication enabled. Do not use `--auth none` or expose port 8080 to the network. Press `Ctrl+C` in the Ubuntu terminal to stop it.

---
layout: post
title:  "VS Code on Android"
date:   2021-05-18 06:10:00 -0500
comments: false
categories: vscode android
tags: [vscode, android]
excerpt: Running VSCode on Android.
permalink: "/vscode-on-android/"
---

The first thing you'll need on your Android device is the following app:
[UserLAnd](https://play.google.com/store/apps/details?id=tech.ula)

Within the app I suggest setting up a Debian install of linux. You'll also need some application to SSH into this instance of Debian and for that I suggest:
[JuiceSSH](https://play.google.com/store/apps/details?id=com.sonelli.juicessh)

Once Debian is installed and you're able to connect into it with JuiceSSH we'll proceed to the next steps.

```sh
# Download a release of code server
wget https://github.com/cdr/code-server/releases/download/2.1698/code-server2.1698-vsc1.41.1-linux-arm64.tar.gz

# Uncompress the gzip tarball
tar -xvf ./code-server2.1698-vsc1.41.1-linux-arm64.tar.gz

# Copy the contents of code-server to /bin
cp ./code-server2.1698-vsc1.41.1-linux-arm64/code-server /bin

# Run the code server
./code-server --no-auth

```

At this point you should be able to open a browser in android and navigate to [localhost:8080](http://localhost:8080)
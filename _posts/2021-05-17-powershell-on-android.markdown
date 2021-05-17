---
layout: post
title:  "Powershell on Android"
date:   2021-05-17 03:52:00 -0500
categories: powershell android
tags: [android, powershell]
excerpt: Installing a working version of Powershell within Android.
permalink: /powershell-on-android/
---

I really enjoy Powershell Core and often wish I could run scripts from my Android devices, using the steps below I have been able to accomplish this.

The first thing you'll need on your Android device is the following app:
[UserLAnd](https://play.google.com/store/apps/details?id=tech.ula)

Within the app I suggest setting up a Debian install of linux. You'll also need some application to SSH into this instance of Debian and for that I suggest:
[JuiceSSH](https://play.google.com/store/apps/details?id=com.sonelli.juicessh)

Once Debian is installed and you're able to connect into it with JuiceSSH we'll proceed to the next steps.

```sh

# Install some needed prerequisites
sudo apt-get install '^libssl1.0.[0-9]$' libunwind8 libicu63 -y

# Change directory to home
cd ~

# Download an arm64 Powershell release
wget https://github.com/PowerShell/PowerShell/releases/download/v7.1.0-preview.2/powershell-7.1.0-preview.2-linux-arm64.tar.gz

# Make a directory under /opt for powershell
sudo mkdir -p /opt/microsoft/powershell/7

# Uncompress the downloaded gzip tarball to the newly created powershell directory
sudo tar zxf /tmp/powershell-7.0.3-linux-arm32.tar.gz -C /opt/microsoft/powershell/7

# Modify the PWSH file to be able to execute it
sudo chmod +x /opt/microsoft/powershell/7/pwsh

# Link the PWSH binary to /usr/bin
sudo ln -s /opt/microsoft/powershell/7/pwsh /usr/bin/pwsh

# Add the linked path to /etc/shells so it'll be a registered shell
echo "/usr/bin/pwsh" >> /etc/shells

# Change the shell for the root user
sudo chsh -s /usr/bin/pwsh 

# Run PWSH
./pwsh

```
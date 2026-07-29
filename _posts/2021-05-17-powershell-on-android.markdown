---
layout: post
title:  "PowerShell on Android"
date:   2021-05-17 03:52:00 -0500
categories: powershell android
tags: [android, powershell]
excerpt: Installing PowerShell in a Linux environment on Android.
permalink: /powershell-on-android/
---

PowerShell can run on Android through a Linux environment such as UserLAnd. The exact packages available depend on the Linux distribution and CPU architecture, so begin by checking both:

```sh
cat /etc/os-release
dpkg --print-architecture
```

The procedure below assumes a currently supported Debian release on `amd64`. Microsoft's package repository is the preferred installation method for supported Debian versions.

## Install on a supported Debian environment

```sh
# Refresh packages and install the repository bootstrap dependency
sudo apt-get update
sudo apt-get install -y wget

# Register Microsoft's repository for the detected Debian version
source /etc/os-release
wget -q "https://packages.microsoft.com/config/debian/$VERSION_ID/packages-microsoft-prod.deb"
sudo dpkg -i packages-microsoft-prod.deb
rm packages-microsoft-prod.deb

# Install and start the current stable PowerShell package
sudo apt-get update
sudo apt-get install -y powershell
pwsh
```

Microsoft's Debian packages are not available for every Android/Linux architecture. If `dpkg --print-architecture` reports `arm64`, use Microsoft's current [PowerShell on Arm guidance](https://learn.microsoft.com/powershell/scripting/install/powershell-on-arm) instead of substituting an `amd64` package or an old preview archive.

Review the current [official Debian installation instructions](https://learn.microsoft.com/powershell/scripting/install/install-debian) before installing. Do not add `pwsh` as the root user's login shell unless you understand the recovery implications.

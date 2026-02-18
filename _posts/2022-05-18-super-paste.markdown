---
layout: post
title:  "Super Paste: Bridging the Air Gap with PowerShell"
date:   2022-05-18 06:00:00 -0500
comments: false
categories: windows powershell virtualization
tags: [windows, powershell, virtualization, automation]
excerpt: A clever workaround for pasting text into VM consoles where clipboard sharing is disabled.
permalink: "/super-paste/"
---

We've all been there: you're working in a restricted VDI environment, a hardened Hyper-V guest, or an ancient ESXi console, and you need to get a long command or configuration script into the VM. You hit `CTRL + V`, and... nothing.

Clipboard sharing is often disabled for security reasons, leaving you to manually type out complex strings which increases typos and frustration.

I'm sharing my solution which I call "Super Paste": a lightweight PowerShell tool that acts as a virtual keyboard, typing your clipboard contents directly into *any* active window.

## The Solution

The concept is simple:
1.  **Read** the current clipboard content.
2.  **Sanitize** special characters that might confuse the "typing" engine.
3.  **Type** the characters into the active window using `SendKeys`.

### 1. The PowerShell Script

Save the following script as `SuperPaste.ps1`.

```powershell
# Give you a moment to click into the target window
Start-Sleep -Seconds 2

# Get the clipboard content
$clip = Get-Clipboard

# Sanitize special characters for SendKeys
# SendKeys has special meanings for characters like +, ^, %, ~, etc.
# We wrap them in braces {} so they are treated as literal text.
$sanitizedChars = $clip.ToCharArray() | ForEach-Object {
    if ($_ -match "['^' + '%' '~' '(' ')' '\[ '\]' '{' '}']") {
        "{$_}"
    } else {
        $_
    }
}

# Create the WScript Shell object
$wshell = New-Object -ComObject wscript.shell

# Type out each character
foreach ($char in $sanitizedChars) {
    $wshell.SendKeys($char)
}
```

**How it works:**
*   `Start-Sleep -Seconds 2`: This critical pause gives you time to switch focus from your host machine to the target VM console window.
*   `Get-Clipboard`: Grabs whatever text you currently have copied.
*   `ToCharArray() | ForEach-Object`: Iterates through every character. If it finds a special character (like `^` which represents CTRL, or `+` which represents SHIFT), it wraps it in curly braces so `SendKeys` types it literally instead of executing it as a command.
*   `$wshell.SendKeys($char)`: Simulates a physical keystroke for each character.

### 2. The Launcher (Batch File)

To make this easy to trigger, we'll use a simple batch file wrapper. Save this as `SuperPaste.bat` in the same folder.

```batch
@echo off
Powershell.exe -ExecutionPolicy Bypass -NoProfile -File "C:\Path\SuperPaste.ps1"
```
*Note: Be sure to update the path to match where you saved the PowerShell script.*

### 3. The Hotkey

The final piece of the puzzle is binding this to a keyboard shortcut so you can trigger it on demand.

1.  **Right-click** your `SuperPaste.bat` file and select **Create Shortcut**.
2.  Move this shortcut to your Desktop (Windows sometimes requires this for hotkeys to work reliably).
3.  **Right-click** the shortcut and select **Properties**.
4.  Click in the **Shortcut key** field and press your desired combination (e.g., `CTRL + ALT + V` or `CTRL + SHIFT + V`).
5.  (Optional) Click **Change Icon** to give it a cool icon.
6.  Click **OK**.

## How to Use It

1.  **Copy** your desired text on your host machine (`CTRL + C`).
2.  **Press** your hotkey (`CTRL + SHIFT + V`).
3.  **Immediately click** inside the VM console or remote window.
4.  **Wait 2 seconds**... and watch as your text is magically typed out for you!

This simple workaround bridges the gap between secure, isolated environments and your local productivity, saving you from the tedium of manual data entry.

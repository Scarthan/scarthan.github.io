---
layout: post
title:  "Super Paste"
date:   2022-05-18 06:00:00 -0500
comments: false
categories: windows powershell virtualization
tags: [windows, powershell, copy paste, virtualization]
excerpt: Using paste where you can't sync the Windows clipboard.
permalink: "/super-paste/"
---

I really like using CTRL + C as well as CTRL + V for copying and pasting content within Windows. In certain situations CTRL + V may not be able to be used such as when working with a hypervisor and virtual machines where the Windows clipboard is not synced to guests for security reasons. A workaround to this situation for me has been to create two small scripts, a shortcut with a hotkey, and an icon for the shortcut. The first script is a powershell script that will do the majority of the intended action below:

```powershell
Start-Sleep -Seconds 2

$clip = Get-Clipboard

$var = $clip.ToCharArray() | ForEach-Object {
    if($_ -match "['^''.''+''%''~''('')'\]\['{''}']"){
        $r = "{" + $_ + "}";$_ -replace "['^''.''+''%''~''('')'\]\['{''}']",$r
    }else{
        $_
    }
}

$wshell = New-Object -ComObject wscript.shell

foreach ($char in $var){$wshell.SendKeys($char)}
```

This script will pause for two seconds which is needed because we have to invoke the script and focus on the window we're intending to have our text pasted into. The next few operations are retrieving the content of the clipboard and utilizing wscript sendkeys method to iterate through each character effectively typing back out anything within the clipboard. The reassignment of the cilpboard to a character array is to replace characters that need to be escaped before being passed to sendkeys.

The next script is a batch file so that we can create a shortcut to it that'll just run the powershell script:

```batch
Powershell.exe -executionpolicy bypass -noprofile -file "C:\Users\USERNAME\Documents\paste.ps1"
```

The path should point to wherever the powershell script will be stored.

The last part is to create a shortcut to the batch script on the Windows desktop. We create the shortcut on the desktop so we can utilize the functionality in Windows to launch a program with a keyboard shortcut. I suggest creating a shortcut on the desktop by right clicking and choosing New > shortcut. Point the shortcut to the batch file, select an icon if desired, and set the shortcut to CTRL + SHIFT + V. In practice this allows to select a Window not within a virtual machine so the keyboard input isn't redirected to the virtual machine, invoke the scripts by pressing CTRL + SHIFT + V, and selecting the virtual machine window within 2 seconds so it will effectively type back out the contents of the clipboard.

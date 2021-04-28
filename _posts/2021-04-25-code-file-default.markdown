---
layout: post
title:  "VS Code Default File Type"
date:   2021-04-25 07:10:00 -0500
categories: vscode powershell
tags: [vscode, powershell]
---

I really like VS Code and more often than not when I am opening it I am creating some snippet of powershell to share and I want the IDE functions VS Code makes available. When you open VS Code the default file type is a blank txt file. This can be less than ideal if you work in one language most of the time. SQLDBAwithTheBeard already has a great post about the GUI methods available for modifying the default file type so I thought I would share my method of doing it from powershell.


```powershell

#Retrieve the current settings.JSON content and convert it from JSON into a PowerShell object. 
$Obj = Get-Content -Path "$ENV:AppData\Code\User\settings.json" | ConvertFrom-Json

#Add the member item and the property value that should be attached to it in this case Powershell
if(($obj | get-member | Where-Object {$_.Name -eq "files.defaultLanguage"}).Definition -match "powershell"){
    
}else {
    $Obj | Add-Member -Name "files.defaultLanguage" -Value "powershell" -MemberType NoteProperty
}

#Convert the content back to JSON
$Content = ConvertTo-Json $Obj

#Set the JSON and apply it over the top of the settings.JSON files
Set-Content -Path "$ENV:AppData\Code\User\settings.json" -Value $Content

```

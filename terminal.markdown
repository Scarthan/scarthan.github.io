---
layout: page
title: Terminal
permalink: /terminal/
---

<div class="terminal-container">
    <div class="terminal-header">
        <span class="terminal-dot red"></span>
        <span class="terminal-dot yellow"></span>
        <span class="terminal-dot green"></span>
        <span class="terminal-title">PowerShell - thans.biz</span>
    </div>
    <div id="terminal-body" class="terminal-body">
        <div class="terminal-output" id="terminal-output">
            <div id="initial-motd"></div>
        </div>
        <div class="terminal-input-line">
            <span id="terminal-prompt" class="terminal-prompt">PS C:\Users\Guest></span>
            <input type="text" id="terminal-input" autofocus spellcheck="false" autocomplete="off">
        </div>
    </div>
</div>

<style>
.terminal-container {
    background-color: #012456;
    color: #cccccc;
    font-family: 'Cascadia Code', 'Consolas', 'Courier New', monospace;
    border-radius: 8px;
    box-shadow: 0 10px 30px rgba(0,0,0,0.5);
    overflow: hidden;
    margin: 2rem 0;
    border: 1px solid #005fb8;
}

.terminal-header {
    background-color: #001a3d;
    padding: 8px 15px;
    display: flex;
    align-items: center;
    border-bottom: 1px solid #005fb8;
}

.terminal-dot {
    width: 12px;
    height: 12px;
    border-radius: 50%;
    margin-right: 8px;
}
.red { background-color: #ff5f56; }
.yellow { background-color: #ffbd2e; }
.green { background-color: #27c93f; }

.terminal-title {
    margin-left: auto;
    margin-right: auto;
    font-size: 0.8rem;
    color: #888;
}

.terminal-body {
    padding: 0px 15px 10px 15px;
    height: 400px;
    overflow-y: auto;
    display: flex;
    flex-direction: column;
}

.terminal-output {
    white-space: pre-wrap;
    word-break: break-word;
}

.motd p {
    margin: 0;
    font-size: inherit;
    font-family: inherit;
    line-height: 1.2;
}

.motd pre {
    background: transparent !important;
    border: none !important;
    color: #ffbd2e !important;
    padding: 0 !important;
    margin: 0 !important;
    font-size: 0.55rem;
    line-height: 1.0;
}

.terminal-input-line {
    display: flex;
    align-items: center;
}

.terminal-prompt {
    color: #ffffff;
    margin-right: 10px;
    white-space: nowrap;
}

#terminal-input {
    background: transparent;
    border: none;
    color: #ffffff;
    font-family: inherit;
    font-size: inherit;
    width: 100%;
    outline: none;
}

.cmd-out-help { color: #27c93f; }
.cmd-out-error { color: #ff5f56; }
.cmd-out-date { color: #ffbd2e; }
</style>

<script>
document.addEventListener('DOMContentLoaded', () => {
    const input = document.getElementById('terminal-input');
    const output = document.getElementById('terminal-output');
    const body = document.getElementById('terminal-body');
    const promptDisplay = document.getElementById('terminal-prompt');

    const ROOT = 'C:\\Users\\Guest';
    let currentDir = ROOT;
    let history = [];
    let historyIndex = -1;
    let tabMatchIndex = 0;
    let lastTabInput = '';
    let currentTabMatches = [];

    const fs = {
        'C:': { type: 'dir', children: ['Users'] },
        'C:\\Users': { type: 'dir', children: ['Guest'] },
        [ROOT]: { type: 'dir', children: ['posts', 'projects.txt', 'contact.txt'] },
        [ROOT + '\\posts']: {
            type: 'dir',
            children: [
                {% for post in site.posts %}
                "{{ post.url | remove_first: '/' | replace: '/', '-' | append: '.md' }}"{% unless forloop.last %},{% endunless %}
                {% endfor %}
            ]
        }
    };

    const fileContentMap = {
        'projects.txt': 'Highlighted Projects:\n- Personal Blog: Custom Jekyll + PowerShell elements\n- State Watchdog: PowerShell Class recovery system\n- Super Paste: Cross-console clipboard bridge',
        'contact.txt': 'Email: N@thans.biz\nMastodon: @figcatchingraptor@infosec.exchange\nGitHub: Scarthan',
        {% for post in site.posts %}
        "{{ post.url | remove_first: '/' | replace: '/', '-' | append: '.md' }}": {{ post.content | strip_html | jsonify }}{% unless forloop.last %},{% endunless %}
        {% endfor %}
    };

    const postMap = {
        {% for post in site.posts %}
        "{{ post.url | remove_first: '/' | replace: '/', '-' | append: '.md' }}": "{{ post.url | relative_url }}"{% unless forloop.last %},{% endunless %}
        {% endfor %}
    };

    const motdLines = [
        "   _____                 _   _                       _____ _      _____ ",
        "  / ____|               | | | |                     / ____| |    |_   _|",
        " | (___   ___ __ _ _ __ | |_| |__   __ _ _ __      | |    | |      | |  ",
        "  \\___ \\ / __/ _` | '__|| __| '_ \\ / _` | '_ \\     | |    | |      | |  ",
        "  ____) | (_| (_| | |   | |_| | | | (_| | | | |    | |____| |____ _| |_ ",
        " |_____/ \\___\\__,_|_|    \\__|_| |_|\\__,_|_| |_|     \\_____|______|_____|"
    ];

    const getMotdHtml = () => {
        return '<div class="motd"><pre>' + motdLines.join('\n') + '</pre>' +
               '<p>Nathan\'s Interactive Terminal [Version 1.2.0]<br>' +
               '(c) 2026 Nathan Collins. All rights reserved.<br>' +
               'Type \'Get-Help\' to see available commands.</p></div>';
    };

    document.getElementById('initial-motd').innerHTML = getMotdHtml();

    const resolvePath = (path) => {
        if (!path) return null;
        let absolute = path;
        if (!path.startsWith('C:')) {
            absolute = (currentDir + '\\' + path);
        }
        absolute = absolute.replace(/\\+/g, '\\');
        if (absolute.endsWith('\\') && absolute.length > 3) absolute = absolute.slice(0, -1);

        const parts = absolute.split('\\');
        const stack = [];
        for (let i = 0; i < parts.length; i++) {
            const p = parts[i];
            if (p === '..') { if (stack.length > 1) stack.pop(); }
            else if (p !== '.' && p !== '') stack.push(p);
        }
        let res = stack.join('\\');
        if (stack.length === 1 && stack[0].endsWith(':')) res = stack[0];
        return res;
    };

    const commandInfo = {
        'Get-Help': {
            synopsis: 'Displays information about terminal commands.',
            description: 'Get-Help displays a list of all available commands, or detailed information about a specific command when passed as an argument.'
        },
        'Get-Command': {
            synopsis: 'Gets all commands.',
            description: 'Get-Command lists all cmdlets and aliases available in the current session.'
        },
        'Set-Location': {
            synopsis: 'Sets the current working location to a specified path.',
            description: 'Use cd or Set-Location to navigate the virtual filesystem or jump directly to a blog post by targeting its .md file.'
        },
        'Get-ChildItem': {
            synopsis: 'Gets the files and folders in a file system location.',
            description: 'Lists the contents of the current directory or a specified path.'
        },
        'Get-Content': {
            synopsis: 'Gets the content of the item at the specified location.',
            description: 'Reads the text content of a virtual file, such as a blog post or text file.'
        },
        'Get-Location': {
            synopsis: 'Gets information about the current working location.',
            description: 'Returns the current virtual path.'
        },
        'Get-History': {
            synopsis: 'Gets a list of the commands entered during the current session.',
            description: 'Displays all commands entered since the page was loaded.'
        },
        'Get-MOTD': {
            synopsis: 'Displays the Message of the Day.',
            description: 'Shows the ASCII art banner and welcome information.'
        },
        'Clear-Host': {
            synopsis: 'Clears the display in the host program.',
            description: 'Removes all text from the terminal output buffer.'
        },
        'Get-Date': {
            synopsis: 'Gets the current date and time.',
            description: 'Returns the system time from the browser.'
        },
        'Get-WhoAmI': {
            synopsis: 'Displays user information.',
            description: 'Shows a brief introduction and background about the site author.'
        },
        'Exit': {
            synopsis: 'Exits the terminal.',
            description: 'Redirects the browser back to the blog home page.'
        }
    };

    const commands = {
        'Get-Help': (args) => {
            const target = args[0];
            if (target) {
                const cmd = aliases[target.toLowerCase()] || Object.keys(commands).find(c => c.toLowerCase() === target.toLowerCase());
                if (cmd && commandInfo[cmd]) {
                    return 'NAME\n    ' + cmd + '\n\nSYNOPSIS\n    ' + commandInfo[cmd].synopsis + '\n\nDESCRIPTION\n    ' + commandInfo[cmd].description;
                }
                return '<span class="cmd-out-error">Get-Help : Help not found for command \'' + target + '\'.</span>';
            }
            return 'Available commands:\n' +
                   '  <span class="cmd-out-help">Set-Location</span> (cd)  - Change directory / Navigate to post\n' +
                   '  <span class="cmd-out-help">Get-ChildItem</span> (ls)  - List contents\n' +
                   '  <span class="cmd-out-help">Get-Content</span> (cat)    - Read file/post content\n' +
                   '  <span class="cmd-out-help">Get-Location</span> (pwd)  - Current path\n' +
                   '  <span class="cmd-out-help">Get-Command</span> (gcm)    - List commands\n' +
                   '  <span class="cmd-out-help">Get-History</span> (history) - Command history\n' +
                   '  <span class="cmd-out-help">Get-MOTD</span> (motd)      - Show welcome art\n' +
                   '  <span class="cmd-out-help">Clear-Host</span> (cls)     - Clear screen\n' +
                   '  <span class="cmd-out-help">Get-Date</span>            - Current date\n' +
                   '  <span class="cmd-out-help">Get-WhoAmI</span> (whoami)    - User info\n' +
                   '  <span class="cmd-out-help">Exit</span>                - Return to home';
        },
        'Get-Command': (args) => {
            const target = args[0];
            if (target) {
                const cmd = aliases[target.toLowerCase()] || Object.keys(commands).find(c => c.toLowerCase() === target.toLowerCase());
                if (cmd) {
                    return 'CommandType     Name\n-----------     ----\nCmdlet          ' + cmd;
                }
                return '<span class="cmd-out-error">Get-Command : The term \'' + target + '\' is not recognized.</span>';
            }
            let output = 'CommandType     Name\n-----------     ----\n';
            Object.keys(commands).sort().forEach(c => {
                output += 'Cmdlet          ' + c + '\n';
            });
            Object.keys(aliases).sort().forEach(a => {
                if (!a.includes('-')) output += 'Alias           ' + a + ' -> ' + aliases[a] + '\n';
            });
            return output;
        },
        'Get-Location': () => currentDir,
        'Get-WhoAmI': () => 'nathan-collins\\guest\nI am an IT generalist and practitioner in all regards. I really enjoy infrastructure as code, automation, iot, networking, information security, etc.',
        'Get-Date': () => new Date().toString(),
        'Clear-Host': () => { output.innerHTML = ''; return ''; },
        'Get-MOTD': () => getMotdHtml(),
        'Get-History': () => history.map((cmd, i) => '  ' + (i + 1) + '  ' + cmd).join('\n'),
        'Exit': () => { window.location.href = '{{ "/" | relative_url }}'; return 'Redirecting...'; },
        'Get-ChildItem': (args) => {
            const pathArg = args[0] || '.';
            const target = resolvePath(pathArg);
            if (fs[target]) {
                return fs[target].children.map(child => {
                    const fullChildPath = (target === 'C:' ? 'C:\\' : target + '\\') + child;
                    const isDir = fs[fullChildPath];
                    return isDir ? '<span class="cmd-out-help">[DIR] ' + child + '</span>' : child;
                }).join('\n');
            }
            const fileName = target.split('\\').pop();
            if (fileContentMap[fileName]) return fileName;
            return '<span class="cmd-out-error">Get-ChildItem : Cannot find path \'' + pathArg + '\' because it does not exist.</span>';
        },
        'Set-Location': (args) => {
            const path = args[0];
            if (!path || path === '~') { currentDir = ROOT; }
            else {
                const absolute = resolvePath(path);
                const fileName = absolute.split('\\').pop();
                if (fileContentMap[fileName] && postMap[fileName]) {
                    window.location.href = postMap[fileName];
                    return 'Opening post...';
                }
                if (fs[absolute] && fs[absolute].type === 'dir') { currentDir = absolute; }
                else { return '<span class="cmd-out-error">Set-Location : Cannot find path \'' + path + '\' because it does not exist.</span>'; }
            }
            promptDisplay.textContent = 'PS ' + currentDir + '>';
            return '';
        },
        'Get-Content': (args) => {
            const path = args[0];
            if (!path) return '<span class="cmd-out-error">Get-Content : Missing path.</span>';
            const absolute = resolvePath(path);
            const fileName = absolute.split('\\').pop();
            if (fileContentMap[fileName]) return fileContentMap[fileName];
            return '<span class="cmd-out-error">Get-Content : Cannot find path \'' + path + '\' because it does not exist.</span>';
        }
    };

    const aliases = {
        'help': 'Get-Help', 'cd': 'Set-Location', 'ls': 'Get-ChildItem', 'dir': 'Get-ChildItem',
        'pwd': 'Get-Location', 'cls': 'Clear-Host', 'clear': 'Clear-Host', 'history': 'Get-History',
        'whoami': 'Get-WhoAmI', 'date': 'Get-Date', 'motd': 'Get-MOTD', 'cat': 'Get-Content',
        'type': 'Get-Content', 'exit': 'Exit', 'gcm': 'Get-Command',
        'get-help': 'Get-Help', 'set-location': 'Set-Location', 'get-childitem': 'Get-ChildItem',
        'get-location': 'Get-Location', 'get-history': 'Get-History', 'get-motd': 'Get-MOTD',
        'clear-host': 'Clear-Host', 'get-date': 'Get-Date', 'get-whoami': 'Get-WhoAmI', 
        'get-content': 'Get-Content', 'get-command': 'Get-Command'
    };

    input.addEventListener('keydown', (e) => {
        if (e.key === 'Tab') { e.preventDefault(); handleTabCompletion(); }
        else if (e.key === 'Enter') { handleCommand(); }
        else if (e.key === 'ArrowUp') { e.preventDefault(); navigateHistory(1); }
        else if (e.key === 'ArrowDown') { e.preventDefault(); navigateHistory(-1); }
        else { lastTabInput = ''; currentTabMatches = []; }
    });

    function navigateHistory(direction) {
        if (history.length === 0) return;
        historyIndex = Math.min(Math.max(historyIndex + direction, -1), history.length - 1);
        input.value = historyIndex === -1 ? '' : history[history.length - 1 - historyIndex];
    }

    function handleTabCompletion() {
        const val = input.value;
        const parts = val.split(' ');
        const lastPart = parts[parts.length - 1] || '';
        if (lastTabInput !== val || currentTabMatches.length === 0) {
            let pool = [];
            if (parts.length === 1) {
                pool = [...Object.keys(commands), ...Object.keys(aliases)];
            } else {
                let dirPart = '.';
                if (lastPart.includes('\\')) {
                    const lastSlash = lastPart.lastIndexOf('\\');
                    dirPart = lastPart.substring(0, lastSlash);
                    if (dirPart.endsWith(':')) dirPart += '\\';
                }
                const resolvedDir = resolvePath(dirPart);
                if (fs[resolvedDir]) {
                    pool = fs[resolvedDir].children.map(c => {
                        let prefix = lastPart.includes('\\') ? lastPart.substring(0, lastPart.lastIndexOf('\\') + 1) : '';
                        return prefix + c;
                    });
                }
            }
            const searchLower = lastPart.toLowerCase();
            currentTabMatches = pool.filter(m => m.toLowerCase().startsWith(searchLower));
            tabMatchIndex = 0;
            lastTabInput = val;
        } else {
            tabMatchIndex = (tabMatchIndex + 1) % currentTabMatches.length;
        }
        if (currentTabMatches.length > 0) {
            parts[parts.length - 1] = currentTabMatches[tabMatchIndex];
            input.value = parts.join(' ');
            lastTabInput = input.value;
        }
    }

    function handleCommand() {
        const raw = input.value.trim();
        if (raw) { history.push(raw); historyIndex = -1; }
        const parts = raw.split(' ');
        const inputCmd = parts[0];
        const cmd = aliases[inputCmd.toLowerCase()] || Object.keys(commands).find(c => c.toLowerCase() === inputCmd.toLowerCase());
        const args = parts.slice(1);
        const line = document.createElement('div');
        line.innerHTML = '<span class="terminal-prompt">PS ' + currentDir + '></span> ' + raw;
        output.appendChild(line);
        if (cmd && commands[cmd]) {
            const res = commands[cmd](args);
            if (res) {
                const resLine = document.createElement('div');
                resLine.innerHTML = res.replace(/\n/g, '<br>');
                output.appendChild(resLine);
            }
        } else if (raw) {
            const errLine = document.createElement('div');
            errLine.className = 'cmd-out-error';
            errLine.textContent = "The term '" + inputCmd + "' is not recognized.";
            output.appendChild(errLine);
        }
        input.value = '';
        body.scrollTop = body.scrollHeight;
    }
    body.addEventListener('click', () => input.focus());
});
</script>

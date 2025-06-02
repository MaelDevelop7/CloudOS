let windowCount = 0;

function createWindow(title, contentToOpen = null) {
    const win = document.createElement("div");
    win.className = "window";
    win.style.zIndex = 10 + windowCount++;
    win.style.left = `${50 + windowCount * 20}px`;
    win.style.top = `${50 + windowCount * 20}px`;

    let isMaximized = false;
    let prevSize = { width: '', height: '', left: '', top: '' };

    const bar = document.createElement("div");
    bar.className = "title-bar";

    const titleSpan = document.createElement("span");
    titleSpan.textContent = title;

    const closeBtn = document.createElement("button");
    closeBtn.textContent = "X";
    closeBtn.onclick = () => {
        win.remove();
        win.dispatchEvent(new Event("remove")); // Pour permettre le nettoyage
    };

    bar.appendChild(titleSpan);
    bar.appendChild(closeBtn);
    win.appendChild(bar);

    bar.ondblclick = () => {
        if (!isMaximized) {
            prevSize.width = win.style.width;
            prevSize.height = win.style.height;
            prevSize.left = win.style.left;
            prevSize.top = win.style.top;

            win.style.left = "0px";
            win.style.top = "0px";
            win.style.width = "100vw";
            win.style.height = "100vh";
            isMaximized = true;
        } else {
            win.style.left = prevSize.left;
            win.style.top = prevSize.top;
            win.style.width = prevSize.width || "auto";
            win.style.height = prevSize.height || "auto";
            isMaximized = false;
        }
    };

    const content = document.createElement("div");
    content.className = "window-content";

    if (title === "Notepad") {
        const textarea = document.createElement("textarea");
        textarea.style.width = "100%";
        textarea.style.height = "150px";
        textarea.value = contentToOpen !== null ? contentToOpen : localStorage.getItem("notepad") || "";

        const saveBtn = document.createElement("button");
        saveBtn.textContent = "Save";
        saveBtn.onclick = () => {
            localStorage.setItem("notepad", textarea.value);
            console.log("Saved!");
        };

        content.appendChild(textarea);
        content.appendChild(document.createElement("br"));
        content.appendChild(saveBtn);

    } else if (title === "Terminal") {
        const output = document.createElement("div");
        output.style.height = "150px";
        output.style.overflowY = "auto";
        output.style.background = "#000";
        output.style.color = "#0f0";
        output.style.fontFamily = "monospace";
        output.style.padding = "5px";
        output.innerHTML = `<div>Welcome to CloudTerminal. Type 'help'.</div>`;

        const input = document.createElement("input");
        input.type = "text";
        input.style.width = "100%";
        input.style.fontFamily = "monospace";

        input.addEventListener("keydown", (e) => {
            if (e.key === "Enter") {
                const cmd = input.value.trim();
                const response = handleCommand(cmd, createWindow);
                output.innerHTML += `<div><span style="color:#0ff;">$ ${cmd}</span></div>`;
                if (response === "<clear>") {
                    output.innerHTML = "";
                } else {
                    output.innerHTML += `<div style="white-space: pre-wrap;">${response}</div>`;
                }
                output.scrollTop = output.scrollHeight;
                input.value = "";
            }
        });

        content.appendChild(output);
        content.appendChild(input);

    } else if (title === "Files") {
        const fileList = document.createElement("ul");
        fileList.style.listStyle = "none";
        fileList.style.padding = "0";

        function refreshFileList() {
            fileList.innerHTML = "";
            const files = JSON.parse(localStorage.getItem("files") || "[]");
            if (files.length === 0) {
                fileList.innerHTML = "<li>No files created.</li>";
            } else {
                files.forEach((file, index) => {
                    const li = document.createElement("li");
                    li.style.marginBottom = "5px";

                    const nameSpan = document.createElement("span");
                    nameSpan.textContent = file.name;
                    nameSpan.style.cursor = "pointer";
                    nameSpan.style.marginRight = "10px";
                    nameSpan.onclick = () => {
                        createWindow("Notepad", file.content);
                    };

                    const delBtn = document.createElement("button");
                    delBtn.textContent = "Delete";
                    delBtn.onclick = () => {
                        files.splice(index, 1);
                        localStorage.setItem("files", JSON.stringify(files));
                        refreshFileList();
                    };

                    li.appendChild(nameSpan);
                    li.appendChild(delBtn);
                    fileList.appendChild(li);
                });
            }
        }

        const nameInput = document.createElement("input");
        nameInput.placeholder = "File Name";
        nameInput.style.marginRight = "5px";

        const contentInput = document.createElement("input");
        contentInput.placeholder = "Content";
        contentInput.style.marginRight = "5px";

        const addBtn = document.createElement("button");
        addBtn.textContent = "Create";
        addBtn.onclick = () => {
            const files = JSON.parse(localStorage.getItem("files") || "[]");
            if (files.some(f => f.name === nameInput.value)) {
                console.log("File already exists");
                return;
            }
            files.push({ name: nameInput.value, content: contentInput.value });
            localStorage.setItem("files", JSON.stringify(files));
            nameInput.value = "";
            contentInput.value = "";
            refreshFileList();
        };

        content.appendChild(nameInput);
        content.appendChild(contentInput);
        content.appendChild(addBtn);
        content.appendChild(document.createElement("hr"));
        content.appendChild(fileList);
        refreshFileList();

    } else if (title === "TicTacToe") {
        const iframeContainer = document.createElement("div");
        iframeContainer.classList.add("iframe-container");

        const iframe = document.createElement("iframe");
        iframe.src = "https://maelgruand1.github.io/TicTac-Game/";
        iframe.title = "Tic Tac Toe Game";
        iframe.setAttribute("allowfullscreen", "");

        iframeContainer.appendChild(iframe);
        content.appendChild(iframeContainer);
        win.style.width = '350px';
        win.style.height = '500px';

    } else if (title === "Navigateur") {
        const iframeContainer = document.createElement("div");
        iframeContainer.classList.add("iframe-container");

        const searchDiv = document.createElement("div");
        searchDiv.style.marginBottom = "10px";
        searchDiv.style.display = "flex";

        const searchInput = document.createElement("input");
        searchInput.type = "text";
        searchInput.placeholder = "Recherche Wikipédia...";
        searchInput.style.flexGrow = "1";

        const searchBtn = document.createElement("button");
        searchBtn.textContent = "Go";
        searchBtn.onclick = () => {
            const query = encodeURIComponent(searchInput.value.trim());
            if (query) iframe.src = `https://fr.wikipedia.org/wiki/${query}`;
        };

        searchDiv.appendChild(searchInput);
        searchDiv.appendChild(searchBtn);

        const iframe = document.createElement("iframe");
        iframe.src = "https://fr.wikipedia.org/wiki/Accueil";
        iframe.title = "Navigateur Wikipédia";
        iframe.style.flexGrow = "1";
        iframe.style.border = "none";

        iframeContainer.appendChild(searchDiv);
        iframeContainer.appendChild(iframe);
        content.appendChild(iframeContainer);

        win.style.width = '600px';
        win.style.height = '500px';

    } else if (title === "Paramètres") {
        const tabContainer = document.createElement("div");
        const tabButtons = document.createElement("div");
        const tabContent = document.createElement("div");

        tabButtons.style.display = "flex";
        tabButtons.style.gap = "10px";
        tabButtons.style.marginBottom = "10px";

        const performancesBtn = document.createElement("button");
        performancesBtn.textContent = "Performances";

        const contentPerformance = document.createElement("div");
        contentPerformance.style.fontFamily = "monospace";
        contentPerformance.style.whiteSpace = "pre-wrap";
        contentPerformance.textContent = "Chargement...";

        function updatePerformance() {
            const cores = navigator.hardwareConcurrency || "Inconnu";
            const memory = navigator.deviceMemory || "Inconnu";
            const usedJSHeap = performance.memory ? (performance.memory.usedJSHeapSize / 1024 / 1024).toFixed(2) : "Inconnu";
            const totalJSHeap = performance.memory ? (performance.memory.totalJSHeapSize / 1024 / 1024).toFixed(2) : "Inconnu";

            contentPerformance.textContent = `
CPU Cores      : ${cores}
RAM disponible : ${memory} GB
JS Heap used   : ${usedJSHeap} MB
JS Heap total  : ${totalJSHeap} MB
            `;
        }

        updatePerformance();
        const interval = setInterval(updatePerformance, 1000);
        win.addEventListener("remove", () => clearInterval(interval));

        performancesBtn.onclick = () => {
            tabContent.innerHTML = "";
            tabContent.appendChild(contentPerformance);
        };

        tabButtons.appendChild(performancesBtn);
        tabContent.appendChild(contentPerformance);
        tabContainer.appendChild(tabButtons);
        tabContainer.appendChild(tabContent);
        content.appendChild(tabContainer);

        win.style.width = "350px";
        win.style.height = "220px";
    }

    win.appendChild(content);

    // Drag and drop
    let isDragging = false;
    let dragOffsetX = 0;
    let dragOffsetY = 0;

    bar.addEventListener("mousedown", (e) => {
        isDragging = true;
        dragOffsetX = e.clientX - win.offsetLeft;
        dragOffsetY = e.clientY - win.offsetTop;
        win.style.cursor = "grabbing";
        bar.style.cursor = "grabbing";
        win.style.zIndex = 10000;
    });

    window.addEventListener("mouseup", () => {
        if (isDragging) {
            isDragging = false;
            win.style.cursor = "default";
            bar.style.cursor = "grab";
            win.style.zIndex = 10 + windowCount++;
        }
    });

    window.addEventListener("mousemove", (e) => {
        if (isDragging) {
            win.style.left = e.clientX - dragOffsetX + "px";
            win.style.top = e.clientY - dragOffsetY + "px";
        }
    });

    document.getElementById("desktop").appendChild(win);
}

function handleCommand(command, createWindowFn) {
    const cmd = command.toLowerCase();

    if (cmd === "help") {
        return `
Available commands:
- help       : Show this help message
- clear      : Clear the terminal output
- notepad    : Open Notepad window
- neofetch   : Display system info
- tictactoe  : Open Tic Tac Toe game
- browser    : Open Wikipedia browser
- files      : Open Files manager
- settings   : Open settings
        `;
    } else if (cmd === "clear") {
        return "<clear>";
    } else if (cmd === "notepad") {
        createWindowFn("Notepad");
        return "Opening Notepad...";
    } else if (cmd === "tictactoe") {
        createWindowFn("TicTacToe");
        return "Opening Tic Tac Toe...";
    } else if (cmd === "browser") {
        createWindowFn("Navigateur");
        return "Opening Browser...";
    } else if (cmd === "files") {
        createWindowFn("Files");
        return "Opening Files manager...";
    } else if (cmd === "settings") {
        createWindowFn("Paramètres");
        return "Opening Settings...";
    } else if (cmd === "neofetch") {
        const ua = navigator.userAgent;
        const platform = navigator.platform;
        const language = navigator.language;
        const cores = navigator.hardwareConcurrency || "Inconnu";
        const memory = navigator.deviceMemory || "Inconnu";
        return `
CloudOS v1.0
--------------
Platform : ${platform}
Lang     : ${language}
Cores    : ${cores}
Memory   : ${memory} GB
Browser  : ${ua}
        `;
    }

    return `Command not found: ${command}`;
}

// main.js - Fichier principal de gestion du système d'exploitation Web

// Importations nécessaires (assurez-vous que ces fichiers existent et sont accessibles)
import { User, Auth } from './utils/users.js';
// errorCredentials et errVide sont importés mais non utilisés directement dans ce code pour l'instant
import { errVide, errorCredentials } from './utils/Errors.js'; 

// Initialisation du compteur de fenêtres pour le z-index et le positionnement
let windowCount = 0;

// Global variable for installed apps, loaded from localStorage
let installedWebApps = JSON.parse(localStorage.getItem('installedWebApps') || '[]');

/**
 * Gère les commandes entrées dans le terminal.
 * Cette fonction est déplacée dans la portée globale pour être accessible par `createWindow`.
 * @param {string} command - La commande entrée par l'utilisateur.
 * @param {function} createWindowFn - La fonction pour créer des fenêtres.
 * @returns {string} La réponse à afficher dans le terminal.
 */
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
- installer  : Open Web App Installer
        `; // Added installer command
    } else if (cmd === "clear") {
        return "<clear>";
    } else if (cmd === "notepad") {
        createWindowFn("Notepad");
        return "Opening Notepad...";
    } else if (cmd === "tictactoe") {
        createWindowFn("Tic Tac Toe");
        return "Opening Tic Tac Toe...";
    } else if (cmd === "browser") {
        createWindowFn("Browser");
        return "Opening Browser...";
    } else if (cmd === "files") {
        createWindowFn("Files");
        return "Opening Files manager...";
    } else if (cmd === "settings") {
        createWindowFn("Paramètres"); 
        return "Opening Settings...";
    } else if (cmd === "installer") { // New command
        createWindowFn("Installer");
        return "Opening Web App Installer...";
    } else if (cmd === "neofetch") {
        const ua = navigator.userAgent;
        const platform = "CloudOS";
        const version = 1.0;
        const language = "English"; 
        const cores = navigator.hardwareConcurrency || "Inconnu";
        const memory = navigator.deviceMemory ? `${navigator.deviceMemory} GB` : "Inconnu";

        return `
CloudOS v1.0
--------------
Platform : ${platform}
Version  : ${version}
Lang     : ${language}

Cores    : ${cores}
Memory   : ${memory}
Browser  : ${ua}
        `;
    }

    return `Command not found: ${command}`;
}

/**
 * Crée et gère une nouvelle fenêtre d'application.
 * Cette fonction est déplacée dans la portée globale pour être accessible par les écouteurs d'événements JavaScript.
 * @param {string} title - Le titre de la fenêtre.
 * @param {string|null} contentToOpen - Contenu initial pour certaines applications (ex: Notepad, ou URL pour web apps).
 * @returns {HTMLElement} La fenêtre créée (div).
 */
function createWindow(title, contentToOpen = null) {
    console.log(`Tentative de créer une fenêtre: ${title}`); // Log initial

    const win = document.createElement("div");
    win.className = "window";
    win.style.zIndex = 10 + windowCount++; // Gère l'ordre d'affichage des fenêtres
    win.style.left = `${50 + windowCount * 20}px`; // Positionnement initial
    win.style.top = `${50 + windowCount * 20}px`;

    let isMaximized = false;
    let prevSize = { width: '', height: '', left: '', top: '' }; // Pour la restauration après maximisation

    // Création de la barre de titre
    const bar = document.createElement("div");
    bar.className = "title-bar";

    const titleSpan = document.createElement("span");
    titleSpan.textContent = title;

    const closeBtn = document.createElement("button");
    closeBtn.textContent = "X";
    closeBtn.onclick = () => {
        win.remove(); // Supprime la fenêtre du DOM
        win.dispatchEvent(new Event("remove")); // Déclenche un événement personnalisé pour le nettoyage
    };

    bar.appendChild(titleSpan);
    bar.appendChild(closeBtn);
    win.appendChild(bar);

    // Double-clic sur la barre de titre pour maximiser/restaurer
    bar.ondblclick = () => {
        if (!isMaximized) {
            // Sauvegarde la taille et position actuelles avant de maximiser
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
            // Restaure la taille et position précédentes
            win.style.left = prevSize.left;
            win.style.top = prevSize.top;
            win.style.width = prevSize.width || "auto"; // Utilise "auto" si non défini
            win.style.height = prevSize.height || "auto";
            isMaximized = false;
        }
    };

    // Conteneur du contenu de la fenêtre
    const content = document.createElement("div");
    content.className = "window-content";
    // Pour les settings et l'installer, il est utile que le contenu ait une position relative
    content.style.position = 'relative'; 


    // Logique spécifique à chaque type de fenêtre
    if (title === "Notepad") {
        console.log("Création du contenu pour Notepad.");
        const textarea = document.createElement("textarea");
        textarea.style.width = "100%";
        textarea.style.height = "150px";
        textarea.value = contentToOpen !== null ? contentToOpen : localStorage.getItem("notepad") || "";
        console.log("Contenu initial du Notepad:", textarea.value);

        const saveBtn = document.createElement("button");
        saveBtn.textContent = "Save";
        saveBtn.onclick = () => {
            localStorage.setItem("notepad", textarea.value);
            console.log("Notepad saved!");
        };

        content.appendChild(textarea);
        content.appendChild(document.createElement("br"));
        content.appendChild(saveBtn);
        console.log("Contenu de Notepad après append:", content.innerHTML);

    } else if (title === "Terminal") {
        console.log("Création du contenu pour Terminal.");
        const output = document.createElement("div");
        output.style.height = "150px";
        output.style.overflowY = "auto";
        output.style.background = "#000";
        output.style.color = "#0f0";
        output.style.fontFamily = "monospace";
        output.style.padding = "5px";
        output.innerHTML = `<div>Welcome to CloudTerminal. Type 'help'.</div>`;
        console.log("Contenu initial du Terminal:", output.innerHTML);

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
        console.log("Contenu de Terminal après append:", content.innerHTML);

    } else if (title === "Files") {
        console.log("Création du contenu pour Files.");
        const fileList = document.createElement("ul");
        fileList.style.listStyle = "none";
        fileList.style.padding = "0";

        // Fonction pour rafraîchir la liste des fichiers
        function refreshFileList() {
            fileList.innerHTML = "";
            const files = JSON.parse(localStorage.getItem("files") || "[]");
            console.log("Fichiers chargés pour Files:", files);
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
            console.log("Contenu de Files après refresh:", fileList.innerHTML);
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
        console.log("Contenu de Files après append initial:", content.innerHTML);

    } else if (title === "Tic Tac Toe") { 
        console.log(`Création du contenu pour Tic Tac Toe (iframe). Titre reçu: "${title}"`);
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
        console.log("Contenu de Tic Tac Toe (iframe) après append:", content.innerHTML);

    } else if (title === "Paramètres" || title === "Settings") { 
        console.log("Création du contenu pour Paramètres/Settings.");
        const tabContainer = document.createElement("div");
        const tabHeader = document.createElement("div"); 
        tabHeader.style.display = "flex";
        tabHeader.style.justifyContent = "space-between";
        tabHeader.style.alignItems = "center";
        tabHeader.style.marginBottom = "10px";

        const tabButtons = document.createElement("div");
        tabButtons.style.display = "flex";
        tabButtons.style.gap = "10px";

        const tabContent = document.createElement("div");
        tabContent.style.flexGrow = "1";

        const performancesBtn = document.createElement("button");
        performancesBtn.textContent = "Performances";
        tabButtons.appendChild(performancesBtn);

        const logoutBtn = document.createElement("button"); 
        logoutBtn.id = "logout-button-settings"; 
        logoutBtn.textContent = "Déconnexion";
        logoutBtn.className = "ml-auto";
        
        tabHeader.appendChild(tabButtons);
        tabHeader.appendChild(logoutBtn);

        content.appendChild(tabHeader); 

        logoutBtn.addEventListener("click", () => {
            localStorage.removeItem("loggedIn"); 
            localStorage.removeItem("username"); 
            location.reload(); 
        });

        const contentPerformance = document.createElement("div");
        contentPerformance.style.fontFamily = "monospace";
        contentPerformance.style.padding = "10px"; 
        contentPerformance.style.lineHeight = "1.5"; 
        contentPerformance.style.background = "#2a2a2a"; 
        contentPerformance.style.borderRadius = "5px"; 
        contentPerformance.style.display = "flex";
        contentPerformance.style.flexDirection = "column";
        contentPerformance.textContent = "Chargement...";

        function updatePerformance() {
            const cores = navigator.hardwareConcurrency || "Inconnu";
            const memory = navigator.deviceMemory ? `${navigator.deviceMemory} GB` : "Inconnu"; 
            const usedJSHeap = performance.memory ? (performance.memory.usedJSHeapSize / 1024 / 1024).toFixed(2) : "Inconnu";
            const totalJSHeap = performance.memory ? (performance.memory.totalJSHeapSize / 1024 / 1024).toFixed(2) : "Inconnu";

            contentPerformance.innerHTML = ''; 

            const data = [
                { label: "CPU Cores", value: cores },
                { label: "Available memory", value: memory },
                { label: "JS Heap used", value: `${usedJSHeap} MB` },
                { label: "JS Heap total", value: `${totalJSHeap} MB` }
            ];

            data.forEach(item => {
                const line = document.createElement("div");
                line.style.display = "flex";
                line.style.justifyContent = "space-between";
                line.style.width = "100%";

                const labelSpan = document.createElement("span");
                labelSpan.textContent = item.label;
                const valueSpan = document.createElement("span");
                valueSpan.textContent = `: ${item.value}`;

                line.appendChild(labelSpan);
                line.appendChild(valueSpan);
                contentPerformance.appendChild(line);
            });
        }

        updatePerformance();
        const interval = setInterval(updatePerformance, 1000);
        win.addEventListener("remove", () => clearInterval(interval));

        performancesBtn.onclick = () => {
            tabContent.innerHTML = "";
            tabContent.appendChild(contentPerformance);
        };

        tabContainer.appendChild(tabContent);
        content.appendChild(tabContainer);

        win.style.width = "400px";
        win.style.height = "280px";
        console.log("Contenu de Paramètres après append:", content.innerHTML);
    } else if (title === "Installer") { // NEW APP: Web App Installer
        console.log("Création du contenu pour Installer.");
        const inputContainer = document.createElement("div");
        inputContainer.className = "flex flex-col gap-3 p-4 bg-gray-800 rounded-lg shadow-inner"; // Tailwind for styling

        const appNameInput = document.createElement("input");
        appNameInput.placeholder = "Nom de l'application (ex: Google Docs)";
        appNameInput.className = "p-2 rounded-md bg-gray-700 text-white border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500";

        const appUrlInput = document.createElement("input");
        appUrlInput.type = "url";
        appUrlInput.placeholder = "URL de l'application (ex: https://docs.google.com)";
        appUrlInput.className = "p-2 rounded-md bg-gray-700 text-white border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500";

        const installBtn = document.createElement("button");
        installBtn.textContent = "Installer l'application";
        installBtn.className = "bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-md shadow-md transition duration-200 ease-in-out";

        const messageDiv = document.createElement("div");
        messageDiv.className = "text-sm mt-2 text-center";

        inputContainer.appendChild(appNameInput);
        inputContainer.appendChild(appUrlInput);
        inputContainer.appendChild(installBtn);
        inputContainer.appendChild(messageDiv);
        content.appendChild(inputContainer);

        const installedAppsListDiv = document.createElement("div");
        installedAppsListDiv.className = "mt-4 overflow-y-auto max-h-48 p-2 bg-gray-800 rounded-lg shadow-inner"; // Scrollable list
        content.appendChild(installedAppsListDiv);

        // Function to render / re-render the list of installed apps
        const renderInstalledApps = () => {
            installedAppsListDiv.innerHTML = ''; // Clear previous list
            if (installedWebApps.length === 0) {
                installedAppsListDiv.textContent = "Aucune application installée. Utilisez les champs ci-dessus pour en ajouter une.";
                installedAppsListDiv.style.color = "#aaa";
                installedAppsListDiv.style.textAlign = "center";
                return;
            }

            installedWebApps.forEach((app, index) => {
                const appEntry = document.createElement("div");
                appEntry.className = "flex items-center justify-between p-2 my-1 bg-gray-700 rounded-md shadow-sm text-white";

                const appInfo = document.createElement("div"); // Changed to div to hold icon and text
                appInfo.className = "flex items-center flex-grow mr-2"; // Use flex for icon and text

                const appIcon = document.createElement("img");
                appIcon.src = app.icon || 'https://placehold.co/32x32/cccccc/000000?text=🌐'; // Fallback icon
                appIcon.onerror = function() {
                    this.onerror = null; // Prevent infinite loop if fallback also fails
                    this.src = 'https://placehold.co/32x32/cccccc/000000?text=🌐'; // Final fallback to a placeholder
                    this.style.width = '20px'; // Ensure fallback is sized correctly
                    this.style.height = '20px';
                };
                appIcon.classList.add('w-5', 'h-5', 'mr-2'); // Tailwind classes for sizing and margin

                const appNameSpan = document.createElement("span");
                appNameSpan.textContent = app.name;
                appNameSpan.className = "truncate"; // Truncate long names
                appNameSpan.title = app.url; // Show URL on hover

                appInfo.appendChild(appIcon);
                appInfo.appendChild(appNameSpan);

                const actionsDiv = document.createElement("div");
                actionsDiv.className = "flex gap-2";

                const launchBtn = document.createElement("button");
                launchBtn.textContent = "Lancer";
                launchBtn.className = "bg-green-500 hover:bg-green-600 text-white text-xs px-3 py-1 rounded-md shadow-md transition duration-200 ease-in-out";
                launchBtn.onclick = () => {
                    createWindow(app.name, app.url); // Re-use createWindow for launching installed web apps
                };

                const uninstallBtn = document.createElement("button");
                uninstallBtn.textContent = "Désinstaller";
                uninstallBtn.className = "bg-red-500 hover:bg-red-600 text-white text-xs px-3 py-1 rounded-md shadow-md transition duration-200 ease-in-out";
                uninstallBtn.onclick = () => {
                    installedWebApps.splice(index, 1); // Remove app from array
                    localStorage.setItem('installedWebApps', JSON.stringify(installedWebApps)); // Update localStorage
                    renderInstalledApps(); // Re-render the list
                    rebuildContextMenu(); // Update context menu after uninstall
                    renderDesktopShortcuts(); // Update desktop shortcuts after uninstall
                    messageDiv.textContent = `"${app.name}" a été désinstallé.`;
                    messageDiv.style.color = "orange";
                };

                // NEW: Add a "Add to Desktop" button
                const addToDesktopBtn = document.createElement("button");
                addToDesktopBtn.textContent = "Ajouter au Bureau";
                addToDesktopBtn.className = "bg-indigo-500 hover:bg-indigo-600 text-white text-xs px-3 py-1 rounded-md shadow-md transition duration-200 ease-in-out";
                addToDesktopBtn.onclick = () => {
                    // This button doesn't add a new shortcut per se, but rather ensures the
                    // shortcut for this specific app is rendered on the desktop by triggering
                    // a full refresh of desktop shortcuts.
                    renderDesktopShortcuts(); 
                    messageDiv.textContent = `"${app.name}" a été ajouté au bureau.`;
                    messageDiv.style.color = "lightgreen";
                };


                actionsDiv.appendChild(launchBtn);
                actionsDiv.appendChild(uninstallBtn);
                actionsDiv.appendChild(addToDesktopBtn); // Add the "Add to Desktop" button
                appEntry.appendChild(appInfo);
                appEntry.appendChild(actionsDiv);
                installedAppsListDiv.appendChild(appEntry);
            });
        };

        installBtn.onclick = () => {
            const appName = appNameInput.value.trim();
            const appUrl = appUrlInput.value.trim();

            if (!appName || !appUrl) {
                messageDiv.textContent = "Veuillez remplir tous les champs.";
                messageDiv.style.color = "red";
                return;
            }
            // Basic URL validation and favicon extraction
            let faviconUrl = '';
            try {
                const urlObj = new URL(appUrl);
                faviconUrl = `https://www.google.com/s2/favicons?domain=${urlObj.hostname}`;
            } catch (e) {
                messageDiv.textContent = "URL invalide. Assurez-vous d'utiliser un format comme 'https://exemple.com'.";
                messageDiv.style.color = "red";
                console.error("Failed to parse URL for favicon:", e);
                return;
            }

            if (installedWebApps.some(app => app.name.toLowerCase() === appName.toLowerCase())) { // Case-insensitive check
                messageDiv.textContent = `Une application nommée "${appName}" existe déjà.`;
                messageDiv.style.color = "orange";
                return;
            }

            installedWebApps.push({ name: appName, url: appUrl, icon: faviconUrl }); // Store icon URL
            localStorage.setItem('installedWebApps', JSON.stringify(installedWebApps));
            messageDiv.textContent = `"${appName}" a été installé avec succès !`;
            messageDiv.style.color = "lightgreen"; // Updated color for success
            appNameInput.value = ""; // Clear inputs
            appUrlInput.value = "";
            renderInstalledApps(); // Re-render the list
            rebuildContextMenu(); // Update context menu after install
            renderDesktopShortcuts(); // Update desktop shortcuts after install
        };

        renderInstalledApps(); // Initial render when Installer window opens

        win.style.width = '700px'; // Adjust size for installer to accommodate new button
        win.style.height = '550px';
        console.log("Contenu de Installer après append:", content.innerHTML);
    } else if (title === "About CloudOS") {
        console.log("Création du contenu pour About CloudOS.");
        const aboutContent = document.createElement("div");
        aboutContent.textContent = "CloudOS v1.0\nDéveloppé par Mael Gruand Company !";
        content.appendChild(aboutContent);
        console.log("Contenu de About CloudOS après append:", content.innerHTML);
    }
    // Universal iframe handler for web apps (Tic Tac Toe, Browser, and newly installed apps)
    // This condition should be last to avoid catching other app titles
    else if (contentToOpen && typeof contentToOpen === 'string' && (contentToOpen.startsWith('http://') || contentToOpen.startsWith('https://'))) {
        console.log(`Création d'une fenêtre iframe pour l'URL: ${contentToOpen} avec le titre: ${title}`);

        // Check for common non-embeddable sites
        // List of domains that typically disallow embedding
        const nonEmbeddableDomains = [
            'google.com', 'youtube.com', 'facebook.com', 'instagram.com',
            'twitter.com', 'x.com', 'linkedin.com', 'amazon.com',
            'netflix.com', 'apple.com', 'microsoft.com'
        ];

        const isNonEmbeddable = nonEmbeddableDomains.some(domain => contentToOpen.includes(domain));

        if (isNonEmbeddable) {
            console.warn(`Le site ${contentToOpen} ne peut généralement pas être intégré dans une iframe pour des raisons de sécurité.`);
            // Instead of embedding, we'll create a simple message and a button to open in a new tab.
            const messageDiv = document.createElement("div");
            messageDiv.className = "flex flex-col items-center justify-center h-full text-center text-gray-300 p-4";
            messageDiv.innerHTML = `
                <p class="mb-4 text-lg font-semibold">Impossible d'afficher cette application ici.</p>
                <p class="mb-6">Le site "${title}" (${contentToOpen}) ne peut pas être intégré directement pour des raisons de sécurité de votre navigateur.</p>
                <button class="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-md shadow-md transition duration-200 ease-in-out">
                    Ouvrir "${title}" dans un nouvel onglet
                </button>
            `;
            const openNewTabBtn = messageDiv.querySelector('button');
            openNewTabBtn.onclick = () => {
                window.open(contentToOpen, '_blank');
                win.remove(); // Close the current window as it's not useful
            };
            content.appendChild(messageDiv);
            win.style.width = '450px'; // Adjusted width for message
            win.style.height = '250px'; // Adjusted height for message
        } else {
            // Proceed with iframe for other URLs that might allow embedding
            const iframeContainer = document.createElement("div");
            iframeContainer.classList.add("iframe-container");
            iframeContainer.style.flexGrow = "1";
            iframeContainer.style.width = "100%";
            iframeContainer.style.height = "100%";
            iframeContainer.style.display = "flex"; // Use flex to make iframe fill container

            const iframe = document.createElement("iframe");
            iframe.src = contentToOpen;
            iframe.title = title;
            iframe.style.flexGrow = "1";
            iframe.style.border = "none";
            iframe.style.width = "100%";
            iframe.style.height = "100%";

            iframeContainer.appendChild(iframe);
            content.appendChild(iframeContainer);

            win.style.width = '800px'; // Default size for general web apps
            win.style.height = '600px';
        }
        console.log(`Fenêtre iframe pour "${title}" créée. Contenu:`, content.innerHTML);
    }


    win.appendChild(content);
    console.log(`Fenêtre ${title} créée. Contenu final de la fenêtre:`, win.innerHTML); 

    // Fonctionnalité de glisser-déposer pour les fenêtres
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

    // Utilise window pour s'assurer que le glisser-déposer fonctionne même si la souris sort de la fenêtre
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

    const desktopElement = document.getElementById("desktop"); 
    if (desktopElement) {
        desktopElement.appendChild(win); 
    }
    return win; // Return the created window element
}

/**
 * Rebuilds the context menu dynamically to include installed web apps.
 * This function should be called after installedWebApps array changes.
 */
function rebuildContextMenu() {
    const desktop = document.getElementById("desktop");
    const contextMenu = document.getElementById("context-menu");
    if (!desktop || !contextMenu) return; 

    contextMenu.innerHTML = ""; // Clear existing menu items

    const baseMenuItems = [
        { label: "📝 Notepad", action: () => createWindow("Notepad") },
        { label: "💻 Terminal", action: () => createWindow("Terminal") },
        { label: "🗂️ Files", action: () => createWindow("Files") },
        { label: "🌐 Browser", action: () => createWindow("Browser") },
        { label: "⚙️ Settings", action: () => createWindow("Paramètres") },
        { label: "📦 Installer", action: () => createWindow("Installer") }, // Add installer to context menu
        { label: "ℹ️ About", action: () => {
            createWindow("About CloudOS");
        }}
    ];

    // Add base items
    for (const item of baseMenuItems) {
        const li = document.createElement("li");
        li.textContent = item.label;
        li.style.padding = "5px 15px";
        li.style.cursor = "pointer";
        li.onmouseenter = () => li.style.background = "#555";
        li.onmouseleave = () => li.style.background = "transparent";
        li.onclick = () => {
            item.action();
            contextMenu.style.display = "none";
        };
        contextMenu.appendChild(li);
    }

    // Add a separator if there are installed web apps
    if (installedWebApps.length > 0) {
        const separator = document.createElement("li");
        separator.style.height = "1px";
        separator.style.background = "#444";
        separator.style.margin = "5px 0";
        contextMenu.appendChild(separator);

        const installedAppsHeader = document.createElement("li");
        installedAppsHeader.textContent = "--- Applications installées ---";
        installedAppsHeader.style.padding = "5px 15px";
        installedAppsHeader.style.color = "#aaa";
        installedAppsHeader.style.fontWeight = "bold"; // Make header stand out
        contextMenu.appendChild(installedAppsHeader);


        installedWebApps.forEach(app => {
            const li = document.createElement("li");
            li.style.padding = "5px 15px";
            li.style.cursor = "pointer";
            li.onmouseenter = () => li.style.background = "#555";
            li.onmouseleave = () => li.style.background = "transparent";
            li.onclick = () => {
                createWindow(app.name, app.url); // Launch the installed app (title and URL)
                contextMenu.style.display = "none";
            };

            const appDisplay = document.createElement("div");
            appDisplay.className = "flex items-center gap-2";

            const appIcon = document.createElement("img");
            appIcon.src = app.icon || 'https://placehold.co/16x16/cccccc/000000?text=�'; // Fallback icon for menu
            appIcon.onerror = function() {
                this.onerror = null; 
                this.src = 'https://placehold.co/16x16/cccccc/000000?text=🌐'; 
                this.style.width = '16px'; 
                this.style.height = '16px';
            };
            appIcon.classList.add('w-4', 'h-4'); // Tailwind classes for sizing

            const appNameSpan = document.createElement("span");
            appNameSpan.textContent = app.name;
            
            appDisplay.appendChild(appIcon);
            appDisplay.appendChild(appNameSpan);
            li.appendChild(appDisplay);
            
            contextMenu.appendChild(li);
        });
    }
}

/**
 * Renders desktop shortcuts for all installed web applications.
 */
function renderDesktopShortcuts() {
    const desktop = document.getElementById("desktop");
    if (!desktop) return;

    // Remove all existing desktop shortcuts first to prevent duplicates
    desktop.querySelectorAll('.desktop-shortcut').forEach(shortcut => shortcut.remove());

    let shortcutCount = 0; // To position shortcuts
    const baseLeft = 20; // Initial left position
    const baseTop = 20; // Initial top position
    const spacingX = 100; // Horizontal spacing between shortcuts
    const spacingY = 100; // Vertical spacing between shortcuts
    const maxCols = 5; // Max columns before wrapping

    installedWebApps.forEach(app => {
        const shortcut = document.createElement("div");
        shortcut.className = "desktop-shortcut flex flex-col items-center justify-center p-2 rounded-lg cursor-pointer hover:bg-gray-700 hover:bg-opacity-50 transition-colors duration-150 ease-in-out";
        shortcut.style.position = "absolute";
        // Calculate position based on grid
        const col = shortcutCount % maxCols;
        const row = Math.floor(shortcutCount / maxCols);
        shortcut.style.left = `${baseLeft + col * spacingX}px`;
        shortcut.style.top = `${baseTop + row * spacingY}px`;
        shortcut.style.width = "80px"; // Fixed width for icons
        shortcut.style.height = "80px"; // Fixed height for icons
        shortcut.title = app.name; // Tooltip on hover
        shortcut.setAttribute('data-app-name', `${app.name.replace(/\s/g, '-')}-shortcut`); // Data attribute for unique identification

        // Icon (image for favicon)
        const iconImg = document.createElement("img");
        iconImg.src = app.icon || 'https://placehold.co/36x36/cccccc/000000?text=🌐'; // Fallback icon
        iconImg.onerror = function() {
            this.onerror = null; 
            this.src = 'https://placehold.co/36x36/cccccc/000000?text=🌐'; 
            this.style.width = '36px'; 
            this.style.height = '36px';
        };
        iconImg.classList.add('w-9', 'h-9', 'mb-1'); // Tailwind classes for sizing and margin

        const label = document.createElement("span");
        label.textContent = app.name;
        label.className = "text-white text-xs text-center truncate w-full"; // Ensure text truncates if too long

        shortcut.appendChild(iconImg); // Append the image icon
        shortcut.appendChild(label);

        shortcut.onclick = () => {
            createWindow(app.name, app.url); // Launch the app when clicked
        };

        desktop.appendChild(shortcut);
        shortcutCount++;
    });
}


// Le code qui doit s'exécuter après le chargement complet du DOM doit être dans un écouteur DOMContentLoaded.
document.addEventListener('DOMContentLoaded', () => {
    console.log("DOM entièrement chargé et analysé.");

    // Vérifie si l'utilisateur est déjà connecté
    const loginScreen = document.getElementById("login-screen");
    const desktop = document.getElementById("desktop");

    if (localStorage.getItem("loggedIn") === "true") {
        if (loginScreen) {
            loginScreen.remove(); 
        }
        if (desktop) {
            desktop.style.filter = "none"; 
        }
        renderDesktopShortcuts(); // Render shortcuts immediately if logged in
    } else {
        // Optionnel : flouter le bureau tant qu'on n'est pas connecté
        if (desktop) {
            desktop.style.filter = "blur(5px)"; 
        }

        // --- DÉBUT DU BLOC DE CONNEXION (Déplacé ici) ---
        // Seul exécuté si l'utilisateur N'EST PAS déjà connecté
        const user = new User("mael", "1234"); 

        const loginButton = document.getElementById("login-button");
        if (loginButton) { 
            loginButton.addEventListener("click", () => {
                const usernameInput = document.getElementById("login-username");
                const passwordInput = document.getElementById("login-password");
                const loginError = document.getElementById("login-error");

                if (usernameInput && passwordInput && loginError) {
                    const username = usernameInput.value;
                    const password = passwordInput.value;

                    const auth = new Auth(username, password, user); 

                    if (auth.verifyCredentials()) {
                        // ✅ Stocke une variable de session dans localStorage
                        localStorage.setItem("loggedIn", "true");
                        localStorage.setItem("username", username); 

                        if (loginScreen) {
                            loginScreen.remove(); 
                        }
                        if (desktop) {
                            desktop.style.filter = "none"; 
                        }
                        rebuildContextMenu(); // Rebuild menu after login for clarity
                        renderDesktopShortcuts(); // Render desktop shortcuts after login
                    } else {
                        loginError.textContent = "Nom d'utilisateur ou mot de passe incorrect."; 
                    }
                } else {
                    console.error("Un ou plusieurs éléments de connexion (inputs, error div) sont introuvables.");
                }
            });
        } else {
            console.error("Le bouton de connexion (login-button) est introuvable lorsque l'utilisateur n'est pas connecté. Vérifiez le HTML.");
        }
        // --- FIN DU BLOC DE CONNEXION ---
    }
    
    console.log("main.js chargé."); 

    // Rebuild context menu on initial load to include previously installed apps
    rebuildContextMenu();
    // renderDesktopShortcuts() is now called conditionally based on login state

    // Gestion du menu contextuel (clic droit sur le bureau)
    // The event listener now simply calls rebuildContextMenu on right-click
    if (desktop) {
        desktop.addEventListener("contextmenu", (e) => {
            e.preventDefault(); 
            rebuildContextMenu(); // Ensure the menu is up-to-date
            const contextMenu = document.getElementById("context-menu"); // Get it here as it's built
            if (contextMenu) {
                contextMenu.style.top = `${e.clientY}px`; 
                contextMenu.style.left = `${e.clientX}px`;
                contextMenu.style.display = "block"; 
            }
        });
    }

    // Cache le menu contextuel si l'utilisateur clique ailleurs sur le document
    document.addEventListener("click", (event) => {
        const contextMenu = document.getElementById("context-menu");
        if (contextMenu && !contextMenu.contains(event.target)) {
            contextMenu.style.display = "none";
        }
    });

    // --- BLOC POUR LES BOUTONS DE LA BARRE DES TÂCHES ---
    const taskbarElement = document.querySelector('.taskbar');
    if (taskbarElement) {
        const taskbarButtons = taskbarElement.querySelectorAll('button');
        console.log("Boutons de la barre des tâches trouvés:", taskbarButtons.length, taskbarButtons); 
        taskbarButtons.forEach(button => {
            const title = button.textContent.trim();
            button.addEventListener('click', () => {
                console.log(`Bouton de la barre des tâches cliqué: ${title}`); 
                createWindow(title);
            });
        });
    } else {
        console.error("L'élément de la barre des tâches (.taskbar) est introuvable.");
    }
    // --- FIN BLOC ---

}); // Fin de DOMContentLoaded

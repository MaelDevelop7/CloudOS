// main.js - Fichier principal de gestion du système d'exploitation Web

// Importations nécessaires (assurez-vous que ces fichiers existent et sont accessibles)
import { User, Auth } from './utils/users.js';
// errorCredentials et errVide sont importés mais non utilisés directement dans ce code pour l'instant
import { errVide, errorCredentials } from './utils/Errors.js'; 

// Initialisation du compteur de fenêtres pour le z-index et le positionnement
let windowCount = 0;

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
        `;
    } else if (cmd === "clear") {
        return "<clear>";
    } else if (cmd === "notepad") {
        createWindowFn("Notepad");
        return "Opening Notepad...";
    } else if (cmd === "tictactoe") {
        createWindowFn("Tic Tac Toe"); // <-- Changement ici pour correspondre au bouton HTML
        return "Opening Tic Tac Toe...";
    } else if (cmd === "browser") {
        createWindowFn("Browser"); // <-- CHANGEMENT ICI
        return "Opening Browser...";
    } else if (cmd === "files") {
        createWindowFn("Files");
        return "Opening Files manager...";
    } else if (cmd === "settings") {
        createWindowFn("Paramètres"); 
        return "Opening Settings...";
    } else if (cmd === "neofetch") {
        const ua = navigator.userAgent;
        const platform = "CloudOS";
        const version = 1.0;
        const language = "English"; // Ou détecter la langue du navigateur si souhaité
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
 * @param {string|null} contentToOpen - Contenu initial pour certaines applications (ex: Notepad).
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
    // Pour les settings, il est utile que le contenu ait une position relative
    // afin que les enfants en position absolute (comme le bouton logout)
    // soient positionnés par rapport à ce conteneur.
    content.style.position = 'relative'; // Assure que le contenu est la référence pour les enfants absolus


    // Logique spécifique à chaque type de fenêtre
    if (title === "Notepad") {
        console.log("Création du contenu pour Notepad.");
        const textarea = document.createElement("textarea");
        textarea.style.width = "100%";
        textarea.style.height = "150px";
        // Charge le contenu initial ou le contenu sauvegardé
        textarea.value = contentToOpen !== null ? contentToOpen : localStorage.getItem("notepad") || "";
        console.log("Contenu initial du Notepad:", textarea.value); // Log du contenu

        const saveBtn = document.createElement("button");
        saveBtn.textContent = "Save";
        saveBtn.onclick = () => {
            localStorage.setItem("notepad", textarea.value); // Sauvegarde dans le localStorage
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
                const response = handleCommand(cmd, createWindow); // Gère la commande entrée
                output.innerHTML += `<div><span style="color:#0ff;">$ ${cmd}</span></div>`;
                if (response === "<clear>") {
                    output.innerHTML = ""; // Vide la sortie du terminal
                } else {
                    output.innerHTML += `<div style="white-space: pre-wrap;">${response}</div>`;
                }
                output.scrollTop = output.scrollHeight; // Fait défiler jusqu'en bas
                input.value = ""; // Réinitialise l'entrée
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
            console.log("Fichiers chargés pour Files:", files); // Log des fichiers
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
                        createWindow("Notepad", file.content); // Ouvre le fichier dans Notepad
                    };

                    const delBtn = document.createElement("button");
                    delBtn.textContent = "Delete";
                    delBtn.onclick = () => {
                        files.splice(index, 1); // Supprime le fichier du tableau
                        localStorage.setItem("files", JSON.stringify(files)); // Met à jour le localStorage
                        refreshFileList(); // Rafraîchit l'affichage
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
                // Plutôt qu'un simple console.log, vous pourriez afficher une notification à l'utilisateur ici.
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
        refreshFileList(); // Appel initial pour afficher les fichiers existants
        console.log("Contenu de Files après append initial:", content.innerHTML);

    } else if (title === "Tic Tac Toe") { 
        console.log(`Création du contenu pour Tic Tac Toe (iframe). Titre reçu: "${title}"`); // LOG DE DEBUG
        const iframeContainer = document.createElement("div");
        iframeContainer.classList.add("iframe-container"); // Classe pour le style CSS

        const iframe = document.createElement("iframe");
        iframe.src = "https://maelgruand1.github.io/TicTac-Game/";
        iframe.title = "Tic Tac Toe Game";
        iframe.setAttribute("allowfullscreen", ""); // Permet le mode plein écran

        iframeContainer.appendChild(iframe);
        content.appendChild(iframeContainer);
        win.style.width = '350px'; // Taille fixe pour le jeu
        win.style.height = '500px';
        console.log("Contenu de Tic Tac Toe (iframe) après append:", content.innerHTML);

    } else if (title === "Navigateur" || title === "Browser") { // <-- CHANGEMENT ICI
        console.log("Création du contenu pour Navigateur/Browser (iframe Wikipédia).");
        const iframeContainer = document.createElement("div");
        iframeContainer.classList.add("iframe-container");

        const searchDiv = document.createElement("div");
        searchDiv.style.marginBottom = "10px";
        searchDiv.style.display = "flex";

        const searchInput = document.createElement("input");
        searchInput.type = "text";
        searchInput.placeholder = "Recherche Wikipédia...";
        searchInput.style.flexGrow = "1";

        const iframe = document.createElement("iframe"); // Déclarez iframe ici pour qu'elle soit accessible
        iframe.src = "https://fr.wikipedia.org/wiki/Accueil";
        iframe.title = "Navigateur Wikipédia";
        iframe.style.flexGrow = "1";
        iframe.style.border = "none";

        const searchBtn = document.createElement("button");
        searchBtn.textContent = "Go";
        searchBtn.onclick = () => {
            const query = encodeURIComponent(searchInput.value.trim());
            if (query) iframe.src = `https://fr.wikipedia.org/wiki/${query}`; // Met à jour l'iframe
        };

        searchDiv.appendChild(searchInput);
        searchDiv.appendChild(searchBtn);

        iframeContainer.appendChild(searchDiv);
        iframeContainer.appendChild(iframe);
        content.appendChild(iframeContainer);

        win.style.width = '600px'; // Taille fixe pour le navigateur
        win.style.height = '500px';
        console.log("Contenu de Navigateur (iframe) après append:", content.innerHTML);

    } else if (title === "Paramètres" || title === "Settings") { 
        console.log("Création du contenu pour Paramètres/Settings.");
        const tabContainer = document.createElement("div");
        // Les boutons des onglets et le bouton de déconnexion dans un flex container
        const tabHeader = document.createElement("div"); 
        tabHeader.style.display = "flex";
        tabHeader.style.justifyContent = "space-between"; // Aligne les éléments aux extrémités
        tabHeader.style.alignItems = "center"; // Centre verticalement
        tabHeader.style.marginBottom = "10px";

        const tabButtons = document.createElement("div");
        tabButtons.style.display = "flex";
        tabButtons.style.gap = "10px";

        const tabContent = document.createElement("div");
        tabContent.style.flexGrow = "1"; // Pour que le contenu prenne l'espace disponible

        const performancesBtn = document.createElement("button");
        performancesBtn.textContent = "Performances";
        tabButtons.appendChild(performancesBtn); // Ajout au conteneur des boutons d'onglets

        // Bouton de déconnexion
        const logoutBtn = document.createElement("button"); 
        logoutBtn.id = "logout-button-settings"; 
        // Style de positionnement ajusté: intégré dans le flux, pas absolu
        logoutBtn.textContent = "Déconnexion";
        logoutBtn.className = "ml-auto"; // Tailwind class for margin-left auto to push it right
        
        tabHeader.appendChild(tabButtons); // Ajout des boutons d'onglets au header
        tabHeader.appendChild(logoutBtn); // Ajout du bouton de déconnexion au header

        // Ajout du header au conteneur principal
        content.appendChild(tabHeader); 

        logoutBtn.addEventListener("click", () => {
            localStorage.removeItem("loggedIn"); 
            localStorage.removeItem("username"); 
            location.reload(); 
        });

        const contentPerformance = document.createElement("div");
        contentPerformance.style.fontFamily = "monospace";
        // contentPerformance.style.whiteSpace = "pre-wrap"; // Supprimé pour un alignement par flexbox
        contentPerformance.style.padding = "10px"; 
        contentPerformance.style.lineHeight = "1.5"; 
        contentPerformance.style.background = "#2a2a2a"; 
        contentPerformance.style.borderRadius = "5px"; 
        contentPerformance.style.display = "flex"; // Utilise flexbox pour l'alignement
        contentPerformance.style.flexDirection = "column"; // Empile les lignes verticalement
        contentPerformance.textContent = "Chargement..."; // Texte initial

        // Fonction pour mettre à jour les informations de performance
        function updatePerformance() {
            const cores = navigator.hardwareConcurrency || "Inconnu";
            const memory = navigator.deviceMemory ? `${navigator.deviceMemory} GB` : "Inconnu"; 
            const usedJSHeap = performance.memory ? (performance.memory.usedJSHeapSize / 1024 / 1024).toFixed(2) : "Inconnu";
            const totalJSHeap = performance.memory ? (performance.memory.totalJSHeapSize / 1024 / 1024).toFixed(2) : "Inconnu";

            // Nettoyer le contenu précédent avant de le remplir avec de nouvelles lignes
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
                line.style.justifyContent = "space-between"; // Aligne label à gauche, value à droite
                line.style.width = "100%"; // Prend toute la largeur disponible

                const labelSpan = document.createElement("span");
                labelSpan.textContent = item.label;
                const valueSpan = document.createElement("span");
                valueSpan.textContent = `: ${item.value}`; // Ajout du ":" ici

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

        tabContainer.appendChild(tabContent); // Ajout du contenu de l'onglet au conteneur principal
        content.appendChild(tabContainer); // Ajout du conteneur d'onglets au contenu de la fenêtre

        win.style.width = "400px"; // Augmenté la largeur pour un meilleur alignement
        win.style.height = "280px"; // Augmenté la hauteur
        console.log("Contenu de Paramètres après append:", content.innerHTML);
    } else if (title === "About CloudOS") {
        console.log("Création du contenu pour About CloudOS.");
        const aboutContent = document.createElement("div");
        aboutContent.textContent = "CloudOS v1.0\nDéveloppé par Mael Gruand Company !";
        content.appendChild(aboutContent);
        console.log("Contenu de About CloudOS après append:", content.innerHTML);
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

    // Gestion du menu contextuel (clic droit sur le bureau)
    const contextMenu = document.getElementById("context-menu");

    if (desktop) {
        desktop.addEventListener("contextmenu", (e) => {
            e.preventDefault(); 

            if (contextMenu) {
                contextMenu.innerHTML = ""; 

                const menuItems = [
                    { label: "📝 Notepad", action: () => createWindow("Notepad") },
                    { label: "💻 Terminal", action: () => createWindow("Terminal") },
                    { label: "🗂️ Files", action: () => createWindow("Files") },
                    { label: "🌐 Browser", action: () => createWindow("Navigateur") }, // Garde "Navigateur" pour le menu contextuel
                    { label: "⚙️ Settings", action: () => createWindow("Paramètres") },
                    { label: "ℹ️ About", action: () => {
                        createWindow("About CloudOS"); 
                    }}
                ];

                for (const item of menuItems) {
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

                contextMenu.style.top = `${e.clientY}px`; 
                contextMenu.style.left = `${e.clientX}px`;
                contextMenu.style.display = "block"; 
            }
        });
    }


    // Cache le menu contextuel si l'utilisateur clique ailleurs sur le document
    document.addEventListener("click", (event) => {
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

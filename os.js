let windowCount = 0;

export function createWindow(title, contentToOpen = null) {
  const win = document.createElement("div");
  win.className = "window";
  win.style.zIndex = 10 + windowCount++;
  win.style.left = `${50 + windowCount * 20}px`;
  win.style.top = `${50 + windowCount * 20}px`;

  const bar = document.createElement("div");
  bar.className = "title-bar";

  const titleSpan = document.createElement("span");
  titleSpan.textContent = title;

  const closeBtn = document.createElement("button");
  closeBtn.textContent = "X";
  closeBtn.onclick = () => win.remove();

  bar.appendChild(titleSpan);
  bar.appendChild(closeBtn);
  win.appendChild(bar);

  const content = document.createElement("div");
  content.style.padding = "10px";
  content.className = "window-content";

  if (title === "Bloc-notes") {
    const textarea = document.createElement("textarea");
    textarea.style.width = "100%";
    textarea.style.height = "150px";
    textarea.value = contentToOpen !== null ? contentToOpen : localStorage.getItem("notepad") || "";

    const saveBtn = document.createElement("button");
    saveBtn.textContent = "Enregistrer";
    saveBtn.onclick = () => {
      // Replaced alert with a simple console log or a custom message box if preferred
      console.log("Contenu enregistré !");
      localStorage.setItem("notepad", textarea.value);
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
    output.innerHTML = `<div>Bienvenue dans CloudTerminal. Tapez 'help'.</div>`;

    const input = document.createElement("input");
    input.type = "text";
    input.style.width = "100%";
    input.style.fontFamily = "monospace";
    input.style.padding = "4px";
    input.style.border = "none";
    input.style.outline = "none";

    input.addEventListener("keydown", (e) => {
      if (e.key === "Enter") {
        const cmd = input.value.trim();
        const response = handleCommand(cmd);
        output.innerHTML += `<div><span style="color:#0ff;">$ ${cmd}</span></div>`;
        if (response === "<clear>") {
          output.innerHTML = "";
        } else {
          output.innerHTML += `<div>${response}</div>`;
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
        fileList.innerHTML = "<li>Aucun fichier créé.</li>";
      } else {
        files.forEach((file, index) => {
          const li = document.createElement("li");
          li.style.marginBottom = "5px";

          const nameSpan = document.createElement("span");
          nameSpan.textContent = file.name;
          nameSpan.style.cursor = "pointer";
          nameSpan.style.marginRight = "10px";
          nameSpan.onclick = () => {
            // Replaced alert with a simple console log or a custom message box if preferred
            console.log(`Contenu de "${file.name}":\n\n${file.content}`);
          };

          const delBtn = document.createElement("button");
          delBtn.textContent = "Supprimer";
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
    nameInput.placeholder = "Nom du fichier";
    nameInput.style.marginRight = "5px";

    const contentInput = document.createElement("input");
    contentInput.placeholder = "Contenu";
    contentInput.style.marginRight = "5px";

    const addBtn = document.createElement("button");
    addBtn.textContent = "Créer";
    addBtn.onclick = () => {
      const files = JSON.parse(localStorage.getItem("files") || "[]");
      // Check if file already exists before adding
      if (files.some(f => f.name === nameInput.value)) {
        console.log(`Erreur: Le fichier "${nameInput.value}" existe déjà.`);
        return;
      }
      files.push({
        name: nameInput.value,
        content: contentInput.value
      });
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
  } else {
    content.innerHTML = `<p>Application "${title}" en cours...</p>`;
  }

  win.appendChild(content);
  makeDraggable(win);
  document.getElementById("desktop").appendChild(win);
}

function makeDraggable(el) {
  const bar = el.querySelector(".title-bar");
  let offsetX = 0,
    offsetY = 0,
    isDragging = false;

  bar.addEventListener("mousedown", (e) => {
    isDragging = true;
    offsetX = e.clientX - el.offsetLeft;
    offsetY = e.clientY - el.offsetTop;
    el.style.zIndex = 10 + windowCount++;
  });

  document.addEventListener("mousemove", (e) => {
    if (isDragging) {
      el.style.left = e.clientX - offsetX + "px";
      el.style.top = e.clientY - offsetY + "px";
    }
  });

  document.addEventListener("mouseup", () => {
    isDragging = false;
  });
}

// Updated allCommands to reflect new 'ls' behavior
const allCommands = "help, echo [texte], date, clear, notepad, whoami, apps, create [nom] [contenu], notepad [nom_fichier], ls";
const notepadBtn = `<button onclick="window.createWindow('Bloc-notes')">Bloc-Notes</button>`;
const terminalBtn = `<button onclick="window.createWindow('Terminal')">Terminal</button>`;
const fileManagerBtn = `<button onclick="window.createWindow('Files')">Files</button>`;
const allApps = `
  <div style="margin-top:5px;">${notepadBtn}</div>
  <div style="margin-top:5px;">${terminalBtn}</div>
  <div style="margin-top:5px;">${fileManagerBtn}</div>
`;

function handleCommand(cmd) {
  if (cmd === "help") {
    return `Commandes disponibles : ${allCommands}`;
  } else if (cmd.startsWith("echo ")) {
    return cmd.slice(5);
  } else if (cmd === "date") {
    return new Date().toLocaleString();
  } else if (cmd === "clear" || cmd === "cls") {
    return "<clear>";
  } else if (cmd === "notepad") {
    createWindow("Bloc-notes");
    return 'Ouverture de Bloc-notes...';
  } else if (cmd.startsWith("notepad ")) {
    const fileName = cmd.slice(8).trim();
    const files = JSON.parse(localStorage.getItem("files") || "[]");
    const file = files.find(f => f.name === fileName);
    if (file) {
      createWindow("Bloc-notes", file.content);
      return `Ouverture de "${fileName}" dans Bloc-notes...`;
    } else {
      return `Fichier "${fileName}" non trouvé.`;
    }
  } else if (cmd.startsWith("create ")) {
    const parts = cmd.slice(7).split(" ");
    if (parts.length >= 2) {
      const fileName = parts[0];
      const fileContent = parts.slice(1).join(" ");
      const files = JSON.parse(localStorage.getItem("files") || "[]");

      const existingFileIndex = files.findIndex(f => f.name === fileName);
      if (existingFileIndex > -1) {
        return `Erreur: Le fichier "${fileName}" existe déjà.`;
      }

      files.push({
        name: fileName,
        content: fileContent
      });
      localStorage.setItem("files", JSON.stringify(files));
      return `Fichier "${fileName}" créé avec succès.`;
    } else {
      return `Utilisation: create [nom] [contenu]`;
    }
  } else if (cmd === "whoami") {
    return 'Hello CloudOS user';
  } else if (cmd === "apps") { // 'apps' now specifically lists applications
    return allApps;
  } else if (cmd === "ls") { // 'ls' specifically lists files
    const files = JSON.parse(localStorage.getItem("files") || "[]");
    if (files.length === 0) {
      return "Aucun fichier dans le système de fichiers.";
    } else {
      const fileNames = files.map(file => file.name).join("<br>");
      return `Fichiers:<br>${fileNames}`;
    }
  } else {
    return "Commande inconnue";
  }
}

// ✅ Rendre accessible depuis HTML
window.createWindow = createWindow;

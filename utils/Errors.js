class Errors {
    constructor(code, content) {
        this.code = code;
        this.content = content;
    }

    getCode() {
        return this.code;
    }

    getContent() {
        return this.content;
    }

    showToUser() {
        const paraph = document.createElement("p");
        paraph.innerText = `Erreur ${this.getCode()} : ${this.getContent()}`;
        document.body.appendChild(paraph);
    }

    printErr() {
        console.error(`Erreur ${this.code} : ${this.content}`);
    }
}

const errVide = new Errors(401, "Contenu vide");
const errorCredentials = new Errors(402, "Identifiants incorrects");
const errNotFound = new Errors(504, "Utilisateur introuvable");

export { Errors, errVide, errorCredentials, errNotFound };

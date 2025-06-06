import { errVide, errNotFound, errorCredentials } from './Errors.js';

class User {
    constructor(name, password) {
        this.name = name;
        this.password = password;
    }

    getName() {
        return this.name;
    }

    getPassword() {
        return this.password;
    }
}

class Auth {
    constructor(username, userPassword, userInstance) {
        this.username = username;
        this.userPassword = userPassword;
        this.expectedName = userInstance.getName();
        this.expectedPassword = userInstance.getPassword();
    }

    getExpectedName() {
        return this.expectedName;
    }

    getExpectedPassword() {
        return this.expectedPassword;
    }

    verifyCredentials() {
        if (this.username === "" && this.userPassword === "") {
            console.error(errVide.getContent());
            return false;
        } else if (this.username !== this.expectedName || this.userPassword !== this.expectedPassword) {
            console.error(errorCredentials.getContent());
            return false;
        } else {
            return true;
        }
    }

    auth() {
        const credentialsOk = this.verifyCredentials();
        if (credentialsOk) {
            alert("User connected");
        } else {
            alert("Erreur d'authentification");
        }
    }
}

export { User, Auth };

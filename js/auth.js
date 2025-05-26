/**
 * Gestion de l'authentification et des comptes utilisateurs
 */

const auth = {
    // État actuel de l'authentification
    currentUser: null,
    isLoggedIn: false,
    
    // Initialisation
    init: async function() {
        // Charger les données des utilisateurs (simulé avec des données en mémoire)
        await this.loadUsers();
        
        // Tenter de restaurer la session
        this.restoreSession();
        
        // Configurer les écouteurs d'événements
        this.setupEventListeners();
    },
    
    // Charger les utilisateurs depuis data.json (simulé)
    loadUsers: async function() {
        try {
            const userData = await utils.loadJsonFile('data.json');
            if (userData && userData.accounts) {
                this.users = userData.accounts;
            } else {
                // Données par défaut si le chargement échoue
                this.users = [
                    {
                        name: "Administrateur",
                        email: "kilombopapylo@gmail.com",
                        password: "administrateur",
                        isAdmin: true
                    }
                ];
            }
            return true;
        } catch (error) {
            console.error("Erreur lors du chargement des utilisateurs:", error);
            // Données par défaut en cas d'erreur
            this.users = [
                {
                    name: "Administrateur",
                    email: "kilombopapylo@gmail.com",
                    password: "administrateur",
                    isAdmin: true
                }
            ];
            return false;
        }
    },
    
    // Restaurer la session utilisateur depuis le stockage local
    restoreSession: function() {
        const storedUser = utils.localCache.get('currentUser');
        if (storedUser) {
            // Vérifier si l'utilisateur existe toujours dans la base de données
            const userExists = this.findUserByEmail(storedUser.email);
            if (userExists) {
                this.currentUser = storedUser;
                this.isLoggedIn = true;
                this.updateUI();
                return true;
            } else {
                utils.localCache.remove('currentUser');
            }
        }
        return false;
    },
    
    // Configurer les écouteurs d'événements pour les formulaires
    setupEventListeners: function() {
        // Formulaire de connexion
        const loginForm = document.getElementById('loginForm');
        if (loginForm) {
            loginForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.login(
                    document.getElementById('loginEmail').value,
                    document.getElementById('loginPassword').value
                );
            });
        }
        
        // Formulaire d'inscription
        const registerForm = document.getElementById('registerForm');
        if (registerForm) {
            registerForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.register(
                    document.getElementById('registerName').value,
                    document.getElementById('registerEmail').value,
                    document.getElementById('registerPassword').value
                );
            });
        }
        
        // Formulaire de récupération de mot de passe
        const forgotPasswordForm = document.getElementById('forgotPasswordForm');
        if (forgotPasswordForm) {
            forgotPasswordForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.recoverPassword(
                    document.getElementById('forgotEmail').value
                );
            });
        }
        
        // Formulaire de profil
        const profileForm = document.getElementById('profileForm');
        if (profileForm) {
            profileForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.updateProfile(
                    document.getElementById('profileName').value
                );
            });
        }
        
        // Formulaire de changement de mot de passe
        const passwordForm = document.getElementById('passwordForm');
        if (passwordForm) {
            passwordForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.changePassword(
                    document.getElementById('currentPassword').value,
                    document.getElementById('newPassword').value,
                    document.getElementById('confirmPassword').value
                );
            });
        }
        
        // Bouton de déconnexion
        const logoutBtn = document.getElementById('logoutBtn');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.logout();
            });
        }
        
        // Bouton mobile de déconnexion
        const mobileLogoutBtn = document.getElementById('mobileLogoutBtn');
        if (mobileLogoutBtn) {
            mobileLogoutBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.logout();
            });
        }
        
        // Bouton de suppression de compte
        const deleteAccountBtn = document.getElementById('deleteAccountBtn');
        if (deleteAccountBtn) {
            deleteAccountBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.showDeleteAccountConfirmation();
            });
        }
        
        // Bouton de confirmation de suppression de compte
        const confirmDeleteBtn = document.getElementById('confirmDeleteBtn');
        if (confirmDeleteBtn) {
            confirmDeleteBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.deleteAccount(
                    document.getElementById('deleteConfirmPassword').value
                );
            });
        }
    },
    
    // Mettre à jour l'interface utilisateur en fonction de l'état d'authentification
    updateUI: function() {
        const userMenu = document.getElementById('userMenu');
        const userDisplayName = document.getElementById('userDisplayName');
        
        if (this.isLoggedIn && this.currentUser) {
            // Afficher le menu utilisateur
            userMenu.classList.remove('hidden');
            userDisplayName.textContent = this.currentUser.name;
            
            // Remplir les champs du profil
            const profileName = document.getElementById('profileName');
            const profileEmail = document.getElementById('profileEmail');
            if (profileName && profileEmail) {
                profileName.value = this.currentUser.name;
                profileEmail.value = this.currentUser.email;
            }
            
            // Rediriger vers la page d'analyse si on est sur une page d'auth
            if (router.currentPage === 'login' || router.currentPage === 'register' || router.currentPage === 'forgot-password') {
                router.navigateTo('analyzer');
            }
        } else {
            // Cacher le menu utilisateur
            userMenu.classList.add('hidden');
            
            // Rediriger vers la page de connexion si on est sur une page protégée
            if (router.currentPage !== 'login' && router.currentPage !== 'register' && router.currentPage !== 'forgot-password') {
                router.navigateTo('login');
            }
        }
    },
    
    // Trouver un utilisateur par email
    findUserByEmail: function(email) {
        return this.users.find(user => user.email.toLowerCase() === email.toLowerCase());
    },
    
    // Connexion
    login: function(email, password) {
        if (!utils.validation.isValidEmail(email)) {
            utils.notifications.error("Veuillez saisir une adresse email valide.");
            return false;
        }
        
        if (!utils.validation.isNotEmpty(password)) {
            utils.notifications.error("Veuillez saisir votre mot de passe.");
            return false;
        }
        
        // Rechercher l'utilisateur
        const user = this.findUserByEmail(email);
        
        if (user && user.password === password) {
            // Connexion réussie
            this.currentUser = Object.assign({}, user);
            delete this.currentUser.password; // Ne pas stocker le mot de passe en mémoire
            this.isLoggedIn = true;
            
            // Sauvegarder dans le stockage local
            utils.localCache.set('currentUser', this.currentUser, 7 * 24 * 60 * 60 * 1000); // Expire après 7 jours
            
            // Mettre à jour l'interface
            this.updateUI();
            
            utils.notifications.success(`Bienvenue, ${user.name} !`);
            
            // Rediriger vers la page d'analyse
            router.navigateTo('analyzer');
            
            return true;
        } else {
            utils.notifications.error("Email ou mot de passe incorrect.");
            return false;
        }
    },
    
    // Inscription
    register: function(name, email, password) {
        // Validation des champs
        if (!utils.validation.isNotEmpty(name)) {
            utils.notifications.error("Veuillez saisir votre nom.");
            return false;
        }
        
        if (!utils.validation.isValidEmail(email)) {
            utils.notifications.error("Veuillez saisir une adresse email valide.");
            return false;
        }
        
        if (!utils.validation.isValidPassword(password, 6, 12)) {
            utils.notifications.error("Le mot de passe doit contenir entre 6 et 12 caractères.");
            return false;
        }
        
        // Vérifier si l'email existe déjà
        if (this.findUserByEmail(email)) {
            utils.notifications.error("Cette adresse email est déjà utilisée.");
            return false;
        }
        
        // Créer le nouvel utilisateur
        const newUser = {
            name: name,
            email: email,
            password: password,
            isAdmin: false,
            createdAt: new Date().toISOString()
        };
        
        // Ajouter à la liste des utilisateurs
        this.users.push(newUser);
        
        // Créer une entrée dans l'historique
        if (!dataStore.analysisData[email]) {
            dataStore.analysisData[email] = {
                history: [],
                settings: {
                    theme: 'default',
                    mode: 'auto',
                    fontSize: 'base',
                    analysisMode: 'standard',
                    language: 'fr',
                    customDictionary: []
                }
            };
        }
        
        // Sauvegarder les modifications
        this.saveUsers();
        
        // Simuler l'envoi d'un email de confirmation
        utils.simulateEmailSending(
            email,
            "Confirmation de création de compte - Analyseur de Texte Pro",
            `Bonjour ${name},\n\nVotre compte a été créé avec succès.\n\nInformations du compte :\nNom : ${name}\nEmail : ${email}\n\nVous pouvez vous connecter dès maintenant.`
        );
        
        // Connecter l'utilisateur
        this.login(email, password);
        
        utils.notifications.success("Compte créé avec succès !");
        
        return true;
    },
    
    // Déconnexion
    logout: function() {
        // Supprimer les données de session
        this.currentUser = null;
        this.isLoggedIn = false;
        utils.localCache.remove('currentUser');
        
        // Mettre à jour l'interface
        this.updateUI();
        
        utils.notifications.info("Vous avez été déconnecté.");
        
        // Rediriger vers la page de connexion
        router.navigateTo('login');
        
        return true;
    },
    
    // Récupération de mot de passe
    recoverPassword: function(email) {
        if (!utils.validation.isValidEmail(email)) {
            utils.notifications.error("Veuillez saisir une adresse email valide.");
            return false;
        }
        
        // Rechercher l'utilisateur
        const user = this.findUserByEmail(email);
        
        if (user) {
            // Simuler l'envoi d'un email de récupération
            utils.simulateEmailSending(
                email,
                "Récupération de mot de passe - Analyseur de Texte Pro",
                `Bonjour ${user.name},\n\nVoici vos informations de connexion :\nEmail : ${user.email}\nMot de passe : ${user.password}\n\nVous pouvez vous connecter dès maintenant.`
            );
            
            utils.notifications.success("Un email de récupération a été envoyé.");
            
            // Rediriger vers la page de connexion
            router.navigateTo('login');
            
            return true;
        } else {
            utils.notifications.error("Aucun compte trouvé avec cette adresse email.");
            return false;
        }
    },
    
    // Mise à jour du profil
    updateProfile: function(name) {
        if (!this.isLoggedIn || !this.currentUser) {
            utils.notifications.error("Vous devez être connecté pour modifier votre profil.");
            return false;
        }
        
        if (!utils.validation.isNotEmpty(name)) {
            utils.notifications.error("Veuillez saisir votre nom.");
            return false;
        }
        
        // Rechercher l'utilisateur
        const userIndex = this.users.findIndex(user => user.email.toLowerCase() === this.currentUser.email.toLowerCase());
        
        if (userIndex !== -1) {
            // Mettre à jour le nom
            this.users[userIndex].name = name;
            this.currentUser.name = name;
            
            // Sauvegarder les modifications
            this.saveUsers();
            utils.localCache.set('currentUser', this.currentUser, 7 * 24 * 60 * 60 * 1000);
            
            // Mettre à jour l'interface
            document.getElementById('userDisplayName').textContent = name;
            
            utils.notifications.success("Profil mis à jour avec succès.");
            return true;
        } else {
            utils.notifications.error("Utilisateur introuvable.");
            return false;
        }
    },
    
    // Changement de mot de passe
    changePassword: function(currentPassword, newPassword, confirmPassword) {
        if (!this.isLoggedIn || !this.currentUser) {
            utils.notifications.error("Vous devez être connecté pour changer votre mot de passe.");
            return false;
        }
        
        // Rechercher l'utilisateur
        const userIndex = this.users.findIndex(user => user.email.toLowerCase() === this.currentUser.email.toLowerCase());
        
        if (userIndex === -1) {
            utils.notifications.error("Utilisateur introuvable.");
            return false;
        }
        
        // Vérifier le mot de passe actuel
        if (this.users[userIndex].password !== currentPassword) {
            utils.notifications.error("Mot de passe actuel incorrect.");
            return false;
        }
        
        // Valider le nouveau mot de passe
        if (!utils.validation.isValidPassword(newPassword, 6, 12)) {
            utils.notifications.error("Le nouveau mot de passe doit contenir entre 6 et 12 caractères.");
            return false;
        }
        
        // Vérifier la confirmation
        if (newPassword !== confirmPassword) {
            utils.notifications.error("Les mots de passe ne correspondent pas.");
            return false;
        }
        
        // Mettre à jour le mot de passe
        this.users[userIndex].password = newPassword;
        
        // Sauvegarder les modifications
        this.saveUsers();
        
        // Effacer les champs
        document.getElementById('currentPassword').value = '';
        document.getElementById('newPassword').value = '';
        document.getElementById('confirmPassword').value = '';
        
        utils.notifications.success("Mot de passe changé avec succès.");
        return true;
    },
    
    // Afficher la confirmation de suppression de compte
    showDeleteAccountConfirmation: function() {
        const modal = document.getElementById('confirmDeleteModal');
        
        // Ouvrir la modal
        modal.classList.add('modal-backdrop--visible');
        document.getElementById('deleteConfirmPassword').value = '';
        
        // Ajouter des écouteurs d'événements
        document.getElementById('closeConfirmDeleteBtn').addEventListener('click', () => {
            modal.classList.remove('modal-backdrop--visible');
        });
        
        document.getElementById('cancelDeleteBtn').addEventListener('click', () => {
            modal.classList.remove('modal-backdrop--visible');
        });
    },
    
    // Suppression de compte
    deleteAccount: function(password) {
        if (!this.isLoggedIn || !this.currentUser) {
            utils.notifications.error("Vous devez être connecté pour supprimer votre compte.");
            return false;
        }
        
        // Rechercher l'utilisateur
        const userIndex = this.users.findIndex(user => user.email.toLowerCase() === this.currentUser.email.toLowerCase());
        
        if (userIndex === -1) {
            utils.notifications.error("Utilisateur introuvable.");
            return false;
        }
        
        // Vérifier le mot de passe
        if (this.users[userIndex].password !== password) {
            utils.notifications.error("Mot de passe incorrect.");
            return false;
        }
        
        // Supprimer les données de l'utilisateur
        const userEmail = this.currentUser.email;
        
        // Supprimer de la liste des utilisateurs
        this.users.splice(userIndex, 1);
        
        // Supprimer l'historique
        if (dataStore.analysisData[userEmail]) {
            delete dataStore.analysisData[userEmail];
        }
        
        // Sauvegarder les modifications
        this.saveUsers();
        
        // Fermer la modal
        document.getElementById('confirmDeleteModal').classList.remove('modal-backdrop--visible');
        
        // Déconnecter l'utilisateur
        this.logout();
        
        utils.notifications.success("Votre compte a été supprimé avec succès.");
        return true;
    },
    
    // Sauvegarder les utilisateurs
    saveUsers: function() {
        // Dans un environnement réel, on enverrait une requête au serveur
        // Ici on simule un enregistrement dans le stockage local
        utils.localCache.set('users', this.users);
        
        // Mettre à jour le fichier data.json (simulé)
        console.log("Sauvegarde des utilisateurs:", this.users);
        
        // Dans un serveur réel, on appellerait une fonction comme :
        // await fetch('/api/users', {
        //     method: 'POST',
        //     headers: { 'Content-Type': 'application/json' },
        //     body: JSON.stringify(this.users)
        // });
        
        return true;
    }
};

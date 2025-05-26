/**
 * Gestionnaire de routage SPA simple
 */

const router = {
    // Page actuelle
    currentPage: 'login',
    
    // Pages protégées (nécessitent une connexion)
    protectedPages: ['analyzer', 'history', 'settings', 'profile'],
    
    // Initialisation
    init: function() {
        // Configurer les écouteurs d'événements pour les liens de navigation
        this.setupNavigationLinks();
        
        // Essayer de restaurer la page depuis l'URL
        this.handleInitialNavigation();
    },
    
    // Configurer les écouteurs d'événements pour les liens de navigation
    setupNavigationLinks: function() {
        // Liens de navigation dans le header
        document.querySelectorAll('.header__nav-item').forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                this.navigateTo(link.dataset.page);
            });
        });
        
        // Logo (retour à l'accueil)
        document.querySelector('.header__logo').addEventListener('click', (e) => {
            e.preventDefault();
            this.navigateTo('analyzer');
        });
        
        // Liens d'authentification
        document.querySelectorAll('.auth__link').forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                this.navigateTo(link.dataset.page);
            });
        });
        
        // Liens dans le menu utilisateur
        document.querySelectorAll('.header__dropdown-item').forEach(link => {
            if (link.dataset.page) {
                link.addEventListener('click', (e) => {
                    e.preventDefault();
                    this.navigateTo(link.dataset.page);
                    
                    // Fermer le menu déroulant
                    document.getElementById('userDropdown').classList.remove('header__user-dropdown--visible');
                });
            }
        });
        
        // Bouton du menu utilisateur
        const userMenuButton = document.getElementById('userMenuButton');
        const userDropdown = document.getElementById('userDropdown');
        
        if (userMenuButton && userDropdown) {
            userMenuButton.addEventListener('click', () => {
                userDropdown.classList.toggle('header__user-dropdown--visible');
            });
            
            // Fermer le menu si on clique ailleurs
            document.addEventListener('click', (e) => {
                if (!userMenuButton.contains(e.target) && !userDropdown.contains(e.target)) {
                    userDropdown.classList.remove('header__user-dropdown--visible');
                }
            });
        }
        
        // Menu mobile
        const mobileMenuToggle = document.getElementById('mobileMenuToggle');
        const mobileNav = document.getElementById('mobileNav');
        const mobileMenuClose = document.getElementById('mobileMenuClose');
        
        if (mobileMenuToggle && mobileNav && mobileMenuClose) {
            mobileMenuToggle.addEventListener('click', () => {
                mobileNav.classList.add('header__mobile-nav--visible');
            });
            
            mobileMenuClose.addEventListener('click', () => {
                mobileNav.classList.remove('header__mobile-nav--visible');
            });
            
            // Liens dans le menu mobile
            document.querySelectorAll('#mobileNav .header__nav-item').forEach(link => {
                link.addEventListener('click', () => {
                    mobileNav.classList.remove('header__mobile-nav--visible');
                });
            });
        }
    },
    
    // Gérer la navigation initiale
    handleInitialNavigation: function() {
        // Vérifier s'il y a un paramètre dans l'URL
        const queryParams = new URLSearchParams(window.location.search);
        
        // Si un partage est spécifié
        if (queryParams.has('share')) {
            const analysisId = queryParams.get('share');
            this.loadSharedAnalysis(analysisId);
            return;
        }
        
        // Restaurer la dernière page visitée
        const lastPage = utils.localCache.get('lastPage');
        if (lastPage) {
            // Vérifier si la page nécessite une connexion
            if (this.protectedPages.includes(lastPage) && !auth.isLoggedIn) {
                this.navigateTo('login');
            } else {
                this.navigateTo(lastPage);
            }
        } else {
            // Page par défaut
            this.navigateTo(auth.isLoggedIn ? 'analyzer' : 'login');
        }
    },
    
    // Naviguer vers une page
    navigateTo: function(pageName) {
        // Vérifier si la page existe
        const page = document.getElementById(`${pageName}Page`);
        if (!page) {
            console.error(`Page "${pageName}" non trouvée.`);
            return false;
        }
        
        // Vérifier si la page nécessite une connexion
        if (this.protectedPages.includes(pageName) && !auth.isLoggedIn) {
            utils.notifications.warning("Vous devez être connecté pour accéder à cette page.");
            this.navigateTo('login');
            return false;
        }
        
        // Fermer le menu mobile s'il est ouvert
        const mobileNav = document.getElementById('mobileNav');
        if (mobileNav && mobileNav.classList.contains('header__mobile-nav--visible')) {
            mobileNav.classList.remove('header__mobile-nav--visible');
        }
        
        // Masquer toutes les pages
        document.querySelectorAll('.page').forEach(p => {
            p.classList.remove('page--active');
        });
        
        // Afficher la page demandée
        page.classList.add('page--active');
        
        // Mettre à jour la navigation active
        document.querySelectorAll('.header__nav-item').forEach(item => {
            if (item.dataset.page === pageName) {
                item.classList.add('header__nav-item--active');
            } else {
                item.classList.remove('header__nav-item--active');
            }
        });
        
        // Mettre à jour la page courante
        this.currentPage = pageName;
        
        // Sauvegarder la page dans le stockage local
        utils.localCache.set('lastPage', pageName);
        
        // Actions spécifiques à certaines pages
        if (pageName === 'history') {
            // Rafraîchir l'historique
            dataStore.renderHistory();
        }
        
        return true;
    },
    
    // Charger une analyse partagée
    loadSharedAnalysis: function(analysisId) {
        // Récupérer l'analyse depuis le stockage local
        const sharedAnalysis = utils.localCache.get(`shared_analysis_${analysisId}`);
        
        if (!sharedAnalysis) {
            utils.notifications.error("L'analyse partagée n'a pas été trouvée ou a expiré.");
            this.navigateTo(auth.isLoggedIn ? 'analyzer' : 'login');
            return false;
        }
        
        // Naviguer vers la page d'analyse
        this.navigateTo('analyzer');
        
        // Remplir le champ de texte
        document.getElementById('textInput').value = sharedAnalysis.text;
        
        // Régler les options d'analyse
        document.getElementById('analyzeMode').value = sharedAnalysis.mode || 'standard';
        document.getElementById('analyzeLanguage').value = sharedAnalysis.language || 'fr';
        
        // Déclencher l'analyse
        analyzer.currentAnalysis = sharedAnalysis;
        analyzer.updateAnalysisUI(sharedAnalysis);
        
        utils.notifications.success("Analyse partagée chargée avec succès.");
        return true;
    }
};

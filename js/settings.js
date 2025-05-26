/**
 * Gestion des paramètres utilisateur
 */

const settings = {
    // Paramètres par défaut
    defaults: {
        theme: 'default',
        mode: 'auto',
        fontSize: 'base',
        highContrast: false,
        analysisMode: 'standard',
        language: 'fr',
        componentsToShow: {
            spellingCheck: true,
            readabilityScore: true,
            textTone: true,
            charts: true
        },
        customDictionary: []
    },
    
    // Paramètres actuels
    current: {},
    
    // Initialisation
    init: function() {
        // Charger les paramètres du stockage local ou utiliser les valeurs par défaut
        this.loadSettings();
        
        // Appliquer les paramètres initiaux
        this.applySettings();
        
        // Mettre en place les écouteurs d'événements
        this.setupEventListeners();
    },
    
    // Charger les paramètres
    loadSettings: function() {
        // Si l'utilisateur est connecté, charger ses paramètres
        if (auth.isLoggedIn && auth.currentUser && dataStore.analysisData[auth.currentUser.email]) {
            this.current = {
                ...this.defaults,
                ...dataStore.analysisData[auth.currentUser.email].settings
            };
        } else {
            // Sinon, essayer de charger depuis le stockage local
            const storedSettings = utils.localCache.get('settings');
            this.current = storedSettings ? { ...this.defaults, ...storedSettings } : { ...this.defaults };
        }
    },
    
    // Sauvegarder les paramètres
    saveSettings: function() {
        // Sauvegarder dans le stockage local
        utils.localCache.set('settings', this.current);
        
        // Si l'utilisateur est connecté, sauvegarder dans son profil
        if (auth.isLoggedIn && auth.currentUser) {
            if (!dataStore.analysisData[auth.currentUser.email]) {
                dataStore.analysisData[auth.currentUser.email] = {
                    history: [],
                    settings: {}
                };
            }
            
            dataStore.analysisData[auth.currentUser.email].settings = { ...this.current };
            utils.localCache.set('analysisData', dataStore.analysisData);
        }
    },
    
    // Appliquer les paramètres
    applySettings: function() {
        // Appliquer le thème
        this.applyTheme(this.current.theme);
        
        // Appliquer le mode (clair/sombre)
        this.applyMode(this.current.mode);
        
        // Appliquer la taille de police
        this.applyFontSize(this.current.fontSize);
        
        // Appliquer le contraste élevé
        this.applyHighContrast(this.current.highContrast);
        
        // Mettre à jour les contrôles de l'interface
        this.updateSettingsUI();
        
        // Mettre à jour les préférences d'analyse
        this.updateAnalysisPreferences();
    },
    
    // Appliquer le thème
    applyTheme: function(theme) {
        // Retirer tous les thèmes
        document.body.classList.remove('theme-blue', 'theme-purple', 'theme-green', 'theme-orange');
        
        // Appliquer le nouveau thème s'il est différent de "default"
        if (theme !== 'default') {
            document.body.classList.add(`theme-${theme}`);
        }
        
        // Mettre à jour l'UI des boutons de thème
        const themeButtons = document.querySelectorAll('.theme-button');
        themeButtons.forEach(button => {
            if (button.dataset.theme === theme) {
                button.classList.replace('button--secondary', 'button--primary');
            } else {
                button.classList.replace('button--primary', 'button--secondary');
            }
        });
    },
    
    // Appliquer le mode (clair/sombre)
    applyMode: function(mode) {
        if (mode === 'dark') {
            document.documentElement.classList.add('dark');
        } else if (mode === 'light') {
            document.documentElement.classList.remove('dark');
        } else {
            // Mode auto : utiliser les préférences du système
            if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
                document.documentElement.classList.add('dark');
            } else {
                document.documentElement.classList.remove('dark');
            }
        }
        
        // Mettre à jour l'UI des boutons de mode
        const modeButtons = document.querySelectorAll('.mode-button');
        modeButtons.forEach(button => {
            if (button.dataset.mode === mode) {
                button.classList.replace('button--secondary', 'button--primary');
            } else {
                button.classList.replace('button--primary', 'button--secondary');
            }
        });
        
        // Mettre à jour les graphiques si le mode a changé
        if (charts && charts.updateChartsTheme) {
            charts.updateChartsTheme();
        }
    },
    
    // Appliquer la taille de police
    applyFontSize: function(size) {
        // Retirer toutes les classes de taille de police
        document.body.classList.remove('font-size-small', 'font-size-large', 'font-size-xlarge');
        
        // Appliquer la nouvelle taille si elle est différente de "base"
        if (size !== 'base') {
            document.body.classList.add(`font-size-${size}`);
        }
        
        // Mettre à jour l'UI des boutons de taille de police
        const fontSizeButtons = document.querySelectorAll('.font-size-button');
        fontSizeButtons.forEach(button => {
            if (button.dataset.size === size) {
                button.classList.replace('button--secondary', 'button--primary');
            } else {
                button.classList.replace('button--primary', 'button--secondary');
            }
        });
    },
    
    // Appliquer le mode contraste élevé
    applyHighContrast: function(enabled) {
        if (enabled) {
            document.body.classList.add('high-contrast');
            document.getElementById('highContrastToggle').classList.replace('button--secondary', 'button--primary');
        } else {
            document.body.classList.remove('high-contrast');
            document.getElementById('highContrastToggle').classList.replace('button--primary', 'button--secondary');
        }
    },
    
    // Mettre à jour l'interface des paramètres
    updateSettingsUI: function() {
        // Mettre à jour le mode d'analyse par défaut
        const defaultAnalysisMode = document.getElementById('defaultAnalysisMode');
        if (defaultAnalysisMode) {
            defaultAnalysisMode.value = this.current.analysisMode;
        }
        
        // Mettre à jour la langue par défaut
        const defaultLanguage = document.getElementById('defaultLanguage');
        if (defaultLanguage) {
            defaultLanguage.value = this.current.language;
        }
        
        // Mettre à jour les cases à cocher des composants à afficher
        const showSpellingCheck = document.getElementById('showSpellingCheck');
        if (showSpellingCheck) {
            showSpellingCheck.checked = this.current.componentsToShow.spellingCheck;
        }
        
        const showReadabilityScore = document.getElementById('showReadabilityScore');
        if (showReadabilityScore) {
            showReadabilityScore.checked = this.current.componentsToShow.readabilityScore;
        }
        
        const showTextTone = document.getElementById('showTextTone');
        if (showTextTone) {
            showTextTone.checked = this.current.componentsToShow.textTone;
        }
        
        const showCharts = document.getElementById('showCharts');
        if (showCharts) {
            showCharts.checked = this.current.componentsToShow.charts;
        }
        
        // Mettre à jour le dictionnaire personnalisé
        this.renderCustomDictionary();
    },
    
    // Mettre à jour les préférences d'analyse
    updateAnalysisPreferences: function() {
        // Mettre à jour le mode d'analyse de la page d'analyse
        const analyzeMode = document.getElementById('analyzeMode');
        if (analyzeMode) {
            analyzeMode.value = this.current.analysisMode;
        }
        
        // Mettre à jour la langue de la page d'analyse
        const analyzeLanguage = document.getElementById('analyzeLanguage');
        if (analyzeLanguage) {
            analyzeLanguage.value = this.current.language;
        }
    },
    
    // Rendre le dictionnaire personnalisé
    renderCustomDictionary: function() {
        const container = document.getElementById('customDictionaryTags');
        const emptyDictionary = document.getElementById('emptyDictionary');
        
        if (container) {
            // Vider le conteneur
            container.innerHTML = '';
            
            // Afficher le message si le dictionnaire est vide
            if (!this.current.customDictionary || this.current.customDictionary.length === 0) {
                emptyDictionary.style.display = 'block';
                return;
            }
            
            // Cacher le message
            emptyDictionary.style.display = 'none';
            
            // Ajouter les mots
            this.current.customDictionary.forEach(word => {
                const tag = document.createElement('div');
                tag.className = 'custom-dict-tag';
                tag.innerHTML = `
                    <span class="custom-dict-tag__text">${word}</span>
                    <button class="custom-dict-tag__remove" data-word="${word}">
                        <i class="fas fa-times"></i>
                    </button>
                `;
                
                // Ajouter un écouteur d'événement pour le bouton de suppression
                tag.querySelector('.custom-dict-tag__remove').addEventListener('click', () => {
                    this.removeFromCustomDictionary(word);
                });
                
                container.appendChild(tag);
            });
        }
    },
    
    // Ajouter un mot au dictionnaire personnalisé
    addToCustomDictionary: function(word) {
        // Nettoyer le mot
        word = word.trim().toLowerCase();
        
        // Vérifier si le mot est valide
        if (!word) {
            utils.notifications.warning("Veuillez entrer un terme valide.");
            return false;
        }
        
        // Vérifier si le mot existe déjà
        if (this.current.customDictionary.includes(word)) {
            utils.notifications.info("Ce terme est déjà dans votre dictionnaire personnalisé.");
            return false;
        }
        
        // Ajouter le mot
        this.current.customDictionary.push(word);
        
        // Sauvegarder les paramètres
        this.saveSettings();
        
        // Mettre à jour l'interface
        this.renderCustomDictionary();
        
        // Réinitialiser le champ de saisie
        document.getElementById('customDictionaryInput').value = '';
        
        utils.notifications.success(`"${word}" a été ajouté à votre dictionnaire personnalisé.`);
        return true;
    },
    
    // Supprimer un mot du dictionnaire personnalisé
    removeFromCustomDictionary: function(word) {
        // Trouver l'index du mot
        const index = this.current.customDictionary.indexOf(word);
        
        // Si le mot existe, le supprimer
        if (index !== -1) {
            this.current.customDictionary.splice(index, 1);
            
            // Sauvegarder les paramètres
            this.saveSettings();
            
            // Mettre à jour l'interface
            this.renderCustomDictionary();
            
            utils.notifications.success(`"${word}" a été supprimé de votre dictionnaire personnalisé.`);
            return true;
        }
        
        return false;
    },
    
    // Configurer les écouteurs d'événements
    setupEventListeners: function() {
        // Boutons de thème
        const themeButtons = document.querySelectorAll('.theme-button');
        themeButtons.forEach(button => {
            button.addEventListener('click', () => {
                const theme = button.dataset.theme;
                this.current.theme = theme;
                this.applyTheme(theme);
                this.saveSettings();
            });
        });
        
        // Boutons de mode
        const modeButtons = document.querySelectorAll('.mode-button');
        modeButtons.forEach(button => {
            button.addEventListener('click', () => {
                const mode = button.dataset.mode;
                this.current.mode = mode;
                this.applyMode(mode);
                this.saveSettings();
            });
        });
        
        // Boutons de taille de police
        const fontSizeButtons = document.querySelectorAll('.font-size-button');
        fontSizeButtons.forEach(button => {
            button.addEventListener('click', () => {
                const size = button.dataset.size;
                this.current.fontSize = size;
                this.applyFontSize(size);
                this.saveSettings();
            });
        });
        
        // Bouton de contraste élevé
        const highContrastToggle = document.getElementById('highContrastToggle');
        if (highContrastToggle) {
            highContrastToggle.addEventListener('click', () => {
                this.current.highContrast = !this.current.highContrast;
                this.applyHighContrast(this.current.highContrast);
                this.saveSettings();
            });
        }
        
        // Mode d'analyse par défaut
        const defaultAnalysisMode = document.getElementById('defaultAnalysisMode');
        if (defaultAnalysisMode) {
            defaultAnalysisMode.addEventListener('change', () => {
                this.current.analysisMode = defaultAnalysisMode.value;
                this.saveSettings();
                this.updateAnalysisPreferences();
            });
        }
        
        // Langue par défaut
        const defaultLanguage = document.getElementById('defaultLanguage');
        if (defaultLanguage) {
            defaultLanguage.addEventListener('change', () => {
                this.current.language = defaultLanguage.value;
                this.saveSettings();
                this.updateAnalysisPreferences();
            });
        }
        
        // Cases à cocher des composants à afficher
        const showSpellingCheck = document.getElementById('showSpellingCheck');
        if (showSpellingCheck) {
            showSpellingCheck.addEventListener('change', () => {
                this.current.componentsToShow.spellingCheck = showSpellingCheck.checked;
                this.saveSettings();
            });
        }
        
        const showReadabilityScore = document.getElementById('showReadabilityScore');
        if (showReadabilityScore) {
            showReadabilityScore.addEventListener('change', () => {
                this.current.componentsToShow.readabilityScore = showReadabilityScore.checked;
                this.saveSettings();
            });
        }
        
        const showTextTone = document.getElementById('showTextTone');
        if (showTextTone) {
            showTextTone.addEventListener('change', () => {
                this.current.componentsToShow.textTone = showTextTone.checked;
                this.saveSettings();
            });
        }
        
        const showCharts = document.getElementById('showCharts');
        if (showCharts) {
            showCharts.addEventListener('change', () => {
                this.current.componentsToShow.charts = showCharts.checked;
                this.saveSettings();
            });
        }
        
        // Ajouter un mot au dictionnaire personnalisé
        const addCustomWordBtn = document.getElementById('addCustomWordBtn');
        if (addCustomWordBtn) {
            addCustomWordBtn.addEventListener('click', () => {
                const input = document.getElementById('customDictionaryInput');
                this.addToCustomDictionary(input.value);
            });
            
            // Ajouter un écouteur pour la touche Entrée
            document.getElementById('customDictionaryInput').addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    e.preventDefault();
                    this.addToCustomDictionary(e.target.value);
                }
            });
        }
    }
};

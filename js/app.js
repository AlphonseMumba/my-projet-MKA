/**
 * Point d'entrée principal de l'application
 */

// Stockage des données de l'application
const dataStore = {
    // Données d'analyse par utilisateur
    analysisData: {},
    
    // Charger les données depuis le stockage local
    loadData: function() {
        const storedData = utils.localCache.get('analysisData');
        if (storedData) {
            this.analysisData = storedData;
        }
    },
    
    // Sauvegarder les données
    saveData: function() {
        utils.localCache.set('analysisData', this.analysisData);
    },
    
    // Ajouter une analyse à l'historique
    addAnalysis: function(email, analysis) {
        if (!this.analysisData[email]) {
            this.analysisData[email] = {
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
        
        // Ajouter l'analyse à l'historique
        this.analysisData[email].history.unshift(analysis); // Ajouter au début pour avoir les plus récents en premier
        
        // Sauvegarder les modifications
        this.saveData();
        
        return true;
    },
    
    // Obtenir l'historique d'un utilisateur
    getUserHistory: function(email) {
        return this.analysisData[email]?.history || [];
    },
    
    // Trier l'historique
    sortHistory: function(history, sortBy = 'date-desc') {
        const sortedHistory = [...history]; // Copie pour ne pas modifier l'original
        
        switch (sortBy) {
            case 'date-asc':
                sortedHistory.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
                break;
            case 'words-desc':
                sortedHistory.sort((a, b) => b.wordCount - a.wordCount);
                break;
            case 'words-asc':
                sortedHistory.sort((a, b) => a.wordCount - b.wordCount);
                break;
            case 'date-desc':
            default:
                sortedHistory.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
                break;
        }
        
        return sortedHistory;
    },
    
    // Effacer l'historique d'un utilisateur
    clearUserHistory: function(email) {
        if (this.analysisData[email]) {
            this.analysisData[email].history = [];
            this.saveData();
            return true;
        }
        return false;
    },
    
    // Afficher l'historique dans l'interface
    renderHistory: function() {
        // Vérifier si l'utilisateur est connecté
        if (!auth.isLoggedIn || !auth.currentUser) {
            return false;
        }
        
        const historyList = document.getElementById('historyList');
        const emptyHistory = document.getElementById('emptyHistory');
        
        // Obtenir l'historique de l'utilisateur
        const email = auth.currentUser.email;
        const history = this.getUserHistory(email);
        
        // Obtenir la méthode de tri
        const sortBy = document.getElementById('historySortBy').value;
        const sortedHistory = this.sortHistory(history, sortBy);
        
        // Vider la liste sauf le message d'historique vide
        const items = historyList.querySelectorAll('.history-item');
        items.forEach(item => item.remove());
        
        // Si l'historique est vide
        if (sortedHistory.length === 0) {
            emptyHistory.style.display = 'block';
            return true;
        }
        
        // Cacher le message
        emptyHistory.style.display = 'none';
        
        // Ajouter chaque élément d'historique
        sortedHistory.forEach((item, index) => {
            const historyItem = document.createElement('div');
            historyItem.className = 'history-item';
            historyItem.dataset.index = index;
            
            const date = new Date(item.timestamp);
            const formattedDate = utils.formatDate(date);
            
            // Prévisualisation du texte (limité à 100 caractères)
            const textPreview = item.text.length > 100 
                ? item.text.substring(0, 100) + '...' 
                : item.text;
            
            historyItem.innerHTML = `
                <div class="history-item__header">
                    <span class="history-item__date">${formattedDate}</span>
                    <span class="badge badge--${this.getAnalysisBadgeType(item)}">${item.wordCount} mots</span>
                </div>
                <div class="history-item__preview">${textPreview}</div>
            `;
            
            // Ajouter un écouteur d'événement pour ouvrir le détail
            historyItem.addEventListener('click', () => {
                this.showHistoryDetail(email, index, sortedHistory);
            });
            
            historyList.appendChild(historyItem);
        });
        
        return true;
    },
    
    // Obtenir le type de badge pour une analyse
    getAnalysisBadgeType: function(analysis) {
        // Basé sur le nombre de mots
        if (analysis.wordCount >= 1000) return 'primary';
        if (analysis.wordCount >= 500) return 'info';
        if (analysis.wordCount >= 100) return 'success';
        return 'warning';
    },
    
    // Afficher le détail d'un élément d'historique
    showHistoryDetail: function(email, index, sortedHistory) {
        const item = sortedHistory[index];
        
        // Remplir le modal avec les détails
        document.getElementById('historyDetailDate').textContent = utils.formatDate(new Date(item.timestamp));
        document.getElementById('historyDetailText').textContent = item.text;
        document.getElementById('historyWordCount').textContent = item.wordCount;
        document.getElementById('historyCharCount').textContent = item.charCount;
        document.getElementById('historySentenceCount').textContent = item.sentenceCount;
        document.getElementById('historyArticleCount').textContent = item.articleCount;
        document.getElementById('historyVerbCount').textContent = item.verbCount;
        document.getElementById('historyErrorCount').textContent = item.spellingErrors?.length || 0;
        
        // Configurer le bouton de réanalyse
        document.getElementById('reanalyzeBtn').dataset.index = index;
        document.getElementById('reanalyzeBtn').dataset.email = email;
        
        // Afficher le modal
        document.getElementById('historyDetailModal').classList.add('modal-backdrop--visible');
        
        // Configurer les boutons
        document.getElementById('closeHistoryDetailBtn').addEventListener('click', () => {
            document.getElementById('historyDetailModal').classList.remove('modal-backdrop--visible');
        });
        
        document.getElementById('closeHistoryModalBtn').addEventListener('click', () => {
            document.getElementById('historyDetailModal').classList.remove('modal-backdrop--visible');
        });
        
        document.getElementById('reanalyzeBtn').addEventListener('click', () => {
            // Fermer le modal
            document.getElementById('historyDetailModal').classList.remove('modal-backdrop--visible');
            
            // Remplir le champ de texte avec le texte de l'historique
            document.getElementById('textInput').value = item.text;
            
            // Changer d'onglet vers l'analyseur
            router.navigateTo('analyzer');
            
            // Déclencher l'analyse
            analyzer.analyzeText();
        });
    }
};

// Initialisation de l'application
document.addEventListener('DOMContentLoaded', function() {
    // Vérifier si l'API Poe est disponible
    if (window.Poe) {
        api.poe.registerTextImprovementHandler();
    } else {
        console.warn("L'API Poe n'est pas disponible. Certaines fonctionnalités d'IA seront limitées.");
    }
    
    // Initialiser le routeur
    router.init();
    
    // Charger les données
    dataStore.loadData();
    
    // Initialiser l'authentification
    auth.init();
    
    // Initialiser les paramètres
    settings.init();
    
    // Initialiser l'analyseur
    analyzer.init();
    
    // Configurer les événements pour les éléments qui ne sont pas gérés ailleurs
    setupGlobalEvents();
    
    console.log("Application initialisée avec succès!");
});

// Configurer les événements globaux
function setupGlobalEvents() {
    // Tri de l'historique
    const historySortBy = document.getElementById('historySortBy');
    if (historySortBy) {
        historySortBy.addEventListener('change', () => {
            dataStore.renderHistory();
        });
    }
    
    // Bouton pour vider l'historique
    const clearHistoryBtn = document.getElementById('clearHistoryBtn');
    if (clearHistoryBtn) {
        clearHistoryBtn.addEventListener('click', () => {
            if (confirm("Êtes-vous sûr de vouloir vider votre historique ? Cette action est irréversible.")) {
                if (auth.isLoggedIn && auth.currentUser) {
                    dataStore.clearUserHistory(auth.currentUser.email);
                    dataStore.renderHistory();
                    utils.notifications.success("Votre historique a été vidé avec succès.");
                }
            }
        });
    }
}

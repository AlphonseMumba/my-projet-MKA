// Dark mode detection
if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
    document.documentElement.classList.add('dark');
}
window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', event => {
    if (event.matches) {
        document.documentElement.classList.add('dark');
    } else {
        document.documentElement.classList.remove('dark');
    }
});

// =================== Chargement des données ===================
// Simuler le chargement de JSON car Canvas ne dispose pas d'API de fichier
let accounts = [];
let analysisData = {};

// Fonction pour charger les données depuis le "serveur"
function loadData() {
    fetch('data.json')
        .then(response => response.json())
        .then(data => {
            // Normalement, nous chargerions les données depuis le fichier ici
            // Mais comme nous ne pouvons pas dans Canvas, nous simulons
            accounts = [
                {
                    name: "Administrateur",
                    email: "kilombopapylo@gmail.com",
                    password: "administrateur",
                    isAdmin: true
                }
            ];
            analysisData = {};
        })
        .catch(error => {
            console.error('Erreur lors du chargement des données:', error);
            // Fallback si le chargement échoue
            accounts = [
                {
                    name: "Administrateur",
                    email: "kilombopapylo@gmail.com",
                    password: "administrateur",
                    isAdmin: true
                }
            ];
            analysisData = {};
        });
}

// Appel de la fonction de chargement des données
loadData();

// =================== Données linguistiques et exemples ===================
// French language data
const frenchData = {
    articles: ['le', 'la', 'les', 'un', 'une', 'des', 'du', 'au', 'aux', 'l\'', 'de', 'à'],
    pronouns: ['je', 'tu', 'il', 'elle', 'on', 'nous', 'vous', 'ils', 'elles', 'me', 'te', 'se', 'moi', 'toi', 'lui', 'leur', 'celui', 'celle', 'ceux', 'celles', 'celui-ci', 'celui-là', 'celle-ci', 'celle-là', 'ceci', 'cela', 'ça', 'ce', 'cette', 'ces', 'mon', 'ton', 'son', 'ma', 'ta', 'sa', 'mes', 'tes', 'ses', 'notre', 'votre', 'leur', 'nos', 'vos', 'leurs', 'qui', 'que', 'quoi', 'dont', 'où', 'lequel', 'duquel', 'auquel', 'lesquels', 'desquels', 'auxquels'],
    conjunctions: ['et', 'ou', 'mais', 'donc', 'or', 'ni', 'car', 'comme', 'que', 'quand', 'si', 'lorsque', 'puisque', 'parce', 'quoique', 'bien', 'encore', 'puis', 'ensuite', 'enfin', 'cependant', 'néanmoins', 'toutefois', 'pourtant', 'alors'],
    verbEndings: ['er', 'ir', 'oir', 're', 'ez', 'ons', 'ont', 'ent', 'ais', 'ait', 'aient', 'erai', 'era', 'erons', 'erez', 'eront', 'é', 'ée', 'és', 'ées', 'issais', 'issait', 'issaient', 'irais', 'irait', 'irions', 'iriez', 'iraient'],
    adjectiveEndings: ['eux', 'euse', 'euses', 'if', 'ive', 'ifs', 'ives', 'al', 'ale', 'aux', 'ales', 'ant', 'ante', 'ants', 'antes', 'ent', 'ente', 'ents', 'entes', 'eur', 'euse', 'eurs', 'euses', 'ain', 'aine', 'ains', 'aines', 'ique', 'iques', 'aire', 'aires', 'able', 'ables', 'ible', 'ibles']
};

// Simulation du dictionnaire français (réduit pour la démo)
const frenchDict = new Set([
    "le", "la", "les", "un", "une", "des", "et", "ou", "mais", "donc", "car", "ni", "or",
    "je", "tu", "il", "elle", "nous", "vous", "ils", "elles", "on", "se", "ce", "cette", "ces",
    "mon", "ton", "son", "ma", "ta", "sa", "mes", "tes", "ses", "notre", "votre", "leur", "nos", "vos", "leurs",
    "être", "avoir", "faire", "dire", "aller", "voir", "venir", "prendre", "pouvoir", "vouloir", "devoir",
    "mettre", "savoir", "falloir", "parler", "demander", "trouver", "donner", "comprendre", "attendre",
    "passer", "rester", "tenir", "porter", "partir", "entrer", "sortir", "arriver", "tomber", "sembler",
    "suivre", "connaître", "croire", "aimer", "manger", "boire", "dormir", "lire", "écrire", "jouer",
    "temps", "année", "jour", "fois", "homme", "femme", "enfant", "pays", "monde", "vie", "moment",
    "manière", "chose", "heure", "côté", "main", "œil", "pied", "eau", "air", "terre", "feu", "mot",
    "ligne", "point", "fait", "droit", "effet", "état", "place", "face", "coup", "cas", "idée", "partie",
    "question", "raison", "sorte", "façon", "besoin", "moyen", "début", "fin", "suite", "corps", "tête",
    "cœur", "esprit", "sens", "ville", "rue", "route", "pièce", "objet", "travail", "argent", "prix",
    "grand", "petit", "beau", "bon", "mauvais", "vieux", "jeune", "nouveau", "ancien", "fort", "faible",
    "haut", "bas", "long", "court", "large", "étroit", "plein", "vide", "lourd", "léger", "chaud", "froid",
    "dur", "mou", "propre", "sale", "sec", "humide", "clair", "sombre", "vrai", "faux", "sûr", "certain",
    "même", "tel", "tout", "aucun", "chaque", "autre", "premier", "dernier", "peu", "assez", "trop",
    "plus", "moins", "bien", "mal", "vite", "lentement", "toujours", "jamais", "souvent", "parfois",
    "ici", "là", "loin", "près", "devant", "derrière", "dessus", "dessous", "dedans", "dehors",
    "pour", "par", "avec", "sans", "chez", "entre", "vers", "jusqu", "depuis", "pendant", "avant", "après"
]);

// Liste des mots courants à améliorer (pour la fonctionnalité amélioration)
const poorVocabulary = {
    "chose": "élément|objet|article|entité",
    "truc": "objet|dispositif|machin|bidule",
    "machin": "appareil|instrument|outil|mécanisme",
    "faire": "réaliser|effectuer|accomplir|exécuter",
    "beaucoup": "considérablement|énormément|abondamment|grandement",
    "très": "extrêmement|particulièrement|remarquablement|fort",
    "bon": "excellent|délicieux|agréable|savoureux",
    "mauvais": "médiocre|déplorable|désastreux|lamentable",
    "petit": "minuscule|infime|modeste|réduit",
    "grand": "immense|vaste|énorme|gigantesque",
    "bien": "correctement|convenablement|adéquatement|proprement",
    "mal": "incorrectement|inadéquatement|improprement|médiocrement",
    "dire": "affirmer|déclarer|énoncer|prononcer",
    "aller": "se diriger|se rendre|se déplacer|voyager",
    "mettre": "placer|poser|disposer|installer",
    "avoir": "posséder|détenir|disposer de|jouir de",
    "voir": "apercevoir|observer|remarquer|distinguer",
    "joli": "élégant|charmant|ravissant|gracieux",
    "moche": "laid|disgracieux|inesthétique|repoussant"
};

// Texte exemple
const sampleText = `La langue française est une des langues les plus parlées dans le monde. Elle est connue pour sa richesse et sa complexité grammaticale. Les articles définis comme "le", "la", et "les" sont utilisés fréquemment. 

Les verbes français peuvent être conjugués à plusieurs temps et modes. Par exemple, "parler", "finir", et "prendre" sont des verbes de groupes différents. Les adjectifs s'accordent en genre et en nombre avec les noms qu'ils qualifient.

Les pronoms comme "je", "tu", "il" remplacent souvent les noms pour éviter les répétitions. Certains mots invariables, comme les conjonctions "et", "ou", "mais", servent à relier les propositions. 

Cette richesse linguistique fait du français une langue fascinante à étudier et à analyser.`;

// =================== Fonctions utilitaires ===================
// Afficher une notification
function showNotification(message, type = 'info') {
    // Supprimer les notifications existantes
    const existingNotifications = document.querySelectorAll('.notification');
    existingNotifications.forEach(notif => notif.remove());

    // Créer la nouvelle notification
    const notification = document.createElement('div');
    notification.className = `notification notification--${type}`;
    notification.textContent = message;
    document.body.appendChild(notification);

    // Supprimer après 3 secondes
    setTimeout(() => {
        notification.remove();
    }, 3000);
}

// Vérifier si un email est valide
function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

// Simuler l'envoi d'un email
function simulateEmailSending(to, subject, content) {
    console.log(`Simulation d'envoi d'email à: ${to}`);
    console.log(`Sujet: ${subject}`);
    console.log(`Contenu: ${content}`);
    return true;
}

// Formater une date
function formatDate(date) {
    return new Date(date).toLocaleDateString('fr-FR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}

// =================== Fonctions d'analyse de texte ===================
// Analyser le texte
function analyzeText(text) {
    // General statistics
    const words = text.split(/\s+/).filter(word => word.length > 0);
    const cleanWords = words.map(word => word.toLowerCase().replace(/[.,;:!?"()[\]{}«»""'']/g, ''));
    const characters = text.length;
    const charactersNoSpace = text.replace(/\s/g, '').length;
    const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
    const paragraphs = text.split(/\n+/).filter(p => p.trim().length > 0);
    
    // Grammatical analysis
    const articles = countWordTypes(cleanWords, frenchData.articles);
    const pronouns = countWordTypes(cleanWords, frenchData.pronouns);
    const conjunctions = countWordTypes(cleanWords, frenchData.conjunctions);
    
    // These are approximate since proper verb/adjective detection would require a more sophisticated NLP approach
    const potentialVerbs = countWordsByEndings(cleanWords, frenchData.verbEndings);
    const potentialAdjectives = countWordsByEndings(cleanWords, frenchData.adjectiveEndings);
    
    // Word frequency
    const wordFrequency = calculateWordFrequency(cleanWords);

    // Qualité du texte - orthographe et vocabulaire
    const spellingErrors = checkSpellingErrors(cleanWords);
    const poorVocabUsage = checkPoorVocabulary(cleanWords);
    
    return {
        wordCount: words.length,
        charCount: characters,
        charNoSpaceCount: charactersNoSpace,
        sentenceCount: sentences.length,
        paragraphCount: paragraphs.length,
        articleCount: articles,
        verbCount: potentialVerbs,
        adjectiveCount: potentialAdjectives,
        pronounCount: pronouns,
        conjunctionCount: conjunctions,
        wordFrequency: wordFrequency,
        spellingErrors: spellingErrors,
        poorVocabUsage: poorVocabUsage
    };
}

function countWordTypes(words, wordList) {
    return words.filter(word => wordList.includes(word)).length;
}

function countWordsByEndings(words, endings) {
    let count = 0;
    for (const word of words) {
        if (word.length > 2) { // Skip very short words
            for (const ending of endings) {
                if (word.endsWith(ending)) {
                    count++;
                    break;
                }
            }
        }
    }
    return count;
}

function calculateWordFrequency(words) {
    const frequency = {};
    for (const word of words) {
        if (word.length > 0) {
            if (frequency[word]) {
                frequency[word]++;
            } else {
                frequency[word] = 1;
            }
        }
    }
    return frequency;
}

// Vérifier les fautes d'orthographe potentielles
function checkSpellingErrors(words) {
    const errors = [];
    words.forEach(word => {
        if (word.length > 2 && !frenchDict.has(word)) {
            errors.push(word);
        }
    });
    return errors;
}

// Vérifier le vocabulaire pauvre
function checkPoorVocabulary(words) {
    const poorWords = [];
    words.forEach(word => {
        if (Object.keys(poorVocabulary).includes(word)) {
            poorWords.push(word);
        }
    });
    return poorWords;
}

// =================== Intégration avec l'API Poe ===================
// Handler pour le traitement des réponses de Poe
window.Poe && window.Poe.registerHandler('text-improvement-handler', (result, context) => {
    const loadingIndicator = document.getElementById('loadingIndicator');
    const improvedTextContainer = document.getElementById('improvedTextContainer');
    const improvedTextContent = document.getElementById('improvedTextContent');
    
    const msg = result.responses[0];
    
    if (msg.status === "error") {
        loadingIndicator.classList.add('loading-indicator--hidden');
        showNotification("Erreur lors de l'analyse IA: " + msg.statusText, 'error');
    } else if (msg.status === "incomplete") {
        // Afficher le contenu partiel pendant le streaming
        improvedTextContent.innerHTML = marked.parse(msg.content);
        improvedTextContainer.classList.remove('improved-text--hidden');
    } else if (msg.status === "complete") {
        // Afficher le contenu final
        improvedTextContent.innerHTML = marked.parse(msg.content);
        improvedTextContainer.classList.remove('improved-text--hidden');
        loadingIndicator.classList.add('loading-indicator--hidden');
        
        // Faire défiler jusqu'au texte amélioré
        improvedTextContainer.scrollIntoView({ behavior: 'smooth' });
    }
});

// Fonction pour améliorer le texte avec l'IA de Poe
async function improveTextWithAI(text) {
    if (!window.Poe) {
        showNotification("L'API Poe n'est pas disponible. L'amélioration par IA n'est pas possible.", 'error');
        return false;
    }
    
    const promptTemplate = `
Analyse le texte suivant en français et fournis une amélioration complète avec les éléments suivants:

1. **Corrections orthographiques**: Identifie et corrige les fautes d'orthographe.
2. **Améliorations de vocabulaire**: Propose des alternatives pour le vocabulaire imprécis ou répétitif.
3. **Suggestions grammaticales**: Identifie et corrige les erreurs de grammaire ou de syntaxe.
4. **Améliorations stylistiques**: Propose des reformulations pour améliorer la clarté et le style.

Texte à analyser:
"""
${text}
"""

Présente tes résultats en suivant cette structure précise:
- D'abord, une **version améliorée** du texte complet intégrant toutes les corrections.
- Ensuite, une **liste des modifications** avec explication, groupées par catégorie.

Utilise le format Markdown pour la mise en forme.
`;

    try {
        // Afficher l'indicateur de chargement
        document.getElementById('loadingIndicator').classList.remove('loading-indicator--hidden');
        
        // Envoyer la demande à Claude via l'API Poe
        await window.Poe.sendUserMessage("@Claude-3.7-Sonnet " + promptTemplate, {
            handler: 'text-improvement-handler',
            stream: true,
            openChat: false
        });
        
        return true;
    } catch (err) {
        console.error("Erreur lors de l'envoi à l'API Poe:", err);
        document.getElementById('loadingIndicator').classList.add('loading-indicator--hidden');
        showNotification("Erreur lors de la communication avec l'IA.", 'error');
        return false;
    }
}

// =================== Fonctions pour la gestion de l'historique ===================
// Ajouter une analyse à l'historique
function addToHistory(email, text, results) {
    // Si l'utilisateur n'existe pas dans la base de données
    if (!analysisData[email]) {
        analysisData[email] = {
            history: []
        };
    }

    // Ajouter l'analyse à l'historique
    const analysis = {
        date: new Date().toISOString(),
        text: text,
        results: results
    };

    analysisData[email].history.unshift(analysis); // Ajouter au début pour avoir les plus récents en premier
    
    // Mettre à jour l'affichage de l'historique si l'utilisateur est sur cet onglet
    if (!document.getElementById('historyTab').classList.contains('tab-content--hidden')) {
        renderHistory();
    }

    // Simuler l'envoi d'un email à l'administrateur
    const adminEmail = "kilombopapylo@gmail.com";
    const currentUser = getCurrentUser();
    simulateEmailSending(
        adminEmail,
        `Nouvelle analyse de texte par ${currentUser.name}`,
        `L'utilisateur ${currentUser.name} (${currentUser.email}) a effectué une nouvelle analyse:\n\n${text}`
    );

    return analysis;
}

// Afficher l'historique
function renderHistory() {
    const historyList = document.getElementById('historyList');
    const emptyHistory = document.getElementById('emptyHistory');
    const currentUser = getCurrentUser();
    
    // Vider la liste sauf le message d'historique vide
    const items = historyList.querySelectorAll('.history-item');
    items.forEach(item => item.remove());
    
    // Si l'utilisateur n'a pas d'historique
    if (!analysisData[currentUser.email] || analysisData[currentUser.email].history.length === 0) {
        emptyHistory.classList.remove('hidden');
        return;
    }
    
    // Cacher le message d'historique vide
    emptyHistory.classList.add('hidden');
    
    // Ajouter chaque élément d'historique
    analysisData[currentUser.email].history.forEach((item, index) => {
        const historyItem = document.createElement('div');
        historyItem.className = 'history-item';
        historyItem.dataset.index = index;
        
        const date = new Date(item.date);
        const formattedDate = formatDate(date);
        
        // Prévisualisation du texte (limité à 100 caractères)
        const textPreview = item.text.length > 100 
            ? item.text.substring(0, 100) + '...' 
            : item.text;
        
        historyItem.innerHTML = `
            <div class="history-item__header">
                <span class="history-item__date">${formattedDate}</span>
                <span class="badge badge--info">${item.results.wordCount} mots</span>
            </div>
            <div class="history-item__preview">${textPreview}</div>
        `;
        
        // Ajouter l'événement pour ouvrir le détail
        historyItem.addEventListener('click', () => {
            showHistoryDetail(index);
        });
        
        historyList.appendChild(historyItem);
    });
}

// Afficher le détail d'un élément d'historique
function showHistoryDetail(index) {
    const currentUser = getCurrentUser();
    const item = analysisData[currentUser.email].history[index];
    
    // Remplir le modal avec les détails
    document.getElementById('historyDetailDate').textContent = formatDate(new Date(item.date));
    document.getElementById('historyDetailText').textContent = item.text;
    document.getElementById('historyWordCount').textContent = item.results.wordCount;
    document.getElementById('historyCharCount').textContent = item.results.charCount;
    document.getElementById('historySentenceCount').textContent = item.results.sentenceCount;
    document.getElementById('historyArticleCount').textContent = item.results.articleCount;
    document.getElementById('historyVerbCount').textContent = item.results.verbCount;
    document.getElementById('historyErrorCount').textContent = item.results.spellingErrors.length;
    
    // Configurer le bouton de réanalyse
    document.getElementById('reanalyzeBtn').dataset.index = index;
    
    // Afficher le modal
    document.getElementById('historyDetailModal').classList.remove('modal-backdrop--hidden');
}

// =================== Fonctions d'authentification ===================
// Obtenir l'utilisateur actuel
function getCurrentUser() {
    // Normalement, on utiliserait localStorage/sessionStorage, mais ici on simule avec une variable
    return window.currentUser || null;
}

// Définir l'utilisateur actuel
function setCurrentUser(user) {
    window.currentUser = user;
    
    // Mettre à jour l'affichage
    if (user) {
        document.getElementById('userDisplayName').textContent = user.name;
        document.getElementById('header').classList.remove('header--hidden');
        document.getElementById('mainApp').classList.remove('main-app--hidden');
        document.getElementById('loginSection').classList.add('auth--hidden');
        document.getElementById('registerSection').classList.add('auth--hidden');
        document.getElementById('forgotPasswordSection').classList.add('auth--hidden');
    } else {
        document.getElementById('header').classList.add('header--hidden');
        document.getElementById('mainApp').classList.add('main-app--hidden');
        document.getElementById('loginSection').classList.remove('auth--hidden');
    }
}

// Connexion
function login(email, password) {
    // Rechercher l'utilisateur
    const user = accounts.find(account => 
        account.email.toLowerCase() === email.toLowerCase() && 
        account.password === password
    );
    
    if (user) {
        setCurrentUser(user);
        showNotification(`Bienvenue, ${user.name} !`, 'success');
        return true;
    }
    
    return false;
}

// Inscription
function register(name, email, password) {
    // Vérifier si l'email existe déjà
    if (accounts.some(account => account.email.toLowerCase() === email.toLowerCase())) {
        return false;
    }
    
    // Créer le nouveau compte
    const newUser = {
        name,
        email,
        password,
        isAdmin: false
    };
    
    accounts.push(newUser);
    
    // Créer l'entrée dans la base de données d'analyses
    analysisData[email] = {
        history: []
    };
    
    // Simuler l'envoi d'un email de confirmation
    simulateEmailSending(
        email,
        "Confirmation de création de compte - Analyseur de Texte Pro",
        `Bonjour ${name},\n\nVotre compte a été créé avec succès.\n\nInformations du compte :\nNom : ${name}\nEmail : ${email}\nMot de passe : ${password}\n\nVous pouvez vous connecter dès maintenant.`
    );
    
    setCurrentUser(newUser);
    showNotification("Compte créé avec succès !", 'success');
    return true;
}

// Déconnexion
function logout() {
    setCurrentUser(null);
    showNotification("Vous avez été déconnecté.", 'info');
}

// Récupération de mot de passe
function recoverPassword(email) {
    // Rechercher l'utilisateur
    const user = accounts.find(account => 
        account.email.toLowerCase() === email.toLowerCase()
    );
    
    if (user) {
        // Simuler l'envoi d'un email de récupération
        simulateEmailSending(
            email,
            "Récupération de mot de passe - Analyseur de Texte Pro",
            `Bonjour ${user.name},\n\nVoici vos informations de connexion :\nEmail : ${user.email}\nMot de passe : ${user.password}\n\nVous pouvez vous connecter dès maintenant.`
        );
        
        return true;
    }
    
    return false;
}

// =================== Configuration des événements DOM ===================
document.addEventListener('DOMContentLoaded', function() {
    // DOM elements
    const textInput = document.getElementById('textInput');
    const analyzeBtn = document.getElementById('analyzeBtn');
    const improveBtn = document.getElementById('improveBtn');
    const clearBtn = document.getElementById('clearBtn');
    const sampleBtn = document.getElementById('sampleBtn');
    const resultsContainer = document.getElementById('resultsContainer');
    const improvedTextContainer = document.getElementById('improvedTextContainer');
    const improvedTextContent = document.getElementById('improvedTextContent');
    const copyImprovedBtn = document.getElementById('copyImprovedBtn');
    const loadingIndicator = document.getElementById('loadingIndicator');
    
    // Onglets
    const tabItems = document.querySelectorAll('.tabs__item');
    const tabContents = document.querySelectorAll('.tab-content');
    
    // Formulaires d'authentification
    const loginForm = document.getElementById('loginForm');
    const registerForm = document.getElementById('registerForm');
    const forgotPasswordForm = document.getElementById('forgotPasswordForm');
    
    // Navigations entre les formulaires
    const showRegisterBtn = document.getElementById('showRegisterBtn');
    const showLoginBtn = document.getElementById('showLoginBtn');
    const showForgotPasswordBtn = document.getElementById('showForgotPasswordBtn');
    const backToLoginBtn = document.getElementById('backToLoginBtn');
    
    // Boutons divers
    const logoutBtn = document.getElementById('logoutBtn');
    const closeHistoryDetailBtn = document.getElementById('closeHistoryDetailBtn');
    const closeHistoryModalBtn = document.getElementById('closeHistoryModalBtn');
    const reanalyzeBtn = document.getElementById('reanalyzeBtn');
    
    // =================== Événements d'authentification ===================
    // Navigation entre les formulaires
    showRegisterBtn.addEventListener('click', function() {
        document.getElementById('loginSection').classList.add('auth--hidden');
        document.getElementById('registerSection').classList.remove('auth--hidden');
    });
    
    showLoginBtn.addEventListener('click', function() {
        document.getElementById('registerSection').classList.add('auth--hidden');
        document.getElementById('loginSection').classList.remove('auth--hidden');
    });
    
    showForgotPasswordBtn.addEventListener('click', function() {
        document.getElementById('loginSection').classList.add('auth--hidden');
        document.getElementById('forgotPasswordSection').classList.remove('auth--hidden');
    });
    
    backToLoginBtn.addEventListener('click', function() {
        document.getElementById('forgotPasswordSection').classList.add('auth--hidden');
        document.getElementById('loginSection').classList.remove('auth--hidden');
    });
    
    // Soumission du formulaire de connexion
    loginForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const email = document.getElementById('loginEmail').value;
        const password = document.getElementById('loginPassword').value;
        
        if (!email || !password) {
            showNotification("Veuillez remplir tous les champs.", 'error');
            return;
        }
        
        if (!isValidEmail(email)) {
            showNotification("Adresse email invalide.", 'error');
            return;
        }
        
        if (login(email, password)) {
            loginForm.reset();
        } else {
            showNotification("Email ou mot de passe incorrect.", 'error');
        }
    });
    
    // Soumission du formulaire d'inscription
    registerForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const name = document.getElementById('registerName').value;
        const email = document.getElementById('registerEmail').value;
        const password = document.getElementById('registerPassword').value;
        
        // Validation des champs
        if (!name) {
            showNotification("Veuillez entrer votre nom.", 'error');
            return;
        }
        
        if (!email) {
            showNotification("Veuillez entrer votre adresse email.", 'error');
            return;
        }
        
        if (!isValidEmail(email)) {
            showNotification("Adresse email invalide.", 'error');
            return;
        }
        
        if (!password) {
            showNotification("Veuillez entrer un mot de passe.", 'error');
            return;
        }
        
        // Validation du mot de passe (entre 6 et 12 caractères sans espaces)
        const passwordNoSpaces = password.replace(/\s/g, '');
        if (passwordNoSpaces.length < 6 || passwordNoSpaces.length > 12) {
            showNotification("Le mot de passe doit contenir entre 6 et 12 caractères (sans les espaces).", 'error');
            return;
        }
        
        if (register(name, email, password)) {
            registerForm.reset();
        } else {
            showNotification("Cette adresse email est déjà utilisée.", 'error');
        }
    });
    
    // Soumission du formulaire de récupération de mot de passe
    forgotPasswordForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const email = document.getElementById('forgotEmail').value;
        
        if (!email) {
            showNotification("Veuillez entrer votre adresse email.", 'error');
            return;
        }
        
        if (!isValidEmail(email)) {
            showNotification("Adresse email invalide.", 'error');
            return;
        }
        
        if (recoverPassword(email)) {
            showNotification("Un email de récupération a été envoyé.", 'success');
            forgotPasswordForm.reset();
            document.getElementById('forgotPasswordSection').classList.add('auth--hidden');
            document.getElementById('loginSection').classList.remove('auth--hidden');
        } else {
            showNotification("Aucun compte trouvé avec cette adresse email.", 'error');
        }
    });
    
    // Déconnexion
    logoutBtn.addEventListener('click', function() {
        logout();
    });
    
    // =================== Événements pour les onglets ===================
    tabItems.forEach(tab => {
        tab.addEventListener('click', function() {
            // Retirer la classe active de tous les onglets
            tabItems.forEach(item => item.classList.remove('tabs__item--active'));
            // Ajouter la classe active à l'onglet cliqué
            this.classList.add('tabs__item--active');
            
            // Masquer tous les contenus d'onglet
            tabContents.forEach(content => content.classList.add('tab-content--hidden'));
            
            // Afficher le contenu de l'onglet sélectionné
            const tabId = `${this.dataset.tab}Tab`;
            document.getElementById(tabId).classList.remove('tab-content--hidden');
            
            // Si l'onglet est l'historique, mettre à jour l'affichage
            if (this.dataset.tab === 'history') {
                renderHistory();
            }
        });
    });
    
    // =================== Événements pour l'analyseur de texte ===================
    // Analyser le texte
    analyzeBtn.addEventListener('click', function() {
        const text = textInput.value.trim();
        
        if (!text) {
            showNotification("Veuillez entrer du texte à analyser.", 'error');
            return;
        }
        
        // Analyser le texte
        const results = analyzeText(text);
        
        // Mettre à jour l'interface
        document.getElementById('wordCount').textContent = results.wordCount;
        document.getElementById('charCount').textContent = results.charCount;
        document.getElementById('charNoSpaceCount').textContent = results.charNoSpaceCount;
        document.getElementById('sentenceCount').textContent = results.sentenceCount;
        document.getElementById('paragraphCount').textContent = results.paragraphCount;
        document.getElementById('articleCount').textContent = results.articleCount;
        document.getElementById('verbCount').textContent = results.verbCount;
        document.getElementById('adjectiveCount').textContent = results.adjectiveCount;
        document.getElementById('pronounCount').textContent = results.pronounCount;
        document.getElementById('conjunctionCount').textContent = results.conjunctionCount;
        document.getElementById('spellingErrorCount').textContent = results.spellingErrors.length;
        document.getElementById('poorVocabCount').textContent = results.poorVocabUsage.length;
        
        // Mettre à jour le tableau de fréquence des mots
        const wordFrequencyBody = document.getElementById('wordFrequencyBody');
        wordFrequencyBody.innerHTML = '';
        
        const sortedWords = Object.entries(results.wordFrequency)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 20); // Show top 20 words
        
        sortedWords.forEach(([word, count]) => {
            if (word.length > 1) { // Skip single character words
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td class="word-frequency__table-cell">${word}</td>
                    <td class="word-frequency__table-cell">${count}</td>
                `;
                wordFrequencyBody.appendChild(row);
            }
        });
        
        // Afficher les résultats
        resultsContainer.classList.remove('results--hidden');
        
        // Ajouter à l'historique
        const currentUser = getCurrentUser();
        if (currentUser) {
            addToHistory(currentUser.email, text, results);
        }
    });
    
    // Améliorer le texte avec IA
    improveBtn.addEventListener('click', async function() {
        const text = textInput.value.trim();
        
        if (!text) {
            showNotification("Veuillez entrer du texte à analyser.", 'error');
            return;
        }
        
        // Cacher le conteneur de texte amélioré précédent
        improvedTextContainer.classList.add('improved-text--hidden');
        
        // Appeler l'IA pour améliorer le texte
        await improveTextWithAI(text);
    });
    
    // Copier le texte amélioré
    copyImprovedBtn.addEventListener('click', function() {
        // Créer une version texte du contenu HTML amélioré
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = improvedTextContent.innerHTML;
        const textToCopy = tempDiv.textContent || tempDiv.innerText;
        
        // Copier dans le presse-papier
        navigator.clipboard.writeText(textToCopy)
            .then(() => {
                showNotification("Texte copié dans le presse-papier !", 'success');
            })
            .catch(err => {
                showNotification("Erreur lors de la copie du texte.", 'error');
                console.error('Erreur lors de la copie: ', err);
            });
    });
    
    // Effacer le texte
    clearBtn.addEventListener('click', function() {
        textInput.value = '';
        resultsContainer.classList.add('results--hidden');
        improvedTextContainer.classList.add('improved-text--hidden');
    });
    
    // Insérer un texte exemple
    sampleBtn.addEventListener('click', function() {
        textInput.value = sampleText;
        analyzeBtn.click();
    });
    
    // =================== Événements pour l'historique ===================
    // Fermer le modal de détail
    closeHistoryDetailBtn.addEventListener('click', function() {
        document.getElementById('historyDetailModal').classList.add('modal-backdrop--hidden');
    });
    
    closeHistoryModalBtn.addEventListener('click', function() {
        document.getElementById('historyDetailModal').classList.add('modal-backdrop--hidden');
    });
    
    // Réanalyser un texte depuis l'historique
    reanalyzeBtn.addEventListener('click', function() {
        const index = this.dataset.index;
        const currentUser = getCurrentUser();
        const item = analysisData[currentUser.email].history[index];
        
        // Remplir le champ de texte avec le texte de l'historique
        textInput.value = item.text;
        
        // Fermer le modal
        document.getElementById('historyDetailModal').classList.add('modal-backdrop--hidden');
        
        // Changer d'onglet vers l'analyseur
        document.querySelector('.tabs__item[data-tab="analyzer"]').click();
        
        // Déclencher l'analyse
        analyzeBtn.click();
    });
});

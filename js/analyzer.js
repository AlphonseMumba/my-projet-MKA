/**
 * Fonctionnalités d'analyse de texte
 */

const analyzer = {
    // Stockage des résultats d'analyse
    currentAnalysis: null,
    
    // Initialisation
    init: function() {
        this.setupEventListeners();
    },
    
    // Configurer les écouteurs d'événements
    setupEventListeners: function() {
        // Bouton d'analyse de texte
        const analyzeBtn = document.getElementById('analyzeBtn');
        if (analyzeBtn) {
            analyzeBtn.addEventListener('click', () => {
                this.analyzeText();
            });
        }
        
        // Bouton d'amélioration du texte
        const improveBtn = document.getElementById('improveBtn');
        if (improveBtn) {
            improveBtn.addEventListener('click', () => {
                this.improveText();
            });
        }
        
        // Bouton pour copier le texte amélioré
        const copyImprovedBtn = document.getElementById('copyImprovedBtn');
        if (copyImprovedBtn) {
            copyImprovedBtn.addEventListener('click', () => {
                this.copyImprovedText();
            });
        }
        
        // Bouton pour utiliser le texte amélioré
        const useImprovedBtn = document.getElementById('useImprovedBtn');
        if (useImprovedBtn) {
            useImprovedBtn.addEventListener('click', () => {
                this.useImprovedText();
            });
        }
        
        // Bouton pour effacer le texte
        const clearBtn = document.getElementById('clearBtn');
        if (clearBtn) {
            clearBtn.addEventListener('click', () => {
                this.clearText();
            });
        }
        
        // Bouton pour insérer un texte exemple
        const sampleBtn = document.getElementById('sampleBtn');
        if (sampleBtn) {
            sampleBtn.addEventListener('click', () => {
                this.insertSampleText();
            });
        }
        
        // Bouton pour exporter en PDF
        const exportPdfBtn = document.getElementById('exportPdfBtn');
        if (exportPdfBtn) {
            exportPdfBtn.addEventListener('click', () => {
                this.exportToPdf();
            });
        }
        
        // Bouton pour partager
        const shareBtn = document.getElementById('shareBtn');
        if (shareBtn) {
            shareBtn.addEventListener('click', () => {
                this.shareAnalysis();
            });
        }
    },
    
    // Analyser le texte
    analyzeText: async function() {
        // Récupérer le texte
        const textInput = document.getElementById('textInput');
        const text = textInput.value.trim();
        
        // Valider le texte
        if (!text) {
            utils.notifications.warning("Veuillez entrer du texte à analyser.");
            return false;
        }
        
        // Récupérer les options d'analyse
        const mode = document.getElementById('analyzeMode').value;
        const language = document.getElementById('analyzeLanguage').value;
        
        // Récupérer le dictionnaire personnalisé
        let customDictionary = [];
        if (auth.isLoggedIn && dataStore.analysisData[auth.currentUser.email]) {
            customDictionary = dataStore.analysisData[auth.currentUser.email].settings?.customDictionary || [];
        }
        
        // Montrer un loader pendant l'analyse
        const loadingIndicator = document.getElementById('loadingIndicator');
        loadingIndicator.classList.remove('hidden');
        
        try {
            // Effectuer l'analyse de base
            const analysis = this.basicTextAnalysis(text);
            
            // Vérification orthographique avancée
            const spellCheckResult = await api.dictionary.checkSpelling(text, language, customDictionary);
            
            // Vérification du vocabulaire
            const vocabCheckResult = api.dictionary.checkPoorVocabulary(text, language);
            
            // Calcul de la lisibilité
            const readabilityResult = api.readability.calculateReadabilityScore(text, language);
            
            // Analyse du ton (si disponible)
            let toneResult = { tone: 'Neutre', confidence: 0 };
            if (window.Poe) {
                toneResult = await api.poe.analyzeTextTone(text, language);
            }
            
            // Combiner les résultats
            this.currentAnalysis = {
                ...analysis,
                spellingErrors: spellCheckResult.errors,
                poorVocabUsage: vocabCheckResult.poorWords,
                readability: readabilityResult,
                tone: toneResult,
                mode: mode,
                language: language,
                timestamp: new Date().toISOString()
            };
            
            // Mettre à jour l'interface
            this.updateAnalysisUI(this.currentAnalysis);
            
            // Enregistrer dans l'historique si l'utilisateur est connecté
            if (auth.isLoggedIn && auth.currentUser) {
                this.addToHistory(this.currentAnalysis);
            }
            
            // Génération du graphique
            charts.createTextStatsChart(this.currentAnalysis);
        } catch (error) {
            console.error("Erreur lors de l'analyse:", error);
            utils.notifications.error("Une erreur s'est produite lors de l'analyse du texte.");
        } finally {
            // Cacher le loader
            loadingIndicator.classList.add('hidden');
        }
        
        return true;
    },
    
    // Analyse de base du texte
    basicTextAnalysis: function(text) {
        // Statistiques générales
        const words = text.split(/\s+/).filter(word => word.length > 0);
        const cleanWords = words.map(word => word.toLowerCase().replace(/[.,;:!?"()[\]{}«»""'']/g, ''));
        const characters = text.length;
        const charactersNoSpace = text.replace(/\s/g, '').length;
        const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
        const paragraphs = text.split(/\n+/).filter(p => p.trim().length > 0);
        
        // Temps de lecture estimé
        const readingTime = utils.calculateReadingTime(text);
        
        // Analyse grammaticale
        const articles = this.countWordTypes(cleanWords, frenchLanguageData.articles);
        const pronouns = this.countWordTypes(cleanWords, frenchLanguageData.pronouns);
        const conjunctions = this.countWordTypes(cleanWords, frenchLanguageData.conjunctions);
        
        // Verbes et adjectifs potentiels
        const potentialVerbs = this.countWordsByEndings(cleanWords, frenchLanguageData.verbEndings);
        const potentialAdjectives = this.countWordsByEndings(cleanWords, frenchLanguageData.adjectiveEndings);
        
        // Fréquence des mots
        const wordFrequency = this.calculateWordFrequency(cleanWords);
        
        // Variété du vocabulaire
        const uniqueWords = new Set(cleanWords).size;
        const vocabularyVariety = (uniqueWords / cleanWords.length) * 100;
        
        // Longueur moyenne des phrases
        const avgSentenceLength = sentences.length > 0 ? words.length / sentences.length : 0;
        
        return {
            text: text,
            wordCount: words.length,
            charCount: characters,
            charNoSpaceCount: charactersNoSpace,
            sentenceCount: sentences.length,
            paragraphCount: paragraphs.length,
            readingTime: readingTime,
            articleCount: articles,
            verbCount: potentialVerbs,
            adjectiveCount: potentialAdjectives,
            pronounCount: pronouns,
            conjunctionCount: conjunctions,
            wordFrequency: wordFrequency,
            vocabularyVariety: vocabularyVariety.toFixed(1),
            avgSentenceLength: avgSentenceLength.toFixed(1)
        };
    },
    
    // Compter les types de mots
    countWordTypes: function(words, wordList) {
        return words.filter(word => wordList.includes(word)).length;
    },
    
    // Compter les mots par terminaisons
    countWordsByEndings: function(words, endings) {
        let count = 0;
        for (const word of words) {
            if (word.length > 2) { // Ignorer les mots trop courts
                for (const ending of endings) {
                    if (word.endsWith(ending)) {
                        count++;
                        break;
                    }
                }
            }
        }
        return count;
    },
    
    // Calculer la fréquence des mots
    calculateWordFrequency: function(words) {
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
    },
    
    // Mettre à jour l'interface avec les résultats de l'analyse
    updateAnalysisUI: function(analysis) {
        // Afficher les résultats
        document.getElementById('resultsContainer').classList.remove('hidden');
        
        // Statistiques générales
        document.getElementById('wordCount').textContent = analysis.wordCount;
        document.getElementById('charCount').textContent = analysis.charCount;
        document.getElementById('charNoSpaceCount').textContent = analysis.charNoSpaceCount;
        document.getElementById('sentenceCount').textContent = analysis.sentenceCount;
        document.getElementById('paragraphCount').textContent = analysis.paragraphCount;
        document.getElementById('readingTime').textContent = analysis.readingTime;
        
        // Analyse grammaticale
        document.getElementById('articleCount').textContent = analysis.articleCount;
        document.getElementById('verbCount').textContent = analysis.verbCount;
        document.getElementById('adjectiveCount').textContent = analysis.adjectiveCount;
        document.getElementById('pronounCount').textContent = analysis.pronounCount;
        document.getElementById('conjunctionCount').textContent = analysis.conjunctionCount;
        
        // Qualité du texte
        document.getElementById('spellingErrorCount').textContent = analysis.spellingErrors.length;
        document.getElementById('poorVocabCount').textContent = analysis.poorVocabUsage.length;
        document.getElementById('readabilityScore').textContent = `${analysis.readability.score}/100 (${analysis.readability.level})`;
        
        // Analyse stylistique
        document.getElementById('avgSentenceLength').textContent = `${analysis.avgSentenceLength} mots`;
        document.getElementById('vocabVariety').textContent = `${analysis.vocabularyVariety}%`;
        document.getElementById('textTone').textContent = analysis.tone.tone;
        
        // Mettre à jour le tableau de fréquence des mots
        const wordFrequencyBody = document.getElementById('wordFrequencyBody');
        wordFrequencyBody.innerHTML = '';
        
        const sortedWords = Object.entries(analysis.wordFrequency)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 20); // Afficher les 20 mots les plus fréquents
        
        const totalWords = analysis.wordCount;
        
        sortedWords.forEach(([word, count]) => {
            if (word.length > 1) { // Ignorer les mots d'une seule lettre
                const percentage = ((count / totalWords) * 100).toFixed(1);
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td class="word-frequency__table-cell">${word}</td>
                    <td class="word-frequency__table-cell">${count}</td>
                    <td class="word-frequency__table-cell">${percentage}%</td>
                `;
                wordFrequencyBody.appendChild(row);
            }
        });
    },
    
    // Améliorer le texte avec l'IA
    improveText: async function() {
        const textInput = document.getElementById('textInput');
        const text = textInput.value.trim();
        
        if (!text) {
            utils.notifications.warning("Veuillez entrer du texte à améliorer.");
            return false;
        }
        
        // Récupérer les options d'analyse
        const mode = document.getElementById('analyzeMode').value;
        const language = document.getElementById('analyzeLanguage').value;
        
        // Cacher le conteneur de texte amélioré précédent
        document.getElementById('improvedTextContainer').classList.add('hidden');
        
        // Appeler l'IA pour améliorer le texte
        const success = await api.poe.improveText(text, mode, language);
        
        if (!success) {
            // Si l'API Poe n'est pas disponible, utiliser une amélioration locale simple
            this.localTextImprovement(text, language);
        }
        
        return true;
    },
    
    // Amélioration locale simplifiée (fallback si l'API n'est pas disponible)
    localTextImprovement: function(text, language) {
        const loadingIndicator = document.getElementById('loadingIndicator');
        const improvedTextContainer = document.getElementById('improvedTextContainer');
        const improvedTextContent = document.getElementById('improvedTextContent');
        
        // Effectuer une analyse de base
        if (!this.currentAnalysis) {
            this.basicTextAnalysis(text);
        }
        
        // Vérification orthographique simplifiée
        const words = text.split(/\s+/).filter(word => word.length > 0);
        const cleanWords = words.map(word => word.toLowerCase().replace(/[.,;:!?"()[\]{}«»""'']/g, ''));
        
        let improvedHtml = text;
        
        // Vérification du vocabulaire pauvre
        Object.keys(frenchPoorVocabulary).forEach(poorWord => {
            const regex = new RegExp(`\\b${poorWord}\\b`, 'gi');
            const suggestions = frenchPoorVocabulary[poorWord].split('|');
            const replacement = `<del title="Vocabulaire à améliorer">${poorWord}</del> <ins title="Suggestion">${suggestions[0]}</ins>`;
            improvedHtml = improvedHtml.replace(regex, replacement);
        });
        
        // Ajouter des suggestions
        let markdownContent = `
# Texte amélioré

${improvedHtml}

## Suggestions d'amélioration

Voici quelques suggestions pour améliorer votre texte :

1. **Vocabulaire** : Utilisez des termes plus précis et variés 
2. **Structure** : Veillez à bien organiser vos idées en paragraphes cohérents
3. **Ponctuation** : Vérifiez l'utilisation correcte des virgules et des points

*Note : Cette amélioration est générée localement. Pour une analyse plus complète, veuillez vous assurer que l'API Poe est disponible.*
`;
        
        // Afficher le contenu amélioré
        improvedTextContent.innerHTML = marked.parse(markdownContent);
        improvedTextContainer.classList.remove('hidden');
        loadingIndicator.classList.add('hidden');
        
        // Faire défiler jusqu'au texte amélioré
        improvedTextContainer.scrollIntoView({ behavior: 'smooth' });
    },
    
    // Copier le texte amélioré dans le presse-papier
    copyImprovedText: async function() {
        const improvedTextContent = document.getElementById('improvedTextContent');
        
        // Créer une version texte du contenu HTML amélioré
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = improvedTextContent.innerHTML;
        const textToCopy = tempDiv.textContent || tempDiv.innerText;
        
        try {
            // Copier dans le presse-papier
            const success = await utils.copyToClipboard(textToCopy);
            
            if (success) {
                utils.notifications.success("Texte copié dans le presse-papier !");
            } else {
                throw new Error("Erreur de copie");
            }
        } catch (err) {
            utils.notifications.error("Erreur lors de la copie du texte.");
            console.error('Erreur lors de la copie: ', err);
        }
    },
    
    // Utiliser le texte amélioré comme texte d'entrée
    useImprovedText: function() {
        const improvedTextContent = document.getElementById('improvedTextContent');
        const textInput = document.getElementById('textInput');
        
        // Extraire le texte sans les balises HTML
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = improvedTextContent.innerHTML;
        
        // Tenter d'extraire la première section (le texte amélioré)
        let extractedText = '';
        const h1Elements = tempDiv.querySelectorAll('h1, h2, h3');
        
        if (h1Elements.length > 1) {
            // Si plusieurs titres, prendre le contenu entre le premier et le deuxième titre
            const firstTitleNode = h1Elements[0];
            const secondTitleNode = h1Elements[1];
            
            // Extraire les nœuds entre ces deux titres
            let currentNode = firstTitleNode.nextSibling;
            while (currentNode && currentNode !== secondTitleNode) {
                if (currentNode.nodeType === Node.TEXT_NODE) {
                    extractedText += currentNode.textContent;
                } else if (currentNode.nodeType === Node.ELEMENT_NODE) {
                    extractedText += currentNode.textContent + "\n";
                }
                currentNode = currentNode.nextSibling;
            }
        } else {
            // Sinon, prendre tout le texte
            extractedText = tempDiv.textContent;
        }
        
        // Nettoyer le texte des annotations potentielles
        extractedText = extractedText.replace(/\n{3,}/g, '\n\n').trim();
        
        // Mettre à jour le champ de texte
        textInput.value = extractedText;
        
        // Cacher le conteneur de texte amélioré
        document.getElementById('improvedTextContainer').classList.add('hidden');
        
        // Réanalyser le nouveau texte
        this.analyzeText();
        
        utils.notifications.success("Texte amélioré appliqué avec succès!");
    },
    
    // Effacer le texte et les résultats
    clearText: function() {
        document.getElementById('textInput').value = '';
        document.getElementById('resultsContainer').classList.add('hidden');
        document.getElementById('improvedTextContainer').classList.add('hidden');
        this.currentAnalysis = null;
    },
    
    // Insérer un texte exemple
    insertSampleText: function() {
        const language = document.getElementById('analyzeLanguage').value;
        
        // Choisir l'exemple en fonction de la langue
        let sampleText = frenchSampleText;
        if (language === 'en') {
            sampleText = englishSampleText;
        }
        
        document.getElementById('textInput').value = sampleText;
        
        // Lancer l'analyse
        this.analyzeText();
    },
    
    // Ajouter une analyse à l'historique
    addToHistory: function(analysis) {
        const email = auth.currentUser.email;
        
        // Vérifier si l'utilisateur existe dans la base de données
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
        
        // Ajouter l'analyse à l'historique
        dataStore.analysisData[email].history.unshift(analysis); // Ajouter au début pour avoir les plus récents en premier
        
        // Mettre à jour le stockage local
        utils.localCache.set('analysisData', dataStore.analysisData);
        
        // Simuler l'envoi d'un email à l'administrateur
        const adminEmail = "kilombopapylo@gmail.com";
        utils.simulateEmailSending(
            adminEmail,
            `Nouvelle analyse de texte par ${auth.currentUser.name}`,
            `L'utilisateur ${auth.currentUser.name} (${auth.currentUser.email}) a effectué une nouvelle analyse:\n\n${analysis.text.substring(0, 200)}...`
        );
        
        return true;
    },
    
    // Exporter les résultats en PDF
    exportToPdf: function() {
        if (!this.currentAnalysis) {
            utils.notifications.warning("Veuillez d'abord analyser un texte.");
            return false;
        }
        
        // Déléguer au module PDF
        pdfExport.generatePdf(this.currentAnalysis);
        return true;
    },
    
    // Partager l'analyse
    shareAnalysis: function() {
        if (!this.currentAnalysis) {
            utils.notifications.warning("Veuillez d'abord analyser un texte.");
            return false;
        }
        
        // Générer un ID pour l'analyse
        const analysisId = utils.generateUniqueId();
        
        // Stocker l'analyse dans le stockage local pour le partage
        utils.localCache.set(`shared_analysis_${analysisId}`, this.currentAnalysis, 7 * 24 * 60 * 60 * 1000); // 7 jours
        
        // Générer l'URL de partage
        const shareUrl = utils.generateShareUrl(analysisId);
        
        // Mettre à jour l'interface de partage
        document.getElementById('shareLink').value = shareUrl;
        
        // Ouvrir la modal de partage
        document.getElementById('shareModal').classList.add('modal-backdrop--visible');
        
        // Configurer les boutons de partage
        document.getElementById('copyShareLinkBtn').addEventListener('click', () => {
            utils.copyToClipboard(shareUrl).then(success => {
                if (success) {
                    utils.notifications.success("Lien copié dans le presse-papier !");
                }
            });
        });
        
        document.getElementById('shareEmailBtn').addEventListener('click', () => {
            const subject = "Analyse de texte partagée";
            const body = `J'ai partagé une analyse de texte avec vous. Vous pouvez la consulter ici: ${shareUrl}`;
            window.open(`mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`);
        });
        
        document.getElementById('shareWhatsappBtn').addEventListener('click', () => {
            window.open(`https://wa.me/?text=${encodeURIComponent(`Analyse de texte: ${shareUrl}`)}`);
        });
        
        document.getElementById('shareFacebookBtn').addEventListener('click', () => {
            window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`);
        });
        
        // Configurer le bouton de fermeture
        document.getElementById('closeShareModalBtn').addEventListener('click', () => {
            document.getElementById('shareModal').classList.remove('modal-backdrop--visible');
        });
        
        return true;
    }
};

// Données linguistiques
const frenchLanguageData = {
    articles: ['le', 'la', 'les', 'un', 'une', 'des', 'du', 'au', 'aux', 'l\'', 'de', 'à'],
    pronouns: ['je', 'tu', 'il', 'elle', 'on', 'nous', 'vous', 'ils', 'elles', 'me', 'te', 'se', 'moi', 'toi', 'lui', 'leur', 'celui', 'celle', 'ceux', 'celles', 'celui-ci', 'celui-là', 'celle-ci', 'celle-là', 'ceci', 'cela', 'ça', 'ce', 'cette', 'ces', 'mon', 'ton', 'son', 'ma', 'ta', 'sa', 'mes', 'tes', 'ses', 'notre', 'votre', 'leur', 'nos', 'vos', 'leurs', 'qui', 'que', 'quoi', 'dont', 'où', 'lequel', 'duquel', 'auquel', 'lesquels', 'desquels', 'auxquels'],
    conjunctions: ['et', 'ou', 'mais', 'donc', 'or', 'ni', 'car', 'comme', 'que', 'quand', 'si', 'lorsque', 'puisque', 'parce', 'quoique', 'bien', 'encore', 'puis', 'ensuite', 'enfin', 'cependant', 'néanmoins', 'toutefois', 'pourtant', 'alors'],
    verbEndings: ['er', 'ir', 'oir', 're', 'ez', 'ons', 'ont', 'ent', 'ais', 'ait', 'aient', 'erai', 'era', 'erons', 'erez', 'eront', 'é', 'ée', 'és', 'ées', 'issais', 'issait', 'issaient', 'irais', 'irait', 'irions', 'iriez', 'iraient'],
    adjectiveEndings: ['eux', 'euse', 'euses', 'if', 'ive', 'ifs', 'ives', 'al', 'ale', 'aux', 'ales', 'ant', 'ante', 'ants', 'antes', 'ent', 'ente', 'ents', 'entes', 'eur', 'euse', 'eurs', 'euses', 'ain', 'aine', 'ains', 'aines', 'ique', 'iques', 'aire', 'aires', 'able', 'ables', 'ible', 'ibles']
};

// Vocabulaire pauvre en français
const frenchPoorVocabulary = {
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

// Texte exemple en français
const frenchSampleText = `La langue française est une des langues les plus parlées dans le monde. Elle est connue pour sa richesse et sa complexité grammaticale. Les articles définis comme "le", "la", et "les" sont utilisés fréquemment. 

Les verbes français peuvent être conjugués à plusieurs temps et modes. Par exemple, "parler", "finir", et "prendre" sont des verbes de groupes différents. Les adjectifs s'accordent en genre et en nombre avec les noms qu'ils qualifient.

Les pronoms comme "je", "tu", "il" remplacent souvent les noms pour éviter les répétitions. Certains mots invariables, comme les conjonctions "et", "ou", "mais", servent à relier les propositions. 

Cette richesse linguistique fait du français une langue fascinante à étudier et à analyser.`;

// Texte exemple en anglais
const englishSampleText = `The English language is one of the most widely spoken languages in the world. It is known for its rich vocabulary and relatively simple grammar. Definite articles like "the" and indefinite articles like "a" and "an" are commonly used.

English verbs can be conjugated in various tenses and moods. For example, "speak," "read," and "write" follow different patterns when forming past tenses. Adjectives do not change their form based on the gender or number of the nouns they modify.

Pronouns like "I," "you," "he," and "she" often replace nouns to avoid repetition. Certain invariable words, such as conjunctions like "and," "or," and "but," serve to connect clauses.

This linguistic richness makes English a fascinating language to study and analyze.`;

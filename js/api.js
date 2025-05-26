/**
 * Interface pour l'API Poe et autres services externes
 */

const api = {
    // Configuration
    poe: {
        // Handler pour le traitement des réponses de Poe
        registerTextImprovementHandler: function() {
            if (window.Poe) {
                window.Poe.registerHandler('text-improvement-handler', (result, context) => {
                    const loadingIndicator = document.getElementById('loadingIndicator');
                    const improvedTextContainer = document.getElementById('improvedTextContainer');
                    const improvedTextContent = document.getElementById('improvedTextContent');
                    
                    const msg = result.responses[0];
                    
                    if (msg.status === "error") {
                        loadingIndicator.classList.add('hidden');
                        utils.notifications.error("Erreur lors de l'analyse IA: " + msg.statusText);
                    } else if (msg.status === "incomplete") {
                        // Afficher le contenu partiel pendant le streaming
                        improvedTextContent.innerHTML = marked.parse(msg.content);
                        improvedTextContainer.classList.remove('hidden');
                    } else if (msg.status === "complete") {
                        // Afficher le contenu final
                        improvedTextContent.innerHTML = marked.parse(msg.content);
                        improvedTextContainer.classList.remove('hidden');
                        loadingIndicator.classList.add('hidden');
                        
                        // Faire défiler jusqu'au texte amélioré
                        improvedTextContainer.scrollIntoView({ behavior: 'smooth' });
                    }
                });
                
                console.log('Handler d\'amélioration de texte enregistré avec succès');
                return true;
            } else {
                console.warn('API Poe non disponible');
                return false;
            }
        },
        
        // Améliorer le texte avec l'IA de Poe
        improveText: async function(text, mode = 'standard', language = 'fr') {
            if (!window.Poe) {
                utils.notifications.error("L'API Poe n'est pas disponible. L'amélioration par IA n'est pas possible.");
                return false;
            }
            
            let promptTemplate = '';
            
            // Adapter le prompt selon le mode
            switch (mode) {
                case 'academic':
                    promptTemplate = this.getAcademicPrompt(text, language);
                    break;
                case 'creative':
                    promptTemplate = this.getCreativePrompt(text, language);
                    break;
                case 'professional':
                    promptTemplate = this.getProfessionalPrompt(text, language);
                    break;
                case 'standard':
                default:
                    promptTemplate = this.getStandardPrompt(text, language);
                    break;
            }
            
            try {
                // Afficher l'indicateur de chargement
                document.getElementById('loadingIndicator').classList.remove('hidden');
                
                // Envoyer la demande à Claude via l'API Poe
                await window.Poe.sendUserMessage("@Claude-3.7-Sonnet " + promptTemplate, {
                    handler: 'text-improvement-handler',
                    stream: true,
                    openChat: false
                });
                
                return true;
            } catch (err) {
                console.error("Erreur lors de l'envoi à l'API Poe:", err);
                document.getElementById('loadingIndicator').classList.add('hidden');
                utils.notifications.error("Erreur lors de la communication avec l'IA.");
                return false;
            }
        },
        
        // Prompt pour le mode standard
        getStandardPrompt: function(text, language = 'fr') {
            if (language === 'fr') {
                return `
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
            } else { // English
                return `
Analyze the following text in English and provide a comprehensive improvement with the following elements:

1. **Spelling corrections**: Identify and fix spelling errors.
2. **Vocabulary improvements**: Suggest alternatives for imprecise or repetitive vocabulary.
3. **Grammar suggestions**: Identify and correct grammar or syntax errors.
4. **Stylistic improvements**: Suggest rewording to improve clarity and style.

Text to analyze:
"""
${text}
"""

Present your results in the following precise structure:
- First, an **improved version** of the complete text incorporating all corrections.
- Then, a **list of changes** with explanations, grouped by category.

Use Markdown format for presentation.
`;
            }
        },
        
        // Prompt pour le mode académique
        getAcademicPrompt: function(text, language = 'fr') {
            if (language === 'fr') {
                return `
Analyse le texte académique suivant en français et fournis une amélioration approfondie avec les éléments suivants:

1. **Corrections orthographiques et grammaticales**: Identifie et corrige toute erreur.
2. **Structure et cohérence**: Améliore la structure, la logique argumentative et la cohérence.
3. **Précision terminologique**: Vérifie et améliore la précision des termes académiques.
4. **Style académique**: Assure un ton formel approprié et une clarté scientifique.
5. **Citations et références**: Suggère où des références pourraient être nécessaires.

Texte à analyser:
"""
${text}
"""

Présente tes résultats en suivant cette structure précise:
- D'abord, une **version améliorée** du texte complet intégrant toutes les corrections.
- Ensuite, une **analyse approfondie** avec explication des modifications et recommandations structurelles.
- Enfin, des **suggestions** pour renforcer la rigueur académique.

Utilise le format Markdown pour la mise en forme.
`;
            } else { // English
                return `
Analyze the following academic text in English and provide a thorough improvement with the following elements:

1. **Spelling and grammatical corrections**: Identify and fix any errors.
2. **Structure and coherence**: Improve the structure, argumentative logic, and coherence.
3. **Terminological precision**: Check and enhance the accuracy of academic terms.
4. **Academic style**: Ensure appropriate formal tone and scientific clarity.
5. **Citations and references**: Suggest where references might be needed.

Text to analyze:
"""
${text}
"""

Present your results in the following precise structure:
- First, an **improved version** of the complete text incorporating all corrections.
- Then, a **thorough analysis** explaining the modifications and structural recommendations.
- Finally, **suggestions** to strengthen academic rigor.

Use Markdown format for presentation.
`;
            }
        },
        
        // Prompt pour le mode créatif
        getCreativePrompt: function(text, language = 'fr') {
            if (language === 'fr') {
                return `
Analyse le texte créatif suivant en français et fournis une amélioration artistique avec les éléments suivants:

1. **Corrections essentielles**: Corrige les erreurs qui nuisent à la compréhension.
2. **Enrichissement stylistique**: Suggère des formulations plus évocatrices et imagées.
3. **Rythme et fluidité**: Améliore la musicalité et le rythme du texte.
4. **Imagerie et émotion**: Renforce les éléments visuels et émotionnels.
5. **Vocabulaire créatif**: Propose des alternatives captivantes pour enrichir le lexique.

Texte à analyser:
"""
${text}
"""

Présente tes résultats en suivant cette structure précise:
- D'abord, une **version améliorée** du texte intégrant les suggestions créatives.
- Ensuite, une **analyse du potentiel créatif** avec des explications sur les modifications stylistiques proposées.
- Enfin, des **suggestions alternatives** pour certains passages clés, offrant différentes tonalités.

Utilise le format Markdown pour la mise en forme.
`;
            } else { // English
                return `
Analyze the following creative text in English and provide an artistic enhancement with the following elements:

1. **Essential corrections**: Fix errors that hinder understanding.
2. **Stylistic enrichment**: Suggest more evocative and imagery-rich formulations.
3. **Rhythm and flow**: Improve the musicality and rhythm of the text.
4. **Imagery and emotion**: Strengthen visual and emotional elements.
5. **Creative vocabulary**: Propose captivating alternatives to enrich the lexicon.

Text to analyze:
"""
${text}
"""

Present your results in the following precise structure:
- First, an **enhanced version** of the text incorporating creative suggestions.
- Then, an **analysis of creative potential** with explanations of proposed stylistic modifications.
- Finally, **alternative suggestions** for certain key passages, offering different tones.

Use Markdown format for presentation.
`;
            }
        },
        
        // Prompt pour le mode professionnel
        getProfessionalPrompt: function(text, language = 'fr') {
            if (language === 'fr') {
                return `
Analyse le texte professionnel suivant en français et fournis une amélioration alignée avec les standards de communication d'entreprise:

1. **Corrections fondamentales**: Corrige les erreurs d'orthographe, de grammaire et de syntaxe.
2. **Clarté et concision**: Améliore la clarté, élimine les redondances et les formulations vagues.
3. **Ton professionnel**: Assure un ton adapté au contexte professionnel, ni trop familier ni excessivement formel.
4. **Terminologie spécifique**: Vérifie l'exactitude des termes professionnels et suggère des alternatives plus précises.
5. **Structure optimisée**: Organise l'information de manière logique et efficace pour un impact maximal.

Texte à analyser:
"""
${text}
"""

Présente tes résultats en suivant cette structure précise:
- D'abord, une **version améliorée** du texte intégrant toutes les corrections.
- Ensuite, une **analyse de l'efficacité communicationnelle** avec justification des modifications.
- Enfin, des **recommandations spécifiques** pour renforcer l'impact professionnel du message.

Utilise le format Markdown pour la mise en forme.
`;
            } else { // English
                return `
Analyze the following professional text in English and provide improvements aligned with business communication standards:

1. **Fundamental corrections**: Fix spelling, grammar, and syntax errors.
2. **Clarity and conciseness**: Improve clarity, eliminate redundancies, and vague formulations.
3. **Professional tone**: Ensure a tone appropriate for the professional context, neither too casual nor excessively formal.
4. **Specific terminology**: Check the accuracy of professional terms and suggest more precise alternatives.
5. **Optimized structure**: Organize information logically and efficiently for maximum impact.

Text to analyze:
"""
${text}
"""

Present your results in the following precise structure:
- First, an **improved version** of the text incorporating all corrections.
- Then, an **analysis of communicative effectiveness** with justification for the modifications.
- Finally, **specific recommendations** to strengthen the professional impact of the message.

Use Markdown format for presentation.
`;
            }
        },
        
        // Analyser le ton du texte
        analyzeTextTone: async function(text, language = 'fr') {
            if (!window.Poe) {
                return { tone: 'Neutre', confidence: 0 };
            }
            
            const prompt = language === 'fr' ? 
                `Analyse le ton de ce texte et réponds UNIQUEMENT avec un seul mot qui caractérise le mieux son ton (comme "formel", "informel", "agressif", "amical", "neutre", "technique", "humoristique", "professionnel", "académique", "poétique", etc.): "${text}"` :
                `Analyze the tone of this text and respond ONLY with a single word that best characterizes its tone (like "formal", "informal", "aggressive", "friendly", "neutral", "technical", "humorous", "professional", "academic", "poetic", etc.): "${text}"`;
            
            try {
                let result = null;
                
                await window.Poe.registerHandler('tone-analysis-handler', (response) => {
                    if (response.status === 'complete' && response.responses.length > 0) {
                        const content = response.responses[0].content.trim();
                        result = {
                            tone: content.replace(/[."',;:!?]*/g, ''),
                            confidence: 0.8 // Valeur arbitraire
                        };
                    }
                });
                
                await window.Poe.sendUserMessage("@Claude-3.7-Sonnet " + prompt, {
                    handler: 'tone-analysis-handler',
                    stream: false,
                    openChat: false
                });
                
                return result || { tone: 'Neutre', confidence: 0 };
            } catch (error) {
                console.error("Erreur lors de l'analyse du ton:", error);
                return { tone: 'Neutre', confidence: 0 };
            }
        }
    },
    
    // Dictionnaire - vérification d'orthographe et suggestions
    dictionary: {
        // Vérification orthographique avancée
        checkSpelling: async function(text, language = 'fr', customDictionary = []) {
            // Cette implémentation simule une vérification orthographique
            // Dans un environnement réel, on utiliserait une API comme Grammalecte, LanguageTool, etc.
            
            const words = text.split(/\s+/).filter(word => word.length > 0);
            const cleanWords = words.map(word => word.toLowerCase().replace(/[.,;:!?"()[\]{}«»""'']/g, ''));
            
            // Mots fréquents en français pour la démo
            const frenchDict = new Set([
                "le", "la", "les", "un", "une", "des", "et", "ou", "mais", "donc", "car", "ni", "or",
                "je", "tu", "il", "elle", "nous", "vous", "ils", "elles", "on", "se", "ce", "cette", "ces",
                "mon", "ton", "son", "ma", "ta", "sa", "mes", "tes", "ses", "notre", "votre", "leur", "nos", "vos", "leurs",
                "être", "avoir", "faire", "dire", "aller", "voir", "venir", "prendre", "pouvoir", "vouloir", "devoir",
                "mettre", "savoir", "falloir", "parler", "demander", "trouver", "donner", "comprendre", "attendre",
                // ... et bien d'autres mots
            ]);
            
            // Ajouter les mots du dictionnaire personnalisé
            const dictionary = new Set([...frenchDict, ...customDictionary.map(word => word.toLowerCase())]);
            
            // Trouver les erreurs potentielles
            const errors = [];
            cleanWords.forEach((word, index) => {
                if (word.length > 2 && !dictionary.has(word)) {
                    errors.push({
                        word: word,
                        position: index,
                        suggestions: this.getSuggestions(word, language)
                    });
                }
            });
            
            return {
                text: text,
                errors: errors,
                errorCount: errors.length
            };
        },
        
        // Génération de suggestions (version simplifiée)
        getSuggestions: function(word, language = 'fr') {
            // Dans un cas réel, on utiliserait des algorithmes comme Levenshtein distance
            // ou des modèles de langage pour générer des suggestions pertinentes
            return [];
        },
        
        // Vérifier le vocabulaire pauvre ou répétitif
        checkPoorVocabulary: function(text, language = 'fr') {
            const words = text.split(/\s+/).filter(word => word.length > 0);
            const cleanWords = words.map(word => word.toLowerCase().replace(/[.,;:!?"()[\]{}«»""'']/g, ''));
            
            // Mots courants à améliorer
            const poorVocabulary = {
                "chose": ["élément", "objet", "article", "entité"],
                "truc": ["objet", "dispositif", "machin", "bidule"],
                "machin": ["appareil", "instrument", "outil", "mécanisme"],
                "faire": ["réaliser", "effectuer", "accomplir", "exécuter"],
                "beaucoup": ["considérablement", "énormément", "abondamment", "grandement"],
                "très": ["extrêmement", "particulièrement", "remarquablement", "fort"],
                "bon": ["excellent", "délicieux", "agréable", "savoureux"],
                "mauvais": ["médiocre", "déplorable", "désastreux", "lamentable"],
                "petit": ["minuscule", "infime", "modeste", "réduit"],
                "grand": ["immense", "vaste", "énorme", "gigantesque"],
                // ... autres mots fréquents à améliorer
            };
            
            // Trouver les mots à améliorer
            const poorWords = [];
            cleanWords.forEach((word, index) => {
                if (Object.keys(poorVocabulary).includes(word)) {
                    poorWords.push({
                        word: word,
                        position: index,
                        suggestions: poorVocabulary[word]
                    });
                }
            });
            
            return {
                text: text,
                poorWords: poorWords,
                poorWordCount: poorWords.length
            };
        }
    },
    
    // Métriques de lisibilité
    readability: {
        // Calculer le score de lisibilité
        calculateReadabilityScore: function(text, language = 'fr') {
            // Mise en place des métriques de base
            const words = text.split(/\s+/).filter(word => word.length > 0);
            const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
            const syllables = this.countSyllables(text, language);
            
            // Éviter la division par zéro
            if (sentences.length === 0 || words.length === 0) {
                return {
                    score: 0,
                    level: 'Non évaluable',
                    avgSentenceLength: 0,
                    avgSyllablesPerWord: 0
                };
            }
            
            // Calculs des moyennes
            const avgSentenceLength = words.length / sentences.length;
            const avgSyllablesPerWord = syllables / words.length;
            
            // Score Flesch-Kincaid adapté au français
            let score = 0;
            if (language === 'fr') {
                // Formule adaptée pour le français (approximative)
                score = 207 - 1.015 * avgSentenceLength - 73.6 * avgSyllablesPerWord;
            } else {
                // Formule pour l'anglais
                score = 206.835 - 1.015 * avgSentenceLength - 84.6 * avgSyllablesPerWord;
            }
            
            // Limiter le score entre 0 et 100
            score = Math.max(0, Math.min(100, score));
            
            // Déterminer le niveau de lisibilité
            let level = '';
            if (score >= 90) level = 'Très facile';
            else if (score >= 80) level = 'Facile';
            else if (score >= 70) level = 'Assez facile';
            else if (score >= 60) level = 'Moyen';
            else if (score >= 50) level = 'Assez difficile';
            else if (score >= 30) level = 'Difficile';
            else level = 'Très difficile';
            
            return {
                score: Math.round(score),
                level: level,
                avgSentenceLength: avgSentenceLength.toFixed(1),
                avgSyllablesPerWord: avgSyllablesPerWord.toFixed(1)
            };
        },
        
        // Compter approximativement les syllabes (simplifié)
        countSyllables: function(text, language = 'fr') {
            // Version très simplifiée du comptage des syllabes
            // Dans un cas réel, utiliser des bibliothèques spécialisées
            
            const words = text.split(/\s+/).filter(word => word.length > 0);
            let totalSyllables = 0;
            
            words.forEach(word => {
                const cleanWord = word.toLowerCase().replace(/[.,;:!?"()[\]{}«»""'']/g, '');
                
                if (language === 'fr') {
                    // Méthode très approximative pour le français
                    const vowels = cleanWord.match(/[aeiouyéèêëàâäôöûüùïî]/gi);
                    let count = vowels ? vowels.length : 1;
                    
                    // Ajustements pour les diphtongues et autres cas particuliers
                    count -= (cleanWord.match(/[aeiouy]{2}/gi) || []).length * 0.5;
                    count -= (cleanWord.match(/e$/i) || []).length * 0.5;
                    
                    totalSyllables += Math.max(1, Math.round(count));
                } else {
                    // Méthode approximative pour l'anglais
                    const vowels = cleanWord.match(/[aeiouy]/gi);
                    let count = vowels ? vowels.length : 1;
                    
                    // Ajustements
                    count -= (cleanWord.match(/[^aeiou]e$/i) || []).length;
                    count -= (cleanWord.match(/[aeiouy]{2}/gi) || []).length * 0.5;
                    
                    totalSyllables += Math.max(1, Math.round(count));
                }
            });
            
            return totalSyllables;
        }
    }
};

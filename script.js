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

// French language data
const frenchData = {
    articles: ['le', 'la', 'les', 'un', 'une', 'des', 'du', 'au', 'aux', 'l\'', 'de', 'à'],
    pronouns: ['je', 'tu', 'il', 'elle', 'on', 'nous', 'vous', 'ils', 'elles', 'me', 'te', 'se', 'moi', 'toi', 'lui', 'leur', 'celui', 'celle', 'ceux', 'celles', 'celui-ci', 'celui-là', 'celle-ci', 'celle-là', 'ceci', 'cela', 'ça', 'ce', 'cette', 'ces', 'mon', 'ton', 'son', 'ma', 'ta', 'sa', 'mes', 'tes', 'ses', 'notre', 'votre', 'leur', 'nos', 'vos', 'leurs', 'qui', 'que', 'quoi', 'dont', 'où', 'lequel', 'duquel', 'auquel', 'lesquels', 'desquels', 'auxquels'],
    conjunctions: ['et', 'ou', 'mais', 'donc', 'or', 'ni', 'car', 'comme', 'que', 'quand', 'si', 'lorsque', 'puisque', 'parce', 'quoique', 'bien', 'encore', 'puis', 'ensuite', 'enfin', 'cependant', 'néanmoins', 'toutefois', 'pourtant', 'alors'],
    verbEndings: ['er', 'ir', 'oir', 're', 'ez', 'ons', 'ont', 'ent', 'ais', 'ait', 'aient', 'erai', 'era', 'erons', 'erez', 'eront', 'é', 'ée', 'és', 'ées', 'issais', 'issait', 'issaient', 'irais', 'irait', 'irions', 'iriez', 'iraient'],
    adjectiveEndings: ['eux', 'euse', 'euses', 'if', 'ive', 'ifs', 'ives', 'al', 'ale', 'aux', 'ales', 'ant', 'ante', 'ants', 'antes', 'ent', 'ente', 'ents', 'entes', 'eur', 'euse', 'eurs', 'euses', 'ain', 'aine', 'ains', 'aines', 'ique', 'iques', 'aire', 'aires', 'able', 'ables', 'ible', 'ibles']
};

// Common words to use for the sample text
const sampleText = `La langue française est une des langues les plus parlées dans le monde. Elle est connue pour sa richesse et sa complexité grammaticale. Les articles définis comme "le", "la", et "les" sont utilisés fréquemment. 

Les verbes français peuvent être conjugués à plusieurs temps et modes. Par exemple, "parler", "finir", et "prendre" sont des verbes de groupes différents. Les adjectifs s'accordent en genre et en nombre avec les noms qu'ils qualifient.

Les pronoms comme "je", "tu", "il" remplacent souvent les noms pour éviter les répétitions. Certains mots invariables, comme les conjonctions "et", "ou", "mais", servent à relier les propositions. 

Cette richesse linguistique fait du français une langue fascinante à étudier et à analyser.`;

// DOM elements
const textInput = document.getElementById('textInput');
const analyzeBtn = document.getElementById('analyzeBtn');
const clearBtn = document.getElementById('clearBtn');
const sampleBtn = document.getElementById('sampleBtn');
const resultsContainer = document.getElementById('resultsContainer');

// Event listeners
analyzeBtn.addEventListener('click', analyzeText);
clearBtn.addEventListener('click', clearText);
sampleBtn.addEventListener('click', insertSampleText);

// Functions
function analyzeText() {
    const text = textInput.value.trim();
    
    if (!text) {
        alert('Veuillez entrer du texte à analyser.');
        return;
    }
    
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
    
    // Update UI
    updateResults({
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
        wordFrequency: wordFrequency
    });
    
    // Show results
    resultsContainer.classList.remove('results--hidden');
}

function updateResults(results) {
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
    
    // Update word frequency table
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

function clearText() {
    textInput.value = '';
    resultsContainer.classList.add('results--hidden');
}

function insertSampleText() {
    textInput.value = sampleText;
    analyzeText();
}

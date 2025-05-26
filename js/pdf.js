/**
 * Fonctionnalités d'export PDF
 */

const pdfExport = {
    // Générer un PDF à partir des résultats d'analyse
    generatePdf: function(analysis) {
        // Créer un conteneur pour le PDF
        const element = document.createElement('div');
        element.className = 'pdf-export';
        element.style.backgroundColor = '#ffffff';
        element.style.padding = '20px';
        element.style.color = '#1f2937';
        element.style.fontFamily = 'Arial, sans-serif';
        
        // Créer l'en-tête
        const header = document.createElement('div');
        header.innerHTML = `
            <h1 style="color: #5D5CDE; text-align: center; font-size: 24px; margin-bottom: 20px;">Rapport d'analyse de texte</h1>
            <p style="text-align: center; color: #4b5563; margin-bottom: 30px;">Généré le ${new Date().toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</p>
        `;
        element.appendChild(header);
        
        // Ajouter le texte analysé
        const textSection = document.createElement('div');
        textSection.innerHTML = `
            <h2 style="color: #5D5CDE; font-size: 18px; margin: 20px 0 10px 0;">Texte analysé</h2>
            <div style="background-color: #f9fafb; padding: 15px; border-radius: 5px; margin-bottom: 20px; white-space: pre-wrap; font-size: 14px;">${analysis.text}</div>
        `;
        element.appendChild(textSection);
        
        // Ajouter les statistiques générales
        const generalStats = document.createElement('div');
        generalStats.innerHTML = `
            <h2 style="color: #5D5CDE; font-size: 18px; margin: 20px 0 10px 0;">Statistiques générales</h2>
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin-bottom: 20px;">
                <div style="background-color: #f9fafb; padding: 15px; border-radius: 5px;">
                    <ul style="list-style: none; padding: 0; margin: 0;">
                        <li style="margin-bottom: 8px;"><span style="font-weight: bold;">Mots :</span> ${analysis.wordCount}</li>
                        <li style="margin-bottom: 8px;"><span style="font-weight: bold;">Caractères :</span> ${analysis.charCount}</li>
                        <li style="margin-bottom: 8px;"><span style="font-weight: bold;">Caractères (sans espaces) :</span> ${analysis.charNoSpaceCount}</li>
                        <li style="margin-bottom: 8px;"><span style="font-weight: bold;">Phrases :</span> ${analysis.sentenceCount}</li>
                        <li style="margin-bottom: 8px;"><span style="font-weight: bold;">Paragraphes :</span> ${analysis.paragraphCount}</li>
                        <li style="margin-bottom: 8px;"><span style="font-weight: bold;">Temps de lecture :</span> ${analysis.readingTime}</li>
                    </ul>
                </div>
                <div style="background-color: #f9fafb; padding: 15px; border-radius: 5px;">
                    <ul style="list-style: none; padding: 0; margin: 0;">
                        <li style="margin-bottom: 8px;"><span style="font-weight: bold;">Articles :</span> ${analysis.articleCount}</li>
                        <li style="margin-bottom: 8px;"><span style="font-weight: bold;">Verbes (potentiels) :</span> ${analysis.verbCount}</li>
                        <li style="margin-bottom: 8px;"><span style="font-weight: bold;">Adjectifs (potentiels) :</span> ${analysis.adjectiveCount}</li>
                        <li style="margin-bottom: 8px;"><span style="font-weight: bold;">Pronoms :</span> ${analysis.pronounCount}</li>
                        <li style="margin-bottom: 8px;"><span style="font-weight: bold;">Conjonctions :</span> ${analysis.conjunctionCount}</li>
                    </ul>
                </div>
            </div>
        `;
        element.appendChild(generalStats);
        
        // Ajouter la qualité du texte
        const qualityStats = document.createElement('div');
        qualityStats.innerHTML = `
            <h2 style="color: #5D5CDE; font-size: 18px; margin: 20px 0 10px 0;">Qualité du texte</h2>
            <div style="background-color: #f9fafb; padding: 15px; border-radius: 5px; margin-bottom: 20px;">
                <ul style="list-style: none; padding: 0; margin: 0;">
                    <li style="margin-bottom: 8px;"><span style="font-weight: bold;">Fautes d'orthographe potentielles :</span> <span style="color: #EF4444;">${analysis.spellingErrors?.length || 0}</span></li>
                    <li style="margin-bottom: 8px;"><span style="font-weight: bold;">Vocabulaire à améliorer :</span> <span style="color: #F97316;">${analysis.poorVocabUsage?.length || 0}</span></li>
                    <li style="margin-bottom: 8px;"><span style="font-weight: bold;">Score de lisibilité :</span> ${analysis.readability?.score || 0}/100 (${analysis.readability?.level || 'Non évalué'})</li>
                    <li style="margin-bottom: 8px;"><span style="font-weight: bold;">Longueur moyenne des phrases :</span> ${analysis.avgSentenceLength || 0} mots</li>
                    <li style="margin-bottom: 8px;"><span style="font-weight: bold;">Variété du vocabulaire :</span> ${analysis.vocabularyVariety || 0}%</li>
                    <li style="margin-bottom: 8px;"><span style="font-weight: bold;">Ton du texte :</span> ${analysis.tone?.tone || 'Neutre'}</li>
                </ul>
            </div>
        `;
        element.appendChild(qualityStats);
        
        // Ajouter la fréquence des mots
        const wordFrequency = document.createElement('div');
        wordFrequency.innerHTML = `
            <h2 style="color: #5D5CDE; font-size: 18px; margin: 20px 0 10px 0;">Fréquence des mots (Top 10)</h2>
            <div style="background-color: #f9fafb; padding: 15px; border-radius: 5px; margin-bottom: 20px;">
                <table style="width: 100%; border-collapse: collapse;">
                    <thead>
                        <tr>
                            <th style="text-align: left; padding: 8px; border-bottom: 1px solid #e5e7eb;">Mot</th>
                            <th style="text-align: right; padding: 8px; border-bottom: 1px solid #e5e7eb;">Fréquence</th>
                            <th style="text-align: right; padding: 8px; border-bottom: 1px solid #e5e7eb;">%</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${this.generateWordFrequencyRows(analysis.wordFrequency, analysis.wordCount)}
                    </tbody>
                </table>
            </div>
        `;
        element.appendChild(wordFrequency);
        
        // Ajouter le pied de page
        const footer = document.createElement('div');
        footer.innerHTML = `
            <p style="text-align: center; color: #4b5563; font-size: 12px; margin-top: 30px;">Analyseur de texte français - Rapport généré par l'application Analyseur de Texte Pro</p>
        `;
        element.appendChild(footer);
        
        // Options pour la génération du PDF
        const options = {
            margin: [10, 10, 10, 10],
            filename: `analyse_texte_${new Date().toISOString().slice(0, 10)}.pdf`,
            image: { type: 'jpeg', quality: 0.98 },
            html2canvas: { scale: 2, useCORS: true },
            jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
        };
        
        // Générer le PDF
        html2pdf().from(element).set(options).save()
            .then(() => {
                utils.notifications.success("Rapport PDF généré avec succès !");
            })
            .catch(error => {
                console.error("Erreur lors de la génération du PDF:", error);
                utils.notifications.error("Erreur lors de la génération du PDF.");
            });
    },
    
    // Générer les lignes du tableau de fréquence des mots
    generateWordFrequencyRows: function(wordFrequency, totalWords) {
        // Trier et prendre les 10 mots les plus fréquents
        const sortedWords = Object.entries(wordFrequency)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 10)
            .filter(([word]) => word.length > 1);
        
        // Générer les lignes du tableau
        return sortedWords.map(([word, count]) => {
            const percentage = ((count / totalWords) * 100).toFixed(1);
            return `
                <tr>
                    <td style="padding: 8px; border-bottom: 1px solid #e5e7eb;">${word}</td>
                    <td style="text-align: right; padding: 8px; border-bottom: 1px solid #e5e7eb;">${count}</td>
                    <td style="text-align: right; padding: 8px; border-bottom: 1px solid #e5e7eb;">${percentage}%</td>
                </tr>
            `;
        }).join('');
    }
};

/**
 * Fonctionnalités de visualisation et graphiques
 */

const charts = {
    // Stocker les instances de graphiques pour les références futures
    instances: {},
    
    // Créer un graphique pour les statistiques de texte
    createTextStatsChart: function(analysis) {
        const ctx = document.getElementById('textStatsChart').getContext('2d');
        
        // Détruire le graphique existant s'il y en a un
        if (this.instances.textStats) {
            this.instances.textStats.destroy();
        }
        
        // Configurer les données des statistiques
        const data = {
            labels: ['Mots', 'Phrases', 'Paragraphes', 'Articles', 'Verbes', 'Adjectifs', 'Pronoms'],
            datasets: [{
                label: 'Statistiques du texte',
                data: [
                    analysis.wordCount,
                    analysis.sentenceCount,
                    analysis.paragraphCount,
                    analysis.articleCount,
                    analysis.verbCount,
                    analysis.adjectiveCount,
                    analysis.pronounCount
                ],
                backgroundColor: [
                    'rgba(93, 92, 222, 0.7)',  // Couleur principale
                    'rgba(93, 92, 222, 0.6)',
                    'rgba(93, 92, 222, 0.5)',
                    'rgba(93, 92, 222, 0.4)',
                    'rgba(93, 92, 222, 0.5)',
                    'rgba(93, 92, 222, 0.6)',
                    'rgba(93, 92, 222, 0.7)'
                ],
                borderColor: 'rgba(93, 92, 222, 1)',
                borderWidth: 1
            }]
        };
        
        // Vérifier si le mode sombre est activé
        const isDarkMode = document.documentElement.classList.contains('dark');
        
        // Configurer les options du graphique
        const options = {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false
                },
                tooltip: {
                    backgroundColor: isDarkMode ? '#374151' : '#ffffff',
                    titleColor: isDarkMode ? '#f9fafb' : '#1f2937',
                    bodyColor: isDarkMode ? '#f9fafb' : '#1f2937',
                    borderColor: isDarkMode ? '#4b5563' : '#e5e7eb',
                    borderWidth: 1,
                    padding: 10,
                    displayColors: false
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    grid: {
                        color: isDarkMode ? 'rgba(75, 85, 99, 0.2)' : 'rgba(229, 231, 235, 0.5)',
                    },
                    ticks: {
                        color: isDarkMode ? '#9ca3af' : '#4b5563',
                    }
                },
                x: {
                    grid: {
                        display: false
                    },
                    ticks: {
                        color: isDarkMode ? '#9ca3af' : '#4b5563',
                    }
                }
            }
        };
        
        // Créer le graphique
        this.instances.textStats = new Chart(ctx, {
            type: 'bar',
            data: data,
            options: options
        });
        
        return this.instances.textStats;
    },
    
    // Créer un graphique pour la fréquence des mots
    createWordFrequencyChart: function(wordFrequency) {
        const ctx = document.getElementById('wordFrequencyChart').getContext('2d');
        
        // Détruire le graphique existant s'il y en a un
        if (this.instances.wordFrequency) {
            this.instances.wordFrequency.destroy();
        }
        
        // Trier et prendre les 10 mots les plus fréquents
        const sortedWords = Object.entries(wordFrequency)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 10);
        
        // Configurer les données
        const labels = sortedWords.map(item => item[0]);
        const values = sortedWords.map(item => item[1]);
        
        // Générer une palette de couleurs
        const colors = this.generateColorGradient('#5D5CDE', sortedWords.length);
        
        // Vérifier si le mode sombre est activé
        const isDarkMode = document.documentElement.classList.contains('dark');
        
        // Créer le graphique
        this.instances.wordFrequency = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: labels,
                datasets: [{
                    data: values,
                    backgroundColor: colors,
                    borderColor: isDarkMode ? '#1f2937' : '#ffffff',
                    borderWidth: 2
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'right',
                        labels: {
                            color: isDarkMode ? '#f9fafb' : '#1f2937',
                            padding: 10,
                            font: {
                                size: 11
                            }
                        }
                    },
                    tooltip: {
                        backgroundColor: isDarkMode ? '#374151' : '#ffffff',
                        titleColor: isDarkMode ? '#f9fafb' : '#1f2937',
                        bodyColor: isDarkMode ? '#f9fafb' : '#1f2937',
                        borderColor: isDarkMode ? '#4b5563' : '#e5e7eb',
                        borderWidth: 1,
                        padding: 10
                    }
                }
            }
        });
        
        return this.instances.wordFrequency;
    },
    
    // Créer un graphique de lisibilité
    createReadabilityChart: function(readabilityScore) {
        const ctx = document.getElementById('readabilityChart').getContext('2d');
        
        // Détruire le graphique existant s'il y en a un
        if (this.instances.readability) {
            this.instances.readability.destroy();
        }
        
        // Vérifier si le mode sombre est activé
        const isDarkMode = document.documentElement.classList.contains('dark');
        
        // Créer le graphique de type jauge
        this.instances.readability = new Chart(ctx, {
            type: 'doughnut',
            data: {
                datasets: [{
                    data: [readabilityScore, 100 - readabilityScore],
                    backgroundColor: [
                        this.getReadabilityColor(readabilityScore),
                        isDarkMode ? '#374151' : '#e5e7eb'
                    ],
                    borderWidth: 0,
                    circumference: 180,
                    rotation: -90
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: false
                    },
                    tooltip: {
                        enabled: false
                    }
                },
                cutout: '75%'
            }
        });
        
        return this.instances.readability;
    },
    
    // Générer un dégradé de couleurs
    generateColorGradient: function(baseColor, steps) {
        // Convertir la couleur de base en objet RGB
        const r = parseInt(baseColor.substring(1, 3), 16);
        const g = parseInt(baseColor.substring(3, 5), 16);
        const b = parseInt(baseColor.substring(5, 7), 16);
        
        const colors = [];
        
        // Générer des variations
        for (let i = 0; i < steps; i++) {
            // Calculer le facteur d'assombrissement/éclaircissement
            const factor = 0.7 + (0.6 * (i / steps));
            
            // Appliquer le facteur
            const adjustedR = Math.min(255, Math.round(r * factor));
            const adjustedG = Math.min(255, Math.round(g * factor));
            const adjustedB = Math.min(255, Math.round(b * factor));
            
            // Convertir en couleur hexadécimale
            const color = `rgba(${adjustedR}, ${adjustedG}, ${adjustedB}, 0.8)`;
            colors.push(color);
        }
        
        return colors;
    },
    
    // Obtenir une couleur en fonction du score de lisibilité
    getReadabilityColor: function(score) {
        if (score >= 80) return '#10B981'; // Vert - Très facile à lire
        if (score >= 60) return '#34D399'; // Vert clair - Facile à lire
        if (score >= 50) return '#FBBF24'; // Jaune - Moyen
        if (score >= 30) return '#F97316'; // Orange - Difficile
        return '#EF4444'; // Rouge - Très difficile
    },
    
    // Mettre à jour les graphiques lors du changement de thème
    updateChartsTheme: function() {
        // Mettre à jour les graphiques si des instances existent
        if (this.instances.textStats) {
            const isDarkMode = document.documentElement.classList.contains('dark');
            
            // Mettre à jour les options de thème
            this.instances.textStats.options.scales.y.grid.color = isDarkMode ? 'rgba(75, 85, 99, 0.2)' : 'rgba(229, 231, 235, 0.5)';
            this.instances.textStats.options.scales.y.ticks.color = isDarkMode ? '#9ca3af' : '#4b5563';
            this.instances.textStats.options.scales.x.ticks.color = isDarkMode ? '#9ca3af' : '#4b5563';
            
            // Mettre à jour les options de tooltip
            this.instances.textStats.options.plugins.tooltip.backgroundColor = isDarkMode ? '#374151' : '#ffffff';
            this.instances.textStats.options.plugins.tooltip.titleColor = isDarkMode ? '#f9fafb' : '#1f2937';
            this.instances.textStats.options.plugins.tooltip.bodyColor = isDarkMode ? '#f9fafb' : '#1f2937';
            this.instances.textStats.options.plugins.tooltip.borderColor = isDarkMode ? '#4b5563' : '#e5e7eb';
            
            // Mettre à jour le graphique
            this.instances.textStats.update();
        }
        
        // Faire de même pour les autres graphiques...
    }
};

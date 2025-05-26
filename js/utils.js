/**
 * Utilitaires pour l'application Analyseur de Texte
 */

// Méthodes pour la gestion du cache local
const localCache = {
    set: function(key, value, expiration = null) {
        try {
            const item = {
                value: value,
                expiration: expiration ? new Date().getTime() + expiration : null
            };
            localStorage.setItem(key, JSON.stringify(item));
            return true;
        } catch (error) {
            console.error('Erreur lors de l\'enregistrement dans le cache local:', error);
            return false;
        }
    },
    
    get: function(key) {
        try {
            const item = JSON.parse(localStorage.getItem(key));
            
            if (!item) {
                return null;
            }
            
            // Vérifier si l'élément a expiré
            if (item.expiration && new Date().getTime() > item.expiration) {
                localStorage.removeItem(key);
                return null;
            }
            
            return item.value;
        } catch (error) {
            console.error('Erreur lors de la récupération depuis le cache local:', error);
            return null;
        }
    },
    
    remove: function(key) {
        try {
            localStorage.removeItem(key);
            return true;
        } catch (error) {
            console.error('Erreur lors de la suppression depuis le cache local:', error);
            return false;
        }
    },
    
    clear: function() {
        try {
            localStorage.clear();
            return true;
        } catch (error) {
            console.error('Erreur lors du vidage du cache local:', error);
            return false;
        }
    }
};

// Gestion des notifications
const notifications = {
    show: function(message, type = 'info', title = null, duration = 3000) {
        // Supprimer les notifications existantes
        document.querySelectorAll('.notification').forEach(notif => notif.remove());
        
        // Créer la notification
        const notification = document.createElement('div');
        notification.className = `notification notification--${type}`;
        
        // Définir l'icône en fonction du type
        let icon = '';
        switch (type) {
            case 'success':
                icon = 'check-circle';
                title = title || 'Succès';
                break;
            case 'error':
                icon = 'exclamation-circle';
                title = title || 'Erreur';
                break;
            case 'warning':
                icon = 'exclamation-triangle';
                title = title || 'Attention';
                break;
            case 'info':
            default:
                icon = 'info-circle';
                title = title || 'Information';
                break;
        }
        
        notification.innerHTML = `
            <div class="notification__icon">
                <i class="fas fa-${icon}"></i>
            </div>
            <div class="notification__content">
                <div class="notification__title">${title}</div>
                <div class="notification__message">${message}</div>
            </div>
            <button class="notification__close">
                <i class="fas fa-times"></i>
            </button>
        `;
        
        // Ajouter au DOM
        document.body.appendChild(notification);
        
        // Gérer la fermeture
        notification.querySelector('.notification__close').addEventListener('click', () => {
            notification.remove();
        });
        
        // Supprimer après le délai spécifié
        if (duration > 0) {
            setTimeout(() => {
                if (notification && notification.parentNode) {
                    notification.remove();
                }
            }, duration);
        }
        
        return notification;
    },
    
    success: function(message, title = null, duration = 3000) {
        return this.show(message, 'success', title, duration);
    },
    
    error: function(message, title = null, duration = 3000) {
        return this.show(message, 'error', title, duration);
    },
    
    warning: function(message, title = null, duration = 3000) {
        return this.show(message, 'warning', title, duration);
    },
    
    info: function(message, title = null, duration = 3000) {
        return this.show(message, 'info', title, duration);
    }
};

// Validation des données
const validation = {
    isValidEmail: function(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    },
    
    isValidPassword: function(password, minLength = 6, maxLength = 12) {
        const passwordNoSpaces = password.replace(/\s/g, '');
        return passwordNoSpaces.length >= minLength && passwordNoSpaces.length <= maxLength;
    },
    
    isNotEmpty: function(value) {
        return value !== null && value !== undefined && value.toString().trim() !== '';
    }
};

// Formater une date
function formatDate(date, includeTime = true) {
    if (!(date instanceof Date)) {
        date = new Date(date);
    }
    
    const options = {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
    };
    
    if (includeTime) {
        options.hour = '2-digit';
        options.minute = '2-digit';
    }
    
    return date.toLocaleDateString('fr-FR', options);
}

// Simuler l'envoi d'un email
function simulateEmailSending(to, subject, content) {
    console.log(`Simulation d'envoi d'email à: ${to}`);
    console.log(`Sujet: ${subject}`);
    console.log(`Contenu: ${content}`);
    return true;
}

// Créer un ID unique
function generateUniqueId() {
    return 'id_' + Math.random().toString(36).substr(2, 9);
}

// Calculer le temps de lecture d'un texte (en minutes)
function calculateReadingTime(text, wordsPerMinute = 200) {
    const words = text.split(/\s+/).filter(word => word.length > 0);
    const minutes = words.length / wordsPerMinute;
    
    if (minutes < 1) {
        return '< 1 min';
    }
    
    return Math.ceil(minutes) + ' min';
}

// Copier du texte dans le presse-papier
async function copyToClipboard(text) {
    try {
        await navigator.clipboard.writeText(text);
        return true;
    } catch (err) {
        console.error('Erreur lors de la copie dans le presse-papier:', err);
        return false;
    }
}

// Générer une URL de partage
function generateShareUrl(analysisId) {
    const baseUrl = window.location.origin + window.location.pathname;
    return `${baseUrl}?share=${analysisId}`;
}

// Charger un fichier JSON
async function loadJsonFile(url) {
    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        return await response.json();
    } catch (error) {
        console.error(`Erreur lors du chargement de ${url}:`, error);
        return null;
    }
}

// Exporter un module pour l'inclusion par d'autres scripts
const utils = {
    localCache,
    notifications,
    validation,
    formatDate,
    simulateEmailSending,
    generateUniqueId,
    calculateReadingTime,
    copyToClipboard,
    generateShareUrl,
    loadJsonFile
};

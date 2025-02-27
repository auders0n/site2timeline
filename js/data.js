class DataManager {
    static STORAGE_KEYS = {
        KIDS: 'kids',
        ACHIEVEMENTS: 'achievements',
        LANGUAGE: 'language'
    };

    static LANGUAGES = {
        EN: 'en',
        FR: 'fr'
    };

    static TRANSLATIONS = {
        en: {
            months: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
            dateFormat: 'en-US',
            ui: {
                settings: 'Settings',
                achievements: 'Achievements',
                timeline: 'Timeline',
                name: 'Name',
                birthDate: 'Birth Date',
                save: 'Save',
                cancel: 'Cancel',
                edit: 'Edit',
                delete: 'Delete',
                actions: 'Actions',
                age: 'Age',
                years: 'years',
                noKids: 'No kids added yet. Use the form above to add a kid.',
                confirmDelete: 'Are you sure you want to delete this kid? This will also delete all their achievements.',
                dataManagement: 'Data Management',
                exportData: 'Export Data',
                importData: 'Import Data'
            }
        },
        fr: {
            months: ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin', 'Juil', 'Aoû', 'Sep', 'Oct', 'Nov', 'Déc'],
            dateFormat: 'fr-FR',
            ui: {
                settings: 'Paramètres',
                achievements: 'Réalisations',
                timeline: 'Chronologie',
                name: 'Nom',
                birthDate: 'Date de naissance',
                save: 'Enregistrer',
                cancel: 'Annuler',
                edit: 'Modifier',
                delete: 'Supprimer',
                actions: 'Actions',
                age: 'Âge',
                years: 'ans',
                noKids: "Aucun enfant ajouté. Utilisez le formulaire ci-dessus pour ajouter un enfant.",
                confirmDelete: 'Êtes-vous sûr de vouloir supprimer cet enfant ? Cela supprimera également toutes ses réalisations.',
                dataManagement: 'Gestion des données',
                exportData: 'Exporter',
                importData: 'Importer'
            }
        }
    };

    static getLanguage() {
        return localStorage.getItem(this.STORAGE_KEYS.LANGUAGE) || this.LANGUAGES.EN;
    }

    static setLanguage(lang) {
        if (this.TRANSLATIONS[lang]) {
            localStorage.setItem(this.STORAGE_KEYS.LANGUAGE, lang);
            return true;
        }
        return false;
    }

    static getText(key) {
        const lang = this.getLanguage();
        const keys = key.split('.');
        let text = this.TRANSLATIONS[lang];
        for (const k of keys) {
            text = text?.[k];
        }
        return text || key;
    }

    static validateKid(kid) {
        if (!kid.name || kid.name.trim() === '') {
            throw new Error('Kid name is required');
        }
        if (!kid.birthDate || isNaN(new Date(kid.birthDate).getTime())) {
            throw new Error('Valid birth date is required');
        }
    }

    static addKid(kid) {
        this.validateKid(kid);
        const kids = this.getKids();
        const newKid = {
            ...kid,
            id: crypto.randomUUID()
        };
        kids.push(newKid);
        localStorage.setItem(this.STORAGE_KEYS.KIDS, JSON.stringify(kids));
        return newKid.id;
    }

    static getKids() {
        const kidsJson = localStorage.getItem(this.STORAGE_KEYS.KIDS);
        return kidsJson ? JSON.parse(kidsJson) : [];
    }

    static getKid(id) {
        return this.getKids().find(kid => kid.id === id);
    }

    static updateKid(id, updatedKid) {
        this.validateKid(updatedKid);
        const kids = this.getKids();
        const index = kids.findIndex(kid => kid.id === id);
        if (index === -1) return false;
        
        kids[index] = { ...kids[index], ...updatedKid };
        localStorage.setItem(this.STORAGE_KEYS.KIDS, JSON.stringify(kids));
        return true;
    }

    static deleteKid(id) {
        const kids = this.getKids();
        const filteredKids = kids.filter(kid => kid.id !== id);
        if (filteredKids.length === kids.length) return false;
        
        localStorage.setItem(this.STORAGE_KEYS.KIDS, JSON.stringify(filteredKids));
        return true;
    }

    static validateAchievement(achievement) {
        if (!achievement.kidId || !this.getKid(achievement.kidId)) {
            throw new Error('Valid kid ID is required');
        }
        if (!achievement.date || isNaN(new Date(achievement.date).getTime())) {
            throw new Error('Valid date is required');
        }
        if (!achievement.description || achievement.description.trim() === '') {
            throw new Error('Description is required');
        }
        if (!achievement.icon || achievement.icon.trim() === '') {
            throw new Error('Icon is required');
        }
    }

    static addAchievement(achievement) {
        this.validateAchievement(achievement);
        const achievements = this.getAchievements();
        const newAchievement = {
            ...achievement,
            id: crypto.randomUUID()
        };
        achievements.push(newAchievement);
        localStorage.setItem(this.STORAGE_KEYS.ACHIEVEMENTS, JSON.stringify(achievements));
        return newAchievement.id;
    }

    static getAchievements() {
        const achievementsJson = localStorage.getItem(this.STORAGE_KEYS.ACHIEVEMENTS);
        return achievementsJson ? JSON.parse(achievementsJson) : [];
    }

    static getKidAchievements(kidId) {
        return this.getAchievements().filter(achievement => achievement.kidId === kidId);
    }

    static deleteAchievement(id) {
        const achievements = this.getAchievements();
        const filteredAchievements = achievements.filter(achievement => achievement.id !== id);
        if (filteredAchievements.length === achievements.length) return false;
        
        localStorage.setItem(this.STORAGE_KEYS.ACHIEVEMENTS, JSON.stringify(filteredAchievements));
        return true;
    }

    static getAchievement(id) {
        return this.getAchievements().find(achievement => achievement.id === id);
    }

    static updateAchievement(id, updatedAchievement) {
        this.validateAchievement(updatedAchievement);
        const achievements = this.getAchievements();
        const index = achievements.findIndex(achievement => achievement.id === id);
        if (index === -1) return false;
        
        achievements[index] = { ...achievements[index], ...updatedAchievement };
        localStorage.setItem(this.STORAGE_KEYS.ACHIEVEMENTS, JSON.stringify(achievements));
        return true;
    }

    static exportData() {
        const data = {
            kids: this.getKids(),
            achievements: this.getAchievements(),
            version: "1.0"
        };
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        
        const a = document.createElement('a');
        a.href = url;
        a.download = 'timeline_data.json';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }

    static importData(jsonData) {
        try {
            const data = JSON.parse(jsonData);
            
            // Basic validation
            if (!data.kids || !Array.isArray(data.kids) || 
                !data.achievements || !Array.isArray(data.achievements)) {
                throw new Error('Invalid data format');
            }

            // Clear existing data
            localStorage.removeItem(this.STORAGE_KEYS.KIDS);
            localStorage.removeItem(this.STORAGE_KEYS.ACHIEVEMENTS);

            // Validate each kid first
            data.kids.forEach(kid => this.validateKid(kid));

            // Save kids data
            localStorage.setItem(this.STORAGE_KEYS.KIDS, JSON.stringify(data.kids));

            // Validate each achievement
            data.achievements.forEach(achievement => {
                // Ensure the kidId exists in the kids array
                if (!data.kids.find(kid => kid.id === achievement.kidId)) {
                    throw new Error('Valid kid ID is required');
                }
                this.validateAchievement(achievement);
            });

            // Save achievements data
            localStorage.setItem(this.STORAGE_KEYS.ACHIEVEMENTS, JSON.stringify(data.achievements));
            
            return true;
        } catch (error) {
            console.error('Import failed:', error);
            throw error;
        }
    }
} 

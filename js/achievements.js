class Achievements {
    constructor() {
        this.form = document.getElementById('achievement-form');
        this.achievementsList = document.getElementById('achievements-list');
        this.cancelButton = document.getElementById('cancelAchievement');
        this.kidSelect = document.getElementById('kidSelect');

        this.setupEventListeners();
        this.populateKidSelect();
        this.renderAchievementsList();
    }

    setupEventListeners() {
        this.form.addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleFormSubmit();
        });

        this.cancelButton.addEventListener('click', () => {
            this.clearForm();
        });

        // Update max date when kid is selected
        this.kidSelect.addEventListener('change', () => {
            const kid = DataManager.getKid(this.kidSelect.value);
            if (kid) {
                const dateInput = document.getElementById('achievementDate');
                dateInput.max = new Date().toISOString().split('T')[0];
                dateInput.min = kid.birthDate;
            }
        });
    }

    populateKidSelect() {
        const kids = DataManager.getKids();
        this.kidSelect.innerHTML = '<option value="">Select a kid</option>';
        
        kids.forEach(kid => {
            const option = document.createElement('option');
            option.value = kid.id;
            option.textContent = kid.name;
            this.kidSelect.appendChild(option);
        });
    }

    handleFormSubmit() {
        const achievementId = document.getElementById('achievementId').value;
        const achievementData = {
            kidId: document.getElementById('kidSelect').value,
            date: document.getElementById('achievementDate').value,
            description: document.getElementById('description').value,
            icon: document.getElementById('iconSelect').value,
            dateFormat: document.querySelector('input[name="dateFormat"]:checked').value,
            textPosition: document.getElementById('textPosition').value
        };

        if (achievementId) {
            DataManager.updateAchievement(achievementId, achievementData);
        } else {
            DataManager.addAchievement(achievementData);
        }

        this.clearForm();
        this.renderAchievementsList();
    }

    clearForm() {
        document.getElementById('achievementId').value = '';
        document.getElementById('kidSelect').value = '';
        document.getElementById('achievementDate').value = '';
        document.getElementById('description').value = '';
        document.getElementById('iconSelect').value = 'star';
        document.getElementById('textPosition').value = 'right';
        document.getElementById('showFullDate').checked = true;
        this.form.querySelector('button[type="submit"]').textContent = 'Save Achievement';
    }

    editAchievement(achievementId) {
        const achievement = DataManager.getAchievement(achievementId);
        if (!achievement) return;

        document.getElementById('achievementId').value = achievementId;
        document.getElementById('kidSelect').value = achievement.kidId;
        document.getElementById('achievementDate').value = achievement.date;
        document.getElementById('description').value = achievement.description;
        document.getElementById('iconSelect').value = achievement.icon;
        
        // Set date format radio
        const formatRadio = document.getElementById(achievement.dateFormat === 'month' ? 'showMonthOnly' : 'showFullDate');
        if (formatRadio) formatRadio.checked = true;
        
        // Set text position (default to 'right' if not set)
        document.getElementById('textPosition').value = achievement.textPosition || 'right';
        
        this.form.querySelector('button[type="submit"]').textContent = 'Update Achievement';

        // Update date constraints
        const kid = DataManager.getKid(achievement.kidId);
        if (kid) {
            const dateInput = document.getElementById('achievementDate');
            dateInput.max = new Date().toISOString().split('T')[0];
            dateInput.min = kid.birthDate;
        }
    }

    deleteAchievement(achievementId) {
        if (confirm('Are you sure you want to delete this achievement?')) {
            DataManager.deleteAchievement(achievementId);
            this.renderAchievementsList();
        }
    }

    formatDate(dateString, format = 'full') {
        const date = new Date(dateString);
        if (format === 'month') {
            return date.toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long'
            });
        }
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    }

    renderAchievementsList() {
        const kids = DataManager.getKids();
        this.achievementsList.innerHTML = '';

        if (kids.length === 0) {
            this.achievementsList.innerHTML = '<p class="no-achievements">No kids added yet. Add kids in the Settings page first.</p>';
            return;
        }

        kids.forEach(kid => {
            const achievements = DataManager.getKidAchievements(kid.id);
            if (achievements.length === 0) return;

            const kidSection = document.createElement('div');
            kidSection.className = 'kid-achievements';
            
            kidSection.innerHTML = `
                <h3>${kid.name}'s Achievements</h3>
                <div class="achievements-grid"></div>
            `;

            const grid = kidSection.querySelector('.achievements-grid');
            achievements
                .sort((a, b) => new Date(b.date) - new Date(a.date))
                .forEach(achievement => {
                    const card = document.createElement('div');
                    card.className = 'achievement-card';
                    card.innerHTML = `
                        <div class="achievement-icon">
                            <i class="icon-${achievement.icon}"></i>
                        </div>
                        <div class="achievement-details">
                            <div class="achievement-date">${this.formatDate(achievement.date, achievement.dateFormat)}</div>
                            <div class="achievement-description">${achievement.description}</div>
                            <div class="achievement-actions">
                                <button class="edit" data-edit="${achievement.id}">Edit</button>
                                <button class="delete" data-delete="${achievement.id}">Delete</button>
                            </div>
                        </div>
                    `;

                    // Add event listeners to buttons
                    card.querySelector('[data-edit]').addEventListener('click', () => this.editAchievement(achievement.id));
                    card.querySelector('[data-delete]').addEventListener('click', () => this.deleteAchievement(achievement.id));

                    grid.appendChild(card);
                });

            this.achievementsList.appendChild(kidSection);
        });

        if (this.achievementsList.children.length === 0) {
            this.achievementsList.innerHTML = '<p class="no-achievements">No achievements added yet. Use the form above to add achievements.</p>';
        }
    }
} 

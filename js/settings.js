class Settings {
    constructor() {
        this.form = document.getElementById('kid-form');
        this.kidsList = document.getElementById('kids-list');
        this.cancelButton = document.getElementById('cancelEdit');

        // Data management
        this.exportButton = document.getElementById('exportData');
        this.importButton = document.getElementById('importData');
        this.importFile = document.getElementById('importFile');
        
        this.languageSelect = document.getElementById('languageSelect');
        this.themeSelect = document.getElementById('themeSelect');
        
        this.setupEventListeners();
        this.renderKidsList();
        this.setupDataManagement();
        this.setupLanguageSettings();
        this.setupThemeSettings();
    }

    setupEventListeners() {
        this.form.addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleFormSubmit();
        });

        this.cancelButton.addEventListener('click', () => {
            this.clearForm();
        });
    }

    handleFormSubmit() {
        const kidId = document.getElementById('kidId').value;
        const kidData = {
            name: document.getElementById('kidName').value,
            birthDate: document.getElementById('birthDate').value
        };

        if (kidId) {
            DataManager.updateKid(kidId, kidData);
        } else {
            DataManager.addKid(kidData);
        }

        this.clearForm();
        this.renderKidsList();
    }

    clearForm() {
        document.getElementById('kidId').value = '';
        document.getElementById('kidName').value = '';
        document.getElementById('birthDate').value = '';
        this.form.querySelector('button[type="submit"]').textContent = 'Save';
    }

    editKid(kidId) {
        const kid = DataManager.getKid(kidId);
        if (!kid) return;

        document.getElementById('kidId').value = kidId;
        document.getElementById('kidName').value = kid.name;
        document.getElementById('birthDate').value = kid.birthDate;
        this.form.querySelector('button[type="submit"]').textContent = 'Update';
    }

    deleteKid(kidId) {
        if (confirm('Are you sure you want to delete this kid? This will also delete all their achievements.')) {
            DataManager.deleteKid(kidId);
            this.renderKidsList();
        }
    }

    formatDate(dateString) {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    }

    renderKidsList() {
        const kids = DataManager.getKids();
        this.kidsList.innerHTML = '';

        if (kids.length === 0) {
            this.kidsList.innerHTML = '<p class="no-kids">No kids added yet. Use the form above to add a kid.</p>';
            return;
        }

        const table = document.createElement('table');
        table.className = 'kids-table';
        
        // Table header
        table.innerHTML = `
            <thead>
                <tr>
                    <th>Name</th>
                    <th>Birth Date</th>
                    <th>Age</th>
                    <th>Actions</th>
                </tr>
            </thead>
            <tbody></tbody>
        `;

        const tbody = table.querySelector('tbody');
        kids.forEach(kid => {
            const tr = document.createElement('tr');
            const age = new Timeline().calculateAge(kid.birthDate, new Date().toISOString().split('T')[0]);
            
            tr.innerHTML = `
                <td>${kid.name}</td>
                <td>${this.formatDate(kid.birthDate)}</td>
                <td>${age} years</td>
                <td class="actions">
                    <button class="edit" data-edit="${kid.id}">Edit</button>
                    <button class="delete" data-delete="${kid.id}">Delete</button>
                </td>
            `;

            // Add event listeners to buttons
            tr.querySelector('[data-edit]').addEventListener('click', () => this.editKid(kid.id));
            tr.querySelector('[data-delete]').addEventListener('click', () => this.deleteKid(kid.id));

            tbody.appendChild(tr);
        });

        this.kidsList.appendChild(table);
    }

    setupDataManagement() {
        this.exportButton.addEventListener('click', () => {
            DataManager.exportData();
        });

        this.importButton.addEventListener('click', () => {
            this.importFile.click();
        });

        this.importFile.addEventListener('change', (event) => {
            const file = event.target.files[0];
            if (!file) return;

            const reader = new FileReader();
            reader.onload = (e) => {
                try {
                    DataManager.importData(e.target.result);
                    alert('Data imported successfully!');
                    location.reload(); // Refresh to show imported data
                } catch (error) {
                    alert('Import failed: ' + error.message);
                }
            };
            reader.readAsText(file);
        });
    }

    setupLanguageSettings() {
        // Set initial value
        this.languageSelect.value = DataManager.getLanguage();

        // Handle language changes
        this.languageSelect.addEventListener('change', () => {
            const newLang = this.languageSelect.value;
            if (DataManager.setLanguage(newLang)) {
                location.reload(); // Refresh to apply new language
            }
        });
    }

    setupThemeSettings() {
        // Set initial value
        const currentTheme = localStorage.getItem('theme') || 'light';
        this.themeSelect.value = currentTheme;
        document.body.classList.add(`theme-${currentTheme}`);

        // Handle theme changes
        this.themeSelect.addEventListener('change', () => {
            const newTheme = this.themeSelect.value;
            document.body.classList.remove(`theme-${currentTheme}`);
            document.body.classList.add(`theme-${newTheme}`);
            localStorage.setItem('theme', newTheme);
        });
    }
} 

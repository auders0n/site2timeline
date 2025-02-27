class Timeline {
    constructor() {
        this.yearSelect = document.getElementById('yearSelect');
        this.container = document.getElementById('timeline-container');
        this.selectedYearDisplay = document.querySelector('.selected-year');
        this.monthNames = DataManager.TRANSLATIONS[DataManager.getLanguage()].months;
        
        this.initializeYearSelect();
        this.setupEventListeners();
    }

    setupEventListeners() {
        this.yearSelect.addEventListener('change', () => {
            const selectedYear = parseInt(this.yearSelect.value);
            this.updateYearDisplay(selectedYear);
            this.render(selectedYear);
        });
    }

    updateYearDisplay(year) {
        this.selectedYearDisplay.textContent = year;
    }

    initializeYearSelect() {
        // Find the earliest birth year among all kids
        const kids = DataManager.getKids();
        if (kids.length === 0) return;

        const earliestYear = Math.min(...kids.map(kid => new Date(kid.birthDate).getFullYear()));
        const currentYear = new Date().getFullYear();

        // Clear existing options
        this.yearSelect.innerHTML = '';

        // Populate year options
        for (let year = earliestYear; year <= currentYear; year++) {
            const option = document.createElement('option');
            option.value = year;
            option.textContent = year;
            this.yearSelect.appendChild(option);
        }

        // Set default to current year
        this.yearSelect.value = currentYear;
        this.updateYearDisplay(currentYear);
        
        // Initial render
        this.render(currentYear);
    }

    calculateAge(birthDate, currentDate) {
        const birth = new Date(birthDate);
        const current = new Date(currentDate);
        let age = current.getFullYear() - birth.getFullYear();
        
        // Adjust age if birthday hasn't occurred this year
        if (current.getMonth() < birth.getMonth() || 
            (current.getMonth() === birth.getMonth() && current.getDate() < birth.getDate())) {
            age--;
        }
        return Math.max(0, age);
    }

    formatDate(date, format = 'full') {
        if (format === 'month') {
            return date.toLocaleDateString(DataManager.TRANSLATIONS[DataManager.getLanguage()].dateFormat, {
                month: 'short'
            });
        }
        return date.toLocaleDateString(DataManager.TRANSLATIONS[DataManager.getLanguage()].dateFormat, {
            month: 'short',
            day: 'numeric'
        });
    }

    adjustAgeTextPosition(phaseElement, achievements) {
        const ageText = phaseElement.querySelector('.phase-age');
        if (!ageText) return;

        const phaseRect = phaseElement.getBoundingClientRect();
        const centerX = phaseRect.width / 2;
        const possiblePositions = [-30, -15, 0, 15, 30]; // pixels from center
        
        // Check each position until we find one that doesn't overlap
        for (const offsetX of possiblePositions) {
            let hasOverlap = false;
            const proposedX = centerX + offsetX;
            
            // Check if this position overlaps with any achievement
            for (const achievement of achievements) {
                const marker = phaseElement.querySelector(`.achievement-container[data-id="${achievement.id}"]`);
                if (!marker) continue;
                
                const markerRect = marker.getBoundingClientRect();
                const markerX = markerRect.left - phaseRect.left;
                
                // Check if the age text would overlap with this marker
                if (Math.abs(proposedX - markerX) < 20) { // 20px buffer
                    hasOverlap = true;
                    break;
                }
            }
            
            if (!hasOverlap) {
                ageText.style.left = `${proposedX}px`;
                ageText.style.transform = 'translateY(-50%)';
                return;
            }
        }
        
        // If all horizontal positions overlap, move it above the phase
        ageText.style.left = '50%';
        ageText.style.top = '-20px';
        ageText.style.transform = 'translateX(-50%)';
    }

    renderPhase(phase, achievements) {
        // ... existing code ...
        
        // After creating the phase element and adding achievements
        this.adjustAgeTextPosition(phaseElement, achievements);
        
        return phaseElement;
    }

    render(year) {
        this.container.innerHTML = '';
        
        // Create timeline header with months
        const header = document.createElement('div');
        header.className = 'timeline-header';
        this.monthNames.forEach(month => {
            const monthDiv = document.createElement('div');
            monthDiv.className = 'timeline-month';
            monthDiv.textContent = month;
            header.appendChild(monthDiv);
        });
        this.container.appendChild(header);

        // Render each kid's timeline
        const kids = DataManager.getKids();
        kids.forEach(kid => {
            const birthDate = new Date(kid.birthDate);
            const birthYear = birthDate.getFullYear();
            
            // Only show kid if we're in or after their birth year
            if (birthYear <= year) {
                const kidRow = document.createElement('div');
                kidRow.className = 'timeline-kid';
                
                // Add kid's name
                const nameDiv = document.createElement('div');
                nameDiv.className = 'kid-name';
                nameDiv.textContent = kid.name;
                kidRow.appendChild(nameDiv);

                // Create timeline row
                const timelineRow = document.createElement('div');
                timelineRow.className = 'timeline-row';
                
                const birthdayMonth = birthDate.getMonth();
                const birthdayDay = birthDate.getDate();
                const birthdayPosition = ((birthdayMonth + (birthdayDay / 31)) / 12) * 100;

                // Calculate age at the start of the year
                const startYearAge = year - birthYear - 1;

                // For birth year, only show phase 2 starting from birth month
                if (year === birthYear) {
                    const phase2 = document.createElement('div');
                    phase2.className = 'timeline-phase phase-2';
                    phase2.style.left = `${birthdayPosition}%`;
                    phase2.style.right = '0';
                    phase2.textContent = '0';
                    timelineRow.appendChild(phase2);
                } else {
                    // For subsequent years, show both phases
                    const phase1 = document.createElement('div');
                    phase1.className = 'timeline-phase phase-1';
                    phase1.style.right = `${100 - birthdayPosition}%`;
                    phase1.textContent = Math.max(0, startYearAge);
                    timelineRow.appendChild(phase1);

                    const phase2 = document.createElement('div');
                    phase2.className = 'timeline-phase phase-2';
                    phase2.style.left = `${birthdayPosition}%`;
                    phase2.style.right = '0';
                    phase2.textContent = Math.max(0, startYearAge + 1);
                    timelineRow.appendChild(phase2);
                }

                // Add achievement markers
                const achievements = DataManager.getKidAchievements(kid.id);
                achievements
                    .filter(achievement => new Date(achievement.date).getFullYear() === year)
                    .sort((a, b) => new Date(a.date) - new Date(b.date))
                    .forEach((achievement, index) => {
                        const achievementDate = new Date(achievement.date);
                        const achievementMonth = achievementDate.getMonth();
                        const achievementDay = achievementDate.getDate();
                        const position = ((achievementMonth + (achievementDay / 31)) / 12) * 100;

                        const container = document.createElement('div');
                        container.className = 'achievement-container';
                        container.style.left = `${position}%`;
                        container.dataset.id = achievement.id;

                        // Create marker with icon
                        const marker = document.createElement('div');
                        marker.className = 'achievement-marker';
                        marker.innerHTML = `<i class="icon-${achievement.icon}"></i>`;
                        container.appendChild(marker);

                        // Create text element
                        const text = document.createElement('div');
                        text.className = `achievement-text ${index % 2 === 0 ? 'top' : 'bottom'}`;
                        text.dataset.format = achievement.dateFormat || 'full';
                        text.innerHTML = `
                            <div class="achievement-date">${this.formatDate(achievementDate, achievement.dateFormat)}</div>
                            <div class="achievement-description">${achievement.description}</div>
                        `;
                        container.appendChild(text);

                        timelineRow.appendChild(container);
                    });

                kidRow.appendChild(timelineRow);
                this.container.appendChild(kidRow);
            }
        });
    }
} 

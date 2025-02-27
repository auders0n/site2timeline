class App {
    constructor() {
        this.timeline = new Timeline();
        this.settings = new Settings();
        this.achievements = new Achievements();
        this.printButton = document.getElementById('printTimeline');
        this.setupNavigation();
        this.initializeView();
    }

    setupNavigation() {
        const views = ['timeline', 'settings', 'achievements'];
        views.forEach(view => {
            const button = document.getElementById(`${view}Btn`);
            button.addEventListener('click', () => this.showView(view));
        });
    }

    showView(viewName) {
        // Hide all views
        document.querySelectorAll('.view').forEach(view => {
            view.classList.remove('active');
        });
        
        // Deactivate all nav buttons
        document.querySelectorAll('nav button').forEach(button => {
            button.classList.remove('active');
        });
        
        // Show selected view and activate its button
        document.getElementById(`${viewName}-view`).classList.add('active');
        document.getElementById(`${viewName}Btn`).classList.add('active');

        // Show print button only on timeline view
        this.printButton.style.display = viewName === 'timeline' ? 'inline-block' : 'none';

        // Special handling for timeline view
        if (viewName === 'timeline') {
            this.timeline.render(parseInt(document.getElementById('yearSelect').value));
        }
        // Special handling for settings view
        else if (viewName === 'settings') {
            this.settings.renderKidsList();
        }
        // Special handling for achievements view
        else if (viewName === 'achievements') {
            this.achievements.populateKidSelect();
            this.achievements.renderAchievementsList();
        }
    }

    initializeView() {
        // Initialize with timeline view
        this.timeline.render(new Date().getFullYear());
    }
}

// Initialize the application when the DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    const currentTheme = localStorage.getItem('theme') || 'light';
    document.body.classList.add(`theme-${currentTheme}`);
    new App();
});

document.getElementById('printTimeline').addEventListener('click', () => {
    window.print();
}); 

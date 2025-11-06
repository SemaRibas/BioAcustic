/**
 * Navbar Component - Sistema de navegação responsivo
 * Compartilhado entre todas as páginas
 */

export class Navbar {
    constructor() {
        this.currentPage = this.getCurrentPage();
        this.mobileMenuOpen = false;
    }

    getCurrentPage() {
        const path = window.location.pathname;
        if (path.includes('analyze.html')) return 'analyze';
        if (path.includes('train.html')) return 'train';
        if (path.includes('settings.html')) return 'settings';
        if (path.includes('species.html')) return 'species';
        return 'home';
    }

    render() {
        return `
            <nav class="bg-gradient-to-r from-emerald-600 to-teal-600 shadow-lg sticky top-0 z-50">
                <div class="container mx-auto px-4">
                    <div class="flex items-center justify-between h-16">
                        <!-- Logo -->
                        <a href="index.html" class="flex items-center space-x-3 group">
                            <div class="w-10 h-10 bg-white rounded-lg flex items-center justify-center transform group-hover:scale-110 transition-transform">
                                <svg class="w-6 h-6 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3"></path>
                                </svg>
                            </div>
                            <span class="text-xl font-bold text-white hidden sm:block">BioAcustic</span>
                        </a>

                        <!-- Desktop Menu -->
                        <div class="hidden md:flex items-center space-x-1">
                            ${this.renderNavLink('home', 'index.html', 'Início', `
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"></path>
                            `)}
                            ${this.renderNavLink('analyze', 'analyze.html', 'Análise', `
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3"></path>
                            `)}
                            ${this.renderNavLink('train', 'train.html', 'Treinamento', `
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4"></path>
                            `)}
                            ${this.renderNavLink('species', 'species.html', 'Espécies', `
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"></path>
                            `)}
                            ${this.renderNavLink('settings', 'settings.html', 'Configurações', `
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"></path>
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
                            `)}
                        </div>

                        <!-- Mobile Menu Button -->
                        <button id="mobileMenuBtn" class="md:hidden text-white p-2 rounded-lg hover:bg-white/10 transition-colors">
                            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"></path>
                            </svg>
                        </button>
                    </div>

                    <!-- Mobile Menu -->
                    <div id="mobileMenu" class="hidden md:hidden pb-4">
                        <div class="flex flex-col space-y-2">
                            ${this.renderMobileNavLink('home', 'index.html', 'Início', `
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"></path>
                            `)}
                            ${this.renderMobileNavLink('analyze', 'analyze.html', 'Análise', `
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3"></path>
                            `)}
                            ${this.renderMobileNavLink('train', 'train.html', 'Treinamento', `
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4"></path>
                            `)}
                            ${this.renderMobileNavLink('species', 'species.html', 'Espécies', `
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"></path>
                            `)}
                            ${this.renderMobileNavLink('settings', 'settings.html', 'Configurações', `
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"></path>
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
                            `)}
                        </div>
                    </div>
                </div>
            </nav>
        `;
    }

    renderNavLink(page, href, label, iconPath) {
        const isActive = this.currentPage === page;
        const activeClasses = isActive 
            ? 'bg-white/20 text-white' 
            : 'text-white/90 hover:bg-white/10 hover:text-white';
        
        return `
            <a href="${href}" class="flex items-center space-x-2 px-4 py-2 rounded-lg transition-all ${activeClasses}">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    ${iconPath}
                </svg>
                <span class="font-medium">${label}</span>
            </a>
        `;
    }

    renderMobileNavLink(page, href, label, iconPath) {
        const isActive = this.currentPage === page;
        const activeClasses = isActive 
            ? 'bg-white/20 text-white' 
            : 'text-white/90 hover:bg-white/10 hover:text-white';
        
        return `
            <a href="${href}" class="flex items-center space-x-3 px-4 py-3 rounded-lg transition-all ${activeClasses}">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    ${iconPath}
                </svg>
                <span class="font-medium">${label}</span>
            </a>
        `;
    }

    mount(targetId = 'navbar-container') {
        const container = document.getElementById(targetId);
        if (container) {
            container.innerHTML = this.render();
            this.setupEventListeners();
        }
    }

    setupEventListeners() {
        const mobileMenuBtn = document.getElementById('mobileMenuBtn');
        const mobileMenu = document.getElementById('mobileMenu');

        if (mobileMenuBtn && mobileMenu) {
            mobileMenuBtn.addEventListener('click', () => {
                this.mobileMenuOpen = !this.mobileMenuOpen;
                if (this.mobileMenuOpen) {
                    mobileMenu.classList.remove('hidden');
                } else {
                    mobileMenu.classList.add('hidden');
                }
            });
        }
    }
}

// Auto-inicializar quando o DOM estiver pronto
if (typeof document !== 'undefined') {
    document.addEventListener('DOMContentLoaded', () => {
        const navbar = new Navbar();
        navbar.mount();
    });
}

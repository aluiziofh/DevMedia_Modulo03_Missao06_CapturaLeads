class LeadCapture {
    constructor() {
        this.form = document.getElementById('leadForm');
        this.submitBtn = document.getElementById('submitBtn');
        this.btnLoader = document.getElementById('btnLoader');
        this.successMessage = document.getElementById('successMessage');
        this.newLeadBtn = document.getElementById('newLeadBtn');
        
        this.supabaseConfig = {
            endpoint: 'https://cgkuwisoksjjcomxgffh.supabase.co/rest/v1/leads',
            apiKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNna3V3aXNva3NqamNvbXhnZmZoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTY1OTk3MzEsImV4cCI6MjA3MjE3NTczMX0.Jltc9IpSFA3NHd61VR_y8VyGlCBtc_si0nxLT6jdlmg'
        };
        
        this.init();
    }
    
    init() {
        this.setupEventListeners();
        this.setupInputMasks();
        this.setupValidation();
    }
    
    setupEventListeners() {
        this.form.addEventListener('submit', this.handleSubmit.bind(this));
        this.newLeadBtn.addEventListener('click', this.resetForm.bind(this));
    }
    
    setupInputMasks() {
        const dddInput = document.getElementById('ddd');
        const telefoneInput = document.getElementById('telefone');
        
        // Máscara para DDD (apenas números, máximo 2 dígitos)
        dddInput.addEventListener('input', (e) => {
            e.target.value = e.target.value.replace(/\D/g, '').slice(0, 2);
        });
        
        // Máscara para telefone (apenas números, máximo 9 dígitos)
        telefoneInput.addEventListener('input', (e) => {
            e.target.value = e.target.value.replace(/\D/g, '').slice(0, 9);
        });
        
        // Foco automático no telefone quando DDD estiver completo
        dddInput.addEventListener('input', (e) => {
            if (e.target.value.length === 2) {
                telefoneInput.focus();
            }
        });
    }
    
    setupValidation() {
        const inputs = this.form.querySelectorAll('.form-input');
        
        inputs.forEach(input => {
            input.addEventListener('blur', () => this.validateField(input));
            input.addEventListener('input', () => this.clearError(input));
        });
    }
    
    validateField(input) {
        const value = input.value.trim();
        let isValid = true;
        let errorMessage = '';
        
        switch (input.id) {
            case 'nome':
                if (!value) {
                    errorMessage = 'Nome é obrigatório';
                    isValid = false;
                } else if (value.length < 2) {
                    errorMessage = 'Nome deve ter pelo menos 2 caracteres';
                    isValid = false;
                } else if (!/^[a-zA-ZÀ-ÿ\s]+$/.test(value)) {
                    errorMessage = 'Nome deve conter apenas letras';
                    isValid = false;
                }
                break;
                
            case 'ddd':
                if (!value) {
                    errorMessage = 'DDD é obrigatório';
                    isValid = false;
                } else if (value.length !== 2) {
                    errorMessage = 'DDD deve ter 2 dígitos';
                    isValid = false;
                } else if (!this.isValidDDD(value)) {
                    errorMessage = 'DDD inválido';
                    isValid = false;
                }
                break;
                
            case 'telefone':
                if (!value) {
                    errorMessage = 'Telefone é obrigatório';
                    isValid = false;
                } else if (value.length !== 9) {
                    errorMessage = 'Telefone deve ter 9 dígitos';
                    isValid = false;
                } else if (!value.startsWith('9')) {
                    errorMessage = 'Telefone deve começar com 9';
                    isValid = false;
                }
                break;
        }
        
        this.showFieldError(input, errorMessage, isValid);
        return isValid;
    }
    
    isValidDDD(ddd) {
        const validDDDs = [
            '11', '12', '13', '14', '15', '16', '17', '18', '19', // SP
            '21', '22', '24', // RJ
            '27', '28', // ES
            '31', '32', '33', '34', '35', '37', '38', // MG
            '41', '42', '43', '44', '45', '46', // PR
            '47', '48', '49', // SC
            '51', '53', '54', '55', // RS
            '61', // DF
            '62', '64', // GO
            '63', // TO
            '65', '66', // MT
            '67', // MS
            '68', // AC
            '69', // RO
            '71', '73', '74', '75', '77', // BA
            '79', // SE
            '81', '87', // PE
            '82', // AL
            '83', // PB
            '84', // RN
            '85', '88', // CE
            '86', '89', // PI
            '91', '93', '94', // PA
            '92', '97', // AM
            '95', // RR
            '96', // AP
            '98', '99' // MA
        ];
        return validDDDs.includes(ddd);
    }
    
    showFieldError(input, message, isValid) {
        const errorElement = document.getElementById(`${input.id}-error`);
        
        if (isValid) {
            input.classList.remove('error');
            input.classList.add('valid');
            errorElement.textContent = '';
            errorElement.classList.remove('show');
        } else {
            input.classList.remove('valid');
            input.classList.add('error');
            errorElement.textContent = message;
            errorElement.classList.add('show');
        }
    }
    
    clearError(input) {
        const errorElement = document.getElementById(`${input.id}-error`);
        input.classList.remove('error');
        errorElement.classList.remove('show');
        
        // Validação em tempo real para feedback positivo
        setTimeout(() => {
            if (input.value.trim()) {
                this.validateField(input);
            }
        }, 500);
    }
    
    validateForm() {
        const nome = document.getElementById('nome');
        const ddd = document.getElementById('ddd');
        const telefone = document.getElementById('telefone');
        
        const nomeValid = this.validateField(nome);
        const dddValid = this.validateField(ddd);
        const telefoneValid = this.validateField(telefone);
        
        return nomeValid && dddValid && telefoneValid;
    }
    
    async handleSubmit(e) {
        e.preventDefault();
        
        if (!this.validateForm()) {
            this.shakeForm();
            return;
        }
        
        const formData = this.getFormData();
        
        try {
            this.setLoadingState(true);
            await this.submitToSupabase(formData);
            this.showSuccess();
        } catch (error) {
            this.handleError(error);
        } finally {
            this.setLoadingState(false);
        }
    }
    
    getFormData() {
        const nome = document.getElementById('nome').value.trim();
        const ddd = document.getElementById('ddd').value.trim();
        const telefone = document.getElementById('telefone').value.trim();
        
        return {
            nome,
            telefone: `${ddd}${telefone}`
        };
    }
    
    async submitToSupabase(data) {
        const response = await fetch(this.supabaseConfig.endpoint, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'apikey': this.supabaseConfig.apiKey,
                'Authorization': `Bearer ${this.supabaseConfig.apiKey}`,
                'Prefer': 'return=minimal'
            },
            body: JSON.stringify(data)
        });
        
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || `Erro HTTP: ${response.status}`);
        }
        
        return response;
    }
    
    setLoadingState(loading) {
        if (loading) {
            this.submitBtn.disabled = true;
            this.submitBtn.classList.add('loading');
        } else {
            this.submitBtn.disabled = false;
            this.submitBtn.classList.remove('loading');
        }
    }
    
    showSuccess() {
        this.successMessage.classList.add('show');
    }
    
    resetForm() {
        this.form.reset();
        this.successMessage.classList.remove('show');
        
        // Limpar estados de validação
        const inputs = this.form.querySelectorAll('.form-input');
        const errors = this.form.querySelectorAll('.error-message');
        
        inputs.forEach(input => {
            input.classList.remove('error', 'valid');
        });
        
        errors.forEach(error => {
            error.classList.remove('show');
            error.textContent = '';
        });
        
        // Focar no primeiro campo
        document.getElementById('nome').focus();
    }
    
    shakeForm() {
        this.form.style.animation = 'shake 0.5s ease-in-out';
        setTimeout(() => {
            this.form.style.animation = '';
        }, 500);
    }
    
    handleError(error) {
        console.error('Erro ao enviar lead:', error);
        
        // Mostrar erro visual no botão
        this.submitBtn.style.background = 'var(--error-red)';
        this.submitBtn.querySelector('.btn-text').textContent = 'Erro ao enviar';
        
        setTimeout(() => {
            this.submitBtn.style.background = 'var(--primary-blue)';
            this.submitBtn.querySelector('.btn-text').textContent = 'Cadastrar';
        }, 3000);
        
        this.shakeForm();
    }
}

// Adicionar animação de shake para erro
const style = document.createElement('style');
style.textContent = `
    @keyframes shake {
        0%, 100% { transform: translateX(0); }
        10%, 30%, 50%, 70%, 90% { transform: translateX(-4px); }
        20%, 40%, 60%, 80% { transform: translateX(4px); }
    }
`;
document.head.appendChild(style);

// Inicializar aplicação quando DOM estiver carregado
document.addEventListener('DOMContentLoaded', () => {
    new LeadCapture();
});

// Adicionar efeitos de partículas sutis no background (opcional)
class ParticleEffect {
    constructor() {
        this.canvas = document.createElement('canvas');
        this.ctx = this.canvas.getContext('2d');
        this.particles = [];
        this.animationId = null;
        
        this.setupCanvas();
        this.createParticles();
        this.animate();
    }
    
    setupCanvas() {
        this.canvas.style.position = 'fixed';
        this.canvas.style.top = '0';
        this.canvas.style.left = '0';
        this.canvas.style.width = '100%';
        this.canvas.style.height = '100%';
        this.canvas.style.pointerEvents = 'none';
        this.canvas.style.zIndex = '-1';
        this.canvas.style.opacity = '0.1';
        
        document.body.appendChild(this.canvas);
        
        this.resize();
        window.addEventListener('resize', this.resize.bind(this));
    }
    
    resize() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
    }
    
    createParticles() {
        const particleCount = Math.floor((window.innerWidth * window.innerHeight) / 15000);
        
        for (let i = 0; i < particleCount; i++) {
            this.particles.push({
                x: Math.random() * this.canvas.width,
                y: Math.random() * this.canvas.height,
                size: Math.random() * 2 + 1,
                speedX: (Math.random() - 0.5) * 0.5,
                speedY: (Math.random() - 0.5) * 0.5,
                opacity: Math.random() * 0.5 + 0.2
            });
        }
    }
    
    animate() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        this.particles.forEach(particle => {
            particle.x += particle.speedX;
            particle.y += particle.speedY;
            
            // Wrap around edges
            if (particle.x > this.canvas.width) particle.x = 0;
            if (particle.x < 0) particle.x = this.canvas.width;
            if (particle.y > this.canvas.height) particle.y = 0;
            if (particle.y < 0) particle.y = this.canvas.height;
            
            // Draw particle
            this.ctx.beginPath();
            this.ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
            this.ctx.fillStyle = `rgba(255, 255, 255, ${particle.opacity})`;
            this.ctx.fill();
        });
        
        this.animationId = requestAnimationFrame(this.animate.bind(this));
    }
    
    destroy() {
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
        }
        if (this.canvas.parentNode) {
            this.canvas.parentNode.removeChild(this.canvas);
        }
    }
}

// Inicializar efeito de partículas (apenas em telas maiores para performance)
if (window.innerWidth > 768) {
    new ParticleEffect();
}
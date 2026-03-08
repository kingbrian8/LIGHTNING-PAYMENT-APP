// Global State
const exchangeRateRate = 0.015; // 1 Satoshi = 0.015 ZAR
const ZAR_PER_SAT = 0.015;
const SAT_PER_ZAR = 1 / ZAR_PER_SAT;

const state = {
    user: null, // { name: string, role: 'admin' | 'cashier' }
    balanceZAR: 2781750.00, // equivalent to 1,450,000 Sats
    dailyRevenueZAR: 3750.00, // equivalent to 250,000 Sats
    transactions: [],
    currentInvoice: null, // { amountZar: number, amountSats: number, id: string, status: 'pending' | 'paid' | 'converting' }
};

// Router
const navigate = (viewName) => {
    const app = document.getElementById('app');
    app.innerHTML = ''; // Clear current view

    switch (viewName) {
        case 'login': renderLogin(app); break;
        case 'dashboard': renderDashboard(app); break;
        case 'keypad': renderKeypad(app); break;
        case 'invoice': renderInvoice(app); break;
        case 'converting': renderConverting(app); break;
        case 'success': renderSuccess(app); break;
        case 'withdraw': renderWithdraw(app); break;
        case 'withdraw_success': renderWithdrawSuccess(app); break;
        case 'history': renderHistory(app); break;
        case 'settings': renderSettings(app); break;
        case 'static_qr': renderStaticQR(app); break;
        case 'refund': renderRefund(app); break;
        default: renderLogin(app);
    }
};
window.navigate = navigate;

// Format utilities
const formatZAR = (num) => 'R ' + num.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const formatSats = (num) => Math.round(num).toLocaleString() + ' SATS';

// View renderers
const renderLogin = (container) => {
    container.innerHTML = `
        <div class="page" style="justify-content: center;">
            <div style="text-align: center; margin-bottom: 40px;">
                <i class="ph-fill ph-lightning" style="font-size: 64px; color: var(--brand-yellow); text-shadow: 0 0 20px var(--brand-yellow-glow);"></i>
                <h1 style="margin-top: 16px; font-size: 2rem;">Lightning POS</h1>
                <p>Accept Bitcoin. Get paid in Rand.</p>
            </div>
            
            <div class="input-group">
                <label>Business Name</label>
                <input type="text" id="bizName" placeholder="e.g. Mzansi Cafe" value="Mzansi Cafe">
            </div>

            <div class="input-group" style="margin-bottom: 32px;">
                <label>Select Role</label>
                <div style="display:flex; gap: 12px;">
                    <button class="btn btn-secondary role-btn active-role" id="role-admin" style="flex:1; border-color: var(--brand-yellow); background: rgba(245, 158, 11, 0.1);" onclick="selectRole('admin')">
                        <i class="ph-fill ph-crown" style="color: var(--brand-yellow);"></i> Admin
                    </button>
                    <button class="btn btn-secondary role-btn" id="role-cashier" style="flex:1;" onclick="selectRole('cashier')">
                        <i class="ph-fill ph-user"></i> Cashier
                    </button>
                </div>
            </div>
            
            <button class="btn btn-primary" onclick="handleLogin()">
                Get Started <i class="ph ph-arrow-right"></i>
            </button>
        </div>
    `;
};

let selectedRole = 'admin';
window.selectRole = (role) => {
    selectedRole = role;
    document.querySelectorAll('.role-btn').forEach(btn => {
        btn.style.borderColor = 'var(--border-subtle)';
        btn.style.background = 'var(--bg-surface)';
        btn.classList.remove('active-role');
    });
    const activeBtn = document.getElementById('role-' + role);
    activeBtn.style.borderColor = 'var(--brand-yellow)';
    activeBtn.style.background = 'rgba(245, 158, 11, 0.1)';
    activeBtn.classList.add('active-role');
};

window.handleLogin = () => {
    const name = document.getElementById('bizName').value || 'My Business';
    state.user = { name, role: selectedRole };
    // Initialize with mock data
    state.balanceZAR = 2560750.00;
    state.dailyRevenueZAR = 4750.00;
    state.transactions = [
        { id: 'tx-1', amountZAR: 75.00, time: '2 hours ago', type: 'received' },
        { id: 'tx-2', amountZAR: 45.00, time: '5 hours ago', type: 'received' },
        { id: 'tx-3', amountZAR: 250.00, time: 'Yesterday', type: 'received' }
    ];
    navigate('dashboard');
};

const renderDashboard = (container) => {
    const isAdmin = state.user.role === 'admin';

    container.innerHTML = `
        <div class="page">
            <div class="app-header">
                <div class="title" style="display:flex; align-items:center; gap:8px;">
                     <i class="ph-fill ph-lightning" style="color:var(--brand-yellow);"></i> 
                     ${state.user.name} <span style="font-size: 0.8rem; background: rgba(255,255,255,0.1); padding: 2px 8px; border-radius: 12px; color: var(--text-muted); font-weight: 400;">${isAdmin ? 'Admin' : 'Cashier'}</span>
                </div>
                ${isAdmin ? `<button class="icon-btn" onclick="navigate('settings')"><i class="ph ph-gear"></i></button>` : `<button class="icon-btn" onclick="handleLogout()"><i class="ph ph-sign-out"></i></button>`}
            </div>
            
            ${isAdmin ? `
            <div class="glass-card" style="margin-bottom: 24px; text-align: center; display:flex; flex-direction:column; justify-content:center; align-items:center;">
                <p style="margin-bottom: 8px;">Total Balance</p>
                <h1 style="font-size: 2.8rem; margin-bottom: 8px; color: #fff; text-shadow: 0 0 20px rgba(255,255,255,0.2);">
                    ${formatZAR(state.balanceZAR)}
                </h1>
                <p style="color: var(--success); display:flex; align-items:center; gap:4px; font-weight:500;">
                    <i class="ph ph-trend-up"></i> +${formatZAR(state.dailyRevenueZAR)} today
                </p>
            </div>
            
            <div style="display:grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 24px;">
                <button class="btn btn-primary" style="flex-direction:column; padding: 20px 10px; font-size: 1rem; gap: 12px; height: 110px;" onclick="navigate('keypad')">
                    <i class="ph ph-qr-code" style="font-size: 2rem;"></i> 
                    <span>Receive</span>
                </button>
                <button class="btn btn-secondary" style="background: rgba(16, 185, 129, 0.1); border-color: rgba(16,185,129,0.3); color: var(--success); flex-direction:column; padding: 20px 10px; font-size: 1rem; gap: 12px; height: 110px;" onclick="navigate('withdraw')">
                    <i class="ph ph-bank" style="font-size: 2rem;"></i> 
                    <span>Withdraw</span>
                </button>
            </div>
            ` : `
            <div style="flex:1; display:flex; flex-direction:column; justify-content:center; align-items:center; margin-bottom: 32px;">
                <div style="width: 120px; height: 120px; border-radius: 50%; background: rgba(245, 158, 11, 0.1); display:flex; justify-content:center; align-items:center; margin-bottom: 24px;">
                    <i class="ph-fill ph-storefront" style="font-size: 64px; color: var(--brand-yellow);"></i>
                </div>
                <h2 style="font-size: 1.8rem; margin-bottom: 8px;">Ready for Orders</h2>
                <p style="color: var(--text-muted); text-align:center;">Enter an amount to generate a Lightning Invoice.</p>
            </div>
            
            <button class="btn btn-primary" style="font-size: 1.2rem; padding: 24px; margin-bottom: 24px;" onclick="navigate('keypad')">
                <i class="ph ph-qr-code"></i> Receive Payment
            </button>
            <button class="btn btn-secondary" style="margin-bottom: 24px;" onclick="navigate('static_qr')">
                <i class="ph ph-wifi-slash"></i> Offline QR Code
            </button>
            `}
            
            <div style="flex:1;"></div>
            
            ${isAdmin ? `
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom: 16px;">
                <h3 style="font-size: 1.1rem; font-weight: 500;">Recent Transactions</h3>
                <button class="icon-btn" style="width:auto; padding:0 12px; height: 32px; font-size: 0.9rem;" onclick="navigate('history')">View All</button>
            </div>
            ` : `<h3 style="font-size: 1.1rem; font-weight: 500; margin-bottom: 16px;">Recent Session Activity</h3>`}
            
            <div style="display:flex; flex-direction:column; gap: 12px;">
                ${state.transactions.slice(0, isAdmin ? 2 : 1).map(tx => `
                    <div style="display:flex; justify-content:space-between; align-items:center; background: rgba(255,255,255,0.03); padding: 12px 16px; border-radius: var(--radius-md);">
                        <div style="display:flex; align-items:center; gap: 12px;">
                            <div style="width: 36px; height: 36px; border-radius: 50%; background: ${tx.type === 'received' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)'}; display:flex; justify-content:center; align-items:center; color: ${tx.type === 'received' ? 'var(--success)' : 'var(--danger)'};">
                                <i class="ph-fill ${tx.type === 'received' ? 'ph-arrow-down-left' : 'ph-arrow-up-right'}"></i>
                            </div>
                            <div>
                                <div style="font-weight: 500; font-size:0.95rem;">${tx.type === 'received' ? 'Payment' : 'Withdrawal'}</div>
                                <div style="font-size: 0.75rem; color: var(--text-muted);">${tx.time}</div>
                            </div>
                        </div>
                        <div style="text-align: right;">
                            <div style="font-weight: 600; color: ${tx.type === 'received' ? 'var(--success)' : 'var(--text-main)'};">${tx.type === 'received' ? '+' : '-'}${formatZAR(tx.amountZAR)}</div>
                        </div>
                    </div>
                `).join('')}
            </div>
        </div>
    `;
};

// Keypad Amount State
let keypadAmountStr = '0';
let selectedTipPercent = 0;
let orderReferenceStr = '';

const renderKeypad = (container) => {
    keypadAmountStr = '0';
    selectedTipPercent = 0;
    orderReferenceStr = '';

    window.handleKeyPress = (num) => {
        if (keypadAmountStr === '0') {
            if (num !== '0') keypadAmountStr = num;
        } else if (keypadAmountStr.length < 8) {
            keypadAmountStr += num;
        }
        updateKeypadDisplay();
    };

    window.handleKeyDelete = () => {
        if (keypadAmountStr.length > 1) {
            keypadAmountStr = keypadAmountStr.slice(0, -1);
        } else {
            keypadAmountStr = '0';
        }
        updateKeypadDisplay();
    };

    const updateKeypadDisplay = () => {
        const displayAmnt = parseInt(keypadAmountStr) || 0;
        document.getElementById('displayAmountZAR').innerText = displayAmnt.toLocaleString();

        let totalZAR = displayAmnt;
        if (selectedTipPercent > 0) {
            const tipVal = displayAmnt * (selectedTipPercent / 100);
            totalZAR += tipVal;
            document.getElementById('tipLabel').innerText = `+ R ${tipVal.toFixed(2)} Tip`;
            document.getElementById('tipLabel').style.display = 'block';
        } else {
            document.getElementById('tipLabel').style.display = 'none';
        }

        const satsEquiv = totalZAR * SAT_PER_ZAR;
        document.getElementById('displayAmountSats').innerText = '~' + Math.round(satsEquiv).toLocaleString() + ' SATS';
    };

    window.handleTipSelect = (pct) => {
        selectedTipPercent = pct;
        document.querySelectorAll('.tip-btn').forEach(btn => btn.classList.remove('active'));
        if (pct > 0) {
            document.getElementById('tip-' + pct).classList.add('active');
        }
        updateKeypadDisplay();
    };

    window.updateReference = (val) => {
        orderReferenceStr = val;
    };

    window.handleGenerateInvoice = () => {
        const baseAmountZAR = parseInt(keypadAmountStr);
        if (baseAmountZAR > 0) {
            const tipZAR = baseAmountZAR * (selectedTipPercent / 100);
            const totalZAR = baseAmountZAR + tipZAR;
            const amountSats = Math.round(totalZAR * SAT_PER_ZAR);

            state.currentInvoice = {
                id: 'inv-' + Math.random().toString(36).substr(2, 9),
                baseAmountZAR: baseAmountZAR,
                tipZAR: tipZAR,
                amountZAR: totalZAR,
                amountSats: amountSats,
                reference: orderReferenceStr || 'N/A',
                status: 'pending'
            };
            navigate('invoice');
        } else {
            alert('Please enter an amount greater than 0');
        }
    };

    container.innerHTML = `
        <div class="page keypad-page">
            <div class="app-header">
                <button class="icon-btn" onclick="navigate('dashboard')"><i class="ph ph-arrow-left"></i></button>
                <div class="title">Charge Amount</div>
                <div style="width: 40px;"></div>
            </div>
            
            <div style="flex:1; display:flex; flex-direction:column; justify-content:center; align-items:center; position:relative;">
                <p style="color: var(--text-muted); font-size: 1rem; margin-bottom: 8px;">Enter amount in Rand</p>
                <div style="display:flex; align-items:baseline; gap: 8px; margin-bottom: 8px;">
                    <span style="font-size: 2rem; color: var(--text-muted);">R</span>
                    <h1 id="displayAmountZAR" style="font-size: 4rem; color: var(--text-main); font-weight: 700; letter-spacing: -1px;">0</h1>
                </div>
                <div id="tipLabel" style="display:none; color: var(--success); font-weight: 600; font-size: 1.1rem; margin-bottom: 8px;">+ R 0.00 Tip</div>
                <div id="displayAmountSats" style="color: var(--brand-yellow); font-size: 1.1rem; font-weight: 500; background: rgba(245, 158, 11, 0.1); padding: 4px 12px; border-radius: 20px;">
                    ~0 SATS
                </div>
            </div>
            
            <div style="margin-bottom: 24px; text-align:center;">
                <div style="display:flex; justify-content:center; gap: 8px; margin-bottom: 16px;">
                    <button class="btn btn-secondary tip-btn" style="padding: 8px 16px; width:auto; font-size:0.9rem; border-radius:20px;" onclick="handleTipSelect(0)">No Tip</button>
                    <button class="btn btn-secondary tip-btn" id="tip-10" style="padding: 8px 16px; width:auto; font-size:0.9rem; border-radius:20px;" onclick="handleTipSelect(10)">10%</button>
                    <button class="btn btn-secondary tip-btn" id="tip-15" style="padding: 8px 16px; width:auto; font-size:0.9rem; border-radius:20px;" onclick="handleTipSelect(15)">15%</button>
                    <button class="btn btn-secondary tip-btn" id="tip-20" style="padding: 8px 16px; width:auto; font-size:0.9rem; border-radius:20px;" onclick="handleTipSelect(20)">20%</button>
                </div>
                
                <div class="input-group" style="margin-bottom: 0;">
                    <input type="text" placeholder="Order Reference / Note (Optional)" onInput="updateReference(this.value)" style="text-align:center; background: rgba(255,255,255,0.02); border-color: rgba(255,255,255,0.05);">
                </div>
            </div>
            
            <div class="keypad" style="display:grid; grid-template-columns: repeat(3, 1fr); gap: 12px; margin-bottom: 24px;">
                ${[1, 2, 3, 4, 5, 6, 7, 8, 9].map(n =>
        `<button class="key-btn" onclick="handleKeyPress('${n}')">${n}</button>`
    ).join('')}
                <button class="key-btn" style="background: transparent;"></button>
                <button class="key-btn" onclick="handleKeyPress('0')">0</button>
                <button class="key-btn" style="background: rgba(255,255,255,0.05); color: var(--text-muted);" onclick="handleKeyDelete()"><i class="ph ph-backspace"></i></button>
            </div>
            
            <button class="btn btn-primary" style="font-size: 1.2rem; padding: 20px;" onclick="handleGenerateInvoice()">
                Create QR Code <i class="ph ph-qr-code"></i>
            </button>
        </div>
    `;
};

// STEP 1 & 2: Present Invoice & Receive Lightning Payment
const renderInvoice = (container) => {
    if (!state.currentInvoice) return navigate('dashboard');

    // Simulate Step 2: Payment Received on the Lightning Network
    const timer = setTimeout(() => {
        state.currentInvoice.status = 'paid';
        navigate('converting'); // Go to Step 3
    }, 4500);

    window.cancelInvoice = () => {
        clearTimeout(timer);
        navigate('keypad');
    };

    container.innerHTML = `
        <div class="page" style="text-align: center;">
            <div class="app-header">
                <button class="icon-btn" onclick="cancelInvoice()"><i class="ph ph-x"></i></button>
                <div class="title">Step 1: Customer Pays</div>
                <div style="width: 40px;"></div>
            </div>
            
            <p style="color: var(--text-muted); margin-bottom: 24px;">Customer scans this QR with any Lightning wallet.</p>
            
            <div class="glass-card qr-card">
                <div class="scanline"></div>
                <div style="background: white; padding: 16px; border-radius: var(--radius-md); display: inline-block; margin-bottom: 24px;">
                    <img src="https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=lightning:LNURL1DP68GURN8GHJ7MRW9E6XJURN9UH8WETVDSKKKMN0WAHZUMF0W4EX7MFNWU6XZUNWDAJXKCT58Q6XJUR5D9HKUE" alt="Lightning Invoice" style="width: 220px; height: 220px; display: block;" />
                </div>
                
                <h2 style="font-size: 2rem; color: var(--brand-yellow); margin-bottom: 8px;">
                    ${state.currentInvoice.amountSats.toLocaleString()} SATS
                </h2>
                <div style="color: var(--text-muted); font-size: 1.1rem; margin-bottom: 16px;">
                    ${formatZAR(state.currentInvoice.amountZAR)}
                </div>
                
                <div style="display:flex; align-items:center; justify-content:center; gap: 8px; color: var(--text-muted); font-size: 0.95rem;">
                    <i class="ph ph-spinner spinner-anim"></i> Waiting for payment...
                </div>
            </div>
            
            <div style="margin-top: auto; padding: 16px; background: rgba(59, 130, 246, 0.1); border: 1px solid rgba(59, 130, 246, 0.3); border-radius: var(--radius-md); color: var(--text-main); font-size: 0.9rem; display:flex; gap: 12px; text-align: left;">
                <i class="ph-fill ph-info" style="color: var(--accent-blue); font-size: 1.5rem; flex-shrink:0;"></i>
                <div>
                    <strong>Demo Mode</strong>
                    <p style="color: var(--text-muted); margin-top:4px;">App will auto-progress in 4 seconds to simulate Step 2 (Lightning payment received).</p>
                </div>
            </div>
        </div>
    `;
};

// STEP 3: Instant Conversion
const renderConverting = (container) => {
    // Simulate Instant Conversion to ZAR
    setTimeout(() => {
        state.balanceZAR += state.currentInvoice.amountZAR;
        state.dailyRevenueZAR += state.currentInvoice.amountZAR;
        state.transactions.unshift({
            id: state.currentInvoice.id,
            amountZAR: state.currentInvoice.amountZAR,
            time: 'Just now',
            type: 'received'
        });
        navigate('success');
    }, 3000);

    container.innerHTML = `
        <div class="page converting-page" style="justify-content: center; align-items: center; text-align: center;">
            <div class="conversion-anim-container">
                <div class="coin bitcoin"><i class="ph-fill ph-currency-btc"></i></div>
                <div class="arrow-path">
                    <div class="particle"></div>
                    <div class="particle" style="animation-delay: 0.2s"></div>
                    <div class="particle" style="animation-delay: 0.4s"></div>
                </div>
                <div class="coin fiat">R</div>
            </div>
            
            <h2 style="font-size: 1.8rem; margin-bottom: 16px;">Step 3: Instant Conversion</h2>
            <p style="color: var(--text-muted); margin-bottom: 8px; font-size: 1.1rem;">
                Converting <span style="color: var(--brand-yellow); font-weight: 500;">${state.currentInvoice.amountSats.toLocaleString()} SATS</span>
            </p>
            <p style="color: var(--text-main); font-size: 1.5rem; font-weight: 600;">
                To ${formatZAR(state.currentInvoice.amountZAR)}
            </p>
            
            <div style="margin-top: 40px; color: var(--success); display:flex; align-items:center; gap:8px;">
                 <i class="ph-fill ph-check-circle"></i> Lightning Payment Received
            </div>
        </div>
    `;
};

// Step 4 Prep: Success Screen showing Rand balance addition
const renderSuccess = (container) => {
    container.innerHTML = `
        <div class="page" style="justify-content: center; align-items: center; text-align: center; background: radial-gradient(circle at center, rgba(16, 185, 129, 0.15) 0%, transparent 70%);">
            
            <div class="success-icon-wrapper">
                <i class="ph-fill ph-check-circle success-icon"></i>
            </div>
            
            <div style="background: rgba(16, 185, 129, 0.1); color: var(--success); padding: 4px 12px; border-radius: 20px; font-size: 0.9rem; font-weight: 600; margin-bottom: 24px;">
                CONVERSION COMPLETE
            </div>
            
            <h1 style="font-size: 3rem; margin-bottom: 8px;">+${formatZAR(state.currentInvoice ? state.currentInvoice.amountZAR : 0)}</h1>
            <p style="font-size: 1.1rem; color: var(--text-muted); margin-bottom: 48px;">
                Added to your merchant balance (Step 4)
            </p>
            
            <button class="btn btn-primary" style="width: 100%; font-size: 1.2rem; padding: 20px;" onclick="navigate('dashboard')">
                View Dashboard
            </button>
        </div>
    `;
};

// STEP 5: Withdrawal
const renderWithdraw = (container) => {
    window.handleWithdrawAction = () => {
        const amountZAR = state.balanceZAR;
        if (amountZAR <= 0) {
            alert('No funds to withdraw.'); return;
        }
        // Processing withdrawal
        state.balanceZAR = 0;
        state.transactions.unshift({
            id: 'wd-' + Math.random().toString(36).substr(2, 9),
            amountZAR: amountZAR,
            time: 'Just now',
            type: 'withdrawn'
        });
        navigate('withdraw_success');
    };

    container.innerHTML = `
        <div class="page">
            <div class="app-header">
                <button class="icon-btn" onclick="navigate('dashboard')"><i class="ph ph-arrow-left"></i></button>
                <div class="title">Step 5: Withdraw</div>
                <div style="width: 40px;"></div>
            </div>
            
            <div class="glass-card" style="margin-bottom: 32px; text-align:center;">
                <p style="color: var(--text-muted); margin-bottom: 8px;">Available to Withdraw</p>
                <h2 style="font-size: 2.5rem; color: #fff;">${formatZAR(state.balanceZAR)}</h2>
            </div>
            
            <div class="input-group">
                <label>Withdraw To</label>
                <div style="display:flex; align-items:center; gap: 16px; background: rgba(255,255,255,0.03); border: 1px solid var(--border-subtle); padding: 16px; border-radius: var(--radius-md);">
                    <div style="width: 48px; height: 48px; background: #009688; border-radius: 8px; display:flex; justify-content:center; align-items:center;">
                        <span style="color: white; font-weight: bold; font-size: 1.2rem;">FNB</span>
                    </div>
                    <div>
                        <div style="font-weight: 600;">First National Bank</div>
                        <div style="color: var(--text-muted); font-size: 0.9rem;">Account ending in •••• 4281</div>
                    </div>
                </div>
            </div>
            
            <div style="flex:1;"></div>
            
            <button class="btn btn-primary" style="background: linear-gradient(135deg, var(--success), #059669); box-shadow: 0 4px 15px rgba(16, 185, 129, 0.3); font-size: 1.2rem; padding: 20px;" onclick="handleWithdrawAction()" ${state.balanceZAR <= 0 ? 'disabled' : ''}>
                Withdraw ${formatZAR(state.balanceZAR)} <i class="ph ph-arrow-right"></i>
            </button>
        </div>
    `;
};

const renderWithdrawSuccess = (container) => {
    container.innerHTML = `
        <div class="page" style="justify-content: center; align-items: center; text-align: center; background: radial-gradient(circle at center, rgba(16, 185, 129, 0.15) 0%, transparent 70%);">
            
            <div class="success-icon-wrapper">
                <i class="ph-fill ph-bank success-icon"></i>
            </div>
            
            <h1 style="font-size: 2.5rem; margin-bottom: 16px;">Withdrawal Initiated!</h1>
            <p style="font-size: 1.1rem; color: var(--text-muted); margin-bottom: 48px; max-width: 280px; line-height: 1.5;">
                Your funds are on the way to your First National Bank account. It usually takes 1-2 business days.
            </p>
            
            <button class="btn btn-secondary" style="width: 100%; font-size: 1.2rem; padding: 20px;" onclick="navigate('dashboard')">
                Back to Dashboard
            </button>
        </div>
    `;
};


const renderHistory = (container) => {
    window.initiateRefund = (txId) => {
        state.refundTargetId = txId;
        navigate('refund');
    };

    container.innerHTML = `
        <div class="page">
            <div class="app-header">
                <button class="icon-btn" onclick="navigate('dashboard')"><i class="ph ph-arrow-left"></i></button>
                <div class="title">Transactions</div>
                <div style="width: 40px;"></div>
            </div>
            
            <div style="display:flex; flex-direction:column; gap: 12px; margin-top: 16px;">
                ${state.transactions.map(tx => `
                    <div style="display:flex; justify-content:space-between; align-items:center; background: rgba(255,255,255,0.03); padding: 16px; border-radius: var(--radius-md);">
                        <div style="display:flex; align-items:center; gap: 12px;">
                            <div style="width: 40px; height: 40px; border-radius: 50%; background: ${tx.type === 'received' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)'}; display:flex; justify-content:center; align-items:center; color: ${tx.type === 'received' ? 'var(--success)' : 'var(--danger)'};">
                                <i class="ph-fill ${tx.type === 'received' ? 'ph-arrow-down-left' : 'ph-arrow-up-right'}"></i>
                            </div>
                            <div>
                                <div style="font-weight: 500;">${tx.type === 'received' ? 'Payment Received' : tx.type === 'refunded' ? 'Refund Sent' : 'Withdrawal to Bank'}</div>
                                <div style="font-size: 0.8rem; color: var(--text-muted);">
                                    ${tx.time} 
                                    ${tx.reference && tx.reference !== 'N/A' ? ` • <span style="color: var(--brand-yellow);">${tx.reference}</span>` : ''}
                                </div>
                            </div>
                        </div>
                        <div style="text-align: right; display:flex; flex-direction:column; align-items:flex-end; gap:4px;">
                            <div style="font-weight: 600; color: ${tx.type === 'received' ? 'var(--success)' : 'var(--text-main)'};">
                                ${tx.type === 'received' ? '+' : '-'}${formatZAR(tx.amountZAR)}
                            </div>
                            ${tx.tipZAR ? `<div style="font-size: 0.75rem; color: var(--success); background: rgba(16, 185, 129, 0.1); padding: 2px 6px; border-radius: 8px;">Includes ${formatZAR(tx.tipZAR)} Tip</div>` : ''}
                            
                            ${state.user.role === 'admin' && tx.type === 'received' && !tx.refunded ? `<button class="btn btn-secondary" style="padding: 4px 8px; font-size: 0.75rem; border-color: var(--danger); color: var(--danger); margin-top:4px;" onclick="initiateRefund('${tx.id}')">Refund</button>` : ''}
                            ${tx.refunded ? `<span style="font-size: 0.75rem; color: var(--danger); margin-top:4px;">Refunded</span>` : ''}
                        </div>
                    </div>
                `).join('')}
                
                ${state.transactions.length === 0 ? '<p style="text-align:center; color: var(--text-muted); margin-top: 40px;">No transactions yet.</p>' : ''}
            </div>
        </div>
    `;
};

const renderRefund = (container) => {
    const tx = state.transactions.find(t => t.id === state.refundTargetId);
    if (!tx || tx.type !== 'received') return navigate('history');

    window.processRefund = () => {
        if (state.balanceZAR >= tx.amountZAR) {
            state.balanceZAR -= tx.amountZAR;
            tx.refunded = true;
            state.transactions.unshift({
                id: 'rf-' + Math.random().toString(36).substr(2, 9),
                amountZAR: tx.amountZAR,
                amountSats: tx.amountSats, // Will be undefined in old mock data, but acceptable
                time: 'Just now',
                type: 'refunded',
                reference: 'Refund for ' + (tx.reference || tx.time)
            });
            alert('Refund processed successfully.');
            navigate('history');
        } else {
            alert('Insufficient balance to refund this transaction.');
        }
    };

    container.innerHTML = `
        <div class="page" style="text-align: center;">
            <div class="app-header">
                <button class="icon-btn" onclick="navigate('history')"><i class="ph ph-arrow-left"></i></button>
                <div class="title">Issue Refund</div>
                <div style="width: 40px;"></div>
            </div>
            
            <i class="ph-fill ph-camera" style="font-size: 64px; margin-bottom: 24px; color: var(--text-muted);"></i>
            <h2 style="font-size: 1.5rem; margin-bottom: 8px;">Scan Customer Invoice</h2>
            <p style="color: var(--text-muted); margin-bottom: 32px;">Ask the customer to generate a receive invoice on their wallet for <strong>${formatZAR(tx.amountZAR)}</strong>.</p>
            
            <div class="glass-card" style="margin-bottom: auto; text-align: left;">
                <h4 style="color: var(--brand-yellow); margin-bottom: 8px;">Original Transaction</h4>
                <div style="display:flex; justify-content:space-between; margin-bottom: 4px;"><span>Amount:</span> <strong>${formatZAR(tx.amountZAR)}</strong></div>
                <div style="display:flex; justify-content:space-between; margin-bottom: 4px;"><span>Time:</span> <span>${tx.time}</span></div>
                ${tx.reference ? `<div style="display:flex; justify-content:space-between;"><span>Ref:</span> <span>${tx.reference}</span></div>` : ''}
            </div>
            
            <button class="btn btn-primary" style="background: linear-gradient(135deg, var(--danger), #b91c1c); box-shadow: 0 4px 15px rgba(239, 68, 68, 0.3); font-size: 1.2rem; padding: 20px; margin-top: 32px;" onclick="processRefund()">
                Simulate Scan & Refund <i class="ph ph-arrow-right"></i>
            </button>
        </div>
    `;
};

const renderStaticQR = (container) => {
    container.innerHTML = `
        <div class="page" style="text-align: center; justify-content:center; align-items:center;">
            <div class="app-header" style="width: 100%;">
                <button class="icon-btn" onclick="navigate('dashboard')"><i class="ph ph-x"></i></button>
                <div class="title">Offline Mode</div>
                <div style="width: 40px;"></div>
            </div>
            
            <div class="glass-card" style="margin-bottom: 24px; border: 1px solid var(--text-muted);">
                <div style="background: white; padding: 16px; border-radius: var(--radius-md); display: inline-block; margin-bottom: 16px;">
                    <img src="https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=lightning:LNURL1DP68GURN8GHJ7MRW9E6XJURN9UH8WETVDSKKKMN0WAHZUMF0W4EX7MFNWU6XZUNWDAJXKCT58Q6XJUR5D9HKUE" alt="Static LNURL" style="width: 250px; height: 250px; display: block;" />
                </div>
                <h2 style="font-size: 1.5rem; margin-bottom: 8px;">LNURL-Pay</h2>
                <p style="color: var(--text-muted); font-size: 0.9rem;">Scan to enter amount manually</p>
            </div>
            
            <p style="color: var(--text-muted);">Use this when point of sale is offline. You will receive a notification when the payment is completed.</p>
        </div>
    `;
};

window.handleLogout = () => {
    state.user = null;
    navigate('login');
};

const renderSettings = (container) => {
    container.innerHTML = `
        <div class="page">
            <div class="app-header">
                <button class="icon-btn" onclick="navigate('dashboard')"><i class="ph ph-arrow-left"></i></button>
                <div class="title">Settings</div>
                <div style="width: 40px;"></div>
            </div>
            
            <div style="margin-top: 16px;">
                <div class="glass-card" style="margin-bottom: 16px;">
                    <h3 style="margin-bottom: 16px; font-size: 1.1rem; color: #fff;"><i class="ph-fill ph-storefront" style="color:var(--brand-yellow); margin-right:8px;"></i> Business Profile</h3>
                    <div class="input-group">
                        <label>Business Name</label>
                        <input type="text" value="${state.user.name}" readonly style="opacity: 0.7;">
                    </div>
                </div>
                
                <div class="glass-card" style="margin-bottom: 32px;">
                    <h3 style="margin-bottom: 16px; font-size: 1.1rem; color: #fff;"><i class="ph-fill ph-bank" style="color:var(--success); margin-right:8px;"></i> Linked Bank Account</h3>
                    <div style="display:flex; justify-content:space-between; align-items:center; background: rgba(0,0,0,0.2); border: 1px solid var(--border-subtle); padding: 16px; border-radius: var(--radius-sm);">
                        <div style="display:flex; align-items:center; gap: 12px;">
                            <div style="width: 32px; height: 32px; background: #009688; border-radius: 4px; display:flex; justify-content:center; align-items:center;">
                                <span style="color: white; font-weight: bold; font-size: 0.8rem;">FNB</span>
                            </div>
                            <div>
                                <div style="font-weight: 500; font-size:0.95rem;">First National Bank</div>
                                <div style="color: var(--text-muted); font-size: 0.8rem;">Account •••• 4281</div>
                            </div>
                        </div>
                        <span style="font-size: 0.8rem; color: var(--success); font-weight:600;">Active</span>
                    </div>
                </div>
                
                <div class="glass-card" style="margin-bottom: 32px;">
                    <h3 style="margin-bottom: 16px; font-size: 1.1rem; color: #fff;"><i class="ph-fill ph-lightning" style="color:var(--brand-yellow); margin-right:8px;"></i> Lightning Integration</h3>
                    <div style="display:flex; justify-content:space-between; align-items:center; background: rgba(0,0,0,0.2); border: 1px solid var(--border-subtle); padding: 16px; border-radius: var(--radius-sm);">
                        <div style="display:flex; align-items:center; gap: 12px;">
                            <div style="width: 32px; height: 32px; background: var(--brand-yellow); border-radius: 50%; display:flex; justify-content:center; align-items:center; color:#fff;">
                                <i class="ph-fill ph-lightning"></i>
                            </div>
                            <div>
                                <div style="font-weight: 500; font-size:0.95rem;">Provider</div>
                                <div style="color: var(--text-muted); font-size: 0.8rem;">Voltage / LND Auto-Convert</div>
                            </div>
                        </div>
                        <span style="font-size: 0.8rem; color: var(--success); font-weight:600;">Connected</span>
                    </div>
                </div>

                <div class="glass-card" style="margin-bottom: 32px;">
                    <h3 style="margin-bottom: 16px; font-size: 1.1rem; color: #fff;"><i class="ph-fill ph-device-mobile" style="color:var(--accent-blue); margin-right:8px;"></i> Device Options</h3>
                    <button class="btn btn-secondary" style="border-color: var(--accent-blue); color: var(--accent-blue); margin-bottom: 12px;" onclick="alert('App installed to Home Screen successfully! (Simulated)')">
                        <i class="ph ph-download-simple"></i> Install App to Home Screen
                    </button>
                    ${state.user.role === 'admin' ? `
                    <button class="btn btn-secondary" onclick="state.user.role = 'cashier'; navigate('dashboard');">
                        <i class="ph ph-user-switch"></i> Switch to Cashier Mode
                    </button>
                    ` : ''}
                </div>
                
                <button class="btn btn-secondary" style="color: var(--danger); border-color: rgba(239, 68, 68, 0.2);" onclick="handleLogout()">
                    <i class="ph ph-sign-out"></i> Sign Out
                </button>
            </div>
        </div>
    `;
};

// Start the app
document.addEventListener('DOMContentLoaded', () => {
    navigate('login');
});

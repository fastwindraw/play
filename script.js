document.addEventListener('DOMContentLoaded', () => {
    // --- DOM Elements ---
    const dashboardLinks = document.querySelectorAll('.sidebar nav ul li a');
    const contentSections = document.querySelectorAll('.content-section');
    const registrationModal = document.getElementById('registration-modal');
    const fundUserModal = document.getElementById('fund-user-modal');
    const withdrawalModal = document.getElementById('withdrawal-modal');
    const closeButtons = document.querySelectorAll('.close-button');
    const registrationForm = document.getElementById('registration-form');
    const loginForm = document.getElementById('login-form');
    const showLoginLink = document.getElementById('show-login');
    const authMessage = document.getElementById('auth-message');
    const welcomeMessage = document.getElementById('welcome-message');
    const accountNumberSpan = document.getElementById('account-number');
    const walletBalanceSpan = document.getElementById('wallet-balance');
    const logoutBtn = document.getElementById('logout-btn');

    // Dashboard elements
    const dashboardBalance = document.getElementById('dashboard-balance');
    const dashboardWinnings = document.getElementById('dashboard-winnings');
    const dashboardGamesPlayed = document.getElementById('dashboard-games-played');
    const dashboardPendingWithdrawals = document.getElementById('dashboard-pending-withdrawals');
    const recentTransactionsList = document.getElementById('recent-transactions-list');
    const fundOtherUserBtn = document.getElementById('fund-other-user-btn');
    const initiateWithdrawalBtn = document.getElementById('initiate-withdrawal-btn');
    const quickPlayLottoBtn = document.getElementById('quick-play-lotto-btn');

    // Wallet elements
    const walletCurrentBalance = document.getElementById('wallet-current-balance');
    const walletAccountNumber = document.getElementById('wallet-account-number');
    const sendFundsBtn = document.getElementById('send-funds-btn');
    const withdrawFundsBtn = document.getElementById('withdraw-funds-btn');
    const fullTransactionHistory = document.getElementById('full-transaction-history');
    const fundUserForm = document.getElementById('fund-user-form');
    const recipientAccountNumberInput = document.getElementById('recipient-account-number');
    const fundAmountInput = document.getElementById('fund-amount');
    const fundMessage = document.getElementById('fund-message');

    // Withdrawal elements
    const withdrawalForm = document.getElementById('withdrawal-form');
    const withdrawalCurrentBalance = document.getElementById('withdrawal-current-balance');
    const withdrawalAmountInput = document.getElementById('withdrawal-amount');
    const withdrawalBankNameInput = document.getElementById('withdrawal-bank-name');
    const withdrawalBankAccountInput = document.getElementById('withdrawal-bank-account');
    const withdrawalMessage = document.getElementById('withdrawal-message');

    // Lotto elements
    const lottoNumberGrid = document.getElementById('lotto-number-grid');
    const selectedLottoNumbersSpan = document.getElementById('selected-lotto-numbers');
    const predictLottoBtn = document.getElementById('predict-lotto-btn');
    const lottoCountdown = document.getElementById('lotto-countdown');
    const lottoMessage = document.getElementById('lotto-message');
    const previousLottoResultsList = document.getElementById('previous-lotto-results');

    // Admin elements
    const adminLoginArea = document.getElementById('admin-login-area');
    const adminPasswordInput = document.getElementById('admin-password-input');
    const adminLoginBtn = document.getElementById('admin-login-btn');
    const adminLoginMessage = document.getElementById('admin-login-message');
    const adminContent = document.getElementById('admin-content');
    const checkUserBalanceInput = document.getElementById('check-user-balance-input');
    const checkUserBalanceBtn = document.getElementById('check-user-balance-btn');
    const checkedUserName = document.getElementById('checked-user-name');
    const checkedUserBalance = document.getElementById('checked-user-balance');
    const adminFundAccountNumberInput = document.getElementById('admin-fund-account-number');
    const adminFundAmountInput = document.getElementById('admin-fund-amount');
    const adminFundPasswordInput = document.getElementById('admin-fund-password');
    const adminFundUserBtn = document.getElementById('admin-fund-user-btn');
    const adminFundMessage = document.getElementById('admin-fund-message');
    const allUsersList = document.getElementById('all-users-list');
    const adminWithdrawalRequests = document.getElementById('admin-withdrawal-requests');


    // --- Mock Data Store (In a real app, this would be a backend API/database) ---
    let users = JSON.parse(localStorage.getItem('ecolotto_users')) || [];
    let currentUser = JSON.parse(localStorage.getItem('ecolotto_currentUser'));
    let transactions = JSON.parse(localStorage.getItem('ecolotto_transactions')) || [];
    let lottoGames = JSON.parse(localStorage.getItem('ecolotto_lottoGames')) || [];
    let withdrawalRequests = JSON.parse(localStorage.getItem('ecolotto_withdrawals')) || [];

    const ADMIN_PASSWORD = 'admin'; // Default admin password
    const ADMIN_FUND_PASSWORD = '12345'; // Default admin fund password
    const LOTTO_COST = 200;
    const LOTTO_REWARD_MULTIPLIER = 5; // 5x stake for full match
    const LOTTO_PARTIAL_REWARDS = {
        3: 100, // For 3 correct numbers
        4: 500, // For 4 correct numbers
        5: 2000 // For 5 correct numbers
    };
    const MIN_WITHDRAWAL_AMOUNT = 1000;

    // --- Helper Functions ---
    function generateAccountNumber() {
        // FW + 9 random digits (recycling implies a larger pool, but for mock, just generate unique)
        let newAccNum;
        let isUnique = false;
        while (!isUnique) {
            newAccNum = 'FW' + Math.random().toString().slice(2, 11); // 9 digits
            isUnique = !users.some(user => user.accountNumber === newAccNum);
        }
        return newAccNum;
    }

    function saveToLocalStorage() {
        localStorage.setItem('ecolotto_users', JSON.stringify(users));
        localStorage.setItem('ecolotto_currentUser', JSON.stringify(currentUser));
        localStorage.setItem('ecolotto_transactions', JSON.stringify(transactions));
        localStorage.setItem('ecolotto_lottoGames', JSON.stringify(lottoGames));
        localStorage.setItem('ecolotto_withdrawals', JSON.stringify(withdrawalRequests));
    }

    function updateHeaderInfo() {
        if (currentUser) {
            const user = users.find(u => u.username === currentUser.username);
            welcomeMessage.textContent = `Welcome, ${user.fullname.split(' ')[0]}!`;
            accountNumberSpan.textContent = `Account: ${user.accountNumber}`;
            walletBalanceSpan.textContent = `Balance: ₦${user.balance.toLocaleString()}`;
        } else {
            welcomeMessage.textContent = 'Welcome, Guest!';
            accountNumberSpan.textContent = 'Account: N/A';
            walletBalanceSpan.textContent = 'Balance: ₦0.00';
        }
    }

    function showSection(sectionId) {
        contentSections.forEach(section => {
            section.classList.remove('active');
        });
        document.getElementById(sectionId).classList.add('active');

        dashboardLinks.forEach(link => {
            link.classList.remove('active');
        });
        // Highlight the corresponding link in the sidebar
        const activeLink = document.getElementById(`${sectionId.replace('-view', '')}-link`);
        if (activeLink) {
            activeLink.classList.add('active');
        }
        
        // Specific updates for sections
        if (sectionId === 'dashboard-view') {
            updateDashboardView();
        } else if (sectionId === 'wallet-view') {
            updateWalletView();
        } else if (sectionId === 'lotto-view') {
            initLottoGame();
        } else if (sectionId === 'history-view') {
            updateGameHistoryView();
        } else if (sectionId === 'admin-view') {
            // Admin panel logic will be handled by its own login state
            // It defaults to showing the login form
            adminContent.style.display = 'none';
            adminLoginArea.style.display = 'block';
            adminPasswordInput.value = '';
            adminLoginMessage.textContent = '';
        }
    }

    function renderTransactions(listElement, userAccNum, limit = 0) {
        const userTransactions = transactions
            .filter(t => t.from === userAccNum || t.to === userAccNum || t.accountNumber === userAccNum)
            .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

        listElement.innerHTML = '';
        const transactionsToDisplay = limit > 0 ? userTransactions.slice(0, limit) : userTransactions;

        if (transactionsToDisplay.length === 0) {
            listElement.innerHTML = '<li>No transactions yet.</li>';
            return;
        }

        transactionsToDisplay.forEach(t => {
            let typeClass = '';
            let amountPrefix = '';
            if (t.type === 'credit' || t.type === 'lotto_win' || t.type === 'admin_fund') {
                typeClass = 'credit';
                amountPrefix = '+';
            } else if (t.type === 'debit' || t.type === 'lotto_loss' || t.type === 'fund_transfer') {
                typeClass = 'debit';
                amountPrefix = '-';
            }

            const listItem = document.createElement('li');
            listItem.classList.add(typeClass);
            let description = t.description || `Transaction type: ${t.type}`;
            if (t.type === 'fund_transfer' && t.from === userAccNum) {
                description = `Sent to ${t.to}`;
            } else if (t.type === 'fund_transfer' && t.to === userAccNum) {
                description = `Received from ${t.from}`;
            } else if (t.type === 'lotto_prediction') {
                description = `Lotto Prediction: ${t.predictedNumbers.join(', ')}`;
            } else if (t.type === 'lotto_win') {
                description = `Lotto Win (Match: ${t.matchCount})! Numbers: ${t.predictedNumbers.join(', ')}`;
            } else if (t.type === 'lotto_loss') {
                 description = `Lotto Loss (Predicted: ${t.predictedNumbers.join(', ')} | Result: ${t.resultNumbers.join(', ')})`;
            }

            listItem.innerHTML = `
                <span>${new Date(t.timestamp).toLocaleString()} - ${description}</span>
                <span class="${typeClass}">${amountPrefix}₦${t.amount.toLocaleString()}</span>
            `;
            listElement.appendChild(listItem);
        });
    }

    // --- Core Logic ---

    // Initial check for logged-in user or show registration modal
    if (!currentUser) {
        registrationModal.style.display = 'block';
    } else {
        updateHeaderInfo();
        showSection('dashboard-view');
    }

    // --- Event Listeners for Navigation ---
    dashboardLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            if (!currentUser && link.id !== 'dashboard-link') { // Allow guest to view dashboard initially
                 alert('Please register or login to access this feature.');
                 registrationModal.style.display = 'block';
                 return;
            }
            showSection(link.id.replace('-link', '-view'));
        });
    });

    // --- Modal Handling ---
    closeButtons.forEach(button => {
        button.addEventListener('click', () => {
            registrationModal.style.display = 'none';
            fundUserModal.style.display = 'none';
            withdrawalModal.style.display = 'none';
        });
    });

    window.addEventListener('click', (event) => {
        if (event.target === registrationModal) {
            registrationModal.style.display = 'none';
        }
        if (event.target === fundUserModal) {
            fundUserModal.style.display = 'none';
        }
        if (event.target === withdrawalModal) {
            withdrawalModal.style.display = 'none';
        }
    });

    // --- Registration/Login Logic ---
    showLoginLink.addEventListener('click', (e) => {
        e.preventDefault();
        registrationForm.style.display = 'none';
        loginForm.style.display = 'block';
        authMessage.textContent = '';
    });

    registrationForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const fullname = document.getElementById('reg-fullname').value;
        const email = document.getElementById('reg-email').value;
        const phone = document.getElementById('reg-phone').value;
        const username = document.getElementById('reg-username').value;
        const password = document.getElementById('reg-password').value;

        if (users.some(user => user.username === username)) {
            authMessage.textContent = 'Username already exists.';
            return;
        }

        const newAccountNumber = generateAccountNumber();
        const newUser = {
            id: users.length + 1,
            fullname,
            email,
            phone,
            username,
            password, // In a real app, hash this password!
            accountNumber: newAccountNumber,
            balance: 0,
            totalWinnings: 0,
            gamesPlayed: 0,
            pendingWithdrawals: 0
        };
        users.push(newUser);
        currentUser = { username: newUser.username, accountNumber: newUser.accountNumber };
        saveToLocalStorage();
        updateHeaderInfo();
        registrationModal.style.display = 'none';
        showSection('dashboard-view');
        alert('Registration successful! Welcome to EcoLotto.');
    });

    loginForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const username = document.getElementById('login-username').value;
        const password = document.getElementById('login-password').value;

        const user = users.find(u => u.username === username && u.password === password); // Again, real app: hash comparison
        if (user) {
            currentUser = { username: user.username, accountNumber: user.accountNumber };
            saveToLocalStorage();
            updateHeaderInfo();
            registrationModal.style.display = 'none';
            showSection('dashboard-view');
            alert('Login successful!');
        } else {
            authMessage.textContent = 'Invalid username or password.';
        }
    });

    logoutBtn.addEventListener('click', () => {
        currentUser = null;
        saveToLocalStorage();
        updateHeaderInfo();
        registrationModal.style.display = 'block'; // Show registration/login again
        showSection('dashboard-view'); // Default view
        alert('You have been logged out.');
    });

    // --- Dashboard View Updates ---
    function updateDashboardView() {
        if (!currentUser) return;
        const user = users.find(u => u.username === currentUser.username);
        if (user) {
            dashboardBalance.textContent = `₦${user.balance.toLocaleString()}`;
            dashboardWinnings.textContent = `₦${user.totalWinnings.toLocaleString()}`;
            dashboardGamesPlayed.textContent = user.gamesPlayed;
            dashboardPendingWithdrawals.textContent = `₦${user.pendingWithdrawals.toLocaleString()}`;
            renderTransactions(recentTransactionsList, user.accountNumber, 5); // Show last 5
        }
    }

    // --- Wallet View Updates ---
    function updateWalletView() {
        if (!currentUser) return;
        const user = users.find(u => u.username === currentUser.username);
        if (user) {
            walletCurrentBalance.textContent = `₦${user.balance.toLocaleString()}`;
            walletAccountNumber.textContent = user.accountNumber;
            renderTransactions(fullTransactionHistory, user.accountNumber);
        }
    }

    // Quick action buttons
    fundOtherUserBtn.addEventListener('click', () => {
        if (!currentUser) {
            alert('Please login to use this feature.');
            registrationModal.style.display = 'block';
            return;
        }
        recipientAccountNumberInput.value = '';
        fundAmountInput.value = '';
        fundMessage.textContent = '';
        fundUserModal.style.display = 'block';
    });
    
    sendFundsBtn.addEventListener('click', () => {
        fundOtherUserBtn.click(); // Re-use the same logic
    });

    initiateWithdrawalBtn.addEventListener('click', () => {
        if (!currentUser) {
            alert('Please login to use this feature.');
            registrationModal.style.display = 'block';
            return;
        }
        const user = users.find(u => u.username === currentUser.username);
        if (user) {
            withdrawalCurrentBalance.textContent = `₦${user.balance.toLocaleString()}`;
            withdrawalAmountInput.value = '';
            withdrawalBankNameInput.value = '';
            withdrawalBankAccountInput.value = '';
            withdrawalMessage.textContent = '';
            withdrawalModal.style.display = 'block';
        }
    });

    withdrawFundsBtn.addEventListener('click', () => {
        initiateWithdrawalBtn.click(); // Re-use the same logic
    });

    fundUserForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const sender = users.find(u => u.username === currentUser.username);
        const recipientAccNum = recipientAccountNumberInput.value.trim();
        const amount = parseFloat(fundAmountInput.value);

        if (!sender) {
            fundMessage.textContent = 'Error: Sender not found.';
            return;
        }
        if (sender.balance < amount) {
            fundMessage.textContent = 'Insufficient balance.';
            return;
        }
        if (amount <= 0) {
            fundMessage.textContent = 'Amount must be positive.';
            return;
        }
        if (sender.accountNumber === recipientAccNum) {
            fundMessage.textContent = 'Cannot send funds to yourself.';
            return;
        }

        const recipient = users.find(u => u.accountNumber === recipientAccNum);
        if (!recipient) {
            fundMessage.textContent = 'Recipient account number not found.';
            return;
        }

        // Perform transaction
        sender.balance -= amount;
        recipient.balance += amount;

        // Log transaction
        const timestamp = new Date().toISOString();
        transactions.push({
            id: transactions.length + 1,
            type: 'fund_transfer',
            from: sender.accountNumber,
            to: recipient.accountNumber,
            amount: amount,
            description: `Transfer to ${recipient.fullname}`,
            timestamp: timestamp
        });
        // Add a mirrored transaction for recipient's view
         transactions.push({
            id: transactions.length + 2,
            type: 'fund_transfer',
            from: sender.accountNumber,
            to: recipient.accountNumber,
            amount: amount,
            description: `Received from ${sender.fullname}`,
            timestamp: timestamp
        });

        saveToLocalStorage();
        updateHeaderInfo();
        updateDashboardView();
        updateWalletView();
        fundUserModal.style.display = 'none';
        alert(`Successfully sent ₦${amount.toLocaleString()} to ${recipient.fullname} (${recipient.accountNumber}).`);
    });

    withdrawalForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const user = users.find(u => u.username === currentUser.username);
        const amount = parseFloat(withdrawalAmountInput.value);
        const bankName = withdrawalBankNameInput.value.trim();
        const bankAccount = withdrawalBankAccountInput.value.trim();

        if (!user) {
            withdrawalMessage.textContent = 'Error: User not found.';
            return;
        }
        if (amount < MIN_WITHDRAWAL_AMOUNT) {
            withdrawalMessage.textContent = `Minimum withdrawal amount is ₦${MIN_WITHDRAWAL_AMOUNT.toLocaleString()}.`;
            return;
        }
        if (user.balance < amount) {
            withdrawalMessage.textContent = 'Insufficient balance for withdrawal.';
            return;
        }

        // Deduct from user's balance and mark as pending
        user.balance -= amount;
        user.pendingWithdrawals += amount;

        withdrawalRequests.push({
            id: withdrawalRequests.length + 1,
            accountNumber: user.accountNumber,
            fullname: user.fullname,
            amount: amount,
            bankName: bankName,
            bankAccount: bankAccount,
            status: 'Pending',
            timestamp: new Date().toISOString()
        });

        saveToLocalStorage();
        updateHeaderInfo();
        updateDashboardView();
        updateWalletView(); // Refresh wallet view
        withdrawalModal.style.display = 'none';
        alert(`Withdrawal request for ₦${amount.toLocaleString()} submitted successfully. It's pending admin approval.`);
    });


    // --- Lotto Game Logic ---
    let selectedLottoNumbers = [];
    let lottoInterval;
    let currentLottoResult = []; // Stores the result of the current round

    function generateLottoNumbersGrid() {
        lottoNumberGrid.innerHTML = '';
        for (let i = 1; i <= 99; i++) {
            const numSpan = document.createElement('span');
            numSpan.textContent = i;
            numSpan.dataset.number = i;
            numSpan.addEventListener('click', () => toggleLottoNumber(i));
            lottoNumberGrid.appendChild(numSpan);
        }
    }

    function toggleLottoNumber(number) {
        if (!currentUser) {
            alert('Please login to play the lotto game.');
            registrationModal.style.display = 'block';
            return;
        }
        const index = selectedLottoNumbers.indexOf(number);
        if (index > -1) {
            selectedLottoNumbers.splice(index, 1);
        } else {
            if (selectedLottoNumbers.length < 6) {
                selectedLottoNumbers.push(number);
            } else {
                alert('You can only select 6 numbers.');
            }
        }
        updateSelectedNumbersUI();
    }

    function updateSelectedNumbersUI() {
        selectedLottoNumbers.sort((a, b) => a - b);
        selectedLottoNumbersSpan.textContent = selectedLottoNumbers.length > 0 ? selectedLottoNumbers.join(', ') : 'None';
        predictLottoBtn.disabled = selectedLottoNumbers.length !== 6;
        document.querySelectorAll('.number-grid span').forEach(span => {
            const num = parseInt(span.dataset.number);
            if (selectedLottoNumbers.includes(num)) {
                span.classList.add('selected');
            } else {
                span.classList.remove('selected');
            }
        });
    }

    function startLottoCountdown(durationInSeconds) {
        clearInterval(lottoInterval);
        let timer = durationInSeconds;
        const startTime = Date.now(); // Store start time

        lottoInterval = setInterval(() => {
            let elapsed = Math.floor((Date.now() - startTime) / 1000);
            timer = durationInSeconds - elapsed;

            if (timer < 0) timer = 0; // Prevent negative display

            const minutes = String(Math.floor(timer / 60)).padStart(2, '0');
            const seconds = String(timer % 60).padStart(2, '0');
            lottoCountdown.textContent = `${minutes}:${seconds}`;

            if (timer <= 0) {
                clearInterval(lottoInterval);
                lottoCountdown.textContent = '00:00';
                generateLottoResult();
            }
        }, 1000);
    }

    function generateRandomLottoNumbers(count, max) {
        const numbers = new Set();
        while (numbers.size < count) {
            numbers.add(Math.floor(Math.random() * max) + 1);
        }
        return Array.from(numbers).sort((a, b) => a - b);
    }

    function generateLottoResult() {
        currentLottoResult = generateRandomLottoNumbers(6, 99);
        lottoMessage.textContent = `Result: ${currentLottoResult.join(', ')}`;
        console.log("Lotto Result Generated:", currentLottoResult); // For debugging

        // Process all active predictions for this round
        const activePredictions = lottoGames.filter(game => game.status === 'pending');
        activePredictions.forEach(prediction => {
            processLottoPrediction(prediction.id, currentLottoResult);
        });

        // Start a new round after a short delay to display results
        setTimeout(() => {
            initLottoGame(); // Restart for next round
        }, 5000); // Show result for 5 seconds
    }

    function processLottoPrediction(gameId, resultNumbers) {
        const game = lottoGames.find(g => g.id === gameId);
        if (!game || game.status !== 'pending') return;

        const user = users.find(u => u.accountNumber === game.accountNumber);
        if (!user) return;

        const predicted = new Set(game.predictedNumbers);
        const matches = resultNumbers.filter(num => predicted.has(num));
        const matchCount = matches.length;
        let reward = 0;

        game.resultNumbers = resultNumbers;
        game.matchCount = matchCount;
        game.timestampResult = new Date().toISOString();

        if (matchCount === 6) {
            reward = LOTTO_COST * LOTTO_REWARD_MULTIPLIER;
            user.balance += reward;
            user.totalWinnings += reward;
            game.status = 'won';
            game.winnings = reward;
            transactions.push({
                id: transactions.length + 1,
                type: 'lotto_win',
                accountNumber: user.accountNumber,
                amount: reward,
                description: `Lotto Win (6/6 match)!`,
                predictedNumbers: game.predictedNumbers,
                resultNumbers: resultNumbers,
                matchCount: matchCount,
                timestamp: new Date().toISOString()
            });
        } else if (LOTTO_PARTIAL_REWARDS[matchCount]) {
            reward = LOTTO_PARTIAL_REWARDS[matchCount];
            user.balance += reward;
            user.totalWinnings += reward;
            game.status = 'partial_win';
            game.winnings = reward;
            transactions.push({
                id: transactions.length + 1,
                type: 'lotto_win',
                accountNumber: user.accountNumber,
                amount: reward,
                description: `Lotto Partial Win (${matchCount}/6 match)!`,
                predictedNumbers: game.predictedNumbers,
                resultNumbers: resultNumbers,
                matchCount: matchCount,
                timestamp: new Date().toISOString()
            });
        } else {
            // Loss already handled by initial deduction, just update status
            game.status = 'lost';
            game.winnings = 0;
            // A "loss" transaction can be added for history if not already.
            // For now, the prediction transaction itself serves as the debit record.
        }
        
        user.gamesPlayed++;
        saveToLocalStorage();
        updateHeaderInfo();
        updateDashboardView(); // Update stats
        updateWalletView(); // Update transaction history
        updateGameHistoryView(); // Update user's game history
    }

    predictLottoBtn.addEventListener('click', () => {
        if (!currentUser) {
            alert('Please login to play the lotto game.');
            registrationModal.style.display = 'block';
            return;
        }

        if (selectedLottoNumbers.length !== 6) {
            alert('Please select exactly 6 numbers.');
            return;
        }

        const user = users.find(u => u.username === currentUser.username);
        if (!user) {
            alert('Error: User not found.');
            return;
        }
        if (user.balance < LOTTO_COST) {
            alert(`Insufficient balance. A prediction costs ₦${LOTTO_COST}.`);
            return;
        }

        // Deduct cost
        user.balance -= LOTTO_COST;

        // Log prediction as a transaction
        const timestamp = new Date().toISOString();
        transactions.push({
            id: transactions.length + 1,
            type: 'lotto_prediction',
            accountNumber: user.accountNumber,
            amount: LOTTO_COST,
            description: `Lotto Prediction: ${selectedLottoNumbers.join(', ')}`,
            predictedNumbers: [...selectedLottoNumbers],
            timestamp: timestamp
        });
        
        // Save lotto game state for later processing
        lottoGames.push({
            id: lottoGames.length + 1,
            accountNumber: user.accountNumber,
            predictedNumbers: [...selectedLottoNumbers],
            cost: LOTTO_COST,
            status: 'pending', // Will be updated to 'won'/'lost'/'partial_win' after result
            timestampPrediction: timestamp
        });

        saveToLocalStorage();
        updateHeaderInfo();
        updateDashboardView();
        updateWalletView();
        lottoMessage.textContent = `Prediction placed for ₦${LOTTO_COST}. Waiting for results...`;

        // Clear selection for next prediction
        selectedLottoNumbers = [];
        updateSelectedNumbersUI();
    });

    function updateGameHistoryView() {
        if (!currentUser) return;
        const userGames = lottoGames
            .filter(game => game.accountNumber === currentUser.accountNumber && game.status !== 'pending')
            .sort((a, b) => new Date(b.timestampPrediction) - new Date(a.timestampPrediction));

        userGameHistory.innerHTML = '';
        if (userGames.length === 0) {
            userGameHistory.innerHTML = '<li>No games played yet.</li>';
            return;
        }

        userGames.forEach(game => {
            const listItem = document.createElement('li');
            let statusText = '';
            let statusClass = '';
            let details = '';

            if (game.status === 'won') {
                statusText = 'WON';
                statusClass = 'credit';
                details = `Won ₦${game.winnings.toLocaleString()} (6/6 match!)`;
            } else if (game.status === 'partial_win') {
                statusText = 'PARTIAL WIN';
                statusClass = 'credit';
                details = `Won ₦${game.winnings.toLocaleString()} (${game.matchCount}/6 match)`;
            } else {
                statusText = 'LOST';
                statusClass = 'debit';
                details = `Lost ₦${game.cost.toLocaleString()}`;
            }

            listItem.classList.add(statusClass);
            listItem.innerHTML = `
                <span>${new Date(game.timestampPrediction).toLocaleString()}</span>
                <span>Prediction: ${game.predictedNumbers.join(', ')}</span>
                <span>Result: ${game.resultNumbers ? game.resultNumbers.join(', ') : 'Pending'}</span>
                <span class="${statusClass}">${statusText}: ${details}</span>
            `;
            userGameHistory.appendChild(listItem);
        });

        // Also update previous lotto results on the lotto view (distinct from user history)
        previousLottoResultsList.innerHTML = '';
        const allCompletedGames = lottoGames
            .filter(game => game.status !== 'pending')
            .map(game => ({
                id: game.id,
                resultNumbers: game.resultNumbers,
                timestampResult: game.timestampResult
            }))
            .filter((value, index, self) => // Get unique results by result numbers and time
                index === self.findIndex((t) => (
                    t.resultNumbers.every((v, i) => v === value.resultNumbers[i]) && t.timestampResult === value.timestampResult
                ))
            )
            .sort((a, b) => new Date(b.timestampResult) - new Date(a.timestampResult))
            .slice(0, 10); // Show last 10 unique results

        if (allCompletedGames.length === 0) {
             previousLottoResultsList.innerHTML = '<li>No previous results yet.</li>';
        } else {
            allCompletedGames.forEach(result => {
                const listItem = document.createElement('li');
                listItem.innerHTML = `
                    <span>Round: ${result.id} | Result: <strong style="color:#2c3e50;">${result.resultNumbers.join(', ')}</strong></span>
                    <span>(${new Date(result.timestampResult).toLocaleString()})</span>
                `;
                previousLottoResultsList.appendChild(listItem);
            });
        }
    }


    function initLottoGame() {
        generateLottoNumbersGrid();
        selectedLottoNumbers = [];
        updateSelectedNumbersUI();
        lottoMessage.textContent = 'Select 6 numbers and click Predict Now!';
        startLottoCountdown(600); // 10 minutes in seconds
        updateGameHistoryView(); // Refresh history
    }

    quickPlayLottoBtn.addEventListener('click', () => {
        if (!currentUser) {
            alert('Please login to play the lotto game.');
            registrationModal.style.display = 'block';
            return;
        }
        showSection('lotto-view');
    });

    // --- Admin Panel Logic ---
    let isAdminLoggedIn = false;

    adminLoginBtn.addEventListener('click', () => {
        const password = adminPasswordInput.value;
        if (password === ADMIN_PASSWORD) {
            isAdminLoggedIn = true;
            adminLoginArea.style.display = 'none';
            adminContent.style.display = 'block';
            adminLoginMessage.textContent = '';
            updateAdminView();
        } else {
            adminLoginMessage.textContent = 'Incorrect admin password.';
            adminPasswordInput.value = '';
        }
    });

    function updateAdminView() {
        if (!isAdminLoggedIn) return;

        // Display all users
        allUsersList.innerHTML = '';
        if (users.length === 0) {
            allUsersList.innerHTML = '<li>No registered users.</li>';
        } else {
            users.forEach(user => {
                const listItem = document.createElement('li');
                listItem.innerHTML = `
                    <span>${user.fullname} (${user.username})</span>
                    <span>Acc: ${user.accountNumber} | Balance: ₦${user.balance.toLocaleString()}</span>
                `;
                allUsersList.appendChild(listItem);
            });
        }

        // Display withdrawal requests
        adminWithdrawalRequests.innerHTML = '';
        const pendingWithdrawals = withdrawalRequests.filter(req => req.status === 'Pending');
        if (pendingWithdrawals.length === 0) {
            adminWithdrawalRequests.innerHTML = '<li>No pending withdrawal requests.</li>';
        } else {
            pendingWithdrawals.forEach(req => {
                const listItem = document.createElement('li');
                listItem.innerHTML = `
                    <span>User: ${req.fullname} (${req.accountNumber})</span>
                    <span>Amount: ₦${req.amount.toLocaleString()} | Bank: ${req.bankName} (${req.bankAccount})</span>
                    <button data-id="${req.id}" class="approve-withdrawal-btn">Approve</button>
                `;
                adminWithdrawalRequests.appendChild(listItem);
            });
            document.querySelectorAll('.approve-withdrawal-btn').forEach(btn => {
                btn.addEventListener('click', (e) => approveWithdrawal(parseInt(e.target.dataset.id)));
            });
        }
    }

    checkUserBalanceBtn.addEventListener('click', () => {
        const accNum = checkUserBalanceInput.value.trim();
        const user = users.find(u => u.accountNumber === accNum);
        if (user) {
            checkedUserName.textContent = user.fullname;
            checkedUserBalance.textContent = `₦${user.balance.toLocaleString()}`;
        } else {
            checkedUserName.textContent = 'N/A';
            checkedUserBalance.textContent = 'User not found.';
        }
    });

    adminFundUserBtn.addEventListener('click', () => {
        const recipientAccNum = adminFundAccountNumberInput.value.trim();
        const amount = parseFloat(adminFundAmountInput.value);
        const fundPassword = adminFundPasswordInput.value;

        if (fundPassword !== ADMIN_FUND_PASSWORD) {
            adminFundMessage.textContent = 'Incorrect admin fund password.';
            return;
        }
        if (amount <= 0 || isNaN(amount)) {
            adminFundMessage.textContent = 'Invalid amount.';
            return;
        }

        const recipient = users.find(u => u.accountNumber === recipientAccNum);
        if (!recipient) {
            adminFundMessage.textContent = 'Recipient account number not found.';
            return;
        }

        recipient.balance += amount;

        transactions.push({
            id: transactions.length + 1,
            type: 'admin_fund',
            to: recipient.accountNumber,
            amount: amount,
            description: `Admin deposit`,
            timestamp: new Date().toISOString()
        });

        saveToLocalStorage();
        updateHeaderInfo(); // In case admin funded logged-in user
        updateAdminView();
        adminFundMessage.textContent = `Successfully funded ${recipient.fullname} with ₦${amount.toLocaleString()}.`;
        adminFundAccountNumberInput.value = '';
        adminFundAmountInput.value = '';
        adminFundPasswordInput.value = '';
    });

    function approveWithdrawal(requestId) {
        const request = withdrawalRequests.find(req => req.id === requestId);
        if (request) {
            request.status = 'Approved';
            // Find the user and update their pending withdrawals (already deducted from balance)
            const user = users.find(u => u.accountNumber === request.accountNumber);
            if (user) {
                user.pendingWithdrawals -= request.amount;
            }
            // In a real system, this would trigger actual bank transfer.
            // For mock, simply mark as approved.
            saveToLocalStorage();
            updateAdminView();
            updateDashboardView(); // Refresh if logged in user has pending withdrawals
            alert(`Withdrawal request for ${request.fullname} (₦${request.amount.toLocaleString()}) approved.`);
        }
    }

    // --- Initializations ---
    updateHeaderInfo();
    // No need to show registration modal on every refresh if currentUser exists.
    // The initial if(!currentUser) handles it.
});
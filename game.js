// ============================================================
// KMTC Shipping Tycoon v4 - Idle Management Engine
// Auto-sales, growth, investment, voyage cycle
// ============================================================

const Game = {
    state: null,
    tickTimer: null,
    tickMs: 1000, // 1 real second = base tick

    // ==================== SCREENS ====================
    showScreen(id) {
        document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
        document.getElementById(id).classList.add('active');
    },

    goToTitle() {
        document.getElementById('screen-lang').classList.remove('active');
        this.showScreen('screen-title');
        updateStaticTexts();
        if (localStorage.getItem('kmtc_save')) {
            document.getElementById('btn-load').style.display = '';
            document.getElementById('btn-load').textContent = T('title.loadGame');
        }
    },

    // ==================== ROUTE SELECTION ====================
    renderRoutes() {
        document.getElementById('route-cards').innerHTML = ROUTES.map(r => {
            const portStr = r.ports.map(p => `<span class="ptag">${(CURRENT_LANG==='ja'&&r.portNamesJa?r.portNamesJa:r.portNames)[p]}</span>`).join('<span class="parr">→</span>');
            const locked = r.unlockRevenue > 0;
            return `
            <div class="route-card ${locked ? 'locked' : ''}" onclick="${locked ? '' : `Game.pickRoute('${r.id}')`}" style="border-top:4px solid ${r.color};${locked ? 'opacity:.5;cursor:default' : ''}">
                <div class="rc-hdr"><h3>${D(r,'name')}</h3><span class="diff" style="background:${r.color}20;color:${r.color}">${D(r,'difficulty')}</span></div>
                <p style="font-size:12px;color:var(--t2)">${D(r,'description')}</p>
                <div class="rc-ports">${portStr}<span class="parr">→</span><span class="ptag">${(CURRENT_LANG==='ja'&&r.portNamesJa?r.portNamesJa:r.portNames)[r.ports[0]]}</span></div>
                <div class="rc-stats">
                    <div class="rc-stat"><span>${T('setup.ship')}</span><span>${r.vesselSize} TEU</span></div>
                    <div class="rc-stat"><span>${T('setup.schedule')}</span><span>${r.rotationDays}${T('route.days')}</span></div>
                </div>
                <div class="rc-foot"><div class="rc-cost">$${(r.investmentCost/1e3).toFixed(0)}K</div><div class="rc-cost-lbl">${locked ? `${T('inv.unlockAt')} $${(r.unlockRevenue/1e3).toFixed(0)}K` : T('route.investment')}</div></div>
            </div>`;
        }).join('');
    },

    pickRoute(id) {
        this._route = ROUTES.find(r => r.id === id);
        const r = this._route;
        document.getElementById('setup-info').innerHTML = [
            [T('setup.route'), D(r,'name')], [T('setup.ship'), `${r.vesselSize} TEU`],
            [T('setup.schedule'), `${r.rotationDays}${T('route.days')}`], [T('route.investment'), `$${r.investmentCost.toLocaleString()}`],
        ].map(([l, v]) => `<div class="info-row"><span class="lbl">${l}</span><span>${v}</span></div>`).join('');
        this.showScreen('screen-setup');
    },

    // ==================== DRAFT ====================
    _draftPicks: [],

    renderDraft() {
        this._draftPicks = [];
        // Shuffle and pick 9 from full pool for draft candidates
        const shuffled = [...ALL_SALES_CHARACTERS].sort(() => Math.random() - 0.5);
        this._draftPool = shuffled.slice(0, 9);
        const html = this._draftPool.map(ch => {
            const totalStat = ch.traits.negotiation + ch.traits.faceToFace + ch.traits.digital + ch.traits.relationship;
            const statBars = [
                { label: T('draft.negotiation'), key: 'negotiation', icon: '🤝', color: '#E65100' },
                { label: T('draft.faceToFace'), key: 'faceToFace', icon: '🚶', color: '#AD1457' },
                { label: T('draft.digital'), key: 'digital', icon: '💻', color: '#1565C0' },
                { label: T('draft.relationship'), key: 'relationship', icon: '💛', color: '#6A1B9A' },
            ];
            const barsHtml = statBars.map(s => {
                const val = ch.traits[s.key];
                return `<div style="display:flex;align-items:center;gap:4px;margin:2px 0">
                    <span style="font-size:10px;min-width:14px">${s.icon}</span>
                    <span style="font-size:9px;color:var(--t3);min-width:24px">${s.label}</span>
                    <div style="flex:1;height:6px;background:var(--bg);border-radius:3px;overflow:hidden">
                        <div style="width:${val * 20}%;height:100%;background:${s.color};border-radius:3px"></div>
                    </div>
                    <span style="font-size:10px;font-weight:700;min-width:14px;text-align:right">${val}</span>
                </div>`;
            }).join('');

            return `<div class="draft-card" id="draft-${ch.id}" onclick="Game.toggleDraft('${ch.id}')" style="border-top:3px solid ${ch.cardColor}">
                <div class="dc-header">
                    <div class="dc-avatar">${ch.avatar}</div>
                    <div class="dc-overall" style="background:${ch.cardColor}">${ch.overall}</div>
                </div>
                <div class="dc-name">${D(ch,'name')}</div>
                <div class="dc-position" style="color:${ch.cardColor}">${D(ch,'position')}</div>
                <div class="dc-salary">💰 $${ch.salary}/${T('common.month')}</div>
                <div class="dc-bars">${barsHtml}</div>
                <div class="dc-desc">${D(ch,'desc')}</div>
                <div class="dc-sw">
                    <div class="dc-str">💪 ${D(ch,'strength')}</div>
                    <div class="dc-wk">⚠️ ${D(ch,'weakness')}</div>
                </div>
                <div class="dc-passive">⭐ ${D(ch,'passive')}</div>
            </div>`;
        }).join('');
        document.getElementById('draft-cards').innerHTML = html;
        this.updateDraftUI();
    },

    toggleDraft(id) {
        const idx = this._draftPicks.indexOf(id);
        if (idx >= 0) {
            this._draftPicks.splice(idx, 1);
        } else if (this._draftPicks.length < 5) {
            this._draftPicks.push(id);
        } else {
            return; // max 3
        }
        this.updateDraftUI();
    },

    updateDraftUI() {
        // Update card selection styling
        const pool = this._draftPool || ALL_SALES_CHARACTERS;
        pool.forEach(ch => {
            const el = document.getElementById(`draft-${ch.id}`);
            if (!el) return;
            const picked = this._draftPicks.includes(ch.id);
            el.classList.toggle('picked', picked);
            el.classList.toggle('disabled', !picked && this._draftPicks.length >= 5);
        });
        // Update selected preview
        const selHtml = this._draftPicks.map(id => {
            const ch = ALL_SALES_CHARACTERS.find(c => c.id === id);
            return `<div class="draft-pick-mini"><span>${ch.avatar}</span><span>${D(ch,'name')}</span><span style="color:${ch.cardColor};font-size:10px">${D(ch,'position')}</span></div>`;
        }).join('');
        const remaining = 5 - this._draftPicks.length;
        document.getElementById('draft-selected').innerHTML = selHtml + (remaining > 0 ? `<div class="draft-pick-empty">${remaining}${T('draft.moreNeeded')}</div>` : '');
        // Enable/disable launch button
        const btn = document.getElementById('btn-draft-go');
        btn.disabled = this._draftPicks.length !== 5;
        btn.textContent = this._draftPicks.length === 5 ? T('draft.go') : `${T('draft.select5')} (${this._draftPicks.length}/5)`;
    },

    // ==================== LAUNCH ====================
    launch() {
        const r = this._route;
        const co = document.getElementById('inp-company').value.trim();
        const ceo = document.getElementById('inp-ceo').value.trim() || (CURRENT_LANG === 'ja' ? '山田船長' : '김선장');
        const vessel = document.getElementById('inp-vessel').value.trim() || 'KMTC BUSAN';

        // Company name is required (used for ranking)
        if (!co) {
            this.toast(T('save.companyRequired'), 'err');
            document.getElementById('inp-company').focus();
            document.getElementById('inp-company').style.border = '2px solid var(--red)';
            return;
        }

        // Containers: distribute across all ports (foreign ports get some initial stock)
        const ctr = {};
        const perPort20 = Math.floor(40 / r.ports.length);
        const perPort40 = Math.floor(40 / r.ports.length);
        r.ports.forEach(p => { ctr[p] = { '20': perPort20, '40': perPort40 }; });
        // Home port gets extra
        ctr[r.ports[0]]['20'] += 20;
        ctr[r.ports[0]]['40'] += 20;

        // Deep copy customers
        const custs = {};
        r.ports.forEach(p => {
            if (CUSTOMERS[p]) custs[p] = CUSTOMERS[p].map(c => ({ ...c }));
        });

        // Sales team from draft picks (or fallback to first 5)
        const picks = this._draftPicks.length === 5 ? this._draftPicks : ALL_SALES_CHARACTERS.slice(0, 5).map(c => c.id);
        const salesTeam = picks.map(id => {
            const ch = ALL_SALES_CHARACTERS.find(c => c.id === id);
            return { ...ch, activity: null, actTarget: null, actTargetPort: null, actProgress: 0, actDaysLeft: 0,
                plan: { strategy: 'lowest-share', actPreset: 'balanced', focusPort: null } };
        });
        // Draft pool unpicked → cheap bench, others → scout pool with unlock requirements
        const draftPool = this._draftPool || ALL_SALES_CHARACTERS.slice(0, 9);
        const draftUnpicked = draftPool.filter(c => !picks.includes(c.id)).map(c => ({
            ...c, recruitCost: Math.round(c.salary * 3), unlockRev: 0,
        }));
        // Characters not in draft at all → scout pool (higher cost, revenue unlock)
        const draftIds = draftPool.map(c => c.id);
        const scoutPool = ALL_SALES_CHARACTERS.filter(c => !picks.includes(c.id) && !draftIds.includes(c.id)).map(c => ({
            ...c, recruitCost: c.recruitCost || Math.round(c.salary * 5), unlockRev: c.unlockRev || Math.round(c.salary * 200),
        }));
        // Include RECRUIT_POOL (advanced characters with recruitCost & unlockRev)
        const advancedPool = (typeof RECRUIT_POOL !== 'undefined' ? RECRUIT_POOL : []).map(c => ({ ...c }));
        const unpicked = [...draftUnpicked, ...scoutPool, ...advancedPool];

        // Generate unique company ID (visible name + hidden hash for dedup)
        const coId = co + '#' + Date.now().toString(36).slice(-4);

        this.state = {
            co, coId, ceo, vessel, route: r,
            cash: Math.round(r.investmentCost * 0.7),
            debt: Math.round(r.investmentCost * 0.3),
            gameDay: 1, gameHour: 0, speed: 1, startedAt: Date.now(),
            ship: { capacity: r.vesselSize, condition: 100, fuel: 100 },
            captain: { ...STARTING_CAPTAIN },
            ctr, custs, salesTeam,
            bookings: [], // current voyage bookings
            voyage: { num: 0, status: 'port', daysSinceLast: 0, legIdx: 0 },
            infra: { training: 0, it: 0, offices: {}, shipLevel: 0 },
            competitor: { name: COMPETITOR_NAMES[Math.floor(Math.random() * COMPETITOR_NAMES.length)], aggression: 0.1 },
            activityLog: [], // { day, salesperson, customer, activity, success, revenue }
            promos: [], // active promotions
            prospectPool: this.initProspectPool(r),
            spotOffers: [],
            bsaContracts: [],
            slotCharters: [],
            slotSalesPorts: {},
            ownedRoutes: [],
            benchPool: unpicked, // draft에서 선택하지 않은 캐릭터
            stats: { totRev: 0, totExp: 0, totVoy: 0, totTEU: 0, totBookings: 0, lastProfit: 0, lastLoadFactor: 0, history: [] },
            milestones: [],
            alerts: [],
            market: this.initMarket(r),
            lastActiveTime: Date.now(),
        };

        this.startGame();
    },

    startGame() {
        const s = this.state;
        s.voyage.num = 1;
        this.initSalesPlans();
        // Show screen FIRST so DOM elements exist
        this.showScreen('screen-game');
        document.getElementById('hud-co').textContent = s.co;
        const vn = document.getElementById('vessel-name');
        if (vn) vn.textContent = s.vessel;
        const pl = document.getElementById('port-label');
        if (pl) pl.textContent = `${this.getPortName(s.route.ports[0])}${T('common.port')}`;
        this.updateAll();
        this.updateTicker();
        this.renderTrendBoard();
        this.startTick();
        this.addFeed(T('save.launched'), 'alert');
    },

    // ==================== GAME TICK ====================
    startTick() {
        this.stopTick();
        this.tickTimer = setInterval(() => this.tick(), this.tickMs);
    },
    stopTick() {
        if (this.tickTimer) { clearInterval(this.tickTimer); this.tickTimer = null; }
    },

    setSpeed(spd) {
        this.state.speed = spd;
        this.stopTick();
        this.tickMs = Math.round(1000 / spd);
        this.startTick();
        document.querySelectorAll('.spd').forEach(b => b.classList.remove('active'));
        document.querySelectorAll('.spd')[{ 1:0, 2:1, 4:2, 8:3 }[spd]].classList.add('active');
    },

    tick() {
        const s = this.state;

        // Advance time: each tick = 1 game-hour (always, even during sailing)
        s.gameHour++;
        if (s.gameHour >= 24) {
            s.gameHour = 0;
            s.gameDay++;
            if (s.voyage.status !== 'sailing') s.voyage.daysSinceLast++;
            this.dailyUpdate();
        }

        // Sales tick: always runs (salespeople work even during sailing)
        this.tickSales();

        // Sailing progress
        if (s.voyage.status === 'sailing') {
            this.tickSailing();
        }

        // Auto-depart check (port stay = rotation - sailing days)
        if (s.voyage.daysSinceLast >= this.getPortStayDays() && s.voyage.status === 'port') {
            this.autoDepart();
        }

        this.updateHUD();

        // Refresh port map view every game-hour when sub-routes are active (ships moving)
        if (s.voyage.status !== 'sailing' && s.gameHour % 6 === 0) {
            const hasSubRoutes = ((s.slotCharters || []).some(sc => sc.active)) ||
                                 ((s.ownedRoutes || []).some(o => o.status === 'active'));
            if (hasSubRoutes) this.renderPortMapView();
        }
    },

    dailyUpdate() {
        const s = this.state;

        // Oil price spike check
        this.checkOilSpike();

        // Daily salaries
        const dailySalary = s.salesTeam.reduce((sum, st) => sum + st.salary / 30, 0) + s.captain.salary / 30;
        s.cash -= dailySalary;
        s.stats.totExp += dailySalary;

        // Stamina recovery (vitality-based) + vacation scheduler
        s.salesTeam.forEach(st => {
            if (st.isAI) { st.stamina = 100; return; } // AI always full
            const vit = st.traits?.vitality || 3;
            st.stamina = Math.min(100, st.stamina + 5 + vit * 2); // vit1→7, vit3→11, vit5→15
        });
        this.scheduleVacations();

        // Auto-balance containers: foreign ports get minimum containers from "virtual pool"
        // This simulates containers arriving from other services/feeder vessels
        r.ports.forEach(p => {
            if (p === r.ports[0]) return; // skip home port
            if (!s.ctr[p]) s.ctr[p] = { '20': 0, '40': 0 };
            const total = s.ctr[p]['20'] + s.ctr[p]['40'];
            if (total < 5) {
                // Drip-feed: add 1-2 containers per day if below minimum
                const add20 = Math.random() < 0.6 ? 1 : 0;
                const add40 = Math.random() < 0.4 ? 1 : 0;
                s.ctr[p]['20'] += add20;
                s.ctr[p]['40'] += add40;
            }
        });

        // Tick down customer boosts
        for (const port in s.custs) {
            s.custs[port].forEach(c => {
                if (!c.boosts) return;
                c.boosts.forEach(b => { if (b.daysLeft > 0) b.daysLeft--; });
                c.boosts = c.boosts.filter(b => b.daysLeft > 0);
            });
        }

        // Tick down promotions
        if (s.promos) {
            s.promos.forEach(p => { if (p.daysLeft > 0) p.daysLeft--; });
            s.promos = s.promos.filter(p => p.daysLeft > 0);
        }

        // Tick down active BSA contracts
        if (s.bsaContracts) {
            s.bsaContracts.forEach(c => { c.voyagesLeft = Math.max(0, c.voyagesLeft - (1 / s.route.rotationDays)); });
            s.bsaContracts = s.bsaContracts.filter(c => c.voyagesLeft > 0);
        }

        // Tick down spot cargo deadlines
        if (s.spotOffers) {
            s.spotOffers.forEach(o => { o.daysLeft--; });
            const expired = s.spotOffers.filter(o => o.daysLeft <= 0);
            expired.forEach(o => this.addFeed(T('spot.expired', o.name), 'alert'));
            s.spotOffers = s.spotOffers.filter(o => o.daysLeft > 0);
        }

        // Spot cargo chance (every 3-5 days, more frequent early game)
        const spotChance = s.gameDay < 30 ? 0.35 : 0.20;
        if (Math.random() < spotChance && (!s.spotOffers || s.spotOffers.length < 3) && s.voyage.status === 'port') {
            this.generateSpotOffer();
        }

        // BSA bidding chance (every 10-20 days)
        const bsaChance = s.gameDay < 30 ? 0.08 : 0.05;
        if (Math.random() < bsaChance && s.voyage.status === 'port') {
            this.generateBsaBidding();
        }

        // Competitor activity (may steal share)
        this.competitorAction();

        // Market share erosion from NPC carriers
        this.marketErosion();

        // Update last active time
        s.lastActiveTime = Date.now();

        // Process slot charters
        this.processSlotCharters();

        // Process owned routes
        this.processOwnedRoutes();

        // Check container alerts
        this.checkContainerAlerts();

        // Insurance premium (monthly — deducted every 30 days)
        if (s.gameDay % 30 === 0) {
            this.chargeInsurance();
        }

        // Ship accident check — safety score & ship condition affect probability
        if (typeof SHIP_ACCIDENTS !== 'undefined') {
            if (!s.lastAccidentDay) s.lastAccidentDay = 0;
            if (s.safetyScore === undefined) s.safetyScore = 50;
            const daysSinceAccident = s.gameDay - s.lastAccidentDay;
            if (daysSinceAccident >= 5) {
                // Base probability: 0% at day 5, ~2% at day 30, ~5% at day 65
                let accidentProb = Math.min(0.05, (daysSinceAccident - 5) * 0.001);

                // Safety score modifier: high safety = much lower risk, low safety = higher risk
                // score 100 → ×0.3 (70% reduction), score 50 → ×1.0, score 0 → ×2.0
                const safetyMult = 2.0 - (s.safetyScore / 50) * 1.7;  // range: 0.3 ~ 2.0
                accidentProb *= Math.max(0.3, Math.min(2.0, safetyMult));

                // Ship condition modifier: well-maintained = safer, damaged = riskier
                // condition 100 → ×0.7, condition 50 → ×1.3, condition 20 → ×1.8
                const condMult = 1.5 - (s.ship.condition / 100) * 0.8;  // range: 0.7 ~ 1.5
                accidentProb *= condMult;

                // Hard cap
                accidentProb = Math.min(0.08, accidentProb);

                if (Math.random() < accidentProb) {
                    this.triggerShipAccident();
                }
            }
            // Passive safety recovery: +1 every 10 days of no accidents (good behavior over time)
            if (daysSinceAccident > 0 && daysSinceAccident % 10 === 0) {
                s.safetyScore = Math.min(100, s.safetyScore + 1);
            }
        }

        // Check milestones
        this.checkMilestones();

        // Auto-save daily
        this.saveGame();
    },

    // Vacation system: auto-schedule annual leave
    scheduleVacations() {
        const s = this.state;
        if (!s.salesTeam || s.salesTeam.length === 0) return;

        // Init vacation tracking per game-year
        const gameYear = Math.floor((s.gameDay - 1) / 365);
        if (s._lastVacYear === undefined) s._lastVacYear = -1;
        if (gameYear > s._lastVacYear) {
            // New year: reset vacation days
            s._lastVacYear = gameYear;
            s.salesTeam.forEach(st => {
                if (st.isAI) return; // AI: no vacation
                const vit = st.traits?.vitality || 3;
                st.vacDaysTotal = vit >= 5 ? 10 : (vit >= 4 ? 12 : 18); // high vitality = fewer days needed
                st.vacDaysUsed = 0;
            });
        }

        // Check if anyone needs vacation (random scheduling)
        // Only schedule if no one is currently on vacation (no overlap)
        const onVacation = s.salesTeam.some(st => st.activity === 'vacation');
        if (onVacation) return;

        // Find someone who hasn't used all vacation days
        const eligible = s.salesTeam.filter(st =>
            !st.isAI &&
            st.activity !== 'vacation' &&
            (st.vacDaysUsed || 0) < (st.vacDaysTotal || 18) &&
            st.stamina < 80 // prefer tired employees
        );
        if (eligible.length === 0) return;

        // Random chance to schedule (roughly spreads across the year)
        const daysInYear = 365;
        const avgVacDays = 15;
        const teamSize = s.salesTeam.filter(st => !st.isAI).length;
        const dailyChance = (avgVacDays * teamSize) / (daysInYear * teamSize) * 1.5; // ~6% per day
        if (Math.random() > dailyChance) return;

        // Pick the most tired eligible person
        eligible.sort((a, b) => a.stamina - b.stamina);
        const st = eligible[0];
        const remaining = (st.vacDaysTotal || 18) - (st.vacDaysUsed || 0);
        const days = Math.min(Math.ceil(Math.random() * 4) + 1, 5, remaining); // 1-5 days, max 5

        st.activity = 'vacation';
        st.actTarget = null;
        st.actTargetPort = null;
        st.actProgress = 0;
        st.actDaysLeft = days;
        st.vacDaysUsed = (st.vacDaysUsed || 0) + days;
        this.addFeed(`🏖️ ${st.name} ${T('feed.vacationStart', days)}`, 'activity');
    },

    // ==================== SALES ENGINE (Plan-based auto-execution) ====================
    // Players set strategy & activity plans; salespeople auto-execute during 8h workday

    initProspectPool(r) {
        const pool = {};
        r.ports.forEach(p => {
            pool[p] = (PROSPECT_POOL[p] || []).map(c => ({ ...c }));
        });
        return pool;
    },

    initMarket(r) {
        // Initialize market share per trade lane
        // Player starts with 0%, 기타 선사 gets the rest
        const market = {};
        if (typeof MARKET_VOLUME !== 'undefined') {
            for (const lane in MARKET_VOLUME) {
                const [from, to] = lane.split('-');
                if (r.ports.includes(from) || r.ports.includes(to)) {
                    market[lane] = { totalVolume: MARKET_VOLUME[lane], shares: { player: 0, OT: 100 } };
                }
            }
        }
        return market;
    },

    // Build carrier list from Firebase rankings (cached)
    _marketCarriers: null,
    _marketCarriersTime: 0,

    getMarketCarriers() {
        // Use cached rankings to build carrier list
        const s = this.state;
        const now = Date.now();
        if (this._marketCarriers && now - this._marketCarriersTime < 60000) return this._marketCarriers;

        const carriers = [];
        const rankings = this._cachedRankings || [];
        rankings.forEach((r, i) => {
            if (r.co === s.co) return; // skip self
            carriers.push({
                id: 'R_' + r.co.replace(/[^a-zA-Z0-9가-힣]/g, '_'),
                name: r.co,
                color: CARRIER_COLORS[i % CARRIER_COLORS.length],
                rev: r.totRev || 0,
            });
        });
        // Always end with 기타 선사
        carriers.push(OTHER_CARRIER);
        this._marketCarriers = carriers;
        this._marketCarriersTime = now;
        return carriers;
    },

    // Sync market shares: distribute OT share among ranking users
    syncMarketWithRankings() {
        const s = this.state;
        if (!s.market) return;
        const carriers = this.getMarketCarriers();
        const rankCarriers = carriers.filter(c => c.id !== 'OT');
        if (rankCarriers.length === 0) return;

        for (const lane in s.market) {
            const m = s.market[lane];
            // Calculate total revenue of ranking users for weight distribution
            const totalRev = rankCarriers.reduce((sum, c) => sum + (c.rev || 1), 0);

            // Check if ranking users already have shares
            const hasRankShares = rankCarriers.some(c => (m.shares[c.id] || 0) > 0);
            if (hasRankShares) continue; // already distributed

            // Take from OT and distribute to ranking users
            const otShare = m.shares.OT || 0;
            const distributable = Math.round(otShare * 0.7); // keep 30% for 기타
            if (distributable <= 0) continue;

            let distributed = 0;
            rankCarriers.forEach(c => {
                const weight = (c.rev || 1) / totalRev;
                const share = Math.max(1, Math.round(distributable * weight));
                m.shares[c.id] = share;
                distributed += share;
            });
            m.shares.OT = Math.max(0, otShare - distributed);
        }
    },

    // Get player's market share % for a trade lane
    getPlayerMarketShare(lane) {
        const m = this.state.market?.[lane];
        if (!m) return 0;
        return m.shares?.player || 0;
    },

    // Transfer market share from one carrier to player
    transferMarketShare(lane, fromCarrierId, amount) {
        const m = this.state.market?.[lane];
        if (!m || !m.shares) return 0;
        const available = m.shares[fromCarrierId] || 0;
        const actual = Math.min(amount, available);
        if (actual <= 0) return 0;
        m.shares[fromCarrierId] -= actual;
        m.shares.player = (m.shares.player || 0) + actual;
        return actual;
    },

    // Other carriers erode player share (called daily)
    marketErosion() {
        const s = this.state;
        if (!s.market) return;

        const hoursSinceActive = (Date.now() - (s.lastActiveTime || Date.now())) / 3600000;
        const inactivityMult = hoursSinceActive > 24 ? 1.5 : (hoursSinceActive > 12 ? 1.2 : 1.0);

        const carriers = this.getMarketCarriers();

        for (const lane in s.market) {
            const m = s.market[lane];
            if (!m.shares || m.shares.player <= 0) continue;

            // Each carrier has a chance to steal from player
            carriers.forEach(c => {
                const share = m.shares[c.id] || 0;
                const stealChance = Math.min(0.15, (share / 100) * 0.1) * inactivityMult;
                if (Math.random() < stealChance) {
                    const steal = Math.round(0.5 + Math.random() * 1.5);
                    const actual = Math.min(steal, m.shares.player);
                    if (actual > 0) {
                        m.shares.player -= actual;
                        m.shares[c.id] = (m.shares[c.id] || 0) + actual;
                    }
                }
            });
        }

        if (hoursSinceActive > 48 && s.gameDay % 7 === 0) {
            this.addFeed(T('market.neglectWarn'), 'alert');
        }
    },

    // Expand market to new lanes when new routes are activated
    expandMarket(pkg) {
        const s = this.state;
        if (!s.market) s.market = {};
        for (const lane in MARKET_VOLUME) {
            if (s.market[lane]) continue;
            const [from, to] = lane.split('-');
            if (pkg.ports.includes(from) || pkg.ports.includes(to)) {
                s.market[lane] = { totalVolume: MARKET_VOLUME[lane], shares: { player: 0, OT: 100 } };
            }
        }
    },

    initSalesPlans() {
        this.state.salesTeam.forEach(st => {
            if (!st.plan) {
                st.plan = { strategy: 'lowest-share', actPreset: 'balanced', focusPort: null };
            }
        });
        if (!this.state.globalStrategy) {
            this.state.globalStrategy = { strategy: 'lowest-share', actPreset: 'balanced', focusPort: null };
        }
    },

    // Open plan config for a salesperson (or global)
    openPlanConfig(stId) {
        const s = this.state;
        const isGlobal = stId === 'global';
        const st = isGlobal ? null : s.salesTeam.find(t => t.id === stId);
        const plan = isGlobal ? s.globalStrategy : st.plan;
        const title = isGlobal ? T('sales.globalStrategy') : `📋 ${st.avatar} ${st.name} ${T('sales.planFor')}`;

        let html = '';

        // Salesperson info (if individual)
        if (st) {
            const t = st.traits || {};
            html += `<div style="background:var(--card2);border-radius:8px;padding:10px;margin-bottom:12px;font-size:11px">
                <div style="font-size:13px;font-weight:600;margin-bottom:6px">${st.avatar} ${st.name} <span style="color:var(--t3)">⭐${st.skill}</span></div>
                <div style="color:var(--t2);margin-bottom:6px">${st.desc || ''}</div>
                <div style="display:flex;gap:8px;flex-wrap:wrap">
                    <span>🤝 ${T('draft.negotiation')} ${'■'.repeat(t.negotiation||1)}${'□'.repeat(5-(t.negotiation||1))}</span>
                    <span>🚶 ${T('draft.faceToFace')} ${'■'.repeat(t.faceToFace||1)}${'□'.repeat(5-(t.faceToFace||1))}</span>
                    <span>💻 ${T('draft.digital')} ${'■'.repeat(t.digital||1)}${'□'.repeat(5-(t.digital||1))}</span>
                    <span>💛 ${T('draft.relationship')} ${'■'.repeat(t.relationship||1)}${'□'.repeat(5-(t.relationship||1))}</span>
                </div>
            </div>`;
        }

        // Strategy selection
        html += '<div style="margin-bottom:12px"><div style="font-size:11px;color:var(--t2);margin-bottom:4px">' + T('sales.targetStrategy') + '</div>';
        const _stratMap = {'lowest-share':'strategy.lowestShare','largest-first':'strategy.largestFirst','easiest-first':'strategy.easiestFirst','cheap-cargo':'strategy.cheapCargo','port-focus':'strategy.portFocus','steal-cargo':'strategy.stealCargo'};
        SALES_STRATEGIES.forEach(strat => {
            const selected = plan.strategy === strat.id;
            const stratName = _stratMap[strat.id] ? T(_stratMap[strat.id]) : strat.name;
            html += `<div class="assign-cust ${selected ? 'selected' : ''}" onclick="Game.setPlan('${stId}','strategy','${strat.id}')">
                <span>${strat.icon} ${stratName}</span>
                <span style="font-size:10px;color:var(--t3)">${D(strat,'desc')}</span>
            </div>`;
        });
        html += '</div>';

        // Port focus (if port-focus strategy)
        if (plan.strategy === 'port-focus') {
            html += '<div style="margin-bottom:12px"><div style="font-size:11px;color:var(--t2);margin-bottom:4px">' + T('sales.focusPort') + '</div>';
            // Main route ports
            s.route.ports.forEach(p => {
                const selected = plan.focusPort === p;
                html += `<div class="assign-cust ${selected ? 'selected' : ''}" onclick="Game.setPlan('${stId}','focusPort','${p}')">
                    <span>${this.getPortName(p)}</span></div>`;
            });
            // Slot charter ports
            (s.slotCharters || []).filter(sc => sc.active).forEach(sc => {
                const scDef = SLOT_CHARTERS.find(d => d.id === sc.id);
                if (!scDef) return;
                scDef.ports.filter(p => !s.route.ports.includes(p)).forEach(p => {
                    const selected = plan.focusPort === p;
                    html += `<div class="assign-cust ${selected ? 'selected' : ''}" onclick="Game.setPlan('${stId}','focusPort','${p}')" style="border-left:3px solid ${scDef.color || 'var(--accent2)'}">
                        <span>${this._pn(scDef, p)} <span style="font-size:9px;color:var(--accent2)">${T('legend.slot')}</span></span></div>`;
                });
            });
            html += '</div>';
        }

        // Target carrier (if steal-cargo strategy)
        if (plan.strategy === 'steal-cargo') {
            html += '<div style="margin-bottom:12px"><div style="font-size:11px;color:var(--t2);margin-bottom:4px">' + T('sales.targetCarrier') + '</div>';
            const carriers = this.getMarketCarriers();
            carriers.forEach(c => {
                const selected = plan.targetCarrier === c.id;
                let totalShare = 0, laneCount = 0;
                for (const lane in s.market) {
                    if (s.market[lane].shares[c.id]) { totalShare += s.market[lane].shares[c.id]; laneCount++; }
                }
                const avgShare = laneCount > 0 ? Math.round(totalShare / laneCount) : 0;
                if (avgShare <= 0 && c.id === 'OT') return; // skip empty 기타
                html += `<div class="assign-cust ${selected ? 'selected' : ''}" onclick="Game.setPlan('${stId}','targetCarrier','${c.id}')" style="border-left:3px solid ${c.color}">
                    <span>${D(c,'name')} <span style="font-size:10px;color:var(--t3)">${T('cust.share')} ~${avgShare}%</span></span>
                </div>`;
            });
            html += '</div>';
        }

        // Activity preset
        html += '<div style="margin-bottom:12px"><div style="font-size:11px;color:var(--t2);margin-bottom:4px">' + T('sales.activityDist') + '</div>';
        const _presetMap = {'balanced':'preset.balanced','email-phone':'preset.emailPhone','visit-main':'preset.visitMain','entertain-main':'preset.entertainMain','pioneer':'preset.pioneer'};
        ACTIVITY_PRESETS.forEach(pre => {
            const selected = plan.actPreset === pre.id;
            const mixDesc = Object.entries(pre.mix).map(([k, v]) => {
                const act = SALES_ACTIVITIES.find(a => a.id === k);
                return `${act?.icon||''} ${Math.round(v*100)}%`;
            }).join(' ');
            const preName = _presetMap[pre.id] ? T(_presetMap[pre.id]) : pre.name;
            html += `<div class="assign-cust ${selected ? 'selected' : ''}" onclick="Game.setPlan('${stId}','actPreset','${pre.id}')">
                <span>${pre.icon} ${preName}</span>
                <span style="font-size:10px;color:var(--t3)">${mixDesc}</span>
            </div>`;
        });
        html += '</div>';

        // Apply to all button (if individual)
        if (!isGlobal) {
            html += `<button class="btn-sm" onclick="Game.applyGlobalPlan('${stId}')" style="width:100%;margin-bottom:6px">${T('sales.applyGlobal')}</button>`;
        }

        document.getElementById('assign-title').textContent = title;
        document.getElementById('assign-body').innerHTML = html;
        this.openModal('modal-assign');
    },

    setPlan(stId, key, value) {
        const s = this.state;
        if (stId === 'global') {
            s.globalStrategy[key] = value;
            // Apply to all salespeople without individual overrides
            s.salesTeam.forEach(st => { st.plan[key] = value; });
        } else {
            const st = s.salesTeam.find(t => t.id === stId);
            if (st) st.plan[key] = value;
        }
        // Refresh modal
        this.openPlanConfig(stId);
    },

    savePlanAndClose() {
        this.closeModal('modal-assign');
        this.toast(T('sales.strategySaved'), 'ok');
        this.renderSalesTeam();
    },

    applyGlobalPlan(stId) {
        const s = this.state;
        const st = s.salesTeam.find(t => t.id === stId);
        if (st) st.plan = { ...s.globalStrategy };
        this.openPlanConfig(stId);
        this.toast(T('sales.globalApplied'), 'ok');
    },

    assignPortFocus(portCode, salesId) {
        const s = this.state;
        const st = s.salesTeam.find(t => t.id === salesId);
        if (!st) return;
        st.plan.strategy = 'port-focus';
        st.plan.focusPort = portCode;
        st.plan.actPreset = 'digital'; // digital-first for quick results
        const portName = this.getPortName(portCode);
        this.toast(T('feed.portFocusToast', st.avatar, st.name, portName), 'ok');
        this.addFeed(T('feed.portFocusFeed', st.name, portName), 'alert');
        this.renderSalesTeam();
    },

    calcSuccessRate(st, cust, act, port) {
        const s = this.state;
        const sysLv = s.infra.systems || s.infra.it || 0;
        const ptLv = st.personalTraining || 0;
        let rate = act.successBase + st.skill * 0.07 + s.infra.training * 0.06 + ptLv * 0.06;
        // Trait bonus
        const traitKey = TRAIT_ACTIVITY_MAP[act.id];
        if (traitKey && st.traits) rate += (st.traits[traitKey] || 0) * 0.05;
        if (sysLv >= 1 && act.id === 'email') rate *= 1.8;
        if (sysLv >= 3) rate += 0.05; // 운임 분석 시스템
        if (sysLv >= 5) rate += 0.05; // 자동 부킹 플랫폼
        if (sysLv >= 7) rate += 0.10; // 글로벌 디지털 전환
        if (s.infra.offices[port]) rate *= 1.3;
        // Difficulty penalty: gradual scaling instead of harsh cliff
        const diffGap = cust.difficulty - (st.skill + s.infra.training + ptLv * 0.5);
        if (diffGap > 2) rate *= 0.4;
        else if (diffGap > 1) rate *= 0.6;
        else if (diffGap > 0) rate *= 0.8;
        // Loyalty bonus: repeat customers are easier
        rate += cust.loyalty * (sysLv >= 4 ? 0.003 : 0.002); // tracking system boosts loyalty effect
        // Promo boost
        rate += this.getActivePromoBoost();
        // Customer booster success boost
        if (cust.boosts) {
            cust.boosts.forEach(b => { if (b.daysLeft > 0 && b.successBoost) rate += b.successBoost; });
        }
        // Shipper-salesperson compatibility (personality match)
        if (cust && st.traits) {
            // Size-based: VIP Handler loves large, Pioneer loves small
            if (cust.size === 'large' && st.traits.negotiation >= 4) rate += 0.05;
            if (cust.size === 'small' && st.traits.faceToFace >= 3) rate += 0.05;
            // Difficulty match: high-skill salespeople handle tough clients better
            if (cust.difficulty >= 4 && st.skill >= 4) rate += 0.08;
            if (cust.difficulty >= 4 && st.skill <= 2) rate -= 0.10;
            // Digital affinity: some customers prefer digital communication
            if (act.id === 'email' && cust.difficulty <= 2 && st.traits.digital >= 3) rate += 0.06;
            // Relationship affinity: loyal customers respond better to relationship-focused salespeople
            if (cust.loyalty >= 50 && st.traits.relationship >= 4) rate += 0.06;
        }
        return Math.min(0.95, Math.max(0.05, rate));
    },

    // Get all sales ports (main route + slot charters)
    getAllSalesPorts() {
        const s = this.state, r = s.route;
        const merged = { ...r.salesPorts };
        if (s.slotSalesPorts) {
            for (const port in s.slotSalesPorts) {
                if (merged[port]) {
                    // Merge sellTo arrays without duplicates
                    const existing = new Set(merged[port].sellTo);
                    s.slotSalesPorts[port].sellTo.forEach(t => existing.add(t));
                    merged[port] = { sellTo: [...existing] };
                } else {
                    merged[port] = { ...s.slotSalesPorts[port] };
                }
            }
        }
        return merged;
    },

    // Get port name (main route + slot charters)
    getPortName(port) {
        const s = this.state, r = s.route;
        const useJa = CURRENT_LANG === 'ja';
        // Check main route
        if (useJa && r.portNamesJa && r.portNamesJa[port]) return r.portNamesJa[port];
        if (r.portNames[port]) return r.portNames[port];
        // Check slot charters
        if (s.slotCharters) {
            for (const charter of s.slotCharters) {
                const sc = SLOT_CHARTERS.find(x => x.id === charter.id);
                if (!sc) continue;
                if (useJa && sc.portNamesJa && sc.portNamesJa[port]) return sc.portNamesJa[port];
                if (sc.portNames[port]) return sc.portNames[port];
            }
        }
        // Check owned routes
        if (s.ownedRoutes) {
            for (const or of s.ownedRoutes) {
                const pkg = NEW_ROUTE_PACKAGES.find(x => x.id === or.id);
                if (!pkg) continue;
                if (useJa && pkg.portNamesJa && pkg.portNamesJa[port]) return pkg.portNamesJa[port];
                if (pkg.portNames[port]) return pkg.portNames[port];
            }
        }
        return port;
    },

    // Get port name from a specific data object (for items not yet in state)
    _pn(obj, port) {
        return (CURRENT_LANG === 'ja' && obj.portNamesJa && obj.portNamesJa[port]) ? obj.portNamesJa[port] : (obj.portNames[port] || port);
    },

    // Pick next customer based on strategy
    pickCustomerByStrategy(st) {
        const s = this.state, r = s.route;
        const plan = st.plan || s.globalStrategy;
        const allSalesPorts = this.getAllSalesPorts();
        const allCusts = [];
        for (const port in s.custs) {
            if (!allSalesPorts[port]) continue;
            const canAccess = true;
            s.custs[port].forEach(c => {
                const accessible = c.difficulty <= (s.infra.training + 1 + ((s.infra.systems || s.infra.it || 0) >= 2 ? 1 : 0));
                if (!accessible) return;
                if (plan.strategy === 'port-focus' && plan.focusPort && port !== plan.focusPort) return;
                allCusts.push({ cust: c, port });
            });
        }
        if (allCusts.length === 0) return null;

        // Sort by strategy
        if (plan.strategy === 'lowest-share') {
            allCusts.sort((a, b) => a.cust.share - b.cust.share);
        } else if (plan.strategy === 'largest-first') {
            const sizeVal = { large: 0, medium: 1, small: 2 };
            allCusts.sort((a, b) => (sizeVal[a.cust.size]||1) - (sizeVal[b.cust.size]||1));
        } else if (plan.strategy === 'easy-first') {
            allCusts.sort((a, b) => a.cust.difficulty - b.cust.difficulty);
        } else if (plan.strategy === 'cheap-cargo') {
            allCusts.sort((a, b) => a.cust.baseDiscount - b.cust.baseDiscount || a.cust.difficulty - b.cust.difficulty);
        } else if (plan.strategy === 'steal-cargo') {
            // Prioritize customers with high volume (large size) where we have low share
            // These are customers that the target carrier likely has
            const sizeVal = { large: 0, medium: 1, small: 2 };
            allCusts.sort((a, b) => {
                const aScore = (sizeVal[a.cust.size] || 1) - (100 - a.cust.share) / 100;
                const bScore = (sizeVal[b.cust.size] || 1) - (100 - b.cust.share) / 100;
                return aScore - bScore;
            });
        }

        // Priority: if this salesperson has assigned customers, target them first
        const assigned = allCusts.filter(ac => ac.cust.assignedSales === st.id);
        if (assigned.length > 0 && Math.random() < 0.7) {
            // 70% chance to work on assigned customer
            return assigned[Math.floor(Math.random() * assigned.length)];
        }

        // Pick from top 3 with some randomness
        const top = allCusts.slice(0, Math.min(3, allCusts.length));
        return top[Math.floor(Math.random() * top.length)];
    },

    // Pick activity based on preset and traits
    pickActivityByPlan(st) {
        // AI: only email/phone/negotiate/prospect (no visit/entertain)
        if (st.isAI) {
            const aiActs = SALES_ACTIVITIES.filter(a => !['visit','entertain'].includes(a.id));
            return aiActs.length > 0 ? aiActs[Math.floor(Math.random() * aiActs.length)] : SALES_ACTIVITIES[0];
        }
        const plan = st.plan || this.state.globalStrategy;
        const preset = ACTIVITY_PRESETS.find(p => p.id === plan.actPreset) || ACTIVITY_PRESETS[0];

        // Weighted random based on mix
        const rand = Math.random();
        let cumul = 0;
        for (const [actId, weight] of Object.entries(preset.mix)) {
            cumul += weight;
            if (rand <= cumul) {
                const act = SALES_ACTIVITIES.find(a => a.id === actId);
                if (act.id === 'entertain' && st.skill < 2) return SALES_ACTIVITIES[0]; // fallback to email
                return act;
            }
        }
        return SALES_ACTIVITIES[0];
    },

    tickSales() {
        const s = this.state;
        const hourFraction = 1 / 24;
        const isWorkHour = s.gameHour >= 9 && s.gameHour < 17;
        let needsUpdate = false;

        s.salesTeam.forEach(st => {
            const isAI = st.isAI || false;
            const vit = (st.traits?.vitality || 3);
            const canWork = isAI ? true : isWorkHour; // AI works 24h

            // On vacation
            if (st.activity === 'vacation') {
                st.stamina = Math.min(100, st.stamina + 3); // fast recovery on vacation
                st.actDaysLeft -= hourFraction;
                if (st.actDaysLeft <= 0) {
                    st.activity = null;
                    st.vacDaysUsed = (st.vacDaysUsed || 0);
                    this.addFeed(`${st.avatar} ${st.name} ${T('feed.vacationEnd')}`, 'activity');
                    needsUpdate = true;
                }
                return;
            }

            // Resting
            if (st.activity === 'rest') {
                const recoveryRate = 1.5 + vit * 0.3; // vitality 1→1.8, 3→2.4, 5→3.0
                st.stamina = Math.min(100, st.stamina + recoveryRate);
                st.actDaysLeft -= hourFraction;
                if (st.actDaysLeft <= 0) {
                    st.activity = null;
                    this.addFeed(T('feed.restComplete', st.avatar, st.name, Math.round(st.stamina)), 'activity');
                    needsUpdate = true;
                }
                return;
            }

            // Working on a task
            if (st.activity) {
                if (!canWork) return;
                // AI: block visit/entertain activities
                if (isAI && (st.activity === 'visit' || st.activity === 'entertain')) {
                    st.activity = null; st.actTarget = null;
                    return;
                }
                st.actDaysLeft -= hourFraction;
                const act = SALES_ACTIVITIES.find(a => a.id === st.activity);
                st.actProgress = Math.min(1, 1 - st.actDaysLeft / (act?.duration || 1));
                // Stamina drain: vitality 1→0.8, 3→0.5, 5→0.2. AI: no drain
                if (!isAI) {
                    const drain = Math.max(0.15, 0.8 - vit * 0.13);
                    st.stamina = Math.max(0, st.stamina - drain);
                }

                if (st.actDaysLeft <= 0) {
                    this.completeSalesActivity(st);
                    st.activity = null;
                    st.actTarget = null;
                    needsUpdate = true;
                }
                return;
            }

            // Idle: auto-assign next task
            const minStamina = isAI ? 0 : 10;
            if (canWork && st.stamina >= minStamina) {
                const act = this.pickActivityByPlan(st);
                if (!act) return;

                if (act.id === 'prospect') {
                    // Prospect: pick a random port to explore for new customers
                    const ports = s.route.ports.filter(p => (s.prospectPool[p] || []).length > 0);
                    if (ports.length === 0) {
                        // No prospects left, fall back to regular activity
                        const act2 = SALES_ACTIVITIES.find(a => a.id === 'visit') || SALES_ACTIVITIES[0];
                        const target = this.pickCustomerByStrategy(st);
                        if (!target) return;
                        st.activity = act2.id; st.actTarget = target.cust.id; st.actTargetPort = target.port;
                        st.actProgress = 0; st.actDaysLeft = act2.duration;
                        this.addFeed(T('feed.actStart', st.avatar, st.name, target.cust.icon, D(target.cust,'name'), D(act2,'name')), 'activity');
                    } else {
                        const port = ports[Math.floor(Math.random() * ports.length)];
                        st.activity = 'prospect';
                        st.actTarget = '__prospect__';
                        st.actTargetPort = port;
                        st.actProgress = 0;
                        st.actDaysLeft = act.duration;
                        this.addFeed(T('feed.prospectStart', st.avatar, st.name, this.getPortName(port)), 'activity');
                    }
                } else {
                    const target = this.pickCustomerByStrategy(st);
                    if (!target) return;
                    st.activity = act.id;
                    st.actTarget = target.cust.id;
                    st.actTargetPort = target.port;
                    st.actProgress = 0;
                    st.actDaysLeft = act.duration;
                    this.addFeed(T('feed.actStart', st.avatar, st.name, target.cust.icon, D(target.cust,'name'), D(act,'name')), 'activity');
                }
                needsUpdate = true;
            } else if (st.stamina < 10 && !st._lowStaminaWarned) {
                st._lowStaminaWarned = true;
                this.addFeed(T('feed.fatigued', st.name), 'alert');
            }

            // Night rest: recover stamina off-hours (vitality affects rate)
            if (!isWorkHour && !isAI) {
                const nightRecovery = 0.3 + vit * 0.15; // vit 1→0.45, 3→0.75, 5→1.05
                st.stamina = Math.min(100, st.stamina + nightRecovery);
                st._lowStaminaWarned = false;
            }
        });

        if (needsUpdate && document.getElementById('tab-sales').classList.contains('active') && !document.getElementById('modal-assign').classList.contains('active')) {
            this.renderSalesTeam();
        }
    },

    completeSalesActivity(st) {
        const s = this.state;
        const act = SALES_ACTIVITIES.find(a => a.id === st.activity);
        if (!act) return;

        // Prospect activity: discover new customer
        if (st.activity === 'prospect' && st.actTarget === '__prospect__') {
            this.completeProspect(st, act);
            return;
        }

        // Find customer
        let cust = null, custPort = st.actTargetPort;
        for (const port in s.custs) {
            const found = s.custs[port].find(c => c.id === st.actTarget);
            if (found) { cust = found; custPort = port; break; }
        }
        if (!cust) return;

        // Cost
        s.cash -= act.costPerAct;
        s.stats.totExp += act.costPerAct;

        // Experience
        st.exp += act.expGain;
        // Level up check
        const newSkill = Math.min(5, 1 + Math.floor(st.exp / 100));
        if (newSkill > st.skill) {
            st.skill = newSkill;
            this.addFeed(T('feed.skillUp', st.name, st.skill), 'alert');
            this.toast(T('feed.skillUpToast', st.name, st.skill), 'ok');
        }

        // Success check (uses trait-based calculation)
        let successRate = this.calcSuccessRate(st, cust, act, custPort);

        // Loyalty boost
        cust.loyalty = Math.min(100, cust.loyalty + act.expGain * 0.5);

        const success = Math.random() < successRate;

        // Log activity
        const custName = D(cust,'name');
        const actName = D(act,'name');
        s.activityLog.push({
            day: s.gameDay, spName: st.name, spAvatar: st.avatar,
            custName, custIcon: cust.icon, actName, actIcon: act.icon,
            success, port: custPort, cost: act.costPerAct, revenue: 0,
        });
        // Keep max 100 entries
        if (s.activityLog.length > 100) s.activityLog.shift();

        this.addFeed(`${st.avatar} ${st.name}: ${custName} ${actName} ${success ? T('feed.success') : T('feed.fail')}`, success ? 'booking' : 'activity');

        if (success) {
            // Generate booking!
            this.generateBooking(cust, custPort, st);
        }
    },

    completeProspect(st, act) {
        const s = this.state;
        const port = st.actTargetPort;
        const portName = this.getPortName(port);

        // Cost & exp
        s.cash -= act.costPerAct;
        s.stats.totExp += act.costPerAct;
        st.exp += act.expGain;
        const newSkill = Math.min(5, 1 + Math.floor(st.exp / 100));
        if (newSkill > st.skill) {
            st.skill = newSkill;
            this.addFeed(T('feed.skillUp', st.name, st.skill), 'alert');
            this.toast(T('feed.skillUpToast', st.name, st.skill), 'ok');
        }

        // Success check
        let successRate = act.successBase + st.skill * 0.07 + s.infra.training * 0.05;
        const traitKey = TRAIT_ACTIVITY_MAP[act.id];
        if (traitKey && st.traits) successRate += (st.traits[traitKey] || 0) * 0.05;
        if ((s.infra.systems || s.infra.it || 0) >= 2) successRate += 0.08; // CRM helps find prospects
        successRate = Math.min(0.65, Math.max(0.08, successRate));

        const pool = s.prospectPool[port] || [];
        const success = Math.random() < successRate && pool.length > 0;

        s.activityLog.push({
            day: s.gameDay, spName: st.name, spAvatar: st.avatar,
            custName: T('feed.prospectLog', portName), custIcon: '🔍', actName: D(act,'name'), actIcon: act.icon,
            success, port, cost: act.costPerAct, revenue: 0,
        });
        if (s.activityLog.length > 100) s.activityLog.shift();

        if (success) {
            // Pick random prospect from pool
            const idx = Math.floor(Math.random() * pool.length);
            const newCust = { ...pool[idx] };
            pool.splice(idx, 1);

            // Add to active customers
            if (!s.custs[port]) s.custs[port] = [];
            s.custs[port].push(newCust);

            this.addFeed(T('feed.prospectFound', st.avatar, st.name, portName, newCust.icon, D(newCust,'name')), 'booking');
            this.toast(T('feed.prospectToast', newCust.icon, D(newCust,'name')), 'ok');

            // Check remaining prospects
            const totalLeft = Object.values(s.prospectPool).reduce((sum, arr) => sum + arr.length, 0);
            if (totalLeft === 0) {
                this.addFeed(T('market.allProspects'), 'alert');
            }
        } else {
            this.addFeed(T('feed.prospectFail', st.avatar, st.name, portName), 'activity');
        }
    },

    generateBooking(cust, port, salesperson) {
        const s = this.state, r = s.route;
        const allSalesPorts = this.getAllSalesPorts();
        const sp = allSalesPorts[port];
        if (!sp || sp.sellTo.length === 0) return;

        // Pick destination based on customer's destPorts weights
        let dest;
        if (cust.destPorts) {
            const validDests = Object.entries(cust.destPorts).filter(([d]) => sp.sellTo.includes(d));
            if (validDests.length > 0) {
                const totalWeight = validDests.reduce((sum, [, w]) => sum + w, 0);
                let roll = Math.random() * totalWeight;
                for (const [d, w] of validDests) {
                    roll -= w;
                    if (roll <= 0) { dest = d; break; }
                }
                if (!dest) dest = validDests[0][0];
            } else {
                dest = sp.sellTo[Math.floor(Math.random() * sp.sellTo.length)];
            }
        } else {
            dest = sp.sellTo[Math.floor(Math.random() * sp.sellTo.length)];
        }
        const leg = `${port}-${dest}`;
        const rate = BASE_RATES[leg];
        if (!rate) return;

        // Volume based on share, destPort weight, and customer size
        const destWeight = cust.destPorts?.[dest] || (1 / sp.sellTo.length);
        const shareMultiplier = 0.4 + (cust.share / 100) * 0.6;

        // Market season affects volume demand
        const mkt = this.getMarketCondition(port);
        let vol20 = Math.max(0, Math.round((cust.maxVol20 * shareMultiplier * mkt.volMult) * (0.6 + Math.random() * 0.4)));
        let vol40 = Math.max(0, Math.round((cust.maxVol40 * shareMultiplier * mkt.volMult) * (0.6 + Math.random() * 0.4)));
        if (vol20 + vol40 === 0) {
            // Ensure at least 1 container when sales succeeds
            if (cust.maxVol20 > 0) vol20 = 1;
            else if (cust.maxVol40 > 0) vol40 = 1;
            else return;
        }

        // Check container availability
        const avail20 = Math.min(vol20, s.ctr[port]['20']);
        const avail40 = Math.min(vol40, s.ctr[port]['40']);
        if (avail20 + avail40 === 0) return;

        // Check ship capacity
        const currentTEU = this.getTEU();
        const newTEU = avail20 + avail40 * 2;
        if (currentTEU + newTEU > s.ship.capacity) return;

        // Discount based on customer relationship, rates adjusted by market season
        const discount = cust.baseDiscount * (1 - cust.loyalty / 200);
        const r20 = Math.round(rate['20'] * mkt.rateMult * (1 - discount));
        const r40 = Math.round(rate['40'] * mkt.rateMult * (1 - discount));
        const revenue = avail20 * r20 + avail40 * r40;

        // Book it
        s.bookings.push({
            custId: cust.id, custName: D(cust,'name'), custIcon: cust.icon,
            leg, port, q20: avail20, q40: avail40, r20, r40, revenue, delivered: false,
        });

        // Track per-salesperson TEU
        if (salesperson) {
            if (!salesperson.totalTEU) salesperson.totalTEU = 0;
            if (!salesperson.totalBookings) salesperson.totalBookings = 0;
            salesperson.totalTEU += avail20 + avail40 * 2;
            salesperson.totalBookings++;
        }

        s.ctr[port]['20'] -= avail20;
        s.ctr[port]['40'] -= avail40;
        s.stats.totBookings++;

        // Update last activity log with revenue
        const lastLog = s.activityLog[s.activityLog.length - 1];
        if (lastLog) lastLog.revenue = revenue;

        // Increase share (boosted by customer boosts) — faster growth early
        let shareGain = 4 + salesperson.skill * 1.5;
        if (cust.share < 30) shareGain *= 1.5; // early momentum bonus
        if (cust.boosts) {
            cust.boosts.forEach(b => { if (b.daysLeft > 0 && b.shareMultiplier) shareGain *= b.shareMultiplier; });
        }
        cust.share = Math.min(100, cust.share + shareGain);

        // Increase market share for this trade lane
        if (s.market && s.market[leg]) {
            // Steal from the weakest NPC carrier or targeted carrier
            const targetCarrier = salesperson.plan?.targetCarrier;
            let stealFrom = 'OT'; // default: steal from "기타 선사"
            if (targetCarrier && s.market[leg].shares[targetCarrier] > 0) {
                stealFrom = targetCarrier;
            } else {
                // Find NPC with most share
                let maxShare = 0;
                for (const [id, sh] of Object.entries(s.market[leg].shares)) {
                    if (id !== 'player' && sh > maxShare) { maxShare = sh; stealFrom = id; }
                }
            }
            const mGain = Math.round(0.3 + Math.random() * 0.7);
            this.transferMarketShare(leg, stealFrom, mGain);
        }

        const portNames = { ...r.portNames };
        const portNamesJa = { ...(r.portNamesJa || {}) };
        // Merge slot charter + owned route port names
        if (s.slotCharters) s.slotCharters.forEach(sc => { const d = SLOT_CHARTERS.find(x => x.id === sc.id); if (d) { Object.assign(portNames, d.portNames); if (d.portNamesJa) Object.assign(portNamesJa, d.portNamesJa); } });
        if (s.ownedRoutes) s.ownedRoutes.forEach(or => { const d = NEW_ROUTE_PACKAGES.find(x => x.id === or.id); if (d) { Object.assign(portNames, d.portNames); if (d.portNamesJa) Object.assign(portNamesJa, d.portNamesJa); } });

        const _bn = (p) => (CURRENT_LANG === 'ja' && portNamesJa[p]) ? portNamesJa[p] : (portNames[p] || p);
        this.addFeed(T('feed.booked', cust.icon, D(cust,'name'), _bn(port), _bn(dest), avail20 + avail40 * 2, revenue.toLocaleString()), 'booking');
        this.toast(T('feed.bookedToast', D(cust,'name'), avail20 + avail40 * 2), 'ok');

        this.updateBayGrid();
        this.updateDepartInfo();
    },

    // ==================== COMPETITOR ====================
    competitorAction() {
        const s = this.state;
        // Randomly reduce customer share
        for (const port in s.custs) {
            s.custs[port].forEach(c => {
                // Track peak share ever reached
                if (!c.peakShare) c.peakShare = c.share;
                if (c.share > c.peakShare) c.peakShare = c.share;
                if (!c.shareTrend) c.shareTrend = []; // recent share snapshots

                if (c.share > 0 && Math.random() < s.competitor.aggression) {
                    const loss = Math.round(1 + Math.random() * 3);
                    const prevShare = c.share;
                    c.share = Math.max(0, c.share - loss);
                    // Record erosion event
                    if (!c.erosionLog) c.erosionLog = [];
                    c.erosionLog.push({ day: s.gameDay, loss, from: prevShare, to: c.share });
                    if (c.erosionLog.length > 20) c.erosionLog.shift();
                    if (loss >= 3) {
                        this.addFeed(T('feed.erosion', s.competitor.name, D(c,'name'), loss), 'alert');
                    }
                }
                // Daily share trend snapshot (once per game-day, keep last 30)
                if (s.gameHour === 0 || c.shareTrend.length === 0) {
                    const lastEntry = c.shareTrend[c.shareTrend.length - 1];
                    if (!lastEntry || lastEntry.day !== s.gameDay) {
                        c.shareTrend.push({ day: s.gameDay, share: c.share });
                        if (c.shareTrend.length > 30) c.shareTrend.shift();
                    }
                }
            });
        }
    },

    // Analyze customer erosion status
    getErosionStatus(c) {
        if (!c.peakShare || c.peakShare <= 0) return null;
        const erosionPct = c.peakShare - c.share;
        if (erosionPct < 5) return null; // minimal, not significant

        // Calculate recent trend (last 7 entries)
        const trend = c.shareTrend || [];
        let recentLoss = 0;
        if (trend.length >= 2) {
            const recent = trend.slice(-7);
            recentLoss = recent[0].share - recent[recent.length - 1].share;
        }

        // Severity: warning (5-15%), danger (15-30%), critical (30%+)
        let severity, label;
        if (erosionPct >= 30) { severity = 'critical'; label = T('market.severe'); }
        else if (erosionPct >= 15) { severity = 'danger'; label = T('market.danger'); }
        else { severity = 'warning'; label = T('market.caution'); }

        // Erosion frequency (events in last 10 days)
        const recentEvents = (c.erosionLog || []).filter(e => e.day >= (this.state.gameDay - 10)).length;

        return { erosionPct, recentLoss, severity, label, recentEvents, peakShare: c.peakShare };
    },

    // Generate recovery recommendations for eroding customer
    getRecoveryPlan(c, port, erosion) {
        const s = this.state;
        const recs = [];
        const hasOffice = s.infra.offices && s.infra.offices[port];
        const trainingLv = s.infra.training || 0;
        const itLv = s.infra.systems || s.infra.it || 0;

        // 1. Dedicated salesperson booster
        const hasDedicated = (c.boosts || []).some(b => b.id === 'dedicated' && b.daysLeft > 0);
        if (!hasDedicated) {
            recs.push({
                icon: '👤', name: T('boost.dedicated'),
                desc: T('boost.dedicatedEffect'),
                cost: 8000, days: 21,
                impact: T('erosion.high'), priority: erosion.severity === 'critical' ? 1 : 2,
            });
        }

        // 2. Priority service booster
        const hasPriority = (c.boosts || []).some(b => b.id === 'priority' && b.daysLeft > 0);
        if (!hasPriority) {
            recs.push({
                icon: '🥇', name: T('boost.priority'),
                desc: T('boost.priorityEffect'),
                cost: 5000, days: 14,
                impact: T('erosion.high'), priority: 1,
            });
        }

        // 3. Discount offer (quick)
        const hasDiscount = (c.boosts || []).some(b => b.id === 'discount' && b.daysLeft > 0);
        if (!hasDiscount) {
            recs.push({
                icon: '🏷️', name: T('boost.discount'),
                desc: T('boost.discountEffect'),
                cost: 2000, days: 7,
                impact: T('erosion.mid'), priority: 2,
            });
        }

        // 4. Gift/entertainment
        const hasGift = (c.boosts || []).some(b => b.id === 'gift' && b.daysLeft > 0);
        if (!hasGift) {
            recs.push({
                icon: '🎁', name: T('boost.gift'),
                desc: T('boost.giftEffect'),
                cost: 3000, days: 10,
                impact: T('erosion.mid'), priority: 3,
            });
        }

        // 5. Office establishment (if not present)
        if (!hasOffice) {
            const officeCost = 30000;
            recs.push({
                icon: '🏢', name: `${this.getPortName(port)} ${T('inv.establish')}`,
                desc: T('recovery.officeDesc'),
                cost: officeCost, days: 0,
                impact: T('erosion.veryHigh'), priority: erosion.severity === 'critical' ? 1 : 3,
            });
        }

        // 6. Training upgrade
        if (trainingLv < 3) {
            const tCosts = [15000, 30000, 50000];
            recs.push({
                icon: '📚', name: T('recovery.training', trainingLv + 1),
                desc: T('recovery.trainingDesc'),
                cost: tCosts[trainingLv], days: 0,
                impact: T('erosion.highLong'), priority: 4,
            });
        }

        // 7. Port-focus strategy recommendation
        const assignedSales = s.salesTeam.filter(st => st.plan?.strategy === 'port-focus' && st.plan?.focusPort === port);
        if (assignedSales.length === 0) {
            recs.push({
                icon: '📍', name: T('recovery.portFocus', this.getPortName(port)),
                desc: T('recovery.portFocusDesc'),
                cost: 0, days: 0,
                impact: T('erosion.mid'), priority: 1,
            });
        }

        // 8. IT system upgrade
        if (itLv < 3) {
            const itCosts = [10000, 25000, 50000];
            recs.push({
                icon: '💻', name: T('recovery.itSystem', itLv + 1),
                desc: T('recovery.itDesc'),
                cost: itCosts[itLv], days: 0,
                impact: T('erosion.midLong'), priority: 5,
            });
        }

        // Estimate total recovery time
        const daysToRecover = Math.ceil(erosion.erosionPct / (erosion.severity === 'critical' ? 1.5 : 2));

        recs.sort((a, b) => a.priority - b.priority);
        return { recs, estimatedDays: daysToRecover };
    },

    // ==================== SPOT CARGO & BSA BIDDING ====================
    generateSpotOffer() {
        const s = this.state, r = s.route;
        if (!s.spotOffers) s.spotOffers = [];
        const template = SPOT_CARGO_POOL[Math.floor(Math.random() * SPOT_CARGO_POOL.length)];
        const ports = r.ports.filter(p => r.salesPorts[p] && r.salesPorts[p].sellTo.length > 0);
        const fromPort = ports[Math.floor(Math.random() * ports.length)];
        const toPort = r.salesPorts[fromPort].sellTo[Math.floor(Math.random() * r.salesPorts[fromPort].sellTo.length)];
        const leg = `${fromPort}-${toPort}`;
        const rate = BASE_RATES[leg];
        if (!rate) return;

        const teu = template.teu.min + Math.floor(Math.random() * (template.teu.max - template.teu.min + 1));
        const r20 = Math.round(rate['20'] * template.rateMult);
        const r40 = Math.round(rate['40'] * template.rateMult);
        const revenue = Math.round(teu * 0.4) * r20 + Math.round(teu * 0.3) * r40;

        const offer = {
            id: 'spot_' + Date.now(),
            name: D(template,'name'), icon: template.icon, desc: D(template,'desc'),
            fromPort, toPort, leg, teu, r20, r40, revenue,
            rateMult: template.rateMult, daysLeft: template.timeLimit,
        };
        s.spotOffers.push(offer);

        // Show as event modal
        this.stopTick();
        const fromName = this.getPortName(fromPort);
        const toName = this.getPortName(toPort);
        document.getElementById('evt-title').textContent = T('spot.title', template.icon);
        document.getElementById('evt-desc').innerHTML =
            `<strong>${D(template,'name')}</strong><br>${D(template,'desc')}<br><br>` +
            `📍 ${fromName} → ${toName}<br>` +
            `${T('spot.details', teu, revenue.toLocaleString())}<br>` +
            `${T('spot.deadline', template.timeLimit)}`;
        document.getElementById('evt-actions').innerHTML =
            `<button class="btn-primary" onclick="Game.acceptSpot('${offer.id}')">${T('spot.accept', revenue.toLocaleString())}</button>` +
            `<button class="btn-sm" onclick="Game.declineSpot('${offer.id}')" style="margin-top:6px;background:var(--card2);width:100%">${T('spot.decline')}</button>`;
        document.getElementById('modal-event').classList.add('active');
    },

    acceptSpot(offerId) {
        const s = this.state, r = s.route;
        const idx = (s.spotOffers || []).findIndex(o => o.id === offerId);
        if (idx < 0) { this.closeModal('modal-event'); this.startTick(); return; }
        const offer = s.spotOffers.splice(idx, 1)[0];

        // Check capacity
        const currentTEU = this.getTEU();
        if (currentTEU + offer.teu > s.ship.capacity) {
            this.toast(T('ctr.noSpace'), 'fail');
            s.spotOffers.push(offer); // put back
            this.closeModal('modal-event');
            this.startTick();
            return;
        }

        // Book the spot cargo
        const vol20 = Math.round(offer.teu * 0.4);
        const vol40 = Math.round(offer.teu * 0.3);
        s.bookings.push({
            custId: 'SPOT', custName: offer.name, custIcon: offer.icon,
            leg: offer.leg, port: offer.fromPort,
            q20: vol20, q40: vol40, r20: offer.r20, r40: offer.r40,
            revenue: offer.revenue, delivered: false, isSpot: true,
        });
        s.stats.totBookings++;
        s.cash += 0; // revenue counted at voyage completion
        this.addFeed(T('spot.booked', offer.icon, offer.name, offer.teu, offer.revenue.toLocaleString()), 'booking');
        this.toast(T('spot.bookedToast', offer.teu, offer.revenue.toLocaleString()), 'ok');
        this.updateBayGrid();
        this.updateDepartInfo();
        this.closeModal('modal-event');
        this.startTick();
    },

    declineSpot(offerId) {
        const s = this.state;
        const idx = (s.spotOffers || []).findIndex(o => o.id === offerId);
        if (idx >= 0) s.spotOffers.splice(idx, 1);
        this.addFeed(T('feed.spotPass'), 'activity');
        this.closeModal('modal-event');
        this.startTick();
    },

    generateBsaBidding() {
        const s = this.state, r = s.route;
        if (!s.bsaContracts) s.bsaContracts = [];
        // Reputation = average share across all customers
        const allCusts = Object.values(s.custs).flat();
        const rep = allCusts.length > 0 ? allCusts.reduce((sum, c) => sum + c.share, 0) / allCusts.length : 0;

        // Filter by minimum reputation
        const eligible = BSA_BIDDING_POOL.filter(b => rep >= b.minRep);
        if (eligible.length === 0) return;

        const template = eligible[Math.floor(Math.random() * eligible.length)];
        const teuPerVoy = template.teuPerVoyage.min + Math.floor(Math.random() * (template.teuPerVoyage.max - template.teuPerVoyage.min + 1));

        // Pick a random valid leg — can be any direction (forward or reverse)
        const allLegs = r.legs.map(l => `${l.from}-${l.to}`);
        const leg = allLegs[Math.floor(Math.random() * allLegs.length)];
        const [fromPort, toPort] = leg.split('-');
        const rate = BASE_RATES[leg];
        if (!rate) return;

        // Determine container flow direction (forward = toward deficit, reverse = from deficit)
        const homePort = r.ports[0];
        const fromHome = (s.ctr[fromPort]?.['20'] || 0) + (s.ctr[fromPort]?.['40'] || 0);
        const toHome = (s.ctr[toPort]?.['20'] || 0) + (s.ctr[toPort]?.['40'] || 0);
        const isForward = fromHome >= toHome; // from surplus → to deficit = forward (순방향)

        const rateAdj = 1 + template.basePremium;
        const revPerVoy = Math.round(teuPerVoy * 0.5 * rate['20'] * rateAdj + teuPerVoy * 0.25 * rate['40'] * rateAdj);
        const contractDuration = 6; // 6개월 고정
        const totalVoyages = Math.round(contractDuration * 30 / r.rotationDays);

        this.stopTick();
        const fromName = this.getPortName(fromPort);
        const toName = this.getPortName(toPort);
        const diffStars = '⭐'.repeat(template.difficulty);
        const flowIcon = isForward ? '✅' : '⚠️';
        const flowText = isForward ? T('bsa.flowForward') : T('bsa.flowReverse');

        document.getElementById('evt-title').textContent = T('bsa.title');
        document.getElementById('evt-desc').innerHTML =
            `<strong>${template.icon} ${D(template,'name')}</strong><br>${D(template,'desc')}<br><br>` +
            `📍 ${fromName} → ${toName} <span style="font-size:11px;padding:2px 6px;border-radius:4px;background:${isForward ? 'rgba(76,175,80,0.2)' : 'rgba(255,152,0,0.2)'}">${flowIcon} ${flowText}</span><br>` +
            `${T('bsa.difficulty')} ${diffStars}<br>` +
            `${T('bsa.voyDetail', teuPerVoy, totalVoyages, contractDuration)}<br>` +
            `${T('bsa.revPerVoy', revPerVoy.toLocaleString())}<br>` +
            `${T('bsa.totalValue', (revPerVoy * totalVoyages).toLocaleString())}`;

        // Bidding: 4 options — full price / 10% / 20% / 30% discount
        const bidId = 'bsa_' + Date.now();
        const baseWin = Math.max(10, 50 - template.difficulty * 10);
        const disc10Win = Math.min(90, baseWin + 15);
        const disc20Win = Math.min(90, baseWin + 30);
        const disc30Win = Math.min(95, baseWin + 45);

        document.getElementById('evt-actions').innerHTML =
            `<button class="btn-primary" onclick="Game.bidBsa('${bidId}',${teuPerVoy},${revPerVoy},${totalVoyages},'${fromPort}','${toPort}',${template.difficulty},0,${contractDuration})" style="margin-bottom:4px;width:100%">${T('bsa.bid0', baseWin)}</button>` +
            `<button class="btn-primary" onclick="Game.bidBsa('${bidId}',${teuPerVoy},${Math.round(revPerVoy * 0.9)},${totalVoyages},'${fromPort}','${toPort}',${template.difficulty},1,${contractDuration})" style="margin-bottom:4px;width:100%;background:var(--accent2)">${T('bsa.bid10', disc10Win)}</button>` +
            `<button class="btn-primary" onclick="Game.bidBsa('${bidId}',${teuPerVoy},${Math.round(revPerVoy * 0.8)},${totalVoyages},'${fromPort}','${toPort}',${template.difficulty},2,${contractDuration})" style="margin-bottom:4px;width:100%;background:#7B1FA2">${T('bsa.bid20', disc20Win)}</button>` +
            `<button class="btn-primary" onclick="Game.bidBsa('${bidId}',${teuPerVoy},${Math.round(revPerVoy * 0.7)},${totalVoyages},'${fromPort}','${toPort}',${template.difficulty},3,${contractDuration})" style="margin-bottom:4px;width:100%;background:#E65100">${T('bsa.bid30', disc30Win)}</button>` +
            `<button class="btn-sm" onclick="Game.closeModal('modal-event');Game.startTick()" style="width:100%;background:var(--card2)">${T('bsa.decline')}</button>`;
        document.getElementById('modal-event').classList.add('active');
    },

    bidBsa(bidId, teuPerVoy, revPerVoy, totalVoyages, fromPort, toPort, difficulty, discountLevel, duration) {
        const s = this.state;
        if (!s.bsaContracts) s.bsaContracts = [];
        const allCusts = Object.values(s.custs).flat();
        const rep = allCusts.length > 0 ? allCusts.reduce((sum, c) => sum + c.share, 0) / allCusts.length : 0;

        // Win probability
        let winRate = 0.50 + rep * 0.003 - difficulty * 0.10;
        if (discountLevel === 1) winRate += 0.15;
        else if (discountLevel === 2) winRate += 0.30;
        else if (discountLevel === 3) winRate += 0.45;
        winRate += s.infra.training * 0.03 + (s.infra.systems || s.infra.it || 0) * 0.02;
        winRate = Math.max(0.10, Math.min(0.95, winRate));

        const won = Math.random() < winRate;

        // Calculate base rate (undiscounted) for competitor reference
        const baseRev = discountLevel > 0 ? Math.round(revPerVoy / (1 - discountLevel * 0.1)) : revPerVoy;
        const myBidPrice = revPerVoy;

        // Generate 2-3 competitor bids
        const compNames = CURRENT_LANG === 'ja' ? COMPETITOR_NAMES_JA : COMPETITOR_NAMES;
        const numComp = 2 + Math.floor(Math.random() * 2);
        const shuffled = [...compNames].sort(() => Math.random() - 0.5).slice(0, numComp);
        const competitors = shuffled.map(name => {
            let price;
            if (won) {
                price = Math.round(baseRev * (0.85 + Math.random() * 0.25));
                if (price <= myBidPrice) price = myBidPrice + Math.round(baseRev * 0.03 + Math.random() * baseRev * 0.1);
            } else {
                price = Math.round(baseRev * (0.60 + Math.random() * 0.35));
            }
            return { name, price };
        });

        // If lost, ensure at least one competitor is cheaper
        if (!won) {
            const cheapest = competitors.reduce((min, c) => c.price < min.price ? c : min);
            if (cheapest.price >= myBidPrice) {
                cheapest.price = Math.round(myBidPrice * (0.80 + Math.random() * 0.15));
            }
        }

        // Build all bidders list and sort by price (lowest first = best for shipper)
        const allBidders = [
            { name: s.co, price: myBidPrice, isMe: true, won: won },
            ...competitors.map(c => ({ ...c, isMe: false, won: false }))
        ];
        allBidders.sort((a, b) => a.price - b.price);

        // Mark winner
        if (won) {
            allBidders.find(b => b.isMe).won = true;
        } else {
            allBidders[0].won = true;
        }

        // Build result modal HTML
        const resultText = won ? T('bsa.resultWon') : T('bsa.resultLost');
        const resultColor = won ? 'var(--green)' : 'var(--red)';

        let tableRows = allBidders.map((b, i) => {
            const rank = i + 1;
            const tag = b.won ? `<span style="color:var(--green);font-weight:700">${T('bsa.winner')}</span>` : `<span style="color:var(--t3)">${T('bsa.loser')}</span>`;
            const nameStyle = b.isMe ? 'font-weight:700;color:var(--accent)' : '';
            const rowBg = b.isMe ? 'background:rgba(0,84,166,.15)' : (b.won ? 'background:rgba(76,175,80,.1)' : '');
            return `<div style="display:flex;justify-content:space-between;align-items:center;padding:8px 10px;margin:3px 0;border-radius:6px;font-size:13px;${rowBg}">
                <span style="${nameStyle}">${rank}. ${b.name}${b.isMe ? ' (' + (CURRENT_LANG === 'ja' ? '自社' : '나') + ')' : ''}</span>
                <span style="display:flex;gap:10px;align-items:center">
                    <span style="font-weight:600">$${b.price.toLocaleString()}${T('bsa.perVoy')}</span>
                    ${tag}
                </span>
            </div>`;
        }).join('');

        let contractInfo = '';
        if (won) {
            contractInfo = `<div style="background:rgba(76,175,80,.1);border:1px solid var(--green);border-radius:8px;padding:10px;margin-top:12px;font-size:12px;color:var(--green)">
                ${T('bsa.contractStart', duration || Math.round(totalVoyages * s.route.rotationDays / 30), totalVoyages)}<br>
                ${T('bsa.expectedRevenue', (revPerVoy * totalVoyages).toLocaleString())}
            </div>`;
        }

        // Show result in event modal
        document.getElementById('evt-title').textContent = T('bsa.resultTitle');
        document.getElementById('evt-desc').innerHTML = `
            <div style="text-align:center;margin-bottom:14px">
                <div style="font-size:28px;margin-bottom:4px">${won ? '🏆' : '❌'}</div>
                <div style="font-size:18px;font-weight:700;color:${resultColor}">${resultText}</div>
            </div>
            <div style="font-size:11px;color:var(--t3);margin-bottom:6px;text-align:left">${T('bsa.myBid')}: $${myBidPrice.toLocaleString()}${T('bsa.perVoy')} (${discountLevel > 0 ? discountLevel * 10 + '% ' + (CURRENT_LANG === 'ja' ? '割引' : '할인') : CURRENT_LANG === 'ja' ? '定価' : '정가'})</div>
            <div style="text-align:left;border:1px solid var(--border);border-radius:8px;overflow:hidden;padding:4px">
                ${tableRows}
            </div>
            ${contractInfo}`;
        document.getElementById('evt-actions').innerHTML =
            `<button class="btn-primary" onclick="Game.closeModal('modal-event');Game.startTick()" style="width:100%">${T('bsa.resultConfirm')}</button>`;
        document.getElementById('modal-event').classList.add('active');

        // Apply result
        if (won) {
            const contract = {
                id: bidId, teuPerVoy, revPerVoy, fromPort, toPort,
                leg: `${fromPort}-${toPort}`,
                voyagesLeft: totalVoyages, totalVoyages,
            };
            s.bsaContracts.push(contract);
            this.addFeed(T('bsa.won', teuPerVoy, totalVoyages), 'booking');
        } else {
            this.addFeed(T('bsa.lost'), 'alert');
        }
    },

    // Generate BSA contract bookings each voyage
    generateBsaBookings() {
        const s = this.state;
        if (!s.bsaContracts || s.bsaContracts.length === 0) return;
        s.bsaContracts.forEach(c => {
            if (c.voyagesLeft <= 0) return;
            const currentTEU = this.getTEU();
            if (currentTEU + c.teuPerVoy > s.ship.capacity) return;

            const rate = BASE_RATES[c.leg];
            if (!rate) return;
            const vol20 = Math.round(c.teuPerVoy * 0.5);
            const vol40 = Math.round(c.teuPerVoy * 0.25);
            s.bookings.push({
                custId: 'BSA', custName: `BSA-${c.id.slice(-4)}`, custIcon: '📋',
                leg: c.leg, port: c.fromPort,
                q20: vol20, q40: vol40,
                r20: Math.round(c.revPerVoy / (vol20 + vol40 * 2) * (vol20 > 0 ? 1 : 0.5)),
                r40: Math.round(c.revPerVoy / (vol20 + vol40 * 2) * 2),
                revenue: c.revPerVoy, delivered: false, isBsa: true,
            });
            s.stats.totBookings++;
            c.voyagesLeft--;
            this.addFeed(T('bsa.autoLoad', c.teuPerVoy, Math.round(c.voyagesLeft)), 'booking');
        });
        this.updateBayGrid();
        this.updateDepartInfo();
    },

    // ==================== ALERTS ====================
    checkContainerAlerts() {
        const s = this.state, r = s.route;
        r.ports.forEach(p => {
            if (p === r.ports[0]) return; // skip home port
            const total = s.ctr[p]['20'] + s.ctr[p]['40'];
            if (total > 15 && s.gameDay > 7) {
                this.addFeed(T('ctr.congestionFeed', this.getPortName(p), total), 'alert');
            }
        });
    },

    // ==================== MILESTONES ====================
    // ==================== INSURANCE & ACCIDENTS ====================
    chargeInsurance() {
        const s = this.state;
        if (typeof INSURANCE_RATES === 'undefined') return;
        const ir = INSURANCE_RATES;
        // Condition band
        const cond = s.ship.condition || 100;
        const band = cond >= 80 ? 'good' : cond >= 50 ? 'fair' : cond >= 30 ? 'poor' : 'critical';
        const condMult = ir.conditionMultiplier[band];
        // Accident history surcharge
        const accidentCount = (s.accidentHistory || []).length;
        const accSurcharge = 1 + accidentCount * ir.accidentSurcharge;
        const premium = Math.round(ir.base * condMult * accSurcharge);
        s.cash -= premium;
        s.stats.totExp += premium;
        if (!s.insurancePaid) s.insurancePaid = 0;
        s.insurancePaid += premium;
        this.addFeed(T('insurance.premium', premium.toLocaleString(), band, accidentCount), 'info');
    },

    triggerShipAccident() {
        const s = this.state;
        // Pick random accident weighted by probability
        const roll = Math.random();
        let cumProb = 0;
        let accident = SHIP_ACCIDENTS[0];
        for (const acc of SHIP_ACCIDENTS) {
            cumProb += acc.prob;
            if (roll <= cumProb) { accident = acc; break; }
        }

        // Random costs within range
        const repair = Math.round(accident.repairCost[0] + Math.random() * (accident.repairCost[1] - accident.repairCost[0]));
        const claim = Math.round(accident.claimCost[0] + Math.random() * (accident.claimCost[1] - accident.claimCost[0]));
        const condLoss = Math.round(accident.condLoss[0] + Math.random() * (accident.condLoss[1] - accident.condLoss[0]));

        // Insurance covers part of claim
        const ir = typeof INSURANCE_RATES !== 'undefined' ? INSURANCE_RATES : { claimCoverage: 0 };
        const insuredClaim = Math.round(claim * ir.claimCoverage);
        const outOfPocket = claim - insuredClaim;
        const totalCost = repair + outOfPocket;

        // Apply damage
        s.ship.condition = Math.max(5, (s.ship.condition || 100) - condLoss);
        s.cash -= totalCost;
        s.stats.totExp += totalCost;
        s.lastAccidentDay = s.gameDay;

        // Record history
        if (!s.accidentHistory) s.accidentHistory = [];
        s.accidentHistory.push({
            id: accident.id, day: s.gameDay, repair, claim, insuredClaim, outOfPocket, totalCost, condLoss,
        });

        // Show modal
        document.getElementById('evt-title').textContent = `${accident.icon} ${D(accident,'name')}`;
        document.getElementById('evt-desc').innerHTML = `
            <p>${D(accident,'desc')}</p>
            <div style="margin-top:10px;font-size:12px;background:var(--card2);padding:10px;border-radius:8px">
                <div style="display:grid;grid-template-columns:1fr 1fr;gap:6px">
                    <span>${T('accident.repair')}</span><span style="color:var(--red);text-align:right">$${repair.toLocaleString()}</span>
                    <span>${T('accident.claim')}</span><span style="text-align:right">$${claim.toLocaleString()}</span>
                    <span>${T('accident.insurance')}</span><span style="color:var(--green);text-align:right">-$${insuredClaim.toLocaleString()}</span>
                    <span style="font-weight:700">${T('accident.actual')}</span><span style="color:var(--red);text-align:right;font-weight:700">$${totalCost.toLocaleString()}</span>
                </div>
                <div style="margin-top:8px;font-size:11px;color:var(--t3)">${T('accident.shipCond', s.ship.condition + condLoss, s.ship.condition, condLoss)}</div>
            </div>`;
        document.getElementById('evt-actions').innerHTML = `<button class="btn-primary" onclick="Game.closeModal('modal-event')" style="width:100%;margin-top:8px">${T('accident.confirm')}</button>`;
        this.openModal('modal-event');

        this.addFeed(T('accident.feed', accident.icon, D(accident,'name'), totalCost.toLocaleString(), insuredClaim.toLocaleString()), 'alert');
    },

    checkMilestones() {
        const s = this.state;
        MILESTONES.forEach(m => {
            if (s.milestones.includes(m.id)) return;
            if (m.check(s)) {
                s.milestones.push(m.id);
                s.cash += m.reward;
                document.getElementById('ms-title').textContent = `${m.icon} ${D(m,'name')}`;
                document.getElementById('ms-desc').textContent = D(m,'desc');
                document.getElementById('ms-reward').innerHTML = `<p style="color:var(--green);font-size:18px;font-weight:700">+$${m.reward.toLocaleString()}</p>`;
                this.openModal('modal-milestone');
                this.addFeed(T('milestone.achieved', D(m,'name'), m.reward.toLocaleString()), 'alert');
            }
        });
    },

    // ==================== DEPARTURE ====================
    manualDepart() {
        if (this.state.voyage.status !== 'port') return;
        if (this.state.bookings.length === 0) {
            this.toast(T('depart.noCargo'), 'err');
            return;
        }
        this.startVoyage();
    },

    autoDepart() {
        if (this.state.bookings.length === 0) {
            this.addFeed(T('depart.postpone'), 'alert');
            this.state.voyage.daysSinceLast = Math.max(0, this.state.voyage.daysSinceLast - 1);
            return;
        }
        this.addFeed(T('depart.auto'), 'alert');
        this.startVoyage();
    },

    startVoyage() {
        const s = this.state;
        this.saveGame(); // Save before departure
        // Auto-load BSA contract cargo before departure
        this.generateBsaBookings();
        s.voyage.status = 'sailing';
        s.voyage.legIdx = 0;
        s.voyage.sailProgress = 0;
        s.voyage.totalLegs = s.route.legs.length;
        s.voyage.voyRev = s.bookings.reduce((sum, b) => sum + b.revenue, 0);
        s.voyage.voyExp = 0;
        s.voyage.unloads = [];
        s.voyage.boosterCost = 0;
        s.voyage.repoCostUser = 0;

        // Execute pending container repositioning
        if (s.pendingRepos && s.pendingRepos.length > 0) {
            s.pendingRepos.forEach(rp => {
                s.ctr[rp.to]['20'] += rp.q20;
                s.ctr[rp.to]['40'] += rp.q40;
                this.addFeed(`${T('ctr.arrived')} ${this.getPortName(rp.to)} 20'×${rp.q20}+40'×${rp.q40} ${T('ctr.placed')}`, 'booking');
            });
            s.pendingRepos = [];
        }

        // Stay on game screen — update left panel to show sailing map
        const shipStatus = document.getElementById('ship-status');
        if (shipStatus) shipStatus.textContent = T('ship.sailing');
        document.getElementById('btn-depart').disabled = true;
        document.getElementById('btn-depart').textContent = T('depart.sailing');
        this.renderInlineSailMap();
    },

    tickSailing() {
        const s = this.state;
        const v = s.voyage;
        const r = s.route;
        if (v.completing) return; // already finishing
        const leg = r.legs[v.legIdx];
        if (!leg) { this.completeVoyage(); return; }

        // Progress through current leg
        const hoursPerLeg = leg.seaDays * 24;
        const progressPerTick = 1 / hoursPerLeg;
        v.sailProgress += progressPerTick;

        // Update inline map
        this.renderInlineSailMap();

        if (v.sailProgress >= 1) {
            // Leg complete — weather + oil price affect fuel cost
            const w = this.getWeather(leg.to);
            const oil = this.getOilPrice();
            let fuelMult = oil.mult;
            if (w.typhoon) fuelMult *= 1.3;
            else if (w.wave >= 4) fuelMult *= 1.15;
            else if (w.wave >= 3) fuelMult *= 1.08;
            const fuel = Math.round(leg.seaDays * r.fuelCostPerDay * fuelMult);
            const port = r.portFeesPerCall;
            v.voyExp += fuel + port;
            s.cash -= fuel + port;
            s.stats.totExp += fuel + port;
            if (fuelMult > 1.1) {
                const baseFuel = Math.round(leg.seaDays * r.fuelCostPerDay);
                const extra = fuel - baseFuel;
                const reasons = [];
                if (oil.mult > 1.05) reasons.push(`🛢️${T('oil.high')}`);
                if (w.typhoon) reasons.push('🌀' + T('weather.typhoon'));
                else if (w.wave >= 4) reasons.push('🌊' + T('weather.highWave'));
                this.addFeed(`${reasons.join(' + ')} — ${T('oil.fuelExtra')} +$${extra.toLocaleString()}`, 'alert');
            }

            // Unload cargo at destination
            const dest = leg.to;
            let un20 = 0, un40 = 0, unRev = 0;
            s.bookings.forEach(b => {
                const bDest = b.leg.split('-')[1];
                if (bDest === dest && !b.delivered) {
                    b.delivered = true;
                    un20 += b.q20; un40 += b.q40;
                    unRev += b.revenue;
                    s.ctr[dest]['20'] += b.q20;
                    s.ctr[dest]['40'] += b.q40;
                }
            });
            if (unRev > 0) { s.cash += unRev; s.stats.totRev += unRev; }
            v.unloads.push({ port: dest, un20, un40, unRev });

            if (unRev > 0) {
                this.addFeed(T('voyage.unload', this.getPortName(dest), un20 + un40 * 2, unRev.toLocaleString()), 'booking');
            }

            // Event check
            const evt = VOYAGE_EVENTS.find(e => Math.random() < e.prob);
            if (evt) {
                this.stopTick();
                this.showEvent(evt);
            }

            v.legIdx++;
            v.sailProgress = 0;

            if (v.legIdx >= v.totalLegs) {
                v.completing = true;
                setTimeout(() => { if (v.completing) this.completeVoyage(); }, 1500);
            }
        }
    },

    renderInlineSailMap() {
        const s = this.state, r = s.route, v = s.voyage;
        const leg = r.legs[Math.min(v.legIdx, r.legs.length - 1)];
        const from = leg.from, to = leg.to;
        const scene = document.getElementById('ship-scene');

        // Determine if map needs to expand for slot charter / owned routes
        const activeSlots = (s.slotCharters || []).filter(sc => sc.active);
        const activeOwnedRoutes = (s.ownedRoutes || []).filter(o => o.status === 'active');
        const hasSlotCharters = activeSlots.length > 0;
        const hasOwnedRoutes = activeOwnedRoutes.length > 0;
        const hasIndiaRoute = activeOwnedRoutes.some(o => o.id === 'NR_KIS');
        const vbY = hasIndiaRoute ? 60 : 80;
        const vbH = hasSlotCharters || hasOwnedRoutes ? (hasIndiaRoute ? 640 : 610) : 380;

        // Build compact SVG map
        let svg = `<svg viewBox="50 ${vbY} 650 ${vbH}" xmlns="http://www.w3.org/2000/svg" style="width:100%;height:100%;position:absolute;top:0;left:0;z-index:10">`;
        svg += `<defs>
            <radialGradient id="seaG" cx="50%" cy="50%"><stop offset="0%" stop-color="#0d3055"/><stop offset="100%" stop-color="#091e38"/></radialGradient>
            <filter id="gl"><feGaussianBlur stdDeviation="2" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
            <linearGradient id="lG" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#2a4a3a"/><stop offset="100%" stop-color="#1e3a2e"/></linearGradient>
            <linearGradient id="rG" x1="0" y1="0" x2="1" y2="0"><stop offset="0%" stop-color="#4CAF50"/><stop offset="100%" stop-color="#FF6B35"/></linearGradient>
            <style>@keyframes svgBob{0%,100%{transform:translate(0,0) rotate(0deg)}25%{transform:translate(1px,-2px) rotate(2deg)}50%{transform:translate(0,1px) rotate(0deg)}75%{transform:translate(-1px,-1px) rotate(-2deg)}}</style>
        </defs>`;
        svg += `<rect x="50" y="${vbY}" width="650" height="${vbH}" fill="url(#seaG)"/>`;
        for (const [, path] of Object.entries(MAP_LAND)) {
            svg += `<path d="${path}" fill="url(#lG)" stroke="#3a6a50" stroke-width="1" opacity=".8"/>`;
        }
        svg += `<text x="200" y="200" fill="rgba(150,180,160,.3)" font-size="18" font-weight="700" letter-spacing="6">${T('geo.china')}</text>`;
        svg += `<text x="475" y="175" fill="rgba(150,180,160,.3)" font-size="11" font-weight="700" letter-spacing="3">${T('geo.korea')}</text>`;
        svg += `<text x="610" y="145" fill="rgba(150,180,160,.3)" font-size="11" font-weight="700" letter-spacing="3">${T('geo.japan')}</text>`;
        if (hasSlotCharters || hasOwnedRoutes) {
            svg += `<text x="280" y="480" fill="rgba(150,180,160,.3)" font-size="11" font-weight="700" letter-spacing="3">${T('geo.vietnam')}</text>`;
            svg += `<text x="175" y="530" fill="rgba(150,180,160,.3)" font-size="11" font-weight="700" letter-spacing="3">${T('geo.thailand')}</text>`;
            svg += `<text x="280" y="640" fill="rgba(150,180,160,.3)" font-size="11" font-weight="700" letter-spacing="3">${T('geo.indonesia')}</text>`;
            if (hasIndiaRoute) {
                svg += `<text x="50" y="430" fill="rgba(150,180,160,.3)" font-size="11" font-weight="700" letter-spacing="3">${T('geo.india')}</text>`;
            }
            if (activeOwnedRoutes.some(o => o.id === 'NR_KMS')) {
                svg += `<text x="190" y="615" fill="rgba(150,180,160,.3)" font-size="11" font-weight="700" letter-spacing="3">${T('geo.malaysia')}</text>`;
            }
        }

        // Main route legs
        const uniquePorts = [...new Set(r.legs.flatMap(l => [l.from, l.to]))];
        r.legs.forEach((l, i) => {
            const p1 = MAP_PORTS[l.from], p2 = MAP_PORTS[l.to];
            if (!p1 || !p2) return;
            const done = i < v.legIdx;
            const active = i === v.legIdx;
            const color = done ? 'rgba(76,175,80,.5)' : (active ? 'url(#rG)' : 'rgba(0,84,166,.25)');
            svg += `<line x1="${p1.x}" y1="${p1.y}" x2="${p2.x}" y2="${p2.y}" stroke="${color}" stroke-width="${active ? 3 : 1.5}" ${active ? '' : 'stroke-dasharray="6 4"'}/>`;
            if (active) svg += `<line x1="${p1.x}" y1="${p1.y}" x2="${p2.x}" y2="${p2.y}" stroke="rgba(255,107,53,.25)" stroke-width="8" stroke-linecap="round"/>`;
        });

        // Slot charter routes
        const slotColors = ['#66BB6A','#42A5F5','#AB47BC','#FF7043'];
        activeSlots.forEach((sc, si) => {
            const scDef = SLOT_CHARTERS.find(d => d.id === sc.id);
            if (!scDef) return;
            const clr = sc.color || scDef.color || slotColors[si % slotColors.length];
            // Draw route legs
            scDef.legs.forEach(l => {
                const p1 = MAP_PORTS[l.from], p2 = MAP_PORTS[l.to];
                if (!p1 || !p2) return;
                svg += `<line x1="${p1.x}" y1="${p1.y}" x2="${p2.x}" y2="${p2.y}" stroke="${clr}" stroke-width="2" stroke-dasharray="8 4" opacity=".7"/>`;
                svg += `<line x1="${p1.x}" y1="${p1.y}" x2="${p2.x}" y2="${p2.y}" stroke="${clr}" stroke-width="6" stroke-linecap="round" opacity=".15"/>`;
            });
            // Slot charter ship icon at approximate position based on progress
            const scVoy = sc.voyage || {};
            const scProgress = (scVoy.dayCounter || 0) / (scDef.rotationDays || 14);
            const totalLegs = scDef.legs.length;
            const activeLegIdx = Math.min(Math.floor(scProgress * totalLegs), totalLegs - 1);
            const legProgress = (scProgress * totalLegs) - activeLegIdx;
            const scLeg = scDef.legs[activeLegIdx];
            const sp1 = MAP_PORTS[scLeg.from], sp2 = MAP_PORTS[scLeg.to];
            if (sp1 && sp2) {
                const sx = sp1.x + (sp2.x - sp1.x) * Math.min(legProgress, 1);
                const sy = sp1.y + (sp2.y - sp1.y) * Math.min(legProgress, 1);
                svg += `<text x="${sx}" y="${sy}" text-anchor="middle" dominant-baseline="central" font-size="16" opacity=".8">⛴</text>`;
            }
            // Route label near midpoint
            const midLeg = scDef.legs[Math.floor(totalLegs / 2)];
            const ml1 = MAP_PORTS[midLeg.from], ml2 = MAP_PORTS[midLeg.to];
            if (ml1 && ml2) {
                const lx = (ml1.x + ml2.x) / 2 + 15, ly = (ml1.y + ml2.y) / 2;
                svg += `<text x="${lx}" y="${ly}" fill="${clr}" font-size="8" font-weight="700" opacity=".8">${D(scDef,'name').split('(')[0].trim()}</text>`;
            }
            // Port markers for slot charter ports
            scDef.ports.forEach(p => {
                if (uniquePorts.includes(p)) return; // already drawn by main route
                const c = MAP_PORTS[p]; if (!c) return;
                svg += `<circle cx="${c.x}" cy="${c.y}" r="4" fill="${clr}" stroke="#fff" stroke-width="1" filter="url(#gl)"/>`;
                const labelBelow = ['HCM','LCB','JKT','SBY','BKK'].includes(p);
                svg += `<text x="${c.x}" y="${c.y + (labelBelow ? 14 : -9)}" text-anchor="middle" fill="rgba(200,220,255,.7)" font-size="9">${this._pn(scDef, p)}</text>`;
            });
        });

        // Owned routes (new route expansion ships)
        const activeOwned = (s.ownedRoutes || []).filter(o => o.status === 'active');
        const ownedColors = ['#EF5350','#FFA726','#26C6DA','#7E57C2'];
        activeOwned.forEach((or, oi) => {
            const pkg = NEW_ROUTE_PACKAGES.find(d => d.id === or.id);
            if (!pkg) return;
            const clr = pkg.color || ownedColors[oi % ownedColors.length];
            // Draw route legs
            pkg.legs.forEach(l => {
                const p1 = MAP_PORTS[l.from], p2 = MAP_PORTS[l.to];
                if (!p1 || !p2) return;
                svg += `<line x1="${p1.x}" y1="${p1.y}" x2="${p2.x}" y2="${p2.y}" stroke="${clr}" stroke-width="2.5" stroke-dasharray="10 4" opacity=".8"/>`;
                svg += `<line x1="${p1.x}" y1="${p1.y}" x2="${p2.x}" y2="${p2.y}" stroke="${clr}" stroke-width="8" stroke-linecap="round" opacity=".12"/>`;
            });
            // Ship icon at position based on voyage progress
            const orVoy = or.voyage || { dayCounter: 0 };
            const orProgress = (orVoy.dayCounter || 0) / (pkg.rotationDays || 14);
            const orTotalLegs = pkg.legs.length;
            const orLegIdx = Math.min(Math.floor(orProgress * orTotalLegs), orTotalLegs - 1);
            const orLegProg = (orProgress * orTotalLegs) - orLegIdx;
            const orLeg = pkg.legs[orLegIdx];
            const op1 = MAP_PORTS[orLeg.from], op2 = MAP_PORTS[orLeg.to];
            if (op1 && op2) {
                const ox = op1.x + (op2.x - op1.x) * Math.min(orLegProg, 1);
                const oy = op1.y + (op2.y - op1.y) * Math.min(orLegProg, 1);
                svg += `<text x="${ox}" y="${oy}" text-anchor="middle" dominant-baseline="central" font-size="18">🚢</text>`;
                svg += `<text x="${ox}" y="${oy + 14}" text-anchor="middle" fill="${clr}" font-size="7" font-weight="700">${D(pkg,'name').split('(')[1]?.replace(')','') || pkg.id}</text>`;
            }
            // Route label
            const orMidLeg = pkg.legs[Math.floor(orTotalLegs / 2)];
            const oml1 = MAP_PORTS[orMidLeg.from], oml2 = MAP_PORTS[orMidLeg.to];
            if (oml1 && oml2) {
                const olx = (oml1.x + oml2.x) / 2 + 15, oly = (oml1.y + oml2.y) / 2;
                svg += `<text x="${olx}" y="${oly}" fill="${clr}" font-size="8" font-weight="700" opacity=".8">${D(pkg,'name').split('(')[0].trim()}</text>`;
            }
            // Port markers
            pkg.ports.forEach(p => {
                if (uniquePorts.includes(p)) return;
                const c = MAP_PORTS[p]; if (!c) return;
                svg += `<circle cx="${c.x}" cy="${c.y}" r="4" fill="${clr}" stroke="#fff" stroke-width="1" filter="url(#gl)"/>`;
                const labelBelow = ['HCM','LCB','JKT','SBY','BKK','PKL','MAA','BOM','PEN'].includes(p);
                svg += `<text x="${c.x}" y="${c.y + (labelBelow ? 14 : -9)}" text-anchor="middle" fill="rgba(200,220,255,.7)" font-size="9">${this._pn(pkg, p)}</text>`;
                uniquePorts.push(p); // prevent duplicate port labels
            });
        });

        // Ship position (main route)
        const pf = MAP_PORTS[from], pt = MAP_PORTS[to];
        if (pf && pt) {
            const mx = pf.x + (pt.x - pf.x) * v.sailProgress;
            const my = pf.y + (pt.y - pf.y) * v.sailProgress;
            svg += `<g style="animation:svgBob 3s ease-in-out infinite;transform-origin:${mx}px ${my}px"><text x="${mx}" y="${my}" text-anchor="middle" dominant-baseline="central" font-size="22">🚢</text></g>`;
        }

        // Main route port markers
        uniquePorts.forEach(p => {
            const c = MAP_PORTS[p]; if (!c) return;
            const isActive = p === from || p === to;
            const color = p === to ? '#FF6B35' : (p === from ? '#4CAF50' : '#0054A6');
            svg += `<circle cx="${c.x}" cy="${c.y}" r="${isActive ? 5 : 3}" fill="${color}" stroke="#fff" stroke-width="1" filter="url(#gl)"/>`;
            svg += `<text x="${c.x}" y="${c.y + (p === 'NBO' || p === 'SHA' ? 14 : -9)}" text-anchor="middle" fill="${isActive ? '#fff' : 'rgba(200,220,255,.6)'}" font-size="${isActive ? 11 : 9}" ${isActive ? 'font-weight="700"' : ''}>${this.getPortName(p)}</text>`;
            // Weather icon near port
            const w = this.getWeather(p);
            svg += `<text x="${c.x + 12}" y="${c.y - 12}" font-size="14" text-anchor="start">${w.icon}</text>`;
            svg += `<text x="${c.x + 12}" y="${c.y + 3}" font-size="8" fill="rgba(200,220,255,.5)">${w.temp}°</text>`;
        });

        // Wave animation lines (based on weather at ship position)
        const shipWeather = this.getWeather(to);
        if (shipWeather.wave >= 3) {
            for (let i = 0; i < shipWeather.wave; i++) {
                const wy = 350 + i * 20;
                const wx = 100 + (i * 137) % 500;
                svg += `<text x="${wx}" y="${wy}" font-size="${10 + shipWeather.wave * 2}" fill="rgba(100,180,255,.3)" text-anchor="middle">〰️</text>`;
            }
        }
        if (shipWeather.rain || shipWeather.snow) {
            const particle = shipWeather.snow ? '❄' : '💧';
            for (let i = 0; i < 8; i++) {
                const rx = 80 + (i * 79 + s.gameHour * 37) % 600;
                const ry = 100 + (i * 53 + s.gameHour * 19) % 300;
                svg += `<text x="${rx}" y="${ry}" font-size="8" opacity=".3">${particle}</text>`;
            }
        }

        // Typhoon track
        const typhoon = this.getActiveTyphoon();
        if (typhoon) {
            svg += `<path d="${typhoon.path}" fill="none" stroke="rgba(255,60,60,.5)" stroke-width="2" stroke-dasharray="8 4"/>`;
            const pathParts = typhoon.path.split(' ');
            const lastPart = pathParts[pathParts.length - 1].split(',');
            svg += `<text x="${parseInt(lastPart[0]) - 20}" y="${parseInt(lastPart[1]) - 15}" font-size="20">🌀</text>`;
            svg += `<text x="${parseInt(lastPart[0]) - 20}" y="${parseInt(lastPart[1]) + 8}" font-size="8" fill="rgba(255,100,100,.8)" font-weight="700">${typhoon.name} (${typhoon.cat})</text>`;
        }

        // Route legend (bottom-left)
        const legendItems = [];
        activeSlots.forEach((sc, si) => {
            const scDef = SLOT_CHARTERS.find(d => d.id === sc.id);
            const clr = sc.color || scDef?.color || slotColors[si % slotColors.length];
            legendItems.push({ name: (scDef ? D(scDef,'name').split('(')[1]?.replace(')','') || scDef.id : sc.id) + ` (${T('legend.slot')})`, color: clr });
        });
        activeOwned.forEach((or, oi) => {
            const pkg = NEW_ROUTE_PACKAGES.find(d => d.id === or.id);
            const clr = pkg?.color || ownedColors[oi % ownedColors.length];
            legendItems.push({ name: (pkg ? D(pkg,'name').split('(')[1]?.replace(')','') || pkg.id : or.id) + ` (${T('legend.own')})`, color: clr });
        });
        if (legendItems.length > 0) {
            let ly = vbY + vbH - 10 - legendItems.length * 16;
            svg += `<rect x="55" y="${ly - 5}" width="160" height="${legendItems.length * 16 + 10}" rx="4" fill="rgba(0,10,20,.7)" stroke="rgba(255,255,255,.15)" stroke-width="1"/>`;
            legendItems.forEach(item => {
                svg += `<line x1="62" y1="${ly + 6}" x2="80" y2="${ly + 6}" stroke="${item.color}" stroke-width="2"/>`;
                svg += `<text x="85" y="${ly + 10}" fill="rgba(255,255,255,.7)" font-size="8">${item.name}</text>`;
                ly += 16;
            });
        }

        svg += '</svg>';

        // Overlay info bar
        const totalProgress = ((v.legIdx + v.sailProgress) / v.totalLegs) * 100;
        const fromN = this.getPortName(from), toN = this.getPortName(to);
        const lastUnload = v.unloads[v.unloads.length - 1];
        const unloadInfo = lastUnload && lastUnload.unRev > 0 ? ` | ${T('voyage.unload', this.getPortName(lastUnload.port), lastUnload.un20 + lastUnload.un40 * 2, lastUnload.unRev.toLocaleString())}` : '';

        const gd = this.getGameDate();
        const destW = this.getWeather(to);
        const waveDesc = destW.wave >= 4 ? T('weather.rough') : (destW.wave >= 3 ? T('weather.waveHigh') : T('weather.good'));
        const typhoonW = typhoon ? ` | ${T('voyage.typhoon', typhoon.name)}` : '';

        scene.innerHTML = `
            ${svg}
            <div style="position:absolute;bottom:0;left:0;right:0;z-index:11;background:rgba(0,10,20,.85);padding:6px 12px">
                <div style="display:flex;justify-content:space-between;align-items:center;font-size:11px;margin-bottom:4px">
                    <span>🚢 <strong>${s.vessel}</strong> V.${String(v.num).padStart(3,'0')} | 📦 ${Math.round(this.getTEU() / s.ship.capacity * 100)}%</span>
                    <span>${fromN} → ${toN} (${leg.seaDays}${T('common.day')}) | ${destW.icon} ${destW.desc} ${destW.temp}° | ${waveDesc}${typhoonW}${unloadInfo}</span>
                </div>
                <div style="height:5px;background:var(--card);border-radius:3px;overflow:hidden">
                    <div style="height:100%;width:${totalProgress}%;background:linear-gradient(90deg,var(--green),var(--accent));border-radius:3px;transition:width .3s"></div>
                </div>
            </div>`;

        // Update depart area to show voyage progress
        const departArea = document.querySelector('.depart-area');
        if (departArea) {
            document.getElementById('depart-bookings').textContent = `${T('ship.sailing')} — ${fromN} → ${toN}`;
            document.getElementById('depart-countdown').textContent = T('voyage.progress', Math.round(totalProgress));
            document.getElementById('btn-depart').style.display = 'none';
        }
    },

    restoreShipScene() {
        const s = this.state;
        const scene = document.getElementById('ship-scene');
        const hasActiveSubRoutes = ((s.slotCharters || []).some(sc => sc.active)) ||
                                   ((s.ownedRoutes || []).some(o => o.status === 'active'));

        if (hasActiveSubRoutes) {
            // Show map with all route ships + main ship docked at port
            this.renderPortMapView();
        } else {
            scene.innerHTML = `
                <div class="port-ground" id="port-ground"><div class="port-label" id="port-label">${this.getPortName(s.route.ports[0])}${T('common.port')}</div></div>
                <div class="crane" id="crane"><div class="crane-arm"></div><div class="crane-cable"></div><div class="crane-hook"></div></div>
                <div class="game-ship" id="game-ship">
                    <div class="hull"><div class="hull-logo">KMTC</div></div>
                    <div class="vessel-name" id="vessel-name">${s.vessel}</div>
                    <div class="bridge"></div>
                    <div class="funnel"><div class="fstripe"></div></div>
                    <div class="bay-grid" id="bay-grid"></div>
                </div>
                <div class="sea-layer"></div>
                <div class="cargo-info" id="cargo-info"><span id="cargo-teu">0/100 TEU</span><span id="cargo-pct">(0%)</span></div>
                <div class="ship-status" id="ship-status">${T('ship.docked')}</div>`;
        }
        document.getElementById('btn-depart').style.display = '';
        document.getElementById('btn-depart').disabled = false;
        document.getElementById('btn-depart').textContent = T('depart.btn');
        if (!hasActiveSubRoutes) {
            this.updateBayGrid();
        }
        this.updateDepartInfo();
    },

    // Render map view during port time showing all active route ships
    renderPortMapView() {
        const s = this.state, r = s.route;
        const scene = document.getElementById('ship-scene');
        const activeSlots = (s.slotCharters || []).filter(sc => sc.active);
        const activeOwned = (s.ownedRoutes || []).filter(o => o.status === 'active');
        const hasIndiaRoute = activeOwned.some(o => o.id === 'NR_KIS');
        const vbY = hasIndiaRoute ? 60 : 80;
        const vbH = hasIndiaRoute ? 640 : 610;

        let svg = `<svg viewBox="50 ${vbY} 650 ${vbH}" xmlns="http://www.w3.org/2000/svg" style="width:100%;height:100%;position:absolute;top:0;left:0;z-index:10">`;
        svg += `<defs>
            <radialGradient id="seaG" cx="50%" cy="50%"><stop offset="0%" stop-color="#0d3055"/><stop offset="100%" stop-color="#091e38"/></radialGradient>
            <filter id="gl"><feGaussianBlur stdDeviation="2" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
            <linearGradient id="lG" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#2a4a3a"/><stop offset="100%" stop-color="#1e3a2e"/></linearGradient>
        </defs>`;
        svg += `<rect x="50" y="${vbY}" width="650" height="${vbH}" fill="url(#seaG)"/>`;
        for (const [, path] of Object.entries(MAP_LAND)) {
            svg += `<path d="${path}" fill="url(#lG)" stroke="#3a6a50" stroke-width="1" opacity=".8"/>`;
        }
        svg += `<text x="200" y="200" fill="rgba(150,180,160,.3)" font-size="18" font-weight="700" letter-spacing="6">${T('geo.china')}</text>`;
        svg += `<text x="475" y="175" fill="rgba(150,180,160,.3)" font-size="11" font-weight="700" letter-spacing="3">${T('geo.korea')}</text>`;
        svg += `<text x="610" y="145" fill="rgba(150,180,160,.3)" font-size="11" font-weight="700" letter-spacing="3">${T('geo.japan')}</text>`;
        svg += `<text x="280" y="480" fill="rgba(150,180,160,.3)" font-size="11" font-weight="700" letter-spacing="3">${T('geo.vietnam')}</text>`;
        svg += `<text x="175" y="530" fill="rgba(150,180,160,.3)" font-size="11" font-weight="700" letter-spacing="3">${T('geo.thailand')}</text>`;
        svg += `<text x="280" y="640" fill="rgba(150,180,160,.3)" font-size="11" font-weight="700" letter-spacing="3">${T('geo.indonesia')}</text>`;
        if (hasIndiaRoute) svg += `<text x="50" y="430" fill="rgba(150,180,160,.3)" font-size="11" font-weight="700" letter-spacing="3">${T('geo.india')}</text>`;
        if (activeOwned.some(o => o.id === 'NR_KMS')) svg += `<text x="190" y="615" fill="rgba(150,180,160,.3)" font-size="11" font-weight="700" letter-spacing="3">${T('geo.malaysia')}</text>`;

        const uniquePorts = [...new Set(r.legs.flatMap(l => [l.from, l.to]))];

        // Main route legs (dashed, dimmer since in port)
        r.legs.forEach(l => {
            const p1 = MAP_PORTS[l.from], p2 = MAP_PORTS[l.to];
            if (!p1 || !p2) return;
            svg += `<line x1="${p1.x}" y1="${p1.y}" x2="${p2.x}" y2="${p2.y}" stroke="rgba(76,175,80,.4)" stroke-width="1.5" stroke-dasharray="6 4"/>`;
        });

        // Main ship docked at home port
        const homePort = MAP_PORTS[r.ports[0]];
        if (homePort) {
            svg += `<text x="${homePort.x}" y="${homePort.y - 2}" text-anchor="middle" dominant-baseline="central" font-size="18">🚢</text>`;
            svg += `<text x="${homePort.x}" y="${homePort.y + 14}" text-anchor="middle" fill="rgba(76,175,80,.8)" font-size="7" font-weight="700">${T('voyage.docked')}</text>`;
        }

        // Slot charter routes + ships
        const slotColors = ['#66BB6A','#42A5F5','#AB47BC','#FF7043'];
        activeSlots.forEach((sc, si) => {
            const scDef = SLOT_CHARTERS.find(d => d.id === sc.id);
            if (!scDef) return;
            const clr = sc.color || scDef.color || slotColors[si % slotColors.length];
            scDef.legs.forEach(l => {
                const p1 = MAP_PORTS[l.from], p2 = MAP_PORTS[l.to];
                if (!p1 || !p2) return;
                svg += `<line x1="${p1.x}" y1="${p1.y}" x2="${p2.x}" y2="${p2.y}" stroke="${clr}" stroke-width="2" stroke-dasharray="8 4" opacity=".7"/>`;
            });
            const scVoy = sc.voyage || {};
            const scProg = (scVoy.dayCounter || 0) / (scDef.rotationDays || 14);
            const tl = scDef.legs.length;
            const ali = Math.min(Math.floor(scProg * tl), tl - 1);
            const lp = (scProg * tl) - ali;
            const sl = scDef.legs[ali];
            const sp1 = MAP_PORTS[sl.from], sp2 = MAP_PORTS[sl.to];
            if (sp1 && sp2) {
                const sx = sp1.x + (sp2.x - sp1.x) * Math.min(lp, 1);
                const sy = sp1.y + (sp2.y - sp1.y) * Math.min(lp, 1);
                svg += `<text x="${sx}" y="${sy}" text-anchor="middle" dominant-baseline="central" font-size="16" opacity=".8">⛴</text>`;
            }
            scDef.ports.forEach(p => {
                if (uniquePorts.includes(p)) return;
                const c = MAP_PORTS[p]; if (!c) return;
                svg += `<circle cx="${c.x}" cy="${c.y}" r="4" fill="${clr}" stroke="#fff" stroke-width="1" filter="url(#gl)"/>`;
                const lb = ['HCM','LCB','JKT','SBY','BKK'].includes(p);
                svg += `<text x="${c.x}" y="${c.y + (lb ? 14 : -9)}" text-anchor="middle" fill="rgba(200,220,255,.7)" font-size="9">${this._pn(scDef, p)}</text>`;
                uniquePorts.push(p);
            });
        });

        // Owned routes + ships
        const ownedColors = ['#EF5350','#FFA726','#26C6DA','#7E57C2'];
        activeOwned.forEach((or, oi) => {
            const pkg = NEW_ROUTE_PACKAGES.find(d => d.id === or.id);
            if (!pkg) return;
            const clr = pkg.color || ownedColors[oi % ownedColors.length];
            pkg.legs.forEach(l => {
                const p1 = MAP_PORTS[l.from], p2 = MAP_PORTS[l.to];
                if (!p1 || !p2) return;
                svg += `<line x1="${p1.x}" y1="${p1.y}" x2="${p2.x}" y2="${p2.y}" stroke="${clr}" stroke-width="2.5" stroke-dasharray="10 4" opacity=".8"/>`;
            });
            const orVoy = or.voyage || { dayCounter: 0 };
            const orProg = (orVoy.dayCounter || 0) / (pkg.rotationDays || 14);
            const otl = pkg.legs.length;
            const oli = Math.min(Math.floor(orProg * otl), otl - 1);
            const olp = (orProg * otl) - oli;
            const ol = pkg.legs[oli];
            const op1 = MAP_PORTS[ol.from], op2 = MAP_PORTS[ol.to];
            if (op1 && op2) {
                const ox = op1.x + (op2.x - op1.x) * Math.min(olp, 1);
                const oy = op1.y + (op2.y - op1.y) * Math.min(olp, 1);
                svg += `<text x="${ox}" y="${oy}" text-anchor="middle" dominant-baseline="central" font-size="18">🚢</text>`;
                svg += `<text x="${ox}" y="${oy + 14}" text-anchor="middle" fill="${clr}" font-size="7" font-weight="700">${D(pkg,'name').split('(')[1]?.replace(')','') || pkg.id}</text>`;
            }
            pkg.ports.forEach(p => {
                if (uniquePorts.includes(p)) return;
                const c = MAP_PORTS[p]; if (!c) return;
                svg += `<circle cx="${c.x}" cy="${c.y}" r="4" fill="${clr}" stroke="#fff" stroke-width="1" filter="url(#gl)"/>`;
                const lb = ['HCM','LCB','JKT','SBY','BKK','PKL','MAA','BOM','PEN'].includes(p);
                svg += `<text x="${c.x}" y="${c.y + (lb ? 14 : -9)}" text-anchor="middle" fill="rgba(200,220,255,.7)" font-size="9">${this._pn(pkg, p)}</text>`;
                uniquePorts.push(p);
            });
        });

        // Main route port markers
        uniquePorts.forEach(p => {
            const c = MAP_PORTS[p]; if (!c) return;
            const isMain = r.ports.includes(p);
            const color = isMain ? '#4CAF50' : '#0054A6';
            svg += `<circle cx="${c.x}" cy="${c.y}" r="${isMain ? 5 : 3}" fill="${color}" stroke="#fff" stroke-width="1" filter="url(#gl)"/>`;
            const labelBelow = ['NBO','SHA','HCM','LCB','JKT','SBY','BKK','PKL','MAA','BOM','PEN'].includes(p);
            svg += `<text x="${c.x}" y="${c.y + (labelBelow ? 14 : -9)}" text-anchor="middle" fill="${isMain ? '#fff' : 'rgba(200,220,255,.6)'}" font-size="${isMain ? 11 : 9}" ${isMain ? 'font-weight="700"' : ''}>${this.getPortName(p)}</text>`;
        });

        // Legend
        const legendItems = [];
        legendItems.push({ name: `${D(r,'name').split('(')[1]?.replace(')','') || r.id} (${T('legend.mainShip')})`, color: '#4CAF50' });
        activeSlots.forEach((sc, si) => {
            const scDef = SLOT_CHARTERS.find(d => d.id === sc.id);
            const clr = sc.color || scDef?.color || slotColors[si % slotColors.length];
            legendItems.push({ name: (scDef ? D(scDef,'name').split('(')[1]?.replace(')','') || scDef.id : sc.id) + ` (${T('legend.slot')})`, color: clr });
        });
        activeOwned.forEach((or, oi) => {
            const pkg = NEW_ROUTE_PACKAGES.find(d => d.id === or.id);
            const clr = pkg?.color || ownedColors[oi % ownedColors.length];
            legendItems.push({ name: (pkg ? D(pkg,'name').split('(')[1]?.replace(')','') || pkg.id : or.id) + ` (${T('legend.own')})`, color: clr });
        });
        let ly = vbY + vbH - 10 - legendItems.length * 16;
        svg += `<rect x="55" y="${ly - 5}" width="160" height="${legendItems.length * 16 + 10}" rx="4" fill="rgba(0,10,20,.7)" stroke="rgba(255,255,255,.15)" stroke-width="1"/>`;
        legendItems.forEach(item => {
            svg += `<line x1="62" y1="${ly + 6}" x2="80" y2="${ly + 6}" stroke="${item.color}" stroke-width="2"/>`;
            svg += `<text x="85" y="${ly + 10}" fill="rgba(255,255,255,.7)" font-size="8">${item.name}</text>`;
            ly += 16;
        });

        svg += '</svg>';

        // Status bar at bottom
        const teu = this.getTEU();
        const portStay = this.getPortStayDays();
        const daysLeft = Math.max(0, portStay - s.voyage.daysSinceLast);
        const homeW = this.getWeather(r.ports[0]);
        const routeCount = 1 + activeSlots.length + activeOwned.length;

        // Per-leg load factors
        const legTEUs = {};
        r.legs.forEach(l => { legTEUs[`${l.from}-${l.to}`] = 0; });
        s.bookings.forEach(b => { if (legTEUs[b.leg] !== undefined) legTEUs[b.leg] += b.q20 + b.q40 * 2; });
        const legPcts = Object.entries(legTEUs).map(([leg, t]) => `${leg.split('-').join('→')} ${Math.round(t / s.ship.capacity * 100)}%`).join(' / ');

        scene.innerHTML = `
            ${svg}
            <div style="position:absolute;bottom:0;left:0;right:0;z-index:11;background:rgba(0,10,20,.85);padding:6px 12px">
                <div style="display:flex;justify-content:space-between;align-items:center;font-size:11px">
                    <span>⚓ <strong>${s.vessel}</strong> ${this.getPortName(r.ports[0])}${T('common.port')} ${T('ship.dockedShort')} — ${legPcts} — ${homeW.icon} ${homeW.desc} ${homeW.temp}° | ${T('depart.countdown')} ${daysLeft}${T('depart.daysLeft')}</span>
                    <span>🌏 ${routeCount} | 🚢 ${routeCount}${T('common.ships')}</span>
                </div>
            </div>`;
    },

    showSailScreen() {
        const s = this.state, r = s.route, v = s.voyage;
        const leg = r.legs[Math.min(v.legIdx, r.legs.length - 1)];
        const from = leg.from, to = leg.to;
        const fromN = this.getPortName(from), toN = this.getPortName(to);

        // Build SVG map
        let svg = `<svg viewBox="50 80 650 380" xmlns="http://www.w3.org/2000/svg" style="width:100%;height:100%">`;
        svg += `<defs>
            <radialGradient id="seaGrad" cx="50%" cy="50%"><stop offset="0%" stop-color="#0d3055"/><stop offset="100%" stop-color="#091e38"/></radialGradient>
            <filter id="glow"><feGaussianBlur stdDeviation="3" result="blur"/><feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
            <filter id="landShadow"><feDropShadow dx="2" dy="2" stdDeviation="3" flood-color="rgba(0,0,0,.4)"/></filter>
            <linearGradient id="landGrad" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#2a4a3a"/><stop offset="100%" stop-color="#1e3a2e"/></linearGradient>
            <linearGradient id="routeGrad" x1="0" y1="0" x2="1" y2="0"><stop offset="0%" stop-color="#4CAF50"/><stop offset="100%" stop-color="#FF6B35"/></linearGradient>
        </defs>`;
        svg += `<rect x="50" y="80" width="650" height="380" fill="url(#seaGrad)"/>`;
        for (let x = 100; x <= 650; x += 60) svg += `<line x1="${x}" y1="80" x2="${x}" y2="460" stroke="rgba(30,80,130,.15)" stroke-width=".5"/>`;
        for (let y = 100; y <= 450; y += 50) svg += `<line x1="50" y1="${y}" x2="700" y2="${y}" stroke="rgba(30,80,130,.15)" stroke-width=".5"/>`;
        for (const [, path] of Object.entries(MAP_LAND)) {
            svg += `<path d="${path}" fill="url(#landGrad)" stroke="#3a6a50" stroke-width="1.2" filter="url(#landShadow)" opacity=".85"/>`;
        }
        svg += `<text x="200" y="200" fill="rgba(150,180,160,.4)" font-size="22" font-weight="700" letter-spacing="8">${T('geo.china')}</text>`;
        svg += `<text x="475" y="175" fill="rgba(150,180,160,.4)" font-size="14" font-weight="700" letter-spacing="4">${T('geo.korea')}</text>`;
        svg += `<text x="610" y="145" fill="rgba(150,180,160,.4)" font-size="14" font-weight="700" letter-spacing="4">${T('geo.japan')}</text>`;

        const uniquePorts = [...new Set(r.legs.flatMap(l => [l.from, l.to]))];
        // All route legs
        r.legs.forEach((l, i) => {
            const p1 = MAP_PORTS[l.from], p2 = MAP_PORTS[l.to];
            if (!p1 || !p2) return;
            const done = i < v.legIdx;
            const active = i === v.legIdx;
            const color = done ? 'rgba(76,175,80,.5)' : (active ? 'url(#routeGrad)' : 'rgba(0,84,166,.25)');
            const width = active ? 3 : (done ? 2 : 1.5);
            svg += `<line x1="${p1.x}" y1="${p1.y}" x2="${p2.x}" y2="${p2.y}" stroke="${color}" stroke-width="${width}" ${active ? '' : 'stroke-dasharray="6 4"'}/>`;
            if (active) {
                svg += `<line x1="${p1.x}" y1="${p1.y}" x2="${p2.x}" y2="${p2.y}" stroke="rgba(255,107,53,.3)" stroke-width="8" stroke-linecap="round"/>`;
            }
        });

        // Ship position on active leg
        const pf = MAP_PORTS[from], pt = MAP_PORTS[to];
        if (pf && pt) {
            const mx = pf.x + (pt.x - pf.x) * v.sailProgress;
            const my = pf.y + (pt.y - pf.y) * v.sailProgress;
            svg += `<text x="${mx}" y="${my}" text-anchor="middle" dominant-baseline="central" font-size="26">🚢</text>`;
        }

        // Port markers
        uniquePorts.forEach(p => {
            const c = MAP_PORTS[p]; if (!c) return;
            const isActive = p === from || p === to;
            const color = p === to ? '#FF6B35' : (p === from ? '#4CAF50' : '#0054A6');
            const radius = isActive ? 6 : 4;
            if (isActive) {
                svg += `<circle cx="${c.x}" cy="${c.y}" r="${radius+4}" fill="none" stroke="${color}" stroke-width="1.5" opacity=".4">
                    <animate attributeName="r" values="${radius+2};${radius+7};${radius+2}" dur="2s" repeatCount="indefinite"/>
                </circle>`;
            }
            svg += `<circle cx="${c.x}" cy="${c.y}" r="${radius}" fill="${color}" stroke="#fff" stroke-width="1.5" filter="url(#glow)"/>`;
            svg += `<text x="${c.x}" y="${c.y + (p === 'NBO' || p === 'SHA' ? 16 : -10)}" text-anchor="middle" fill="${isActive ? '#fff' : 'rgba(200,220,255,.7)'}" font-size="${isActive ? 12 : 10}" ${isActive ? 'font-weight="700"' : ''}>${this.getPortName(p)}</text>`;
        });
        svg += '</svg>';

        document.getElementById('sail-map').innerHTML = svg;

        // Info
        let info = `<strong>🚢 ${s.vessel} — V.${String(v.num).padStart(3,'0')}</strong><br>`;
        info += `${fromN} → ${toN} (${leg.seaDays}${T('common.day')})`;
        const lastUnload = v.unloads[v.unloads.length - 1];
        if (lastUnload && lastUnload.unRev > 0) {
            info += `<br>${T('voyage.unload', this.getPortName(lastUnload.port), lastUnload.un20 + lastUnload.un40 * 2, lastUnload.unRev.toLocaleString())}`;
        }
        document.getElementById('sail-info').innerHTML = info;

        this.showScreen('screen-sailing');
    },

    completeVoyage() {
        const s = this.state, v = s.voyage, r = s.route;
        if (v.status !== 'sailing') return; // guard against double-call
        v.completing = false;

        // Deliver remaining
        s.bookings.forEach(b => {
            if (!b.delivered) {
                b.delivered = true;
                const dest = b.leg.split('-')[1];
                s.ctr[dest]['20'] += b.q20;
                s.ctr[dest]['40'] += b.q40;
                s.cash += b.revenue;
                s.stats.totRev += b.revenue;
            }
        });

        // Weekly fixed costs (ERP Lv6: -10%, Digital Lv7: -15%)
        const erpDiscount = (s.infra.systems || 0) >= 7 ? 0.85 : (s.infra.systems || 0) >= 6 ? 0.90 : 1.0;
        const fixedCost = Math.round(r.weeklyFixedCost * erpDiscount);
        s.cash -= fixedCost;
        v.voyExp += fixedCost;
        s.stats.totExp += fixedCost;

        // Debt interest + repayment
        const interest = Math.round(s.debt * 0.003);
        const repay = Math.min(s.debt, Math.round(r.investmentCost * 0.008));
        s.cash -= interest + repay;
        s.debt = Math.max(0, s.debt - repay);
        v.voyExp += interest + repay;
        s.stats.totExp += interest + repay;

        // Refuel & maintenance
        const refuel = Math.round((100 - s.ship.fuel) * 80);
        const maint = Math.round((100 - s.ship.condition) * 100);
        s.cash -= refuel + maint;
        v.voyExp += refuel + maint;
        s.stats.totExp += refuel + maint;
        s.ship.fuel = 100;
        s.ship.condition = 100;

        // Empty repo costs — track per port for detailed report
        let repoCost = 0;
        const repoDetails = []; // { port, portName, ex20, ex40, cost, targets[] }
        const home = r.ports[0];
        r.ports.slice(1).forEach(p => {
            const ex20 = Math.max(0, s.ctr[p]['20'] - 8);
            const ex40 = Math.max(0, s.ctr[p]['40'] - 5);
            if (ex20 + ex40 > 0) {
                const cost = ex20 * 50 + ex40 * 80;
                repoCost += cost;
                // Find target customers at this port for suggestions
                const portCusts = s.custs[p] || [];
                const targets = portCusts
                    .filter(c => c.share < 30)
                    .sort((a, b) => a.difficulty - b.difficulty)
                    .slice(0, 3)
                    .map(c => `${c.icon}${D(c,'name')}`);
                const sellTo = (r.salesPorts[p]?.sellTo || []).map(d => this.getPortName(d)).join('/');
                repoDetails.push({ port: p, portName: this.getPortName(p), ex20, ex40, cost, targets, sellTo });
                s.ctr[p]['20'] -= ex20; s.ctr[p]['40'] -= ex40;
                s.ctr[home]['20'] += ex20; s.ctr[home]['40'] += ex40;
            }
        });
        if (repoCost > 0) { v.voyExp += repoCost; s.cash -= repoCost; s.stats.totExp += repoCost; }

        const totTEU = s.bookings.reduce((sum, b) => sum + b.q20 + b.q40 * 2, 0);
        const profit = v.voyRev - v.voyExp;
        s.stats.totVoy++;
        s.stats.totTEU += totTEU;
        s.stats.lastProfit = profit;

        // Calculate load factors per bound direction (EB/WB or SB/NB)
        const legBoundMap = {};
        r.legs.forEach(l => { legBoundMap[`${l.from}-${l.to}`] = l.bound || 'EB'; });
        const bounds = this.getRouteBounds(r);
        const b1 = bounds[0], b2 = bounds[1]; // e.g. ['WB','EB'] or ['SB','NB'] or ['EB','WB']
        let b1TEU = 0, b2TEU = 0, b1Legs = 0, b2Legs = 0;
        r.legs.forEach(l => {
            if (l.bound === b1) b1Legs++; else b2Legs++;
        });
        s.bookings.forEach(b => {
            const bTEU = b.q20 + b.q40 * 2;
            if (legBoundMap[b.leg] === b2) b2TEU += bTEU; else b1TEU += bTEU;
        });
        const b1Avg = b1Legs > 0 ? Math.round(b1TEU / b1Legs) : 0;
        const b2Avg = b2Legs > 0 ? Math.round(b2TEU / b2Legs) : 0;
        const lfEB = Math.min(100, Math.round((b1Avg / s.ship.capacity) * 100));
        const lfWB = Math.min(100, Math.round((b2Avg / s.ship.capacity) * 100));
        const lfTotal = Math.round(((b1Avg + b2Avg) / 2 / s.ship.capacity) * 100);
        s.stats.lastLoadFactor = lfTotal;
        // Calculate sales activity costs during this voyage period
        const voyStartDay = s.gameDay - r.rotationDays;
        const voyLogs = s.activityLog.filter(l => l.day >= voyStartDay);
        const salesActCost = voyLogs.reduce((sum, l) => sum + (l.cost || 0), 0);
        const boosterCost = v.boosterCost || 0;
        const repoCostUser = v.repoCostUser || 0; // user-initiated repositioning

        s.stats.history.push({
            voy: v.num, rev: v.voyRev, exp: v.voyExp, profit, teu: totTEU, lf: lfTotal, lfEB, lfWB,
            // Detailed cost breakdown
            fuelPort: v.voyExp - r.weeklyFixedCost - interest - repay - refuel - maint - repoCost,
            fixedCost: r.weeklyFixedCost,
            interestRepay: interest + repay,
            refuelMaint: refuel + maint,
            repoCostAuto: repoCost,
            repoCostUser,
            salesActCost,
            boosterCost,
        });

        // Show report as modal, stay on game screen
        this.renderReport(v, totTEU, profit, refuel, maint, repoCost, repoDetails);

        // Restore ship scene and transition to port
        this.restoreShipScene();
        s.voyage.status = 'port';
        s.voyage.daysSinceLast = 0;
        s.voyage.num++;
        s.bookings = [];
        this.updateAll();

        // Show report modal
        document.getElementById('report-content').querySelector('button')?.remove(); // remove old "다음 항차" button
        this.openModal('modal-report');
        this.addFeed(`📊 V.${String(v.num).padStart(3,'0')} ${T('voy.complete')} ${T('voy.revenue')} $${v.voyRev.toLocaleString()} / ${T('voy.expense')} $${v.voyExp.toLocaleString()} / ${T('fin.profit')} $${profit.toLocaleString()}`, profit >= 0 ? 'booking' : 'alert');
        this.addFeed(`🏗️ V.${String(s.voyage.num).padStart(3,'0')} ${T('voy.salesStart')} ${r.rotationDays}${T('common.day')}`, 'alert');
    },

    renderReport(v, teu, profit, refuel, maint, repo, repoDetails) {
        const s = this.state, r = s.route;
        const lastH = s.stats.history[s.stats.history.length - 1] || {};
        const lf = lastH.lf || s.stats.lastLoadFactor;
        const lfEB = lastH.lfEB || 0;
        const lfWB = lastH.lfWB || 0;
        const bounds = this.getRouteBounds(r);
        const b1Short = this.getBoundShort(bounds[0]);
        const b2Short = this.getBoundShort(bounds[1]);
        const b1Label = this.getBoundLabel(r, bounds[0]);
        const b2Label = this.getBoundLabel(r, bounds[1]);
        const byLeg = {};
        const legBoundMap = {};
        r.legs.forEach(l => { legBoundMap[`${l.from}-${l.to}`] = l.bound || bounds[0]; });
        s.bookings.forEach(b => {
            if (!byLeg[b.leg]) byLeg[b.leg] = { rev: 0, teu: 0, bound: legBoundMap[b.leg] || bounds[0] };
            byLeg[b.leg].rev += b.revenue;
            byLeg[b.leg].teu += b.q20 + b.q40 * 2;
        });

        // Build repo warning with specific segments, target customers, and action buttons
        let repoHtml = '';
        if (repo > 0 && repoDetails && repoDetails.length > 0) {
            // Find available salespeople for assignment
            const availSales = s.salesTeam.map(st => `<option value="${st.id}">${st.avatar} ${st.name}</option>`).join('');
            repoHtml = `<div class="rpt-warn">
                <div style="margin-bottom:6px">${T('voyage.repoCost', repo.toLocaleString())}</div>
                ${repoDetails.map(rd => `
                    <div style="margin:6px 0;padding:8px;background:rgba(0,0,0,.2);border-radius:6px;font-size:12px">
                        <div>${T('voyage.repoDetail', rd.portName, rd.ex20 + rd.ex40, rd.cost.toLocaleString())}</div>
                        <div style="margin-top:4px;color:var(--t2)">${T('voyage.segmentSales', rd.portName, rd.sellTo)}</div>
                        ${rd.targets.length > 0 ? `<div style="margin-top:3px;color:var(--accent)">${T('voyage.targetCust', rd.targets.join(', '))}</div>` : ''}
                        <div style="margin-top:6px;display:flex;gap:6px;align-items:center">
                            <select id="repo-assign-${rd.port}" style="flex:1;padding:4px 6px;border-radius:4px;border:1px solid var(--border);background:var(--card);color:var(--t1);font-size:11px">${availSales}</select>
                            <button class="btn-sm" onclick="Game.assignPortFocus('${rd.port}',document.getElementById('repo-assign-${rd.port}').value)" style="white-space:nowrap;padding:4px 10px">${T('voyage.assign')}</button>
                        </div>
                    </div>
                `).join('')}
            </div>`;
        }

        document.getElementById('report-content').innerHTML = `
            <h3>📊 V.${String(v.num).padStart(3, '0')} ${T('voy.complete')}</h3>
            <div class="rpt-grid">
                <div class="rpt-stat"><span class="v" style="color:var(--green)">$${v.voyRev.toLocaleString()}</span><span class="l">${T('fin.freightRev')}</span></div>
                <div class="rpt-stat"><span class="v" style="color:var(--red)">$${v.voyExp.toLocaleString()}</span><span class="l">${T('voy.expense')}</span></div>
                <div class="rpt-stat"><span class="v" style="color:${profit >= 0 ? 'var(--green)' : 'var(--red)'}">$${profit.toLocaleString()}</span><span class="l">${T('fin.profit')}</span></div>
                <div class="rpt-stat"><span class="v" style="font-size:13px"><span style="color:${lfEB >= 50 ? 'var(--green)' : 'var(--red)'}">${b1Short} ${lfEB}%</span> / <span style="color:${lfWB >= 50 ? 'var(--green)' : 'var(--red)'}">${b2Short} ${lfWB}%</span></span><span class="l" style="font-size:9px">${b1Label} / ${b2Label}</span></div>
            </div>
            <div class="rpt-section"><h4>📦 ${T('fin.voyage')}</h4>
                ${Object.entries(byLeg).map(([leg, d]) => {
                    const p = leg.split('-');
                    const bLabel = this.getBoundShort(d.bound);
                    const bColor = d.bound === bounds[1] ? '#FF9800' : '#4CAF50';
                    return `<div class="rpt-ctr"><span style="display:inline-block;width:30px;font-size:9px;color:${bColor};font-weight:700">${bLabel}</span> ${this.getPortName(p[0])}→${this.getPortName(p[1])}: ${d.teu}TEU / $${d.rev.toLocaleString()}</div>`;
                }).join('') || `<div class="rpt-ctr" style="color:var(--t3)">${T('voy.noCargo')}</div>`}
            </div>
            ${repoHtml}
            <div class="rpt-section"><h4>📈 ${T('fin.cumProfit')}</h4>
                <div class="rpt-row"><span class="lbl">${T('fin.cashLabel')}</span><span class="${s.cash >= 0 ? 'pos' : 'neg'}">$${Math.round(s.cash).toLocaleString()}</span></div>
                <div class="rpt-row"><span class="lbl">${T('fin.debtLabel')}</span><span class="neg">$${Math.round(s.debt).toLocaleString()}</span></div>
                <div class="rpt-row"><span class="lbl">${T('rank.voyages')}</span><span>${s.stats.totVoy}</span></div>
                <div class="rpt-row"><span class="lbl">TEU</span><span>${s.stats.totTEU} TEU</span></div>
            </div>
            <div class="rpt-tip">${TIPS[Math.floor(Math.random() * TIPS.length)]}</div>
        `;
    },

    afterReport() {
        const s = this.state;
        s.voyage.status = 'port';
        s.voyage.daysSinceLast = 0;
        s.voyage.num++;
        s.bookings = [];

        this.showScreen('screen-game');
        this.updateAll();
        this.startTick();
        this.addFeed(`🏗️ V.${String(s.voyage.num).padStart(3,'0')} ${T('voy.salesStart')} ${s.route.rotationDays}${T('common.day')}`, 'alert');
    },

    // ==================== EVENTS ====================
    showEvent(evt) {
        document.getElementById('evt-title').textContent = D(evt,'title');
        document.getElementById('evt-desc').textContent = D(evt,'desc');
        document.getElementById('evt-actions').innerHTML = evt.choices.map((c, i) =>
            `<div style="margin:6px 0">
                <button class="btn-primary" style="width:100%" onclick="Game.resolveEvt(${JSON.stringify(c.effect).replace(/"/g, '&quot;')})">${D(c,'text')}</button>
                ${c.detail ? `<p style="font-size:10px;color:var(--t2);margin-top:4px;text-align:left;padding:0 8px">${D(c,'detail')}</p>` : ''}
            </div>`
        ).join('');
        this.openModal('modal-event');
    },

    resolveEvt(eff) {
        const s = this.state, v = s.voyage;
        if (s.safetyScore === undefined) s.safetyScore = 50;

        // Track safety choices: risky = condLoss/breakdownRisk/cargoRisk, safe = cost only
        const isRisky = eff.condLoss || eff.breakdownRisk || eff.cargoRisk;
        const isSafe = eff.cost && !isRisky;
        if (isRisky) {
            s.safetyScore = Math.max(0, s.safetyScore - 8);
            this.addFeed(T('safety.riskDown', s.safetyScore), 'warn');
        } else if (isSafe) {
            s.safetyScore = Math.min(100, s.safetyScore + 3);
            this.addFeed(T('safety.safeUp', s.safetyScore), 'good');
        }

        if (eff.cost) { s.cash -= eff.cost; v.voyExp += eff.cost; s.stats.totExp += eff.cost; }
        if (eff.save) { s.cash += eff.save; }
        if (eff.condLoss) {
            s.ship.condition = Math.max(0, s.ship.condition - eff.condLoss);
            this.toast(T('accident.hullToast', s.ship.condition), s.ship.condition < 50 ? 'err' : 'warn');
        }
        // Cargo damage risk
        if (eff.cargoRisk && Math.random() < eff.cargoRisk) {
            const damaged = s.bookings.filter(b => !b.delivered);
            if (damaged.length > 0) {
                const b = damaged[Math.floor(Math.random() * damaged.length)];
                const loss = Math.round(b.revenue * 0.12);
                b.revenue -= loss;
                v.voyRev -= loss;
                this.toast(T('accident.cargoLoss', b.custName, loss.toLocaleString()), 'err');
            }
        }
        // Customer loyalty loss
        if (eff.loyaltyLoss) {
            for (const port in s.custs) {
                s.custs[port].forEach(c => {
                    if (c.share > 0) c.loyalty = Math.max(0, c.loyalty - eff.loyaltyLoss);
                });
            }
            this.toast(T('cust.trustDown'), 'warn');
        }
        // Loyalty boost to all customers (e.g., rescue events)
        if (eff.loyaltyAll) {
            for (const port in s.custs) {
                s.custs[port].forEach(c => {
                    c.loyalty = Math.min(100, c.loyalty + eff.loyaltyAll);
                });
            }
            this.toast(T('cust.trustUp'), 'ok');
        }
        // Chain event: breakdown risk
        if (eff.breakdownRisk && Math.random() < eff.breakdownRisk) {
            const chainEvt = VOYAGE_EVENTS.find(e => e.isChained);
            if (chainEvt) {
                this.closeModal('modal-event');
                setTimeout(() => this.showEvent(chainEvt), 800);
                return;
            }
        }
        this.closeModal('modal-event');
        this.startTick();
    },

    // ==================== TABS ====================
    showTab(tabId) {
        document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
        document.querySelectorAll('.tab-panel').forEach(p => p.classList.remove('active'));
        document.getElementById(tabId).classList.add('active');
        const btns = document.querySelectorAll('.tab');
        const panels = ['tab-sales', 'tab-customers', 'tab-containers', 'tab-invest', 'tab-report', 'tab-finance', 'tab-ranking'];
        btns[panels.indexOf(tabId)]?.classList.add('active');

        if (tabId === 'tab-sales') this.renderSalesTeam();
        if (tabId === 'tab-customers') this.renderCustomers();
        if (tabId === 'tab-containers') this.renderContainers();
        if (tabId === 'tab-invest') this.renderInvestments();
        if (tabId === 'tab-report') this.renderActivityReport();
        if (tabId === 'tab-finance') this.renderFinance();
        if (tabId === 'tab-ranking') this.renderRanking();
    },

    renderSalesTeam() {
        const s = this.state;

        // Market condition bar (port-level seasonal indicators)
        let html = '';
        if (typeof MARKET_SEASONS !== 'undefined') {
            html += '<div style="display:flex;gap:6px;margin-bottom:8px;flex-wrap:wrap">';
            s.route.ports.forEach(p => {
                const mc = this.getMarketCondition(p);
                const pn = this.getPortName(p);
                const trendIcon = mc.trend === 'boom' ? '🔥' : mc.trend === 'up' ? '📈' : mc.trend === 'slump' ? '📉' : mc.trend === 'down' ? '↘️' : '➡️';
                const trendColor = mc.trend === 'boom' ? 'var(--green)' : mc.trend === 'up' ? '#8BC34A' : mc.trend === 'slump' ? 'var(--red)' : mc.trend === 'down' ? '#FF9800' : 'var(--t3)';
                const ratePct = Math.round((mc.rateMult - 1) * 100);
                const sign = ratePct >= 0 ? '+' : '';
                html += `<div style="flex:1;min-width:60px;padding:6px 8px;background:var(--card2);border-radius:6px;border-left:3px solid ${trendColor};font-size:10px;text-align:center">
                    <div style="font-weight:600">${pn}</div>
                    <div style="font-size:14px">${trendIcon}</div>
                    <div style="color:${trendColor};font-weight:700">${sign}${ratePct}%</div>
                </div>`;
            });
            html += '</div>';
        }

        // Global strategy button
        const gs = s.globalStrategy || { strategy: 'lowest-share', actPreset: 'balanced' };
        const gsStrat = SALES_STRATEGIES.find(x => x.id === gs.strategy);
        const gsPreset = ACTIVITY_PRESETS.find(x => x.id === gs.actPreset);
        html += `<div style="margin-bottom:10px;padding:10px;background:var(--card2);border-radius:8px;border:1px solid var(--border);cursor:pointer" onclick="Game.openPlanConfig('global')">
            <div style="font-size:12px;font-weight:600;margin-bottom:4px">${T('sales.globalStrategy')}</div>
            <div style="font-size:11px;color:var(--t2)">${gsStrat ? gsStrat.icon + ' ' + ({'lowest-share':'strategy.lowestShare','largest-first':'strategy.largestFirst','easiest-first':'strategy.easiestFirst','cheap-cargo':'strategy.cheapCargo','port-focus':'strategy.portFocus','steal-cargo':'strategy.stealCargo'}[gsStrat.id] ? T({'lowest-share':'strategy.lowestShare','largest-first':'strategy.largestFirst','easiest-first':'strategy.easiestFirst','cheap-cargo':'strategy.cheapCargo','port-focus':'strategy.portFocus','steal-cargo':'strategy.stealCargo'}[gsStrat.id]) : gsStrat.name) : '-'} | ${gsPreset ? gsPreset.icon + ' ' + ({'balanced':'preset.balanced','email-phone':'preset.emailPhone','visit-main':'preset.visitMain','entertain-main':'preset.entertainMain','pioneer':'preset.pioneer'}[gsPreset.id] ? T({'balanced':'preset.balanced','email-phone':'preset.emailPhone','visit-main':'preset.visitMain','entertain-main':'preset.entertainMain','pioneer':'preset.pioneer'}[gsPreset.id]) : gsPreset.name) : T('preset.balanced')}</div>
        </div>`;

        html += s.salesTeam.map(st => {
            const stars = '⭐'.repeat(st.skill) + '☆'.repeat(5 - st.skill);
            const actInfo = st.activity && st.activity !== 'rest' ? SALES_ACTIVITIES.find(a => a.id === st.activity) : null;
            const isResting = st.activity === 'rest';
            const targetCust = st.actTarget ? this.findCust(st.actTarget) : null;
            const isIdle = !st.activity;
            const progressPct = st.actProgress ? Math.round(st.actProgress * 100) : 0;
            const plan = st.plan || gs;
            const pStrat = SALES_STRATEGIES.find(x => x.id === plan.strategy);
            const pPreset = ACTIVITY_PRESETS.find(x => x.id === plan.actPreset);
            const t = st.traits || {};
            return `
            <div class="sales-card ${isIdle ? 'idle' : ''}">
                <div class="sales-avatar" style="cursor:pointer" onclick="event.stopPropagation();Game.showSalesDetail('${st.id}')">${st.avatar}</div>
                <div class="sales-info">
                    <div class="sales-name">${st.name} <span class="skill-stars" style="font-size:10px">${stars}</span></div>
                    <div class="sales-stats">
                        <span>💰 $${st.salary}/${T('common.month')}</span>
                        <span>⚡ ${Math.round(st.stamina)}%</span>
                        <span>📊 ${st.exp}XP | 📦 ${st.totalTEU || 0}TEU</span>
                    </div>
                    <div class="trait-mini">
                        <span data-tip="${T('sales.negotiationTip')}">🤝${t.negotiation||0}</span>
                        <span data-tip="${T('sales.faceTip')}">🚶${t.faceToFace||0}</span>
                        <span data-tip="${T('sales.digitalTip')}">💻${t.digital||0}</span>
                        <span data-tip="${T('sales.relationTip')}">💛${t.relationship||0}</span>
                    </div>
                    <div class="sales-bar"><div class="sales-bar-fill" style="width:${st.stamina}%;background:${st.stamina > 30 ? 'var(--green)' : 'var(--red)'}"></div></div>
                    ${actInfo ? `<div class="sales-bar" style="margin-top:2px"><div class="sales-bar-fill" style="width:${progressPct}%;background:var(--blue)"></div></div>` : ''}
                    <div class="plan-badge">${pStrat ? pStrat.icon : '📉'} ${pStrat ? D(pStrat,'name') : '?'} <span>|</span> ${pPreset ? pPreset.icon : '⚖️'} ${pPreset ? D(pPreset,'name') : '?'}</div>
                </div>
                <div style="display:flex;flex-direction:column;align-items:flex-end;gap:4px">
                    ${actInfo ? `<div class="sales-activity"><div class="dot"></div>${actInfo.icon} ${targetCust ? D(targetCust,'name') : ''}<br><span style="font-size:9px;color:var(--t3)">${progressPct}%</span></div>` :
                      isResting ? '<div class="sales-activity" style="color:var(--yellow)">' + T('sales.resting') + '</div>' :
                      '<div class="sales-activity" style="color:var(--accent)">' + T('sales.waiting') + '</div>'}
                    <button class="btn-sm" onclick="event.stopPropagation();Game.openPlanConfig('${st.id}')">${T('sales.editPlan')}</button>
                </div>
            </div>`;
        }).join('');

        document.getElementById('sales-team-list').innerHTML = html;
    },

    recruitSales(id) {
        const s = this.state;
        // Check bench pool (includes draft unpicked + fired + scout pool)
        let r = (s.benchPool || []).find(p => p.id === id);
        if (!r || !this.canAfford(r.recruitCost)) { this.toast(T('inv.debtOver'), 'err'); return; }
        if (s.stats.totRev < (r.unlockRev || 0)) { this.toast(T('inv.revNotMet'), 'err'); return; }
        s.cash -= r.recruitCost;
        s.stats.totExp += r.recruitCost;
        s.salesTeam.push({
            ...r, exp: r.exp || 0, stamina: 100, activity: null, actTarget: null, actTargetPort: null, actProgress: 0, actDaysLeft: 0,
            plan: { ...s.globalStrategy },
        });
        s.benchPool = s.benchPool.filter(p => p.id !== id);
        this.toast(r.name + ' ' + T('recruit.complete'), 'ok');
        this.addFeed(T('recruit.joined', r.name, r.skill), 'alert');
        this.renderSalesTeam();
        this.renderInvestments();
        this.updateHUD();
    },

    fireSales(stId) {
        const s = this.state;
        if (s.salesTeam.length <= 1) {
            this.toast(T('sales.minRequired'), 'err');
            return;
        }
        const st = s.salesTeam.find(t => t.id === stId);
        if (!st) return;
        // Severance pay
        const severance = Math.round(st.salary * 2);
        s.cash -= severance;
        s.stats.totExp += severance;
        // Move to bench pool for possible re-hire
        if (!s.benchPool) s.benchPool = [];
        s.benchPool.push({ ...st, recruitCost: Math.round(st.salary * 3), unlockRev: 0 });
        s.salesTeam = s.salesTeam.filter(t => t.id !== stId);
        this.toast(T('fire.complete', st.name, severance.toLocaleString()), 'ok');
        this.addFeed(T('fire.feed', st.name, severance.toLocaleString()), 'alert');
        this.closeModal('modal-assign');
        this.renderSalesTeam();
        this.renderInvestments();
        this.updateHUD();
    },

    showSalesDetail(stId) {
        const s = this.state;
        const st = s.salesTeam.find(t => t.id === stId);
        if (!st) return;
        const t = st.traits || {};
        const stars = '⭐'.repeat(st.skill) + '☆'.repeat(5 - st.skill);
        const isJa = CURRENT_LANG === 'ja';

        const orig = [...(typeof ALL_SALES_CHARACTERS !== 'undefined' ? ALL_SALES_CHARACTERS : []), ...RECRUIT_POOL].find(x => x.id === stId);
        const strength = st.strength || orig?.strength || '';
        const weakness = st.weakness || orig?.weakness || '';

        const logs = s.activityLog.filter(l => l.spName === st.name);
        const total = logs.length;
        const successes = logs.filter(l => l.success).length;
        const totalRev = logs.reduce((sum, l) => sum + (l.revenue || 0), 0);

        // Build customer assignment checklist
        let custCheckHtml = '';
        const allPorts = Object.keys(s.custs);
        let assignedCount = 0;
        allPorts.forEach(port => {
            const portCusts = (s.custs[port] || []).filter(c => c.difficulty <= (s.infra.training + 1 + ((s.infra.systems || s.infra.it || 0) >= 2 ? 1 : 0)));
            if (portCusts.length === 0) return;
            custCheckHtml += `<div style="font-size:10px;color:var(--accent);font-weight:700;margin:6px 0 3px;padding-top:4px;border-top:1px solid var(--border)">📍 ${this.getPortName(port)}</div>`;
            portCusts.forEach(c => {
                const checked = c.assignedSales === st.id;
                if (checked) assignedCount++;
                const otherSP = c.assignedSales && c.assignedSales !== st.id ? s.salesTeam.find(x => x.id === c.assignedSales) : null;
                const otherLabel = otherSP ? `<span style="font-size:9px;color:var(--t3)"> (→${otherSP.name.split(' ')[0]})</span>` : '';
                custCheckHtml += `<label style="display:flex;align-items:center;gap:6px;padding:4px 6px;margin:1px 0;border-radius:4px;cursor:pointer;font-size:11px;background:${checked ? 'rgba(0,84,166,.12)' : 'transparent'};border:1px solid ${checked ? 'var(--blue)' : 'transparent'}" onmouseover="this.style.background='rgba(255,255,255,.05)'" onmouseout="this.style.background='${checked ? 'rgba(0,84,166,.12)' : 'transparent'}'">
                    <input type="checkbox" ${checked ? 'checked' : ''} onchange="Game.toggleCustAssign('${c.id}','${port}','${st.id}',this.checked)" style="accent-color:var(--blue)">
                    <span>${c.icon}</span>
                    <span style="flex:1">${D(c,'name')} <span style="color:var(--t3);font-size:9px">${'⭐'.repeat(c.difficulty)}</span>${otherLabel}</span>
                    <span style="font-size:10px;color:${c.share > 30 ? 'var(--green)' : 'var(--t3)'}">${Math.round(c.share)}%</span>
                </label>`;
            });
        });

        let html = `<div class="sp-detail">
            <div class="sp-detail-header">
                <div class="sp-detail-avatar">${st.avatar}</div>
                <div>
                    <div style="font-size:16px;font-weight:700">${st.name} <span style="font-size:12px">${stars}</span></div>
                    <div style="font-size:11px;color:var(--t2)">${st.desc || orig?.desc || ''}</div>
                    <div style="font-size:11px;color:var(--t3);margin-top:2px">💰 $${st.salary}/${T('common.month')} | ⚡ ${Math.round(st.stamina)}% | 📊 ${st.exp}XP | 📦 ${st.totalTEU || 0}TEU</div>
                </div>
            </div>
            <div style="font-size:11px;color:var(--t2);margin-bottom:4px">${T('sales.stats')}</div>
            <div class="sp-detail-traits">
                ${Object.entries(TRAIT_INFO).map(([key, info]) => {
                    const val = t[key] || 0;
                    return `<div class="trait-bar">
                        <div class="trait-label">${info.icon} ${D(info,'name')} (${val}/5)</div>
                        <div style="height:6px;background:var(--bg);border-radius:3px;overflow:hidden">
                            <div class="trait-fill" style="width:${val * 20}%"></div>
                        </div>
                    </div>`;
                }).join('')}
            </div>
            <div class="sp-sw str">💪 <strong>${T('sales.strengthLabel')}</strong> ${strength}</div>
            <div class="sp-sw wk">⚠️ <strong>${T('sales.weaknessLabel')}</strong> ${weakness}</div>
            <div style="display:flex;gap:12px;font-size:12px;margin-top:8px">
                <span>${total}${T('fin.cases')}</span>
                <span style="color:var(--green)">${T('fin.successRate')} ${successes}${T('fin.cases')} (${total > 0 ? Math.round(successes/total*100) : 0}%)</span>
                <span>${T('sales.booked')} $${totalRev.toLocaleString()}</span>
            </div>

            <div style="margin-top:12px;border-top:1px solid var(--border);padding-top:8px">
                <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:4px">
                    <span style="font-size:12px;font-weight:700">📋 ${isJa ? '担当荷主' : '담당 화주'} (${assignedCount})</span>
                    <button class="btn-sm" onclick="Game.clearAllCustAssign('${st.id}')" style="font-size:9px;padding:2px 8px">${isJa ? '全解除' : '전체 해제'}</button>
                </div>
                <div style="max-height:180px;overflow-y:auto;border:1px solid var(--border);border-radius:6px;padding:4px">
                    ${custCheckHtml}
                </div>
                <div style="font-size:9px;color:var(--t3);margin-top:3px">${isJa ? '✅ チェックした荷主を優先的に営業します（70%確率）' : '✅ 체크한 화주를 우선적으로 영업합니다 (70% 확률)'}</div>
            </div>

            <div class="sp-rename" style="margin-top:8px">
                <input id="sp-rename-input" value="${st.name}" maxlength="10" placeholder="${T('sales.renamePH')}">
                <button class="btn-sm" onclick="Game.renameSales('${st.id}')">${T('common.change')}</button>
            </div>
            <div id="fire-area" style="margin-top:10px">
                <button class="btn-sm" id="btn-fire-init"
                    onclick="document.getElementById('btn-fire-init').style.display='none';document.getElementById('fire-confirm').style.display='flex'"
                    style="width:100%;background:#6b2020;color:#ff8888;border:1px solid #ff4444;padding:10px">
                    👋 ${T('sales.fire')} ($${Math.round(st.salary * 2).toLocaleString()})
                </button>
                <div id="fire-confirm" style="display:none;gap:8px;align-items:center">
                    <span style="font-size:12px;color:#ff8888;flex:1">${T('sales.fireConfirm')}</span>
                    <button class="btn-sm" onclick="Game.fireSales('${st.id}')"
                        style="background:#b71c1c;color:white;padding:8px 16px;border:1px solid #ff4444;font-weight:700">${T('common.ok')}</button>
                    <button class="btn-sm" onclick="document.getElementById('btn-fire-init').style.display='';document.getElementById('fire-confirm').style.display='none'"
                        style="background:var(--card2);padding:8px 16px">${T('common.cancel')}</button>
                </div>
            </div>
        </div>`;

        document.getElementById('assign-title').textContent = `${st.avatar} ${st.name}`;
        document.getElementById('assign-body').innerHTML = html;
        this.openModal('modal-assign');
    },

    toggleCustAssign(custId, port, salesId, checked) {
        const s = this.state;
        const c = s.custs[port]?.find(x => x.id === custId);
        if (!c) return;
        if (checked) {
            c.assignedSales = salesId;
        } else {
            if (c.assignedSales === salesId) c.assignedSales = null;
        }
        // Refresh the modal
        this.showSalesDetail(salesId);
    },

    clearAllCustAssign(salesId) {
        const s = this.state;
        for (const port in s.custs) {
            s.custs[port].forEach(c => {
                if (c.assignedSales === salesId) c.assignedSales = null;
            });
        }
        this.showSalesDetail(salesId);
        this.toast(CURRENT_LANG === 'ja' ? '担当荷主を全解除しました' : '담당 화주를 전체 해제했습니다', 'ok');
    },
    renameSales(stId) {
        const st = this.state.salesTeam.find(t => t.id === stId);
        if (!st) return;
        const input = document.getElementById('sp-rename-input');
        const newName = input.value.trim();
        if (!newName) return;
        st.name = newName;
        this.toast(`${newName}`, 'ok');
        this.renderSalesTeam();
        this.closeModal('modal-assign');
    },

    renderCustomers() {
        const s = this.state, r = s.route;
        let html = '';
        // Combine main route ports + slot charter ports
        const allPorts = [...r.ports];
        if (s.slotCharters) {
            s.slotCharters.forEach(ch => {
                const sc = SLOT_CHARTERS.find(x => x.id === ch.id);
                if (sc) sc.ports.forEach(p => { if (!allPorts.includes(p)) allPorts.push(p); });
            });
        }
        allPorts.forEach(port => {
            const custs = s.custs[port];
            if (!custs) return;
            const portName = this.getPortName(port);
            const isSlot = !r.ports.includes(port);
            html += `<h4 style="font-size:12px;color:var(--t2);margin:8px 0 4px">📍 ${portName} ${isSlot ? '<span style="font-size:9px;color:var(--accent2)">' + T('inv.slotCharter').replace(/🚢\s*/,'').split('(')[0].trim() + '</span>' : ''}</h4>`;
            html += custs.map(c => {
                const diffStars = '⭐'.repeat(c.difficulty);
                const canAccess = c.difficulty <= (s.infra.training + 1 + ((s.infra.systems || s.infra.it || 0) >= 2 ? 1 : 0));
                const hasBoost = c.boosts && c.boosts.some(b => b.daysLeft > 0);
                const erosion = this.getErosionStatus(c);

                // Color logic: erosion overrides normal share color
                let shareColor, cardBorder = '', erosionBadge = '';
                if (erosion) {
                    if (erosion.severity === 'critical') {
                        shareColor = '#ff1744';
                        cardBorder = 'border-left:3px solid #ff1744;background:rgba(255,23,68,.08)';
                        erosionBadge = `<span style="font-size:9px;color:#ff1744;font-weight:700;margin-left:4px">🚨 ${T('market.severe')} -${Math.round(erosion.erosionPct)}%</span>`;
                    } else if (erosion.severity === 'danger') {
                        shareColor = '#ff5252';
                        cardBorder = 'border-left:3px solid #ff5252;background:rgba(255,82,82,.06)';
                        erosionBadge = `<span style="font-size:9px;color:#ff5252;font-weight:600;margin-left:4px">⚠️ ${T('market.danger')} -${Math.round(erosion.erosionPct)}%</span>`;
                    } else {
                        shareColor = '#ff9100';
                        cardBorder = 'border-left:3px solid #ff9100;background:rgba(255,145,0,.05)';
                        erosionBadge = `<span style="font-size:9px;color:#ff9100;margin-left:4px">⚠ ${T('market.caution')} -${Math.round(erosion.erosionPct)}%</span>`;
                    }
                } else {
                    shareColor = c.share > 50 ? 'var(--green)' : (c.share > 20 ? 'var(--yellow)' : 'var(--t3)');
                }

                // Peak share indicator
                const peakInfo = erosion ? `<div style="font-size:9px;color:var(--t3)">${Math.round(erosion.peakShare)}% → ${Math.round(c.share)}%</div>` : '';

                return `
                <div class="cust-card" onclick="Game.showCustDetail('${c.id}','${port}')" style="cursor:pointer;${cardBorder}${!canAccess ? ';opacity:.5' : ''}">
                    <div class="cust-icon">${c.icon}</div>
                    <div class="cust-info">
                        <div class="cust-name">${D(c,'name')} <span style="font-size:10px;color:var(--t3)">${D(c,'type')}</span>${hasBoost ? ` <span style="font-size:10px;color:var(--accent)">${T('cust.boost')}</span>` : ''}${erosionBadge}</div>
                        <div class="cust-detail">${diffStars} | ${T('cust.maxVol')} 20'×${c.maxVol20} 40'×${c.maxVol40} ${!canAccess ? '| ' + T('cust.locked') : ''}${c.assignedSales ? ' | 👤' + (s.salesTeam.find(st=>st.id===c.assignedSales)?.name?.split(' ')[0] || '') : ''}</div>
                    </div>
                    <div class="cust-share">
                        <div class="cust-share-val" style="color:${shareColor}">${Math.round(c.share)}%</div>
                        <div class="share-bar"><div class="share-bar-fill" style="width:${c.share}%;${erosion ? 'background:' + shareColor : ''}"></div></div>
                        ${peakInfo}
                    </div>
                </div>`;
            }).join('');
        });
        document.getElementById('customer-list').innerHTML = html;
    },

    showCustDetail(custId, port) {
        const s = this.state, r = s.route;
        const custs = s.custs[port];
        const c = custs?.find(x => x.id === custId);
        if (!c) return;

        const canAccess = c.difficulty <= (s.infra.training + 1 + ((s.infra.systems || s.infra.it || 0) >= 2 ? 1 : 0));
        const shareColor = c.share > 50 ? 'var(--green)' : (c.share > 20 ? 'var(--yellow)' : 'var(--t3)');
        const allSalesPorts = this.getAllSalesPorts();
        const validDests = allSalesPorts[port]?.sellTo || [];
        if (!c.boosts) c.boosts = [];

        // Build destination detail with volumes
        let destDetailHtml = '';
        if (c.destPorts) {
            const destEntries = Object.entries(c.destPorts).filter(([d]) => validDests.includes(d));
            if (destEntries.length > 0) {
                destDetailHtml = destEntries.map(([dest, weight]) => {
                    const destName = this.getPortName(dest);
                    const vol20 = Math.round(c.maxVol20 * weight);
                    const vol40 = Math.round(c.maxVol40 * weight);
                    const pct = Math.round(weight * 100);
                    return `<div style="display:flex;align-items:center;gap:6px;padding:3px 0;border-bottom:1px solid var(--border)">
                        <span style="font-size:11px;min-width:60px;font-weight:600">→ ${destName}</span>
                        <div style="flex:1;height:5px;background:var(--bg);border-radius:3px;overflow:hidden">
                            <div style="width:${pct}%;height:100%;background:var(--blue);border-radius:3px"></div>
                        </div>
                        <span style="font-size:10px;color:var(--t3);min-width:30px;text-align:right">${pct}%</span>
                        <span style="font-size:10px;color:var(--t2);min-width:80px;text-align:right">20'×${vol20} / 40'×${vol40}</span>
                    </div>`;
                }).join('');
            }
        }
        if (!destDetailHtml) {
            destDetailHtml = `<div style="font-size:11px;color:var(--t3);padding:3px 0">${validDests.map(d => this.getPortName(d)).join(', ')}</div>`;
        }

        // Active boosts display
        const activeBoosts = c.boosts.filter(b => b.daysLeft > 0);
        let boostHtml = '';
        if (activeBoosts.length > 0) {
            boostHtml = `<div style="margin:8px 0;padding:6px 8px;background:rgba(76,175,80,.15);border:1px solid rgba(76,175,80,.3);border-radius:6px;font-size:11px">
                <div style="font-weight:600;margin-bottom:4px">${T('cust.boost')}</div>
                ${activeBoosts.map(b => `<div>${b.icon} ${D(b,'name')||b.name} — ${b.daysLeft}${T('common.day')}</div>`).join('')}
            </div>`;
        }

        // Booster options
        const boosters = CUSTOMER_BOOSTERS.map(bst => {
            const alreadyActive = activeBoosts.some(ab => ab.id === bst.id);
            const canBuy = s.cash >= bst.cost && !alreadyActive && canAccess;
            return `<div class="invest-item ${alreadyActive ? 'done' : (!canBuy ? 'locked' : '')}" style="margin:4px 0">
                <div class="invest-icon">${bst.icon}</div>
                <div class="invest-info">
                    <div class="invest-name">${D(bst,'name')} ${alreadyActive ? '✅' : ''}</div>
                    <div class="invest-effect">${D(bst,'effect')} (${bst.duration}${T('common.day')})</div>
                </div>
                ${alreadyActive ? '' : `<div class="invest-cost">$${bst.cost.toLocaleString()}</div>
                <button class="invest-btn" onclick="Game.applyCustBoost('${custId}','${port}','${bst.id}')" ${canBuy ? '' : 'disabled'}>${T('promo.run')}</button>`}
            </div>`;
        }).join('');

        // Erosion analysis section
        const erosion = this.getErosionStatus(c);
        let erosionHtml = '';
        if (erosion) {
            const sevColors = { critical: '#ff1744', danger: '#ff5252', warning: '#ff9100' };
            const sevColor = sevColors[erosion.severity];
            const plan = this.getRecoveryPlan(c, port, erosion);

            // Share trend mini-chart
            const trend = c.shareTrend || [];
            let trendSvg = '';
            if (trend.length >= 2) {
                const maxS = Math.max(...trend.map(t => t.share), 1);
                const w = 200, h = 40;
                const pts = trend.map((t, i) => {
                    const x = (i / (trend.length - 1)) * w;
                    const y = h - (t.share / maxS) * h;
                    return `${x},${y}`;
                }).join(' ');
                trendSvg = `<svg viewBox="0 0 ${w} ${h}" style="width:100%;height:40px;margin:4px 0">
                    <polyline points="${pts}" fill="none" stroke="${sevColor}" stroke-width="2" stroke-linejoin="round"/>
                    <polyline points="0,${h} ${pts} ${w},${h}" fill="${sevColor}" opacity=".15" stroke="none"/>
                </svg>`;
            }

            // Lost revenue estimate
            const avgRate = 300; // rough per-TEU revenue
            const lostTEU = Math.round((c.maxVol20 + c.maxVol40 * 2) * erosion.erosionPct / 100);
            const lostRevPerVoy = lostTEU * avgRate;

            erosionHtml = `
            <div style="margin:10px 0;padding:10px;background:rgba(${erosion.severity === 'critical' ? '255,23,68' : erosion.severity === 'danger' ? '255,82,82' : '255,145,0'},.1);border:1px solid ${sevColor}40;border-radius:8px">
                <div style="font-size:12px;font-weight:700;color:${sevColor};margin-bottom:6px">
                    ${erosion.severity === 'critical' ? '🚨' : '⚠️'} ${T('erosion.title')} — ${erosion.label}
                </div>
                <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:4px;margin-bottom:8px">
                    <div style="background:var(--card2);padding:5px;border-radius:4px;text-align:center">
                        <div style="font-size:14px;font-weight:700;color:${sevColor}">-${Math.round(erosion.erosionPct)}%</div>
                        <div style="font-size:9px;color:var(--t3)">${T('erosion.decrease')}</div>
                    </div>
                    <div style="background:var(--card2);padding:5px;border-radius:4px;text-align:center">
                        <div style="font-size:14px;font-weight:700;color:${sevColor}">${Math.round(erosion.peakShare)}%→${Math.round(c.share)}%</div>
                        <div style="font-size:9px;color:var(--t3)">${T('erosion.trend')}</div>
                    </div>
                    <div style="background:var(--card2);padding:5px;border-radius:4px;text-align:center">
                        <div style="font-size:14px;font-weight:700;color:#ff5252">-$${lostRevPerVoy.toLocaleString()}</div>
                        <div style="font-size:9px;color:var(--t3)">${T('erosion.lossPerVoy')}</div>
                    </div>
                </div>
                ${trendSvg ? `<div style="font-size:10px;color:var(--t3);margin-bottom:2px">${T('erosion.recentTrend')}</div>${trendSvg}` : ''}
                <div style="font-size:10px;color:var(--t3);margin-bottom:2px">${T('erosion.recentEvents', erosion.recentEvents, lostTEU)}</div>

                <div style="font-size:12px;font-weight:700;margin:10px 0 6px;color:var(--t1)">${T('erosion.recovery', plan.estimatedDays)}</div>
                ${plan.recs.map((rec, i) => {
                    const canAfford = rec.cost === 0 || s.cash >= rec.cost;
                    const impactColor = rec.impact.includes(T('erosion.high')) || rec.impact.includes(T('erosion.veryHigh')) ? 'var(--green)' : (rec.impact.includes(T('erosion.mid')) ? 'var(--yellow)' : 'var(--t3)');
                    return `<div style="display:flex;align-items:center;gap:6px;padding:6px;margin:3px 0;background:var(--card2);border-radius:6px;${!canAfford ? 'opacity:.5' : ''}">
                        <div style="font-size:18px;min-width:24px;text-align:center">${rec.icon}</div>
                        <div style="flex:1;min-width:0">
                            <div style="font-size:11px;font-weight:600">${rec.name}</div>
                            <div style="font-size:9px;color:var(--t3)">${rec.desc}</div>
                            <div style="display:flex;gap:8px;margin-top:2px;font-size:9px">
                                <span style="color:${impactColor}">${T('erosion.effect')} ${rec.impact}</span>
                                ${rec.days > 0 ? `<span style="color:var(--t3)">⏱ ${T('erosion.duration', rec.days)}</span>` : `<span style="color:var(--t3)">⏱ ${T('common.immediately')}</span>`}
                            </div>
                        </div>
                        <div style="text-align:right;min-width:60px">
                            ${rec.cost > 0 ? `<div style="font-size:11px;font-weight:700;color:var(--accent)">$${rec.cost.toLocaleString()}</div>` : `<div style="font-size:11px;font-weight:700;color:var(--green)">${T('common.free')}</div>`}
                        </div>
                    </div>`;
                }).join('')}
                <div style="font-size:9px;color:var(--t3);margin-top:6px;text-align:center">
                    ${T('erosion.totalCost', plan.recs.reduce((s, r) => s + r.cost, 0).toLocaleString())}
                </div>
            </div>`;
        }

        const html = `
            <div style="text-align:center;margin-bottom:10px">
                <div style="font-size:36px">${c.icon}</div>
                <div style="font-size:16px;font-weight:700">${D(c,'name')}</div>
                <div style="font-size:11px;color:var(--t3)">${D(c,'type')} | ${this.getPortName(port)} | ${'⭐'.repeat(c.difficulty)} ${T('cust.difficulty')}</div>
            </div>
            <div style="display:grid;grid-template-columns:1fr 1fr;gap:6px;margin-bottom:10px">
                <div style="background:var(--card2);padding:8px;border-radius:6px;text-align:center">
                    <div style="font-size:18px;font-weight:700;color:${shareColor}">${Math.round(c.share)}%</div>
                    <div style="font-size:10px;color:var(--t3)">${T('cust.share')}</div>
                </div>
                <div style="background:var(--card2);padding:8px;border-radius:6px;text-align:center">
                    <div style="font-size:18px;font-weight:700">${c.loyalty}</div>
                    <div style="font-size:10px;color:var(--t3)">${T('cust.loyalty')}</div>
                </div>
            </div>
            <div style="font-size:11px;color:var(--t2);margin-bottom:6px">
                ${T('cust.totalMaxVol', c.maxVol20, c.maxVol40)}
            </div>
            <div style="font-size:11px;color:var(--t2);margin-bottom:6px">
                <div style="font-weight:600;margin-bottom:3px">${T('cust.destAllocation')}</div>
                ${destDetailHtml}
            </div>
            ${!canAccess ? `<div style="color:var(--red);font-size:11px;margin-bottom:8px">${T('cust.lockedMsg')}</div>` : ''}
            ${erosionHtml}
            ${boostHtml}
            <div style="margin-top:10px;margin-bottom:10px">
                <div style="font-size:12px;font-weight:600;margin-bottom:6px">${CURRENT_LANG === 'ja' ? '👤 担当営業マン' : '👤 담당 영업사원'}</div>
                <select onchange="Game.assignCustSales('${c.id}','${port}',this.value)" style="width:100%;padding:8px;border-radius:6px;border:1px solid var(--border);background:var(--bg);color:var(--t1);font-size:12px">
                    <option value="">${CURRENT_LANG === 'ja' ? '— 自動（未指定）' : '— 자동 (미지정)'}</option>
                    ${s.salesTeam.map(st => `<option value="${st.id}" ${c.assignedSales === st.id ? 'selected' : ''}>${st.avatar} ${st.name} ${st.isAI ? '🤖' : ''}</option>`).join('')}
                </select>
                ${c.assignedSales ? `<div style="font-size:9px;color:var(--accent);margin-top:3px">${CURRENT_LANG === 'ja' ? '✅ この荷主は指定営業マンが優先的に担当します' : '✅ 이 화주는 지정된 영업사원이 우선 담당합니다'}</div>` : ''}
            </div>
            <div style="margin-top:10px"><div style="font-size:12px;font-weight:600;margin-bottom:6px">${T('cust.boosters')}</div>${boosters}</div>`;

        document.getElementById('assign-title').textContent = `${c.icon} ${D(c,'name')}`;
        document.getElementById('assign-body').innerHTML = html;
        this.openModal('modal-assign');
    },

    applyCustBoost(custId, port, boostId) {
        const s = this.state;
        const c = s.custs[port]?.find(x => x.id === custId);
        if (!c) return;
        const bst = CUSTOMER_BOOSTERS.find(b => b.id === boostId);
        if (!bst || s.cash < bst.cost) { this.toast(T('cust.noMoney'), 'err'); return; }

        if (!c.boosts) c.boosts = [];
        // Remove expired, check not already active
        c.boosts = c.boosts.filter(b => b.daysLeft > 0);
        if (c.boosts.some(b => b.id === boostId)) { this.toast(T('cust.alreadyActive'), 'err'); return; }

        s.cash -= bst.cost;
        s.stats.totExp += bst.cost;
        // Track booster cost in current voyage
        if (!s.voyage.boosterCost) s.voyage.boosterCost = 0;
        s.voyage.boosterCost += bst.cost;
        c.boosts.push({ id: bst.id, name: bst.name, icon: bst.icon, daysLeft: bst.duration, ...bst.effects });

        // Apply immediate loyalty boost
        if (bst.effects.loyaltyBoost) {
            c.loyalty = Math.min(100, c.loyalty + bst.effects.loyaltyBoost);
        }

        this.toast(T('cust.boostApplied', c.icon, c.name, bst.icon, bst.name), 'ok');
        this.addFeed(T('cust.boostFeed', c.name, bst.name, bst.cost.toLocaleString()), 'booking');
        this.updateHUD();
        this.showCustDetail(custId, port); // refresh modal
    },

    assignCustSales(custId, port, salesId) {
        const s = this.state;
        const c = s.custs[port]?.find(x => x.id === custId);
        if (!c) return;
        c.assignedSales = salesId || null;
        const spName = salesId ? s.salesTeam.find(st => st.id === salesId)?.name || '' : '';
        if (salesId) {
            this.toast(`${c.icon} ${D(c,'name')} → ${spName}`, 'ok');
        }
    },

    renderContainers() {
        const s = this.state, r = s.route;
        let html = '';

        // Combine main route + slot charter ports
        const allPorts = [...r.ports];
        (s.slotCharters || []).filter(sc => sc.active).forEach(sc => {
            const scDef = SLOT_CHARTERS.find(d => d.id === sc.id);
            if (scDef) scDef.ports.forEach(p => { if (!allPorts.includes(p)) allPorts.push(p); });
        });

        // Fleet summary
        let totalEmpty = 0, totalBooked = 0, totalFleet20 = 0, totalFleet40 = 0;
        allPorts.forEach(p => {
            totalFleet20 += s.ctr[p]?.['20'] || 0;
            totalFleet40 += s.ctr[p]?.['40'] || 0;
        });
        const bookedTEU = this.getTEU();
        const booked20 = s.bookings.reduce((sum, b) => sum + b.q20, 0);
        const booked40 = s.bookings.reduce((sum, b) => sum + b.q40, 0);
        totalEmpty = totalFleet20 + totalFleet40;
        totalBooked = booked20 + booked40;
        const totalAll = totalEmpty + totalBooked;
        const utilRate = totalAll > 0 ? Math.round((totalBooked / totalAll) * 100) : 0;

        html += `<div style="margin-bottom:12px">
            <h4 style="font-size:13px;margin-bottom:8px">${T('ctr.title')}</h4>
            <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:6px;margin-bottom:8px">
                <div style="background:var(--card2);padding:8px;border-radius:6px;text-align:center">
                    <div style="font-size:18px;font-weight:700;color:var(--t1)">${totalAll}</div>
                    <div style="font-size:10px;color:var(--t3)">Total</div>
                </div>
                <div style="background:var(--card2);padding:8px;border-radius:6px;text-align:center">
                    <div style="font-size:18px;font-weight:700;color:var(--green)">${totalBooked}</div>
                    <div style="font-size:10px;color:var(--t3)">${T('ship.loading')}</div>
                </div>
                <div style="background:var(--card2);padding:8px;border-radius:6px;text-align:center">
                    <div style="font-size:18px;font-weight:700;color:${utilRate < 20 ? 'var(--red)' : (utilRate < 50 ? 'var(--yellow)' : 'var(--green)')}">${utilRate}%</div>
                    <div style="font-size:10px;color:var(--t3)">Util.</div>
                </div>
            </div>
            <div style="height:8px;background:var(--card2);border-radius:4px;overflow:hidden;margin-bottom:4px">
                <div style="height:100%;width:${utilRate}%;background:linear-gradient(90deg,var(--green),var(--accent));border-radius:4px;transition:width .3s"></div>
            </div>
            <div style="font-size:10px;color:var(--t3);text-align:right">${T('ship.loading')} ${totalBooked} / Empty ${totalEmpty}</div>
        </div>`;

        // Per-port breakdown
        html += `<h4 style="font-size:13px;margin-bottom:8px">${T('ctr.title')}</h4>`;
        const homePort = r.ports[0];
        const allSalesPorts = this.getAllSalesPorts();
        allPorts.forEach(p => {
            const e20 = s.ctr[p]?.['20'] || 0;
            const e40 = s.ctr[p]?.['40'] || 0;
            const emptyTotal = e20 + e40;
            const portBookings = s.bookings.filter(b => b.port === p && !b.delivered);
            const b20 = portBookings.reduce((sum, b) => sum + b.q20, 0);
            const b40 = portBookings.reduce((sum, b) => sum + b.q40, 0);
            const bookedHere = b20 + b40;
            const portTotal = emptyTotal + bookedHere;
            const isHome = p === homePort;
            const isSlot = !r.ports.includes(p);
            // Home port: excess if empties exceed 1.5x ship capacity; other ports: > 13
            const excessThreshold = isHome ? Math.round(s.ship.capacity * 1.5) : 13;
            const isExcess = emptyTotal > excessThreshold;
            const sellTo = (allSalesPorts[p]?.sellTo || []).map(d => this.getPortName(d)).join(', ');
            const portName = this.getPortName(p);

            html += `<div style="background:var(--card2);border-radius:8px;padding:10px;margin-bottom:8px;border-left:3px solid ${isExcess ? 'var(--red)' : (isHome ? 'var(--green)' : (isSlot ? 'var(--accent2)' : 'var(--border)'))}">
                <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:6px">
                    <span style="font-size:13px;font-weight:600">${isHome ? T('ctr.home') : (isSlot ? '⛴' : '📍')} ${portName} ${isExcess ? '<span style="color:var(--red);font-size:10px">' + T('ctr.congestion') + '</span>' : ''}</span>
                    <span style="font-size:11px;color:var(--t3)">${portTotal}</span>
                </div>
                <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;font-size:11px">
                    <div>
                        <div style="color:var(--t3);margin-bottom:2px">${T('ctr.empty')}</div>
                        <div style="display:flex;gap:12px">
                            <span>20': <strong style="color:${isExcess ? 'var(--red)' : 'var(--t1)'}">${e20}</strong></span>
                            <span>40': <strong style="color:${isExcess ? 'var(--red)' : 'var(--t1)'}">${e40}</strong></span>
                        </div>
                    </div>
                    <div>
                        <div style="color:var(--t3);margin-bottom:2px">${T('ctr.waiting')}</div>
                        <div style="display:flex;gap:12px">
                            <span>20': <strong style="color:var(--green)">${b20}</strong></span>
                            <span>40': <strong style="color:var(--green)">${b40}</strong></span>
                        </div>
                    </div>
                </div>
                ${isExcess && !isHome ? `<div style="margin-top:6px;padding:4px 6px;background:rgba(239,83,80,.1);border-radius:4px;font-size:10px;color:var(--red)">${T('ctr.excessWarn', portName, sellTo)}</div>` : ''}
                ${isExcess && isHome ? `<div style="margin-top:6px;padding:4px 6px;background:rgba(239,83,80,.1);border-radius:4px;font-size:10px;color:var(--red)">${T('ctr.homeExcess', portName, emptyTotal, excessThreshold)}</div>` : ''}
                ${!isHome && emptyTotal === 0 && bookedHere === 0 ? '<div style="margin-top:4px;font-size:10px;color:var(--t3)">' + T('ctr.none') + '</div>' : ''}
            </div>`;
        });

        // Visual distribution bar
        html += `<h4 style="font-size:13px;margin:12px 0 8px">${T('ctr.distRatio')}</h4>`;
        const colors = ['var(--green)', 'var(--accent)', 'var(--yellow)', 'var(--blue)', '#9C27B0', '#00BCD4', '#FF7043', '#66BB6A', '#42A5F5', '#AB47BC', '#26A69A', '#FFA726', '#EC407A'];
        const portData = allPorts.map((p, i) => {
            const total = (s.ctr[p]?.['20'] || 0) + (s.ctr[p]?.['40'] || 0);
            return { port: p, name: this.getPortName(p), total, color: colors[i % colors.length], isSlot: !r.ports.includes(p) };
        });
        if (totalEmpty > 0) {
            html += '<div style="display:flex;height:20px;border-radius:4px;overflow:hidden;margin-bottom:6px">';
            portData.forEach(pd => {
                const pct = Math.round((pd.total / totalEmpty) * 100);
                if (pct > 0) html += `<div style="width:${pct}%;background:${pd.color};display:flex;align-items:center;justify-content:center;font-size:9px;font-weight:600;color:#fff;min-width:${pct > 5 ? '0' : '20px'}">${pct > 8 ? pct + '%' : ''}</div>`;
            });
            html += '</div>';
            html += '<div style="display:flex;gap:12px;flex-wrap:wrap;font-size:10px">';
            portData.forEach(pd => {
                html += `<span><span style="display:inline-block;width:8px;height:8px;border-radius:2px;background:${pd.color};margin-right:3px"></span>${pd.name} ${pd.total}${T('common.unit')}</span>`;
            });
            html += '</div>';
        }

        // === Container Repositioning ===
        html += `<h4 style="font-size:13px;margin:12px 0 8px">${T('ctr.repo')}</h4>`;
        html += '<div style="background:var(--card2);border-radius:8px;padding:10px;margin-bottom:8px">';
        html += `<div style="font-size:10px;color:var(--t3);margin-bottom:8px">${T('ctr.repoDesc')}</div>`;

        // Find ports with empties (include slot charter ports)
        const portsWithEmpty = allPorts.filter(p => (s.ctr[p]?.['20'] || 0) + (s.ctr[p]?.['40'] || 0) > 0);
        const repoFromOptions = portsWithEmpty.map(p => `<option value="${p}">${this.getPortName(p)} (${T('ctr.repoFrom', (s.ctr[p]?.['20']||0)+(s.ctr[p]?.['40']||0))})${!r.ports.includes(p) ? ' ⛴' : ''}</option>`).join('');
        const repoToOptions = allPorts.map(p => `<option value="${p}">${this.getPortName(p)}${!r.ports.includes(p) ? ' ⛴' : ''}</option>`).join('');

        html += `<div style="display:grid;grid-template-columns:1fr auto 1fr;gap:6px;align-items:end;margin-bottom:8px">
            <div>
                <div style="font-size:10px;color:var(--t3);margin-bottom:3px">${T('ctr.from')}</div>
                <select id="repo-from" style="width:100%;padding:5px;background:var(--bg);color:var(--t1);border:1px solid var(--border);border-radius:4px;font-size:11px">${repoFromOptions}</select>
            </div>
            <div style="font-size:16px;color:var(--t3);padding-bottom:4px">→</div>
            <div>
                <div style="font-size:10px;color:var(--t3);margin-bottom:3px">${T('ctr.to')}</div>
                <select id="repo-to" style="width:100%;padding:5px;background:var(--bg);color:var(--t1);border:1px solid var(--border);border-radius:4px;font-size:11px">${repoToOptions}</select>
            </div>
        </div>`;
        html += `<div style="display:grid;grid-template-columns:1fr 1fr;gap:6px;margin-bottom:8px">
            <div>
                <div style="font-size:10px;color:var(--t3);margin-bottom:3px">20' ${T('ctr.qty')}</div>
                <input id="repo-q20" type="number" min="0" max="50" value="5" oninput="Game.updateRepoCost()" style="width:100%;padding:5px;background:var(--bg);color:var(--t1);border:1px solid var(--border);border-radius:4px;font-size:11px">
            </div>
            <div>
                <div style="font-size:10px;color:var(--t3);margin-bottom:3px">40' ${T('ctr.qty')}</div>
                <input id="repo-q40" type="number" min="0" max="50" value="5" oninput="Game.updateRepoCost()" style="width:100%;padding:5px;background:var(--bg);color:var(--t1);border:1px solid var(--border);border-radius:4px;font-size:11px">
            </div>
        </div>`;
        html += `<div id="repo-cost-info" style="background:var(--bg);border-radius:6px;padding:8px;margin-bottom:8px;font-size:11px">
            <div style="display:flex;justify-content:space-between;align-items:center">
                <span style="color:var(--t3)">${T('ctr.unitPrice')}</span>
                <span style="color:var(--t3)">${T('ctr.qty')}: <strong style="color:var(--t1)" id="repo-qty">10</strong>${T('common.unit')}</span>
                <span>${T('ctr.estimatedCost')} <strong style="color:var(--yellow);font-size:13px" id="repo-total-cost">$2,000</strong></span>
            </div>
            <div style="margin-top:4px;font-size:10px;color:var(--t3)">${T('ctr.autoOnDepart')} | ${T('ctr.currentCash')} <span style="color:${s.cash >= 2000 ? 'var(--green)' : 'var(--red)'}" id="repo-cash">$${Math.round(s.cash).toLocaleString()}</span></div>
        </div>`;
        html += `<div style="display:flex;justify-content:flex-end">
            <button class="btn-sm" onclick="Game.repoContainers()" style="padding:6px 20px;font-size:12px">🚛 ${T('ctr.execute')}</button>
        </div>`;

        // Show pending repos
        if (s.pendingRepos && s.pendingRepos.length > 0) {
            html += '<div style="margin-top:8px;border-top:1px solid var(--border);padding-top:8px">';
            html += `<div style="font-size:10px;color:var(--yellow);margin-bottom:4px">${T('ctr.pending')}</div>`;
            s.pendingRepos.forEach((rp, i) => {
                html += `<div style="display:flex;justify-content:space-between;align-items:center;font-size:11px;padding:3px 0">
                    <span>${this.getPortName(rp.from)} → ${this.getPortName(rp.to)}: 20'×${rp.q20} + 40'×${rp.q40}</span>
                    <button style="font-size:9px;padding:2px 6px;background:var(--red);color:#fff;border:none;border-radius:3px;cursor:pointer" onclick="Game.cancelRepo(${i})">${T('ctr.cancel')}</button>
                </div>`;
            });
            html += '</div>';
        }
        html += '</div>';

        document.getElementById('container-view').innerHTML = html;
    },

    updateRepoCost() {
        const q20 = parseInt(document.getElementById('repo-q20')?.value) || 0;
        const q40 = parseInt(document.getElementById('repo-q40')?.value) || 0;
        const total = q20 + q40;
        const cost = total * 200;
        const qtyEl = document.getElementById('repo-qty');
        const costEl = document.getElementById('repo-total-cost');
        const cashEl = document.getElementById('repo-cash');
        if (qtyEl) qtyEl.textContent = total;
        if (costEl) costEl.textContent = `$${cost.toLocaleString()}`;
        if (cashEl) {
            const cash = Math.round(this.state.cash);
            cashEl.textContent = `$${cash.toLocaleString()}`;
            cashEl.style.color = cash >= cost ? 'var(--green)' : 'var(--red)';
        }
    },

    repoContainers() {
        const s = this.state, r = s.route;
        const from = document.getElementById('repo-from').value;
        const to = document.getElementById('repo-to').value;
        const q20 = parseInt(document.getElementById('repo-q20').value) || 0;
        const q40 = parseInt(document.getElementById('repo-q40').value) || 0;

        if (from === to) { this.toast(T('ctr.samePort'), 'err'); return; }
        if (q20 + q40 <= 0) { this.toast(T('ctr.enterQty'), 'err'); return; }
        if (q20 > (s.ctr[from]?.['20'] || 0)) { this.toast(this.getPortName(from) + T('ctr.shortage20'), 'err'); return; }
        if (q40 > (s.ctr[from]?.['40'] || 0)) { this.toast(this.getPortName(from) + T('ctr.shortage40'), 'err'); return; }

        const cost = (q20 + q40) * 200;
        if (s.cash < cost) { this.toast(T('cust.noMoney'), 'err'); return; }

        // Deduct cost and empties from source
        s.cash -= cost;
        s.stats.totExp += cost;
        // Track in current voyage
        if (!s.voyage.repoCostUser) s.voyage.repoCostUser = 0;
        s.voyage.repoCostUser += cost;
        s.ctr[from]['20'] -= q20;
        s.ctr[from]['40'] -= q40;

        // Queue for delivery on next departure
        if (!s.pendingRepos) s.pendingRepos = [];
        s.pendingRepos.push({ from, to, q20, q40 });

        this.toast(T('ctr.repoBooked', this.getPortName(from), this.getPortName(to), q20 + q40) + ` ($${cost.toLocaleString()})`, 'ok');
        this.addFeed(T('ctr.repoFeed', this.getPortName(from), this.getPortName(to), q20, q40) + ` ($${cost.toLocaleString()})`, 'booking');
        this.renderContainers();
        this.updateHUD();
    },

    cancelRepo(idx) {
        const s = this.state, r = s.route;
        if (!s.pendingRepos || !s.pendingRepos[idx]) return;
        const rp = s.pendingRepos[idx];
        // Return empties to source port
        s.ctr[rp.from]['20'] += rp.q20;
        s.ctr[rp.from]['40'] += rp.q40;
        // Refund cost
        const refund = (rp.q20 + rp.q40) * 200;
        s.cash += refund;
        s.stats.totExp -= refund;
        s.pendingRepos.splice(idx, 1);
        this.toast(T('ctr.repoCancelled', `$${refund.toLocaleString()}`), 'ok');
        this.renderContainers();
        this.updateHUD();
    },

    renderInvestments() {
        const s = this.state;
        let html = '';

        // Company Training (전체)
        const afford = (c) => this.canAfford(c);
        html += `<div class="invest-section"><h4>${T('inv.training')} <span style="font-size:10px;color:var(--t3)">(${T('inv.trainingAll')})</span></h4>`;
        INVESTMENTS.training.forEach(inv => {
            const done = s.infra.training >= inv.level;
            const canBuy = !done && s.infra.training >= inv.level - 1 && afford(inv.cost);
            html += `<div class="invest-item ${done ? 'done' : (!canBuy ? 'locked' : '')}">
                <div class="invest-icon">${inv.icon}</div>
                <div class="invest-info"><div class="invest-name">${D(inv,'name')} ${done ? '✅' : `<span style="font-size:9px;color:var(--t3)">Lv.${inv.level}</span>`}</div><div class="invest-effect">${D(inv,'effect')}</div></div>
                ${done ? '' : `<div class="invest-cost">$${inv.cost.toLocaleString()}</div><button class="invest-btn" onclick="Game.invest('training',${inv.level},${inv.cost})" ${canBuy ? '' : 'disabled'}>${T('inv.invest')}</button>`}
            </div>`;
        });
        html += '</div>';

        // Personal Training (영업사원 개인별)
        html += `<div class="invest-section"><h4>${T('inv.personalTraining')} <span style="font-size:10px;color:var(--t3)">(${T('inv.personalTrainingSub')})</span></h4>`;
        html += `<div style="font-size:10px;color:var(--t3);padding:4px 8px">${T('inv.personalTrainingDesc')}</div>`;
        s.salesTeam.forEach((sp, idx) => {
            const ptLv = sp.personalTraining || 0;
            const nextPt = INVESTMENTS.personalTraining.find(p => p.level === ptLv + 1);
            const maxed = ptLv >= INVESTMENTS.personalTraining.length;
            const canBuyPt = nextPt && afford(nextPt.cost);
            html += `<div class="invest-item" style="flex-wrap:wrap">
                <div style="display:flex;align-items:center;gap:8px;width:100%">
                    <div class="invest-icon">${sp.avatar || '👤'}</div>
                    <div class="invest-info" style="flex:1;min-width:0">
                        <div class="invest-name">${sp.name} <span style="font-size:9px;color:var(--accent)">${T('sales.skill')} ${(sp.skill || 1).toFixed(1)}</span></div>
                        <div class="invest-effect" style="display:flex;gap:4px;flex-wrap:wrap">
                            ${INVESTMENTS.personalTraining.map((pt, i) => {
                                const done2 = ptLv >= pt.level;
                                return `<span style="font-size:9px;padding:1px 4px;border-radius:3px;${done2 ? 'background:var(--green);color:#000' : 'background:var(--card2);color:var(--t3)'}">${pt.icon} Lv.${pt.level}</span>`;
                            }).join('')}
                        </div>
                    </div>
                    <div style="text-align:right;flex-shrink:0">
                        ${maxed ? '<span style="font-size:10px;color:var(--green)">MAX</span>' :
                          nextPt ? `<div class="invest-cost" style="font-size:11px">$${nextPt.cost.toLocaleString()}</div>
                          <button class="invest-btn" onclick="Game.investPersonalTraining(${idx},${nextPt.level},${nextPt.cost})" ${canBuyPt ? '' : 'disabled'} style="font-size:10px;padding:3px 8px">${nextPt.icon} ${D(nextPt,'name')}</button>` : ''}
                    </div>
                </div>
            </div>`;
        });
        html += '</div>';

        // Systems (통합 경영 시스템)
        const sysLv = s.infra.systems || s.infra.it || 0;
        if (!s.infra.systems && s.infra.it) s.infra.systems = s.infra.it; // migrate
        html += `<div class="invest-section"><h4>${T('inv.systems')} <span style="font-size:10px;color:var(--t3)">(${T('inv.systemsSub')})</span></h4>`;
        INVESTMENTS.systems.forEach(inv => {
            const done = sysLv >= inv.level;
            const canBuy = !done && sysLv >= inv.level - 1 && afford(inv.cost);
            html += `<div class="invest-item ${done ? 'done' : (!canBuy ? 'locked' : '')}">
                <div class="invest-icon">${inv.icon}</div>
                <div class="invest-info" style="min-width:0">
                    <div class="invest-name">${D(inv,'name')} ${done ? '✅' : `<span style="font-size:9px;color:var(--t3)">Lv.${inv.level}</span>`}
                        <span style="font-size:8px;padding:1px 4px;border-radius:3px;background:var(--card2);color:var(--t3);margin-left:4px">${D(inv,'category')}</span>
                    </div>
                    <div class="invest-effect" style="word-break:break-word">${D(inv,'effect')}</div>
                </div>
                ${done ? '' : `<div class="invest-cost">$${inv.cost.toLocaleString()}</div><button class="invest-btn" onclick="Game.invest('systems',${inv.level},${inv.cost})" ${canBuy ? '' : 'disabled'}>${T('inv.invest')}</button>`}
            </div>`;
        });
        html += '</div>';

        // Offices (only show ports on current route, excluding home port)
        html += `<div class="invest-section"><h4>${T('inv.office')}</h4>`;
        INVESTMENTS.office.filter(inv => s.route.ports.includes(inv.port)).forEach(inv => {
            const done = s.infra.offices[inv.port];
            const canBuy = !done && afford(inv.cost);
            html += `<div class="invest-item ${done ? 'done' : (!canBuy ? 'locked' : '')}">
                <div class="invest-icon">${inv.icon}</div>
                <div class="invest-info"><div class="invest-name">${D(inv,'name')} ${done ? '✅' : ''}</div><div class="invest-effect">${D(inv,'effect')}</div></div>
                ${done ? '' : `<div class="invest-cost">$${inv.cost.toLocaleString()}</div><button class="invest-btn" onclick="Game.investOffice('${inv.port}',${inv.cost})" ${canBuy ? '' : 'disabled'}>${T('inv.establish')}</button>`}
            </div>`;
        });
        html += '</div>';

        // Ship upgrade
        html += `<div class="invest-section"><h4>${T('inv.ship')}</h4>`;
        INVESTMENTS.ship.forEach(inv => {
            const done = s.infra.shipLevel >= inv.level;
            const canBuy = !done && s.infra.shipLevel >= inv.level - 1 && afford(inv.cost);
            html += `<div class="invest-item ${done ? 'done' : (!canBuy ? 'locked' : '')}">
                <div class="invest-icon">${inv.icon}</div>
                <div class="invest-info"><div class="invest-name">${D(inv,'name')} (${inv.newCap}TEU) ${done ? '✅' : ''}</div><div class="invest-effect">${T('inv.shipCap')} ${inv.newCap}${T('inv.shipExpand')}</div></div>
                ${done ? '' : `<div class="invest-cost">$${inv.cost.toLocaleString()}</div><button class="invest-btn" onclick="Game.investShip(${inv.level},${inv.newCap},${inv.cost})" ${canBuy ? '' : 'disabled'}>${T('inv.buy')}</button>`}
            </div>`;
        });
        html += '</div>';

        // Containers — purchase per port with location-based pricing
        html += `<div class="invest-section"><h4>${T('inv.ctrBuy')}</h4>`;
        html += `<div style="font-size:10px;color:var(--t3);padding:4px 8px">${T('inv.ctrBuyDesc')}</div>`;

        // Get all active ports (main route + slot charters)
        const ctrPorts = [...s.route.ports];
        if (s.slotCharters) {
            s.slotCharters.forEach(ch => {
                const scDef = SLOT_CHARTERS.find(x => x.id === ch.id);
                if (scDef) scDef.ports.forEach(p => { if (!ctrPorts.includes(p)) ctrPorts.push(p); });
            });
        }

        // Price multiplier by location (home port = 1.0, domestic = 1.0, overseas = more expensive)
        const homePort = s.route.ports[0];
        const domesticPorts = s.route.ports.filter(p => ['PUS','USN'].includes(p));
        const getPortPriceMult = (port) => {
            if (domesticPorts.includes(port)) return 1.0;
            if (['TYO','YOK','CHB'].includes(port)) return 1.5; // Japan
            if (['NBO','SHA'].includes(port)) return 1.3; // China
            return 1.8; // SEA
        };

        // Port selector
        html += `<div style="display:flex;gap:4px;margin:6px 8px;flex-wrap:wrap">`;
        ctrPorts.forEach((p, i) => {
            const pName = this.getPortName(p);
            const mult = getPortPriceMult(p);
            const multLabel = mult > 1.0 ? ` ×${mult}` : '';
            html += `<button class="btn-sm ${i === 0 ? 'active' : ''}" id="ctr-port-${p}"
                onclick="Game._ctrPort='${p}';document.querySelectorAll('[id^=ctr-port-]').forEach(b=>b.classList.remove('active'));this.classList.add('active');Game.renderInvestments()"
                style="font-size:10px;padding:3px 8px">${pName}${multLabel}</button>`;
        });
        html += `</div>`;

        const selPort = this._ctrPort || homePort;
        const priceMult = getPortPriceMult(selPort);
        const selPortName = this.getPortName(selPort);
        const portCtr = s.ctr[selPort] || { '20': 0, '40': 0 };
        html += `<div style="font-size:10px;color:var(--accent2);padding:2px 8px">📍 ${selPortName} — ${T('inv.ctrCurrent')} 20':${portCtr['20']} / 40':${portCtr['40']}${priceMult > 1 ? ` | ${T('inv.ctrPrice')} ×${priceMult}` : ''}</div>`;

        INVESTMENTS.containers.forEach(inv => {
            const adjCost = Math.round(inv.cost * priceMult);
            const canBuy = afford(adjCost);
            html += `<div class="invest-item">
                <div class="invest-icon">${inv.icon}</div>
                <div class="invest-info"><div class="invest-name">${D(inv,'name')}</div><div class="invest-effect">${T('inv.deploy', selPortName)}</div></div>
                <div class="invest-cost">$${adjCost.toLocaleString()}</div>
                <button class="invest-btn" onclick="Game.buyContainers(${inv.add20},${inv.add40},${adjCost},'${selPort}')" ${canBuy ? '' : 'disabled'}>${T('inv.buy')}</button>
            </div>`;
        });
        html += '</div>';

        // Recruitment — all from benchPool (draft unpicked + fired + scout pool)
        const allRecruits = (s.benchPool || []).filter(r => !s.salesTeam.find(st => st.id === r.id));
        html += `<div class="invest-section"><h4>${T('inv.recruit')}</h4>`;
        html += `<div style="font-size:10px;color:var(--t3);padding:4px 8px">${T('inv.recruitCurrent')} ${s.salesTeam.length}${T('common.people')} | ${T('inv.recruitFire')}: ${T('tab.sales')} → ${T('sales.fire')} | ${T('inv.recruitPool')}: ${allRecruits.length}${T('common.people')}</div>`;
        if (allRecruits.length === 0) {
            html += `<div style="font-size:11px;color:var(--t3);padding:8px">${T('inv.allRecruited')}</div>`;
        }
        // Sort: unlocked first, then by skill desc
        allRecruits.sort((a, b) => {
            const aUnlocked = s.stats.totRev >= (a.unlockRev || 0) ? 1 : 0;
            const bUnlocked = s.stats.totRev >= (b.unlockRev || 0) ? 1 : 0;
            if (aUnlocked !== bUnlocked) return bUnlocked - aUnlocked;
            return (b.skill || 0) - (a.skill || 0);
        });
        allRecruits.forEach(r => {
            const unlocked = s.stats.totRev >= (r.unlockRev || 0);
            const canBuy = unlocked && afford(r.recruitCost);
            const t = r.traits || {};
            const tierLabel = (r.skill >= 5) ? `<span style="font-size:9px;color:#FFD700">${T('tier.legend')}</span>` :
                              (r.skill >= 4) ? `<span style="font-size:9px;color:#C0C0C0">${T('tier.high')}</span>` :
                              (r.skill >= 3) ? `<span style="font-size:9px;color:#CD7F32">${T('tier.mid')}</span>` : '';
            html += `<div class="invest-item ${!unlocked ? 'locked' : ''}">
                <div class="invest-icon">${r.avatar}</div>
                <div class="invest-info">
                    <div class="invest-name">${r.name} ${'⭐'.repeat(r.skill || 1)} ${tierLabel} ${r.position ? '<span style="font-size:9px;color:var(--accent2)">'+r.position+'</span>' : ''} ${!unlocked ? '🔒' : ''}</div>
                    <div class="invest-effect">${r.desc || ''}</div>
                    <div class="trait-mini" style="margin-top:2px">
                        <span data-tip="${T('draft.negotiation')}">🤝${t.negotiation||0}</span>
                        <span data-tip="${T('draft.faceToFace')}">🚶${t.faceToFace||0}</span>
                        <span data-tip="${T('draft.digital')}">💻${t.digital||0}</span>
                        <span data-tip="${T('draft.relationship')}">💛${t.relationship||0}</span>
                        <span data-tip="${T('draft.attack')}">⚔️${t.attack||0}</span>
                        <span data-tip="${T('draft.defense')}">🛡️${t.defense||0}</span>
                        <span data-tip="${T('draft.vitality')}">💪${t.vitality||0}</span>
                        ${r.isAI ? '<span style="color:#00BCD4;font-weight:700">🤖AI</span>' : ''}
                        <span style="color:var(--t3)">| 💰 $${r.salary}/${T('common.month')}</span>
                    </div>
                    ${!unlocked ? `<div style="font-size:9px;color:var(--yellow);margin-top:2px">${T('inv.unlockAt')} $${(r.unlockRev/1e3).toFixed(0)}K</div>` : ''}
                </div>
                <div class="invest-cost">$${r.recruitCost.toLocaleString()}</div>
                <button class="invest-btn" onclick="Game.recruitSales('${r.id}')" ${canBuy ? '' : 'disabled'}>${T('inv.scout')}</button>
            </div>`;
        });
        html += '</div>';

        // === New Route Expansion ===
        if (typeof NEW_ROUTE_PACKAGES !== 'undefined') {
            html += `<div class="invest-section"><h4>${T('inv.newRoute')}</h4>`;
            html += `<div style="font-size:10px;color:var(--t3);padding:4px 8px">${T('inv.newRouteDesc')}</div>`;
            if (!s.ownedRoutes) s.ownedRoutes = [];
            NEW_ROUTE_PACKAGES.filter(pkg => {
                // Hide counter-routes that don't match the starting route
                if (pkg.requireStartRoute && s.route.id !== pkg.requireStartRoute) return false;
                return true;
            }).forEach(pkg => {
                const owned = s.ownedRoutes.find(o => o.id === pkg.id);
                const unlocked = s.stats.totRev >= (pkg.unlockRevenue || 0);
                const canBuy = !owned && unlocked && afford(pkg.totalInvestment);
                const portList = pkg.ports.map(p => this._pn(pkg, p)).join(' → ');
                // Loan calculation: how much is needed beyond current cash
                const shortage = Math.max(0, pkg.totalInvestment - Math.max(0, s.cash));
                const needsLoan = unlocked && !canBuy && shortage > 0;
                const loanRate = shortage <= 500000 ? 6 : shortage <= 2000000 ? 5 : 4.5;
                const loanFee = Math.round(shortage * 0.01);
                const monthlyRepay = Math.round(shortage / 24); // 24개월 상환
                const monthlyInterest = Math.round(shortage * loanRate / 100 / 12);

                if (owned) {
                    const orExpanded = this._expandedWithdrawRoute === pkg.id;
                    // Calculate withdrawal values
                    const shipSaleValue = Math.round(pkg.shipCount * pkg.shipCostEach * 0.50);
                    const ctrSaleValue = Math.round(pkg.containerCost * 0.30);
                    const officeSaleValue = Math.round(pkg.officePorts.length * pkg.officeCostEach * 0.20);
                    const totalRecovery = shipSaleValue + ctrSaleValue + officeSaleValue;
                    // Find related loan
                    const routeLoan = (s.loans || []).find(l => l.id === 'loan_route_' + pkg.id);
                    const loanRemaining = routeLoan ? Math.round(routeLoan.amount * 0.8) : 0; // assume ~80% remains
                    const netRecovery = totalRecovery - loanRemaining;

                    html += `<div class="invest-item active-promo" style="border-left:3px solid ${pkg.color};flex-wrap:wrap">
                        <div style="display:flex;align-items:center;gap:8px;width:100%">
                            <div class="invest-icon">🌏</div>
                            <div class="invest-info" style="flex:1">
                                <div class="invest-name">${D(pkg,'name')} <span style="font-size:9px;color:var(--green)">${T('inv.operating')}</span> <span style="font-size:9px;color:var(--t3)">V.${owned.voyNum || 0}</span></div>
                                <div class="invest-effect">${portList} | ${pkg.vesselSize}TEU × ${pkg.shipCount}${T('common.ships')} | ${pkg.rotationDays}${T('common.day')}</div>
                            </div>
                            <button class="btn-sm" onclick="Game._expandedWithdrawRoute=Game._expandedWithdrawRoute==='${pkg.id}'?null:'${pkg.id}';Game.renderInvestments()" style="font-size:9px;padding:2px 6px;background:var(--card2);color:var(--red)">${orExpanded ? T('withdraw.collapse') : T('withdraw.btn')}</button>
                        </div>
                        ${orExpanded ? `<div style="width:100%;margin-top:8px;padding:10px;background:rgba(244,67,54,.05);border:1px solid var(--red);border-radius:8px;font-size:11px">
                            <div style="font-weight:700;color:var(--red);margin-bottom:8px">${T('withdraw.routeTitle')}</div>
                            <table style="width:100%;border-collapse:collapse;font-size:11px">
                                <tr style="border-bottom:1px solid var(--border)">
                                    <td style="padding:4px 0;color:var(--green)">${T('withdraw.shipSale')} (${pkg.shipCount}${T('common.ships')}, ${T('withdraw.marketRate')} 50%)</td>
                                    <td style="text-align:right;color:var(--green);font-weight:600">+$${shipSaleValue.toLocaleString()}</td>
                                </tr>
                                <tr style="border-bottom:1px solid var(--border)">
                                    <td style="padding:4px 0;color:var(--green)">${T('withdraw.ctrDispose')} (${T('withdraw.marketRate')} 30%)</td>
                                    <td style="text-align:right;color:var(--green);font-weight:600">+$${ctrSaleValue.toLocaleString()}</td>
                                </tr>
                                <tr style="border-bottom:1px solid var(--border)">
                                    <td style="padding:4px 0;color:var(--green)">${T('withdraw.officeClose')} (${pkg.officePorts.length}${T('common.places')}, ${T('withdraw.deposit')} 20%)</td>
                                    <td style="text-align:right;color:var(--green);font-weight:600">+$${officeSaleValue.toLocaleString()}</td>
                                </tr>
                                ${routeLoan ? `<tr style="border-bottom:1px solid var(--border)">
                                    <td style="padding:4px 0;color:var(--red)">${T('withdraw.loanRepay')}</td>
                                    <td style="text-align:right;color:var(--red);font-weight:600">-$${loanRemaining.toLocaleString()}</td>
                                </tr>` : ''}
                                <tr style="font-weight:700;${netRecovery >= 0 ? 'color:var(--green)' : 'color:var(--red)'}">
                                    <td style="padding:6px 0">${T('withdraw.netRecovery')}</td>
                                    <td style="text-align:right;font-size:13px">${netRecovery >= 0 ? '+' : ''}$${netRecovery.toLocaleString()}</td>
                                </tr>
                            </table>
                            <div style="margin-top:6px;padding:6px;background:var(--card2);border-radius:6px;font-size:10px;color:var(--t3)">
                                ${T('withdraw.warnMarket')}<br>
                                ${T('withdraw.warnOffice')}
                            </div>
                            <button class="btn-primary" onclick="Game.withdrawOwnedRoute('${pkg.id}')" style="width:100%;margin-top:8px;background:var(--red);font-size:12px">
                                ${T('withdraw.confirmRoute')} (${netRecovery >= 0 ? '+' : ''}$${netRecovery.toLocaleString()})
                            </button>
                        </div>` : ''}
                    </div>`;
                } else {
                    const shipTotal = pkg.shipCount * pkg.shipCostEach;
                    const officeTotal = pkg.officePorts.length * pkg.officeCostEach;
                    const expanded = this._expandedRoute === pkg.id;

                    html += `<div class="invest-item" style="border-left:3px solid ${pkg.color};flex-wrap:wrap;${!unlocked ? 'opacity:.5' : ''}">
                        <div style="display:flex;align-items:center;gap:8px;width:100%">
                            <div class="invest-icon">🌏</div>
                            <div class="invest-info" style="flex:1;min-width:0">
                                <div class="invest-name">${D(pkg,'name')} ${!unlocked ? '🔒' : ''} <span style="font-size:9px;color:${pkg.color}">${D(pkg,'difficulty')}</span></div>
                                <div class="invest-effect" style="word-break:break-word">${portList}</div>
                                <div style="font-size:10px;color:var(--t3)">${pkg.vesselSize}TEU × ${pkg.shipCount}${T('common.ships')} | ${pkg.rotationDays}${T('common.day')}</div>
                                ${!unlocked ? `<div style="font-size:10px;color:var(--yellow);margin-top:3px;font-weight:600">🔒 ${T('inv.unlockAt')} $${pkg.unlockRevenue >= 1e6 ? (pkg.unlockRevenue/1e6).toFixed(0)+'M' : (pkg.unlockRevenue/1e3).toFixed(0)+'K'}<br><span style="font-size:9px;font-weight:400">${T('inv.currentRev')}: $${this._shortNum(s.stats.totRev)} (${Math.min(100, Math.round(s.stats.totRev / pkg.unlockRevenue * 100))}%)</span></div>` : ''}
                            </div>
                            <div style="text-align:right;flex-shrink:0">
                                <div class="invest-cost">$${pkg.totalInvestment.toLocaleString()}</div>
                                ${unlocked ? `<button class="btn-sm" onclick="Game._expandedRoute=Game._expandedRoute==='${pkg.id}'?null:'${pkg.id}';Game.renderInvestments()" style="font-size:9px;padding:2px 6px;margin-top:3px">${expanded ? T('inv.collapse') : T('inv.detail')}</button>` : ''}
                            </div>
                        </div>`;

                    if (expanded && unlocked) {
                        html += `<div style="width:100%;margin-top:8px;padding:10px;background:var(--bg);border-radius:8px;font-size:11px">
                            <div style="font-weight:700;margin-bottom:8px;color:var(--t1)">${T('inv.investSheet')}</div>
                            <table style="width:100%;border-collapse:collapse;font-size:11px">
                                <tr style="border-bottom:1px solid var(--border)">
                                    <td style="padding:4px 0">${T('inv.shipItem')} (${pkg.vesselSize}TEU × ${pkg.shipCount}${T('common.ships')})</td>
                                    <td style="text-align:right;font-weight:600">$${shipTotal.toLocaleString()}</td>
                                </tr>
                                <tr style="border-bottom:1px solid var(--border)">
                                    <td style="padding:4px 0">${T('inv.ctrItem')} (20'×${pkg.containerSet['20']} + 40'×${pkg.containerSet['40']})</td>
                                    <td style="text-align:right;font-weight:600">$${pkg.containerCost.toLocaleString()}</td>
                                </tr>
                                ${pkg.officePorts.map(op => `<tr style="border-bottom:1px solid var(--border)">
                                    <td style="padding:4px 0">${T('inv.officeItem')} ${this._pn(pkg, op)}</td>
                                    <td style="text-align:right;font-weight:600">$${pkg.officeCostEach.toLocaleString()}</td>
                                </tr>`).join('')}
                                <tr style="font-weight:700;color:var(--accent)">
                                    <td style="padding:6px 0">${T('inv.totalInvest')}</td>
                                    <td style="text-align:right;font-size:13px">$${pkg.totalInvestment.toLocaleString()}</td>
                                </tr>
                            </table>
                            <div style="margin-top:8px;padding:6px;background:var(--card2);border-radius:6px;font-size:10px;color:var(--t3)">
                                <div>⛽ ${T('inv.fuelPerDay')}: $${pkg.fuelCostPerDay.toLocaleString()} | ${T('inv.portFees')}: $${pkg.portFeesPerCall.toLocaleString()} | ${T('inv.weeklyFixed')}: $${pkg.weeklyFixedCost.toLocaleString()}</div>
                            </div>`;

                        if (unlocked) {
                            // 신규 항로는 반드시 대출 연계
                            const loanAmt = Math.max(shortage, Math.round(pkg.totalInvestment * 0.4)); // 최소 40% 대출
                            const dispRate = loanAmt <= 500000 ? 6 : loanAmt <= 2000000 ? 5 : 4.5;
                            const dispFee = Math.round(loanAmt * 0.01);
                            const dispMonthly = Math.round(loanAmt / 24);
                            const dispInterest = Math.round(loanAmt * dispRate / 100 / 12);
                            html += `<div style="margin-top:10px;padding:10px;background:rgba(33,150,243,.1);border:1px solid var(--accent);border-radius:8px">
                                <div style="font-weight:700;font-size:12px;color:var(--accent);margin-bottom:6px">${T('inv.loanTitle')}</div>
                                <div style="font-size:10px;color:var(--t2);display:grid;grid-template-columns:1fr 1fr;gap:4px">
                                    <span>${T('inv.totalInvestLabel')}: $${pkg.totalInvestment.toLocaleString()}</span>
                                    <span>${T('inv.equity')}: $${Math.round(pkg.totalInvestment - loanAmt).toLocaleString()}</span>
                                    <span>${T('inv.loanAmt')}: <strong style="color:var(--accent)">$${loanAmt.toLocaleString()}</strong></span>
                                    <span>${T('inv.annualRate')}: <strong style="color:var(--yellow)">${dispRate}%</strong></span>
                                    <span>${T('inv.monthlyRepay')}: ~$${dispMonthly.toLocaleString()}</span>
                                    <span>${T('inv.monthlyInterest')}: ~$${dispInterest.toLocaleString()}</span>
                                </div>
                                <div style="font-size:9px;color:var(--t3);margin-top:4px">${T('ctr.repayNote', dispFee.toLocaleString())}</div>
                                <button class="btn-primary" onclick="Game.buyNewRouteWithLoan('${pkg.id}')" ${s.cash >= (pkg.totalInvestment - loanAmt) ? '' : 'disabled'} style="width:100%;margin-top:8px;font-size:12px;background:#1565C0">
                                    ${T('inv.loanExec')}
                                </button>
                                ${s.cash < (pkg.totalInvestment - loanAmt) ? `<div style="font-size:9px;color:var(--red);margin-top:4px">${T('inv.equityShort')}</div>` : ''}
                            </div>`;
                        } else {
                            html += `<button class="btn-primary" disabled style="width:100%;margin-top:10px;font-size:12px">${T('inv.noFunds')}</button>`;
                        }
                        html += `</div>`;
                    }
                    html += '</div>';
                }
            });
            html += '</div>';
        }

        // Slot Charters
        if (typeof SLOT_CHARTERS !== 'undefined') {
            html += `<div class="invest-section"><h4>${T('inv.slotCharter')}</h4>`;
            html += `<div style="font-size:10px;color:var(--t3);padding:4px 8px">${T('inv.slotCharterDesc')}</div>`;
            if (!s.slotCharters) s.slotCharters = [];
            SLOT_CHARTERS.forEach(sc => {
                const owned = s.slotCharters.find(o => o.id === sc.id);
                const unlocked = s.stats.totRev >= (sc.unlockRevenue || 0);
                const portList = sc.ports.map(p => this._pn(sc, p)).join(' → ');
                const scOfficePorts = sc.officePorts || sc.ports.filter(p => p !== 'PUS');
                const scOfficeCost = (sc.officeCostEach || 25000) * scOfficePorts.length;
                const scTotalCost = sc.slotCost + scOfficeCost;
                const canBuy = !owned && unlocked && afford(scTotalCost);
                const scShortage = Math.max(0, scTotalCost - Math.max(0, s.cash));
                const scNeedsLoan = unlocked && !canBuy && !owned && scShortage > 0;
                const scLoanRate = 8;
                const scMonthlyRepay = Math.round(scShortage / 12);
                const scMonthlyInterest = Math.round(scShortage * scLoanRate / 100 / 12);

                if (owned) {
                    const scExpanded = this._expandedWithdrawSC === sc.id;
                    const scSlotRefund = Math.round(sc.slotCost * 0.30);
                    const scOfficeRefund = Math.round(scOfficePorts.length * (sc.officeCostEach || 25000) * 0.20);
                    const scTotalRecovery = scSlotRefund + scOfficeRefund;
                    const scLoan = (s.loans || []).find(l => l.id === 'loan_slot_' + sc.id);
                    const scLoanRemain = scLoan ? Math.round(scLoan.amount * 0.8) : 0;
                    const scNetRecovery = scTotalRecovery - scLoanRemain;

                    html += `<div class="invest-item active-promo" style="border-left:3px solid ${sc.color};flex-wrap:wrap">
                        <div style="display:flex;align-items:center;gap:8px;width:100%">
                            <div class="invest-icon">🚢</div>
                            <div class="invest-info" style="flex:1">
                                <div class="invest-name">${D(sc,'name')} <span style="font-size:9px;color:var(--green)">${T('inv.operating')}</span></div>
                                <div class="invest-effect">${D(sc,'carrier')} ${sc.vesselName} | ${portList}</div>
                                <div style="font-size:10px;color:var(--t3);margin-top:2px">📦 ${sc.slotCapacity} TEU | 💰 ${T('inv.perVoyage')} $${sc.slotFeePerVoyage.toLocaleString()} | V.${owned.voyNum || 1}</div>
                            </div>
                            <button class="btn-sm" onclick="Game._expandedWithdrawSC=Game._expandedWithdrawSC==='${sc.id}'?null:'${sc.id}';Game.renderInvestments()" style="font-size:9px;padding:2px 6px;background:var(--card2);color:var(--red)">${scExpanded ? T('withdraw.collapse') : T('withdraw.btn')}</button>
                        </div>
                        ${scExpanded ? `<div style="width:100%;margin-top:8px;padding:10px;background:rgba(244,67,54,.05);border:1px solid var(--red);border-radius:8px;font-size:11px">
                            <div style="font-weight:700;color:var(--red);margin-bottom:8px">${T('withdraw.scTitle')}</div>
                            <table style="width:100%;border-collapse:collapse;font-size:11px">
                                <tr style="border-bottom:1px solid var(--border)">
                                    <td style="padding:4px 0;color:var(--green)">${T('withdraw.slotCancel')} (30%)</td>
                                    <td style="text-align:right;color:var(--green);font-weight:600">+$${scSlotRefund.toLocaleString()}</td>
                                </tr>
                                <tr style="border-bottom:1px solid var(--border)">
                                    <td style="padding:4px 0;color:var(--green)">${T('withdraw.officeClose')} (${scOfficePorts.length}${T('common.places')}, ${T('withdraw.deposit')} 20%)</td>
                                    <td style="text-align:right;color:var(--green);font-weight:600">+$${scOfficeRefund.toLocaleString()}</td>
                                </tr>
                                ${scLoan ? `<tr style="border-bottom:1px solid var(--border)">
                                    <td style="padding:4px 0;color:var(--red)">${T('withdraw.loanRepay')}</td>
                                    <td style="text-align:right;color:var(--red);font-weight:600">-$${scLoanRemain.toLocaleString()}</td>
                                </tr>` : ''}
                                <tr style="font-weight:700;${scNetRecovery >= 0 ? 'color:var(--green)' : 'color:var(--red)'}">
                                    <td style="padding:6px 0">${T('withdraw.netRecovery')}</td>
                                    <td style="text-align:right;font-size:13px">${scNetRecovery >= 0 ? '+' : ''}$${scNetRecovery.toLocaleString()}</td>
                                </tr>
                            </table>
                            <div style="margin-top:6px;padding:6px;background:var(--card2);border-radius:6px;font-size:10px;color:var(--t3)">
                                ${T('withdraw.warnMarket')}<br>
                                ${T('withdraw.warnSlot')}
                            </div>
                            <button class="btn-primary" onclick="Game.withdrawSlotCharter('${sc.id}')" style="width:100%;margin-top:8px;background:var(--red);font-size:12px">
                                ${T('withdraw.confirmSC')} (${scNetRecovery >= 0 ? '+' : ''}$${scNetRecovery.toLocaleString()})
                            </button>
                        </div>` : ''}
                    </div>`;
                } else {
                    html += `<div class="invest-item" style="border-left:3px solid ${sc.color};flex-wrap:wrap;${!unlocked ? 'opacity:.5' : ''}">
                        <div style="display:flex;align-items:center;gap:8px;width:100%">
                            <div class="invest-icon">🚢</div>
                            <div class="invest-info" style="flex:1;min-width:0">
                                <div class="invest-name">${D(sc,'name')} ${!unlocked ? '🔒' : ''} <span style="font-size:9px;color:${sc.color}">${D(sc,'difficulty')}</span></div>
                                <div class="invest-effect" style="word-break:break-word">${T('inv.slotVessel', D(sc,'carrier'), sc.slotCapacity)}</div>
                                <div style="font-size:10px;color:var(--t3);margin-top:2px">${T('inv.slotRotation', portList, sc.rotationDays)}</div>
                                <div style="font-size:10px;color:var(--t2);margin-top:2px">
                                    ${T('inv.slotCostDetail', sc.slotCost.toLocaleString(), scOfficePorts.length, scOfficeCost.toLocaleString())}
                                </div>
                                <div style="font-size:10px;color:var(--yellow);margin-top:2px">${T('inv.perVoyage')}: $${sc.slotFeePerVoyage.toLocaleString()}</div>
                                ${!unlocked ? `<div style="font-size:10px;color:var(--yellow);margin-top:3px;font-weight:600">🔒 ${T('inv.unlockAt')} $${sc.unlockRevenue >= 1e6 ? (sc.unlockRevenue/1e6).toFixed(0)+'M' : (sc.unlockRevenue/1e3).toFixed(0)+'K'}<br><span style="font-size:9px;font-weight:400">${T('inv.currentRev')}: $${this._shortNum(s.stats.totRev)} (${Math.min(100, Math.round(s.stats.totRev / sc.unlockRevenue * 100))}%)</span></div>` : ''}
                            </div>
                            <div style="text-align:right;flex-shrink:0">
                                <div class="invest-cost">$${scTotalCost.toLocaleString()}</div>
                                ${canBuy ? `<button class="invest-btn" onclick="Game.buySlotCharter('${sc.id}')">${T('inv.buy')}</button>` : ''}
                            </div>
                        </div>`;

                    if (scNeedsLoan) {
                        html += `<div style="width:100%;margin-top:8px;padding:8px;background:rgba(33,150,243,.1);border:1px solid var(--accent);border-radius:8px;font-size:10px">
                            <div style="font-weight:700;color:var(--accent);margin-bottom:4px">${T('inv.slotLoan')}</div>
                            <div style="color:var(--t2);display:flex;gap:8px;flex-wrap:wrap">
                                <span>${T('inv.shortage')}: <strong style="color:var(--red)">$${scShortage.toLocaleString()}</strong></span>
                                <span>${T('inv.annualRate')}: <strong style="color:var(--yellow)">${scLoanRate}%</strong></span>
                                <span>${T('inv.monthlyRepay')}: ~$${scMonthlyRepay.toLocaleString()}</span>
                                <span>${T('inv.monthlyInterest')}: ~$${scMonthlyInterest.toLocaleString()}</span>
                            </div>
                            <button class="btn-primary" onclick="Game.buySlotCharterWithLoan('${sc.id}')" style="width:100%;margin-top:6px;font-size:11px;background:#1565C0;padding:6px">
                                ${T('inv.loanSlotExec', scTotalCost.toLocaleString())}
                            </button>
                        </div>`;
                    }
                    html += '</div>';
                }
            });
            html += '</div>';
        }

        // === Bank Loans ===
        if (typeof BANK_LOANS !== 'undefined') {
            if (!s.loans) s.loans = [];
            const totalDebt = s.debt;
            const baseInvest = s.route.investmentCost;
            html += `<div class="invest-section"><h4>${T('inv.bankLoan')}</h4>`;
            html += '<div style="font-size:10px;color:var(--t3);padding:4px 8px;display:flex;justify-content:space-between">';
            html += `<span>${T('loan.currentDebt')}: $${Math.round(totalDebt).toLocaleString()}</span>`;
            html += `<span>${T('loan.history')}: ${s.loans.length}${T('fin.cases')}</span>`;
            html += '</div>';

            BANK_LOANS.forEach(loan => {
                const unlocked = s.stats.totRev >= loan.unlockRev;
                const debtLimit = baseInvest * loan.maxDebtRatio;
                const wouldExceed = (totalDebt + loan.amount) > debtLimit;
                const canTake = unlocked && !wouldExceed;
                const fee = Math.round(loan.amount * loan.originFee);
                const netAmount = loan.amount - fee;
                const monthlyInterest = Math.round(loan.amount * loan.annualRate / 100 / 12);

                html += `<div class="invest-item ${!unlocked ? 'locked' : ''}" style="border-left:3px solid ${canTake ? 'var(--accent)' : 'var(--border)'}">
                    <div class="invest-icon">${loan.icon}</div>
                    <div class="invest-info" style="flex:1">
                        <div class="invest-name">${D(loan,'name')} ${!unlocked ? '🔒' : ''}</div>
                        <div class="invest-effect">${D(loan,'desc')}</div>
                        <div style="font-size:10px;margin-top:3px;display:flex;gap:10px;flex-wrap:wrap;color:var(--t2)">
                            <span>${T('loan.amount')}: <strong style="color:var(--green)">$${loan.amount.toLocaleString()}</strong></span>
                            <span>${T('loan.rate')}: <strong style="color:var(--yellow)">${loan.annualRate}%</strong></span>
                            <span>${T('loan.fee')}: $${fee.toLocaleString()} (${(loan.originFee * 100).toFixed(1)}%)</span>
                        </div>
                        <div style="font-size:9px;margin-top:2px;color:var(--t3)">
                            ${T('loan.net')}: $${netAmount.toLocaleString()} | ${T('loan.monthInt')}: ~$${monthlyInterest.toLocaleString()} | ${T('loan.debtLimit')}: $${debtLimit.toLocaleString()}
                        </div>
                        ${!unlocked ? `<div style="font-size:9px;color:var(--yellow);margin-top:2px">${T('inv.unlockAt')} $${loan.unlockRev >= 1e6 ? (loan.unlockRev/1e6).toFixed(0)+'M' : (loan.unlockRev/1e3).toFixed(0)+'K'} — ${T('loan.available')}</div>` : ''}
                        ${unlocked && wouldExceed ? `<div style="font-size:9px;color:var(--red);margin-top:2px">${T('loan.overLimitWarn')}</div>` : ''}
                    </div>
                    <button class="invest-btn" onclick="Game.takeLoan('${loan.id}')" ${canTake ? '' : 'disabled'}>${T('loan.btn')}</button>
                </div>`;
            });
            html += '</div>';
        }

        // Promotions
        html += `<div class="invest-section"><h4>${T('inv.promo')}</h4>`;
        if (!s.promos) s.promos = [];
        PROMOTIONS.forEach(p => {
            const active = s.promos.find(ap => ap.id === p.id && ap.endsDay > s.gameDay);
            const canBuy = !active && afford(p.cost);
            html += `<div class="promo-item ${active ? 'active-promo' : ''}">
                <div class="promo-icon">${p.icon}</div>
                <div class="promo-info">
                    <div class="promo-name">${D(p,'name')} ${active ? `<span style="color:var(--yellow);font-size:10px">${T('promo.active')} (D${active.endsDay}${T('promo.until')})</span>` : ''}</div>
                    <div class="promo-effect">${D(p,'effect')}</div>
                </div>
                ${active ? '' : `<div class="promo-cost">$${p.cost.toLocaleString()}</div>
                <button class="invest-btn" onclick="Game.runPromo('${p.id}')" ${canBuy ? '' : 'disabled'}>${T('promo.run')}</button>`}
            </div>`;
        });
        html += '</div>';

        document.getElementById('invest-list').innerHTML = html;
    },

    takeLoan(loanId) {
        const s = this.state;
        const loan = BANK_LOANS.find(l => l.id === loanId);
        if (!loan) return;
        const debtLimit = s.route.investmentCost * loan.maxDebtRatio;
        if ((s.debt + loan.amount) > debtLimit) {
            this.toast(T('loan.overLimit'), 'err');
            return;
        }
        const fee = Math.round(loan.amount * loan.originFee);
        const netAmount = loan.amount - fee;

        s.cash += netAmount;
        s.debt += loan.amount;
        s.stats.totExp += fee; // origination fee is an expense
        if (!s.loans) s.loans = [];
        s.loans.push({
            id: loan.id, name: loan.name, amount: loan.amount,
            rate: loan.annualRate, fee, day: s.gameDay, ts: Date.now()
        });
        this.toast(T('loan.executed', D(loan,'name'), netAmount.toLocaleString(), fee.toLocaleString()), 'ok');
        this.addFeed(T('loan.feed', D(loan,'name'), loan.amount.toLocaleString(), loan.annualRate), 'invest');
        this.renderInvestments();
    },

    runPromo(promoId) {
        const s = this.state;
        const p = PROMOTIONS.find(x => x.id === promoId);
        if (!p || !this.canAfford(p.cost)) { this.toast(T('inv.debtOver'), 'err'); return; }
        s.cash -= p.cost;
        s.stats.totExp += p.cost;
        if (!s.promos) s.promos = [];
        s.promos.push({ id: p.id, endsDay: s.gameDay + p.duration, successBoost: p.successBoost || 0, loyaltyBoost: p.loyaltyBoost || 0, shareBoost: p.shareBoost || 0 });

        // Apply immediate effects
        if (p.loyaltyBoost) {
            for (const port in s.custs) {
                s.custs[port].forEach(c => { c.loyalty = Math.min(100, c.loyalty + p.loyaltyBoost); });
            }
        }
        if (p.shareBoost) {
            for (const port in s.custs) {
                s.custs[port].forEach(c => { if (c.share > 0) c.share = Math.min(100, c.share + p.shareBoost); });
            }
        }

        this.toast(T('promo.executed', p.icon, p.name), 'ok');
        this.addFeed(T('promo.startFeed', p.name, p.duration), 'alert');
        this.renderInvestments();
        this.updateHUD();
    },

    // ==================== SLOT CHARTER ====================
    _initSlotCharter(sc) {
        const s = this.state;
        // Initialize slot charter state
        if (!s.slotCharters) s.slotCharters = [];
        s.slotCharters.push({
            id: sc.id, voyNum: 1, daysSinceLast: 0, active: true,
            status: 'port', legIdx: 0, sailProgress: 0, bookings: [],
            voyage: { dayCounter: 0 },
        });

        // Office setup for new ports (PUS already has office)
        const officePorts = sc.officePorts || sc.ports.filter(p => p !== 'PUS');
        const officeCost = (sc.officeCostEach || 25000) * officePorts.length;
        officePorts.forEach(p => { if (!s.infra.offices) s.infra.offices = {}; s.infra.offices[p] = true; });
        s.cash -= officeCost;
        s.stats.totExp += officeCost;

        // Add customers for slot charter ports
        sc.ports.forEach(p => {
            if (!s.custs[p] && CUSTOMERS[p]) s.custs[p] = CUSTOMERS[p].map(c => ({ ...c }));
            // Containers: 20 of each per new foreign port, PUS already has some
            if (!s.ctr[p]) s.ctr[p] = { '20': 15, '40': 10 };
            else {
                // Existing port (e.g. PUS): add some extra containers for new route
                s.ctr[p]['20'] = (s.ctr[p]['20'] || 0) + 5;
                s.ctr[p]['40'] = (s.ctr[p]['40'] || 0) + 3;
            }
        });

        // Add sales ports
        if (!s.slotSalesPorts) s.slotSalesPorts = {};
        for (const port in sc.salesPorts) s.slotSalesPorts[port] = sc.salesPorts[port];

        // Expand market for slot charter lanes
        this.expandMarket(sc);

        return officeCost;
    },

    buySlotCharter(scId) {
        const s = this.state;
        const sc = SLOT_CHARTERS.find(x => x.id === scId);
        if (!sc) return;
        const officePorts = sc.officePorts || sc.ports.filter(p => p !== 'PUS');
        const officeCost = (sc.officeCostEach || 25000) * officePorts.length;
        const totalCost = sc.slotCost + officeCost;
        if (!this.canAfford(totalCost)) { this.toast(T('inv.noFunds'), 'err'); return; }
        if (s.stats.totRev < (sc.unlockRevenue || 0)) { this.toast(T('inv.revNotMet'), 'err'); return; }
        if (!s.slotCharters) s.slotCharters = [];
        if (s.slotCharters.find(o => o.id === sc.id)) { this.toast(T('inv.alreadyActive'), 'err'); return; }

        s.cash -= sc.slotCost;
        s.stats.totExp += sc.slotCost;
        s.debt += Math.round(sc.slotCost * 0.5);

        const ofc = this._initSlotCharter(sc);

        this.toast(T('inv.scStarted', D(sc,'name'), officePorts.length), 'ok');
        this.addFeed(T('inv.scFeed', sc.carrier, sc.vesselName, officePorts.length, ofc.toLocaleString()), 'alert');
        this.renderInvestments();
        this.updateHUD();
    },

    buySlotCharterWithLoan(scId) {
        const s = this.state;
        const sc = SLOT_CHARTERS.find(x => x.id === scId);
        if (!sc) return;
        if (s.stats.totRev < (sc.unlockRevenue || 0)) { this.toast(T('inv.revNotMet'), 'err'); return; }
        if (!s.slotCharters) s.slotCharters = [];
        if (s.slotCharters.find(o => o.id === sc.id)) { this.toast(T('inv.alreadyActive'), 'err'); return; }

        const officePorts = sc.officePorts || sc.ports.filter(p => p !== 'PUS');
        const officeCost = (sc.officeCostEach || 25000) * officePorts.length;
        const totalCost = sc.slotCost + officeCost;
        const shortage = Math.max(0, totalCost - Math.max(0, s.cash));
        const loanRate = 8;
        const loanFee = Math.round(shortage * 0.02);

        // Take loan for shortage amount
        s.debt += shortage;
        s.stats.totExp += loanFee;
        if (!s.loans) s.loans = [];
        s.loans.push({ id: 'loan_slot_' + sc.id, name: T('inv.scLoan', D(sc,'name')), amount: shortage, rate: loanRate, fee: loanFee, day: s.gameDay, ts: Date.now() });

        // Deduct slot cost
        s.cash -= sc.slotCost;
        s.stats.totExp += sc.slotCost;
        s.debt += Math.round(sc.slotCost * 0.5);

        // Init charter (includes office + containers)
        const ofc = this._initSlotCharter(sc);

        this.toast(T('inv.scStarted', D(sc,'name'), officePorts.length), 'ok');
        this.addFeed(T('inv.scFeed', sc.carrier, sc.vesselName, officePorts.length, ofc.toLocaleString()), 'alert');
        this.renderInvestments();
        this.updateHUD();
    },

    buyNewRouteWithLoan(pkgId) {
        const s = this.state;
        const pkg = NEW_ROUTE_PACKAGES.find(x => x.id === pkgId);
        if (!pkg) return;
        if (s.stats.totRev < (pkg.unlockRevenue || 0)) { this.toast(T('inv.revNotMet'), 'err'); return; }
        if (!s.ownedRoutes) s.ownedRoutes = [];
        if (s.ownedRoutes.find(o => o.id === pkg.id)) { this.toast(T('inv.alreadyActive'), 'err'); return; }

        // Always require loan (minimum 40% of investment)
        const shortage = Math.max(0, pkg.totalInvestment - Math.max(0, s.cash));
        const loanAmt = Math.max(shortage, Math.round(pkg.totalInvestment * 0.4));
        const loanRate = loanAmt <= 500000 ? 6 : loanAmt <= 2000000 ? 5 : 4.5;
        const loanFee = Math.round(loanAmt * 0.01);
        const equity = pkg.totalInvestment - loanAmt;

        if (s.cash < equity) { this.toast(T('inv.equityShort'), 'err'); return; }

        // Take loan
        s.debt += loanAmt;
        s.stats.totExp += loanFee;
        if (!s.loans) s.loans = [];
        s.loans.push({ id: 'loan_route_' + pkg.id, name: T('inv.routeLoan', D(pkg,'name')), amount: loanAmt, rate: loanRate, fee: loanFee, day: s.gameDay, ts: Date.now() });

        // Deduct equity from cash
        s.cash -= equity;
        s.stats.totExp += pkg.totalInvestment;

        // Initialize route
        s.ownedRoutes.push({ id: pkg.id, voyNum: 0, status: 'setup', activatedDay: s.gameDay });

        // Setup containers and ports
        pkg.ports.forEach(p => {
            if (!s.custs[p] && CUSTOMERS[p]) s.custs[p] = CUSTOMERS[p].map(c => ({ ...c }));
            if (!s.ctr[p]) s.ctr[p] = { '20': Math.round((pkg.containerSet['20'] || 40) / pkg.ports.length), '40': Math.round((pkg.containerSet['40'] || 20) / pkg.ports.length) };
        });
        pkg.officePorts.forEach(p => { if (!s.infra.offices[p]) s.infra.offices[p] = true; });

        if (!s.slotSalesPorts) s.slotSalesPorts = {};
        for (const port in pkg.salesPorts) s.slotSalesPorts[port] = pkg.salesPorts[port];

        // Expand market to include new route lanes
        this.expandMarket(pkg);

        this.toast(T('inv.routeStart', D(pkg,'name'), shortage.toLocaleString()), 'ok');
        this.addFeed(T('inv.routeStart', D(pkg,'name'), shortage.toLocaleString()), 'alert');
        this.renderInvestments();
        this.updateHUD();
    },

    // Process slot charter voyages (called from dailyUpdate)
    processSlotCharters() {
        const s = this.state;
        if (!s.slotCharters || s.slotCharters.length === 0) return;

        s.slotCharters.forEach(charter => {
            const sc = SLOT_CHARTERS.find(x => x.id === charter.id);
            if (!sc) return;
            if (!charter.active) charter.active = true;

            charter.daysSinceLast++;
            // Track voyage day counter for map ship positioning
            if (!charter.voyage) charter.voyage = { dayCounter: 0 };
            charter.voyage.dayCounter++;

            if (charter.status === 'port') {
                // Auto-depart when rotation period reached
                if (charter.daysSinceLast >= sc.rotationDays) {
                    // Generate bookings from customer shares
                    let totalTEU = 0;
                    charter.bookings = [];
                    sc.ports.forEach(fromPort => {
                        const sp = sc.salesPorts[fromPort];
                        if (!sp || !s.custs[fromPort]) return;
                        sp.sellTo.forEach(toPort => {
                            s.custs[fromPort].forEach(cust => {
                                if (cust.share <= 0) return;
                                const vol20 = Math.round(cust.maxVol20 * (cust.share / 100) * (0.5 + Math.random() * 0.5));
                                const vol40 = Math.round(cust.maxVol40 * (cust.share / 100) * (0.5 + Math.random() * 0.5));
                                const teu = vol20 + vol40 * 2;
                                if (teu <= 0 || totalTEU + teu > sc.slotCapacity) return;
                                const rateKey = `${fromPort}-${toPort}`;
                                const rates = BASE_RATES[rateKey];
                                if (!rates) return;
                                const disc = cust.baseDiscount || 0;
                                const rev = vol20 * rates['20'] * (1 - disc) + vol40 * rates['40'] * (1 - disc);
                                totalTEU += teu;
                                charter.bookings.push({ from: fromPort, to: toPort, cust: cust.name, teu, rev });
                            });
                        });
                    });

                    // Calculate P&L
                    const totalRev = charter.bookings.reduce((sum, b) => sum + b.rev, 0);
                    const expenses = sc.slotFeePerVoyage + sc.weeklyFixedCost * (sc.rotationDays / 7) +
                                     sc.portFeesPerCall * sc.ports.length;
                    const profit = totalRev - expenses;
                    const lf = sc.slotCapacity > 0 ? Math.round(totalTEU / sc.slotCapacity * 100) : 0;

                    s.cash += profit;
                    s.stats.totRev += totalRev;
                    s.stats.totExp += expenses;
                    s.stats.totTEU += totalTEU;

                    this.addFeed(T('sc.voyComplete', D(sc,'name'), charter.voyNum, totalTEU, lf, profit >= 0 ? '💰' : '📛', Math.abs(Math.round(profit)).toLocaleString()), profit >= 0 ? 'good' : 'alert');

                    charter.voyNum++;
                    charter.daysSinceLast = 0;
                    charter.voyage.dayCounter = 0;
                    charter.bookings = [];
                }
            }
        });
    },

    // Process owned route voyages (called from dailyUpdate)
    processOwnedRoutes() {
        const s = this.state;
        if (!s.ownedRoutes || s.ownedRoutes.length === 0) return;

        s.ownedRoutes.forEach(route => {
            const pkg = NEW_ROUTE_PACKAGES.find(x => x.id === route.id);
            if (!pkg) return;

            // Initialize voyage state if missing
            if (!route.voyage) route.voyage = { dayCounter: 0, legIdx: 0, status: 'sailing' };
            if (route.status === 'setup') route.status = 'active';

            route.voyage.dayCounter++;

            // Calculate which leg the ship is on
            const totalSeaDays = pkg.legs.reduce((sum, l) => sum + l.seaDays, 0);
            const portDays = pkg.rotationDays - totalSeaDays; // days spent in ports

            if (route.voyage.dayCounter >= pkg.rotationDays) {
                // Complete a rotation — generate revenue
                let totalTEU = 0;
                let totalRev = 0;
                const bookings = [];

                pkg.ports.forEach(fromPort => {
                    const sp = pkg.salesPorts[fromPort];
                    if (!sp || !s.custs[fromPort]) return;
                    sp.sellTo.forEach(toPort => {
                        s.custs[fromPort].forEach(cust => {
                            if (cust.share <= 0) return;
                            const vol20 = Math.round(cust.maxVol20 * (cust.share / 100) * (0.5 + Math.random() * 0.5));
                            const vol40 = Math.round(cust.maxVol40 * (cust.share / 100) * (0.5 + Math.random() * 0.5));
                            const teu = vol20 + vol40 * 2;
                            if (teu <= 0 || totalTEU + teu > pkg.vesselSize) return;
                            const rateKey = `${fromPort}-${toPort}`;
                            const rates = BASE_RATES[rateKey];
                            if (!rates) return;
                            const disc = cust.baseDiscount || 0;
                            const rev = vol20 * rates['20'] * (1 - disc) + vol40 * rates['40'] * (1 - disc);
                            totalTEU += teu;
                            totalRev += rev;
                        });
                    });
                });

                const expenses = pkg.weeklyFixedCost * (pkg.rotationDays / 7) +
                                 pkg.fuelCostPerDay * totalSeaDays +
                                 pkg.portFeesPerCall * pkg.ports.length;
                const profit = totalRev - expenses;
                const lf = pkg.vesselSize > 0 ? Math.round(totalTEU / pkg.vesselSize * 100) : 0;

                s.cash += profit;
                s.stats.totRev += totalRev;
                s.stats.totExp += expenses;
                s.stats.totTEU += totalTEU;

                route.voyNum = (route.voyNum || 0) + 1;
                this.addFeed(T('route.voyComplete', D(pkg,'name'), route.voyNum, totalTEU, lf, profit >= 0 ? '💰' : '📛', Math.abs(Math.round(profit)).toLocaleString()), profit >= 0 ? 'good' : 'alert');

                route.voyage.dayCounter = 0;
            }
        });
    },

    // ==================== WITHDRAWAL ====================
    withdrawSlotCharter(scId) {
        const s = this.state;
        const sc = SLOT_CHARTERS.find(x => x.id === scId);
        if (!sc) return;
        const idx = (s.slotCharters || []).findIndex(o => o.id === scId);
        if (idx < 0) { this.toast(T('inv.notActiveSlot'), 'err'); return; }

        const officePorts = sc.officePorts || sc.ports.filter(p => p !== 'PUS');
        const slotRefund = Math.round(sc.slotCost * 0.30);
        const officeRefund = Math.round(officePorts.length * (sc.officeCostEach || 25000) * 0.20);
        const totalRecovery = slotRefund + officeRefund;

        // Repay related loan
        const loanIdx = (s.loans || []).findIndex(l => l.id === 'loan_slot_' + scId);
        let loanRepay = 0;
        if (loanIdx >= 0) {
            loanRepay = Math.round(s.loans[loanIdx].amount * 0.8);
            s.debt = Math.max(0, s.debt - s.loans[loanIdx].amount);
            s.loans.splice(loanIdx, 1);
        }
        // Also reduce general debt from slot purchase (50% of slotCost was added as debt)
        const slotDebt = Math.round(sc.slotCost * 0.5);
        s.debt = Math.max(0, s.debt - slotDebt);

        const netRecovery = totalRecovery - loanRepay;
        s.cash += netRecovery;
        if (netRecovery < 0) s.stats.totExp += Math.abs(netRecovery);

        // Close offices (only if not used by other routes)
        officePorts.forEach(p => {
            const usedByOther = (s.ownedRoutes || []).some(or => {
                const pkg = NEW_ROUTE_PACKAGES.find(x => x.id === or.id);
                return pkg && pkg.officePorts.includes(p);
            }) || (s.slotCharters || []).some((ch, i) => {
                if (i === idx) return false;
                const sch = SLOT_CHARTERS.find(x => x.id === ch.id);
                return sch && (sch.officePorts || sch.ports.filter(pp => pp !== 'PUS')).includes(p);
            }) || s.route.ports.includes(p);
            if (!usedByOther && s.infra.offices[p]) delete s.infra.offices[p];
        });

        // Remove containers from exclusive ports
        sc.ports.forEach(p => {
            if (p === 'PUS') return;
            const usedByOther = s.route.ports.includes(p) ||
                (s.ownedRoutes || []).some(or => { const pk = NEW_ROUTE_PACKAGES.find(x => x.id === or.id); return pk && pk.ports.includes(p); }) ||
                (s.slotCharters || []).some((ch, i) => { if (i === idx) return false; const sch = SLOT_CHARTERS.find(x => x.id === ch.id); return sch && sch.ports.includes(p); });
            if (!usedByOther) {
                delete s.ctr[p];
                delete s.custs[p];
            }
        });

        // Remove sales ports
        if (s.slotSalesPorts) {
            for (const port in sc.salesPorts) {
                const usedByOther = (s.ownedRoutes || []).some(or => { const pk = NEW_ROUTE_PACKAGES.find(x => x.id === or.id); return pk && pk.salesPorts[port]; }) ||
                    (s.slotCharters || []).some((ch, i) => { if (i === idx) return false; const sch = SLOT_CHARTERS.find(x => x.id === ch.id); return sch && sch.salesPorts[port]; });
                if (!usedByOther) delete s.slotSalesPorts[port];
            }
        }

        // Remove market lanes
        if (s.market) {
            sc.ports.forEach(fp => {
                const sp = sc.salesPorts[fp];
                if (!sp) return;
                sp.sellTo.forEach(tp => {
                    delete s.market[`${fp}-${tp}`];
                });
            });
        }

        // Remove charter
        s.slotCharters.splice(idx, 1);
        this._expandedWithdrawSC = null;

        this.toast(T('withdraw.scDone', D(sc,'name'), (netRecovery >= 0 ? '+' : '') + '$' + netRecovery.toLocaleString()), netRecovery >= 0 ? 'ok' : 'err');
        this.addFeed(T('withdraw.scFeed', D(sc,'name'), netRecovery >= 0 ? T('withdraw.recovery') : T('withdraw.loss'), Math.abs(netRecovery).toLocaleString()), 'alert');
        this.renderInvestments();
        this.updateHUD();
    },

    withdrawOwnedRoute(routeId) {
        const s = this.state;
        const pkg = NEW_ROUTE_PACKAGES.find(x => x.id === routeId);
        if (!pkg) return;
        const idx = (s.ownedRoutes || []).findIndex(o => o.id === routeId);
        if (idx < 0) { this.toast(T('inv.notActiveRoute'), 'err'); return; }

        const shipSaleValue = Math.round(pkg.shipCount * pkg.shipCostEach * 0.50);
        const ctrSaleValue = Math.round(pkg.containerCost * 0.30);
        const officeSaleValue = Math.round(pkg.officePorts.length * pkg.officeCostEach * 0.20);
        const totalRecovery = shipSaleValue + ctrSaleValue + officeSaleValue;

        // Repay related loan
        const loanIdx = (s.loans || []).findIndex(l => l.id === 'loan_route_' + routeId);
        let loanRepay = 0;
        if (loanIdx >= 0) {
            loanRepay = Math.round(s.loans[loanIdx].amount * 0.8);
            s.debt = Math.max(0, s.debt - s.loans[loanIdx].amount);
            s.loans.splice(loanIdx, 1);
        }

        const netRecovery = totalRecovery - loanRepay;
        s.cash += netRecovery;
        if (netRecovery < 0) s.stats.totExp += Math.abs(netRecovery);

        // Close offices (only if not used by other routes)
        pkg.officePorts.forEach(p => {
            const usedByOther = (s.slotCharters || []).some(ch => {
                const sch = SLOT_CHARTERS.find(x => x.id === ch.id);
                return sch && (sch.officePorts || sch.ports.filter(pp => pp !== 'PUS')).includes(p);
            }) || (s.ownedRoutes || []).some((or, i) => {
                if (i === idx) return false;
                const pk = NEW_ROUTE_PACKAGES.find(x => x.id === or.id);
                return pk && pk.officePorts.includes(p);
            }) || s.route.ports.includes(p);
            if (!usedByOther && s.infra.offices[p]) delete s.infra.offices[p];
        });

        // Remove containers from exclusive ports
        pkg.ports.forEach(p => {
            if (p === 'PUS') return;
            const usedByOther = s.route.ports.includes(p) ||
                (s.slotCharters || []).some(ch => { const sch = SLOT_CHARTERS.find(x => x.id === ch.id); return sch && sch.ports.includes(p); }) ||
                (s.ownedRoutes || []).some((or, i) => { if (i === idx) return false; const pk = NEW_ROUTE_PACKAGES.find(x => x.id === or.id); return pk && pk.ports.includes(p); });
            if (!usedByOther) {
                delete s.ctr[p];
                delete s.custs[p];
            }
        });

        // Remove sales ports
        if (s.slotSalesPorts) {
            for (const port in pkg.salesPorts) {
                const usedByOther = (s.slotCharters || []).some(ch => { const sch = SLOT_CHARTERS.find(x => x.id === ch.id); return sch && sch.salesPorts[port]; }) ||
                    (s.ownedRoutes || []).some((or, i) => { if (i === idx) return false; const pk = NEW_ROUTE_PACKAGES.find(x => x.id === or.id); return pk && pk.salesPorts[port]; });
                if (!usedByOther) delete s.slotSalesPorts[port];
            }
        }

        // Remove market lanes
        if (s.market) {
            pkg.ports.forEach(fp => {
                const sp = pkg.salesPorts[fp];
                if (!sp) return;
                sp.sellTo.forEach(tp => {
                    delete s.market[`${fp}-${tp}`];
                });
            });
        }

        // Remove route
        s.ownedRoutes.splice(idx, 1);
        this._expandedWithdrawRoute = null;

        this.toast(T('withdraw.routeDone', D(pkg,'name'), (netRecovery >= 0 ? '+' : '') + '$' + netRecovery.toLocaleString()), netRecovery >= 0 ? 'ok' : 'err');
        this.addFeed(T('withdraw.routeFeed', D(pkg,'name'), shipSaleValue.toLocaleString(), netRecovery >= 0 ? T('withdraw.recovery') : T('withdraw.loss'), Math.abs(netRecovery).toLocaleString()), 'alert');
        this.renderInvestments();
        this.updateHUD();
    },

    getActivePromoBoost() {
        const s = this.state;
        if (!s.promos) return 0;
        return s.promos.filter(p => p.endsDay > s.gameDay).reduce((sum, p) => sum + (p.successBoost || 0), 0);
    },

    canAfford(cost) {
        const s = this.state;
        // Allow investment even with negative cash, up to debt limit
        const debtLimit = s.route.investmentCost * 1.5;
        return (s.cash >= cost) || (s.cash - cost > -debtLimit);
    },

    invest(type, level, cost) {
        const s = this.state;
        if (!this.canAfford(cost)) { this.toast(T('inv.debtOver'), 'err'); return; }
        s.cash -= cost; s.stats.totExp += cost;
        s.infra[type] = level;
        const labels = { training: T('inv.trainingLabel'), systems: T('inv.systemsLabel'), it: T('inv.itLabel') };
        this.toast(T('inv.trainingDone', labels[type] || type, level), 'ok');
        this.addFeed(T('inv.trainingFeed', labels[type] || type, level), 'alert');
        this.renderInvestments();
        this.updateHUD();
    },

    investPersonalTraining(spIdx, level, cost) {
        const s = this.state;
        if (!this.canAfford(cost)) { this.toast(T('inv.debtOver'), 'err'); return; }
        const sp = s.salesTeam[spIdx];
        if (!sp) return;
        s.cash -= cost; s.stats.totExp += cost;
        if (!sp.personalTraining) sp.personalTraining = 0;
        sp.personalTraining = level;
        const ptDef = INVESTMENTS.personalTraining.find(p => p.level === level);
        if (ptDef && ptDef.skillBoost) sp.skill = Math.min(10, (sp.skill || 1) + ptDef.skillBoost);
        this.toast(T('inv.personalDone', sp.name, ptDef ? ptDef.name : 'Training', sp.skill.toFixed(1)), 'ok');
        this.addFeed(T('inv.personalFeed', sp.name, level, sp.skill.toFixed(1)), 'alert');
        this.renderInvestments();
    },

    investOffice(port, cost) {
        const s = this.state;
        if (!this.canAfford(cost)) { this.toast(T('inv.debtOver'), 'err'); return; }
        s.cash -= cost; s.stats.totExp += cost;
        s.infra.offices[port] = true;
        this.toast(`${this.getPortName(port)} ${T('inv.establish')}!`, 'ok');
        this.renderInvestments();
        this.updateHUD();
    },

    investShip(level, newCap, cost) {
        const s = this.state;
        if (!this.canAfford(cost)) { this.toast(T('inv.debtOver'), 'err'); return; }
        s.cash -= cost; s.stats.totExp += cost;
        s.infra.shipLevel = level;
        s.ship.capacity = newCap;
        this.toast(`${T('inv.ship')}! ${newCap}TEU`, 'ok');
        this.addFeed(`🚢 ${T('inv.ship')} ${T('inv.shipCap')} ${newCap}TEU`, 'alert');
        this.renderInvestments();
        this.updateAll();
    },

    buyContainers(add20, add40, cost, port) {
        const s = this.state;
        if (!this.canAfford(cost)) { this.toast(T('inv.debtOver'), 'err'); return; }
        s.cash -= cost; s.stats.totExp += cost;
        const targetPort = port || s.route.ports[0];
        if (!s.ctr[targetPort]) s.ctr[targetPort] = { '20': 0, '40': 0 };
        s.ctr[targetPort]['20'] += add20;
        s.ctr[targetPort]['40'] += add40;
        const portName = this.getPortName(targetPort);
        this.toast(T('inv.deploy', portName), 'ok');
        this.renderInvestments();
        this.updateHUD();
    },

    renderFinance() {
        const s = this.state, r = s.route;
        const teamCost = s.salesTeam.reduce((sum, st) => sum + st.salary, 0) + s.captain.salary;
        const totExp = s.stats.totExp || 0;
        const netProfit = s.stats.totRev - totExp;

        // === Summary Cards ===
        let html = `
        <div class="fin-grid">
            <div class="fin-card"><span class="fin-val" style="color:var(--green)">$${Math.round(s.cash).toLocaleString()}</span><span class="fin-label">${T('fin.cashLabel')}</span></div>
            <div class="fin-card"><span class="fin-val" style="color:var(--red)">$${Math.round(s.debt).toLocaleString()}</span><span class="fin-label">${T('fin.debtLabel')}</span></div>
            <div class="fin-card"><span class="fin-val" style="color:var(--green)">$${Math.round(s.stats.totRev).toLocaleString()}</span><span class="fin-label">${T('fin.cumRev')}</span></div>
            <div class="fin-card"><span class="fin-val" style="color:var(--red)">$${Math.round(totExp).toLocaleString()}</span><span class="fin-label">${T('fin.cumExp')}</span></div>
            <div class="fin-card"><span class="fin-val" style="color:${netProfit >= 0 ? 'var(--green)' : 'var(--red)'}">$${Math.round(netProfit).toLocaleString()}</span><span class="fin-label">${T('fin.cumProfit')}</span></div>
            <div class="fin-card"><span class="fin-val">${s.stats.totVoy}</span><span class="fin-label">${T('fin.voyage')}</span></div>
        </div>`;

        // === P&L Statement ===
        html += `<h4 style="font-size:13px;color:var(--t2);margin:12px 0 8px">${T('fin.pnl')}</h4>`;
        html += '<div style="background:var(--card2);border-radius:8px;padding:10px;margin-bottom:12px">';
        // Revenue
        html += '<div class="fin-row" style="font-weight:600"><span>' + T('fin.revenue') + '</span><span style="color:var(--green)">$' + Math.round(s.stats.totRev).toLocaleString() + '</span></div>';
        // Expenses breakdown
        const voyExp = s.stats.history.reduce((sum, h) => sum + h.exp, 0);
        const salaryExp = teamCost * Math.floor(s.gameDay / 30); // approximate salary paid
        const investExp = totExp - voyExp - salaryExp;
        html += '<div style="border-top:1px solid var(--border);margin:6px 0;padding-top:6px">';
        html += '<div class="fin-row"><span style="color:var(--t3)">' + T('fin.voyageCost') + '</span><span style="color:var(--red)">-$' + Math.round(voyExp).toLocaleString() + '</span></div>';
        html += '<div class="fin-row"><span style="color:var(--t3)">' + T('fin.salaryCost') + ' ($' + teamCost.toLocaleString() + '/' + T('fin.perMonth') + ')</span><span style="color:var(--red)">-$' + Math.round(Math.max(0, salaryExp)).toLocaleString() + '</span></div>';
        html += '<div class="fin-row"><span style="color:var(--t3)">' + T('fin.otherCost') + '</span><span style="color:var(--red)">-$' + Math.round(Math.max(0, investExp)).toLocaleString() + '</span></div>';
        html += '</div>';
        // Net
        html += '<div class="fin-row" style="font-weight:700;border-top:2px solid var(--border);padding-top:6px;margin-top:6px"><span>' + T('fin.netProfit') + '</span><span style="color:' + (netProfit >= 0 ? 'var(--green)' : 'var(--red)') + '">$' + Math.round(netProfit).toLocaleString() + '</span></div>';
        // Margin
        if (s.stats.totRev > 0) {
            const margin = Math.round((netProfit / s.stats.totRev) * 100);
            html += '<div class="fin-row"><span style="color:var(--t3)">' + T('fin.profitMargin') + '</span><span style="color:' + (margin >= 0 ? 'var(--green)' : 'var(--red)') + '">' + margin + '%</span></div>';
        }
        html += '</div>';

        // === Per-Voyage P&L ===
        if (s.stats.history.length > 0) {
            html += `<h4 style="font-size:13px;color:var(--t2);margin:12px 0 8px">${T('fin.voyagePnl')}</h4>`;

            // Bound direction labels
            const fBounds = this.getRouteBounds(r);
            const fB1 = this.getBoundShort(fBounds[0]);
            const fB2 = this.getBoundShort(fBounds[1]);

            // Average stats
            const avgRev = Math.round(s.stats.history.reduce((s, h) => s + h.rev, 0) / s.stats.history.length);
            const avgExp = Math.round(s.stats.history.reduce((s, h) => s + h.exp, 0) / s.stats.history.length);
            const avgProfit = Math.round(s.stats.history.reduce((s, h) => s + h.profit, 0) / s.stats.history.length);
            const avgLF = Math.round(s.stats.history.reduce((s, h) => s + h.lf, 0) / s.stats.history.length);
            const avgEB = Math.round(s.stats.history.reduce((s, h) => s + (h.lfEB != null ? h.lfEB : h.lf), 0) / s.stats.history.length);
            const avgWB = Math.round(s.stats.history.reduce((s, h) => s + (h.lfWB || 0), 0) / s.stats.history.length);
            html += `<div style="background:var(--card2);border-radius:8px;padding:10px;margin-bottom:8px">
                <div style="font-size:11px;color:var(--t3);margin-bottom:6px">${T('voyage.average')}</div>
                <div style="display:grid;grid-template-columns:1fr 1fr 1fr 1fr;gap:4px;text-align:center;font-size:11px">
                    <div><div style="font-weight:700;color:var(--green)">$${avgRev.toLocaleString()}</div><div style="font-size:9px;color:var(--t3)">${T('fin.rev')}</div></div>
                    <div><div style="font-weight:700;color:var(--red)">$${avgExp.toLocaleString()}</div><div style="font-size:9px;color:var(--t3)">${T('fin.exp')}</div></div>
                    <div><div style="font-weight:700;color:${avgProfit >= 0 ? 'var(--green)' : 'var(--red)'}">$${avgProfit.toLocaleString()}</div><div style="font-size:9px;color:var(--t3)">${T('fin.profit')}</div></div>
                    <div><div style="font-weight:700"><span style="color:${avgEB >= 50 ? 'var(--green)' : 'var(--red)'}">${fB1.charAt(0)}${avgEB}</span>/<span style="color:${avgWB >= 50 ? 'var(--green)' : 'var(--red)'}">${fB2.charAt(0)}${avgWB}</span>%</div><div style="font-size:9px;color:var(--t3)">${T('fin.loadFactor')}</div></div>
                </div>
            </div>`;

            // Per-voyage table with expandable detail
            html += '<div style="background:var(--card2);border-radius:8px;padding:10px">';
            html += `<div style="display:grid;grid-template-columns:60px 1fr 1fr 1fr 70px;gap:4px;font-size:10px;color:var(--t3);padding-bottom:4px;border-bottom:1px solid var(--border);margin-bottom:4px"><span>${T('fin.voyage')}</span><span style="text-align:right">${T('fin.rev')}</span><span style="text-align:right">${T('fin.exp')}</span><span style="text-align:right">${T('fin.profit')}</span><span style="text-align:right">${fB1}·${fB2}</span></div>`;
            [...s.stats.history].reverse().forEach((h, idx) => {
                const profitColor = h.profit >= 0 ? 'var(--green)' : 'var(--red)';
                const hEB = h.lfEB != null ? h.lfEB : h.lf;
                const hWB = h.lfWB != null ? h.lfWB : 0;
                const ebColor = hEB >= 50 ? 'var(--green)' : (hEB >= 30 ? 'var(--yellow)' : 'var(--red)');
                const wbColor = hWB >= 50 ? 'var(--green)' : (hWB >= 30 ? 'var(--yellow)' : 'var(--red)');
                const detailId = `voy-detail-${h.voy}`;
                html += `<div style="cursor:pointer" onclick="document.getElementById('${detailId}').style.display=document.getElementById('${detailId}').style.display==='none'?'block':'none'">
                    <div style="display:grid;grid-template-columns:60px 1fr 1fr 1fr 70px;gap:4px;font-size:11px;padding:4px 0;border-bottom:1px solid rgba(255,255,255,.03)">
                        <span style="font-weight:600">V.${String(h.voy).padStart(3,'0')} ▾</span>
                        <span style="text-align:right;color:var(--green)">$${h.rev.toLocaleString()}</span>
                        <span style="text-align:right;color:var(--red)">$${h.exp.toLocaleString()}</span>
                        <span style="text-align:right;font-weight:700;color:${profitColor}">$${h.profit.toLocaleString()}</span>
                        <span style="text-align:right;font-size:10px"><span style="color:${ebColor}">${hEB}</span>/<span style="color:${wbColor}">${hWB}</span></span>
                    </div>
                </div>`;
                // Expandable detail breakdown
                const fp = h.fuelPort || 0;
                const fc = h.fixedCost || 0;
                const ir = h.interestRepay || 0;
                const rm = h.refuelMaint || 0;
                const repoA = h.repoCostAuto || 0;
                const repoU = h.repoCostUser || 0;
                const salAct = h.salesActCost || 0;
                const boost = h.boosterCost || 0;
                const margin = h.rev > 0 ? Math.round((h.profit / h.rev) * 100) : 0;
                html += `<div id="${detailId}" style="display:none;background:var(--bg);border-radius:6px;padding:8px;margin:4px 0 8px;font-size:10px">
                    <div style="font-weight:600;margin-bottom:4px;color:var(--t2)">${T('voyage.detail', String(h.voy).padStart(3,'0'))}</div>
                    <div class="fin-row"><span style="color:var(--green)">${T('fin.freightRev')}</span><span style="color:var(--green)">+$${h.rev.toLocaleString()}</span></div>
                    <div style="border-top:1px solid var(--border);margin:4px 0"></div>
                    <div class="fin-row"><span>${T('fin.fuelPort')}</span><span style="color:var(--red)">-$${fp.toLocaleString()}</span></div>
                    <div class="fin-row"><span>${T('fin.weeklyFixed')}</span><span style="color:var(--red)">-$${fc.toLocaleString()}</span></div>
                    <div class="fin-row"><span>${T('fin.interestRepay')}</span><span style="color:var(--red)">-$${ir.toLocaleString()}</span></div>
                    <div class="fin-row"><span>${T('fin.maintenance')}</span><span style="color:var(--red)">-$${rm.toLocaleString()}</span></div>
                    ${salAct > 0 ? `<div class="fin-row"><span>${T('fin.salesActivity')}</span><span style="color:var(--red)">-$${salAct.toLocaleString()}</span></div>` : ''}
                    ${boost > 0 ? `<div class="fin-row"><span>${T('fin.boosterCost')}</span><span style="color:var(--red)">-$${boost.toLocaleString()}</span></div>` : ''}
                    ${repoA > 0 ? `<div class="fin-row"><span>${T('fin.autoRepo')}</span><span style="color:var(--red)">-$${repoA.toLocaleString()}</span></div>` : ''}
                    ${repoU > 0 ? `<div class="fin-row"><span>${T('fin.manualRepo')}</span><span style="color:var(--red)">-$${repoU.toLocaleString()}</span></div>` : ''}
                    <div style="border-top:2px solid var(--border);margin:4px 0"></div>
                    <div class="fin-row" style="font-weight:700"><span>${T('fin.netProfit')}</span><span style="color:${profitColor}">$${h.profit.toLocaleString()}</span></div>
                    <div class="fin-row"><span style="color:var(--t3)">${T('fin.profitMargin')}</span><span style="color:${margin >= 0 ? 'var(--green)' : 'var(--red)'}">${margin}%</span></div>
                    <div class="fin-row"><span style="color:var(--t3)">${T('voyage.cargoQty')}</span><span>${h.teu} TEU (${h.lf}%)</span></div>
                </div>`;
            });

            // Cumulative profit chart (text-based bar chart)
            html += '<div style="margin-top:8px;border-top:1px solid var(--border);padding-top:8px">';
            html += `<div style="font-size:10px;color:var(--t3);margin-bottom:4px">${T('fin.pnlTrend')}</div>`;
            let cumProfit = 0;
            const cumData = s.stats.history.map(h => { cumProfit += h.profit; return { voy: h.voy, cum: cumProfit }; });
            const maxAbs = Math.max(1, ...cumData.map(d => Math.abs(d.cum)));
            cumData.forEach(d => {
                const pct = Math.round((d.cum / maxAbs) * 100);
                const isPos = d.cum >= 0;
                html += `<div style="display:flex;align-items:center;gap:4px;margin:2px 0;font-size:10px">
                    <span style="min-width:40px;color:var(--t3)">V.${String(d.voy).padStart(3,'0')}</span>
                    <div style="flex:1;height:12px;background:var(--bg);border-radius:3px;overflow:hidden;position:relative">
                        <div style="position:absolute;${isPos ? 'left:50%' : `right:50%`};width:${Math.abs(pct) / 2}%;height:100%;background:${isPos ? 'var(--green)' : 'var(--red)'};border-radius:3px"></div>
                        <div style="position:absolute;left:50%;top:0;bottom:0;width:1px;background:var(--t3)"></div>
                    </div>
                    <span style="min-width:60px;text-align:right;font-weight:600;color:${isPos ? 'var(--green)' : 'var(--red)'}">$${d.cum.toLocaleString()}</span>
                </div>`;
            });
            html += '</div>';
            html += '</div>';
        }

        // === KPI Summary ===
        html += `<h4 style="font-size:13px;color:var(--t2);margin:12px 0 8px">${T('fin.kpi')}</h4>`;
        html += '<div style="background:var(--card2);border-radius:8px;padding:10px">';
        const avgRevPerTEU = s.stats.totTEU > 0 ? Math.round(s.stats.totRev / s.stats.totTEU) : 0;
        const debtRatio = s.stats.totRev > 0 ? Math.round((s.debt / Math.max(1, s.stats.totRev)) * 100) : 100;
        const totalCusts = Object.values(s.custs).flat().length;
        const activeCusts = Object.values(s.custs).flat().filter(c => c.share > 0).length;
        html += `<div class="fin-row"><span style="color:var(--t3)">${T('fin.revPerTEU')}</span><span>$${avgRevPerTEU.toLocaleString()}</span></div>`;
        html += `<div class="fin-row"><span style="color:var(--t3)">${T('fin.totalTEU')}</span><span>${s.stats.totTEU.toLocaleString()}</span></div>`;
        html += `<div class="fin-row"><span style="color:var(--t3)">${T('fin.debtRatio')}</span><span style="color:${debtRatio > 100 ? 'var(--red)' : 'var(--green)'}">${debtRatio}%</span></div>`;
        html += `<div class="fin-row"><span style="color:var(--t3)">${T('fin.activeCust')}</span><span>${activeCusts}/${totalCusts}</span></div>`;
        html += `<div class="fin-row"><span style="color:var(--t3)">${T('fin.monthlySalary')}</span><span>$${teamCost.toLocaleString()}</span></div>`;
        html += '</div>';

        document.getElementById('finance-view').innerHTML = html;
    },

    // ==================== SALES PERFORMANCE REPORT ====================
    renderSalesReport() {
        const s = this.state;
        const isJa = CURRENT_LANG === 'ja';

        // Calculate per-salesperson stats
        const spStats = s.salesTeam.map(st => {
            const teu = st.totalTEU || 0;
            const bookings = st.totalBookings || 0;
            const avgTEU = bookings > 0 ? Math.round(teu / bookings) : 0;
            return { ...st, teu, bookings, avgTEU };
        });
        spStats.sort((a, b) => b.teu - a.teu);

        // Weekly TEU (from activity log last 7 days)
        const weekStart = s.gameDay - 7;
        const weekLogs = s.activityLog.filter(l => l.day >= weekStart && l.success && l.revenue > 0);
        const weekBySP = {};
        weekLogs.forEach(l => {
            if (!weekBySP[l.spName]) weekBySP[l.spName] = { count: 0, rev: 0 };
            weekBySP[l.spName].count++;
            weekBySP[l.spName].rev += l.revenue || 0;
        });

        let html = `<div style="margin-bottom:16px">
            <h4 style="font-size:14px;margin-bottom:4px">\u{1F4CA} ${isJa ? '\u55B6\u696D\u5B9F\u7E3E\u30EC\u30DD\u30FC\u30C8' : '\uC601\uC5C5 \uC2E4\uC801 \uBCF4\uACE0\uC11C'}</h4>
            <div style="font-size:10px;color:var(--t3)">D+${s.gameDay} | ${isJa ? '\u5168\u671F\u9593\u7D2F\u8A08 + \u76F4\u8FD17\u65E5\u9593' : '\uC804\uCCB4 \uB204\uC801 + \uCD5C\uADFC 7\uC77C\uAC04'}</div>
        </div>`;

        // Summary table
        html += `<div style="overflow-x:auto;margin-bottom:12px">
        <table style="width:100%;border-collapse:collapse;font-size:11px">
            <thead>
                <tr style="background:var(--card2);border-bottom:2px solid var(--border)">
                    <th style="padding:6px 4px;text-align:left">${isJa ? '\u9806\u4F4D' : '\uC21C\uC704'}</th>
                    <th style="padding:6px 4px;text-align:left">${isJa ? '\u55B6\u696D\u62C5\u5F53' : '\uC601\uC5C5\uC0AC\uC6D0'}</th>
                    <th style="padding:6px 4px;text-align:right">${isJa ? '\u7D2F\u8A08TEU' : '\uB204\uC801TEU'}</th>
                    <th style="padding:6px 4px;text-align:right">${isJa ? '\u4EF6\u6570' : '\uAC74\uC218'}</th>
                    <th style="padding:6px 4px;text-align:right">${isJa ? '\u5E73\u5747' : '\uD3C9\uADE0'}</th>
                    <th style="padding:6px 4px;text-align:right">${isJa ? '\u4ECA\u9031' : '\uC774\uBC88\uC8FC'}</th>
                    <th style="padding:6px 4px;text-align:right">${isJa ? '\u4ECA\u9031\u58F2\u4E0A' : '\uC8FC\uAC04\uB9E4\uCD9C'}</th>
                </tr>
            </thead>
            <tbody>`;

        spStats.forEach((st, i) => {
            const medal = i === 0 ? '\u{1F947}' : i === 1 ? '\u{1F948}' : i === 2 ? '\u{1F949}' : `${i+1}`;
            const week = weekBySP[st.name] || { count: 0, rev: 0 };
            const isAI = st.isAI ? ' \u{1F916}' : '';
            const vacLabel = st.activity === 'vacation' ? ` <span style="color:var(--yellow);font-size:9px">\u{1F3D6}\uFE0F</span>` : '';
            html += `<tr style="border-bottom:1px solid var(--border)">
                <td style="padding:5px 4px;text-align:center;font-size:12px">${medal}</td>
                <td style="padding:5px 4px">${st.avatar} ${st.name}${isAI}${vacLabel}</td>
                <td style="padding:5px 4px;text-align:right;font-weight:700;color:var(--green)">${st.teu}</td>
                <td style="padding:5px 4px;text-align:right">${st.bookings}</td>
                <td style="padding:5px 4px;text-align:right;color:var(--t2)">${st.avgTEU}</td>
                <td style="padding:5px 4px;text-align:right;color:var(--accent)">${week.count}</td>
                <td style="padding:5px 4px;text-align:right;color:var(--green)">$${week.rev.toLocaleString()}</td>
            </tr>`;
        });

        html += `</tbody></table></div>`;

        // Team total
        const totalTEU = spStats.reduce((s, st) => s + st.teu, 0);
        const totalWeekRev = Object.values(weekBySP).reduce((s, w) => s + w.rev, 0);
        const totalWeekCount = Object.values(weekBySP).reduce((s, w) => s + w.count, 0);
        html += `<div style="background:var(--card2);border-radius:8px;padding:10px;margin-bottom:12px;display:grid;grid-template-columns:1fr 1fr 1fr;gap:8px;text-align:center;font-size:11px">
            <div><div style="font-size:16px;font-weight:700;color:var(--green)">${totalTEU}</div><div style="color:var(--t3)">${isJa ? '\u7D2F\u8A08TEU' : '\uB204\uC801 TEU'}</div></div>
            <div><div style="font-size:16px;font-weight:700;color:var(--accent)">${totalWeekCount}</div><div style="color:var(--t3)">${isJa ? '\u4ECA\u9031\u6210\u7D04' : '\uC774\uBC88\uC8FC \uC131\uC57D'}</div></div>
            <div><div style="font-size:16px;font-weight:700;color:var(--green)">$${totalWeekRev.toLocaleString()}</div><div style="color:var(--t3)">${isJa ? '\u4ECA\u9031\u58F2\u4E0A' : '\uC8FC\uAC04 \uB9E4\uCD9C'}</div></div>
        </div>`;

        // Recent bookings
        const recentBookings = s.bookings.filter(b => !b.delivered).slice(-10);
        if (recentBookings.length > 0) {
            html += `<h4 style="font-size:12px;margin-bottom:6px;color:var(--t2)">${isJa ? '\u{1F4CB} \u6700\u65B0\u30D6\u30C3\u30AD\u30F3\u30B0' : '\u{1F4CB} \uCD5C\uADFC \uBD80\uD0B9'}</h4>`;
            [...recentBookings].reverse().forEach(b => {
                html += `<div style="display:flex;justify-content:space-between;font-size:10px;padding:3px 0;border-bottom:1px solid rgba(255,255,255,.04)">
                    <span>${b.custIcon} ${b.custName} ${b.leg}</span>
                    <span style="color:var(--green)">${b.q20 + b.q40 * 2}TEU $${b.revenue.toLocaleString()}</span>
                </div>`;
            });
        }

        return html;
    },

    renderActivityReport() {
        const s = this.state;
        const logs = [...s.activityLog].reverse();

        // Summary stats
        const total = logs.length;
        const successes = logs.filter(l => l.success).length;
        const totalRev = logs.reduce((sum, l) => sum + (l.revenue || 0), 0);
        const totalCost = logs.reduce((sum, l) => sum + (l.cost || 0), 0);
        const rate = total > 0 ? Math.round((successes / total) * 100) : 0;

        // Per-salesperson stats
        const bySP = {};
        logs.forEach(l => {
            if (!bySP[l.spName]) bySP[l.spName] = { avatar: l.spAvatar, total: 0, success: 0, rev: 0 };
            bySP[l.spName].total++;
            if (l.success) bySP[l.spName].success++;
            bySP[l.spName].rev += l.revenue || 0;
        });

        let html = `
        <div class="fin-grid">
            <div class="fin-card"><span class="fin-val">${total}</span><span class="fin-label">${T('fin.totalAct')}</span></div>
            <div class="fin-card"><span class="fin-val" style="color:var(--green)">${rate}%</span><span class="fin-label">${T('fin.actSuccess')}</span></div>
            <div class="fin-card"><span class="fin-val" style="color:var(--green)">$${totalRev.toLocaleString()}</span><span class="fin-label">${T('fin.actRevenue')}</span></div>
            <div class="fin-card"><span class="fin-val" style="color:var(--red)">$${totalCost.toLocaleString()}</span><span class="fin-label">${T('fin.actCost')}</span></div>
        </div>`;

        // Per salesperson
        html += `<h4 style="font-size:12px;color:var(--t2);margin:8px 0">${T('fin.salesPerf')}</h4>`;
        for (const [name, d] of Object.entries(bySP)) {
            const spRate = d.total > 0 ? Math.round((d.success / d.total) * 100) : 0;
            html += `<div class="fin-row"><span>${d.avatar} ${name} (${d.total}${T('fin.cases')}, ${T('fin.successRate')} ${spRate}%)</span><span style="color:var(--green)">$${d.rev.toLocaleString()}</span></div>`;
        }

        // Recent log
        html += `<h4 style="font-size:12px;color:var(--t2);margin:12px 0 4px">${T('fin.recentLog')}</h4>`;
        logs.slice(0, 20).forEach(l => {
            html += `<div class="fin-row">
                <span style="color:var(--t3)">D${l.day}</span>
                <span>${l.spAvatar} ${l.spName} → ${l.custIcon}${l.custName} ${l.actIcon}${l.actName}</span>
                <span style="color:${l.success ? 'var(--green)' : 'var(--red)'}">${l.success ? `✅ $${(l.revenue || 0).toLocaleString()}` : '❌'}</span>
            </div>`;
        });

        if (logs.length === 0) html += `<p style="color:var(--t3);font-size:12px">${T('fin.noActivity')}</p>`;

        // Active BSA contracts
        if (s.bsaContracts && s.bsaContracts.length > 0) {
            html += `<h4 style="font-size:12px;color:var(--t2);margin:12px 0 4px">${T('bsa.status')}</h4>`;
            s.bsaContracts.forEach(c => {
                const pct = Math.round((1 - c.voyagesLeft / c.totalVoyages) * 100);
                html += `<div class="fin-row" style="flex-wrap:wrap">
                    <span>📋 ${c.id.slice(-6)} | ${this.getPortName(c.fromPort)}→${this.getPortName(c.toPort)}</span>
                    <span>${T('bsa.voyTerms', c.teuPerVoy, c.revPerVoy.toLocaleString())}</span>
                </div>
                <div style="background:var(--card2);border-radius:4px;height:6px;margin:2px 0 6px">
                    <div style="background:var(--accent);height:100%;border-radius:4px;width:${pct}%"></div>
                </div>
                <div style="font-size:10px;color:var(--t3);margin-bottom:8px">${T('bsa.progress', pct, Math.round(c.voyagesLeft))}</div>`;
            });
        }

        // Active spot offers
        if (s.spotOffers && s.spotOffers.length > 0) {
            html += `<h4 style="font-size:12px;color:var(--t2);margin:12px 0 4px">${T('fin.spotWaiting')}</h4>`;
            s.spotOffers.forEach(o => {
                html += `<div class="fin-row">
                    <span>${o.icon} ${o.name} (${o.teu}TEU)</span>
                    <span>$${o.revenue.toLocaleString()} | ${T('spot.daysLeft', o.daysLeft)}</span>
                </div>`;
            });
        }

        document.getElementById('report-view').innerHTML = this.renderSalesReport() + `<hr style="border:none;border-top:1px solid var(--border);margin:16px 0">` + html;
    },

    // ==================== UI UPDATES ====================
    updateAll() {
        this.updateHUD();
        this.updateBayGrid();
        this.updateDepartInfo();
        this.renderSalesTeam();
    },

    updateHUD() {
        const s = this.state;
        document.getElementById('hud-cash').textContent = `$${Math.round(s.cash).toLocaleString()}`;
        document.getElementById('hud-cash').style.color = s.cash >= 0 ? 'var(--green)' : 'var(--red)';
        document.getElementById('hud-debt').textContent = `$${Math.round(s.debt).toLocaleString()}`;
        document.getElementById('hud-voy').textContent = `V.${String(s.voyage.num).padStart(3, '0')}`;
        const gd = this.getGameDate();
        document.getElementById('hud-day').textContent = `${gd.dateStr} ${String(s.gameHour).padStart(2,'0')}:00`;
        const ddayEl = document.getElementById('hud-dday');
        if (ddayEl) {
            ddayEl.textContent = `D+${s.gameDay}`;
        }

        const teu = this.getTEU();
        const cargoTeu = document.getElementById('cargo-teu');
        const cargoPct = document.getElementById('cargo-pct');
        if (cargoTeu) cargoTeu.textContent = `${teu}/${s.ship.capacity} TEU`;
        // Show bound-direction load factor in real-time
        if (cargoPct && s.route.legs) {
            const hBounds = this.getRouteBounds(s.route);
            const legBoundMap = {};
            s.route.legs.forEach(l => { legBoundMap[`${l.from}-${l.to}`] = l.bound || hBounds[0]; });
            let b1T = 0, b2T = 0, b1L = 0, b2L = 0;
            s.route.legs.forEach(l => { if (l.bound === hBounds[0]) b1L++; else b2L++; });
            (s.bookings || []).forEach(b => {
                const bt = b.q20 + b.q40 * 2;
                if (legBoundMap[b.leg] === hBounds[1]) b2T += bt; else b1T += bt;
            });
            const p1 = b1L > 0 ? Math.min(100, Math.round(b1T / b1L / s.ship.capacity * 100)) : 0;
            const p2 = b2L > 0 ? Math.min(100, Math.round(b2T / b2L / s.ship.capacity * 100)) : 0;
            const s1 = this.getBoundShort(hBounds[0]).charAt(0);
            const s2 = this.getBoundShort(hBounds[1]).charAt(0);
            cargoPct.innerHTML = `<span style="color:${p1 >= 50 ? 'var(--green)' : 'var(--t2)'}">${s1}${p1}%</span> <span style="color:${p2 >= 50 ? 'var(--green)' : 'var(--t2)'}">${s2}${p2}%</span>`;
        }

        // Oil price display
        const oilEl = document.getElementById('hud-oil');
        if (oilEl) {
            const oil = this.getOilPrice();
            const oilColor = oil.trend === 'crisis' ? 'var(--red)' : oil.trend === 'high' ? '#FF9800' : oil.trend === 'cheap' ? 'var(--green)' : oil.trend === 'low' ? '#8BC34A' : 'var(--t2)';
            oilEl.textContent = `$${oil.price}`;
            oilEl.style.color = oilColor;
        }

        // Safety grade display
        const safetyEl = document.getElementById('hud-safety');
        if (safetyEl) {
            const sc = s.safetyScore || 50;
            const grade = sc >= 80 ? 'S' : sc >= 60 ? 'A' : sc >= 40 ? 'B' : sc >= 20 ? 'C' : 'D';
            const sColor = sc >= 80 ? 'var(--green)' : sc >= 60 ? '#8BC34A' : sc >= 40 ? 'var(--t2)' : sc >= 20 ? '#FF9800' : 'var(--red)';
            safetyEl.textContent = grade;
            safetyEl.style.color = sColor;
        }

        // Cash warning
        this.checkCashWarning();

        // Update news ticker (every 6 game hours to avoid thrashing)
        if (s.gameHour % 6 === 0) this.updateTicker();

        // Theme system check
        this.updateTheme();
    },

    // ==================== THEME SYSTEM ====================
    _currentTier: -1,
    _prevRank: -1,

    getThemeTier() {
        const s = this.state;
        if (!s) return 0;
        const rev = s.stats.totRev || 0;
        const owned = (s.ownedRoutes || []).filter(o => o.status === 'active').length;
        const training = s.infra?.training || 0;

        if (rev >= 15000000) return 4;
        if (rev >= 5000000 || owned >= 3) return 3;
        if (rev >= 2000000 || owned >= 1) return 2;
        if (rev >= 500000 || training >= 2) return 1;
        return 0;
    },

    updateTheme() {
        const tier = this.getThemeTier();
        if (tier === this._currentTier) return;
        const prev = this._currentTier;
        this._currentTier = tier;

        // Remove old theme classes
        document.body.classList.remove('theme-0','theme-1','theme-2','theme-3','theme-4');
        document.body.classList.add(`theme-${tier}`);

        // Background image by tier
        const bgKeywords = [null, 'shipping+port', 'logistics+terminal', 'control+center+dark', 'modern+skyscraper+night'];
        if (tier > 0 && bgKeywords[tier]) {
            document.body.style.setProperty('--bg-url', `url('https://source.unsplash.com/1920x1080/?${bgKeywords[tier]}')`);
            document.body.style.backgroundImage = 'none'; // handled by ::before
            // Preload bg image
            const img = new Image();
            img.onload = () => {
                document.body.style.setProperty('background-image', 'none');
                document.body.style.cssText += `--bg-loaded:1`;
                document.body.classList.add('has-bg');
                // Set the ::before background via a style tag
                let styleEl = document.getElementById('theme-bg-style');
                if (!styleEl) {
                    styleEl = document.createElement('style');
                    styleEl.id = 'theme-bg-style';
                    document.head.appendChild(styleEl);
                }
                styleEl.textContent = `body::before{background-image:url('${img.src}')}`;
            };
            img.src = `https://source.unsplash.com/1920x1080/?${bgKeywords[tier]}`;
        } else {
            document.body.classList.remove('has-bg');
            const styleEl = document.getElementById('theme-bg-style');
            if (styleEl) styleEl.textContent = '';
        }

        // Tier-up flash animation + toast (skip on first load)
        if (prev >= 0 && tier > prev) {
            document.body.classList.add('tier-up-flash');
            setTimeout(() => document.body.classList.remove('tier-up-flash'), 1500);
            const tierNames = {
                ko: ['스타트업', '성장기', '중견 해운사', '대형 선사', '해운 타이쿤'],
                ja: ['スタートアップ', '成長期', '中堅海運', '大手船社', '海運タイクーン']
            };
            const name = (tierNames[CURRENT_LANG] || tierNames.ko)[tier];
            this.toast(`🎖️ ${T('theme.upgrade')} — ${name}`, 'ok');
            this.addFeed(`🎖️ ${T('theme.upgrade')} — ${name}`, 'booking');
        }
    },

    checkCashWarning() {
        const s = this.state;
        let existing = document.getElementById('cash-warning-banner');
        if (s.cash < -50000) {
            if (!existing) {
                existing = document.createElement('div');
                existing.id = 'cash-warning-banner';
                existing.className = 'cash-warning';
                const feed = document.querySelector('.activity-feed');
                if (feed) feed.parentNode.insertBefore(existing, feed);
            }
            existing.innerHTML = T('ticker.danger', Math.round(s.cash).toLocaleString());
        } else if (s.cash < 0) {
            if (!existing) {
                existing = document.createElement('div');
                existing.id = 'cash-warning-banner';
                existing.className = 'cash-warning';
                const feed = document.querySelector('.activity-feed');
                if (feed) feed.parentNode.insertBefore(existing, feed);
            }
            existing.innerHTML = T('ticker.warning', Math.round(s.cash).toLocaleString());
        } else if (existing) {
            existing.remove();
        }
    },

    updateTicker() {
        const s = this.state, r = s.route;
        const items = [];

        // === CASH FLOW ===
        if (s.stats.history.length >= 2) {
            const last2 = s.stats.history.slice(-2);
            if (last2[1].profit > last2[0].profit) {
                items.push({ text: T('ticker.improving'), cls: 'good' });
            } else if (last2[1].profit < last2[0].profit) {
                items.push({ text: T('ticker.declining'), cls: 'warn' });
            }
        }
        if (s.cash < -50000) {
            items.push({ text: T('ticker.severeLoss'), cls: 'warn' });
        } else if (s.cash < 0) {
            items.push({ text: T('ticker.cashNeg'), cls: 'warn' });
        } else if (s.cash > s.debt * 0.5) {
            items.push({ text: T('ticker.cashPos'), cls: 'good' });
        }

        // === SPECIFIC CUSTOMER SUGGESTIONS ===
        // Find best booster candidate (medium+ share, no active boost)
        let boostTarget = null;
        for (const port in s.custs) {
            s.custs[port].forEach(c => {
                if (c.share >= 10 && c.share < 50 && (!c.boosts || c.boosts.length === 0)) {
                    if (!boostTarget || c.share > boostTarget.share) boostTarget = c;
                }
            });
        }
        if (boostTarget) {
            items.push({ text: T('ticker.boostHint', boostTarget.icon, boostTarget.name), cls: 'info' });
        }

        // Find struggling large customer
        let largeLow = null;
        for (const port in s.custs) {
            s.custs[port].forEach(c => {
                if (c.size === 'large' && c.share < 5 && c.difficulty <= s.infra.training + 2) {
                    if (!largeLow || c.maxVol40 > largeLow.maxVol40) largeLow = c;
                }
            });
        }
        if (largeLow) {
            items.push({ text: T('ticker.largeCust', largeLow.icon, largeLow.name), cls: 'info' });
        }

        // === CONTAINER IMBALANCE ===
        const homeEmpty = (s.ctr[r.ports[0]]?.['20'] || 0) + (s.ctr[r.ports[0]]?.['40'] || 0);
        r.ports.slice(1).forEach(p => {
            const total = (s.ctr[p]?.['20'] || 0) + (s.ctr[p]?.['40'] || 0);
            if (total > 15) {
                const pn = this.getPortName(p);
                items.push({ text: T('ticker.ctrExcess', pn, total), cls: 'warn' });
            }
            // Suggest repositioning: home has many, foreign has few
            if (total <= 3 && homeEmpty > 20) {
                const pn = this.getPortName(p);
                items.push({ text: T('ticker.ctrShortage', pn, total), cls: 'warn' });
            }
        });

        // === LOAD FACTOR ===
        const teu = this.getTEU();
        const lf = Math.round(teu / s.ship.capacity * 100);
        if (s.voyage.status === 'port') {
            const daysLeft = Math.max(0, this.getPortStayDays() - s.voyage.daysSinceLast);
            if (daysLeft <= 2 && lf < 30) {
                items.push({ text: T('ticker.lowLF', lf), cls: 'warn' });
            } else if (lf > 70) {
                items.push({ text: T('ticker.goodLF', lf), cls: 'good' });
            }
        }

        // === TRAINING SUGGESTION ===
        if (s.infra.training === 0 && s.cash >= 5000) {
            items.push({ text: T('ticker.training'), cls: 'info' });
        }
        if ((s.infra.systems || s.infra.it || 0) === 0 && s.cash >= 8000 && s.stats.totVoy >= 2) {
            items.push({ text: T('ticker.automation'), cls: 'info' });
        }

        // === PROSPECT POOL ===
        const totalProspects = Object.values(s.prospectPool || {}).reduce((sum, arr) => sum + arr.length, 0);
        if (totalProspects > 0) {
            const portWithMost = Object.entries(s.prospectPool || {}).sort((a, b) => b[1].length - a[1].length)[0];
            if (portWithMost && portWithMost[1].length > 0) {
                const pn = this.getPortName(portWithMost[0]);
                items.push({ text: T('ticker.prospect', pn, portWithMost[1].length), cls: 'info' });
            }
        } else if (totalProspects === 0 && s.stats.totVoy >= 1) {
            items.push({ text: T('ticker.allProspect'), cls: 'good' });
        }

        // === TOP CUSTOMER ===
        let topCust = null, topShare = 0;
        for (const port in s.custs) {
            s.custs[port].forEach(c => {
                if (c.share > topShare) { topShare = c.share; topCust = c; }
            });
        }
        if (topCust && topShare >= 30) {
            items.push({ text: T('ticker.vipHint', topCust.icon, topCust.name), cls: 'good' });
        }

        // === SAILING STATUS ===
        if (s.voyage.status === 'sailing') {
            const v = s.voyage;
            const leg = r.legs[Math.min(v.legIdx, r.legs.length - 1)];
            if (leg) {
                items.push({ text: T('ticker.sailing', s.vessel, this.getPortName(leg.from), this.getPortName(leg.to), teu, lf), cls: 'info' });
            }
        }

        // === CONTAINER FLEET ===
        const totalFleet = r.ports.reduce((sum, p) => sum + (s.ctr[p]?.['20'] || 0) + (s.ctr[p]?.['40'] || 0), 0);
        const bookedCtr = s.bookings.reduce((sum, b) => sum + b.q20 + b.q40, 0);
        if (totalFleet + bookedCtr < s.ship.capacity * 0.8 && s.cash > 10000) {
            items.push({ text: T('ticker.ctrBuy'), cls: 'info' });
        }

        // === WEATHER ===
        const gd = this.getGameDate();
        const homeW = this.getWeather(r.ports[0]);
        if (homeW.typhoon) {
            items.push({ text: T('ticker.typhoonWarn'), cls: 'warn' });
        } else if (homeW.wave >= 4) {
            items.push({ text: T('ticker.highWave', this.getPortName(r.ports[0])), cls: 'warn' });
        }

        // === OIL PRICE ===
        const oilInfo = this.getOilPrice();
        if (oilInfo.trend === 'crisis' || (oilInfo.spike && oilInfo.mult >= 1.15)) {
            items.push({ text: T('ticker.oilSpike', oilInfo.price), cls: 'warn' });
        } else if (oilInfo.trend === 'cheap') {
            items.push({ text: T('ticker.oilCheap', oilInfo.price), cls: 'good' });
        }

        // === MARKET SEASON ===
        if (typeof MARKET_SEASONS !== 'undefined') {
            const boomPorts = [], slumpPorts = [];
            r.ports.forEach(p => {
                const mc = this.getMarketCondition(p);
                const pn = this.getPortName(p);
                if (mc.trend === 'boom') boomPorts.push(pn);
                else if (mc.trend === 'slump') slumpPorts.push(pn);
            });
            if (boomPorts.length > 0) {
                items.push({ text: T('ticker.marketBoom', boomPorts.join(', ')), cls: 'good' });
            }
            if (slumpPorts.length > 0) {
                items.push({ text: T('ticker.marketSlump', slumpPorts.join(', ')), cls: 'warn' });
            }
        }

        // === SPOT & BSA ===
        if (s.spotOffers && s.spotOffers.length > 0) {
            const urgent = s.spotOffers.find(o => o.daysLeft <= 1);
            if (urgent) {
                items.push({ text: T('ticker.spotUrgent', urgent.name, urgent.teu, urgent.revenue.toLocaleString()), cls: 'warn' });
            }
        }
        if (s.bsaContracts && s.bsaContracts.length > 0) {
            items.push({ text: T('ticker.bsaActive', s.bsaContracts.length), cls: 'good' });
        }

        // === DEBT ===
        if (s.debt <= 0) {
            items.push({ text: T('ticker.debtFree'), cls: 'good' });
        }

        // Fallback
        if (items.length === 0) {
            items.push({ text: T('ticker.normalOps', s.co, String(s.voyage.num).padStart(3,'0')), cls: 'info' });
        }

        // Render ticker
        const el = document.getElementById('ticker-content');
        if (el) {
            // Duplicate items for seamless scroll
            const content = items.map(i => `<span class="ticker-item ${i.cls}">${i.text}</span>`).join('<span class="ticker-sep">|</span>');
            el.innerHTML = content + '<span class="ticker-sep">|</span>' + content;
            // Adjust animation speed based on content length
            const duration = Math.max(20, items.length * 8);
            el.style.animationDuration = duration + 's';
        }
    },

    updateBayGrid() {
        const grid = document.getElementById('bay-grid');
        if (!grid) return; // during sailing, bay-grid doesn't exist
        const teu = this.getFirstBoundTEU();
        const cap = this.state.ship.capacity;
        const cells = 50;
        const filled = Math.round((teu / cap) * cells);
        grid.innerHTML = '';
        for (let i = 0; i < cells; i++) {
            const div = document.createElement('div');
            div.className = `bay-cell${i < filled ? ' filled' : ''}`;
            grid.appendChild(div);
        }
    },

    updateDepartInfo() {
        if (this.state.voyage.status === 'sailing') return; // handled by renderInlineSailMap
        const s = this.state;
        const teu = this.getTEU();
        const portStay = this.getPortStayDays();
        const daysLeft = Math.max(0, portStay - s.voyage.daysSinceLast);

        // Calculate per-leg load factors
        const r = s.route;
        const legTEUs = {};
        r.legs.forEach(l => { legTEUs[`${l.from}-${l.to}`] = 0; });
        s.bookings.forEach(b => { if (legTEUs[b.leg] !== undefined) legTEUs[b.leg] += b.q20 + b.q40 * 2; });
        const legPcts = Object.entries(legTEUs).map(([leg, t]) => {
            const pct = Math.round(t / s.ship.capacity * 100);
            return `${leg.split('-').join('→')} ${pct}%`;
        });
        const legInfo = legPcts.length > 0 ? legPcts.join(' / ') : `${Math.round(teu / s.ship.capacity * 100)}%`;

        document.getElementById('depart-bookings').textContent = `📦 ${teu} ${T('depart.loaded')} (${legInfo})`;
        document.getElementById('depart-countdown').textContent = `${T('depart.countdown')} ${daysLeft}${T('depart.daysLeft')}`;
        const shipStatus = document.getElementById('ship-status');
        if (shipStatus) {
            const homePort = r.ports[0];
            const w = this.getWeather(homePort);
            const portName = this.getPortName(homePort);
            shipStatus.textContent = `⚓ ${portName}${T('common.port')} ${T('ship.dockedShort')} — ${T('ship.salesActive')} — ${legInfo} — ${w.icon} ${w.desc} ${w.temp}° | ${T('depart.countdown')} ${daysLeft}${T('depart.daysLeft')}`;
        }
    },

    getTEU() {
        return this.state.bookings.reduce((s, b) => s + b.q20 + b.q40 * 2, 0);
    },

    // TEU for first leg only (outbound direction for bay grid visualization)
    getFirstBoundTEU() {
        const r = this.state.route;
        const firstLeg = `${r.ports[0]}-${r.ports[1]}`;
        return this.state.bookings.filter(b => b.leg === firstLeg).reduce((s, b) => s + b.q20 + b.q40 * 2, 0);
    },

    // Realistic port stay days = rotationDays - totalSailingDays
    getPortStayDays() {
        const r = this.state.route;
        const totalSailingDays = r.legs.reduce((sum, l) => sum + l.seaDays, 0);
        return Math.max(1, Math.round(r.rotationDays - totalSailingDays));
    },

    // Convert gameDay to actual date (starting from user's real start date)
    getGameDate() {
        const baseDate = this.state.startedAt ? new Date(this.state.startedAt) : new Date(2025, 0, 1);
        baseDate.setHours(0, 0, 0, 0);
        const d = new Date(baseDate.getTime() + (this.state.gameDay - 1) * 86400000);
        const month = d.getMonth(); // 0-11
        const months = [T('month.1'),T('month.2'),T('month.3'),T('month.4'),T('month.5'),T('month.6'),T('month.7'),T('month.8'),T('month.9'),T('month.10'),T('month.11'),T('month.12')];
        const dateStr = `${d.getFullYear()}.${months[month]} ${d.getDate()}${T('common.day')}`;
        const season = month <= 1 || month === 11 ? 'winter' : (month <= 4 ? 'spring' : (month <= 8 ? 'summer' : 'autumn'));
        return { date: d, month, dateStr, season, year: d.getFullYear() };
    },

    // Get current oil price multiplier (affects all fuel costs)
    getOilPrice() {
        if (typeof OIL_PRICE === 'undefined') return { mult: 1.0, price: 80, trend: 'normal', spike: null };
        const s = this.state;
        const month = this.getGameDate().month;
        let baseMult = OIL_PRICE.monthly[month];

        // Check for active spike event
        if (!s.oilSpike) s.oilSpike = null;
        let spike = s.oilSpike;
        if (spike && s.gameDay > spike.endDay) {
            s.oilSpike = null;
            spike = null;
        }

        const spikeMult = spike ? spike.mult : 1.0;
        const finalMult = Math.round(baseMult * spikeMult * 100) / 100;
        const price = Math.round(OIL_PRICE.basePrice * finalMult);
        const trend = finalMult >= 1.20 ? 'crisis' : finalMult >= 1.08 ? 'high' : finalMult <= 0.85 ? 'cheap' : finalMult <= 0.95 ? 'low' : 'normal';
        return { mult: finalMult, price, trend, spike: spike ? spike.name : null };
    },

    // Check for oil spike events (called daily)
    checkOilSpike() {
        if (typeof OIL_PRICE === 'undefined') return;
        const s = this.state;
        if (s.oilSpike && s.gameDay <= s.oilSpike.endDay) return; // already active

        for (const sp of OIL_PRICE.spikes) {
            if (Math.random() < sp.prob) {
                const mult = sp.mult[0] + Math.random() * (sp.mult[1] - sp.mult[0]);
                const duration = Math.round(sp.duration[0] + Math.random() * (sp.duration[1] - sp.duration[0]));
                s.oilSpike = {
                    id: sp.id, name: D(sp, 'name'), icon: sp.icon,
                    mult: Math.round(mult * 100) / 100,
                    endDay: s.gameDay + duration,
                };
                const oil = this.getOilPrice();
                this.addFeed(`${sp.icon} ${D(sp,'name')}! ${T('oil.barrel')}: $${oil.price} (${duration}${T('common.day')})`, 'alert');
                break;
            }
        }
    },

    // Get the two bound directions for a route (e.g. ['WB','EB'], ['EB','WB'], ['SB','NB'])
    getRouteBounds(route) {
        const boundSet = new Set();
        (route.legs || []).forEach(l => boundSet.add(l.bound || 'EB'));
        const arr = [...boundSet];
        if (arr.length >= 2) return arr;
        return arr.length === 1 ? [arr[0], arr[0]] : ['EB', 'WB'];
    },

    // Get bound label text for display (e.g. 'W/B 한국→중국')
    getBoundLabel(route, boundCode) {
        const bl = route.boundLabels;
        if (!bl) return boundCode;
        const lang = (typeof currentLang !== 'undefined' && currentLang === 'ja') ? boundCode + 'ja' : boundCode;
        return bl[lang] || bl[boundCode] || boundCode;
    },

    // Get short bound display (e.g. 'W/B', 'S/B')
    getBoundShort(boundCode) {
        return boundCode.charAt(0) + '/' + boundCode.charAt(1);
    },

    // Get market condition for a port (seasonal rate/volume multipliers)
    getMarketCondition(portCode) {
        if (typeof MARKET_SEASONS === 'undefined') return { rateMult: 1.0, volMult: 1.0, trend: 'normal' };
        const ms = MARKET_SEASONS[portCode];
        if (!ms) return { rateMult: 1.0, volMult: 1.0, trend: 'normal' };
        const month = this.getGameDate().month;
        const rateMult = ms.rate[month];
        const volMult = ms.vol[month];
        // Add slight randomness (±5%) for variety
        const noise = 0.95 + Math.random() * 0.10;
        const finalRate = Math.round(rateMult * noise * 100) / 100;
        const finalVol = Math.round(volMult * noise * 100) / 100;
        const trend = finalRate >= 1.20 ? 'boom' : finalRate >= 1.05 ? 'up' : finalRate <= 0.85 ? 'slump' : finalRate <= 0.95 ? 'down' : 'normal';
        return { rateMult: finalRate, volMult: finalVol, trend };
    },

    // Get current weather for a port
    getWeather(portCode) {
        const gd = this.getGameDate();
        const data = WEATHER_DATA[portCode];
        if (!data) return { icon: '☀️', desc: T('weather.clear'), wave: 1, temp: 20, rain: false, snow: false, typhoon: false };

        const m = data[gd.month];
        // Deterministic daily seed based on gameDay + port for consistent weather
        const seed = (this.state.gameDay * 31 + portCode.charCodeAt(0)) % 100;
        const rain = seed < m.rain * 100;
        const snow = seed < m.snow * 100 && m.snow > 0;
        const typhoon = m.typhoon > 0 && (seed < m.typhoon * 100);
        const wave = m.wave + (typhoon ? 2 : (rain ? 1 : 0));

        let icon, weatherDesc;
        if (typhoon) { icon = '🌀'; weatherDesc = T('weather.typhoon'); }
        else if (snow) { icon = '🌨️'; weatherDesc = T('weather.snow'); }
        else if (rain && wave >= 3) { icon = '⛈️'; weatherDesc = T('weather.storm'); }
        else if (rain) { icon = '🌧️'; weatherDesc = T('weather.rain'); }
        else if (wave >= 4) { icon = '🌊'; weatherDesc = T('weather.highWave'); }
        else if (m.rain > 0.3 && seed < 50) { icon = '⛅'; weatherDesc = T('weather.cloudy'); }
        else { icon = '☀️'; weatherDesc = T('weather.clear'); }

        return { icon, desc: weatherDesc, detailDesc: m.desc, wave: Math.min(5, wave), temp: m.temp, rain, snow, typhoon };
    },

    // Get active typhoon track if any
    getActiveTyphoon() {
        const gd = this.getGameDate();
        const month = gd.month;
        // Check if any typhoon is active this month (deterministic based on gameDay)
        const seed = (this.state.gameDay * 7) % 100;
        const track = TYPHOON_TRACKS.find(t => t.months.includes(month) && seed < 15); // 15% chance per eligible typhoon
        return track || null;
    },

    findCust(id) {
        for (const port in this.state.custs) {
            const c = this.state.custs[port].find(c => c.id === id);
            if (c) return c;
        }
        return null;
    },

    // ==================== FEED ====================
    addFeed(msg, type = 'activity') {
        const s = this.state;
        const time = `D${s.gameDay}`;
        const list = document.getElementById('feed-list');
        const div = document.createElement('div');
        div.className = `feed-item ${type}`;
        div.innerHTML = `<span class="feed-time">${time}</span><span>${msg}</span>`;
        list.insertBefore(div, list.firstChild);
        // Keep max 50 items
        while (list.children.length > 50) list.removeChild(list.lastChild);
    },

    // ==================== SAVE/LOAD ====================
    saveGame() {
        try {
            this.state._saveVer = 4;
            this.state._saveTime = Date.now();
            localStorage.setItem('kmtc_save', JSON.stringify(this.state));
            // Update leaderboard every save
            this.saveToLeaderboard();
            // Cloud save (throttled: every 5 minutes)
            this._cloudSaveThrottled();
        } catch (e) { /* ignore */ }
    },

    _cloudSaveThrottled() {
        const now = Date.now();
        if (this._lastCloudSave && now - this._lastCloudSave < 300000) return; // 5min throttle
        this._lastCloudSave = now;
        this.cloudSave(true); // silent
    },

    async cloudSave(silent) {
        if (!this.state || !this.state.co) { if (!silent) this.toast(T('save.noData'), 'err'); return; }
        if (typeof fbDb === 'undefined' || !fbDb) { if (!silent) this.toast(T('save.fbNoConnect'), 'err'); return; }
        try {
            const key = this.state.co.replace(/[.#$/\[\]]/g, '_');
            const saveData = JSON.stringify(this.state);
            await fbDb.ref('saves/' + key).set({
                data: saveData,
                co: this.state.co,
                ceo: this.state.ceo,
                updatedAt: Date.now(),
                day: this.state.gameDay,
                rev: this.state.stats?.totRev || 0,
            });
            if (!silent) this.toast(T('save.cloudOK'), 'ok');
        } catch (e) {
            console.error('Cloud save failed:', e);
            if (!silent) this.toast(T('save.cloudFail') + ' ' + (e.message || ''), 'err');
        }
    },

    async cloudLoad(companyName) {
        if (!fbDb) { this.toast(T('save.offline'), 'err'); return false; }
        try {
            const key = companyName.replace(/[.#$/\[\]]/g, '_');
            const snap = await fbDb.ref('saves/' + key).once('value');
            const entry = snap.val();
            if (!entry || !entry.data) {
                this.toast(T('save.cloudNotFound'), 'err');
                return false;
            }
            // Write to localStorage and load normally
            localStorage.setItem('kmtc_save', entry.data);
            this.loadGame();
            this.toast(T('save.cloudLoaded', companyName), 'ok');
            return true;
        } catch (e) {
            console.error('Cloud load error:', e);
            this.toast(T('save.loadFail'), 'err');
            return false;
        }
    },

    loadGame() {
        try {
            const data = localStorage.getItem('kmtc_save');
            if (!data) return;
            const s = JSON.parse(data);
            // Restore route reference
            s.route = ROUTES.find(r => r.id === s.route.id);
            if (!s.route) { this.toast(T('save.routeNotFound'), 'err'); return; }

            // === Migration: fill missing fields from code updates ===
            if (!s.prospectPool) s.prospectPool = this.initProspectPool(s.route);
            if (!s.pendingRepos) s.pendingRepos = [];
            if (!s.promos) s.promos = [];
            if (!s.globalStrategy) s.globalStrategy = { strategy: 'lowest-share', actPreset: 'balanced', focusPort: null };
            if (!s.infra) s.infra = { training: 0, it: 0, offices: {}, shipLevel: 0 };
            if (!s.stats.history) s.stats.history = [];
            if (!s.activityLog) s.activityLog = [];
            if (!s.milestones) s.milestones = [];
            if (!s.alerts) s.alerts = [];
            if (!s.startedAt) s.startedAt = Date.now();
            if (!s.loans) s.loans = [];
            if (!s.infra.systems && s.infra.it) s.infra.systems = s.infra.it;
            s.salesTeam.forEach(sp => { if (sp.personalTraining === undefined) sp.personalTraining = 0; });
            if (!s.spotOffers) s.spotOffers = [];
            if (!s.bsaContracts) s.bsaContracts = [];
            if (!s.benchPool) s.benchPool = [];
            if (!s.slotCharters) s.slotCharters = [];
            s.slotCharters.forEach(sc => { if (!sc.voyage) sc.voyage = { dayCounter: 0 }; if (!sc.active) sc.active = true; });
            if (!s.slotSalesPorts) s.slotSalesPorts = {};
            if (!s.ownedRoutes) s.ownedRoutes = [];
            s.ownedRoutes.forEach(or => { if (!or.voyage) or.voyage = { dayCounter: 0 }; if (or.status === 'setup') or.status = 'active'; });
            if (!s.market) s.market = this.initMarket(s.route);
            if (!s.lastActiveTime) s.lastActiveTime = Date.now();
            if (!s.coId) s.coId = s.co + '#' + (s.startedAt || Date.now()).toString(36).slice(-4);
            if (s.oilSpike === undefined) s.oilSpike = null;
            if (s.safetyScore === undefined) s.safetyScore = 50;

            // Ensure RECRUIT_POOL characters are in benchPool
            if (typeof RECRUIT_POOL !== 'undefined') {
                const existingIds = new Set([...s.salesTeam.map(st => st.id), ...(s.benchPool || []).map(b => b.id)]);
                RECRUIT_POOL.forEach(r => {
                    if (!existingIds.has(r.id)) {
                        s.benchPool.push({ ...r });
                    }
                });
            }

            // Vacation & vitality migration
            s.salesTeam.forEach(st => {
                if (!st.traits.attack) st.traits.attack = 2;
                if (!st.traits.defense) st.traits.defense = 2;
                if (!st.traits.vitality) st.traits.vitality = 3;
                if (st.vacDaysTotal === undefined) st.vacDaysTotal = 18;
                if (st.vacDaysUsed === undefined) st.vacDaysUsed = 0;
            });
            if (s._lastVacYear === undefined) s._lastVacYear = Math.floor((s.gameDay - 1) / 365);

            // Ensure all ports have container entries
            s.route.ports.forEach(p => {
                if (!s.ctr[p]) s.ctr[p] = { '20': 0, '40': 0 };
            });

            // Ensure all customers have required fields
            for (const port in s.custs) {
                s.custs[port].forEach(c => {
                    if (c.loyalty === undefined) c.loyalty = 0;
                    if (c.share === undefined) c.share = 0;
                    if (!c.boosts) c.boosts = [];
                    if (!c.peakShare) c.peakShare = c.share;
                    if (!c.shareTrend) c.shareTrend = [];
                    if (!c.erosionLog) c.erosionLog = [];
                });
            }

            // Ensure salespeople have plan
            s.salesTeam.forEach(st => {
                if (!st.plan) st.plan = { strategy: 'lowest-share', actPreset: 'balanced', focusPort: null };
            });

            // Ensure voyage has all fields
            if (!s.voyage.unloads) s.voyage.unloads = [];
            if (s.voyage.completing === undefined) s.voyage.completing = false;

            this.state = s;

            // === Offline progress: simulate elapsed time ===
            if (s._saveTime) {
                const elapsed = Date.now() - s._saveTime;
                const elapsedHours = Math.floor(elapsed / (1000 * 60 * 60)); // real hours passed
                // 1 real hour = ~1 game day (simulate at reduced rate for fairness)
                // Cap at 7 game-days max (so active players still have advantage)
                const offlineDays = Math.min(7, Math.floor(elapsedHours * 0.5));
                if (offlineDays > 0 && s.voyage.status === 'port') {
                    // Run offline sales ticks
                    const ticksPerDay = 24;
                    for (let d = 0; d < offlineDays; d++) {
                        for (let h = 0; h < ticksPerDay; h++) {
                            this.tickSales();
                        }
                        s.gameDay++;
                        s.gameHour = 0;
                        if (s.voyage.status !== 'sailing') s.voyage.daysSinceLast++;
                        this.dailyUpdate();
                    }
                    this.addFeed(T('save.offlineProgress', offlineDays), 'alert');
                }
            }

            this.startGame();
            this.toast(T('save.loaded'), 'ok');
        } catch (e) {
            console.error('Load error:', e);
            this.toast(T('save.loadError'), 'err');
        }
    },

    // ==================== LEADERBOARD (리더보드 — Firebase 공유) ====================
    _getUserId() {
        let uid = localStorage.getItem('kmtc_uid');
        if (!uid) {
            uid = 'u_' + Date.now().toString(36) + '_' + Math.random().toString(36).slice(2, 8);
            localStorage.setItem('kmtc_uid', uid);
        }
        return uid;
    },

    _buildLeaderboardEntry() {
        const s = this.state;
        if (!s.co || s.stats.totVoy < 1) return null;
        const netProfit = s.stats.totRev - s.stats.totExp;
        const avgLF = s.stats.history.length > 0
            ? Math.round(s.stats.history.reduce((sum, h) => sum + (h.lf || 0), 0) / s.stats.history.length)
            : 0;
        return {
            uid: this._getUserId(),
            co: s.co,
            coId: s.coId || s.co,
            ceo: s.ceo,
            contact: s.contact || '',
            route: D(s.route, 'name') || s.route.id,
            totRev: Math.round(s.stats.totRev),
            totExp: Math.round(s.stats.totExp),
            netProfit: Math.round(netProfit),
            totVoy: s.stats.totVoy,
            totTEU: s.stats.totTEU,
            avgLF,
            cash: Math.round(s.cash),
            debt: Math.round(s.debt),
            day: s.gameDay,
            teamSize: s.salesTeam.length,
            bsaCount: (s.bsaContracts || []).length,
            updatedAt: Date.now(),
        };
    },

    saveToLeaderboard() {
        const entry = this._buildLeaderboardEntry();
        if (!entry) return;

        // Always save to localStorage as fallback
        const board = JSON.parse(localStorage.getItem('kmtc_leaderboard') || '[]');
        const idx = board.findIndex(b => b.uid === entry.uid);
        if (idx >= 0) board[idx] = entry;
        else board.push(entry);
        board.sort((a, b) => b.netProfit - a.netProfit);
        localStorage.setItem('kmtc_leaderboard', JSON.stringify(board.slice(0, 100)));

        // Push to Firebase — use uid as key for true dedup (same company name from different players OK)
        if (typeof fbDb !== 'undefined' && fbDb) {
            try {
                const fbKey = entry.uid.replace(/[.#$/\[\]]/g, '_');
                fbDb.ref('rankings/' + fbKey).set(entry);
            } catch(e) { /* silent */ }
        }
    },


    // Show contact info modal when reaching top 5
    // Campaign period config — set dates to enable contact collection
    _campaign: {
        active: false,          // master switch
        start: '2026-04-01',   // campaign start (YYYY-MM-DD)
        end: '2026-04-30',     // campaign end
        title: null,            // optional override (uses default T('rank.topTitle') if null)
    },

    checkTopRankContact() {
        // Only show during active campaign period
        const now = new Date();
        const camp = this._campaign;
        if (!camp.active) return;
        if (camp.start && now < new Date(camp.start)) return;
        if (camp.end && now > new Date(camp.end + 'T23:59:59')) return;

        const s = this.state;
        if (s.contact || s._contactDismissed) return;
        const rank = this._prevRank;
        if (rank < 0 || rank >= 5) return;

        // Show modal via evt-modal
        this.stopTick();
        document.getElementById('evt-title').textContent = T('rank.topTitle');
        const medalEmoji = rank === 0 ? '🥇' : rank === 1 ? '🥈' : rank === 2 ? '🥉' : '🏅';
        document.getElementById('evt-desc').innerHTML = `
            <div style="text-align:center;margin-bottom:12px">
                <div style="font-size:36px">${medalEmoji}</div>
                <div style="font-size:16px;font-weight:700;color:var(--green);margin:6px 0">${T('rank.topCongrats', rank + 1)}</div>
                <div style="font-size:12px;color:var(--t2)">${T('rank.topDesc')}</div>
            </div>
            <div style="text-align:left;margin:12px 0">
                <label style="font-size:11px;color:var(--t2);display:block;margin-bottom:4px">${T('rank.contactLabel')}</label>
                <input id="inp-contact" type="text" placeholder="${T('rank.contactPH')}"
                    style="width:100%;padding:10px;border-radius:8px;border:1px solid var(--border);background:var(--bg);color:var(--t1);font-size:13px;box-sizing:border-box">
                <div style="font-size:9px;color:var(--t3);margin-top:4px">${T('rank.contactHint')}</div>
            </div>`;
        document.getElementById('evt-actions').innerHTML =
            `<button class="btn-primary" onclick="Game.saveContact()" style="width:100%;margin-bottom:4px">${T('rank.contactSave')}</button>` +
            `<button class="btn-sm" onclick="Game.dismissContact()" style="width:100%;background:var(--card2)">${T('rank.contactSkip')}</button>`;
        document.getElementById('modal-event').classList.add('active');
    },

    saveContact() {
        const val = (document.getElementById('inp-contact')?.value || '').trim();
        if (val) {
            this.state.contact = val;
            this.saveToLeaderboard(); // re-save with contact info
            this.toast(T('rank.contactSaved'), 'ok');
        }
        this.closeModal('modal-event');
        this.startTick();
    },

    dismissContact() {
        this.state._contactDismissed = true;
        this.closeModal('modal-event');
        this.startTick();
    },

    _fbRankingCache: null,
    _fbRankingTs: 0,

    async _fetchFirebaseRankings() {
        // Cache for 30 seconds
        if (this._fbRankingCache && Date.now() - this._fbRankingTs < 30000) {
            return this._fbRankingCache;
        }
        if (typeof fbDb === 'undefined' || !fbDb) return null;
        try {
            const snap = await fbDb.ref('rankings').orderByChild('netProfit').limitToLast(100).once('value');
            const data = snap.val();
            if (!data) return [];
            const raw = Object.values(data);
            // Deduplicate by company name — keep most recent entry per co
            const byName = {};
            raw.forEach(e => {
                if (!byName[e.co] || (e.updatedAt || 0) > (byName[e.co].updatedAt || 0)) {
                    byName[e.co] = e;
                }
            });
            const arr = Object.values(byName);
            arr.sort((a, b) => b.netProfit - a.netProfit);
            this._fbRankingCache = arr;
            this._fbRankingTs = Date.now();
            this._cachedRankings = arr; // for market carriers
            this._marketCarriers = null; // reset carrier cache
            return arr;
        } catch(e) {
            console.warn('Firebase read failed:', e.message);
            return null;
        }
    },

    async renderRanking() {
        const s = this.state;
        const view = document.getElementById('ranking-view');

        // Show loading
        view.innerHTML = `<p style="color:var(--t3);font-size:12px;text-align:center;padding:20px">${T('save.rankLoading')}</p>`;

        // Update own entry first
        this.saveToLeaderboard();

        // Try Firebase first, fallback to localStorage
        let rankings = await this._fetchFirebaseRankings();
        let isOnline = rankings !== null;
        if (!isOnline) {
            rankings = JSON.parse(localStorage.getItem('kmtc_leaderboard') || '[]');
        }

        const uid = this._getUserId();
        const myCo = s.co || '';

        let html = '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px">';
        html += `<h4 style="font-size:14px;margin:0">${T('rank.title')}</h4>`;
        html += `<span style="font-size:10px;color:var(--t3)">`;
        html += isOnline
            ? `${T('rank.online')} — ${rankings.length}${T('rank.companies')}`
            : `${T('rank.offline')} — ${rankings.length}${T('rank.companies')} (${T('rank.local')})`;
        html += `</span></div>`;

        if (rankings.length === 0) {
            html += `<p style="color:var(--t3);font-size:12px;text-align:center;padding:20px">${T('rank.noCompanies')}</p>`;
            view.innerHTML = html;
            return;
        }

        // Detect rank change for my company
        const myRank = rankings.findIndex(b => b.uid === uid);
        const prevRank = this._prevRank;
        const rankChange = (prevRank >= 0 && myRank >= 0) ? prevRank - myRank : 0; // positive = moved up
        if (myRank >= 0) this._prevRank = myRank;

        // Summary for current company
        const me = rankings.find(b => b.uid === uid);
        if (me) {
            const rank = rankings.indexOf(me) + 1;
            const medal = rank === 1 ? '🥇' : rank === 2 ? '🥈' : rank === 3 ? '🥉' : `#${rank}`;
            let rankDelta = '';
            if (rankChange > 0) rankDelta = ` <span class="rank-change-badge up" style="font-size:11px">▲${rankChange}</span>`;
            else if (rankChange < 0) rankDelta = ` <span class="rank-change-badge down" style="font-size:11px">▼${Math.abs(rankChange)}</span>`;
            html += `<div style="background:linear-gradient(135deg,var(--card),var(--card2));border:1px solid var(--accent);border-radius:8px;padding:10px;margin-bottom:10px">
                <div style="font-size:13px;font-weight:700">${medal} ${me.co} <span style="font-size:10px;color:var(--t2)">(${T('rank.myCompany')})</span>${rankDelta}</div>
                <div style="display:grid;grid-template-columns:1fr 1fr 1fr 1fr;gap:6px;margin-top:6px;font-size:11px">
                    <div>📈 ${T('rank.rev')}<br><strong style="color:var(--green)">$${Math.round(me.totRev).toLocaleString()}</strong></div>
                    <div>💰 ${T('rank.profit')}<br><strong style="color:${me.netProfit >= 0 ? 'var(--green)' : 'var(--red)'}">$${Math.round(me.netProfit).toLocaleString()}</strong></div>
                    <div>🚢 ${T('rank.voyages')}<br><strong>${me.totVoy}${T('common.times')}</strong></div>
                    <div>📅 ${T('rank.elapsed')}<br><strong>D+${me.day || 0}</strong></div>
                </div>
            </div>`;
        }

        // Ranking table
        html += `<div style="font-size:10px;color:var(--t3);margin-bottom:4px">${T('rank.byProfit')}${isOnline ? ' (' + T('rank.allUsers') + ')' : ''}</div>`;
        html += '<div class="ranking-list">';

        rankings.forEach((entry, i) => {
            const isMe = entry.uid === uid;
            const medal = i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `<span style="color:var(--t3)">${i + 1}</span>`;
            const profitColor = entry.netProfit >= 0 ? 'var(--green)' : 'var(--red)';

            // Top 3 aurora classes
            const topClass = i === 0 ? 'rank-top rank-gold' : i === 1 ? 'rank-top rank-silver' : i === 2 ? 'rank-top rank-bronze' : '';
            // Rank-up animation for my company
            const upClass = (isMe && rankChange > 0) ? 'rank-up' : '';
            // Rank change badge
            let changeBadge = '';
            if (isMe && rankChange > 0) {
                changeBadge = `<span class="rank-change-badge up">▲${rankChange}</span>`;
            } else if (isMe && rankChange < 0) {
                changeBadge = `<span class="rank-change-badge down">▼${Math.abs(rankChange)}</span>`;
            }

            html += `<div class="rank-row ${isMe ? 'rank-me' : ''} ${topClass} ${upClass}" style="display:grid;grid-template-columns:30px 1fr 70px 70px 44px 44px;align-items:center;padding:6px 8px;border-bottom:1px solid var(--border);font-size:11px;${isMe ? 'background:var(--accent)15;border-left:3px solid var(--accent)' : ''}">
                <div style="text-align:center;font-size:13px">${medal}</div>
                <div>
                    <div style="font-weight:600">${entry.co}${isMe ? ` <span style="font-size:9px;color:var(--accent)">(${T('rank.me')})</span>` : ''} ${changeBadge}</div>
                    <div style="font-size:9px;color:var(--t3)">${entry.ceo} | ${entry.route}</div>
                </div>
                <div style="text-align:right">
                    <div style="color:var(--green);font-size:10px">${T('rank.rev')}</div>
                    <div>$${this._shortNum(entry.totRev)}</div>
                </div>
                <div style="text-align:right">
                    <div style="color:${profitColor};font-size:10px">${T('rank.profit')}</div>
                    <div style="color:${profitColor}">$${this._shortNum(entry.netProfit)}</div>
                </div>
                <div style="text-align:right;font-size:9px;color:var(--t3)">${entry.totVoy}${T('rank.voyages')}<br>LF${entry.avgLF}%</div>
                <div style="text-align:center;font-size:10px;color:var(--accent)"><div style="font-size:9px;color:var(--t3)">${T('rank.elapsed')}</div><strong>D+${entry.day || 0}</strong></div>
            </div>`;
        });

        // Spawn confetti for rank-up of 3+ positions
        if (rankChange >= 3) {
            setTimeout(() => {
                const meRow = document.querySelector('.rank-me');
                if (!meRow) return;
                const rect = meRow.getBoundingClientRect();
                const particles = ['🎉','⭐','🏆','✨','🚀','💎'];
                for (let p = 0; p < 10; p++) {
                    const el = document.createElement('span');
                    el.className = 'rank-confetti';
                    el.textContent = particles[p % particles.length];
                    el.style.left = (rect.left + Math.random() * rect.width) + 'px';
                    el.style.top = (rect.top + Math.random() * 20) + 'px';
                    el.style.position = 'fixed';
                    el.style.animationDelay = (Math.random() * 0.5) + 's';
                    el.style.animationDuration = (0.8 + Math.random() * 0.8) + 's';
                    document.body.appendChild(el);
                    setTimeout(() => el.remove(), 2000);
                }
            }, 300);
        }

        html += '</div>';

        if (rankings.length > 1) {
            const best = rankings[0];
            html += '<div style="margin-top:10px;font-size:10px;color:var(--t3);display:flex;justify-content:space-between">';
            html += `<span>${T('rank.best')}: ${best.co} ($${this._shortNum(best.netProfit)})</span>`;
            html += `<span>${T('rank.avgLF')}: ${Math.round(rankings.reduce((s,e) => s + (e.avgLF||0), 0) / rankings.length)}%</span>`;
            html += '</div>';
        }

        // Market share section
        if (s.market && Object.keys(s.market).length > 0) {
            // Sync market with latest rankings
            this.syncMarketWithRankings();

            html += '<div style="margin-top:16px;border-top:1px solid var(--border);padding-top:12px">';
            html += `<h4 style="font-size:13px;margin:0 0 8px">${T('rank.marketShare')}</h4>`;

            const carriers = this.getMarketCarriers();

            for (const lane in s.market) {
                const m = s.market[lane];
                const playerShare = m.shares.player || 0;
                if (playerShare <= 0 && m.totalVolume < 100) continue;
                const [from, to] = lane.split('-');
                const fromN = this.getPortName(from);
                const toN = this.getPortName(to);

                html += `<div style="margin-bottom:8px">`;
                html += `<div style="display:flex;justify-content:space-between;font-size:10px;margin-bottom:2px">`;
                html += `<span>${fromN} → ${toN}</span>`;
                html += `<span style="color:var(--accent)">${T('rank.weekly')} ${m.totalVolume}TEU | ${T('rank.myShare')} ${playerShare}%</span>`;
                html += `</div>`;

                html += `<div style="display:flex;height:14px;border-radius:3px;overflow:hidden;font-size:8px">`;
                if (playerShare > 0) {
                    html += `<div style="width:${playerShare}%;background:var(--accent);display:flex;align-items:center;justify-content:center;color:white;font-weight:700">${playerShare > 5 ? playerShare + '%' : ''}</div>`;
                }
                carriers.forEach(c => {
                    const sh = m.shares[c.id] || 0;
                    if (sh > 0) {
                        html += `<div style="width:${sh}%;background:${c.color};display:flex;align-items:center;justify-content:center;color:white;opacity:.7;min-width:0" title="${c.name} ${sh}%">${sh > 8 ? c.name.substring(0, 6) : ''}</div>`;
                    }
                });
                html += `</div></div>`;
            }

            // Legend
            html += '<div style="display:flex;flex-wrap:wrap;gap:6px;margin-top:8px;font-size:9px">';
            html += `<span style="display:flex;align-items:center;gap:2px"><span style="width:8px;height:8px;background:var(--accent);border-radius:2px;display:inline-block"></span> ${s.co}</span>`;
            carriers.forEach(c => {
                let hasShare = false;
                for (const lane in s.market) { if ((s.market[lane].shares[c.id] || 0) > 0) { hasShare = true; break; } }
                if (!hasShare) return;
                html += `<span style="display:flex;align-items:center;gap:2px"><span style="width:8px;height:8px;background:${c.color};border-radius:2px;display:inline-block"></span> ${c.name}</span>`;
            });
            html += '</div></div>';
        }

        // Refresh button
        html += `<div style="text-align:center;margin-top:10px">
            <button class="btn-sm" onclick="Game._fbRankingCache=null;Game.renderRanking()" style="font-size:10px;padding:4px 12px;background:var(--card2)">${T('rank.refresh')}</button>
        </div>`;

        view.innerHTML = html;

        // Check if player reached top 5 for contact info prompt
        if (myRank >= 0 && myRank < 5) {
            setTimeout(() => this.checkTopRankContact(), 500);
        }
    },

    _shortNum(n) {
        n = Math.round(n);
        if (Math.abs(n) >= 1e6) return (n / 1e6).toFixed(1) + 'M';
        if (Math.abs(n) >= 1e3) return (n / 1e3).toFixed(1) + 'K';
        return n.toLocaleString();
    },

    _timeAgo(ts) {
        if (!ts) return '';
        const diff = Date.now() - ts;
        const mins = Math.floor(diff / 60000);
        if (mins < 60) return T('common.minutesAgo', mins);
        const hrs = Math.floor(mins / 60);
        if (hrs < 24) return T('common.hoursAgo', hrs);
        return T('common.daysAgo', Math.floor(hrs / 24));
    },

    // ==================== MODALS & TOAST ====================
    openModal(id) { document.getElementById(id).classList.add('active'); },
    closeModal(id) { document.getElementById(id).classList.remove('active'); },

    // ==================== SAVE MENU ====================
    openSaveMenu() {
        this.stopTick();
        const s = this.state;
        const saveTime = s._saveTime ? new Date(s._saveTime).toLocaleString('ko-KR') : '-';
        const gd = this.getGameDate();

        let html = `
        <div style="text-align:center;margin-bottom:12px">
            <div style="font-size:13px;font-weight:700">${s.co}</div>
            <div style="font-size:11px;color:var(--t3)">${s.ceo} | ${gd.dateStr} (D+${s.startedAt ? Math.floor((Date.now() - s.startedAt) / 86400000) + 1 : s.gameDay})</div>
            <div style="font-size:10px;color:var(--t3);margin-top:4px">${T('save.lastSave')} ${saveTime}</div>
        </div>
        <div style="display:flex;flex-direction:column;gap:8px">
            <button class="btn-primary" onclick="Game.manualSave()" style="width:100%">
                ${T('menu.save')}
            </button>
            <button class="btn-primary" onclick="Game.cloudSave(false)" style="width:100%;background:#1565C0">
                ${T('menu.cloudSave')}
            </button>
            <button class="btn-primary" onclick="Game.saveAndExit()" style="width:100%;background:#b71c1c">
                ${T('menu.saveExit')}
            </button>
            <button class="btn-sm" onclick="Game.closeSaveMenu()" style="width:100%;background:var(--card2);margin-top:4px">
                ${T('menu.close')}
            </button>
        </div>
        <div style="margin-top:8px;padding:8px;background:var(--card2);border-radius:6px;font-size:10px;color:var(--t3);line-height:1.5">
            💡<br>
            1. ${T('menu.cloudDesc1')}<br>
            2. ${T('menu.cloudDesc2')}<br>
            3. "<strong>${s.co}</strong>"
        </div>
        <div style="border-top:1px solid var(--border);margin-top:12px;padding-top:12px">
            <button class="btn-sm" id="btn-newco-init" onclick="document.getElementById('btn-newco-init').style.display='none';document.getElementById('newco-confirm').style.display='block'" style="width:100%;background:var(--card2);color:var(--t3);font-size:11px">
                ${T('menu.newCompany')}
            </button>
            <div id="newco-confirm" style="display:none;margin-top:8px;padding:10px;background:rgba(255,23,68,.08);border:1px solid rgba(255,23,68,.3);border-radius:8px">
                <div style="font-size:11px;color:#ff5252;margin-bottom:8px;line-height:1.4">
                    ${T('save.resetWarn', s.co)}
                </div>
                <div style="display:flex;gap:8px">
                    <button class="btn-sm" onclick="Game.startNewCompany()" style="flex:1;background:#b71c1c;color:white;font-weight:700">${T('common.ok')}</button>
                    <button class="btn-sm" onclick="document.getElementById('btn-newco-init').style.display='';document.getElementById('newco-confirm').style.display='none'" style="flex:1;background:var(--card2)">${T('common.cancel')}</button>
                </div>
            </div>
        </div>
        <div style="border-top:1px solid var(--border);margin-top:12px;padding-top:12px;text-align:center">
            <div style="font-size:10px;color:var(--t3);margin-bottom:6px">${T('menu.language')}</div>
            <div style="display:flex;gap:8px;justify-content:center">
                <button class="btn-sm" onclick="setLanguage('ko');Game.openSaveMenu()" style="padding:6px 16px;${CURRENT_LANG==='ko'?'background:var(--accent);color:white':''}">${T('menu.langKo')}</button>
                <button class="btn-sm" onclick="setLanguage('ja');Game.openSaveMenu()" style="padding:6px 16px;${CURRENT_LANG==='ja'?'background:var(--accent);color:white':''}">${T('menu.langJa')}</button>
            </div>
        </div>`;

        document.getElementById('savemenu-body').innerHTML = html;
        this.openModal('modal-savemenu');
    },

    closeSaveMenu() {
        this.closeModal('modal-savemenu');
        this.startTick();
    },

    startNewCompany() {
        // Save final leaderboard entry before deleting
        this.saveToLeaderboard();
        // Generate new uid so old company stays in rankings
        localStorage.removeItem('kmtc_uid');
        // Clear save data (leaderboard is preserved separately)
        localStorage.removeItem('kmtc_save');
        this.stopTick();
        this.closeModal('modal-savemenu');
        this.state = {};
        // Go to title — show new game button, hide load button
        this.showScreen('screen-title');
        document.getElementById('btn-load').style.display = 'none';
        this.toast(T('save.resetDone'), 'ok');
    },

    showCloudLoadUI() {
        const el = document.getElementById('cloud-load-ui');
        el.style.display = el.style.display === 'none' ? 'block' : 'none';
        if (el.style.display === 'block') {
            document.getElementById('inp-cloud-co').focus();
        }
    },

    manualSave() {
        this.saveGame();
        this.cloudSave(false); // also cloud save on manual save
        this.toast(T('save.complete'), 'ok');
    },

    saveAndExit() {
        this.saveGame();
        this.stopTick();
        this.closeModal('modal-savemenu');
        this.showScreen('screen-title');
        document.getElementById('btn-load').style.display = 'inline-block';
        this.toast(T('save.exitDone'), 'ok');
    },

    toast(msg, type = '') {
        const box = document.getElementById('toast-box');
        const t = document.createElement('div');
        t.className = `toast ${type}`;
        t.textContent = msg;
        box.appendChild(t);
        setTimeout(() => t.remove(), 3000);
    },
    // ==================== TREND BOARD (Stock Ticker Style) ====================
    _trendData: null,
    _promoIdx: 0,
    _trendView: 'country', // 'country' or 'hot'

    async renderTrendBoard() {
        const board = document.getElementById('trend-board');
        if (!board) return;

        // Load data (fetch once, cache)
        if (!this._trendData) {
            try {
                const resp = await fetch('ticker_data.json');
                if (resp.ok) this._trendData = await resp.json();
            } catch(e) { /* silent */ }
        }

        const data = this._trendData;
        const isJa = CURRENT_LANG === 'ja';
        const listEl = document.getElementById('trend-list');
        const titleEl = document.getElementById('trend-title');
        const updEl = document.getElementById('trend-updated');

        if (!data || !listEl) {
            if (listEl) listEl.innerHTML = `<div style="padding:8px;font-size:10px;color:var(--t3);text-align:center">${isJa ? 'データ読込中...' : '데이터 로딩중...'}</div>`;
            setTimeout(() => this.renderTrendBoard(), 30000);
            return;
        }

        // Alternate between country ranking and hot ports every 15 seconds
        const showCountry = this._trendView === 'country';

        if (showCountry && data.country_ranking) {
            // === Stock Ticker: Country Ranking ===
            if (titleEl) titleEl.textContent = isJa ? '📊 仕向国別 照会ランキング' : '📊 도착국별 조회 랭킹';
            if (updEl) updEl.textContent = data.period_label || '';

            listEl.innerHTML = data.country_ranking.map((c, i) => {
                const rankCls = i < 3 ? ` r${i+1}` : '';
                const name = isJa ? c.name_ja : c.name_ko;
                const flag = {CN:'🇨🇳',IN:'🇮🇳',VN:'🇻🇳',TH:'🇹🇭',ID:'🇮🇩',HK:'🇭🇰',MY:'🇲🇾',SG:'🇸🇬'}[c.code] || '🌏';

                // Week-over-week change arrow
                let chgHtml = '';
                if (c.pct > 0) chgHtml = `<span style="color:var(--green);font-size:10px;font-weight:700">▲${c.pct}%</span>`;
                else if (c.pct < 0) chgHtml = `<span style="color:var(--red);font-size:10px;font-weight:700">▼${Math.abs(c.pct)}%</span>`;
                else chgHtml = `<span style="color:var(--yellow);font-size:10px">-</span>`;

                // Rank change badge
                let rankBadge = '';
                if (c.rank_chg > 0) rankBadge = `<span style="color:var(--green);font-size:9px;margin-left:3px">▲${c.rank_chg}</span>`;
                else if (c.rank_chg < 0) rankBadge = `<span style="color:var(--red);font-size:9px;margin-left:3px">▼${Math.abs(c.rank_chg)}</span>`;

                return `<div class="trend-row" style="border-left-color:${i<3 ? ['#FFD700','#C0C0C0','#CD7F32'][i] : 'transparent'}">
                    <span class="trend-rank${rankCls}">${c.rank}</span>
                    <span class="trend-route">${flag} ${name}${rankBadge}</span>
                    <span class="trend-teu">${c.count}${isJa ? '件' : '건'}</span>
                    <span style="min-width:48px;text-align:right">${chgHtml}</span>
                </div>`;
            }).join('');
        } else if (data.hot_ports && data.hot_ports.length > 0) {
            // === Hot Ports: Interest Surge ===
            if (titleEl) titleEl.textContent = isJa ? '🔥 注目急上昇 仕向地' : '🔥 관심 급상승 도착지';
            if (updEl) updEl.textContent = isJa ? '前週比' : '전주비';

            listEl.innerHTML = data.hot_ports.map((p, i) => {
                const rankCls = i < 3 ? ` r${i+1}` : '';
                const flag = {CN:'🇨🇳',IN:'🇮🇳',VN:'🇻🇳',TH:'🇹🇭',ID:'🇮🇩',HK:'🇭🇰',MY:'🇲🇾',SG:'🇸🇬'}[p.country] || '🌏';
                const ctryName = isJa
                    ? {CN:'中国',IN:'インド',VN:'ベトナム',TH:'タイ',ID:'インドネシア',HK:'香港',MY:'マレーシア',SG:'シンガポール'}[p.country]
                    : {CN:'중국',IN:'인도',VN:'베트남',TH:'태국',ID:'인도네시아',HK:'홍콩',MY:'말레이시아',SG:'싱가포르'}[p.country];

                return `<div class="trend-row" style="border-left-color:var(--green)">
                    <span class="trend-rank${rankCls}">${i+1}</span>
                    <span class="trend-route">${flag} ${p.port} <span style="font-size:9px;color:var(--t3)">${ctryName}</span></span>
                    <span class="trend-teu">${p.prev}→${p.count}</span>
                    <span style="min-width:48px;text-align:right;color:var(--green);font-size:10px;font-weight:700">▲${p.pct}%</span>
                </div>`;
            }).join('');
        }

        // Toggle view + rotate promo
        this._trendView = showCountry ? 'hot' : 'country';

        // Fixed strategic promo messages (rotate)
        const promos = [
            { tag: 'HOT', msg: isJa ? '🇯🇵→🇹🇭 日本発タイ向け 集荷強化中！運賃お問い合わせ歓迎' : '🇯🇵→🇹🇭 일본발 태국향 집하 강화중! 운임 문의 환영', highlight: true },
            { tag: 'NEW', msg: isJa ? '🇯🇵→🇮🇳 日本発インド向け 新サービス開始！チェンナイ・ムンバイ直航' : '🇯🇵→🇮🇳 일본발 인도향 신규 서비스! 첸나이·뭄바이 직항', highlight: true },
            { tag: 'KMTC', msg: isJa ? '📦 小口貨物も大歓迎 — LCL/FCL対応。まずはお見積りを！' : '📦 소량 화물도 대환영 — LCL/FCL 대응. 견적 요청하세요!', highlight: false },
            { tag: 'SPEED', msg: isJa ? '⚡ 韓国向け最速 — 釜山ダイレクト週３便' : '⚡ 한국향 최속 — 부산 다이렉트 주3편', highlight: false },
            { tag: 'ECO', msg: isJa ? '🌱 KMTC Green Shipping — CO2排出量30%削減達成' : '🌱 KMTC Green Shipping — CO2 배출 30% 감축 달성', highlight: false },
        ];
        const promoEl = document.getElementById('trend-promo');
        if (promoEl) {
            const p = promos[this._promoIdx % promos.length];
            promoEl.innerHTML = `<div class="promo-banner ${p.highlight ? 'highlight' : ''}">
                <span class="promo-tag">${p.tag}</span>
                <span class="promo-msg">${p.msg}</span>
            </div>`;
            this._promoIdx++;
        }

        // Refresh every 15 seconds (alternate views)
        setTimeout(() => this.renderTrendBoard(), 15000);
    },

};

// Auto-save when browser closes/refreshes
window.addEventListener('beforeunload', () => {
    if (Game.state && Game.state.co) {
        Game.saveGame();
    }
});

// Also save on visibility change (tab switch, minimize)
document.addEventListener('visibilitychange', () => {
    if (document.hidden && Game.state && Game.state.co) {
        Game.saveGame();
    }
});

// Check for save on load
window.addEventListener('DOMContentLoaded', () => {
    if (localStorage.getItem('kmtc_save')) {
        document.getElementById('btn-load').style.display = 'inline-block';
    }
    // Migrate + deduplicate Firebase rankings
    if (typeof fbDb !== 'undefined' && fbDb) {
        try {
            // Migrate local data if not done
            if (!localStorage.getItem('kmtc_fb_migrated')) {
                const board = JSON.parse(localStorage.getItem('kmtc_leaderboard') || '[]');
                board.forEach(entry => {
                    if (!entry.uid) entry.uid = 'u_' + Date.now().toString(36) + '_' + Math.random().toString(36).slice(2, 8);
                    fbDb.ref('rankings/' + entry.uid).set(entry);
                });
                localStorage.setItem('kmtc_fb_migrated', '1');
            }
            // One-time cleanup: remove duplicate company names, keep newest
            if (!localStorage.getItem('kmtc_fb_deduped2')) {
                fbDb.ref('rankings').once('value').then(snap => {
                    const data = snap.val();
                    if (!data) return;
                    const byName = {};
                    Object.entries(data).forEach(([key, entry]) => {
                        const name = entry.co;
                        if (!byName[name] || (entry.updatedAt || 0) > (byName[name].updatedAt || 0)) {
                            // If there was a previous best, mark it for deletion
                            if (byName[name]) byName[name].deleteKey = true;
                            byName[name] = { ...entry, key, deleteKey: false };
                        } else {
                            // This entry is older, mark for deletion
                            fbDb.ref('rankings/' + key).remove();
                        }
                    });
                    // Delete older duplicates
                    Object.values(byName).forEach(e => {
                        if (e.deleteKey) fbDb.ref('rankings/' + e.key).remove();
                    });
                    localStorage.setItem('kmtc_fb_deduped2', '1');
                    console.log('Firebase dedup complete');
                });
            }
        } catch(e) { console.warn('Migration/dedup failed:', e.message); }
    }
});

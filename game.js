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

    // ==================== ROUTE SELECTION ====================
    renderRoutes() {
        document.getElementById('route-cards').innerHTML = ROUTES.map(r => {
            const portStr = r.ports.map(p => `<span class="ptag">${r.portNames[p]}</span>`).join('<span class="parr">→</span>');
            const locked = r.unlockRevenue > 0;
            return `
            <div class="route-card ${locked ? 'locked' : ''}" onclick="${locked ? '' : `Game.pickRoute('${r.id}')`}" style="border-top:4px solid ${r.color};${locked ? 'opacity:.5;cursor:default' : ''}">
                <div class="rc-hdr"><h3>${r.nameKo}</h3><span class="diff" style="background:${r.color}20;color:${r.color}">${r.difficulty}</span></div>
                <p style="font-size:12px;color:var(--t2)">${r.description}</p>
                <div class="rc-ports">${portStr}<span class="parr">→</span><span class="ptag">${r.portNames[r.ports[0]]}</span></div>
                <div class="rc-stats">
                    <div class="rc-stat"><span>선박</span><span>${r.vesselSize} TEU</span></div>
                    <div class="rc-stat"><span>항정</span><span>${r.rotationDays}일</span></div>
                </div>
                <div class="rc-foot"><div class="rc-cost">$${(r.investmentCost/1e3).toFixed(0)}K</div><div class="rc-cost-lbl">${locked ? `매출 $${(r.unlockRevenue/1e3).toFixed(0)}K 달성 시 해금` : '초기 투자'}</div></div>
            </div>`;
        }).join('');
    },

    pickRoute(id) {
        this._route = ROUTES.find(r => r.id === id);
        const r = this._route;
        document.getElementById('setup-info').innerHTML = [
            ['항로', r.nameKo], ['선박', `${r.vesselSize} TEU`],
            ['항정', `${r.rotationDays}일`], ['투자', `$${r.investmentCost.toLocaleString()}`],
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
                { label: '협상', key: 'negotiation', icon: '🤝', color: '#E65100' },
                { label: '대면', key: 'faceToFace', icon: '🚶', color: '#AD1457' },
                { label: 'IT', key: 'digital', icon: '💻', color: '#1565C0' },
                { label: '관계', key: 'relationship', icon: '💛', color: '#6A1B9A' },
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
                <div class="dc-name">${ch.name}</div>
                <div class="dc-position" style="color:${ch.cardColor}">${ch.position}</div>
                <div class="dc-salary">💰 $${ch.salary}/월</div>
                <div class="dc-bars">${barsHtml}</div>
                <div class="dc-desc">${ch.desc}</div>
                <div class="dc-sw">
                    <div class="dc-str">💪 ${ch.strength}</div>
                    <div class="dc-wk">⚠️ ${ch.weakness}</div>
                </div>
                <div class="dc-passive">⭐ ${ch.passive}</div>
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
            return `<div class="draft-pick-mini"><span>${ch.avatar}</span><span>${ch.name}</span><span style="color:${ch.cardColor};font-size:10px">${ch.position}</span></div>`;
        }).join('');
        const remaining = 5 - this._draftPicks.length;
        document.getElementById('draft-selected').innerHTML = selHtml + (remaining > 0 ? `<div class="draft-pick-empty">${remaining}명 더 선택</div>` : '');
        // Enable/disable launch button
        const btn = document.getElementById('btn-draft-go');
        btn.disabled = this._draftPicks.length !== 5;
        btn.textContent = this._draftPicks.length === 5 ? '🚀 이 팀으로 시작!' : `🚀 이 팀으로 시작 (${this._draftPicks.length}/5)`;
    },

    // ==================== LAUNCH ====================
    launch() {
        const r = this._route;
        const co = document.getElementById('inp-company').value.trim();
        const ceo = document.getElementById('inp-ceo').value.trim() || '김선장';
        const vessel = document.getElementById('inp-vessel').value.trim() || 'KMTC BUSAN';

        // Company name is required (used for ranking)
        if (!co) {
            this.toast('회사명을 입력해주세요! (랭킹에 표시됩니다)', 'err');
            document.getElementById('inp-company').focus();
            document.getElementById('inp-company').style.border = '2px solid var(--red)';
            return;
        }

        // Containers: all at home port initially
        const ctr = {};
        r.ports.forEach(p => { ctr[p] = { '20': 0, '40': 0 }; });
        ctr[r.ports[0]] = { '20': 50, '40': 50 };

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
        const unpicked = [...draftUnpicked, ...scoutPool];

        this.state = {
            co, ceo, vessel, route: r,
            cash: Math.round(r.investmentCost * 0.5),
            debt: Math.round(r.investmentCost * 0.5),
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
        if (pl) pl.textContent = `${s.route.portNames[s.route.ports[0]]}항`;
        this.updateAll();
        this.updateTicker();
        this.startTick();
        this.addFeed('🏢 회사 설립 완료! 영업사원들이 활동을 시작합니다.', 'alert');
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

        // Auto-depart check
        if (s.voyage.daysSinceLast >= s.route.rotationDays && s.voyage.status === 'port') {
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

        // Daily salaries
        const dailySalary = s.salesTeam.reduce((sum, st) => sum + st.salary / 30, 0) + s.captain.salary / 30;
        s.cash -= dailySalary;
        s.stats.totExp += dailySalary;

        // Stamina recovery
        s.salesTeam.forEach(st => { st.stamina = Math.min(100, st.stamina + 10); });

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
            expired.forEach(o => this.addFeed(`⏰ 스팟 물량 "${o.name}" 마감! 기회를 놓쳤습니다.`, 'alert'));
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

        // Ship accident check (random, every 5~65 days)
        if (typeof SHIP_ACCIDENTS !== 'undefined') {
            if (!s.lastAccidentDay) s.lastAccidentDay = 0;
            const daysSinceAccident = s.gameDay - s.lastAccidentDay;
            if (daysSinceAccident >= 5) {
                // Probability increases as days pass: 0% at day 5, ~2% at day 30, ~5% at day 65
                const accidentProb = Math.min(0.05, (daysSinceAccident - 5) * 0.001);
                if (Math.random() < accidentProb) {
                    this.triggerShipAccident();
                }
            }
        }

        // Check milestones
        this.checkMilestones();

        // Auto-save daily
        this.saveGame();
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
        // Player starts with 0%, NPC carriers split the rest
        const market = {};
        if (typeof MARKET_VOLUME !== 'undefined') {
            for (const lane in MARKET_VOLUME) {
                const [from, to] = lane.split('-');
                // Only init lanes relevant to player's starting route
                if (r.ports.includes(from) || r.ports.includes(to)) {
                    const shares = {};
                    shares['player'] = 0; // player starts at 0
                    NPC_CARRIERS.forEach(npc => {
                        shares[npc.id] = Math.round(npc.strength * 100);
                    });
                    market[lane] = { totalVolume: MARKET_VOLUME[lane], shares };
                }
            }
        }
        return market;
    },

    // Get player's market share % for a trade lane
    getPlayerMarketShare(lane) {
        const m = this.state.market?.[lane];
        if (!m) return 0;
        return m.shares?.player || 0;
    },

    // Get player's TEU allocation for a trade lane based on market share
    getPlayerVolume(lane) {
        const m = this.state.market?.[lane];
        if (!m) return 999; // no market limit if not initialized
        const share = m.shares?.player || 0;
        return Math.round(m.totalVolume * share / 100);
    },

    // Transfer market share from one carrier to player
    transferMarketShare(lane, fromCarrierId, amount) {
        const m = this.state.market?.[lane];
        if (!m || !m.shares) return 0;
        const available = m.shares[fromCarrierId] || 0;
        const actual = Math.min(amount, available);
        if (actual <= 0) return 0;
        m.shares[fromCarrierId] = (m.shares[fromCarrierId] || 0) - actual;
        m.shares.player = (m.shares.player || 0) + actual;
        return actual;
    },

    // NPC carriers erode player share (called daily)
    marketErosion() {
        const s = this.state;
        if (!s.market) return;

        // Calculate inactivity penalty
        const hoursSinceActive = (Date.now() - (s.lastActiveTime || Date.now())) / 3600000;
        const inactivityMult = hoursSinceActive > 24 ? 1.5 : (hoursSinceActive > 12 ? 1.2 : 1.0);

        for (const lane in s.market) {
            const m = s.market[lane];
            if (!m.shares || m.shares.player <= 0) continue;

            // Each NPC carrier has a small chance to steal from player
            NPC_CARRIERS.forEach(npc => {
                const stealChance = npc.strength * 0.08 * inactivityMult;
                if (Math.random() < stealChance) {
                    const steal = Math.round(0.5 + Math.random() * 1.5);
                    const actual = Math.min(steal, m.shares.player);
                    if (actual > 0) {
                        m.shares.player -= actual;
                        m.shares[npc.id] = (m.shares[npc.id] || 0) + actual;
                    }
                }
            });
        }

        // Warn if significant inactivity
        if (hoursSinceActive > 48 && s.gameDay % 7 === 0) {
            this.addFeed(`⚠️ 장기간 영업관리 소홀! 경쟁사들이 화주를 빼앗아가고 있습니다!`, 'alert');
        }
    },

    // Expand market to new lanes when new routes are activated
    expandMarket(pkg) {
        const s = this.state;
        if (!s.market) s.market = {};
        for (const lane in MARKET_VOLUME) {
            if (s.market[lane]) continue; // already exists
            const [from, to] = lane.split('-');
            if (pkg.ports.includes(from) || pkg.ports.includes(to)) {
                const shares = {};
                shares['player'] = 0;
                NPC_CARRIERS.forEach(npc => {
                    shares[npc.id] = Math.round(npc.strength * 100);
                });
                s.market[lane] = { totalVolume: MARKET_VOLUME[lane], shares };
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
        const title = isGlobal ? '📋 전체 영업 전략' : `📋 ${st.avatar} ${st.name} 영업 계획`;

        let html = '';

        // Salesperson info (if individual)
        if (st) {
            const t = st.traits || {};
            html += `<div style="background:var(--card2);border-radius:8px;padding:10px;margin-bottom:12px;font-size:11px">
                <div style="font-size:13px;font-weight:600;margin-bottom:6px">${st.avatar} ${st.name} <span style="color:var(--t3)">⭐${st.skill}</span></div>
                <div style="color:var(--t2);margin-bottom:6px">${st.desc || ''}</div>
                <div style="display:flex;gap:8px;flex-wrap:wrap">
                    <span>🤝 협상 ${'■'.repeat(t.negotiation||1)}${'□'.repeat(5-(t.negotiation||1))}</span>
                    <span>🚶 대면 ${'■'.repeat(t.faceToFace||1)}${'□'.repeat(5-(t.faceToFace||1))}</span>
                    <span>💻 IT ${'■'.repeat(t.digital||1)}${'□'.repeat(5-(t.digital||1))}</span>
                    <span>💛 관계 ${'■'.repeat(t.relationship||1)}${'□'.repeat(5-(t.relationship||1))}</span>
                </div>
            </div>`;
        }

        // Strategy selection
        html += '<div style="margin-bottom:12px"><div style="font-size:11px;color:var(--t2);margin-bottom:4px">📍 타겟 전략</div>';
        SALES_STRATEGIES.forEach(strat => {
            const selected = plan.strategy === strat.id;
            html += `<div class="assign-cust ${selected ? 'selected' : ''}" onclick="Game.setPlan('${stId}','strategy','${strat.id}')">
                <span>${strat.icon} ${strat.name}</span>
                <span style="font-size:10px;color:var(--t3)">${strat.desc}</span>
            </div>`;
        });
        html += '</div>';

        // Port focus (if port-focus strategy)
        if (plan.strategy === 'port-focus') {
            html += '<div style="margin-bottom:12px"><div style="font-size:11px;color:var(--t2);margin-bottom:4px">📍 집중 항구</div>';
            // Main route ports
            s.route.ports.forEach(p => {
                const selected = plan.focusPort === p;
                html += `<div class="assign-cust ${selected ? 'selected' : ''}" onclick="Game.setPlan('${stId}','focusPort','${p}')">
                    <span>${s.route.portNames[p]}</span></div>`;
            });
            // Slot charter ports
            (s.slotCharters || []).filter(sc => sc.active).forEach(sc => {
                const scDef = SLOT_CHARTERS.find(d => d.id === sc.id);
                if (!scDef) return;
                scDef.ports.filter(p => !s.route.ports.includes(p)).forEach(p => {
                    const selected = plan.focusPort === p;
                    html += `<div class="assign-cust ${selected ? 'selected' : ''}" onclick="Game.setPlan('${stId}','focusPort','${p}')" style="border-left:3px solid ${scDef.color || 'var(--accent2)'}">
                        <span>${scDef.portNames[p]} <span style="font-size:9px;color:var(--accent2)">슬롯</span></span></div>`;
                });
            });
            html += '</div>';
        }

        // Target carrier (if steal-cargo strategy)
        if (plan.strategy === 'steal-cargo' && typeof NPC_CARRIERS !== 'undefined') {
            html += '<div style="margin-bottom:12px"><div style="font-size:11px;color:var(--t2);margin-bottom:4px">⚔️ 공략 대상 선사</div>';
            // Show NPC carriers with their current market share
            NPC_CARRIERS.forEach(npc => {
                const selected = plan.targetCarrier === npc.id;
                // Calculate average market share for this carrier
                let totalShare = 0, laneCount = 0;
                for (const lane in s.market) {
                    if (s.market[lane].shares[npc.id]) { totalShare += s.market[lane].shares[npc.id]; laneCount++; }
                }
                const avgShare = laneCount > 0 ? Math.round(totalShare / laneCount) : 0;
                html += `<div class="assign-cust ${selected ? 'selected' : ''}" onclick="Game.setPlan('${stId}','targetCarrier','${npc.id}')" style="border-left:3px solid ${npc.color}">
                    <span>${npc.name} <span style="font-size:10px;color:var(--t3)">점유율 ~${avgShare}%</span></span>
                    <span style="font-size:10px;color:var(--t3)">${npc.desc}</span>
                </div>`;
            });
            // Also show Firebase ranking players
            if (this._cachedRankings && this._cachedRankings.length > 0) {
                html += '<div style="font-size:10px;color:var(--accent);margin:6px 0 4px">📊 실제 유저 (참고)</div>';
                this._cachedRankings.slice(0, 5).forEach(r => {
                    if (r.co === s.co) return; // skip self
                    html += `<div style="padding:4px 8px;font-size:11px;color:var(--t2);border-left:3px solid var(--accent2);margin:2px 0;border-radius:4px;background:var(--card2)">
                        🏢 ${r.co} — 매출 $${(r.rev || 0).toLocaleString()} <span style="color:var(--t3)">(NPC 대리)</span>
                    </div>`;
                });
            }
            html += '</div>';
        }

        // Activity preset
        html += '<div style="margin-bottom:12px"><div style="font-size:11px;color:var(--t2);margin-bottom:4px">📊 활동 배분 (8시간 근무)</div>';
        ACTIVITY_PRESETS.forEach(pre => {
            const selected = plan.actPreset === pre.id;
            const mixDesc = Object.entries(pre.mix).map(([k, v]) => {
                const act = SALES_ACTIVITIES.find(a => a.id === k);
                return `${act?.icon||''} ${Math.round(v*100)}%`;
            }).join(' ');
            html += `<div class="assign-cust ${selected ? 'selected' : ''}" onclick="Game.setPlan('${stId}','actPreset','${pre.id}')">
                <span>${pre.icon} ${pre.name}</span>
                <span style="font-size:10px;color:var(--t3)">${mixDesc}</span>
            </div>`;
        });
        html += '</div>';

        // Apply to all button (if individual)
        if (!isGlobal) {
            html += `<button class="btn-sm" onclick="Game.applyGlobalPlan('${stId}')" style="width:100%;margin-bottom:6px">🔄 전체 전략과 동일하게</button>`;
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
        this.toast('💾 전략 변경 저장 완료!', 'ok');
        this.renderSalesTeam();
    },

    applyGlobalPlan(stId) {
        const s = this.state;
        const st = s.salesTeam.find(t => t.id === stId);
        if (st) st.plan = { ...s.globalStrategy };
        this.openPlanConfig(stId);
        this.toast('전체 전략 적용 완료', 'ok');
    },

    assignPortFocus(portCode, salesId) {
        const s = this.state;
        const st = s.salesTeam.find(t => t.id === salesId);
        if (!st) return;
        st.plan.strategy = 'port-focus';
        st.plan.focusPort = portCode;
        st.plan.actPreset = 'digital'; // digital-first for quick results
        const portName = this.getPortName(portCode);
        this.toast(`${st.avatar} ${st.name} → ${portName} 집중 영업 배치!`, 'ok');
        this.addFeed(`📍 ${st.name}을(를) ${portName} 집중 영업에 배치했습니다.`, 'alert');
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
        if (r.portNames[port]) return r.portNames[port];
        if (s.slotCharters) {
            for (const charter of s.slotCharters) {
                const sc = SLOT_CHARTERS.find(x => x.id === charter.id);
                if (sc && sc.portNames[port]) return sc.portNames[port];
            }
        }
        return port;
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

        // Pick from top 3 with some randomness
        const top = allCusts.slice(0, Math.min(3, allCusts.length));
        return top[Math.floor(Math.random() * top.length)];
    },

    // Pick activity based on preset and traits
    pickActivityByPlan(st) {
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
        const isWorkHour = s.gameHour >= 9 && s.gameHour < 17; // 9AM-5PM (8 hours)
        let needsUpdate = false;

        s.salesTeam.forEach(st => {
            // Resting
            if (st.activity === 'rest') {
                st.stamina = Math.min(100, st.stamina + 2);
                st.actDaysLeft -= hourFraction;
                if (st.actDaysLeft <= 0) {
                    st.activity = null;
                    this.addFeed(`${st.avatar} ${st.name} 휴식 완료! (체력 ${Math.round(st.stamina)}%)`, 'activity');
                    needsUpdate = true;
                }
                return;
            }

            // Working on a task
            if (st.activity) {
                if (!isWorkHour) return; // Off hours: no progress
                st.actDaysLeft -= hourFraction;
                const act = SALES_ACTIVITIES.find(a => a.id === st.activity);
                st.actProgress = Math.min(1, 1 - st.actDaysLeft / (act?.duration || 1));
                st.stamina = Math.max(0, st.stamina - 0.5);

                if (st.actDaysLeft <= 0) {
                    this.completeSalesActivity(st);
                    st.activity = null;
                    st.actTarget = null;
                    needsUpdate = true;
                }
                return;
            }

            // Idle: auto-assign next task if work hours and has stamina
            if (isWorkHour && st.stamina >= 10) {
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
                        this.addFeed(`${st.avatar} ${st.name}: ${target.cust.icon}${target.cust.name} ${act2.name} 시작`, 'activity');
                    } else {
                        const port = ports[Math.floor(Math.random() * ports.length)];
                        st.activity = 'prospect';
                        st.actTarget = '__prospect__';
                        st.actTargetPort = port;
                        st.actProgress = 0;
                        st.actDaysLeft = act.duration;
                        this.addFeed(`${st.avatar} ${st.name}: 🔍 ${s.route.portNames[port]} 신규 화주 발굴 시작`, 'activity');
                    }
                } else {
                    const target = this.pickCustomerByStrategy(st);
                    if (!target) return;
                    st.activity = act.id;
                    st.actTarget = target.cust.id;
                    st.actTargetPort = target.port;
                    st.actProgress = 0;
                    st.actDaysLeft = act.duration;
                    this.addFeed(`${st.avatar} ${st.name}: ${target.cust.icon}${target.cust.name} ${act.name} 시작`, 'activity');
                }
                needsUpdate = true;
            } else if (st.stamina < 10 && !st._lowStaminaWarned) {
                st._lowStaminaWarned = true;
                this.addFeed(`⚠️ ${st.name} 체력 부족! 휴식이 필요합니다.`, 'alert');
            }

            // Night rest: recover stamina off-hours
            if (!isWorkHour) {
                st.stamina = Math.min(100, st.stamina + 0.5);
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
            this.addFeed(`🎉 ${st.name} 스킬 레벨업! Lv.${st.skill}`, 'alert');
            this.toast(`${st.name} 레벨업! ⭐${st.skill}`, 'ok');
        }

        // Success check (uses trait-based calculation)
        let successRate = this.calcSuccessRate(st, cust, act, custPort);

        // Loyalty boost
        cust.loyalty = Math.min(100, cust.loyalty + act.expGain * 0.5);

        const success = Math.random() < successRate;

        // Log activity
        const custName = cust.name;
        const actName = act.name;
        s.activityLog.push({
            day: s.gameDay, spName: st.name, spAvatar: st.avatar,
            custName, custIcon: cust.icon, actName, actIcon: act.icon,
            success, port: custPort, cost: act.costPerAct, revenue: 0,
        });
        // Keep max 100 entries
        if (s.activityLog.length > 100) s.activityLog.shift();

        this.addFeed(`${st.avatar} ${st.name}: ${custName} ${actName} ${success ? '✅ 성공!' : '❌ 실패'}`, success ? 'booking' : 'activity');

        if (success) {
            // Generate booking!
            this.generateBooking(cust, custPort, st);
        }
    },

    completeProspect(st, act) {
        const s = this.state;
        const port = st.actTargetPort;
        const portName = s.route.portNames[port] || port;

        // Cost & exp
        s.cash -= act.costPerAct;
        s.stats.totExp += act.costPerAct;
        st.exp += act.expGain;
        const newSkill = Math.min(5, 1 + Math.floor(st.exp / 100));
        if (newSkill > st.skill) {
            st.skill = newSkill;
            this.addFeed(`🎉 ${st.name} 스킬 레벨업! Lv.${st.skill}`, 'alert');
            this.toast(`${st.name} 레벨업! ⭐${st.skill}`, 'ok');
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
            custName: `${portName} 신규 개척`, custIcon: '🔍', actName: act.name, actIcon: act.icon,
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

            this.addFeed(`🎯 ${st.avatar} ${st.name}: ${portName}에서 신규 화주 ${newCust.icon}${newCust.name} 발굴! 영업 개시 가능!`, 'booking');
            this.toast(`🎯 신규 화주 발굴! ${newCust.icon}${newCust.name}`, 'ok');

            // Check remaining prospects
            const totalLeft = Object.values(s.prospectPool).reduce((sum, arr) => sum + arr.length, 0);
            if (totalLeft === 0) {
                this.addFeed('🏆 모든 잠재 화주를 발굴했습니다!', 'alert');
            }
        } else {
            this.addFeed(`${st.avatar} ${st.name}: ${portName} 신규 개척 ❌ 유망 화주를 찾지 못했습니다`, 'activity');
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
        let vol20 = Math.max(0, Math.round((cust.maxVol20 * shareMultiplier) * (0.6 + Math.random() * 0.4)));
        let vol40 = Math.max(0, Math.round((cust.maxVol40 * shareMultiplier) * (0.6 + Math.random() * 0.4)));
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

        // Discount based on customer relationship
        const discount = cust.baseDiscount * (1 - cust.loyalty / 200);
        const r20 = Math.round(rate['20'] * (1 - discount));
        const r40 = Math.round(rate['40'] * (1 - discount));
        const revenue = avail20 * r20 + avail40 * r40;

        // Book it
        s.bookings.push({
            custId: cust.id, custName: cust.name, custIcon: cust.icon,
            leg, port, q20: avail20, q40: avail40, r20, r40, revenue, delivered: false,
        });

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
        // Merge slot charter + owned route port names
        if (s.slotCharters) s.slotCharters.forEach(sc => { const d = SLOT_CHARTERS.find(x => x.id === sc.id); if (d) Object.assign(portNames, d.portNames); });
        if (s.ownedRoutes) s.ownedRoutes.forEach(or => { const d = NEW_ROUTE_PACKAGES.find(x => x.id === or.id); if (d) Object.assign(portNames, d.portNames); });

        this.addFeed(`📦 수주! ${cust.icon}${cust.name} ${portNames[port] || port}→${portNames[dest] || dest} ${avail20 + avail40 * 2}TEU $${revenue.toLocaleString()}`, 'booking');
        this.toast(`${cust.name} 수주! ${avail20 + avail40 * 2}TEU`, 'ok');

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
                        this.addFeed(`⚠️ ${s.competitor.name}이 ${c.name} 물량을 잠식 중! (-${loss}%)`, 'alert');
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
        if (erosionPct >= 30) { severity = 'critical'; label = '심각'; }
        else if (erosionPct >= 15) { severity = 'danger'; label = '위험'; }
        else { severity = 'warning'; label = '주의'; }

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
                icon: '👤', name: '전담 영업사원 배치',
                desc: '성공률 +30%, 점유율 회복 2배',
                cost: 8000, days: 21,
                impact: '높음', priority: erosion.severity === 'critical' ? 1 : 2,
            });
        }

        // 2. Priority service booster
        const hasPriority = (c.boosts || []).some(b => b.id === 'priority' && b.daysLeft > 0);
        if (!hasPriority) {
            recs.push({
                icon: '🥇', name: '우선 선적 보장',
                desc: '점유율 회복 3배 + 충성도 +10',
                cost: 5000, days: 14,
                impact: '높음', priority: 1,
            });
        }

        // 3. Discount offer (quick)
        const hasDiscount = (c.boosts || []).some(b => b.id === 'discount' && b.daysLeft > 0);
        if (!hasDiscount) {
            recs.push({
                icon: '🏷️', name: '특별 할인 오퍼',
                desc: '성공률 +20%, 점유율 회복 2배',
                cost: 2000, days: 7,
                impact: '중간', priority: 2,
            });
        }

        // 4. Gift/entertainment
        const hasGift = (c.boosts || []).some(b => b.id === 'gift' && b.daysLeft > 0);
        if (!hasGift) {
            recs.push({
                icon: '🎁', name: '선물/접대 강화',
                desc: '충성도 +15, 성공률 +10%',
                cost: 3000, days: 10,
                impact: '중간', priority: 3,
            });
        }

        // 5. Office establishment (if not present)
        if (!hasOffice) {
            const officeCost = 30000;
            recs.push({
                icon: '🏢', name: `${this.getPortName(port)} 지사 설립`,
                desc: '해당 항구 영업 효율 +30% (영구 효과)',
                cost: officeCost, days: 0,
                impact: '매우 높음 (장기)', priority: erosion.severity === 'critical' ? 1 : 3,
            });
        }

        // 6. Training upgrade
        if (trainingLv < 3) {
            const tCosts = [15000, 30000, 50000];
            recs.push({
                icon: '📚', name: `영업 교육 Lv.${trainingLv + 1}`,
                desc: '전체 영업사원 성과 향상 + 고난이도 화주 접근',
                cost: tCosts[trainingLv], days: 0,
                impact: '높음 (장기)', priority: 4,
            });
        }

        // 7. Port-focus strategy recommendation
        const assignedSales = s.salesTeam.filter(st => st.plan?.strategy === 'port-focus' && st.plan?.focusPort === port);
        if (assignedSales.length === 0) {
            recs.push({
                icon: '📍', name: `${this.getPortName(port)} 집중 영업 전략 배치`,
                desc: '영업사원 1명을 해당 항구 전담 배치',
                cost: 0, days: 0,
                impact: '중간', priority: 1,
            });
        }

        // 8. IT system upgrade
        if (itLv < 3) {
            const itCosts = [10000, 25000, 50000];
            recs.push({
                icon: '💻', name: `IT 시스템 Lv.${itLv + 1}`,
                desc: '전체 영업 효율 향상',
                cost: itCosts[itLv], days: 0,
                impact: '중간 (장기)', priority: 5,
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
            name: template.name, icon: template.icon, desc: template.desc,
            fromPort, toPort, leg, teu, r20, r40, revenue,
            rateMult: template.rateMult, daysLeft: template.timeLimit,
        };
        s.spotOffers.push(offer);

        // Show as event modal
        this.stopTick();
        const fromName = r.portNames[fromPort] || fromPort;
        const toName = r.portNames[toPort] || toPort;
        document.getElementById('evt-title').textContent = `${template.icon} 스팟 화물 발생!`;
        document.getElementById('evt-desc').innerHTML =
            `<strong>${template.name}</strong><br>${template.desc}<br><br>` +
            `📍 ${fromName} → ${toName}<br>` +
            `📦 ${teu} TEU | 💰 예상 수익 $${revenue.toLocaleString()}<br>` +
            `⏳ 마감까지 <strong>${template.timeLimit}일</strong>`;
        document.getElementById('evt-actions').innerHTML =
            `<button class="btn-primary" onclick="Game.acceptSpot('${offer.id}')">✅ 수주! ($${revenue.toLocaleString()})</button>` +
            `<button class="btn-sm" onclick="Game.declineSpot('${offer.id}')" style="margin-top:6px;background:var(--card2);width:100%">❌ 패스</button>`;
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
            this.toast('❌ 선복 부족! 적재 공간이 없습니다.', 'fail');
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
        this.addFeed(`🎯 스팟 수주! ${offer.icon}${offer.name} ${offer.teu}TEU $${offer.revenue.toLocaleString()}`, 'booking');
        this.toast(`스팟 수주! ${offer.teu}TEU $${offer.revenue.toLocaleString()}`, 'ok');
        this.updateBayGrid();
        this.updateDepartInfo();
        this.closeModal('modal-event');
        this.startTick();
    },

    declineSpot(offerId) {
        const s = this.state;
        const idx = (s.spotOffers || []).findIndex(o => o.id === offerId);
        if (idx >= 0) s.spotOffers.splice(idx, 1);
        this.addFeed('📋 스팟 물량 패스.', 'activity');
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

        // Pick a random valid leg for revenue calculation
        const ports = r.ports.filter(p => r.salesPorts[p] && r.salesPorts[p].sellTo.length > 0);
        const fromPort = ports[Math.floor(Math.random() * ports.length)];
        const toPort = r.salesPorts[fromPort].sellTo[0];
        const leg = `${fromPort}-${toPort}`;
        const rate = BASE_RATES[leg];
        if (!rate) return;

        const rateAdj = 1 + template.basePremium;
        const revPerVoy = Math.round(teuPerVoy * 0.5 * rate['20'] * rateAdj + teuPerVoy * 0.25 * rate['40'] * rateAdj);
        const totalVoyages = Math.round(template.duration * 30 / r.rotationDays);

        this.stopTick();
        const fromName = r.portNames[fromPort] || fromPort;
        const diffStars = '⭐'.repeat(template.difficulty);
        document.getElementById('evt-title').textContent = `📋 BSA 입찰 안건!`;
        document.getElementById('evt-desc').innerHTML =
            `<strong>${template.icon} ${template.name}</strong><br>${template.desc}<br><br>` +
            `난이도: ${diffStars}<br>` +
            `📦 항차당 ${teuPerVoy} TEU × ${totalVoyages}항차 (${template.duration}개월)<br>` +
            `💰 항차당 예상 수익 $${revPerVoy.toLocaleString()}<br>` +
            `📊 총 계약 규모 약 $${(revPerVoy * totalVoyages).toLocaleString()}`;

        // Bidding: player chooses discount level → affects win probability
        const bidId = 'bsa_' + Date.now();
        document.getElementById('evt-actions').innerHTML =
            `<button class="btn-primary" onclick="Game.bidBsa('${bidId}',${teuPerVoy},${revPerVoy},${totalVoyages},'${fromPort}','${toPort}',${template.difficulty},0)" style="margin-bottom:4px">` +
                `💪 정가 입찰 (승률 ${Math.max(10, 60 - template.difficulty * 12)}%)</button>` +
            `<button class="btn-primary" onclick="Game.bidBsa('${bidId}',${teuPerVoy},${Math.round(revPerVoy * 0.9)},${totalVoyages},'${fromPort}','${toPort}',${template.difficulty},1)" style="margin-bottom:4px;background:var(--accent2)">` +
                `📉 10% 할인 입찰 (승률 ${Math.max(10, 80 - template.difficulty * 10)}%)</button>` +
            `<button class="btn-sm" onclick="Game.closeModal('modal-event');Game.startTick()" style="width:100%;background:var(--card2)">❌ 입찰 포기</button>`;
        document.getElementById('modal-event').classList.add('active');
    },

    bidBsa(bidId, teuPerVoy, revPerVoy, totalVoyages, fromPort, toPort, difficulty, discountLevel) {
        const s = this.state;
        if (!s.bsaContracts) s.bsaContracts = [];
        const allCusts = Object.values(s.custs).flat();
        const rep = allCusts.length > 0 ? allCusts.reduce((sum, c) => sum + c.share, 0) / allCusts.length : 0;

        // Win probability based on reputation, discount, difficulty
        let winRate = 0.50 + rep * 0.003 - difficulty * 0.12;
        if (discountLevel === 1) winRate += 0.20; // discount bid improves odds
        winRate += s.infra.training * 0.03 + (s.infra.systems || s.infra.it || 0) * 0.02;
        winRate = Math.max(0.10, Math.min(0.90, winRate));

        const won = Math.random() < winRate;
        this.closeModal('modal-event');

        if (won) {
            const contract = {
                id: bidId, teuPerVoy, revPerVoy, fromPort, toPort,
                leg: `${fromPort}-${toPort}`,
                voyagesLeft: totalVoyages, totalVoyages,
            };
            s.bsaContracts.push(contract);
            this.addFeed(`🏆 BSA 낙찰! 항차당 ${teuPerVoy}TEU × ${totalVoyages}항차 계약 체결!`, 'booking');
            this.toast(`BSA 계약 체결! $${(revPerVoy * totalVoyages).toLocaleString()}`, 'ok');
        } else {
            this.addFeed(`😞 BSA 입찰 실패... 경쟁사에 낙찰되었습니다.`, 'alert');
            this.toast('BSA 입찰 실패', 'fail');
        }
        this.startTick();
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
            this.addFeed(`📋 BSA 계약 물량 ${c.teuPerVoy}TEU 자동 적재 (잔여 ${Math.round(c.voyagesLeft)}항차)`, 'booking');
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
                this.addFeed(`📢 ${r.portNames[p]}에 빈 컨테이너 ${total}대 적체! ${r.portNames[p]}발 영업이 필요합니다.`, 'alert');
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
        this.addFeed(`🛡️ 월간 보험료 $${premium.toLocaleString()} 납부 (상태:${band} | 사고${accidentCount}건)`, 'info');
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
        document.getElementById('evt-title').textContent = `${accident.icon} ${accident.name}`;
        document.getElementById('evt-desc').innerHTML = `
            <p>${accident.desc}</p>
            <div style="margin-top:10px;font-size:12px;background:var(--card2);padding:10px;border-radius:8px">
                <div style="display:grid;grid-template-columns:1fr 1fr;gap:6px">
                    <span>🔧 수리비</span><span style="color:var(--red);text-align:right">$${repair.toLocaleString()}</span>
                    <span>📋 화주 클레임</span><span style="text-align:right">$${claim.toLocaleString()}</span>
                    <span>🛡️ 보험 보상</span><span style="color:var(--green);text-align:right">-$${insuredClaim.toLocaleString()}</span>
                    <span style="font-weight:700">💸 실제 부담</span><span style="color:var(--red);text-align:right;font-weight:700">$${totalCost.toLocaleString()}</span>
                </div>
                <div style="margin-top:8px;font-size:11px;color:var(--t3)">선박 상태: ${(s.ship.condition + condLoss)}% → ${s.ship.condition}% (-${condLoss}%)</div>
            </div>`;
        document.getElementById('evt-actions').innerHTML = `<button class="btn-primary" onclick="Game.closeModal('modal-event')" style="width:100%;margin-top:8px">확인 (비용 차감됨)</button>`;
        this.openModal('modal-event');

        this.addFeed(`${accident.icon} ${accident.name}! 비용 $${totalCost.toLocaleString()} (보험 $${insuredClaim.toLocaleString()} 보상)`, 'alert');
    },

    checkMilestones() {
        const s = this.state;
        MILESTONES.forEach(m => {
            if (s.milestones.includes(m.id)) return;
            if (m.check(s)) {
                s.milestones.push(m.id);
                s.cash += m.reward;
                document.getElementById('ms-title').textContent = `${m.icon} ${m.name}`;
                document.getElementById('ms-desc').textContent = m.desc;
                document.getElementById('ms-reward').innerHTML = `<p style="color:var(--green);font-size:18px;font-weight:700">+$${m.reward.toLocaleString()}</p>`;
                this.openModal('modal-milestone');
                this.addFeed(`🏆 마일스톤 달성: ${m.name}! +$${m.reward.toLocaleString()}`, 'alert');
            }
        });
    },

    // ==================== DEPARTURE ====================
    manualDepart() {
        if (this.state.voyage.status !== 'port') return;
        if (this.state.bookings.length === 0) {
            this.toast('적재된 화물이 없습니다!', 'err');
            return;
        }
        this.startVoyage();
    },

    autoDepart() {
        if (this.state.bookings.length === 0) {
            this.addFeed('⚠️ 출항일이지만 적재 화물이 없어 출항 연기!', 'alert');
            this.state.voyage.daysSinceLast = Math.max(0, this.state.voyage.daysSinceLast - 1);
            return;
        }
        this.addFeed('🚢 정기 출항 시간! 자동 출항합니다.', 'alert');
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
                this.addFeed(`🚛 엠티 도착: ${s.route.portNames[rp.to]}에 20'×${rp.q20}+40'×${rp.q40} 배치 완료`, 'booking');
            });
            s.pendingRepos = [];
        }

        // Stay on game screen — update left panel to show sailing map
        const shipStatus = document.getElementById('ship-status');
        if (shipStatus) shipStatus.textContent = '🚢 항해 중';
        document.getElementById('btn-depart').disabled = true;
        document.getElementById('btn-depart').textContent = '🚢 항해 중...';
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
            // Leg complete — weather affects fuel cost
            const w = this.getWeather(leg.to);
            let fuelMult = 1.0;
            if (w.typhoon) fuelMult = 1.8;
            else if (w.wave >= 4) fuelMult = 1.4;
            else if (w.wave >= 3) fuelMult = 1.15;
            const fuel = Math.round(leg.seaDays * r.fuelCostPerDay * fuelMult);
            const port = r.portFeesPerCall;
            v.voyExp += fuel + port;
            s.cash -= fuel + port;
            s.stats.totExp += fuel + port;
            if (fuelMult > 1) {
                const extra = Math.round(leg.seaDays * r.fuelCostPerDay * (fuelMult - 1));
                this.addFeed(`${w.typhoon ? '🌀 태풍' : '🌊 높은 파도'} — 연료비 +$${extra.toLocaleString()} 추가`, 'alert');
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
                this.addFeed(`⬇️ ${r.portNames[dest]} 하역: ${un20 + un40 * 2}TEU | $${unRev.toLocaleString()}`, 'booking');
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
        </defs>`;
        svg += `<rect x="50" y="${vbY}" width="650" height="${vbH}" fill="url(#seaG)"/>`;
        for (const [, path] of Object.entries(MAP_LAND)) {
            svg += `<path d="${path}" fill="url(#lG)" stroke="#3a6a50" stroke-width="1" opacity=".8"/>`;
        }
        svg += `<text x="200" y="200" fill="rgba(150,180,160,.3)" font-size="18" font-weight="700" letter-spacing="6">中 国</text>`;
        svg += `<text x="475" y="175" fill="rgba(150,180,160,.3)" font-size="11" font-weight="700" letter-spacing="3">韓国</text>`;
        svg += `<text x="610" y="145" fill="rgba(150,180,160,.3)" font-size="11" font-weight="700" letter-spacing="3">日本</text>`;
        if (hasSlotCharters || hasOwnedRoutes) {
            svg += `<text x="280" y="480" fill="rgba(150,180,160,.3)" font-size="11" font-weight="700" letter-spacing="3">베트남</text>`;
            svg += `<text x="175" y="530" fill="rgba(150,180,160,.3)" font-size="11" font-weight="700" letter-spacing="3">태국</text>`;
            svg += `<text x="280" y="640" fill="rgba(150,180,160,.3)" font-size="11" font-weight="700" letter-spacing="3">인도네시아</text>`;
            if (hasIndiaRoute) {
                svg += `<text x="50" y="430" fill="rgba(150,180,160,.3)" font-size="11" font-weight="700" letter-spacing="3">인도</text>`;
            }
            if (activeOwnedRoutes.some(o => o.id === 'NR_KMS')) {
                svg += `<text x="190" y="615" fill="rgba(150,180,160,.3)" font-size="11" font-weight="700" letter-spacing="3">말레이시아</text>`;
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
                svg += `<text x="${lx}" y="${ly}" fill="${clr}" font-size="8" font-weight="700" opacity=".8">${scDef.nameKo.split('(')[0].trim()}</text>`;
            }
            // Port markers for slot charter ports
            scDef.ports.forEach(p => {
                if (uniquePorts.includes(p)) return; // already drawn by main route
                const c = MAP_PORTS[p]; if (!c) return;
                svg += `<circle cx="${c.x}" cy="${c.y}" r="4" fill="${clr}" stroke="#fff" stroke-width="1" filter="url(#gl)"/>`;
                const labelBelow = ['HCM','LCB','JKT','SBY','BKK'].includes(p);
                svg += `<text x="${c.x}" y="${c.y + (labelBelow ? 14 : -9)}" text-anchor="middle" fill="rgba(200,220,255,.7)" font-size="9">${scDef.portNames[p]}</text>`;
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
                svg += `<text x="${ox}" y="${oy + 14}" text-anchor="middle" fill="${clr}" font-size="7" font-weight="700">${pkg.nameKo.split('(')[1]?.replace(')','') || pkg.id}</text>`;
            }
            // Route label
            const orMidLeg = pkg.legs[Math.floor(orTotalLegs / 2)];
            const oml1 = MAP_PORTS[orMidLeg.from], oml2 = MAP_PORTS[orMidLeg.to];
            if (oml1 && oml2) {
                const olx = (oml1.x + oml2.x) / 2 + 15, oly = (oml1.y + oml2.y) / 2;
                svg += `<text x="${olx}" y="${oly}" fill="${clr}" font-size="8" font-weight="700" opacity=".8">${pkg.nameKo.split('(')[0].trim()}</text>`;
            }
            // Port markers
            pkg.ports.forEach(p => {
                if (uniquePorts.includes(p)) return;
                const c = MAP_PORTS[p]; if (!c) return;
                svg += `<circle cx="${c.x}" cy="${c.y}" r="4" fill="${clr}" stroke="#fff" stroke-width="1" filter="url(#gl)"/>`;
                const labelBelow = ['HCM','LCB','JKT','SBY','BKK','PKL','MAA','BOM','PEN'].includes(p);
                svg += `<text x="${c.x}" y="${c.y + (labelBelow ? 14 : -9)}" text-anchor="middle" fill="rgba(200,220,255,.7)" font-size="9">${pkg.portNames[p]}</text>`;
                uniquePorts.push(p); // prevent duplicate port labels
            });
        });

        // Ship position (main route)
        const pf = MAP_PORTS[from], pt = MAP_PORTS[to];
        if (pf && pt) {
            const mx = pf.x + (pt.x - pf.x) * v.sailProgress;
            const my = pf.y + (pt.y - pf.y) * v.sailProgress;
            svg += `<text x="${mx}" y="${my}" text-anchor="middle" dominant-baseline="central" font-size="22">🚢</text>`;
        }

        // Main route port markers
        uniquePorts.forEach(p => {
            const c = MAP_PORTS[p]; if (!c) return;
            const isActive = p === from || p === to;
            const color = p === to ? '#FF6B35' : (p === from ? '#4CAF50' : '#0054A6');
            svg += `<circle cx="${c.x}" cy="${c.y}" r="${isActive ? 5 : 3}" fill="${color}" stroke="#fff" stroke-width="1" filter="url(#gl)"/>`;
            svg += `<text x="${c.x}" y="${c.y + (p === 'NBO' || p === 'SHA' ? 14 : -9)}" text-anchor="middle" fill="${isActive ? '#fff' : 'rgba(200,220,255,.6)'}" font-size="${isActive ? 11 : 9}" ${isActive ? 'font-weight="700"' : ''}>${r.portNames[p]}</text>`;
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
            legendItems.push({ name: (scDef ? scDef.nameKo.split('(')[1]?.replace(')','') || scDef.id : sc.id) + ' (슬롯)', color: clr });
        });
        activeOwned.forEach((or, oi) => {
            const pkg = NEW_ROUTE_PACKAGES.find(d => d.id === or.id);
            const clr = pkg?.color || ownedColors[oi % ownedColors.length];
            legendItems.push({ name: (pkg ? pkg.nameKo.split('(')[1]?.replace(')','') || pkg.id : or.id) + ' (자사)', color: clr });
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
        const fromN = r.portNames[from], toN = r.portNames[to];
        const lastUnload = v.unloads[v.unloads.length - 1];
        const unloadInfo = lastUnload && lastUnload.unRev > 0 ? ` | ⬇️ ${r.portNames[lastUnload.port]} ${lastUnload.un20 + lastUnload.un40 * 2}TEU $${lastUnload.unRev.toLocaleString()}` : '';

        const gd = this.getGameDate();
        const destW = this.getWeather(to);
        const waveDesc = destW.wave >= 4 ? '⚠ 거친 바다' : (destW.wave >= 3 ? '파도 높음' : '양호');
        const typhoonW = typhoon ? ` | 🌀 태풍 ${typhoon.name} 접근 중!` : '';

        scene.innerHTML = `
            ${svg}
            <div style="position:absolute;bottom:0;left:0;right:0;z-index:11;background:rgba(0,10,20,.85);padding:6px 12px">
                <div style="display:flex;justify-content:space-between;align-items:center;font-size:11px;margin-bottom:4px">
                    <span>🚢 <strong>${s.vessel}</strong> V.${String(v.num).padStart(3,'0')}</span>
                    <span>${fromN} → ${toN} (${leg.seaDays}일) | ${destW.icon} ${destW.desc} ${destW.temp}° | 파도 ${waveDesc}${typhoonW}${unloadInfo}</span>
                </div>
                <div style="height:5px;background:var(--card);border-radius:3px;overflow:hidden">
                    <div style="height:100%;width:${totalProgress}%;background:linear-gradient(90deg,var(--green),var(--accent));border-radius:3px;transition:width .3s"></div>
                </div>
            </div>`;

        // Update depart area to show voyage progress
        const departArea = document.querySelector('.depart-area');
        if (departArea) {
            document.getElementById('depart-bookings').textContent = `🚢 항해 중 — ${fromN} → ${toN}`;
            document.getElementById('depart-countdown').textContent = `진행 ${Math.round(totalProgress)}%`;
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
                <div class="port-ground" id="port-ground"><div class="port-label" id="port-label">${s.route.portNames[s.route.ports[0]]}항</div></div>
                <div class="crane" id="crane"><div class="crane-arm"></div><div class="crane-cable"></div><div class="crane-hook"></div></div>
                <div class="game-ship" id="game-ship">
                    <div class="hull"></div>
                    <div class="vessel-name" id="vessel-name">${s.vessel}</div>
                    <div class="bridge"></div>
                    <div class="funnel"><div class="fstripe"></div></div>
                    <div class="bay-grid" id="bay-grid"></div>
                </div>
                <div class="sea-layer"></div>
                <div class="cargo-info" id="cargo-info"><span id="cargo-teu">0/100 TEU</span><span id="cargo-pct">(0%)</span></div>
                <div class="ship-status" id="ship-status">⚓ 정박 중</div>`;
        }
        document.getElementById('btn-depart').style.display = '';
        document.getElementById('btn-depart').disabled = false;
        document.getElementById('btn-depart').textContent = '🚢 출항';
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
        svg += `<text x="200" y="200" fill="rgba(150,180,160,.3)" font-size="18" font-weight="700" letter-spacing="6">중 국</text>`;
        svg += `<text x="475" y="175" fill="rgba(150,180,160,.3)" font-size="11" font-weight="700" letter-spacing="3">한국</text>`;
        svg += `<text x="610" y="145" fill="rgba(150,180,160,.3)" font-size="11" font-weight="700" letter-spacing="3">일본</text>`;
        svg += `<text x="280" y="480" fill="rgba(150,180,160,.3)" font-size="11" font-weight="700" letter-spacing="3">베트남</text>`;
        svg += `<text x="175" y="530" fill="rgba(150,180,160,.3)" font-size="11" font-weight="700" letter-spacing="3">태국</text>`;
        svg += `<text x="280" y="640" fill="rgba(150,180,160,.3)" font-size="11" font-weight="700" letter-spacing="3">인도네시아</text>`;
        if (hasIndiaRoute) svg += `<text x="50" y="430" fill="rgba(150,180,160,.3)" font-size="11" font-weight="700" letter-spacing="3">인도</text>`;
        if (activeOwned.some(o => o.id === 'NR_KMS')) svg += `<text x="190" y="615" fill="rgba(150,180,160,.3)" font-size="11" font-weight="700" letter-spacing="3">말레이시아</text>`;

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
            svg += `<text x="${homePort.x}" y="${homePort.y + 14}" text-anchor="middle" fill="rgba(76,175,80,.8)" font-size="7" font-weight="700">⚓ 정박</text>`;
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
                svg += `<text x="${c.x}" y="${c.y + (lb ? 14 : -9)}" text-anchor="middle" fill="rgba(200,220,255,.7)" font-size="9">${scDef.portNames[p]}</text>`;
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
                svg += `<text x="${ox}" y="${oy + 14}" text-anchor="middle" fill="${clr}" font-size="7" font-weight="700">${pkg.nameKo.split('(')[1]?.replace(')','') || pkg.id}</text>`;
            }
            pkg.ports.forEach(p => {
                if (uniquePorts.includes(p)) return;
                const c = MAP_PORTS[p]; if (!c) return;
                svg += `<circle cx="${c.x}" cy="${c.y}" r="4" fill="${clr}" stroke="#fff" stroke-width="1" filter="url(#gl)"/>`;
                const lb = ['HCM','LCB','JKT','SBY','BKK','PKL','MAA','BOM','PEN'].includes(p);
                svg += `<text x="${c.x}" y="${c.y + (lb ? 14 : -9)}" text-anchor="middle" fill="rgba(200,220,255,.7)" font-size="9">${pkg.portNames[p]}</text>`;
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
            svg += `<text x="${c.x}" y="${c.y + (labelBelow ? 14 : -9)}" text-anchor="middle" fill="${isMain ? '#fff' : 'rgba(200,220,255,.6)'}" font-size="${isMain ? 11 : 9}" ${isMain ? 'font-weight="700"' : ''}>${r.portNames[p] || p}</text>`;
        });

        // Legend
        const legendItems = [];
        legendItems.push({ name: `${r.nameKo.split('(')[1]?.replace(')','') || r.id} (모선)`, color: '#4CAF50' });
        activeSlots.forEach((sc, si) => {
            const scDef = SLOT_CHARTERS.find(d => d.id === sc.id);
            const clr = sc.color || scDef?.color || slotColors[si % slotColors.length];
            legendItems.push({ name: (scDef ? scDef.nameKo.split('(')[1]?.replace(')','') || scDef.id : sc.id) + ' (슬롯)', color: clr });
        });
        activeOwned.forEach((or, oi) => {
            const pkg = NEW_ROUTE_PACKAGES.find(d => d.id === or.id);
            const clr = pkg?.color || ownedColors[oi % ownedColors.length];
            legendItems.push({ name: (pkg ? pkg.nameKo.split('(')[1]?.replace(')','') || pkg.id : or.id) + ' (자사)', color: clr });
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
        const daysLeft = Math.max(0, r.rotationDays - s.voyage.daysSinceLast);
        const routeCount = 1 + activeSlots.length + activeOwned.length;
        scene.innerHTML = `
            ${svg}
            <div style="position:absolute;bottom:0;left:0;right:0;z-index:11;background:rgba(0,10,20,.85);padding:6px 12px">
                <div style="display:flex;justify-content:space-between;align-items:center;font-size:11px">
                    <span>⚓ <strong>${s.vessel}</strong> ${r.portNames[r.ports[0]]}항 정박 중 | 📦 ${teu}TEU | 자동출항 ${daysLeft}일 후</span>
                    <span>🌏 운영 항로 ${routeCount}개 | 🚢 선박 ${routeCount}척 운항 중</span>
                </div>
            </div>`;
    },

    showSailScreen() {
        const s = this.state, r = s.route, v = s.voyage;
        const leg = r.legs[Math.min(v.legIdx, r.legs.length - 1)];
        const from = leg.from, to = leg.to;
        const fromN = r.portNames[from], toN = r.portNames[to];

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
        svg += `<text x="200" y="200" fill="rgba(150,180,160,.4)" font-size="22" font-weight="700" letter-spacing="8">中 国</text>`;
        svg += `<text x="475" y="175" fill="rgba(150,180,160,.4)" font-size="14" font-weight="700" letter-spacing="4">韓国</text>`;
        svg += `<text x="610" y="145" fill="rgba(150,180,160,.4)" font-size="14" font-weight="700" letter-spacing="4">日本</text>`;

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
            svg += `<text x="${c.x}" y="${c.y + (p === 'NBO' || p === 'SHA' ? 16 : -10)}" text-anchor="middle" fill="${isActive ? '#fff' : 'rgba(200,220,255,.7)'}" font-size="${isActive ? 12 : 10}" ${isActive ? 'font-weight="700"' : ''}>${r.portNames[p]}</text>`;
        });
        svg += '</svg>';

        document.getElementById('sail-map').innerHTML = svg;

        // Info
        let info = `<strong>🚢 ${s.vessel} — V.${String(v.num).padStart(3,'0')}</strong><br>`;
        info += `${fromN} → ${toN} (${leg.seaDays}일 항해)`;
        const lastUnload = v.unloads[v.unloads.length - 1];
        if (lastUnload && lastUnload.unRev > 0) {
            info += `<br>⬇️ ${r.portNames[lastUnload.port]} 하역: ${lastUnload.un20 + lastUnload.un40 * 2}TEU | $${lastUnload.unRev.toLocaleString()}`;
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
        const interest = Math.round(s.debt * 0.005);
        const repay = Math.min(s.debt, Math.round(r.investmentCost * 0.012));
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
                    .map(c => `${c.icon}${c.name}`);
                const sellTo = (r.salesPorts[p]?.sellTo || []).map(d => r.portNames[d]).join('/');
                repoDetails.push({ port: p, portName: r.portNames[p], ex20, ex40, cost, targets, sellTo });
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
        s.stats.lastLoadFactor = Math.round((totTEU / s.ship.capacity) * 100);
        // Calculate sales activity costs during this voyage period
        const voyStartDay = s.gameDay - r.rotationDays;
        const voyLogs = s.activityLog.filter(l => l.day >= voyStartDay);
        const salesActCost = voyLogs.reduce((sum, l) => sum + (l.cost || 0), 0);
        const boosterCost = v.boosterCost || 0;
        const repoCostUser = v.repoCostUser || 0; // user-initiated repositioning

        s.stats.history.push({
            voy: v.num, rev: v.voyRev, exp: v.voyExp, profit, teu: totTEU, lf: s.stats.lastLoadFactor,
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
        this.addFeed(`📊 V.${String(v.num).padStart(3,'0')} 항차 완료! 수익 $${v.voyRev.toLocaleString()} / 비용 $${v.voyExp.toLocaleString()} / 손익 $${profit.toLocaleString()}`, profit >= 0 ? 'booking' : 'alert');
        this.addFeed(`🏗️ V.${String(s.voyage.num).padStart(3,'0')} 영업 시작! 다음 출항까지 ${r.rotationDays}일`, 'alert');
    },

    renderReport(v, teu, profit, refuel, maint, repo, repoDetails) {
        const s = this.state, r = s.route;
        const lf = s.stats.lastLoadFactor;
        const byLeg = {};
        s.bookings.forEach(b => {
            if (!byLeg[b.leg]) byLeg[b.leg] = { rev: 0, teu: 0 };
            byLeg[b.leg].rev += b.revenue;
            byLeg[b.leg].teu += b.q20 + b.q40 * 2;
        });

        // Build repo warning with specific segments, target customers, and action buttons
        let repoHtml = '';
        if (repo > 0 && repoDetails && repoDetails.length > 0) {
            // Find available salespeople for assignment
            const availSales = s.salesTeam.map(st => `<option value="${st.id}">${st.avatar} ${st.name}</option>`).join('');
            repoHtml = `<div class="rpt-warn">
                <div style="margin-bottom:6px">⚠️ <strong>엠티 포지셔닝 비용 $${repo.toLocaleString()} 발생!</strong></div>
                ${repoDetails.map(rd => `
                    <div style="margin:6px 0;padding:8px;background:rgba(0,0,0,.2);border-radius:6px;font-size:12px">
                        <div><strong>${rd.portName}</strong>에서 공컨테이너 ${rd.ex20 + rd.ex40}개 회수 (비용 $${rd.cost.toLocaleString()})</div>
                        <div style="margin-top:4px;color:var(--t2)">💡 <strong>${rd.portName}→${rd.sellTo}</strong> 구간 영업 강화 필요</div>
                        ${rd.targets.length > 0 ? `<div style="margin-top:3px;color:var(--accent)">🎯 타겟 화주: ${rd.targets.join(', ')}</div>` : ''}
                        <div style="margin-top:6px;display:flex;gap:6px;align-items:center">
                            <select id="repo-assign-${rd.port}" style="flex:1;padding:4px 6px;border-radius:4px;border:1px solid var(--border);background:var(--card);color:var(--t1);font-size:11px">${availSales}</select>
                            <button class="btn-sm" onclick="Game.assignPortFocus('${rd.port}',document.getElementById('repo-assign-${rd.port}').value)" style="white-space:nowrap;padding:4px 10px">📍 배치</button>
                        </div>
                    </div>
                `).join('')}
            </div>`;
        }

        document.getElementById('report-content').innerHTML = `
            <h3>📊 V.${String(v.num).padStart(3, '0')} 항차 보고서</h3>
            <div class="rpt-grid">
                <div class="rpt-stat"><span class="v" style="color:var(--green)">$${v.voyRev.toLocaleString()}</span><span class="l">운임 수입</span></div>
                <div class="rpt-stat"><span class="v" style="color:var(--red)">$${v.voyExp.toLocaleString()}</span><span class="l">총 비용</span></div>
                <div class="rpt-stat"><span class="v" style="color:${profit >= 0 ? 'var(--green)' : 'var(--red)'}">$${profit.toLocaleString()}</span><span class="l">항차 손익</span></div>
                <div class="rpt-stat"><span class="v">${lf}%</span><span class="l">적재율 (${teu}/${s.ship.capacity}TEU)</span></div>
            </div>
            <div class="rpt-section"><h4>📦 구간별 실적</h4>
                ${Object.entries(byLeg).map(([leg, d]) => {
                    const p = leg.split('-');
                    return `<div class="rpt-ctr">${r.portNames[p[0]] || p[0]}→${r.portNames[p[1]] || p[1]}: ${d.teu}TEU / $${d.rev.toLocaleString()}</div>`;
                }).join('') || '<div class="rpt-ctr" style="color:var(--t3)">적재 화물 없음</div>'}
            </div>
            ${repoHtml}
            <div class="rpt-section"><h4>📈 누적 실적</h4>
                <div class="rpt-row"><span class="lbl">보유 현금</span><span class="${s.cash >= 0 ? 'pos' : 'neg'}">$${Math.round(s.cash).toLocaleString()}</span></div>
                <div class="rpt-row"><span class="lbl">남은 부채</span><span class="neg">$${Math.round(s.debt).toLocaleString()}</span></div>
                <div class="rpt-row"><span class="lbl">총 항차</span><span>${s.stats.totVoy}</span></div>
                <div class="rpt-row"><span class="lbl">총 운송</span><span>${s.stats.totTEU} TEU</span></div>
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
        this.addFeed(`🏗️ V.${String(s.voyage.num).padStart(3,'0')} 영업 시작! 다음 출항까지 ${s.route.rotationDays}일`, 'alert');
    },

    // ==================== EVENTS ====================
    showEvent(evt) {
        document.getElementById('evt-title').textContent = evt.title;
        document.getElementById('evt-desc').textContent = evt.desc;
        document.getElementById('evt-actions').innerHTML = evt.choices.map((c, i) =>
            `<div style="margin:6px 0">
                <button class="btn-primary" style="width:100%" onclick="Game.resolveEvt(${JSON.stringify(c.effect).replace(/"/g, '&quot;')})">${c.text}</button>
                ${c.detail ? `<p style="font-size:10px;color:var(--t2);margin-top:4px;text-align:left;padding:0 8px">${c.detail}</p>` : ''}
            </div>`
        ).join('');
        this.openModal('modal-event');
    },

    resolveEvt(eff) {
        const s = this.state, v = s.voyage;
        if (eff.cost) { s.cash -= eff.cost; v.voyExp += eff.cost; s.stats.totExp += eff.cost; }
        if (eff.save) { s.cash += eff.save; }
        if (eff.condLoss) {
            s.ship.condition = Math.max(0, s.ship.condition - eff.condLoss);
            this.toast(`선체 상태: ${s.ship.condition}%`, s.ship.condition < 50 ? 'err' : 'warn');
        }
        // Cargo damage risk
        if (eff.cargoRisk && Math.random() < eff.cargoRisk) {
            const damaged = s.bookings.filter(b => !b.delivered);
            if (damaged.length > 0) {
                const b = damaged[Math.floor(Math.random() * damaged.length)];
                const loss = Math.round(b.revenue * 0.3);
                b.revenue -= loss;
                v.voyRev -= loss;
                this.toast(`⚠️ 화물 파손! ${b.custName} -$${loss.toLocaleString()}`, 'err');
            }
        }
        // Customer loyalty loss
        if (eff.loyaltyLoss) {
            for (const port in s.custs) {
                s.custs[port].forEach(c => {
                    if (c.share > 0) c.loyalty = Math.max(0, c.loyalty - eff.loyaltyLoss);
                });
            }
            this.toast('화주 신뢰도 하락!', 'warn');
        }
        // Loyalty boost to all customers (e.g., rescue events)
        if (eff.loyaltyAll) {
            for (const port in s.custs) {
                s.custs[port].forEach(c => {
                    c.loyalty = Math.min(100, c.loyalty + eff.loyaltyAll);
                });
            }
            this.toast('전체 화주 신뢰도 상승!', 'ok');
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

        // Global strategy button
        const gs = s.globalStrategy || { strategy: 'lowest-share', actPreset: 'balanced' };
        const gsStrat = SALES_STRATEGIES.find(x => x.id === gs.strategy);
        const gsPreset = ACTIVITY_PRESETS.find(x => x.id === gs.actPreset);
        let html = `<div style="margin-bottom:10px;padding:10px;background:var(--card2);border-radius:8px;border:1px solid var(--border);cursor:pointer" onclick="Game.openPlanConfig('global')">
            <div style="font-size:12px;font-weight:600;margin-bottom:4px">📋 전체 영업 전략</div>
            <div style="font-size:11px;color:var(--t2)">${gsStrat ? gsStrat.icon + ' ' + gsStrat.name : '미설정'} | ${gsPreset ? gsPreset.icon + ' ' + gsPreset.name : '균형'}</div>
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
                        <span>💰 $${st.salary}/월</span>
                        <span>⚡ ${Math.round(st.stamina)}%</span>
                        <span>📊 EXP ${st.exp}</span>
                    </div>
                    <div class="trait-mini">
                        <span data-tip="협상력: 전화 영업 성공률 UP">🤝${t.negotiation||0}</span>
                        <span data-tip="대면력: 고객 방문 성공률 UP">🚶${t.faceToFace||0}</span>
                        <span data-tip="IT역량: 메일 발송 성공률 UP">💻${t.digital||0}</span>
                        <span data-tip="관계력: 접대 성공률 UP">💛${t.relationship||0}</span>
                    </div>
                    <div class="sales-bar"><div class="sales-bar-fill" style="width:${st.stamina}%;background:${st.stamina > 30 ? 'var(--green)' : 'var(--red)'}"></div></div>
                    ${actInfo ? `<div class="sales-bar" style="margin-top:2px"><div class="sales-bar-fill" style="width:${progressPct}%;background:var(--blue)"></div></div>` : ''}
                    <div class="plan-badge">${pStrat ? pStrat.icon : '📉'} ${pStrat ? pStrat.name : '?'} <span>|</span> ${pPreset ? pPreset.icon : '⚖️'} ${pPreset ? pPreset.name : '?'}</div>
                </div>
                <div style="display:flex;flex-direction:column;align-items:flex-end;gap:4px">
                    ${actInfo ? `<div class="sales-activity"><div class="dot"></div>${actInfo.icon} ${targetCust ? targetCust.name : ''}<br><span style="font-size:9px;color:var(--t3)">${progressPct}%</span></div>` :
                      isResting ? '<div class="sales-activity" style="color:var(--yellow)">😴 휴식 중</div>' :
                      '<div class="sales-activity" style="color:var(--accent)">⏳ 대기</div>'}
                    <button class="btn-sm" onclick="event.stopPropagation();Game.openPlanConfig('${st.id}')">계획 수정</button>
                </div>
            </div>`;
        }).join('');

        document.getElementById('sales-team-list').innerHTML = html;
    },

    recruitSales(id) {
        const s = this.state;
        // Check bench pool (includes draft unpicked + fired + scout pool)
        let r = (s.benchPool || []).find(p => p.id === id);
        if (!r || !this.canAfford(r.recruitCost)) { this.toast('부채 한도 초과!', 'err'); return; }
        if (s.stats.totRev < (r.unlockRev || 0)) { this.toast('매출 조건 미달!', 'err'); return; }
        s.cash -= r.recruitCost;
        s.stats.totExp += r.recruitCost;
        s.salesTeam.push({
            ...r, exp: r.exp || 0, stamina: 100, activity: null, actTarget: null, actTargetPort: null, actProgress: 0, actDaysLeft: 0,
            plan: { ...s.globalStrategy },
        });
        s.benchPool = s.benchPool.filter(p => p.id !== id);
        this.toast(`${r.name} 영입 완료!`, 'ok');
        this.addFeed(`🎉 ${r.name} 영업사원 합류! (⭐${r.skill})`, 'alert');
        this.renderSalesTeam();
        this.renderInvestments();
        this.updateHUD();
    },

    fireSales(stId) {
        const s = this.state;
        if (s.salesTeam.length <= 1) {
            this.toast('최소 1명의 영업사원이 필요합니다!', 'err');
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
        this.toast(`${st.name} 퇴사 처리 (퇴직금 $${severance.toLocaleString()})`, 'ok');
        this.addFeed(`👋 ${st.name} 퇴사. 퇴직금 $${severance.toLocaleString()} 지급`, 'alert');
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

        // Find original data for strength/weakness
        const orig = [...(typeof ALL_SALES_CHARACTERS !== 'undefined' ? ALL_SALES_CHARACTERS : []), ...RECRUIT_POOL].find(x => x.id === stId);
        const strength = st.strength || orig?.strength || '균형잡힌 능력';
        const weakness = st.weakness || orig?.weakness || '특별한 약점 없음';

        // Activity stats
        const logs = s.activityLog.filter(l => l.spName === st.name);
        const total = logs.length;
        const successes = logs.filter(l => l.success).length;
        const totalRev = logs.reduce((sum, l) => sum + (l.revenue || 0), 0);

        let html = `<div class="sp-detail">
            <div class="sp-detail-header">
                <div class="sp-detail-avatar">${st.avatar}</div>
                <div>
                    <div style="font-size:16px;font-weight:700">${st.name} <span style="font-size:12px">${stars}</span></div>
                    <div style="font-size:11px;color:var(--t2)">${st.desc || orig?.desc || ''}</div>
                    <div style="font-size:11px;color:var(--t3);margin-top:2px">💰 $${st.salary}/월 | ⚡ 체력 ${Math.round(st.stamina)}% | 📊 EXP ${st.exp}</div>
                </div>
            </div>
            <div style="font-size:11px;color:var(--t2);margin-bottom:4px">📊 능력치</div>
            <div class="sp-detail-traits">
                ${Object.entries(TRAIT_INFO).map(([key, info]) => {
                    const val = t[key] || 0;
                    return `<div class="trait-bar">
                        <div class="trait-label">${info.icon} ${info.name} (${val}/5)</div>
                        <div style="height:6px;background:var(--bg);border-radius:3px;overflow:hidden">
                            <div class="trait-fill" style="width:${val * 20}%"></div>
                        </div>
                        <div style="font-size:9px;color:var(--t3);margin-top:1px">${info.desc}</div>
                    </div>`;
                }).join('')}
            </div>
            <div class="sp-sw str">💪 <strong>강점:</strong> ${strength}</div>
            <div class="sp-sw wk">⚠️ <strong>약점:</strong> ${weakness}</div>
            <div style="font-size:11px;color:var(--t2);margin-top:10px">📈 실적 (이번 항차)</div>
            <div style="display:flex;gap:12px;font-size:12px;margin-top:4px">
                <span>활동 ${total}건</span>
                <span style="color:var(--green)">성공 ${successes}건 (${total > 0 ? Math.round(successes/total*100) : 0}%)</span>
                <span>수주 $${totalRev.toLocaleString()}</span>
            </div>
            <div class="sp-rename">
                <input id="sp-rename-input" value="${st.name}" maxlength="10" placeholder="이름 변경">
                <button class="btn-sm" onclick="Game.renameSales('${st.id}')">변경</button>
            </div>
            <div id="fire-area" style="margin-top:10px">
                <button class="btn-sm" id="btn-fire-init"
                    onclick="document.getElementById('btn-fire-init').style.display='none';document.getElementById('fire-confirm').style.display='flex'"
                    style="width:100%;background:#6b2020;color:#ff8888;border:1px solid #ff4444;padding:10px">
                    👋 해고 (퇴직금 $${Math.round(st.salary * 2).toLocaleString()})
                </button>
                <div id="fire-confirm" style="display:none;gap:8px;align-items:center">
                    <span style="font-size:12px;color:#ff8888;flex:1">정말 해고하시겠습니까?</span>
                    <button class="btn-sm" onclick="Game.fireSales('${st.id}')"
                        style="background:#b71c1c;color:white;padding:8px 16px;border:1px solid #ff4444;font-weight:700">확인</button>
                    <button class="btn-sm" onclick="document.getElementById('btn-fire-init').style.display='';document.getElementById('fire-confirm').style.display='none'"
                        style="background:var(--card2);padding:8px 16px">취소</button>
                </div>
            </div>
        </div>`;

        document.getElementById('assign-title').textContent = `${st.avatar} ${st.name} 상세 정보`;
        document.getElementById('assign-body').innerHTML = html;
        this.openModal('modal-assign');
    },

    renameSales(stId) {
        const st = this.state.salesTeam.find(t => t.id === stId);
        if (!st) return;
        const input = document.getElementById('sp-rename-input');
        const newName = input.value.trim();
        if (!newName) return;
        st.name = newName;
        this.toast(`이름 변경: ${newName}`, 'ok');
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
            html += `<h4 style="font-size:12px;color:var(--t2);margin:8px 0 4px">📍 ${portName} ${isSlot ? '<span style="font-size:9px;color:var(--accent2)">슬롯</span>' : ''}</h4>`;
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
                        erosionBadge = `<span style="font-size:9px;color:#ff1744;font-weight:700;margin-left:4px">🚨 심각 -${Math.round(erosion.erosionPct)}%</span>`;
                    } else if (erosion.severity === 'danger') {
                        shareColor = '#ff5252';
                        cardBorder = 'border-left:3px solid #ff5252;background:rgba(255,82,82,.06)';
                        erosionBadge = `<span style="font-size:9px;color:#ff5252;font-weight:600;margin-left:4px">⚠️ 위험 -${Math.round(erosion.erosionPct)}%</span>`;
                    } else {
                        shareColor = '#ff9100';
                        cardBorder = 'border-left:3px solid #ff9100;background:rgba(255,145,0,.05)';
                        erosionBadge = `<span style="font-size:9px;color:#ff9100;margin-left:4px">⚠ 주의 -${Math.round(erosion.erosionPct)}%</span>`;
                    }
                } else {
                    shareColor = c.share > 50 ? 'var(--green)' : (c.share > 20 ? 'var(--yellow)' : 'var(--t3)');
                }

                // Peak share indicator
                const peakInfo = erosion ? `<div style="font-size:9px;color:var(--t3)">최고 ${Math.round(erosion.peakShare)}% → 현재 ${Math.round(c.share)}%</div>` : '';

                return `
                <div class="cust-card" onclick="Game.showCustDetail('${c.id}','${port}')" style="cursor:pointer;${cardBorder}${!canAccess ? ';opacity:.5' : ''}">
                    <div class="cust-icon">${c.icon}</div>
                    <div class="cust-info">
                        <div class="cust-name">${c.name} <span style="font-size:10px;color:var(--t3)">${c.type}</span>${hasBoost ? ' <span style="font-size:10px;color:var(--accent)">🔥 부스트</span>' : ''}${erosionBadge}</div>
                        <div class="cust-detail">${diffStars} | 최대 20'×${c.maxVol20} 40'×${c.maxVol40} ${!canAccess ? '| 🔒 접근 불가' : ''}</div>
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
                <div style="font-weight:600;margin-bottom:4px">🔥 활성 부스트</div>
                ${activeBoosts.map(b => `<div>${b.icon} ${b.name} — ${b.daysLeft}일 남음</div>`).join('')}
            </div>`;
        }

        // Booster options
        const boosters = CUSTOMER_BOOSTERS.map(bst => {
            const alreadyActive = activeBoosts.some(ab => ab.id === bst.id);
            const canBuy = s.cash >= bst.cost && !alreadyActive && canAccess;
            return `<div class="invest-item ${alreadyActive ? 'done' : (!canBuy ? 'locked' : '')}" style="margin:4px 0">
                <div class="invest-icon">${bst.icon}</div>
                <div class="invest-info">
                    <div class="invest-name">${bst.name} ${alreadyActive ? '✅ 적용 중' : ''}</div>
                    <div class="invest-effect">${bst.effect} (${bst.duration}일간)</div>
                </div>
                ${alreadyActive ? '' : `<div class="invest-cost">$${bst.cost.toLocaleString()}</div>
                <button class="invest-btn" onclick="Game.applyCustBoost('${custId}','${port}','${bst.id}')" ${canBuy ? '' : 'disabled'}>적용</button>`}
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
                    ${erosion.severity === 'critical' ? '🚨' : '⚠️'} 경쟁사 잠식 분석 — ${erosion.label}
                </div>
                <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:4px;margin-bottom:8px">
                    <div style="background:var(--card2);padding:5px;border-radius:4px;text-align:center">
                        <div style="font-size:14px;font-weight:700;color:${sevColor}">-${Math.round(erosion.erosionPct)}%</div>
                        <div style="font-size:9px;color:var(--t3)">최고 대비 감소</div>
                    </div>
                    <div style="background:var(--card2);padding:5px;border-radius:4px;text-align:center">
                        <div style="font-size:14px;font-weight:700;color:${sevColor}">${Math.round(erosion.peakShare)}%→${Math.round(c.share)}%</div>
                        <div style="font-size:9px;color:var(--t3)">점유율 추이</div>
                    </div>
                    <div style="background:var(--card2);padding:5px;border-radius:4px;text-align:center">
                        <div style="font-size:14px;font-weight:700;color:#ff5252">-$${lostRevPerVoy.toLocaleString()}</div>
                        <div style="font-size:9px;color:var(--t3)">항차당 손실</div>
                    </div>
                </div>
                ${trendSvg ? `<div style="font-size:10px;color:var(--t3);margin-bottom:2px">📉 최근 점유율 추이</div>${trendSvg}` : ''}
                <div style="font-size:10px;color:var(--t3);margin-bottom:2px">최근 10일간 잠식 ${erosion.recentEvents}회 | 잠식된 물량: ~${lostTEU} TEU/항차</div>

                <div style="font-size:12px;font-weight:700;margin:10px 0 6px;color:var(--t1)">💡 회복 제안 (예상 소요: ~${plan.estimatedDays}일)</div>
                ${plan.recs.map((rec, i) => {
                    const canAfford = rec.cost === 0 || s.cash >= rec.cost;
                    const impactColor = rec.impact.includes('높음') || rec.impact.includes('매우') ? 'var(--green)' : (rec.impact.includes('중간') ? 'var(--yellow)' : 'var(--t3)');
                    return `<div style="display:flex;align-items:center;gap:6px;padding:6px;margin:3px 0;background:var(--card2);border-radius:6px;${!canAfford ? 'opacity:.5' : ''}">
                        <div style="font-size:18px;min-width:24px;text-align:center">${rec.icon}</div>
                        <div style="flex:1;min-width:0">
                            <div style="font-size:11px;font-weight:600">${rec.name}</div>
                            <div style="font-size:9px;color:var(--t3)">${rec.desc}</div>
                            <div style="display:flex;gap:8px;margin-top:2px;font-size:9px">
                                <span style="color:${impactColor}">효과: ${rec.impact}</span>
                                ${rec.days > 0 ? `<span style="color:var(--t3)">⏱ ${rec.days}일간</span>` : '<span style="color:var(--t3)">⏱ 즉시/영구</span>'}
                            </div>
                        </div>
                        <div style="text-align:right;min-width:60px">
                            ${rec.cost > 0 ? `<div style="font-size:11px;font-weight:700;color:var(--accent)">$${rec.cost.toLocaleString()}</div>` : '<div style="font-size:11px;font-weight:700;color:var(--green)">무료</div>'}
                        </div>
                    </div>`;
                }).join('')}
                <div style="font-size:9px;color:var(--t3);margin-top:6px;text-align:center">
                    총 예상 비용: $${plan.recs.reduce((s, r) => s + r.cost, 0).toLocaleString()} | 우선순위 순으로 실행을 권장합니다
                </div>
            </div>`;
        }

        const html = `
            <div style="text-align:center;margin-bottom:10px">
                <div style="font-size:36px">${c.icon}</div>
                <div style="font-size:16px;font-weight:700">${c.name}</div>
                <div style="font-size:11px;color:var(--t3)">${c.type} | ${this.getPortName(port)} | ${'⭐'.repeat(c.difficulty)} 난이도</div>
            </div>
            <div style="display:grid;grid-template-columns:1fr 1fr;gap:6px;margin-bottom:10px">
                <div style="background:var(--card2);padding:8px;border-radius:6px;text-align:center">
                    <div style="font-size:18px;font-weight:700;color:${shareColor}">${Math.round(c.share)}%</div>
                    <div style="font-size:10px;color:var(--t3)">점유율</div>
                </div>
                <div style="background:var(--card2);padding:8px;border-radius:6px;text-align:center">
                    <div style="font-size:18px;font-weight:700">${c.loyalty}</div>
                    <div style="font-size:10px;color:var(--t3)">충성도</div>
                </div>
            </div>
            <div style="font-size:11px;color:var(--t2);margin-bottom:6px">
                📦 총 최대 물량: 20'×${c.maxVol20} / 40'×${c.maxVol40}
            </div>
            <div style="font-size:11px;color:var(--t2);margin-bottom:6px">
                <div style="font-weight:600;margin-bottom:3px">🚢 도착지별 물량 배분</div>
                ${destDetailHtml}
            </div>
            ${!canAccess ? '<div style="color:var(--red);font-size:11px;margin-bottom:8px">🔒 접근 불가 — 영업 교육 투자가 필요합니다</div>' : ''}
            ${erosionHtml}
            ${boostHtml}
            <div style="margin-top:10px"><div style="font-size:12px;font-weight:600;margin-bottom:6px">🚀 영업 부스터</div>${boosters}</div>`;

        document.getElementById('assign-title').textContent = `${c.icon} ${c.name} 상세`;
        document.getElementById('assign-body').innerHTML = html;
        this.openModal('modal-assign');
    },

    applyCustBoost(custId, port, boostId) {
        const s = this.state;
        const c = s.custs[port]?.find(x => x.id === custId);
        if (!c) return;
        const bst = CUSTOMER_BOOSTERS.find(b => b.id === boostId);
        if (!bst || s.cash < bst.cost) { this.toast('현금이 부족합니다!', 'err'); return; }

        if (!c.boosts) c.boosts = [];
        // Remove expired, check not already active
        c.boosts = c.boosts.filter(b => b.daysLeft > 0);
        if (c.boosts.some(b => b.id === boostId)) { this.toast('이미 적용 중입니다', 'err'); return; }

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

        this.toast(`${c.icon} ${c.name}에 ${bst.icon} ${bst.name} 적용!`, 'ok');
        this.addFeed(`🚀 ${c.name}에 ${bst.name} 부스트 적용 ($${bst.cost.toLocaleString()})`, 'booking');
        this.updateHUD();
        this.showCustDetail(custId, port); // refresh modal
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
            <h4 style="font-size:13px;margin-bottom:8px">📦 전체 컨테이너 현황</h4>
            <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:6px;margin-bottom:8px">
                <div style="background:var(--card2);padding:8px;border-radius:6px;text-align:center">
                    <div style="font-size:18px;font-weight:700;color:var(--t1)">${totalAll}</div>
                    <div style="font-size:10px;color:var(--t3)">전체 보유</div>
                </div>
                <div style="background:var(--card2);padding:8px;border-radius:6px;text-align:center">
                    <div style="font-size:18px;font-weight:700;color:var(--green)">${totalBooked}</div>
                    <div style="font-size:10px;color:var(--t3)">선적 대기</div>
                </div>
                <div style="background:var(--card2);padding:8px;border-radius:6px;text-align:center">
                    <div style="font-size:18px;font-weight:700;color:${utilRate < 20 ? 'var(--red)' : (utilRate < 50 ? 'var(--yellow)' : 'var(--green)')}">${utilRate}%</div>
                    <div style="font-size:10px;color:var(--t3)">활용률</div>
                </div>
            </div>
            <div style="height:8px;background:var(--card2);border-radius:4px;overflow:hidden;margin-bottom:4px">
                <div style="height:100%;width:${utilRate}%;background:linear-gradient(90deg,var(--green),var(--accent));border-radius:4px;transition:width .3s"></div>
            </div>
            <div style="font-size:10px;color:var(--t3);text-align:right">선적대기 ${totalBooked}개 / 엠티 ${totalEmpty}개</div>
        </div>`;

        // Per-port breakdown
        html += '<h4 style="font-size:13px;margin-bottom:8px">📍 항구별 컨테이너 분포</h4>';
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
            const isExcess = !isHome && emptyTotal > 13;
            const sellTo = (allSalesPorts[p]?.sellTo || []).map(d => this.getPortName(d)).join(', ');
            const portName = this.getPortName(p);

            html += `<div style="background:var(--card2);border-radius:8px;padding:10px;margin-bottom:8px;border-left:3px solid ${isExcess ? 'var(--red)' : (isHome ? 'var(--green)' : (isSlot ? 'var(--accent2)' : 'var(--border)'))}">
                <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:6px">
                    <span style="font-size:13px;font-weight:600">${isHome ? '🏠' : (isSlot ? '⛴' : '📍')} ${portName} ${isSlot ? '<span style="font-size:9px;color:var(--accent2)">슬롯</span>' : ''} ${isExcess ? '<span style="color:var(--red);font-size:10px">⚠ 적체</span>' : ''}</span>
                    <span style="font-size:11px;color:var(--t3)">합계 ${portTotal}개</span>
                </div>
                <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;font-size:11px">
                    <div>
                        <div style="color:var(--t3);margin-bottom:2px">📥 엠티 (비어있음)</div>
                        <div style="display:flex;gap:12px">
                            <span>20': <strong style="color:${e20 > 10 && !isHome ? 'var(--red)' : 'var(--t1)'}">${e20}</strong></span>
                            <span>40': <strong style="color:${e40 > 8 && !isHome ? 'var(--red)' : 'var(--t1)'}">${e40}</strong></span>
                        </div>
                    </div>
                    <div>
                        <div style="color:var(--t3);margin-bottom:2px">📤 선적 대기</div>
                        <div style="display:flex;gap:12px">
                            <span>20': <strong style="color:var(--green)">${b20}</strong></span>
                            <span>40': <strong style="color:var(--green)">${b40}</strong></span>
                        </div>
                    </div>
                </div>
                ${isExcess ? `<div style="margin-top:6px;padding:4px 6px;background:rgba(239,83,80,.1);border-radius:4px;font-size:10px;color:var(--red)">⚠ 공컨테이너 과다 — ${portName}→${sellTo} 영업 강화 필요</div>` : ''}
                ${!isHome && emptyTotal === 0 && bookedHere === 0 ? '<div style="margin-top:4px;font-size:10px;color:var(--t3)">컨테이너 없음 — 공급 필요</div>' : ''}
            </div>`;
        });

        // Visual distribution bar
        html += '<h4 style="font-size:13px;margin:12px 0 8px">📊 항구별 분포 비율</h4>';
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
                html += `<span><span style="display:inline-block;width:8px;height:8px;border-radius:2px;background:${pd.color};margin-right:3px"></span>${pd.name} ${pd.total}개</span>`;
            });
            html += '</div>';
        }

        // === Container Repositioning ===
        html += '<h4 style="font-size:13px;margin:12px 0 8px">🚛 엠티 재배치 (리포지셔닝)</h4>';
        html += '<div style="background:var(--card2);border-radius:8px;padding:10px;margin-bottom:8px">';
        html += '<div style="font-size:10px;color:var(--t3);margin-bottom:8px">엠티가 많은 항구에서 부족한 항구로 공컨테이너를 이동합니다. 비용이 발생하며 다음 항차 출항 시 이동됩니다.</div>';

        // Find ports with empties (include slot charter ports)
        const portsWithEmpty = allPorts.filter(p => (s.ctr[p]?.['20'] || 0) + (s.ctr[p]?.['40'] || 0) > 0);
        const repoFromOptions = portsWithEmpty.map(p => `<option value="${p}">${this.getPortName(p)} (엠티 ${(s.ctr[p]?.['20']||0)+(s.ctr[p]?.['40']||0)})${!r.ports.includes(p) ? ' ⛴' : ''}</option>`).join('');
        const repoToOptions = allPorts.map(p => `<option value="${p}">${this.getPortName(p)}${!r.ports.includes(p) ? ' ⛴' : ''}</option>`).join('');

        html += `<div style="display:grid;grid-template-columns:1fr auto 1fr;gap:6px;align-items:end;margin-bottom:8px">
            <div>
                <div style="font-size:10px;color:var(--t3);margin-bottom:3px">출발 항구</div>
                <select id="repo-from" style="width:100%;padding:5px;background:var(--bg);color:var(--t1);border:1px solid var(--border);border-radius:4px;font-size:11px">${repoFromOptions}</select>
            </div>
            <div style="font-size:16px;color:var(--t3);padding-bottom:4px">→</div>
            <div>
                <div style="font-size:10px;color:var(--t3);margin-bottom:3px">도착 항구</div>
                <select id="repo-to" style="width:100%;padding:5px;background:var(--bg);color:var(--t1);border:1px solid var(--border);border-radius:4px;font-size:11px">${repoToOptions}</select>
            </div>
        </div>`;
        html += `<div style="display:grid;grid-template-columns:1fr 1fr;gap:6px;margin-bottom:8px">
            <div>
                <div style="font-size:10px;color:var(--t3);margin-bottom:3px">20' 수량</div>
                <input id="repo-q20" type="number" min="0" max="50" value="5" oninput="Game.updateRepoCost()" style="width:100%;padding:5px;background:var(--bg);color:var(--t1);border:1px solid var(--border);border-radius:4px;font-size:11px">
            </div>
            <div>
                <div style="font-size:10px;color:var(--t3);margin-bottom:3px">40' 수량</div>
                <input id="repo-q40" type="number" min="0" max="50" value="5" oninput="Game.updateRepoCost()" style="width:100%;padding:5px;background:var(--bg);color:var(--t1);border:1px solid var(--border);border-radius:4px;font-size:11px">
            </div>
        </div>`;
        html += `<div id="repo-cost-info" style="background:var(--bg);border-radius:6px;padding:8px;margin-bottom:8px;font-size:11px">
            <div style="display:flex;justify-content:space-between;align-items:center">
                <span style="color:var(--t3)">단가: 컨테이너당 $200</span>
                <span style="color:var(--t3)">수량: <strong style="color:var(--t1)" id="repo-qty">10</strong>개</span>
                <span>예상 비용: <strong style="color:var(--yellow);font-size:13px" id="repo-total-cost">$2,000</strong></span>
            </div>
            <div style="margin-top:4px;font-size:10px;color:var(--t3)">출항 시 자동 이동 | 현재 현금: <span style="color:${s.cash >= 2000 ? 'var(--green)' : 'var(--red)'}" id="repo-cash">$${Math.round(s.cash).toLocaleString()}</span></div>
        </div>`;
        html += `<div style="display:flex;justify-content:flex-end">
            <button class="btn-sm" onclick="Game.repoContainers()" style="padding:6px 20px;font-size:12px">🚛 재배치 실행</button>
        </div>`;

        // Show pending repos
        if (s.pendingRepos && s.pendingRepos.length > 0) {
            html += '<div style="margin-top:8px;border-top:1px solid var(--border);padding-top:8px">';
            html += '<div style="font-size:10px;color:var(--yellow);margin-bottom:4px">📋 대기 중인 재배치 (다음 출항 시 실행)</div>';
            s.pendingRepos.forEach((rp, i) => {
                html += `<div style="display:flex;justify-content:space-between;align-items:center;font-size:11px;padding:3px 0">
                    <span>${this.getPortName(rp.from)} → ${this.getPortName(rp.to)}: 20'×${rp.q20} + 40'×${rp.q40}</span>
                    <button style="font-size:9px;padding:2px 6px;background:var(--red);color:#fff;border:none;border-radius:3px;cursor:pointer" onclick="Game.cancelRepo(${i})">취소</button>
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

        if (from === to) { this.toast('출발/도착 항구가 같습니다', 'err'); return; }
        if (q20 + q40 <= 0) { this.toast('수량을 입력하세요', 'err'); return; }
        if (q20 > (s.ctr[from]?.['20'] || 0)) { this.toast(`${this.getPortName(from)}에 20' 엠티 부족`, 'err'); return; }
        if (q40 > (s.ctr[from]?.['40'] || 0)) { this.toast(`${this.getPortName(from)}에 40' 엠티 부족`, 'err'); return; }

        const cost = (q20 + q40) * 200;
        if (s.cash < cost) { this.toast(`현금 부족 ($${cost.toLocaleString()} 필요)`, 'err'); return; }

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

        this.toast(`🚛 ${this.getPortName(from)}→${this.getPortName(to)} 엠티 ${q20 + q40}개 재배치 예약! ($${cost.toLocaleString()})`, 'ok');
        this.addFeed(`🚛 엠티 재배치: ${this.getPortName(from)}→${this.getPortName(to)} 20'×${q20}+40'×${q40} ($${cost.toLocaleString()})`, 'booking');
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
        this.toast(`재배치 취소 — $${refund.toLocaleString()} 환불`, 'ok');
        this.renderContainers();
        this.updateHUD();
    },

    renderInvestments() {
        const s = this.state;
        let html = '';

        // Company Training (전체)
        const afford = (c) => this.canAfford(c);
        html += '<div class="invest-section"><h4>📚 전사 영업 교육 <span style="font-size:10px;color:var(--t3)">(전 직원 적용)</span></h4>';
        INVESTMENTS.training.forEach(inv => {
            const done = s.infra.training >= inv.level;
            const canBuy = !done && s.infra.training >= inv.level - 1 && afford(inv.cost);
            html += `<div class="invest-item ${done ? 'done' : (!canBuy ? 'locked' : '')}">
                <div class="invest-icon">${inv.icon}</div>
                <div class="invest-info"><div class="invest-name">${inv.name} ${done ? '✅' : `<span style="font-size:9px;color:var(--t3)">Lv.${inv.level}</span>`}</div><div class="invest-effect">${inv.effect}</div></div>
                ${done ? '' : `<div class="invest-cost">$${inv.cost.toLocaleString()}</div><button class="invest-btn" onclick="Game.invest('training',${inv.level},${inv.cost})" ${canBuy ? '' : 'disabled'}>투자</button>`}
            </div>`;
        });
        html += '</div>';

        // Personal Training (영업사원 개인별)
        html += '<div class="invest-section"><h4>🎯 개인별 특화 교육 <span style="font-size:10px;color:var(--t3)">(영업사원별 구매)</span></h4>';
        html += '<div style="font-size:10px;color:var(--t3);padding:4px 8px">각 영업사원에게 개별 교육을 제공하여 능력을 강화합니다.</div>';
        s.salesTeam.forEach((sp, idx) => {
            const ptLv = sp.personalTraining || 0;
            const nextPt = INVESTMENTS.personalTraining.find(p => p.level === ptLv + 1);
            const maxed = ptLv >= INVESTMENTS.personalTraining.length;
            const canBuyPt = nextPt && afford(nextPt.cost);
            html += `<div class="invest-item" style="flex-wrap:wrap">
                <div style="display:flex;align-items:center;gap:8px;width:100%">
                    <div class="invest-icon">${sp.avatar || '👤'}</div>
                    <div class="invest-info" style="flex:1;min-width:0">
                        <div class="invest-name">${sp.name} <span style="font-size:9px;color:var(--accent)">스킬 ${(sp.skill || 1).toFixed(1)}</span></div>
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
                          <button class="invest-btn" onclick="Game.investPersonalTraining(${idx},${nextPt.level},${nextPt.cost})" ${canBuyPt ? '' : 'disabled'} style="font-size:10px;padding:3px 8px">${nextPt.icon} ${nextPt.name}</button>` : ''}
                    </div>
                </div>
            </div>`;
        });
        html += '</div>';

        // Systems (통합 경영 시스템)
        const sysLv = s.infra.systems || s.infra.it || 0;
        if (!s.infra.systems && s.infra.it) s.infra.systems = s.infra.it; // migrate
        html += '<div class="invest-section"><h4>🏗️ 경영 시스템 <span style="font-size:10px;color:var(--t3)">(IT · 물류 · 경영 인프라)</span></h4>';
        INVESTMENTS.systems.forEach(inv => {
            const done = sysLv >= inv.level;
            const canBuy = !done && sysLv >= inv.level - 1 && afford(inv.cost);
            html += `<div class="invest-item ${done ? 'done' : (!canBuy ? 'locked' : '')}">
                <div class="invest-icon">${inv.icon}</div>
                <div class="invest-info" style="min-width:0">
                    <div class="invest-name">${inv.name} ${done ? '✅' : `<span style="font-size:9px;color:var(--t3)">Lv.${inv.level}</span>`}
                        <span style="font-size:8px;padding:1px 4px;border-radius:3px;background:var(--card2);color:var(--t3);margin-left:4px">${inv.category}</span>
                    </div>
                    <div class="invest-effect" style="word-break:break-word">${inv.effect}</div>
                </div>
                ${done ? '' : `<div class="invest-cost">$${inv.cost.toLocaleString()}</div><button class="invest-btn" onclick="Game.invest('systems',${inv.level},${inv.cost})" ${canBuy ? '' : 'disabled'}>투자</button>`}
            </div>`;
        });
        html += '</div>';

        // Offices (only show ports on current route, excluding home port)
        html += '<div class="invest-section"><h4>🏢 지사 설립</h4>';
        INVESTMENTS.office.filter(inv => s.route.ports.includes(inv.port) && inv.port !== s.route.ports[0]).forEach(inv => {
            const done = s.infra.offices[inv.port];
            const canBuy = !done && afford(inv.cost);
            html += `<div class="invest-item ${done ? 'done' : (!canBuy ? 'locked' : '')}">
                <div class="invest-icon">${inv.icon}</div>
                <div class="invest-info"><div class="invest-name">${inv.name} ${done ? '✅' : ''}</div><div class="invest-effect">${inv.effect}</div></div>
                ${done ? '' : `<div class="invest-cost">$${inv.cost.toLocaleString()}</div><button class="invest-btn" onclick="Game.investOffice('${inv.port}',${inv.cost})" ${canBuy ? '' : 'disabled'}>설립</button>`}
            </div>`;
        });
        html += '</div>';

        // Ship upgrade
        html += '<div class="invest-section"><h4>🚢 선박 업그레이드</h4>';
        INVESTMENTS.ship.forEach(inv => {
            const done = s.infra.shipLevel >= inv.level;
            const canBuy = !done && s.infra.shipLevel >= inv.level - 1 && afford(inv.cost);
            html += `<div class="invest-item ${done ? 'done' : (!canBuy ? 'locked' : '')}">
                <div class="invest-icon">${inv.icon}</div>
                <div class="invest-info"><div class="invest-name">${inv.name} (${inv.newCap}TEU) ${done ? '✅' : ''}</div><div class="invest-effect">선복량 ${inv.newCap}TEU로 확대</div></div>
                ${done ? '' : `<div class="invest-cost">$${inv.cost.toLocaleString()}</div><button class="invest-btn" onclick="Game.investShip(${inv.level},${inv.newCap},${inv.cost})" ${canBuy ? '' : 'disabled'}>구매</button>`}
            </div>`;
        });
        html += '</div>';

        // Containers — purchase per port with location-based pricing
        html += '<div class="invest-section"><h4>📦 컨테이너 구매</h4>';
        html += '<div style="font-size:10px;color:var(--t3);padding:4px 8px">구매 항구에 바로 배치됩니다. 해외 항구는 비싸지만 재배치 비용이 절약됩니다.</div>';

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
        html += `<div style="font-size:10px;color:var(--accent2);padding:2px 8px">📍 ${selPortName} — 현재 20':${portCtr['20']} / 40':${portCtr['40']}${priceMult > 1 ? ` | 가격 ×${priceMult}` : ''}</div>`;

        INVESTMENTS.containers.forEach(inv => {
            const adjCost = Math.round(inv.cost * priceMult);
            const canBuy = afford(adjCost);
            html += `<div class="invest-item">
                <div class="invest-icon">${inv.icon}</div>
                <div class="invest-info"><div class="invest-name">${inv.name}</div><div class="invest-effect">${selPortName}에 배치</div></div>
                <div class="invest-cost">$${adjCost.toLocaleString()}</div>
                <button class="invest-btn" onclick="Game.buyContainers(${inv.add20},${inv.add40},${adjCost},'${selPort}')" ${canBuy ? '' : 'disabled'}>구매</button>
            </div>`;
        });
        html += '</div>';

        // Recruitment — all from benchPool (draft unpicked + fired + scout pool)
        const allRecruits = (s.benchPool || []).filter(r => !s.salesTeam.find(st => st.id === r.id));
        html += '<div class="invest-section"><h4>👥 영업사원 스카우트</h4>';
        html += `<div style="font-size:10px;color:var(--t3);padding:4px 8px">현재 ${s.salesTeam.length}명 | 해고: [영업팀] 탭 → 영업사원 클릭 → 해고 | 스카우트 풀: ${allRecruits.length}명</div>`;
        if (allRecruits.length === 0) {
            html += '<div style="font-size:11px;color:var(--t3);padding:8px">모든 영업사원이 채용되었습니다.</div>';
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
            const tierLabel = (r.skill >= 5) ? '<span style="font-size:9px;color:#FFD700">전설</span>' :
                              (r.skill >= 4) ? '<span style="font-size:9px;color:#C0C0C0">고급</span>' :
                              (r.skill >= 3) ? '<span style="font-size:9px;color:#CD7F32">중급</span>' : '';
            html += `<div class="invest-item ${!unlocked ? 'locked' : ''}">
                <div class="invest-icon">${r.avatar}</div>
                <div class="invest-info">
                    <div class="invest-name">${r.name} ${'⭐'.repeat(r.skill || 1)} ${tierLabel} ${r.position ? '<span style="font-size:9px;color:var(--accent2)">'+r.position+'</span>' : ''} ${!unlocked ? '🔒' : ''}</div>
                    <div class="invest-effect">${r.desc || ''}</div>
                    <div class="trait-mini" style="margin-top:2px">
                        <span data-tip="협상력">🤝${t.negotiation||0}</span>
                        <span data-tip="대면력">🚶${t.faceToFace||0}</span>
                        <span data-tip="IT역량">💻${t.digital||0}</span>
                        <span data-tip="관계력">💛${t.relationship||0}</span>
                        <span style="color:var(--t3)">| 💰 $${r.salary}/월</span>
                    </div>
                    ${!unlocked ? `<div style="font-size:9px;color:var(--yellow);margin-top:2px">매출 $${(r.unlockRev/1e3).toFixed(0)}K 달성 시 해금</div>` : ''}
                </div>
                <div class="invest-cost">$${r.recruitCost.toLocaleString()}</div>
                <button class="invest-btn" onclick="Game.recruitSales('${r.id}')" ${canBuy ? '' : 'disabled'}>스카우트</button>
            </div>`;
        });
        html += '</div>';

        // === New Route Expansion ===
        if (typeof NEW_ROUTE_PACKAGES !== 'undefined') {
            html += '<div class="invest-section"><h4>🌏 신규항로 개척 (자사선 투입)</h4>';
            html += '<div style="font-size:10px;color:var(--t3);padding:4px 8px">자사 선박·컨테이너·해외사무실을 갖추고 새로운 항로를 개척합니다.</div>';
            if (!s.ownedRoutes) s.ownedRoutes = [];
            NEW_ROUTE_PACKAGES.forEach(pkg => {
                const owned = s.ownedRoutes.find(o => o.id === pkg.id);
                const unlocked = s.stats.totRev >= (pkg.unlockRevenue || 0);
                const canBuy = !owned && unlocked && afford(pkg.totalInvestment);
                const portList = pkg.ports.map(p => pkg.portNames[p]).join(' → ');
                // Loan calculation: how much is needed beyond current cash
                const shortage = Math.max(0, pkg.totalInvestment - Math.max(0, s.cash));
                const needsLoan = unlocked && !canBuy && shortage > 0;
                const loanRate = shortage <= 500000 ? 6 : shortage <= 2000000 ? 5 : 4.5;
                const loanFee = Math.round(shortage * 0.01);
                const monthlyRepay = Math.round(shortage / 24); // 24개월 상환
                const monthlyInterest = Math.round(shortage * loanRate / 100 / 12);

                if (owned) {
                    html += `<div class="invest-item active-promo" style="border-left:3px solid ${pkg.color}">
                        <div class="invest-icon">🌏</div>
                        <div class="invest-info">
                            <div class="invest-name">${pkg.nameKo} <span style="font-size:9px;color:var(--green)">운영 중</span></div>
                            <div class="invest-effect">${portList} | ${pkg.vesselSize}TEU × ${pkg.shipCount}척 | ${pkg.rotationDays}일</div>
                        </div>
                        <div style="font-size:10px;color:var(--green)">활성</div>
                    </div>`;
                } else {
                    const shipTotal = pkg.shipCount * pkg.shipCostEach;
                    const officeTotal = pkg.officePorts.length * pkg.officeCostEach;
                    const expanded = this._expandedRoute === pkg.id;

                    html += `<div class="invest-item" style="border-left:3px solid ${pkg.color};flex-wrap:wrap;${!unlocked ? 'opacity:.5' : ''}">
                        <div style="display:flex;align-items:center;gap:8px;width:100%">
                            <div class="invest-icon">🌏</div>
                            <div class="invest-info" style="flex:1;min-width:0">
                                <div class="invest-name">${pkg.nameKo} ${!unlocked ? '🔒' : ''} <span style="font-size:9px;color:${pkg.color}">${pkg.difficulty}</span></div>
                                <div class="invest-effect" style="word-break:break-word">${portList}</div>
                                <div style="font-size:10px;color:var(--t3)">${pkg.vesselSize}TEU × ${pkg.shipCount}척 | ${pkg.rotationDays}일 로테이션</div>
                                ${!unlocked ? `<div style="font-size:10px;color:var(--yellow);margin-top:3px;font-weight:600">🔒 해금 조건: 누적 매출 $${pkg.unlockRevenue >= 1e6 ? (pkg.unlockRevenue/1e6).toFixed(0)+'M' : (pkg.unlockRevenue/1e3).toFixed(0)+'K'}<br><span style="font-size:9px;font-weight:400">현재 매출: $${this._shortNum(s.stats.totRev)} (${Math.min(100, Math.round(s.stats.totRev / pkg.unlockRevenue * 100))}%)</span></div>` : ''}
                            </div>
                            <div style="text-align:right;flex-shrink:0">
                                <div class="invest-cost">$${pkg.totalInvestment.toLocaleString()}</div>
                                ${unlocked ? `<button class="btn-sm" onclick="Game._expandedRoute=Game._expandedRoute==='${pkg.id}'?null:'${pkg.id}';Game.renderInvestments()" style="font-size:9px;padding:2px 6px;margin-top:3px">${expanded ? '▲ 접기' : '▼ 상세'}</button>` : ''}
                            </div>
                        </div>`;

                    if (expanded && unlocked) {
                        html += `<div style="width:100%;margin-top:8px;padding:10px;background:var(--bg);border-radius:8px;font-size:11px">
                            <div style="font-weight:700;margin-bottom:8px;color:var(--t1)">📋 투자 내역서</div>
                            <table style="width:100%;border-collapse:collapse;font-size:11px">
                                <tr style="border-bottom:1px solid var(--border)">
                                    <td style="padding:4px 0">🚢 선박 (${pkg.vesselSize}TEU급 × ${pkg.shipCount}척)</td>
                                    <td style="text-align:right;font-weight:600">$${shipTotal.toLocaleString()}</td>
                                </tr>
                                <tr style="border-bottom:1px solid var(--border)">
                                    <td style="padding:4px 0">📦 컨테이너 (20'×${pkg.containerSet['20']} + 40'×${pkg.containerSet['40']})</td>
                                    <td style="text-align:right;font-weight:600">$${pkg.containerCost.toLocaleString()}</td>
                                </tr>
                                ${pkg.officePorts.map(op => `<tr style="border-bottom:1px solid var(--border)">
                                    <td style="padding:4px 0">🏢 ${pkg.portNames[op]} 사무실 개설</td>
                                    <td style="text-align:right;font-weight:600">$${pkg.officeCostEach.toLocaleString()}</td>
                                </tr>`).join('')}
                                <tr style="font-weight:700;color:var(--accent)">
                                    <td style="padding:6px 0">총 투자금액</td>
                                    <td style="text-align:right;font-size:13px">$${pkg.totalInvestment.toLocaleString()}</td>
                                </tr>
                            </table>
                            <div style="margin-top:8px;padding:6px;background:var(--card2);border-radius:6px;font-size:10px;color:var(--t3)">
                                <div>⛽ 연료비/일: $${pkg.fuelCostPerDay.toLocaleString()} | 항비/기항: $${pkg.portFeesPerCall.toLocaleString()} | 고정비/주: $${pkg.weeklyFixedCost.toLocaleString()}</div>
                            </div>`;

                        if (unlocked) {
                            // 신규 항로는 반드시 대출 연계
                            const loanAmt = Math.max(shortage, Math.round(pkg.totalInvestment * 0.4)); // 최소 40% 대출
                            const dispRate = loanAmt <= 500000 ? 6 : loanAmt <= 2000000 ? 5 : 4.5;
                            const dispFee = Math.round(loanAmt * 0.01);
                            const dispMonthly = Math.round(loanAmt / 24);
                            const dispInterest = Math.round(loanAmt * dispRate / 100 / 12);
                            html += `<div style="margin-top:10px;padding:10px;background:rgba(33,150,243,.1);border:1px solid var(--accent);border-radius:8px">
                                <div style="font-weight:700;font-size:12px;color:var(--accent);margin-bottom:6px">🏦 선박금융 + 항로 개척</div>
                                <div style="font-size:10px;color:var(--t2);display:grid;grid-template-columns:1fr 1fr;gap:4px">
                                    <span>총 투자금: $${pkg.totalInvestment.toLocaleString()}</span>
                                    <span>자기자본: $${Math.round(pkg.totalInvestment - loanAmt).toLocaleString()}</span>
                                    <span>대출금: <strong style="color:var(--accent)">$${loanAmt.toLocaleString()}</strong></span>
                                    <span>대출 연이율: <strong style="color:var(--yellow)">${dispRate}%</strong></span>
                                    <span>월 상환금: ~$${dispMonthly.toLocaleString()}</span>
                                    <span>월 이자: ~$${dispInterest.toLocaleString()}</span>
                                </div>
                                <div style="font-size:9px;color:var(--t3);margin-top:4px">* 24개월 분할상환 | 수수료 $${dispFee.toLocaleString()}</div>
                                <button class="btn-primary" onclick="Game.buyNewRouteWithLoan('${pkg.id}')" ${s.cash >= (pkg.totalInvestment - loanAmt) ? '' : 'disabled'} style="width:100%;margin-top:8px;font-size:12px;background:#1565C0">
                                    🏦 대출 실행 + 항로 개척
                                </button>
                                ${s.cash < (pkg.totalInvestment - loanAmt) ? `<div style="font-size:9px;color:var(--red);margin-top:4px">⚠️ 자기자본 부족 (필요: $${Math.round(pkg.totalInvestment - loanAmt).toLocaleString()})</div>` : ''}
                            </div>`;
                        } else {
                            html += `<button class="btn-primary" disabled style="width:100%;margin-top:10px;font-size:12px">현금 부족</button>`;
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
            html += '<div class="invest-section"><h4>🚢 슬롯 차터 (경쟁사 선복 구매)</h4>';
            html += '<div style="font-size:10px;color:var(--t3);padding:4px 8px">경쟁사 모선의 선복을 구매하여 새 항로에 진출합니다. 자사 선박 없이 영업 가능!</div>';
            if (!s.slotCharters) s.slotCharters = [];
            SLOT_CHARTERS.forEach(sc => {
                const owned = s.slotCharters.find(o => o.id === sc.id);
                const unlocked = s.stats.totRev >= (sc.unlockRevenue || 0);
                const portList = sc.ports.map(p => sc.portNames[p]).join(' → ');
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
                    html += `<div class="invest-item active-promo" style="border-left:3px solid ${sc.color}">
                        <div class="invest-icon">🚢</div>
                        <div class="invest-info">
                            <div class="invest-name">${sc.nameKo} <span style="font-size:9px;color:var(--green)">운영 중</span></div>
                            <div class="invest-effect">${sc.carrier} ${sc.vesselName} | ${portList}</div>
                            <div style="font-size:10px;color:var(--t3);margin-top:2px">📦 ${sc.slotCapacity} TEU | 💰 항차당 $${sc.slotFeePerVoyage.toLocaleString()} | V.${owned.voyNum || 1}</div>
                        </div>
                        <div style="font-size:10px;color:var(--green)">활성</div>
                    </div>`;
                } else {
                    html += `<div class="invest-item" style="border-left:3px solid ${sc.color};flex-wrap:wrap;${!unlocked ? 'opacity:.5' : ''}">
                        <div style="display:flex;align-items:center;gap:8px;width:100%">
                            <div class="invest-icon">🚢</div>
                            <div class="invest-info" style="flex:1;min-width:0">
                                <div class="invest-name">${sc.nameKo} ${!unlocked ? '🔒' : ''} <span style="font-size:9px;color:${sc.color}">${sc.difficulty}</span></div>
                                <div class="invest-effect" style="word-break:break-word">${sc.carrier} 모선 선복 ${sc.slotCapacity} TEU</div>
                                <div style="font-size:10px;color:var(--t3);margin-top:2px">${portList} | ${sc.rotationDays}일 로테이션</div>
                                <div style="font-size:10px;color:var(--t2);margin-top:2px">
                                    💰 슬롯비: $${sc.slotCost.toLocaleString()} + 🏢 사무실 ${scOfficePorts.length}곳: $${scOfficeCost.toLocaleString()}
                                </div>
                                <div style="font-size:10px;color:var(--yellow);margin-top:2px">항차당 슬롯비: $${sc.slotFeePerVoyage.toLocaleString()}</div>
                                ${!unlocked ? `<div style="font-size:10px;color:var(--yellow);margin-top:3px;font-weight:600">🔒 해금 조건: 누적 매출 $${sc.unlockRevenue >= 1e6 ? (sc.unlockRevenue/1e6).toFixed(0)+'M' : (sc.unlockRevenue/1e3).toFixed(0)+'K'}<br><span style="font-size:9px;font-weight:400">현재 매출: $${this._shortNum(s.stats.totRev)} (${Math.min(100, Math.round(s.stats.totRev / sc.unlockRevenue * 100))}%)</span></div>` : ''}
                            </div>
                            <div style="text-align:right;flex-shrink:0">
                                <div class="invest-cost">$${scTotalCost.toLocaleString()}</div>
                                ${canBuy ? `<button class="invest-btn" onclick="Game.buySlotCharter('${sc.id}')">구매</button>` : ''}
                            </div>
                        </div>`;

                    if (scNeedsLoan) {
                        html += `<div style="width:100%;margin-top:8px;padding:8px;background:rgba(33,150,243,.1);border:1px solid var(--accent);border-radius:8px;font-size:10px">
                            <div style="font-weight:700;color:var(--accent);margin-bottom:4px">🏦 대출로 슬롯 차터</div>
                            <div style="color:var(--t2);display:flex;gap:8px;flex-wrap:wrap">
                                <span>부족: <strong style="color:var(--red)">$${scShortage.toLocaleString()}</strong></span>
                                <span>연이율: <strong style="color:var(--yellow)">${scLoanRate}%</strong></span>
                                <span>월 상환: ~$${scMonthlyRepay.toLocaleString()}</span>
                                <span>월 이자: ~$${scMonthlyInterest.toLocaleString()}</span>
                            </div>
                            <button class="btn-primary" onclick="Game.buySlotCharterWithLoan('${sc.id}')" style="width:100%;margin-top:6px;font-size:11px;background:#1565C0;padding:6px">
                                🏦 대출 실행 + 슬롯 차터 ($${scTotalCost.toLocaleString()})
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
            html += '<div class="invest-section"><h4>🏦 은행 대출</h4>';
            html += '<div style="font-size:10px;color:var(--t3);padding:4px 8px;display:flex;justify-content:space-between">';
            html += `<span>현재 부채: $${Math.round(totalDebt).toLocaleString()}</span>`;
            html += `<span>대출 이력: ${s.loans.length}건</span>`;
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
                        <div class="invest-name">${loan.name} ${!unlocked ? '🔒' : ''}</div>
                        <div class="invest-effect">${loan.desc}</div>
                        <div style="font-size:10px;margin-top:3px;display:flex;gap:10px;flex-wrap:wrap;color:var(--t2)">
                            <span>💰 대출금: <strong style="color:var(--green)">$${loan.amount.toLocaleString()}</strong></span>
                            <span>📊 연이율: <strong style="color:var(--yellow)">${loan.annualRate}%</strong></span>
                            <span>🏷️ 수수료: $${fee.toLocaleString()} (${(loan.originFee * 100).toFixed(1)}%)</span>
                        </div>
                        <div style="font-size:9px;margin-top:2px;color:var(--t3)">
                            실수령: $${netAmount.toLocaleString()} | 월 이자: ~$${monthlyInterest.toLocaleString()} | 부채한도: $${debtLimit.toLocaleString()}
                        </div>
                        ${!unlocked ? `<div style="font-size:9px;color:var(--yellow);margin-top:2px">매출 $${loan.unlockRev >= 1e6 ? (loan.unlockRev/1e6).toFixed(0)+'M' : (loan.unlockRev/1e3).toFixed(0)+'K'} 달성 시 이용 가능</div>` : ''}
                        ${unlocked && wouldExceed ? `<div style="font-size:9px;color:var(--red);margin-top:2px">⚠️ 부채한도 초과 — 대출 불가</div>` : ''}
                    </div>
                    <button class="invest-btn" onclick="Game.takeLoan('${loan.id}')" ${canTake ? '' : 'disabled'}>대출</button>
                </div>`;
            });
            html += '</div>';
        }

        // Promotions
        html += '<div class="invest-section"><h4>📢 프로모션</h4>';
        if (!s.promos) s.promos = [];
        PROMOTIONS.forEach(p => {
            const active = s.promos.find(ap => ap.id === p.id && ap.endsDay > s.gameDay);
            const canBuy = !active && afford(p.cost);
            html += `<div class="promo-item ${active ? 'active-promo' : ''}">
                <div class="promo-icon">${p.icon}</div>
                <div class="promo-info">
                    <div class="promo-name">${p.name} ${active ? `<span style="color:var(--yellow);font-size:10px">진행 중 (D${active.endsDay}까지)</span>` : ''}</div>
                    <div class="promo-effect">${p.effect}</div>
                </div>
                ${active ? '' : `<div class="promo-cost">$${p.cost.toLocaleString()}</div>
                <button class="invest-btn" onclick="Game.runPromo('${p.id}')" ${canBuy ? '' : 'disabled'}>실행</button>`}
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
            this.toast('부채한도를 초과합니다!', 'err');
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
        this.toast(`🏦 ${loan.name} 실행! +$${netAmount.toLocaleString()} (수수료 $${fee.toLocaleString()})`, 'ok');
        this.addFeed(`🏦 ${loan.name} $${loan.amount.toLocaleString()} 대출 실행 (연 ${loan.annualRate}%)`, 'invest');
        this.renderInvestments();
    },

    runPromo(promoId) {
        const s = this.state;
        const p = PROMOTIONS.find(x => x.id === promoId);
        if (!p || !this.canAfford(p.cost)) { this.toast('부채 한도 초과!', 'err'); return; }
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

        this.toast(`${p.icon} ${p.name} 실행!`, 'ok');
        this.addFeed(`📢 ${p.name} 프로모션 시작! (${p.duration}일간)`, 'alert');
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
        if (!this.canAfford(totalCost)) { this.toast('자금 부족! (슬롯비 + 사무실 개설비)', 'err'); return; }
        if (s.stats.totRev < (sc.unlockRevenue || 0)) { this.toast('매출 조건 미달!', 'err'); return; }
        if (!s.slotCharters) s.slotCharters = [];
        if (s.slotCharters.find(o => o.id === sc.id)) { this.toast('이미 운영 중!', 'err'); return; }

        s.cash -= sc.slotCost;
        s.stats.totExp += sc.slotCost;
        s.debt += Math.round(sc.slotCost * 0.5);

        const ofc = this._initSlotCharter(sc);

        this.toast(`🚢 ${sc.nameKo} 슬롯 차터 개시! (사무실 ${officePorts.length}곳 개설)`, 'ok');
        this.addFeed(`🚢 ${sc.carrier} ${sc.vesselName} 선복 구매! 🏢 사무실 ${officePorts.length}곳 개설 ($${ofc.toLocaleString()})`, 'alert');
        this.renderInvestments();
        this.updateHUD();
    },

    buySlotCharterWithLoan(scId) {
        const s = this.state;
        const sc = SLOT_CHARTERS.find(x => x.id === scId);
        if (!sc) return;
        if (s.stats.totRev < (sc.unlockRevenue || 0)) { this.toast('매출 조건 미달!', 'err'); return; }
        if (!s.slotCharters) s.slotCharters = [];
        if (s.slotCharters.find(o => o.id === sc.id)) { this.toast('이미 운영 중!', 'err'); return; }

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
        s.loans.push({ id: 'loan_slot_' + sc.id, name: `슬롯차터 대출 (${sc.nameKo})`, amount: shortage, rate: loanRate, fee: loanFee, day: s.gameDay, ts: Date.now() });

        // Deduct slot cost
        s.cash -= sc.slotCost;
        s.stats.totExp += sc.slotCost;
        s.debt += Math.round(sc.slotCost * 0.5);

        // Init charter (includes office + containers)
        const ofc = this._initSlotCharter(sc);

        this.toast(`🏦 대출 $${shortage.toLocaleString()} → 🚢 ${sc.nameKo} 개시! 🏢 사무실 ${officePorts.length}곳`, 'ok');
        this.addFeed(`🏦 대출 $${shortage.toLocaleString()} (연 ${loanRate}%) → 🚢 ${sc.nameKo} + 🏢 사무실 개설`, 'alert');
        this.renderInvestments();
        this.updateHUD();
    },

    buyNewRouteWithLoan(pkgId) {
        const s = this.state;
        const pkg = NEW_ROUTE_PACKAGES.find(x => x.id === pkgId);
        if (!pkg) return;
        if (s.stats.totRev < (pkg.unlockRevenue || 0)) { this.toast('매출 조건 미달!', 'err'); return; }
        if (!s.ownedRoutes) s.ownedRoutes = [];
        if (s.ownedRoutes.find(o => o.id === pkg.id)) { this.toast('이미 운영 중!', 'err'); return; }

        // Always require loan (minimum 40% of investment)
        const shortage = Math.max(0, pkg.totalInvestment - Math.max(0, s.cash));
        const loanAmt = Math.max(shortage, Math.round(pkg.totalInvestment * 0.4));
        const loanRate = loanAmt <= 500000 ? 6 : loanAmt <= 2000000 ? 5 : 4.5;
        const loanFee = Math.round(loanAmt * 0.01);
        const equity = pkg.totalInvestment - loanAmt;

        if (s.cash < equity) { this.toast('자기자본 부족!', 'err'); return; }

        // Take loan
        s.debt += loanAmt;
        s.stats.totExp += loanFee;
        if (!s.loans) s.loans = [];
        s.loans.push({ id: 'loan_route_' + pkg.id, name: `선박금융 (${pkg.nameKo})`, amount: loanAmt, rate: loanRate, fee: loanFee, day: s.gameDay, ts: Date.now() });

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

        this.toast(`🏦 대출 $${shortage.toLocaleString()} 실행 → 🌏 ${pkg.nameKo} 항로 개척!`, 'ok');
        this.addFeed(`🏦 대출 $${shortage.toLocaleString()} (연 ${loanRate}%) → 🌏 ${pkg.nameKo} 개통!`, 'alert');
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

                    this.addFeed(`🚢 ${sc.nameKo} V.${charter.voyNum} 완료 — ${totalTEU}TEU (${lf}%) ${profit >= 0 ? '💰' : '📛'} $${Math.abs(Math.round(profit)).toLocaleString()}`, profit >= 0 ? 'good' : 'alert');

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
                this.addFeed(`🌏 ${pkg.nameKo} V.${route.voyNum} 완료 — ${totalTEU}TEU (${lf}%) ${profit >= 0 ? '💰' : '📛'} $${Math.abs(Math.round(profit)).toLocaleString()}`, profit >= 0 ? 'good' : 'alert');

                route.voyage.dayCounter = 0;
            }
        });
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
        if (!this.canAfford(cost)) { this.toast('부채 한도 초과!', 'err'); return; }
        s.cash -= cost; s.stats.totExp += cost;
        s.infra[type] = level;
        const labels = { training: '영업 교육', systems: '경영 시스템', it: 'IT 시스템' };
        this.toast(`${labels[type] || type} Lv.${level} 완료!`, 'ok');
        this.addFeed(`🏗️ ${labels[type] || type} 레벨 ${level} 투자 완료!`, 'alert');
        this.renderInvestments();
        this.updateHUD();
    },

    investPersonalTraining(spIdx, level, cost) {
        const s = this.state;
        if (!this.canAfford(cost)) { this.toast('부채 한도 초과!', 'err'); return; }
        const sp = s.salesTeam[spIdx];
        if (!sp) return;
        s.cash -= cost; s.stats.totExp += cost;
        if (!sp.personalTraining) sp.personalTraining = 0;
        sp.personalTraining = level;
        const ptDef = INVESTMENTS.personalTraining.find(p => p.level === level);
        if (ptDef && ptDef.skillBoost) sp.skill = Math.min(10, (sp.skill || 1) + ptDef.skillBoost);
        this.toast(`${sp.name} — ${ptDef ? ptDef.name : '교육'} 완료! (스킬 ${sp.skill.toFixed(1)})`, 'ok');
        this.addFeed(`🎯 ${sp.name} 개인교육 Lv.${level} 완료 → 스킬 ${sp.skill.toFixed(1)}`, 'alert');
        this.renderInvestments();
    },

    investOffice(port, cost) {
        const s = this.state;
        if (!this.canAfford(cost)) { this.toast('부채 한도 초과!', 'err'); return; }
        s.cash -= cost; s.stats.totExp += cost;
        s.infra.offices[port] = true;
        this.toast(`${s.route.portNames[port]} 지사 설립!`, 'ok');
        this.renderInvestments();
        this.updateHUD();
    },

    investShip(level, newCap, cost) {
        const s = this.state;
        if (!this.canAfford(cost)) { this.toast('부채 한도 초과!', 'err'); return; }
        s.cash -= cost; s.stats.totExp += cost;
        s.infra.shipLevel = level;
        s.ship.capacity = newCap;
        this.toast(`선박 업그레이드! ${newCap}TEU`, 'ok');
        this.addFeed(`🚢 선박 업그레이드 완료! 선복량 ${newCap}TEU`, 'alert');
        this.renderInvestments();
        this.updateAll();
    },

    buyContainers(add20, add40, cost, port) {
        const s = this.state;
        if (!this.canAfford(cost)) { this.toast('부채 한도 초과!', 'err'); return; }
        s.cash -= cost; s.stats.totExp += cost;
        const targetPort = port || s.route.ports[0];
        if (!s.ctr[targetPort]) s.ctr[targetPort] = { '20': 0, '40': 0 };
        s.ctr[targetPort]['20'] += add20;
        s.ctr[targetPort]['40'] += add40;
        const portName = this.getPortName(targetPort);
        this.toast(`컨테이너 구매 완료! ${portName}에 배치`, 'ok');
        this.renderInvestments();
        this.updateHUD();
    },

    renderFinance() {
        const s = this.state;
        const teamCost = s.salesTeam.reduce((sum, st) => sum + st.salary, 0) + s.captain.salary;
        const totExp = s.stats.totExp || 0;
        const netProfit = s.stats.totRev - totExp;

        // === Summary Cards ===
        let html = `
        <div class="fin-grid">
            <div class="fin-card"><span class="fin-val" style="color:var(--green)">$${Math.round(s.cash).toLocaleString()}</span><span class="fin-label">보유 현금</span></div>
            <div class="fin-card"><span class="fin-val" style="color:var(--red)">$${Math.round(s.debt).toLocaleString()}</span><span class="fin-label">부채</span></div>
            <div class="fin-card"><span class="fin-val" style="color:var(--green)">$${Math.round(s.stats.totRev).toLocaleString()}</span><span class="fin-label">누적 매출</span></div>
            <div class="fin-card"><span class="fin-val" style="color:var(--red)">$${Math.round(totExp).toLocaleString()}</span><span class="fin-label">누적 비용</span></div>
            <div class="fin-card"><span class="fin-val" style="color:${netProfit >= 0 ? 'var(--green)' : 'var(--red)'}">$${Math.round(netProfit).toLocaleString()}</span><span class="fin-label">누적 손익</span></div>
            <div class="fin-card"><span class="fin-val">${s.stats.totVoy}</span><span class="fin-label">총 항차</span></div>
        </div>`;

        // === P&L Statement ===
        html += '<h4 style="font-size:13px;color:var(--t2);margin:12px 0 8px">📊 손익계산서 (누적)</h4>';
        html += '<div style="background:var(--card2);border-radius:8px;padding:10px;margin-bottom:12px">';
        // Revenue
        html += '<div class="fin-row" style="font-weight:600"><span>매출 (운임 수입)</span><span style="color:var(--green)">$' + Math.round(s.stats.totRev).toLocaleString() + '</span></div>';
        // Expenses breakdown
        const voyExp = s.stats.history.reduce((sum, h) => sum + h.exp, 0);
        const salaryExp = teamCost * Math.floor(s.gameDay / 30); // approximate salary paid
        const investExp = totExp - voyExp - salaryExp;
        html += '<div style="border-top:1px solid var(--border);margin:6px 0;padding-top:6px">';
        html += '<div class="fin-row"><span style="color:var(--t3)">항해 비용 (연료+항비)</span><span style="color:var(--red)">-$' + Math.round(voyExp).toLocaleString() + '</span></div>';
        html += '<div class="fin-row"><span style="color:var(--t3)">인건비 ($' + teamCost.toLocaleString() + '/월)</span><span style="color:var(--red)">-$' + Math.round(Math.max(0, salaryExp)).toLocaleString() + '</span></div>';
        html += '<div class="fin-row"><span style="color:var(--t3)">투자/기타 비용</span><span style="color:var(--red)">-$' + Math.round(Math.max(0, investExp)).toLocaleString() + '</span></div>';
        html += '</div>';
        // Net
        html += '<div class="fin-row" style="font-weight:700;border-top:2px solid var(--border);padding-top:6px;margin-top:6px"><span>순이익</span><span style="color:' + (netProfit >= 0 ? 'var(--green)' : 'var(--red)') + '">$' + Math.round(netProfit).toLocaleString() + '</span></div>';
        // Margin
        if (s.stats.totRev > 0) {
            const margin = Math.round((netProfit / s.stats.totRev) * 100);
            html += '<div class="fin-row"><span style="color:var(--t3)">이익률</span><span style="color:' + (margin >= 0 ? 'var(--green)' : 'var(--red)') + '">' + margin + '%</span></div>';
        }
        html += '</div>';

        // === Per-Voyage P&L ===
        if (s.stats.history.length > 0) {
            html += '<h4 style="font-size:13px;color:var(--t2);margin:12px 0 8px">🚢 항차별 채산</h4>';

            // Average stats
            const avgRev = Math.round(s.stats.history.reduce((s, h) => s + h.rev, 0) / s.stats.history.length);
            const avgExp = Math.round(s.stats.history.reduce((s, h) => s + h.exp, 0) / s.stats.history.length);
            const avgProfit = Math.round(s.stats.history.reduce((s, h) => s + h.profit, 0) / s.stats.history.length);
            const avgLF = Math.round(s.stats.history.reduce((s, h) => s + h.lf, 0) / s.stats.history.length);
            html += `<div style="background:var(--card2);border-radius:8px;padding:10px;margin-bottom:8px">
                <div style="font-size:11px;color:var(--t3);margin-bottom:6px">📊 항차 평균</div>
                <div style="display:grid;grid-template-columns:1fr 1fr 1fr 1fr;gap:4px;text-align:center;font-size:11px">
                    <div><div style="font-weight:700;color:var(--green)">$${avgRev.toLocaleString()}</div><div style="font-size:9px;color:var(--t3)">매출</div></div>
                    <div><div style="font-weight:700;color:var(--red)">$${avgExp.toLocaleString()}</div><div style="font-size:9px;color:var(--t3)">비용</div></div>
                    <div><div style="font-weight:700;color:${avgProfit >= 0 ? 'var(--green)' : 'var(--red)'}">$${avgProfit.toLocaleString()}</div><div style="font-size:9px;color:var(--t3)">이익</div></div>
                    <div><div style="font-weight:700">${avgLF}%</div><div style="font-size:9px;color:var(--t3)">적재율</div></div>
                </div>
            </div>`;

            // Per-voyage table with expandable detail
            html += '<div style="background:var(--card2);border-radius:8px;padding:10px">';
            html += '<div style="display:grid;grid-template-columns:60px 1fr 1fr 1fr 50px;gap:4px;font-size:10px;color:var(--t3);padding-bottom:4px;border-bottom:1px solid var(--border);margin-bottom:4px"><span>항차</span><span style="text-align:right">매출</span><span style="text-align:right">비용</span><span style="text-align:right">손익</span><span style="text-align:right">적재율</span></div>';
            [...s.stats.history].reverse().forEach((h, idx) => {
                const profitColor = h.profit >= 0 ? 'var(--green)' : 'var(--red)';
                const lfColor = h.lf >= 70 ? 'var(--green)' : (h.lf >= 40 ? 'var(--yellow)' : 'var(--red)');
                const detailId = `voy-detail-${h.voy}`;
                html += `<div style="cursor:pointer" onclick="document.getElementById('${detailId}').style.display=document.getElementById('${detailId}').style.display==='none'?'block':'none'">
                    <div style="display:grid;grid-template-columns:60px 1fr 1fr 1fr 50px;gap:4px;font-size:11px;padding:4px 0;border-bottom:1px solid rgba(255,255,255,.03)">
                        <span style="font-weight:600">V.${String(h.voy).padStart(3,'0')} ▾</span>
                        <span style="text-align:right;color:var(--green)">$${h.rev.toLocaleString()}</span>
                        <span style="text-align:right;color:var(--red)">$${h.exp.toLocaleString()}</span>
                        <span style="text-align:right;font-weight:700;color:${profitColor}">$${h.profit.toLocaleString()}</span>
                        <span style="text-align:right;color:${lfColor}">${h.lf}%</span>
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
                    <div style="font-weight:600;margin-bottom:4px;color:var(--t2)">V.${String(h.voy).padStart(3,'0')} 상세 채산</div>
                    <div class="fin-row"><span style="color:var(--green)">운임 매출</span><span style="color:var(--green)">+$${h.rev.toLocaleString()}</span></div>
                    <div style="border-top:1px solid var(--border);margin:4px 0"></div>
                    <div class="fin-row"><span>⛽ 연료비 + 항비</span><span style="color:var(--red)">-$${fp.toLocaleString()}</span></div>
                    <div class="fin-row"><span>🏢 주간 고정비</span><span style="color:var(--red)">-$${fc.toLocaleString()}</span></div>
                    <div class="fin-row"><span>🏦 이자 + 상환</span><span style="color:var(--red)">-$${ir.toLocaleString()}</span></div>
                    <div class="fin-row"><span>🔧 정비 + 급유</span><span style="color:var(--red)">-$${rm.toLocaleString()}</span></div>
                    ${salAct > 0 ? `<div class="fin-row"><span>👥 영업활동비 (접대/방문 등)</span><span style="color:var(--red)">-$${salAct.toLocaleString()}</span></div>` : ''}
                    ${boost > 0 ? `<div class="fin-row"><span>🚀 화주 부스터</span><span style="color:var(--red)">-$${boost.toLocaleString()}</span></div>` : ''}
                    ${repoA > 0 ? `<div class="fin-row"><span>🚛 엠티 회수 (자동)</span><span style="color:var(--red)">-$${repoA.toLocaleString()}</span></div>` : ''}
                    ${repoU > 0 ? `<div class="fin-row"><span>🚛 엠티 재배치 (수동)</span><span style="color:var(--red)">-$${repoU.toLocaleString()}</span></div>` : ''}
                    <div style="border-top:2px solid var(--border);margin:4px 0"></div>
                    <div class="fin-row" style="font-weight:700"><span>순이익</span><span style="color:${profitColor}">$${h.profit.toLocaleString()}</span></div>
                    <div class="fin-row"><span style="color:var(--t3)">이익률</span><span style="color:${margin >= 0 ? 'var(--green)' : 'var(--red)'}">${margin}%</span></div>
                    <div class="fin-row"><span style="color:var(--t3)">적재량</span><span>${h.teu} TEU (${h.lf}%)</span></div>
                </div>`;
            });

            // Cumulative profit chart (text-based bar chart)
            html += '<div style="margin-top:8px;border-top:1px solid var(--border);padding-top:8px">';
            html += '<div style="font-size:10px;color:var(--t3);margin-bottom:4px">📈 누적 손익 추이</div>';
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
        html += '<h4 style="font-size:13px;color:var(--t2);margin:12px 0 8px">📋 경영 KPI</h4>';
        html += '<div style="background:var(--card2);border-radius:8px;padding:10px">';
        const avgRevPerTEU = s.stats.totTEU > 0 ? Math.round(s.stats.totRev / s.stats.totTEU) : 0;
        const debtRatio = s.stats.totRev > 0 ? Math.round((s.debt / Math.max(1, s.stats.totRev)) * 100) : 100;
        const totalCusts = Object.values(s.custs).flat().length;
        const activeCusts = Object.values(s.custs).flat().filter(c => c.share > 0).length;
        html += `<div class="fin-row"><span style="color:var(--t3)">TEU당 평균 매출</span><span>$${avgRevPerTEU.toLocaleString()}</span></div>`;
        html += `<div class="fin-row"><span style="color:var(--t3)">총 운송 TEU</span><span>${s.stats.totTEU.toLocaleString()}</span></div>`;
        html += `<div class="fin-row"><span style="color:var(--t3)">부채 비율 (부채/매출)</span><span style="color:${debtRatio > 100 ? 'var(--red)' : 'var(--green)'}">${debtRatio}%</span></div>`;
        html += `<div class="fin-row"><span style="color:var(--t3)">활성 화주</span><span>${activeCusts}/${totalCusts}</span></div>`;
        html += `<div class="fin-row"><span style="color:var(--t3)">월 인건비</span><span>$${teamCost.toLocaleString()}</span></div>`;
        html += '</div>';

        document.getElementById('finance-view').innerHTML = html;
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
            <div class="fin-card"><span class="fin-val">${total}</span><span class="fin-label">총 활동</span></div>
            <div class="fin-card"><span class="fin-val" style="color:var(--green)">${rate}%</span><span class="fin-label">성공률</span></div>
            <div class="fin-card"><span class="fin-val" style="color:var(--green)">$${totalRev.toLocaleString()}</span><span class="fin-label">수주 금액</span></div>
            <div class="fin-card"><span class="fin-val" style="color:var(--red)">$${totalCost.toLocaleString()}</span><span class="fin-label">영업 비용</span></div>
        </div>`;

        // Per salesperson
        html += '<h4 style="font-size:12px;color:var(--t2);margin:8px 0">👤 영업사원별 실적</h4>';
        for (const [name, d] of Object.entries(bySP)) {
            const spRate = d.total > 0 ? Math.round((d.success / d.total) * 100) : 0;
            html += `<div class="fin-row"><span>${d.avatar} ${name} (${d.total}건, 성공 ${spRate}%)</span><span style="color:var(--green)">$${d.rev.toLocaleString()}</span></div>`;
        }

        // Recent log
        html += '<h4 style="font-size:12px;color:var(--t2);margin:12px 0 4px">📋 최근 활동 내역</h4>';
        logs.slice(0, 20).forEach(l => {
            html += `<div class="fin-row">
                <span style="color:var(--t3)">D${l.day}</span>
                <span>${l.spAvatar} ${l.spName} → ${l.custIcon}${l.custName} ${l.actIcon}${l.actName}</span>
                <span style="color:${l.success ? 'var(--green)' : 'var(--red)'}">${l.success ? `✅ $${(l.revenue || 0).toLocaleString()}` : '❌'}</span>
            </div>`;
        });

        if (logs.length === 0) html += '<p style="color:var(--t3);font-size:12px">아직 활동 내역이 없습니다.</p>';

        // Active BSA contracts
        if (s.bsaContracts && s.bsaContracts.length > 0) {
            html += '<h4 style="font-size:12px;color:var(--t2);margin:12px 0 4px">📋 BSA 계약 현황</h4>';
            s.bsaContracts.forEach(c => {
                const pct = Math.round((1 - c.voyagesLeft / c.totalVoyages) * 100);
                html += `<div class="fin-row" style="flex-wrap:wrap">
                    <span>📋 ${c.id.slice(-6)} | ${(s.route.portNames[c.fromPort]||c.fromPort)}→${(s.route.portNames[c.toPort]||c.toPort)}</span>
                    <span>${c.teuPerVoy}TEU/항차 | $${c.revPerVoy.toLocaleString()}/항차</span>
                </div>
                <div style="background:var(--card2);border-radius:4px;height:6px;margin:2px 0 6px">
                    <div style="background:var(--accent);height:100%;border-radius:4px;width:${pct}%"></div>
                </div>
                <div style="font-size:10px;color:var(--t3);margin-bottom:8px">진행 ${pct}% | 잔여 ${Math.round(c.voyagesLeft)}항차</div>`;
            });
        }

        // Active spot offers
        if (s.spotOffers && s.spotOffers.length > 0) {
            html += '<h4 style="font-size:12px;color:var(--t2);margin:12px 0 4px">🎯 대기 중 스팟 물량</h4>';
            s.spotOffers.forEach(o => {
                html += `<div class="fin-row">
                    <span>${o.icon} ${o.name} (${o.teu}TEU)</span>
                    <span>$${o.revenue.toLocaleString()} | ⏳${o.daysLeft}일</span>
                </div>`;
            });
        }

        document.getElementById('report-view').innerHTML = html;
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
            const realDays = s.startedAt ? Math.floor((Date.now() - s.startedAt) / 86400000) + 1 : s.gameDay;
            ddayEl.textContent = `D+${realDays}`;
        }

        const teu = this.getTEU();
        const cargoTeu = document.getElementById('cargo-teu');
        const cargoPct = document.getElementById('cargo-pct');
        if (cargoTeu) cargoTeu.textContent = `${teu}/${s.ship.capacity} TEU`;
        if (cargoPct) cargoPct.textContent = `(${Math.round(teu / s.ship.capacity * 100)}%)`;

        // Cash warning
        this.checkCashWarning();

        // Update news ticker (every 6 game hours to avoid thrashing)
        if (s.gameHour % 6 === 0) this.updateTicker();
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
            existing.innerHTML = `🚨 <strong>위험!</strong> 현금 $${Math.round(s.cash).toLocaleString()} — 심각한 적자 상태입니다! 저가 화물이라도 무조건 유치하여 현금 흐름을 확보하세요. 쉬운 화주 우선 전략과 메일/전화 위주 활동을 추천합니다.`;
        } else if (s.cash < 0) {
            if (!existing) {
                existing = document.createElement('div');
                existing.id = 'cash-warning-banner';
                existing.className = 'cash-warning';
                const feed = document.querySelector('.activity-feed');
                if (feed) feed.parentNode.insertBefore(existing, feed);
            }
            existing.innerHTML = `⚠️ <strong>주의!</strong> 현금이 적자($${Math.round(s.cash).toLocaleString()})입니다. 영업 활동을 강화하고 저가 화물이라도 적극 유치하여 매출을 늘리세요.`;
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
                items.push({ text: '📈 현금 흐름 개선 추세 — [영업팀] 탭 → [계획 수정] → 타겟전략 "대형 화주 우선" 선택 → [변경 내용 저장]', cls: 'good' });
            } else if (last2[1].profit < last2[0].profit) {
                items.push({ text: '📉 현금 흐름 악화 — [영업팀] 탭 → [계획 수정] → 타겟전략 "저가 화주 우선" 선택 → [변경 내용 저장]', cls: 'warn' });
            }
        }
        if (s.cash < -50000) {
            items.push({ text: '🚨 심각한 적자! [화주] 탭 → 쉬운 화주(⭐1~2) 클릭 → "특별 할인 오퍼" 부스터 적용하세요', cls: 'warn' });
        } else if (s.cash < 0) {
            items.push({ text: '⚠️ 현금 적자 — [영업팀] 탭 → [계획 수정] → 활동배분 "메일/전화 위주" 선택 → [변경 내용 저장]', cls: 'warn' });
        } else if (s.cash > s.debt * 0.5) {
            items.push({ text: '💰 현금 여유 — [화주] 탭 → 대형 화주 클릭 → "우선 선적 보장" 부스터로 점유율 확대', cls: 'good' });
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
            items.push({ text: `💡 [화주] 탭 → ${boostTarget.icon}${boostTarget.name} 클릭 → "선물/접대" 부스터 구매 (점유율 ${Math.round(boostTarget.share)}% → 충성도↑)`, cls: 'info' });
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
            items.push({ text: `🏭 [화주] 탭 → ${largeLow.icon}${largeLow.name} 클릭 → "전담 영업사원 배치" 부스터 구매로 대형 화주 공략`, cls: 'info' });
        }

        // === CONTAINER IMBALANCE ===
        const homeEmpty = (s.ctr[r.ports[0]]?.['20'] || 0) + (s.ctr[r.ports[0]]?.['40'] || 0);
        r.ports.slice(1).forEach(p => {
            const total = (s.ctr[p]?.['20'] || 0) + (s.ctr[p]?.['40'] || 0);
            if (total > 15) {
                const pn = r.portNames[p];
                const sellTo = (r.salesPorts[p]?.sellTo || []).map(d => r.portNames[d]).join('/');
                const portCusts = s.custs[p] || [];
                const bestTarget = portCusts.filter(c => c.share < 20).sort((a, b) => a.difficulty - b.difficulty)[0];
                const navHint = bestTarget ? ` [화주] 탭 → ${bestTarget.icon}${bestTarget.name} 클릭 → 부스터 적용` : ` [영업팀] 탭 → 담당자 → 계획 수정 → 지역 "${pn}" 집중`;
                items.push({ text: `📦 ${pn} 엠티 ${total}개 적체 — ${pn}→${sellTo} 영업 필요!${navHint}`, cls: 'warn' });
            }
            // Suggest repositioning: home has many, foreign has few
            if (total <= 3 && homeEmpty > 20) {
                const pn = r.portNames[p];
                const homeName = r.portNames[r.ports[0]];
                items.push({ text: `🚛 ${pn} 엠티 부족(${total}개)! ${homeName}에서 재배치 → [컨테이너] 탭 → 엠티 재배치 → 출발 "${homeName}" / 도착 "${pn}" → [재배치 실행]`, cls: 'warn' });
            }
        });

        // === LOAD FACTOR ===
        const teu = this.getTEU();
        const lf = Math.round(teu / s.ship.capacity * 100);
        if (s.voyage.status === 'port') {
            const daysLeft = Math.max(0, r.rotationDays - s.voyage.daysSinceLast);
            if (daysLeft <= 2 && lf < 30) {
                items.push({ text: `⏰ 출항 ${daysLeft}일 전 적재율 ${lf}%! [영업팀] 탭 → 각 영업사원 [계획 수정] → 활동배분 "접대 공세" 선택 → [변경 내용 저장]`, cls: 'warn' });
            } else if (lf > 70) {
                items.push({ text: `✅ 적재율 ${lf}% 양호 — [영업팀] 탭 → [계획 수정] → 타겟전략 "대형 화주 우선" 선택 → [변경 내용 저장]`, cls: 'good' });
            }
        }

        // === TRAINING SUGGESTION ===
        if (s.infra.training === 0 && s.cash >= 5000) {
            items.push({ text: '📚 [투자] 탭 → "기본 영업교육" 클릭 ($5,000) → 전 영업사원 성공률 +5%', cls: 'info' });
        }
        if ((s.infra.systems || s.infra.it || 0) === 0 && s.cash >= 8000 && s.stats.totVoy >= 2) {
            items.push({ text: '💻 [투자] 탭 → "견적 자동화" 클릭 ($8,000) → 메일/온라인 영업 시간 -50%', cls: 'info' });
        }

        // === PROSPECT POOL ===
        const totalProspects = Object.values(s.prospectPool || {}).reduce((sum, arr) => sum + arr.length, 0);
        if (totalProspects > 0) {
            const portWithMost = Object.entries(s.prospectPool || {}).sort((a, b) => b[1].length - a[1].length)[0];
            if (portWithMost && portWithMost[1].length > 0) {
                const pn = r.portNames[portWithMost[0]];
                items.push({ text: `🔍 ${pn}에 미발굴 화주 ${portWithMost[1].length}개! [영업팀] 탭 → [계획 수정] 클릭 → ①타겟전략 "특정 항구 집중" → ②"${pn}" 선택 → ③활동배분 "신규 개척" → [변경 내용 저장]`, cls: 'info' });
            }
        } else if (totalProspects === 0 && s.stats.totVoy >= 1) {
            items.push({ text: '🏆 모든 잠재 화주 발굴 완료! [화주] 탭에서 기존 화주 부스터로 점유율 확대', cls: 'good' });
        }

        // === TOP CUSTOMER ===
        let topCust = null, topShare = 0;
        for (const port in s.custs) {
            s.custs[port].forEach(c => {
                if (c.share > topShare) { topShare = c.share; topCust = c; }
            });
        }
        if (topCust && topShare >= 30) {
            items.push({ text: `⭐ [화주] 탭 → ${topCust.icon}${topCust.name} 클릭 → "우선 선적 보장" 부스터로 VIP 유지 (점유율 ${Math.round(topShare)}%)`, cls: 'good' });
        }

        // === SAILING STATUS ===
        if (s.voyage.status === 'sailing') {
            const v = s.voyage;
            const leg = r.legs[Math.min(v.legIdx, r.legs.length - 1)];
            if (leg) {
                items.push({ text: `🚢 ${s.vessel} 항해 중: ${r.portNames[leg.from]} → ${r.portNames[leg.to]} — 항해 중에도 다음 항차 영업을 진행하세요`, cls: 'info' });
            }
        }

        // === CONTAINER FLEET ===
        const totalFleet = r.ports.reduce((sum, p) => sum + (s.ctr[p]?.['20'] || 0) + (s.ctr[p]?.['40'] || 0), 0);
        const bookedCtr = s.bookings.reduce((sum, b) => sum + b.q20 + b.q40, 0);
        if (totalFleet + bookedCtr < s.ship.capacity * 0.8 && s.cash > 10000) {
            items.push({ text: `📦 컨테이너 부족 (${totalFleet + bookedCtr}/${s.ship.capacity}) — [투자] 탭 → "컨테이너 추가 구매" 클릭`, cls: 'info' });
        }

        // === WEATHER ===
        const gd = this.getGameDate();
        const homeW = this.getWeather(r.ports[0]);
        if (homeW.typhoon) {
            items.push({ text: `🌀 태풍 접근 중! ${r.portNames[r.ports[0]]} ${homeW.desc} — 출항 시 연료비 증가 예상`, cls: 'warn' });
        } else if (homeW.wave >= 4) {
            items.push({ text: `🌊 ${r.portNames[r.ports[0]]} 높은 파도 경보 — 항해 시 주의`, cls: 'warn' });
        }

        // === SPOT & BSA ===
        if (s.spotOffers && s.spotOffers.length > 0) {
            const urgent = s.spotOffers.find(o => o.daysLeft <= 1);
            if (urgent) {
                items.push({ text: `🔥 스팟 물량 "${urgent.name}" 마감 임박! ${urgent.teu}TEU $${urgent.revenue.toLocaleString()} — 수락하려면 팝업을 기다리세요`, cls: 'warn' });
            }
        }
        if (s.bsaContracts && s.bsaContracts.length > 0) {
            const totalBsaTEU = s.bsaContracts.reduce((sum, c) => sum + c.teuPerVoy, 0);
            items.push({ text: `📋 BSA 계약 ${s.bsaContracts.length}건 활성 — 항차당 ${totalBsaTEU}TEU 자동 적재 | [보고서] 탭에서 계약 현황 확인`, cls: 'good' });
        }

        // === DEBT ===
        if (s.debt <= 0) {
            items.push({ text: '🎉 무차입 경영 달성! 신규 항로 개설을 검토하세요', cls: 'good' });
        }

        // Fallback
        if (items.length === 0) {
            items.push({ text: `${s.co} V.${String(s.voyage.num).padStart(3,'0')} 정상 운영 중`, cls: 'info' });
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
        const teu = this.getTEU();
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
        const daysLeft = Math.max(0, s.route.rotationDays - s.voyage.daysSinceLast);
        document.getElementById('depart-bookings').textContent = `📦 ${teu} TEU 적재 (${Math.round(teu / s.ship.capacity * 100)}%)`;
        document.getElementById('depart-countdown').textContent = `자동 출항: ${daysLeft}일 후`;
        const shipStatus = document.getElementById('ship-status');
        if (shipStatus) {
            const homePort = s.route.ports[0];
            const w = this.getWeather(homePort);
            shipStatus.textContent = `⚓ 정박 중 — ${w.icon} ${w.desc} ${w.temp}° | 출항까지 ${daysLeft}일`;
        }
    },

    getTEU() {
        return this.state.bookings.reduce((s, b) => s + b.q20 + b.q40 * 2, 0);
    },

    // Convert gameDay to actual date (starting from user's real start date)
    getGameDate() {
        const baseDate = this.state.startedAt ? new Date(this.state.startedAt) : new Date(2025, 0, 1);
        baseDate.setHours(0, 0, 0, 0);
        const d = new Date(baseDate.getTime() + (this.state.gameDay - 1) * 86400000);
        const month = d.getMonth(); // 0-11
        const months = ['1월','2월','3월','4월','5월','6월','7월','8월','9월','10월','11월','12월'];
        const dateStr = `${d.getFullYear()}.${months[month]} ${d.getDate()}일`;
        const season = month <= 1 || month === 11 ? 'winter' : (month <= 4 ? 'spring' : (month <= 8 ? 'summer' : 'autumn'));
        return { date: d, month, dateStr, season, year: d.getFullYear() };
    },

    // Get current weather for a port
    getWeather(portCode) {
        const gd = this.getGameDate();
        const data = WEATHER_DATA[portCode];
        if (!data) return { icon: '☀️', desc: '맑음', wave: 1, temp: 20, rain: false, snow: false, typhoon: false };

        const m = data[gd.month];
        // Deterministic daily seed based on gameDay + port for consistent weather
        const seed = (this.state.gameDay * 31 + portCode.charCodeAt(0)) % 100;
        const rain = seed < m.rain * 100;
        const snow = seed < m.snow * 100 && m.snow > 0;
        const typhoon = m.typhoon > 0 && (seed < m.typhoon * 100);
        const wave = m.wave + (typhoon ? 2 : (rain ? 1 : 0));

        let icon, weatherDesc;
        if (typhoon) { icon = '🌀'; weatherDesc = '태풍 접근'; }
        else if (snow) { icon = '🌨️'; weatherDesc = '눈'; }
        else if (rain && wave >= 3) { icon = '⛈️'; weatherDesc = '폭풍우'; }
        else if (rain) { icon = '🌧️'; weatherDesc = '비'; }
        else if (wave >= 4) { icon = '🌊'; weatherDesc = '높은 파도'; }
        else if (m.rain > 0.3 && seed < 50) { icon = '⛅'; weatherDesc = '흐림'; }
        else { icon = '☀️'; weatherDesc = '맑음'; }

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
        } catch (e) { /* ignore */ }
    },

    loadGame() {
        try {
            const data = localStorage.getItem('kmtc_save');
            if (!data) return;
            const s = JSON.parse(data);
            // Restore route reference
            s.route = ROUTES.find(r => r.id === s.route.id);
            if (!s.route) { this.toast('저장 데이터의 항로를 찾을 수 없습니다', 'err'); return; }

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
                    this.addFeed(`⏰ 오프라인 동안 ${offlineDays}일 경과 — 영업활동이 자동 진행되었습니다.`, 'alert');
                }
            }

            this.startGame();
            this.toast('✅ 저장 데이터를 불러왔습니다', 'ok');
        } catch (e) {
            console.error('Load error:', e);
            this.toast('저장 데이터 오류 — 새 게임을 시작하세요', 'err');
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
            ceo: s.ceo,
            route: s.route.nameKo || s.route.id,
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
        const idx = board.findIndex(b => b.co === entry.co);
        if (idx >= 0) board[idx] = entry;
        else board.push(entry);
        board.sort((a, b) => b.netProfit - a.netProfit);
        localStorage.setItem('kmtc_leaderboard', JSON.stringify(board.slice(0, 100)));

        // Push to Firebase — use sanitized company name as key to prevent duplicates
        if (typeof fbDb !== 'undefined' && fbDb) {
            try {
                const fbKey = entry.co.replace(/[.#$/\[\]]/g, '_');
                fbDb.ref('rankings/' + fbKey).set(entry);
            } catch(e) { /* silent */ }
        }
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
        view.innerHTML = '<p style="color:var(--t3);font-size:12px;text-align:center;padding:20px">🔄 랭킹 불러오는 중...</p>';

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
        html += '<h4 style="font-size:14px;margin:0">🏆 해운왕 랭킹</h4>';
        html += `<span style="font-size:10px;color:var(--t3)">`;
        html += isOnline
            ? `🌐 온라인 — ${rankings.length}개 회사`
            : `📴 오프라인 — ${rankings.length}개 회사 (로컬)`;
        html += `</span></div>`;

        if (rankings.length === 0) {
            html += '<p style="color:var(--t3);font-size:12px;text-align:center;padding:20px">아직 등록된 회사가 없습니다.<br>항차를 완료하면 자동으로 등록됩니다.</p>';
            view.innerHTML = html;
            return;
        }

        // Summary for current company
        const me = rankings.find(b => b.co === myCo);
        if (me) {
            const rank = rankings.indexOf(me) + 1;
            const medal = rank === 1 ? '🥇' : rank === 2 ? '🥈' : rank === 3 ? '🥉' : `#${rank}`;
            html += `<div style="background:linear-gradient(135deg,var(--card),var(--card2));border:1px solid var(--accent);border-radius:8px;padding:10px;margin-bottom:10px">
                <div style="font-size:13px;font-weight:700">${medal} ${me.co} <span style="font-size:10px;color:var(--t2)">(내 회사)</span></div>
                <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:6px;margin-top:6px;font-size:11px">
                    <div>📈 매출<br><strong style="color:var(--green)">$${Math.round(me.totRev).toLocaleString()}</strong></div>
                    <div>💰 순이익<br><strong style="color:${me.netProfit >= 0 ? 'var(--green)' : 'var(--red)'}">$${Math.round(me.netProfit).toLocaleString()}</strong></div>
                    <div>🚢 항차<br><strong>${me.totVoy}회</strong></div>
                </div>
            </div>`;
        }

        // Ranking table
        html += `<div style="font-size:10px;color:var(--t3);margin-bottom:4px">순이익 기준 순위${isOnline ? ' (전체 유저)' : ''}</div>`;
        html += '<div class="ranking-list">';
        rankings.forEach((entry, i) => {
            const isMe = entry.co === myCo;
            const medal = i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `<span style="color:var(--t3)">${i + 1}</span>`;
            const profitColor = entry.netProfit >= 0 ? 'var(--green)' : 'var(--red)';
            html += `<div class="rank-row ${isMe ? 'rank-me' : ''}" style="display:grid;grid-template-columns:30px 1fr 80px 80px 50px;align-items:center;padding:6px 8px;border-bottom:1px solid var(--border);font-size:11px;${isMe ? 'background:var(--accent)15;border-left:3px solid var(--accent)' : ''}">
                <div style="text-align:center;font-size:13px">${medal}</div>
                <div>
                    <div style="font-weight:600">${entry.co}${isMe ? ' <span style="font-size:9px;color:var(--accent)">(나)</span>' : ''}</div>
                    <div style="font-size:9px;color:var(--t3)">${entry.ceo} | ${entry.route} | D${entry.day}</div>
                </div>
                <div style="text-align:right">
                    <div style="color:var(--green);font-size:10px">매출</div>
                    <div>$${this._shortNum(entry.totRev)}</div>
                </div>
                <div style="text-align:right">
                    <div style="color:${profitColor};font-size:10px">순이익</div>
                    <div style="color:${profitColor}">$${this._shortNum(entry.netProfit)}</div>
                </div>
                <div style="text-align:right;font-size:9px;color:var(--t3)">${entry.totVoy}항차<br>LF${entry.avgLF}%</div>
            </div>`;
        });
        html += '</div>';

        if (rankings.length > 1) {
            const best = rankings[0];
            html += '<div style="margin-top:10px;font-size:10px;color:var(--t3);display:flex;justify-content:space-between">';
            html += `<span>🏆 최고: ${best.co} ($${this._shortNum(best.netProfit)})</span>`;
            html += `<span>📊 평균 적재율: ${Math.round(rankings.reduce((s,e) => s + (e.avgLF||0), 0) / rankings.length)}%</span>`;
            html += '</div>';
        }

        // Market share section
        if (s.market && Object.keys(s.market).length > 0) {
            html += '<div style="margin-top:16px;border-top:1px solid var(--border);padding-top:12px">';
            html += '<h4 style="font-size:13px;margin:0 0 8px">📊 항로별 시장 점유율</h4>';

            // Group lanes by route
            const laneGroups = {};
            for (const lane in s.market) {
                const [from] = lane.split('-');
                const routeKey = s.route.ports.includes(from) ? s.route.id : 'other';
                if (!laneGroups[routeKey]) laneGroups[routeKey] = [];
                laneGroups[routeKey].push(lane);
            }

            for (const lane in s.market) {
                const m = s.market[lane];
                const playerShare = m.shares.player || 0;
                if (playerShare <= 0 && m.totalVolume < 100) continue; // skip irrelevant lanes
                const [from, to] = lane.split('-');
                const fromN = this.getPortName(from);
                const toN = this.getPortName(to);

                html += `<div style="margin-bottom:8px">`;
                html += `<div style="display:flex;justify-content:space-between;font-size:10px;margin-bottom:2px">`;
                html += `<span>${fromN} → ${toN}</span>`;
                html += `<span style="color:var(--accent)">주간 ${m.totalVolume}TEU | 내 점유율 ${playerShare}%</span>`;
                html += `</div>`;

                // Share bar
                html += `<div style="display:flex;height:14px;border-radius:3px;overflow:hidden;font-size:8px">`;
                if (playerShare > 0) {
                    html += `<div style="width:${playerShare}%;background:var(--accent);display:flex;align-items:center;justify-content:center;color:white;font-weight:700;min-width:${playerShare > 3 ? '0' : '0'}px">${playerShare > 5 ? playerShare + '%' : ''}</div>`;
                }
                NPC_CARRIERS.forEach(npc => {
                    const sh = m.shares[npc.id] || 0;
                    if (sh > 0) {
                        html += `<div style="width:${sh}%;background:${npc.color};display:flex;align-items:center;justify-content:center;color:white;opacity:.7;min-width:0" title="${npc.name} ${sh}%">${sh > 8 ? npc.name.substring(0, 4) : ''}</div>`;
                    }
                });
                html += `</div></div>`;
            }

            // NPC carrier legend
            html += '<div style="display:flex;flex-wrap:wrap;gap:6px;margin-top:8px;font-size:9px">';
            html += `<span style="display:flex;align-items:center;gap:2px"><span style="width:8px;height:8px;background:var(--accent);border-radius:2px;display:inline-block"></span> 내 회사</span>`;
            NPC_CARRIERS.forEach(npc => {
                html += `<span style="display:flex;align-items:center;gap:2px"><span style="width:8px;height:8px;background:${npc.color};border-radius:2px;display:inline-block"></span> ${npc.name}</span>`;
            });
            html += '</div></div>';
        }

        // Refresh button
        html += `<div style="text-align:center;margin-top:10px">
            <button class="btn-sm" onclick="Game._fbRankingCache=null;Game.renderRanking()" style="font-size:10px;padding:4px 12px;background:var(--card2)">🔄 새로고침</button>
        </div>`;

        view.innerHTML = html;
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
        if (mins < 60) return `${mins}분 전`;
        const hrs = Math.floor(mins / 60);
        if (hrs < 24) return `${hrs}시간 전`;
        return `${Math.floor(hrs / 24)}일 전`;
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
            <div style="font-size:10px;color:var(--t3);margin-top:4px">마지막 저장: ${saveTime}</div>
        </div>
        <div style="display:flex;flex-direction:column;gap:8px">
            <button class="btn-primary" onclick="Game.manualSave()" style="width:100%">
                💾 수동 저장
            </button>
            <button class="btn-primary" onclick="Game.saveAndExit()" style="width:100%;background:#b71c1c">
                🚪 저장 후 종료
            </button>
            <button class="btn-sm" onclick="Game.closeSaveMenu()" style="width:100%;background:var(--card2);margin-top:4px">
                ▶ 게임으로 돌아가기
            </button>
        </div>
        <div style="border-top:1px solid var(--border);margin-top:12px;padding-top:12px">
            <button class="btn-sm" id="btn-newco-init" onclick="document.getElementById('btn-newco-init').style.display='none';document.getElementById('newco-confirm').style.display='block'" style="width:100%;background:var(--card2);color:var(--t3);font-size:11px">
                🏢 새 회사 설립 (현재 회사 포기)
            </button>
            <div id="newco-confirm" style="display:none;margin-top:8px;padding:10px;background:rgba(255,23,68,.08);border:1px solid rgba(255,23,68,.3);border-radius:8px">
                <div style="font-size:11px;color:#ff5252;margin-bottom:8px;line-height:1.4">
                    ⚠️ 현재 회사 <strong>${s.co}</strong>의 모든 데이터가 삭제됩니다.<br>
                    랭킹 기록은 유지됩니다. 이 작업은 되돌릴 수 없습니다.
                </div>
                <div style="display:flex;gap:8px">
                    <button class="btn-sm" onclick="Game.startNewCompany()" style="flex:1;background:#b71c1c;color:white;font-weight:700">확인 — 새로 시작</button>
                    <button class="btn-sm" onclick="document.getElementById('btn-newco-init').style.display='';document.getElementById('newco-confirm').style.display='none'" style="flex:1;background:var(--card2)">취소</button>
                </div>
            </div>
        </div>
        <div style="font-size:9px;color:var(--t3);text-align:center;margin-top:10px;line-height:1.5">
            게임은 매일 자동 저장됩니다.<br>
            브라우저를 닫아도 자동 저장됩니다.<br>
            다음 접속 시 오프라인 진행이 반영됩니다.
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
        this.toast('기존 회사가 정리되었습니다. 새 회사를 설립하세요!', 'ok');
    },

    manualSave() {
        this.saveGame();
        this.toast('💾 저장 완료!', 'ok');
    },

    saveAndExit() {
        this.saveGame();
        this.stopTick();
        this.closeModal('modal-savemenu');
        this.showScreen('screen-title');
        document.getElementById('btn-load').style.display = 'inline-block';
        this.toast('💾 저장 후 종료되었습니다', 'ok');
    },

    toast(msg, type = '') {
        const box = document.getElementById('toast-box');
        const t = document.createElement('div');
        t.className = `toast ${type}`;
        t.textContent = msg;
        box.appendChild(t);
        setTimeout(() => t.remove(), 3000);
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

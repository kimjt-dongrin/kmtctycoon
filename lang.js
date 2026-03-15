// ==================== KMTC Shipping Tycoon — i18n System ====================
// Language: ko (Korean), ja (Japanese)

let CURRENT_LANG = localStorage.getItem('kmtc_lang') || 'ko';

const TEXTS = {
// ========== TITLE SCREEN ==========
'title.newGame': { ko: '🚢 새 회사 설립', ja: '🚢 新会社設立' },
'title.loadGame': { ko: '📂 이어하기', ja: '📂 続きから' },
'title.cloudLoad': { ko: '☁️ 클라우드 불러오기', ja: '☁️ クラウドロード' },
'title.cloudLoadInput': { ko: '회사명 입력', ja: '会社名を入力' },
'title.cloudLoadBtn': { ko: '불러오기', ja: '読み込む' },
'title.cloudLoadHint': { ko: 'PC에서 저장한 회사명을 정확히 입력하세요', ja: 'PCで保存した会社名を正確に入力してください' },
'title.subtitle': { ko: '해운왕의 길', ja: '海運王への道' },
'title.version': { ko: 'v5 — Market Competition', ja: 'v5 — Market Competition' },
'title.langSelect': { ko: '🌐 언어 / Language', ja: '🌐 言語 / Language' },

// ========== ROUTE SELECT ==========
'route.title': { ko: '항로 선택', ja: '航路選択' },
'route.subtitle': { ko: '첫 위클리 서비스를 선택하세요', ja: '最初のウィークリーサービスを選択してください' },
'route.difficulty': { ko: '난이도', ja: '難易度' },
'route.vessel': { ko: '선박', ja: '船舶' },
'route.rotation': { ko: '로테이션', ja: 'ローテーション' },
'route.investment': { ko: '투자금', ja: '投資額' },
'route.select': { ko: '이 항로 선택 →', ja: 'この航路を選択 →' },
'route.ports': { ko: '기항지', ja: '寄港地' },
'route.days': { ko: '일', ja: '日' },

// ========== SETUP ==========
'setup.title': { ko: '회사 설립', ja: '会社設立' },
'setup.company': { ko: '회사명', ja: '会社名' },
'setup.ceo': { ko: '대표이사', ja: '代表取締役' },
'setup.vessel': { ko: '모선명', ja: '本船名' },
'setup.companyPH': { ko: '예: 동방해운', ja: '例: 東邦海運' },
'setup.ceoPH': { ko: '예: 홍길동', ja: '例: 山田太郎' },
'setup.vesselPH': { ko: '예: KMTC BUSAN', ja: '例: KMTC TOKYO' },
'setup.next': { ko: '다음 →', ja: '次へ →' },
'setup.route': { ko: '항로', ja: '航路' },
'setup.ship': { ko: '선박', ja: '船舶' },
'setup.schedule': { ko: '항정', ja: '航海スケジュール' },

// ========== DRAFT ==========
'draft.title': { ko: '영업팀 드래프트', ja: '営業チームドラフト' },
'draft.subtitle': { ko: '9명의 후보 중 5명을 선택하세요 — 나머지는 스카우트 풀로 이동', ja: '9名の候補から5名を選択 — 残りはスカウトプールへ' },
'draft.go': { ko: '🚀 이 팀으로 시작', ja: '🚀 このチームでスタート' },
'draft.select5': { ko: '5명 선택', ja: '5名選択' },
'draft.negotiation': { ko: '협상', ja: '交渉' },
'draft.faceToFace': { ko: '대면', ja: '対面' },
'draft.digital': { ko: 'IT', ja: 'IT' },
'draft.relationship': { ko: '관계', ja: '関係' },
'draft.moreNeeded': { ko: '명 더 선택', ja: '名追加選択' },

// ========== HUD ==========
'hud.cash': { ko: '현금', ja: '現金' },
'hud.debt': { ko: '부채', ja: '負債' },
'hud.menu': { ko: '메뉴', ja: 'メニュー' },
'hud.breaking': { ko: '📰 속보', ja: '📰 速報' },

// ========== TABS ==========
'tab.sales': { ko: '👥 영업팀', ja: '👥 営業チーム' },
'tab.customers': { ko: '🏭 화주', ja: '🏭 荷主' },
'tab.containers': { ko: '📦 컨테이너', ja: '📦 コンテナ' },
'tab.invest': { ko: '💰 투자', ja: '💰 投資' },
'tab.report': { ko: '📋 보고서', ja: '📋 レポート' },
'tab.finance': { ko: '📊 재무', ja: '📊 財務' },
'tab.ranking': { ko: '🏆 순위', ja: '🏆 ランキング' },

// ========== SPEED ==========
'speed.1x': { ko: '▶1x', ja: '▶1x' },
'speed.2x': { ko: '▶▶2x', ja: '▶▶2x' },
'speed.3x': { ko: '▶▶▶3x', ja: '▶▶▶3x' },

// ========== SHIP STATUS ==========
'ship.docked': { ko: '⚓ 정박 중 — 영업 진행 중', ja: '⚓ 停泊中 — 営業活動中' },
'ship.sailing': { ko: '🚢 항해 중', ja: '🚢 航海中' },
'ship.loading': { ko: '적재 중', ja: '積載中' },
'ship.teu': { ko: 'TEU', ja: 'TEU' },

// ========== DEPART ==========
'depart.loaded': { ko: 'TEU 적재', ja: 'TEU積載' },
'depart.countdown': { ko: '자동 출항:', ja: '自動出港:' },
'depart.daysLeft': { ko: '일 후', ja: '日後' },
'depart.btn': { ko: '🚢 출항', ja: '🚢 出港' },
'depart.sailing': { ko: '🚢 항해 중...', ja: '🚢 航海中...' },
'depart.noCargo': { ko: '적재된 화물이 없습니다!', ja: '積載貨物がありません！' },
'depart.postpone': { ko: '⚠️ 출항일이지만 적재 화물이 없어 출항 연기!', ja: '⚠️ 出港日ですが積載貨物がなく出港延期！' },
'depart.auto': { ko: '🚢 정기 출항 시간! 자동 출항합니다.', ja: '🚢 定期出港時刻！自動出港します。' },

// ========== ACTIVITY FEED ==========
'feed.title': { ko: '📋 실시간 영업활동', ja: '📋 リアルタイム営業活動' },
'feed.success': { ko: '✅ 성공!', ja: '✅ 成功！' },
'feed.fail': { ko: '❌ 실패', ja: '❌ 失敗' },
'feed.spotPass': { ko: '📋 스팟 물량 패스.', ja: '📋 スポット貨物パス。' },

// ========== SALES TEAM ==========
'sales.globalStrategy': { ko: '📋 전체 영업 전략', ja: '📋 全体営業戦略' },
'sales.planTitle': { ko: '📋 업무 지시', ja: '📋 業務指示' },
'sales.planFor': { ko: '영업 계획', ja: '営業計画' },
'sales.targetStrategy': { ko: '📍 타겟 전략', ja: '📍 ターゲット戦略' },
'sales.focusPort': { ko: '📍 집중 항구', ja: '📍 集中港' },
'sales.targetCarrier': { ko: '⚔️ 공략 대상 선사', ja: '⚔️ ターゲット船社' },
'sales.activityDist': { ko: '📊 활동 배분 (8시간 근무)', ja: '📊 活動配分（8時間勤務）' },
'sales.saveStrategy': { ko: '💾 변경 내용 저장', ja: '💾 変更内容を保存' },
'sales.close': { ko: '닫기', ja: '閉じる' },
'sales.strategySaved': { ko: '💾 전략 변경 저장 완료!', ja: '💾 戦略変更保存完了！' },
'sales.globalApplied': { ko: '전체 전략 적용 완료', ja: '全体戦略適用完了' },
'sales.resting': { ko: '😴 휴식 중', ja: '😴 休憩中' },
'sales.waiting': { ko: '⏳ 대기', ja: '⏳ 待機' },
'sales.editPlan': { ko: '계획 수정', ja: '計画変更' },
'sales.fire': { ko: '해고', ja: '解雇' },
'sales.fireConfirm': { ko: '정말 해고하시겠습니까?', ja: '本当に解雇しますか？' },
'sales.minRequired': { ko: '최소 1명의 영업사원이 필요합니다!', ja: '最低1名の営業担当者が必要です！' },
'sales.fired': { ko: '해고됨 → 스카우트 풀 이동', ja: '解雇 → スカウトプールへ移動' },
'sales.skill': { ko: '스킬', ja: 'スキル' },
'sales.negotiationTip': { ko: '협상력: 전화 영업 성공률 UP', ja: '交渉力: 電話営業成功率UP' },
'sales.faceTip': { ko: '대면력: 고객 방문 성공률 UP', ja: '対面力: 顧客訪問成功率UP' },
'sales.digitalTip': { ko: 'IT역량: 메일 발송 성공률 UP', ja: 'IT能力: メール営業成功率UP' },
'sales.relationTip': { ko: '관계력: 접대 성공률 UP', ja: '関係力: 接待成功率UP' },
'sales.salary': { ko: '월급', ja: '月給' },

// ========== STRATEGIES ==========
'strategy.lowestShare': { ko: '점유율 낮은 순', ja: 'シェア低い順' },
'strategy.largestFirst': { ko: '대형 화주 우선', ja: '大口荷主優先' },
'strategy.easiestFirst': { ko: '쉬운 화주 우선', ja: '攻略しやすい荷主優先' },
'strategy.cheapCargo': { ko: '저가 화주 우선', ja: '低価格荷主優先' },
'strategy.portFocus': { ko: '특정 항구 집중', ja: '特定港集中' },
'strategy.stealCargo': { ko: '경쟁사 물량 빼앗기', ja: '競合他社の貨物奪取' },

// ========== ACTIVITIES ==========
'activity.email': { ko: '메일', ja: 'メール' },
'activity.phone': { ko: '전화', ja: '電話' },
'activity.visit': { ko: '방문', ja: '訪問' },
'activity.entertain': { ko: '접대', ja: '接待' },
'activity.negotiate': { ko: '교섭', ja: '交渉' },
'activity.prospect': { ko: '개척', ja: '開拓' },

// ========== ACTIVITY PRESETS ==========
'preset.balanced': { ko: '균형', ja: 'バランス' },
'preset.emailPhone': { ko: '메일/전화 위주', ja: 'メール・電話中心' },
'preset.visitMain': { ko: '방문 위주', ja: '訪問中心' },
'preset.entertainMain': { ko: '접대 공세', ja: '接待攻勢' },
'preset.pioneer': { ko: '신규 개척', ja: '新規開拓' },

// ========== CUSTOMERS ==========
'cust.loyalty': { ko: '충성도', ja: 'ロイヤルティ' },
'cust.share': { ko: '점유율', ja: 'シェア' },
'cust.difficulty': { ko: '난이도', ja: '難易度' },
'cust.maxVol': { ko: '최대', ja: '最大' },
'cust.locked': { ko: '🔒 접근 불가', ja: '🔒 アクセス不可' },
'cust.lockedMsg': { ko: '🔒 접근 불가 — 영업 교육 투자가 필요합니다', ja: '🔒 アクセス不可 — 営業教育への投資が必要です' },
'cust.boost': { ko: '🔥 부스트', ja: '🔥 ブースト' },
'cust.alreadyActive': { ko: '이미 적용 중입니다', ja: 'すでに適用中です' },
'cust.noMoney': { ko: '현금이 부족합니다!', ja: '現金が不足しています！' },
'cust.trustDown': { ko: '화주 신뢰도 하락!', ja: '荷主の信頼度低下！' },
'cust.trustUp': { ko: '전체 화주 신뢰도 상승!', ja: '全荷主の信頼度上昇！' },

// ========== CUSTOMER BOOSTERS ==========
'boost.dedicated': { ko: '전담 영업사원 배치', ja: '専任営業担当配置' },
'boost.dedicatedEffect': { ko: '성공률 +30%, 점유율 회복 2배', ja: '成功率+30%、シェア回復2倍' },
'boost.priority': { ko: '우선 선적 보장', ja: '優先船積保証' },
'boost.priorityEffect': { ko: '점유율 회복 3배 + 충성도 +10', ja: 'シェア回復3倍 + ロイヤルティ+10' },
'boost.discount': { ko: '특별 할인 오퍼', ja: '特別割引オファー' },
'boost.discountEffect': { ko: '성공률 +20%, 점유율 회복 2배', ja: '成功率+20%、シェア回復2倍' },
'boost.gift': { ko: '선물/접대 강화', ja: 'ギフト・接待強化' },
'boost.giftEffect': { ko: '충성도 +15, 성공률 +10%', ja: 'ロイヤルティ+15、成功率+10%' },

// ========== CONTAINERS ==========
'ctr.title': { ko: '📍 항구별 컨테이너 분포', ja: '📍 港別コンテナ分布' },
'ctr.home': { ko: '🏠', ja: '🏠' },
'ctr.congestion': { ko: '⚠ 적체', ja: '⚠ 滞留' },
'ctr.none': { ko: '컨테이너 없음 — 공급 필요', ja: 'コンテナなし — 供給が必要' },
'ctr.distRatio': { ko: '📊 항구별 분포 비율', ja: '📊 港別分布比率' },
'ctr.repo': { ko: '🚛 엠티 재배치 (리포지셔닝)', ja: '🚛 空コンテナ再配置（リポジショニング）' },
'ctr.repoDesc': { ko: '엠티가 많은 항구에서 부족한 항구로 공컨테이너를 이동합니다. 비용이 발생하며 다음 항차 출항 시 이동됩니다.', ja: '空コンテナの多い港から不足している港へ移動します。費用が発生し、次の航海出港時に実行されます。' },
'ctr.from': { ko: '출발', ja: '出発' },
'ctr.to': { ko: '도착', ja: '到着' },
'ctr.qty': { ko: '수량', ja: '数量' },
'ctr.execute': { ko: '재배치 실행', ja: '再配置実行' },
'ctr.pending': { ko: '📋 대기 중인 재배치 (다음 출항 시 실행)', ja: '📋 待機中の再配置（次の出港時に実行）' },
'ctr.cancel': { ko: '취소', ja: 'キャンセル' },
'ctr.autoOnDepart': { ko: '출항 시 자동 이동', ja: '出港時に自動移動' },
'ctr.samePort': { ko: '출발/도착 항구가 같습니다', ja: '出発/到着港が同じです' },
'ctr.enterQty': { ko: '수량을 입력하세요', ja: '数量を入力してください' },
'ctr.shortage20': { ko: "에 20' 엠티 부족", ja: "で20'空コンテナ不足" },
'ctr.shortage40': { ko: "에 40' 엠티 부족", ja: "で40'空コンテナ不足" },
'ctr.noSpace': { ko: '❌ 선복 부족! 적재 공간이 없습니다.', ja: '❌ 船腹不足！積載スペースがありません。' },
'ctr.arrived': { ko: '🚛 엠티 도착:', ja: '🚛 空コンテナ到着:' },
'ctr.placed': { ko: '배치 완료', ja: '配置完了' },

// ========== INVESTMENT ==========
'inv.training': { ko: '📚 전사 영업 교육', ja: '📚 全社営業研修' },
'inv.trainingAll': { ko: '전 직원 적용', ja: '全社員対象' },
'inv.personalTraining': { ko: '🎯 개인별 특화 교육', ja: '🎯 個人別特化研修' },
'inv.personalTrainingSub': { ko: '영업사원별 구매', ja: '営業担当者別に購入' },
'inv.personalTrainingDesc': { ko: '각 영업사원에게 개별 교육을 제공하여 능력을 강화합니다.', ja: '各営業担当者に個別研修を提供し能力を強化します。' },
'inv.systems': { ko: '🏗️ 경영 시스템', ja: '🏗️ 経営システム' },
'inv.systemsSub': { ko: 'IT · 물류 · 경영 인프라', ja: 'IT・物流・経営インフラ' },
'inv.office': { ko: '🏢 지사 설립', ja: '🏢 支社設立' },
'inv.ship': { ko: '🚢 선박 업그레이드', ja: '🚢 船舶アップグレード' },
'inv.shipCap': { ko: '선복량', ja: '船腹量' },
'inv.shipExpand': { ko: 'TEU로 확대', ja: 'TEUに拡大' },
'inv.ctrBuy': { ko: '📦 컨테이너 구매', ja: '📦 コンテナ購入' },
'inv.ctrBuyDesc': { ko: '구매 항구에 바로 배치됩니다. 해외 항구는 비싸지만 재배치 비용이 절약됩니다.', ja: '購入港にすぐ配置されます。海外港は高いですがリポジショニング費用が節約できます。' },
'inv.ctrCurrent': { ko: '현재', ja: '現在' },
'inv.ctrPrice': { ko: '가격', ja: '価格' },
'inv.recruit': { ko: '👥 영업사원 스카우트', ja: '👥 営業担当スカウト' },
'inv.recruitCurrent': { ko: '현재', ja: '現在' },
'inv.recruitFire': { ko: '해고', ja: '解雇' },
'inv.recruitPool': { ko: '스카우트 풀', ja: 'スカウトプール' },
'inv.allRecruited': { ko: '모든 영업사원이 채용되었습니다.', ja: '全ての営業担当者が採用されました。' },
'inv.unlockAt': { ko: '해금 조건: 누적 매출', ja: '解放条件: 累計売上' },
'inv.currentRev': { ko: '현재 매출', ja: '現在の売上' },
'inv.newRoute': { ko: '🌏 신규항로 개척 (자사선 투입)', ja: '🌏 新規航路開拓（自社船投入）' },
'inv.newRouteDesc': { ko: '자사 선박·컨테이너·해외사무실을 갖추고 새로운 항로를 개척합니다.', ja: '自社船舶・コンテナ・海外事務所を備え、新航路を開拓します。' },
'inv.slotCharter': { ko: '🚢 슬롯 차터 (경쟁사 선복 구매)', ja: '🚢 スロットチャーター（他社船腹購入）' },
'inv.slotCharterDesc': { ko: '경쟁사 모선의 선복을 구매하여 새 항로에 진출합니다. 자사 선박 없이 영업 가능!', ja: '他社本船の船腹を購入し新航路に進出。自社船なしで営業可能！' },
'inv.bankLoan': { ko: '🏦 은행 대출', ja: '🏦 銀行融資' },
'inv.promo': { ko: '📢 프로모션', ja: '📢 プロモーション' },
'inv.invest': { ko: '투자', ja: '投資' },
'inv.buy': { ko: '구매', ja: '購入' },
'inv.establish': { ko: '설립', ja: '設立' },
'inv.scout': { ko: '스카우트', ja: 'スカウト' },
'inv.debtOver': { ko: '부채 한도 초과!', ja: '負債限度超過！' },
'inv.revNotMet': { ko: '매출 조건 미달!', ja: '売上条件未達！' },
'inv.alreadyActive': { ko: '이미 운영 중!', ja: 'すでに運営中！' },
'inv.noFunds': { ko: '자금 부족!', ja: '資金不足！' },
'inv.operating': { ko: '운영 중', ja: '運営中' },
'inv.active': { ko: '활성', ja: 'アクティブ' },
'inv.locked': { ko: '🔒', ja: '🔒' },
'inv.detail': { ko: '▼ 상세', ja: '▼ 詳細' },
'inv.collapse': { ko: '▲ 접기', ja: '▲ 閉じる' },

// ========== ROUTE INVESTMENT DETAIL ==========
'inv.investSheet': { ko: '📋 투자 내역서', ja: '📋 投資明細書' },
'inv.shipItem': { ko: '🚢 선박', ja: '🚢 船舶' },
'inv.ctrItem': { ko: '📦 컨테이너', ja: '📦 コンテナ' },
'inv.officeItem': { ko: '🏢 사무실 개설', ja: '🏢 事務所開設' },
'inv.totalInvest': { ko: '총 투자금액', ja: '総投資額' },
'inv.fuelPerDay': { ko: '연료비/일', ja: '燃料費/日' },
'inv.portFees': { ko: '항비/기항', ja: '港費/寄港' },
'inv.weeklyFixed': { ko: '고정비/주', ja: '固定費/週' },
'inv.loanTitle': { ko: '🏦 선박금융 + 항로 개척', ja: '🏦 船舶ファイナンス + 航路開拓' },
'inv.totalInvestLabel': { ko: '총 투자금', ja: '総投資額' },
'inv.equity': { ko: '자기자본', ja: '自己資本' },
'inv.loanAmt': { ko: '대출금', ja: '融資額' },
'inv.annualRate': { ko: '대출 연이율', ja: '年利率' },
'inv.monthlyRepay': { ko: '월 상환금', ja: '月返済額' },
'inv.monthlyInterest': { ko: '월 이자', ja: '月利息' },
'inv.loanExec': { ko: '🏦 대출 실행 + 항로 개척', ja: '🏦 融資実行 + 航路開拓' },
'inv.equityShort': { ko: '⚠️ 자기자본 부족', ja: '⚠️ 自己資本不足' },
'inv.slotLoan': { ko: '🏦 대출로 슬롯 차터', ja: '🏦 融資でスロットチャーター' },
'inv.shortage': { ko: '부족', ja: '不足' },
'inv.perVoyage': { ko: '항차당', ja: '航次あたり' },

// ========== WITHDRAWAL ==========
'withdraw.btn': { ko: '⚠ 철수', ja: '⚠ 撤退' },
'withdraw.collapse': { ko: '▲ 접기', ja: '▲ 閉じる' },
'withdraw.routeTitle': { ko: '⚠️ 항로 철수 — 손익 분석', ja: '⚠️ 航路撤退 — 損益分析' },
'withdraw.scTitle': { ko: '⚠️ 슬롯차터 철수 — 손익 분석', ja: '⚠️ スロットチャーター撤退 — 損益分析' },
'withdraw.shipSale': { ko: '🚢 선박 매각', ja: '🚢 船舶売却' },
'withdraw.marketRate': { ko: '시가', ja: '時価' },
'withdraw.ctrDispose': { ko: '📦 컨테이너 처분', ja: '📦 コンテナ処分' },
'withdraw.officeClose': { ko: '🏢 사무실 정리', ja: '🏢 事務所整理' },
'withdraw.deposit': { ko: '보증금', ja: '保証金' },
'withdraw.loanRepay': { ko: '🏦 잔여 대출 조기상환', ja: '🏦 残存融資早期返済' },
'withdraw.slotCancel': { ko: '🚢 슬롯 계약 해지 위약금 환급', ja: '🚢 スロット契約解約違約金返金' },
'withdraw.netRecovery': { ko: '순 회수 금액', ja: '純回収額' },
'withdraw.warnMarket': { ko: '해당 항로의 화주 관계·시장 점유율이 초기화됩니다.', ja: 'この航路の荷主関係・市場シェアが初期化されます。' },
'withdraw.warnOffice': { ko: '관련 사무실이 폐쇄되고 컨테이너가 처분됩니다.', ja: '関連事務所が閉鎖され、コンテナが処分されます。' },
'withdraw.warnSlot': { ko: '슬롯 사용료 부담이 즉시 사라집니다.', ja: 'スロット使用料の負担が即座になくなります。' },
'withdraw.confirmRoute': { ko: '🚫 항로 철수 확정', ja: '🚫 航路撤退確定' },
'withdraw.confirmSC': { ko: '🚫 슬롯차터 철수 확정', ja: '🚫 スロットチャーター撤退確定' },

// ========== FINANCE ==========
'fin.pnl': { ko: '📊 손익계산서 (누적)', ja: '📊 損益計算書（累計）' },
'fin.revenue': { ko: '매출 (운임 수입)', ja: '売上（運賃収入）' },
'fin.voyageCost': { ko: '항해 비용 (연료+항비)', ja: '航海費用（燃料+港費）' },
'fin.salaryCost': { ko: '인건비', ja: '人件費' },
'fin.perMonth': { ko: '월', ja: '月' },
'fin.otherCost': { ko: '투자/기타 비용', ja: '投資/その他費用' },
'fin.netProfit': { ko: '순이익', ja: '純利益' },
'fin.profitMargin': { ko: '이익률', ja: '利益率' },
'fin.voyagePnl': { ko: '🚢 항차별 채산', ja: '🚢 航次別採算' },
'fin.voyage': { ko: '항차', ja: '航次' },
'fin.rev': { ko: '매출', ja: '売上' },
'fin.exp': { ko: '비용', ja: '費用' },
'fin.profit': { ko: '손익', ja: '損益' },
'fin.loadFactor': { ko: '적재율', ja: '積載率' },
'fin.freightRev': { ko: '운임 매출', ja: '運賃売上' },
'fin.fuelPort': { ko: '⛽ 연료비 + 항비', ja: '⛽ 燃料費 + 港費' },
'fin.weeklyFixed': { ko: '🏢 주간 고정비', ja: '🏢 週間固定費' },
'fin.interestRepay': { ko: '🏦 이자 + 상환', ja: '🏦 利息 + 返済' },
'fin.maintenance': { ko: '🔧 정비 + 급유', ja: '🔧 整備 + 給油' },
'fin.salesActivity': { ko: '👥 영업활동비 (접대/방문 등)', ja: '👥 営業活動費（接待/訪問等）' },
'fin.boosterCost': { ko: '🚀 화주 부스터', ja: '🚀 荷主ブースター' },
'fin.autoRepo': { ko: '🚛 엠티 회수 (자동)', ja: '🚛 空コンテナ回収（自動）' },
'fin.manualRepo': { ko: '🚛 엠티 재배치 (수동)', ja: '🚛 空コンテナ再配置（手動）' },
'fin.pnlTrend': { ko: '📈 누적 손익 추이', ja: '📈 累計損益推移' },
'fin.kpi': { ko: '📋 경영 KPI', ja: '📋 経営KPI' },
'fin.debtRatio': { ko: '부채 비율 (부채/매출)', ja: '負債比率（負債/売上）' },
'fin.activeCust': { ko: '활성 화주', ja: 'アクティブ荷主' },
'fin.salesPerf': { ko: '👤 영업사원별 실적', ja: '👤 営業担当者別実績' },
'fin.cases': { ko: '건', ja: '件' },
'fin.successRate': { ko: '성공', ja: '成功' },
'fin.recentLog': { ko: '📋 최근 활동 내역', ja: '📋 最近の活動履歴' },
'fin.noActivity': { ko: '아직 활동 내역이 없습니다.', ja: 'まだ活動履歴がありません。' },
'fin.cashLabel': { ko: '보유 현금', ja: '保有現金' },
'fin.debtLabel': { ko: '남은 부채', ja: '残存負債' },
'fin.cumRev': { ko: '누적 매출', ja: '累計売上' },
'fin.cumExp': { ko: '누적 비용', ja: '累計費用' },
'fin.cumProfit': { ko: '누적 이익', ja: '累計利益' },

// ========== RANKING ==========
'rank.title': { ko: '🏆 해운왕 랭킹', ja: '🏆 海運王ランキング' },
'rank.online': { ko: '🌐 온라인', ja: '🌐 オンライン' },
'rank.offline': { ko: '📴 오프라인', ja: '📴 オフライン' },
'rank.companies': { ko: '개 회사', ja: '社' },
'rank.local': { ko: '로컬', ja: 'ローカル' },
'rank.noCompanies': { ko: '아직 등록된 회사가 없습니다.\n항차를 완료하면 자동으로 등록됩니다.', ja: 'まだ登録された会社がありません。\n航次を完了すると自動的に登録されます。' },
'rank.byProfit': { ko: '순이익 기준 순위', ja: '純利益基準ランキング' },
'rank.allUsers': { ko: '전체 유저', ja: '全ユーザー' },
'rank.me': { ko: '나', ja: '自分' },
'rank.myCompany': { ko: '내 회사', ja: '自社' },
'rank.rev': { ko: '매출', ja: '売上' },
'rank.profit': { ko: '순이익', ja: '純利益' },
'rank.voyages': { ko: '항차', ja: '航次' },
'rank.elapsed': { ko: '경과', ja: '経過' },
'rank.best': { ko: '🏆 최고', ja: '🏆 最高' },
'rank.avgLF': { ko: '📊 평균 적재율', ja: '📊 平均積載率' },
'rank.marketShare': { ko: '📊 항로별 시장 점유율', ja: '📊 航路別市場シェア' },
'rank.weekly': { ko: '주간', ja: '週間' },
'rank.myShare': { ko: '내 점유율', ja: '自社シェア' },
'rank.refresh': { ko: '🔄 새로고침', ja: '🔄 更新' },

// ========== VOYAGE REPORT ==========
'voy.complete': { ko: '항차 완료!', ja: '航次完了！' },
'voy.revenue': { ko: '수익', ja: '収益' },
'voy.expense': { ko: '비용', ja: '費用' },
'voy.noCargo': { ko: '적재 화물 없음', ja: '積載貨物なし' },
'voy.salesStart': { ko: '영업 시작! 다음 출항까지', ja: '営業開始！次の出港まで' },

// ========== SAVE/MENU ==========
'menu.title': { ko: '☰ 메뉴', ja: '☰ メニュー' },
'menu.save': { ko: '💾 저장', ja: '💾 セーブ' },
'menu.cloudSave': { ko: '☁️ 클라우드 저장', ja: '☁️ クラウドセーブ' },
'menu.cloudDesc1': { ko: '여기서 "☁️ 클라우드 저장" 클릭', ja: 'ここで「☁️ クラウドセーブ」をクリック' },
'menu.cloudDesc2': { ko: '다른 기기에서 "☁️ 클라우드 불러오기" 클릭', ja: '他のデバイスで「☁️ クラウドロード」をクリック' },
'menu.saveExit': { ko: '저장 후 종료', ja: 'セーブして終了' },
'menu.newCompany': { ko: '새 회사 (리셋)', ja: '新会社（リセット）' },
'menu.close': { ko: '닫기', ja: '閉じる' },
'menu.language': { ko: '🌐 언어 변경', ja: '🌐 言語変更' },
'menu.langKo': { ko: '🇰🇷 한국어', ja: '🇰🇷 韓国語' },
'menu.langJa': { ko: '🇯🇵 일본어', ja: '🇯🇵 日本語' },
'save.complete': { ko: '💾 저장 완료!', ja: '💾 セーブ完了！' },
'save.exitDone': { ko: '💾 저장 후 종료되었습니다', ja: '💾 セーブして終了しました' },
'save.noData': { ko: '저장할 데이터 없음', ja: '保存するデータがありません' },
'save.cloudOK': { ko: '☁️ 클라우드 저장 완료!', ja: '☁️ クラウドセーブ完了！' },
'save.cloudFail': { ko: '☁️ 저장 실패:', ja: '☁️ セーブ失敗:' },
'save.fbNoConnect': { ko: '☁️ Firebase 연결 안됨', ja: '☁️ Firebase未接続' },
'save.offline': { ko: '오프라인 상태입니다', ja: 'オフライン状態です' },
'save.cloudNotFound': { ko: '☁️ 클라우드 세이브를 찾을 수 없습니다', ja: '☁️ クラウドセーブが見つかりません' },
'save.loadFail': { ko: '☁️ 불러오기 실패', ja: '☁️ 読み込み失敗' },
'save.routeNotFound': { ko: '저장 데이터의 항로를 찾을 수 없습니다', ja: 'セーブデータの航路が見つかりません' },
'save.loaded': { ko: '✅ 저장 데이터를 불러왔습니다', ja: '✅ セーブデータを読み込みました' },
'save.loadError': { ko: '저장 데이터 오류 — 새 게임을 시작하세요', ja: 'セーブデータエラー — 新しいゲームを開始してください' },
'save.resetDone': { ko: '기존 회사가 정리되었습니다. 새 회사를 설립하세요!', ja: '既存の会社が整理されました。新しい会社を設立してください！' },
'save.companyRequired': { ko: '회사명을 입력해주세요! (랭킹에 표시됩니다)', ja: '会社名を入力してください！（ランキングに表示されます）' },
'save.launched': { ko: '🏢 회사 설립 완료! 영업사원들이 활동을 시작합니다.', ja: '🏢 会社設立完了！営業担当者が活動を開始します。' },
'save.rankLoading': { ko: '🔄 랭킹 불러오는 중...', ja: '🔄 ランキング読み込み中...' },

// ========== WEATHER ==========
'weather.clear': { ko: '맑음', ja: '晴れ' },
'weather.cloudy': { ko: '흐림', ja: '曇り' },
'weather.rain': { ko: '비', ja: '雨' },
'weather.storm': { ko: '폭풍우', ja: '暴風雨' },
'weather.snow': { ko: '눈', ja: '雪' },
'weather.typhoon': { ko: '태풍 접근', ja: '台風接近' },
'weather.highWave': { ko: '높은 파도', ja: '高波' },
'weather.rough': { ko: '⚠ 거친 바다', ja: '⚠ 荒れた海' },
'weather.waveHigh': { ko: '파도 높음', ja: '波高し' },
'weather.good': { ko: '양호', ja: '良好' },

// ========== MONTHS ==========
'month.1': { ko: '1월', ja: '1月' },
'month.2': { ko: '2월', ja: '2月' },
'month.3': { ko: '3월', ja: '3月' },
'month.4': { ko: '4월', ja: '4月' },
'month.5': { ko: '5월', ja: '5月' },
'month.6': { ko: '6월', ja: '6月' },
'month.7': { ko: '7월', ja: '7月' },
'month.8': { ko: '8월', ja: '8月' },
'month.9': { ko: '9월', ja: '9月' },
'month.10': { ko: '10월', ja: '10月' },
'month.11': { ko: '11월', ja: '11月' },
'month.12': { ko: '12월', ja: '12月' },

// ========== DIFFICULTY ==========
'diff.easy': { ko: '쉬움', ja: '易しい' },
'diff.medium': { ko: '보통', ja: '普通' },
'diff.hard': { ko: '어려움', ja: '難しい' },
'diff.veryHard': { ko: '매우 어려움', ja: '非常に難しい' },

// ========== MARKET / COMPETITION ==========
'market.otherCarrier': { ko: '기타 선사', ja: 'その他船社' },
'market.severe': { ko: '심각', ja: '深刻' },
'market.danger': { ko: '위험', ja: '危険' },
'market.caution': { ko: '주의', ja: '注意' },
'market.neglectWarn': { ko: '⚠️ 장기간 영업관리 소홀! 경쟁사들이 화주를 빼앗아가고 있습니다!', ja: '⚠️ 長期間営業管理怠慢！競合他社が荷主を奪っています！' },
'market.spotExpired': { ko: '스팟 물량 마감! 기회를 놓쳤습니다.', ja: 'スポット貨物締切！機会を逃しました。' },
'market.allProspects': { ko: '🏆 모든 잠재 화주를 발굴했습니다!', ja: '🏆 すべての潜在荷主を発掘しました！' },

// ========== LOAN ==========
'loan.currentDebt': { ko: '현재 부채', ja: '現在の負債' },
'loan.history': { ko: '대출 이력', ja: '融資履歴' },
'loan.amount': { ko: '💰 대출금', ja: '💰 融資額' },
'loan.rate': { ko: '📊 연이율', ja: '📊 年利率' },
'loan.fee': { ko: '🏷️ 수수료', ja: '🏷️ 手数料' },
'loan.net': { ko: '실수령', ja: '手取り' },
'loan.monthInt': { ko: '월 이자', ja: '月利息' },
'loan.debtLimit': { ko: '부채한도', ja: '負債限度' },
'loan.overLimit': { ko: '부채한도를 초과합니다!', ja: '負債限度を超過しています！' },
'loan.available': { ko: '이용 가능', ja: '利用可能' },
'loan.overLimitWarn': { ko: '⚠️ 부채한도 초과 — 대출 불가', ja: '⚠️ 負債限度超過 — 融資不可' },
'loan.btn': { ko: '대출', ja: '融資' },

// ========== PROMO ==========
'promo.active': { ko: '진행 중', ja: '実施中' },
'promo.until': { ko: '까지', ja: 'まで' },
'promo.run': { ko: '실행', ja: '実行' },

// ========== TIER LABELS ==========
'tier.legend': { ko: '전설', ja: '伝説' },
'tier.high': { ko: '고급', ja: '上級' },
'tier.mid': { ko: '중급', ja: '中級' },

// ========== COMMON ==========
'common.ok': { ko: '확인', ja: '確認' },
'common.cancel': { ko: '취소', ja: 'キャンセル' },
'common.close': { ko: '닫기', ja: '閉じる' },
'common.yes': { ko: '예', ja: 'はい' },
'common.no': { ko: '아니오', ja: 'いいえ' },
'common.day': { ko: '일', ja: '日' },
'common.week': { ko: '주', ja: '週' },
'common.month': { ko: '월', ja: '月' },
'common.won': { ko: '원', ja: '円' },
'common.ships': { ko: '척', ja: '隻' },
'common.people': { ko: '명', ja: '名' },
'common.places': { ko: '곳', ja: 'ヶ所' },
'common.times': { ko: '회', ja: '回' },
'common.port': { ko: '항', ja: '港' },
'common.balanced': { ko: '균형잡힌 능력, 특별한 약점 없음', ja: 'バランスの取れた能力、特別な弱点なし' },
'common.unit': { ko: '개', ja: '個' },
'common.immediately': { ko: '즉시/영구', ja: '即時/永久' },
'common.free': { ko: '무료', ja: '無料' },
'common.change': { ko: '변경', ja: '変更' },
'common.stamina': { ko: '체력', ja: '体力' },
'common.minutesAgo': { ko: '{0}분 전', ja: '{0}分前' },
'common.hoursAgo': { ko: '{0}시간 전', ja: '{0}時間前' },
'common.daysAgo': { ko: '{0}일 전', ja: '{0}日前' },

// ========== SALES DETAIL ==========
'sales.stats': { ko: '📊 능력치', ja: '📊 能力値' },
'sales.strengthLabel': { ko: '강점:', ja: '強み:' },
'sales.weaknessLabel': { ko: '약점:', ja: '弱点:' },
'sales.performance': { ko: '📈 실적 (이번 항차)', ja: '📈 実績（今航次）' },
'sales.booked': { ko: '수주', ja: '受注' },
'sales.renamePH': { ko: '이름 변경', ja: '名前変更' },
'sales.applyGlobal': { ko: '🔄 전체 전략과 동일하게', ja: '🔄 全体戦略と同じに' },

// ========== RECRUIT / FIRE ==========
'recruit.complete': { ko: '영입 완료!', ja: '採用完了！' },
'recruit.joined': { ko: '🎉 {0} 영업사원 합류! (⭐{1})', ja: '🎉 {0} 営業担当合流！（⭐{1}）' },
'fire.complete': { ko: '{0} 퇴사 처리 (퇴직금 ${1})', ja: '{0} 退職処理（退職金 ${1}）' },
'fire.feed': { ko: '👋 {0} 퇴사. 퇴직금 ${1} 지급', ja: '👋 {0} 退職。退職金 ${1} 支払い' },

// ========== ACTIVITY FEED MESSAGES ==========
'feed.restComplete': { ko: '{0} {1} 휴식 완료! (체력 {2}%)', ja: '{0} {1} 休憩完了！（体力 {2}%）' },
'feed.actStart': { ko: '{0} {1}: {2}{3} {4} 시작', ja: '{0} {1}: {2}{3} {4} 開始' },
'feed.prospectStart': { ko: '{0} {1}: 🔍 {2} 신규 화주 발굴 시작', ja: '{0} {1}: 🔍 {2} 新規荷主発掘開始' },
'feed.fatigued': { ko: '⚠️ {0} 체력 부족! 휴식이 필요합니다.', ja: '⚠️ {0} 体力不足！休息が必要です。' },
'feed.skillUp': { ko: '🎉 {0} 스킬 레벨업! Lv.{1}', ja: '🎉 {0} スキルレベルアップ！Lv.{1}' },
'feed.skillUpToast': { ko: '{0} 레벨업! ⭐{1}', ja: '{0} レベルアップ！⭐{1}' },
'feed.prospectFound': { ko: '🎯 {0} {1}: {2}에서 신규 화주 {3}{4} 발굴! 영업 개시 가능!', ja: '🎯 {0} {1}: {2}で新規荷主 {3}{4} 発掘！営業開始可能！' },
'feed.prospectToast': { ko: '🎯 신규 화주 발굴! {0}{1}', ja: '🎯 新規荷主発掘！{0}{1}' },
'feed.prospectFail': { ko: '{0} {1}: {2} 신규 개척 ❌ 유망 화주를 찾지 못했습니다', ja: '{0} {1}: {2} 新規開拓 ❌ 有望な荷主が見つかりませんでした' },
'feed.prospectLog': { ko: '{0} 신규 개척', ja: '{0} 新規開拓' },
'feed.booked': { ko: '📦 수주! {0}{1} {2}→{3} {4}TEU ${5}', ja: '📦 受注！{0}{1} {2}→{3} {4}TEU ${5}' },
'feed.bookedToast': { ko: '{0} 수주! {1}TEU', ja: '{0} 受注！{1}TEU' },
'feed.erosion': { ko: '⚠️ {0}이 {1} 물량을 잠식 중! (-{2}%)', ja: '⚠️ {0}が {1} 貨物を蚕食中！(-{2}%)' },
'feed.portFocusToast': { ko: '{0} {1} → {2} 집중 영업 배치!', ja: '{0} {1} → {2} 集中営業配置！' },
'feed.portFocusFeed': { ko: '📍 {0}을(를) {1} 집중 영업에 배치했습니다.', ja: '📍 {0}を {1} 集中営業に配置しました。' },

// ========== SPOT CARGO ==========
'spot.title': { ko: '{0} 스팟 화물 발생!', ja: '{0} スポット貨物発生！' },
'spot.details': { ko: '📦 {0} TEU | 💰 예상 수익 ${1}', ja: '📦 {0} TEU | 💰 予想収益 ${1}' },
'spot.deadline': { ko: '⏳ 마감까지 <strong>{0}일</strong>', ja: '⏳ 締切まで <strong>{0}日</strong>' },
'spot.accept': { ko: '✅ 수주! (${0})', ja: '✅ 受注！(${0})' },
'spot.decline': { ko: '❌ 패스', ja: '❌ パス' },
'spot.booked': { ko: '🎯 스팟 수주! {0}{1} {2}TEU ${3}', ja: '🎯 スポット受注！{0}{1} {2}TEU ${3}' },
'spot.bookedToast': { ko: '스팟 수주! {0}TEU ${1}', ja: 'スポット受注！{0}TEU ${1}' },
'spot.expired': { ko: '⏰ 스팟 물량 "{0}" 마감! 기회를 놓쳤습니다.', ja: '⏰ スポット貨物 "{0}" 締切！機会を逃しました。' },

// ========== BSA ==========
'bsa.title': { ko: '📋 BSA 입찰 안건!', ja: '📋 BSA 入札案件！' },
'bsa.difficulty': { ko: '난이도:', ja: '難易度:' },
'bsa.voyDetail': { ko: '📦 항차당 {0} TEU × {1}항차 ({2}개월)', ja: '📦 航次あたり {0} TEU × {1}航次（{2}ヶ月）' },
'bsa.revPerVoy': { ko: '💰 항차당 예상 수익 ${0}', ja: '💰 航次あたり予想収益 ${0}' },
'bsa.totalValue': { ko: '📊 총 계약 규모 약 ${0}', ja: '📊 総契約規模 約 ${0}' },
'bsa.fullPrice': { ko: '💪 정가 입찰 (승률 {0}%)', ja: '💪 定価入札（勝率 {0}%）' },
'bsa.discounted': { ko: '📉 10% 할인 입찰 (승률 {0}%)', ja: '📉 10% 割引入札（勝率 {0}%）' },
'bsa.decline': { ko: '❌ 입찰 포기', ja: '❌ 入札放棄' },
'bsa.won': { ko: '🏆 BSA 낙찰! 항차당 {0}TEU × {1}항차 계약 체결!', ja: '🏆 BSA 落札！航次あたり {0}TEU × {1}航次 契約締結！' },
'bsa.wonToast': { ko: 'BSA 계약 체결! ${0}', ja: 'BSA 契約締結！${0}' },
'bsa.lost': { ko: '😞 BSA 입찰 실패... 경쟁사에 낙찰되었습니다.', ja: '😞 BSA 入札失敗... 競合他社に落札されました。' },
'bsa.lostToast': { ko: 'BSA 입찰 실패', ja: 'BSA 入札失敗' },
'bsa.autoLoad': { ko: '📋 BSA 계약 물량 {0}TEU 자동 적재 (잔여 {1}항차)', ja: '📋 BSA 契約貨物 {0}TEU 自動積載（残余 {1}航次）' },
'bsa.status': { ko: '📋 BSA 계약 현황', ja: '📋 BSA 契約状況' },
'bsa.progress': { ko: '진행 {0}% | 잔여 {1}항차', ja: '進行 {0}% | 残余 {1}航次' },
'bsa.voyTerms': { ko: '{0}TEU/항차 | ${1}/항차', ja: '{0}TEU/航次 | ${1}/航次' },

// ========== CONTAINER DETAIL ==========
'ctr.empty': { ko: '📥 엠티 (비어있음)', ja: '📥 空コンテナ（空き）' },
'ctr.waiting': { ko: '📤 선적 대기', ja: '📤 積載待機' },
'ctr.excessWarn': { ko: '⚠ 공컨테이너 과다 — {0}→{1} 영업 강화 필요', ja: '⚠ 空コンテナ過多 — {0}→{1} 営業強化が必要' },
'ctr.unitPrice': { ko: '단가: 컨테이너당 $200', ja: '単価: コンテナあたり $200' },
'ctr.currentCash': { ko: '현재 현금:', ja: '現在の現金:' },
'ctr.repoBooked': { ko: '🚛 {0}→{1} 엠티 {2}개 재배치 예약!', ja: '🚛 {0}→{1} 空コン {2}個 再配置予約！' },
'ctr.repoFeed': { ko: '🚛 엠티 재배치: {0}→{1} 20\'×{2}+40\'×{3}', ja: '🚛 空コン再配置: {0}→{1} 20\'×{2}+40\'×{3}' },
'ctr.repoCancelled': { ko: '재배치 취소 — ${0} 환불', ja: '再配置キャンセル — ${0} 返金' },
'ctr.congestionFeed': { ko: '📢 {0}에 빈 컨테이너 {1}대 적체! {0}발 영업이 필요합니다.', ja: '📢 {0}に空コンテナ {1}個滞留！{0}発の営業が必要です。' },

// ========== INSURANCE & ACCIDENTS ==========
'accident.repair': { ko: '🔧 수리비', ja: '🔧 修理費' },
'accident.claim': { ko: '📋 화주 클레임', ja: '📋 荷主クレーム' },
'accident.insurance': { ko: '🛡️ 보험 보상', ja: '🛡️ 保険補償' },
'accident.actual': { ko: '💸 실제 부담', ja: '💸 実際負担' },
'accident.shipCond': { ko: '선박 상태: {0}% → {1}% (-{2}%)', ja: '船体状態: {0}% → {1}% (-{2}%)' },
'accident.confirm': { ko: '확인 (비용 차감됨)', ja: '確認（費用差引済み）' },
'accident.feed': { ko: '{0} {1}! 비용 ${2} (보험 ${3} 보상)', ja: '{0} {1}！費用 ${2}（保険 ${3} 補償）' },
'crisis.cashAfter': { ko: '지원 후 잔액', ja: '支援後残高' },
'accident.hullToast': { ko: '선체 상태: {0}%', ja: '船体状態: {0}%' },
'accident.cargoLoss': { ko: '⚠️ 화물 파손! {0} -${1}', ja: '⚠️ 貨物破損！{0} -${1}' },
'insurance.premium': { ko: '🛡️ 월간 보험료 ${0} 납부 (상태:{1} | 사고{2}건)', ja: '🛡️ 月間保険料 ${0} 納付（状態:{1} | 事故{2}件）' },

// ========== MILESTONE ==========
'milestone.achieved': { ko: '🏆 마일스톤 달성: {0}! +${1}', ja: '🏆 マイルストーン達成: {0}！+${1}' },

// ========== VOYAGE ==========
'voyage.unload': { ko: '⬇️ {0} 하역: {1}TEU | ${2}', ja: '⬇️ {0} 荷役: {1}TEU | ${2}' },
'voyage.progress': { ko: '진행 {0}%', ja: '進行 {0}%' },
'voyage.typhoon': { ko: '🌀 태풍 {0} 접근 중!', ja: '🌀 台風 {0} 接近中！' },
'voyage.docked': { ko: '⚓ 정박', ja: '⚓ 停泊' },
'voyage.repoCost': { ko: '⚠️ <strong>엠티 포지셔닝 비용 ${0} 발생!</strong>', ja: '⚠️ <strong>空コンポジショニング費用 ${0} 発生！</strong>' },
'voyage.repoDetail': { ko: '<strong>{0}</strong>에서 공컨테이너 {1}개 회수 (비용 ${2})', ja: '<strong>{0}</strong>で空コンテナ {1}個回収（費用 ${2}）' },
'voyage.segmentSales': { ko: '💡 <strong>{0}→{1}</strong> 구간 영업 강화 필요', ja: '💡 <strong>{0}→{1}</strong> 区間営業強化が必要' },
'voyage.targetCust': { ko: '🎯 타겟 화주: {0}', ja: '🎯 ターゲット荷主: {0}' },
'voyage.assign': { ko: '📍 배치', ja: '📍 配置' },
'voyage.average': { ko: '📊 항차 평균', ja: '📊 航次平均' },
'voyage.detail': { ko: 'V.{0} 상세 채산', ja: 'V.{0} 詳細採算' },
'voyage.cargoQty': { ko: '적재량', ja: '積載量' },

// ========== GEOGRAPHY ==========
'geo.china': { ko: '중 국', ja: '中 国' },
'geo.korea': { ko: '한국', ja: '韓国' },
'geo.japan': { ko: '일본', ja: '日本' },
'geo.vietnam': { ko: '베트남', ja: 'ベトナム' },
'geo.thailand': { ko: '태국', ja: 'タイ' },
'geo.indonesia': { ko: '인도네시아', ja: 'インドネシア' },
'geo.india': { ko: '인도', ja: 'インド' },
'geo.malaysia': { ko: '말레이시아', ja: 'マレーシア' },

// ========== MAP LEGEND ==========
'legend.mainShip': { ko: '모선', ja: '本船' },
'legend.slot': { ko: '슬롯', ja: 'スロット' },
'legend.own': { ko: '자사', ja: '自社' },

// ========== FINANCE DETAIL ==========
'fin.revPerTEU': { ko: 'TEU당 평균 매출', ja: 'TEUあたり平均売上' },
'fin.totalTEU': { ko: '총 운송 TEU', ja: '総運送TEU' },
'fin.monthlySalary': { ko: '월 인건비', ja: '月間人件費' },
'fin.totalAct': { ko: '총 활동', ja: '総活動' },
'fin.actSuccess': { ko: '성공률', ja: '成功率' },
'fin.actRevenue': { ko: '수주 금액', ja: '受注金額' },
'fin.actCost': { ko: '영업 비용', ja: '営業費用' },
'fin.spotWaiting': { ko: '🎯 대기 중 스팟 물량', ja: '🎯 待機中スポット貨物' },

// ========== LOAN/INVEST MESSAGES ==========
'loan.executed': { ko: '🏦 {0} 실행! +${1} (수수료 ${2})', ja: '🏦 {0} 実行！+${1}（手数料 ${2}）' },
'loan.feed': { ko: '🏦 {0} ${1} 대출 실행 (연 {2}%)', ja: '🏦 {0} ${1} 融資実行（年 {2}%）' },
'promo.executed': { ko: '{0} {1} 실행!', ja: '{0} {1} 実行！' },
'promo.startFeed': { ko: '📢 {0} 프로모션 시작! ({1}일간)', ja: '📢 {0} プロモーション開始！（{1}日間）' },
'inv.deploy': { ko: '{0}에 배치', ja: '{0}に配置' },
'inv.scStarted': { ko: '🚢 {0} 슬롯 차터 개시! (사무실 {1}곳 개설)', ja: '🚢 {0} スロットチャーター開始！（事務所 {1}ヶ所開設）' },
'inv.scFeed': { ko: '🚢 {0} {1} 선복 구매! 🏢 사무실 {2}곳 개설 (${3})', ja: '🚢 {0} {1} 船腹購入！🏢 事務所 {2}ヶ所開設（${3}）' },
'inv.scLoan': { ko: '슬롯차터 대출 ({0})', ja: 'スロットチャーター融資（{0}）' },
'inv.scLoanFeed': { ko: '🏦 대출 ${0} → 🚢 {1} 개시! 🏢 사무실 {2}곳', ja: '🏦 融資 ${0} → 🚢 {1} 開始！🏢 事務所 {2}ヶ所' },
'inv.routeLoan': { ko: '선박금융 ({0})', ja: '船舶ファイナンス（{0}）' },
'inv.routeLoanFeed': { ko: '🏦 대출 ${0} 실행 → 🌏 {1} 항로 개척!', ja: '🏦 融資 ${0} 実行 → 🌏 {1} 航路開拓！' },
'inv.routeStart': { ko: '🌏 {0} 자사선 취항! 🏢 사무실 {1}곳 개설', ja: '🌏 {0} 自社船就航！🏢 事務所 {1}ヶ所開設' },
'inv.trainingDone': { ko: '{0} Lv.{1} 완료!', ja: '{0} Lv.{1} 完了！' },
'inv.trainingFeed': { ko: '🏗️ {0} 레벨 {1} 투자 완료!', ja: '🏗️ {0} レベル {1} 投資完了！' },
'inv.trainingLabel': { ko: '영업 교육', ja: '営業研修' },
'inv.systemsLabel': { ko: '경영 시스템', ja: '経営システム' },
'inv.itLabel': { ko: 'IT 시스템', ja: 'ITシステム' },
'inv.personalDone': { ko: '{0} — {1} 완료! (스킬 {2})', ja: '{0} — {1} 完了！（スキル {2}）' },
'inv.personalFeed': { ko: '🎯 {0} 개인교육 Lv.{1} 완료 → 스킬 {2}', ja: '🎯 {0} 個人研修 Lv.{1} 完了 → スキル {2}' },
'inv.slotVessel': { ko: '{0} 모선 선복 {1} TEU', ja: '{0} 本船船腹 {1} TEU' },
'inv.slotRotation': { ko: '{0} | {1}일 로테이션', ja: '{0} | {1}日ローテーション' },
'inv.slotCostDetail': { ko: '💰 슬롯비: ${0} + 🏢 사무실 {1}곳: ${2}', ja: '💰 スロット費: ${0} + 🏢 事務所 {1}ヶ所: ${2}' },
'inv.loanSlotExec': { ko: '🏦 대출 실행 + 슬롯 차터 (${0})', ja: '🏦 融資実行 + スロットチャーター（${0}）' },
'inv.notActiveSlot': { ko: '운영 중인 슬롯차터가 아닙니다.', ja: '運営中のスロットチャーターではありません。' },
'inv.notActiveRoute': { ko: '운영 중인 항로가 아닙니다.', ja: '運営中の航路ではありません。' },
'withdraw.scDone': { ko: '🚫 {0} 철수 완료! {1}', ja: '🚫 {0} 撤退完了！{1}' },
'withdraw.scFeed': { ko: '🚫 {0} 슬롯차터 철수 — {1} ${2}', ja: '🚫 {0} スロットチャーター撤退 — {1} ${2}' },
'withdraw.routeDone': { ko: '🚫 {0} 항로 철수 완료! {1}', ja: '🚫 {0} 航路撤退完了！{1}' },
'withdraw.routeFeed': { ko: '🚫 {0} 자사선 철수 — 선박 매각 +${1} | 순 {2} ${3}', ja: '🚫 {0} 自社船撤退 — 船舶売却 +${1} | 純 {2} ${3}' },
'withdraw.recovery': { ko: '회수', ja: '回収' },
'withdraw.loss': { ko: '손실', ja: '損失' },
'sc.voyComplete': { ko: '🚢 {0} V.{1} 완료 — {2}TEU ({3}%) {4} ${5}', ja: '🚢 {0} V.{1} 完了 — {2}TEU（{3}%）{4} ${5}' },
'route.voyComplete': { ko: '🌏 {0} V.{1} 완료 — {2}TEU ({3}%) {4} ${5}', ja: '🌏 {0} V.{1} 完了 — {2}TEU（{3}%）{4} ${5}' },
'ctr.repoFrom': { ko: '엠티 {0}', ja: '空コン {0}' },
'ctr.estimatedCost': { ko: '예상 비용:', ja: '予想費用:' },
'ctr.monthlyRepay': { ko: '24개월 상환', ja: '24ヶ月返済' },
'ctr.repayNote': { ko: '* 24개월 분할상환 | 수수료 ${0}', ja: '* 24ヶ月分割返済 | 手数料 ${0}' },
'spot.daysLeft': { ko: '⏳{0}일', ja: '⏳{0}日' },
'cust.totalMaxVol': { ko: '📦 총 최대 물량: 20\'×{0} / 40\'×{1}', ja: '📦 総最大貨物: 20\'×{0} / 40\'×{1}' },

// ========== CUSTOMER DETAIL ==========
'cust.destAllocation': { ko: '🚢 도착지별 물량 배분', ja: '🚢 到着地別貨物配分' },
'cust.boosters': { ko: '🚀 영업 부스터', ja: '🚀 営業ブースター' },
'cust.totalMax': { ko: '📦 총 최대 물량:', ja: '📦 総最大貨物:' },
'cust.boostApplied': { ko: '{0} {1}에 {2} {3} 적용!', ja: '{0} {1}に {2} {3} 適用！' },
'cust.boostFeed': { ko: '🚀 {0}에 {1} 부스트 적용 (${2})', ja: '🚀 {0}に {1} ブースト適用（${2}）' },

// ========== EROSION ANALYSIS ==========
'erosion.title': { ko: '경쟁사 잠식 분석', ja: '競合他社蚕食分析' },
'erosion.decrease': { ko: '최고 대비 감소', ja: '最高比減少' },
'erosion.trend': { ko: '점유율 추이', ja: 'シェア推移' },
'erosion.lossPerVoy': { ko: '항차당 손실', ja: '航次あたり損失' },
'erosion.recentTrend': { ko: '📉 최근 점유율 추이', ja: '📉 最近のシェア推移' },
'erosion.recentEvents': { ko: '최근 10일간 잠식 {0}회 | 잠식된 물량: ~{1} TEU/항차', ja: '最近10日間の蚕食 {0}回 | 失われた貨物: ~{1} TEU/航次' },
'erosion.recovery': { ko: '💡 회복 제안 (예상 소요: ~{0}일)', ja: '💡 回復提案（所要見込: ~{0}日）' },
'erosion.effect': { ko: '효과:', ja: '効果:' },
'erosion.duration': { ko: '{0}일간', ja: '{0}日間' },
'erosion.totalCost': { ko: '총 예상 비용: ${0} | 우선순위 순으로 실행을 권장합니다', ja: '総予想費用: ${0} | 優先順位順の実行を推奨します' },
'erosion.high': { ko: '높음', ja: '高' },
'erosion.veryHigh': { ko: '매우 높음 (장기)', ja: '非常に高（長期）' },
'erosion.mid': { ko: '중간', ja: '中' },
'erosion.midLong': { ko: '중간 (장기)', ja: '中（長期）' },
'erosion.highLong': { ko: '높음 (장기)', ja: '高（長期）' },

// ========== RECOVERY SUGGESTIONS ==========
'recovery.officeDesc': { ko: '해당 항구 영업 효율 +30% (영구 효과)', ja: 'この港の営業効率+30%（永久効果）' },
'recovery.training': { ko: '영업 교육 Lv.{0}', ja: '営業研修 Lv.{0}' },
'recovery.trainingDesc': { ko: '전체 영업사원 성과 향상 + 고난이도 화주 접근', ja: '全営業担当者の成果向上 + 高難度荷主アクセス' },
'recovery.portFocus': { ko: '{0} 집중 영업 전략 배치', ja: '{0} 集中営業戦略配置' },
'recovery.portFocusDesc': { ko: '영업사원 1명을 해당 항구 전담 배치', ja: '営業担当者1名をこの港に専任配置' },
'recovery.itSystem': { ko: 'IT 시스템 Lv.{0}', ja: 'ITシステム Lv.{0}' },
'recovery.itDesc': { ko: '전체 영업 효율 향상', ja: '全体営業効率向上' },

// ========== SAVE/CLOUD ==========
'save.cloudLoaded': { ko: '☁️ "{0}" 클라우드에서 불러왔습니다!', ja: '☁️ 「{0}」をクラウドから読み込みました！' },
'save.offlineProgress': { ko: '⏰ 오프라인 동안 {0}일 경과 — 영업활동이 자동 진행되었습니다.', ja: '⏰ オフライン中に {0}日経過 — 営業活動が自動進行されました。' },
'save.lastSave': { ko: '마지막 저장:', ja: '最終セーブ:' },
'save.resetWarn': { ko: '⚠️ 현재 회사 <strong>{0}</strong>의 모든 데이터가 삭제됩니다.<br>랭킹 기록은 유지됩니다. 이 작업은 되돌릴 수 없습니다.', ja: '⚠️ 現在の会社 <strong>{0}</strong>のすべてのデータが削除されます。<br>ランキング記録は維持されます。この操作は元に戻せません。' },

// ========== TICKER / NEWS ==========
'ticker.danger': { ko: '🚨 <strong>위험!</strong> 현금 ${0} — 심각한 적자 상태입니다! 저가 화물이라도 무조건 유치하여 현금 흐름을 확보하세요. 쉬운 화주 우선 전략과 메일/전화 위주 활동을 추천합니다.', ja: '🚨 <strong>危険！</strong> 現金 ${0} — 深刻な赤字状態です！低価格貨物でも無条件に獲得して現金流を確保してください。簡単な荷主優先戦略とメール/電話中心活動をお勧めします。' },
'ticker.warning': { ko: '⚠️ <strong>주의!</strong> 현금이 적자(${0})입니다. 영업 활동을 강화하고, 저가 화물이라도 적극적으로 수주하여 매출을 늘리세요.', ja: '⚠️ <strong>注意！</strong> 現金が赤字（${0}）です。営業活動を強化し、低価格貨物でも積極的に獲得して売上を増やしてください。' },
'ticker.improving': { ko: '📈 현금 흐름 개선 추세 — [영업팀] 탭 → [계획 수정] → 타겟전략 "대형 화주 우선" 선택 → [변경 내용 저장]', ja: '📈 現金フロー改善傾向 — [営業チーム] タブ → [計画変更] → ターゲット戦略「大口荷主優先」選択 → [変更内容を保存]' },
'ticker.declining': { ko: '📉 현금 흐름 악화 — [영업팀] 탭 → [계획 수정] → 타겟전략 "저가 화주 우선" 선택 → [변경 내용 저장]', ja: '📉 現金フロー悪化 — [営業チーム] タブ → [計画変更] → ターゲット戦略「低価格荷主優先」選択 → [変更内容を保存]' },
'ticker.severeLoss': { ko: '🚨 심각한 적자! [화주] 탭 → 쉬운 화주(⭐1~2) 클릭 → "특별 할인 오퍼" 부스터 적용하세요', ja: '🚨 深刻な赤字！[荷主] タブ → 簡単な荷主(⭐1~2) クリック → 「特別割引オファー」ブースター適用してください' },
'ticker.cashNeg': { ko: '⚠️ 현금 적자 — [영업팀] 탭 → [계획 수정] → 활동배분 "메일/전화 위주" 선택 → [변경 내용 저장]', ja: '⚠️ 現金赤字 — [営業チーム] タブ → [計画変更] → 活動配分「メール/電話中心」選択 → [変更内容を保存]' },
'ticker.cashPos': { ko: '💰 현금 여유 — [화주] 탭 → 대형 화주 클릭 → "우선 선적 보장" 부스터로 점유율 확대', ja: '💰 現金余裕 — [荷主] タブ → 大口荷主クリック → 「優先船積保証」ブースターでシェア拡大' },
'ticker.boostHint': { ko: '💡 [화주] 탭 → {0}{1} 클릭 → "선물/접대" 부스터 구매 → 충성도 UP → 물량 확보 가능', ja: '💡 [荷主] タブ → {0}{1} クリック → 「ギフト・接待強化」ブースター購入 → ロイヤルティUP → 貨物確保可能' },
'ticker.largeCust': { ko: '🏭 [화주] 탭 → {0}{1} 클릭 → "전담 영업사원 배치" 부스터 구매로 대형 화주 공략', ja: '🏭 [荷主] タブ → {0}{1} クリック → 「専任営業担当配置」ブースター購入で大口荷主攻略' },
'ticker.ctrExcess': { ko: '📦 {0} 엠티 {1}개 적체 — [컨테이너] 탭 → 재배치로 비용 절감 또는 [영업팀] → 해당 항구 집중 영업', ja: '📦 {0} 空コン {1}個滞留 — [コンテナ] タブ → 再配置で費用削減 または [営業チーム] → この港の集中営業' },
'ticker.ctrShortage': { ko: '📦 {0} 엠티 부족({1}개)! [컨테이너] 탭 → 여유 항구에서 재배치 또는 [투자] → 컨테이너 구매', ja: '📦 {0} 空コン不足（{1}個）！[コンテナ] タブ → 余裕のある港から再配置 または [投資] → コンテナ購入' },
'ticker.lowLF': { ko: '⚠️ 적재율 {0}%! [영업팀] → 전체 영업 전략 "쉬운 화주 우선" 변경 + 활동 "메일/전화 위주"로 수주량 확보', ja: '⚠️ 積載率 {0}%！[営業チーム] → 全体営業戦略「攻略しやすい荷主優先」変更 + 活動「メール/電話中心」で受注量確保' },
'ticker.goodLF': { ko: '📦 적재율 {0}% 양호 — [영업팀] → 전체 전략 "대형 화주 우선" 변경으로 단가 개선 추진', ja: '📦 積載率 {0}% 良好 — [営業チーム] → 全体戦略「大口荷主優先」変更で単価改善推進' },
'ticker.training': { ko: '📚 [투자] 탭 → "기본 영업교육" 구매 → 전 직원 성과 UP → 고난이도 화주(⭐3~4) 영업 가능', ja: '📚 [投資] タブ → 「基本営業研修」購入 → 全社員成果UP → 高難度荷主(⭐3~4) 営業可能' },
'ticker.automation': { ko: '💻 [투자] 탭 → "견적 자동화" 구매 → 메일 성공률 1.8배 + CRM 혜택', ja: '💻 [投資] タブ → 「見積自動化」購入 → メール成功率1.8倍 + CRM特典' },
'ticker.prospect': { ko: '🔍 {0}에 미발굴 화주 {1}곳! [영업팀] → 활동배분 "신규 개척" 변경 → 잠재 화주 발굴', ja: '🔍 {0}に未開拓荷主 {1}社！[営業チーム] → 活動配分「新規開拓」変更 → 潜在荷主発掘' },
'ticker.allProspect': { ko: '🏆 모든 잠재 화주 발굴 완료! [화주] 탭에서 부스터로 점유율 확대에 집중하세요', ja: '🏆 すべての潜在荷主を開拓完了！[荷主] タブでブースターによるシェア拡大に集中してください' },
'ticker.vipHint': { ko: '⭐ [화주] 탭 → {0}{1} 클릭 → "우선 선적 보장" 부스터로 VIP 유지 → 경쟁사 잠식 방지', ja: '⭐ [荷主] タブ → {0}{1} クリック → 「優先船積保証」ブースターでVIP維持 → 競合蚕食防止' },
'ticker.sailing': { ko: '🚢 {0} 항해 중: {1}→{2} | 📦 적재 {3}TEU (적재율 {4}%) | 영업사원들은 다음 항차 물량 확보 중', ja: '🚢 {0} 航海中: {1}→{2} | 📦 積載 {3}TEU（積載率 {4}%）| 営業担当者は次の航次の貨物確保中' },
'ticker.ctrBuy': { ko: '📦 컨테이너 부족 — [투자] 탭 → "컨테이너 구매" → 부족 항구에 공급', ja: '📦 コンテナ不足 — [投資] タブ → 「コンテナ購入」 → 不足港に供給' },
'ticker.typhoonWarn': { ko: '🌀 태풍 접근 중! 연료비 +80% 발생 가능 — 출항 전 연료비 확인', ja: '🌀 台風接近中！燃料費+80%発生可能 — 出港前に燃料費確認' },
'ticker.highWave': { ko: '🌊 {0} 높은 파도 경보 — 연료비 +40% 발생 가능', ja: '🌊 {0} 高波警報 — 燃料費+40%発生可能' },
'ticker.spotUrgent': { ko: '🔥 스팟 물량 "{0}" 마감 임박! {1}TEU ${2} — 수주하시겠습니까?', ja: '🔥 スポット貨物「{0}」締切間近！{1}TEU ${2} — 受注しますか？' },
'ticker.bsaActive': { ko: '📋 BSA 계약 {0}건 진행 중 — 항차마다 자동 적재됩니다. [보고서] 탭에서 계약 현황 확인', ja: '📋 BSA契約 {0}件進行中 — 航次ごとに自動積載されます。[レポート] タブで契約状況確認' },
'ticker.debtFree': { ko: '🎉 무차입 경영 달성! 대출 이자 부담 없이 순이익 극대화 중', ja: '🎉 無借入経営達成！融資利息負担なしで純利益最大化中' },
'ticker.normalOps': { ko: '{0} V.{1} 정상 운영 중', ja: '{0} V.{1} 正常運営中' },
};

// ==================== T() — Main translation function ====================
function T(key, ...args) {
    const entry = TEXTS[key];
    if (!entry) return key; // fallback to key
    let text = entry[CURRENT_LANG] || entry['ko'] || key;
    // Simple {0}, {1} replacement
    args.forEach((a, i) => { text = text.replace(`{${i}}`, a); });
    return text;
}

// ==================== D() — Data field translation ====================
// Usage: D(routeObj, 'name') returns routeObj.nameJa or routeObj.nameKo based on language
function D(obj, field) {
    if (!obj) return '';
    if (CURRENT_LANG === 'ja') {
        const jaField = field + 'Ja';
        if (obj[jaField] !== undefined) return obj[jaField];
    }
    const koField = field + 'Ko';
    if (obj[koField] !== undefined) return obj[koField];
    if (obj[field] !== undefined) return obj[field];
    return '';
}

// ==================== Language switcher ====================
function setLanguage(lang) {
    CURRENT_LANG = lang;
    localStorage.setItem('kmtc_lang', lang);
    // Update static HTML elements
    updateStaticTexts();
    // Re-render active game content if game is running
    if (typeof Game !== 'undefined' && Game.state && Game.state.co) {
        Game.updateHUD();
        const activeTab = document.querySelector('.tab-panel.active');
        if (activeTab) {
            const tabId = activeTab.id;
            Game.showTab(tabId);
        }
        Game.renderDepart();
    }
}

function updateStaticTexts() {
    // Title screen
    const els = {
        'title-subtitle': T('title.subtitle'),
        'title-new-btn': T('title.newGame'),
        'title-load-btn': T('title.loadGame'),
        'title-cloud-btn': T('title.cloudLoad'),
    };
    for (const [id, text] of Object.entries(els)) {
        const el = document.getElementById(id);
        if (el) el.textContent = text;
    }

    // Tabs
    const tabMap = [
        ['tab.sales', 'tab-sales'],
        ['tab.customers', 'tab-customers'],
        ['tab.containers', 'tab-containers'],
        ['tab.invest', 'tab-invest'],
        ['tab.report', 'tab-report'],
        ['tab.finance', 'tab-finance'],
        ['tab.ranking', 'tab-ranking'],
    ];
    document.querySelectorAll('.tab-bar .tab').forEach((btn, i) => {
        if (tabMap[i]) btn.textContent = T(tabMap[i][0]);
    });

    // HUD labels
    document.querySelectorAll('.hud-money small').forEach((el, i) => {
        el.textContent = i === 0 ? T('hud.cash') : T('hud.debt');
    });

    // Feed title
    const feedTitle = document.querySelector('.feed-title');
    if (feedTitle) feedTitle.textContent = T('feed.title');

    // News ticker label
    const tickerLabel = document.querySelector('.ticker-label');
    if (tickerLabel) tickerLabel.textContent = T('hud.breaking');

    // Ship status
    const shipStatus = document.getElementById('ship-status');
    if (shipStatus && shipStatus.textContent.includes('정박') || shipStatus && shipStatus.textContent.includes('停泊')) {
        shipStatus.textContent = T('ship.docked');
    }

    // Setup screen
    const setupLabels = document.querySelectorAll('#screen-setup label');
    if (setupLabels.length >= 3) {
        setupLabels[0].textContent = T('setup.company');
        setupLabels[1].textContent = T('setup.ceo');
        setupLabels[2].textContent = T('setup.vessel');
    }
    const inpCo = document.getElementById('inp-company');
    if (inpCo) inpCo.placeholder = T('setup.companyPH');
    const inpCeo = document.getElementById('inp-ceo');
    if (inpCeo) inpCeo.placeholder = T('setup.ceoPH');
    const inpVessel = document.getElementById('inp-vessel');
    if (inpVessel) inpVessel.placeholder = T('setup.vesselPH');
}

// Initialize on load
document.addEventListener('DOMContentLoaded', () => {
    updateStaticTexts();
});

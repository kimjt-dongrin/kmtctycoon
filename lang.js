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

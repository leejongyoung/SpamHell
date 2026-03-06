/**
 * SpamHell - 스팸체 생성기 (보이스피싱 역공용)
 * Pure JavaScript Implementation
 */

const SPAM_MARKERS = ['[광.고]', '(주)', '▶', '▼', '◈', '※', '[Web발신]', '(축)'];
const SPAM_FOOTERS = ['[거/부] 080-철창행-열차', '[무/료/수/신/거/부]'];

const HANGEUL_CHO = ['ㄱ', 'ㄲ', 'ㄴ', 'ㄷ', 'ㄸ', 'ㄹ', 'ㅁ', 'ㅂ', 'ㅃ', 'ㅅ', 'ㅆ', 'ㅇ', 'ㅈ', 'ㅉ', 'ㅊ', 'ㅋ', 'ㅌ', 'ㅍ', 'ㅎ'];
const HANGEUL_JUNG = ['ㅏ', 'ㅐ', 'ㅑ', 'ㅒ', 'ㅓ', 'ㅔ', 'ㅕ', 'ㅖ', 'ㅗ', 'ㅘ', 'ㅙ', 'ㅚ', 'ㅛ', 'ㅜ', 'ㅝ', 'ㅞ', 'ㅟ', 'ㅠ', 'ㅡ', 'ㅢ', 'ㅣ'];
const HANGEUL_JONG = ['', 'ㄱ', 'ㄲ', 'ㄳ', 'ㄴ', 'ㄵ', 'ㄶ', 'ㄷ', 'ㄹ', 'ㄺ', 'ㄻ', 'ㄼ', 'ㄽ', 'ㄾ', 'ㄿ', 'ㅀ', 'ㅁ', 'ㅂ', 'ㅄ', 'ㅅ', 'ㅆ', 'ㅇ', 'ㅈ', 'ㅊ', 'ㅋ', 'ㅌ', 'ㅍ', 'ㅎ'];

const NUMBER_MAP = {
    '0': ['영', 'O', 'ㅇ'],
    '1': ['l', '!', 'ㅣ', 'i'],
    '2': ['이', 'ㄹ'],
    '3': ['삼', 'E'],
    '4': ['사'],
    '5': ['오'],
    '6': ['육'],
    '7': ['칠'],
    '8': ['팔'],
    '9': ['구']
};

const TEMPLATES = {
    typeA: [
        `[광/고] (축) 보이스-피싱 업계 종사자 대상 특별 혜택 안내

◈ 고.객.님.의 성실한 사기 행각에 감동하여 '지옥행 특급 열차' 티켓 l매가 발권되었습니다.
▶ 발권 번호: 4444-8282-1818
▶ 혜택 내용: 수사관과의 1:1 심층 면담권 (무료)
※ 주의: 본 혜택은 거절할 수 없으며, 거절 시 경찰청 포돌이가 직접 방문합니다.
[거/부] 080-철창행-열차`,
        `[광/고] (경) 보이스피싱 구속 1주년 기념 홈커밍 데이 초대

◈ 대상: 전국 보이스피싱 종사자 및 관계자
▶ 장소: 서울 성동구 성동이로 159 (서울동부구치소)
▶ 혜택: 10년 만기 무이자 할부 징역권 증정
※ 준비물: 본인의 비양심과 반성하지 않는 마음
[거/부] 080-징역-생활`,
        `[광/고] (축) 2026년 상반기 '최악의 비양심인' 당첨 안내

◈ 고객님의 끈질긴 사기 전화 시도가 드디어 결실을 맺었습니다.
▶ 상품: 24시간 실시간 위치 추적 서비스 (무료)
▶ 발신: 사이버 수사대 강력계
▶ 경고: 오늘 밤 12시 이전까지 파출소에 자진 신고 시 '콩밥' 곱빼기 제공!
[수/신/차/단] 112-전화-한통`
    ],

    typeB: [
        `(알림) 시_스템 점.검.중 입ㄴㅣㄷㅏ.

현재 입력하신 목소리 데이터에서 [비.양.심] 수치가 99.9% 검출되었습니다.
삐-빅! 사기꾼 감지기 작동.
상담을 원하시면 본인의 주민등록번호 뒷자리를 크게 3번 외쳐주세요.
(※ 주의: 목소리가 작으면 지옥 사자가 듣지 못합니다.)`,
        `[AI 안내] 보이스피싱 감지 시스템이 가동되었습니다.

● 현재 발신자의 음성 패턴 분석 결과: '거짓말' 확률 100%
● 조치 사항: 해당 번호는 실시간으로 관할 경찰서에 '사기꾼'으로 등록 중...
● 경고: 3초 후 당신의 스마트폰에서 경고음이 울립니다. (삐이이익-)
지금 즉시 도망가도 늦었습니다.`,
        `(알림) 보이스-피싱 전용 스팸 차단 봇입니다.

상대방의 멘탈이 이미 파괴되었습니다.
[차단 사유]: 인성 결격 사유로 인한 대화 불가
[해제 방법]: 본인의 통장에 들어있는 모든 돈을 '전국 피해자 구제 협회'에 반납하기.
※ 주의: 시도할 때마다 형량이 1년씩 추가됩니다.`
    ],

    typeC: [
        `[속.보] 0ㅣ것은 입에서 ㄴㅏ오느 ㄴ소ㄹㅣㄱㅏ ㅇㅏㄴㅣㄹㅏ.

◑ ㄸㅏㄹㄹㅡㅇ ㄸㅏㄹㄹㅡㅇ ◑
당신의 통장은 이미 '텅'장이 되었습니다.
▣ 복구 방법: 가까운 파출소에 가서 "나는 사기꾼이다"라고 5분간 외치기.
▣ 미이행 시: 오늘 밤 꿈에 당신이 가로챈 돈만큼의 귀신이 방문 서비스 예정.`,
        `[경.고] 저승 사자의 메.세.지.가 도착했습니다.

† 오늘 밤 12시, 당신의 발 밑을 조심하십시오. †
피해자들의 눈물이 모여 당신의 발목을 잡을 것입니다.
복구 코드: [참.회.하.라]
미입력 시: 오늘부터 먹는 모든 밥이 모래알로 변하는 저주가 시작됩니다.`,
        `[긴.급] 당신의 죄책감이 실체화되어 접근 중입니다.

▶ 현재 위치: 당신의 등 뒤 1m
▶ 상태: 몹시 굶주림 (사기꾼의 영혼을 선호함)
◑ 해결책: 당장 핸드폰을 버리고 산으로 들어가 3년간 도를 닦으십시오.
▣ 실패 시: 평생 보이스피싱 전화를 받는 쪽으로 환생하게 됩니다.`
    ]
};

const spammaker = {
    /**
     * 한글 글자를 자음/모음으로 강제 분리 (확률적)
     */
    disassemble: function(char) {
        const code = char.charCodeAt(0) - 44032;
        if (code < 0 || code > 11171) return char;

        const cho = Math.floor(code / 588);
        const jung = Math.floor((code % 588) / 28);
        const jong = code % 28;

        // 30% 확률로 강제 분리 또는 오타(점 삽입) 유도
        const rand = Math.random();
        if (rand < 0.15) {
            return HANGEUL_CHO[cho] + HANGEUL_JUNG[jung] + (HANGEUL_JONG[jong] || '');
        } else if (rand < 0.3) {
            return char.split('').join('.'); // 입.금 형태
        }
        return char;
    },

    /**
     * 숫자 변형
     */
    transformNumber: function(char) {
        if (NUMBER_MAP[char] && Math.random() < 0.7) {
            const options = NUMBER_MAP[char];
            return options[Math.floor(Math.random() * options.length)];
        }
        return char;
    },

    /**
     * 전체 텍스트 스팸화
     */
    toSpam: function(text) {
        if (!text) return "";
        
        let result = text.split('').map(char => {
            if (/[0-9]/.test(char)) return this.transformNumber(char);
            if (/[가-힣]/.test(char)) return this.disassemble(char);
            return char;
        }).join('');

        // 문장 중간중간 특수문자 삽입
        if (Math.random() < 0.5) {
            const markers = ['◈', '▶', '※', '/', '.', '_'];
            const pos = Math.floor(Math.random() * result.length);
            result = result.slice(0, pos) + markers[Math.floor(Math.random() * markers.length)] + result.slice(pos);
        }

        // 앞뒤에 스팸 마커 추가
        const prefix = SPAM_MARKERS[Math.floor(Math.random() * SPAM_MARKERS.length)];
        const suffix = "\n" + SPAM_FOOTERS[Math.floor(Math.random() * SPAM_FOOTERS.length)];
        
        return prefix + " " + result + suffix;
    },

    /**
     * 한국인체 (기존 기능 유지하되 심플하게)
     */
    toKorean: function(text) {
        // 단어 사이사이에 '진짜', 'ㄹㅇ', '넘' 등을 넣거나 
        // 마지막에 'ㅠㅠ', 'ㅋㅋ'를 붙임
        let words = text.split(' ');
        if (words.length > 1) {
            const pos = Math.floor(Math.random() * (words.length - 1)) + 1;
            words.splice(pos, 0, "ㄹㅇ");
        }
        return words.join(' ') + " ㅠㅠ";
    },

    getTemplate: function(type) {
        const variants = TEMPLATES[type];
        if (!variants) return "";
        return variants[Math.floor(Math.random() * variants.length)];
    }
};

if (typeof module !== 'undefined') {
    module.exports = spammaker;
}

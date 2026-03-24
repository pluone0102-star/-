// ==UserScript==
// @name         데일리 서사 배달부
// @version      1.0.0
// @description  지정된 시간마다 NPC와 PC의 서사를 위한 질문을 배달해 주는 알리미
// @match        https://crack.wrtn.ai/*
// @grant        none
// @author       뤼튼 유저 & AI
// ==/UserScript==

(function () {
    'use strict';

    // 설정값 저장 키
    const CONFIG_KEY = 'daily_mail_config';
    const LAST_SENT_KEY = 'daily_mail_last_sent';

    // 기본 설정
    let config = JSON.parse(localStorage.getItem(CONFIG_KEY)) || {
        intervalHours: 12, // 기본 12시간
        oocMessage: "(OOC: 오늘 우리 두 사람의 관계와 그동안의 서사를 반영해서, 서로의 속마음을 확인할 수 있는 깊이 있는 질문을 하나만 던져줘.)"
    };

    // 우체통 UI 생성
    const createMailbox = () => {
        if (document.getElementById('mail-delivery-system')) return;

        const container = document.createElement('div');
        container.id = 'mail-delivery-system';
        Object.assign(container.style, {
            position: 'fixed', bottom: '80px', right: '20px', zIndex: '10000',
            display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '10px'
        });

        // 배달 알림 아이콘 (시간이 되면 통통 튐)
        const mailIcon = document.createElement('div');
        mailIcon.id = 'mail-icon';
        mailIcon.innerHTML = '📮';
        Object.assign(mailIcon.style, {
            width: '45px', height: '45px', backgroundColor: '#fdfbf7', border: '1px solid #eae0d3', borderRadius: '50%',
            display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
            boxShadow: '0 4px 10px rgba(0,0,0,0.1)', fontSize: '24px', transition: 'all 0.3s'
        });

        // 설정 패널 (기본은 숨김)
        const panel = document.createElement('div');
        panel.id = 'mail-config-panel';
        Object.assign(panel.style, {
            backgroundColor: '#fff', border: '1px solid #ccc', padding: '15px', borderRadius: '8px',
            boxShadow: '0 5px 20px rgba(0,0,0,0.2)', width: '300px', display: 'none', fontSize: '13px', color: '#333'
        });

        panel.innerHTML = `
            <div style="font-weight:bold; margin-bottom:10px; font-size:15px;">📮 배달부 설정</div>
            <label style="display:block; margin-bottom:5px;">배달 주기</label>
            <select id="mail-interval" style="width:100%; padding:5px; margin-bottom:10px; border:1px solid #ccc; border-radius:4px;">
                <option value="6">6시간마다</option>
                <option value="12">12시간마다</option>
                <option value="24">24시간마다 (하루 한 번)</option>
            </select>
            <label style="display:block; margin-bottom:5px;">배달할 OOC 문구</label>
            <textarea id="mail-ooc" style="width:100%; height:80px; padding:5px; margin-bottom:10px; border:1px solid #ccc; border-radius:4px; font-size:12px;">${config.oocMessage}</textarea>

            <div style="font-size:11px; color:#666; margin-bottom:10px;" id="mail-status">상태 확인 중...</div>

            <div style="display:flex; gap:5px;">
                <button id="mail-save-btn" style="flex:1; padding:8px; background:#4CAF50; color:white; border:none; border-radius:4px; cursor:pointer;">설정 저장</button>
                <button id="mail-force-btn" style="flex:1; padding:8px; background:#ff6b6b; color:white; border:none; border-radius:4px; cursor:pointer;">지금 바로 배달!</button>
            </div>
        `;

        container.appendChild(panel);
        container.appendChild(mailIcon);
        document.body.appendChild(container);

        // 이벤트 리스너 연결
        mailIcon.onclick = () => {
            panel.style.display = panel.style.display === 'none' ? 'block' : 'none';
            updateStatusText();
        };

        const intervalSelect = document.getElementById('mail-interval');
        intervalSelect.value = config.intervalHours;

        document.getElementById('mail-save-btn').onclick = () => {
            config.intervalHours = parseInt(intervalSelect.value);
            config.oocMessage = document.getElementById('mail-ooc').value;
            localStorage.setItem(CONFIG_KEY, JSON.stringify(config));
            alert('배달부 설정이 저장되었습니다!');
            checkTime();
        };

        document.getElementById('mail-force-btn').onclick = () => {
            sendQuestion();
            panel.style.display = 'none';
        };

        checkTime();
        setInterval(checkTime, 60000); // 1분마다 시간 체크
    };

    // 시간 체크 및 UI 업데이트 로직
    const checkTime = () => {
        const lastSent = parseInt(localStorage.getItem(LAST_SENT_KEY)) || 0;
        const now = new Date().getTime();
        const intervalMs = config.intervalHours * 60 * 60 * 1000;
        const mailIcon = document.getElementById('mail-icon');

        if (!mailIcon) return;

        if (now - lastSent >= intervalMs) {
            // 배달 시간이 되었을 때 아이콘 강조
            mailIcon.style.animation = 'breathe 1.5s infinite ease-in-out';
            mailIcon.style.backgroundColor = '#ffeb3b'; // 노란색으로 빛남
            mailIcon.innerHTML = '💌'; // 편지가 온 아이콘으로 변경
        } else {
            // 아직 배달 시간이 아닐 때
            mailIcon.style.animation = 'none';
            mailIcon.style.backgroundColor = '#fdfbf7';
            mailIcon.innerHTML = '📮';
        }
        updateStatusText();
    };

    // 남은 시간 계산해서 텍스트로 보여주기
    const updateStatusText = () => {
        const statusEl = document.getElementById('mail-status');
        if (!statusEl) return;

        const lastSent = parseInt(localStorage.getItem(LAST_SENT_KEY)) || 0;
        const now = new Date().getTime();
        const intervalMs = config.intervalHours * 60 * 60 * 1000;
        const diff = now - lastSent;

        if (diff >= intervalMs) {
            statusEl.innerHTML = "<strong style='color:#e74c3c;'>새로운 질문이 도착했습니다! '지금 바로 배달'을 눌러주세요.</strong>";
        } else {
            const leftMs = intervalMs - diff;
            const leftHours = Math.floor(leftMs / (1000 * 60 * 60));
            const leftMins = Math.floor((leftMs % (1000 * 60 * 60)) / (1000 * 60));
            statusEl.innerText = `다음 배달까지 약 ${leftHours}시간 ${leftMins}분 남았습니다.`;
        }
    };

    // 채팅창에 OOC 메시지 입력하고 전송하는 함수
    const sendQuestion = () => {
        const textarea = document.querySelector('textarea.rc-textarea') || document.querySelector('textarea[placeholder]');
        if (textarea) {
            textarea.value = config.oocMessage;
            // React 등에서 값을 인식하도록 강제 이벤트 발생
            textarea.dispatchEvent(new Event('input', { bubbles: true }));

            // 전송 버튼 찾기 (보통 색상이 들어간 버튼)
            setTimeout(() => {
                const sendBtn = document.querySelector('button[style*="rgb(255, 68, 50)"]');
                if (sendBtn) sendBtn.click();

                // 보낸 시간 기록 갱신
                localStorage.setItem(LAST_SENT_KEY, new Date().getTime());
                checkTime();
            }, 300);
        } else {
            alert('채팅 입력창을 찾을 수 없습니다. 채팅방에 입장해 있는지 확인해 주세요.');
        }
    };

    // 키프레임 애니메이션 추가 (우체통 깜빡임 효과)
    const style = document.createElement('style');
    style.innerHTML = `
        @keyframes breathe {
            0% { transform: scale(1); box-shadow: 0 0 5px rgba(255, 235, 59, 0.5); }
            50% { transform: scale(1.1); box-shadow: 0 0 15px rgba(255, 235, 59, 0.8); }
            100% { transform: scale(1); box-shadow: 0 0 5px rgba(255, 235, 59, 0.5); }
        }
    `;
    document.head.appendChild(style);

    // 실행
    if (document.readyState === 'loading') {
        window.addEventListener('DOMContentLoaded', createMailbox);
    } else {
        createMailbox();
    }

    // 페이지 이동 시 우체통이 사라지지 않도록 관찰
    let lastUrl = location.href;
    new MutationObserver(() => {
        if (location.href !== lastUrl) {
            lastUrl = location.href;
            setTimeout(createMailbox, 1000);
        }
    }).observe(document.body, { subtree: true, childList: true });

})();
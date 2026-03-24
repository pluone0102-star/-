// ==UserScript==
// @name         서사 배달부
// @version      8.6.0
// @description  편지 받기
// @match        https://crack.wrtn.ai/*
// @grant        none
// ==/UserScript==

(function () {
    'use strict';

    const STORAGE_KEY = 'gemini_letter_config';

    // 💡 크랙 사이트에 맞춘 방 ID 추출 방식 (URL 경로와 쿼리를 모두 합쳐서 고유값 생성)
    const getRoomId = () => {
        let id = location.pathname + location.search;
        if (id === '/' || id === '') id = 'main_room';
        return id.replace(/[^a-zA-Z0-9_-]/g, '_'); // 특수문자를 언더바로 치환하여 안전한 키 생성
    };

    const getInboxKey = () => `gemini_letter_inbox_${getRoomId()}`;
    const getLastSentKey = () => `gemini_letter_last_time_${getRoomId()}`;

    let savedConfig = JSON.parse(localStorage.getItem(STORAGE_KEY)) || {};
    let config = {
        apiKey: savedConfig.apiKey || '',
        model: savedConfig.model || 'gemini-2.5-flash',
        systemPrompt: savedConfig.systemPrompt || "너는 사용자와 롤플레잉 중인 캐릭터야. 아래 최근 대화 내역을 읽고, 현재 상황과 시간에 맞춰 나에게 쓰는 '편지'나 '속마음 독백'을 작성해 줘. 분량 제한 없이 네 감정과 서사를 아주 길고 깊이 있게 묘사해 줘. OOC나 특수기호 없이 대사와 서술만 줄글로 출력해.",
        senderName: savedConfig.senderName || "",
        recipientName: savedConfig.recipientName || "",
        intervalHours: savedConfig.intervalHours !== undefined ? savedConfig.intervalHours : 12
    };

    const loadHtml2Canvas = (callback) => {
        if (window.html2canvas) return callback();
        const script = document.createElement('script');
        script.src = 'https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js';
        script.onload = callback;
        document.head.appendChild(script);
    };

    const getRecentChatHistory = () => {
        let history = "";
        const bubbles = document.querySelectorAll('div[class*="rounded-[20px_20px_4px_20px]"], div[class*="rounded-[4px_20px_20px_20px]"]');
        const recentBubbles = Array.from(bubbles).slice(-10);

        recentBubbles.forEach(bubble => {
            const isMe = bubble.className.includes('20px_20px_4px_20px');
            history += `${isMe ? "나(PC)" : "상대방(NPC)"}: ${bubble.innerText}\n`;
        });
        return history || "최근 대화 내역이 없습니다.";
    };

    const fetchLetterFromAPI = async () => {
        if (!config.apiKey) return alert('설정(Shift+클릭)에서 Gemini API Key를 먼저 입력해 주세요!');

        localStorage.setItem(getLastSentKey(), new Date().getTime());
        showLetterUI("편지가 오고 있습니다...\n(글이 길면 시간이 조금 더 걸립니다) ✍️", true);

        const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${config.model}:generateContent?key=${config.apiKey}`;
        const autoNamePrompt = "\n\n[시스템 강제 지시사항]\n반드시 응답의 맨 첫 줄에 '[NPC:상대방이름|PC:내이름]' 형식으로 편지를 보내는 자와 받는 자의 이름을 문맥에서 유추해 적어줘. (이름이 안 나오면 그에 맞는 호칭 사용). 그리고 그 다음 줄부터 편지 본문을 작성해.";

        const payload = {
            systemInstruction: { parts: [{ text: config.systemPrompt + autoNamePrompt }] },
            contents: [{ role: "user", parts: [{ text: `[현재 시간: ${new Date().toLocaleTimeString('ko-KR')}]\n[최근 대화]\n${getRecentChatHistory()}\n\n이 상황에 맞는 메시지나 편지를 작성해줘.` }] }],
            generationConfig: { temperature: 0.75, maxOutputTokens: 8192 }
        };

        try {
            const response = await fetch(endpoint, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
            const data = await response.json();

            if (data.error) throw new Error(data.error.message);

            let rawContent = data.candidates[0].content.parts[0].text;
            let finalSender = config.senderName || "보내는 이";
            let finalRecipient = config.recipientName || "받는 이";

            const nameRegex = /\[NPC:\s*(.+?)\s*\|\s*PC:\s*(.+?)\s*\]/;
            const match = rawContent.match(nameRegex);

            if (match) {
                finalSender = match[1].trim();
                finalRecipient = match[2].trim();
                rawContent = rawContent.replace(nameRegex, '').trim();
            }

            const currentInboxKey = getInboxKey();
            const inbox = JSON.parse(localStorage.getItem(currentInboxKey)) || [];
            const newLetter = {
                id: Date.now(),
                date: new Date().toLocaleString('ko-KR', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }),
                content: rawContent,
                sender: finalSender,
                recipient: finalRecipient
            };
            inbox.unshift(newLetter);
            if(inbox.length > 50) inbox.pop();
            localStorage.setItem(currentInboxKey, JSON.stringify(inbox));

            showLetterUI(rawContent, false, finalSender, finalRecipient);

        } catch (error) {
            showLetterUI(`편지 배달 중 오류가 발생했습니다.\n\n사유: ${error.message}`, false);
        }
    };

    const showLetterUI = (content, isLoading, sender = config.senderName, recipient = config.recipientName) => {
        let overlay = document.getElementById('letter-ui-overlay');

        if (!overlay) {
            overlay = document.createElement('div');
            overlay.id = 'letter-ui-overlay';
            Object.assign(overlay.style, {
                position: 'fixed', top: '0', left: '0', width: '100vw', height: '100vh',
                backgroundColor: 'rgba(0, 0, 0, 0.6)', backdropFilter: 'blur(4px)',
                display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: '100000',
                animation: 'fadeIn 0.3s ease-out'
            });

            const letterBox = document.createElement('div');
            letterBox.id = 'letter-ui-box';
            Object.assign(letterBox.style, {
                width: '85%', maxWidth: '450px', minHeight: '200px', maxHeight: '85vh',
                backgroundColor: '#fdfaf2', backgroundImage: 'url("https://www.transparenttextures.com/patterns/paper-fibers.png")',
                borderRadius: '8px', padding: '40px 30px', position: 'relative',
                boxShadow: '0 10px 30px rgba(0,0,0,0.5)', border: '1px solid #d4a373',
                fontFamily: "'ChangwonDangamRounded', sans-serif",
                color: '#3e3a36', lineHeight: '1.8', fontSize: '15px',
                letterSpacing: '0.02em', display: 'flex', flexDirection: 'column'
            });

            overlay.appendChild(letterBox);
            document.body.appendChild(overlay);

            overlay.onclick = (e) => {
                if (e.target === overlay && !overlay.getAttribute('data-loading')) {
                    overlay.style.animation = 'fadeOut 0.3s forwards';
                    setTimeout(() => overlay.remove(), 300);
                }
            };
        }

        const letterBox = overlay.querySelector('#letter-ui-box');

        if (isLoading) {
            overlay.setAttribute('data-loading', 'true');
            letterBox.innerHTML = `
                <div style="text-align:center; margin:auto; font-style:italic; color:#8b7964; white-space:pre-wrap;">
                    <span style="font-size:30px; display:block; margin-bottom:15px; animation:bounce 1s infinite;">💌</span>
                    ${content}
                </div>
            `;
        } else {
            overlay.removeAttribute('data-loading');

            // 💡 보내는 이, 받는 이의 디자인을 편지 본문과 완벽하게 동일화 (15px, italic 추가)
            letterBox.innerHTML = `
                <div id="letter-buttons" style="position:absolute; top:10px; right:15px; display:flex; gap:10px;">
                    <button id="save-image-btn" title="이미지로 저장" style="background:none; border:none; font-size:18px; cursor:pointer; color:#8b7964;">📸</button>
                    <button id="close-letter-btn" title="닫기" style="background:none; border:none; font-size:18px; cursor:pointer; color:#a1887f;">✖</button>
                </div>
                <div style="text-align:left; margin-bottom:15px; font-size:15px; font-style:italic; font-weight:bold; color:#5c4d3c; border-bottom:1px solid rgba(212,163,115,0.3); padding-bottom:5px;">${recipient}에게</div>

                <div id="letter-content-area" style="font-style:italic; overflow-y:auto; padding:10px 10px 10px 0; word-break:keep-all; white-space:pre-wrap; flex-grow:1;"></div>

                <div style="text-align:right; margin-top:15px; font-size:15px; font-style:italic; font-weight:bold; color:#5c4d3c; border-top:1px solid rgba(212,163,115,0.3); padding-top:10px;">${sender}가</div>
            `;

            const contentArea = letterBox.querySelector('#letter-content-area');
            contentArea.textContent = content.trim();

            const scrollStyle = document.createElement('style');
            scrollStyle.innerHTML = `#letter-content-area::-webkit-scrollbar { width: 6px; } #letter-content-area::-webkit-scrollbar-thumb { background-color: #d4a373; border-radius: 4px; opacity: 0.5; }`;
            letterBox.appendChild(scrollStyle);

            document.getElementById('close-letter-btn').onclick = () => {
                overlay.style.animation = 'fadeOut 0.3s forwards';
                setTimeout(() => overlay.remove(), 300);
            };

            document.getElementById('save-image-btn').onclick = () => {
                const btnArea = document.getElementById('letter-buttons');
                const originalOverflow = contentArea.style.overflowY;
                const originalMaxHeight = letterBox.style.maxHeight;

                btnArea.style.display = 'none';
                contentArea.style.overflowY = 'visible';
                letterBox.style.maxHeight = 'none';

                loadHtml2Canvas(() => {
                    window.html2canvas(letterBox, { backgroundColor: '#fdfaf2', scale: 2, useCORS: true }).then(canvas => {
                        const link = document.createElement('a');
                        link.download = `Letter_${sender}_${new Date().getTime()}.png`;
                        link.href = canvas.toDataURL('image/png');
                        link.click();

                        btnArea.style.display = 'flex';
                        contentArea.style.overflowY = originalOverflow;
                        letterBox.style.maxHeight = originalMaxHeight;
                        alert('✨ 편지가 예쁜 이미지로 저장되었습니다!');
                    });
                });
            };
        }
    };

    const openInboxPanel = () => {
        let panel = document.getElementById('gemini-letter-inbox');
        if (panel) return;

        const currentInboxKey = getInboxKey();
        const inbox = JSON.parse(localStorage.getItem(currentInboxKey)) || [];

        panel = document.createElement('div');
        panel.id = 'gemini-letter-inbox';
        Object.assign(panel.style, {
            position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
            backgroundColor: '#fff', padding: '20px', borderRadius: '8px', zIndex: '100002',
            boxShadow: '0 10px 40px rgba(0,0,0,0.4)', width: '360px', maxHeight: '70vh', display: 'flex', flexDirection: 'column',
            fontFamily: "'ChangwonDangamRounded', sans-serif"
        });

        let listHTML = inbox.length === 0 ? '<div style="text-align:center; padding:30px; color:#999; font-size:13px;">이 방에서 아직 받은 편지가 없습니다.</div>' : '';

        inbox.forEach((letter, index) => {
            const preview = letter.content.substring(0, 30).replace(/\n/g, ' ') + '...';
            listHTML += `
                <div class="inbox-item" data-index="${index}" style="padding:10px; border-bottom:1px solid #eee; cursor:pointer; display:flex; flex-direction:column; gap:5px;">
                    <div style="display:flex; justify-content:space-between; align-items:center;">
                        <span style="font-weight:bold; font-size:14px; color:#d4a373;">${letter.sender}가</span>
                        <span style="font-size:11px; color:#999;">${letter.date}</span>
                    </div>
                    <div style="font-size:13px; color:#555; font-style:italic;">"${preview}"</div>
                </div>
            `;
        });

        panel.innerHTML = `
            <div style="display:flex; justify-content:space-between; align-items:center; border-bottom:2px solid #d4a373; padding-bottom:10px; margin-bottom:10px;">
                <h3 style="margin:0; color:#5c4d3c; font-size:1.1rem;">🗂️ 받은 편지 보관함</h3>
                <button id="close-inbox-btn" style="background:none; border:none; font-size:16px; cursor:pointer;">✖</button>
            </div>
            <div style="overflow-y:auto; flex-grow:1; margin-bottom:10px;">${listHTML}</div>
            <button id="clear-inbox-btn" style="width:100%; padding:8px; background:#f44336; color:white; border:none; border-radius:4px; cursor:pointer; font-size:12px; font-family:inherit;">현재 방 보관함 비우기</button>
        `;

        document.body.appendChild(panel);

        panel.querySelectorAll('.inbox-item').forEach(item => {
            item.onclick = () => {
                const letter = inbox[item.getAttribute('data-index')];
                showLetterUI(letter.content, false, letter.sender, letter.recipient);
                panel.remove();
            };
        });

        document.getElementById('close-inbox-btn').onclick = () => panel.remove();
        document.getElementById('clear-inbox-btn').onclick = () => {
            if(confirm('정말 현재 방에 있는 모든 편지를 지우시겠습니까?')) {
                localStorage.removeItem(currentInboxKey);
                panel.remove();
                openInboxPanel();
            }
        };
    };

    const showSystemAlert = () => {
        if (document.getElementById('immersion-system-alert')) return;
        const overlay = document.createElement('div');
        overlay.id = 'immersion-system-alert';
        Object.assign(overlay.style, {
            position: 'fixed', top: '20px', left: '50%', transform: 'translateX(-50%)', backgroundColor: 'rgba(0, 0, 0, 0.85)', color: '#fff', padding: '15px 30px', borderRadius: '30px', zIndex: '99999', display: 'flex', alignItems: 'center', gap: '15px', boxShadow: '0 4px 15px rgba(0,0,0,0.3)', backdropFilter: 'blur(5px)', cursor: 'pointer', animation: 'slideDown 0.5s ease-out, glow 2s infinite alternate', fontFamily: "'ChangwonDangamRounded', sans-serif"
        });
        overlay.innerHTML = `<span style="font-size:20px;">💌</span><div style="display:flex; flex-direction:column;"><span style="font-weight:bold; font-size:14px; color:#ffeb3b;">새로운 편지가 도착했습니다.</span><span style="font-size:12px; color:#ddd;">클릭하여 편지를 확인해 보세요.</span></div>`;
        overlay.onclick = () => { fetchLetterFromAPI(); overlay.remove(); };
        document.body.appendChild(overlay);
    };

    const checkTimeForEvent = () => {
        // 💡 특정 URL 구조 대신, 채팅 입력창이 존재하는 페이지인지로 똑똑하게 파악
        const chatBoxExists = document.querySelector('textarea.rc-textarea, textarea[placeholder]');
        if (!chatBoxExists) return;

        const lastSent = parseInt(localStorage.getItem(getLastSentKey())) || 0;
        if (new Date().getTime() - lastSent >= config.intervalHours * 60 * 60 * 1000) showSystemAlert();
    };

    const createController = () => {
        if (document.getElementById('api-letter-controller')) return;

        const container = document.createElement('div');
        Object.assign(container.style, { position: 'fixed', bottom: '140px', right: '20px', zIndex: '9999', display: 'flex', flexDirection: 'column', gap: '10px' });

        const inboxBtn = document.createElement('div');
        inboxBtn.innerHTML = '🗂️';
        Object.assign(inboxBtn.style, { width: '40px', height: '40px', backgroundColor: '#fff', border: '2px solid #ccc', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', boxShadow: '0 4px 10px rgba(0,0,0,0.1)', fontSize: '18px' });
        inboxBtn.onclick = openInboxPanel;
        inboxBtn.title = "받은 편지 보관함 열기";

        const newBtn = document.createElement('div');
        newBtn.id = 'api-letter-controller';
        newBtn.innerHTML = '📜';
        Object.assign(newBtn.style, { width: '45px', height: '45px', backgroundColor: '#fff', border: '2px solid #d4a373', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', boxShadow: '0 4px 10px rgba(0,0,0,0.1)', fontSize: '20px' });
        newBtn.onclick = (e) => { if (e.shiftKey) openSettingsPanel(); else fetchLetterFromAPI(); };
        newBtn.title = "클릭: 새 편지 받기\nShift+클릭: 상세 설정";

        container.appendChild(inboxBtn);
        container.appendChild(newBtn);
        document.body.appendChild(container);
    };

    const openSettingsPanel = () => {
        let panel = document.getElementById('gemini-letter-settings');
        if (!panel) {
            panel = document.createElement('div');
            panel.id = 'gemini-letter-settings';
            Object.assign(panel.style, { position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', backgroundColor: '#fff', padding: '20px', borderRadius: '8px', zIndex: '100001', boxShadow: '0 10px 30px rgba(0,0,0,0.3)', width: '360px', color: '#333', maxHeight: '80vh', overflowY: 'auto', fontFamily: "'ChangwonDangamRounded', sans-serif" });
            panel.innerHTML = `
                <h3 style="margin-top:0; margin-bottom:10px;">⚙️ 편지 시스템 상세 설정</h3>
                <label style="font-size:12px; font-weight:bold;">Gemini API Key</label>
                <input type="password" id="api-key-input" style="width:100%; padding:5px; margin:5px 0 10px 0; border:1px solid #ccc; border-radius:4px; font-family:sans-serif;" placeholder="AIzaSy...">

                <div style="font-size:11px; color:#f44336; margin-bottom:10px;">
                    💡 이름 칸은 비워두셔도 됩니다! AI가 문맥을 읽고 자동으로 적어줍니다. 수동으로 고정하고 싶을 때만 입력하세요.
                </div>
                <div style="display:flex; gap:10px; margin-bottom:10px;">
                    <div style="flex:1;"><label style="font-size:12px; font-weight:bold;">보내는 이 (수동)</label><input type="text" id="sender-input" style="width:100%; padding:5px; margin-top:5px; border:1px solid #ccc; border-radius:4px; font-family:inherit;"></div>
                    <div style="flex:1;"><label style="font-size:12px; font-weight:bold;">받는 이 (수동)</label><input type="text" id="recipient-input" style="width:100%; padding:5px; margin-top:5px; border:1px solid #ccc; border-radius:4px; font-family:inherit;"></div>
                </div>

                <label style="font-size:12px; font-weight:bold;">자동 편지 배달 주기</label>
                <select id="interval-select" style="width:100%; padding:5px; margin:5px 0 10px 0; border:1px solid #ccc; border-radius:4px; font-family:inherit;">
                    <option value="6">6시간마다</option><option value="12">12시간마다</option><option value="24">24시간마다</option>
                </select>
                <label style="font-size:12px; font-weight:bold;">📝 AI 지시문 (프롬프트 커스텀)</label>
                <textarea id="prompt-input" style="width:100%; height:100px; padding:5px; margin-top:5px; margin-bottom:15px; border:1px solid #ccc; border-radius:4px; font-size:12px; resize:vertical; font-family:inherit;"></textarea>
                <div style="display:flex; gap:10px;"><button id="save-api-btn" style="flex:1; padding:8px; background:#4CAF50; color:white; border:none; border-radius:4px; cursor:pointer; font-family:inherit;">저장</button><button id="close-api-btn" style="flex:1; padding:8px; background:#ccc; border:none; border-radius:4px; cursor:pointer; font-family:inherit;">닫기</button></div>
            `;
            document.body.appendChild(panel);
            document.getElementById('save-api-btn').onclick = () => {
                config.apiKey = document.getElementById('api-key-input').value;
                config.senderName = document.getElementById('sender-input').value;
                config.recipientName = document.getElementById('recipient-input').value;
                config.intervalHours = parseInt(document.getElementById('interval-select').value);
                config.systemPrompt = document.getElementById('prompt-input').value;
                localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
                alert('저장 완료! 새로운 양식과 주기가 적용됩니다.');
                panel.remove(); checkTimeForEvent();
            };
            document.getElementById('close-api-btn').onclick = () => panel.remove();
        }
        document.getElementById('api-key-input').value = config.apiKey;
        document.getElementById('sender-input').value = config.senderName;
        document.getElementById('recipient-input').value = config.recipientName;
        document.getElementById('interval-select').value = config.intervalHours;
        document.getElementById('prompt-input').value = config.systemPrompt;
    };

    const style = document.createElement('style');
    style.innerHTML = `
        @font-face {
            font-family: 'ChangwonDangamRounded';
            src: url('https://cdn.jsdelivr.net/gh/projectnoonnu/2511-1@1.0/ChangwonDangamRound-Regular.woff2') format('woff2');
            font-weight: normal;
            font-style: normal;
        }
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes fadeOut { from { opacity: 1; } to { opacity: 0; transform: scale(0.9); } }
        @keyframes bounce { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-10px); } }
        @keyframes slideDown { from { top: -50px; opacity: 0; } to { top: 20px; opacity: 1; } }
        @keyframes glow { from { box-shadow: 0 0 10px rgba(255, 235, 59, 0.2); } to { box-shadow: 0 0 20px rgba(255, 235, 59, 0.6); } }
    `;
    document.head.appendChild(style);

    if (document.readyState === 'loading') { window.addEventListener('DOMContentLoaded', () => { createController(); checkTimeForEvent(); }); }
    else { createController(); checkTimeForEvent(); }

    setInterval(checkTimeForEvent, 60000);
    let lastUrl = location.href;
    new MutationObserver(() => {
        if (location.href !== lastUrl) {
            lastUrl = location.href;
            setTimeout(() => {
                const inboxPanel = document.getElementById('gemini-letter-inbox');
                if(inboxPanel) inboxPanel.remove();
                checkTimeForEvent();
            }, 1000);
        }
    }).observe(document.body, { subtree: true, childList: true });

})();
// 画面上部のInjectパネルの表示/非表示を切り替える
function insertPanel() {
    _setupMenuButtons();
    _insertInteractiveWidget();
    _addEventListener();
    _sspp_updateSizeDisplay();
    console.log("Responsive design CSS injector has been loaded.");
}

function _setupMenuButtons() {
    const panel = document.getElementById('sd-smartphone-plus-panel');
    const root = document.getElementById('tabs').parentNode;
    
    // CSS Injection ボタン
    _setOnClick('sspp-inject-css', () => {
        root.classList.toggle('sspp-opened', _toggleResponsiveCSS());
    });
    
    // [Negative Prompt]
    _setOnClick('sspp-nega-prompt', e => {
        root.classList.toggle("nega-prompt-hidden");
    });
    // [Props]
    _setOnClick('sspp-config', e => {
        root.classList.toggle("config-hidden");
    });
    // [Size selector]
    _setOnClick('sspp-size', e => {
        panel.classList.toggle("size-select");
    });
    _setOnClick('sspp-clip', e => {
        panel.classList.toggle("clip-select");
    })

    // [Previous word]
    _setOnClick('sspp-prevword', e => {
        _sspp_selectPrevWord(panel.classList.contains("word-select"));
    });
    // [Current word]
    _setOnClick('sspp-currword', e => {
        sspp_selectWord(panel.classList.contains("word-select"));
        panel.classList.toggle("word-select");
    });
    // [Next word]
    _setOnClick('sspp-nextword', e => {
        _sspp_selectNextWord(panel.classList.contains("word-select"));
    });
    // [Emphasize]
    _setOnClick('sspp-parentheses', e => {
        _sspp_emphasize();
    });
    // [rate down]
    _setOnClick('sspp-ratedown', e => {
        _sspp_changerate(-0.1);
    });
    // [rate up]
    _setOnClick('sspp-rateup', e => {
        _sspp_changerate(0.1);
    });

    // [Generate]
    _setOnClick('sspp-generate', e => {
        const generateButton = document.getElementById('txt2img_generate');
        generateButton.click();
    });

    root.appendChild(panel);
    root.classList.add('config-hidden', 'nega-prompt-hidden');
}

let _sspp_currentTabName = '';
function _addEventListener() {
    document.getElementById('tabs').addEventListener("click", function(e) {
        const btn = e.target.closest("button");
        if (btn) {
            _sspp_currentTabName = btn.textContent.trim();
            _sspp_updateSizeDisplay();
        }
    });
    _sspp_currentTabName = _currentTabName();
}

function _insertInteractiveWidget() {
    const viewportMeta = document.querySelector('meta[name="viewport"]');
    if (viewportMeta) {
        let content = viewportMeta.getAttribute('content');
        if (!content.includes('interactive-widget')) {
            viewportMeta.setAttribute('content', content + ', interactive-widget=resizes-content');
        }
    }
}

// パネルにボタンを追加するユーティリティ関数
function _setOnClick(id, onClick) {
    document.getElementById(id).addEventListener('click', onClick);
}

// 現在選択されているタブの名前を取得する
function _currentTabName() {
    return document.querySelector('#tabs button.selected').textContent.trim().toLowerCase();
}

function _promptArea() {
    return document.querySelector(`#${_sspp_currentTabName}_prompt textarea`);
}

function _sizeInputs() {
    if (_sspp_currentTabName !== 'txt2img' && _sspp_currentTabName !== 'img2img') return null;
    return [
        document.querySelector(`#${_sspp_currentTabName}_width input`),
        document.querySelector(`#${_sspp_currentTabName}_height input`)
    ];
}


// サイズ選択ボタンが押されたときの処理
function sspp_setSize(width, height) {
    const size = _sizeInputs();
    if (!size) return;
    size[0].value = width;
    size[0].dispatchEvent(new Event('input', { bubbles: true }));
    size[1].value = height;
    size[1].dispatchEvent(new Event('input', { bubbles: true }));
    document.getElementById('sd-smartphone-plus-panel').classList.remove("size-select");
    _sspp_updateSizeDisplay();
}

// サイズ表示を更新する
function _sspp_updateSizeDisplay() {
    const size = _sizeInputs();
    if (!size) return;
    const sizeLabel = document.querySelector('#sspp-size>span.sspp-button-label');
    sizeLabel.textContent = `${size[0].value}x${size[1].value}`;
}


// テキストエリア内の現在の単語を選択/解除する
function sspp_selectWord(hold) {
    if (hold) _sspp_unselectWord();
    else _sspp_selectCurrentWord();
}
function _sspp_selectCurrentWord() {
    const textArea = _promptArea();
    if (!textArea) return;
    const text = textArea.value;
    let start = textArea.selectionStart;
    while (start > 0 && !/\s/.test(text[start - 1])) start--;
    let end = textArea.selectionEnd;
    while (end < text.length && !/\s/.test(text[end])) end++;
    textArea.setSelectionRange(start, end);
    textArea.focus();
}
function _sspp_unselectWord() {
    const textArea = _promptArea();
    if (!textArea) return;
    const pos = textArea.selectionEnd;
    textArea.setSelectionRange(pos, pos);
    textArea.focus();
}

// テキストエリア内の前の単語を選択する
function _sspp_selectPrevWord(hold) {
    const textArea = _promptArea();
    if (!textArea) return;
    _sspp_selectCurrentWord(textArea);
    const text = textArea.value;
    let end = textArea.selectionStart;
    if (end === 0) return;
    end--;
    while (end > 0 && /\s/.test(text[end - 1])) end--;
    let start = end;
    while (start > 0 && !/\s/.test(text[start - 1])) start--;
    textArea.setSelectionRange(start, hold ? textArea.selectionEnd : end);
    textArea.focus();
}

// テキストエリア内の次の単語を選択する
function _sspp_selectNextWord(hold) {
    const textArea = _promptArea();
    if (!textArea) return;
    _sspp_selectCurrentWord(textArea);
    const text = textArea.value;
    let start = textArea.selectionEnd;
    if (start === text.length) return;
    while (start < text.length && /\s/.test(text[start])) start++;
    let end = start;
    while (end < text.length && !/\s/.test(text[end])) end++;
    textArea.setSelectionRange(hold ? textArea.selectionStart : start, end);
    textArea.focus();
}

// ":n)" のn値を変更
function _sspp_changerate(rateGain) {
    const textArea = _promptArea();
    if (!textArea) return;
    _sspp_selectCurrentWord(textArea);
    const text = textArea.value;
    const before = text.substring(0, textArea.selectionStart);
    const after = text.substring(textArea.selectionStart);
    const newAfter = after.replace(/(:\s*([\d.]+))?\s*\)/, (m, p1, p2) => {
        const rate = (p2 ? (parseFloat(p2) || 0) : 1.1) + rateGain;
        return `:${(rate < 0) ? 0 : rate.toFixed(1)})`;
    });
    textArea.value = before + newAfter;
    textArea.dispatchEvent(new Event('input', { bubbles: true }));
    textArea.setSelectionRange(before.length, before.length);
}

// "()"で囲う
function _sspp_emphasize() {
    const textArea = _promptArea();
    if (!textArea) return;
    _sspp_selectCurrentWord(textArea);
    const text = textArea.value;
    const before = text.substring(0, textArea.selectionStart);
    const content = text.substring(textArea.selectionStart, textArea.selectionEnd);
    const after =  text.substring(textArea.selectionEnd);
    const contentR = content.replaceAll(/[()]/g, '');
    
    const newBefore = before.replace(/^(.*)\((?!.*[)>])([^(]*)$/s, '$1$2');
    const newContent = (/^\([^<()>]*\)$/s.test(content)) ? contentR : `(${contentR})`;
    const newAfter  = after.replace(/^([^<(]*)\)(.*)$/s, '$1$2');
    
    textArea.value = newBefore + newContent + newAfter;
    textArea.dispatchEvent(new Event('input', { bubbles: true }));
    textArea.setSelectionRange(newBefore.length, newBefore.length + newContent.length);
}

const clipboard = []
function sspp_setClip() {
    const textArea = _promptArea();
    clipboard.push(textArea.value);
}
function _updateClipSelector() {
    
}


// CSSのインジェクション/解除を切り替える
function _toggleResponsiveCSS() {
    const cssID = 'responsive-design-css';
    const existingLink = document.getElementById(cssID);
    
    if (!existingLink) {
        // CSSが注入されていない場合 → 注入する
        const link = document.createElement('link');
        link.id = cssID;
        link.rel = 'stylesheet';
        link.type = 'text/css';
        link.href = 'file=extensions/sd-webui-smartphone-plus/responsive.css?n='+((Math.random()*10000)&0);
        document.head.appendChild(link);
        return true
    } else {
        existingLink.remove();
        return false
    }
}

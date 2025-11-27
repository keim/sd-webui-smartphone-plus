// 画面上部のInjectパネルの表示/非表示を切り替える
function insertPanel() {
    const panel = document.createElement('div');

    // Injectボタンの追加
    _insertButton(panel, "", "responsive-design-inject-button", "", e => {
        panel.classList.toggle("opened", _toggleResponsiveCSS());
    });
    // Negaボタンの追加
    _insertButton(panel, "Nega", "nagetive-prompt-toggle-button", "operator", e => {
        document.getElementById('tabs').classList.toggle("nega-hidden");
    });
    // Sampleボタンの追加
    _insertButton(panel, "Sample", "sample-toggle-button", "operator", e => {
        document.getElementById('tabs').classList.toggle("sample-hidden");
    });
    // Sizeボタンの追加
    _insertButton(panel, "Size", "size-toggle-button", "operator", e => {
        document.getElementById('tabs').classList.toggle("size-hidden");
    });

    // パネル追加
    panel.id = 'responsive-design-inject-panel';
    document.body.insertBefore(panel, document.body.firstChild);
    
    console.log("Responsive design CSS injector has been loaded.")
}


// パネルにボタンを追加するユーティリティ関数
function _insertButton(panel, label, id, className, onClick) {
    const button = document.createElement('button');
    button.id = id;
    button.className = className;
    button.textContent = label;
    button.addEventListener('click', onClick);
    panel.appendChild(button);
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
        link.href = 'file=extensions/sd-webui-smartphone-plus/responsive.css';
        document.head.appendChild(link);

        // Negaボタンの初期状態設定
        document.getElementById('tabs').classList.add("nega-hidden", "size-hidden", "sample-hidden");

        return true
    } else {
        existingLink.remove();
        return false
    }
}


// ページ読み込み時に自動的にInjectボタンを表示
document.addEventListener('DOMContentLoaded', insertPanel);

// ==UserScript==
// @name         Clicar no Último Link do Dono da Live no YouTube
// @namespace    http://yourwebsite.com/
// @version      0.1
// @description  Clica no último link enviado pelo dono da live no Live Chat do YouTube quando ativado pela tecla 'G'.
// @author       You
// @match        https://www.youtube.com/*
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    const teclaAtivacaoG = 'B'

    function ativarScript() {
        const messages = document.querySelectorAll('yt-live-chat-text-message-renderer');
        let ultimoLink = null;
        for (let i = messages.length - 1; i >= 0; i--) {
            const message = messages[i];
            const authorType = message.getAttribute('author-type');
            if (authorType === 'owner') {
                const link = message.querySelector('a');
                if (link) {
                    ultimoLink = link;
                    break;
                }
            }
        }
        if (ultimoLink) {
            ultimoLink.click();
        }
    }
    document.addEventListener('keydown', function(event) {
        if (event.key === teclaAtivacaoG) {
            ativarScript();
        }
    });
})();

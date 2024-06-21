const puppeteer = require('puppeteer');
const path = require('path');
const userDataDir = path.join(__dirname, 'user_data');
const livechatPath = path.join(__dirname, 'extensoes', 'livechat');
const tampermonkey = path.join(__dirname, 'extensoes', 'tampermonkey');

(async () => {
    const browser = await puppeteer.launch({
        headless: false,
        args: [
            `--user-data-dir=${userDataDir}`,
            `--disable-extensions-except=${livechatPath},${tampermonkey}`,
            `--load-extension=${livechatPath},${tampermonkey}`
        ]
    });

    const page = await browser.newPage();
    await page.setViewport({ width: 1366, height: 768 });
    await page.goto("https://www.youtube.com/watch?v=MaUHQLjOFmI");

    const checkURL = (url) => {
        const regex = /^https?:\/\/www\.pichau\.com\.br\/.*$/;
        return regex.test(url);
    };

    browser.on('targetcreated', async (target) => {
        if (target.type() === 'page') {
            const newPage = await target.page();
            await newPage.setViewport({ width: 1366, height: 768 });
            await newPage.waitForNavigation({ waitUntil: 'domcontentloaded' });
            const newPageURL = newPage.url();
            if (checkURL(newPageURL)) {
                try {
                    await newPage.waitForSelector('[data-cy="add-to-cart"]');
                    await newPage.waitForFunction(() => {
                        const button = document.querySelector('[data-cy="add-to-cart"]');
                        return button && !button.classList.contains('Mui-disabled');
                    });
                    await newPage.click('[data-cy="add-to-cart"]');
                    console.log('Produto adicionado ao carrinho na página da Pichau.');

                    // Vai para o checkout
                    await newPage.waitForSelector('[data-cy="go-to-checkout"]');
                    await newPage.click('[data-cy="go-to-checkout"]');

                    // Preenche o endereço
                    await newPage.waitForSelector('.MuiFormGroup-root [data-cy="shipping-method-item"] input[type="radio"]');
                    await newPage.waitForSelector('.MuiBackdrop-root');
                    await newPage.evaluate(() => {
                        const element = document.querySelector('.MuiBackdrop-root');
                        if (element) {
                            element.remove();
                        }
                    });
                    await newPage.evaluate(() => {
                        const firstRadioButton = document.querySelector('.MuiFormGroup-root [data-cy="shipping-method-item"] input[type="radio"]');
                        firstRadioButton.click();
                    });

                    // Segue para o pagamento
                    await newPage.waitForSelector('[data-cy="address-continue-to-payment"]');
                    await newPage.click('[data-cy="address-continue-to-payment"]');

                    // Escolhe o pagamento por pix
                    await newPage.waitForSelector('[value="mercadopago_custom_pix"]');
                    await newPage.waitForSelector('.MuiBackdrop-root');
                    await newPage.evaluate(() => {
                        const element = document.querySelector('.MuiBackdrop-root');
                        if (element) {
                            element.remove();
                        }
                    });
                    await newPage.evaluate(() => {
                        document.querySelector('[value="mercadopago_custom_pix"]').click();
                    });

                    // Segue para conclusão
                    await newPage.waitForSelector('[data-cy="payment-continue-to-review"]');
                    await newPage.click('[data-cy="payment-continue-to-review"]');

                    // Aceita os termos
                    await newPage.waitForSelector('input[name="gilad"]');
                    await newPage.click('input[name="gilad"]');

                    // ATIVAR O CAPTCHA

                    // Finaliza a compra
                    await newPage.waitForFunction(() => {
                        const button = document.querySelector('[data-cy="finalize-order"]');
                        return button && !button.disabled;
                    });
                    await newPage.click('[data-cy="finalize-order"]');
                } catch (er) {
                    console.error('Erro ao processar a página:', er);
                }
            }
        }
    });
})();
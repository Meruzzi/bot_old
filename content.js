// Intercepta todas as solicitações de rede
page.setRequestInterception(true);

page.on('request', (request) => {
    const requestType = request.resourceType();

    // Verifica se a solicitação é para um arquivo CSS ou uma imagem
    if (requestType === 'stylesheet' || requestType === 'image') {
        // Aborta a solicitação
        request.abort();
    } else {
        // Permite que todas as outras solicitações prossigam normalmente
        request.continue();
    }
});

document.getElementById('downloadBtn').addEventListener('click', async () => {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (!tab.id) return;

    const results = await chrome.scripting.executeScript({
        target: { tabId: tab.id },
        world: "MAIN",
        func: () => {
            const result = {};
            if (window.monaco && monaco.editor && monaco.editor.getModels) {
                monaco.editor.getModels().forEach(m =>  result[m.uri.path] = m.getValue());
            }
            return result;
        }
    });

    const result = results[0].result;
    if (Object.keys(result).length === 0) {
        alert('Код не найден на странице');
        return;
    }

    const zip = new JSZip();
    for (const [key, value] of Object.entries(result)) {
        zip.file(key, value);
    }
    const blob = await zip.generateAsync({ type: 'blob' });

    const url = URL.createObjectURL(blob);
    chrome.downloads.download({
        url,
        filename: 'practicum_code.zip',
        saveAs: true
    });
});

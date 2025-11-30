import Ajax from '../../ajax.js';

const ajax = new Ajax({
    baseURL: 'https://jsonplaceholder.typicode.com',
    timeout: 8000,
});

const fetchBtn = document.getElementById('fetch-data');
const errorBtn = document.getElementById('fetch-error');
const resetBtn = document.getElementById('reset');
const loader = document.getElementById('loader');
const itemsList = document.getElementById('items');
const message = document.getElementById('message');

function setLoading(on) {
    loader.hidden = !on;
    fetchBtn.disabled = on;
    errorBtn.disabled = on;
    resetBtn.disabled = on;
}

function showMessage(text, isError = true) {
    message.textContent = text || '';
    message.style.color = isError ? '#900' : '#080';
}

function clearView() {
    itemsList.innerHTML = '';
    showMessage('', false);
}

async function fetchData() {
    clearView();
    setLoading(true);
    showMessage('');
    try {
        const data = await ajax.get('/posts', { params: { _limit: 10 } });
        if (!Array.isArray(data)) throw new Error('Nieprawidłowa odpowiedź');
        data.forEach((item) => {
            const li = document.createElement('li');
            const title = document.createElement('div');
            title.className = 'item-title';
            title.textContent = item.title;
            const body = document.createElement('div');
            body.className = 'item-body';
            body.textContent = item.body;
            li.appendChild(title);
            li.appendChild(body);
            itemsList.appendChild(li);
        });
        showMessage(`Pobrano ${data.length} elementów.`, false);
    } catch (err) {
        const msg = err && err.message ? err.message : String(err);
        showMessage(`Błąd pobierania: ${msg}`);
    } finally {
        setLoading(false);
    }
}

async function fetchError() {
    clearView();
    setLoading(true);
    showMessage('');
    try {
        await ajax.get('/invalid-endpoint');
        showMessage('Otrzymano odpowiedź (oczekiwano błąd)', false);
    } catch (err) {
        const body =
            err && err.body
                ? typeof err.body === 'string'
                    ? err.body
                    : JSON.stringify(err.body)
                : '';
        showMessage(
            `Oczekiwany błąd: ${err.message}${body ? ' — ' + body : ''}`
        );
    } finally {
        setLoading(false);
    }
}

fetchBtn.addEventListener('click', fetchData);
errorBtn.addEventListener('click', fetchError);
resetBtn.addEventListener('click', () => {
    clearView();
});

// initial state
clearView();

document.addEventListener('DOMContentLoaded', () => {
    const predefinedColors = [
        { hsl: 'hsl(200, 70%, 80%)', name: 'Niebieski' },
        { hsl: 'hsl(150, 70%, 80%)', name: 'Zielony' },
        { hsl: 'hsl(350, 70%, 80%)', name: 'Czerwony' },
        { hsl: 'hsl(50, 70%, 80%)', name: 'Żółty' },
        { hsl: 'hsl(280, 70%, 80%)', name: 'Fioletowy' },
        { hsl: 'hsl(25, 70%, 80%)', name: 'Pomarańczowy' },
        { hsl: 'hsl(180, 70%, 80%)', name: 'Turkusowy' },
        { hsl: 'hsl(330, 70%, 80%)', name: 'Różowy' },
        { hsl: 'hsl(100, 70%, 80%)', name: 'Limonkowy' },
    ];

    let activeColorPicker = null;

    document.getElementById('clear-all').addEventListener('click', () => {
        if (confirm('Czy na pewno chcesz usunąć wszystkie karty?')) {
            document.querySelectorAll('.cards').forEach((container) => {
                container.innerHTML = '';
            });
            updateAllCounters();
            saveCards();
        }
    });

    function createColorPicker(card, button) {
        if (activeColorPicker) {
            activeColorPicker.remove();
        }

        const picker = document.createElement('div');
        picker.className = 'color-picker';

        const buttonRect = button.getBoundingClientRect();
        picker.style.position = 'fixed';
        picker.style.top = buttonRect.bottom + 5 + 'px';
        picker.style.left = buttonRect.left + 'px';

        predefinedColors.forEach((color) => {
            const option = document.createElement('button');
            option.className = 'color-option';
            option.style.backgroundColor = color.hsl;
            option.title = color.name;
            option.addEventListener('click', (e) => {
                e.stopPropagation();
                card.style.backgroundColor = color.hsl;
                picker.remove();
                activeColorPicker = null;
                saveCards();
            });
            picker.appendChild(option);
        });

        document.body.appendChild(picker);
        activeColorPicker = picker;

        const closeColorPicker = (e) => {
            if (!picker.contains(e.target) && e.target !== button) {
                picker.remove();
                activeColorPicker = null;
                document.removeEventListener('click', closeColorPicker);
            }
        };

        setTimeout(() => {
            document.addEventListener('click', closeColorPicker);
        }, 0);
    }

    let currentColorIndex = 0;

    function getRandomColor() {
        return predefinedColors[
            Math.floor(Math.random() * predefinedColors.length)
        ].hsl;
    }

    function updateCardCounter(column) {
        const counter = column.querySelector('.card-counter');
        const cards = column.querySelector('.cards').children.length;
        counter.textContent = cards;
        counter.style.background = cards > 0 ? 'var(--primary-color)' : '#ccc';
    }

    function updateAllCounters() {
        document.querySelectorAll('.column').forEach(updateCardCounter);
    }

    function generateId() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2);
    }

    function moveCard(card, direction) {
        const currentColumn = card.closest('.column');
        const columns = Array.from(document.querySelectorAll('.column'));
        const currentIndex = columns.indexOf(currentColumn);
        const newIndex =
            direction === 'right' ? currentIndex + 1 : currentIndex - 1;

        if (newIndex >= 0 && newIndex < columns.length) {
            const targetColumn = columns[newIndex];
            const cardsContainer = targetColumn.querySelector('.cards');
            cardsContainer.appendChild(card);

            document.querySelectorAll('.card').forEach((card) => {
                updateMoveButtons(card);
            });

            updateAllCounters();
            saveCards();
        }
    }

    function updateMoveButtons(card) {
        const currentColumn = card.closest('.column');
        const columns = Array.from(document.querySelectorAll('.column'));
        const currentIndex = columns.indexOf(currentColumn);

        const leftBtn = card.querySelector('[data-direction="left"]');
        const rightBtn = card.querySelector('[data-direction="right"]');

        leftBtn.disabled = currentIndex === 0;
        rightBtn.disabled = currentIndex === columns.length - 1;
    }

    function createCard(text = '') {
        const card = document.createElement('div');
        card.className = 'card';
        card.style.backgroundColor = getRandomColor();
        card.dataset.id = generateId();

        const textDiv = document.createElement('div');
        textDiv.className = 'card-text';
        textDiv.setAttribute('contenteditable', 'true');
        textDiv.textContent = text;

        const buttonsContainer = document.createElement('div');
        buttonsContainer.className = 'card-buttons';

        const leftBtn = document.createElement('button');
        leftBtn.className = 'card-button';
        leftBtn.textContent = '←';
        leftBtn.dataset.direction = 'left';
        leftBtn.title = 'Przesuń w lewo';

        const rightBtn = document.createElement('button');
        rightBtn.className = 'card-button';
        rightBtn.textContent = '→';
        rightBtn.dataset.direction = 'right';
        rightBtn.title = 'Przesuń w prawo';

        const colorBtn = document.createElement('button');
        colorBtn.className = 'card-button';
        colorBtn.textContent = '🎨';
        colorBtn.title = 'Zmień kolor';
        colorBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            createColorPicker(card, e.target);
        });

        const deleteBtn = document.createElement('button');
        deleteBtn.className = 'card-button';
        deleteBtn.textContent = '×';
        deleteBtn.title = 'Usuń kartę';
        deleteBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            card.remove();
            updateAllCounters();
            saveCards();
        });

        buttonsContainer.appendChild(leftBtn);
        buttonsContainer.appendChild(rightBtn);
        buttonsContainer.appendChild(colorBtn);
        buttonsContainer.appendChild(deleteBtn);
        card.appendChild(textDiv);
        card.appendChild(buttonsContainer);

        return card;
    }

    function addCard(column) {
        const cardsContainer = column.querySelector('.cards');
        const card = createCard('Nowa karta');
        cardsContainer.appendChild(card);
        updateMoveButtons(card);
        updateCardCounter(column);
        saveCards();
    }

    function saveCards() {
        const columns = document.querySelectorAll('.column');
        const kanbanData = {};

        columns.forEach((column) => {
            const columnId = column.dataset.column;
            const cards = column.querySelectorAll('.card');
            kanbanData[columnId] = Array.from(cards).map((card) => ({
                id: card.dataset.id,
                text: card.querySelector('.card-text').textContent,
                color: card.style.backgroundColor,
            }));
        });

        localStorage.setItem('kanbanCards', JSON.stringify(kanbanData));
    }

    function loadCards() {
        const savedCards = localStorage.getItem('kanbanCards');
        if (savedCards) {
            const kanbanData = JSON.parse(savedCards);
            Object.entries(kanbanData).forEach(([columnId, cards]) => {
                const column = document.querySelector(
                    `[data-column="${columnId}"]`
                );
                const cardsContainer = column.querySelector('.cards');

                cards.forEach((cardData) => {
                    const card = createCard(cardData.text);
                    card.style.backgroundColor = cardData.color;
                    card.dataset.id = cardData.id;
                    cardsContainer.appendChild(card);
                    updateMoveButtons(card);
                });
            });
        }
    }

    document.addEventListener('input', (e) => {
        if (e.target.classList.contains('card')) {
            saveCards();
        }
    });

    function sortCards(column) {
        const cardsContainer = column.querySelector('.cards');
        const cards = Array.from(cardsContainer.children);

        cards.sort((a, b) => {
            const textA = a
                .querySelector('.card-text')
                .textContent.toLowerCase();
            const textB = b
                .querySelector('.card-text')
                .textContent.toLowerCase();
            return textA.localeCompare(textB);
        });

        cards.forEach((card) => cardsContainer.appendChild(card));
        saveCards();
    }

    function colorColumn(column) {
        const cards = Array.from(column.querySelectorAll('.card'));
        const usedColors = new Set();

        cards.forEach((card) => {
            let availableColors = predefinedColors.filter(
                (color) => !usedColors.has(color.hsl)
            );

            if (availableColors.length === 0) {
                usedColors.clear();
                availableColors = predefinedColors;
            }

            const randomIndex = Math.floor(
                Math.random() * availableColors.length
            );
            const selectedColor = availableColors[randomIndex];

            card.style.backgroundColor = selectedColor.hsl;
            usedColors.add(selectedColor.hsl);
        });

        saveCards();
    }

    document.querySelector('.kanban').addEventListener('click', (e) => {
        if (
            e.target.dataset.direction === 'left' ||
            e.target.dataset.direction === 'right'
        ) {
            e.stopPropagation();
            const card = e.target.closest('.card');
            const direction = e.target.dataset.direction;
            moveCard(card, direction);
        }
    });

    document.querySelectorAll('.add-card').forEach((button) => {
        button.addEventListener('click', () => {
            const column = button.closest('.column');
            addCard(column);
        });
    });

    document.querySelectorAll('.color-column').forEach((button) => {
        button.addEventListener('click', () => {
            const column = button.closest('.column');
            colorColumn(column);
        });
    });

    document.querySelectorAll('.sort-button').forEach((button) => {
        button.addEventListener('click', () => {
            const column = button.closest('.column');
            sortCards(column);
        });
    });

    loadCards();

    updateAllCounters();
});

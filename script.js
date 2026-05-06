document.addEventListener('DOMContentLoaded', () => {
    const scheduleContainer = document.getElementById('schedule');
    const categorySearchInput = document.getElementById('categorySearch');
    const clearSearchButton = document.getElementById('clearSearch');
    let allScheduleData = []; // To store the fetched schedule data

    async function fetchSchedule() {
        try {
            const response = await fetch('/api/schedule');
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            allScheduleData = await response.json();
            renderSchedule(allScheduleData);
        } catch (error) {
            console.error('Error fetching schedule:', error);
            scheduleContainer.innerHTML = '<p>Failed to load schedule. Please try again later.</p>';
        }
    }

    function renderSchedule(scheduleToRender) {
        scheduleContainer.innerHTML = ''; // Clear previous content

        if (scheduleToRender.length === 0) {
            scheduleContainer.innerHTML = '<p>No talks found matching your criteria.</p>';
            return;
        }

        scheduleToRender.forEach(item => {
            const card = document.createElement('div');
            card.classList.add(item.type === 'talk' ? 'talk-card' : 'break-card');
            card.dataset.categories = item.categories ? item.categories.map(cat => cat.toLowerCase()).join(',') : '';

            let content = `<h2>${item.title}</h2>`;
            content += `<p><strong>Time:</strong> ${item.startTime} - ${item.endTime}</p>`;

            if (item.type === 'talk') {
                content += `<p class="speakers"><strong>Speaker(s):</strong> ${item.speakers.join(', ')}</p>`;
                content += `<p>${item.description}</p>`;
                if (item.categories && item.categories.length > 0) {
                    content += '<p class="categories"><strong>Categories:</strong> ';
                    item.categories.forEach(cat => {
                        content += `<span class="category-tag">${cat}</span>`;
                    });
                    content += '</p>';
                }
            } else if (item.type === 'break') {
                content += `<p>${item.description}</p>`;
            }

            card.innerHTML = content;
            scheduleContainer.appendChild(card);
        });
    }

    function filterSchedule() {
        const searchTerm = categorySearchInput.value.toLowerCase().trim();
        if (!searchTerm) {
            renderSchedule(allScheduleData); // Show all if search term is empty
            return;
        }

        const filtered = allScheduleData.filter(item => {
            if (item.type === 'talk' && item.categories) {
                return item.categories.some(category =>
                    category.toLowerCase().includes(searchTerm)
                );
            }
            return false; // Don't filter breaks by category
        });
        renderSchedule(filtered);
    }

    // Event listeners for search
    categorySearchInput.addEventListener('input', filterSchedule);
    clearSearchButton.addEventListener('click', () => {
        categorySearchInput.value = '';
        filterSchedule(); // Re-render with all talks
    });


    // Initial fetch and render
    fetchSchedule();
});

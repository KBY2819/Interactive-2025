document.addEventListener("DOMContentLoaded", function () {
    const leftColumn = document.querySelector('.left');
    const rightColumn = document.querySelector('.right');
    const sections = document.querySelectorAll('.section');
    const itemsContainers = document.querySelectorAll('.items-container');

    // Sync right column with left column scrolling
    leftColumn.addEventListener("scroll", function () {
        let activeSection = null;
        sections.forEach(section => {
            const rect = section.getBoundingClientRect();
            if (rect.top >= 0 && rect.top < window.innerHeight / 2) {
                activeSection = section.id;
            }
        });

        if (activeSection) {
            itemsContainers.forEach(container => {
                if (container.getAttribute('data-section') === activeSection) {
                    container.classList.add('active');
                    rightColumn.scrollTop = container.offsetTop;
                } else {
                    container.classList.remove('active');
                }
            });
        }
    });
});
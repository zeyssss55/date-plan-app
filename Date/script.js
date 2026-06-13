document.addEventListener('DOMContentLoaded', () => {
    // State Variables
    let currentStep = 1;
    let selectedDate = null;
    let selectedTime = null;
    let selectedActivities = [];

    // Date Object for Calendar rendering
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Reset time for easy date-only comparisons
    let calendarYear = today.getFullYear();
    let calendarMonth = today.getMonth();

    const indonesianMonths = [
        'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
        'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
    ];
    const indonesianDays = [
        'Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'
    ];

    // DOM Elements
    const heartsBg = document.getElementById('hearts-bg');
    const btnNo = document.getElementById('btn-no');
    const btnYes = document.getElementById('btn-yes');
    const btnLetsGo = document.getElementById('btn-lets-go');
    const btnToStep3 = document.getElementById('btn-to-step3');
    const btnToStep4 = document.getElementById('btn-to-step4');
    const btnReset = document.getElementById('btn-reset');
    const btnWhatsapp = document.getElementById('btn-whatsapp');

    const calendarDaysGrid = document.getElementById('calendar-days');
    const monthYearDisplay = document.getElementById('month-year-display');
    const prevMonthBtn = document.getElementById('prev-month');
    const nextMonthBtn = document.getElementById('next-month');

    // ==========================================
    // 1. FLOATING HEARTS BACKGROUND
    // ==========================================
    const createFloatingHeart = () => {
        const heart = document.createElement('div');
        heart.classList.add('floating-heart');

        // Random size (12px to 32px)
        const size = Math.random() * 20 + 12;
        heart.style.width = `${size}px`;
        heart.style.height = `${size}px`;

        // Random horizontal position (0% to 100%)
        heart.style.left = `${Math.random() * 100}%`;

        // Random animation duration (4s to 8s)
        const duration = Math.random() * 4 + 4;
        heart.style.animationDuration = `${duration}s`;

        // Random transparency
        heart.style.opacity = (Math.random() * 0.4 + 0.2).toString();

        // SVG Heart template
        heart.innerHTML = `
            <svg viewBox="0 0 32 29.6" style="width: 100%; height: 100%;">
                <path d="M23.6,0c-3.4,0-6.3,2.7-7.6,5.6C14.7,2.7,11.8,0,8.4,0C3.8,0,0,3.8,0,8.4c0,9.4,9.5,11.9,16,21.2
                c6.1-9.3,16-12.1,16-21.2C32,3.8,28.2,0,23.6,0z"/>
            </svg>
        `;

        heartsBg.appendChild(heart);

        // Remove element after animation completes
        setTimeout(() => {
            heart.remove();
        }, duration * 1000);
    };

    // Spawn hearts periodically
    setInterval(createFloatingHeart, 600);
    // Initial batch
    for (let i = 0; i < 8; i++) {
        setTimeout(createFloatingHeart, Math.random() * 2000);
    }

    // ==========================================
    // 2. EVADING "NO" BUTTON
    // ==========================================
    const moveBtnNo = (e) => {
        // Prevent default tap behaviors on mobile to stop clicks
        if (e) e.preventDefault();

        btnNo.classList.add('evading');

        const card = btnNo.closest('.step-card');
        const btnWidth = btnNo.offsetWidth;
        const btnHeight = btnNo.offsetHeight;
        const cardWidth = card.clientWidth;
        const cardHeight = card.clientHeight;

        // Keep inside the card container with a padding
        const padding = 20;
        const maxLeft = cardWidth - btnWidth - padding;
        const maxTop = cardHeight - btnHeight - padding;

        let randomLeft = Math.random() * (maxLeft - padding) + padding;
        let randomTop = Math.random() * (maxTop - padding) + padding;

        // Ensure bounds are non-negative
        randomLeft = Math.max(padding, randomLeft);
        randomTop = Math.max(padding, randomTop);

        // If the position matches exactly where cursor is, offset it slightly
        if (e && e.clientX && e.clientY) {
            const cardRect = card.getBoundingClientRect();
            const mouseX = e.clientX - cardRect.left;
            const mouseY = e.clientY - cardRect.top;

            const distanceX = Math.abs(randomLeft - mouseX);
            const distanceY = Math.abs(randomTop - mouseY);

            if (distanceX < 80 && distanceY < 80) {
                randomLeft = (randomLeft + 150) % (maxLeft || 1);
                randomTop = (randomTop + 150) % (maxTop || 1);

                // Ensure positive bounds again after modulo
                randomLeft = Math.max(padding, randomLeft);
                randomTop = Math.max(padding, randomTop);
            }
        }

        btnNo.style.left = `${randomLeft}px`;
        btnNo.style.top = `${randomTop}px`;
    };

    btnNo.addEventListener('mouseenter', moveBtnNo);
    btnNo.addEventListener('touchstart', moveBtnNo, { passive: false });
    btnNo.addEventListener('click', (e) => {
        e.preventDefault();
        moveBtnNo(e);
    });

    // ==========================================
    // 3. STEP MANAGEMENT (SPA TRANSITIONS)
    // ==========================================
    const goToStep = (stepId) => {
        // Validate transitions
        if (stepId === 4) {
            compileSummary();
        }

        // Deactivate current active step
        const currentActiveCard = document.querySelector('.step-card.active');
        if (currentActiveCard) {
            currentActiveCard.style.opacity = '0';
            currentActiveCard.style.transform = 'rotateX(-10deg) translateY(-30px)';

            setTimeout(() => {
                currentActiveCard.classList.remove('active');

                // Activate new step
                const nextActiveCard = document.getElementById(`step-${stepId}`);
                if (!nextActiveCard) return;

                // Pre-set to hidden entry state BEFORE adding active (so display:flex kicks in)
                nextActiveCard.style.opacity = '0';
                nextActiveCard.style.transform = 'rotateX(10deg) translateY(30px)';
                nextActiveCard.classList.add('active');

                // Next frame: clear inline styles so CSS transition animates them to their active values
                requestAnimationFrame(() => {
                    requestAnimationFrame(() => {
                        nextActiveCard.style.opacity = '';
                        nextActiveCard.style.transform = '';
                    });
                });
            }, 300);
        }
        currentStep = stepId;
    };

    btnYes.addEventListener('click', () => {
        goToStep('1b');
        spawnConfetti();
    });
    btnLetsGo.addEventListener('click', () => goToStep(2));
    btnToStep3.addEventListener('click', () => goToStep(3));
    btnToStep4.addEventListener('click', () => goToStep(4));

    // Handle Back Buttons
    document.querySelectorAll('.btn-back').forEach(btn => {
        btn.addEventListener('click', () => {
            const prevStep = btn.getAttribute('data-prev');
            goToStep(isNaN(prevStep) ? prevStep : parseInt(prevStep, 10));
        });
    });

    // ==========================================
    // CONFETTI BURST (for reaction page)
    // ==========================================
    const confettiColors = ['#ff4b72', '#ffd166', '#a8d8f0', '#c9b8ff', '#80ffcc', '#ffb347'];
    const spawnConfetti = () => {
        const container = document.getElementById('confetti-container');
        if (!container) return;
        container.innerHTML = '';
        for (let i = 0; i < 60; i++) {
            const piece = document.createElement('div');
            piece.classList.add('confetti-piece');
            const color = confettiColors[Math.floor(Math.random() * confettiColors.length)];
            const size = Math.random() * 10 + 6;
            const left = Math.random() * 100;
            const delay = Math.random() * 0.8;
            const duration = Math.random() * 1.5 + 1.2;
            const rotation = Math.random() * 360;
            const isCircle = Math.random() > 0.5;
            piece.style.cssText = `
                width: ${size}px;
                height: ${isCircle ? size : size * 0.5}px;
                background: ${color};
                left: ${left}%;
                top: -10px;
                border-radius: ${isCircle ? '50%' : '2px'};
                animation-delay: ${delay}s;
                animation-duration: ${duration}s;
                transform: rotate(${rotation}deg);
            `;
            container.appendChild(piece);
            setTimeout(() => piece.remove(), (delay + duration + 0.5) * 1000);
        }
    };

    // ==========================================
    // 4. CALENDAR RENDER & LOGIC (STEP 2)
    // ==========================================
    const renderCalendar = (year, month) => {
        calendarDaysGrid.innerHTML = '';
        monthYearDisplay.textContent = `${indonesianMonths[month]} ${year}`;

        // Get index of first day (Monday-start format)
        // JS getDay() returns 0 for Sunday, 1 for Monday...
        let firstDayIndex = new Date(year, month, 1).getDay() - 1;
        if (firstDayIndex === -1) firstDayIndex = 6; // Shift Sunday to index 6

        const totalDays = new Date(year, month + 1, 0).getDate();
        const prevTotalDays = new Date(year, month, 0).getDate();

        // 1. Previous Month Days (faded / disabled)
        for (let i = firstDayIndex - 1; i >= 0; i--) {
            const dayDiv = document.createElement('div');
            dayDiv.classList.add('calendar-day', 'disabled');
            dayDiv.textContent = prevTotalDays - i;
            calendarDaysGrid.appendChild(dayDiv);
        }

        // 2. Current Month Days
        for (let d = 1; d <= totalDays; d++) {
            const dayDiv = document.createElement('div');
            dayDiv.classList.add('calendar-day');
            dayDiv.textContent = d;

            const checkDate = new Date(year, month, d);
            checkDate.setHours(0, 0, 0, 0);

            // Mark today
            if (checkDate.getTime() === today.getTime()) {
                dayDiv.classList.add('today');
            }

            // Disable past dates to make planner realistic & smart
            if (checkDate < today) {
                dayDiv.classList.add('disabled');
            } else {
                // Attach click listener only to active/future dates
                dayDiv.addEventListener('click', () => {
                    // Remove selection from others
                    document.querySelectorAll('.calendar-day.selected').forEach(el => {
                        el.classList.remove('selected');
                    });
                    // Mark this selected
                    dayDiv.classList.add('selected');
                    selectedDate = checkDate;
                    checkStep2Validation();
                });

                // If this is the currently selected date, re-apply class
                if (selectedDate && checkDate.getTime() === selectedDate.getTime()) {
                    dayDiv.classList.add('selected');
                }
            }

            calendarDaysGrid.appendChild(dayDiv);
        }

        // 3. Next Month Days (faded / disabled) to complete a 6-row grid (42 blocks)
        const totalRendered = firstDayIndex + totalDays;
        const remainingBlocks = 42 - totalRendered;
        for (let i = 1; i <= remainingBlocks; i++) {
            const dayDiv = document.createElement('div');
            dayDiv.classList.add('calendar-day', 'disabled');
            dayDiv.textContent = i;
            calendarDaysGrid.appendChild(dayDiv);
        }
    };

    prevMonthBtn.addEventListener('click', () => {
        calendarMonth--;
        if (calendarMonth < 0) {
            calendarMonth = 11;
            calendarYear--;
        }
        renderCalendar(calendarYear, calendarMonth);
    });

    nextMonthBtn.addEventListener('click', () => {
        calendarMonth++;
        if (calendarMonth > 11) {
            calendarMonth = 0;
            calendarYear++;
        }
        renderCalendar(calendarYear, calendarMonth);
    });

    // Render calendar initially
    renderCalendar(calendarYear, calendarMonth);

    // ==========================================
    // 5. TIME PREFERENCE SELECTION (STEP 2)
    // ==========================================
    const timeCards = document.querySelectorAll('.time-card');
    timeCards.forEach(card => {
        card.addEventListener('click', () => {
            timeCards.forEach(c => c.classList.remove('selected'));
            card.classList.add('selected');
            selectedTime = card.getAttribute('data-time');
            checkStep2Validation();
        });
    });

    // Validation for Step 2: Date + Time must be chosen
    const checkStep2Validation = () => {
        if (selectedDate && selectedTime) {
            btnToStep3.disabled = false;
        } else {
            btnToStep3.disabled = true;
        }
    };

    // ==========================================
    // 6. ACTIVITY SELECTION (STEP 3)
    // ==========================================
    const activityCards = document.querySelectorAll('.activity-card');
    activityCards.forEach(card => {
        card.addEventListener('click', () => {
            const activityName = card.getAttribute('data-activity');
            const activityEmoji = card.getAttribute('data-emoji');

            // Toggle selection
            if (card.classList.contains('selected')) {
                card.classList.remove('selected');
                selectedActivities = selectedActivities.filter(act => act.name !== activityName);
            } else {
                card.classList.add('selected');
                selectedActivities.push({ name: activityName, emoji: activityEmoji });
            }

            checkStep3Validation();
        });
    });

    // Validation for Step 3: At least 1 activity must be chosen
    const checkStep3Validation = () => {
        if (selectedActivities.length > 0) {
            btnToStep4.disabled = false;
        } else {
            btnToStep4.disabled = true;
        }
    };

    // ==========================================
    // 7. SUMMARY COMPILATION & WHATSAPP EXPORT
    // ==========================================
    const compileSummary = () => {
        // 1. Format date (Indonesian style: Hari, DD Bulan YYYY)
        const dayName = indonesianDays[selectedDate.getDay()];
        const dayNum = selectedDate.getDate();
        const monthName = indonesianMonths[selectedDate.getMonth()];
        const yearNum = selectedDate.getFullYear();
        const formattedDate = `${dayName}, ${dayNum} ${monthName} ${yearNum}`;

        document.getElementById('summary-date').textContent = formattedDate;

        // 2. Format time
        let timeEmoji = '🌅';
        let timeHours = '08:00 - 11:00';
        if (selectedTime === 'Sore') {
            timeEmoji = '🌇';
            timeHours = '15:00 - 18:00';
        } else if (selectedTime === 'Malam') {
            timeEmoji = '🌃';
            timeHours = '19:00 - 22:00';
        } else if (selectedTime === 'Late Night') {
            timeEmoji = '🌌';
            timeHours = '22:00 - Selesai';
        }
        document.getElementById('summary-time').textContent = `${timeEmoji} ${selectedTime} (${timeHours})`;

        // 3. Compile activities tags
        const activitiesContainer = document.getElementById('summary-activities');
        activitiesContainer.innerHTML = '';
        selectedActivities.forEach(act => {
            const tag = document.createElement('span');
            tag.classList.add('summary-tag');
            tag.textContent = `${act.emoji} ${act.name}`;
            activitiesContainer.appendChild(tag);
        });

        // 4. Construct WhatsApp Message Link
        let activitiesListText = '';
        selectedActivities.forEach((act, idx) => {
            activitiesListText += `${idx + 1}. ${act.emoji} ${act.name}\n`;
        });

        const rawMessage =
            `Hai! Aku udah ngisi Date Planner kita 💖

📅 Tanggal: ${formattedDate}
⏰ Waktu: ${timeEmoji} ${selectedTime} (${timeHours})
✨ Kegiatan Kencan:
${activitiesListText}
Nggak sabar buat ngedate bareng kamu! 🥰👉👈`;

        const encodedMessage = encodeURIComponent(rawMessage);
        // Direct to specific WhatsApp number: 087787444187 → international format 6287787444187
        btnWhatsapp.href = `https://api.whatsapp.com/send?phone=6287787444187&text=${encodedMessage}`;
    };

    // ==========================================
    // 8. RESET PLAN
    // ==========================================
    btnReset.addEventListener('click', () => {
        // Reset selections
        selectedDate = null;
        selectedTime = null;
        selectedActivities = [];

        // Remove styling/selected classes
        document.querySelectorAll('.calendar-day.selected').forEach(el => el.classList.remove('selected'));
        document.querySelectorAll('.time-card.selected').forEach(el => el.classList.remove('selected'));
        document.querySelectorAll('.activity-card.selected').forEach(el => el.classList.remove('selected'));

        // Reset buttons to initial disabled states
        btnToStep3.disabled = true;
        btnToStep4.disabled = true;

        // Reset No button back to step-1 invite-buttons list
        btnNo.classList.remove('evading');
        btnNo.removeAttribute('style');

        // Clear confetti
        const confettiContainer = document.getElementById('confetti-container');
        if (confettiContainer) confettiContainer.innerHTML = '';

        // Render fresh calendar for today's month/year
        calendarYear = today.getFullYear();
        calendarMonth = today.getMonth();
        renderCalendar(calendarYear, calendarMonth);

        // Transition back to step 1
        goToStep(1);
    });
});

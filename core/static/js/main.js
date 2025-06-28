document.addEventListener('DOMContentLoaded', function () {


    // Creates a continuous, dynamic, and random floating animation for background icons.

    function animateBackground() {
        const iconContainer = document.querySelector('.background-icons');
        if (!iconContainer) return;

        const icons = Array.from(iconContainer.querySelectorAll('i'));
        const screenWidth = window.innerWidth;
        const screenHeight = window.innerHeight;

        // Create a state object for each icon to manage all its properties
        const iconStates = icons.map(icon => {
            const lifespan = (Math.random() * 10 + 8) * 60; // Total life in frames (8-18 seconds)
            return {
                element: icon,
                x: Math.random() * screenWidth,
                y: Math.random() * screenHeight,
                vx: (Math.random() - 0.5) * 0.4,
                vy: (Math.random() - 0.5) * 0.4,
                size: Math.random() * 55 + 25,
                age: Math.random() * lifespan, // Start at a random point in its life
                lifespan: lifespan
            };
        });

        // The main animation loop that runs on every frame
        function animationLoop() {
            iconStates.forEach(state => {
                // Update age and position
                state.age++;
                state.x += state.vx;
                state.y += state.vy;

                // --- Calculate opacity based on age (The Fade Effect) ---
                const lifePercent = state.age / state.lifespan;
                let opacity = 0;
                if (lifePercent < 0.5) {
                    // Fading In
                    opacity = lifePercent * 2 * 0.6; // 0.6 is max opacity
                } else {
                    // Fading Out
                    opacity = (1 - lifePercent) * 2 * 0.6;
                }
                state.element.style.opacity = opacity;

                // Apply the new position and initial size
                state.element.style.fontSize = `${state.size}px`;
                state.element.style.transform = `translate(${state.x}px, ${state.y}px)`;

                // --- Reset icon when its life ends ---
                if (state.age >= state.lifespan) {
                    state.age = 0;
                    state.x = Math.random() * screenWidth;
                    state.y = Math.random() * screenHeight;
                }
            });

            requestAnimationFrame(animationLoop);
        }

        animationLoop();
    }

    animateBackground();

    // Function to get CSRF token from cookies
    function getCookie(name) {
        let cookieValue = null;
        if (document.cookie && document.cookie !== '') {
            const cookies = document.cookie.split(';');
            for (let i = 0; i < cookies.length; i++) {
                const cookie = cookies[i].trim();
                if (cookie.substring(0, name.length + 1) === (name + '=')) {
                    cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                    break;
                }
            }
        }
        return cookieValue;
    }
    const csrftoken = getCookie('csrftoken');

    // Handle Like Button Clicks
    document.querySelectorAll('.like-btn').forEach(button => {
        button.addEventListener('click', function () {
            const postId = this.dataset.postId;
            fetch('/like/', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                    'X-CSRFToken': csrftoken
                },
                body: `post_id=${postId}`
            })
                .then(response => response.json())
                .then(data => {
                    const likesCountSpan = document.getElementById(`likes-count-${postId}`);
                    likesCountSpan.textContent = data.likes_count;
                    const icon = this.querySelector('i');
                    if (data.liked) {
                        icon.classList.remove('far');
                        icon.classList.add('fas');
                    } else {
                        icon.classList.remove('fas');
                        icon.classList.add('far');
                    }
                });
        });
    });

    // Handle Follow Button Click
    const followBtn = document.querySelector('.follow-btn');
    if (followBtn) {
        followBtn.addEventListener('click', function () {
            const userId = this.dataset.userId;
            fetch('/follow/', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                    'X-CSRFToken': csrftoken
                },
                body: `user_id=${userId}`
            })
                .then(response => response.json())
                .then(data => {
                    const followersCountSpan = document.getElementById('followers-count');
                    followersCountSpan.textContent = data.followers_count;
                    if (data.following) {
                        this.textContent = 'Unfollow';
                        this.classList.remove('btn-primary');
                        this.classList.add('btn-secondary');
                    } else {
                        this.textContent = 'Follow';
                        this.classList.remove('btn-secondary');
                        this.classList.add('btn-primary');
                    }
                });
        });
    }
});
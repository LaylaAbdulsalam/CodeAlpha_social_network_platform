document.addEventListener('DOMContentLoaded', function () {
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
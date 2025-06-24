from django.shortcuts import render, redirect, get_object_or_404
from django.contrib.auth.decorators import login_required
from django.contrib.auth.forms import UserCreationForm
from django.contrib.auth.models import User
from django.http import JsonResponse
from django.views.decorators.http import require_POST
from .models import Post, Profile, Follow, Comment
from .forms import PostForm, ProfileForm


# View for the main home feed
@login_required
def home(request):
    followed_users = Follow.objects.filter(follower=request.user).values_list('followed', flat=True)
    all_user_ids = list(followed_users) + [request.user.id]
    posts = Post.objects.filter(author__id__in=all_user_ids)
    
    post_form = PostForm()
    if request.method == 'POST':
        post_form = PostForm(request.POST)
        if post_form.is_valid():
            new_post = post_form.save(commit=False)
            new_post.author = request.user
            new_post.save()
            return redirect('home')

    return render(request, 'core/home.html', {'posts': posts, 'post_form': post_form})


# View for a user's public profile page
def profile(request, username):
    user = get_object_or_404(User, username=username)
    profile = get_object_or_404(Profile, user=user)
    posts = Post.objects.filter(author=user)
    is_following = Follow.objects.filter(follower=request.user, followed=user).exists() if request.user.is_authenticated else False
    followers_count = user.followers.count()
    following_count = user.following.count()

    context = {
        'profile_user': user,
        'profile': profile,
        'posts': posts,
        'is_following': is_following,
        'followers_count': followers_count,
        'following_count': following_count,
    }
    return render(request, 'core/profile.html', context)


# View for a single post and its comments
def post_detail(request, pk):
    post = get_object_or_404(Post, pk=pk)
    if request.method == 'POST':
        text = request.POST.get('comment_text')
        if text:
            Comment.objects.create(post=post, author=request.user, text=text)
            return redirect('post_detail', pk=post.pk)
    return render(request, 'core/post_detail.html', {'post': post})


# View for new user registration
def register(request):
    if request.method == 'POST':
        form = UserCreationForm(request.POST)
        if form.is_valid():
            user = form.save()
            Profile.objects.create(user=user) # Create a profile for the new user
            return redirect('login')
    else:
        form = UserCreationForm()
    return render(request, 'registration/register.html', {'form': form})


# View for editing the current user's profile
@login_required
def edit_profile(request):
    if request.method == 'POST':
        form = ProfileForm(request.POST, request.FILES, instance=request.user.profile)
        if form.is_valid():
            form.save()
            return redirect('profile', username=request.user.username)
    else:
        form = ProfileForm(instance=request.user.profile)
    
    return render(request, 'core/edit_profile.html', {'form': form})


# --- AJAX Views for Real-time Interactivity ---

# Handles liking and unliking a post via AJAX
@login_required
@require_POST
def like_post(request):
    post_id = request.POST.get('post_id')
    post = get_object_or_404(Post, id=post_id)
    if request.user in post.likes.all():
        post.likes.remove(request.user)
        liked = False
    else:
        post.likes.add(request.user)
        liked = True
    return JsonResponse({'liked': liked, 'likes_count': post.likes.count()})


# Handles following and unfollowing a user via AJAX
@login_required
@require_POST
def follow_user(request):
    user_id = request.POST.get('user_id')
    user_to_follow = get_object_or_404(User, id=user_id)
    follow, created = Follow.objects.get_or_create(follower=request.user, followed=user_to_follow)
    if not created:
        follow.delete()
        following = False
    else:
        following = True
    return JsonResponse({'following': following, 'followers_count': user_to_follow.followers.count()})
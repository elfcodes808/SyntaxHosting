(async () => {
  const messageEl = document.createElement('p');
  document.body.prepend(messageEl);

  // Helper: parse URL query params
  function getQueryParams() {
    return Object.fromEntries(new URLSearchParams(window.location.search));
  }

  const params = getQueryParams();

  if (!params.code) {
    messageEl.textContent = 'No authorization code found. Please login first.';
    messageEl.style.color = 'red';
    return;
  }

  try {
    messageEl.textContent = 'Exchanging code for tokens...';

    // Exchange code for tokens via your backend (which should call Discord token endpoint)
    const tokenRes = await fetch('https://syntaxguard-backend.onrender.com/auth/discord/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code: params.code }),
    });

    if (!tokenRes.ok) throw new Error('Token exchange failed');

    const tokenData = await tokenRes.json();

    messageEl.textContent = 'Fetching user info...';

    // Fetch user info with access token
    const userRes = await fetch('https://discord.com/api/users/@me', {
      headers: { Authorization: `Bearer ${tokenData.access_token}` },
    });

    if (!userRes.ok) throw new Error('Failed to fetch user info');

    const user = await userRes.json();

    messageEl.textContent = `Welcome, ${user.username}#${user.discriminator}! Redirecting...`;
    messageEl.style.color = 'green';

    // Save user info or token locally if needed (e.g., localStorage)
    localStorage.setItem('discordUser', JSON.stringify(user));
    localStorage.setItem('discordToken', JSON.stringify(tokenData));

    // Redirect to dashboard after 2 seconds
    setTimeout(() => {
      window.location.href = '/dashboard.html';
    }, 2000);

  } catch (err) {
    messageEl.textContent = 'Error during Discord login: ' + err.message;
    messageEl.style.color = 'red';
    console.error(err);
  }
})();

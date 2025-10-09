// Clear localStorage and test fresh login
console.log("Before clearing:", localStorage.getItem('access_token'));
localStorage.clear();
console.log("After clearing:", localStorage.getItem('access_token'));

// Test login
fetch('http://localhost:8001/api/auth/login/', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ pseudonym: 'testuser', password: 'testpass' })
})
.then(res => res.json())
.then(data => {
  console.log('Login response:', data);
  if (data.tokens) {
    // Test authenticated request
    return fetch('http://localhost:8001/api/posts/', {
      headers: { 'Authorization': `Bearer ${data.tokens.access}` }
    });
  }
})
.then(res => res.json())
.then(posts => console.log('Posts:', posts))
.catch(err => console.error('Error:', err));

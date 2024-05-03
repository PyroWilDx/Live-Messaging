const app = require('../app')
const request = require('supertest')

const adminToken = "eyJhbGciOiJIUzI1NiJ9.QWRtaW5AQWRtaW4uZnI.urNQBCAFN-yYWYLKCPDQwivIOM6ewJWH5jcJRp8nF2A"
const falseToken = "eyJhbGciOiJIUzI1NiJ9.QWRtaW5AQWRtaW4uZnI.urNQBCAFN-yYWYLKCPDQwivIOM6ewJWH5jcJRp8nF2C"

const johnToken = "eyJhbGciOiJIUzI1NiJ9.Sm9obi5Eb2VAYWNtZS5jb20.uN3w4hi517Q7ouruwX-HHqqmgDkm-J2Wk6tJFNfB0Z0"

test('incorrect endpoint', async () => {
  let response = await request(app)
    .get('/incorrect')
    .send({ email: 'Sebastien.Viardot@grenoble-inp.fr', password: '123456' })
  expect(response.statusCode).toBe(404)
})

// ==========================================================================
// User
// ==========================================================================

test('user can log in and list users', async () => {
  let response = await request(app)
    .post('/login')
    .send({ email: 'Sebastien.Viardot@grenoble-inp.fr', password: '123456' })
  expect(response.statusCode).toBe(200)
  expect(response.body).toHaveProperty('token')
  response = await request(app)
    .get('/api/users')
    .set('x-access-token', response.body.token)
  expect(response.statusCode).toBe(200)
  expect(response.body.message).toBe('Returning users')
  expect(response.body.data.length).toBeGreaterThan(0)
})

test('should return an error when credentials are incorrect', async () => {
  let response = await request(app)
     .post('/login')
     .send({ email: 'user@example.com', password: 'wrongpassword' });
    expect(response.statusCode).toBe(403);
    expect(response.body.message).toBe('Wrong email/password')
});

test('create a new user', async () => {
  const newUser = { // Id should be 4
    name: 'User',
    email: 'user@user.fr',
    password: 'Password123456!'
  }
  const response = await request(app)
    .post('/api/users')
    .send(newUser)
  expect(response.statusCode).toBe(200)
  expect(response.body.status).toBe(true)
  expect(response.body.message).toBe('User added')
})

test('should return an error when token is invalid', async () => {
  const response = await request(app)

  .get('/api/users')
  .set('x-access-token', falseToken);
  expect(response.status).toBe(403);
  
});

test('update user information as admin', async () => {
  const updatedUserData = {
    name: 'User Updated',
    email: 'user.updated@user.fr',
    password: 'UpdatedPassword123456!'
  }
  const response = await request(app)
    .put('/api/users/' + "4")
    .set('x-access-token', adminToken)
    .send(updatedUserData)
  expect(response.statusCode).toBe(200)
  expect(response.body.status).toBe(true)
  expect(response.body.message).toBe('User updated')
})

test('Test deleting a user', async () => {
  const response = await request(app)
    .delete("/api/users/" + "4")
    .set('x-access-token', adminToken)
  expect(response.statusCode).toBe(200)
  expect(response.body.status).toBe(true)
  expect(response.body.message).toBe('User deleted')
})

test('update user password', async () => {
  const newPasswordData = {
    password: 'NewPassword123456!'
  }
  const response = await request(app)
    .put('/api/password')
    .set('x-access-token', adminToken)
    .send(newPasswordData)
  expect(response.statusCode).toBe(200)
  expect(response.body.status).toBe(true)
  expect(response.body.message).toBe('User updated')
})

// ==========================================================================
// Groupes
// ==========================================================================

test('should create a new group', async () => {
  const response = await request(app)
    .post('/api/mygroups')
    .set('x-access-token', adminToken)
    .send({ name: "Group Test" });
  expect(response.statusCode).toBe(200);
});

test('should list groups created by the user', async () => {
  const response = await request(app)
    .get('/api/mygroups')
    .set('x-access-token', johnToken);
  expect(response.statusCode).toBe(200);
  expect(response.body.data).toBeInstanceOf(Array);

  const response2 = await request(app)
  .get('/api/mygroups')
  .set('x-access-token', adminToken);
  expect(response2.statusCode).toBe(200);
  expect(response2.body.data).toBeInstanceOf(Array);
});

test('should list groups a user is in', async () => {
  const response = await request(app)
    .get('/api/groupsmember')
    .set('x-access-token', johnToken);
  expect(response.statusCode).toBe(200);
  expect(response.body.message).toBe('Returning the groups in which the user is');
});

test('should list members of a group', async () => {
  const response = await request(app)
    .get('/api/mygroups/2')
    .set('x-access-token', adminToken);
  expect(response.statusCode).toBe(200);
  expect(response.body.data.length).toBeGreaterThan(0);
});

test('should add a user to a group', async () => {
  const response = await request(app)
    .put('/api/mygroups/1/3')
    .set('x-access-token', adminToken);
  expect(response.statusCode).toBe(200);
  expect(response.body.status).toBe(true);
  expect(response.body.message).toBe('Added user to group');
});

test('should return an error trying to remove a user from a group where we are not creator or admin', async () => {
  const response = await request(app)
    .delete('/api/mygroups/1/2')
    .set('x-access-token', johnToken);
  expect(response.statusCode).toBe(400);
});

test('should remove a user from a group', async () => {
  const response = await request(app)
    .delete('/api/mygroups/2/1')
    .set('x-access-token', adminToken);
  expect(response.statusCode).toBe(200);
  expect(response.body.status).toBe(true);
  expect(response.body.message).toBe('Removed user from group');
});

test('should return error trying to delete a group when we are not the creator or an admin', async () => {
  const response = await request(app)
    .delete('/api/mygroups/4')
    .set('x-access-token', johnToken);
  expect(response.statusCode).toBe(403);
});

test('delete a group when we are the creator', async () => {
  const response = await request(app)
    .delete('/api/mygroups/5')
    .set('x-access-token', johnToken);
  expect(response.statusCode).toBe(200);
  expect(response.body.message).toBe('Group deleted');
});

test('delete a group when we are an admin (but not a creator)', async () => {
  const response = await request(app)
    .delete('/api/mygroups/6')
    .set('x-access-token', adminToken);
  expect(response.statusCode).toBe(200);
  expect(response.body.message).toBe('Group deleted');
});

// ==========================================================================
// Messages
// ==========================================================================

test('should list messages in a group', async () => {
  const response = await request(app)
    .get('/api/messages/2')
    .set('x-access-token', adminToken);
  expect(response.statusCode).toBe(200);
  expect(response.body.status).toBe(true);
  expect(response.body.message).toBe('Returning messages of group');
  expect(response.body.data).toBeInstanceOf(Array);
});

test('should return an error when trying to list messages without token or invalid token', async () => {
  const response = await request(app)
    .get('/api/messages/2');
  expect(response.statusCode).toBe(403);

  const response2 = await request(app)
  .get('/api/messages/2')
  .set('x-access-token', falseToken);
  expect(response2.statusCode).toBe(403);
});

test('should return an error when trying to list messages in a non-existent group', async () => {
  const response = await request(app)
    .get('/api/messages/424242')
    .set('x-access-token', adminToken);
  expect(response.statusCode).toBe(400);
});

test('should send a message in a group', async () => {
  const messageContent = "Test message content"
  const response = await request(app)
    .post('/api/messages/1')
    .set('x-access-token', adminToken)
    .send({ content: messageContent });
  expect(response.statusCode).toBe(200);
  expect(response.body.status).toBe(true);
  expect(response.body.message).toBe('Message has been sent');
});

test('should return an error when trying to send a message without content', async () => {
  const response = await request(app)
    .post('/api/messages/1')
    .set('x-access-token', adminToken);
  expect(response.statusCode).toBe(400);
});

test('should return an error when trying to send a message in a group we are not in', async () => {
  const messageContent = "Test message content"
  const response = await request(app)
    .post('/api/messages/7')
    .set('x-access-token', adminToken)
    .send({ content: messageContent });
  expect(response.statusCode).toBe(403);
});

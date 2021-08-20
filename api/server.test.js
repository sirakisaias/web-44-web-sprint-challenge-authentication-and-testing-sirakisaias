// Write your tests here
const request = require('supertest')
const server = require('./server')

test('sanity check', () => {
  expect(true).toBe(true)
})

test('is the correct environment', () => {
  expect(process.env.NODE_ENV).toBe('testing')
})



describe(' /api/jokes', () => {
     it('GET should return 200', async () => {
          const res = await request(server).get('/api/jokes')
      expect(res.status).toBe(200);
      });

      it(' api/joekes should return json', async() => {
          const res = await request(server).get('/api/jokes');
          expect(res.type).toBe('application/json')
      });

      it('returns 500 status', async () => {
        const res = await request(server)
        .post('/api/auth/register')
        .send({username: "sirak", password: "dfsdf" });
        expect(res.status).toBe(500);
      });

      it('invalid payload: /login', async () => {
        const res = await request(server)
        .post('/api/auth/login')
        .send({ username: 'sirak', password: '' })
        expect(res.status).toBe(422)
    })
  });

  
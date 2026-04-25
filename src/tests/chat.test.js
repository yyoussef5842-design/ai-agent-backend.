import { describe, it, expect, beforeAll, afterAll } from 'vitest'
import request from 'supertest'
import mongoose from 'mongoose'
import { MongoMemoryServer } from 'mongodb-memory-server'
import app from '../index.js'

let mongoServer
let authToken

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create()
  await mongoose.connect(mongoServer.getUri())
  
  // Register and login
  await request(app)
    .post('/api/auth/register')
    .send({
      email: 'test@test.com',
      password: 'password123',
      name: 'Test User',
      companyName: 'Test Company'
    })

  const login = await request(app)
    .post('/api/auth/login')
    .send({ email: 'test@test.com', password: 'password123' })

  authToken = login.body.token
})

afterAll(async () => {
  await mongoose.disconnect()
  await mongoServer.stop()
})

describe('Chat API', () => {
  it('creates conversation', async () => {
    const res = await request(app)
      .post('/api/chat')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        customerId: 'cust_123',
        customerName: 'Ahmed',
        platform: 'whatsapp',
        message: 'Hello'
      })

    expect(res.status).toBe(201)
    expect(res.body.conversation).toBeDefined()
  })

  it('sends message and gets AI response', async () => {
    const conv = await request(app)
      .post('/api/chat')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        customerId: 'cust_456',
        platform: 'web',
        message: 'عايز أشتري هاتف'
      })

    const res = await request(app)
      .post(`/api/chat/${conv.body.conversation._id}/messages`)
      .set('Authorization', `Bearer ${authToken}`)
      .send({ text: 'عايز أعرف الأسعار' })

    expect(res.status).toBe(200)
    expect(res.body.aiResponse).toBeDefined()
  })
})
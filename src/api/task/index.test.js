import request from 'supertest'
import { apiRoot } from '../../config'
import { signSync } from '../../services/jwt'
import express from '../../services/express'
import { User } from '../user'
import routes, { Task } from '.'

const app = () => express(apiRoot, routes)

let userSession, anotherSession, task

beforeEach(async () => {
  const user = await User.create({ email: 'a@a.com', password: '123456' })
  const anotherUser = await User.create({ email: 'b@b.com', password: '123456' })
  userSession = signSync(user.id)
  anotherSession = signSync(anotherUser.id)
  task = await Task.create({ user })
})

test('POST /tasks 201 (user)', async () => {
  const { status, body } = await request(app())
    .post(`${apiRoot}`)
    .send({ access_token: userSession, title: 'test', acts: 'test', done: 'test', location: 'test' })
  expect(status).toBe(201)
  expect(typeof body).toEqual('object')
  expect(body.title).toEqual('test')
  expect(body.acts).toEqual('test')
  expect(body.done).toEqual('test')
  expect(body.location).toEqual('test')
  expect(typeof body.user).toEqual('object')
})

test('POST /tasks 401', async () => {
  const { status } = await request(app())
    .post(`${apiRoot}`)
  expect(status).toBe(401)
})

test('GET /tasks 200 (user)', async () => {
  const { status, body } = await request(app())
    .get(`${apiRoot}`)
    .query({ access_token: userSession })
  expect(status).toBe(200)
  expect(Array.isArray(body)).toBe(true)
  expect(typeof body[0].user).toEqual('object')
})

test('GET /tasks 401', async () => {
  const { status } = await request(app())
    .get(`${apiRoot}`)
  expect(status).toBe(401)
})

test('GET /tasks/:id 200 (user)', async () => {
  const { status, body } = await request(app())
    .get(`${apiRoot}/${task.id}`)
    .query({ access_token: userSession })
  expect(status).toBe(200)
  expect(typeof body).toEqual('object')
  expect(body.id).toEqual(task.id)
  expect(typeof body.user).toEqual('object')
})

test('GET /tasks/:id 401', async () => {
  const { status } = await request(app())
    .get(`${apiRoot}/${task.id}`)
  expect(status).toBe(401)
})

test('GET /tasks/:id 404 (user)', async () => {
  const { status } = await request(app())
    .get(apiRoot + '/123456789098765432123456')
    .query({ access_token: userSession })
  expect(status).toBe(404)
})

test('PUT /tasks/:id 200 (user)', async () => {
  const { status, body } = await request(app())
    .put(`${apiRoot}/${task.id}`)
    .send({ access_token: userSession, title: 'test', acts: 'test', done: 'test', location: 'test' })
  expect(status).toBe(200)
  expect(typeof body).toEqual('object')
  expect(body.id).toEqual(task.id)
  expect(body.title).toEqual('test')
  expect(body.acts).toEqual('test')
  expect(body.done).toEqual('test')
  expect(body.location).toEqual('test')
  expect(typeof body.user).toEqual('object')
})

test('PUT /tasks/:id 401 (user) - another user', async () => {
  const { status } = await request(app())
    .put(`${apiRoot}/${task.id}`)
    .send({ access_token: anotherSession, title: 'test', acts: 'test', done: 'test', location: 'test' })
  expect(status).toBe(401)
})

test('PUT /tasks/:id 401', async () => {
  const { status } = await request(app())
    .put(`${apiRoot}/${task.id}`)
  expect(status).toBe(401)
})

test('PUT /tasks/:id 404 (user)', async () => {
  const { status } = await request(app())
    .put(apiRoot + '/123456789098765432123456')
    .send({ access_token: anotherSession, title: 'test', acts: 'test', done: 'test', location: 'test' })
  expect(status).toBe(404)
})

test('DELETE /tasks/:id 204 (user)', async () => {
  const { status } = await request(app())
    .delete(`${apiRoot}/${task.id}`)
    .query({ access_token: userSession })
  expect(status).toBe(204)
})

test('DELETE /tasks/:id 401 (user) - another user', async () => {
  const { status } = await request(app())
    .delete(`${apiRoot}/${task.id}`)
    .send({ access_token: anotherSession })
  expect(status).toBe(401)
})

test('DELETE /tasks/:id 401', async () => {
  const { status } = await request(app())
    .delete(`${apiRoot}/${task.id}`)
  expect(status).toBe(401)
})

test('DELETE /tasks/:id 404 (user)', async () => {
  const { status } = await request(app())
    .delete(apiRoot + '/123456789098765432123456')
    .query({ access_token: anotherSession })
  expect(status).toBe(404)
})

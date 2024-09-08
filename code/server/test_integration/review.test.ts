import { describe, test, expect, beforeAll, afterAll } from "@jest/globals"
import request from 'supertest'
import { app } from "../index"
import { cleanup } from "../src/db/cleanup"
import dayjs from "dayjs"

const routePath = "/ezelectronics" //Base route path for the API

//Default user information. We use them to create users and evaluate the returned values
const customer = { username: "customer", name: "customer", surname: "customer", password: "customer", role: "Customer" }
const customer2 = { username: "customer2", name: "customer2", surname: "customer2", password: "customer2", role: "Customer" }

const admin = { username: "admin", name: "admin", surname: "admin", password: "admin", role: "Admin" }
const manager = { username: "manager", name: "manager", surname: "manager", password: "manager", role: "Manager" }

const product = { model: "prod", category: "Smartphone", quantity: 1, details: "prod", sellingPrice: 1, arrivalDate: "2024-01-01" }
const product2 = { model: "prod2", category: "Laptop", quantity: 2, details: "prod2", sellingPrice: 2, arrivalDate: "2024-01-02" }

const review = { score: 1, comment: "review" }
const review2 = { score: 2, comment: "review2" }


//Cookies for the users. We use them to keep users logged in. Creating them once and saving them in a variables outside of the tests will make cookies reusable
let customerCookie: string
let customer2Cookie: string
let adminCookie: string
let managerCookie: string

//Helper function that creates a new user in the database.
//Can be used to create a user before the tests or in the tests
//Is an implicit test because it checks if the return code is successful
const postUser = async (userInfo: any) => {
    await request(app)
        .post(`${routePath}/users`)
        .send(userInfo)
        .expect(200)
}

//Helper function that logs in a user and returns the cookie
//Can be used to log in a user before the tests or in the tests
const login = async (userInfo: any) => {
    return new Promise<string>((resolve, reject) => {
        request(app)
            .post(`${routePath}/sessions`)
            .send(userInfo)
            .expect(200)
            .end((err, res) => {
                if (err) {
                    reject(err)
                }
                resolve(res.header["set-cookie"][0])
            })
    })
}

const postProduct = async (prodInfo: any, cookie: string) => {
    await request(app)
        .post(`${routePath}/products`)
        .set("Cookie", cookie)
        .send(prodInfo)
        .expect(200)
}


//creazione di 4 utenti (2 Customer, 1 Admin e 1 Manager) e 1 prodotto
beforeAll(async () => {
    await cleanup()

    await postUser(customer)
    customerCookie = await login(customer)
    await postUser(customer2)
    customer2Cookie = await login(customer2)
    await postUser(admin)
    adminCookie = await login(admin)
    await postUser(manager)
    managerCookie = await login(manager)

    await postProduct(product, adminCookie)
    await postProduct(product2, adminCookie)
})

afterAll(async () => {
    await cleanup()
})


describe("POST /reviews/:model", () => {
    //this test adds a review (review: (customer, product)) in the db
    test("No errors", async () => {
        await request(app)
            .post(`${routePath}/reviews/${product.model}`)
            .set("Cookie", customerCookie)
            .send(review)
            .expect(200)

        const reviews = await request(app)
            .get(`${routePath}/reviews/${product.model}`)
            .set("Cookie", customerCookie)
            .expect(200)
        expect(reviews.body).toHaveLength(1)
        const rev = reviews.body[0]
        expect(rev).toBeDefined()
        expect(rev.model).toBe(product.model)
        expect(rev.user).toBe(customer.username)
        expect(rev.score).toBe(review.score)
        expect(rev.date).toBe(dayjs().format("YYYY-MM-DD"))
        expect(rev.comment).toBe(review.comment)
    })

    test("Request body content errors", async () => {
        //score missing
        await request(app).post(`${routePath}/reviews/${product.model}`).set("Cookie", customer2Cookie)
            .send({ comment: "test" }).expect(422)
        //comment missing
        await request(app).post(`${routePath}/reviews/${product.model}`).set("Cookie", customer2Cookie)
            .send({ score: 1 }).expect(422)
        //score empty
        await request(app).post(`${routePath}/reviews/${product.model}`).set("Cookie", customer2Cookie)
            .send({ score: "", comment: "test" }).expect(422)
        //comment empty
        await request(app).post(`${routePath}/reviews/${product.model}`).set("Cookie", customer2Cookie)
        .send({ score: 1, comment: "" }).expect(422)
        //score invalid (0)
        await request(app).post(`${routePath}/reviews/${product.model}`).set("Cookie", customer2Cookie)
            .send({ score: 0, comment: "test" }).expect(422)
        //score invalid (6)
        await request(app).post(`${routePath}/reviews/${product.model}`).set("Cookie", customer2Cookie)
        .send({ score: 0, comment: "test" }).expect(422)
    })

    test("Model not existing error", async () => {
        await request(app).post(`${routePath}/reviews/NotExists`).set("Cookie", customer2Cookie)
            .send(review).expect(404)
    })

    test("Review already existing error", async () => {
        await request(app).post(`${routePath}/reviews/${product.model}`).set("Cookie", customerCookie)
            .send(review).expect(409)
    })

    test("Access errors", async () => {
        //not logged
        await request(app).post(`${routePath}/reviews/${product.model}`).send(review).expect(401)
        //admin
        await request(app).post(`${routePath}/reviews/${product.model}`).set("Cookie", adminCookie)
            .send(review).expect(401)
        //manager
        await request(app).post(`${routePath}/reviews/${product.model}`).set("Cookie", managerCookie)
            .send(review).expect(401)
    })
})


describe("GET reviews/:model", () => {
    //this test adds 2 reviews (review2: (customer2, product) and review: (customer, product2)) in the db
    test("No errors", async () => {
        await request(app)
            .post(`${routePath}/reviews/${product.model}`)
            .set("Cookie", customer2Cookie)
            .send(review2)
            .expect(200)
        await request(app)
            .post(`${routePath}/reviews/${product2.model}`)
            .set("Cookie", customerCookie)
            .send(review)
            .expect(200)
        
        const reviews = await request(app)
            .get(`${routePath}/reviews/${product.model}`)
            .set("Cookie", adminCookie)
            .expect(200)
        expect(reviews.body).toHaveLength(2)
        const rev1 = reviews.body.find((rev: any) => rev.user === customer.username)
        expect(rev1).toBeDefined()
        expect(rev1.model).toBe(product.model)
        expect(rev1.score).toBe(review.score)
        expect(rev1.date).toBe(dayjs().format("YYYY-MM-DD"))
        expect(rev1.comment).toBe(review.comment)

        const rev2 = reviews.body.find((rev: any) => rev.user === customer2.username)
        expect(rev2).toBeDefined()
        expect(rev2.model).toBe(product.model)
        expect(rev2.score).toBe(review2.score)
        expect(rev2.date).toBe(dayjs().format("YYYY-MM-DD"))
        expect(rev2.comment).toBe(review2.comment)
    })

    test("Model not existing error", async () => {
        await request(app).get(`${routePath}/reviews/NotExists`).set("Cookie", customer2Cookie)
            .send(review).expect(404)
    })

    test("Access errors", async () => {
        //not logged
        await request(app).get(`${routePath}/reviews/${product.model}`).expect(401)
    })
})


describe("DELETE /reviews/:model", () => {
    //this test removes a review (review: (customer, product)) from the db
    test("No errors", async () => {
        await request(app)
            .delete(`${routePath}/reviews/${product.model}`)
            .set("Cookie", customerCookie)
            .expect(200)

        const reviews = await request(app)
            .get(`${routePath}/reviews/${product.model}`)
            .set("Cookie", customerCookie)
            .expect(200)
        expect(reviews.body).toHaveLength(1)
        const rev = reviews.body[0]
        expect(rev).toBeDefined()
        expect(rev.model).toBe(product.model)
        expect(rev.user).toBe(customer2.username)
        expect(rev.score).toBe(review2.score)
        expect(rev.date).toBe(dayjs().format("YYYY-MM-DD"))
        expect(rev.comment).toBe(review2.comment)

        const reviewsProd2 = await request(app)
            .get(`${routePath}/reviews/${product2.model}`)
            .set("Cookie", customerCookie)
            .expect(200)
        expect(reviewsProd2.body).toHaveLength(1)
        const revProd2 = reviewsProd2.body[0]
        expect(revProd2).toBeDefined()
        expect(revProd2.model).toBe(product2.model)
        expect(revProd2.user).toBe(customer.username)
        expect(revProd2.score).toBe(review.score)
        expect(revProd2.date).toBe(dayjs().format("YYYY-MM-DD"))
        expect(revProd2.comment).toBe(review.comment)
    })

    test("Model not existing error", async () => {
        await request(app).delete(`${routePath}/reviews/NotExists`).set("Cookie", customerCookie)
            .expect(404)
    })

    test("Review not existing error", async () => {
        await request(app).delete(`${routePath}/reviews/${product.model}`).set("Cookie", customerCookie)
            .expect(404)
        await request(app).delete(`${routePath}/reviews/${product2.model}`).set("Cookie", customer2Cookie)
            .expect(404)
    })

    test("Access errors", async () => {
        //not logged
        await request(app).delete(`${routePath}/reviews/${product.model}`).expect(401)
        //admin
        await request(app).delete(`${routePath}/reviews/${product.model}`).set("Cookie", adminCookie)
            .send(review).expect(401)
        //manager
        await request(app).delete(`${routePath}/reviews/${product.model}`).set("Cookie", managerCookie)
            .send(review).expect(401)
    })
})


describe("DELETE /reviews/:model/all", () => {
    //this test first adds a review (review: (customer2, product2)) to the db,
    //then it removes 2 reviews (review: (customer, product2) and review: (customer2, product2))
    test("No errors", async () => {
        await request(app)
            .post(`${routePath}/reviews/${product2.model}`)
            .set("Cookie", customer2Cookie)
            .send(review)
            .expect(200)

        await request(app)
            .delete(`${routePath}/reviews/${product2.model}/all`)
            .set("Cookie", adminCookie)
            .expect(200)

        const reviews = await request(app)
            .get(`${routePath}/reviews/${product.model}`)
            .set("Cookie", customerCookie)
            .expect(200)
        expect(reviews.body).toHaveLength(1)
        const rev = reviews.body[0]
        expect(rev).toBeDefined()
        expect(rev.model).toBe(product.model)
        expect(rev.user).toBe(customer2.username)
        expect(rev.score).toBe(review2.score)
        expect(rev.date).toBe(dayjs().format("YYYY-MM-DD"))
        expect(rev.comment).toBe(review2.comment)

        const reviewsProd2 = await request(app)
            .get(`${routePath}/reviews/${product2.model}`)
            .set("Cookie", customerCookie)
            .expect(200)
        expect(reviewsProd2.body).toHaveLength(0)
    })

    test("No errors (with already no reviews)", async () => {
        await request(app)
            .delete(`${routePath}/reviews/${product2.model}/all`)
            .set("Cookie", managerCookie)
            .expect(200)

        const reviews = await request(app)
            .get(`${routePath}/reviews/${product.model}`)
            .set("Cookie", customerCookie)
            .expect(200)
        expect(reviews.body).toHaveLength(1)
        const rev = reviews.body[0]
        expect(rev).toBeDefined()
        expect(rev.model).toBe(product.model)
        expect(rev.user).toBe(customer2.username)
        expect(rev.score).toBe(review2.score)
        expect(rev.date).toBe(dayjs().format("YYYY-MM-DD"))
        expect(rev.comment).toBe(review2.comment)

        const reviewsProd2 = await request(app)
            .get(`${routePath}/reviews/${product2.model}`)
            .set("Cookie", customerCookie)
            .expect(200)
        expect(reviewsProd2.body).toHaveLength(0)
    })

    test("Model not existing error", async () => {
        await request(app).delete(`${routePath}/reviews/NotExists/all`).set("Cookie", managerCookie)
            .expect(404)
    })

    test("Access errors", async () => {
        //not logged
        await request(app).delete(`${routePath}/reviews/${product.model}/all`).expect(401)
        //customer
        await request(app).delete(`${routePath}/reviews/${product.model}/all`).set("Cookie", customer2Cookie)
            .send(review).expect(401)
    })
})


describe("DELETE /reviews", () => {
    //this test first adds 2 reviews (review: (customer, product) and review: (customer2, product2)) to the db,
    //then it removes all reviews
    test("No errors", async () => {
        await request(app)
            .post(`${routePath}/reviews/${product.model}`)
            .set("Cookie", customerCookie)
            .send(review)
            .expect(200)

        await request(app)
            .post(`${routePath}/reviews/${product2.model}`)
            .set("Cookie", customer2Cookie)
            .send(review)
            .expect(200)

        await request(app)
            .delete(`${routePath}/reviews`)
            .set("Cookie", adminCookie)
            .expect(200)

        const reviews = await request(app)
            .get(`${routePath}/reviews/${product.model}`)
            .set("Cookie", customerCookie)
            .expect(200)
        expect(reviews.body).toHaveLength(0)

        const reviewsProd2 = await request(app)
            .get(`${routePath}/reviews/${product2.model}`)
            .set("Cookie", customerCookie)
            .expect(200)
        expect(reviewsProd2.body).toHaveLength(0)
    })

    test("No errors (with already no reviews)", async () => {
        await request(app)
            .delete(`${routePath}/reviews`)
            .set("Cookie", managerCookie)
            .expect(200)

        const reviews = await request(app)
            .get(`${routePath}/reviews/${product.model}`)
            .set("Cookie", customerCookie)
            .expect(200)
        expect(reviews.body).toHaveLength(0)

        const reviewsProd2 = await request(app)
            .get(`${routePath}/reviews/${product2.model}`)
            .set("Cookie", customerCookie)
            .expect(200)
        expect(reviewsProd2.body).toHaveLength(0)
    })

    test("Access errors", async () => {
        //not logged
        await request(app).delete(`${routePath}/reviews/${product.model}/all`).expect(401)
        //customer
        await request(app).delete(`${routePath}/reviews/${product.model}/all`).set("Cookie", customer2Cookie)
            .send(review).expect(401)
    })
})
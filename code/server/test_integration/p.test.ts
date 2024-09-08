import { describe, test, expect, beforeAll, afterAll } from "@jest/globals"
import request from 'supertest'
import { app } from "../index"
import { cleanup } from "../src/db/cleanup"
import { beforeEach } from "node:test"
import { Test } from "mocha"
import exp from "node:constants"
import { Category, Product } from "../src/components/product"
import { group } from "node:console"
import e from "express"

const routePath = "/ezelectronics" //Base route path for the API

//Default user information. We use them to create users and evaluate the returned values
const customer = { username: "customer", name: "customer", surname: "customer", password: "customer", role: "Customer" }
const manager = { username: "manager", name: "manager", surname: "manager", password: "manager", role: "Manager" }
const admin = { username: "admin", name: "admin", surname: "admin", password: "admin", role: "Admin" }
const sampleProduct = { model: "iPhone13", category: "Smartphone", quantity: 5, details: "", sellingPrice: 200, arrivalDate: "2024-01-01" }
const sampleProduct2 = { model: "iPhone12", category: "Smartphone", quantity: 4, details: "", sellingPrice: 180, arrivalDate: "2024-05-12" }
const sampleProduct3 = { model: "AsusVivobook", category: "Laptop", quantity: 12, details: "", sellingPrice: 800, arrivalDate: "2024-05-29" }
const sampleProduct4 = { model: "iPhone10", category: "Smartphone", quantity: 6, details: "", sellingPrice: 140, arrivalDate: "2024-04-28" }
const sampleProduct5 = { model: "MacBook13", category: "Laptop", quantity: 4, details: "", sellingPrice: 200, arrivalDate: "2024-05-25" }
//Cookies for the users. We use them to keep users logged in. Creating them once and saving them in a variables outside of the tests will make cookies reusable
let customerCookie: string
let adminCookie: string
let managerCookie: string

//USER FUNCTIONS
const postUser = async (userInfo: any) => {
    await request(app)
        .post(`${routePath}/users`)
        .send(userInfo)
        .expect(200)
}

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

//PRODUCT FUNCTIONS
const postProduct = async (productInfo: any, userCookie: string) => {
    await request(app)
        .post(`${routePath}/products`)
        .send(productInfo)
        .set("Cookie", userCookie)
        .expect(200)

}
const sellProduct = async (productInfo: any, userCookie: string, sellQuantity: any) => {
    await request(app)
        .patch(`${routePath}/products/${productInfo.model}/sell`)
        .send(sellQuantity)
        .set("Cookie", userCookie)
        .expect(200)

}

const cleanProducts = async () => {
    const products = await request(app)
        .get(`${routePath}/products`)
        .set("Cookie", adminCookie)
        .expect(200)
    for (let product of products.body) {
        await request(app)
            .delete(`${routePath}/products/${product.model}`)
            .set("Cookie", adminCookie)
            .expect(200)
    }

}

beforeAll(async () => {
    await cleanup()
    await postUser(admin)
    await postUser(manager)
    await postUser(customer)
    adminCookie = await login(admin)
    managerCookie = await login(manager)
    customerCookie = await login(customer)
})


afterAll(async () => {
    await cleanup()
})

afterEach(async () => {
    await cleanProducts(); 
});


describe("POST /products", () => {



    test("It should return a 200 success code and create a new product", async () => {

        await request(app)
            .post(`${routePath}/products`)
            .set("Cookie", managerCookie)
            .send(sampleProduct)
            .expect(200)

        const products = await request(app)
            .get(`${routePath}/products`)
            .set("Cookie", adminCookie)
            .expect(200)
        expect(products.body).toHaveLength(1)
        let product = products.body.find((prod: any) => prod.model === sampleProduct.model)
        expect(product).toBeDefined()
        expect(product.category).toBe(sampleProduct.category)
        expect(product.details).toBe(sampleProduct.details)
        expect(product.sellingPrice).toBe(sampleProduct.sellingPrice)
        expect(product.quantity).toBe(sampleProduct.quantity)
        expect(product.arrivalDate).toBe(sampleProduct.arrivalDate)

   
    })

    test("It should return a 200 success code and create a new product without date", async () => {
        const noDateProduct = { model: "iPhone13", category: "Smartphone", quantity: 5, details: "", sellingPrice: 200 }
        await request(app)
            .post(`${routePath}/products`)
            .set("Cookie", managerCookie)
            .send(noDateProduct)
            .expect(200)

        const products = await request(app)
            .get(`${routePath}/products`)
            .set("Cookie", adminCookie)
            .expect(200)
        expect(products.body).toHaveLength(1)
        let product = products.body.find((prod: any) => prod.model === noDateProduct.model)
        expect(product).toBeDefined()
        expect(product.category).toBe(noDateProduct.category)
        expect(product.details).toBe(noDateProduct.details)
        expect(product.sellingPrice).toBe(noDateProduct.sellingPrice)
        expect(product.quantity).toBe(noDateProduct.quantity)
        expect(product.arrivalDate).toBe(new Date().toISOString().split('T')[0])

    })


    test("it should return a 422 error if quantity is negative number", async () => {
        const product = { ...sampleProduct, quantity: -5 }
        await request(app)
            .post(`${routePath}/products`)
            .set("Cookie", managerCookie)
            .send(product)
            .expect(422)

    })
    
    test("It should return a 409 error if model represents an already existing set of products in the database", async () => {

        await request(app)
            .post(`${routePath}/products`)
            .set("Cookie", managerCookie)
            .send(sampleProduct)
            .expect(200)

        await request(app)
            .post(`${routePath}/products`)
            .set("Cookie", managerCookie)
            .send(sampleProduct)
            .expect(409)

    })

    test("It should return a 400 error when arrivalDate is after the current date", async () => {
        const product = { ...sampleProduct, arrivalDate: "2024-12-10" }
        await request(app)
            .post(`${routePath}/products`)
            .set("Cookie", managerCookie)
            .send(product)
            .expect(400)

    })

    test("It should return a 401 error if the user is not a manager", async () => {
        await request(app)
            .post(`${routePath}/products`)
            .set("Cookie", customerCookie)
            .send(sampleProduct)
            .expect(401)
    })  

})

describe("PATCH /products/:model", () => {

    test("it should return a 200 success code and increases the quantity of a product", async () => {
        //CREATE A PRODUCT
        await postProduct(sampleProduct, managerCookie)
        //CREATE BODY FOR THE PATCH REQUEST
        const updateBody = { quantity: 10, changeDate: "2024-06-01" }

        //PATCH
        await request(app)
            .patch(`${routePath}/products/iPhone13`)
            .set("Cookie", managerCookie)
            .send(updateBody)
            .expect(200)

        //CHECK IF THE PRODUCT IS UPDATED
        await request(app)
            .get(`${routePath}/products`)
            .set("Cookie", adminCookie)
            .expect(200)
            .then((res) => {
                const product = res.body.find((prod: any) => prod.model === sampleProduct.model)
                expect(product.quantity).toBe(updateBody.quantity + sampleProduct.quantity)
            })

        //CLEAN THE PRODUCTS DB
    })

    test("it should return a 200 success code and increases the quantity of a product and automatically set date", async () => {
        //CREATE A PRODUCT
        await postProduct(sampleProduct, managerCookie)
        //CREATE BODY FOR THE PATCH REQUEST
        const updateBody = { quantity: 10 }
        const checkDate = new Date().toISOString().split('T')[0]

        //PATCH
        await request(app)
            .patch(`${routePath}/products/iPhone13`)
            .set("Cookie", managerCookie)
            .send(updateBody)
            .expect(200)

        //CHECK IF THE PRODUCT IS UPDATED
        await request(app)
            .get(`${routePath}/products`)
            .set("Cookie", adminCookie)
            .expect(200)
            .then((res) => {
                const product = res.body.find((prod: any) => prod.model === sampleProduct.model)
                expect(product.quantity).toBe(updateBody.quantity + sampleProduct.quantity)
            })


    })

    test("It should return a 404 error if model does not represent a product in the database", async () => {
        //CREATE BODY FOR THE PATCH REQUEST
        const updateBody = { quantity: 10 }

        //PATCH
        await request(app)
            .patch(`${routePath}/products/notExistingModel`)
            .set("Cookie", managerCookie)
            .send(updateBody)
            .expect(404)

    })

    test("It should return a 400 error if changeDate is after the current date", async () => {
        //CREATE A PRODUCT
        await postProduct(sampleProduct, managerCookie)
        //CREATE BODY FOR THE PATCH REQUEST
        const updateBody = { quantity: 10, changeDate: "2024-12-10" }

        //PATCH
        await request(app)
            .patch(`${routePath}/products/iPhone13`)
            .set("Cookie", managerCookie)
            .send(updateBody)
            .expect(400)



    })

    test("It should return a 400 error if changeDate is before the product's arrivalDate", async () => {
        //CREATE A PRODUCT
        await postProduct(sampleProduct, managerCookie)
        //CREATE BODY FOR THE PATCH REQUEST
        const updateBody = { quantity: 10, changeDate: "2023-12-01" }

        //PATCH
        await request(app)
            .patch(`${routePath}/products/iPhone13`)
            .set("Cookie", managerCookie)
            .send(updateBody)
            .expect(400)


    })

    test("it should return a 422 error if quantity is negative number", async () => {
        //CREATE A PRODUCT
        await postProduct(sampleProduct, managerCookie)
        //CREATE BODY FOR THE PATCH REQUEST
        const updateBody = { quantity: -10 }

        //PATCH
        await request(app)
            .patch(`${routePath}/products/iPhone13`)
            .set("Cookie", managerCookie)
            .send(updateBody)
            .expect(422)


    })

    test("it should return a 401 error if the user is not a manager", async () => {
        //CREATE A PRODUCT
        await postProduct(sampleProduct, managerCookie)
        //CREATE BODY FOR THE PATCH REQUEST
        const updateBody = { quantity: 10 }

        //PATCH
        await request(app)
            .patch(`${routePath}/products/iPhone13`)
            .set("Cookie", customerCookie)
            .send(updateBody)
            .expect(401)

    })
        
})

describe("PATCH /products/:model/sell", () => {
    test("it should return a 200 success code and decreases the quantity of a product", async () => {
        //CREATE A PRODUCT
        await postProduct(sampleProduct, managerCookie)
        //CREATE BODY FOR THE PATCH REQUEST
        const updateBody = { sellingDate: "2024-06-12", quantity: 2 }

        //CREATE A SALE FOR THE PRODUCT
        await request(app)
            .patch(`${routePath}/products/iPhone13/sell`)
            .set("Cookie", managerCookie)
            .send(updateBody)
            .expect(200)

        //CHECK IF THE PRODUCT IS UPDATED
        await request(app)
            .get(`${routePath}/products`)
            .set("Cookie", managerCookie)
            .expect(200)
            .then((res) => {
                const product = res.body.find((prod: any) => prod.model === sampleProduct.model)
                expect(product.quantity).toBe(sampleProduct.quantity - updateBody.quantity)
            })

        //CLEAN THE PRODUCTS DB
    })


    test("It should return a 404 error if model does not represent a product in the database", async () => {
        //CREATE BODY FOR THE PATCH REQUEST
        const updateBody = { quantity: 10 }

        //PATCH
        await request(app)
            .patch(`${routePath}/products/notExistingModel/sell`)
            .set("Cookie", managerCookie)
            .send(updateBody)
            .expect(404)

    })

    test("It should return a 400 error if sellingDate is after the current date", async () => {
        //CREATE A PRODUCT
        await postProduct(sampleProduct, managerCookie)
        //CREATE BODY FOR THE PATCH REQUEST
        const updateBody = { quantity: 10, sellingDate: "2024-12-10" }

        //PATCH
        await request(app)
            .patch(`${routePath}/products/iPhone13/sell`)
            .set("Cookie", managerCookie)
            .send(updateBody)
            .expect(400)

    })

    test("It should return a 400 error if sellingDate is before the product's arrivalDate", async () => {
        //CREATE A PRODUCT
        await postProduct(sampleProduct, managerCookie)
        //CREATE BODY FOR THE PATCH REQUEST
        const updateBody = { quantity: 3, sellingDate: "2023-12-01" }

        //PATCH
        await request(app)
            .patch(`${routePath}/products/iPhone13/sell`)
            .set("Cookie", managerCookie)
            .send(updateBody)
            .expect(400)


    })

    test("It should return a 409 error if model represents a product whose available quantity is 0", async () => {
        //CREATE A PRODUCT
        const product = { ...sampleProduct, quantity: 3 }
        await postProduct(product, managerCookie)
        const updateQuantity = { quantity: 3 }

        //Make quantity 0 product
        await sellProduct(product, managerCookie, updateQuantity)

        
        //CREATE BODY FOR THE PATCH REQUEST
        const updateBody = { quantity: 5, sellingDate: "2024-06-12" }

        //PATCH
        await request(app)
            .patch(`${routePath}/products/iPhone13/sell`)
            .set("Cookie", managerCookie)
            .send(updateBody)
            .expect(409)

    })

    test("It should return a 409 error if the available quantity of model is lower than the requested quantity", async () => {
        //CREATE A PRODUCT
        await postProduct(sampleProduct, managerCookie)
        //CREATE BODY FOR THE PATCH REQUEST
        const updateBody = { quantity: 10, sellingDate: "2024-06-12" }

        //PATCH
        await request(app)
            .patch(`${routePath}/products/iPhone13/sell`)
            .set("Cookie", managerCookie)
            .send(updateBody)
            .expect(409)

    })

})

describe("GET /products", () => {
    test("It should return a 200 success code and return all products in the database", async () => {
        //Popolate the database
        await postProduct(sampleProduct, managerCookie)
        await postProduct(sampleProduct2, managerCookie)
        await postProduct(sampleProduct3, managerCookie)
        await postProduct(sampleProduct4, managerCookie)
        await postProduct(sampleProduct5, managerCookie)

        //GET ALL PRODUCTS
        const products = await request(app)
        .get(`${routePath}/products`)
        .set("Cookie", managerCookie)
        .expect(200)

        expect(products.body).toHaveLength(5)
        
    })
    test("It should return a 200 success code and return all products in the database with required category", async () => {
        //Popolate the database
        await postProduct(sampleProduct, managerCookie)
        await postProduct(sampleProduct2, managerCookie)
        await postProduct(sampleProduct3, managerCookie)
        await postProduct(sampleProduct4, managerCookie)
        await postProduct(sampleProduct5, managerCookie)

        const grouping = {grouping: "category"}
        const category = {category: "Laptop"}

        
        //GET ALL PRODUCTS
        const products = await request(app)
        .get(`${routePath}/products`)
        .set("Cookie", managerCookie)
        .query(grouping)
        .query(category)
        .expect(200)

        expect(products.body).toHaveLength(2)

    })
    test("It should return a 200 success code and return all products in the database with required model", async () => {
        //Popolate the database
        await postProduct(sampleProduct, managerCookie)
        await postProduct(sampleProduct2, managerCookie)
        await postProduct(sampleProduct3, managerCookie)
        await postProduct(sampleProduct4, managerCookie)
        await postProduct(sampleProduct5, managerCookie)

        const grouping = {grouping: "model"}
        const model = {model: "iPhone13"}

        
        //GET ALL PRODUCTS
        const products = await request(app)
        .get(`${routePath}/products`)
        .set("Cookie", managerCookie)
        .query(grouping)
        .query(model)
        .expect(200)

        expect(products.body).toHaveLength(1)
        expect(products.body[0].model).toBe("iPhone13")
        
    })
    
    test("It should return a 422 error code if the category is not one of [Smartphone, Laptop, Appliance] ", async () => {
        //Popolate the database
        await postProduct(sampleProduct, managerCookie)
        await postProduct(sampleProduct2, managerCookie)
        await postProduct(sampleProduct3, managerCookie)
        await postProduct(sampleProduct4, managerCookie)
        await postProduct(sampleProduct5, managerCookie)

        const grouping = {grouping: "category"}
        const category = {category: "Car"}

        
        //GET ALL PRODUCTS
         await request(app)
        .get(`${routePath}/products`)
        .set("Cookie", managerCookie)
        .query(grouping)
        .query(category)
        .expect(422)

     
    })

    test("It should return a 422 error if grouping is null and any of category or model is not null", async () => {
        //Popolate the database
        await postProduct(sampleProduct, managerCookie)
        await postProduct(sampleProduct2, managerCookie)
        await postProduct(sampleProduct3, managerCookie)
        await postProduct(sampleProduct4, managerCookie)
        await postProduct(sampleProduct5, managerCookie)

        
        const category = {category: "Laptop"}
        const model = {model: "iPhone13"}
        
        //GET ALL PRODUCTS
        await request(app)
        .get(`${routePath}/products`)
        .set("Cookie", managerCookie)
        .query(category)
        .expect(422)
        
        //GET ALL PRODUCTS
        await request(app)
        .get(`${routePath}/products`)
        .set("Cookie", managerCookie)
        .query(model)
        .expect(422)
     
    })

    test("It should return a 422 error if grouping is category and category is null OR model is not null", async () => {
        //Popolate the database
        await postProduct(sampleProduct, managerCookie)
        await postProduct(sampleProduct2, managerCookie)
        await postProduct(sampleProduct3, managerCookie)
        await postProduct(sampleProduct4, managerCookie)
        await postProduct(sampleProduct5, managerCookie)

        const grouping = {grouping: "category"}
        const model = {model: "iPhone13"}
        
        //GET ALL PRODUCTS
        await request(app)
        .get(`${routePath}/products`)
        .set("Cookie", managerCookie)
        .query(grouping)
        .expect(422)
        
        //GET ALL PRODUCTS
        await request(app)
        .get(`${routePath}/products`)
        .set("Cookie", managerCookie)
        .query(grouping)
        .query(model)
        .expect(422)
     
    })

    test("It should return a 422 error if grouping is model and model is null OR category is not null", async () => {
        //Popolate the database
        await postProduct(sampleProduct, managerCookie)
        await postProduct(sampleProduct2, managerCookie)
        await postProduct(sampleProduct3, managerCookie)
        await postProduct(sampleProduct4, managerCookie)
        await postProduct(sampleProduct5, managerCookie)

        const grouping = {grouping: "model"}
        const category = {category: "Laptop"}
        
        //GET ALL PRODUCTS
        await request(app)
        .get(`${routePath}/products`)
        .set("Cookie", managerCookie)
        .query(grouping)
        .expect(422)
        
        //GET ALL PRODUCTS
        await request(app)
        .get(`${routePath}/products`)
        .set("Cookie", managerCookie)
        .query(grouping)
        .query(category)
        .expect(422)
     
    })

    test("It should return a 404 error if model does not represent a product in the database (only when grouping is model)", async () => {
        //Popolate the database
        await postProduct(sampleProduct, managerCookie)
        await postProduct(sampleProduct2, managerCookie)
        await postProduct(sampleProduct3, managerCookie)
        await postProduct(sampleProduct4, managerCookie)
        await postProduct(sampleProduct5, managerCookie)

        const grouping = {grouping: "model"}
        const model = {model: "NotExistingModel"}
        
        //GET ALL PRODUCTS
        await request(app)
        .get(`${routePath}/products`)
        .set("Cookie", managerCookie)
        .query(grouping)
        .query(model)
        .expect(404)

    })

})

describe("GET /products/available ", () => {
    test("It should return a 200 success code and returns all products in the database that are available", async () => {
        //0 quantity products
        const product = { ...sampleProduct, quantity: 3}
        const product2 = { ...sampleProduct2, quantity: 5}
        await postProduct(product, managerCookie)
        await postProduct(product2, managerCookie)
        const updateQuantity = {quantity: 3}
        const updateQuantity2 = {quantity: 5}
        sellProduct(product, managerCookie, updateQuantity)
        sellProduct(product2, managerCookie, updateQuantity2)
        //others
        await postProduct(sampleProduct3, managerCookie)
        await postProduct(sampleProduct4, managerCookie)
        await postProduct(sampleProduct5, managerCookie)

        //GET AVAILABLE PRODUCTS
        const products = await request(app)
        .get(`${routePath}/products/available`)
        .set("Cookie", customerCookie)
        .expect(200)
      
        expect(products.body).toHaveLength(3)
        products.body.forEach((product: any) => {
            expect(product.quantity).toBeGreaterThan(0)
        })
        

    })
    test("It should return a 200 success code and return all products in the database with required category", async () => {
        //0 quantity products
        const product = { ...sampleProduct, quantity: 3}
        const product2 = { ...sampleProduct2, quantity: 5}
        await postProduct(product, managerCookie)
        await postProduct(product2, managerCookie)
        const updateQuantity = {quantity: 3}
        const updateQuantity2 = {quantity: 5}
        sellProduct(product, managerCookie, updateQuantity)
        sellProduct(product2, managerCookie, updateQuantity2)
        //others
        await postProduct(sampleProduct3, managerCookie)
        await postProduct(sampleProduct4, managerCookie)
        await postProduct(sampleProduct5, managerCookie)

        const grouping = {grouping: "category"}
        const category = {category: "Smartphone"}

        
        //GET ALL PRODUCTS
        const products = await request(app)
        .get(`${routePath}/products/available`)
        .set("Cookie", managerCookie)
        .query(grouping)
        .query(category)
        .expect(200)

        expect(products.body).toHaveLength(1)

    })
    test("It should return a 200 success code and return all products in the database with required model", async () => {
        //0 quantity products
        const product = { ...sampleProduct, quantity: 3}
        const product2 = { ...sampleProduct2, quantity: 5}
        await postProduct(product, managerCookie)
        await postProduct(product2, managerCookie)
        const updateQuantity = {quantity: 3}
        const updateQuantity2 = {quantity: 5}
        sellProduct(product, managerCookie, updateQuantity)
        sellProduct(product2, managerCookie, updateQuantity2)
        //others
        await postProduct(sampleProduct3, managerCookie)
        await postProduct(sampleProduct4, managerCookie)
        await postProduct(sampleProduct5, managerCookie)

        const grouping = {grouping: "model"}
        const model = {model: "MacBook13"}

        
        //GET ALL PRODUCTS
        const products = await request(app)
        .get(`${routePath}/products/available`)
        .set("Cookie", managerCookie)
        .query(grouping)
        .query(model)
        .expect(200)

        expect(products.body).toHaveLength(1)
        expect(products.body[0].model).toBe("MacBook13")
   
      
    })
    
    test("It should return a 422 error code if the category is not one of [Smartphone, Laptop, Appliance] ", async () => {
        //0 quantity products
        const product = { ...sampleProduct, quantity: 3}
        const product2 = { ...sampleProduct2, quantity: 5}
        await postProduct(product, managerCookie)
        await postProduct(product2, managerCookie)
        const updateQuantity = {quantity: 3}
        const updateQuantity2 = {quantity: 5}
        sellProduct(product, managerCookie, updateQuantity)
        sellProduct(product2, managerCookie, updateQuantity2)
        //others
        await postProduct(sampleProduct3, managerCookie)
        await postProduct(sampleProduct4, managerCookie)
        await postProduct(sampleProduct5, managerCookie)

        const grouping = {grouping: "category"}
        const category = {category: "Car"}

        
        //GET ALL PRODUCTS
         await request(app)
        .get(`${routePath}/products/available`)
        .set("Cookie", managerCookie)
        .query(grouping)
        .query(category)
        .expect(422)

     
    })

    test("It should return a 422 error if grouping is null and any of category or model is not null", async () => {
        //0 quantity products
        const product = { ...sampleProduct, quantity: 3}
        const product2 = { ...sampleProduct2, quantity: 5}
        await postProduct(product, managerCookie)
        await postProduct(product2, managerCookie)
        const updateQuantity = {quantity: 3}
        const updateQuantity2 = {quantity: 5}
        sellProduct(product, managerCookie, updateQuantity)
        sellProduct(product2, managerCookie, updateQuantity2)
        //others
        await postProduct(sampleProduct3, managerCookie)
        await postProduct(sampleProduct4, managerCookie)
        await postProduct(sampleProduct5, managerCookie)
        const category = {category: "Laptop"}
        const model = {model: "iPhone13"}
        
        //GET ALL PRODUCTS
        await request(app)
        .get(`${routePath}/products/available`)
        .set("Cookie", managerCookie)
        .query(category)
        .expect(422)
        
        //GET ALL PRODUCTS
        await request(app)
        .get(`${routePath}/products/available`)
        .set("Cookie", managerCookie)
        .query(model)
        .expect(422)
     

    })

    test("It should return a 422 error if grouping is category and category is null OR model is not null", async () => {
        //Popolate the database
        //0 quantity products
        const product = { ...sampleProduct, quantity: 3}
        const product2 = { ...sampleProduct2, quantity: 5}
        await postProduct(product, managerCookie)
        await postProduct(product2, managerCookie)
        const updateQuantity = {quantity: 3}
        const updateQuantity2 = {quantity: 5}
        sellProduct(product, managerCookie, updateQuantity)
        sellProduct(product2, managerCookie, updateQuantity2)
        //others
        await postProduct(sampleProduct3, managerCookie)
        await postProduct(sampleProduct4, managerCookie)
        await postProduct(sampleProduct5, managerCookie)

        const grouping = {grouping: "category"}
        const model = {model: "iPhone13"}
        
        //GET ALL PRODUCTS
        await request(app)
        .get(`${routePath}/products/available`)
        .set("Cookie", managerCookie)
        .query(grouping)
        .expect(422)
        
        //GET ALL PRODUCTS
        await request(app)
        .get(`${routePath}/products/available`)
        .set("Cookie", managerCookie)
        .query(grouping)
        .query(model)
        .expect(422)
     

    })

    test("It should return a 422 error if grouping is model and model is null OR category is not null", async () => {
        //Popolate the database
        //0 quantity products
        const product = { ...sampleProduct, quantity: 3}
        const product2 = { ...sampleProduct2, quantity: 5}
        await postProduct(product, managerCookie)
        await postProduct(product2, managerCookie)
        const updateQuantity = {quantity: 3}
        const updateQuantity2 = {quantity: 5}
        sellProduct(product, managerCookie, updateQuantity)
        sellProduct(product2, managerCookie, updateQuantity2)
        //others
        await postProduct(sampleProduct3, managerCookie)
        await postProduct(sampleProduct4, managerCookie)
        await postProduct(sampleProduct5, managerCookie)

        const grouping = {grouping: "model"}
        const category = {category: "Laptop"}
        
        //GET ALL PRODUCTS
        await request(app)
        .get(`${routePath}/products/available`)
        .set("Cookie", managerCookie)
        .query(grouping)
        .expect(422)
        
        //GET ALL PRODUCTS
        await request(app)
        .get(`${routePath}/products/available`)
        .set("Cookie", managerCookie)
        .query(grouping)
        .query(category)
        .expect(422)
     

    })

    test("It should return a 404 error if model does not represent a product in the database (only when grouping is model)", async () => {
        //Popolate the database
        //0 quantity products
        const product = { ...sampleProduct, quantity: 3}
        const product2 = { ...sampleProduct2, quantity: 5}
        await postProduct(product, managerCookie)
        await postProduct(product2, managerCookie)
        const updateQuantity = {quantity: 3}
        const updateQuantity2 = {quantity: 5}
        sellProduct(product, managerCookie, updateQuantity)
        sellProduct(product2, managerCookie, updateQuantity2)
        //others
        await postProduct(sampleProduct3, managerCookie)
        await postProduct(sampleProduct4, managerCookie)
        await postProduct(sampleProduct5, managerCookie)

        const grouping = {grouping: "model"}
        const model = {model: "NotExistingModel"}
        
        //GET ALL PRODUCTS
        await request(app)
        .get(`${routePath}/products/available`)
        .set("Cookie", managerCookie)
        .query(grouping)
        .query(model)
        .expect(404)


    })

})

describe("DELETE /products/:model", () => {
    test("It should return a 200 success code and delete a product", async () => {
        //CREATE A PRODUCT
        await postProduct(sampleProduct, managerCookie)

        //DELETE THE PRODUCT
        await request(app)
            .delete(`${routePath}/products/iPhone13`)
            .set("Cookie", managerCookie)
            .expect(200)

        //CHECK IF THE PRODUCT IS DELETED
        await request(app)
            .get(`${routePath}/products`)
            .set("Cookie", adminCookie)
            .expect(200)
            .then((res) => {
                const product = res.body.find((prod: any) => prod.model === sampleProduct.model)
                expect(product).toBeUndefined()
            })

    })

    test("it should return a 404 error if model does not represent a product in the database", async () => {
        //DELETE THE PRODUCT
        await request(app)
            .delete(`${routePath}/products/notExistingModel`)
            .set("Cookie", managerCookie)
            .expect(404)
    })

    test("It should return a 401 error code if user is not admin or manager", async () => {
        //CREATE PRODUCTS
        await postProduct(sampleProduct, managerCookie)
        await postProduct(sampleProduct2, managerCookie)
        await postProduct(sampleProduct3, managerCookie)
        await postProduct(sampleProduct4, managerCookie)
        await postProduct(sampleProduct5, managerCookie)

        //DELETE ALL PRODUCTS
        await request(app)
            .delete(`${routePath}/products/iPhone13`)
            .set("Cookie", customerCookie)
            .expect(401)


    })
})

describe("DELETE /products", () => {
    test("It should return a 200 success code and delete all products in the database", async () => {
        //CREATE PRODUCTS
        await postProduct(sampleProduct, managerCookie)
        await postProduct(sampleProduct2, managerCookie)
        await postProduct(sampleProduct3, managerCookie)
        await postProduct(sampleProduct4, managerCookie)
        await postProduct(sampleProduct5, managerCookie)

        //DELETE ALL PRODUCTS
        await request(app)
            .delete(`${routePath}/products`)
            .set("Cookie", adminCookie)
            .expect(200)

        //CHECK IF THE PRODUCTS ARE DELETED
        await request(app)
            .get(`${routePath}/products`)
            .set("Cookie", adminCookie)
            .expect(200)
            .then((res) => {
                expect(res.body).toHaveLength(0)
            })

    })

    test("It should return a 401 error code if user is not admin or manager", async () => {
        //CREATE PRODUCTS
        await postProduct(sampleProduct, managerCookie)
        await postProduct(sampleProduct2, managerCookie)
        await postProduct(sampleProduct3, managerCookie)
        await postProduct(sampleProduct4, managerCookie)
        await postProduct(sampleProduct5, managerCookie)

        //DELETE ALL PRODUCTS
        await request(app)
            .delete(`${routePath}/products`)
            .set("Cookie", customerCookie)
            .expect(401)
    })

})




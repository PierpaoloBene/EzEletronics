import { describe, test, expect, beforeAll, afterAll, afterEach } from "@jest/globals"
import request from 'supertest'
import { app } from "../index"
import { cleanup } from "../src/db/cleanup"
import { Cart, ProductInCart } from "../src/components/cart"
import { Category, Product, ProductEssential } from "../src/components/product"
import { Dayjs } from "dayjs"

const routePath = "/ezelectronics" // Base route path for the API

// Default user information
const customer = { username: "customer", name: "customer", surname: "customer", password: "customer", role: "Customer" }
const manager = { username: "manager", name: "manager", surname: "manager", password: "manager", role: "Manager" }
const admin = { username: "admin", name: "admin", surname: "admin", password: "admin", role: "Admin" }
const sampleCart: Cart = { customer: "customer", paid: false, paymentDate: null, total: 200, products: [{ model: "iPhone13", quantity: 1, category: Category.SMARTPHONE, price: 200 }], };
const emptyCart: Cart = { customer: "customer", paid: false, paymentDate: null, total: 0.0, products: [] as ProductInCart[] }
const unavailableProduct: Product = { model: "UnavailableProduct", category: Category.SMARTPHONE, quantity: 0, details: "", arrivalDate: null, sellingPrice: 150 }
const lowStockProduct: Product = { model: "LowStockProduct", category: Category.SMARTPHONE, quantity: 1, details: "", arrivalDate: null, sellingPrice: 200 };
const sampleProduct: Product = { model: "iPhone13", category: Category.SMARTPHONE, quantity: 1, details: "", arrivalDate: null, sellingPrice: 200 }
const sampleStockEmptyProduct: ProductEssential = { sellingPrice: 200, model: "iPhone13", category: Category.SMARTPHONE, quantity: 0 }
// Cookies for the users
let customerCookie: string
let adminCookie: string
let managerCookie: string

// USER FUNCTIONS
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

// PRODUCT FUNCTIONS
const createProductDB = async (userCookie: string, productInfo: Product) => {
    await request(app)
        .post(`${routePath}/products`)
        .send(productInfo)
        .set("Cookie", userCookie)
        .expect(200)

}

const deleteProductDB = async (userCookie: string) => {
    await request(app)
        .delete(`${routePath}/products`)
        .set("Cookie", userCookie)
        .expect(200)
        .catch(e =>
            console.log(e)
        );
};

// CART FUNCTIONS
const getCart = async (userCookie: string) => {
    return await request(app)
        .get(`${routePath}/carts`)
        .set("Cookie", userCookie)
}

const createAndAddToCart = async (userCookie: string, productModel: any) => {
    await request(app)
        .post(`${routePath}/carts`)
        .set("Cookie", userCookie)
        .send({ model: productModel })
        .expect(200).catch(e => console.log(e));
};


const cleanCarts = async (userCookie: string) => {
    const response = await request(app)
        .get(`${routePath}/carts`)
        .set("Cookie", userCookie)

    // Controlla se response.body è definito
    if (response.body) {
        const cart = response.body;
        await request(app)
            .delete(`${routePath}/carts/current`)
            .set("Cookie", userCookie)
            .expect(200)
    } else {
        console.error("Response body is not iterable or is undefined")
    }
}


beforeAll(async () => {
    await cleanup()
    await postUser(customer)
    await postUser(manager)
    await postUser(admin)
    customerCookie = await login(customer)
    managerCookie = await login(manager)
    adminCookie = await login(admin)
})

afterAll(async () => {
    await cleanup().catch(e => console.log(e))
})

afterEach(async () => {
    await cleanup(true);
    //await cleanCarts(customerCookie)
    //await deleteProductDB(adminCookie);
})

describe("GET /carts", () => {
    test("It should return a 200 success code and the current cart of the logged in user", async () => {

        await createProductDB(adminCookie, sampleProduct)
        await createAndAddToCart(customerCookie, sampleProduct.model)
        const response = await request(app)
            .get(`${routePath}/carts`)
            .set("Cookie", customerCookie)
            .expect(200)

        expect(response.status).toBe(200)
        const cart = response.body
        expect(cart.customer).toBe(sampleCart.customer)
        expect(cart.paid).toBe(sampleCart.paid)
        expect(cart.paymentDate).toBe(sampleCart.paymentDate)
        expect(cart.total).toBe(sampleCart.total)
        expect(cart.products).toHaveLength(1)
        expect(cart.products[0].model).toBe(sampleProduct.model)
    })

    test("It should return an empty cart if there is no unpaid cart in the database", async () => {
        const response = await getCart(customerCookie);
        expect(response.status).toBe(200);

        const cart = response.body;
        expect(cart.customer).toBe(emptyCart.customer);
        expect(cart.paid).toBe(emptyCart.paid);
        expect(cart.paymentDate).toBe(emptyCart.paymentDate);
        expect(cart.total).toBe(emptyCart.total);
        expect(cart.products).toHaveLength(0);
    });

    test("It should return an empty cart if the unpaid cart has no products", async () => {
        await createProductDB(adminCookie, sampleProduct)
        await createAndAddToCart(customerCookie, sampleProduct.model);  // Create a cart with product
        await cleanCarts(customerCookie);  // Clean the product from the cart, leaving an empty cart

        const response = await getCart(customerCookie);
        expect(response.status).toBe(200);

        const cart = response.body;
        expect(cart.customer).toBe(emptyCart.customer);
        expect(cart.paid).toBe(emptyCart.paid);
        expect(cart.paymentDate).toBe(emptyCart.paymentDate);
        expect(cart.total).toBe(emptyCart.total);
        expect(cart.products).toHaveLength(0);
    });
});

describe("POST /carts", () => {
    test("It should add a product to the cart if the product exists and is available", async () => {
        await createProductDB(adminCookie, sampleProduct)

        const response = await request(app)
            .post(`${routePath}/carts`)
            .set("Cookie", customerCookie)
            .send({ model: sampleProduct.model })
            .expect(200)

        expect(response.status).toBe(200)
        const cartResponse = await getCart(customerCookie)
        expect(cartResponse.status).toBe(200)
        const cart = cartResponse.body
        expect(cart.products).toHaveLength(1)
        expect(cart.products[0].model).toBe(sampleProduct.model)
        expect(cart.products[0].quantity).toBe(1)
    })
    test("It should increase the quantity of the product in the cart if it already exists", async () => {
        await createProductDB(adminCookie, sampleProduct)
        await createAndAddToCart(customerCookie, sampleProduct.model)

        await request(app)
            .post(`${routePath}/carts`)
            .set("Cookie", customerCookie)
            .send({ model: sampleProduct.model })
            .expect(200)

        const cartResponse = await getCart(customerCookie)
        expect(cartResponse.status).toBe(200)
        const cart = cartResponse.body
        expect(cart.products).toHaveLength(1)
        expect(cart.products[0].model).toBe(sampleProduct.model)
        expect(cart.products[0].quantity).toBe(2)
    })

    test("It should create a new cart if no unpaid cart exists for the user", async () => {
        await createProductDB(adminCookie, sampleProduct)
        const response = await request(app)
            .post(`${routePath}/carts`)
            .set("Cookie", customerCookie)
            .send({ model: sampleProduct.model })
            .expect(200)

        expect(response.status).toBe(200)
        const cartResponse = await getCart(customerCookie)
        expect(cartResponse.status).toBe(200)
        const cart = cartResponse.body
        expect(cart.products).toHaveLength(1)
        expect(cart.products[0].model).toBe(sampleProduct.model)
        expect(cart.products[0].quantity).toBe(1)
    })

    test("It should return a 404 error if the product does not exist", async () => {
        const response = await request(app)
            .post(`${routePath}/carts`)
            .set("Cookie", customerCookie)
            .send({ model: "NonExistingProduct" })
            .expect(404)

        expect(response.status).toBe(404)
    })

    test("It should return a 409 error if the product is unavailable", async () => {
        await createProductDB(adminCookie, unavailableProduct)
        const response = await request(app)
            .post(`${routePath}/carts`)
            .set("Cookie", customerCookie)
            .send({ model: unavailableProduct.model })
            .expect(409)

        expect(response.status).toBe(409)
    })
});

describe("PATCH /carts", () => {
    test("It should simulate payment for the current cart of the logged in user", async () => {
        await createProductDB(adminCookie, sampleProduct)
        await createAndAddToCart(customerCookie, sampleProduct.model)

        const response = await request(app)
            .patch(`${routePath}/carts`)
            .set("Cookie", customerCookie)
            .expect(200)

        expect(response.status).toBe(200)

        const cartResponse = await getCart(customerCookie)
        expect(cartResponse.status).toBe(200)
        const cart = cartResponse.body
    })

    test("It should return a 404 error if there is no unpaid cart in the database", async () => {
        const response = await request(app)
            .patch(`${routePath}/carts`)
            .set("Cookie", customerCookie)
            .expect(404)

        expect(response.status).toBe(404)

    })

    test("It should return a 400 error if the unpaid cart contains no product", async () => {
        await createProductDB(adminCookie, sampleProduct)
        await createAndAddToCart(customerCookie, sampleProduct.model)
        await cleanCarts(customerCookie)

        const response = await request(app)
            .patch(`${routePath}/carts`)
            .set("Cookie", customerCookie)
            .expect(400)

        const cartResponse = await getCart(customerCookie);
        expect(cartResponse.status).toBe(200);
        const cart = cartResponse.body;

        expect(cart.customer).toBe(emptyCart.customer);
        expect(cart.paid).toBe(emptyCart.paid);
        expect(cart.paymentDate).toBe(emptyCart.paymentDate);
        expect(cart.total).toBe(emptyCart.total);
        expect(cart.products).toHaveLength(0);

    })

    test("It should return a 409 error if there is at least one product in the cart whose available quantity in the stock is 0", async () => {
        await createProductDB(adminCookie, sampleProduct)
        await createAndAddToCart(customerCookie, sampleProduct.model)

        // Riduci la quantità disponibile del prodotto a 0 con la data corrente
        const currentDate = new Date().toISOString();

        //Riduci la quantità disponibile del prodotto a 0
        const response = await request(app)
            .patch(`${routePath}/products/${sampleProduct.model}/sell`)
            .set("Cookie", adminCookie)
            .send({ sellingDate: currentDate, quantity: 1 })
            .expect(200);

        expect(response.status).toBe(200);

        // Prova a inserire il prodotto una seconda volta
        const result = await request(app)
            .post(`${routePath}/carts`)
            .set("Cookie", customerCookie)
            .send({ model: sampleProduct.model })
            .expect(409);

        expect(result.status).toBe(409);
    })

    test("It should return a 409 error if there is at least one product in the cart whose quantity is higher than the available quantity in the stock", async () => {
        await createProductDB(adminCookie, sampleProduct);
        await createAndAddToCart(customerCookie, sampleProduct.model);

        // Riduci la quantità disponibile del prodotto a 0 con la data corrente
        const currentDate = new Date().toISOString();
        //Riduci la quantità disponibile del prodotto a 0
        const response = await request(app)
            .patch(`${routePath}/products/${sampleProduct.model}/sell`)
            .set("Cookie", adminCookie)
            .send({ sellingDate: currentDate, quantity: 1 })
            .expect(200);

        expect(response.status).toBe(200);

        // Prova a inserire il prodotto una seconda volta
        const result = await request(app)
            .post(`${routePath}/carts`)
            .set("Cookie", customerCookie)
            .send({ model: sampleProduct.model })
            .expect(409);

        expect(result.status).toBe(409);
    });
});

describe("GET /ezelectronics/carts/history", () => {
    test("It should return the history of paid carts for the logged-in user", async () => {
        await createProductDB(adminCookie, sampleProduct)
        await createAndAddToCart(customerCookie, sampleProduct.model)

        await request(app)
            .patch(`${routePath}/carts`)
            .set("Cookie", customerCookie)
            .expect(200)

        const response = await request(app)
            .get(`${routePath}/carts/history`)
            .set("Cookie", customerCookie)
            .expect(200)

        expect(response.status).toBe(200)
        const cartHistory = response.body
        expect(cartHistory).toBeInstanceOf(Array)
        expect(cartHistory).toHaveLength(1)
        expect(cartHistory[0].customer).toBe(customer.username)
        expect(cartHistory[0].paid).toBe(true)
        expect(cartHistory[0].products).toHaveLength(1)
        expect(cartHistory[0].products[0].model).toBe(sampleProduct.model)
    })

    test("It should not include the current unpaid cart in the history", async () => {
        await createProductDB(adminCookie, sampleProduct)
        await createAndAddToCart(customerCookie, sampleProduct.model)

        const response = await request(app)
            .get(`${routePath}/carts/history`)
            .set("Cookie", customerCookie)
            .expect(200)

        expect(response.status).toBe(200)
        const cartHistory = response.body
        expect(cartHistory).toBeInstanceOf(Array)
        expect(cartHistory).toHaveLength(0)
    })

    test("It should return an empty array if there are no paid carts for the user", async () => {
        const response = await request(app)
            .get(`${routePath}/carts/history`)
            .set("Cookie", customerCookie)
            .expect(200)

        expect(response.status).toBe(200)
        const cartHistory = response.body
        expect(cartHistory).toBeInstanceOf(Array)
        expect(cartHistory).toHaveLength(0)
    })
});

describe("DELETE /carts/products/:model", () => {
    test("It should remove an instance of a product from the current cart of the logged in user", async () => {
        await createProductDB(adminCookie, sampleProduct)
        await createAndAddToCart(customerCookie, sampleProduct.model)

        const response = await request(app)
            .delete(`${routePath}/carts/products/${sampleProduct.model}`)
            .set("Cookie", customerCookie)
            .expect(200)

        expect(response.status).toBe(200)

        const cartResponse = await getCart(customerCookie)
        expect(cartResponse.status).toBe(200)
        const cart = cartResponse.body

        expect(cart.total).toBe(0)
        expect(cart.products).toHaveLength(0)
    })
    test("It should return a 404 error if the product is not in the cart", async () => {
        await createProductDB(adminCookie, sampleProduct)

        const response = await request(app)
            .delete(`${routePath}/carts/products/${sampleProduct.model}`)
            .set("Cookie", customerCookie)
            .expect(404)

        expect(response.status).toBe(404)
    })

    test("It should return a 404 error if there is no unpaid cart for the user", async () => {
        const response = await request(app)
            .delete(`${routePath}/carts/products/${sampleProduct.model}`)
            .set("Cookie", customerCookie)
            .expect(404)

        expect(response.status).toBe(404)
    })
    test("It should return a 404 error if the model does not represent an existing product", async () => {
        const response = await request(app)
            .delete(`${routePath}/carts/products/NonExistingProduct`)
            .set("Cookie", customerCookie)
            .expect(404)

        expect(response.status).toBe(404)
    })
});

describe("DELETE /carts/current", () => {
    test("It should empty the current cart of the logged in user", async () => {
        await createProductDB(adminCookie, sampleProduct);
        await createAndAddToCart(customerCookie, sampleProduct.model);

        const response = await request(app)
            .delete(`${routePath}/carts/current`)
            .set("Cookie", customerCookie)
            .expect(200);

        expect(response.status).toBe(200);

        const cartResponse = await getCart(customerCookie);
        expect(cartResponse.status).toBe(200);
        const cart = cartResponse.body;

        expect(cart.total).toBe(0);
        expect(cart.products).toHaveLength(0);
    }, 60000);

    test("It should return a 404 error if there is no information about an unpaid cart for the user", async () => {
        const response = await request(app)
            .delete(`${routePath}/carts/current`)
            .set("Cookie", customerCookie)
            .expect(404);

        expect(response.status).toBe(404);
    });
})

describe("DELETE /carts", () => {
    test("It should delete all existing carts of all users when called by an Admin", async () => {
        await createProductDB(adminCookie, sampleProduct)
        await createAndAddToCart(customerCookie, sampleProduct.model)

        const response = await request(app)
            .delete(`${routePath}/carts`)
            .set("Cookie", adminCookie)
            .expect(200)

        expect(response.status).toBe(200)

        const cartResponse = await getCart(customerCookie)
        expect(cartResponse.status).toBe(200)
        const cart = cartResponse.body

        expect(cart.total).toBe(0)
        expect(cart.products).toHaveLength(0)
    })

    test("It should delete all existing carts of all users when called by a Manager", async () => {
        await createProductDB(adminCookie, sampleProduct)
        await createAndAddToCart(customerCookie, sampleProduct.model)

        const response = await request(app)
            .delete(`${routePath}/carts`)
            .set("Cookie", managerCookie)
            .expect(200)

        expect(response.status).toBe(200)

        const cartResponse = await getCart(customerCookie)
        expect(cartResponse.status).toBe(200)
        const cart = cartResponse.body

        expect(cart.total).toBe(0)
        expect(cart.products).toHaveLength(0)
    })

    test("It should return a 401 error if called by a Customer", async () => {
        await createProductDB(adminCookie, sampleProduct)
        await createAndAddToCart(customerCookie, sampleProduct.model)

        const response = await request(app)
            .delete(`${routePath}/carts`)
            .set("Cookie", customerCookie)
            .expect(401)

        expect(response.status).toBe(401)
    })
})

describe("GET /carts/all", () => {
    test("It should return all carts of all users when called by an Admin", async () => {
        await createProductDB(adminCookie, sampleProduct)
        await createAndAddToCart(customerCookie, sampleProduct.model)

        await request(app)
            .patch(`${routePath}/carts`)
            .set("Cookie", customerCookie)
            .expect(200)

        const response = await request(app)
            .get(`${routePath}/carts/all`)
            .set("Cookie", adminCookie)
            .expect(200)

        expect(response.status).toBe(200)
        const carts = response.body
        expect(carts).toBeInstanceOf(Array)
        expect(carts.length).toBeGreaterThan(0)
        expect(carts[0].customer).toBeDefined()
        expect(carts[0].products).toBeInstanceOf(Array)
    })

    test("It should return all carts of all users when called by a Manager", async () => {
        await createProductDB(adminCookie, sampleProduct)
        await createAndAddToCart(customerCookie, sampleProduct.model)

        await request(app)
            .patch(`${routePath}/carts`)
            .set("Cookie", customerCookie)
            .expect(200)

        const response = await request(app)
            .get(`${routePath}/carts/all`)
            .set("Cookie", managerCookie)
            .expect(200)

        expect(response.status).toBe(200)
        const carts = response.body
        expect(carts).toBeInstanceOf(Array)
        expect(carts.length).toBeGreaterThan(0)
        expect(carts[0].customer).toBeDefined()
        expect(carts[0].products).toBeInstanceOf(Array)
    })

    test("It should return a 401 error if called by a Customer", async () => {
        const response = await request(app)
            .get(`${routePath}/carts/all`)
            .set("Cookie", customerCookie)
            .expect(401)

        expect(response.status).toBe(401)
    })
});

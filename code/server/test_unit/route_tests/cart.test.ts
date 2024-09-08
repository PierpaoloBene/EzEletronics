import { describe, test, expect, beforeAll, afterAll, jest, beforeEach, afterEach, it } from "@jest/globals"
import request from 'supertest'
import { app } from "../../index"


import cartController from "../../src/controllers/cartController"
import Authenticator from "../../src/routers/auth"
import { Role, User } from "../../src/components/user"
import ErrorHandler from "../../src/helper"
import { ProductReview } from "../../src/components/review"
import { Cart, ProductInCart } from "../../src/components/cart"
import CartController from "../../src/controllers/cartController"
import { Category } from "../../src/components/product"
import { Result, param } from "express-validator"
const baseURL = "/ezelectronics/carts"



jest.mock("../../src/controllers/cartController")
jest.mock("../../src/routers/auth")

const testUser: User = new User("test", "test", "test", Role.CUSTOMER, "test", "test")
const testModel: string = "test"
const testCart1: Cart = new Cart("test", false, "", 0.0, []);
const testProduct: ProductInCart = new ProductInCart(testModel, 1, Category.SMARTPHONE, 1000);


describe("GET /", () => {



    afterEach(() => {
        jest.resetAllMocks();
    });
    //We are testing a route that retrive a cart.
    //This route calls the getCart method of the CartController, uses the express-validator 'param' and 'body' method to validate the input parameters and the isCustomer method of the Authenticator
    //All of these dependencies are mocked to test the route in isolation
    //For the success case, we expect that the dependencies all work correctly and the route returns a 200 success code
    test("No errors", async () => {
        jest.spyOn(Authenticator.prototype, "isCustomer").mockImplementation((req, res, next) => {
            req.user = testUser
            return next()
        })

        jest.spyOn(cartController.prototype, "getCart").mockResolvedValueOnce(testCart1)

        const response = await request(app).get(baseURL + "/").send()
        expect(response.status).toBe(200)
        expect(response.body).toEqual(testCart1);

    })

    test("Controller function error", async () => {
        jest.spyOn(Authenticator.prototype, "isCustomer").mockImplementation((req, res, next) => {
            req.user = testUser
            return next()
        })

        jest.spyOn(CartController.prototype, "getCart").mockRejectedValueOnce(new Error("Something went wrong in the controller"))

        const response = await request(app).get(baseURL + "/").send()
        expect(response.status).toBe(503)
        expect(CartController.prototype.getCart).toHaveBeenCalled()
    })

    test("User is not logged in or user is not a customer", async () => {
        //In this case, we are testing the situation where the route returns an error code because the user is not a Customer
        //We mock the 'isCustomer' method to return a 401 error code, because we are not testing the Authenticator logic here (we assume it works correctly)
        jest.spyOn(Authenticator.prototype, "isCustomer").mockImplementation((req, res, next) => {
            return res.status(401).json({ error: "Unauthorized" });
        })

        //By calling the route with this mocked dependency, we expect the route to return a 401 error code
        const response = await request(app).get(baseURL + "/")
        expect(response.status).toBe(401)

    })

})

describe("POST /", () => {

    afterEach(() => {
        jest.resetAllMocks();
    });
    //We are testing a route that add a product to cart.
    //This route calls the getCart method of the CartController, uses the express-validator 'param' and 'body' method to validate the input parameters and the isCustomer method of the Authenticator
    //All of these dependencies are mocked to test the route in isolation
    //For the success case, we expect that the dependencies all work correctly and the route returns a 200 success code
    test("No errors", async () => {

        //We mock the 'isCustomer' method to return the next function, because we are not testing the Authenticator logic here (we assume it works correctly)
        jest.spyOn(Authenticator.prototype, "isCustomer").mockImplementation((req, res, next) => {
            req.user = testUser
            return next()
        })
        //We mock the express-validator 'param' and 'body' method to return a mock object with the methods we need to validate the input parameters
        //These methods all return an empty object, because we are not testing the validation logic here (we assume it works correctly)
        jest.mock('express-validator', () => ({
            param: jest.fn().mockImplementation(() => ({
                exists: jest.fn().mockReturnThis(),
                isString: () => ({ isLength: () => ({}) }),
            })),
            body: jest.fn().mockImplementation(() => ({
                exists: jest.fn().mockReturnThis(),
                isString: () => ({ isLength: () => ({}) }),
                isInt: () => ({ isLength: () => ({}) }),
            }))
        }))
        //We mock the ErrorHandler validateRequest method to return the next function, because we are not testing the validation logic here (we assume it works correctly)
        jest.spyOn(ErrorHandler.prototype, "validateRequest").mockImplementation((req, res, next) => {
            return next()
        })
        //We mock the CartController addTocart method to return undefined, because we are not testing the CartController logic here (we assume it works correctly)
        jest.spyOn(CartController.prototype, "addToCart").mockResolvedValueOnce(true)

        /*We send a request to the route we are testing. We are in a situation where:
            - The input parameters are 'valid' (= the validation logic is mocked to be correct)
            - The review creation function is 'successful' (= the ReviewController logic is mocked to be correct)
            We expect the 'addReview' function to have been called with the input parameters and to return a 200 success code
            Since we mock the dependencies and we are testing the route in isolation, we do not need to check that the review has actually been created
        */
        const response = await request(app).post(baseURL + "/").send({ model: testModel })
        expect(response.status).toBe(200)
        expect(CartController.prototype.addToCart).toHaveBeenCalledWith(testUser, testModel);
    })
    test("Controller function error", async () => {
        const inputBodyCart = { model: testModel }
        jest.spyOn(Authenticator.prototype, "isCustomer").mockImplementation((req, res, next) => {
            req.user = testUser
            return next()
        })

        jest.mock('express-validator', () => ({
            param: jest.fn().mockImplementation(() => ({
                exists: jest.fn().mockReturnThis(),
                isString: () => ({ isLength: () => ({}) }),
            })),
            body: jest.fn().mockImplementation(() => ({
                exists: jest.fn().mockReturnThis(),
                isString: () => ({ isLength: () => ({}) }),
            }))
        }))

        jest.spyOn(ErrorHandler.prototype, "validateRequest").mockImplementation((req, res, next) => {
            return next()
        })

        jest.spyOn(CartController.prototype, "addToCart").mockRejectedValueOnce(new Error("Something went wrong in the controller"))


        const response = await request(app).post(baseURL + "/").send(inputBodyCart)
        expect(response.status).toBe(503)
        expect(CartController.prototype.addToCart).toHaveBeenCalled()
        expect(CartController.prototype.addToCart).toHaveBeenCalledWith(testUser, testModel)
    })


    test("User is not logged in or user is not a customer", async () => {
        jest.spyOn(Authenticator.prototype, "isCustomer").mockImplementation((req, res, next) => {
            return res.status(401).json({ error: "Unauthorized" });
        })

        const response = await request(app).post(baseURL + "/")
        expect(response.status).toBe(401)

    })

    test("Express validator body error", async () => {
        jest.spyOn(Authenticator.prototype, "isCustomer").mockImplementation((req, res, next) => {
            req.user = testUser
            return next()
        })
        jest.mock('express-validator', () => ({
            body: jest.fn().mockImplementation(() => {
                throw new Error("Invalid value");
            }),
        }));
        jest.spyOn(ErrorHandler.prototype, "validateRequest").mockImplementation((req, res, next) => {
            return res.status(422).json({ error: "The parameters are not formatted properly\n\n" });
        })

        const response = await request(app).post(baseURL + "/")
        expect(response.status).toBe(422)
    })

})

describe("PATCH /", () => {
    afterEach(() => {
        jest.resetAllMocks();
    });

    test("No errors", async () => {
        jest.spyOn(Authenticator.prototype, "isCustomer").mockImplementation((req, res, next) => {
            req.user = testUser
            return next()
        })

        jest.spyOn(cartController.prototype, "checkoutCart").mockResolvedValueOnce(true)

        const response = await request(app).patch(baseURL + "/").send()
        expect(response.status).toBe(200)

    })

    test("Controller function error", async () => {
        jest.spyOn(Authenticator.prototype, "isCustomer").mockImplementation((req, res, next) => {
            req.user = testUser
            return next()
        })

        jest.spyOn(CartController.prototype, "checkoutCart").mockRejectedValueOnce(new Error("Something went wrong in the controller"))

        const response = await request(app).patch(baseURL + "/").send()
        expect(response.status).toBe(503)
        expect(CartController.prototype.checkoutCart).toHaveBeenCalled()
    })

    test("User is not logged in or user is not a customer", async () => {
        jest.spyOn(Authenticator.prototype, "isCustomer").mockImplementation((req, res, next) => {
            return res.status(401).json({ error: "Unauthorized" });
        })

        //By calling the route with this mocked dependency, we expect the route to return a 401 error code
        const response = await request(app).patch(baseURL + "/")
        expect(response.status).toBe(401)

    })

})

describe("GET /history", () => {
    afterEach(() => {
        jest.resetAllMocks();
    });

    test("No errors", async () => {
        let arrayCarts: Cart[] = [];
        arrayCarts.push(testCart1);
        jest.spyOn(Authenticator.prototype, "isCustomer").mockImplementation((req, res, next) => {
            req.user = testUser
            return next()
        })

        jest.spyOn(cartController.prototype, "getCustomerCarts").mockResolvedValueOnce(arrayCarts)

        const response = await request(app).get(baseURL + "/history").send()
        expect(response.status).toBe(200)

    })

    test("Controller function error", async () => {
        jest.spyOn(Authenticator.prototype, "isCustomer").mockImplementation((req, res, next) => {
            req.user = testUser
            return next()
        })

        jest.spyOn(CartController.prototype, "getCustomerCarts").mockRejectedValueOnce(new Error("Something went wrong in the controller"))

        const response = await request(app).get(baseURL + "/history").send()
        expect(response.status).toBe(503)
        expect(CartController.prototype.getCustomerCarts).toHaveBeenCalled()
    })

    test("User is not logged in or user is not a customer", async () => {
        jest.spyOn(Authenticator.prototype, "isCustomer").mockImplementation((req, res, next) => {
            return res.status(401).json({ error: "Unauthorized" });
        })

        //By calling the route with this mocked dependency, we expect the route to return a 401 error code
        const response = await request(app).get(baseURL + "/history")
        expect(response.status).toBe(401)

    })

})

describe("DELETE /products/:model", () => {
    afterEach(() => {
        jest.resetAllMocks();
    });

    test("No errors", async () => {
        jest.spyOn(Authenticator.prototype, "isCustomer").mockImplementation((req, res, next) => {
            req.user = testUser
            return next()
        })
        jest.mock('express-validator', () => ({
            param: jest.fn().mockImplementation(() => ({
                exists: jest.fn().mockReturnThis(),
                isString: () => ({ isLength: () => ({}) }),
            })),
            body: jest.fn().mockImplementation(() => ({
                exists: jest.fn().mockReturnThis(),
                isString: () => ({ isLength: () => ({}) }),
                isInt: () => ({ isLength: () => ({}) }),
            }))
        }))
        jest.spyOn(ErrorHandler.prototype, "validateRequest").mockImplementation((req, res, next) => {
            return next()
        })

        jest.spyOn(CartController.prototype, "removeProductFromCart").mockResolvedValueOnce(true)

        const response = await request(app).delete(baseURL + "/products" + "/" + testModel).send({ model: testModel })
        expect(response.status).toBe(200)
        expect(CartController.prototype.removeProductFromCart).toHaveBeenCalledWith(testUser, testModel);

    })
    test("Controller function error", async () => {
        jest.spyOn(Authenticator.prototype, "isCustomer").mockImplementation((req, res, next) => {
            req.user = testUser
            return next()
        })

        jest.spyOn(CartController.prototype, "removeProductFromCart").mockRejectedValueOnce(new Error("Something went wrong in the controller"))

        const response = await request(app).delete(baseURL + "/products" + "/" + testModel).send()
        expect(response.status).toBe(503)
        expect(CartController.prototype.removeProductFromCart).toHaveBeenCalled()
    })

    test("User is not logged in or user is not a customer", async () => {
        jest.spyOn(Authenticator.prototype, "isCustomer").mockImplementation((req, res, next) => {
            return res.status(401).json({ error: "Unauthorized" });
        })

        //By calling the route with this mocked dependency, we expect the route to return a 401 error code
        const response = await request(app).delete(baseURL + "/products" + "/" + testModel)
        expect(response.status).toBe(401)

    })

})
describe("DELETE /current", () => {
    afterEach(() => {
        jest.resetAllMocks();
    });

    test("No errors", async () => {
        jest.spyOn(Authenticator.prototype, "isCustomer").mockImplementation((req, res, next) => {
            req.user = testUser
            return next()
        })

        jest.spyOn(cartController.prototype, "clearCart").mockResolvedValueOnce(true)

        const response = await request(app).delete(baseURL + "/current").send()
        expect(response.status).toBe(200)

    })

    test("Controller function error", async () => {
        jest.spyOn(Authenticator.prototype, "isCustomer").mockImplementation((req, res, next) => {
            req.user = testUser
            return next()
        })

        jest.spyOn(CartController.prototype, "clearCart").mockRejectedValueOnce(new Error("Something went wrong in the controller"))

        const response = await request(app).delete(baseURL + "/current").send()
        expect(response.status).toBe(503)
        expect(CartController.prototype.clearCart).toHaveBeenCalled()
    })

    test("User is not logged in or user is not a customer", async () => {
        jest.spyOn(Authenticator.prototype, "isCustomer").mockImplementation((req, res, next) => {
            return res.status(401).json({ error: "Unauthorized" });
        })

        //By calling the route with this mocked dependency, we expect the route to return a 401 error code
        const response = await request(app).delete(baseURL + "/current")
        expect(response.status).toBe(401)

    })

})

describe("DELETE /", () => {
    afterEach(() => {
        jest.resetAllMocks();
    });

    test("No errors", async () => {
        jest.spyOn(Authenticator.prototype, "isAdminOrManager").mockImplementation((req, res, next) => {
            req.user = testUser
            return next()
        })

        jest.spyOn(cartController.prototype, "deleteAllCarts").mockResolvedValueOnce(true)

        const response = await request(app).delete(baseURL + "/").send()
        expect(response.status).toBe(200)

    })

    test("Controller function error", async () => {
        jest.spyOn(Authenticator.prototype, "isAdminOrManager").mockImplementation((req, res, next) => {
            req.user = testUser
            return next()
        })

        jest.spyOn(CartController.prototype, "deleteAllCarts").mockRejectedValueOnce(new Error("Something went wrong in the controller"))

        const response = await request(app).delete(baseURL + "/").send()
        expect(response.status).toBe(503)
        expect(CartController.prototype.deleteAllCarts).toHaveBeenCalled()
    })

    test("User is neither Admin or Manager", async () => {
        jest.spyOn(Authenticator.prototype, "isAdminOrManager").mockImplementation((req, res, next) => {
            return res.status(401).json({ error: "Unauthorized" });
        })

        //By calling the route with this mocked dependency, we expect the route to return a 401 error code
        const response = await request(app).delete(baseURL + "/")
        expect(response.status).toBe(401)

    })

})

describe("GET /all", () => {
    afterEach(() => {
        jest.resetAllMocks();
    });

    test("No errors", async () => {
        let arrayCarts: Cart[] = [];
        arrayCarts.push(testCart1);
        jest.spyOn(Authenticator.prototype, "isAdminOrManager").mockImplementation((req, res, next) => {
            req.user = testUser
            return next()
        })

        jest.spyOn(cartController.prototype, "getAllCarts").mockResolvedValueOnce(arrayCarts)

        const response = await request(app).get(baseURL + "/all").send()
        expect(response.status).toBe(200)

    })

    test("Controller function error", async () => {
        jest.spyOn(Authenticator.prototype, "isAdminOrManager").mockImplementation((req, res, next) => {
            req.user = testUser
            return next()
        })

        jest.spyOn(CartController.prototype, "getAllCarts").mockRejectedValueOnce(new Error("Something went wrong in the controller"))

        const response = await request(app).get(baseURL + "/all").send()
        expect(response.status).toBe(503)
        expect(CartController.prototype.getAllCarts).toHaveBeenCalled()
    })

    test("User is neither Admin or Manager", async () => {
        jest.spyOn(Authenticator.prototype, "isAdminOrManager").mockImplementation((req, res, next) => {
            return res.status(401).json({ error: "Unauthorized" });
        })

        //By calling the route with this mocked dependency, we expect the route to return a 401 error code
        const response = await request(app).get(baseURL + "/all")
        expect(response.status).toBe(401)

    })

})






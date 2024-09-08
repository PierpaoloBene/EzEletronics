import { describe, test, expect, beforeAll, afterAll, jest } from "@jest/globals"
import request from 'supertest'
import { app } from "../../index"

import UserController from "../../src/controllers/userController"
import Authenticator from "../../src/routers/auth"
import ProductController from "../../src/controllers/productController"
import { Role, User } from "../../src/components/user"
import ErrorHandler from "../../src/helper"
import { Category, Product } from "../../src/components/product"
import { isString } from "util"
import { ProductAlreadyExistsError, ProductNotFoundError } from "../../src/errors/productError"
import { Utility } from "../../src/utilities"
import exp from "constants"
import { mock } from "node:test"
import { query } from "express"
const baseURL = "/ezelectronics"

//For unit tests, we need to validate the internal logic of a single component, without the need to test the interaction with other components
//For this purpose, we mock (simulate) the dependencies of the component we are testing
jest.mock("../../src/controllers/userController")
jest.mock("../../src/routers/auth")

describe("ProducteRoutes unit tests", () => {




  describe("POST /products", () => {

    test("It should return a 200 success code", async () => {
      const inputProduct = {
        sellingPrice: 780,
        model: "Iphone13",
        category: Category.SMARTPHONE,
        arrivalDate: "2024-06-30",
        details: "New model with 5G",
        quantity: 3
      }
      //We mock the express-validator 'body' method to return a mock object with the methods we need to validate the input parameters
      //These methods all return an empty object, because we are not testing the validation logic here (we assume it works correctly)
      jest.mock('express-validator', () => ({
        body: jest.fn().mockImplementation(() => ({
          exists: jest.fn().mockReturnThis(),
          isString: jest.fn().mockReturnThis(),
          isLength: jest.fn().mockReturnThis(),
          isIn: jest.fn().mockReturnThis(),
          isInt: jest.fn().mockReturnThis(),
          isFloat: jest.fn().mockReturnThis(),
          optional: jest.fn().mockReturnThis(),
          isISO8601: jest.fn().mockReturnThis(),
        })),
      }));

      //We mock the ErrorHandler validateRequest method to return the next function, because we are not testing the validation logic here (we assume it works correctly)
      jest.spyOn(ErrorHandler.prototype, "validateRequest").mockImplementation((req, res, next) => {
        return next()
      })
      //We mock the Autenthicator isAdminOrManager method to return the next function, because we are not testing the validation logic here (we assume it works correctly)
      jest.spyOn(Authenticator.prototype, "isAdminOrManager").mockImplementation((req, res, next) => {
        return next()
      })
      //We mock the UserController createUser method to return true, because we are not testing the UserController logic here (we assume it works correctly)
      jest.spyOn(ProductController.prototype, "registerProducts").mockResolvedValueOnce(true)

      /*We send a request to the route we are testing. We are in a situation where:
          - The input parameters are 'valid' (= the validation logic is mocked to be correct)
          - The user creation function is 'successful' (= the UserController logic is mocked to be correct)
        We expect the 'createUser' function to have been called with the input parameters and to return a 200 success code
        Since we mock the dependencies and we are testing the route in isolation, we do not need to check that the user has actually been created
      */
      const response = await request(app).post(baseURL + "/products").send(inputProduct)
      expect(response.status).toBe(200)
      expect(ProductController.prototype.registerProducts).toHaveBeenCalledWith(
        inputProduct.model,
        inputProduct.category,
        inputProduct.quantity,
        inputProduct.details,
        inputProduct.sellingPrice,
        inputProduct.arrivalDate
      )
    })

    test("It should return a 409 error code", async () => {
      const inputProduct = {
        sellingPrice: 780,
        model: "Iphone13",
        category: Category.SMARTPHONE,
        arrivalDate: "2024-06-30",
        details: "New model with 5G",
        quantity: 3
      }
      //We mock the express-validator 'body' method to return a mock object with the methods we need to validate the input parameters
      //These methods all return an empty object, because we are not testing the validation logic here (we assume it works correctly)
      jest.mock('express-validator', () => ({
        body: jest.fn().mockImplementation(() => ({
          exists: jest.fn().mockReturnThis(),
          isString: jest.fn().mockReturnThis(),
          isLength: jest.fn().mockReturnThis(),
          isIn: jest.fn().mockReturnThis(),
          isInt: jest.fn().mockReturnThis(),
          isFloat: jest.fn().mockReturnThis(),
          optional: jest.fn().mockReturnThis(),
          isISO8601: jest.fn().mockReturnThis(),
        })),
      }))

      //We mock the ErrorHandler validateRequest method to return the next function, because we are not testing the validation logic here (we assume it works correctly)
      jest.spyOn(ErrorHandler.prototype, "validateRequest").mockImplementation((req, res, next) => {
        return next()
      })
      //We mock the Autenthicator isAdminOrManager method to return the next function, because we are not testing the validation logic here (we assume it works correctly)
      jest.spyOn(Authenticator.prototype, "isAdminOrManager").mockImplementation((req, res, next) => {
        return next()
      })
      //We mock the UserController createUser method to return true, because we are not testing the UserController logic here (we assume it works correctly)
      jest.spyOn(ProductController.prototype, "registerProducts").mockImplementation((req, res, next) => {
        const error = new ProductAlreadyExistsError
        throw error
      })

      /*We send a request to the route we are testing. We are in a situation where:
          - The input parameters are 'valid' (= the validation logic is mocked to be correct)
          - The user creation function is 'successful' (= the UserController logic is mocked to be correct)
        We expect the 'createUser' function to have been called with the input parameters and to return a 200 success code
        Since we mock the dependencies and we are testing the route in isolation, we do not need to check that the user has actually been created
      */
      const response = await (await request(app).post(baseURL + "/products").send(inputProduct))
      expect(response.status).toBe(409)

      expect(ProductController.prototype.registerProducts).toHaveBeenCalledWith(
        inputProduct.model,
        inputProduct.category,
        inputProduct.quantity,
        inputProduct.details,
        inputProduct.sellingPrice,
        inputProduct.arrivalDate
      )
    })


  })

  describe("PATCH /products/:model", () => {

    test("It should return a 200 success code", async () => {
      const updateProduct = {
        changeDate: "2024-06-30",
        quantity: 3
      }

      jest.mock('express-validator', () => ({
        param: jest.fn().mockImplementation(() => ({
          exists: jest.fn().mockReturnThis(),
          isLength: jest.fn().mockReturnThis(),
        })),
        body: jest.fn().mockImplementation(() => ({
          exists: jest.fn().mockReturnThis(),
          isInt: jest.fn().mockReturnThis(),
          optional: jest.fn().mockReturnThis(),
          isISO8601: jest.fn().mockReturnThis(),
        })),
      }));

      jest.spyOn(ErrorHandler.prototype, "validateRequest").mockImplementation((req, res, next) => {
        return next()
      })

      jest.spyOn(Authenticator.prototype, "isAdminOrManager").mockImplementation((req, res, next) => {
        return next()
      })

      jest.spyOn(ProductController.prototype, "changeProductQuantity").mockResolvedValueOnce(7)

      const response = await request(app).patch(baseURL + "/products/iphone13").send(updateProduct)
      expect(response.status).toBe(200)
      expect(response.body.quantity).toBe(7)
      expect(ProductController.prototype.changeProductQuantity).toHaveBeenCalledWith(
        "iphone13",
        updateProduct.quantity,
        updateProduct.changeDate,
      )
    })

    test("It should return a 404 error code", async () => {
      const updateProduct = {
        changeDate: "2024-06-30",
        quantity: 3
      }

      jest.mock('express-validator', () => ({
        param: jest.fn().mockImplementation(() => ({
          exists: jest.fn().mockReturnThis(),
          isLength: jest.fn().mockReturnThis(),
        })),
        body: jest.fn().mockImplementation(() => ({
          exists: jest.fn().mockReturnThis(),
          isInt: jest.fn().mockReturnThis(),
          optional: jest.fn().mockReturnThis(),
          isISO8601: jest.fn().mockReturnThis(),
        })),
      }));

      jest.spyOn(ErrorHandler.prototype, "validateRequest").mockImplementation((req, res, next) => {
        return next()
      })


      jest.spyOn(Authenticator.prototype, "isAdminOrManager").mockImplementation((req, res, next) => {
        return next()
      })

      jest.spyOn(ProductController.prototype, "changeProductQuantity").mockImplementationOnce((req, res, next) => {

        const error = new ProductNotFoundError
        throw error
      })


      const response = await request(app).patch(baseURL + "/products/iphone13").send(updateProduct)
      expect(response.status).toBe(404)
      expect(ProductController.prototype.changeProductQuantity).toHaveBeenCalledWith(
        "iphone13",
        updateProduct.quantity,
        updateProduct.changeDate,
      )
    })

  })

  describe("PATCH /products/:model/sell", () => {

    test("It should return a 200 success code", async () => {
      const updateProduct = {
        sellingDate: "2024-06-30",
        quantity: 3
      }

      jest.mock('express-validator', () => ({
        param: jest.fn().mockImplementation(() => ({
          exists: jest.fn().mockReturnThis(),
          isLength: jest.fn().mockReturnThis(),
        })),
        body: jest.fn().mockImplementation(() => ({
          exists: jest.fn().mockReturnThis(),
          isInt: jest.fn().mockReturnThis(),
          optional: jest.fn().mockReturnThis(),
          isISO8601: jest.fn().mockReturnThis(),
        })),
      }));

      jest.spyOn(ErrorHandler.prototype, "validateRequest").mockImplementation((req, res, next) => {
        return next()
      })


      jest.spyOn(Authenticator.prototype, "isAdminOrManager").mockImplementation((req, res, next) => {
        return next()
      })

      jest.spyOn(ProductController.prototype, "sellProduct").mockResolvedValueOnce(true)


      const response = await request(app).patch(baseURL + "/products/iphone13/sell").send(updateProduct)
      expect(response.status).toBe(200)
      expect(ProductController.prototype.sellProduct).toHaveBeenCalledWith(
        "iphone13",
        updateProduct.quantity,
        updateProduct.sellingDate,
      )
    })

    test("It should return a 404 error code", async () => {
      const updateProduct = {
        sellingDate: "2024-06-30",
        quantity: 3
      }

      jest.mock('express-validator', () => ({
        param: jest.fn().mockImplementation(() => ({
          exists: jest.fn().mockReturnThis(),
          isLength: jest.fn().mockReturnThis(),
        })),
        body: jest.fn().mockImplementation(() => ({
          exists: jest.fn().mockReturnThis(),
          isInt: jest.fn().mockReturnThis(),
          optional: jest.fn().mockReturnThis(),
          isISO8601: jest.fn().mockReturnThis(),
        })),
      }));

      jest.spyOn(ErrorHandler.prototype, "validateRequest").mockImplementation((req, res, next) => {
        return next()
      })


      jest.spyOn(Authenticator.prototype, "isAdminOrManager").mockImplementation((req, res, next) => {
        return next()
      })

      jest.spyOn(ProductController.prototype, "sellProduct").mockImplementationOnce((req, res, next) => {
        const error = new ProductNotFoundError
        throw error
      })


      const response = await request(app).patch(baseURL + "/products/iphone13/sell").send(updateProduct)
      expect(response.status).toBe(404)
      expect(ProductController.prototype.sellProduct).toHaveBeenCalledWith(
        "iphone13",
        updateProduct.quantity,
        updateProduct.sellingDate,
      )
    })

    test("It should return a 409 error code", async () => {
      const updateProduct = {
        sellingDate: "2024-06-30",
        quantity: 3
      }

      jest.mock('express-validator', () => ({
        param: jest.fn().mockImplementation(() => ({
          exists: jest.fn().mockReturnThis(),
          isLength: jest.fn().mockReturnThis(),
        })),
        body: jest.fn().mockImplementation(() => ({
          exists: jest.fn().mockReturnThis(),
          isInt: jest.fn().mockReturnThis(),
          optional: jest.fn().mockReturnThis(),
          isISO8601: jest.fn().mockReturnThis(),
        })),
      }));

      jest.spyOn(ErrorHandler.prototype, "validateRequest").mockImplementation((req, res, next) => {
        return next()
      })


      jest.spyOn(Authenticator.prototype, "isAdminOrManager").mockImplementation((req, res, next) => {
        return next()
      })

      jest.spyOn(ProductController.prototype, "sellProduct").mockImplementationOnce((req, res, next) => {
        const error = new ProductAlreadyExistsError
        throw error
      })


      const response = await request(app).patch(baseURL + "/products/iphone13/sell").send(updateProduct)
      expect(response.status).toBe(409)
      expect(ProductController.prototype.sellProduct).toHaveBeenCalledWith(
        "iphone13",
        updateProduct.quantity,
        updateProduct.sellingDate,
      )
    })

  })


  describe("GET /products", () => {

    test("It should return all products when no query parameters are provided", async () => {
      const products =
        [{
          sellingPrice: 200,
          model: "iPhone 13",
          category: Category.SMARTPHONE,
          details: "",
          arrivalDate: "2024-01-01",
          quantity: 8
        }]
        ;
      jest.mock('express-validator', () => ({
        query: jest.fn().mockImplementation(() => ({
          optional: jest.fn().mockReturnThis(),
          isIn: jest.fn().mockReturnThis(),
        })),
      }));
      jest.spyOn(ErrorHandler.prototype, "validateRequest").mockImplementation((req, res, next) => next());
      jest.spyOn(Authenticator.prototype, "isAdminOrManager").mockImplementation((req, res, next) => next());
      jest.spyOn(ProductController.prototype, "getProducts").mockResolvedValueOnce(products);

      const response = await request(app).get(baseURL + "/products");
      expect(response.status).toBe(200);
      expect(response.body).toEqual(products);
    });

    test("It should return products filtered by category", async () => {
      const products =
        [{
          sellingPrice: 200,
          model: "iPhone 13",
          category: Category.SMARTPHONE,
          details: "",
          arrivalDate: "2024-01-01",
          quantity: 8
        }]


      jest.spyOn(ProductController.prototype, "getProducts").mockResolvedValueOnce(products);

      const response = await request(app).get(baseURL + "/products").query({ grouping: "category", category: "Smartphone" });
      expect(response.status).toBe(200);
      expect(response.body).toEqual(products);
    });

    test("It should return products filtered by model", async () => {
      const products = [
        {
          sellingPrice: 200,
          model: "iPhone 13",
          category: Category.SMARTPHONE,
          details: "",
          arrivalDate: "2024-01-01",
          quantity: 8
        }
      ];
      jest.spyOn(ProductController.prototype, "getProducts").mockResolvedValueOnce(products);

      const response = await request(app).get(baseURL + "/products").query({ grouping: "model", model: "iPhone 13" });
      expect(response.status).toBe(200);
      expect(response.body).toEqual(products);
    });


    test("It should return 422 if grouping is null and category or model is not null", async () => {
      const response = await request(app).get(baseURL + "/products").query({ category: "Smartphone" });
      expect(response.status).toBe(422);

      const response2 = await request(app).get(baseURL + "/products").query({ model: "iPhone 13" });
      expect(response2.status).toBe(422);
    });


    test("It should return 422 if grouping is category and category is null or model is not null", async () => {
      const response = await request(app).get(baseURL + "/products").query({ grouping: "category" });
      expect(response.status).toBe(422);

      const response2 = await request(app).get(baseURL + "/products").query({ grouping: "category", model: "iPhone 13" });
      expect(response2.status).toBe(422);
    });


    test("It should return 422 if grouping is model and model is null or category is not null", async () => {
      const response = await request(app).get(baseURL + "/products").query({ grouping: "model" });
      expect(response.status).toBe(422);

      const response2 = await request(app).get(baseURL + "/products").query({ grouping: "model", category: "Smartphone" });
      expect(response2.status).toBe(422);
    });

    test("It should return 404 if model does not exist in database", async () => {
      jest.spyOn(ProductController.prototype, "getProducts").mockImplementationOnce((req) => {
        throw new ProductNotFoundError
      })
      const response = await request(app).get(baseURL + "/products").query({ grouping: "model", model: "NonExistentModel" });
      expect(response.status).toBe(404);
    });

  });


  describe("GET /available", () => {
    beforeEach(() => {
      jest.resetAllMocks();
      jest.spyOn(Authenticator.prototype, "isLoggedIn").mockImplementation((req, res, next) => next());
      jest.spyOn(ErrorHandler.prototype, "validateRequest").mockImplementation((req, res, next) => next());
    });

    test("It should return all available products when no query parameters are provided", async () => {
      const products: Product[] = [
        { sellingPrice: 200, model: "iPhone 13", category: Category.SMARTPHONE, details: "", arrivalDate: "2024-01-01", quantity: 8 }
      ];
      jest.spyOn(ProductController.prototype, "getAvailableProducts").mockResolvedValueOnce(products);

      const response = await request(app).get(baseURL + '/products/available');
      expect(response.status).toBe(200);
      expect(response.body).toEqual(products);
    });

    test("It should return available products filtered by category", async () => {
      const products: Product[] = [
        { sellingPrice: 200, model: "iPhone 13", category: Category.SMARTPHONE, details: "", arrivalDate: "2024-01-01", quantity: 8 }
      ];
      jest.spyOn(ProductController.prototype, "getAvailableProducts").mockResolvedValueOnce(products);

      const response = await request(app).get(baseURL + '/products/available').query({ grouping: "category", category: "Smartphone" });
      expect(response.status).toBe(200);
      expect(response.body).toEqual(products);
    });

    test("It should return available products filtered by model", async () => {
      const products: Product[] = [
        { sellingPrice: 200, model: "iPhone 13", category: Category.SMARTPHONE, details: "", arrivalDate: "2024-01-01", quantity: 8 }
      ];
      jest.spyOn(ProductController.prototype, "getAvailableProducts").mockResolvedValueOnce(products);

      const response = await request(app).get(baseURL + '/products/available').query({ grouping: "model", model: "iPhone 13" });
      expect(response.status).toBe(200);
      expect(response.body).toEqual(products);
    });

    test("It should return 422 if grouping is null and category or model is not null", async () => {
      let response = await request(app).get(baseURL + '/products/available').query({ category: "Smartphone" });
      expect(response.status).toBe(422);

      response = await request(app).get(baseURL + '/products/available').query({ model: "iPhone 13" });
      expect(response.status).toBe(422);
    });

    test("It should return 422 if grouping is category and category is null or model is not null", async () => {
      let response = await request(app).get(baseURL + '/products/available').query({ grouping: "category" });
      expect(response.status).toBe(422);

      response = await request(app).get(baseURL + '/products/available').query({ grouping: "category", model: "iPhone 13" });
      expect(response.status).toBe(422);
    });

    test("It should return 422 if grouping is model and model is null or category is not null", async () => {
      let response = await request(app).get(baseURL + '/products/available').query({ grouping: "model" });
      expect(response.status).toBe(422);

      response = await request(app).get(baseURL + '/products/available').query({ grouping: "model", category: "Smartphone" });
      expect(response.status).toBe(422);
    });

  });


  describe("DELETE /products/", () => {

    test("It should return a 200 success code", async () => {

      jest.spyOn(Authenticator.prototype, "isAdminOrManager").mockImplementation((req, res, next) => {
        return next()
      })

      jest.spyOn(ProductController.prototype, "deleteAllProducts").mockResolvedValueOnce(true)

      const response = await request(app).delete(baseURL + "/products")
      expect(response.status).toBe(200)
    })

  })




  describe("DELETE /products/:model", () => {

    test("It should return a 200 success code", async () => {

      jest.mock('express-validator', () => ({
        param: jest.fn().mockImplementation(() => ({
          exists: jest.fn().mockReturnThis(),
          isLength: jest.fn().mockReturnThis(),
        })),
      }));

      jest.spyOn(Authenticator.prototype, "isAdminOrManager").mockImplementation((req, res, next) => {
        return next()
      })

      jest.spyOn(ProductController.prototype, "deleteProduct").mockResolvedValueOnce(true)

      const response = await request(app).delete(baseURL + "/products/iphone13")
      expect(response.status).toBe(200)
      expect(ProductController.prototype.deleteProduct).toHaveBeenCalledWith("iphone13")

    })

    test("It should return a 404 error code", async () => {

      jest.mock('express-validator', () => ({
        param: jest.fn().mockImplementation(() => ({
          exists: jest.fn().mockReturnThis(),
          isLength: jest.fn().mockReturnThis(),
        })),
      }));

      jest.spyOn(Authenticator.prototype, "isAdminOrManager").mockImplementation((req, res, next) => {
        return next()
      })

      jest.spyOn(ProductController.prototype, "deleteProduct").mockImplementationOnce((req) => {
        const error = new ProductNotFoundError
        throw error
      })

      const response = await request(app).delete(baseURL + "/products/iphone13")
      expect(response.status).toBe(404)
      expect(ProductController.prototype.deleteProduct).toHaveBeenCalledWith("iphone13")

    })

  })


})
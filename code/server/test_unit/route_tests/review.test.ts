import { describe, test, expect, jest } from "@jest/globals"
import request from 'supertest'
import { app } from "../../index"

import ReviewController from "../../src/controllers/reviewController"
import Authenticator from "../../src/routers/auth"
import { Role, User } from "../../src/components/user"
import ErrorHandler from "../../src/helper"
import { ProductReview } from "../../src/components/review"
const baseURL = "/ezelectronics/reviews"


//For unit tests, we need to validate the internal logic of a single component, without the need to test the interaction with other components
//For this purpose, we mock (simulate) the dependencies of the component we are testing
jest.mock("../../src/controllers/reviewController")
jest.mock("../../src/routers/auth")


const testUser: User = new User("test", "test", "test", Role.ADMIN, "test", "test")
const testModel: string = "test"
const testReview1: ProductReview = new ProductReview(testModel, "test1", 1, "2024-06-01", "test1")
const testReview2: ProductReview = new ProductReview(testModel, "test2", 2, "2024-06-02", "test2")


describe("POST /:model", () => {
    //We are testing a route that creates a review.
    //This route calls the addReview method of the ReviewController, uses the express-validator 'param' and 'body' method to validate the input parameters and the isCustomer method of the Authenticator
    //All of these dependencies are mocked to test the route in isolation
    //For the success case, we expect that the dependencies all work correctly and the route returns a 200 success code
    test("No errors", async () => {
        const inputBodyReview = { score: 1, comment: "test" }
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
        //We mock the ReviewController addReview method to return undefined, because we are not testing the ReviewController logic here (we assume it works correctly)
        jest.spyOn(ReviewController.prototype, "addReview").mockResolvedValueOnce(undefined)

        /*We send a request to the route we are testing. We are in a situation where:
            - The input parameters are 'valid' (= the validation logic is mocked to be correct)
            - The review creation function is 'successful' (= the ReviewController logic is mocked to be correct)
            We expect the 'addReview' function to have been called with the input parameters and to return a 200 success code
            Since we mock the dependencies and we are testing the route in isolation, we do not need to check that the review has actually been created
        */
        const response = await request(app).post(baseURL + "/" + testModel).send(inputBodyReview)
        expect(response.status).toBe(200)
        expect(ReviewController.prototype.addReview).toHaveBeenCalled()
        expect(ReviewController.prototype.addReview).toHaveBeenCalledWith(testModel, testUser, inputBodyReview.score, inputBodyReview.comment)
    })

    test("Controller function error", async () => {
        const inputBodyReview = { score: 1, comment: "test" }
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
        //We mock the ReviewController addReview method to return a rejected promise
        jest.spyOn(ReviewController.prototype, "addReview").mockRejectedValueOnce(new Error("Something went wrong in the controller"))

        /*We send a request to the route we are testing. We are in a situation where:
            - The input parameters are 'valid' (= the validation logic is mocked to be correct)
            - The review creation function is 'unsuccesful'
            We expect the 'addReview' function to have been called with the input parameters and to return an error code
        */
        const response = await request(app).post(baseURL + "/" + testModel).send(inputBodyReview)
        expect(response.status).toBe(503)
        expect(ReviewController.prototype.addReview).toHaveBeenCalled()
        expect(ReviewController.prototype.addReview).toHaveBeenCalledWith(testModel, testUser, inputBodyReview.score, inputBodyReview.comment)
    })

    test("User is not Customer", async () => {
        //In this case, we are testing the situation where the route returns an error code because the user is not a Customer
        //We mock the 'isCustomer' method to return a 401 error code, because we are not testing the Authenticator logic here (we assume it works correctly)
        jest.spyOn(Authenticator.prototype, "isCustomer").mockImplementation((req, res, next) => {
            return res.status(401).json({ error: "Unauthorized" });
        })

        //By calling the route with this mocked dependency, we expect the route to return a 401 error code
        const response = await request(app).post(baseURL + "/" + testModel)
        expect(response.status).toBe(401)
    })

    test("Express validator param error", async () => {
        //We mock the 'isCustomer' method to return the next function, because we are not testing the Authenticator logic here (we assume it works correctly)
        jest.spyOn(Authenticator.prototype, "isCustomer").mockImplementation((req, res, next) => {
            req.user = testUser
            return next()
        })
        //We mock the 'param' method of the express-validator to throw an error, because we are not testing the validation logic here (we assume it works correctly)
        jest.mock('express-validator', () => ({
            param: jest.fn().mockImplementation(() => {
                throw new Error("Invalid value");
            }),
        }));
        //We mock the 'validateRequest' method to receive an error and return a 422 error code, because we are not testing the validation logic here (we assume it works correctly)
        jest.spyOn(ErrorHandler.prototype, "validateRequest").mockImplementation((req, res, next) => {
            return res.status(422).json({ error: "The parameters are not formatted properly\n\n" });
        })
    
        //We call the route with dependencies mocked to simulate an error scenario, and expect a 422 code
        const response = await request(app).post(baseURL + "/Invalid")
        expect(response.status).toBe(422)
    })

    test("Express validator body error", async () => {
        //We mock the 'isCustomer' method to return the next function, because we are not testing the Authenticator logic here (we assume it works correctly)
        jest.spyOn(Authenticator.prototype, "isCustomer").mockImplementation((req, res, next) => {
            req.user = testUser
            return next()
        })
        //We mock the 'param' method of the express-validator to throw an error, because we are not testing the validation logic here (we assume it works correctly)
        jest.mock('express-validator', () => ({
            param: jest.fn().mockImplementation(() => ({
                exists: jest.fn().mockReturnThis(),
                isString: () => ({ isLength: () => ({}) }),
            })),
            body: jest.fn().mockImplementation(() => {
                throw new Error("Invalid value");
            }),
        }));
        //We mock the 'validateRequest' method to receive an error and return a 422 error code, because we are not testing the validation logic here (we assume it works correctly)
        jest.spyOn(ErrorHandler.prototype, "validateRequest").mockImplementation((req, res, next) => {
            return res.status(422).json({ error: "The parameters are not formatted properly\n\n" });
        })
    
        //We call the route with dependencies mocked to simulate an error scenario, and expect a 422 code
        const response = await request(app).post(baseURL + "/Invalid")
        expect(response.status).toBe(422)
    })
})


describe("GET /:model", () => {
    test("No errors", async () => {
        jest.spyOn(Authenticator.prototype, "isLoggedIn").mockImplementation((req, res, next) => {
            req.user = testUser
            return next()
        })
        jest.mock('express-validator', () => ({
            param: jest.fn().mockImplementation(() => ({
                exists: jest.fn().mockReturnThis(),
                isString: () => ({ isLength: () => ({}) }),
            }))
        }))
        jest.spyOn(ReviewController.prototype, "getProductReviews").mockResolvedValueOnce([testReview1, testReview2])

        const response = await request(app).get(baseURL + "/" + testModel).send()
        expect(response.status).toBe(200)
        expect(ReviewController.prototype.getProductReviews).toHaveBeenCalled()
        expect(ReviewController.prototype.getProductReviews).toHaveBeenCalledWith(testModel)
        expect(response.body).toEqual([testReview1, testReview2])

    })

    test("Controller function error", async () => {
        jest.spyOn(Authenticator.prototype, "isLoggedIn").mockImplementation((req, res, next) => {
            req.user = testUser
            return next()
        })
        jest.mock('express-validator', () => ({
            param: jest.fn().mockImplementation(() => ({
                exists: jest.fn().mockReturnThis(),
                isString: () => ({ isLength: () => ({}) }),
            }))
        }))
        jest.spyOn(ReviewController.prototype, "getProductReviews").mockRejectedValueOnce(new Error("Something went wrong in the controller"))

        const response = await request(app).get(baseURL + "/" + testModel).send()
        expect(response.status).toBe(503)
        expect(ReviewController.prototype.getProductReviews).toHaveBeenCalled()
        expect(ReviewController.prototype.getProductReviews).toHaveBeenCalledWith(testModel)
    })
    
    test("User is not logged in", async () => {
        jest.spyOn(Authenticator.prototype, "isLoggedIn").mockImplementation((req, res, next) => {
            return res.status(401).json({ error: "Unauthorized" });
        })

        const response = await request(app).get(baseURL + "/" + testModel)
        expect(response.status).toBe(401)
    })
})


describe("DELETE /:model", () => {
    test("No errors", async () => {
        jest.spyOn(Authenticator.prototype, "isCustomer").mockImplementation((req, res, next) => {
            req.user = testUser
            return next()
        })
        jest.mock('express-validator', () => ({
            param: jest.fn().mockImplementation(() => ({
                exists: jest.fn().mockReturnThis(),
                isString: () => ({ isLength: () => ({}) }),
            }))
        }))
        jest.spyOn(ReviewController.prototype, "deleteReview").mockResolvedValueOnce(undefined)

        const response = await request(app).delete(baseURL + "/" + testModel).send()
        expect(response.status).toBe(200)
        expect(ReviewController.prototype.deleteReview).toHaveBeenCalled()
        expect(ReviewController.prototype.deleteReview).toHaveBeenCalledWith(testModel, testUser)
    })

    test("Controller function error", async () => {
        jest.spyOn(Authenticator.prototype, "isCustomer").mockImplementation((req, res, next) => {
            req.user = testUser
            return next()
        })
        jest.mock('express-validator', () => ({
            param: jest.fn().mockImplementation(() => ({
                exists: jest.fn().mockReturnThis(),
                isString: () => ({ isLength: () => ({}) }),
            }))
        }))
        jest.spyOn(ReviewController.prototype, "deleteReview").mockRejectedValueOnce(new Error("Something went wrong in the controller"))

        const response = await request(app).delete(baseURL + "/" + testModel).send()
        expect(response.status).toBe(503)
        expect(ReviewController.prototype.deleteReview).toHaveBeenCalled()
        expect(ReviewController.prototype.deleteReview).toHaveBeenCalledWith(testModel, testUser)
    })

    test("User is not Customer", async () => {
        jest.spyOn(Authenticator.prototype, "isCustomer").mockImplementation((req, res, next) => {
            return res.status(401).json({ error: "Unauthorized" });
        })

        const response = await request(app).delete(baseURL + "/" + testModel)
        expect(response.status).toBe(401)
    })
})


describe("DELETE /:model/all", () => {
    test("No errors", async () => {
        jest.spyOn(Authenticator.prototype, "isAdminOrManager").mockImplementation((req, res, next) => {
            return next()
        })
        jest.mock('express-validator', () => ({
            param: jest.fn().mockImplementation(() => ({
                exists: jest.fn().mockReturnThis(),
                isString: () => ({ isLength: () => ({}) }),
            }))
        }))
        jest.spyOn(ReviewController.prototype, "deleteReviewsOfProduct").mockResolvedValueOnce(undefined)

        const response = await request(app).delete(baseURL + "/" + testModel + "/all").send()
        expect(response.status).toBe(200)
        expect(ReviewController.prototype.deleteReviewsOfProduct).toHaveBeenCalled()
        expect(ReviewController.prototype.deleteReviewsOfProduct).toHaveBeenCalledWith(testModel)
    })

    test("Controller function error", async () => {
        jest.spyOn(Authenticator.prototype, "isAdminOrManager").mockImplementation((req, res, next) => {
            return next()
        })
        jest.mock('express-validator', () => ({
            param: jest.fn().mockImplementation(() => ({
                exists: jest.fn().mockReturnThis(),
                isString: () => ({ isLength: () => ({}) }),
            }))
        }))
        jest.spyOn(ReviewController.prototype, "deleteReviewsOfProduct").mockRejectedValueOnce(new Error("Something went wrong in the controller"))

        const response = await request(app).delete(baseURL + "/" + testModel + "/all").send()
        expect(response.status).toBe(503)
        expect(ReviewController.prototype.deleteReviewsOfProduct).toHaveBeenCalled()
        expect(ReviewController.prototype.deleteReviewsOfProduct).toHaveBeenCalledWith(testModel)
    })

    test("User is neither Admin or Manager", async () => {
        jest.spyOn(Authenticator.prototype, "isAdminOrManager").mockImplementation((req, res, next) => {
            return res.status(401).json({ error: "Unauthorized" });
        })

        const response = await request(app).delete(baseURL + "/" + testModel + "/all").send()
        expect(response.status).toBe(401)
    })
})


describe("DELETE /", () => {
    test("No errors", async () => {
        jest.spyOn(Authenticator.prototype, "isAdminOrManager").mockImplementation((req, res, next) => {
            return next()
        })
        jest.mock('express-validator', () => ({
            param: jest.fn().mockImplementation(() => ({
                exists: jest.fn().mockReturnThis(),
                isString: () => ({ isLength: () => ({}) }),
            }))
        }))
        jest.spyOn(ReviewController.prototype, "deleteAllReviews").mockResolvedValueOnce(undefined)

        const response = await request(app).delete(baseURL + "/").send()
        expect(response.status).toBe(200)
        expect(ReviewController.prototype.deleteAllReviews).toHaveBeenCalled()
        expect(ReviewController.prototype.deleteAllReviews).toHaveBeenCalledWith()
    })

    test("Controller function error", async () => {
        jest.spyOn(Authenticator.prototype, "isAdminOrManager").mockImplementation((req, res, next) => {
            return next()
        })
        jest.mock('express-validator', () => ({
            param: jest.fn().mockImplementation(() => ({
                exists: jest.fn().mockReturnThis(),
                isString: () => ({ isLength: () => ({}) }),
            }))
        }))
        jest.spyOn(ReviewController.prototype, "deleteAllReviews").mockRejectedValueOnce(new Error("Something went wrong in the controller"))

        const response = await request(app).delete(baseURL + "/").send()
        expect(response.status).toBe(503)
        expect(ReviewController.prototype.deleteAllReviews).toHaveBeenCalled()
        expect(ReviewController.prototype.deleteAllReviews).toHaveBeenCalledWith()
    })

    test("User is neither Admin or Manager", async () => {
        jest.spyOn(Authenticator.prototype, "isAdminOrManager").mockImplementation((req, res, next) => {
            return res.status(401).json({ error: "Unauthorized" });
        })

        const response = await request(app).delete(baseURL + "/").send()
        expect(response.status).toBe(401)
    })
})

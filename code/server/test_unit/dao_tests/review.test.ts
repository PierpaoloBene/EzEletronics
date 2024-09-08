import { describe, test, expect, beforeAll, afterEach, jest } from "@jest/globals"

import ReviewDAO from "../../src/dao/reviewDAO"
import db, { DBCountType } from "../../src/db/db"
import { Database } from "sqlite3"
import { ProductReview } from "../../src/components/review";
import dayjs from "dayjs";
import { ExistingReviewError, NoExistProductError, NoReviewProductError } from "../../src/errors/reviewError";
import { User, Role } from "../../src/components/user";


jest.mock("../../src/db/db.ts")


describe("DAO addReview", () => {
    let reviewDAO: ReviewDAO;
    const testReview = { //Define a test review object
        model: "test",
        user: "test",
        score: 1,
        comment: "test",
    }
    const review = new ProductReview(testReview.model, testReview.user, testReview.score, dayjs().format('YYYY-MM-DD'), testReview.comment)

    beforeAll(() => {
        reviewDAO = new ReviewDAO();
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });


    //Example of unit test for the addReview method
    //It mocks the database run method to simulate a successful insertion
    //It then calls the addReview method and expects it to resolve null
    test("No errors", async () => {
        const mockDBGet = jest.spyOn(db, "get")
            .mockImplementationOnce((sql, params, callback) => {
                callback(null,  { 'COUNT(*)': 1 } as DBCountType)
                return {} as Database
            })
            .mockImplementationOnce((sql, params, callback) => {
                callback(null,  { 'COUNT(*)': 0 } as DBCountType)
                return {} as Database
            });
        const mockDBRun = jest.spyOn(db, "run").mockImplementationOnce((sql, params, callback) => {
            callback(null)
            return {} as Database
        });
    
        const result = await reviewDAO.addReview(review)
        expect(result).toBe(null)
    })

    test("Model not existing error", async () => {
        const mockDBGet = jest.spyOn(db, "get").mockImplementationOnce((sql, params, callback) => {
            callback(null,  { 'COUNT(*)': 0 } as DBCountType)
            return {} as Database
        })
    
        await expect(reviewDAO.addReview(review)).rejects.toThrow(NoExistProductError)
    })

    test("Review already existing error", async () => {
        const mockDBGet = jest.spyOn(db, "get")
            .mockImplementationOnce((sql, params, callback) => {
                callback(null,  { 'COUNT(*)': 1 } as DBCountType)
                return {} as Database
            })
            .mockImplementationOnce((sql, params, callback) => {
                callback(null,  { 'COUNT(*)': 1 } as DBCountType)
                return {} as Database
            });
    
        await expect(reviewDAO.addReview(review)).rejects.toThrow(ExistingReviewError)
    })

    test("DB error in the first query", async () => {
        const mockDBGet = jest.spyOn(db, "get").mockImplementationOnce((sql, params, callback) => {
            callback(new Error("DB error"), null)
            return {} as Database
        })

        await expect(reviewDAO.addReview(review)).rejects.toThrow("DB error")
    })

    test("DB error in the second query", async () => {
        const mockDBGet = jest.spyOn(db, "get")
            .mockImplementationOnce((sql, params, callback) => {
                callback(null,  { 'COUNT(*)': 1 } as DBCountType)
                return {} as Database
            })
            .mockImplementationOnce((sql, params, callback) => {
                callback(new Error("DB error"), null)
                return {} as Database
            })

        await expect(reviewDAO.addReview(review)).rejects.toThrow("DB error")
    })

    test("DB error in the third query", async () => {
        const mockDBGet = jest.spyOn(db, "get")
            .mockImplementationOnce((sql, params, callback) => {
                callback(null,  { 'COUNT(*)': 1 } as DBCountType)
                return {} as Database
            })
            .mockImplementationOnce((sql, params, callback) => {
                callback(null,  { 'COUNT(*)': 0 } as DBCountType)
                return {} as Database
            });
        const mockDBRun = jest.spyOn(db, "run").mockImplementationOnce((sql, params, callback) => {
            callback(new Error("DB error"))
            return {} as Database
        });

        await expect(reviewDAO.addReview(review)).rejects.toThrow("DB error")
    })
})


describe("DAO getProductReviews", () => {
    let reviewDAO: ReviewDAO;
    const testModel = "test"

    beforeAll(() => {
        reviewDAO = new ReviewDAO();
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });


    test("No errors", async () => {
        const testReviews: ProductReview[] = [
            new ProductReview(testModel, "test1", 1, "2024-06-01", "test1"),
            new ProductReview(testModel, "test2", 2, "2024-06-02", "test2")
        ];

        const mockDBGet = jest.spyOn(db, "get").mockImplementationOnce((sql, params, callback) => {
            callback(null, { 'COUNT(*)': 1 } as DBCountType)
            return {} as Database
        })

        const mockDBAll = jest.spyOn(db, "all").mockImplementationOnce((sql, params, callback) => {
            callback(null, testReviews)
            return {} as Database
        })
    
        const result = await reviewDAO.getProductReviews(testModel)
        expect(result).toEqual(testReviews)
    })

    test("Model not existing error", async () => {
        const mockDBGet = jest.spyOn(db, "get").mockImplementationOnce((sql, params, callback) => {
            callback(null, { 'COUNT(*)': 0 } as DBCountType)
            return {} as Database
        })
    
        await expect(reviewDAO.getProductReviews(testModel)).rejects.toThrow(NoExistProductError)
    })

    test("DB error in the first query", async () => {
        const mockDBAll = jest.spyOn(db, "get").mockImplementationOnce((sql, params, callback) => {
            callback(new Error("DB error"), null)
            return {} as Database
        })
    
        await expect(reviewDAO.getProductReviews(testModel)).rejects.toThrow("DB error")
    })

    test("DB error in the second query", async () => {
        const mockDBGet = jest.spyOn(db, "get").mockImplementationOnce((sql, params, callback) => {
            callback(null, { 'COUNT(*)': 1 } as DBCountType)
            return {} as Database
        })

        const mockDBAll = jest.spyOn(db, "all").mockImplementationOnce((sql, params, callback) => {
            callback(new Error("DB error"), null)
            return {} as Database
        })
    
        await expect(reviewDAO.getProductReviews(testModel)).rejects.toThrow("DB error")
    })
})


describe("DAO deleteReview", () => {
    let reviewDAO: ReviewDAO;
    const testUser = { //Define a test user object
        username: "test",
        name: "test",
        surname: "test",
        role: Role.CUSTOMER,
        address: "test",
        birthdate: "test"
    }
    const testModel = "test"
    const user = new User(testUser.username, testUser.name, testUser.surname, testUser.role, testUser.address, testUser.birthdate)
 
    beforeAll(() => {
        reviewDAO = new ReviewDAO();
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });


    test("No errors", async () => {
        const mockDBGet = jest.spyOn(db, "get")
            .mockImplementationOnce((sql, params, callback) => {
                callback(null,  { 'COUNT(*)': 1 } as DBCountType)
                return {} as Database
            })
            .mockImplementationOnce((sql, params, callback) => {
                callback(null,  { 'COUNT(*)': 1 } as DBCountType)
                return {} as Database
            });
        const mockDBRun = jest.spyOn(db, "run").mockImplementationOnce((sql, params, callback) => {
            callback(null)
            return {} as Database
        });
    
        const result = await reviewDAO.deleteReview(testModel, user)
        expect(result).toBe(null)
    })

    test("Model not existing error", async () => {
        const mockDBGet = jest.spyOn(db, "get").mockImplementationOnce((sql, params, callback) => {
            callback(null,  { 'COUNT(*)': 0 } as DBCountType)
            return {} as Database
        })
    
        await expect(reviewDAO.deleteReview(testModel, user)).rejects.toThrow(NoExistProductError)
    })

    test("Review not existing error", async () => {
        const mockDBGet = jest.spyOn(db, "get")
            .mockImplementationOnce((sql, params, callback) => {
                callback(null,  { 'COUNT(*)': 1 } as DBCountType)
                return {} as Database
            })
            .mockImplementationOnce((sql, params, callback) => {
                callback(null,  { 'COUNT(*)': 0 } as DBCountType)
                return {} as Database
            });
    
        await expect(reviewDAO.deleteReview(testModel, user)).rejects.toThrow(NoReviewProductError)
    })

    test("DB error in the first query", async () => {
        const mockDBGet = jest.spyOn(db, "get").mockImplementationOnce((sql, params, callback) => {
            callback(new Error("DB error"), null)
            return {} as Database
        })

        await expect(reviewDAO.deleteReview(testModel, user)).rejects.toThrow("DB error")
    })

    test("DB error in the second query", async () => {
        const mockDBGet = jest.spyOn(db, "get")
            .mockImplementationOnce((sql, params, callback) => {
                callback(null,  { 'COUNT(*)': 1 } as DBCountType)
                return {} as Database
            })
            .mockImplementationOnce((sql, params, callback) => {
                callback(new Error("DB error"), null)
                return {} as Database
            })

        await expect(reviewDAO.deleteReview(testModel, user)).rejects.toThrow("DB error")
    })

    test("DB error in the third query", async () => {
        const mockDBGet = jest.spyOn(db, "get")
            .mockImplementationOnce((sql, params, callback) => {
                callback(null,  { 'COUNT(*)': 1 } as DBCountType)
                return {} as Database
            })
            .mockImplementationOnce((sql, params, callback) => {
                callback(null,  { 'COUNT(*)': 1 } as DBCountType)
                return {} as Database
            });
        const mockDBRun = jest.spyOn(db, "run").mockImplementationOnce((sql, params, callback) => {
            callback(new Error("DB error"))
            return {} as Database
        });

        await expect(reviewDAO.deleteReview(testModel, user)).rejects.toThrow("DB error")
    })
})


describe("DAO deleteReviewsOfProduct", () => {
    let reviewDAO: ReviewDAO;
    const testModel = "test"

    beforeAll(() => {
        reviewDAO = new ReviewDAO();
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });


    test("No errors", async () => {
        const mockDBGet = jest.spyOn(db, "get").mockImplementationOnce((sql, params, callback) => {
            callback(null,  { 'COUNT(*)': 1 } as DBCountType)
            return {} as Database
        })
        const mockDBRun = jest.spyOn(db, "run").mockImplementation((sql, params, callback) => {
            callback(null)
            return {} as Database
        });
    
        const result = await reviewDAO.deleteReviewsOfProduct(testModel)
        expect(result).toBe(null)
    })

    test("Model not existing error", async () => {
        const mockDBGet = jest.spyOn(db, "get").mockImplementationOnce((sql, params, callback) => {
            callback(null,  { 'COUNT(*)': 0 } as DBCountType)
            return {} as Database
        })
    
        await expect(reviewDAO.deleteReviewsOfProduct(testModel)).rejects.toThrow(NoExistProductError)
    })

    test("DB error in the first query", async () => {
        const mockDBGet = jest.spyOn(db, "get").mockImplementationOnce((sql, params, callback) => {
            callback(new Error("DB error"), null)
            return {} as Database
        })

        await expect(reviewDAO.deleteReviewsOfProduct(testModel)).rejects.toThrow("DB error")
    })

    test("DB error in the second query", async () => {
        const mockDBGet = jest.spyOn(db, "get").mockImplementationOnce((sql, params, callback) => {
            callback(null,  { 'COUNT(*)': 1 } as DBCountType)
            return {} as Database
        })
        const mockDBRun = jest.spyOn(db, "run").mockImplementation((sql, params, callback) => {
            callback(new Error("DB error"))
            return {} as Database
        });

        await expect(reviewDAO.deleteReviewsOfProduct(testModel)).rejects.toThrow("DB error")
    })
})


describe("DAO deleteAllReviews", () => {
    let reviewDAO: ReviewDAO;

    beforeAll(() => {
        reviewDAO = new ReviewDAO();
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });


    test("No errors", async () => {
        const mockDBRun = jest.spyOn(db, "run").mockImplementationOnce((sql, params, callback) => {
            callback(null)
            return {} as Database
        })
    
        const result = await reviewDAO.deleteAllReviews()
        expect(result).toEqual(null)
    })

    test("DB error", async () => {
        const mockDBRun = jest.spyOn(db, "run").mockImplementationOnce((sql, params, callback) => {
            callback(new Error("DB error"))
            return {} as Database
        })
    
        await expect(reviewDAO.deleteAllReviews()).rejects.toThrow("DB error")
    })
})
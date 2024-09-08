import { test, expect, jest, beforeEach, beforeAll, describe } from "@jest/globals"
import request from 'supertest'
import { app } from "../../index"
import { cleanup } from '../../src/db/cleanup';
import UserController from "../../src/controllers/userController"
import { Role, User } from "../../src/components/user"
import { userInfo } from "os";
import db from "../../src/db/db";
import ErrorHandler from "../../src/helper";
import Authenticator from "../../src/routers/auth";
import exp from "constants";
import { UserRoutes } from "../../src/routers/userRoutes";
import { error } from "console";
import { BirthdateError, UnauthorizedUserError, UserAlreadyExistsError, UserNotFoundError } from "../../src/errors/userError";
import { body } from "express-validator";
import { isString } from "util";


const baseURL = "/ezelectronics"


beforeEach(() => {
    jest.clearAllMocks(); // clears all mocks
    jest.restoreAllMocks();
})

//For unit tests, we need to validate the internal logic of a single component, without the need to test the interaction with other components
//For this purpose, we mock (simulate) the dependencies of the component we are testing
jest.mock("../../src/controllers/userController")
jest.mock("../../src/routers/auth")


let testAdmin = new User("admin", "admin", "admin", Role.ADMIN, "", "")
let testCustomer = new User("customer", "customer", "customer", Role.CUSTOMER, "", "")
let testManager = new User("manager", "manager", "manager", Role.MANAGER, "", "");

describe("User route unit tests", () => {
    
    describe("POST /users", () => {

        test("It should return a 200 success code", async () => {
            const testUser = {
                username: "test",
                name: "test",
                surname: "test",
                password: "test",
                role: "Manager"
            }
            jest.mock('express-validator', () => ({
                body: jest.fn().mockImplementation(() => ({
                    isString: () => ({ isLength: () => ({}) }),
                    isIn: () => ({ isLength: () => ({}) }),
                })),
            }))
            jest.spyOn(ErrorHandler.prototype, "validateRequest").mockImplementation((req, res, next) => {
                return next()
            })
            jest.spyOn(UserController.prototype, "createUser").mockResolvedValueOnce(true) //Mock the createUser method of the controller
            const response = await request(app).post(baseURL + "/users").send(testUser) //Send a POST request to the route
            expect(response.status).toBe(200) //Check if the response status is 200
            expect(UserController.prototype.createUser).toHaveBeenCalledTimes(1) //Check if the createUser method has been called once
            //Check if the createUser method has been called with the correct parameters
            expect(UserController.prototype.createUser).toHaveBeenCalledWith(testUser.username,
                testUser.name,
                testUser.surname,
                testUser.password,
                testUser.role)
        })

        test("New user with not available username, should return 409 error code", async () => {
            const testUser = {
                username: "test",
                name: "test",
                surname: "test",
                password: "test",
                role: "Manager"
            }


            jest.mock('express-validator', () => ({
                body: jest.fn().mockImplementation(() => ({
                exists: jest.fn().mockReturnThis(),
                isString: jest.fn().mockReturnThis(),
                isLength: jest.fn().mockReturnThis(),
                isIn: jest.fn().mockReturnThis(),
                })),
            }))

            jest.spyOn(ErrorHandler.prototype, "validateRequest").mockImplementation((req, res, next) => {
                return next()
            })
            jest.spyOn(UserController.prototype, "createUser").mockImplementation((req, res, next) => {
                const error = new UserAlreadyExistsError
                throw error
            });

            const response = await request(app).post(baseURL + "/users").send(testUser) 
            expect(response.status).toBe(409) 
            expect(UserController.prototype.createUser).toHaveBeenCalledTimes(1) //Check if the createUser method has been called once
            //Check if the createUser method has been called with the correct parameters
            expect(UserController.prototype.createUser).toHaveBeenCalledWith(testUser.username,
                testUser.name,
                testUser.surname,
                testUser.password,
                testUser.role)
        })

        test("len 1 username, status 200", async () => {
            const testUser = { 
                username: "t",
                name: "test",
                surname: "test",
                password: "test",
                role: "Manager"
            }
            jest.mock('express-validator', () => ({
                body: jest.fn().mockImplementation(() => ({
                    isString: () => ({ isLength: () => ({}) }),
                    isIn: () => ({ isLength: () => ({}) }),
                })),
            }))
            jest.spyOn(ErrorHandler.prototype, "validateRequest").mockImplementation((req, res, next) => {
                return next()
            })
            jest.spyOn(UserController.prototype, "createUser").mockResolvedValueOnce(true)
            const response = await request(app).post(baseURL + "/users").send(testUser) //Send a POST request to the route
            expect(response.status).toBe(200) //Check if the response status is 200
            expect(UserController.prototype.createUser).toHaveBeenCalledTimes(1);
            //Check if the createUser method has been called with the correct parameters
            expect(UserController.prototype.createUser).toHaveBeenCalledWith(testUser.username,
                testUser.name,
                testUser.surname,
                testUser.password,
                testUser.role)
        });

        test("empty username, status 422", async () => {
            const testUser = { 
                username: "",
                name: "test",
                surname: "test",
                password: "test",
                role: "Manager"
            }
            jest.mock('express-validator', () => ({
                body: jest.fn().mockImplementation(() => ({
                    isString: () => ({ isLength: () => ({}) }),
                    isIn: () => ({ isLength: () => ({}) }),
                })),
            }))
            jest.spyOn(ErrorHandler.prototype, "validateRequest").mockImplementation((req, res, next) => {
                return res.status(422).json({error: "The parameters are not formatted properly\n\n"})
            })
            jest.spyOn(UserController.prototype, "createUser");
            const response = await request(app).post(baseURL + "/users").send(testUser) //Send a POST request to the route
            expect(response.status).toBe(422) //Check if the response status is 422 
            expect(UserController.prototype.createUser).toHaveBeenCalledTimes(0);
        });

        test("empty name, status 422", async () => {
            const testUser = { 
                username: "test",
                name: "",
                surname: "test",
                password: "test",
                role: "Manager"
            }
            jest.spyOn(UserController.prototype, "createUser");
            const response = await request(app).post(baseURL + "/users").send(testUser) //Send a POST request to the route
            expect(response.status).toBe(422) //Check if the response status is 422 
            expect(UserController.prototype.createUser).toHaveBeenCalledTimes(0);
        });

        test("len1 name, status 200", async () => {
            const testUser = { 
                username: "test",
                name: "t",
                surname: "test",
                password: "test",
                role: "Manager"
            }
            jest.spyOn(UserController.prototype, "createUser").mockResolvedValue(true);
            const response = await request(app).post(baseURL + "/users").send(testUser) //Send a POST request to the route
            expect(response.status).toBe(200) //Check if the response status is 422 
            expect(UserController.prototype.createUser).toHaveBeenCalledTimes(1);
            expect(UserController.prototype.createUser).toHaveBeenCalledWith(testUser.username,
                testUser.name,
                testUser.surname,
                testUser.password,
                testUser.role)
        });

        test("empty surname, status 422", async () => {
            const testUser = { 
                username: "test",
                name: "test",
                surname: "",
                password: "test",
                role: "Manager"
            }
            jest.spyOn(UserController.prototype, "createUser");
            const response = await request(app).post(baseURL + "/users").send(testUser) //Send a POST request to the route
            expect(response.status).toBe(422) 
            expect(UserController.prototype.createUser).toHaveBeenCalledTimes(0);
        });

        test("len1 surname, status 200", async () => {
            const testUser = { 
                username: "test",
                name: "test",
                surname: "t",
                password: "test",
                role: "Manager"
            }
            jest.spyOn(UserController.prototype, "createUser").mockResolvedValue(true);
            const response = await request(app).post(baseURL + "/users").send(testUser) //Send a POST request to the route
            expect(response.status).toBe(200) //Check if the response status is 422 
            expect(UserController.prototype.createUser).toHaveBeenCalledTimes(1);
            expect(UserController.prototype.createUser).toHaveBeenCalledWith(testUser.username,
                testUser.name,
                testUser.surname,
                testUser.password,
                testUser.role)
        });

        test("empty password, status 422", async () => {
            const testUser = { 
                username: "test",
                name: "test",
                surname: "test",
                password: "",
                role: "Manager"
            }
            jest.spyOn(UserController.prototype, "createUser");
            const response = await request(app).post(baseURL + "/users").send(testUser) //Send a POST request to the route
            expect(response.status).toBe(422) 
            expect(UserController.prototype.createUser).toHaveBeenCalledTimes(0);
        });
        
        test("len1 password, status 200", async () => {
            const testUser = { 
                username: "test",
                name: "test",
                surname: "test",
                password: "t",
                role: "Manager"
            }
            jest.spyOn(UserController.prototype, "createUser").mockResolvedValue(true);
            const response = await request(app).post(baseURL + "/users").send(testUser) //Send a POST request to the route
            expect(response.status).toBe(200) //Check if the response status is 422 
            expect(UserController.prototype.createUser).toHaveBeenCalledTimes(1);
            expect(UserController.prototype.createUser).toHaveBeenCalledWith(testUser.username,
                testUser.name,
                testUser.surname,
                testUser.password,
                testUser.role)
        });

        test("empty role, status 422", async () => {
            const testUser = { 
                username: "test",
                name: "test",
                surname: "test",
                password: "test",
                role: ""
            }
            jest.spyOn(UserController.prototype, "createUser");
            const response = await request(app).post(baseURL + "/users").send(testUser) //Send a POST request to the route
            expect(response.status).toBe(422) 
            expect(UserController.prototype.createUser).toHaveBeenCalledTimes(0);
        });
        
        test("invalid role, status 422", async () => {
            const testUser = { 
                username: "test",
                name: "test",
                surname: "test",
                password: "test",
                role: "Invalid"
            }
            jest.spyOn(UserController.prototype, "createUser");
            const response = await request(app).post(baseURL + "/users").send(testUser) //Send a POST request to the route
            expect(response.status).toBe(422) 
            expect(UserController.prototype.createUser).toHaveBeenCalledTimes(0);
        });
    })

    describe("GET /users", () => {
        
        test("It returns an array of users", async () => {
            jest.spyOn(UserController.prototype, "getUsers").mockResolvedValueOnce([testAdmin, testCustomer])

            jest.spyOn(Authenticator.prototype, "isAdmin").mockImplementation((req, res, next) => {
                return next();
            })
            jest.spyOn(Authenticator.prototype, "isLoggedIn").mockImplementation((req, res, next) => {
                return next();
            })

            const response = await request(app).get(baseURL + "/users");
            expect(response.status).toBe(200) 
            expect(UserController.prototype.getUsers).toHaveBeenCalledTimes(1);
            expect(response.body).toEqual([testAdmin, testCustomer]); 
        });


        test("Returns an empty array", async() => {
            jest.spyOn(UserController.prototype, "getUsers").mockResolvedValueOnce([])
            jest.spyOn(Authenticator.prototype, "isAdmin").mockImplementation((req, res, next) => {
                return next();
            })
    
            const response = await request(app).get(baseURL + "/users");
            expect(response.status).toBe(200) 
            expect(UserController.prototype.getUsers).toHaveBeenCalledTimes(1);
            expect(response.body).toEqual([]);
        });

        test("Returns an array with a single value", async () => {
            jest.spyOn(UserController.prototype, "getUsers").mockResolvedValueOnce([testAdmin])
            jest.spyOn(Authenticator.prototype, "isAdmin").mockImplementation((req, res, next) => {
                return next();
            })
            
            const response = await request(app).get(baseURL + "/users");
            expect(response.status).toBe(200) 
            expect(UserController.prototype.getUsers).toHaveBeenCalledTimes(1);
            expect(response.body).toEqual([testAdmin]);
        })

        test("Returns a 401 error", async () => {
            jest.spyOn(UserController.prototype, "getUsers").mockResolvedValueOnce([testAdmin, testCustomer])
            jest.spyOn(Authenticator.prototype, "isAdmin").mockImplementation((req, res, next) => {
                res.status(401).json({ error: "User is not an admin", status: 401 })
            })

            const response = await request(app).get(baseURL + "/users");
            expect(response.status).toBe(401)
            expect(UserController.prototype.getUsers).toHaveBeenCalledTimes(0); 
        });
        
        
    });

    describe("GET /users/roles/:role", () => {

        test("it should return the list of admin users", async () => {
            const testAdmin2 = new User("a2", "a2", "a2", Role.ADMIN, "", "")
            jest.spyOn(UserController.prototype, "getUsersByRole").mockResolvedValueOnce([testAdmin, testAdmin2])
            jest.spyOn(Authenticator.prototype, "isAdmin").mockImplementation((req, res, next) => {
                return next();
            })
            jest.mock('express-validator', () => ({
                param: jest.fn().mockImplementation(() => ({
                    isString: () => ({ isLength: () => ({}) }),
                    isIn: () => ({ isLength: () => ({}) }),
                })),
            }))
            jest.spyOn(ErrorHandler.prototype, "validateRequest").mockImplementation((req, res, next) => {
                return next()
            })
            const response = await request(app).get(baseURL + "/users/roles/Admin");
            expect(response.status).toBe(200) 
            expect(UserController.prototype.getUsersByRole).toHaveBeenCalledTimes(1);
            expect(UserController.prototype.getUsersByRole).toHaveBeenCalledWith("Admin")
            expect(response.body).toEqual([testAdmin, testAdmin2]);  
        });

        test("it should return the list with a single admin", async () => {
            jest.spyOn(UserController.prototype, "getUsersByRole").mockResolvedValueOnce([testAdmin])
            jest.spyOn(Authenticator.prototype, "isAdmin").mockImplementation((req, res, next) => {
                return next();
            })
            jest.mock('express-validator', () => ({
                param: jest.fn().mockImplementation(() => ({
                    isString: () => ({ isLength: () => ({}) }),
                    isIn: () => ({ isLength: () => ({}) }),
                })),
            }))
            jest.spyOn(ErrorHandler.prototype, "validateRequest").mockImplementation((req, res, next) => {
                return next()
            })
            const response = await request(app).get(baseURL + "/users/roles/Admin");
            expect(response.status).toBe(200) 
            expect(UserController.prototype.getUsersByRole).toHaveBeenCalledTimes(1);
            expect(UserController.prototype.getUsersByRole).toHaveBeenCalledWith("Admin");
            expect(response.body).toEqual([testAdmin]);  
        });

        test("it should return an empty list", async () => {
            jest.spyOn(UserController.prototype, "getUsersByRole").mockResolvedValueOnce([])
            jest.spyOn(Authenticator.prototype, "isAdmin").mockImplementation((req, res, next) => {
                return next();
            })
            jest.mock('express-validator', () => ({
                param: jest.fn().mockImplementation(() => ({
                    isString: () => ({ isLength: () => ({}) }),
                    isIn: () => ({ isLength: () => ({}) }),
                })),
            }))
            jest.spyOn(ErrorHandler.prototype, "validateRequest").mockImplementation((req, res, next) => {
                return next()
            })
            const response = await request(app).get(baseURL + "/users/roles/Admin");
            expect(response.status).toBe(200) 
            expect(UserController.prototype.getUsersByRole).toHaveBeenCalledTimes(1);
            expect(UserController.prototype.getUsersByRole).toHaveBeenCalledWith("Admin");
            expect(response.body).toEqual([]);  
        }); 

        test("it should return a 401 error", async () => {
            jest.spyOn(UserController.prototype, "getUsersByRole")
            jest.spyOn(Authenticator.prototype, "isAdmin").mockImplementation((req, res, next) => {
                res.status(401).json({ error: "User is not an admin", status: 401 })
            })
            jest.mock('express-validator', () => ({
                param: jest.fn().mockImplementation(() => ({
                    isString: () => ({ isLength: () => ({}) }),
                    isIn: () => ({ isLength: () => ({}) }),
                })),
            }))
            jest.spyOn(ErrorHandler.prototype, "validateRequest").mockImplementation((req, res, next) => {
                return next()
            })
            const response = await request(app).get(baseURL + "/users/roles/Admin");

        })

        test("it should return a 422 error, invalid role", async () => {
            jest.spyOn(Authenticator.prototype, "isAdmin").mockImplementation((req, res, next) => {
                return next();
            })
            jest.mock('express-validator', () => ({
                param: jest.fn().mockImplementation(() => {
                    throw new Error("Invalid value");
                }),
            }))
            jest.spyOn(ErrorHandler.prototype, "validateRequest").mockImplementation((req, res, next) => {
                return res.status(422).json({ error: "The parameters are not formatted properly\n\n" });
            })
            //const response = await request(app).get(baseURL + "/users/roles/Invalid")
            const response = await request(app).get(baseURL + "/users/roles/Invalid")
            expect(response.status).toBe(422)
        });

    });

    describe("GET /users/:username", () => {

        test("should return the specified user", async () => {
            jest.spyOn(UserController.prototype, "getUserByUsername").mockResolvedValueOnce([testAdmin])
            jest.spyOn(Authenticator.prototype, "isLoggedIn").mockImplementation((req, res, next) => {
                req.user = testAdmin;
                return next();
            })
            jest.mock('express-validator', () => ({
                param: jest.fn().mockImplementation(() => ({
                    isString: () => ({ isLength: () => ({}) }),
                })),
            }))
            jest.spyOn(ErrorHandler.prototype, "validateRequest").mockImplementation((req, res, next) => {
                return next()
            })
            const response = await request(app).get(baseURL + "/users/admin");
            expect(response.status).toBe(200) 
            expect(UserController.prototype.getUserByUsername).toHaveBeenCalledTimes(1);
            expect(UserController.prototype.getUserByUsername).toHaveBeenCalledWith(testAdmin, "admin");
            expect(response.body).toEqual([testAdmin]);  
        });

        test("should return 404 if the user does not exist", async () => {
            jest.spyOn(UserController.prototype, "getUserByUsername").mockRejectedValueOnce(new UserNotFoundError);
            jest.spyOn(Authenticator.prototype, "isLoggedIn").mockImplementation((req, res, next) => {
                req.user = testAdmin;
                return next();
            })
            jest.mock('express-validator', () => ({
                param: jest.fn().mockImplementation(() => ({
                    isString: () => ({ isLength: () => ({}) }),
                })),
            }))
            jest.spyOn(ErrorHandler.prototype, "validateRequest").mockImplementation((req, res, next) => {
                return next()
            })

            const response = await request(app).get(baseURL + "/users/unknownUser");
            expect(response.status).toBe(404) 
            expect(UserController.prototype.getUserByUsername).toHaveBeenCalledTimes(1);
            expect(UserController.prototype.getUserByUsername).toHaveBeenCalledWith(testAdmin, "unknownUser");
        });

    });

    describe("DELETE /users/:username", () => {

        test("user deletes themselves", async () => {
            let username = "user";
            let userToDelete = new User("user", "user", "user", Role.ADMIN, "user", "user");

            jest.spyOn(UserController.prototype, "getUserByUsername").mockResolvedValueOnce(userToDelete);
            jest.spyOn(UserController.prototype, "deleteUser").mockResolvedValueOnce(true);

            await request(app).delete(baseURL + "/users/" + username)
        });

        test("user attempts to delete admin, unauthorized", async () => {

            let userToDelete = new User("user", "user", "user", Role.ADMIN, "user", "user");

            jest.spyOn(Authenticator.prototype, "isLoggedIn").mockImplementation((req, res, next) => {
                req.user = testCustomer;
                next();
            });

            jest.mock('express-validator', () => ({
                param: jest.fn().mockImplementation(() => ({
                isString: jest.fn().mockReturnThis(),
                isLength: jest.fn().mockReturnThis(),
                })),
            }))

            jest.spyOn(ErrorHandler.prototype, "validateRequest").mockImplementation((req, res, next) => {
                return next()
            })


            jest.spyOn(UserController.prototype, "getUserByUsername").mockRejectedValueOnce(new UnauthorizedUserError);

            //await expect(request(app).delete(baseURL + "/users/" + userToDelete.username)).rejects.toThrow(UnauthorizedUserError);

            const response = await request(app).delete(baseURL + "/users/" + userToDelete.username);
            expect(response.status).toBe(401);
            expect(UserController.prototype.getUserByUsername).toHaveBeenCalledTimes(1);
        });
    });

    describe("DELETE /users", () => {

        test("delete all users", async () => {
            jest.spyOn(UserController.prototype, "deleteAll").mockResolvedValueOnce(true);

            
            jest.spyOn(Authenticator.prototype, "isLoggedIn").mockImplementation((req, res, next) => {
                req.user = testAdmin;
                next();
            });
            
            jest.spyOn(Authenticator.prototype, "isAdmin").mockImplementation((req, res, next) => {
                if (req.user.role === "Admin") {
                    next();
                } else {
                    res.status(401).json({error: "Unauthorized"});
                }
            }); 
            
            const response = await request(app).delete(baseURL + "/users");

            expect(response.status).toBe(200);
            expect(UserController.prototype.deleteAll).toHaveBeenCalledTimes(1);
        });

        test("non admin attempts to delete all users", async () => {
            jest.spyOn(UserController.prototype, "deleteAll").mockResolvedValueOnce(true);

            
            jest.spyOn(Authenticator.prototype, "isLoggedIn").mockImplementation((req, res, next) => {
                req.user = testCustomer;
                next();
            });
            
            jest.spyOn(Authenticator.prototype, "isAdmin").mockImplementation((req, res, next) => {
                if (req.user.role === "Admin") {
                    next();
                } else {
                    res.status(401).json({error: "Unauthorized"});
                }
            }); 
            
            const response = await request(app).delete(baseURL + "/users");

            expect(response.status).toBe(401);
            expect(UserController.prototype.deleteAll).toHaveBeenCalledTimes(0);
        });

    });

    describe("PATCH /users/:username", () => {
        
        test("should update the specified user", async () => {

            const updatedAdmin = new User (testAdmin.username, "newName", testAdmin.surname, testAdmin.role, "Somewhere", "1960-01-01");

            jest.spyOn(UserController.prototype, "getUserByUsername").mockResolvedValueOnce(testAdmin)
            jest.spyOn(UserController.prototype, "updateUserInfo").mockResolvedValueOnce(updatedAdmin)
            jest.spyOn(Authenticator.prototype, "isLoggedIn").mockImplementation((req, res, next) => {
                req.user = testAdmin;
                return next();
            })
            jest.mock('express-validator', () => ({
                param: jest.fn().mockImplementation(() => ({
                    isString: () => ({ isLength: () => ({}) }),
                })),
                body: jest.fn().mockImplementation(() => ({
                    isString: () => ({ isLength: () => ({}) }),
                    isDate: () => ({}),
                }))
            }))
            jest.spyOn(ErrorHandler.prototype, "validateRequest").mockImplementation((req, res, next) => {
                return next()
            })
            const response = await request(app).patch(baseURL + "/users/admin").send({name: updatedAdmin.name, surname: updatedAdmin.surname, address: updatedAdmin.address, birthdate: updatedAdmin.birthdate});
            expect(response.status).toBe(200) 
            expect(UserController.prototype.updateUserInfo).toHaveBeenCalledTimes(1);
            expect(UserController.prototype.getUserByUsername).toHaveBeenCalledTimes(1);
            expect(response.body).toEqual(updatedAdmin);  
            jest.clearAllMocks()
        });


        test("Birthdate is in the future, should return 400", async () => {

            const updatedAdmin = new User (testAdmin.username, "newName", testAdmin.surname, testAdmin.role, "Somewhere", "2050-01-01");

            jest.spyOn(UserController.prototype, "getUserByUsername").mockResolvedValueOnce(testAdmin)
            jest.spyOn(UserController.prototype, "updateUserInfo").mockResolvedValueOnce(updatedAdmin)
            jest.spyOn(Authenticator.prototype, "isLoggedIn").mockImplementation((req, res, next) => {
                req.user = testAdmin;
                return next();
            })
            jest.mock('express-validator', () => ({
                param: jest.fn().mockImplementation(() => ({
                    isString: () => ({ isLength: () => ({}) }),
                })),
                body: jest.fn().mockImplementation(() => ({
                    isString: () => ({ isLength: () => ({}) }),
                    isDate: () => ({}),
                }))
            }))
            jest.spyOn(ErrorHandler.prototype, "validateRequest").mockImplementation((req, res, next) => {
                return next()
            })
            const response = await request(app)
                .patch(baseURL + "/users/admin")
                .send({name: updatedAdmin.name, surname: updatedAdmin.surname, address: updatedAdmin.address, birthdate: updatedAdmin.birthdate})

            expect(response.status).toBe(400)
            expect(UserController.prototype.updateUserInfo).toHaveBeenCalledTimes(0);
            expect(UserController.prototype.getUserByUsername).toHaveBeenCalledTimes(1);
            jest.clearAllMocks()
        });


        test("User not logged in, should return 401", async () => {

            const updatedAdmin = new User (testAdmin.username, "newName", testAdmin.surname, testAdmin.role, "Somewhere", "1960-01-01");

            jest.spyOn(Authenticator.prototype, "isLoggedIn").mockImplementation((req, res, next) => {
                return res.status(401).json({ error: "Unauthenticated user\n\n" });
            })
            jest.mock('express-validator', () => ({
                param: jest.fn().mockImplementation(() => ({
                    isString: () => ({ isLength: () => ({}) }),
                })),
                body: jest.fn().mockImplementation(() => ({
                    isString: () => ({ isLength: () => ({}) }),
                    isDate: () => ({}),
                }))
            }))
            jest.spyOn(ErrorHandler.prototype, "validateRequest").mockImplementation((req, res, next) => {
                return next()
            })
            const response = await request(app).patch(baseURL + "/users/admin").send({name: updatedAdmin.name, surname: updatedAdmin.surname, address: updatedAdmin.address, birthdate: updatedAdmin.birthdate});
            expect(response.status).toBe(401) 
            expect(UserController.prototype.updateUserInfo).toHaveBeenCalledTimes(0);
            expect(UserController.prototype.getUserByUsername).toHaveBeenCalledTimes(0);
            jest.clearAllMocks()
        });

        test("Invalid body fields, should return 422", async () => {

            const updatedAdmin = new User (testAdmin.username, "newName", testAdmin.surname, testAdmin.role, "Somewhere", "1960-01-01");

            jest.spyOn(Authenticator.prototype, "isLoggedIn").mockImplementation((req, res, next) => {
                req.user = testAdmin;
                return next();
            })
            jest.spyOn(ErrorHandler.prototype, "validateRequest").mockImplementation((req, res, next) => {
                return res.status(422).json({ error: "Body is not formatted properly\n\n" });
            })

            const response = await request(app).patch(baseURL + "/users/admin").send({name: "", surname: updatedAdmin.surname, address: updatedAdmin.address, birthdate: updatedAdmin.birthdate});
            expect(response.status).toBe(422) 
            expect(UserController.prototype.updateUserInfo).toHaveBeenCalledTimes(0);
            expect(UserController.prototype.getUserByUsername).toHaveBeenCalledTimes(0);
            jest.clearAllMocks()
        });

        test("Admin attempts to update another admin, should return 401", async () => {

            const anotherAdmin = new User ("anotherAdmin", "anotherAdmin", "anotherAdmin", Role.ADMIN, "Somewhere", "1960-01-01"); 
            const updatedAnotherAdmin = new User ("anotherAdmin", "newName", "anotherAdmin", Role.ADMIN, "Somewhere", "1960-01-01");

            jest.spyOn(UserController.prototype, "getUserByUsername").mockResolvedValueOnce(anotherAdmin)
            jest.spyOn(UserController.prototype, "updateUserInfo").mockResolvedValueOnce(updatedAnotherAdmin)
            jest.spyOn(Authenticator.prototype, "isLoggedIn").mockImplementation((req, res, next) => {
                req.user = testAdmin;
                return next();
            })
            jest.mock('express-validator', () => ({
                param: jest.fn().mockImplementation(() => ({
                    isString: () => ({ isLength: () => ({}) }),
                })),
                body: jest.fn().mockImplementation(() => ({
                    isString: () => ({ isLength: () => ({}) }),
                    isDate: () => ({}),
                }))
            }))
            jest.spyOn(ErrorHandler.prototype, "validateRequest").mockImplementation((req, res, next) => {
                return next()
            })
            const response = await request(app).patch(baseURL + "/users/anotherAdmin").send({name: updatedAnotherAdmin.name, surname: updatedAnotherAdmin.surname, address: updatedAnotherAdmin.address, birthdate: updatedAnotherAdmin.birthdate});
            expect(response.status).toBe(401) 
            expect(UserController.prototype.updateUserInfo).toHaveBeenCalledTimes(0);
            expect(UserController.prototype.getUserByUsername).toHaveBeenCalledTimes(1);
        });

        test("Non admin attempts to update another user", async () => {

            const updatedCustomer = new User(testCustomer.username, "newName", testCustomer.surname, testCustomer.role, "Somewhere", "1999-12-31");
           
            jest.mock('express-validator', () => ({
                param: jest.fn().mockImplementation(() => ({
                    isString: () => ({ isLength: () => ({}) }),
                })),
                body: jest.fn().mockImplementation(() => ({
                    isString: () => ({ isLength: () => ({}) }),
                    isDate: () => ({}),
                }))
            }))

            jest.spyOn(Authenticator.prototype, "isLoggedIn").mockImplementation((req, res, next) => {
                req.user = testManager;
                return next();
            })
            jest.spyOn(ErrorHandler.prototype, "validateRequest").mockImplementation((req, res, next) => {
                return next();
            });

            jest.spyOn(UserController.prototype, "getUserByUsername").mockRejectedValueOnce(new UnauthorizedUserError);

            const response = await request(app)
                .patch(baseURL + "/users/customer")
                .send({name: updatedCustomer.name, surname: updatedCustomer.surname, address: updatedCustomer.address, birthdate: updatedCustomer.birthdate})

            expect(response.status).toBe(401);
            expect(UserController.prototype.updateUserInfo).toHaveBeenCalledTimes(0);
            
            jest.clearAllMocks()
        });
    });
})

describe("authRoutes unit tests", () => {

    describe("POST /sessions", () => {

        test("logs in a user", async () => {
            const username = "username";
            const password = "password";
            const user = new User("username", "u", "u", Role.ADMIN, "u", "u");

            jest.mock('express-validator', () => ({
                body: jest.fn().mockImplementation(() => ({
                isString: jest.fn().mockReturnThis(),
                isLength: jest.fn().mockReturnThis(),
                })),
            }))
    
            jest.spyOn(Authenticator.prototype, "login").mockResolvedValueOnce(user);
    
            const response = await request(app).post(baseURL + "/sessions").send({username: username, password: password});
            expect(response.status).toBe(200);
            expect(response.body).toStrictEqual({username: "username", name: "u", surname: "u", role: "Admin", address: "u", birthdate: "u"});
        });
    
        test("empty username, should return 422", async () => {
            const username = "";
            const password = "password";

            jest.mock('express-validator', () => ({
                body: jest.fn().mockImplementation(() => ({
                isString: jest.fn().mockReturnThis(),
                isLength: jest.fn().mockReturnThis(),
                })),
            }))

            jest.spyOn(ErrorHandler.prototype, "validateRequest").mockImplementation((req, res, next) => {
                return res.status(422).json({ error: "Body is not formatted properly\n\n" });
            })

            jest.spyOn(Authenticator.prototype, "login");
    
            const response = await request(app).post(baseURL + "/sessions").send({username: username, password: password});
            expect(response.status).toBe(422);
        });
    });

    describe("DELETE /sessions/current", () => {

        test("performs logout", async () => {

            jest.spyOn(Authenticator.prototype, "isLoggedIn").mockImplementation((req, res, next) => {
                res.status(200).send("Logout successful");
            })
                    

            jest.spyOn(Authenticator.prototype, "logout").mockImplementation((req, res, next) => {
                return next()
            });

            const response = await request(app).delete(baseURL + "/sessions/current")
            expect(Authenticator.prototype.isLoggedIn).toHaveBeenCalledTimes(1);
            expect(response.status).toBe(200)

            jest.restoreAllMocks();
        });

        test("perform logout when not logged in", async () => {

            jest.spyOn(Authenticator.prototype, "isLoggedIn").mockImplementation((req, res, next) => {
                return res.status(401).json({error: "Unauthenticated user", status: 401})
            });

            jest.spyOn(Authenticator.prototype, "logout").mockImplementation((req, res, next) => {
                return next();
            });

            const response = await request(app).delete(baseURL + "/sessions/current")
            expect(response.status).toBe(401)
            jest.restoreAllMocks();
        });
    });
    
    describe("GET /sessions/current", () => {
        test("successfully gets session", async () => {
           
            jest.spyOn(Authenticator.prototype, "isLoggedIn").mockImplementation((req, res, next) => {
                return next()
            })        

            const response = await request(app).get(baseURL + "/sessions/current")
            expect(response.status).toBe(200)
            jest.restoreAllMocks();
        });

        test("fails because user is not logged in", async () => {
           
            jest.spyOn(Authenticator.prototype, "isLoggedIn").mockImplementation((req, res, next) => {
                return res.status(401).json({ error: "Unauthenticated user", status: 401 })
            })

            const response = await request(app).delete(baseURL + "/sessions/current")
            expect(response.status).toBe(401)
            jest.restoreAllMocks();
        })
    });
});

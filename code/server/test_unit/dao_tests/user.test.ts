import { describe, test, expect, beforeAll, afterAll, jest } from "@jest/globals"

import UserController from "../../src/controllers/userController"
import UserDAO from "../../src/dao/userDAO"
import crypto from "crypto"
import db from "../../src/db/db"
import { Database } from "sqlite3"
import { UserAlreadyExistsError, UserNotFoundError } from "../../src/errors/userError"
import { Role, User } from "../../src/components/user"

jest.mock("crypto")
jest.mock("../../src/db/db.ts")

//Example of unit test for the createUser method
//It mocks the database run method to simulate a successful insertion and the crypto randomBytes and scrypt methods to simulate the hashing of the password
//It then calls the createUser method and expects it to resolve true




// GET IS USER AUTHENTICATED TESTS

describe("UserDAO tests", () => {

    describe("getIsUserAuthenticated tests", () => {

        test("Authenticated, should resolve to true", async() => {
            const userDAO = new UserDAO();
            const username = "username";
            const password = "password";
        
            const mockDBGet = jest.spyOn(db, "get").mockImplementation((sql, params, callback) => {
                callback(null);
                return {} as Database;
            });
            const mockScrypt = jest.spyOn(crypto, "scrypt").mockImplementation(async (password, salt, keylen) => {
                return Buffer.from("hashedPassword")
            })
            
            const result = await userDAO.getIsUserAuthenticated(username, password);
            expect(result).toBe(false)
        
            mockDBGet.mockRestore()
            mockScrypt.mockRestore()
        });

        test("empty username, should return an error", async() => {
            const userDAO = new UserDAO();
            const username = "";
            const password = "password";

            const mockDBGet = jest.spyOn(db, "get").mockImplementation((sql, params, callback) => {
                callback(Error("DB error"), null);
                return {} as Database;
            });
        });

        test('should return false if the password does not match', async () => {
            const userDAO = new UserDAO();
            const username = "username";
            const password = "password";
            const salt = "salt";
            const hashPwd = "hashPwd";
        
            const mockDBGet = jest.spyOn(db, 'get').mockImplementationOnce((sql, params, callback) => {
                callback(null, { username, password: hashPwd, salt });
                return {} as Database
            });
            
            const isAuthenticated = await userDAO.getIsUserAuthenticated(username, password);
            expect(mockDBGet).toHaveBeenCalledTimes(1);
            expect(isAuthenticated).toBe(false);
        
        
            mockDBGet.mockRestore()
        });

        test('salt not in the db, should return false', async () => {
            const userDAO = new UserDAO();
        
            const username = "username";
            const password = "password";
            const hashPwd = "hashPwd";
            
            const mockDBGet = jest.spyOn(db, 'get').mockImplementationOnce((sql, params, callback) => {
                callback(null, { username, password: hashPwd}); // no salt returned from the database
                return {} as Database
            });
        
            const isAuthenticated = await userDAO.getIsUserAuthenticated(username, password);
            expect(mockDBGet).toHaveBeenCalledTimes(1);
            expect(isAuthenticated).toBe(false);
        
        
            mockDBGet.mockRestore()
        });

        test('username not in the db, should return false', async () => {
            const userDAO = new UserDAO();
        
            const username = "username";
            const password = "password";
        
            const mockDBGet = jest.spyOn(db, 'get').mockImplementation((sql, params, callback) => {
                callback(null, null)
                return {} as Database
            });
        
            const isAuthenticated = await userDAO.getIsUserAuthenticated(username, password);
        
            expect(mockDBGet).toHaveBeenCalledTimes(1);
            expect(isAuthenticated).toBe(false);
        
            mockDBGet.mockRestore() 
        });
    });

    describe("createUser tests", () => {

        test("It should resolve true", async () => {
            const userDAO = new UserDAO()
            const mockDBRun = jest.spyOn(db, "run").mockImplementation((sql, params, callback) => {
                callback(null)
                return {} as Database
            });
            const mockRandomBytes = jest.spyOn(crypto, "randomBytes").mockImplementation((size) => {
                return (Buffer.from("salt"))
            })
            const mockScrypt = jest.spyOn(crypto, "scrypt").mockImplementation(async (password, salt, keylen) => {
                return Buffer.from("hashedPassword")
            })
            const result = await userDAO.createUser("username", "name", "surname", "password", "role")
            expect(result).toBe(true)
            mockRandomBytes.mockRestore()
            mockDBRun.mockRestore()
            mockScrypt.mockRestore()
        
        });

        test("username in use, should throw UserAlreadyExistsError", async () => {
            const userDAO = new UserDAO()
        
            const mockRandomBytes = jest.spyOn(crypto, "randomBytes").mockImplementation((size) => {
                return (Buffer.from("salt"))
            })
            const mockScrypt = jest.spyOn(crypto, "scrypt").mockImplementation(async (password, salt, keylen) => {
                return Buffer.from("hashedPassword")
            })
        
            const mockDBRun = jest.spyOn(db, "run").mockImplementationOnce((sql, params, callback) => {
                callback(new Error('UNIQUE constraint failed: users.username'))
                return {} as Database
            });
        
            await expect(userDAO.createUser("username", "name", "surname", "password", "role"))
            .rejects.toThrow(UserAlreadyExistsError);
            mockRandomBytes.mockRestore()
            mockDBRun.mockRestore()
            mockScrypt.mockRestore()
        
        });

        test("db fault, should throw error", async () => {
            const userDAO = new UserDAO()
        
            const mockDBRun = jest.spyOn(db, "run").mockImplementation((sql, params, callback) => {
               throw new Error("DB fault") 
            });
            const mockRandomBytes = jest.spyOn(crypto, "randomBytes").mockImplementation((size) => {
                return (Buffer.from("salt"))
            })
            const mockScrypt = jest.spyOn(crypto, "scrypt").mockImplementation(async (password, salt, keylen) => {
                return Buffer.from("hashedPassword")
            })
            try {
                await userDAO.createUser("username", "name", "surname", "password", "role")
            }
            catch (e) {
                expect(e.message).toBe("DB fault")
            }
            mockRandomBytes.mockRestore()
            mockDBRun.mockRestore()
            mockScrypt.mockRestore()
        
        });
    });

    describe("getUsers tests", () => {

        test("should return the list of all users", async () => {
            const userDAO = new UserDAO();
        
            const user1 = {username: "u1", name: "u1", surname: "u1", role: "Manager", address: "u1", birthdate: "u1"}
            const user2 = {username: "u2", name: "u2", surname: "u2", role: "Customer", address: "u2", birthdate: "u2"}
            const usersInDb = [user1, user2]
            const expectedResult = [new User ("u1", "u1", "u1", Role.MANAGER, "u1", "u1"),
                new User ("u2", "u2", "u2", Role.CUSTOMER, "u2", "u2")];
        
            const mockDBAll = jest.spyOn(db, "all").mockImplementation((sql, callback) => {
                callback(null, usersInDb)
                return {} as Database
            });
        
            const result = await userDAO.getUsers();
            expect(result).toStrictEqual(expectedResult)
            mockDBAll.mockRestore()
        });

        test("db has no users, should return empty array", async () => {
            const userDAO = new UserDAO(); 
            const expectedResult: User[] = [];
        
            const mockDBAll = jest.spyOn(db, "all").mockImplementation((sql, callback) => {
                callback(null, [])
                return {} as Database
            }); 
            const result = await userDAO.getUsers();
            expect(result).toStrictEqual(expectedResult)
            mockDBAll.mockRestore() 
        });

        test("db has one user, should return an array with a single value", async () => {
            const userDAO = new UserDAO();
        
            const userInDB = {username: "u", name: "u", surname: "u", role: "Manager", address: "u", birthdate: "u"};
            const expectedResult = [ new User ("u", "u", "u", Role.MANAGER, "u", "u") ];
            
        
            const mockDBAll = jest.spyOn(db, "all").mockImplementation((sql, callback) => {
                callback(null, [userInDB]);
                return {} as Database;
            }); 
            const result = await userDAO.getUsers();
            expect(result).toStrictEqual(expectedResult);
            mockDBAll.mockRestore();
        });

        test("db error while getting all users", async () => {
            const userDAO = new UserDAO();

            const mockDBAll = jest.spyOn(db, "all").mockImplementation((sql, callback) => {
                callback(Error("DB Error"), null);
                return {} as Database;
            }); 

            await expect(userDAO.getUsers()).rejects.toThrow(Error("DB Error"));
            mockDBAll.mockRestore();
        });
    });

    describe("getUsersByRole tests", () => {

        test("returns all users that have role manager", async () => {
            const userDAO = new UserDAO();
        
            const manager = {username: "m", name: "m", surname: "m", role: "Manager", address: "m", birthdate: "m"}
            const customer = {username: "c", name: "c", surname: "c", role: "Customer", address: "c", birthdate: "c"}
            const admin = {username: "a", name: "a", surname: "a", role: "Admin", address: "a", birthdate: "a"}
        
            const expectedResult = [ new User ("m", "m", "m", Role.MANAGER, "m", "m")]
        
            const mockDBAll = jest.spyOn(db, "all").mockImplementation((sql, params, callback) => {
                callback(null, [manager])
                return {} as Database
            });  
            const result = await userDAO.getUsersByRole("Manager");
            expect(result).toStrictEqual(expectedResult)
            mockDBAll.mockRestore() 
        });

        test("returns all users that have role customer", async () => {
            const userDAO = new UserDAO();
        
            const manager = {username: "m", name: "m", surname: "m", role: "Manager", address: "m", birthdate: "m"}
            const customer = {username: "c", name: "c", surname: "c", role: "Customer", address: "c", birthdate: "c"}
            const admin = {username: "a", name: "a", surname: "a", role: "Admin", address: "a", birthdate: "a"}
        
            const expectedResult = [ new User ("c", "c", "c", Role.CUSTOMER, "c", "c")]
        
            const mockDBAll = jest.spyOn(db, "all").mockImplementation((sql, params, callback) => {
                callback(null, [customer])
                return {} as Database
            });  
            const result = await userDAO.getUsersByRole("Customer");
            expect(result).toStrictEqual(expectedResult)
            mockDBAll.mockRestore() 
        });

        test("returns all users that have role admin", async () => {
            const userDAO = new UserDAO();
        
            const manager = {username: "m", name: "m", surname: "m", role: "Manager", address: "m", birthdate: "m"}
            const customer = {username: "c", name: "c", surname: "c", role: "Customer", address: "c", birthdate: "c"}
            const admin = {username: "a", name: "a", surname: "a", role: "Admin", address: "a", birthdate: "a"}
        
            const expectedResult = [ new User ("a", "a", "a", Role.ADMIN, "a", "a")]
        
            const mockDBAll = jest.spyOn(db, "all").mockImplementation((sql, params, callback) => {
                callback(null, [admin])
                return {} as Database
            });  
            const result = await userDAO.getUsersByRole("Admin");
            expect(result).toStrictEqual(expectedResult)
            mockDBAll.mockRestore() 
        });

        test("role is not Admin, Customer or Manager, should return an empty list", async () => {
            const userDAO = new UserDAO(); 
            const expectedResult: User[] = [];
        
            const mockDBAll = jest.spyOn(db, "all").mockImplementation((sql, params, callback) => {
                callback(null, [])
                return {} as Database
            });  
            const result = await userDAO.getUsersByRole("SomethingElse");
            expect(result).toStrictEqual(expectedResult)
            mockDBAll.mockRestore()
        });
        
        test("specified role is empty, should return db error", async () => {
            const userDAO = new UserDAO(); 
        
            const mockDBAll = jest.spyOn(db, "all").mockImplementation((sql, params, callback) => {
                callback(Error("DB error"), null)
                return {} as Database
            });  
            await expect(userDAO.getUsersByRole("")).rejects.toThrow(Error("DB error"));
            mockDBAll.mockRestore()
        });
    });

    describe("getUserByUsername tests", () => {

        test("returns the specified user", async () => {
            const userDAO = new UserDAO();
            const userInDB = {username: "aUsername", name: "u", surname: "u", role: "Manager", address: "u", birthdate: "u"}
            const expectedResult: User = new User("aUsername", "u", "u", Role.MANAGER, "u", "u");
            const mockDBGet = jest.spyOn(db, "get").mockImplementation((sql, params, callback) => {
                callback(null, userInDB);
                return {} as Database
            });
            const result = await userDAO.getUserByUsername("aUsername");
            expect(result).toStrictEqual(expectedResult);
            mockDBGet.mockRestore();
        });
        
        test("the specified user is not found, returns UserNotFoundError", async () => {
            const userDAO = new UserDAO(); 
            const mockDBGet = jest.spyOn(db, "get").mockImplementation((sql, params, callback) => {
                callback(null, null)
                return {} as Database
            });
            await expect(userDAO.getUserByUsername("unknownUsername")).rejects.toThrow(UserNotFoundError)
            mockDBGet.mockRestore()
        });

        test("the specified user is empty, returns db error", async () => {
            const userDAO = new UserDAO(); 
            const mockDBGet = jest.spyOn(db, "get").mockImplementation((sql, params, callback) => {
                callback(Error("DB error"), null)
                return {} as Database
            }); 
            await expect(userDAO.getUserByUsername("")).rejects.toThrow(Error("DB error"))
            mockDBGet.mockRestore()
        })
    });

    describe("deleteUser tests", () => {

        test("specified user is successfully deleted, promise returns true", async () => {
            const userDAO = new UserDAO();
            
            const mockDBRun = jest.spyOn(db, "run").mockImplementation( function (sql, params, callback) {
                callback.call({changes: 1 }, null);
                return {} as Database
            });
            
            const result = await userDAO.deleteUser("username")
            expect(result).toBe(true)
            mockDBRun.mockRestore();
        });

        test("specified user does not exist, UserNotFoundError is thrown", async () => {
            const userDAO = new UserDAO();
            
            const mockDBRun = jest.spyOn(db, "run").mockImplementation(function (sql, params, callback) {
                callback.call({ changes: 0 }, null);
                return {} as Database
            });
        
            await expect(userDAO.deleteUser("username")).rejects.toThrow(UserNotFoundError);
            mockDBRun.mockRestore();
        });

        test("empty username, db error", async () => {
            const userDAO = new UserDAO();
            
            const mockDBRun = jest.spyOn(db, "run").mockImplementation((sql, params, callback) => {
                callback(Error("DB error"), null)
                return {} as Database
            });
            
            await expect(userDAO.deleteUser("username")).rejects.toThrow(Error("DB error"));
            mockDBRun.mockRestore();
        });
    });

    describe("deleteAll tests", () => {

        test("successfully deletes all uses from database, promise resolves to true", async () => {
            const userDAO = new UserDAO();

            const mockDBRun = jest.spyOn(db, "run").mockImplementation((sql, callback) => {
                callback(null, null);
                return {} as Database
            });

            const response = await userDAO.deleteAll();

            expect(response).toBe(true);
            mockDBRun.mockRestore();
        });

        test("error deleting users, throws db error", async () => {
            const userDAO = new UserDAO();

            const mockDBRun = jest.spyOn(db, "run").mockImplementation((sql, callback) => {
                callback(Error("DB error"), null);
                return {} as Database
            });

            await expect(userDAO.deleteAll()).rejects.toThrow(Error("DB error"));
            mockDBRun.mockRestore();
        });
    });

    describe("updateUserInfo tests", () => {

        test("successfully updates info, returns updated User as a promise", async () => {
            const newInfo = {name: "n", surname: "n", address: "n", birthdate:"n", username:"n"};
            const expectedResult = new User (newInfo.username, newInfo.name, newInfo.surname, Role.ADMIN, newInfo.address, newInfo.birthdate);

            const userDAO = new UserDAO();

            const mockDBRun = jest.spyOn(db, "run").mockImplementation((sql, params, callback) => {
                callback(null, null)
                return {} as Database
            });

            const mockDBGet = jest.spyOn(db, "get").mockImplementation((sql, params, callback) => {
                callback(null, {username: newInfo.username, name: newInfo.name, surname: newInfo.surname, role: Role.ADMIN, address: newInfo.address, birthdate: newInfo.address});
                return {} as Database
            });
            const response = await userDAO.updateUserInfo(newInfo.name, newInfo.surname, newInfo.address, newInfo.birthdate, newInfo.username);

            expect(response).toStrictEqual(expectedResult);
            mockDBRun.mockRestore();
            mockDBGet.mockRestore();
        });

        test("user does not exist, throws UserNotFoundError", async () => {
            const newInfo = {name: "n", surname: "n", address: "n", birthdate:"n", username:"n"};

            const userDAO = new UserDAO();

            const mockDBRun = jest.spyOn(db, "run").mockImplementation((sql, params, callback) => {
                callback(null)
                return {} as Database
            });

            const mockDBGet = jest.spyOn(db, "get").mockImplementation((sql, params, callback) => {
                callback(null, null)
                return {} as Database
            });

            await expect(userDAO.updateUserInfo(newInfo.name, newInfo.surname, newInfo.address, newInfo.birthdate, newInfo.username)).rejects.toThrow(UserNotFoundError);

            mockDBRun.mockRestore();
            mockDBGet.mockRestore();
        });

        test("empty username, throws DB error", async () => {
            const newInfo = {name: "n", surname: "n", address: "n", birthdate:"n", username:""};

            const userDAO = new UserDAO();

            const mockDBRun = jest.spyOn(db, "run").mockImplementation((sql, params, callback) => {
                callback(Error("DB error"))
                return {} as Database
            });


            await expect(userDAO.updateUserInfo(newInfo.name, newInfo.surname, newInfo.address, newInfo.birthdate, newInfo.username)).rejects.toThrow(Error("DB error"));

            mockDBRun.mockRestore();
        }); 

        test("empty name, throws DB error", async () => {
            const newInfo = {name: "", surname: "n", address: "n", birthdate:"n", username:"n"};

            const userDAO = new UserDAO();

            const mockDBRun = jest.spyOn(db, "run").mockImplementation((sql, params, callback) => {
                callback(Error("DB error"))
                return {} as Database
            });


            await expect(userDAO.updateUserInfo(newInfo.name, newInfo.surname, newInfo.address, newInfo.birthdate, newInfo.username)).rejects.toThrow(Error("DB error"));

            mockDBRun.mockRestore();
        });
        
        test("empty surname, throws DB error", async () => {
            const newInfo = {name: "n", surname: "", address: "n", birthdate:"n", username:"n"};

            const userDAO = new UserDAO();

            const mockDBRun = jest.spyOn(db, "run").mockImplementation((sql, params, callback) => {
                callback(Error("DB error"))
                return {} as Database
            });


            await expect(userDAO.updateUserInfo(newInfo.name, newInfo.surname, newInfo.address, newInfo.birthdate, newInfo.username)).rejects.toThrow(Error("DB error"));

            mockDBRun.mockRestore();
        });

        test("error while selecting the updated user, throws DB error", async () => {
            const newInfo = {name: "n", surname: "", address: "n", birthdate:"n", username:"n"};

            const userDAO = new UserDAO();

            const mockDBRun = jest.spyOn(db, "run").mockImplementation((sql, params, callback) => {
                callback(null, null)
                return {} as Database
            });

            const mockDBGet = jest.spyOn(db, "get").mockImplementation((sql, params, callback) => {
                callback(Error("DB error"), null)
                return {} as Database
            });

            await expect(userDAO.updateUserInfo(newInfo.name, newInfo.surname, newInfo.address, newInfo.birthdate, newInfo.username)).rejects.toThrow(Error("DB error"));

            mockDBRun.mockRestore();
            mockDBGet.mockRestore();
        }); 

    });
});





import { test, expect, jest, describe } from "@jest/globals"
import UserController from "../../src/controllers/userController"
import UserDAO from "../../src/dao/userDAO"
import { Role, User } from "../../src/components/user"
import { UnauthorizedUserError, UserNotFoundError } from "../../src/errors/userError"
import { rejects } from "assert"
import { assert } from "console"

jest.mock("../../src/dao/userDAO")

//Example of a unit test for the createUser method of the UserController
//The test checks if the method returns true when the DAO method returns true
//The test also expects the DAO method to be called once with the correct parameters

describe("User controller unit tests", () => {

    describe("createUser tests", () => {


        test("username already in use, it should return false", async () => {
            const testUser = { //Define a test user object
                username: "duplicateUsername",
                name: "test",
                surname: "test",
                password: "test",
                role: "Manager"
            }
            jest.spyOn(UserDAO.prototype, "createUser").mockResolvedValueOnce(false);
            const controller = new UserController();
            const response = await controller.createUser(testUser.username, testUser.name, testUser.surname, testUser.password, testUser.role);
        
            //Check if the createUser method of the DAO has been called once with the correct parameters
            expect(UserDAO.prototype.createUser).toHaveBeenCalledTimes(1);
            expect(UserDAO.prototype.createUser).toHaveBeenCalledWith(testUser.username,
                testUser.name,
                testUser.surname,
                testUser.password,
                testUser.role);
            expect(response).toBe(false); //Check if the response is true
            jest.clearAllMocks();
        });

        test("It should return true", async () => {
            const testUser = { //Define a test user object
                username: "test",
                name: "test",
                surname: "test",
                password: "test",
                role: "Manager"
            }
            jest.spyOn(UserDAO.prototype, "createUser").mockResolvedValueOnce(true); //Mock the createUser method of the DAO
            const controller = new UserController(); //Create a new instance of the controller
            //Call the createUser method of the controller with the test user object
            const response = await controller.createUser(testUser.username, testUser.name, testUser.surname, testUser.password, testUser.role);
        
            //Check if the createUser method of the DAO has been called once with the correct parameters
            expect(UserDAO.prototype.createUser).toHaveBeenCalledTimes(1);
            expect(UserDAO.prototype.createUser).toHaveBeenCalledWith(testUser.username,
                testUser.name,
                testUser.surname,
                testUser.password,
                testUser.role);
            expect(response).toBe(true); //Check if the response is true
            jest.clearAllMocks();
        });


        test("empty username, should return false", async () => {
            const testUser = { //Define a test user object
                username: "",
                name: "test",
                surname: "test",
                password: "test",
                role: "Manager"
            }
            jest.spyOn(UserDAO.prototype, "createUser").mockResolvedValueOnce(false); //Mock the createUser method of the DAO
            const controller = new UserController(); //Create a new instance of the controller
            //Call the createUser method of the controller with the test user object
            const response = await controller.createUser(testUser.username, testUser.name, testUser.surname, testUser.password, testUser.role);
        
            //Check if the createUser method of the DAO has been called once with the correct parameters
            expect(UserDAO.prototype.createUser).toHaveBeenCalledTimes(1);
            expect(UserDAO.prototype.createUser).toHaveBeenCalledWith(testUser.username,
                testUser.name,
                testUser.surname,
                testUser.password,
                testUser.role);
            expect(response).toBe(false); //Check if the response is true
            jest.clearAllMocks();
        });

        test("len 1 username, should return true", async () => {
            const testUser = { //Define a test user object
                username: "t",
                name: "test",
                surname: "test",
                password: "test",
                role: "Manager"
            }
            jest.spyOn(UserDAO.prototype, "createUser").mockResolvedValueOnce(true); //Mock the createUser method of the DAO
            const controller = new UserController(); //Create a new instance of the controller
            //Call the createUser method of the controller with the test user object
            const response = await controller.createUser(testUser.username, testUser.name, testUser.surname, testUser.password, testUser.role);
        
            //Check if the createUser method of the DAO has been called once with the correct parameters
            expect(UserDAO.prototype.createUser).toHaveBeenCalledTimes(1);
            expect(UserDAO.prototype.createUser).toHaveBeenCalledWith(testUser.username,
                testUser.name,
                testUser.surname,
                testUser.password,
                testUser.role);
            expect(response).toBe(true); //Check if the response is true
            jest.clearAllMocks();
        });

        test("empty name, should return false", async () => {
            const testUser = { //Define a test user object
                username: "test",
                name: "",
                surname: "test",
                password: "test",
                role: "Manager"
            }
            jest.spyOn(UserDAO.prototype, "createUser").mockResolvedValueOnce(false); //Mock the createUser method of the DAO
            const controller = new UserController(); //Create a new instance of the controller
            //Call the createUser method of the controller with the test user object
            const response = await controller.createUser(testUser.username, testUser.name, testUser.surname, testUser.password, testUser.role);
        
            //Check if the createUser method of the DAO has been called once with the correct parameters
            expect(UserDAO.prototype.createUser).toHaveBeenCalledTimes(1);
            expect(UserDAO.prototype.createUser).toHaveBeenCalledWith(testUser.username,
                testUser.name,
                testUser.surname,
                testUser.password,
                testUser.role);
            expect(response).toBe(false); //Check if the response is true
            jest.clearAllMocks();
        });


        test("len 1 name, should return true", async () => {
            const testUser = { //Define a test user object
                username: "test",
                name: "t",
                surname: "test",
                password: "test",
                role: "Manager"
            }
            jest.spyOn(UserDAO.prototype, "createUser").mockResolvedValueOnce(true); //Mock the createUser method of the DAO
            const controller = new UserController(); //Create a new instance of the controller
            //Call the createUser method of the controller with the test user object
            const response = await controller.createUser(testUser.username, testUser.name, testUser.surname, testUser.password, testUser.role);
        
            //Check if the createUser method of the DAO has been called once with the correct parameters
            expect(UserDAO.prototype.createUser).toHaveBeenCalledTimes(1);
            expect(UserDAO.prototype.createUser).toHaveBeenCalledWith(testUser.username,
                testUser.name,
                testUser.surname,
                testUser.password,
                testUser.role);
            expect(response).toBe(true); //Check if the response is true
            jest.clearAllMocks();
        });

        test("empty surname, should return false", async () => {
            const testUser = { //Define a test user object
                username: "test",
                name: "test",
                surname: "",
                password: "test",
                role: "Manager"
            }
            jest.spyOn(UserDAO.prototype, "createUser").mockResolvedValueOnce(false); //Mock the createUser method of the DAO
            const controller = new UserController(); //Create a new instance of the controller
            //Call the createUser method of the controller with the test user object
            const response = await controller.createUser(testUser.username, testUser.name, testUser.surname, testUser.password, testUser.role);
        
            //Check if the createUser method of the DAO has been called once with the correct parameters
            expect(UserDAO.prototype.createUser).toHaveBeenCalledTimes(1);
            expect(UserDAO.prototype.createUser).toHaveBeenCalledWith(testUser.username,
                testUser.name,
                testUser.surname,
                testUser.password,
                testUser.role);
            expect(response).toBe(false); //Check if the response is true
            jest.clearAllMocks();
        });

        test("len 1 surname, should return true", async () => {
            const testUser = { //Define a test user object
                username: "test",
                name: "test",
                surname: "t",
                password: "test",
                role: "Manager"
            }
            jest.spyOn(UserDAO.prototype, "createUser").mockResolvedValueOnce(true); //Mock the createUser method of the DAO
            const controller = new UserController(); //Create a new instance of the controller
            //Call the createUser method of the controller with the test user object
            const response = await controller.createUser(testUser.username, testUser.name, testUser.surname, testUser.password, testUser.role);
        
            //Check if the createUser method of the DAO has been called once with the correct parameters
            expect(UserDAO.prototype.createUser).toHaveBeenCalledTimes(1);
            expect(UserDAO.prototype.createUser).toHaveBeenCalledWith(testUser.username,
                testUser.name,
                testUser.surname,
                testUser.password,
                testUser.role);
            expect(response).toBe(true); //Check if the response is true
            jest.clearAllMocks();
        });

        test("empty password, should return false", async () => {
            const testUser = { //Define a test user object
                username: "test",
                name: "test",
                surname: "test",
                password: "",
                role: "Manager"
            }
            jest.spyOn(UserDAO.prototype, "createUser").mockResolvedValueOnce(false); //Mock the createUser method of the DAO
            const controller = new UserController(); //Create a new instance of the controller
            //Call the createUser method of the controller with the test user object
            const response = await controller.createUser(testUser.username, testUser.name, testUser.surname, testUser.password, testUser.role);
        
            //Check if the createUser method of the DAO has been called once with the correct parameters
            expect(UserDAO.prototype.createUser).toHaveBeenCalledTimes(1);
            expect(UserDAO.prototype.createUser).toHaveBeenCalledWith(testUser.username,
                testUser.name,
                testUser.surname,
                testUser.password,
                testUser.role);
            expect(response).toBe(false); //Check if the response is true
            jest.clearAllMocks();
        });
    

        test("len1 password, should return true", async () => {
            const testUser = { //Define a test user object
                username: "test",
                name: "test",
                surname: "test",
                password: "t",
                role: "Manager"
            }
            jest.spyOn(UserDAO.prototype, "createUser").mockResolvedValueOnce(true); //Mock the createUser method of the DAO
            const controller = new UserController(); //Create a new instance of the controller
            //Call the createUser method of the controller with the test user object
            const response = await controller.createUser(testUser.username, testUser.name, testUser.surname, testUser.password, testUser.role);
        
            //Check if the createUser method of the DAO has been called once with the correct parameters
            expect(UserDAO.prototype.createUser).toHaveBeenCalledTimes(1);
            expect(UserDAO.prototype.createUser).toHaveBeenCalledWith(testUser.username,
                testUser.name,
                testUser.surname,
                testUser.password,
                testUser.role);
            expect(response).toBe(true); //Check if the response is true
            jest.clearAllMocks();
        });

        test("invalid role, should return false", async () => {
            const testUser = { //Define a test user object
                username: "test",
                name: "test",
                surname: "test",
                password: "t",
                role: "S"
            }
            jest.spyOn(UserDAO.prototype, "createUser").mockResolvedValueOnce(false); //Mock the createUser method of the DAO
            const controller = new UserController(); //Create a new instance of the controller
            //Call the createUser method of the controller with the test user object
            const response = await controller.createUser(testUser.username, testUser.name, testUser.surname, testUser.password, testUser.role);
        
            //Check if the createUser method of the DAO has been called once with the correct parameters
            expect(UserDAO.prototype.createUser).toHaveBeenCalledTimes(1);
            expect(UserDAO.prototype.createUser).toHaveBeenCalledWith(testUser.username,
                testUser.name,
                testUser.surname,
                testUser.password,
                testUser.role);
            expect(response).toBe(false); //Check if the response is true
            jest.clearAllMocks();
        });

        test("empty role, should return false", async () => {
            const testUser = { //Define a test user object
                username: "test",
                name: "test",
                surname: "test",
                password: "t",
                role: ""
            }
            jest.spyOn(UserDAO.prototype, "createUser").mockResolvedValueOnce(false); //Mock the createUser method of the DAO
            const controller = new UserController(); //Create a new instance of the controller
            //Call the createUser method of the controller with the test user object
            const response = await controller.createUser(testUser.username, testUser.name, testUser.surname, testUser.password, testUser.role);
        
            //Check if the createUser method of the DAO has been called once with the correct parameters
            expect(UserDAO.prototype.createUser).toHaveBeenCalledTimes(1);
            expect(UserDAO.prototype.createUser).toHaveBeenCalledWith(testUser.username,
                testUser.name,
                testUser.surname,
                testUser.password,
                testUser.role);
            expect(response).toBe(false); //Check if the response is true
            jest.clearAllMocks();
        });
    });

    describe("getUsers tests", () => {

        const User1 = new User (
            "u1",
            "u1",
            "u1",
            Role.ADMIN,
            "u1",
            "u1"
        )

        const User2 = new User (
            "u2",
            "u2",
            "u2",
            Role.MANAGER,
            "u2",
            "u2"
        )

        test("Should return list of users", async () => {
            jest.spyOn(UserDAO.prototype, "getUsers").mockResolvedValueOnce([User1, User2]);
            const controller = new UserController();
            const response = await controller.getUsers();

            expect(UserDAO.prototype.getUsers).toHaveBeenCalledTimes(1);
            expect(response).toStrictEqual([User1, User2]);
            jest.clearAllMocks();
        });

        test("Should return a single user", async () => {
            jest.spyOn(UserDAO.prototype, "getUsers").mockResolvedValueOnce([User1]);
            const controller = new UserController();
            const response = await controller.getUsers();

            expect(UserDAO.prototype.getUsers).toHaveBeenCalledTimes(1);
            expect(response).toStrictEqual([User1]);
            jest.clearAllMocks(); 
        });

        test("Should return an empty list", async () => {
            jest.spyOn(UserDAO.prototype, "getUsers").mockResolvedValueOnce([]);
            const controller = new UserController();
            const response = await controller.getUsers();

            expect(UserDAO.prototype.getUsers).toHaveBeenCalledTimes(1);
            expect(response).toStrictEqual([]);
            jest.clearAllMocks(); 
        });
    });

    describe("getUsersByRole tests", () => {

        const a1 = new User("a1", "a1", "a1", Role.ADMIN, "a1", "a1");
        const a2 = new User("a2", "a2", "a2", Role.ADMIN, "a2", "a2");
        const a3 = new User("a3", "a3", "a3", Role.ADMIN, "a3", "a3");
        const c1 = new User("c1", "c1", "c1", Role.CUSTOMER, "c1", "c1");
        const c2 = new User("c2", "c2", "c2", Role.CUSTOMER, "c2", "c2");
        const c3 = new User("c3", "c3", "c3", Role.CUSTOMER, "c3", "c3");
        const m1 = new User("m1", "m1", "m1", Role.MANAGER, "m1", "m1");
        const m2 = new User("m2", "m2", "m2", Role.MANAGER, "m2", "m2");
        const m3 = new User("m3", "m3", "m3", Role.MANAGER, "m3", "m3");


        test("Should return admin list", async () => {
            jest.spyOn(UserDAO.prototype, "getUsersByRole").mockResolvedValueOnce([a1, a2, a3]);
            const controller = new UserController();
            const response = await controller.getUsersByRole("Admin");

            expect(UserDAO.prototype.getUsersByRole).toHaveBeenCalledTimes(1);
            expect(UserDAO.prototype.getUsersByRole).toHaveBeenCalledWith("Admin");
            expect(response).toStrictEqual([a1, a2, a3]);
            jest.clearAllMocks(); 
        });

        test("Should return single admin", async () => {
            jest.spyOn(UserDAO.prototype, "getUsersByRole").mockResolvedValueOnce([a1]);
            const controller = new UserController();
            const response = await controller.getUsersByRole("Admin");

            expect(UserDAO.prototype.getUsersByRole).toHaveBeenCalledTimes(1);
            expect(UserDAO.prototype.getUsersByRole).toHaveBeenCalledWith("Admin");
            expect(response).toStrictEqual([a1]);
            jest.clearAllMocks(); 
        });

        test("Should return no admin", async () => {
            jest.spyOn(UserDAO.prototype, "getUsersByRole").mockResolvedValueOnce([]);
            const controller = new UserController();
            const response = await controller.getUsersByRole("Admin");

            expect(UserDAO.prototype.getUsersByRole).toHaveBeenCalledTimes(1);
            expect(UserDAO.prototype.getUsersByRole).toHaveBeenCalledWith("Admin");
            expect(response).toStrictEqual([]);
            jest.clearAllMocks(); 
        });

        test("Should return customer list", async () => {
            jest.spyOn(UserDAO.prototype, "getUsersByRole").mockResolvedValueOnce([c1, c2, c3]);
            const controller = new UserController();
            const response = await controller.getUsersByRole("Customer");

            expect(UserDAO.prototype.getUsersByRole).toHaveBeenCalledTimes(1);
            expect(UserDAO.prototype.getUsersByRole).toHaveBeenCalledWith("Customer");
            expect(response).toStrictEqual([c1, c2, c3]);
            jest.clearAllMocks(); 
        });

        test("Should return single customer", async () => {
            jest.spyOn(UserDAO.prototype, "getUsersByRole").mockResolvedValueOnce([c1]);
            const controller = new UserController();
            const response = await controller.getUsersByRole("Customer");

            expect(UserDAO.prototype.getUsersByRole).toHaveBeenCalledTimes(1);
            expect(UserDAO.prototype.getUsersByRole).toHaveBeenCalledWith("Customer");
            expect(response).toStrictEqual([c1]);
            jest.clearAllMocks(); 
        });

        test("Should return no customer", async () => {
            jest.spyOn(UserDAO.prototype, "getUsersByRole").mockResolvedValueOnce([]);
            const controller = new UserController();
            const response = await controller.getUsersByRole("Customer");

            expect(UserDAO.prototype.getUsersByRole).toHaveBeenCalledTimes(1);
            expect(UserDAO.prototype.getUsersByRole).toHaveBeenCalledWith("Customer");
            expect(response).toStrictEqual([]);
            jest.clearAllMocks(); 
        });

        test("Should return manager list", async () => {
            jest.spyOn(UserDAO.prototype, "getUsersByRole").mockResolvedValueOnce([m1, m2, m3]);
            const controller = new UserController();
            const response = await controller.getUsersByRole("Manager");

            expect(UserDAO.prototype.getUsersByRole).toHaveBeenCalledTimes(1);
            expect(UserDAO.prototype.getUsersByRole).toHaveBeenCalledWith("Manager");
            expect(response).toStrictEqual([m1, m2, m3]);
            jest.clearAllMocks(); 
        }); 

        test("Should return single manager", async () => {
            jest.spyOn(UserDAO.prototype, "getUsersByRole").mockResolvedValueOnce([m1]);
            const controller = new UserController();
            const response = await controller.getUsersByRole("Manager");

            expect(UserDAO.prototype.getUsersByRole).toHaveBeenCalledTimes(1);
            expect(UserDAO.prototype.getUsersByRole).toHaveBeenCalledWith("Manager");
            expect(response).toStrictEqual([m1]);
            jest.clearAllMocks(); 
        });

        test("Should return no manager", async () => {
            jest.spyOn(UserDAO.prototype, "getUsersByRole").mockResolvedValueOnce([]);
            const controller = new UserController();
            const response = await controller.getUsersByRole("Manager");

            expect(UserDAO.prototype.getUsersByRole).toHaveBeenCalledTimes(1);
            expect(UserDAO.prototype.getUsersByRole).toHaveBeenCalledWith("Manager");
            expect(response).toStrictEqual([]);
            jest.clearAllMocks(); 
        });
        
        test("empty role, should return empty list", async () => {
            jest.spyOn(UserDAO.prototype, "getUsersByRole").mockResolvedValueOnce([]);
            const controller = new UserController();
            const response = await controller.getUsersByRole("");

            expect(UserDAO.prototype.getUsersByRole).toHaveBeenCalledTimes(1);
            expect(UserDAO.prototype.getUsersByRole).toHaveBeenCalledWith("");
            expect(response).toStrictEqual([]);
            jest.clearAllMocks(); 
        });

        test("invalid role, should return empty list", async () => {
            jest.spyOn(UserDAO.prototype, "getUsersByRole").mockResolvedValueOnce([]);
            const controller = new UserController();
            const response = await controller.getUsersByRole("Invalid");

            expect(UserDAO.prototype.getUsersByRole).toHaveBeenCalledTimes(1);
            expect(UserDAO.prototype.getUsersByRole).toHaveBeenCalledWith("Invalid");
            expect(response).toStrictEqual([]);
            jest.clearAllMocks(); 
        });
    });

    describe("getUserByUsername tests", () => {

        const a1 = new User("a1", "a1", "a1", Role.ADMIN, "a1", "a1");
        const a2 = new User("a2", "a2", "a2", Role.ADMIN, "a2", "a2");
        const c1 = new User("c1", "c1", "c1", Role.CUSTOMER, "c1", "c1");
        const m1 = new User("m1", "m1", "m1", Role.MANAGER, "m1", "m1");

        test("Admin retrieves an admin", async () => {
            const retrievingUser = a1;
            
            jest.spyOn(UserDAO.prototype, "getUserByUsername").mockResolvedValueOnce(a2);
            const controller = new UserController();
            const response = await controller.getUserByUsername(retrievingUser, "a2");

            expect(UserDAO.prototype.getUserByUsername).toHaveBeenCalledTimes(1);
            expect(UserDAO.prototype.getUserByUsername).toHaveBeenCalledWith("a2");
            expect(response).toBe(a2);
            jest.clearAllMocks(); 
        });

        test("Admin retrieves a customer", async () => {
            const retrievingUser = a1;
            
            jest.spyOn(UserDAO.prototype, "getUserByUsername").mockResolvedValueOnce(c1);
            const controller = new UserController();
            const response = await controller.getUserByUsername(retrievingUser, "c1");

            expect(UserDAO.prototype.getUserByUsername).toHaveBeenCalledTimes(1);
            expect(UserDAO.prototype.getUserByUsername).toHaveBeenCalledWith("c1");
            expect(response).toBe(c1);
            jest.clearAllMocks(); 
        });

        test("Admin retrieves a manager", async () => {
            const retrievingUser = a1;
            
            jest.spyOn(UserDAO.prototype, "getUserByUsername").mockResolvedValueOnce(m1);
            const controller = new UserController();
            const response = await controller.getUserByUsername(retrievingUser, "m1");

            expect(UserDAO.prototype.getUserByUsername).toHaveBeenCalledTimes(1);
            expect(UserDAO.prototype.getUserByUsername).toHaveBeenCalledWith("m1");
            expect(response).toBe(m1);
            jest.clearAllMocks(); 
        });

        test("Admin retrieves themselves", async () => {
            const retrievingUser = a1;
            
            jest.spyOn(UserDAO.prototype, "getUserByUsername").mockResolvedValueOnce(a1);
            const controller = new UserController();
            const response = await controller.getUserByUsername(retrievingUser, "a1");

            expect(UserDAO.prototype.getUserByUsername).toHaveBeenCalledTimes(1);
            expect(UserDAO.prototype.getUserByUsername).toHaveBeenCalledWith("a1");
            expect(response).toBe(a1);
            jest.clearAllMocks(); 
        });

        test("Admin attempts to retrieve invalid username, error", async () => {
            const retrievingUser = a1;
            
            jest.spyOn(UserDAO.prototype, "getUserByUsername").mockRejectedValueOnce(new UserNotFoundError());
            const controller = new UserController();
            expect(controller.getUserByUsername(retrievingUser, "invalid")).rejects.toThrow(UserNotFoundError);

            expect(UserDAO.prototype.getUserByUsername).toHaveBeenCalledTimes(1);
            expect(UserDAO.prototype.getUserByUsername).toHaveBeenCalledWith("invalid");
            jest.clearAllMocks(); 
        });

        test("Admin attempts to retrieve empty username, error", async () => {
            const retrievingUser = a1;
            
            jest.spyOn(UserDAO.prototype, "getUserByUsername").mockRejectedValueOnce(new UserNotFoundError());
            const controller = new UserController();
            expect(controller.getUserByUsername(retrievingUser, "")).rejects.toThrow(UserNotFoundError);

            expect(UserDAO.prototype.getUserByUsername).toHaveBeenCalledTimes(1);
            expect(UserDAO.prototype.getUserByUsername).toHaveBeenCalledWith("");
            jest.clearAllMocks(); 
        });

        test("Customer retrieves themselves", async () => {
            const retrievingUser = c1;
            
            jest.spyOn(UserDAO.prototype, "getUserByUsername").mockResolvedValueOnce(c1);
            const controller = new UserController();
            const response = await controller.getUserByUsername(retrievingUser, "c1");

            expect(UserDAO.prototype.getUserByUsername).toHaveBeenCalledTimes(1);
            expect(UserDAO.prototype.getUserByUsername).toHaveBeenCalledWith("c1");
            expect(response).toBe(c1);
            jest.clearAllMocks(); 
        });

        test("Customer attempts to retrieve other user", async () => {
            const retrievingUser = c1;
            
            const controller = new UserController();
            expect(controller.getUserByUsername(retrievingUser, "a1")).rejects.toThrow(UnauthorizedUserError);

            expect(UserDAO.prototype.getUserByUsername).toHaveBeenCalledTimes(0);
            jest.clearAllMocks(); 
        });

        test("Manager retrieves themselves", async () => {
            const retrievingUser = m1;
            
            jest.spyOn(UserDAO.prototype, "getUserByUsername").mockResolvedValueOnce(m1);
            const controller = new UserController();
            const response = await controller.getUserByUsername(retrievingUser, "m1");

            expect(UserDAO.prototype.getUserByUsername).toHaveBeenCalledTimes(1);
            expect(UserDAO.prototype.getUserByUsername).toHaveBeenCalledWith("m1");
            expect(response).toBe(m1);
            jest.clearAllMocks(); 
        });

        test("Manager attempts to retrieve other user", async () => {
            const retrievingUser = m1;
            
            const controller = new UserController();
            expect(controller.getUserByUsername(retrievingUser, "a1")).rejects.toThrow(UnauthorizedUserError);

            expect(UserDAO.prototype.getUserByUsername).toHaveBeenCalledTimes(0);
            jest.clearAllMocks(); 
        });

        test("Admin attempts to retrieve themselves but it is not in the db", async () => {
            const retrievingUser = a1;
            
            jest.spyOn(UserDAO.prototype, "getUserByUsername").mockRejectedValueOnce(new UserNotFoundError());
            const controller = new UserController();
            expect(controller.getUserByUsername(retrievingUser, "a1")).rejects.toThrow(UserNotFoundError);

            expect(UserDAO.prototype.getUserByUsername).toHaveBeenCalledTimes(1);
            expect(UserDAO.prototype.getUserByUsername).toHaveBeenCalledWith("a1");
            jest.clearAllMocks();
        });

        test("Customer attempts to retrieve themselves but it is not in the db", async () => {
            const retrievingUser = c1;
            
            jest.spyOn(UserDAO.prototype, "getUserByUsername").mockRejectedValueOnce(new UserNotFoundError());
            const controller = new UserController();
            expect(controller.getUserByUsername(retrievingUser, "c1")).rejects.toThrow(UserNotFoundError);

            expect(UserDAO.prototype.getUserByUsername).toHaveBeenCalledTimes(1);
            expect(UserDAO.prototype.getUserByUsername).toHaveBeenCalledWith("c1");
            jest.clearAllMocks();
        });

        test("Manager attempts to retrieve themselves but it is not in the db", async () => {
            const retrievingUser = m1;
            
            jest.spyOn(UserDAO.prototype, "getUserByUsername").mockRejectedValueOnce(new UserNotFoundError());
            const controller = new UserController();
            expect(controller.getUserByUsername(retrievingUser, "m1")).rejects.toThrow(UserNotFoundError);

            expect(UserDAO.prototype.getUserByUsername).toHaveBeenCalledTimes(1);
            expect(UserDAO.prototype.getUserByUsername).toHaveBeenCalledWith("m1");
            jest.clearAllMocks();
        });
    });

    describe("deleteUser tests", () => {
       
        const a1 = new User("a1", "a1", "a1", Role.ADMIN, "a1", "a1");
        const a2 = new User("a2", "a2", "a2", Role.ADMIN, "a2", "a2");
        const c1 = new User("c1", "c1", "c1", Role.CUSTOMER, "c1", "c1");
        const m1 = new User("m1", "m1", "m1", Role.MANAGER, "m1", "m1");

        test("Admin deletes a Customer", async () => {
            const deletingUser = a1;

            const fakeUserToDelete = new User("c2", "c2", "c2", Role.CUSTOMER, "", "")
            jest.spyOn(UserDAO.prototype, "getUserByUsername").mockResolvedValueOnce(fakeUserToDelete)
            
            jest.spyOn(UserDAO.prototype, "deleteUser").mockResolvedValueOnce(true);
            const controller = new UserController();
            const response = await controller.deleteUser(deletingUser, fakeUserToDelete.username);

            expect(UserDAO.prototype.getUserByUsername).toHaveBeenCalledTimes(1);
            expect(UserDAO.prototype.deleteUser).toHaveBeenCalledTimes(1);
            expect(UserDAO.prototype.deleteUser).toHaveBeenCalledWith(fakeUserToDelete.username);
            expect(response).toBe(true);
            jest.clearAllMocks(); 
        });
        
        test("Admin deletes a Manager", async () => {
            const deletingUser = a1;

            const fakeUserToDelete = new User("m2", "m2", "m2", Role.MANAGER, "", "")
            jest.spyOn(UserDAO.prototype, "getUserByUsername").mockResolvedValueOnce(fakeUserToDelete)
            
            jest.spyOn(UserDAO.prototype, "deleteUser").mockResolvedValueOnce(true);
            const controller = new UserController();
            const response = await controller.deleteUser(deletingUser, fakeUserToDelete.username);

            expect(UserDAO.prototype.getUserByUsername).toHaveBeenCalledTimes(1);
            expect(UserDAO.prototype.deleteUser).toHaveBeenCalledTimes(1);
            expect(UserDAO.prototype.deleteUser).toHaveBeenCalledWith(fakeUserToDelete.username);
            expect(response).toBe(true);
            jest.clearAllMocks(); 
        });

        test("Admin deletes themselves", async () => {
            const deletingUser = a1;
            
            jest.spyOn(UserDAO.prototype, "deleteUser").mockResolvedValueOnce(true);
            const controller = new UserController();
            const response = await controller.deleteUser(deletingUser, "a1");

            expect(UserDAO.prototype.deleteUser).toHaveBeenCalledTimes(1);
            expect(UserDAO.prototype.deleteUser).toHaveBeenCalledWith("a1");
            expect(response).toBe(true);
            jest.clearAllMocks(); 
        });
        
        test("Customer deletes themselves", async () => {
            const deletingUser = c1;

            jest.spyOn(UserDAO.prototype, "deleteUser").mockResolvedValueOnce(true);
            const controller = new UserController();
            
            const response = await controller.deleteUser(deletingUser, "c1");

            expect(response).toBe(true);
            expect(UserDAO.prototype.deleteUser).toHaveBeenCalledTimes(1);
            expect(UserDAO.prototype.deleteUser).toHaveBeenCalledWith("c1");
            jest.clearAllMocks(); 
        });

        test("Customer attempts to delete other user", async () => {
            const deletingUser = c1;

            const controller = new UserController();
            await expect(controller.deleteUser(deletingUser, "a1")).rejects.toThrow(UnauthorizedUserError);

            expect(UserDAO.prototype.deleteUser).toHaveBeenCalledTimes(0);
            jest.clearAllMocks(); 
        });

        test("Manager deletes themselves", async () => {
            const deletingUser = m1;

            jest.spyOn(UserDAO.prototype, "deleteUser").mockResolvedValueOnce(true);
            const controller = new UserController();
            
            const response = await controller.deleteUser(deletingUser, "m1");

            expect(response).toBe(true);
            expect(UserDAO.prototype.deleteUser).toHaveBeenCalledTimes(1);
            expect(UserDAO.prototype.deleteUser).toHaveBeenCalledWith("m1");
            jest.clearAllMocks(); 
        });

        test("Manager attempts to delete other user", async () => {
            const deletingUser = m1;

            const controller = new UserController();
            await expect(controller.deleteUser(deletingUser, "a1")).rejects.toThrow(UnauthorizedUserError);

            expect(UserDAO.prototype.deleteUser).toHaveBeenCalledTimes(0);
            jest.clearAllMocks(); 
        });

        test("Admin attempts to delete non existent user", async () => {
            const deletingUser = a1;

            jest.spyOn(UserDAO.prototype, "getUserByUsername").mockRejectedValueOnce(new UserNotFoundError);
            
            const controller = new UserController();
            //jest.spyOn(UserDAO.prototype, "deleteUser").mockRejectedValueOnce(new UserNotFoundError());
            await expect(controller.deleteUser(deletingUser, "nonExistentUser")).rejects.toThrow(UserNotFoundError);

            expect(UserDAO.prototype.getUserByUsername).toHaveBeenCalledTimes(1);
            expect(UserDAO.prototype.deleteUser).toHaveBeenCalledTimes(0);
            jest.clearAllMocks(); 
            
        });

        test("Admin attempts to delete another admin", async () => {
            const deletingUser = a1;
            
            const controller = new UserController();


            const fakeUserToDelete = new User("a2", "a2", "a2", Role.ADMIN, "", "")
            jest.spyOn(UserDAO.prototype, "getUserByUsername").mockResolvedValueOnce(fakeUserToDelete)

            await expect(controller.deleteUser(deletingUser, fakeUserToDelete.username)).rejects.toThrow(UnauthorizedUserError);

            expect(UserDAO.prototype.deleteUser).toHaveBeenCalledTimes(0);
            expect(UserDAO.prototype.getUserByUsername).toHaveBeenCalledTimes(1);
            jest.clearAllMocks(); 
            
        }); 

    });

    describe("deleteAll tests", () => {

        test("delete all users", async () => {

            jest.spyOn(UserDAO.prototype, "deleteAll").mockResolvedValueOnce(true);
            const controller = new UserController();

            const result = await controller.deleteAll();
            expect(result).toBe(true);
            expect(UserDAO.prototype.deleteAll).toHaveBeenCalledTimes(1);
            jest.clearAllMocks()
        });

        test("delete all users fails", async () => {

            jest.spyOn(UserDAO.prototype, "deleteAll").mockRejectedValueOnce(new Error());
            const controller = new UserController();

            await expect(controller.deleteAll()).rejects.toThrow(Error());
            expect(UserDAO.prototype.deleteAll).toHaveBeenCalledTimes(1);
            jest.clearAllMocks()
        });
    });

    describe("updateUserInfo tests", () => {

        const a = new User("a", "a", "a", Role.ADMIN, "a", "a");
        const aUpdated = new User("a", "aU", "aU", Role.ADMIN, "a", "a");
        const c = new User("c", "c", "c", Role.CUSTOMER, "c", "c");
        const cUpdated = new User("c", "cU", "cU", Role.CUSTOMER, "c", "c");
        const m = new User("m", "m", "m", Role.MANAGER, "m", "m");
        const mUpdated = new User("m", "mU", "mU", Role.MANAGER, "m", "m");

        test("Admin updates their info", async () => {
            const updaterUser = a;

            jest.spyOn(UserDAO.prototype, "updateUserInfo").mockResolvedValue(aUpdated);
            const controller = new UserController();

            const result = await controller.updateUserInfo(updaterUser, aUpdated.name, aUpdated.surname, aUpdated.address, aUpdated.birthdate, aUpdated.username);
            expect(result).toStrictEqual(aUpdated);
            expect(UserDAO.prototype.updateUserInfo).toHaveBeenCalledTimes(1);
            expect(UserDAO.prototype.updateUserInfo).toHaveBeenCalledWith(aUpdated.name, aUpdated.surname, aUpdated.address, aUpdated.birthdate, aUpdated.username);
            jest.resetAllMocks();
            jest.restoreAllMocks();
        });

        test("Customer updates their info", async () => {
            const updaterUser = c;

            jest.spyOn(UserDAO.prototype, "updateUserInfo").mockResolvedValue(cUpdated);
            const controller = new UserController();

            const result = await controller.updateUserInfo(updaterUser, cUpdated.name, cUpdated.surname, cUpdated.address, cUpdated.birthdate, cUpdated.username);
            expect(result).toStrictEqual(cUpdated);
            expect(UserDAO.prototype.updateUserInfo).toHaveBeenCalledTimes(1);
            expect(UserDAO.prototype.updateUserInfo).toHaveBeenCalledWith(cUpdated.name, cUpdated.surname, cUpdated.address, cUpdated.birthdate, cUpdated.username);
            jest.resetAllMocks();
            jest.restoreAllMocks();
        });

        test("Manager updates their info", async () => {
            const updaterUser = m;

            jest.spyOn(UserDAO.prototype, "updateUserInfo").mockResolvedValue(mUpdated);
            const controller = new UserController();

            const result = await controller.updateUserInfo(updaterUser, mUpdated.name, mUpdated.surname, mUpdated.address, mUpdated.birthdate, mUpdated.username);
            expect(result).toStrictEqual(mUpdated);
            expect(UserDAO.prototype.updateUserInfo).toHaveBeenCalledTimes(1);
            expect(UserDAO.prototype.updateUserInfo).toHaveBeenCalledWith(mUpdated.name, mUpdated.surname, mUpdated.address, mUpdated.birthdate, mUpdated.username);
            jest.resetAllMocks();
            jest.restoreAllMocks();
        });

        test("User attempts to update another user info", async () => {
            const updaterUser = a;
            const anotherUserName = "another";
            const anotherUserUpdatedInfo = new User("n", "n", "n", Role.CUSTOMER, "n", "another");

            const controller = new UserController();

            await (expect(controller.updateUserInfo(updaterUser,
                anotherUserUpdatedInfo.name,
                anotherUserUpdatedInfo.surname,
                anotherUserUpdatedInfo.address,
                anotherUserUpdatedInfo.birthdate,
                anotherUserName))
                .rejects.toThrow(UnauthorizedUserError));

            expect(UserDAO.prototype.updateUserInfo).toHaveBeenCalledTimes(0);
        });
    });
})

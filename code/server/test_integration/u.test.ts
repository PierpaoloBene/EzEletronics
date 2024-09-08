import { describe, test, expect, beforeAll, afterAll } from "@jest/globals"
import request from 'supertest'
import { app } from "../index"
import { cleanup } from "../src/db/cleanup"
import { beforeEach, afterEach } from "node:test"
import UserController from "../src/controllers/userController"
import exp from "node:constants"

const routePath = "/ezelectronics" //Base route path for the API

//Default user information. We use them to create users and evaluate the returned values
const customer = { username: "customer", name: "customer", surname: "customer", password: "customer", role: "Customer" }
const manager = { username: "manager", name: "manager", surname: "manager", password: "manager", role: "Manager" }
const admin = { username: "admin", name: "admin", surname: "admin", password: "admin", role: "Admin" }
//Cookies for the users. We use them to keep users logged in. Creating them once and saving them in a variables outside of the tests will make cookies reusable
let customerCookie: string
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

//Before executing tests, we remove everything from our test database, create an Admin user and log in as Admin, saving the cookie in the corresponding variable
beforeAll(async () => {
    await cleanup()
    await postUser(admin)
    await postUser(manager)
    adminCookie = await login(admin)
    managerCookie = await login(manager)
})


//After executing tests, we remove everything from our test database
afterAll(async () => {
    await cleanup()
})

//A 'describe' block is a way to group tests. It can be used to group tests that are related to the same functionality
//In this example, tests are for the user routes
//Inner 'describe' blocks define tests for each route
describe("User routes integration tests", () => {

    describe("POST /users", () => {
        //A 'test' block is a single test. It should be a single logical unit of testing for a specific functionality and use case (e.g. correct behavior, error handling, authentication checks)
        test("It should return a 200 success code and create a new user", async () => {
            //A 'request' function is used to send a request to the server. It is similar to the 'fetch' function in the browser
            //It executes an API call to the specified route, similarly to how the client does it
            //It is an actual call, with no mocking, so it tests the real behavior of the server
            //Route calls are asynchronous operations, so we need to use 'await' to wait for the response
            await request(app)
                .post(`${routePath}/users`) //The route path is specified here. Other operation types can be defined with similar blocks (e.g. 'get', 'patch', 'delete'). Route and query parameters can be added to the path
                .send(customer) //In case of a POST request, the data is sent in the body of the request. It is specified with the 'send' block. The data sent should be consistent with the API specifications in terms of names and types
                .expect(200) //The 'expect' block is used to check the response status code. We expect a 200 status code for a successful operation

            //After the request is sent, we can add additional checks to verify the operation, since we need to be sure that the user is present in the database
            //A possible way is retrieving all users and looking for the user we just created.
            const users = await request(app) //It is possible to assign the response to a variable and use it later. 
                .get(`${routePath}/users`)
                .set("Cookie", adminCookie) //Authentication is specified with the 'set' block. Adding a cookie to the request will allow authentication (if the cookie has been created with the correct login route). Without this cookie, the request will be unauthorized
                .expect(200)
            expect(users.body).toHaveLength(3) //Since we know that the database was empty at the beginning of our tests and we created two users (an Admin before starting and a Customer in this test), the array should contain only two users
            let cust = users.body.find((user: any) => user.username === customer.username) //We look for the user we created in the array of users
            expect(cust).toBeDefined() //We expect the user we have created to exist in the array. The parameter should also be equal to those we have sent
            expect(cust.name).toBe(customer.name)
            expect(cust.surname).toBe(customer.surname)
            expect(cust.role).toBe(customer.role)
        })

        //Tests for error conditions can be added in separate 'test' blocks.
        //We can group together tests for the same condition, no need to create a test for each body parameter, for example
        test("It should return a 422 error code if at least one request body parameter is empty/missing", async () => {
            await request(app)
                .post(`${routePath}/users`)
                .send({ username: "", name: "test", surname: "test", password: "test", role: "Customer" }) //We send a request with an empty username. The express-validator checks will catch this and return a 422 error code
                .expect(422)
            await request(app).post(`${routePath}/users`).send({ username: "test", name: "", surname: "test", password: "test", role: "Customer" }).expect(422) //We can repeat the call for the remaining body parameters
            await request(app).post(`${routePath}/users`).send({ username: "test", name: "test", surname: "", password: "test", role: "Customer" }).expect(422) //We can repeat the call for the remaining body parameters
            await request(app).post(`${routePath}/users`).send({ username: "test", name: "test", surname: "test", password: "", role: "Customer" }).expect(422) //We can repeat the call for the remaining body parameters
            await request(app).post(`${routePath}/users`).send({ username: "test", name: "test", surname: "test", password: "test", role: "" }).expect(422) //We can repeat the call for the remaining body parameters
            await request(app).post(`${routePath}/users`).send({ username: "test", name: "test", surname: "test", password: "test", role: "Invalid" }).expect(422) //We can repeat the call for the remaining body parameters
        })

        test("It should return a 409 is the user is already in the database", async () => {
            await request(app)
                .post(`${routePath}/users`)
                .send(admin)
                .expect(409)
        });
    });
    
    describe("GET /users", () => {
        test("It should return an array of users", async () => {
            const users = await request(app).get(`${routePath}/users`)
                .set("Cookie", adminCookie)
                .expect(200)
            expect(users.body).toHaveLength(3)
            let cust = users.body.find((user: any) => user.username === customer.username)
            expect(cust).toBeDefined()
            expect(cust.name).toBe(customer.name)
            expect(cust.surname).toBe(customer.surname)
            expect(cust.role).toBe(customer.role)
            let adm = users.body.find((user: any) => user.username === admin.username)
            expect(adm).toBeDefined()
            expect(adm.name).toBe(admin.name)
            expect(adm.surname).toBe(admin.surname)
            expect(adm.role).toBe(admin.role)
            let man = users.body.find((user: any) => user.username === manager.username)
            expect(man).toBeDefined()
            expect(man.name).toBe(man.name)
            expect(man.surname).toBe(man.surname)
            expect(man.role).toBe(man.role)
        })

        test("It should return a 401 error code if the user is not an Admin", async () => {
            customerCookie = await login(customer)
            await request(app).get(`${routePath}/users`).set("Cookie", customerCookie).expect(401) //We call the same route but with the customer cookie. The 'expect' block must be changed to validate the error
            await request(app).get(`${routePath}/users`).expect(401) //We can also call the route without any cookie. The result should be the same
        })
    });

    describe("GET /users/roles/:role", () => {
        test("It should return an array of users with a specific role", async () => {
            //Route parameters are set in this way by placing directly the value in the path
            //It is not possible to send an empty value for the role (/users/roles/ will not be recognized as an existing route, it will return 404)
            //Empty route parameters cannot be tested in this way, but there should be a validation block for them in the route
            const admins = await request(app).get(`${routePath}/users/roles/Admin`)
                .set("Cookie", adminCookie)
                .expect(200)
            expect(admins.body).toHaveLength(1) //In this case, we expect only one Admin user to be returned
            let adm = admins.body[0]
            expect(adm.username).toBe(admin.username)
            expect(adm.name).toBe(admin.name)
            expect(adm.surname).toBe(admin.surname)

            const customers = await request(app).get(`${routePath}/users/roles/Customer`).set("Cookie", adminCookie).expect(200)
            expect(customers.body).toHaveLength(1) //In this case, we expect only one Admin user to be returned
            let cus = customers.body[0]
            expect(cus.username).toBe(customer.username)
            expect(cus.name).toBe(customer.name)
            expect(cus.surname).toBe(customer.surname)

            const managers = await request(app).get(`${routePath}/users/roles/Manager`).set("Cookie", adminCookie).expect(200)
            expect(managers.body).toHaveLength(1) //In this case, we expect only one Admin user to be returned
            let man = managers.body[0]
            expect(man.username).toBe(manager.username)
            expect(man.name).toBe(manager.name)
            expect(man.surname).toBe(manager.surname)
        })

        test("It should fail if the role is not valid", async () => {
            //Invalid route parameters can be sent and tested in this way. The 'expect' block should contain the corresponding code
            await request(app).get(`${routePath}/users/roles/Invalid`).set("Cookie", adminCookie).expect(422)
            await request(app).get(`${routePath}/users/roles/Invalid`).expect(422) // calling without any cookie
        })
    });

    describe("GET /users/:username", () => {
        test("It should return the specified user" ,async () => {
            const response = await request(app).get(`${routePath}/users/${customer.username}`).set("Cookie", adminCookie).expect(200)
            let user = response.body
            expect(user.username).toBe(customer.username)
            expect(user.name).toBe(customer.name)
            expect(user.surname).toBe(customer.surname) 
            expect(user.birthdate).toBe(null)
            expect(user.address).toBe(null)
            expect(user.role).toBe("Customer")
        });

        test("It should return error 404" ,async () => {
            await request(app).get(`${routePath}/users/unknownUser`).set("Cookie", adminCookie).expect(404)
        });

        test("It should return error 401" ,async () => {
            await request(app).get(`${routePath}/users/${admin.username}`).set("Cookie", managerCookie).expect(401)
        }); 

    });

    describe("PATCH /users/username", () => {

        const newAdminInfo = {name: "newA", surname: "newA", address: "newA", birthdate: "2000-10-09"}
        const newCustomerInfo = {name: "newC", surname: "newC", address: "newC", birthdate: "1985-01-01"}
        const newManagerInfo = {name: "newM", surname: "newM", address: "newM", birthdate: "1999-02-02"}

        test("Should update the specified user", async () => {

            // admin updates themselves
            await request(app).patch(`${routePath}/users/${admin.username}`).set("Cookie", adminCookie).send(newAdminInfo).expect(200)

            // customer updates themselves            
            await request(app).patch(`${routePath}/users/${customer.username}`).set("Cookie", customerCookie).send(newCustomerInfo).expect(200)
        
            // manager updates themselves            
            await request(app).patch(`${routePath}/users/${manager.username}`).set("Cookie", managerCookie).send(newManagerInfo).expect(200)

            // returns the db to the original state
            await cleanup()
            await postUser(admin)
            await postUser(manager)
            await postUser(customer)
            adminCookie = await login(admin)
            managerCookie = await login(manager)
            customerCookie = await login(customer)
        });

        test("Should return 400 when birthdate is after the current date", async () => {
           
            const newAdminInfoWrongBirthdate = {name: "newA", surname: "newA", address: "newA", birthdate: "2100-01-01"}
            const myPath = `${routePath}/users/${admin.username}`;
            const response = await request(app).patch(myPath).set("Cookie", adminCookie).send(newAdminInfoWrongBirthdate)
            expect(response.status).toBe(400)
        })

        test("Should return 404 when patching a non existing user", async () => {
           
            const response = await request(app).patch(`${routePath}/users/unknownUser`).set("Cookie", adminCookie).send(newCustomerInfo)
            expect(response.status).toBe(404)
        });
    });

    describe("DELETE /users/:username", () => {
        
        test("It should delete the specified user" ,async () => {

            // registers the new user that will be deleted
            let toBeDeleted = {username: "user", name: "user", surname: "user", password: "user", role: "Customer" }
            await request(app)
                .post(`${routePath}/users`) 
                .send(toBeDeleted) 
                .expect(200)

            await request(app).delete(`${routePath}/users/${toBeDeleted.username}`).set("Cookie", adminCookie).expect(200)

            await request(app).get(`${routePath}/users/${toBeDeleted.username}`).set("Cookie", adminCookie).expect(404)
        });

        test("It should return 404" ,async () => {

            await request(app).delete(`${routePath}/users/unknownUsername`).set("Cookie", adminCookie).expect(404)
        });

        test("It should return 401 when non admin attempts to delete other user" ,async () => {

            await request(app).delete(`${routePath}/users/${admin.username}`).set("Cookie", customerCookie).expect(401)
        });

        test("It should return 401 when admin attempts to delete another admin", async () => {

            // adds another admin to the db
            const adminToDelete = { username: "a2", name: "a2", surname: "a2", password: "a2", role: "Admin" }
            await postUser(adminToDelete)
            await request(app).delete(`${routePath}/users/${adminToDelete.username}`).set("Cookie", adminCookie).expect(401)

            // actually deletes user from db
            const adminToDeleteCookie = await login(adminToDelete)
            await request(app).delete(`${routePath}/users/${adminToDelete.username}`).set("Cookie", adminToDeleteCookie).expect(200)
        });
    });

    describe("DELETE /users", () => {

        test("It successfully deletes all non-admin users", async () => {

            let toBeDeletedCustomer = {username: "userCustomer", name: "user", surname: "user", password: "user", role: "Customer" }
            await request(app)
                .post(`${routePath}/users`) 
                .send(toBeDeletedCustomer) 
                .expect(200)

            let toBeDeletedManager = {username: "userManager", name: "user", surname: "user", password: "user", role: "Manager" }
            await request(app)
                    .post(`${routePath}/users`) 
                    .send(toBeDeletedManager) 
                    .expect(200)

            // calls the delete API
            await request(app).delete(`${routePath}/users`)
                .set("Cookie", adminCookie)
                .expect(200) 

            // checks that database contains only admins
            const response = await request(app)
                .get(`${routePath}/users`)
                .set("Cookie", adminCookie)
                .expect(200)


            const listOfUsers = response.body;
            expect(listOfUsers.every((user: { role: string }) => user.role === "Admin")).toBe(true)
        });

        test("It should return 401 when the caller isn't an admin", async () => {

            await request(app).delete(`${routePath}/users`).set("Cookie", customerCookie).expect(401)
        });
    });
})

describe("Access APIs integration tests", () => {

    const customerCredentials = {username: "customer", password: "customer"}
    const adminCredentials = {username: "admin", password: "admin"}
    const managerCredentials = {username: "manager", password: "manager"}

    describe("POST ezelectronics/sessions", () => {        

        test("It logs in the user", async () => {


            await cleanup()
            await postUser(admin)
            await postUser(manager)
            await postUser(customer)
            adminCookie = await login(admin)
            managerCookie = await login(manager)
            customerCookie = await login(customer)

            await request(app)
                .post(`${routePath}/sessions`)
                .send(customerCredentials)
                .expect(200) 

            await request(app)
                .post(`${routePath}/sessions`)
                .send(adminCredentials)
                .expect(200) 

            await request(app)
                .post(`${routePath}/sessions`)
                .send(managerCredentials)
                .expect(200)
        });

        test("Should return 401 when the username does not exist", async () => {

            const wrongCredentials = {username: "unknown", password: "customer"} 

            await request(app)
                .post(`${routePath}/sessions`)
                .send(wrongCredentials)
                .expect(401) 
        });

        test("Should return 401 when the password does not match", async () => {

            const wrongCredentials = {username: "manager", password: "customer"} 

            await request(app)
                .post(`${routePath}/sessions`)
                .send(wrongCredentials)
                .expect(401) 
        });
    });

    describe("GET ezelectronics/sessions/current", () => {

        test("It retrieves info regarding the logged in user", async () => {

            const responseCustomer = await request(app)
                .get(`${routePath}/sessions/current`)
                .set("Cookie", customerCookie)
                .expect(200)
            
            expect(responseCustomer.body.username).toBe(customer.username)
            expect(responseCustomer.body.name).toBe(customer.name)
            expect(responseCustomer.body.surname).toBe(customer.surname)
            expect(responseCustomer.body.role).toBe(customer.role)


            const response = await request(app)
                .get(`${routePath}/sessions/current`)
                .set("Cookie", adminCookie)
                .expect(200)
            
            expect(response.body.username).toBe(admin.username)
            expect(response.body.name).toBe(admin.name)
            expect(response.body.surname).toBe(admin.surname)
            expect(response.body.role).toBe(admin.role)
        });

        test("Should return 401 if the caller is not logged in", async () => {

            await request(app)
                .get(`${routePath}/sessions/current`)
                .expect(401)  
        });
    });
    

    describe("DELETE ezelectronics/sessions/current", () => {

        test("successfully logs out", async () => {
 
             await request(app)
                 .delete(`${routePath}/sessions/current`)
                 .set("Cookie", customerCookie)
                 .expect(200)
 
             await request(app)
                 .delete(`${routePath}/sessions/current`)
                 .set("Cookie", adminCookie)
                 .expect(200)
 
             await request(app)
                 .delete(`${routePath}/sessions/current`)
                 .set("Cookie", managerCookie)
                 .expect(200)
        }); 
 
        test("Should return 401 when the user is not logged in", async () => {
 
            await request(app)
                 .delete(`${routePath}/sessions/current`)
                 .expect(401)
        });
     });
 
});

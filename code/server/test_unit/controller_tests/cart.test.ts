import { describe, test, expect, beforeAll, jest } from "@jest/globals"
import CartController from "../../src/controllers/cartController"
import CartDAO from "../../src/dao/cartDAO"
import { User, Role } from "../../src/components/user";
import { Cart, ProductInCart } from "../../src/components/cart";
import { Category } from "../../src/components/product";


jest.mock("../../src/dao/cartDAO")


describe("Calls from controller to DAO", () => {
    let cartController: CartController;
    const testUser = { //Define a test user object
        username: "test",
        name: "test",
        surname: "test",
        role: Role.CUSTOMER,
        address: "test",
        birthdate: "test"
    }
    const user = new User(testUser.username, testUser.name, testUser.surname, testUser.role, testUser.address, testUser.birthdate)
    const testModel = "test"
    const testCart1: Cart = new Cart("test", false, "", 0.0, []);
    const testProduct: ProductInCart = new ProductInCart(testModel, 1, Category.SMARTPHONE, 1000);

    beforeAll(() => {
        cartController = new CartController();
    });

    test("addToCart", async () => {


        jest.spyOn(CartDAO.prototype, "addToCart").mockResolvedValueOnce(true); //Mock the addToCart method of the DAO

        //Call the addToCart method of the controller
        const response = await cartController.addToCart(user, testModel);

        //Check if the addReview method of the DAO has been called once with the correct parameters
        expect(CartDAO.prototype.addToCart).toHaveBeenCalledTimes(1);
        expect(CartDAO.prototype.addToCart).toHaveBeenCalledWith(user.username, testModel)
        expect(response).toBe(true); //Check if the response is true
    });

    test("getCart", async () => {

        jest.spyOn(CartDAO.prototype, "getCart").mockResolvedValueOnce(testCart1);
        //Call the getCart method of the controller
        const response = await cartController.getCart(user);

        //Check if the getCart method of the DAO has been called once with the correct parameters
        expect(CartDAO.prototype.getCart).toHaveBeenCalledTimes(1);
        expect(CartDAO.prototype.getCart).toHaveBeenCalledWith(user.username)
        expect(response).toBe(testCart1);
    });
    test("checkoutCart", async () => {

        jest.spyOn(CartDAO.prototype, "checkoutCart").mockResolvedValueOnce(true);
        //Call the getCart method of the controller
        const response = await cartController.checkoutCart(user);

        //Check if the getCart method of the DAO has been called once with the correct parameters
        expect(CartDAO.prototype.checkoutCart).toHaveBeenCalledTimes(1);
        expect(CartDAO.prototype.checkoutCart).toHaveBeenCalledWith(user.username)
        expect(response).toBe(true);
    });
    test("getCustomerCarts", async () => {
        let arrayCarts: Cart[] = [];
        arrayCarts.push(testCart1);
        jest.spyOn(CartDAO.prototype, "getCustomerCarts").mockResolvedValueOnce(arrayCarts);
        //Call the getCart method of the controller
        const response = await cartController.getCustomerCarts(user);

        //Check if the getCart method of the DAO has been called once with the correct parameters
        expect(CartDAO.prototype.getCustomerCarts).toHaveBeenCalledTimes(1);
        expect(CartDAO.prototype.getCustomerCarts).toHaveBeenCalledWith(user.username)
        expect(response).toBe(arrayCarts);
    });
    test("removeProductFromCart", async () => {

        jest.spyOn(CartDAO.prototype, "removeProductFromCart").mockResolvedValueOnce(true);
        //Call the getCart method of the controller
        const response = await cartController.removeProductFromCart(user, testModel);

        //Check if the getCart method of the DAO has been called once with the correct parameters
        expect(CartDAO.prototype.removeProductFromCart).toHaveBeenCalledTimes(1);
        expect(CartDAO.prototype.removeProductFromCart).toHaveBeenCalledWith(user.username, testModel)
        expect(response).toBe(true); //Check if the response is true
    });
    test("clearCart", async () => {

        jest.spyOn(CartDAO.prototype, "clearCart").mockResolvedValueOnce(true);
        //Call the getCart method of the controller
        const response = await cartController.clearCart(user);

        //Check if the getCart method of the DAO has been called once with the correct parameters
        expect(CartDAO.prototype.clearCart).toHaveBeenCalledTimes(1);
        expect(CartDAO.prototype.clearCart).toHaveBeenCalledWith(user.username)
        expect(response).toBe(true); //Check if the response is true
    });
    test("deleteAllCarts", async () => {

        jest.spyOn(CartDAO.prototype, "deleteAllCarts").mockResolvedValueOnce(true);
        //Call the getCart method of the controller
        const response = await cartController.deleteAllCarts();

        //Check if the getCart method of the DAO has been called once with the correct parameters
        expect(CartDAO.prototype.deleteAllCarts).toHaveBeenCalledTimes(1);
        expect(CartDAO.prototype.deleteAllCarts).toHaveBeenCalledWith()
        expect(response).toBe(true); //Check if the response is true
    });
    test("getAllCarts", async () => {
        let arrayCarts: Cart[] = [];
        arrayCarts.push(testCart1);
        jest.spyOn(CartDAO.prototype, "getAllCarts").mockResolvedValueOnce(arrayCarts);
        //Call the getCart method of the controller
        const response = await cartController.getAllCarts();

        //Check if the getCart method of the DAO has been called once with the correct parameters
        expect(CartDAO.prototype.getAllCarts).toHaveBeenCalledTimes(1);
        expect(CartDAO.prototype.getAllCarts).toHaveBeenCalledWith()
        expect(response).toBe(arrayCarts);
    });

});

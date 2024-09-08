import { test, expect, jest } from "@jest/globals"
import UserController from "../../src/controllers/userController"
import ProductController from "../../src/controllers/productController";
import UserDAO from "../../src/dao/userDAO"
import ProductDAO from "../../src/dao/productDAO";
import { Category } from "../../src/components/product";

jest.mock("../../src/dao/userDAO")

//Example of a unit test for the createUser method of the UserController
//The test checks if the method returns true when the DAO method returns true
//The test also expects the DAO method to be called once with the correct parameters
describe("Product Controller unit tests", () => {

    describe("Register Products", () => {
        test("it Should return true", async () => {
            const testProduct = {
                model: "test",
                category: "test",
                quantity: 1,
                details: "test",
                sellingPrice: 1,
                arrivalDate: "test"
            }
            jest.spyOn(ProductDAO.prototype, "registerProducts").mockResolvedValueOnce(true);
            const controller = new ProductController();

            const response = await controller.registerProducts(testProduct.model, testProduct.category, testProduct.quantity, testProduct.details, testProduct.sellingPrice, testProduct.arrivalDate);

            expect(ProductDAO.prototype.registerProducts).toHaveBeenCalledTimes(1);
            expect(ProductDAO.prototype.registerProducts).toHaveBeenCalledWith(
                testProduct.model,
                testProduct.category,
                testProduct.quantity,
                testProduct.details,
                testProduct.sellingPrice,
                testProduct.arrivalDate
            );
            expect(response).toBe(true);

        })


    })

    describe("Change Product Quantity", () => {
        test("it Should return quantity", async () => {
            const testProduct = {
                model: "test",
                newQuantity: 1,
                changeDate: "test"
            }
            jest.spyOn(ProductDAO.prototype, "changeProductQuantity").mockResolvedValueOnce(1);
            const controller = new ProductController();

            const response = await controller.changeProductQuantity(testProduct.model, testProduct.newQuantity, testProduct.changeDate);

            expect(ProductDAO.prototype.changeProductQuantity).toHaveBeenCalledTimes(1);
            expect(ProductDAO.prototype.changeProductQuantity).toHaveBeenCalledWith(
                testProduct.model,
                testProduct.newQuantity,
                testProduct.changeDate
            );
            expect(response).toBe(1);


        })

    })


    describe("Sell Product", () => {
        test("it Should return true", async () => {
            const testProduct = {
                model: "test",
                quantity: 1,
                sellingDate: "test"
            }
            jest.spyOn(ProductDAO.prototype, "sellProduct").mockResolvedValueOnce(true);
            const controller = new ProductController();

            const response = await controller.sellProduct(testProduct.model, testProduct.quantity, testProduct.sellingDate);

            expect(ProductDAO.prototype.sellProduct).toHaveBeenCalledTimes(1);
            expect(ProductDAO.prototype.sellProduct).toHaveBeenCalledWith(
                testProduct.model,
                testProduct.quantity,
                testProduct.sellingDate
            );
            expect(response).toBe(true);

        })


    })

    describe("Get Product", () => {
        test("it Should return the product Object", async () => {

            const returnedProduct = {
                model: "test",
                category: Category.LAPTOP,
                quantity: 1,
                details: "test",
                sellingPrice: 1,
                arrivalDate: "test"
            }

            const grouping = "category"
            const category = "test"
            const model = "test"

            jest.spyOn(ProductDAO.prototype, "getProducts").mockResolvedValueOnce([returnedProduct]);
            const controller = new ProductController();

            const response = await controller.getProducts(grouping, category, model);

            expect(ProductDAO.prototype.getProducts).toHaveBeenCalledTimes(1);
            expect(ProductDAO.prototype.getProducts).toHaveBeenCalledWith(
                grouping,
                category,
                model,
                false
            );
            expect(response).toEqual([returnedProduct]);

        })

    })

    describe("Get Available Product", () => {
        test("it Should return the product Object", async () => {

            const returnedProduct = {
                model: "test",
                category: Category.LAPTOP,
                quantity: 1,
                details: "test",
                sellingPrice: 1,
                arrivalDate: "test"
            }

            const grouping = "category"
            const category = "test"
            const model = "test"

            jest.spyOn(ProductDAO.prototype, "getProducts").mockResolvedValueOnce([returnedProduct]);
            const controller = new ProductController();

            const response = await controller.getAvailableProducts(grouping, category, model);

            expect(ProductDAO.prototype.getProducts).toHaveBeenCalledTimes(2);
            expect(ProductDAO.prototype.getProducts).toHaveBeenCalledWith(
                grouping,
                category,
                model,
                true
            );
            expect(response).toEqual([returnedProduct]);

        })
    })

    describe("Delete All Product", () => {
        test("it Should return true", async () => {

            jest.spyOn(ProductDAO.prototype, "deleteAllProducts")
            const controller = new ProductController();

            const response = await controller.deleteAllProducts();

            expect(ProductDAO.prototype.deleteAllProducts).toHaveBeenCalledTimes(1);

            expect(response).toBe(true);

        })

        test("it Should return false if no products were deleted", async () => {
            jest.spyOn(ProductDAO.prototype, "deleteAllProducts").mockResolvedValueOnce(false); // Simulating no products deleted
            const controller = new ProductController();

            const response = await controller.deleteAllProducts();

            expect(response).toBe(false); // Expecting false because no products were deleted
        })
    })


    describe("Delete Product", () => {
        test("it Should return true", async () => {
            const model = "test"

            jest.spyOn(ProductDAO.prototype, "deleteProduct").mockResolvedValueOnce(true);
            const controller = new ProductController();

            const response = await controller.deleteProduct(model);

            expect(ProductDAO.prototype.deleteProduct).toHaveBeenCalledTimes(1);
            expect(ProductDAO.prototype.deleteProduct).toHaveBeenCalledWith(model);
            expect(response).toBe(true);

        })

        test("it Should return false if product does not exist", async () => {
            const nonexistentModel = "nonexistent"

            jest.spyOn(ProductDAO.prototype, "deleteProduct").mockResolvedValueOnce(false); // Simulating product not found
            const controller = new ProductController();

            const response = await controller.deleteProduct(nonexistentModel);

            expect(response).toBe(false); // Expecting false because product does not exist
        })
    })

})





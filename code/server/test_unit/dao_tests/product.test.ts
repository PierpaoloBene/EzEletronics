import ProductDAO from "../../src/dao/productDAO";
import { Database } from "sqlite3"
import db from "../../src/db/db";
import { EmptyProductStockError, LowProductStockError, ProductAlreadyExistsError, ProductNotFoundError } from "../../src/errors/productError";
import { DateError } from "../../src/utilities";
import { Category, Product } from "../../src/components/product";

describe("ProductDAO", () => {

    describe("registerProducts tests", () => {

        test("It should resolve true", async () => {
            const productDAO = new ProductDAO()
            const mockDBRun = jest.spyOn(db, "run").mockImplementation((_sql, _params, callback) => {
                callback(null)
                return {} as Database
            })
            const result = await productDAO.registerProducts("model", "category", 1, "details", 1, "arrivalDate")
            expect(result).toBe(true)
            mockDBRun.mockRestore()
        })

        test("It should reject with ProductAlreadyExistsError if the model already exists", async () => {
            const productDAO = new ProductDAO();
            const mockDBRun = jest.spyOn(db, "run").mockImplementation((_sql, _params, callback) => {
                const error = new Error("UNIQUE constraint failed: products.model");
                callback(error);
                return {} as Database;
            });
            await expect(productDAO.registerProducts("duplicateModel", "Laptop", 10, "details", 100, "2023-01-01")).rejects.toThrow(ProductAlreadyExistsError);
            mockDBRun.mockRestore();
        });

        test("It should reject with an error if the category is invalid", async () => {
            const productDAO = new ProductDAO();
            const mockDBRun = jest.spyOn(db, "run").mockImplementation((_sql, _params, callback) => {
                const error = new Error("SQLITE_CONSTRAINT: CHECK constraint failed: category");
                callback(error);
                return {} as Database;
            });
            await expect(productDAO.registerProducts("model", "InvalidCategory", 10, "details", 100, "2023-01-01")).rejects.toThrow("SQLITE_CONSTRAINT: CHECK constraint failed: category");
            mockDBRun.mockRestore();
        });


        test("It should reject with an error if the quantity is negative", async () => {
            const productDAO = new ProductDAO();
            const mockDBRun = jest.spyOn(db, "run").mockImplementation((_sql, _params, callback) => {
                const error = new Error("SQLITE_CONSTRAINT: CHECK constraint failed: quantity");
                callback(error);
                return {} as Database;
            });
            await expect(productDAO.registerProducts("model", "Laptop", -1, "details", 100, "2023-01-01")).rejects.toThrow("SQLITE_CONSTRAINT: CHECK constraint failed: quantity");
        });

        test("It should reject with an error if the sellingPrice is negative", async () => {
            const productDAO = new ProductDAO();
            const mockDBRun = jest.spyOn(db, "run").mockImplementation((_sql, _params, callback) => {
                const error = new Error("SQLITE_CONSTRAINT: CHECK constraint failed: sellingPrice");
                callback(error);
                return {} as Database;
            });
            await expect(productDAO.registerProducts("model", "Laptop", 10, "details", -100, "2023-01-01")).rejects.toThrow("SQLITE_CONSTRAINT: CHECK constraint failed: sellingPrice");
        });

        test("It should reject with DateError if the arrivalDate is in the future", async () => {
            const productDAO = new ProductDAO();
            await expect(productDAO.registerProducts("model", "Laptop", 10, "details", 100, "2100-01-01")).rejects.toThrow(DateError);
        });

        test("It should set arrivalDate to current date if null", async () => {
            const productDAO = new ProductDAO();
            const mockDBRun = jest.spyOn(db, "run").mockImplementation((_sql, _params, callback) => {
                callback(null);
                return {} as Database;
            });
            const result = await productDAO.registerProducts("model", "Laptop", 10, "details", 100, null);
            expect(result).toBe(true);
            const currentDate = new Date().toISOString().split('T')[0];
            expect(mockDBRun).toHaveBeenCalledWith(expect.anything(), expect.arrayContaining([expect.anything(), expect.anything(), expect.anything(), expect.anything(), expect.anything(), currentDate]), expect.anything());
            mockDBRun.mockRestore();
        });

        test("It should reject with error if there is a database error", async () => {
            const productDAO = new ProductDAO();
            const mockDBRun = jest.spyOn(db, "run").mockImplementation((_sql, _params, callback) => {
                const error = new Error("Database error");
                callback(error);
                return {} as Database;
            });
            await expect(productDAO.registerProducts("model", "Laptop", 10, "details", 100, "2023-01-01")).rejects.toThrow(Error);
            mockDBRun.mockRestore();
        });

        test("It should resolve true with null details", async () => {
            const productDAO = new ProductDAO();
            const mockDBRun = jest.spyOn(db, "run").mockImplementation((_sql, _params, callback) => {
                callback(null);
                return {} as Database;
            });
            const result = await productDAO.registerProducts("model", "Laptop", 10, null, 100, "2023-01-01");
            expect(result).toBe(true);
            mockDBRun.mockRestore();
        });

        
        test("It should set arrivalDate to current date if arrivalDate is null", async () => {
            const productDAO = new ProductDAO();
            const mockDBRun = jest.spyOn(db, "run").mockImplementation((sql, params, callback) => {
                callback(null);
                return {} as Database;
            });
            const result = await productDAO.registerProducts("model", "Laptop", 10, "details", 100, null);
            expect(result).toBe(true);
            const currentDate = new Date().toISOString().split('T')[0];
            expect(mockDBRun).toHaveBeenCalledWith(expect.anything(), expect.arrayContaining([expect.anything(), expect.anything(), expect.anything(), expect.anything(), expect.anything(), currentDate]), expect.anything());
            mockDBRun.mockRestore();
        });
        
        test("It should handle database insertion failure", async () => {
            const productDAO = new ProductDAO();
            const mockDBRun = jest.spyOn(db, "run").mockImplementation((_sql, _params, callback) => {
                const error = new Error("Database insertion failed");
                callback(error);
                return {} as Database;
            });
            await expect(productDAO.registerProducts("model", "Laptop", 10, "details", 100, "2023-01-01")).rejects.toThrow("Database insertion failed");
            mockDBRun.mockRestore();
        });


    })

    describe("changeProductQuantity tests", () => {

        test("It should resolve with the new total amount of products", async () => {
            const productDAO = new ProductDAO();
            const mockDBGet = jest.spyOn(db, "get").mockImplementation((_sql, _params, callback) => {
                return callback(null, { quantity: 10 });
            });
            const mockDBRun = jest.spyOn(db, "run").mockImplementation((_sql, _params, callback) => {
                callback.call({ changes: 1 }, null);
                return {} as Database;
            });
            const result = await productDAO.changeProductQuantity("model", 5, "2023-01-01");
            expect(result).toBe(15);
            mockDBGet.mockRestore();
            mockDBRun.mockRestore();
        });

        test("It should reject with ProductNotFoundError if the product is not found", async () => {
            const productDAO = new ProductDAO();
            const mockDBGet = jest.spyOn(db, "get").mockImplementation((_sql, _params, callback) => {
                return callback(null, null);
            });
            await expect(productDAO.changeProductQuantity("nonexistentModel", 5, "2023-01-01")).rejects.toThrow(ProductNotFoundError);
            mockDBGet.mockRestore();
        });

        test("It should reject with an error if the new quantity is negative", async () => {
            const productDAO = new ProductDAO();
            await expect(productDAO.changeProductQuantity("model", -5, "2023-01-01")).rejects.toThrow(Error);
        });

        test("It should reject with DateError if the changeDate is in the future", async () => {
            const productDAO = new ProductDAO();
            await expect(productDAO.changeProductQuantity("model", 5, "2100-01-01")).rejects.toThrow(DateError);
        });

        test("It should set changeDate to current date if null", async () => {
            const productDAO = new ProductDAO();
            const mockDBGet = jest.spyOn(db, "get").mockImplementation((_sql, _params, callback) => callback(null, { quantity: 10 }));
            const mockDBRun = jest.spyOn(db, "run").mockImplementation((_sql, _params, callback) => {
                callback.call({ changes: 1 }, null);
                return {} as Database;
            });
            const result = await productDAO.changeProductQuantity("model", 5, null);
            expect(result).toBe(15);
            const currentDate = new Date().toISOString().split('T')[0];
            expect(mockDBRun).toHaveBeenCalledWith(expect.anything(), expect.arrayContaining([expect.anything(), currentDate, expect.anything(), currentDate]), expect.anything());
            mockDBGet.mockRestore();
            mockDBRun.mockRestore();
        });

        test("It should reject with error if there is a database error during the select", async () => {
            const productDAO = new ProductDAO();
            const mockDBGet = jest.spyOn(db, "get").mockImplementation((_sql, _params, callback) => {
                const error = new Error("Database error");
                return callback(error, null);
            });
            await expect(productDAO.changeProductQuantity("model", 5, "2023-01-01")).rejects.toThrow("Database error");
            mockDBGet.mockRestore();
        });

        test("It should reject with error if there is a database error during the update", async () => {
            const productDAO = new ProductDAO();
            const mockDBGet = jest.spyOn(db, "get").mockImplementation((_sql, _params, callback) => {
                return callback(null, { quantity: 10 });
            });
            const mockDBRun = jest.spyOn(db, "run").mockImplementation((_sql, _params, callback) => {
                const error = new Error("Database error");
                callback.call({ changes: 0 }, error);
                return {} as Database;
            });
            await expect(productDAO.changeProductQuantity("model", 5, "2023-01-01")).rejects.toThrow("Database error");
            mockDBGet.mockRestore();
            mockDBRun.mockRestore();
        });

        test("It should reject with DateError if the changeDate is before the current arrivalDate", async () => {
            const productDAO = new ProductDAO();
            const mockDBGet = jest.spyOn(db, "get").mockImplementation((_sql, _params, callback) => {
                return callback(null, { quantity: 10 });
            });
            const mockDBRun = jest.spyOn(db, "run").mockImplementation((_sql, _params, callback) => {
                callback.call({ changes: 0 }, null);
                return {} as Database;
            });
            await expect(productDAO.changeProductQuantity("model", 5, "2000-01-01")).rejects.toThrow(DateError);
            mockDBGet.mockRestore();
            mockDBRun.mockRestore();
        });

        test("It should reject with ProductNotFoundError if model does not exist", async () => {
            const productDAO = new ProductDAO();
            const mockDBGet = jest.spyOn(db, "get").mockImplementation((_sql, _params, callback) => callback(null, null));
            await expect(productDAO.changeProductQuantity("nonexistentModel", 5, "2023-01-01")).rejects.toThrow(ProductNotFoundError);
            mockDBGet.mockRestore();
        });
        
        test("It should handle zero quantity change", async () => {
            const productDAO = new ProductDAO();
            const mockDBGet = jest.spyOn(db, "get").mockImplementation((_sql, _params, callback) => callback(null, { quantity: 10 }));
            const mockDBRun = jest.spyOn(db, "run").mockImplementation((_sql, _params, callback) => {
                callback.call({ changes: 1 }, null);
                return {} as Database;
            });
            const result = await productDAO.changeProductQuantity("model", 0, "2023-01-01");
            expect(result).toBe(10);
            mockDBGet.mockRestore();
            mockDBRun.mockRestore();
        });
        
        test("It should handle database update failure", async () => {
            const productDAO = new ProductDAO();
            const mockDBGet = jest.spyOn(db, "get").mockImplementation((_sql, _params, callback) => callback(null, { quantity: 10 }));
            const mockDBRun = jest.spyOn(db, "run").mockImplementation((_sql, _params, callback) => {
                const error = new Error("Database update failed");
                callback.call({ changes: 0 }, error);
                return {} as Database;
            });
            await expect(productDAO.changeProductQuantity("model", 5, "2023-01-01")).rejects.toThrow("Database update failed");
            mockDBGet.mockRestore();
            mockDBRun.mockRestore();
        });
        




    })

    describe("sellProduct tests", () => {

        test("It should resolve true when the product is successfully sold", async () => {
            const productDAO = new ProductDAO();
            const mockDBGet = jest.spyOn(db, "get").mockImplementation((_sql, _params, callback) => callback(null, { quantity: 10, arrivalDate: "2023-01-01" }));
            const mockDBRun = jest.spyOn(db, "run").mockImplementation((_sql, _params, callback) => {
                callback.call({ changes: 1 }, null);
                return {} as Database;
            });
            const result = await productDAO.sellProduct("model", 5, "2023-01-02");
            expect(result).toBe(true);
            mockDBGet.mockRestore();
            mockDBRun.mockRestore();
        });

        test("It should reject with ProductNotFoundError if the product is not found", async () => {
            const productDAO = new ProductDAO();
            const mockDBGet = jest.spyOn(db, "get").mockImplementation((_sql, _params, callback) => callback(null, null));
            await expect(productDAO.sellProduct("nonexistentModel", 5, "2023-01-02")).rejects.toThrow(ProductNotFoundError);
            mockDBGet.mockRestore();
        });

        test("It should reject with EmptyProductStockError if the product is out of stock", async () => {
            const productDAO = new ProductDAO();
            const mockDBGet = jest.spyOn(db, "get").mockImplementation((_sql, _params, callback) => callback(null, { quantity: 0, arrivalDate: "2023-01-01" }));
            await expect(productDAO.sellProduct("model", 5, "2023-01-02")).rejects.toThrow(EmptyProductStockError);
            mockDBGet.mockRestore();
        });

        test("It should reject with LowProductStockError if the quantity in stock is lower than the amount requested", async () => {
            const productDAO = new ProductDAO();
            const mockDBGet = jest.spyOn(db, "get").mockImplementation((_sql, _params, callback) => callback(null, { quantity: 3, arrivalDate: "2023-01-01" }));
            await expect(productDAO.sellProduct("model", 5, "2023-01-02")).rejects.toThrow(LowProductStockError);
            mockDBGet.mockRestore();
        });

        test("It should reject with DateError if the sellingDate is in the future", async () => {
            const productDAO = new ProductDAO();
            await expect(productDAO.sellProduct("model", 5, "2100-01-01")).rejects.toThrow(DateError);
        });

        test("It should set sellingDate to current date if null", async () => {
            const productDAO = new ProductDAO();
            const mockDBGet = jest.spyOn(db, "get").mockImplementation((_sql, _params, callback) => callback(null, { quantity: 10, arrivalDate: "2023-01-01" }));
            const mockDBRun = jest.spyOn(db, "run").mockImplementation((_sql, _params, callback) => {
                callback.call({ changes: 1 }, null);
                return {} as Database;
            });
            const result = await productDAO.sellProduct("model", 5, null);
            expect(result).toBe(true);
            const currentDate = new Date().toISOString().split('T')[0];
            expect(mockDBRun).toHaveBeenCalledWith(expect.anything(), expect.arrayContaining([5, "model"]), expect.anything());
            mockDBGet.mockRestore();
            mockDBRun.mockRestore();
        });

        test("It should reject with DateError if the sellingDate is before the arrivalDate", async () => {
            const productDAO = new ProductDAO();
            const mockDBGet = jest.spyOn(db, "get").mockImplementation((_sql, _params, callback) => callback(null, { quantity: 10, arrivalDate: "2023-01-10" }));
            await expect(productDAO.sellProduct("model", 5, "2023-01-01")).rejects.toThrow(DateError);
            mockDBGet.mockRestore();
        });

        test("It should reject with error if there is a database error during the select", async () => {
            const productDAO = new ProductDAO();
            const mockDBGet = jest.spyOn(db, "get").mockImplementation((sql, params, callback) => {
                const error = new Error("Database error");
                return callback(error, null);
            });
            await expect(productDAO.sellProduct("model", 5, "2023-01-02")).rejects.toThrow("Database error");
            mockDBGet.mockRestore();
        });

        test("It should reject with error if there is a database error during the update", async () => {
            const productDAO = new ProductDAO();
            const mockDBGet = jest.spyOn(db, "get").mockImplementation((sql, params, callback) => callback(null, { quantity: 10, arrivalDate: "2023-01-01" }));
            const mockDBRun = jest.spyOn(db, "run").mockImplementation((sql, params, callback) => {
                const error = new Error("Database error");
                callback.call({ changes: 0 }, error);
                return {} as Database;
            });
            await expect(productDAO.sellProduct("model", 5, "2023-01-02")).rejects.toThrow("Database error");
            mockDBGet.mockRestore();
            mockDBRun.mockRestore();
        });

        test("It should reject with EmptyProductStockError if product is out of stock", async () => {
            const productDAO = new ProductDAO();
            const mockDBGet = jest.spyOn(db, "get").mockImplementation((_sql, _params, callback) => callback(null, { quantity: 0, arrivalDate: "2023-01-01" }));
            await expect(productDAO.sellProduct("model", 5, "2023-01-02")).rejects.toThrow(EmptyProductStockError);
            mockDBGet.mockRestore();
        });
        
        test("It should reject with LowProductStockError if quantity in stock is lower than requested", async () => {
            const productDAO = new ProductDAO();
            const mockDBGet = jest.spyOn(db, "get").mockImplementation((_sql, _params, callback) => callback(null, { quantity: 3, arrivalDate: "2023-01-01" }));
            await expect(productDAO.sellProduct("model", 5, "2023-01-02")).rejects.toThrow(LowProductStockError);
            mockDBGet.mockRestore();
        });
        
        test("It should handle database update failure during product sale", async () => {
            const productDAO = new ProductDAO();
            const mockDBGet = jest.spyOn(db, "get").mockImplementation((_sql, _params, callback) => callback(null, { quantity: 10, arrivalDate: "2023-01-01" }));
            const mockDBRun = jest.spyOn(db, "run").mockImplementation((_sql, _params, callback) => {
                const error = new Error("Database update failed");
                callback.call({ changes: 0 }, error);
                return {} as Database;
            });
            await expect(productDAO.sellProduct("model", 5, "2023-01-02")).rejects.toThrow("Database update failed");
            mockDBGet.mockRestore();
            mockDBRun.mockRestore();
        });
        


    })

    describe("getProduct tests", () => {
        test("It should resolve with all products when no grouping and no availability filter are provided", async () => {
            const productDAO = new ProductDAO();
            const mockDBAll = jest.spyOn(db, "all").mockImplementation((sql, params, callback) => callback(null, [
                { sellingPrice: 100, model: "model1", category: "Smartphone", arrivalDate: "2023-01-01", details: null, quantity: 10 },
                { sellingPrice: 200, model: "model2", category: "Laptop", arrivalDate: "2023-01-02", details: "details", quantity: 5 }
            ]));
            const result = await productDAO.getProducts(null, null, null, false);
            expect(result).toEqual([
                new Product(100, "model1", Category.SMARTPHONE, "2023-01-01", "", 10),
                new Product(200, "model2", Category.LAPTOP, "2023-01-02", "details", 5)
            ]);
            mockDBAll.mockRestore();
        });

        test("It should resolve with available products of a specific category", async () => {
            const productDAO = new ProductDAO();
            const mockDBAll = jest.spyOn(db, "all").mockImplementation((sql, params, callback) => callback(null, [
                { sellingPrice: 100, model: "model1", category: "Smartphone", arrivalDate: "2023-01-01", details: null, quantity: 10 }
            ]));
            const result = await productDAO.getProducts("category", "Smartphone", null, true);
            expect(result).toEqual([
                new Product(100, "model1", Category.SMARTPHONE, "2023-01-01", "", 10)
            ]);
            mockDBAll.mockRestore();
        });

        test("It should resolve with the specific model's available product", async () => {
            const productDAO = new ProductDAO();
            const mockDBAll = jest.spyOn(db, "all").mockImplementation((sql, params, callback) => callback(null, [
                { sellingPrice: 100, model: "model1", category: "Smartphone", arrivalDate: "2023-01-01", details: null, quantity: 10 }
            ]));
            const result = await productDAO.getProducts("model", null, "model1", true);
            expect(result).toEqual([
                new Product(100, "model1", Category.SMARTPHONE, "2023-01-01", "", 10)
            ]);
            mockDBAll.mockRestore();
        });

        test("It should reject with ProductNotFoundError if the model is not found", async () => {
            const productDAO = new ProductDAO();
            const mockDBAll = jest.spyOn(db, "all").mockImplementation((sql, params, callback) => callback(null, []));
            await expect(productDAO.getProducts("model", null, "nonexistentModel", true)).rejects.toThrow(ProductNotFoundError);
            mockDBAll.mockRestore();
        });

        test("It should reject with an error if an invalid category is provided", async () => {
            const productDAO = new ProductDAO();
            await expect(productDAO.getProducts("category", "InvalidCategory", null, true)).rejects.toThrow(Error);
        });

        test("It should reject with an error if a null category is provided", async () => {
            const productDAO = new ProductDAO();
            await expect(productDAO.getProducts("category", null, null, true)).rejects.toThrow(Error);
        });
        test("It should reject with an error if there is a database error", async () => {
            const productDAO = new ProductDAO();
            const mockDBAll = jest.spyOn(db, "all").mockImplementation((sql, params, callback) => {
                const error = new Error("Database error");
                return callback(error, null);
            });
            await expect(productDAO.getProducts(null, null, null, false)).rejects.toThrow("Database error");
            mockDBAll.mockRestore();
        });

        test("It should resolve with only available products when availability filter is true", async () => {
            const productDAO = new ProductDAO();
            const mockDBAll = jest.spyOn(db, "all").mockImplementation((sql, params, callback) => callback(null, [
                { sellingPrice: 100, model: "model1", category: "Smartphone", arrivalDate: "2023-01-01", details: null, quantity: 10 }
            ]));
            const result = await productDAO.getProducts(null, null, null, true);
            expect(result).toEqual([
                new Product(100, "model1", Category.SMARTPHONE, "2023-01-01", "", 10)
            ]);
            mockDBAll.mockRestore();
        });

        test("It should reject with an error if an invalid grouping is provided", async () => {
            const productDAO = new ProductDAO();
            await expect(productDAO.getProducts("invalidGrouping", null, null, true)).rejects.toThrow(Error);
        });

        test("It should resolve with empty array if no products are found", async () => {
            const productDAO = new ProductDAO();
            const mockDBAll = jest.spyOn(db, "all").mockImplementation((_sql, _params, callback) => callback(null, []));
            const result = await productDAO.getProducts(null, null, null, false);
            expect(result).toEqual([]);
            mockDBAll.mockRestore();
        });
        
        test("It should reject with an error if an invalid grouping is provided", async () => {
            const productDAO = new ProductDAO();
            await expect(productDAO.getProducts("invalidGrouping", null, null, true)).rejects.toThrow(Error);
        });
        
    })

    describe("deleteAllProducts tests", () => {

        test("It should resolve true when all products are successfully deleted", async () => {
            const productDAO = new ProductDAO();
            const mockDBRun = jest.spyOn(db, "run").mockImplementation((sql, params, callback) => {
                callback(null);
                return {} as Database;
            });
            const result = await productDAO.deleteAllProducts();
            expect(result).toBe(true);
            mockDBRun.mockRestore();
        });

        test("It should reject with an error if there is a database error", async () => {
            const productDAO = new ProductDAO();
            const mockDBRun = jest.spyOn(db, "run").mockImplementation((sql, params, callback) => {
                const error = new Error("Database error");
                callback(error);
                return {} as Database;
            });
            await expect(productDAO.deleteAllProducts()).rejects.toThrow("Database error");
            mockDBRun.mockRestore();
        });

        test("It should reject with an error if there is a generic error", async () => {
            const productDAO = new ProductDAO();
            jest.spyOn(db, "run").mockImplementation(() => {
                throw new Error("Generic error");
            });
            await expect(productDAO.deleteAllProducts()).rejects.toThrow("Generic error");
        });

        test("It should call db.run with the correct SQL query", async () => {
            const productDAO = new ProductDAO();
            const mockDBRun = jest.spyOn(db, "run").mockImplementation((sql, params, callback) => {
                callback(null);
                return {} as Database;
            });
            await productDAO.deleteAllProducts();
            expect(mockDBRun).toHaveBeenCalledWith("DELETE FROM products", [], expect.any(Function));
            mockDBRun.mockRestore();
        });

        test("It should resolve true when all products are successfully deleted", async () => {
            const productDAO = new ProductDAO();
            const mockDBRun = jest.spyOn(db, "run").mockImplementation((sql, params, callback) => {
                callback(null);
                return {} as Database;
            });
            const result = await productDAO.deleteAllProducts();
            expect(result).toBe(true);
            mockDBRun.mockRestore();
        });
        
        test("It should call db.run with the correct SQL query", async () => {
            const productDAO = new ProductDAO();
            const mockDBRun = jest.spyOn(db, "run").mockImplementation((sql, params, callback) => {
                callback(null);
                return {} as Database;
            });
            await productDAO.deleteAllProducts();
            expect(mockDBRun).toHaveBeenCalledWith("DELETE FROM products", [], expect.any(Function));
            mockDBRun.mockRestore();
        });
        

    })

    describe("deleteProduct tests", () => {
        test("It should resolve true when a product is successfully deleted", async () => {
            const productDAO = new ProductDAO();
            const mockDBRun = jest.spyOn(db, "run").mockImplementation((sql, params, callback) => callback.call({ changes: 1 }, null));
            const result = await productDAO.deleteProduct("existingModel");
            expect(result).toBe(true);
            mockDBRun.mockRestore();
        });
        
        test("It should reject with ProductNotFoundError if the model does not exist", async () => {
            const productDAO = new ProductDAO();
            const mockDBRun = jest.spyOn(db, "run").mockImplementation((sql, params, callback) => callback.call({ changes: 0 }, null));
            await expect(productDAO.deleteProduct("nonexistentModel")).rejects.toThrow(ProductNotFoundError);
            mockDBRun.mockRestore();
        });
        
        test("It should reject with an error if there is a database error", async () => {
            const productDAO = new ProductDAO();
            const mockDBRun = jest.spyOn(db, "run").mockImplementation((sql, params, callback) => {
                const error = new Error("Database error");
                return callback.call({}, error);  // Passare l'errore come primo argomento di callback.call
            });
            await expect(productDAO.deleteProduct("model")).rejects.toThrow("Database error");
            mockDBRun.mockRestore();
        });
        
        test("It should reject with an error if there is a generic error", async () => {
            const productDAO = new ProductDAO();
            jest.spyOn(db, "run").mockImplementation(() => {
                throw new Error("Generic error");
            });
            await expect(productDAO.deleteProduct("model")).rejects.toThrow("Generic error");
        });
        
        test("It should call db.run with the correct SQL query and parameters", async () => {
            const productDAO = new ProductDAO();
            const mockDBRun = jest.spyOn(db, "run").mockImplementation((sql, params, callback) => callback.call({ changes: 1 }, null));
            await productDAO.deleteProduct("model");
            expect(mockDBRun).toHaveBeenCalledWith("DELETE FROM products WHERE model = ?", ["model"], expect.any(Function));
            mockDBRun.mockRestore();
        });
        
        test("It should reject with ProductNotFoundError if the model does not exist", async () => {
            const productDAO = new ProductDAO();
            const mockDBRun = jest.spyOn(db, "run").mockImplementation((sql, params, callback) => callback.call({ changes: 0 }, null));
            await expect(productDAO.deleteProduct("nonexistentModel")).rejects.toThrow(ProductNotFoundError);
            mockDBRun.mockRestore();
        });
        
        test("It should call db.run with the correct SQL query and parameters", async () => {
            const productDAO = new ProductDAO();
            const mockDBRun = jest.spyOn(db, "run").mockImplementation((sql, params, callback) => callback.call({ changes: 1 }, null));
            await productDAO.deleteProduct("model");
            expect(mockDBRun).toHaveBeenCalledWith("DELETE FROM products WHERE model = ?", ["model"], expect.any(Function));
            mockDBRun.mockRestore();
        });
        

    })
})
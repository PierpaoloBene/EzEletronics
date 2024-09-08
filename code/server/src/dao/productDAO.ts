import db from "../db/db"
import { Product } from "../components/product"

import { EmptyProductStockError, invalidGroupingError, LowProductStockError, ProductAlreadyExistsError, ProductNotFoundError } from "../errors/productError";
import { DateError } from "../utilities"
import { rejects } from "assert";
import { arrayBuffer } from "stream/consumers";

/**
 * A class that implements the interaction with the database for all product-related operations.
 * You are free to implement any method you need here, as long as the requirements are satisfied.
 */
class ProductDAO {


    /**
     * Registers a new product and saves its information in the database
     * @param model The model name. It must be unique.
     * @param category Must either be "Laptop", "Appliance" or "Smartphone"
     * @param quantity The quantity of the product to register
     * @param details An optional string
     * @param sellingPrice The price of a single unit of the product
     * @param arrivalDate The arrival date of the registered products
     * @returns A Promise that resolves to true if the procuct has been registered.
     */
    registerProducts(model: string, category: string, quantity: number, details: string | null, sellingPrice: number, arrivalDate: string | null): Promise<boolean> {
        return new Promise<boolean>((resolve, reject) => {
            try {
                // if arrivalDate is not null and is after the current date, throw a DateError
                if (arrivalDate && Date.parse(arrivalDate) > new Date().getTime()){
                    reject(new DateError());
                    return;
                }
                // if arrivalDate is null, sets it as the current date in the YYYY-MM-DD format
                if (!arrivalDate) {
                    arrivalDate = new Date().toISOString().split('T')[0];
                }
                const sql = "INSERT INTO products(model, category, quantity, details, sellingPrice, arrivalDate) VALUES(?, ?, ?, ?, ?, ?)"
                db.run(sql, [model, category, quantity, details, sellingPrice, arrivalDate], (err: Error | null) => {
                    if (err) {
                        if (err.message.includes("UNIQUE constraint failed: products.model")) reject(new ProductAlreadyExistsError);
                        reject(err);
                    }
                    resolve(true);
                })
            } catch (error) {
                reject(error);
            }

        })
    }

    /**
     * Updates the product quantity in the database
     * @param model The model name. It must be unique.
     * @param newQuantity The number of units to be added to the current quantity of products
     * @param changeDate The new arrival date
     * @returns A Promise that resolves to the new total amount of products.
     */
    changeProductQuantity(model: string, newQuantity: number, changeDate: string | null): Promise<number> {
        return new Promise<number>((resolve, reject) => {
            try {
                // if changeDate is not null and is after the current date, throw a DateError
                if (changeDate && Date.parse(changeDate) > new Date().getTime()){
                    reject(new DateError());
                    return;
                }
                // if changeDate is null, sets it as the current date in the YYYY-MM-DD format
                if (!changeDate) {
                    changeDate = new Date().toISOString().split('T')[0];
                }
                const checkModelSql = "SELECT * FROM products WHERE model = ?";
                db.get(checkModelSql, [model], (err: Error | null, row: any) => {
                    if (err) {
                        reject(err);
                        return;
                    }
                    // if this fails, it is because the product isn't found in the db 
                    if (!row) {
                        reject(new ProductNotFoundError());
                        return;
                    }
                    const oldQuantity = row.quantity;
                    const updateSql = "UPDATE products SET quantity = quantity + ? WHERE model = ? AND arrivalDate <= ?";
                    db.run(updateSql, [newQuantity, model, changeDate], function(err: Error | null) {
                        if (err) {
                            reject(err);
                            return;
                        }

                        // if nothing gets updated, it is because the old arrivalDate is greater than changeDate
                        if (this.changes === 0) {
                            reject(new DateError());
                            return;
                        }
                        const updatedQuantity: number = +oldQuantity + +newQuantity;
                        resolve(updatedQuantity)
                    })
                });
            } catch (error) {
                reject (error);
            }
        });
    }

    /**
     * Decrements the product quantity in the database by a given amount
     * @param model The model name. It must be unique.
     * @param quantity The number of units to subtract from the current amount of products
     * @param sellingDate The date of the sale
     * @returns A Promise that resolves to true if the sale is correctly processed.
     */
    sellProduct(model: string, quantity: number, sellingDate: string | null): Promise<boolean> {
        return new Promise<boolean>((resolve, reject) => {
            try {
                // if sellingDate is not null and is after the current date, throw a DateError
                if (sellingDate && Date.parse(sellingDate) > new Date().getTime()){
                    reject(new DateError());
                    return;
                }
                // if sellingDate is null, sets it as the current date in the YYYY-MM-DD format
                if (!sellingDate) {
                    sellingDate = new Date().toISOString().split('T')[0];
                }
                const checkModelSql = "SELECT * FROM products WHERE model = ?";
                db.get(checkModelSql, [model], (err: Error | null, row: any) => {
                    if (err) {
                        reject(err);
                        return;
                    }
                    // if this fails, it is because the product isn't found in the db 
                    if (!row) {
                        reject(new ProductNotFoundError());
                        return;
                    }
                    // the number of products in stock is lower than the amount requested
                    if (row.quantity === 0){
                         reject(new EmptyProductStockError());
                         return
                    }
                    if (row.quantity < quantity) {
                        reject(new LowProductStockError());
                        return;
                    }
                    // the sellingDate is before the arrivalDate
                    if (Date.parse(sellingDate) < Date.parse(row.arrivalDate)) {
                        reject(new DateError());
                        return;
                    }
                    const updateSql = "UPDATE products SET quantity = quantity - ? WHERE model = ?";
                    db.run(updateSql, [quantity, model], function(err: Error | null) {
                        if (err) {
                            reject(err);
                            return;
                        }

                        //const updatedQuantity: number = +oldQuantity + +newQuantity;
                        resolve(true)
                    })
                });

            } catch (error) {
                reject(error);
            }
        });
    } 


    /**
     * Returns the list of all products or a list of available products in the database, depending on the parameter `available`
     * @param grouping An optional string, if not null it must be either "category" or "model"
     * @param category An optional string, if grouping is "category", it must me one of "Smartphone", "Laptop" or "Appliance"
     * @param model An optional string, if grouping is "model", it must not be empty
     * @param available A boolean value, if true the method returns only the currentlny available products `quantity > 0`
     * @returns A Promise that resolves to a list containing the products in the database.
     */

    getProducts(grouping: string | null, category: string | null, model: string | null, available: boolean) {
        return new Promise<Product[]>((resolve, reject) => {
            try {

                // if no grouping was selected
                let sql: string;
                let params: any[] = [];

                if (!grouping) {
                    sql = "SELECT * from products" ;
                    //params = [];
                }
                // if grouping is category...
                else if (grouping === "category") {
                    if(category == null) {
                        reject(new invalidGroupingError());
                        return;
                    }
                    if(category !== "Smartphone" && category !== "Laptop" && category !== "Appliance") {
                        reject(new invalidGroupingError());
                        return;
                    }
                    sql = "SELECT * from products WHERE category = ?";
                    params = [category];   
                }
                // if grouping is model...
                else if (grouping === "model") {
                    sql = "SELECT * from products WHERE model = ?" ;
                    params = [model];
                }
                // if grouping is something else, throw error. This should be unreachable because of the check in productRoutes
                else {
                    reject(new Error());
                    return;
                }

                db.all(sql, params, (err: Error | null, rows: any) => {
                    if (err) {
                        reject(err);
                        return;
                    }
                    let products: Product[] = [];
                    // query was for a specific model but it was not found
                    if (rows.length == 0 && grouping === "model") {
                        reject(new ProductNotFoundError());
                        return;
                    }
                    if(available){
                      if(rows.filter((row: any) => row.quantity>0).length == 0){
                            resolve([]);
                            return;
                       }
                       rows.filter((row: any) => row.quantity>0).forEach((row: any) => {
                        // if details is null, set it as an empty string
                        if (!row.details) {
                                row.details = "";
                            }
                            // forse castare row.category all'enum Category
                            const prod = new Product(
                                row.sellingPrice,
                                row.model,
                                row.category,
                                row.arrivalDate,
                                row.details,
                                row.quantity
                            );
                                products.push(prod);
                       
                        });

                     }else{
                        rows.forEach((row: any) => {
                            // if details is null, set it as an empty string
                            if (!row.details) {
                                    row.details = "";
                                }
                                // forse castare row.category all'enum Category
                                const prod = new Product(
                                    row.sellingPrice,
                                    row.model,
                                    row.category,
                                    row.arrivalDate,
                                    row.details,
                                    row.quantity
                                );
                                    products.push(prod);
                           
                            });
                     }
                    

                    resolve(products);
                    return;
                });
            } catch (error) {
                reject(error);
            }
        });
    }

    /**
     * Deletes all the products from the database
     * @returns A Promise that resolves to `true` if the products have been successfully deleted.
     */
    deleteAllProducts() {
        return new Promise<boolean>((resolve, reject) => {
            try {
                const sql = "DELETE FROM products";
                db.run(sql, [], (err: Error | null) => {
                    if (err) {
                        reject(err);
                        return;
                    }
                    resolve(true);
                });
            } catch (error) {
                reject(error);
            }
        });
    }

    /**
     * Deletes a product with the specified model from the database
     * @param model The model of the product to be deleted from the db
     * @returns A Promise that resolves to `true` if the product has been successfully deleted.
     */
    deleteProduct(model: string) {
        return new Promise<boolean>((resolve, reject) => {
            try {
                const sql = "DELETE FROM products WHERE model = ?";
                db.run(sql, [model], function(err: Error | null) {
                    if (err) {
                        reject(err);
                        return;
                    }
                    // if nothing changed, this model does not exist in the db
                    if (this.changes === 0) {
                        reject(new ProductNotFoundError());
                        return;
                    }
                    resolve(true);
                });
            } catch (error) {
                reject(error);
            }
        });
    }
}

export default ProductDAO
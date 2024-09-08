import db from "../db/db"
import { Cart, ProductInCart, EmptyCart } from "../components/cart"
import { ProductEssential } from "../components/product"
import { ProductNotFoundError, EmptyProductStockError, LowProductStockError } from "../errors/productError"
import { CartNotFoundError, EmptyCartError, ProductNotInCartError } from "../errors/cartError"
import dayjs from "dayjs"
import utcPluginUtc from 'dayjs/plugin/utc.js';
dayjs.extend(utcPluginUtc);

/**
 * A class that implements the interaction with the database for all cart-related operations.
 * You are free to implement any method you need here, as long as the requirements are satisfied.
 */
class CartDAO {
    public getCartFromDB(username: string, unpaidOnly: boolean = true): Promise<any[]> {
        return new Promise<any[]>((resolve, reject) => {
            try {
                let sql =
                    `SELECT *
                     FROM cart
                     WHERE customer = ?`
                if (unpaidOnly) sql += ' AND paid = 0';
                db.get(sql, [username], (err: Error | null, row: any) => {
                    if (err) {
                        reject(err)
                    }
                    else if (!row) {
                        //customer's cart NOT found in cart table
                        resolve([null, null])
                    }
                    else {
                        //customer's cart found in cart table
                        const formattedTotal: number = parseFloat(row.total.toFixed(2)); //truncate real value read form db to 2 decimal digits
                        resolve([row.id, new Cart(row.customer, false, null, formattedTotal, [])])
                    }
                })
            } catch (error) {
                reject(error)
            }
        })
    }

    //NOTE: this function assumes that idCart exists in the db
    public getCartPopulatedFromDB(idCart: number, cartToPopulate: Cart): Promise<Cart> {
        return new Promise<Cart>((resolve, reject) => {
            try {
                const sql =
                    `SELECT *
                     FROM productInCart
                     WHERE cartId = ?`
                db.all(sql, [idCart], (err: Error | null, rows: any[]) => {
                    if (err) {
                        reject(err)
                    }
                    else if (rows.length === 0) {
                        //customer's cart has NO products
                        resolve(cartToPopulate)
                    }
                    else {
                        //customer's cart has at least one product
                        let products: ProductInCart[] = [];
                        for (const row of rows) {
                            products.push(new ProductInCart(row.model, row.quantity, row.category, row.price))
                        }
                        cartToPopulate.products = [...products]
                        resolve(cartToPopulate);
                    }
                })
            } catch (error) {
                reject(error);
            }
        })
    }

    //queries first cart table (promIdAndInfoCart), then productInCart table (promCart)
    //NOTE: the execution of db operations is sequential thanks to await statement
    getCart(username: string): Promise<Cart> {
        return new Promise<Cart>(async (resolve, reject) => {
            try {
                const [idCart, cart] = await this.getCartFromDB(username)

                if (idCart === null) {
                    resolve(new EmptyCart(username))
                }
                else {
                    const cartPopulated = await this.getCartPopulatedFromDB(idCart, cart)
                    resolve(cartPopulated)
                }
            } catch (error) {
                reject(error)
            }
        })
    }


    public getProductFromDB(model: string): Promise<ProductEssential> {
        return new Promise<ProductEssential>((resolve, reject) => {
            try {
                const sql =
                    `SELECT *
                     FROM products
                     WHERE model = ?`
                db.get(sql, [model], (err: Error | null, row: any) => {
                    if (err) {
                        reject(err)
                    }
                    else if (!row) {
                        //product NOT found in products table
                        reject(new ProductNotFoundError)
                    }
                    else {
                        //product found in products table4
                        resolve(new ProductEssential(row.sellingPrice, model, row.category, row.quantity))
                    }
                })
            } catch (error) {
                reject(error)
            }
        })
    }

    /*
    queries in the following order:
        1) products (promProd)
        2) cart (promIdCartAndProd_search + promIdCartAndProd_write)
        3) productInCart (promProdInCart_search + promProdInCart_write)
    NOTE: the execution of db operations is sequential thanks to chaining of promises
    */
    async addToCart(username: string, model: string): Promise<boolean> {
        try {
            // Ottieni il prodotto dal database
            const product = await this.getProductFromDB(model);

            // Verifica la quantità di prodotto disponibile
            if (product.quantity === 0) {
                throw new EmptyProductStockError();
            }

            // Ottieni il carrello non pagato dal database
            let [idCart, cart] = await this.getCartFromDB(username);

            if (idCart === null) {
                // Carrello non trovato, crea un nuovo carrello
                const insertCartSql =
                    `INSERT INTO cart(paid, paymentDate, total, customer)
                     VALUES(?, ?, ?, ?)`;
                const insertCartResult = await new Promise((resolve, reject) => {
                    db.run(insertCartSql, [false, null, product.sellingPrice, username], function (err: Error | null) {
                        if (err) {
                            reject(err);
                        } else {
                            resolve(this?.lastID || 1);
                        }
                    });
                });
                idCart = insertCartResult as number;
            } else {
                // Carrello trovato, aggiorna il totale
                await this.updateTotalCartInDB(idCart, product.sellingPrice);
            }

            // Verifica se il prodotto è già nel carrello
            const checkProductInCartSql =
                `SELECT *
                 FROM productInCart
                 WHERE cartId = ? AND model = ?`;
            const productInCartRow = await new Promise<any>((resolve, reject) => {
                db.get(checkProductInCartSql, [idCart, model], (err: Error | null, row: any) => {
                    if (err) {
                        reject(err);
                    } else {
                        resolve(row);
                    }
                });
            });

            if (!productInCartRow) {
                // Prodotto non presente nel carrello, inserisci il prodotto
                const insertProductInCartSql =
                    `INSERT INTO productInCart(cartId, model, quantity, category, price)
                     VALUES(?, ?, ?, ?, ?)`;
                await new Promise<void>((resolve, reject) => {
                    db.run(insertProductInCartSql, [idCart, product.model, 1, product.category, product.sellingPrice], (err: Error | null) => {
                        if (err) {
                            reject(err);
                        } else {
                            resolve();
                        }
                    });
                });
            } else {
                // Prodotto già presente nel carrello, aggiorna la quantità
                await this.updateByOneProductQntyCartInDB(model, idCart, true);
            }

            return true;
        } catch (error) {
            throw error;
        }
    }



    //NOTE: this function assumes that idCart exists in the db
    public checkCartToPayDB(idCart: number): Promise<ProductInCartQuantity[]> {
        return new Promise<ProductInCartQuantity[]>((resolve, reject) => {
            try {
                const sql =
                    `SELECT p.model AS model, p.quantity AS qntyStock, pin.quantity AS qntyReq
                     FROM products p, productInCart pin
                     WHERE p.model = pin.model AND cartId = ?`
                db.all(sql, [idCart], (err: Error | null, rows: any[]) => {
                    if (err) {
                        reject(err)
                    }
                    else if (rows.length === 0) {
                        //customer's cart has NO products
                        reject(new EmptyCartError)
                    }
                    else {
                        //customer's cart has at least one product
                        let productsQnty: ProductInCartQuantity[] = [];
                        for (const row of rows) {
                            if (row.qntyStock === 0) {
                                reject(new EmptyProductStockError)
                                return
                            }
                            if (row.qntyReq > row.qntyStock) {
                                reject(new LowProductStockError)
                                return
                            }
                            productsQnty.push(new ProductInCartQuantity(row.model, row.qntyReq))
                        }
                        resolve(productsQnty)
                    }
                })
            } catch (error) {
                reject(error)
            }
        })
    }

    //NOTE: this function assumes that idCart exists in the db
    public markSoldCartInDB(idCart: number): Promise<boolean> {
        return new Promise<boolean>((resolve, reject) => {
            try {
                const sql =
                    `UPDATE cart
                     SET paid = 1, paymentDate = ?
                     WHERE id = ?`
                const today: string = dayjs.utc().format("YYYY-MM-DD")
                db.run(sql, [today, idCart], (err: Error | null) => {
                    if (err) {
                        reject(err)
                    }
                    else {
                        resolve(true)
                    }
                })
            } catch (error) {
                reject(error)
            }
        })
    }

    //NOTE: this function assumes that model exists in the db
    public decrementProductQntyStockInDB(model: string, decr: number): Promise<boolean> {
        return new Promise<boolean>(async (resolve, reject) => {
            try {
                const sql =
                    `UPDATE products
                     SET quantity = quantity - ?
                     WHERE model = ?`
                db.run(sql, [decr, model], (err: Error | null) => {
                    if (err) {
                        reject(err)
                    }
                    else {
                        resolve(true)
                    }
                })
            }
            catch (error) {
                reject(error)
            }
        })
    }

    checkoutCart(username: string): Promise<boolean> {
        return new Promise<boolean>(async (resolve, reject) => {
            try {
                const [idCart, cart] = await this.getCartFromDB(username)

                if (idCart === null) {
                    reject(new CartNotFoundError)
                }
                else {
                    const productsQnty: ProductInCartQuantity[] = await this.checkCartToPayDB(idCart)
                    await this.markSoldCartInDB(idCart)
                    for (const prodQnty of productsQnty) {
                        await this.decrementProductQntyStockInDB(prodQnty.model, prodQnty.quantity)
                    }
                    resolve(true)
                }
            } catch (error) {
                reject(error)
            }
        })
    }


    public getCartsPaidFromDB(username: string): Promise<any[]> {
        return new Promise<any[]>((resolve, reject) => {
            try {
                const sql =
                    `SELECT *
                     FROM cart
                     WHERE customer = ? AND paid = 1`
                db.all(sql, [username], (err: Error | null, rows: any[]) => {
                    if (err) {
                        reject(err)
                    }
                    else if (rows.length === 0) {
                        //NO customer's paid cart found in cart table
                        resolve(null)
                    }
                    else {
                        //at least one customer's paid cart found in cart table
                        let idCartsAndInfo: any[] = []
                        for (const row of rows) {
                            const formattedTotal: number = parseFloat(row.total.toFixed(2)); //truncate real value read form db to 2 decimal digits
                            idCartsAndInfo.push({ id: row.id, cart: new Cart(row.customer, true, row.paymentDate, formattedTotal, []) })
                        }
                        resolve(idCartsAndInfo)
                    }
                })
            } catch (error) {
                reject(error)
            }
        })
    }

    getCustomerCarts(username: string): Promise<Cart[]> {
        return new Promise<Cart[]>(async (resolve, reject) => {
            try {
                const cartsNotPopulated: any[] = await this.getCartsPaidFromDB(username)

                if (cartsNotPopulated === null) {
                    resolve([])
                }
                else {
                    let cartsRis: Cart[] = []
                    for (const cartNP of cartsNotPopulated) {
                        const cartPopulated: Cart = await this.getCartPopulatedFromDB(cartNP.id, cartNP.cart)
                        cartsRis.push(cartPopulated)
                    }
                    resolve(cartsRis)
                }
            } catch (error) {
                reject(error)
            }
        })
    }


    //NOTE: this function assumes that model and idCart exist in the db
    public updateByOneProductQntyCartInDB(model: string, idCart: number, doIncrement: boolean): Promise<boolean> {
        return new Promise<boolean>((resolve, reject) => {
            try {
                const incrAmount: number = doIncrement ? 1 : -1
                const sql =
                    `UPDATE productInCart
                     SET quantity = quantity + ?
                     WHERE cartId = ? AND model = ?`
                db.run(sql, [incrAmount, idCart, model], (err: Error | null) => {
                    if (err) {
                        reject(err)
                    }
                    else {
                        resolve(true)
                    }
                })
            } catch (error) {
                reject(error)
            }
        })
    }

    //NOTE: this function assumes that model and idCart exist in the db
    public deleteProductReferenceFromCartInDB(model: string, idCart: number): Promise<boolean> {
        return new Promise<boolean>((resolve, reject) => {
            try {
                const sql =
                    `DELETE FROM productInCart
                     WHERE cartId = ? AND model = ?`
                db.run(sql, [idCart, model], (err: Error | null) => {
                    if (err) {
                        reject(err)
                    }
                    else {
                        resolve(true)
                    }
                })
            } catch (error) {
                reject(error)
            }
        })
    }

    //NOTE: this function assumes that idCart exists in the db
    public updateTotalCartInDB(idCart: number, amount: number) {
        return new Promise<boolean>((resolve, reject) => {
            try {
                const sql =
                    `UPDATE cart
                     SET total = total + ?
                     WHERE id = ?`
                db.run(sql, [amount, idCart], (err: Error | null) => {
                    if (err) {
                        reject(err)
                    }
                    else {
                        resolve(true)
                    }
                })
            } catch (error) {
                reject(error)
            }
        })
    }

    removeProductFromCart(username: string, model: string): Promise<boolean> {
        return new Promise<boolean>(async (resolve, reject) => {
            try {
                const prod: ProductEssential = await this.getProductFromDB(model)
                let [idCart, cart] = await this.getCartFromDB(username)

                if (idCart === null) {
                    reject(new CartNotFoundError)
                }
                cart = await this.getCartPopulatedFromDB(idCart, cart)
                if (cart.products.length === 0) {
                    reject(new EmptyCartError(true))
                    return
                }

                //search if product is in customer's cart
                let found: boolean = false
                let prodToRem: ProductInCart
                for (const prod of cart.products) {
                    if (prod.model === model) {
                        found = true
                        prodToRem = prod
                    }
                }
                if (!found) {
                    reject(new ProductNotInCartError)
                    return
                }

                if (prodToRem.quantity > 1) {
                    //decrement by 1 product's quantity in customer's cart
                    await this.updateByOneProductQntyCartInDB(model, idCart, false)
                }
                else {
                    //delete product in customer's cart
                    await this.deleteProductReferenceFromCartInDB(model, idCart)
                }

                await this.updateTotalCartInDB(idCart, - prod.sellingPrice)
                resolve(true)
            }
            catch (error) {
                reject(error)
            }
        })
    }


    //NOTE: this function assumes that idCart exists in the db
    public deleteAllProductReferenceFromCartInDB(idCart: number): Promise<boolean> {
        return new Promise<boolean>((resolve, reject) => {
            try {
                const sql =
                    `DELETE FROM productInCart
                     WHERE cartId = ?`
                db.run(sql, [idCart], (err: Error | null) => {
                    if (err) {
                        reject(err)
                    }
                    else {
                        resolve(true)
                    }
                })
            } catch (error) {
                reject(error)
            }
        })
    }

    clearCart(username: string): Promise<boolean> {
        return new Promise<boolean>(async (resolve, reject) => {
            try {
                let [idCart, cartToPopul] = await this.getCartFromDB(username)
                if (idCart === null) {
                    [idCart, cartToPopul] = await this.getCartFromDB(username, false)
                    if (idCart === null)
                        reject(new CartNotFoundError)
                    else
                        resolve(true);
                }
                else {
                    const cart = await this.getCartPopulatedFromDB(idCart, cartToPopul)
                    if (cart.products.length === 0) {
                        //customer's cart is already empty
                    }
                    else {
                        await this.updateTotalCartInDB(idCart, - (cart.total))
                        await this.deleteAllProductReferenceFromCartInDB(idCart)
                    }
                    resolve(true)
                }
            }
            catch (error) {
                reject(error)
            }

        })
    }


    public deleteAllProductsReferencesFromAllCartsInDB(): Promise<boolean> {
        return new Promise<boolean>((resolve, reject) => {
            try {
                const sql = "DELETE FROM productInCart"
                db.run(sql, (err: Error | null) => {
                    if (err) {
                        reject(err)
                    }
                    else {
                        resolve(true)
                    }
                })
            } catch (error) {
                reject(error)
            }
        })
    }

    public deleteAllCartsInDB(): Promise<boolean> {
        return new Promise<boolean>((resolve, reject) => {
            try {
                const sql = "DELETE FROM cart"
                db.run(sql, (err: Error | null) => {
                    if (err) {
                        reject(err)
                    }
                    else {
                        resolve(true)
                    }
                })
            } catch (error) {
                reject(error)
            }
        })
    }

    deleteAllCarts(): Promise<boolean> {
        return new Promise<boolean>(async (resolve, reject) => {
            try {
                await this.deleteAllProductsReferencesFromAllCartsInDB()
                await this.deleteAllCartsInDB()
                resolve(true)
            } catch (error) {
                reject(error)
            }
        })
    }


    public getCartsFromDB(): Promise<Cart[]> {
        return new Promise<Cart[]>(async (resolve, reject) => {
            try {
                const sql =
                    `SELECT *
                     FROM cart`
                db.all(sql, async (err: Error | null, rows: any[]) => {
                    if (err) {
                        reject(err)
                    }
                    if (rows.length === 0) {
                        //cart table is empty
                        resolve([])
                    }
                    else {
                        let carts: Cart[] = []
                        let cartNotPopulated: Cart
                        let cart: Cart
                        let formattedTotal: number
                        for (const row of rows) {
                            formattedTotal = parseFloat(row.total.toFixed(2)); //truncate real value read form db to 2 decimal digits
                            cartNotPopulated = new Cart(row.customer, row.paid ? true : false, row.paymentDate, formattedTotal, [])
                            cart = await this.getCartPopulatedFromDB(row.id, cartNotPopulated)
                            carts.push(cart)
                        }
                        resolve(carts)
                    }
                })
            } catch (error) {
                reject(error)
            }
        })
    }

    getAllCarts(): Promise<Cart[]> {
        return new Promise<Cart[]>(async (resolve, reject) => {
            try {
                const carts: Cart[] = await this.getCartsFromDB()
                resolve(carts)
            } catch (error) {
                reject(error)
            }
        })
    }
}


class ProductInCartQuantity {
    model: string
    quantity: number

    /**
     * Creates a new instance of the ProductQuantity class.
     * @param model - The model of the product.
     * @param quantity - The quantity (number of units) of the product in the cart.
     */
    constructor(model: string, quantity: number) {
        this.model = model
        this.quantity = quantity
    }
}

export default CartDAO
export { ProductInCartQuantity }
import { describe, test, expect, beforeAll, afterAll, jest, beforeEach, afterEach, it } from "@jest/globals"

import db from "../../src/db/db"
import { Database } from "sqlite3"
import CartDAO, { ProductInCartQuantity } from "../../src/dao/cartDAO" // importazione del modulo CartDAO
import { Cart, EmptyCart, ProductInCart } from "../../src/components/cart";
import { Category, Product, ProductEssential } from "../../src/components/product";
import { EmptyProductStockError, LowProductStockError, ProductNotFoundError } from "../../src/errors/productError";
import { CartNotFoundError, EmptyCartError, ProductNotInCartError } from "../../src/errors/cartError";
import { error } from "console";
import dayjs from "dayjs";


jest.mock("../../src/db/db.ts")

describe('getCart', () => {
    let cartDAO = new CartDAO();

    beforeEach(() => {
        cartDAO = new CartDAO();
    });

    afterEach(() => {
        jest.restoreAllMocks();  // Ripristina tutti i mock dopo ogni test
    });

    it('Should return an empty cart if no unpaid cart is found for the user', async () => {
        jest.spyOn(db, 'get').mockImplementation((sql, params, callback) => {
            callback(null, null);  // Simula la risposta per nessun carrello trovato
            return {} as Database
        });

        const result = await cartDAO.getCart('username');
        expect(result).toBeInstanceOf(EmptyCart);
        expect(result.customer).toBe('username');
    });

    it('Should return an empty cart if there is an unpaid cart with no products.', async () => {
        jest.spyOn(db, 'get').mockImplementation((sql, params, callback) => {
            callback(null, { id: 1, customer: 'username', total: 0 });  // Simula la risposta per un carrello trovato
            return {} as Database
        });

        jest.spyOn(db, 'all').mockImplementation((sql, params, callback) => {
            callback(null, []);  // Simula la risposta per nessun prodotto nel carrello
            return {} as Database
        });

        const result = await cartDAO.getCart('username');
        expect(result).toBeInstanceOf(Cart);
        expect(result.customer).toBe('username');
        expect(result.paid).toBe(false);
        expect(result.paymentDate).toBeNull();
        expect(result.total).toBe(0);
        expect(result.products).toEqual([]);

    });
    it('Should return a populated cart if cart and products are found', async () => {
        jest.spyOn(db, 'get').mockImplementation((_sql, params, callback) => {
            callback(null, { id: 1, customer: 'username', total: 10.0 });  // Simula la risposta per un carrello trovato
            return {} as Database
        });

        jest.spyOn(db, 'all').mockImplementation((sql, params, callback) => {
            callback(null, [
                { model: 'model1', quantity: 1, category: Category.SMARTPHONE, price: 5.0 },
                { model: 'model2', quantity: 2, category: Category.APPLIANCE, price: 2.5 }
            ]);  // Simula la risposta per prodotti nel carrello
            return {} as Database
        });

        const result = await cartDAO.getCart('username');
        expect(result).toBeInstanceOf(Cart);
        expect(result.customer).toBe('username');
        expect(result.products.length).toBe(2);
        expect(result.products[0]).toEqual(new ProductInCart('model1', 1, Category.SMARTPHONE, 5.0));
        expect(result.products[1]).toEqual(new ProductInCart('model2', 2, Category.APPLIANCE, 2.5));
        expect(result.total).toBe(10.0);  // 1*5.0 + 2*2.5 = 10.0
    });

    it('Db error in getCart', async () => {
        jest.spyOn(db, 'get').mockImplementationOnce((sql, params, callback) => {
            callback(new Error('DB error'), null);  // Simula un errore del database
            return {} as Database
        });

        await expect(cartDAO.getCart('username')).rejects.toThrow('DB error');
    });

    test('DB error in getCartNotPaidFromDB', async () => {
        const mockDBGet = jest.spyOn(db, "get").mockImplementationOnce((sql, params, callback) => {
            callback(new Error("DB error"), null);
            return {} as Database
        });

        await expect(cartDAO.getCart('username')).rejects.toThrow("DB error");
    });

    test('DB error in getCartPopulatedFromDB', async () => {
        jest.spyOn(db, "get").mockImplementationOnce((sql, params, callback) => {
            callback(null, { id: 1, customer: 'username', total: 100.00, paid: false });
            return {} as Database
        });

        jest.spyOn(db, "all").mockImplementationOnce((sql, params, callback) => {
            callback(new Error("DB error"), null);
            return {} as Database
        });

        await expect(cartDAO.getCart('username')).rejects.toThrow("DB error");
    });

});



describe('addToCart', () => {
    let cartDAO = new CartDAO();
    const testUsername = 'testuser';
    const testModel = 'model1';
    const testProduct = new ProductEssential(100, testModel, Category.SMARTPHONE, 10);

    beforeEach(() => {
        cartDAO = new CartDAO();
    });

    afterEach(() => {
        jest.restoreAllMocks();  // Ripristina tutti i mock dopo ogni test
    });

    it("Should add product to existing cart", async () => {
        jest.spyOn(cartDAO, 'getProductFromDB').mockResolvedValueOnce(testProduct);
        jest.spyOn(cartDAO, 'getCartFromDB').mockResolvedValueOnce([1, new Cart('username', false, "", 0, [])]);

        jest.spyOn(db, "run").mockImplementationOnce((sql, params, callback) => {
            callback(null);
            return {} as Database
        });

        jest.spyOn(db, "get").mockImplementationOnce((sql, params, callback) => {
            callback(null, null);
            return {} as Database
        });

        jest.spyOn(db, "run").mockImplementationOnce((sql, params, callback) => {
            callback(null);
            return {} as Database
        });

        jest.spyOn(db, "run").mockImplementationOnce((sql, params, callback) => {
            callback(null);
            return {} as Database
        });

        const result = await cartDAO.addToCart('username', 'model1');
        expect(result).toBe(true);
    });

    it('Should add a new product to the cart when no unpaid cart exists', async () => {
        jest.spyOn(cartDAO, 'getProductFromDB').mockResolvedValueOnce(testProduct);
        jest.spyOn(cartDAO, 'getCartFromDB').mockResolvedValueOnce([null, null]);

        jest.spyOn(db, 'run').mockImplementation((sql, params, callback) => {
            callback.call({ lastID: 1 }, null); // Simulate lastID for cart
            return {} as Database;
        });

        const result = await cartDAO.addToCart(testUsername, testModel);
        expect(result).toBe(true);
    });

    it("Should throw EmptyProductStockError when product stock is empty", async () => {
        const outOfStockProduct = new ProductEssential(100, testModel, Category.SMARTPHONE, 0);
        jest.spyOn(cartDAO, 'getProductFromDB').mockResolvedValue(outOfStockProduct);

        await expect(cartDAO.addToCart(testUsername, testModel)).rejects.toThrow(EmptyProductStockError);
    });

    it("Should throw error when getProductFromDB fails", async () => {
        jest.spyOn(cartDAO, 'getProductFromDB').mockRejectedValueOnce(new Error("DB error"));

        await expect(cartDAO.addToCart(testUsername, testModel)).rejects.toThrow("DB error");
    });

    it("Should throw error when getCartFromDB fails", async () => {
        jest.spyOn(cartDAO, 'getProductFromDB').mockResolvedValueOnce(new ProductEssential(100, 'model1', Category.APPLIANCE, 10));
        jest.spyOn(cartDAO, 'getCartFromDB').mockRejectedValueOnce(new Error("DB error"));

        await expect(cartDAO.addToCart(testUsername, testModel)).rejects.toThrow("DB error");
    });
    test('Should update quantity if product already in cart', async () => {
        jest.spyOn(cartDAO, 'getProductFromDB').mockResolvedValue(testProduct);
        jest.spyOn(cartDAO, 'getCartFromDB').mockResolvedValue([1, {}]);
        jest.spyOn(db, 'get').mockImplementation((sql, params, callback) => {
            callback(null, { model: testModel });
            return {} as Database
        });
        jest.spyOn(cartDAO, 'updateByOneProductQntyCartInDB').mockResolvedValue(true);

        const result = await cartDAO.addToCart(testUsername, testModel);
        expect(result).toBe(true);
        expect(cartDAO.updateByOneProductQntyCartInDB).toHaveBeenCalledWith(testModel, 1, true);
    });
    test('Should update total quantity in cart', async () => {
        jest.spyOn(cartDAO, 'getProductFromDB').mockResolvedValue(testProduct);
        jest.spyOn(cartDAO, 'getCartFromDB').mockResolvedValue([1, {}]);
        jest.spyOn(db, 'get').mockImplementation((sql, params, callback) => {
            callback(null, { model: testModel });
            return {} as Database
        });
        jest.spyOn(cartDAO, 'updateTotalCartInDB').mockResolvedValue(true);

        const result = await cartDAO.addToCart(testUsername, testModel);
        expect(result).toBe(true);
        expect(cartDAO.updateTotalCartInDB).toHaveBeenCalledWith(1, testProduct.sellingPrice);
    });
    test('DB error in updateTotalCartInDB', async () => {
        const mockDBGet = jest.spyOn(db, "run").mockImplementationOnce((sql, params, callback) => {
            callback(new Error("DB error"), null);
            return {} as Database
        });

        await expect(cartDAO.updateTotalCartInDB(1, testProduct.sellingPrice)).rejects.toThrow("DB error");
    });
    it('Db error in addToCart', async () => {
        jest.spyOn(db, 'get').mockImplementationOnce((sql, params, callback) => {
            callback(new Error('DB error'), null);  // Simula un errore del database
            return {} as Database
        });

        await expect(cartDAO.addToCart(testUsername, testModel)).rejects.toThrow('DB error');
    });

});

describe('checkoutCart', () => {
    let cartDAO: CartDAO;


    beforeEach(() => {
        cartDAO = new CartDAO();
    });

    afterEach(() => {
        jest.restoreAllMocks(); // Restore all mocks after each test
    });

    it('Should successfully checkout the cart', async () => {
        jest.spyOn(cartDAO, 'getCartFromDB').mockResolvedValue([1, { id: 1, customer: 'username', total: 10.0, paid: false, products: [] }]);
        jest.spyOn(cartDAO, 'checkCartToPayDB').mockResolvedValue([new ProductInCartQuantity('model1', 1)]);
        jest.spyOn(cartDAO, 'markSoldCartInDB').mockResolvedValue(true);
        jest.spyOn(cartDAO, 'decrementProductQntyStockInDB').mockResolvedValue(true);

        const result = await cartDAO.checkoutCart('username');
        expect(result).toBe(true);
    });

    it('Should return a 404 error if no unpaid cart is found', async () => {
        jest.spyOn(cartDAO, 'getCartFromDB').mockResolvedValue([null, null]);

        await expect(cartDAO.checkoutCart('username')).rejects.toThrow(CartNotFoundError);
    });

    it('Should return a 400 error if the cart contains no products', async () => {
        jest.spyOn(cartDAO, 'getCartFromDB').mockResolvedValue([1, { id: 1, customer: 'username', total: 0.0, paid: false, products: [] }]);
        jest.spyOn(cartDAO, 'checkCartToPayDB').mockRejectedValue(new EmptyCartError);

        await expect(cartDAO.checkoutCart('username')).rejects.toThrow(EmptyCartError);
    });

    it('should return a 409 error if a product in the cart is out of stock', async () => {
        jest.spyOn(cartDAO, 'getCartFromDB').mockResolvedValue([1, { id: 1, customer: 'username', total: 10.0, paid: 0, products: [] }]);
        jest.spyOn(cartDAO, 'checkCartToPayDB').mockRejectedValue(new EmptyProductStockError);

        await expect(cartDAO.checkoutCart('username')).rejects.toThrow(EmptyProductStockError);
    });

    it('Should return a 409 error if a product quantity exceeds the available stock', async () => {
        jest.spyOn(cartDAO, 'getCartFromDB').mockResolvedValue([1, { id: 1, customer: 'username', total: 10.0, paid: 0, products: [] }]);
        jest.spyOn(cartDAO, 'checkCartToPayDB').mockRejectedValue(new LowProductStockError);

        await expect(cartDAO.checkoutCart('username')).rejects.toThrow(LowProductStockError);
    });

    it('Should retrieve product quantities from the cart for payment', async () => {
        const idCart = 1;
        const expectedProductQuantities = [
            new ProductInCartQuantity('model1', 1),
            new ProductInCartQuantity('model2', 2)
        ];

        // Spia sulla funzione checkCartToPayDB
        jest.spyOn(cartDAO, 'checkCartToPayDB').mockImplementationOnce(async (idCart) => {
            // Assicura che la funzione venga chiamata con il parametro atteso
            expect(idCart).toBe(1);
            return expectedProductQuantities; // Simula il recupero delle quantità dei prodotti dal carrello
        });
        const result = await cartDAO.checkCartToPayDB(idCart);
        expect(result).toEqual(expectedProductQuantities);
    });

    it('Check function markSoldCartInDB', async () => {
        const idCart = 1;

        // Spia sulla funzione markSoldCartInDB
        jest.spyOn(cartDAO, 'markSoldCartInDB').mockImplementationOnce(async (idCart) => {
            // Assicura che la funzione venga chiamata con il parametro atteso
            expect(idCart).toBe(1);
            return true; // Simula il successo dell'operazione
        });

        const result = await cartDAO.markSoldCartInDB(idCart);
        expect(result).toBe(true);
    });

    it('Check the payment date of the cart is set to the current date, in format YYYY-MM-DD ', async () => {
        const mockCartId = 1;
        const expectedDate = dayjs().format('YYYY-MM-DD');

        jest.spyOn(db, "run").mockImplementation((sql, params, callback) => {
            callback(null, [expectedDate, mockCartId], null); // Simula una chiamata di successo
            return {} as Database
        });

        const result = await cartDAO.markSoldCartInDB(mockCartId);

        // Verifica che db.run sia stata chiamata con la data corretta
        expect(result).toBe(true);
    });

    it('Check function decrementProductQntyStockInDB', async () => {
        // Mock dei dati necessari per il test
        const model = 'model1';
        const decrementAmount = 1;

        // Spia sulla funzione decrementProductQntyStockInDB
        jest.spyOn(cartDAO, 'decrementProductQntyStockInDB').mockImplementationOnce(async (model, decrement) => {
            // Assicura che la funzione venga chiamata con i parametri attesi
            expect(model).toBe('model1');
            expect(decrement).toBe(1);
            return true; // Simula il successo dell'operazione
        });

        const result = await cartDAO.decrementProductQntyStockInDB(model, decrementAmount);
        expect(result).toBe(true);
    });
    test('DB error in checkCartToPayDB', async () => {
        const mockDBGet = jest.spyOn(db, "all").mockImplementationOnce((sql, params, callback) => {
            callback(new Error("DB error"), null);
            return {} as Database
        });

        await expect(cartDAO.checkCartToPayDB(0)).rejects.toThrow("DB error");
    });
    test('DB error in markSoldCartInDB', async () => {
        const mockDBGet = jest.spyOn(db, "run").mockImplementationOnce((sql, params, callback) => {
            callback(new Error("DB error"), null);
            return {} as Database
        });

        await expect(cartDAO.markSoldCartInDB(0)).rejects.toThrow("DB error");
    });
    test('DB error in decrementProductQntyStockInDB', async () => {
        const mockDBGet = jest.spyOn(db, "run").mockImplementationOnce((sql, params, callback) => {
            callback(new Error("DB error"), null);
            return {} as Database
        });

        await expect(cartDAO.decrementProductQntyStockInDB('model1', 1)).rejects.toThrow("DB error");
    });
    it('Db error in checkoutCart', async () => {
        jest.spyOn(db, 'get').mockImplementationOnce((sql, params, callback) => {
            callback(new Error('DB error'), null);  // Simula un errore del database
            return {} as Database
        });

        await expect(cartDAO.checkoutCart('username')).rejects.toThrow('DB error');
    });
});

describe('getCustomerCarts', () => {
    let cartDAO = new CartDAO();

    beforeEach(() => {
        cartDAO = new CartDAO();
    })

    afterEach(() => {
        jest.restoreAllMocks(); // Restore all mocks after each test
    });

    it('Should return an array of customer carts', async () => {
        const cartsNotPopulatedMock = [
            { id: 1, cart: { customer: 'username', paid: true, paymentDate: '2024-05-02', total: 200, products: [{ model: 'iPhone 13', category: Category.SMARTPHONE, quantity: 1, price: 200 }] } }
        ];
        jest.spyOn(cartDAO, 'getCartsPaidFromDB').mockResolvedValue(cartsNotPopulatedMock);
        jest.spyOn(cartDAO, 'getCartPopulatedFromDB').mockResolvedValue(new Cart('username', true, '2024-05-02', 200, [{ model: 'iPhone 13', category: Category.SMARTPHONE, quantity: 1, price: 200 }]));

        const result = await cartDAO.getCustomerCarts('username');
        expect(result.length).toBe(1);
        expect(result[0]).toBeInstanceOf(Cart);
    });

    it('Should return an empty array if no carts are found for the customer', async () => {
        jest.spyOn(cartDAO, 'getCartsPaidFromDB').mockResolvedValue([]);

        const result = await cartDAO.getCustomerCarts('username');
        expect(result).toEqual([]);
    });

    it('Check the current cart, if present, is not included in the list.', async () => {
        let arrayProducts: ProductInCart[] = [];
        const currentCart = { id: 1, customer: "customer", paid: false, paymentDate: "", total: 0, products: arrayProducts };
        const pastCarts = [
            { id: 2, customer: "customer", paid: true, paymentDate: '2024-05-01', total: 200, products: [{ model: "iPhone 13", category: Category.SMARTPHONE, quantity: 1, price: 200 }] },
            { id: 3, customer: "customer", paid: true, paymentDate: '2024-04-01', total: 150, products: [{ model: "iPad", category: Category.LAPTOP, quantity: 1, price: 150 }] }
        ];

        // Mock della funzione cartDAO.getCustomerCarts per restituire il valore atteso
        jest.spyOn(cartDAO, 'getCustomerCarts').mockResolvedValueOnce([...pastCarts]);

        const result = await cartDAO.getCustomerCarts('username');

        // Verifica che il carrello corrente non sia nella lista restituita
        expect(result).toEqual(pastCarts);
        expect(result).toHaveLength(2);
        expect(result).not.toContainEqual(currentCart);
    });

    it('Db error in getCustomerCarts', async () => {
        jest.spyOn(db, 'get').mockImplementationOnce((sql, params, callback) => {
            callback(new Error('DB error'), null);  // Simula un errore del database
            return {} as Database
        });

        await expect(cartDAO.checkoutCart('username')).rejects.toThrow('DB error');
    });


});

describe('removeProductFromCart', () => {
    let cartDAO: CartDAO;

    beforeEach(() => {
        cartDAO = new CartDAO();
    });

    afterEach(() => {
        jest.restoreAllMocks(); // Restore all mocks after each test
    });
    const username = 'username';
    const model = 'model1';
    const productMock1: ProductEssential = { sellingPrice: 500, model: model, category: Category.SMARTPHONE, quantity: 1 };
    const productMock2: ProductInCart = { model: model, category: Category.SMARTPHONE, quantity: 1, price: 500 };

    it('Should remove a product from the cart', async () => {
        jest.spyOn(cartDAO, 'getProductFromDB').mockResolvedValue(productMock1);
        jest.spyOn(cartDAO, 'getCartFromDB').mockResolvedValue([1, { customer: username, paid: false, paymentDate: null, total: 500, products: [productMock2] }]);
        jest.spyOn(cartDAO, 'getCartPopulatedFromDB').mockResolvedValue(new Cart(username, false, "", 500, [productMock2]));
        jest.spyOn(cartDAO, 'updateByOneProductQntyCartInDB').mockResolvedValue(true);
        jest.spyOn(cartDAO, 'updateTotalCartInDB').mockResolvedValue(true);

        const result = await cartDAO.removeProductFromCart(username, model);
        expect(result).toBe(true);
    });

    it('Should delete the product from the cart and update the total cost if the product quantity is 1 and should delete it from DB', async () => {
        jest.spyOn(cartDAO, 'getProductFromDB').mockResolvedValue(productMock1);
        jest.spyOn(cartDAO, 'getCartFromDB').mockResolvedValue([1, { customer: username, paid: false, paymentDate: null, total: 500, products: [productMock2] }]);
        jest.spyOn(cartDAO, 'getCartPopulatedFromDB').mockResolvedValue(new Cart(username, false, "", 500, [productMock2]));
        jest.spyOn(cartDAO, 'updateByOneProductQntyCartInDB').mockResolvedValue(true);
        jest.spyOn(cartDAO, 'deleteProductReferenceFromCartInDB').mockResolvedValue(true);
        jest.spyOn(cartDAO, 'updateTotalCartInDB').mockResolvedValue(true);

        const result = await cartDAO.removeProductFromCart(username, model);

        expect(result).toBe(true);
    });

    it('Should throw an error if the product does not exist in the database', async () => {
        jest.spyOn(cartDAO, 'getProductFromDB').mockRejectedValue(new Error('ProductNotFoundError'));

        await expect(cartDAO.removeProductFromCart(username, model)).rejects.toThrow(Error);
    });

    it('Should reject with EmptyCartError if cart is found but there are no products ', async () => {
        const testCart1: Cart = new Cart("test", false, "", 0.0, []);
        jest.spyOn(cartDAO, 'getProductFromDB').mockResolvedValue(productMock1);
        jest.spyOn(cartDAO, 'getCartFromDB').mockResolvedValue([1, null]);
        jest.spyOn(cartDAO, 'getCartPopulatedFromDB').mockResolvedValue(testCart1);
        await expect(cartDAO.removeProductFromCart(username, model)).rejects.toThrow(EmptyCartError);
    });

    it('Should reject with CartNotFoundError if cart is not found', async () => {
        jest.spyOn(cartDAO, 'getProductFromDB').mockResolvedValue(productMock1);
        jest.spyOn(cartDAO, 'getCartFromDB').mockResolvedValue([null, null]);

        await expect(cartDAO.removeProductFromCart(username, model)).rejects.toThrow(CartNotFoundError);
    });

    it('Should reject with ProductNotInCartError if product is not in the cart', async () => {
        const model = 'NonExistingModel';
        jest.spyOn(cartDAO, 'getProductFromDB').mockResolvedValue(productMock1);
        jest.spyOn(cartDAO, 'getCartFromDB').mockResolvedValue([1, { customer: username, paid: false, paymentDate: null, total: 500, products: [{ model: 'ExistingModel', category: Category.SMARTPHONE, quantity: 1, price: 500 }] }]);

        await expect(cartDAO.removeProductFromCart(username, model)).rejects.toThrow(ProductNotInCartError);
    });

    test('DB error in updateByOneProductQntyCartInDB', async () => {
        const mockDBGet = jest.spyOn(db, "run").mockImplementationOnce((sql, params, callback) => {
            callback(new Error("DB error"), null);
            return {} as Database
        });

        await expect(cartDAO.updateByOneProductQntyCartInDB(model, 0, false)).rejects.toThrow("DB error");
    });
    test('DB error in deleteProductReferenceFromCartInDB', async () => {
        const mockDBGet = jest.spyOn(db, "run").mockImplementationOnce((sql, params, callback) => {
            callback(new Error("DB error"), null);
            return {} as Database
        });

        await expect(cartDAO.deleteProductReferenceFromCartInDB(model, 0)).rejects.toThrow("DB error");
    });
    test('DB error in updateTotalCartInDB', async () => {
        const mockDBGet = jest.spyOn(db, "run").mockImplementationOnce((sql, params, callback) => {
            callback(new Error("DB error"), null);
            return {} as Database
        });

        await expect(cartDAO.updateTotalCartInDB(0, 0)).rejects.toThrow("DB error");
    });
    it('Db error in removeProductFromCart', async () => {
        jest.spyOn(db, 'get').mockImplementationOnce((sql, params, callback) => {
            callback(new Error('DB error'), null);  // Simula un errore del database
            return {} as Database
        });

        await expect(cartDAO.removeProductFromCart('username', 'model1')).rejects.toThrow('DB error');
    });
});

describe('clearCart', () => {
    let cartDAO: CartDAO;

    beforeEach(() => {
        cartDAO = new CartDAO();
    });

    afterEach(() => {
        jest.restoreAllMocks(); // Restore all mocks after each test
    });

    it('Should clear the cart and set the total cost to 0', async () => {
        const username = 'username';
        const idCart = 1;
        const cartMock = { customer: username, paid: false, paymentDate: "", total: 500, products: [{ model: 'model1', quantity: 1, category: Category.SMARTPHONE, price: 500 }] };
        jest.spyOn(cartDAO, 'getCartFromDB').mockResolvedValue([idCart, cartMock]);
        jest.spyOn(cartDAO, 'getCartPopulatedFromDB').mockResolvedValue(new Cart(username, false, "", 500, [{ model: 'model1', quantity: 1, category: Category.SMARTPHONE, price: 500 }]));
        jest.spyOn(cartDAO, 'updateTotalCartInDB').mockResolvedValue(true);
        jest.spyOn(cartDAO, 'deleteAllProductsReferencesFromAllCartsInDB').mockResolvedValue(true);

        const result = await cartDAO.clearCart(username);

        expect(result).toBe(true);
        expect(cartDAO.updateTotalCartInDB).toHaveBeenCalledWith(idCart, -500); // Total cost set to 0

    });

    it('Should return true if the cart is already empty', async () => {
        const username = 'username';
        const idCart = 1;
        const cartMock = { customer: username, paid: false, paymentDate: "", total: 0, products: [{}] };
        jest.spyOn(cartDAO, 'getCartFromDB').mockResolvedValue([idCart, cartMock]);
        jest.spyOn(cartDAO, 'getCartPopulatedFromDB').mockResolvedValue(new EmptyCart(username));

        const result = await cartDAO.clearCart(username);

        expect(result).toBe(true);
    });


    it('Should throw CartNotFoundError if no unpaid cart is found for the user', async () => {
        const username = 'username';
        jest.spyOn(cartDAO, 'getCartFromDB').mockResolvedValue([null, null]);

        await expect(cartDAO.clearCart(username)).rejects.toThrow(CartNotFoundError);
    });
    test('DB error in deleteAllProductsReferencesFromAllCartsInDB', async () => {
        const mockDBGet = jest.spyOn(db, "run").mockImplementationOnce((sql, callback) => {
            callback(new Error("DB error"), null);
            return {} as Database
        });

        await expect(cartDAO.deleteAllProductsReferencesFromAllCartsInDB()).rejects.toThrow("DB error");
    });
    it('Db error in clearCart', async () => {
        jest.spyOn(db, 'get').mockImplementationOnce((sql, params, callback) => {
            callback(new Error('DB error'), null);  // Simula un errore del database
            return {} as Database
        });

        await expect(cartDAO.clearCart('username')).rejects.toThrow('DB error');
    });
});

describe('deleteAllCarts', () => {
    let cartDAO: CartDAO;

    beforeEach(() => {
        cartDAO = new CartDAO();
    });

    afterEach(() => {
        jest.restoreAllMocks(); // Restore all mocks after each test
    });
    it('Should delete all carts and their product references', async () => {
        jest.spyOn(cartDAO, 'deleteAllProductsReferencesFromAllCartsInDB').mockResolvedValue(true);
        jest.spyOn(cartDAO, 'deleteAllCartsInDB').mockResolvedValue(true);


        const result = await cartDAO.deleteAllCarts();


        expect(result).toBe(true);
        expect(cartDAO.deleteAllProductsReferencesFromAllCartsInDB).toHaveBeenCalledTimes(1);
        expect(cartDAO.deleteAllCartsInDB).toHaveBeenCalledTimes(1);
    });

    it('Should reject with an error if deleting carts fails', async () => {
        jest.spyOn(cartDAO, 'deleteAllProductsReferencesFromAllCartsInDB').mockRejectedValue(new Error('Failed to delete product references'));
        jest.spyOn(cartDAO, 'deleteAllCartsInDB').mockRejectedValue(new Error('Failed to delete carts'));


        await expect(cartDAO.deleteAllCarts()).rejects.toThrow('Failed to delete product references');
        expect(cartDAO.deleteAllProductsReferencesFromAllCartsInDB).toHaveBeenCalledTimes(1);
        expect(cartDAO.deleteAllCartsInDB).not.toHaveBeenCalled(); // Should not have been called due to the rejection
    });
    test('DB error in deleteAllCartsInDB', async () => {
        const mockDBGet = jest.spyOn(db, "run").mockImplementationOnce((sql, callback) => {
            callback(new Error("DB error"), null);
            return {} as Database
        });

        await expect(cartDAO.deleteAllCartsInDB()).rejects.toThrow("DB error");
    });
});

describe('getAllCarts', () => {
    let cartDAO: CartDAO;

    beforeEach(() => {
        cartDAO = new CartDAO();
    });

    afterEach(() => {
        jest.restoreAllMocks(); // Restore all mocks after each test
    });

    it('Should return an array of Cart objects representing all carts in the database', async () => {
        // Mock dei dati dei carrelli nel database
        const mockCarts: Cart[] = [
            { customer: 'test_user', paid: true, paymentDate: '2024-05-02', total: 200, products: [{ model: 'model1', category: Category.SMARTPHONE, quantity: 1, price: 200 }] },
        ];

        jest.spyOn(cartDAO, 'getCartsFromDB').mockResolvedValue(mockCarts);
        const result = await cartDAO.getAllCarts();

        // Verifica che il risultato sia un array di oggetti Cart
        expect(result).toEqual(mockCarts);
        expect(result).toHaveLength(1);
    });

    it('Should handle an empty array of carts in the database', async () => {
        // Mock dei dati dei carrelli nel database vuoto
        const mockEmptyCarts: Cart[] = [];

        jest.spyOn(cartDAO, 'getCartsFromDB').mockResolvedValue(mockEmptyCarts);
        const result = await cartDAO.getAllCarts();

        // Verifica che il risultato sia un array vuoto
        expect(Array.isArray(result)).toBe(true);
        expect(result.length).toBe(0);
    });
});



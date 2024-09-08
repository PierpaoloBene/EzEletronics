import { query } from "express-validator"
import { User, Role } from "./components/user"
const DATE_ERROR = "Input date is not compatible with the current date"

/**
 * Represents a utility class.
 */
class Utility {
    /**
     * Checks if a user is a manager.
     * @param {User} user - The user to check.
     * @returns True if the user is a manager, false otherwise.
     */
    static isManager(user: User): boolean {
        return user.role === Role.MANAGER
    }
    /**
     * Checks if a user is a customer.
     * @param {User} user - The user to check.
     * @returns True if the user is a customer, false otherwise.
     */
    static isCustomer(user: User): boolean {
        return user.role === Role.CUSTOMER
    }

    static isAdmin(user: User): boolean {
        return user.role === Role.ADMIN
    }

    static handleDate(date: string | null, reject: Function) {
        // if date is not null and is after the current date, throw a DateError
        if (date && Date.parse(date) > new Date().getTime()){
            reject(new DateError());
            return;
        }
        // if date is null, sets it as the current date in the YYYY-MM-DD format
        if (!date) {
            date = new Date().toISOString().split('T')[0];
        }
    }

    /**
     * Custom validators to be used in the GET /products and GET /products/available routes
     */
    static validateQueryCategoryModel = [
        query("category").custom((value, { req }) => {

            if (req.query.grouping === "category" && (!value || !["Smartphone", "Laptop", "Appliance"].includes(value))) {
                throw new Error("Category must be one of 'Smartphone', 'Laptop', 'Appliance' when grouping is 'category'");
            }
            if (req.query.grouping === "model" && value !== undefined) {
                throw new Error("Category must be null when grouping is 'model'");
            }
            if (req.query.grouping === undefined && value !== undefined) {
                throw new Error("Category must be null when grouping is null");
            }
            return true;
        }),
        query("model").custom((value, { req }) => {

            if (req.query.grouping === "model" && (!value || value.length < 1)) {
                throw new Error("Model must have at least 1 character when grouping is 'model'");
            }
            if (req.query.grouping === "category" && value !== undefined) {
                throw new Error("Model must be null when grouping is 'category'");
            }
            if (req.query.grouping === undefined && value !== undefined) {
                throw new Error("Model must be null when grouping is null");
            }
            return true;
        })
    ];
}

class DateError extends Error {
    customMessage: string
    customCode: number

    constructor() {
        super()
        this.customMessage = DATE_ERROR
        this.customCode = 400
    }
}

export { Utility, DateError }
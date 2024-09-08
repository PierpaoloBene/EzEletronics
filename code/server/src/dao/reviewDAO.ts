import db, { DBCountType } from "../db/db"
import { ProductReview } from "../components/review";
import { User } from "../components/user";
import { ExistingReviewError, NoExistProductError, NoReviewProductError } from "../errors/reviewError";

/**
 * A class that implements the interaction with the database for all review-related operations.
 * You are free to implement any method you need here, as long as the requirements are satisfied.
 */
class ReviewDAO {

    /**
    * Adds a new review by a single customer to a product and saves the information in the database
    *  A customer can leave at most one review for each product model
    * @param model The model name. It must be unique.
    * @param user The name of the user
    * @param score The score of the review. An integer whose value must be between 1 and 5
    * @param comment The comment of the review. A string that cannot be null
    * @param date The current date is used as the date for the review, in format YYYY-MM-DD.
    * @returns A Promise that resolves to nothing
    */
    addReview(review: ProductReview): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            try {
                let sql = 'SELECT COUNT(*) FROM products WHERE model = ?';
                db.get(sql, [review.model], (err, row: DBCountType) => {
                    if (err)
                        reject(err);
                    else if (row['COUNT(*)'] === 0) {
                        reject(new NoExistProductError());
                    }
                    else {
                        sql = 'SELECT COUNT(*) FROM review WHERE user = ? AND model = ?';
                        db.get(sql, [review.user, review.model], (err, row: DBCountType) => {
                            if (err)
                                reject(err);
                            else if (row['COUNT(*)'] > 0) {
                                reject(new ExistingReviewError());
                            }
                            else {
                                sql = 'INSERT INTO review (model, user, score, date, comment) VALUES (?, ?, ?, ?, ?)';
                                db.run(sql, [review.model, review.user, review.score, review.date, review.comment], function (err) {
                                    if (err)
                                        reject(err);
                                    resolve(null);
                                })
                            }
                        });
                    }
                });
            } catch (error) {
                reject(error);
            }
        })
    }

    /**
      * Returns all reviews for a product
      * @param model The model of the product to get reviews from
      * @returns A Promise that resolves to an array of ProductReview objects
      */

    getProductReviews(model: string): Promise<ProductReview[]> {
        return new Promise<ProductReview[]>((resolve, reject) => {
            try {
                let sql = 'SELECT * FROM review WHERE model=?';
                db.all(sql, [model], (err, rows: ProductReview[]) => {
                    if (err)
                        reject(err);
                    else {
                        const arrayReviews = rows.map((ans) => new ProductReview(ans.model, ans.user, ans.score, ans.date, ans.comment));
                        resolve(arrayReviews);
                    }
                })
            } catch (error) {
                reject(error);
            }
        })
    }

    /**
     * Deletes the review made by a user for a product
     * @param model The model of the product to delete the review from
     * @param user The user who made the review to delete
     * @returns A Promise that resolves to nothing
     */

    deleteReview(model: string, user: User): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            try {
                let sql = 'SELECT COUNT(*) FROM products WHERE model=?';
                db.get(sql, [model], (err, row: DBCountType) => {
                    if (err)
                        reject(err);
                    else if (row['COUNT(*)'] === 0) {
                        reject(new NoExistProductError());
                    }
                    else {
                        sql = 'SELECT COUNT(*) FROM review WHERE model=? AND user=?';
                        db.get(sql, [model, user.username], (err, row: DBCountType) => {
                            if (err)
                                reject(err);
                            else if (row['COUNT(*)'] === 0) {
                                reject(new NoReviewProductError());
                            }
                            else {
                                sql = 'DELETE FROM review WHERE model=? AND user=?';
                                db.run(sql, [model, user.username], function (err) {
                                    if (err)
                                        reject(err);
                                    resolve(null);
                                })
                            }
                        });
                    }
                });
            } catch (error) {
                reject(error);
            }
        })
    }

    /**
     * Deletes all reviews for a product
     * @param model The model of the product to delete the reviews from
     * @returns A Promise that resolves to nothing
     */

    deleteReviewsOfProduct(model: string): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            try {
                let sql = 'SELECT COUNT(*) FROM products WHERE model=?';
                db.get(sql, [model], (err, row: DBCountType) => {
                    if (err)
                        reject(err);
                    else if (row['COUNT(*)'] === 0) {
                        reject(new NoExistProductError());
                    }
                    else {
                        sql = 'DELETE FROM review WHERE model=?';
                        db.run(sql, [model], function (err) {
                            if (err)
                                reject(err);
                            resolve(null);
                        })
                    }
                });
            } catch (error) {
                reject(error);
            }
        })
    }

    /**
    * Deletes all reviews of all products
    * @returns A Promise that resolves to nothing
    */
    deleteAllReviews(): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            try {
                let sql = 'DELETE FROM review';
                db.run(sql, [], function (err) {
                    if (err)
                        reject(err);
                    resolve(null);
                })
            } catch (error) {
                reject(error);
            }
        })
    }


}

export default ReviewDAO;
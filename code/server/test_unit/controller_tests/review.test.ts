import { describe, test, expect, beforeAll, jest } from "@jest/globals"
import ReviewController from "../../src/controllers/reviewController"
import ReviewDAO from "../../src/dao/reviewDAO"
import { User, Role } from "../../src/components/user";
import { ProductReview } from "../../src/components/review";
import dayjs from "dayjs";


jest.mock("../../src/dao/reviewDAO")


describe("Calls from controller to DAO", () => {
    let reviewController: ReviewController;
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

    beforeAll(() => {
        reviewController = new ReviewController();
    });


    //Example of a unit test for the addReview method of the ReviewController
    //The test checks if the method returns undefined when the DAO method returns undefined
    //The test also expects the DAO method to be called once with the correct parameters
    test("addReview", async () => {
        const testReview = { //Define a test review object
            model: "test",
            user: testUser.username,
            score: 1,
            date: dayjs().format('YYYY-MM-DD'),
            comment: "test"
        }
        const review = new ProductReview(testReview.model, testReview.user, testReview.score, testReview.date, testReview.comment)

        jest.spyOn(ReviewDAO.prototype, "addReview").mockResolvedValueOnce(undefined); //Mock the addReview method of the DAO
        
        //Call the addReview method of the controller
        const response = await reviewController.addReview(testReview.model, user, testReview.score, testReview.comment);

        //Check if the addReview method of the DAO has been called once with the correct parameters
        expect(ReviewDAO.prototype.addReview).toHaveBeenCalledTimes(1);
        expect(ReviewDAO.prototype.addReview).toHaveBeenCalledWith(review)
        expect(response).toBe(undefined); //Check if the response is undefined
    });

    test("getProductReviews", async () => {
        const testReviews: ProductReview[] = [
            new ProductReview(testModel, testUser.username, 1, "2024-06-01", "test1"),
            new ProductReview(testModel, "test2", 2, "2024-06-02", "test2")
        ];        
        jest.spyOn(ReviewDAO.prototype, "getProductReviews").mockResolvedValueOnce(testReviews);
        
        const response = await reviewController.getProductReviews(testModel);

        expect(ReviewDAO.prototype.getProductReviews).toHaveBeenCalledTimes(1);
        expect(ReviewDAO.prototype.getProductReviews).toHaveBeenCalledWith(testModel)
        expect(response).toBe(testReviews);
    });

    test("deleteReview", async () => {
        jest.spyOn(ReviewDAO.prototype, "deleteReview").mockResolvedValueOnce(undefined);
        
        const response = await reviewController.deleteReview(testModel, user);

        expect(ReviewDAO.prototype.deleteReview).toHaveBeenCalledTimes(1);
        expect(ReviewDAO.prototype.deleteReview).toHaveBeenCalledWith(testModel, user)
        expect(response).toBe(undefined);
    });

    test("deleteReviewsOfProduct", async () => {
        jest.spyOn(ReviewDAO.prototype, "deleteReviewsOfProduct").mockResolvedValueOnce(undefined);
        
        const response = await reviewController.deleteReviewsOfProduct(testModel);

        expect(ReviewDAO.prototype.deleteReviewsOfProduct).toHaveBeenCalledTimes(1);
        expect(ReviewDAO.prototype.deleteReviewsOfProduct).toHaveBeenCalledWith(testModel)
        expect(response).toBe(undefined);
    });

    test("deleteAllReviews", async () => {
        jest.spyOn(ReviewDAO.prototype, "deleteAllReviews").mockResolvedValueOnce(undefined);
        
        const response = await reviewController.deleteAllReviews();

        expect(ReviewDAO.prototype.deleteAllReviews).toHaveBeenCalledTimes(1);
        expect(ReviewDAO.prototype.deleteAllReviews).toHaveBeenCalledWith()
        expect(response).toBe(undefined);
    });
});
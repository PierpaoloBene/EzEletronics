"use strict"

import db from "../db/db";
/**
 * Deletes all data from the database.
 * This function must be called before any integration test, to ensure a clean database state for each test run.
 */

export async function cleanup(keepUsers: boolean = false) {
    return new Promise<void>((resolve, reject) => {
        db.serialize(() => {
            // Inizia una transazione per garantire che tutte le operazioni di cancellazione siano atomiche
            db.run("BEGIN TRANSACTION", async (err: Error) => {
                if (err) {
                    reject(err);
                }
                else {
                    try {
                        // Esegui le operazioni di cancellazione
                        await executeSql("DELETE FROM productInCart");
                        await executeSql("DELETE FROM cart");
                        await executeSql("DELETE FROM review");
                        await executeSql("DELETE FROM products");
                        if (!keepUsers) {
                            await executeSql("DELETE FROM users");
                        }
                        await executeSql("DELETE FROM sqlite_sequence");

                        // Termina la transazione
                        await executeSql("COMMIT");
                        resolve();
                    }
                    catch (err) {
                        reject(err);
                    }
                }
            });
        });
    });
}

const executeSql = (sqlQuery: string) => {
    return new Promise<void>((resolve, reject) => {
        db.run(sqlQuery, (err: Error) => {
            if (err) {
                return reject(err);
            }
            else {
                resolve();
            }
        });
    })
}

/*
 *
 *
 *       Complete the API routing below
 *
 *
 */

"use strict";
const dbObject = require("../config/db.js");

const { ObjectId } = require("mongodb");

module.exports = function (app) {
  const books = dbObject.db.collection("books");

  app
    .route("/api/books")
    .get(async function (req, res) {
      //response will be array of book objects
      //json res format: [{"_id": bookid, "title": book_title, "commentcount": num_of_comments },...]

      try {
        // retornar todos los books sin el field comment pero con un nuevo campo agregado igual a comment count siendo igual al largo del array comment

        const result = await books
          .aggregate([
            {
              $project: {
                _id: 1,
                title: 1,
                commentcount: { $size: "$comments" },
              },
            },
          ])
          .toArray();
        res.status(200).json(result);
      } catch (error) {
        res.status(500).send(error.message);
      }
    })

    .post(async function (req, res) {
      let title = req.body.title;
      //response will contain new book object including atleast _id and title

      if (title === undefined) {
        res.status(200).send("missing required field title");
        return;
      }

      try {
        const book = await books.findOneAndUpdate(
          { _id: new ObjectId() },
          { $setOnInsert: { title, comments: [] } },
          { upsert: true, returnDocument: "after" }
        );

        res.status(200).json({ _id: book._id, title: book.title });
      } catch (error) {
        res.send(error);
      }
    })

    .delete(async function (req, res) {
      //if successful response will be 'complete delete successful'

      try {
        const result = await books.deleteMany({});

        res.status(200).send("complete delete successful");
      } catch (error) {
        res.status(500).send(error.message);
      }
    });

  app
    .route("/api/books/:id")
    .get(async function (req, res) {
      let bookid = req.params.id;
      //json res format: {"_id": bookid, "title": book_title, "comments": [comment,comment,...]}
      try {
        const result = await books.findOne(
          { _id: new ObjectId(String(bookid)) },
          {
            projection: { _id: 1, title: 1, comments: 1 },
          }
        );
        if (result === null) {
          throw new Error(
            "input must be a 24 character hex string, 12 byte Uint8Array, or an integer"
          );
        }
        res.status(200).json(result);
      } catch (error) {
        if (
          error.message ===
          "input must be a 24 character hex string, 12 byte Uint8Array, or an integer"
        ) {
          res.status(200).send("no book exists");
          return;
        }

        res.status(500).send(error.message);
      }
    })

    .post(async function (req, res) {
      let bookid = req.params.id;
      let comment = req.body.comment;
      //json res format same as .get

      try {
        if (comment === undefined) {
          res.status(200).send("missing required field comment");
          return;
        }
        const result = await books.findOneAndUpdate(
          { _id: new ObjectId(String(bookid)) },
          { $push: { comments: comment } },
          { returnDocument: "after" }
        );
        if (result === null) {
          throw new Error("no book exists");
        }
        res.status(200).json(result);
      } catch (error) {
        if (
          error.message ===
          "input must be a 24 character hex string, 12 byte Uint8Array, or an integer"
        ) {
          res.status(200).send("no book exists");
          return;
        }
        if (error.message === "no book exists") {
          res.status(200).send("no book exists");
          return;
        }

        res.status(500).send(error.message);
      }
    })

    .delete(async function (req, res) {
      let bookid = req.params.id;
      //if successful response will be 'delete successful'

      try {
        if (bookid === undefined) {
          res.status(200).send("no book exists");
          return;
        }
        const result = await books.findOneAndDelete(
          { _id: new ObjectId(String(bookid)) },
          { projection: { _id: 1, title: 1, comments: 1 } }
        );
        if (result === null) {
          throw new Error("no book exists");
        }
        res.status(200).send("delete successful");
      } catch (error) {
        if (
          error.message ===
          "input must be a 24 character hex string, 12 byte Uint8Array, or an integer"
        ) {
          res.status(200).send("no book exists");
          return;
        }
        if (error.message === "no book exists") {
          res.status(200).send("no book exists");
          return;
        }
        res.status(500).send(error.message);
      }
    });
};

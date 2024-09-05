require("dotenv").config();
const pg = require("pg");
const express = require("express");
const client = new pg.Client(
  process.env.DATABASE_URL || "postgres://localhost/the_acme_icecreamshop_db"
);
const app = express();

app.use(express.json());
app.use(require("morgan")("dev"));


// GET ROUTE 
 app.get("/api/flavors", async (req, res, next) => {
   try {
     const SQL = `SELECT * from flavors ORDER BY created_at DESC`;
     const response = await client.query(SQL);
     res.send(response.rows);
   } catch (error) {
     next(error);
   }
 });

  app.post("/api/flavors", async (req, res, next) => {
    try {
      const SQL = `
        INSERT INTO flavors(txt)
        VALUES($1)
        RETURNING *
      `;
      const response = await client.query(SQL, [req.body.txt]);
      res.send(response.rows[0]);
    } catch (error) {
      next(error);
    }
  });

app.put("/api/flavors/:id", async (req, res, next) => {
  try {
    const SQL = `
      UPDATE flavors
      SET txt=$1, ranking=$2, updated_at= now()
      WHERE id=$3 RETURNING *
    `;
    const response = await client.query(SQL, [
      req.body.txt,
      req.body.ranking,
      req.params.id,
    ]);
    res.send(response.rows[0]);
  } catch (error) {
    next(error);
  }
});

app.delete("/api/flavors/:id", async (req, res, next) => {
  try {
    const SQL = `
        DELETE from flavors
        WHERE id = $1
      `;
    const response = await client.query(SQL, [req.params.id]);
    res.sendStatus(204);
  } catch (error) {
    next(error);
  }
});

const init = async () => {
  await client.connect();
  console.log("connected to database");


  let SQL = /*SQL*/ `      
    DROP TABLE IF EXISTS flavors;
    CREATE TABLE flavors(
        id SERIAL PRIMARY KEY,
        created_at TIMESTAMP DEFAULT now(),
        updated_at TIMESTAMP DEFAULT now(),
        is_favorite BOOLEAN DEFAULT FALSE,
        name VARCHAR(225) NOT NULL
        );
    INSERT INTO flavors(name, is_favorite ) VALUES ('vanilla' , false);
    INSERT INTO flavors(name, is_favorite ) VALUES ('chocolate' , false);
    INSERT INTO flavors(name, is_favorite ) VALUES ('cookies and cream' , false);
    `;
    await client.query(SQL);
    console.log("data seeded");
    const port = process.env.PORT || 3000;
    app.listen(port, () => console.log(`Listening on port ${port}`));
};


init();

import express, { Response, Request } from "express"
import 'dotenv/config'
import pg from 'pg'
import cors from 'cors';
import { QueryResult } from 'pg';
import jwt from 'jsonwebtoken';
import bcrypt, { hash } from 'bcrypt'
import bodyParser from "body-parser";
const { Pool } = pg
const port: number = 4000
const app = express()

app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: false }))
app.use(cors())


const pool = new Pool({
    host: 'localhost',
    user: 'postgres',
    password: '12345678',
})

async function hello() {
    const query: QueryResult = await pool.query('SELECT *  FROM auth;')
    console.log(query.rows)
}
hello()


// first 
app.get('/', (req: Request, res: Response) => {
    res.send('hello world')
})
// get all the users
app.route('/users')
    .get(async (req: Request, res: Response) => {
        const query: QueryResult = await pool.query('SELECT * FROM auth;')
        return res.json(query.rows)

    })

// route for signup
app.route('/signup')
    .post(async (req: Request, res: Response) => {
        const { name, email, phonenumber, password } = req.body;

        try {
            // Check if user already exists
            const existingUser = await pool.query("SELECT * FROM auth WHERE email = $1", [email]);
            if (existingUser.rows.length > 0) {
                return res.status(400).json({ error: "Email already exists" });
            }

            // Hash the password
            const hashedPassword = await bcrypt.hash(password, 10);

            // Insert new user into database
            const newUser = await pool.query(
                "INSERT INTO auth (name, email, phonenumber, password) VALUES ($1, $2, $3, $4) RETURNING *;",
                [name, email, phonenumber, hashedPassword]
            );

            // Generate and sign a JWT token
            const token = jwt.sign({ userId: newUser.rows[0].id }, process.env.SECRET_KEY!);

            res.status(200).json({ message: "User registered successfully", token });
        } catch (err) {
            console.log(err)
            res.status(500).json({ error: "Internal server error" });
        }

    })

app.route('/login')
    .post(async (req: Request, res: Response) => {
        const { email, password } = req.body;

        try {
            // Check if the user exists
            const user = await pool.query("SELECT * FROM auth WHERE email = $1", [email]);
            if (user.rows.length === 0) {
                return res.status(400).json({ error: "User is not registered" });
            }

            // Compare the password
            const isPasswordValid = await bcrypt.compare(password, user.rows[0].password);
            if (!isPasswordValid) {
                return res.status(400).json({ error: "Invalid credentials" });
            }

            const token = jwt.sign({ userId: user.rows[0].id }, process.env.SECRET_KEY!);

            res.status(200).json({ message: "User signed in successfully", token });
        } catch (err) {
            console.error(err);
            res.status(500).json({ error: "Internal server error" });
        }

    })
app.listen(port, () => {
    console.log(`Example app listening on localhost port  ${port}`)

})
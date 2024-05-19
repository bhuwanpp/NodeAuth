CREATE TABLE auth(
    id PRIMARY KEY SERIAL, 
    name TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    phonenumber INTEGER NOT NULL UNIQUE,
    password TEXT NOT NULL
);

-- postgres=# select * from auth;
--  id |  name  |      email       | phonenumber | password
-- ----+--------+------------------+-------------+-----------
--   1 | bhuwan | bhuwan@gmail.com | 12345       | onetwo
--   2 | pusp   | pusp@gmail.com   | 112233      | oneoneone
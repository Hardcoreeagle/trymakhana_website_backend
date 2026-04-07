// scripts/migrate.js — run once to create tables
require('dotenv').config()
const pool = require('../src/config/mysql')

async function migrate() {
  const conn = await pool.getConnection()
  try {
    console.log('Creating tables...')

    await conn.query(`
      CREATE TABLE IF NOT EXISTS products (
        id          VARCHAR(36)  PRIMARY KEY DEFAULT (UUID()),
        name        VARCHAR(255) NOT NULL,
        flavour     VARCHAR(255),
        tag         VARCHAR(100),
        price       DECIMAL(10,2) NOT NULL,
        weight      VARCHAR(50),
        emoji       VARCHAR(20),
        description TEXT,
        long_description TEXT,
        benefits    JSON,
        highlights  JSON,
        images      JSON,
        gradient    VARCHAR(255),
        stock       INT DEFAULT 0,
        active      TINYINT(1) DEFAULT 1,
        created_at  DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at  DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `)
    console.log('✓ products table')

    await conn.query(`
      CREATE TABLE IF NOT EXISTS orders (
        id           VARCHAR(36)   PRIMARY KEY DEFAULT (UUID()),
        customer_name VARCHAR(255) NOT NULL,
        email        VARCHAR(255)  NOT NULL,
        phone        VARCHAR(20),
        address      TEXT,
        city         VARCHAR(100),
        state        VARCHAR(100),
        pincode      VARCHAR(20),
        total        DECIMAL(10,2) NOT NULL,
        status       ENUM('pending','confirmed','shipped','delivered','cancelled') DEFAULT 'pending',
        payment_status VARCHAR(50) DEFAULT 'pending',
        courier_name VARCHAR(255),
        tracking_number VARCHAR(255),
        notes        TEXT,
        created_at   DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at   DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `)
    console.log('✓ orders table')

    await conn.query(`
      CREATE TABLE IF NOT EXISTS order_items (
        id         INT AUTO_INCREMENT PRIMARY KEY,
        order_id   VARCHAR(36) NOT NULL,
        product_id VARCHAR(36),
        name       VARCHAR(255) NOT NULL,
        price      DECIMAL(10,2) NOT NULL,
        quantity   INT NOT NULL,
        weight     VARCHAR(50),
        FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE
      )
    `)
    console.log('✓ order_items table')

    console.log('\n✅ Migration complete!')
  } catch(e) {
    console.error('Migration failed:', e.message)
  } finally {
    conn.release()
    process.exit(0)
  }
}

migrate()

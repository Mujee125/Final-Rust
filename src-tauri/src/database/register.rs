// src/database/register.rs
use rusqlite::{params, Connection, Result};
use crate::models::RegisterData;

pub struct RegisterDatabase<'a> {
    pub conn: &'a Connection,
}

impl<'a> RegisterDatabase<'a> {
    pub fn new(conn: &'a Connection) -> Self {
        Self { conn }
    }

    pub fn create_user(&self, data: &RegisterData) -> Result<i64> {
        self.conn.execute(
            "INSERT INTO users (username, email, password, created_at) VALUES (?1, ?2, ?3, datetime('now'))",
            params![data.username, data.email, data.password],
        )?;

        Ok(self.conn.last_insert_rowid())
    }

    pub fn user_exists(&self, username: &str, email: &str) -> Result<bool> {
        let count: i64 = self.conn.query_row(
            "SELECT COUNT(*) FROM users WHERE username = ?1 OR email = ?2",
            params![username, email],
            |row| row.get(0),
        )?;

        Ok(count > 0)
    }
}
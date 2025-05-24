// // src/database/auth.rs
// use rusqlite::{params, Connection, Result};
// use crate::models::{User, Session};
// use rand::distributions::alphanumeric::Alphanumeric;
// use rand::{thread_rng, Rng};

// pub struct AuthDatabase<'a> {
//     pub conn: &'a Connection,
// }

// impl<'a> AuthDatabase<'a> {
//     pub fn new(conn: &'a Connection) -> Self {
//         Self { conn }
//     }

//     pub fn get_user_by_email(&self, email: &str) -> Result<Option<User>> {
//         let mut stmt = self.conn.prepare(
//             "SELECT id, username, email, password, image, first_login FROM users WHERE email = ?1"
//         )?;
        
//         let mut rows = stmt.query_map(params![email], User::from_row)?;
//         Ok(rows.next().transpose()?)
//     }

//     pub fn create_session(&self, user_id: i32) -> Result<String> {
//         let token: String = thread_rng()

//             .sample_iter(&Alphanumeric)
//             .take(32)
//             .map(char::from)
//             .collect();

//         self.conn.execute(
//             "INSERT INTO sessions (user_id, token, is_active) VALUES (?1, ?2, 1)",
//             params![user_id, token],
//         )?;

//         Ok(token)
//     }

//     pub fn deactivate_sessions(&self, user_id: i32) -> Result<usize> {
//         self.conn.execute(
//             "UPDATE sessions SET is_active = 0 WHERE user_id = ?1 AND is_active = 1",
//             params![user_id],
//         )
//     }

//     pub fn get_active_session(&self) -> Result<Option<Session>> {
//         let mut stmt = self.conn.prepare(
//             "SELECT id, user_id, token, is_active, created_at FROM sessions WHERE is_active = 1 LIMIT 1"
//         )?;
        
//         let mut rows = stmt.query_map([], Session::from_row)?;
//         Ok(rows.next().transpose()?)
//     }

//     pub fn update_first_login(&self, user_id: i32) -> Result<usize> {
//         self.conn.execute(
//             "UPDATE users SET first_login = 0 WHERE id = ?1",
//             params![user_id],
//         )
//     }
// }

// src/database/auth.rs

use rusqlite::{params, Connection, Result};
use crate::models::{User, Session};
use rand::{Rng};

pub struct AuthDatabase<'a> {
    pub conn: &'a Connection,
}

impl<'a> AuthDatabase<'a> {
    pub fn new(conn: &'a Connection) -> Self {
        Self { conn }
    }

    pub fn get_user_by_email(&self, email: &str) -> Result<Option<User>> {
        let mut stmt = self.conn.prepare(
            "SELECT id, username, email, password, image, first_login FROM users WHERE email = ?1"
        )?;
        
        let mut rows = stmt.query_map(params![email], User::from_row)?;
        Ok(rows.next().transpose()?)
    }

    pub fn create_session(&self, user_id: i32) -> Result<String> {
        let charset = b"ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
        let mut rng = rand::rng(); // ✅ Updated here
    
        let token: String = (0..32)
            .map(|_| {
                let idx = rng.random_range(0..charset.len());
                charset[idx] as char
            })
            .collect();
    
        self.conn.execute(
            "INSERT INTO sessions (user_id, token, is_active) VALUES (?1, ?2, 1)",
            params![user_id, token],
        )?;
    
        Ok(token)
    }
    
    pub fn deactivate_sessions(&self, user_id: i32) -> Result<usize> {
        self.conn.execute(
            "UPDATE sessions SET is_active = 0 WHERE user_id = ?1 AND is_active = 1",
            params![user_id],
        )
    }

    pub fn get_active_session(&self) -> Result<Option<Session>> {
        let mut stmt = self.conn.prepare(
            "SELECT id, user_id, token, is_active, created_at FROM sessions WHERE is_active = 1 LIMIT 1"
        )?;
        
        let mut rows = stmt.query_map([], Session::from_row)?;
        Ok(rows.next().transpose()?)
    }

    pub fn update_first_login(&self, user_id: i32) -> Result<usize> {
        self.conn.execute(
            "UPDATE users SET first_login = 0 WHERE id = ?1",
            params![user_id],
        )
    }
}

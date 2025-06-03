// src/database/settings.rs
use rusqlite::{params, Connection, Result};
use chrono::{NaiveDateTime};
use crate::models::{ShopSettings, UserSettings};

// Helper function to parse datetime from string
fn parse_datetime(datetime_str: Option<String>) -> Option<NaiveDateTime> {
    datetime_str.and_then(|s| NaiveDateTime::parse_from_str(&s, "%Y-%m-%d %H:%M:%S").ok())
}

pub fn get_shop_settings(conn: &Connection) -> Result<Option<ShopSettings>> {
    let mut stmt = conn.prepare("SELECT * FROM shop LIMIT 1")?;
    let mut rows = stmt.query_map([], |row| {
        Ok(ShopSettings {
            id: row.get(0)?,
            name: row.get(1)?,
            description: row.get(2)?,
            
            contact: row.get(3)?,
            email: row.get(4)?,
            website: row.get(5)?,
            address: row.get(6)?,
            image: row.get(7)?,
        })
    })?;

    Ok(rows.next().transpose()?)
}

pub fn save_shop_settings(conn: &Connection, shop: &ShopSettings) -> Result<usize> {
    if let Some(id) = shop.id {
        conn.execute(
            "UPDATE shop SET 
                name = ?1, 
                description = ?2, 
                address = ?3, 
                contact = ?4, 
                email = ?5, 
                website = ?6, 
                image = ?7 
            WHERE id = ?8",
            params![
                &shop.name,
                &shop.description,
                &shop.address,
                &shop.contact,
                &shop.email,
                &shop.website,
                &shop.image,
                id,
            ],
        )
    } else {
        conn.execute(
            "INSERT INTO shop (
                name, description, address, contact, email, website, image
            ) VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7)",
            params![
                &shop.name,
                &shop.description,
                &shop.address,
                &shop.contact,
                &shop.email,
                &shop.website,
                &shop.image,
            ],
        )
    }
}

pub fn get_user_settings(conn: &Connection) -> Result<Option<UserSettings>> {
    let mut stmt = conn.prepare("SELECT * FROM users LIMIT 1")?;
    let mut rows = stmt.query_map([], |row| {
        let first_login_int: Option<i32> = row.get(7)?; // ✅ first_login
        let created_at: Option<String> = row.get(8)?;   // ✅ created_at
        let updated_at: Option<String> = row.get(9)?;   // ✅ updated_at
    
        let first_login = first_login_int.map(|val| val != 0); // convert to bool
    
        Ok(UserSettings {
            id: row.get(0)?,
            username: row.get(1)?,
            email: row.get(2)?,
            password: row.get(3)?,
            image: row.get(4)?,
            status: row.get(5)?,
            person_id: row.get(6)?,
            first_login,
            created_at: parse_datetime(created_at),
            updated_at: parse_datetime(updated_at),
        })
    })?;
    

    Ok(rows.next().transpose()?)
}


pub fn save_user_settings(conn: &Connection, user: &UserSettings) -> Result<usize> {
    println!("Saving user: {:?}", user); // Debug log
    if let Some(id) = user.id {
        let rows_affected = conn.execute(
            "UPDATE users SET 
                username = ?1, 
                email = ?2, 
                image = ?3 
                
            WHERE id = ?4",
            params![
                &user.username,
                &user.email,
                &user.image,
                id,
            ],
        )?;
        if rows_affected == 0 {
            Err(rusqlite::Error::QueryReturnedNoRows)
        } else {
            Ok(rows_affected)
        }
    } else {
        conn.execute(
            "INSERT INTO users (
                username, email, image
            )  (?1, ?2, ?3)",
            params![
                &user.username,
                &user.email,
                &user.image,
            ],
        )
    }
}


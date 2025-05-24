// use rusqlite::{Connection, Result};
// use crate::schema::CREATE_TABLES;

// pub fn establish_connection() -> Result<Connection> {
//     let conn = Connection::open("zostikposdb.db")?;
//     conn.execute("PRAGMA foreign_keys = ON;", [])?;
//     Ok(conn)
// }

// pub fn initialize_database() -> Result<()> {
//     let conn = establish_connection()?;
//     for table_sql in CREATE_TABLES.iter() {
//         conn.execute(table_sql, [])?;
//     }
//     Ok(())
// }

use rusqlite::{Connection, Result};
use std::fs;
use std::path::PathBuf;

use tauri::AppHandle;
use tauri::Manager;

use crate::schema::CREATE_TABLES;

fn get_database_path(app_handle: &tauri::AppHandle) -> Result<PathBuf> {
    let path = app_handle.path().app_data_dir()
        .map_err(|_| rusqlite::Error::InvalidPath("App data dir not found".into()))?;

    fs::create_dir_all(&path).map_err(|e| rusqlite::Error::InvalidPath(PathBuf::from(e.to_string())))?; // ensure the directory exists

    Ok(path.join("zostikposdb.db"))
}

pub fn establish_connection(app: &AppHandle) -> Result<Connection> {
    let db_path = get_database_path(app)?;
    let conn = Connection::open(db_path)?;
    conn.execute("PRAGMA foreign_keys = ON;", [])?;
    Ok(conn)
}

pub fn initialize_database(app: &AppHandle) -> Result<()> {
    let conn = establish_connection(app)?;
    for table_sql in CREATE_TABLES.iter() {
        conn.execute(table_sql, [])?;
    }
    Ok(())
}

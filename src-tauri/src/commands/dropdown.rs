use crate::models::{ DropdownItem, QueryResult};

use crate::database::connection::establish_connection;
use crate::database::dropdown::{
    get_dropdown_items, add_dropdown_item, 
    update_dropdown_item, delete_dropdown_item,
   
};
use tauri::async_runtime::spawn_blocking;
use rusqlite::Result;

#[tauri::command]
pub async fn fetch_dropdown_items(app: tauri::AppHandle,table_name: String) -> Result<Vec<DropdownItem>, String> {
    spawn_blocking(move || {
        let conn = establish_connection(&app).map_err(|e| e.to_string())?;
        get_dropdown_items(&conn, &table_name).map_err(|e| e.to_string())
    })
    .await
    .map_err(|e| format!("Task join error: {}", e))?
}

#[tauri::command]
pub async fn add_dropdown_item_command(app: tauri::AppHandle,
    table_name: String,
    name: String
) -> Result<QueryResult, String> {
    spawn_blocking(move || {
        let conn = establish_connection(&app).map_err(|e| e.to_string())?;
        add_dropdown_item(&conn, &table_name, &name).map_err(|e| e.to_string())
    })
    .await
    .map_err(|e| format!("Task join error: {}", e))?
}

#[tauri::command]
pub async fn update_dropdown_item_command(app: tauri::AppHandle,
    table_name: String,
    id: i32,
    name: String
) -> Result<QueryResult, String> {
    spawn_blocking(move || {
        let conn = establish_connection(&app).map_err(|e| e.to_string())?;
        update_dropdown_item(&conn, &table_name, id, &name).map_err(|e| e.to_string())
    })
    .await
    .map_err(|e| format!("Task join error: {}", e))?
}

#[tauri::command]
pub async fn delete_dropdown_item_command(app: tauri::AppHandle,
    table_name: String,
    id: i32
) -> Result<QueryResult, String> {
    spawn_blocking(move || {
        let conn = establish_connection(&app).map_err(|e| e.to_string())?;
        delete_dropdown_item(&conn, &table_name, id).map_err(|e| e.to_string())
    })
    .await
    .map_err(|e| format!("Task join error: {}", e))?
}
use crate::models::{Person, NewPerson, PersonInvoice};
use crate::database::person::insert_person; use crate::database::person::get_all_persons;
use crate::database::person::get_invoices_by_person_id;
use crate::database::person::update_person; use crate::database::person::delete_person; use crate::database::person::upsert_person;

use crate::database::connection::establish_connection;
use rusqlite::Result;
use tauri::async_runtime::spawn_blocking;

#[tauri::command]
pub async fn create_person(app: tauri::AppHandle,person: NewPerson) -> Result<usize, String> {
    spawn_blocking(move || {
        let conn = establish_connection(&app).map_err(|e| e.to_string())?;
        insert_person(&conn, &person).map_err(|e| e.to_string())
    })
    .await
    .map_err(|e| format!("Task join error: {}", e))?
}

#[tauri::command]
pub async fn get_all_persons_command(app: tauri::AppHandle) -> Result<Vec<Person>, String> {
    spawn_blocking(move || {
        let conn = establish_connection(&app).map_err(|e| e.to_string())?;
        get_all_persons(&conn).map_err(|e| e.to_string())
    })
    .await
    .map_err(|e| format!("Task join error: {}", e))?
}

#[tauri::command]
pub async fn get_invoices_by_person_id_command(app: tauri::AppHandle,person_id: i32) -> Result<Vec<PersonInvoice>, String> {
    spawn_blocking(move || {
        let conn = establish_connection(&app).map_err(|e| e.to_string())?;
        get_invoices_by_person_id(&conn, person_id).map_err(|e| e.to_string())
    })
    .await
    .map_err(|e| format!("Task join error: {}", e))?
}

#[tauri::command]
pub async fn update_person_command(app: tauri::AppHandle,person: Person) -> Result<usize, String> {
    spawn_blocking(move || {
        let conn = establish_connection(&app).map_err(|e| e.to_string())?;
        update_person(&conn, &person).map_err(|e| e.to_string())
    })
    .await
    .map_err(|e| format!("Task join error: {}", e))?
}

#[tauri::command]
pub async fn delete_person_command(app: tauri::AppHandle,id: i32) -> Result<usize, String> {
    spawn_blocking(move || {
        let conn = establish_connection(&app).map_err(|e| e.to_string())?;
        delete_person(&conn, id).map_err(|e| e.to_string())
    })
    .await
    .map_err(|e| format!("Task join error: {}", e))?
}

#[tauri::command]
pub async fn upsert_person_command(app: tauri::AppHandle,person: NewPerson) -> Result<usize, String> {
    spawn_blocking(move || {
        let conn = establish_connection(&app).map_err(|e| e.to_string())?;
        upsert_person(&conn, &person).map_err(|e| e.to_string())
    })
    .await
    .map_err(|e| format!("Task join error: {}", e))?
}
// // src/commands/settings.rs
// use tauri::{AppHandle, async_runtime::spawn_blocking};
// use rusqlite::Result;
// use crate::{
//     database::connection::establish_connection,
//     database::settings::{
//         get_shop_settings as db_get_shop_settings,
//         save_shop_settings as db_save_shop_settings,
//         get_user_settings as db_get_user_settings,
//         save_user_settings as db_save_user_settings,
//     }
// };
// use crate::models::{ShopSettings, UserSettings, ImageUpload};
// use base64::{Engine as _, engine::general_purpose};

// #[tauri::command]
// pub async fn get_shop_settings(app: AppHandle) -> Result<Option<ShopSettings>, String> {
//     spawn_blocking(move || {
//         let conn = establish_connection(&app).map_err(|e| e.to_string())?;
//         db_get_shop_settings(&conn).map_err(|e| e.to_string())
//     })
//     .await
//     .map_err(|e| format!("Task join error: {}", e))?
// }

// #[tauri::command]
// pub async fn save_shop_settings(
//     app: AppHandle,
//     shop: ShopSettings,
// ) -> Result<usize, String> {
//     spawn_blocking(move || {
//         let conn = establish_connection(&app).map_err(|e| e.to_string())?;
//         db_save_shop_settings(&conn, &shop).map_err(|e| e.to_string())
//     })
//     .await
//     .map_err(|e| format!("Task join error: {}", e))?
// }

// #[tauri::command]
// pub async fn get_user_settings(app: AppHandle) -> Result<Option<UserSettings>, String> {
//     spawn_blocking(move || {
//         let conn = establish_connection(&app).map_err(|e| e.to_string())?;
//         db_get_user_settings(&conn).map_err(|e| e.to_string())
//     })
//     .await
//     .map_err(|e| format!("Task join error: {}", e))?
// }

// #[tauri::command]
// pub async fn save_user_settings(
//     app: AppHandle,
//     user: UserSettings,
// ) -> Result<usize, String> {
//     spawn_blocking(move || {
//         let conn = establish_connection(&app).map_err(|e| e.to_string())?;
//         db_save_user_settings(&conn, &user).map_err(|e| e.to_string())
//     })
//     .await
//     .map_err(|e| format!("Task join error: {}", e))?
// }

// #[tauri::command]
// pub async fn upload_image(_app: AppHandle, upload: ImageUpload) -> Result<String, String> {
//     spawn_blocking(move || {
//         // Validate the base64 content
//         general_purpose::STANDARD
//             .decode(&upload.base64_content)
//             .map_err(|e| format!("Invalid base64: {}", e))?;
            
//         Ok(upload.base64_content)
//     })
//     .await
//     .map_err(|e| format!("Task join error: {}", e))?
// }

// src/commands/settings.rs
use tauri::{AppHandle, async_runtime::spawn_blocking};
use rusqlite::Result;
use crate::{
    database::connection::establish_connection,
    database::settings::{
        get_shop_settings as db_get_shop_settings,
        save_shop_settings as db_save_shop_settings,
        get_user_settings as db_get_user_settings,
        save_user_settings as db_save_user_settings,
    }
};
use crate::models::{ShopSettings, UserSettings, ImageUpload};
use base64::{Engine as _, engine::general_purpose};

#[tauri::command]
pub async fn get_shop_settings(app: AppHandle) -> Result<Option<ShopSettings>, String> {
    spawn_blocking(move || {
        let conn = establish_connection(&app).map_err(|e| e.to_string())?;
        db_get_shop_settings(&conn).map_err(|e| e.to_string())
    })
    .await
    .map_err(|e| format!("Task join error: {}", e))?
}

#[tauri::command]
pub async fn save_shop_settings(
    app: AppHandle,
    shop: ShopSettings,
) -> Result<usize, String> {
    spawn_blocking(move || {
        let conn = establish_connection(&app).map_err(|e| e.to_string())?;
        db_save_shop_settings(&conn, &shop).map_err(|e| e.to_string())
    })
    .await
    .map_err(|e| format!("Task join error: {}", e))?
}

#[tauri::command]
pub async fn get_user_settings(app: AppHandle) -> Result<Option<UserSettings>, String> {
    spawn_blocking(move || {
        let conn = establish_connection(&app).map_err(|e| e.to_string())?;
        db_get_user_settings(&conn).map_err(|e| e.to_string())
    })
    .await
    .map_err(|e| format!("Task join error: {}", e))?
}

#[tauri::command]
pub async fn save_user_settings(
    app: AppHandle,
    user: UserSettings,
) -> Result<usize, String> {
    spawn_blocking(move || {
        let conn = establish_connection(&app).map_err(|e| e.to_string())?;
        db_save_user_settings(&conn, &user).map_err(|e| e.to_string())
    })
    .await
    .map_err(|e| format!("Task join error: {}", e))?
}

#[tauri::command]
pub async fn upload_image(_app: AppHandle, upload: ImageUpload) -> Result<String, String> {
    spawn_blocking(move || {
        general_purpose::STANDARD
            .decode(&upload.base64_content)
            .map_err(|e| format!("Invalid base64: {}", e))?;
            
        Ok(upload.base64_content)
    })
    .await
    .map_err(|e| format!("Task join error: {}", e))?
}
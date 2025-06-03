

export async function convertFileToBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        const result = reader.result as string;
        const base64String = result.replace(/^data:.+;base64,/, "");
        resolve(base64String);
      };
      reader.onerror = (error) => reject(error);
    });
  }
  

// image-upload.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({ providedIn: 'root' })
export class ImageUploadService {
  constructor(private http: HttpClient) {}

  uploadImage(file: File, width: number, quality: number, format: string) {
    const formData = new FormData();
    formData.append('image', file);
    formData.append('width', width.toString());
    formData.append('quality', quality.toString());
    formData.append('format', format);

    return this.http.post('/api/upload', formData, { responseType: 'blob' });
  }
}

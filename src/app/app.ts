import { Component } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgIf } from '@angular/common';
import { Form } from './form/form';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [FormsModule, ReactiveFormsModule, NgIf, Form],
  templateUrl: './app.html',
  styleUrls: ['./app.scss'],
})
export class App {
  selectedFile?: File;
  width = 600;
  quality = 80;   // user input 1–100
  format = 'webp';
  comLevel = 6;   // 0–9 (for PNG), 0–6 (for WebP)

  onFileSelected(event: any) {
    this.selectedFile = event.target.files[0];
  }

  async uploadAndCompress() {
    if (!this.selectedFile) {
      alert('Please select an image first');
      return;
    }

    // Convert user quality (1–100) into 0–1
    let q = Math.max(1, Math.min(100, this.quality)) / 100;

    // Adjust quality based on comLevel if PNG/WebP
    if (this.format === 'png') {
      // 0 = fastest, 9 = best → simulate by lowering quality
      q = 1 - this.comLevel / 10; // crude approximation
    }
    if (this.format === 'webp') {
      // WebP levels 0–6 → map to quality
      q = 1 - this.comLevel / 10;
    }

    let mimeType = 'image/' + (this.format === 'jpg' ? 'jpeg' : this.format);

    const blob = await this.resizeAndCompress(
      this.selectedFile,
      this.width,
      q,
      mimeType
    );

    // Download
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `compressed.${this.format}`;
    a.click();
    window.URL.revokeObjectURL(url);
  }

  private resizeAndCompress(file: File, width: number, quality: number, format: string): Promise<Blob> {
    return new Promise((resolve, reject) => {
      if (this.format === 'svg') {
        // SVG → no compression possible, return original file
        resolve(file);
        return;
      }

      const img = new Image();
      const reader = new FileReader();

      reader.onload = (e: any) => (img.src = e.target.result);

      img.onload = () => {
        const canvas = document.createElement('canvas');
        const scale = width / img.width;
        const height = img.height * scale;

        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject('Canvas not supported');
          return;
        }

        ctx.drawImage(img, 0, 0, width, height);

        canvas.toBlob(
          (blob) => {
            if (blob) resolve(blob);
            else reject('Compression failed');
          },
          format,
          quality
        );
      };

      reader.readAsDataURL(file);
    });
  }
}
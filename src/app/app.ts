import { Component } from '@angular/core';
import { ImageUploadService } from './services/image-upload-service';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-root',
  imports: [FormsModule,ReactiveFormsModule],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App {
  protected title = 'compressor';

  selectedFile?: File;
  width = 600;
  quality = 70;
  format = 'webp';

  constructor(private imageService: ImageUploadService) { }

  onFileSelected(event: any) {
    this.selectedFile = event.target.files[0];
  }

  uploadAndCompress() {
    if (!this.selectedFile) {
      alert('Please select an image first');
      return;
    }

    this.imageService
      .uploadImage(this.selectedFile, this.width, this.quality, this.format)
      .subscribe((blob: Blob) => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `compressed.${this.format}`;
        a.click();
        window.URL.revokeObjectURL(url);
      });
  }
}

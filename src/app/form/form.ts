import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { InputNumberModule } from 'primeng/inputnumber';
import { SelectModule } from 'primeng/select';
import { ButtonModule } from 'primeng/button';
import { FileUpload } from 'primeng/fileupload';
import { MessageModule } from 'primeng/message';
import { FloatLabelModule } from 'primeng/floatlabel';

@Component({
  selector: 'app-form',
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    InputNumberModule,
    SelectModule,
    ButtonModule,
    FileUpload,
    MessageModule,
    FloatLabelModule,
  ],
  templateUrl: './form.html',
  styleUrl: './form.scss',
})
export class Form implements OnInit {
  imageForm: FormGroup;
  isSubmitting = false;
  uploadedFile: File | null = null;
  formatOptions = [
    { label: 'JPEG', value: 'jpeg' },
    { label: 'PNG', value: 'png' },
    { label: 'WebP', value: 'webp' },
    { label: 'JPG', value: 'jpg' },
    { label: 'GIF', value: 'gif' },
    { label: 'BMP', value: 'bmp' },
    { label: 'TIFF', value: 'tiff' },
  ];

  constructor(private fb: FormBuilder) {
    this.imageForm = this.fb.group({
      image: [null, Validators.required],
      width: [null, [Validators.required, Validators.min(1)]],
      height: [null, [Validators.required, Validators.min(1)]],
      format: [null, Validators.required],
    });
  }

  ngOnInit(): void {}

  onFileChange(event: any) {
    const file = event?.currentFiles[0];
    if (file) {
      this.uploadedFile = file;
      this.imageForm.patchValue({ image: file });
    }
  }

  submitForm() {
    if (this.imageForm.valid) {
      console.log('Form Data:', this.imageForm.value);
      alert('Form submitted successfully!');
    } else {
      this.imageForm.markAllAsTouched();
    }
  }
}

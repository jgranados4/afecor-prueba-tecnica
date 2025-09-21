import { Component, inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { AngularMaterialModule } from 'src/app/angular-material/angular-material-module';

@Component({
  selector: 'app-mensaje',
  imports: [AngularMaterialModule],
  templateUrl: './mensaje.html',
  styleUrl: './mensaje.scss',
})
export class Mensaje {
  public dialogRef = inject(MatDialogRef<Mensaje>);
  readonly data = inject(MAT_DIALOG_DATA);
  onCancelar(): void {
    this.dialogRef.close(false);
  }

  onConfirmar(): void {
    this.dialogRef.close(true);
  }
}

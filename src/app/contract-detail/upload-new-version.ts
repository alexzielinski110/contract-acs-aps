import { NodeChildAssociation, NodesApi } from "@alfresco/js-api";
import { Component } from "@angular/core";
import { MatDialogRef } from "@angular/material/dialog";

@Component({
    selector: 'app-upload-new-version',
    template: `
        <h3 mat-dialog-title>Upload new version</h3>
        <adf-version-upload [node]="node" (success)="onSuccess($event)" (error)="onError($event)" (cancel)="onCancel($event)"></adf-version-upload>
        <adf-file-uploading-dialog></adf-file-uploading-dialog>
    `,
    styles: [`
        h3.mat-dialog-title {
            font-weight: bold
        }
    `]
})
export class UploadNewVersionComponent {
    node: NodeChildAssociation

    constructor(public dialogRef: MatDialogRef<UploadNewVersionComponent>) {}

    onSuccess(event) {
        this.dialogRef.close('success')
    }

    onError(event) {
        console.log(event)
        // this.dialogRef.close('error')
    }

    onCancel(event) {
        this.dialogRef.close('cancel')
    }
}
import { NodeChildAssociation } from "@alfresco/js-api";
import { Component } from "@angular/core";
import { MatDialogRef } from "@angular/material/dialog";

@Component({
    selector: 'app-version-history',
    template: `
        <h3 mat-dialog-title>Version History</h3>
        <adf-version-list [node]="node"></adf-version-list>
    `,
    styles: [`
        h3.mat-dialog-title {
            font-weight: bold
        }
    `]
})
export class VersionHistoryComponent {
    node: NodeChildAssociation

    constructor(public dialogRef: MatDialogRef<VersionHistoryComponent>) {}

    onSuccess(event) {
        this.dialogRef.close('success')
    }

    onError(event) {
        console.log(event)
    }

    onCancel(event) {
        this.dialogRef.close('cancel')
    }
}
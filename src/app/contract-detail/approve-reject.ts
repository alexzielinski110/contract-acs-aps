import { Component, Inject, ViewEncapsulation } from "@angular/core";
import { MatDialogRef, MAT_DIALOG_DATA } from "@angular/material/dialog";

@Component({
    selector: 'app-approve-reject',
    template: `
        <h3 mat-dialog-title>Approve / Reject</h3>
        <adf-task-form
            [taskId]="taskId"
            [showFormSaveButton]="false"
            [showFormCompleteButton]="false"
            [showCancelButton]="false"
            (executeOutcome)="onExecuteOutcome($event)">
        </adf-task-form>
    `,
    styles: [`
        h3.mat-dialog-title {
            font-weight: bold;
        },
        adf-task-form adf-form-custom-outcomes {
            display: none !important;
        },
        #adf-form-approve {
            background: forestgreen;
            color: white;
        },
        #adf-form-approve .mat-button-wrapper {
            opacity: 1 !important;
        }
    `],
    encapsulation: ViewEncapsulation.None
})
export class ApproveRejectComponent {
    taskId: number

    constructor(
        public dialogRef: MatDialogRef<ApproveRejectComponent>,
        @Inject(MAT_DIALOG_DATA) public data: any
    ) {
        this.taskId = data.taskId
    }

    onExecuteOutcome(event) {
        this.dialogRef.close(event)
    }
}
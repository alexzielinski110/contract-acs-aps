import { NodesApiService, NotificationService } from "@alfresco/adf-core";
import { MinimalNode } from "@alfresco/js-api";
import { Component, Inject } from "@angular/core";
import { MatDialogRef, MAT_DIALOG_DATA } from "@angular/material/dialog";
import { environment } from "environments/environment";

@Component({
    selector: 'app-submit-workflow',
    template: `
        <h3 mat-dialog-title>Submit to the workflow</h3>
        <adf-start-process
            [processDefinitionName]="PROCESS_DEFINITION_NAME"
            [name]="PROCESS_NAME"
            [showSelectApplicationDropdown]="true"
            (start)="onStart($event)"
            (cancel)="onCancel()"
            (error)="onError($event)">
        </adf-start-process>
    `,
    styles: [`
        h3.mat-dialog-title {
            font-weight: bold
        }
    `]
})

export class SubmitWorkflowComponent {
    PROCESS_DEFINITION_NAME: string = 'Contract Process Model'
    PROCESS_NAME: string = ''

    constructor(
        private notificationService: NotificationService,
        private nodesApiService: NodesApiService,
        public dialogRef: MatDialogRef<SubmitWorkflowComponent>,
        @Inject(MAT_DIALOG_DATA) public data: any
    ) {
        this.PROCESS_NAME = data.name + ' Process'
    }

    onStart(event) {
        this.nodesApiService.updateNode(this.data.id, {
            'properties': {
                'cw:reviewAt': new Date(),
                'cw:status': environment.STATUS_REVIEW,
                'cw:processId': event.id
            }
        }).subscribe((entry: MinimalNode) => {
            this.notificationService.showInfo('The process started successfully.', 'Notice!')
            this.dialogRef.close(environment.SUCCESS)
        },
        (error) => console.log(error))
    }

    onCancel() {
        this.dialogRef.close(false)
    }

    onError(event) {
        this.notificationService.showError(event.response.body.message)
    }
}
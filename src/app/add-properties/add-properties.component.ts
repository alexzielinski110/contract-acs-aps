import { AlfrescoApiService, FormModel, FormOutcomeEvent, NotificationService } from '@alfresco/adf-core';
import { NodeBodyUpdate, NodesApi } from '@alfresco/js-api';
import { Component, Inject, OnInit, ViewEncapsulation } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { PropertyForm } from './property-form';

@Component({
  selector: 'app-add-properties',
  templateUrl: './add-properties.component.html',
  styleUrls: ['./add-properties.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class AddPropertiesComponent implements OnInit {
  propertyFrom: FormModel

  isDisableSave: boolean = false

  constructor(
    private alfrescoApiService: AlfrescoApiService,
    private notificationService: NotificationService,
    public dialogRef: MatDialogRef<AddPropertiesComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) { }

  ngOnInit(): void {
    let formDefinitionJSON: any = PropertyForm.getDefinition()

    // Initialize the form values into current values
    formDefinitionJSON.fields[0].value = this.data.node.properties['cm:title']
    formDefinitionJSON.fields[1].value = this.data.node.properties['cm:description']
    formDefinitionJSON.fields[2].value = this.data.node.properties['cm:author']
  }

  onPropertySaved(event: FormOutcomeEvent) {
    let outcome = event.outcome

    if (outcome) {
      let form = outcome.form
      if (form) {
        if (form.isValid) {
          const { title, description, author } = form.values

          let nodesApi = new NodesApi(this.alfrescoApiService.getInstance())
          // Create the param variable for the new values
          const nodeBodyUpdate: NodeBodyUpdate = new NodeBodyUpdate({
            properties: {
              'cm:title': title,
              'cm:description': description,
              'cm:author': author ? author : ''
            }
          })

          this.isDisableSave = true
          nodesApi.updateNode(this.data.node.id, nodeBodyUpdate).then(() => {
            // Handler after updating
            this.isDisableSave = false
            this.notificationService.openSnackMessage('Successfully uploaded.')
            this.dialogRef.close('success')
          })
        }

        event.preventDefault()
      }
    }
  }
}

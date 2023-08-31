import { FileUploadingDialogComponent } from '@alfresco/adf-content-services';
import { AlfrescoApiService, FormFieldModel, FormModel, FormOutcomeEvent, FormService, NodesApiService, NodeService, NotificationService } from '@alfresco/adf-core';
import { ContentApi, MinimalNode, NodeBodyUpdate, NodeEntry } from '@alfresco/js-api';
import { Component, Inject, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { GoogleDocAIService } from 'app/services/google-doc-ai.service';
import { environment } from 'environments/environment';
import { ContractForm } from './contract-form';

@Component({
  selector: 'app-add-contract',
  templateUrl: './add-contract.component.html',
  styleUrls: ['./add-contract.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class AddContractComponent implements OnInit {
  @ViewChild('fileUploadingDialog')
  fileUploadingDialog: FileUploadingDialogComponent

  contractFrom: FormModel
  isDisableSave: boolean = false
  isHiddenUpload: boolean = true
  isAnalyzing: boolean = false

  contractNodeId: string
  contractNode: MinimalNode = null

  rootPath: string
  contentApi: ContentApi

  uploadedNodeIds: Array<string> = new Array<string>()

  constructor(
    private alfrescoApiService: AlfrescoApiService,
    private nodeService: NodeService,
    private nodesApiService: NodesApiService,
    private notificationService: NotificationService,
    private formService: FormService,
    private googleDocAIService: GoogleDocAIService,
    public dialogRef: MatDialogRef<AddContractComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    this.rootPath = data.rootPath
    this.contentApi = new ContentApi(this.alfrescoApiService.getInstance())
    this.dialogRef.beforeClosed().subscribe(() => this.dialogRef.close(this.contractNodeId))
  }

  ngOnInit(): void {
    let formDefinitionJSON: any = ContractForm.getDefinition()
    this.contractFrom = this.formService.parseForm(formDefinitionJSON)
  }

  onContractSaved(event: FormOutcomeEvent) {
    let outcome = event.outcome

    if (outcome) {
      let form = outcome.form
      if (form) {
        if (form.isValid) {
          const { title, description } = form.values
          this.nodeService.createNode(title, 'cw:contract', {
            'cm:title': title,
            'cm:description': description,
            'cw:draftAt': new Date(),
            'cw:status': environment.STATUS_NEW
          }, this.rootPath).subscribe((entry: NodeEntry) => {
            this.contractNodeId = entry.entry.id
            this.contractNode = entry.entry
            this.isHiddenUpload = false
            this.isDisableSave = true
            this.contractFrom.getFormFields().forEach((item: FormFieldModel) => {
              item.readOnly = true
              item.updateForm()
            })
          }, (error: any) => { console.log(error) }, () => {
            this.notificationService.showInfo('New contract folder is successfully created.\r\nPlease upload the attachments.', 'Notice!')
          })
        }

        event.preventDefault()
      }
    }
  }

  async onUploadSuccess(event) {
    const progress = this.fileUploadingDialog.hasUploadInProgress()

    this.uploadedNodeIds.push(event.value.entry.id)

    if (!progress) {
      this.fileUploadingDialog.close()

      this.isAnalyzing = true
      for (let i = 0; i < this.uploadedNodeIds.length; i ++) {
        const id = this.uploadedNodeIds[i]
        const contentUrl = this.contentApi.getContentUrl(id)
        const metadata = await this.googleDocAIService.getMetadata(contentUrl)
        const nodeBodyUpdate: NodeBodyUpdate = new NodeBodyUpdate({
          properties: Object.assign({}, metadata)
        })

        await this.nodesApiService.updateNode(id, nodeBodyUpdate).toPromise()
      }
      this.isAnalyzing = false
    }
  }
}

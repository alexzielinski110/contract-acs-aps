import { ConfirmDialogComponent, DocumentListComponent } from '@alfresco/adf-content-services';
import { AlfrescoApiService, BpmUserModel, BpmUserService, CommentContentService, CommentModel, FormService, NodesApiService, NotificationService, UserPreferencesService } from '@alfresco/adf-core';
import { ProcessService, TaskDetailsModel } from '@alfresco/adf-process-services';
import { ContentApi, FormDefinitionRepresentation, FormFieldRepresentation, GroupRepresentation, IdentityLinkRepresentation, MinimalNode, NodeBodyLock, NodeEntry, NodesApi } from '@alfresco/js-api';
import { Component, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute, Router } from '@angular/router';
import { AddCommentComponent } from 'app/add-comment/add-comment.component';
import { AddPropertiesComponent } from 'app/add-properties/add-properties.component';
import { GoogleDocAIService } from 'app/services/google-doc-ai.service';
import { PreviewService } from 'app/services/preview.service';
import { environment } from 'environments/environment';
import { ApproveRejectComponent } from './approve-reject';
import { SubmitWorkflowComponent } from './submit-workflow';
import { UploadNewVersionComponent } from './upload-new-version';
import { VersionHistoryComponent } from './version-history';

@Component({
  selector: 'app-contract-detail',
  templateUrl: './contract-detail.component.html',
  styleUrls: ['./contract-detail.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class ContractDetailComponent implements OnInit {
  @ViewChild('documentList')
  documentList: DocumentListComponent

  isLoading: boolean = true
  contract: MinimalNode

  completedTasks: TaskDetailsModel[] = []
  completedTasksDetails: Array<Object> = new Array
  isLoadingCompletedTasks: boolean = true

  currentTask: TaskDetailsModel
  candidateGroupIds: Array<any> = new Array

  selectedNodeId: NodeEntry

  isLoadingComments: boolean = false
  comments: CommentModel[] = []

  currentUser: string
  currentUserGroups: Array<any> = new Array

  STATUS_NEW: string = environment.STATUS_NEW
  STATUS_REVIEW: string = environment.STATUS_REVIEW
  STATUS_APPROVED: string = environment.STATUS_APPROVED

  constructor(
    private alfrescoApiService: AlfrescoApiService,
    private userPreferences: UserPreferencesService,
    private notificationService: NotificationService,
    private nodesApiService: NodesApiService,
    private commentService: CommentContentService,
    private formService: FormService,
    private processService: ProcessService,
    private bpmUserService: BpmUserService,
    private preview: PreviewService,
    private googleDocAIService: GoogleDocAIService,
    public activatedRouter: ActivatedRoute,
    public router: Router,
    public dialog: MatDialog
  ) {
    const contractId: string = this.activatedRouter.snapshot.paramMap.get('contractId')
    this.currentUser = this.userPreferences.get('username')

    this.loadContract(contractId)
  }

  ngOnInit(): void { }

  async loadContract(contractId: string) {
    this.isLoading = true

    this.nodesApiService.getNode(contractId).subscribe(async (row: MinimalNode) => {
      this.contract = row

      const status: string = this.contract.properties['cw:status']
      if (status == this.STATUS_NEW) {
      } else if (status == this.STATUS_REVIEW) {
        await this.loadProcessTasks(environment.TASK_STATE_ACTIVE)
        await this.loadProcessTasks(environment.TASK_STATE_COMPLETED)
      } else if (status == this.STATUS_APPROVED) {
        await this.loadProcessTasks(environment.TASK_STATE_COMPLETED)
      }

      this.isLoading = false
    })
  }

  async loadProcessTasks(state: string) {
    const processId = this.contract.properties['cw:processId']

    const entry: TaskDetailsModel[] = await this.processService.getProcessTasks(processId, state).toPromise()
    if (state == environment.TASK_STATE_ACTIVE) {
      this.currentTask = entry[0]

      if (this.currentTask && !this.currentTask.assignee) {
        // Get the groups assigned current user
        const resp: BpmUserModel = await this.bpmUserService.getCurrentUserInfo().toPromise()
        this.currentUserGroups = Array.from(resp.groups, (group: GroupRepresentation) => group.id)

        // Get the candidate groups assigned current task
        await this.processService.tasksApi.getIdentityLinks(this.currentTask.id).then((items: any) => {
          this.candidateGroupIds = Array.from(items, (item: IdentityLinkRepresentation) => parseInt(item.group))
        })
      }
    } else if (state == environment.TASK_STATE_COMPLETED) {
      this.isLoadingCompletedTasks = true

      this.completedTasks = entry

      let cnt = 0
      this.completedTasksDetails = new Array<Object>(this.completedTasks.length)
      this.completedTasks.forEach(async (task, index) => {
        const result: FormDefinitionRepresentation = await this.formService.getTaskForm(task.id).toPromise()

        if (result.selectedOutcome == environment.TASK_OUTCOME_APPROVE)
          this.completedTasksDetails[index] = { status: environment.STATUS_APPROVED, comment: result.fields[0]['fields'][1][0].value }
        else if (result.selectedOutcome == environment.TASK_OUTCOME_REJECT)
          this.completedTasksDetails[index] = { status: environment.TASK_OUTCOME_REJECT, comment: result.fields[0]['fields'][1][0].value }

        
        if (this.completedTasks.length == ++ cnt) this.isLoadingCompletedTasks = false
      })
    }
  }

  isEnableForActions() {
    if (this.currentUserGroups.length == 0 || this.candidateGroupIds.length == 0) return false

    return this.currentUserGroups.some(r => this.candidateGroupIds.includes(r))
  }

  onBack() {
    this.router.navigateByUrl('/contract/home')
  }

  onUploadSuccess() {
    this.notificationService.openSnackMessage('Successfully uploaded.')
    this.documentList.reload()
  }

  onDelete() {
    this.dialog.open(ConfirmDialogComponent, {
      data: {
        title: 'Warning',
        message: 'Do you really delete the file?'
      },
      minWidth: '250px'
    }).afterClosed().subscribe((result) => {
      if (result) {
        this.nodesApiService.deleteNode(this.selectedNodeId.entry.id)

        this.documentList.reload()
      }
    })
  }

  onNodeSelected(event: NodeEntry[]) {
    this.selectedNodeId = event[0]

    if (this.selectedNodeId) {
      this.onLoadComments()
    }
  }

  onLoadComments() {
    this.isLoadingComments = true
    this.commentService.getNodeComments(this.selectedNodeId.entry.id).subscribe((comments: CommentModel[]) => {
      document.getElementById('comment').scrollIntoView({
        behavior: 'smooth',
        block: 'start',
        inline: 'nearest'
      })

      this.comments = comments
      this.isLoadingComments = false
    })
  }

  onPreview(event) {
    const { properties } = event.value.entry
    const lockOwner = properties['cm:lockOwner']

    let isLocked = false
    let isLockOwner = true
    let message = 'Do you want to view?'
    if (lockOwner) {
      isLocked = true
      isLockOwner = lockOwner.id == this.currentUser
    }

    const entry = event.value.entry;
    if (entry && entry.isFile) {
      const unlock = 'Unlock', checkOut = 'Check Out'
      let thirdOptionLabel

      if (!isLocked) {
        thirdOptionLabel = checkOut
        message = 'Do you want to view it or check out?'
      } else if (isLockOwner) {
        thirdOptionLabel = unlock
        message = 'Do you want to view it or unlock?'
      }

      const dialogRef = this.dialog.open(ConfirmDialogComponent, {
        data: {
          title: 'Notice',
          message: message,
          yesLabel: 'View',
          thirdOptionLabel: thirdOptionLabel,
          noLabel: 'Close'
        },
        minWidth: '250px'
      })

      dialogRef.afterClosed().subscribe((result) => {
        if (result === thirdOptionLabel) {
          let nodesApi = new NodesApi(this.alfrescoApiService.getInstance())

          if (thirdOptionLabel === checkOut) { // Handler for the checking out
            nodesApi.lockNode(entry.id, new NodeBodyLock).then((node) => {
              this.notificationService.openSnackMessage(`${node.entry.name} is locked.`)
              this.documentList.reload()
            })
          } else if (thirdOptionLabel === unlock) { // Handler for the unlock
            nodesApi.unlockNode(entry.id).then((node) => {
              this.notificationService.openSnackMessage(`${node.entry.name} is unlocked.`)
              this.documentList.reload()
            })
          }
        } else if (result) {
          this.preview.showResource(entry.id);
        }
      })
    }
  }

  // Check that the file is unlocked
  isFileUnlocked(node) {
    const { properties } = node.entry
    const lockOwner = properties['cm:lockOwner']

    return !lockOwner ? true : false
  }

  // Handler for uploading new version
  onUploadNewVersion(event) {
    let dialogRef = this.dialog.open(UploadNewVersionComponent, {
      width: '600px'
    })

    dialogRef.afterClosed().subscribe((resp) => {
      if (resp == 'success') this.documentList.reload()
    })

    let instance = dialogRef.componentInstance;
    instance.node = event.value.entry
  }

  // Handler for showing version history
  onVersionHistory(event) {
    let dialogRef = this.dialog.open(VersionHistoryComponent, {
      width: '600px'
    })

    let instance = dialogRef.componentInstance;
    instance.node = event.value.entry
  }

  // Handler for adding properties
  onAddProperties(event) {
    this.dialog.open(AddPropertiesComponent, {
      width: '600px',
      data: {
        node: event.value.entry
      }
    }).afterClosed().subscribe((resp) => {
      if (resp == 'success') this.notificationService.openSnackMessage('Successfully added.')
    })
  }

  // Handler for adding comment
  onAddComment() {
    this.dialog.open(AddCommentComponent, {
      width: '600px',
      data: {
        nodeId: this.selectedNodeId
      }
    }).afterClosed().subscribe(() => {
      this.onLoadComments()
    })
  }

  // Handler for submitting to workflow
  onSubmit2Workflow() {
    this.dialog.open(ConfirmDialogComponent, {
      data: {
        title: 'Notice',
        htmlContent: `Do you really submit this contract(<b>${this.contract.name}</b>) to the workflow?`
      },
      minWidth: '250px'
    }).afterClosed().subscribe((result) => {
      if (result) {
        this.dialog.open(SubmitWorkflowComponent, {
          width: '600px',
          data: {
            id: this.contract.id,
            name: this.contract.name
          }
        }).afterClosed().subscribe(result1 => {
          result1 == environment.SUCCESS && window.location.reload()
        })
      }
    })
  }

  onClaimedSuccess() {
    this.notificationService.openSnackMessage('Successfully claimed.', 3500).afterDismissed().subscribe(() => {
      window.location.reload()
    })
  }

  onUnclaimedSuccess() {
    this.notificationService.openSnackMessage('Successfully unclaimed.', 3500).afterDismissed().subscribe(() => {
      window.location.reload()
    })
  }

  onActions() {
    this.dialog.open(ApproveRejectComponent, {
      width: '450px',
      data: {
        taskId: this.currentTask.id
      }
    }).afterClosed().subscribe((resp) => {
      if (resp._outcome.form.taskName == 'Step 3' && resp._outcome.name == 'Approve') {
        this.nodesApiService.updateNode(this.contract.id, {
          'properties': {
            'cw:approvalAt': new Date(),
            'cw:status': environment.STATUS_APPROVED,
          }
        }).subscribe((entry: MinimalNode) => {
          this.notificationService.showInfo('The process completed successfully.', 'Notice!')
          window.location.reload()
        },
        (error) => console.log(error))
      } else window.location.reload()
    })
  }
}

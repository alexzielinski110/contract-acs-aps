import { DocumentListComponent } from '@alfresco/adf-content-services';
import { NodesApiService, SearchService, UserPreferencesService } from '@alfresco/adf-core';
import { TaskListModel, TaskListService, TaskQueryRequestRepresentationModel } from '@alfresco/adf-process-services';
import { MinimalNode, QueryBody } from '@alfresco/js-api';
import { Component, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { AddContractComponent } from 'app/add-contract/add-contract.component';

@Component({
  selector: 'app-contract-home',
  templateUrl: './contract-home.component.html',
  styleUrls: ['./contract-home.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class ContractHomeComponent implements OnInit {
  @ViewChild('documentList')
  documentList: DocumentListComponent

  rootPath: string = `-root-`
  contractsPath: string = `Sites/cloudwave-inc/documentLibrary/Contracts`

  contractFolderId: string

  pendingApprovalQuery: TaskQueryRequestRepresentationModel = {
    sort: 'created_asc',
  }

  approvals = []

  recents = [
    { name: 'CA Road Company Contract' },
    { name: 'XYZ LLC Enhancement Contract' },
    { name: 'Kleen Construction Upgrade' }
  ]

  isLoadingApproval: boolean = true

  constructor(
    private nodeApiService: NodesApiService,
    private taskListService: TaskListService,
    private searchService: SearchService,
    private userPreferences: UserPreferencesService,
    public router: Router,
    public dialog: MatDialog
  ) {
  }

  async ngOnInit(): Promise<void> {
    const row: MinimalNode = await this.nodeApiService.getNode(this.rootPath, { relativePath: `/${this.contractsPath}` }).toPromise()
    this.contractFolderId = row.id

    this.onLoadApprovals()
  }

  // Handler for getting approval contract list
  async onLoadApprovals() {
    this.isLoadingApproval = true

    // Get the Process IDs of the tasks which the current user is designated as a candidate
    this.pendingApprovalQuery.assignment = 'candidate'
    let taskListModel: TaskListModel = await this.taskListService.getTasks(this.pendingApprovalQuery).toPromise()
    let candidateProcessIds: Array<string> = Array.from(taskListModel.data, (task) => `cw:processId:${task.processInstanceId}`)

    // Get the Process IDs of the tasks which the current user is assigned
    this.pendingApprovalQuery.assignment = this.userPreferences.get('username')
    taskListModel = await this.taskListService.getTasks(this.pendingApprovalQuery).toPromise()
    let assignedProcessIds: Array<string> = Array.from(taskListModel.data, (task) => `cw:processId:${task.processInstanceId}`)

    let taskIds = Array.prototype.concat(candidateProcessIds, assignedProcessIds)

    if (taskIds.length > 0) {
      let searchTerm = taskIds.join(" OR ")
      
      const defaultQueryBody: QueryBody = {
        query: {
          query: searchTerm
        },
        filterQueries: [
          { query: "TYPE:'cw:contract'" }
        ]
      }

      // Get my pending approval contract list
      let result = await this.searchService.searchByQueryBody(defaultQueryBody).toPromise()
      result.list.entries.forEach(entry => {
        this.approvals.push({ id: entry.entry.id, name: entry.entry.name })
      })
    }

    this.isLoadingApproval = false
  }

  // Handler for adding new contract
  onNewContract() {
    this.dialog.open(AddContractComponent, {
      width: '600px',
      data: {
        rootPath: this.contractsPath
      }
    }).afterClosed().subscribe((result) => {
      if (result) {
        this.documentList.reload()
      }
    })
  }

  onShowDetail(event) {
    this.router.navigate(['contract', event.value.entry.id, 'detail'])
  }
}

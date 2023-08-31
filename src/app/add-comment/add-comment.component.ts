import { CommentContentService, FormModel, FormOutcomeEvent, FormService, NotificationService } from '@alfresco/adf-core';
import { Component, Inject, OnInit, ViewEncapsulation } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { CommentForm } from './comment-form';

@Component({
  selector: 'app-add-comment',
  templateUrl: './add-comment.component.html',
  styleUrls: ['./add-comment.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class AddCommentComponent implements OnInit {
  commentFrom: FormModel

  isDisableSave: boolean = false

  constructor(
    private commentService: CommentContentService,
    private notificationService: NotificationService,
    private formService: FormService,
    public dialogRef: MatDialogRef<AddCommentComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) { }

  ngOnInit(): void {
    let formDefinitionJSON: any = CommentForm.getDefinition()
    this.commentFrom = this.formService.parseForm(formDefinitionJSON)
  }

  onCommentSaved(event: FormOutcomeEvent) {
    let outcome = event.outcome

    if (outcome) {
      let form = outcome.form
      if (form) {
        if (form.isValid) {
          const { comment } = form.values

          this.isDisableSave = true
          this.commentService.addNodeComment(this.data.nodeId.entry.id, comment).subscribe(() => {
            this.isDisableSave = false
            this.dialogRef.close()
          }, (error: any) => { console.log(error) }, () => {
            this.notificationService.showInfo('Comment is successfully added.', 'Notice!')
          })
        }

        event.preventDefault()
      }
    }
  }
}

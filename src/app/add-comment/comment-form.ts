export class CommentForm {
    static getDefinition(): any {
        return {
            taskName: 'Comment Information',
            fields: [{
                fieldType: 'FormFieldRepresentation',
                id: 'comment',
                name: 'Comment',
                type: 'multi-line-text',
                required: true
            }]
        }
    }
}
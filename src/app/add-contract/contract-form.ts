export class ContractForm {
    static getDefinition(): any {
        return {
            taskName: 'Contract Information',
            fields: [{
                fieldType: 'FormFieldRepresentation',
                id: 'title',
                name: 'Title',
                type: 'text',
                required: true
            }, {
                fieldType: 'FormFieldRepresentation',
                id: 'description',
                name: 'Description',
                type: 'multi-line-text'
            }, {
                fieldType: 'FormFieldRepresentation',
                id: 'approval',
                name: 'Approval',
                type: 'boolean',
                required: true
            }]
        }
    }
}
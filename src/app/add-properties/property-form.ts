export class PropertyForm {
    static getDefinition(): any {
        return {
            taskName: 'Property Information',
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
                type: 'multi-line-text',
                required: true
            }, {
                fieldType: 'FormFieldRepresentation',
                id: 'author',
                name: 'Author',
                type: 'text'
            }]
        }
    }
}
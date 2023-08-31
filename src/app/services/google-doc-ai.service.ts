import fetch from 'node-fetch'
import { Injectable } from '@angular/core'
import { HttpClient, HttpHeaders } from '@angular/common/http'

declare const client: any

@Injectable({
    providedIn: 'root'
})
export class GoogleDocAIService {
    access_token: any = ''

    projectId = 'prj-d-contract-doc-ai-1'
    location = 'us'
    processorId = '76201d7043ecc8af'

    // endpoint = `https://us-documentai.googleapis.com/v1/projects/487865308641/locations/us/processors/85eb306786d77bde:process`
    endpoint = `https://us-documentai.googleapis.com/v1/projects/${this.projectId}/locations/${this.location}/processors/${this.processorId}:process`
    name = `projects/${this.projectId}/locations/${this.location}/processors/${this.processorId}`

    filters: string[] = ['supplier_name', 'supplier_address', 'receiver_name', 'receiver_address', 'invoice_date', 'due_date', 'delivery_date', 'total_amount', 'currency']

    constructor(
        private httpClient: HttpClient
    ) {}

    async getMetadata(filePath) {
        // Read the file into memory.
        const imageFile = await fetch(filePath)

        const arrayBuffer = await imageFile.arrayBuffer()

        // Convert the image data to a Buffer and base64 encode it.
        const encodedImage = Buffer.from(arrayBuffer).toString('base64')

        const params = {
            rawDocument: {
                content: encodedImage,
                mimeType: 'application/pdf',
            }
        }

        if (this.access_token == '') {
            this.access_token = await this.getToken()
        }

        const httpOptions = {
            headers: new HttpHeaders({
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${this.access_token}`
            })
        }
        const result: any = await this.httpClient.post(this.endpoint, params, httpOptions).toPromise()

        const metadata = new Array
        // Read the text recognition output from the processor
        result.document.entities.forEach(entity => {
            if (this.filters.includes(entity.type)) {
                const value = entity.normalizedValue && entity.normalizedValue.text && entity.normalizedValue.text.length > 0 ? entity.normalizedValue.text : entity.mentionText

                // if (entity.type == 'total_amount') {
                    // metadata[`cw:${entity.type}`] = parseFloat(value.replace(/\s+/g, ' ').trim()).toFixed(2)
                // } else {
                    metadata[`cw:${entity.type}`] = value.replace(/\s+/g, ' ').trim()
                // }
            }
        })

        return metadata
    }

    getToken() {
        return new Promise((resolve, reject) => {
            // Settle this promise in the response callback for requestAccessToken()
            client.callback = (resp) => {
                if (resp.error !== undefined) resolve('')

                resolve(resp.access_token)
            }

            client.requestAccessToken()
        })
    }
}
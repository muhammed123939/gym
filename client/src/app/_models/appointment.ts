import { Time } from "@angular/common"

export interface Appointment {
    id: number
    trainnerId: number
    adminId: number
    clientId: number
    classId:number
    date: Date
    time: Time
    clientcase : string 
    clientcomment : string 
    hasPhoto?:boolean
    publicId?:string
}

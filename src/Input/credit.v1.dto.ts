import { IsOptional } from "class-validator"

export class CreditV1Dto {
  
    credit: number
    id: string
    name: string
    phone: string
    provider_active: string
    role: string
    status: number
    user: string
  }
  
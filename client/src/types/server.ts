import { User } from '@prisma/client';

import { API_STATUS } from './general';
import { PopulatedDocument, PopulatedUser, ParsingBlock } from './populations';

export type LoginResponse = {
    user: PopulatedUser,
    token: string
}

export type SignupResponse = LoginResponse
export type ChangePasswordResponse = LoginResponse

export type EditUserResponse = {
    users: User[],
    self: boolean
}

export type DeleteUserResponse = EditUserResponse

export type GetUserResponse = {
    user: PopulatedUser
}

export type CreateUserResponse = {
    user: PopulatedUser
}

export type GetAllUsersResponse = {
    users: User[]
}

export type UploadFileResponse = {
    message: string,
    status: API_STATUS,
    result: ParsingBlock[]
}

export type GetDocumentResponse = {
    user: PopulatedUser,
    document: PopulatedDocument
}

export type UploadDocumentResponse = GetDocumentResponse
export type EditDocumentResponse = GetDocumentResponse
export type DeleteDocumentResponse = GetDocumentResponse


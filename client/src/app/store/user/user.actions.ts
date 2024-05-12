import { createAction, props } from "@ngrx/store"
import { user } from "../models/user.model"


export const USER_REGISTRATION='[auth] user registration'
export const userRegistration=createAction(USER_REGISTRATION,props<{userData:user}>())
export const registrationSuccess = createAction('[User] Registration Success', props<{ email: string }>());
export const registrationFailure = createAction('[User] Registration Failure');

export const EMPTY_ACTION  = '[app] empty'
export const emptyAction = createAction(EMPTY_ACTION);
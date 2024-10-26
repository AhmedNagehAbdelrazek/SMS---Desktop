export interface MainState {
  value: number,
  users: [User] | null
}

export interface User {
  Id:number | string,
  name:string
}

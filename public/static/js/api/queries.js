export const USER_PROFILE_QUERY = `query{
  user{
#     profile details
    id
    firstName
    lastName
    login
    email
    campus
#     Audits
    auditRatio
    totalUp
    totalDown
#     Module XP


    totalXp: transactions_aggregate(where: { type: { _eq: "xp" }, eventId: { _eq: 41 } }) {
      aggregate {
        sum {
          amount
        }
      }
    }
#     Current module level
    events(where:{eventId:{_eq:75}}){
      level
    }

#     projects/Questions already done in the module


    xp: transactions(where: { type: { _eq: "xp" }, eventId: { _eq: 41 } }) {
      amount
      type
      createdAt
      progress {
        path
      }
    }

#     finished projects
    completed_projects: groups(order_by:{createdAt:asc}where:{group:{status:{_eq:finished}}}){
      group{
        path
        status
        createdAt
        updatedAt
      }
    }
#     Current Level
    level_amount: transactions(
        where: {
            type: {_eq: "level"},
            _or: [{object: {type: {_eq: "project"}}},
            {object: {type: {_eq: "piscine"}}}
            ]
        }
        order_by: {amount: desc}
        limit : 1
    ){
        amount
    }
#     Current Projects Im working on
    current_projects: groups(where:{group:{status:{_eq:working}}}){
      group{
        path
        status
        members{
          userLogin
        }
      }
    }
#     Skills
    skills: transactions(order_by:{type:asc,amount:desc}distinct_on:[type],where:{type:{_like:"skill_%"}}){
      type
      amount
      __typename
    }
  }
}`;

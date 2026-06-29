export const ADD_PROJECT_LOG = `
mutation AddProjectLog(
  $targetId: Int!,
  $text: String!
) {
  add_logbook_entry(
    logbook_entry: {
      target: project_match
      target_id: $targetId
      custom_text: $text
    }
  ) {
    id
  }
}
`;